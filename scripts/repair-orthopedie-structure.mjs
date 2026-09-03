/**
 * Réparation non éditoriale des fiches Orthopédie historiques.
 *
 * Le gabarit historique utilisait `eclair-page` sans le marqueur explicite
 * `fiche-eclair-page`. Cette réparation conserve tous les textes, tableaux et
 * images ; elle ajoute seulement la classe qui permet au contrôle de garantir
 * que la fiche éclair est la page finale dédiée.
 *
 * Usage: node scripts/repair-orthopedie-structure.mjs <body.html>
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const path = resolve(process.argv[2] || '');
if (!process.argv[2]) {
  console.error('Usage: node scripts/repair-orthopedie-structure.mjs <body.html>');
  process.exit(1);
}

const source = readFileSync(path, 'utf8');
let repaired = source.replace(
  /class="page eclair-page"/g,
  'class="page eclair-page fiche-eclair-page"',
);
// Défaut d'un ancien export : un placeholder image a été remplacé dans le
// texte d'un <figure>, sans balise <img>. Le data-URI devient alors du texte
// affiché et peut ajouter plusieurs mégaoctets au PDF. On le remet dans une
// image éditable tout en conservant une éventuelle légende.
repaired = repaired.replace(
  /(<figure\b[^>]*>)(data:image\/[a-zA-Z0-9.+-]+;base64,[^<]+)(?=<figcaption\b|<\/figure>)/g,
  '$1<img src="$2" alt="">',
);
repaired = repaired.replace(
  /(<div\b[^>]*\bft-image-block\b[^>]*>)(data:image\/[a-zA-Z0-9.+-]+;base64,[^<]+)(?=<)/g,
  '$1<img src="$2" alt="">',
);
if (!repaired.includes('fiche-eclair-page')) {
  console.log('Aucune page fiche éclair historique : aucune classe finale ajoutée.');
}
writeFileSync(path, repaired, 'utf8');
console.log(`✓ Structure réparée : ${path}`);
