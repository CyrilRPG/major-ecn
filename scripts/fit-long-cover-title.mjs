/** Réduit localement un titre de couverture trop haut sans modifier la charte. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const path = resolve(process.argv[2] || '');
if (!process.argv[2]) process.exit(1);
const body = readFileSync(path, 'utf8');
const repaired = body.replace('<h1 class="cover-title cover-title--long">', '<h1 class="cover-title cover-title--long" style="font-size:22pt;line-height:1.06;max-width:88mm">');
if (repaired === body) process.exit(2);
writeFileSync(path, repaired, 'utf8');
console.log(`✓ Titre de couverture ajusté : ${path}`);
