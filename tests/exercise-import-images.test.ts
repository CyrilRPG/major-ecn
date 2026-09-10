/**
 * Images d'un PDF d'exercices — règles pures (10/09/2026).
 *
 * L'import d'exercices n'extrayait aucune image : ces tests fixent la
 * géométrie (boîte d'une image depuis la liste d'opérateurs pdf.js), les
 * filtres de décor (taille, rapport, répétition de page en page), le
 * dédoublonnage et le rattachement d'une image à sa question.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  boitesImagesDepuisOperateurs, composer, appliquer, dedoublonner, filtrerBoites, rattacherImages,
  seuilRepetition, signatureBoite,
  type BlocQuestion, type BoiteImage, type Matrice, type OperateursImages,
} from '../src/lib/ai/exercise-import-images-regles';

/* Identifiants d'opérateurs arbitraires : le module ne dépend pas des valeurs de pdf.js. */
const OPS: Required<OperateursImages> = {
  save: 10, restore: 11, transform: 12,
  paintFormXObjectBegin: 74, paintFormXObjectEnd: 75, beginAnnotation: 80, endAnnotation: 81,
  paintImageXObject: 85, paintInlineImageXObject: 87, paintImageXObjectRepeat: 88,
  paintInlineImageXObjectGroup: 89, paintImageMaskXObject: 83, paintImageMaskXObjectRepeat: 84,
  paintImageMaskXObjectGroup: 86,
};

/** Page A4 : `viewport.transform` à l'échelle 1 (origine en haut, y vers le bas). */
const HAUTEUR = 841.89;
const BASE: Matrice = [1, 0, 0, -1, 0, HAUTEUR];

const liste = (ops: Array<[number, unknown[]]>) => ({ fnArray: ops.map((o) => o[0]), argsArray: ops.map((o) => o[1]) });

const boite = (page: number, x: number, y: number, largeur: number, hauteur: number, extra: Partial<BoiteImage> = {}): BoiteImage => ({
  page, x, y, largeur, hauteur, rotation: 0, largeurImage: largeur, hauteurImage: hauteur, nature: 'xobject', opIndex: 0, ...extra,
});

/* ───────────── Géométrie ───────────── */

test('composer / appliquer suivent la convention canvas (la seconde matrice s’applique d’abord)', () => {
  const m = composer([2, 0, 0, 2, 10, 10], [1, 0, 0, 1, 5, 0]);
  assert.deepEqual(appliquer(m, 0, 0), [20, 10]);
  assert.deepEqual(appliquer(m, 1, 1), [22, 12]);
});

test('une image PDF (cm = [l, 0, 0, h, x, y]) donne une boîte en points, origine en haut', () => {
  // Word pose une image de 106 × 77 pt dont le coin bas-gauche est à (57, 728) depuis le bas.
  const b = boitesImagesDepuisOperateurs(liste([
    [OPS.save, []], [OPS.transform, [106.4, 0, 0, 77.23, 57.32, 728.64]], [OPS.paintImageXObject, ['img_p1_4', 620, 450]], [OPS.restore, []],
  ]), OPS, BASE, 3);
  assert.equal(b.length, 1);
  assert.equal(b[0].page, 3);
  assert.equal(b[0].nature, 'xobject');
  assert.equal(b[0].objId, 'img_p1_4');
  assert.equal(b[0].opIndex, 2);
  assert.equal(b[0].largeurNative, 620);
  assert.ok(Math.abs(b[0].x - 57.32) < 1e-6);
  assert.ok(Math.abs(b[0].y - (HAUTEUR - 728.64 - 77.23)) < 1e-6, `y=${b[0].y}`);
  assert.ok(Math.abs(b[0].largeur - 106.4) < 1e-6);
  assert.ok(Math.abs(b[0].hauteur - 77.23) < 1e-6);
  assert.equal(b[0].rotation, 0);
});

