import { readFileSync, writeFileSync } from 'node:fs';
const path = process.argv[2];
const html = readFileSync(path, 'utf8');
const next = html.replace(
  /<h1 class="cover-title cover-title--long"(?: style="[^"]*")?>/,
  '<h1 class="cover-title cover-title--long" style="font-size:18pt;line-height:1.03;max-width:82mm;margin-top:19mm">',
);
if (next === html) throw new Error('Titre de couverture long introuvable');
writeFileSync(path, next, 'utf8');
