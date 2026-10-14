"""Déduit, à partir du texte d'un sort, s'il inflige des dégâts et de quels types.

Le texte lu n'est jamais conservé : on ne garde que le résultat (un entier, voir `to_mask`).

Définition retenue : un sort « fait des dégâts » quand son effet inflige des dégâts à une cible
(jet de sauvegarde, jet d'attaque, zone…) ou en ajoute à vos attaques (Marque du chasseur).
Ne comptent pas : les résistances/immunités, les bonus ou malus aux jets de dégâts, les dégâts
accidentels ou subis par le lanceur (Téléportation en cas d'incident, Souhait…).

Règle automatique : une phrase qui contient le mot « dégâts » ET un dé (« 3d8 ») ou « N point(s) de
dégâts », sans mot de résistance/immunité. Quelques sorts sont corrigés à la main (voir OVERRIDES).
"""
import re

# ordre = numéro de bit dans l'entier produit
TYPES = [('acide', r'acide'), ('contondant', r'contondants?'), ('feu', r'feu'), ('force', r'force'),
         ('foudre', r'foudre'), ('froid', r'froid'), ('nécrotique', r'nécrotiques?'),
         ('perforant', r'perforants?'), ('poison', r'poison'), ('psychique', r'psychiques?'),
         ('radiant', r'radiants?'), ('tonnerre', r'tonnerre'), ('tranchant', r'tranchants?')]
TYPE_NAMES = [t for t, _ in TYPES]
BIT_ARME = 1 << 13       # le type dépend de l'arme utilisée
BIT_CREATURE = 1 << 14   # les dégâts sont infligés par une créature invoquée ou animée

RES = re.compile(r"résistance|immunité|immunis|vulnérabilit|ne (?:subit|subissez|subissent|subis) (?:aucun|pas)"
                 r"|sans subir|annule|réduit le total des dégâts", re.I)
DICE = re.compile(r"\d+d\d+", re.I)
FLAT = re.compile(r"\b\d+ (?:points? de )?dégâts?\b", re.I)
PENAL = re.compile(r"jets? de dégâts|jets? d['’]attaque et de dégâts", re.I)


def _sentences(t):
    return re.split(r'(?<=[.!?])\s+', t)


def _types_in(seg):
    return {n for n, rx in TYPES if re.search(r"\b" + rx + r"\b", seg, re.I)}


def analyze(text):
    """-> dict(dmg=bool, types=set, arme=bool)"""
    types, dmg, choose, arme = set(), False, False, False
    ss = _sentences(text)
    for s in ss:
        if not re.search(r"dégâts?", s, re.I) or RES.search(s):
            continue
        body = re.sub(PENAL, '', s)
        if not re.search(r"dégâts?", body, re.I):
            continue
        if not (DICE.search(body) or FLAT.search(body)):
            continue
        if 'augmentent' in s and not re.search(r"inflig|subi|supplémentaires|égaux|sont de", s):
            continue  # simple montée de niveau : ne prouve pas des dégâts de base
        dmg = True
        seg = s.split(';')[0]
        for m in re.finditer(r"dégâts?", seg, re.I):
            types |= _types_in(seg[m.end():m.end() + 70])
        if re.search(r"du type choisi|de ce type|type de dégâts (?:de votre choix|choisi)|du même type", s, re.I):
            choose = True
        if re.search(r"arme", s, re.I) and not types:
            arme = True
    if dmg and not types and not choose:
        # type écrit dans une autre phrase (« … des dégâts de feu égaux aux dégâts accumulés »)
        for s in ss:
            if RES.search(s):
                continue
            for m in re.finditer(r"dégâts?", s, re.I):
                types |= _types_in(s[m.end():m.end() + 40])
    if dmg and choose and not types:
        for s in ss:
            if re.search(r"types? de dégâts", s, re.I) and not RES.search(s):
                types |= _types_in(s)
    return dict(dmg=dmg, types=types, arme=arme)


# ---------------------------------------------------------------------------------------------
# Corrections manuelles (relues une à une ; chaque ligne dit pourquoi)
# ---------------------------------------------------------------------------------------------
# Dégâts accidentels, conditionnels ou subis par le lanceur : le sort n'est pas « un sort de dégâts ».
NO_DAMAGE = {
    'fusion-dans-la-pierre': "dégâts seulement si la pierre est détruite",
    'porte-dimensionnelle': "dégâts seulement si l'arrivée est occupée",
    'teleportation': "dégâts seulement en cas d'incident de téléportation",
    'forme-etheree': "dégâts seulement si l'on réapparaît dans un espace occupé",
    'souhait': "dégâts subis par le lanceur comme coût de l'incantation",
    'contact-avec-les-plans': "dégâts subis par le lanceur en cas d'échec",
    'toile-d-araignee': "dégâts seulement si la toile est enflammée",
    'modification-d-apparence': "transformation ; les armes naturelles ne sont qu'une option",
    # pages sans description à la source : classés d'après le Manuel des Joueurs
    'telepathie': "page sans texte à la source ; sort sans dégâts",
    'portail-arcanique': "page sans texte à la source ; sort sans dégâts",
    'mot-de-pouvoir-fortifiant': "page sans texte à la source ; donne des PV temporaires",
}
# Dégâts non détectés par la règle automatique.
FORCE_DAMAGE = {
    'crosse-des-druides': (['force'], True, "le dé de dégâts de l'arme augmente (pas de dé dans la phrase)"),
}
# Types de dégâts décrits ailleurs que dans la phrase du montant.
TYPES_FIX = {
    'orbe-chromatique': ['acide', 'froid', 'feu', 'foudre', 'poison', 'tonnerre'],
    'souffle-du-dragon': ['acide', 'froid', 'feu', 'foudre', 'poison'],
    'invocation-d-elementaire': ['foudre', 'tonnerre', 'feu', 'froid'],
    'invocation-d-elementaires-mineurs': ['acide', 'froid', 'feu', 'foudre'],
}
# Sorts qui invoquent ou animent une créature qui attaque : les dégâts viennent de la créature.
CREATURE = {
    'convocation-d-aberration', 'convocation-d-artificiel', 'convocation-d-elementaire', 'convocation-de-bete',
    'convocation-de-celeste', 'convocation-de-dragon', 'convocation-de-fee', 'convocation-de-fielon',
    'convocation-de-mort-vivant', 'animation-des-morts', 'animation-des-objets', 'creation-de-mort-vivant',
    'insecte-geant',
}


def to_mask(slug, result):
    """Entier : bits 0-12 = types de dégâts, bit 13 = selon l'arme, bit 14 = via une créature. 0 = aucun dégât."""
    dmg, types, arme = result['dmg'], set(result['types']), result['arme']
    if slug in NO_DAMAGE:
        return 0
    if slug in FORCE_DAMAGE:
        t, a, _ = FORCE_DAMAGE[slug]
        dmg, types, arme = True, set(t), a
    if slug in TYPES_FIX:
        types = set(TYPES_FIX[slug])
        dmg = True
    mask = 0
    if dmg:
        mask |= sum(1 << TYPE_NAMES.index(t) for t in types)
        if arme:
            mask |= BIT_ARME
    if slug in CREATURE:
        mask |= BIT_CREATURE | (mask & ((1 << 13) - 1))
    if mask == 0 and dmg:
        mask = BIT_ARME  # dégâts sans type identifiable
    return mask
