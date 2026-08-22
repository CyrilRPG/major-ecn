/**
 * Contrôle des images des SUJETS OFFICIELS.
 *
 * `audit.mjs` garantit la parité côté CORRIGÉ : toute figure extraite d'un
 * corrigé est citée par une question ou déclarée ignorée avec un motif. Il ne
 * dit rien du sujet officiel, qui porte parfois une iconographie que le corrigé
 * ne reprend pas (radiographie commentée de mémoire, ECG cité sans être
 * reproduit). Ce script ferme cette brèche.
 *
 * Pour chaque source déclarant `sujetOfficiel` :
 *  1. extrait les images du sujet (LibreOffice pour les `.DOC`, `pdfimages`
 *     pour les `.pdf`), en réutilisant l'extraction déjà faite si elle existe ;
 *  2. écarte les éléments de gabarit (même image répétée dans plusieurs sujets
 *     de sessions différentes : filets, puces Word, logos) ;
 *  3. rapproche chaque image restante des figures publiées pour cette source,
 *     par SHA-1 puis, à défaut, par empreinte perceptuelle — le corrigé
 *     recompresse souvent la même planche ;
 *  4. liste ce qui n'a pas de correspondance, pour arbitrage visuel.
 *
 * Usage : node scripts/annales/audit-sujets.mjs [--extraire] [--planches]
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, copyFileSync, statSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join, isAbsolute } from 'node:path';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { ATELIER } from './extraire.mjs';
import { charger } from './charger.mjs';

const SOFFICE = process.env.SOFFICE_PATH ?? 'C:/Program Files/LibreOffice/program/soffice.exe';
const EXTRAIRE = process.argv.includes('--extraire');
const PLANCHES = process.argv.includes('--planches');
const RACINE = join(ATELIER, 'sujets-audit');
const EST_IMAGE = /\.(png|jpe?g|gif|bmp|tiff?)$/i;

const sha1 = (p) => createHash('sha1').update(readFileSync(p)).digest('hex');

/**
 * Empreinte 32x32 en niveaux de gris, centrée et normée.
 *
 * Une empreinte binaire (aHash) échoue sur les figures presque blanches — un
 * ECG sur papier millimétré ressemble à n'importe quel autre par ce critère,
 * et deux recadrages du MÊME tracé tombent de part et d'autre du seuil. La
 * corrélation croisée normalisée sépare nettement : ~0,7 entre deux versions
 * d'une même planche, < 0,1 entre deux figures différentes.
 */
const N = 32;
async function empreinte(p) {
  try {
    const img = await loadImage(p);
    const c = createCanvas(N, N);
    const ctx = c.getContext('2d');
    // Fond blanc : sinon la transparence d'un PNG compte comme du noir.
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, N, N);
    ctx.drawImage(img, 0, 0, N, N);
    const d = ctx.getImageData(0, 0, N, N).data;
    const v = [];
    for (let i = 0; i < d.length; i += 4) v.push((d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000);
    const moy = v.reduce((a, b) => a + b, 0) / v.length;
    const centre = v.map((x) => x - moy);
    const norme = Math.sqrt(centre.reduce((a, b) => a + b * b, 0)) || 1;
    return centre.map((x) => x / norme);
  } catch { return null; }
}
const correlation = (a, b) => (a && b) ? a.reduce((s, x, i) => s + x * b[i], 0) : 0;
/** Au-delà, on tient les deux images pour la même planche. */
const SEUIL = 0.45;

/* ------------------------------------------------------- 1. extraction ---- */

/** Extrait les images d'un sujet officiel dans un dossier dédié. */
function extraireSujet(chemin) {
  const cle = chemin.replace(/^Annales\/Sujets\//, '').replace(/[^A-Za-z0-9._-]+/g, '_');
  const dest = join(RACINE, cle);
  if (existsSync(join(dest, '.ok'))) return dest;
  if (!EXTRAIRE) return null;
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });

  // Noms accentués ou espaces : LibreOffice comme poppler s'y cassent les dents.
  const ext = chemin.toLowerCase().endsWith('.pdf') ? '.pdf' : '.doc';
  const copie = join(dest, 'source' + ext);
  copyFileSync(chemin, copie);

  if (ext === '.pdf') {
    spawnSync('pdfimages', ['-all', '-p', copie, join(dest, 'img')], { encoding: 'utf8', timeout: 300000 });
  } else {
    const r = spawnSync(SOFFICE, ['--headless', '--norestore', '--convert-to', 'html:HTML (StarWriter)',
      '--outdir', dest, copie], { encoding: 'utf8', timeout: 180000 });
    if (r.error) throw new Error('LibreOffice : ' + r.error.message);
  }
  writeFileSync(join(dest, '.ok'), '', 'utf8');
  return dest;
}

