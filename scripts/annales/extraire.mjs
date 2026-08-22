/**
 * Prépare le plan de travail d'un collège : pour chaque corrigé retenu par
 * `inventaire.mjs`, écrit le texte page à page et extrait les figures.
 *
 * Le texte est balisé `=== PAGE n ===` : c'est ce qui permet ensuite de rattacher
 * chaque figure à la bonne question, puisque `figures.json` porte le numéro de
 * page de chacune. Sans ce repère, une radiographie se retrouve sous la mauvaise
 * question — or aucune image ne doit être ni perdue ni déplacée.
 *
 * Usage : node scripts/annales/extraire.mjs --college "ANNALES ORTHOPEDIE" [--seul <motif>]
 * Sortie : <scratch>/annales/<slug-college>/<slug-fichier>/{texte.txt,figures.json,figures/}
 */
import { pathToFileURL } from 'node:url';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { texte, figures, sansPiedDePage } from './pdf.mjs';

const RACINE = 'Annales/Corriges_Majorecn';
export const ATELIER = process.env.ANNALES_ATELIER
  ?? 'C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin-Desktop-Major-ecn-projects-major-ecn/0c043099-f04d-42b2-8986-fd6c65d793f5/scratchpad/annales';

export const slug = (s) => s
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/\.pdf$/i, '')
  .replace(/[^A-Za-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .toLowerCase();

/** Texte du PDF découpé en pages, chaque page précédée de son numéro. */
export function textePagine(pdf) {
  // pdftotext sépare les pages par un saut de page (U+000C) et en met un après
  // la dernière : le découpage brut produit une page fantôme en fin de fichier.
  const brut = texte(pdf).split('\f');
  if (brut.length && !brut[brut.length - 1].trim()) brut.pop();
  return brut.map((p, i) => {
    const corps = sansPiedDePage(p);
    return '=== PAGE ' + (i + 1) + ' ===\n' + (corps || '(page sans texte : figure seule)');
  }).join('\n\n');
}

function principal() {
  const arg = (nom) => process.argv.includes(nom) ? process.argv[process.argv.indexOf(nom) + 1] : null;
  const college = arg('--college');
  const seul = arg('--seul');
  if (!college) throw new Error('Usage : --college "ANNALES ORTHOPEDIE" [--seul <motif>]');

  const inv = JSON.parse(readFileSync('scripts/annales/inventaire.json', 'utf8'));
  const c = inv.colleges[college];
  if (!c) throw new Error('Collège absent de inventaire.json : ' + college + '. Lancer inventaire.mjs.');

  const base = join(ATELIER, slug(college));
  mkdirSync(base, { recursive: true });
  const manifeste = [];

  for (const f of c.fichiers) {
    if (seul && !f.fichier.toLowerCase().includes(seul.toLowerCase())) continue;
    const pdf = join(RACINE, f.fichier);
    const dossier = join(base, slug(basename(f.fichier)));
    mkdirSync(dossier, { recursive: true });

    writeFileSync(join(dossier, 'texte.txt'), textePagine(pdf), 'utf8');
    const r = figures(pdf, join(dossier, 'figures'));
    writeFileSync(join(dossier, 'figures.json'), JSON.stringify({
      pdf: f.fichier, pages: f.pages, brutes: r.brutes,
      figures: r.gardees.map((g) => ({
        fichier: basename(g.fichier), page: g.page, index: g.index, sha: g.sha, octets: g.octets,
      })),
    }, null, 2), 'utf8');

    manifeste.push({ fichier: f.fichier, dossier: slug(basename(f.fichier)), pages: f.pages, figures: r.gardees.length, annales: f.annales });
    console.log(f.fichier + ' → ' + r.gardees.length + ' figure(s) sur ' + r.brutes + ' images brutes');
  }

  writeFileSync(join(base, 'manifeste.json'), JSON.stringify({ college, collegeId: c.collegeId, nom: c.nom, fichiers: manifeste }, null, 2), 'utf8');
  console.log('\nAtelier : ' + base);
  console.log(manifeste.length + ' corrigés préparés, ' + manifeste.reduce((n, m) => n + m.figures, 0) + ' figures.');
}

// `process.argv[1]` est absent sous `node -e` : ce module doit rester importable.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) principal();
