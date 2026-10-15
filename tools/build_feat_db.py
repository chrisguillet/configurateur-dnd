#!/usr/bin/env python3
"""Génère js/data/feats-db.js : le catalogue des dons D&D 2024 (données de jeu uniquement).

Source : https://www.aidedd.org/feat/fr/ (tableau de tous les dons). Une seule requête, mise en cache dans
tools/.cache/feats.html : relancer le script ne refait pas de requête.

Ne sont conservés que : nom (français et anglais), catégorie, niveau minimum, prérequis, répétabilité et
caractéristiques proposées par le +1 du don. Ni les descriptions ni les résumés (textes protégés) : l'application
renvoie vers la fiche du don sur AideDD.

Usage : python3 tools/build_feat_db.py
"""
import html
import json
import os
import re
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "tools", ".cache")
OUT = os.path.join(ROOT, "js", "data", "feats-db.js")
URL = "https://www.aidedd.org/feat/fr/"
UA = "configurateur-dnd/1.0 (usage personnel; github.com/chrisguillet/configurateur-dnd)"

AB = ["for", "dex", "con", "int", "sag", "cha"]
ABBR = {"For": "for", "Dex": "dex", "Con": "con", "Int": "int", "Sag": "sag", "Cha": "cha"}
CATS = ["origine", "general", "style", "epique"]

# Dons dont le « +1 » n'est pas une liste de caractéristiques, d'après le texte du don :
#   asi    : le don « Amélioration de caractéristique » lui-même (+2 ou +1/+1, géré à part)
#   any    : +1 dans une caractéristique au choix (Expert)
#   nosave : +1 dans une caractéristique dont on ne maîtrise pas le jet de sauvegarde, et maîtrise de ce jet (Résilient)
SPECIAL = {"Amélioration de caractéristique": "asi", "Expert": "any", "Résilient": "nosave"}

os.makedirs(CACHE, exist_ok=True)


def clean(x):
    return html.unescape(re.sub(r"<[^>]+>", "", x)).replace("\xa0", " ").strip()


def load():
    path = os.path.join(CACHE, "feats.html")
    if not os.path.exists(path):
        req = urllib.request.Request(URL, headers={"User-Agent": UA})
        open(path, "w", encoding="utf-8").write(urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace"))
    h = open(path, encoding="utf-8").read()
    table = h[h.index("<table id='liste'"):h.index("</table>")]
    rows = re.findall(r"<tr>(.*?)</tr>", table.split("<tbody>")[1], re.S)
    out = []
    for r in rows:
        td = [clean(x) for x in re.findall(r"<td[^>]*>(.*?)</td>", r, re.S)]
        slug = re.search(r"href='/feat/fr/([^']+)'", r).group(1)
        out.append(dict(slug=slug, nom=td[1], vo=td[4], cat=td[5], pre=td[6], rep=bool(td[7]), res=td[8]))
    return out


def category(txt):
    t = txt.lower()
    if "origine" in t:
        return 0
    if "style" in t:
        return 2
    if "pique" in t:
        return 3
    return 1


def abilities(res):
    """Caractéristiques proposées par un « +1 For, Dex ou Con » en tête de résumé."""
    m = re.match(r"^\+1 ((?:For|Dex|Con|Int|Sag|Cha)(?:, (?:For|Dex|Con|Int|Sag|Cha))*(?: ou (?:For|Dex|Con|Int|Sag|Cha))?)", res)
    if not m:
        return 0
    names = re.findall(r"For|Dex|Con|Int|Sag|Cha", m.group(1))
    return sum(1 << AB.index(ABBR[n]) for n in names)


def main():
    feats = load()
    rows = []
    for f in feats:
        cat = category(f["cat"])
        mn = re.search(r"Niveau (\d+)", f["pre"])
        pre = "" if f["pre"] in ("", "-") else f["pre"]
        special = SPECIAL.get(f["nom"].split("|")[0], "")
        mask = abilities(f["res"])
        rows.append([f["slug"], f["nom"], f["vo"], cat, int(mn.group(1)) if mn else 0, pre, int(f["rep"]), mask, special])
    rows.sort(key=lambda r: (r[3], r[1].lower()))
    n_ab = sum(1 for r in rows if r[7])
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write("/* GÉNÉRÉ par tools/build_feat_db.py : ne pas modifier à la main.\n"
                 "   Catalogue des dons D&D 2024 (sans les textes de description).\n"
                 "   Champs : id, nom, nom VO, catégorie (0 origine, 1 général, 2 style de combat, 3 faveur épique),\n"
                 "   niveau minimum, prérequis, répétable, caractéristiques du +1 (masque de bits for/dex/con/int/sag/cha),\n"
                 "   cas particulier (asi, any, nosave). */\n")
        fh.write("(function(){\n'use strict';\nconst NS=window.DND=window.DND||{};\nconst ROWS=[\n")
        fh.write(",\n".join(json.dumps(r, ensure_ascii=False) for r in rows))
        fh.write("\n];\nObject.assign(NS,{FEAT_ROWS:ROWS});\n})();\n")
    print(len(rows), "dons ;", n_ab, "avec un +1 à une liste de caractéristiques ; écrit", OUT, os.path.getsize(OUT) // 1024, "Ko")


main()