/* --------------------------- 1 bis. sections des PDF compilés ------------- */

/**
 * `2018_EVCP.pdf` & consorts regroupent TOUTES les spécialités d'une session
 * (172 pages, 37 sections). Sans découpage, les figures de psychiatrie seraient
 * reprochées au corrigé de cardiologie. Chaque section s'ouvre par son intitulé
 * en capitales, suivi de « Epreuve de vérification des connaissances ».
 */
const estCompile = (chemin) => /(^|[\\/])\d{4}_EVC[FP]/i.test(chemin);

/** Intitulé de section attendu pour chaque collège du projet. */
const SECTION_PAR_COLLEGE = {
  'anesthesie-reanimation': /^ANESTHESIE\s*[- ]?\s*REANIMATION/,
  cardiologie: /^(CARDIOLOGIE ET MALADIES VASCULAIRES|MEDECINE CARDIOVASCULAIRE)/,
  geriatrie: /^GERIATRIE/,
  gynecologie: /^GYNECOLOGIE OBSTETRIQUE/,
  'medecine-generale': /^MEDECINE GENERALE/,
  'medecine-urgence': /^MEDECINE D[’']URGENCE/,
  orthopedie: /^CHIRURGIE ORTHOPEDIQUE/,
  pediatrie: /^PEDIATRIE/,
  pneumologie: /^PNEUMOLOGIE/,
  psychiatrie: /^PSYCHIATRIE/,
};

const sectionsCache = new Map();
/** @returns {{titre: string, debut: number, fin: number}[]} 1-indexé, `fin` inclus. */
function sections(chemin) {
  if (sectionsCache.has(chemin)) return sectionsCache.get(chemin);
  const dest = join(RACINE, chemin.replace(/^Annales\/Sujets\//, '').replace(/[^A-Za-z0-9._-]+/g, '_'));
  const txt = join(dest, 'texte.txt');
  if (!existsSync(txt)) {
    const r = spawnSync('pdftotext', ['-enc', 'UTF-8', '-layout', join(dest, 'source.pdf'), txt],
      { encoding: 'utf8', timeout: 300000 });
    if (r.error || !existsSync(txt)) { sectionsCache.set(chemin, []); return []; }
  }
  const pages = readFileSync(txt, 'utf8').split('\f');
  const trouvees = [];
  pages.forEach((p, i) => {
    const lignes = p.split('\n').map((l) => l.trim()).filter(Boolean);
    // L'intitulé tient parfois sur deux lignes (« CHIRURGIE ORTHOPEDIQUE ET /
    // TRAUMATOLOGIQUE ») : on recolle le début de page avant de le tester.
    // L'ordre des lignes de tête varie : l'intitulé peut être suivi de la
    // consigne « TOUS LES SUJETS… » avant la ligne « Epreuve de vérification ».
    const tete = lignes.slice(0, 5).join(' ');
    if (!/Epreuve de v[ée]rification des connaissances/i.test(tete)) return;
    const titre = tete.split(/Epreuve de v[ée]rification/i)[0]
      .replace(/(TOUS |L[’']ENSEMBLE )[\s\S]*$/i, '').trim();
    if (titre.length >= 3) trouvees.push({ titre, debut: i + 1, fin: pages.length });
  });
  trouvees.forEach((s, i) => { if (trouvees[i + 1]) s.fin = trouvees[i + 1].debut - 1; });
  sectionsCache.set(chemin, trouvees);
  return trouvees;
}

/** Pages du sujet à prendre en compte pour cette source, ou `null` = toutes. */
function pagesUtiles(sujet, source) {
  if (!estCompile(sujet)) return null;
  const secs = sections(sujet);
  if (secs.length < 5) return null;                      // pas un compilé après tout
  // La déclaration peut nommer explicitement la section : « (section « X ») ».
  const cite = String(source.info.sujetOfficiel).match(/section\s*«\s*([^»]+)\s*»/);
  const motif = cite
    ? new RegExp('^' + cite[1].trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    : SECTION_PAR_COLLEGE[source.college];
  if (!motif) return null;
  const s = secs.find((x) => motif.test(x.titre));
  if (!s) {
    console.log('⚠ section introuvable dans ' + sujet + ' pour ' + source.college
      + ' (' + secs.length + ' sections lues)');
    return null;
  }
  return s;
}

/* ------------------------------------------------------- 2. inventaire ---- */

// `sujetOfficiel` est un champ de PROSE : il peut citer plusieurs fichiers
// (« A et B », « A ; B ; C ») et préciser la section utile d'un PDF compilé.
// On en extrait tous les chemins.
const cheminsSujets = (texte) =>
  [...String(texte).matchAll(/Annales\/Sujets\/[^;()]*?\.(?:docx?|pdf)/gi)].map((m) => m[0]);

/** Index des fichiers de `Annales/Sujets/`, par nom de base en minuscules. */
const indexSujets = new Map();
(function indexer(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) { indexer(p); continue; }
    const k = e.name.toLowerCase();
    indexSujets.set(k, [...(indexSujets.get(k) ?? []), p]);
  }
})('Annales/Sujets');

/**
 * Le chemin déclaré, ou son homonyme quand l'emboîtement a changé — plusieurs
 * dossiers de sujets se dédoublent (`EVCP__2017 - 30 à 76/EVCP__2017 - 30 à
 * 76/`) et un même `EVCP.36.DOC` existe pour chaque session. On lève
 * l'ambiguïté par le dossier parent déclaré.
 */
function resoudre(chemin) {
  if (existsSync(chemin)) return chemin;
  const morceaux = chemin.split('/');
  const cands = indexSujets.get(morceaux.pop().toLowerCase()) ?? [];
  if (cands.length === 1) return cands[0];
  const parent = morceaux.pop();
  const filtres = cands.filter((c) => c.split(/[\\/]/).includes(parent));
  return filtres.length === 1 ? filtres[0] : null;
}

const sources = [];
for (const col of readdirSync('scripts/annales/data')) {
  const data = charger('scripts/annales/data/' + col);
  for (const [src, info] of Object.entries(data.sources ?? {})) {
    if (!info.sujetOfficiel) continue;
    const declares = cheminsSujets(info.sujetOfficiel);
    const sujets = [];
    for (const d of declares) {
      const r = resoudre(d);
      if (r) sujets.push(r);
      else console.log('⚠ sujet officiel déclaré mais introuvable : ' + d + '  (' + src + ')');
    }
    if (declares.length === 0) console.log('⚠ `sujetOfficiel` sans chemin exploitable : ' + info.sujetOfficiel);
    sources.push({ college: col, src, sujets, info, series: data.series.filter((s) => s.source === src) });
  }
}
console.log(sources.length + ' source(s) déclarant un sujet officiel, '
  + new Set(sources.flatMap((s) => s.sujets)).size + ' fichier(s) de sujet distincts.');

const parSujet = new Map();
for (const sujet of new Set(sources.flatMap((s) => s.sujets))) {
  const dest = extraireSujet(sujet);
  if (!dest) { parSujet.set(sujet, null); continue; }
  const imgs = readdirSync(dest).filter((f) => EST_IMAGE.test(f))
    .map((f) => ({ fichier: f, chemin: join(dest, f), sha: sha1(join(dest, f)), taille: statSync(join(dest, f)).size }));
  parSujet.set(sujet, imgs);
}

const nonExtraits = [...parSujet.entries()].filter(([, v]) => v === null).map(([k]) => k);
if (nonExtraits.length) {
  console.log('\n' + nonExtraits.length + ' sujet(s) pas encore extraits — relancer avec --extraire :');
  for (const n of nonExtraits) console.log('  ' + n);
}

/* ------------------------------- 3. gabarit : image présente partout ------ */

const compte = new Map();
for (const imgs of parSujet.values()) {
  for (const sha of new Set((imgs ?? []).map((i) => i.sha))) compte.set(sha, (compte.get(sha) ?? 0) + 1);
}
const nbSujets = [...parSujet.values()].filter(Boolean).length;
// Une image partagée par au moins trois sujets de sessions différentes n'est
// pas une iconographie clinique : c'est un filet, un logo ou une puce Word.
const gabarit = new Set([...compte.entries()].filter(([, n]) => n >= 3).map(([sha]) => sha));

/* ----------------------------------- 4. rapprochement avec le publié ------ */

const cheminFigure = (p) => (isAbsolute(p) ? p : join(ATELIER, p));
const empreintes = new Map();
const emp = async (p) => {
  if (!empreintes.has(p)) empreintes.set(p, await empreinte(p));
  return empreintes.get(p);
};

/** Numéro de page porté par le nom `pdfimages -p` (`img-<page>-<n>.<ext>`). */
const pageDe = (nom) => { const m = nom.match(/^img-(\d+)-/); return m ? Number(m[1]) : null; };

const orphelines = [];
const perimetres = [];
const ko = [];
for (const s of sources) {
  const imgs = [];
  for (const f of s.sujets) {
    const toutes = parSujet.get(f) ?? [];
    const sec = pagesUtiles(f, s);
    const gardees = sec
      ? toutes.filter((i) => { const p = pageDe(i.fichier); return p !== null && p >= sec.debut && p <= sec.fin; })
      : toutes;
    if (sec) perimetres.push({ college: s.college, sujet: f, sec, retenues: gardees.length, total: toutes.length });
    imgs.push(...gardees.map((i) => ({ ...i, sujet: f })));
  }
  if (imgs.length === 0) continue;
  const citees = [];
  for (const serie of s.series) {
    for (const q of serie.questions) {
      for (const i of q.images ?? []) citees.push(cheminFigure(i));
      for (const it of q.items ?? []) for (const i of it.images ?? []) citees.push(cheminFigure(i));
    }
  }
  const presentes = [...new Set(citees)].filter(existsSync);
  const shasCitees = new Set(presentes.map(sha1));
  const empCitees = [];
  for (const c of presentes) empCitees.push([c, await emp(c)]);

  // Verdicts d'arbitrage déjà rendus : le corrigé projette la même planche,
  // mais recadrée, agrandie ou en miroir — le rapprochement automatique ne peut
  // pas les rejoindre, seule la relecture le pouvait. Le motif est conservé.
  const couvertes = s.info.sujetFiguresCouvertes ?? {};

  for (const img of imgs) {
    if (gabarit.has(img.sha)) continue;
    if (img.taille < 3000) continue;               // puce, filet, artefact Word
    if (shasCitees.has(img.sha)) continue;         // identique à une figure publiée
    if (img.fichier in couvertes) {
      if (!String(couvertes[img.fichier]).trim()) ko.push(s.src + ' — figure déclarée couverte sans motif : ' + img.fichier);
      continue;
    }
    const e = await emp(img.chemin);
    if (empCitees.some(([, ec]) => correlation(e, ec) >= SEUIL)) continue;  // même planche, recadrée
    orphelines.push({ ...s, img });
  }
}

/* --------------------------------------------------------- 5. rapport ---- */

const totalImages = [...parSujet.values()].filter(Boolean).reduce((n, v) => n + v.length, 0);
console.log('\n' + nbSujets + ' sujet(s) officiels extraits, ' + totalImages + ' image(s) au total, '
  + gabarit.size + ' empreinte(s) de gabarit écartée(s).');

if (perimetres.length) {
  console.log('\nPDF compilés découpés par section :');
  for (const p of perimetres) {
    console.log('  ' + p.college.padEnd(23) + ' ' + p.sujet.split('/').pop()
      + '  « ' + p.sec.titre.slice(0, 42) + ' »  p.' + p.sec.debut + '–' + p.sec.fin
      + '  → ' + p.retenues + '/' + p.total + ' image(s)');
  }
}

for (const m of ko) console.log('⚠ ' + m);

if (orphelines.length === 0) {
  console.log('\n✅ Aucune image de sujet officiel sans contrepartie publiée.');
} else {
  console.log('\n' + orphelines.length + ' image(s) de sujet officiel sans contrepartie publiée — à arbitrer :');
  for (const o of orphelines) {
    console.log('  ── ' + o.college + ' · ' + o.src);
    console.log('     sujet  : ' + o.img.sujet);
    console.log('     image  : ' + o.img.fichier + '  (' + Math.round(o.img.taille / 1024) + ' ko)');
    console.log('     chemin : ' + o.img.chemin);
  }
  if (PLANCHES) {
    const dossier = join(RACINE, '_a-arbitrer');
    mkdirSync(dossier, { recursive: true });
    for (const o of orphelines) copyFileSync(o.img.chemin, join(dossier, o.college + '__' + o.img.fichier));
    console.log('\nCopies rassemblées pour relecture visuelle : ' + dossier);
  }
}