test('save / restore isolent les transformations ; une forme XObject applique sa matrice puis la rend', () => {
  const b = boitesImagesDepuisOperateurs(liste([
    [OPS.save, []], [OPS.transform, [1, 0, 0, 1, 100, 0]],
    [OPS.paintFormXObjectBegin, [[0.5, 0, 0, 0.5, 0, 0], null]],
    [OPS.transform, [200, 0, 0, 100, 0, 0]], [OPS.paintImageXObject, ['a', 1, 1]],
    [OPS.paintFormXObjectEnd, []],
    [OPS.restore, []],
    [OPS.transform, [50, 0, 0, 50, 0, 0]], [OPS.paintImageXObject, ['b', 1, 1]],
  ]), OPS, BASE, 1);
  assert.equal(b.length, 2);
  // Dans la forme : translation 100 puis échelle 0,5 → image 100 × 50 à x = 100.
  assert.ok(Math.abs(b[0].x - 100) < 1e-6 && Math.abs(b[0].largeur - 100) < 1e-6 && Math.abs(b[0].hauteur - 50) < 1e-6);
  // Après restore : la translation est oubliée → image 50 × 50 à x = 0.
  assert.ok(Math.abs(b[1].x) < 1e-6 && Math.abs(b[1].largeur - 50) < 1e-6);
});

test('un filigrane tourné de 45° a une boîte englobante large mais des côtés réels fins', () => {
  const b = boitesImagesDepuisOperateurs(liste([
    [OPS.transform, [475.01, 475.01, -191.94, 191.94, 298.04, -80.56]], [OPS.paintImageXObject, ['w', 2799, 1]],
  ]), OPS, BASE, 1);
  assert.equal(b.length, 1);
  // Le repère de page a l'axe y vers le bas : l'angle est signé, seule sa valeur absolue compte ici.
  assert.ok(Math.abs(Math.abs(b[0].rotation) - 45) < 0.01, `rotation=${b[0].rotation}`);
  assert.ok(Math.abs(b[0].largeurImage - Math.hypot(475.01, 475.01)) < 1e-6);
  assert.ok(Math.abs(b[0].hauteurImage - Math.hypot(191.94, 191.94)) < 1e-6);
  assert.ok(b[0].largeur > 600 && b[0].hauteur > 600);
});

test('les variantes repeat / group / masque / inline sont toutes relevées', () => {
  const b = boitesImagesDepuisOperateurs(liste([
    [OPS.paintImageXObjectRepeat, ['r', 10, 10, [0, 0, 100, 0, 200, 0]]],
    [OPS.paintInlineImageXObjectGroup, [{ width: 4, height: 4 }, [{ transform: [20, 0, 0, 20, 0, 0] }]]],
    [OPS.paintImageMaskXObject, [{ width: 8, height: 8 }]],
    [OPS.transform, [30, 0, 0, 30, 0, 0]], [OPS.paintInlineImageXObject, [{ width: 3, height: 3 }]],
  ]), OPS, BASE, 1);
  assert.deepEqual(b.map((x) => x.nature), ['repetee', 'repetee', 'repetee', 'groupe', 'masque', 'inline']);
  assert.deepEqual(b.slice(0, 3).map((x) => Math.round(x.x)), [0, 100, 200]);
  assert.equal(b[5].largeurNative, 3);
  assert.ok(Math.abs(b[5].largeur - 30) < 1e-6);
});

test('un identifiant d’opérateur absent désactive simplement l’opérateur', () => {
  const b = boitesImagesDepuisOperateurs(liste([[85, ['x', 1, 1]]]), { transform: 12 }, BASE, 1);
  assert.equal(b.length, 0);
});

/* ───────────── Filtres ───────────── */

test('seuil de répétition : max(3, 40 % des pages)', () => {
  assert.equal(seuilRepetition(1), 3);
  assert.equal(seuilRepetition(5), 3);
  assert.equal(seuilRepetition(10), 4);
  assert.equal(seuilRepetition(131), 53);
});

test('filtre de taille : moins de 90 px rendus sur un côté (à l’échelle 2, 45 pt)', () => {
  const r = filtrerBoites([boite(1, 0, 0, 44, 200), boite(1, 0, 0, 200, 44), boite(1, 0, 0, 46, 46)], { echelle: 2, nbPages: 1 });
  assert.equal(r.ecartees.petites, 2);
  assert.equal(r.retenues.length, 1);
  assert.equal(r.retenues[0].largeur, 46);
});

