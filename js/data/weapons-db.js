/* GÉNÉRÉ par tools/build_weapon_db.py : ne pas modifier à la main.
   Catalogue des armes D&D 2024 (sans les descriptions).
   Champs : id, nom, catégorie (0 courante, 1 de guerre), distance (0 corps à corps, 1 distance), dé de dégâts,
   type de dégâts, propriétés, portée de lancer, dé à deux mains (polyvalente), portée des munitions, botte d'arme. */
(function(){
'use strict';
const NS=window.DND=window.DND||{};
const ROWS=[
["baton-de-combat", "Bâton de combat", 0, 0, "1d6", "contondant", ["Polyvalente"], "", "1d8", "", "Renversement"],
["dague", "Dague", 0, 0, "1d4", "perforant", ["Finesse", "Lancer", "Légère"], "6/18", "", "", "Coup double"],
["gourdin", "Gourdin", 0, 0, "1d4", "contondant", ["Légère"], "", "", "", "Ralentissement"],
["hachette", "Hachette", 0, 0, "1d6", "tranchant", ["Lancer", "Légère"], "6/18", "", "", "Ouverture"],
["javeline", "Javeline", 0, 0, "1d6", "perforant", ["Lancer"], "9/36", "", "", "Ralentissement"],
["lance", "Lance", 0, 0, "1d6", "perforant", ["Lancer", "Polyvalente"], "6/18", "1d8", "", "Sape"],
["marteau-leger", "Marteau léger", 0, 0, "1d4", "contondant", ["Lancer", "Légère"], "6/18", "", "", "Coup double"],
["masse-d-armes", "Masse d'armes", 0, 0, "1d6", "contondant", [], "", "", "", "Sape"],
["massue", "Massue", 0, 0, "1d8", "contondant", ["Deux mains"], "", "", "", "Poussée"],
["serpe", "Serpe", 0, 0, "1d4", "tranchant", ["Légère"], "", "", "", "Coup double"],
["arbalete-legere", "Arbalète légère", 0, 1, "1d8", "perforant", ["Chargement", "Deux mains", "Munitions"], "", "", "24/96", "Ralentissement"],
["arc-court", "Arc court", 0, 1, "1d6", "perforant", ["Deux mains", "Munitions"], "", "", "24/96", "Ouverture"],
["flechette", "Fléchette", 0, 1, "1d4", "perforant", ["Finesse", "Lancer"], "6/18", "", "", "Ouverture"],
["fronde", "Fronde", 0, 1, "1d4", "contondant", ["Munitions"], "", "", "9/36", "Ralentissement"],
["cimeterre", "Cimeterre", 1, 0, "1d6", "tranchant", ["Finesse", "Légère"], "", "", "", "Coup double"],
["coutille", "Coutille", 1, 0, "1d10", "tranchant", ["Allonge", "Deux mains", "Lourde"], "", "", "", "Écorchure"],
["epee-a-deux-mains", "Épée à deux mains", 1, 0, "2d6", "tranchant", ["Deux mains", "Lourde"], "", "", "", "Écorchure"],
["epee-courte", "Épée courte", 1, 0, "1d6", "perforant", ["Finesse", "Légère"], "", "", "", "Ouverture"],
["epee-longue", "Épée longue", 1, 0, "1d8", "tranchant", ["Polyvalente"], "", "1d10", "", "Sape"],
["fleau-d-armes", "Fléau d'armes", 1, 0, "1d8", "contondant", [], "", "", "", "Sape"],
["fouet", "Fouet", 1, 0, "1d4", "tranchant", ["Allonge", "Finesse"], "", "", "", "Ralentissement"],
["hache-a-deux-mains", "Hache à deux mains", 1, 0, "1d12", "tranchant", ["Deux mains", "Lourde"], "", "", "", "Enchaînement"],
["hache-d-armes", "Hache d'armes", 1, 0, "1d8", "tranchant", ["Polyvalente"], "", "1d10", "", "Renversement"],
["hallebarde", "Hallebarde", 1, 0, "1d10", "tranchant", ["Allonge", "Deux mains", "Lourde"], "", "", "", "Enchaînement"],
["lance-d-arcon", "Lance d'arçon", 1, 0, "1d10", "perforant", ["Allonge", "Deux mains", "Lourde"], "", "", "", "Renversement"],
["maillet-d-armes", "Maillet d'armes", 1, 0, "2d6", "contondant", ["Deux mains", "Lourde"], "", "", "", "Renversement"],
["marteau-de-guerre", "Marteau de guerre", 1, 0, "1d8", "contondant", ["Polyvalente"], "", "1d10", "", "Poussée"],
["morgenstern", "Morgenstern", 1, 0, "1d8", "perforant", [], "", "", "", "Sape"],
["pic-de-guerre", "Pic de guerre", 1, 0, "1d8", "perforant", ["Polyvalente"], "", "1d10", "", "Sape"],
["pique", "Pique", 1, 0, "1d10", "perforant", ["Allonge", "Deux mains", "Lourde"], "", "", "", "Poussée"],
["rapiere", "Rapière", 1, 0, "1d8", "perforant", ["Finesse"], "", "", "", "Ouverture"],
["trident", "Trident", 1, 0, "1d8", "perforant", ["Lancer", "Polyvalente"], "6/18", "1d10", "", "Renversement"],
["arbalete-de-poing", "Arbalète de poing", 1, 1, "1d6", "perforant", ["Chargement", "Légère", "Munitions"], "", "", "9/36", "Ouverture"],
["arbalete-lourde", "Arbalète lourde", 1, 1, "1d10", "perforant", ["Chargement", "Deux mains", "Lourde", "Munitions"], "", "", "30/120", "Poussée"],
["arc-long", "Arc long", 1, 1, "1d8", "perforant", ["Deux mains", "Lourde", "Munitions"], "", "", "45/180", "Ralentissement"],
["mousquet", "Mousquet", 1, 1, "1d12", "perforant", ["Chargement", "Deux mains", "Munitions"], "", "", "12/36", "Ralentissement"],
["pistolet", "Pistolet", 1, 1, "1d10", "perforant", ["Chargement", "Munitions"], "", "", "9/27", "Ouverture"],
["sarbacane", "Sarbacane", 1, 1, "1", "perforant", ["Chargement", "Munitions"], "", "", "50/30", "Ouverture"]
];
Object.assign(NS,{WEAPON_ROWS:ROWS});
})();
