#!/usr/bin/env node
/**
 * Ajoute les dimensions en pixels de chaque image extraite du corpus.
 *
 * POURQUOI. La charte des fiches (major-ecn-fiche/assets/templates/fiche.html)
 * choisit entre `ft-figure--small` et `ft-figure--large` sur trois critères,
 * dont un purement dimensionnel : `img.source.width >= 700` bascule l'image en
 * pleine largeur. Sans la largeur réelle, ce critère ne peut pas s'appliquer et
 * toutes les figures partiraient en petit, y compris les tableaux et
 * algorithmes qui deviennent illisibles à 38 % de la colonne.
 *
 * Ce script ENRICHIT `extract.json` sur place plutôt que de relancer une
 * extraction : une réextraction écraserait les réparations et les marqueurs de
 * quarantaine posés par corpus-reparer.mjs.
 *
 * Les dimensions sont lues dans les en-têtes des fichiers, sans dépendance :
 * PNG les expose en clair, JPEG demande de parcourir ses marqueurs.
 *
 *   node scripts/corpus-dimensions.mjs <corpusDir>
 */
import fs from 'node:fs';
import path from 'node:path';

/** PNG : la largeur et la hauteur vivent dans le chunk IHDR, toujours en tête. */
function dimensionsPng(buf) {
  if (buf.length < 24) return null;
  const signature = buf.readUInt32BE(0) === 0x89504e47;
  if (!signature) return null;
  return { largeur: buf.readUInt32BE(16), hauteur: buf.readUInt32BE(20) };
}

/**
 * JPEG : il faut parcourir les segments jusqu'au marqueur SOF (début de trame),
 * seul endroit où les dimensions figurent. On saute les autres segments par
 * leur longueur déclarée.
 */
function dimensionsJpeg(buf) {
  if (buf.length < 4 || buf.readUInt16BE(0) !== 0xffd8) return null;
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) { i += 1; continue; }
    const marqueur = buf[i + 1];
    // SOF0..SOF15 portent les dimensions, sauf DHT (C4), JPG (C8) et DAC (CC).
    const estSof = marqueur >= 0xc0 && marqueur <= 0xcf
      && marqueur !== 0xc4 && marqueur !== 0xc8 && marqueur !== 0xcc;
    if (estSof) return { hauteur: buf.readUInt16BE(i + 5), largeur: buf.readUInt16BE(i + 7) };
    if (marqueur === 0xd8 || (marqueur >= 0xd0 && marqueur <= 0xd9)) { i += 2; continue; }
    const longueur = buf.readUInt16BE(i + 2);
    if (longueur < 2) return null; // segment incohérent : on abandonne proprement
    i += 2 + longueur;
  }
  return null;
}

function dimensions(fichier) {
  try {
    const buf = fs.readFileSync(fichier);
    return dimensionsPng(buf) ?? dimensionsJpeg(buf);
  } catch {
    return null;
  }
}

function main() {
  const dir = process.argv[2];
  if (!dir) {
    console.error('usage: node scripts/corpus-dimensions.mjs <corpusDir>');
    process.exit(1);
  }

  const chapitres = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'))
    .filter((c) => !c.erreur);

  let lues = 0;
  let echecs = 0;
  let grandes = 0;

  for (const c of chapitres) {
    const p = path.join(dir, c.slug, 'extract.json');
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    for (const img of d.images) {
      const dim = dimensions(path.join(dir, c.slug, img.fichier));
      if (!dim) { echecs += 1; continue; }
      img.largeur = dim.largeur;
      img.hauteur = dim.hauteur;
      // Seuil de la charte : au-delà, la figure passe en pleine largeur.
      img.grandeParTaille = dim.largeur >= 700;
      if (img.grandeParTaille) grandes += 1;
      lues += 1;
    }
    d.rapport.imagesDimensionnees = lues;
    fs.writeFileSync(p, JSON.stringify(d, null, 1));
  }

  console.log(`images dimensionnées      : ${lues.toLocaleString('fr-FR')}`);
  console.log(`illisibles (format exotique) : ${echecs}`);
  console.log(`larges (≥ 700 px)         : ${grandes.toLocaleString('fr-FR')} (${(grandes / lues * 100).toFixed(0)} %)`);
}

main();
