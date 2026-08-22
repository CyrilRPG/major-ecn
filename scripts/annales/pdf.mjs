/**
 * Enveloppe poppler tolérante aux noms de fichiers Windows.
 *
 * Les corrigés Cardiologie sont nommés en Unicode NFD (« Se » + accent
 * combinant U+0301) : `pdfinfo.exe` / `pdftotext.exe` échouent silencieusement
 * dessus. On copie donc systématiquement le PDF vers un nom ASCII temporaire
 * avant tout appel externe.
 */
import { spawnSync } from 'node:child_process';
import {
  copyFileSync, mkdirSync, rmSync, existsSync, readdirSync, readFileSync, unlinkSync,
} from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';

const TMP = join(tmpdir(), 'annales-poppler');
mkdirSync(TMP, { recursive: true });

/** Copie le PDF sous un nom ASCII stable (hash du chemin) et renvoie ce chemin. */
export function asciiPath(pdf) {
  const h = createHash('sha1').update(pdf).digest('hex').slice(0, 16);
  const dst = join(TMP, h + '.pdf');
  if (!existsSync(dst)) copyFileSync(pdf, dst);
  return dst;
}

function run(bin, args) {
  const r = spawnSync(bin, args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  if (r.error) throw new Error(bin + ' : ' + r.error.message);
  return r.stdout ?? '';
}

/** Nombre de pages, ou null si poppler n'y arrive pas. */
export function pages(pdf) {
  const m = run('pdfinfo', [asciiPath(pdf)]).match(/^Pages:\s+(\d+)/m);
  return m ? Number(m[1]) : null;
}

/** Texte UTF-8. `layout` conserve la mise en colonnes (utile pour les grilles). */
export function texte(pdf, { from, to, layout = false } = {}) {
  const args = ['-enc', 'UTF-8'];
  if (layout) args.push('-layout');
  if (from) args.push('-f', String(from));
  if (to) args.push('-l', String(to));
  args.push(asciiPath(pdf), '-');
  return run('pdftotext', args);
}

/**
 * Extrait les FIGURES d'un PDF dans `dest`, en écartant le gabarit (bandeau,
 * logo, filigrane) répété de page en page.
 *
 * Le tri se fait sur le SHA-1 du contenu décodé, et non sur le numéro d'objet
 * PDF : les decks exportés depuis PowerPoint dupliquent l'objet du logo à
 * chaque diapositive (152 objets distincts pour 79 pages sur EVCF2019), si bien
 * qu'un critère « même objet sur N pages » ne voit pas le gabarit.
 *
 * Un SHA présent sur plus de `seuilRepetition` pages est du gabarit ; un fichier
 * de moins de `tailleMin` octets est un masque alpha ou une puce. Le reste est
 * une figure d'énoncé et doit être intégré — aucune ne doit être perdue.
 */
export function figures(pdf, dest, { seuilRepetition = 3, tailleMin = 3000 } = {}) {
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  run('pdfimages', ['-all', '-p', asciiPath(pdf), join(dest, 'img')]);

  const brutes = readdirSync(dest)
    .map((nom) => ({ nom, m: nom.match(/^img-(\d+)-(\d+)\.(\w+)$/) }))
    .filter((x) => x.m)
    .map(({ nom, m }) => ({
      fichier: join(dest, nom), page: Number(m[1]), index: Number(m[2]), ext: m[3],
    }))
    .sort((a, b) => a.page - b.page || a.index - b.index);

  const pagesParSha = new Map();
  for (const b of brutes) {
    const buf = readFileSync(b.fichier);
    b.sha = createHash('sha1').update(buf).digest('hex');
    b.octets = buf.length;
    pagesParSha.set(b.sha, (pagesParSha.get(b.sha) ?? new Set()).add(b.page));
  }

  const gardees = [];
  const dejaVu = new Set();
  for (const b of brutes) {
    const repete = pagesParSha.get(b.sha).size > seuilRepetition;
    if (repete || b.octets < tailleMin || dejaVu.has(b.sha)) { unlinkSync(b.fichier); continue; }
    dejaVu.add(b.sha);
    gardees.push(b);
  }
  return { gardees, brutes: brutes.length, ecartees: brutes.length - gardees.length };
}

/** Rend une page en PNG (repli quand la figure est vectorielle ou composée). */
export function rendrePage(pdf, page, dest, { dpi = 150 } = {}) {
  mkdirSync(dest, { recursive: true });
  run('pdftoppm', ['-r', String(dpi), '-f', String(page), '-l', String(page), '-png',
    asciiPath(pdf), join(dest, 'page')]);
  return readdirSync(dest)
    .filter((f) => f.startsWith('page') && f.endsWith('.png'))
    .map((f) => join(dest, f));
}

/** Retire le pied de page Major ECN / PAE Formation répété sur chaque page. */
export function sansPiedDePage(txt) {
  return txt
    .split(/\r?\n/)
    .filter((l) => !/(PAE Formation|Major ECN)\s*[-–]\s*3 rue Rosa Bonheur/i.test(l))
    .filter((l) => !/Toute reproduction, publication, transmission ou utilisation/i.test(l))
    .filter((l) => !/^\s*(www\.major-ecn\.fr|T[ée]l\s*:)/i.test(l))
    .filter((l) => !/^\s*3 rue Rosa Bonheur/i.test(l))
    // Pied de page des .DOC convertis : chemin de fichier de l'auteur et
    // pagination. Ce chemin porte parfois un nom de compte — il n'a rien à faire
    // dans un contenu publié.
    .filter((l) => !/^\s*([A-Z]:\\|\/(Users|home)\/)[^\s].*\.(docx?|pptx?|pdf)\s*$/i.test(l))
    .filter((l) => !/^\s*Page\s*:?\s*\d+\s*\/\s*\d+\s*$/i.test(l))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
