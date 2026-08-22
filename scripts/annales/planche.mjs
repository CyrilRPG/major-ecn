/**
 * Planche-contact de TOUTES les figures d'un corrigé, dans l'ordre des pages.
 *
 * C'est l'outil de travail de la rédaction : rattacher une radiographie à la
 * bonne question demande de la voir, et les ouvrir une par une coûterait des
 * centaines d'allers-retours. Chaque vignette porte son nom de fichier et sa
 * page, de quoi la citer directement dans le JSON de la série.
 *
 * La version RECADRÉE d'une figure est affichée dès qu'elle existe : c'est elle
 * qui sera publiée, c'est donc elle qu'il faut regarder.
 *
 * Usage : node scripts/annales/planche.mjs --dossier annales-orthopedie/evcf2017 [--depuis 0] [--combien 12]
 */
import { pathToFileURL } from 'node:url';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { ATELIER } from './extraire.mjs';

export async function plancheFigures(dossier, { depuis = 0, combien = 12, colonnes = 4, largeur = 520 } = {}) {
  const base = join(ATELIER, dossier);
  const meta = JSON.parse(readFileSync(join(base, 'figures.json'), 'utf8'));
  const lot = meta.figures.slice(depuis, depuis + combien);
  if (!lot.length) return { fichier: null, total: meta.figures.length, montrees: 0 };

  const charges = [];
  for (const f of lot) {
    const recadre = join(base, 'figures', 'recadre', f.fichier.replace(/\.\w+$/, '.png'));
    const chemin = existsSync(recadre) ? recadre : join(base, 'figures', f.fichier);
    try {
      charges.push({ ...f, recadree: existsSync(recadre), im: await loadImage(chemin) });
    } catch { /* figure illisible : signalée par son absence sur la planche */ }
  }

  const hauteurs = charges.map((c) => Math.round(largeur * c.im.height / c.im.width));
  const hMax = Math.min(Math.max(...hauteurs), Math.round(largeur * 1.4));
  const bandeau = 22;
  const lignes = Math.ceil(charges.length / colonnes);
  const cv = createCanvas(colonnes * largeur, lignes * (hMax + bandeau));
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#0B1220';
  ctx.fillRect(0, 0, cv.width, cv.height);

  charges.forEach((c, i) => {
    const x = (i % colonnes) * largeur;
    const y = Math.floor(i / colonnes) * (hMax + bandeau);
    // Contenir la vignette dans la case sans la déformer.
    const echelle = Math.min(largeur / c.im.width, hMax / c.im.height);
    const l = Math.round(c.im.width * echelle);
    const h = Math.round(c.im.height * echelle);
    ctx.drawImage(c.im, x + Math.round((largeur - l) / 2), y + bandeau, l, h);
    ctx.fillStyle = c.recadree ? '#FCD34D' : '#F9FAFB';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('p' + c.page + ' · ' + c.fichier + (c.recadree ? ' (recadrée)' : ''), x + 6, y + 16);
  });

  const dest = join(base, 'planche-figures-' + depuis + '.png');
  writeFileSync(dest, cv.toBuffer('image/png'));
  return { fichier: dest, total: meta.figures.length, montrees: charges.length };
}

function principal() {
  const arg = (n) => process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : null;
  return plancheFigures(arg('--dossier'), {
    depuis: Number(arg('--depuis') ?? 0),
    combien: Number(arg('--combien') ?? 12),
  }).then((r) => {
    console.log(r.fichier ? r.fichier + '  (' + r.montrees + ' / ' + r.total + ')' : 'aucune figure');
  });
}

// `process.argv[1]` est absent sous `node -e` : ce module doit rester importable.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await principal();
