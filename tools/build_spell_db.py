#!/usr/bin/env python3
"""Génère js/data/spells-db.js : les données *structurées* des sorts D&D 2024.

Source : https://www.aidedd.org/spell/fr/ (tableau de tous les sorts) puis, pour chaque sort,
la ligne « École de niveau N (classes) » de sa page.

Ce script ne conserve QUE des données de jeu (nom, niveau, école, temps d'incantation, portée,
durée, composantes V/S/M, concentration, rituel, classes, dégâts). Il ne copie ni les descriptions
ni les résumés des sorts : ce sont des textes protégés, l'application renvoie vers AideDD.
Le texte d'un sort est lu en mémoire pour en déduire s'il inflige des dégâts (voir
tools/spell_damage.py), puis oublié : seul le résultat est mis en cache et écrit.

Politesse : une seule requête pour le tableau, puis une requête par sort, espacées de 0,5 s.
Les réponses sont mises en cache dans tools/.cache/ : relancer le script ne refait pas de requêtes.

Usage : python3 tools/build_spell_db.py
"""
import html
import json
import os
import re
import sys
import time
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import spell_damage  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "tools", ".cache")
OUT = os.path.join(ROOT, "js", "data", "spells-db.js")
BASE = "https://www.aidedd.org/spell/fr/"
UA = "configurateur-dnd/1.0 (usage personnel; github.com/chrisguillet/configurateur-dnd)"
DELAY = 0.5

CLASSES = ["Barde", "Clerc", "Druide", "Ensorceleur", "Magicien", "Occultiste", "Paladin", "Rôdeur"]
SCHOOLS = ["Abjuration", "Divination", "Enchantement", "Évocation",
           "Illusion", "Invocation", "Nécromancie", "Transmutation"]

os.makedirs(CACHE, exist_ok=True)


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    return urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")


def clean(x):
    return html.unescape(re.sub(r"<[^>]+>", "", x)).replace("\xa0", " ").strip()


def load_list():
    path = os.path.join(CACHE, "list.html")
    if not os.path.exists(path):
        open(path, "w", encoding="utf-8").write(get(BASE))
    h = open(path, encoding="utf-8").read()
    table = h[h.index("<table id='liste'"):h.index("</table>")]
    rows = re.findall(r"<tr>(.*?)</tr>", table.split("<tbody>")[1], re.S)
    spells = []
    for r in rows:
        td = [clean(x) for x in re.findall(r"<td[^>]*>(.*?)</td>", r, re.S)]
        slug = re.search(r"href='/spell/fr/([^']+)'", r).group(1)
        spells.append(dict(slug=slug, nom=td[1], vo=td[4], niv=int(td[5]), ecole=td[6],
                           inc=td[7], portee=td[8], duree=td[9], comp=td[10],
                           conc=bool(td[11]), rituel=bool(td[12])))
    return spells


def load_pages(spells):
    """Une requête par sort : ligne des classes + indicateurs de dégâts (le texte n'est pas conservé)."""
    pc, pd = os.path.join(CACHE, "classes.json"), os.path.join(CACHE, "damage.json")
    cls = json.load(open(pc, encoding="utf-8")) if os.path.exists(pc) else {}
    dmg = json.load(open(pd, encoding="utf-8")) if os.path.exists(pd) else {}
    todo = [s["slug"] for s in spells if s["slug"] not in cls or s["slug"] not in dmg]
    for i, slug in enumerate(todo):
        for attempt in range(4):
            try:
                body = get(BASE + slug)
                m = re.search(r"<div class='ecole'>(.*?)</div>", body)
                cls[slug] = clean(m.group(1)) if m else None
                d = re.search(r"<div class='description'>(.*?)</div>", body, re.S)
                text = re.sub(r"\s+", " ", clean(d.group(1))) if d else ""
                r = spell_damage.analyze(text)
                dmg[slug] = dict(dmg=r["dmg"], types=sorted(r["types"]), arme=r["arme"])
                break
            except Exception as ex:  # réseau : on réessaie avec un délai croissant
                time.sleep(2 * (attempt + 1))
                if attempt == 3:
                    sys.exit(f"Échec sur {slug} : {ex}")
        if i % 25 == 0:
            json.dump(cls, open(pc, "w", encoding="utf-8"), ensure_ascii=False)
            json.dump(dmg, open(pd, "w", encoding="utf-8"), ensure_ascii=False)
            print(f"  {i}/{len(todo)}", flush=True)
        time.sleep(DELAY)
    json.dump(cls, open(pc, "w", encoding="utf-8"), ensure_ascii=False)
    json.dump(dmg, open(pd, "w", encoding="utf-8"), ensure_ascii=False)
    return cls, dmg


def parse_classes(line, nom):
    m = re.match(r"^(.*?) de niveau (\d)\s*\((.*)\)\s*$", line or "")
    if not m:
        sys.exit(f"Ligne de classes illisible pour {nom} : {line!r}")
    names = [c.strip() for c in m.group(3).split(",")]
    for c in names:
        if c not in CLASSES:
            sys.exit(f"Classe inconnue « {c} » pour {nom}")
    return m.group(1).strip(), int(m.group(2)), names


def js(v):
    return json.dumps(v, ensure_ascii=False)


def main():
    spells = load_list()
    print(len(spells), "sorts dans le tableau")
    cls, dmg = load_pages(spells)
    rows = []
    for s in spells:
        ecole, niv, names = parse_classes(cls[s["slug"]], s["nom"])
        if ecole != s["ecole"] or niv != s["niv"]:
            sys.exit(f"Incohérence tableau/page pour {s['nom']}")
        mask = sum(1 << CLASSES.index(c) for c in names)
        rows.append([s["slug"], s["nom"], s["vo"], s["niv"], SCHOOLS.index(s["ecole"]), s["inc"],
                     s["portee"], s["duree"], s["comp"].replace(",", ""),
                     int(s["conc"]), int(s["rituel"]), mask, spell_damage.to_mask(s["slug"], dmg[s["slug"]])])
    rows.sort(key=lambda r: (r[3], r[1].lower()))
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("/* GÉNÉRÉ par tools/build_spell_db.py : ne pas modifier à la main.\n"
                "   Données de jeu des sorts D&D 2024 (sans les textes de description).\n"
                "   Champs : id, nom, nom VO, niveau, école, incantation, portée, durée,\n"
                "   composantes, concentration, rituel, classes (masque de bits), dégâts (masque de bits :\n"
                "   13 types, bit 13 = selon l'arme, bit 14 = via une créature ; 0 = aucun). */\n")
        f.write("(function(){\n'use strict';\nconst NS=window.DND=window.DND||{};\n")
        f.write(f"const CLASSES={js(CLASSES)};\nconst SCHOOLS={js(SCHOOLS)};\nconst ROWS=[\n")
        f.write(",\n".join(js(r) for r in rows))
        f.write("\n];\nObject.assign(NS,{SPELL_ROWS:ROWS,SPELL_CLASSES:CLASSES,SPELL_SCHOOLS:SCHOOLS});\n})();\n")
    print("écrit", OUT, os.path.getsize(OUT) // 1024, "Ko")


main()
