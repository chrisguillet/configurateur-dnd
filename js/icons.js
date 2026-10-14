/* Icônes SVG dessinées pour l'application : classes et types de dégâts.
   Style : trait de 1,8 px sur une grille de 24, couleur héritée du texte (clair/sombre automatique). */
(function(){
'use strict';
const NS=window.DND=window.DND||{};

const svg=(paths,size,cls)=>`<svg class="ic${cls?' '+cls:''}" width="${size||20}" height="${size||20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths.map(d=>`<path d="${d}"/>`).join('')}</svg>`;

/* ---------- Classes ---------- */
const CLASS_PATHS={
  barbare:['M13.500 11.500L5.500 19.500','M10 8l4-4 6.500 6.500c.5 3.500-3 6.500-6.500 6.500z','M4.500 20.500h.01'],            /* hache */
  barde:['M9 18V5l11-2v13','M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z','M20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z'],      /* note de musique */
  clerc:['M10.500 2.500h3V8h5v3h-5v10.500h-3V11h-5V8h5z'],                                             /* croix sacrée */
  druide:['M5 20C4 10 10 4 20 4c1 10-5 16-15 16z','M5 20L14 11'],                                   /* feuille */
  ensorceleur:['M5 20L14 11','M17 2.5l1.3 3.2 3.2 1.3-3.2 1.3L17 11.5l-1.3-3.2L12.500 7l3.200-1.300z'], /* bâton magique */
  guerrier:['M9 13L19.500 2.500l2 2L11 15z','M7 11l6 6','M8.500 15.500L4.500 19.500','M3.500 20.500h.01'],      /* épée */
  magicien:['M6.500 18C7.500 12 10 7 13.500 3c.5 5 2.500 10 4 15','M3 18.500c3.500 2 14.500 2 18 0','M7.500 14.500c3 1.200 6 1.200 9 0','M18 4.500l.6 1.400 1.400.6-1.400.6-.6 1.400-.6-1.400-1.400-.6 1.400-.6z'], /* chapeau */
  moine:['M7 9.500a2 2 0 0 1 2-2h6a3 3 0 0 1 3 3V15a5.500 5.500 0 0 1-5.500 5.500h-1A5.500 5.500 0 0 1 6 15z','M10.500 7.500v4','M14 7.500v4','M6 13h5.500'], /* poing */
  occultiste:['M2.500 12S6 5.500 12 5.500 21.500 12 21.500 12 18 18.500 12 18.500 2.500 12 2.500 12z','M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6z','M12 2v2','M6 4l1 1.500','M18 4l-1 1.500'], /* œil occulte */
  paladin:['M12 3l7.500 2.800v5.700c0 4.600-3.200 7.600-7.500 9.500-4.300-1.900-7.500-4.900-7.500-9.500V5.800z','M12 8v8','M8.500 11.500h7'], /* bouclier */
  rodeur:['M6 3c9 3 9 15 0 18','M6 3v18','M2.500 12H20','M16.500 8.500L20 12l-3.500 3.500'],              /* arc */
  roublard:['M12 2l3 9H9z','M7 11h10','M12 11v8','M12 21h.01']                                       /* dague */
};

/* ---------- Types de dégâts ---------- */
const DMG_PATHS={
  acide:['M12 3c3.200 4.200 6 7 6 10.200a6 6 0 0 1-12 0C6 10 8.800 7.200 12 3z','M9.500 14a2.500 2.500 0 0 0 2.500 2.500'],
  contondant:['M13 3.500l7.500 7.500-3.500 3.500-7.500-7.500z','M12 12L4 20'],
  feu:['M12 3c.5 3.500 5 5.500 5 10.500a5 5 0 0 1-10 0c0-2.200 1-3.500 2.500-4.800C9.500 11 10.500 12 12 12.500 12.500 9 11.500 6 12 3z'],
  force:['M12 2.500l2.300 6 6.200-1.800-3.400 5.300 4.900 4-6.300.2-1.700 6.100-2-5.800-6.300.2 4.900-4L3.500 6.700l6.200 1.800z'],
  foudre:['M13 2.500L5.500 13.500H11L10 21.500l7.500-11H12.500z'],
  froid:['M12 3v18','M4.200 7.500l15.600 9','M4.200 16.500l15.600-9','M9.500 4.500L12 6.500l2.500-2','M9.500 19.500L12 17.500l2.500 2'],
  'nécrotique':['M12 3a7.500 7.500 0 0 0-4.500 13.500V20h9v-3.500A7.500 7.500 0 0 0 12 3z','M9 11.500h.01','M15 11.500h.01','M10.500 20v-2','M13.500 20v-2'],
  perforant:['M12 2.500l4 6.500h-2.500V21h-3V9H8z'],
  poison:['M9.500 3h5','M10.500 3v6.500L5.500 18a2 2 0 0 0 1.800 3h9.400a2 2 0 0 0 1.800-3l-5-8.500V3','M8 15.500h8'],
  psychique:['M12 12a2 2 0 0 1 4 0a4 4 0 0 1-8 0a6 6 0 0 1 12 0'],
  radiant:['M12 8a4 4 0 1 0 0 8 4 4 0 1 0 0-8z','M12 2v3','M12 19v3','M2 12h3','M19 12h3','M5 5l2 2','M17 17l2 2','M19 5l-2 2','M7 17l-2 2'],
  tonnerre:['M4 9v6','M8 6v12','M12 3v18','M16 6v12','M20 9v6'],
  tranchant:['M7 3l5 18','M12 3l5 18','M17 3l4 12'],
  /* marque générique « dégâts » */
  generic:['M12 3v4','M12 17v4','M3 12h4','M17 12h4','M6 6l2.500 2.500','M15.500 15.500L18 18','M18 6l-2.500 2.500','M8.500 15.500L6 18']
};

const CLASS_LABEL={barbare:'Barbare',barde:'Barde',clerc:'Clerc',druide:'Druide',ensorceleur:'Ensorceleur',guerrier:'Guerrier',magicien:'Magicien',moine:'Moine',occultiste:'Occultiste',paladin:'Paladin',rodeur:'Rôdeur',roublard:'Roublard'};

const classIcon=(cls,size,cname)=>CLASS_PATHS[cls]?svg(CLASS_PATHS[cls],size||22,cname):'';
const dmgIcon=(t,size,cname)=>DMG_PATHS[t]?svg(DMG_PATHS[t],size||16,cname):'';

Object.assign(NS,{classIcon,dmgIcon,CLASS_PATHS,DMG_PATHS,CLASS_LABEL});
})();
