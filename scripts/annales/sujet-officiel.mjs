/**
 * Extraction d'un SUJET officiel `Annales/Sujets/**\/EVCx.NN.DOC`.
 *
 * Les sujets sont au format Word 97-2003 (flux OLE binaire) : ni `pdftotext` ni
 * une lecture directe ne donnent rien d'exploitable. LibreOffice, installé sur
 * le poste, sait les convertir en HTML — et extrait au passage les images
 * embarquées, indispensables quand une question repose sur une radiographie que
 * le corrigé ne reprend pas.
 *
 * Le sujet sert de contrôle de fidélité : c'est lui qui porte l'énoncé exact et
 * la numérotation officielle, là où le corrigé abrège parfois la question.
 *
 * Usage : node scripts/annales/sujet-officiel.mjs --type EVCF --annee 2012 --code 53
 * Sortie : <atelier>/sujets/<TYPE>-<code>-<annee>/{texte.txt, <images>}
 */
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync, copyFileSync, rmSync } from 'node:fs';
import { join, basename } from 'node:path';
import { ATELIER } from './extraire.mjs';

const SOFFICE = process.env.SOFFICE_PATH ?? 'C:/Program Files/LibreOffice/program/soffice.exe';
const RACINE = 'Annales/Sujets';

/** Dossiers de sujets `.DOC`, par (type, année). Miroir de `sujets-index.mjs`. */
const DOSSIERS = {
  'EVCF-2009': 'evcf_2009',
  'EVCF-2011': 'evcf_2011',
  'EVCF-2012': 'evcf_2012',
  'EVCF-2015': 'evcf_2015',
  'EVCF-2016': 'EVC2016_EVCF',
  'EVCF-2017': 'EVCF_2017',
  'EVCF-2019': 'EVCF 2019',
  'EVCP-2010': 'evcp_30-90',
  'EVCP-2011': 'evcp_2011',
  'EVCP-2013': 'evcp_2013',
  'EVCP-2015': 'sujets_evc_pratiques_2015_0',
  'EVCP-2017': 'EVCP__2017 - 30 à 76',
  // Codes < 30 : second dossier pour 2010 et 2017.
  'EVCP-2010-bas': 'evcp_2-29_0',
  'EVCP-2017-bas': 'EVCP__2017 - 02 à 29',
};

/** Retrouve `EVCx.NN.DOC` quel que soit l'emboîtement et la casse. */
function trouverDoc(dossier, type, code) {
  const pile = [join(RACINE, dossier)];
  const cible = new RegExp('^' + type + '\\.' + code + '\\.(doc|pdf)$', 'i');
  while (pile.length) {
    const d = pile.pop();
    if (!existsSync(d)) continue;
    for (const nom of readdirSync(d)) {
      const p = join(d, nom);
      if (statSync(p).isDirectory()) { pile.push(p); continue; }
      if (cible.test(nom)) return p;
    }
  }
  return null;
}

export function extraireSujet({ type, annee, code }) {
  const bas = Number(code) < 30;
  const cle = type + '-' + annee + (bas && DOSSIERS[type + '-' + annee + '-bas'] ? '-bas' : '');
  const dossier = DOSSIERS[cle] ?? DOSSIERS[type + '-' + annee];
  if (!dossier) throw new Error('Aucun dossier de sujets pour ' + type + ' ' + annee);
  const doc = trouverDoc(dossier, type, code);
  if (!doc) throw new Error('Sujet introuvable : ' + type + '.' + code + ' (' + annee + ')');

  const dest = join(ATELIER, 'sujets', type + '-' + code + '-' + annee);
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });

  // LibreOffice s'étrangle sur les noms accentués : on lui donne une copie ASCII.
  const copie = join(dest, type + '.' + code + '.' + annee + (doc.toLowerCase().endsWith('.pdf') ? '.pdf' : '.doc'));
  copyFileSync(doc, copie);
  if (copie.endsWith('.pdf')) return { source: doc, dest, pdf: copie, texte: null, images: [] };

  const r = spawnSync(SOFFICE, [
    '--headless', '--norestore', '--convert-to', 'html:HTML (StarWriter)', '--outdir', dest, copie,
  ], { encoding: 'utf8', timeout: 120000 });
  if (r.error) throw new Error('LibreOffice : ' + r.error.message);

  const html = readdirSync(dest).find((f) => f.toLowerCase().endsWith('.html'));
  if (!html) throw new Error('Conversion LibreOffice sans sortie HTML pour ' + doc);
  const brut = readFileSync(join(dest, html), 'utf8');
  const corps = brut.replace(/[\s\S]*?<BODY[^>]*>/i, '').replace(/<\/BODY>[\s\S]*/i, '');

  const images = [...corps.matchAll(/<IMG[^>]+SRC="([^"]+)"/gi)].map((m) => m[1]);
  const txt = corps
    .replace(/<\/(p|div|tr|h\d|li)>/gi, '\n')
    .replace(/<br[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    // LibreOffice imprime le chemin du fichier et la pagination en pied de page.
    .split('\n').map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .filter((l) => l && !/^[A-Z]:\\/.test(l) && !/^Page\s*:\s*\d+\s*\/\s*\d+$/.test(l))
    .join('\n');

  writeFileSync(join(dest, 'texte.txt'), txt, 'utf8');
  return { source: doc, dest, texte: txt, images: images.map((i) => basename(i)) };
}

function principal() {
  const arg = (n) => process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : null;
  const type = arg('--type');
  const annee = arg('--annee');
  const code = arg('--code');
  if (!type || !annee || !code) throw new Error('Usage : --type EVCF --annee 2012 --code 53');
  const r = extraireSujet({ type, annee: Number(annee), code });
  console.log('Source : ' + r.source);
  console.log('Atelier : ' + r.dest);
  if (r.images.length) console.log('Images : ' + r.images.join(', '));
  if (r.texte) console.log('\n' + r.texte);
  else console.log('(sujet au format PDF : lire ' + r.pdf + ')');
}

// `process.argv[1]` est absent sous `node -e` : ce module doit rester importable.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) principal();
