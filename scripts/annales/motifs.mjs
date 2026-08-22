/**
 * Génère le bloc `figuresIgnorees` d'une source à partir du texte du diaporama.
 *
 * Les conférences de pneumologie intercalent la correction des annales dans un
 * cours illustré : plusieurs centaines de figures par diaporama, dont la quasi-
 * totalité illustre le cours et non l'annale. L'audit exige un motif explicite
 * pour chaque figure non citée ; les rédiger une à une n'aurait ni valeur ni
 * fiabilité. On les dérive donc du TITRE RÉEL de la diapositive qui porte la
 * figure (première ligne non vide de la page), ce qui reste vérifiable et
 * spécifique à chaque image.
 *
 * Usage :
 *   node scripts/annales/motifs.mjs --atelier <rel> [--citees a.jpg,b.jpg] [--fusion <data.json> --source "<clé>"]
 *
 * Sans `--fusion`, le bloc est écrit sur la sortie standard.
 */
import { pathToFileURL } from 'node:url';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ATELIER } from './extraire.mjs';

/** Titre de la diapositive `n` : première ligne non vide, pieds de page retirés. */
export function titreDiapo(texte, n) {
  const pages = texte.split(/=== PAGE (\d+) ===/).slice(1);
  for (let i = 0; i < pages.length; i += 2) {
    if (+pages[i] !== n) continue;
    const lignes = pages[i + 1]
      .replace(/\r/g, '')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l
        && !/^\d\d\/\d\d\/20\d\d/.test(l)
        && !/rue Rosa Bonheur/.test(l)
        && !/Toute reproduc/.test(l)
        && !/major-ecn\.fr/.test(l)
        && !/^Tel\s*:/.test(l)
        && l !== '(page sans texte : figure seule)');
    return lignes[0] ?? null;
  }
  return null;
}

export function motifsIgnorees(atelierRel, citees = []) {
  const base = join(ATELIER, atelierRel);
  const texte = readFileSync(join(base, 'texte.txt'), 'utf8');
  const figures = JSON.parse(readFileSync(join(base, 'figures.json'), 'utf8')).figures;
  const sansExt = (n) => n.replace(/\.\w+$/, '');
  const citeesNoms = new Set(citees.map((p) => sansExt(p.split('/').pop())));

  const out = {};
  for (const f of figures) {
    if (citeesNoms.has(sansExt(f.fichier))) continue;
    const titre = titreDiapo(texte, f.page);
    out[f.fichier] = titre
      ? 'illustration de la diapositive de cours « ' + titre.slice(0, 110) + ' » (page ' + f.page + ') : support pédagogique du conférencier, hors iconographie de l’annale'
      : 'illustration d’une diapositive de cours sans titre lisible (page ' + f.page + ') : support pédagogique du conférencier, hors iconographie de l’annale';
  }
  return out;
}

function principal() {
  const arg = (n) => process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : null;
  const atelier = arg('--atelier');
  if (!atelier) throw new Error('Usage : --atelier <rel> [--citees a.jpg,b.jpg] [--fusion <data.json> --source "<clé>"]');
  const citees = (arg('--citees') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const bloc = motifsIgnorees(atelier, citees);

  const fusion = arg('--fusion');
  if (!fusion) { console.log(JSON.stringify(bloc, null, 2)); return; }
  const source = arg('--source');
  if (!source) throw new Error('--fusion exige --source "<clé de data.sources>"');
  if (!existsSync(fusion)) throw new Error('fichier introuvable : ' + fusion);
  const data = JSON.parse(readFileSync(fusion, 'utf8'));
  if (!data.sources?.[source]) throw new Error('source absente du fichier : ' + source);
  data.sources[source].figuresIgnorees = { ...bloc, ...(data.sources[source].figuresIgnorees ?? {}) };
  writeFileSync(fusion, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(Object.keys(bloc).length + ' figure(s) déclarée(s) ignorée(s) dans ' + fusion);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) principal();