test('filtre de rapport : au-delà de 14:1 dans un sens ou dans l’autre, et sur les côtés réels de l’image', () => {
  const filet = boite(1, 0, 0, 700, 48);            // 14,6:1
  const colonne = boite(1, 0, 0, 48, 700);
  const limite = boite(1, 0, 0, 672, 48);           // 14:1 exactement : gardée
  // Filet tourné : boîte englobante carrée, côtés réels 700 × 48.
  const tourne = boite(1, 0, 0, 530, 530, { largeurImage: 700, hauteurImage: 48, rotation: 45 });
  const r = filtrerBoites([filet, colonne, limite, tourne], { echelle: 2, nbPages: 1 });
  assert.equal(r.ecartees.allongees, 3);
  assert.deepEqual(r.retenues, [limite]);
});

test('filtre de répétition : la même boîte sur ≥ max(3, 40 %) des pages est du décor, à 3 pt près', () => {
  const pages = 10; // seuil 4
  const boites: BoiteImage[] = [];
  for (let p = 1; p <= pages; p++) boites.push(boite(p, 57.3 + (p % 2), 36, 106, 77, { opIndex: 5 }));   // logo, à 1 pt près
  for (let p = 1; p <= 3; p++) boites.push(boite(p, 300, 400, 200, 150));                                 // figure vue 3 fois < seuil
  boites.push(boite(4, 57, 500, 300, 250));                                                                // figure unique
  const r = filtrerBoites(boites, { echelle: 2, nbPages: pages });
  assert.equal(r.ecartees.decor, pages);
  assert.equal(r.decor.length, pages);
  assert.ok(r.decor.every((d) => d.opIndex === 5));
  assert.equal(r.retenues.length, 4);
});

test('filtre de répétition : sur 2 pages, rien n’est du décor (le seuil vaut 3)', () => {
  const r = filtrerBoites([boite(1, 57, 36, 106, 77), boite(2, 57, 36, 106, 77)], { echelle: 2, nbPages: 2 });
  assert.equal(r.ecartees.decor, 0);
  assert.equal(r.retenues.length, 2);
});

test('décor appris : les signatures d’un appel précédent écartent le logo même sur une tranche de 2 pages', () => {
  const longue = filtrerBoites(Array.from({ length: 10 }, (_, i) => boite(i + 1, 57, 36, 106, 77)), { echelle: 2, nbPages: 10 });
  assert.equal(longue.signaturesDecor.length, 1);
  const courte = filtrerBoites([boite(11, 57.5, 36, 106, 77), boite(12, 57, 36, 106, 77), boite(12, 57, 400, 300, 200)], {
    echelle: 2, nbPages: 2, decorConnu: longue.signaturesDecor,
  });
  assert.equal(courte.ecartees.decor, 2);
  assert.equal(courte.retenues.length, 1);
  assert.equal(courte.retenues[0].y, 400);
  assert.deepEqual(courte.signaturesDecor, longue.signaturesDecor);
});

test('signature de boîte : deux positions à moins d’une tolérance partagent la signature', () => {
  assert.equal(signatureBoite({ x: 57.3, y: 36, largeur: 106, hauteur: 77 }), signatureBoite({ x: 58, y: 36.9, largeur: 106.4, hauteur: 77.23 }));
  assert.notEqual(signatureBoite({ x: 57, y: 36, largeur: 106, hauteur: 77 }), signatureBoite({ x: 57, y: 300, largeur: 106, hauteur: 77 }));
});

test('dédoublonnage : première occurrence gardée, empreintes déjà connues écartées', () => {
  const r = dedoublonner([{ sha1: 'a', n: 1 }, { sha1: 'b', n: 2 }, { sha1: 'a', n: 3 }, { sha1: 'c', n: 4 }], ['c']);
  assert.deepEqual(r.uniques.map((x) => x.n), [1, 2]);
  assert.equal(r.doublons, 2);
});

/* ───────────── Rattachement ───────────── */

/** Page 2 du support Pédiatrie : la figure est posée entre le libellé de la 4 et ses propositions. */
const BLOCS: BlocQuestion[] = [
  { page: 2, yDebut: 130, yFin: 620, numero: 4, libelle: 'Bilirubine totale à H4…' },
  { page: 2, yDebut: 660, yFin: 780, numero: 5, libelle: 'Quel est votre diagnostic à ce stade ?' },
  { page: 3, yDebut: 120, yFin: 300, numero: 6 },
  { page: 3, yDebut: 340, yFin: 700, numero: 7 },
  { page: 5, yDebut: 120, yFin: 300, numero: 8 },
];

