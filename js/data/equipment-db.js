/* Catalogue d'équipement D&D 2024 : données de jeu uniquement (nom, prix, caractéristiques), sans descriptions.
   Sources : AideDD, pages Armures, Outils, Matériel d'aventurier et Armes de https://www.aidedd.org/regles-24/equipement/
   Prix en pièces de cuivre (1 pa = 10 pc, 1 po = 100 pc). Les armes viennent de weapons-db.js : seuls leurs prix sont ici. */
(function(){
'use strict';
const NS=window.DND=window.DND||{};

/* id de l'arme -> prix (pc) */
const WEAPON_PRICE={'baton-de-combat':20,'dague':200,'gourdin':10,'hachette':500,'javeline':50,'lance':100,'marteau-leger':200,'masse-d-armes':500,'massue':20,'serpe':100,
 'arbalete-legere':2500,'arc-court':2500,'flechette':5,'fronde':10,'cimeterre':2500,'coutille':2000,'epee-a-deux-mains':5000,'epee-courte':1000,'epee-longue':1500,
 'fleau-d-armes':1000,'fouet':200,'hache-a-deux-mains':3000,'hache-d-armes':1000,'hallebarde':2000,'lance-d-arcon':1000,'maillet-d-armes':1000,'marteau-de-guerre':1500,
 'morgenstern':1500,'pic-de-guerre':500,'pique':500,'rapiere':2500,'trident':500,'arbalete-de-poing':7500,'arbalete-lourde':5000,'arc-long':5000,'mousquet':50000,
 'pistolet':25000,'sarbacane':1000};

/* armures : [nom, type l/i/h/s, prix, CA de base, plafond de Dex (null = aucun, 0 = pas de Dex), Force requise, désavantage en Discrétion] */
const ARMOR_ROWS=[
 ['Armure matelassée','l',500,11,null,0,1],['Armure de cuir','l',1000,11,null,0,0],['Armure de cuir clouté','l',4500,12,null,0,0],
 ['Armure de peaux','i',1000,12,2,0,0],['Chemise de mailles','i',5000,13,2,0,0],["Armure d'écailles",'i',5000,14,2,0,1],['Cuirasse','i',40000,14,2,0,0],['Demi-plate','i',75000,15,2,0,1],
 ['Broigne','h',3000,14,0,0,1],['Cotte de mailles','h',7500,16,0,13,1],['Clibanion','h',20000,17,0,15,1],['Harnois','h',150000,18,0,15,1],
 ['Bouclier','s',1000,2,null,0,0]];

/* outils : [nom, catégorie, prix] */
const TOOL_ROWS=[
 ["Matériel d'alchimiste",'artisan',5000],['Matériel de brasseur','artisan',2000],['Matériel de calligraphe','artisan',1000],['Matériel de peintre','artisan',1000],
 ['Outils de bricoleur','artisan',5000],['Outils de cartographe','artisan',1500],['Outils de charpentier','artisan',800],['Outils de cordonnier','artisan',500],
 ['Outils de forgeron','artisan',2000],['Outils de joaillier','artisan',2500],['Outils de maçon','artisan',1000],['Outils de menuisier','artisan',100],
 ['Outils de potier','artisan',1000],['Outils de souffleur de verre','artisan',3000],['Outils de tanneur','artisan',500],['Outils de tisserand','artisan',100],
 ['Ustensiles de cuisinier','artisan',100],
 ['Accessoires de déguisement','autre',2500],['Instruments de navigateur','autre',2500],["Matériel d'empoisonneur",'autre',5000],["Matériel d'herboriste",'autre',500],
 ['Matériel de contrefaçon','autre',1500],['Outils de voleur','autre',2500],
 ['Cartes à jouer','jeu',50],['Dés','jeu',10],['Échecs draconiques','jeu',100],['Jeu des dragons','jeu',100],
 ['Chalemie','musique',200],['Cor','musique',300],['Cornemuse','musique',3000],['Flûte','musique',200],['Flûte de pan','musique',1200],['Luth','musique',3500],
 ['Lyre','musique',3000],['Tambour','musique',600],['Tympanon','musique',2500],['Viole','musique',3000]];

/* matériel d'aventurier : [nom, prix] */
const GEAR_ROWS=[
 ['Acide',2500],['Antidote',5000],['Beaux habits',1500],['Bélier portable',400],['Billes',100],["Boîte à amadou",50],['Bougie',1],['Bouteille, verre',200],['Cadenas',1000],
 ['Carquois',100],['Carte',100],['Chaîne',500],['Chausse-trappes',100],['Cloche',100],['Coffre',500],['Corde',100],['Costume',500],['Couverture',50],['Cruche',2],
 ['Eau bénite',2500],['Échelle',10],['Encre',1000],['Étui à cartes ou à parchemins',100],['Étui pour carreaux d\'arbalète',100],['Feu grégeois',5000],['Ficelle',10],
 ['Filet',100],['Fiole',100],['Flasque',2],['Grappin',200],['Huile',10],['Lampe',50],['Lanterne à capote',500],['Lanterne sourde',1000],['Livre',2500],
 ['Longue-vue',100000],['Loupe',10000],["Matériel d'escalade",2500],['Menottes',200],['Miroir',500],['Outre',20],['Palan',100],['Panier',40],['Papier',20],
 ['Parchemin',10],['Parchemin de sort (sort mineur)',3000],['Parchemin de sort (1er niveau)',5000],['Parfum',500],['Pelle',200],['Perche',5],['Pied-de-biche',200],
 ['Piège à mâchoires',500],['Pointes en fer',100],['Poison standard',10000],['Porte-plume',2],['Pot en fer',200],['Potion de guérison',5000],['Rations',50],['Robe',100],
 ['Sac',1],['Sac à dos',200],['Sac de couchage',100],['Sacoche',50],['Sacoche à composantes',2500],['Seau',5],['Sifflet',5],['Symbole sacré',500],['Tente',200],
 ['Tenue de voyage',200],['Tonneau',200],['Torche',1],['Trousse de soins',500],
 /* munitions (le lot indiqué fait partie du nom) */
 ["Balles d'arme à feu (10)",300],['Billes de fronde (20)',4],['Carreaux (20)',100],['Dards (50)',100],['Flèches (20)',100],
 /* focaliseurs */
 ['Focaliseur arcanique (baguette)',1000],['Focaliseur arcanique (bâton)',500],['Focaliseur arcanique (cristal)',1000],['Focaliseur arcanique (orbe)',2000],['Focaliseur arcanique (sceptre)',1000],
 ["Focaliseur druidique (baguette d'if)",1000],['Focaliseur druidique (bâton)',500],['Focaliseur druidique (branche de houx)',100]];

/* paquetages : [nom, prix, [[nom d'objet, quantité]…]] */
const PACK_ROWS=[
 ["Paquetage d'artiste",4000,[['Sac à dos',1],['Boîte à amadou',1],['Cloche',1],['Costume',3],['Huile',8],['Rations',9],['Lanterne sourde',1],['Miroir',1],['Outre',1],['Sac de couchage',1]]],
 ["Paquetage d'ecclésiastique",3300,[['Sac à dos',1],['Boîte à amadou',1],['Couverture',1],['Eau bénite',1],['Lampe',1],['Rations',7],['Robe',1]]],
 ["Paquetage d'érudit",4000,[['Sac à dos',1],['Boîte à amadou',1],['Encre',1],['Lampe',1],['Livre',1],['Porte-plume',1],['Huile',10],['Parchemin',10]]],
 ["Paquetage d'explorateur",1000,[['Sac à dos',1],['Sac de couchage',1],['Boîte à amadou',1],['Corde',1],['Huile',2],['Rations',10],['Outre',1],['Torche',10]]],
 ["Paquetage d'exploration souterraine",1200,[['Sac à dos',1],['Boîte à amadou',1],['Chausse-trappes',1],['Corde',1],['Huile',2],['Rations',10],['Outre',1],['Pied-de-biche',1],['Torche',10]]],
 ['Paquetage de cambrioleur',1600,[['Sac à dos',1],['Billes',1],['Boîte à amadou',1],['Bougie',10],['Cloche',1],['Corde',1],['Huile',7],['Lanterne à capote',1],['Outre',1],['Pied-de-biche',1],['Rations',5]]],
 ['Paquetage de diplomate',3900,[['Beaux habits',1],['Boîte à amadou',1],['Coffre',1],['Encre',1],['Étui à cartes ou à parchemins',2],['Papier',5],['Parchemin',5],['Huile',4],['Lampe',1],['Porte-plume',5],['Parfum',1]]]];

Object.assign(NS,{WEAPON_PRICE,ARMOR_ROWS,TOOL_ROWS,GEAR_ROWS,PACK_ROWS});
})();
