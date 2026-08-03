#!/usr/bin/env node
/**
 * Extraction en lot d'un dossier de .docx via docx-extract.mjs.
 * Produit <outDir>/<slug>/extract.json + img/, et un index récapitulatif.
 *
 *   node scripts/docx-extract-lot.mjs "<dossierSource>" "<outDir>"
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const [src, out] = process.argv.slice(2);
if (!src || !out) { console.error('usage: node scripts/docx-extract-lot.mjs <src> <out>'); process.exit(1); }

const slug = (s) => s
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/\.docx$/i, '').replace(/[^a-zA-Z0-9]+/g, '-')
  .replace(/^-|-$/g, '').toLowerCase().slice(0, 80);

const fichiers = fs.readdirSync(src).filter((f) => f.toLowerCase().endsWith('.docx')).sort();
const index = [];
let echecs = 0;

for (const [i, f] of fichiers.entries()) {
  const s = slug(f);
  try {
    const brut = execFileSync('node', [
      path.join(import.meta.dirname, 'docx-extract.mjs'),
      path.join(src, f),
      path.join(out, s),
    ], { encoding: 'utf8' });
    const r = JSON.parse(brut);
    index.push({ slug: s, ...r });
    process.stdout.write(`\r${i + 1}/${fichiers.length}  ${s.slice(0, 50).padEnd(50)}`);
  } catch (e) {
    echecs += 1;
    index.push({ slug: s, source: f, erreur: String(e.message).slice(0, 120) });
  }
}

fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(index, null, 1), 'utf8');
const ok = index.filter((x) => !x.erreur);
console.log('\n--- corpus ---');
console.log('chapitres      :', index.length, '| echecs :', echecs);
console.log('caracteres     :', ok.reduce((n, x) => n + (x.caracteres || 0), 0).toLocaleString('fr-FR'));
console.log('images         :', ok.reduce((n, x) => n + (x.images || 0), 0));
console.log('dont legendees :', ok.reduce((n, x) => n + (x.imagesLegendees || 0), 0));