test('une image contenue dans le bloc d’une question lui revient, sûre', () => {
  const [r] = rattacherImages([{ page: 2, yDebut: 165, yFin: 530, url: 'https://x/p2-1.png' }], BLOCS);
  assert.equal(r.questionIndex, 0);
  assert.equal(r.numero, 4);
  assert.equal(r.confiance, 'sure');
  assert.equal(r.placement, 'question');
  assert.equal(r.url, 'https://x/p2-1.png');
  assert.equal(r.page, 2);
});

test('une image sous une question, loin de la suivante, lui revient (sûre) ; à mi-chemin elle est douteuse', () => {
  // Sous la 6 (fin 300), la 7 commence à 340 : image 306-330 → 6 pt sous la 6, 10 pt avant la 7 → la 6, mais douteuse (pas 2× plus proche).
  const [douteuse] = rattacherImages([{ page: 3, yDebut: 306, yFin: 330 }], BLOCS);
  assert.equal(douteuse.numero, 6);
  assert.equal(douteuse.confiance, 'douteuse');
  // Image 302-320 → 2 pt sous la 6, 20 pt avant la 7 → la 6, sûre.
  const [nette] = rattacherImages([{ page: 3, yDebut: 302, yFin: 320 }], BLOCS);
  assert.equal(nette.numero, 6);
  assert.equal(nette.confiance, 'sure');
  // Sous la 7 (fin 700), rien en dessous : image 710-800 → sûre.
  const [sure] = rattacherImages([{ page: 3, yDebut: 710, yFin: 800 }], BLOCS);
  assert.equal(sure.numero, 7);
  assert.equal(sure.confiance, 'sure');
});

test('une image collée à la question du dessous et loin de celle du dessus va à celle du dessous', () => {
  // Fin de la 4 à 620, début de la 5 à 660 : image 640-655 → 20 pt sous la 4, 5 pt avant la 5.
  const [r] = rattacherImages([{ page: 2, yDebut: 640, yFin: 655 }], BLOCS);
  assert.equal(r.numero, 5);
  assert.equal(r.confiance, 'sure');
});

test('une image qui précède la première question de la page va à celle-ci', () => {
  const [proche, lointaine] = rattacherImages([{ page: 3, yDebut: 40, yFin: 110 }, { page: 5, yDebut: -300, yFin: -200 }], BLOCS);
  assert.equal(proche.numero, 6);
  assert.equal(proche.confiance, 'sure');
  assert.equal(lointaine.numero, 8);
  assert.equal(lointaine.confiance, 'douteuse');
});

test('entre deux blocs d’une même question (libellé et propositions décrits séparément), l’image est sûre', () => {
  const blocs: BlocQuestion[] = [
    { page: 2, yDebut: 100, yFin: 200, numero: 3 },
    { page: 2, yDebut: 500, yFin: 700, numero: 3 },
    { page: 2, yDebut: 720, yFin: 800, numero: 4 },
  ];
  const [r] = rattacherImages([{ page: 2, yDebut: 250, yFin: 450 }], blocs);
  assert.equal(r.questionIndex, 0);
  assert.equal(r.numero, 3);
  assert.equal(r.confiance, 'sure');
});

test('page sans question : dernière question des pages précédentes, douteuse ; sans page avant, première des suivantes', () => {
  const [apres, avant] = rattacherImages([{ page: 4, yDebut: 100, yFin: 300 }, { page: 1, yDebut: 100, yFin: 300 }], BLOCS);
  assert.equal(apres.numero, 7);
  assert.equal(apres.confiance, 'douteuse');
  assert.equal(avant.numero, 4);
  assert.equal(avant.confiance, 'douteuse');
});

test('sans aucun bloc, questionIndex vaut null', () => {
  const [r] = rattacherImages([{ page: 1, yDebut: 0, yFin: 10 }], []);
  assert.equal(r.questionIndex, null);
  assert.equal(r.numero, null);
  assert.equal(r.confiance, 'douteuse');
});

test('la sortie garde l’ordre des images reçues et ne porte `url` que si elle est fournie', () => {
  const r = rattacherImages([{ page: 2, yDebut: 700, yFin: 750 }, { page: 2, yDebut: 200, yFin: 300, url: 'u' }], BLOCS);
  assert.deepEqual(r.map((x) => x.numero), [5, 4]);
  assert.equal('url' in r[0], false);
  assert.equal(r[1].url, 'u');
});
