/* Apparence du personnage : palettes de couleurs et valeurs par défaut.
   Ces choix servent à décrire le personnage (encadré « Apparence » de la fiche au format officiel). */
(function(){
'use strict';
const NS=window.DND=window.DND||{};

/* (id, libellé, couleur) */
const HAIR=[['noir','Noir','#1c1917'],['brun','Brun','#4a2f1c'],['chatain','Châtain','#7b5233'],['roux','Roux','#a9461f'],
  ['blond','Blond','#d9b45f'],['platine','Platine','#ece2b8'],['gris','Gris','#9b9ca0'],['blanc','Blanc','#f1f1ee'],
  ['bleu','Bleu','#3d6cb3'],['vert','Vert','#3f8a5a']];
const EYES=[['marron','Marron','#6b4423'],['noisette','Noisette','#8d6a2c'],['vert','Vert','#4a8f4f'],['bleu','Bleu','#3f7fc4'],
  ['gris','Gris','#8a96a3'],['ambre','Ambre','#cc8a14'],['violet','Violet','#8c5bbd'],['rouge','Rouge','#b32626']];
const SKINS=[['porcelaine','Porcelaine','#f5dcc9'],['clair','Clair','#efc8a1'],['hale','Hâlé','#d6a070'],
  ['brun','Brun','#a56e47'],['fonce','Foncé','#7a4a2e'],['ebene','Ébène','#523222']];
const LENS=[['chauve','Chauve'],['court','Courts'],['mi','Mi-longs'],['long','Longs']];
const STYLES=[['soigne','Soignés'],['neglige','Négligés']];

/* Choix par défaut quand rien n'est précisé : cheveux longs pour une femme, courts pour un homme, mi-longs sinon */
function lookDefaults(o){
  const lk=o.look||{};const f=o.gender==='f',m=o.gender==='m';
  return{hair:lk.hair||'brun',len:lk.len||(f?'long':m?'court':'mi'),style:lk.style||'soigne',eyes:lk.eyes||'marron',skin:lk.skin||''};
}

Object.assign(NS,{LOOK:{HAIR,EYES,SKINS,LENS,STYLES},lookDefaults});
})();
