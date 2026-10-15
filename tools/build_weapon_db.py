#!/usr/bin/env python3
"""Génère js/data/weapons-db.js : le catalogue des armes D&D 2024 (données de jeu uniquement).

Source : https://www.aidedd.org/regles-24/equipement/armes/ (table des armes). Une seule requête, mise en cache
dans tools/.cache/armes.html : relancer le script ne refait pas de requête.

Ne sont conservés que : nom, catégorie (courante ou de guerre), corps à corps ou distance, dé de dégâts, type de
dégâts, propriétés, portées et nom de la botte d'arme. Ni les descriptions des propriétés ni celles des bottes.

Usage : python3 tools/build_weapon_db.py
"""
import html
import json
import os
import re
import sys
import unicodedata
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "tools", ".cache")
OUT = os.path.join(ROOT, "js", "data", "weapons-db.js")
URL = "https://www.aidedd.org/regles-24/equipement/armes/"
UA = "configurateur-dnd/1.0 (usage personnel; github.com/chrisguillet/configurateur-dnd)"

# titre de section -> (catégorie 0 courante / 1 de guerre, 0 corps à corps / 1 distance)
SECTIONS = {
    "Armes courantes de corps à corps": (0, 0),
    "Armes courantes à distance": (0, 1),
    "Armes de guerre de corps à corps": (1, 0),
    "Armes de guerre à distance": (1, 1),
}
os.makedirs(CACHE, exist_ok=True)


def clean(x):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", x))).replace("\xa0", " ").replace("’", "'").strip()


def slug(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def load():
    path = os.path.join(CACHE, "armes.html")
    if not os.path.exists(path):
        req = urllib.request.Request(URL, headers={"User-Agent": UA})
        open(path, "w", encoding="utf-8").write(urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace"))
    return open(path, encoding="utf-8").read()


def parse_props(txt):
    """'Finesse, Lancer (portée 6/18), Polyvalente (1d8)' -> (liste, lancer, polyvalente, munitions)."""
    props, thrown, vers, ammo = [], "", "", ""
    for tok in re.findall(r"([A-Za-zÀ-ÿ' ]+?)\s*(?:\(([^)]*)\))?\s*(?:,|$)", txt):
        name, arg = tok[0].strip(), tok[1]
        if not name or name == "—":
            continue
        name = re.sub(r"\s*sauf à cheval", "", name)
        props.append(name)
        if name == "Lancer":
            thrown = (re.search(r"(\d+/\d+)", arg) or [None, ""])[1]
        elif name == "Polyvalente":
            vers = (re.search(r"(\d+d\d+)", arg) or [None, ""])[1]
        elif name == "Munitions":
            ammo = (re.search(r"(\d+/\d+)", arg) or [None, ""])[1]
    if "Deux mains (sauf à cheval)" in txt and "Deux mains" not in props:
        props.append("Deux mains")
    return props, thrown, vers, ammo


def main():
    h = load()
    table = h[h.index("<table"):h.index("</table>")]
    rows = re.findall(r"<tr[^>]*>(.*?)</tr>", table, re.S)
    cat, dist, out = None, None, []
    for r in rows:
        cells = [clean(c) for c in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", r, re.S)]
        cells = [c for c in cells]
        if len(cells) == 1 or (cells and all(not c for c in cells[1:])):
            if cells[0] in SECTIONS:
                cat, dist = SECTIONS[cells[0]]
            continue
        if cat is None or len(cells) < 4 or cells[0] in ("Nom", "Arme"):
            continue
        name, dmg, props, mastery = cells[0], cells[1], cells[2], cells[3]
        if dmg in ("—", "-", ""):
            continue  # arme sans dégâts (filet…) : pas d'attaque à lister
        m = re.match(r"^(\d+d\d+|\d+)\s+(\w+?)s?$", dmg)  # un dé (1d8) ou des dégâts fixes (1)
        if not m:
            sys.exit(f"Dégâts illisibles pour {name} : {dmg!r}")
        plist, thrown, vers, ammo = parse_props(props)
        out.append([slug(name), name, cat, dist, m.group(1), m.group(2), plist, thrown, vers, ammo, mastery])
    if len(out) < 30:
        sys.exit(f"Seulement {len(out)} armes lues : la page a-t-elle changé de structure ?")
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("/* GÉNÉRÉ par tools/build_weapon_db.py : ne pas modifier à la main.\n"
                "   Catalogue des armes D&D 2024 (sans les descriptions).\n"
                "   Champs : id, nom, catégorie (0 courante, 1 de guerre), distance (0 corps à corps, 1 distance), dé de dégâts,\n"
                "   type de dégâts, propriétés, portée de lancer, dé à deux mains (polyvalente), portée des munitions, botte d'arme. */\n")
        f.write("(function(){\n'use strict';\nconst NS=window.DND=window.DND||{};\nconst ROWS=[\n")
        f.write(",\n".join(json.dumps(r, ensure_ascii=False) for r in out))
        f.write("\n];\nObject.assign(NS,{WEAPON_ROWS:ROWS});\n})();\n")
    print(len(out), "armes ; écrit", OUT, os.path.getsize(OUT) // 1024, "Ko")


main()
