/**
 * Texte « propre » d'un diaporama de correction : une page par bloc, pieds de
 * page PAE Formation retirés, pages vides marquées « (figure seule) ».
 *
 * Les conférences de pneumologie mêlent cours et correction sur ~300 pages :
 * lire `texte.txt` brut coûterait trois fois plus, pour rien.
 *
 * Usage : node scripts/annales/net.mjs --dossier <rel à l'atelier>
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ATELIER } from './extraire.mjs';

const arg = (n) => process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : null;
const base = join(ATELIER, arg('--dossier'));
const pages = readFileSync(join(base, 'texte.txt'), 'utf8').split(/=== PAGE (\d+) ===/).slice(1);
const out = [];
for (let i = 0; i < pages.length; i += 2) {
  const c = pages[i + 1]
    .replace(/\r/g, '')
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.trim()
      && !/^\d\d\/\d\d\/20\d\d/.test(l)
      && !/rue Rosa Bonheur/.test(l)
      && !/Toute reproduc/.test(l)
      && !/major-ecn\.fr/.test(l)
      && !/^Tel\s*:/.test(l)
      && !/^\d+$/.test(l.trim())
      && l !== '(page sans texte : figure seule)')
    .join('\n');
  out.push('--- p' + pages[i] + '\n' + (c || '(figure seule)'));
}
writeFileSync(join(base, 'net.txt'), out.join('\n'), 'utf8');
console.log(join(base, 'net.txt'));
