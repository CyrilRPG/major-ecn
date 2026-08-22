/**
 * Inventaire du corpus `Annales/Corriges_Majorecn/`.
 *
 * Pour chaque PDF : collège d'appartenance, puis repérage des annales qu'il
 * contient sous la forme (type EVCF/EVCP, année, éventuel n° de sujet). Le
 * repérage lit le NOM du fichier ET son CONTENU : côté corrigés la règle
 * « un fichier = une annale » ne tient pas (un deck « Séance 25-09 correction »
 * de Cardiologie corrige « EVCP 2024, sujet n°3 »).
 *
 * Chaque annale détectée est ensuite confrontée à `Annales/Sujets/` : si le
 * sujet officiel du code spécialité n'y figure pas, l'annale reste intégrable
 * mais est signalée. Les fichiers où aucune annale n'est détectable (supports
 * de cours, recommandations) sont EXCLUS et listés dans le rapport.
 *
 * Usage : node scripts/annales/inventaire.mjs [--college "ANNALES ORTHOPEDIE"]
 * Sorties : scripts/annales/inventaire.json + scripts/annales/RAPPORT-INVENTAIRE.md
 */
import { readdirSync, statSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { COLLEGES } from './colleges.mjs';
import { indexSujets, sujetDisponible } from './sujets-index.mjs';
import { texte, pages, sansPiedDePage } from './pdf.mjs';

const RACINE = 'Annales/Corriges_Majorecn';
const SORTIE_JSON = 'scripts/annales/inventaire.json';
const SORTIE_MD = 'scripts/annales/RAPPORT-INVENTAIRE.md';

const argCollege = process.argv.includes('--college')
  ? process.argv[process.argv.indexOf('--college') + 1]
  : null;

const enSlash = (p) => p.split('\\').join('/');

/** Tous les PDF sous `dir`, récursivement. */
function pdfs(dir) {
  const out = [];
  for (const nom of readdirSync(dir)) {
    const p = join(dir, nom);
    if (statSync(p).isDirectory()) out.push(...pdfs(p));
    else if (/\.pdf$/i.test(nom)) out.push(p);
  }
  return out.sort();
}

const ANNEE = '(19|20)\\d{2}';
/** Motifs de détection d'une annale, du plus explicite au plus lâche. */
const MOTIFS = [
  // « EVCF 2019 », « EVCP.53 2012 », « ECVF Annales 2019 »
  new RegExp('\\bE[VC]{2}([FP])\\b[^\\n]{0,30}?\\b' + ANNEE + '\\b', 'gi'),
  // « 2019 EVCF », « Correction EVCP 2025 »
  new RegExp('\\b' + ANNEE + '\\b[^\\n]{0,20}?\\bE[VC]{2}([FP])\\b', 'gi'),
  // « Épreuve de vérification des connaissances fondamentales … 2024 »
  new RegExp('connaissances\\s+(fondamentales|pratiques)[^\\n]{0,60}?\\b' + ANNEE + '\\b', 'gi'),
  new RegExp('\\b' + ANNEE + '\\b[^\\n]{0,60}?connaissances\\s+(fondamentales|pratiques)', 'gi'),
];

/**
 * Beaucoup de corrigés n'accolent JAMAIS le type et l'année : « Annales 2016 »
 * (Gynécologie), « PAE 2014 » dont le corps commence par « EVCF », « Correction
 * Sujet 2 » dans un fichier nommé `correction sujet 2 2024.pdf`, « Proposition
 * de correction d'annales – EVC 2024 ». Les motifs d'adjacence ci-dessus les
 * manquent tous, et les exclure reviendrait à jeter de vraies annales.
 *
 * Second passage, donc : on détecte les ANNÉES et les TYPES séparément, puis on
 * les croise. Faute de type identifiable, l'annale est retenue avec
 * `typeIncertain` — c'est à la lecture qu'on tranche (questions isolées → EVCF,
 * dossier clinique progressif → EVCP).
 */
const MOTIFS_ANNEE_SEULE = [
  /\bannales?\b[^\n]{0,40}?\b(20[0-2]\d)\b/gi,
  /\b(20[0-2]\d)\b[^\n]{0,20}?\bannales?\b/gi,
  /\bEVC\b[^\n]{0,20}?\b(20[0-2]\d)\b/gi,
  /\b(20[0-2]\d)\b[^\n]{0,20}?\bEVC\b/gi,
  /\bPAE\b[^\n]{0,20}?\b(20[0-2]\d)\b/gi,
  /\bcorrections?\b[^\n]{0,40}?\b(20[0-2]\d)\b/gi,
  /\bsujets?\b[^\n]{0,30}?\b(20[0-2]\d)\b/gi,
];

const MOTIFS_TYPE = [
  [/\bEVCF\b|\bECVF\b|connaissances\s+fondamentales|EVC\s+Fondamentales|questions?\s+isol[ée]es/gi, 'EVCF'],
  [/\bEVCP\b|\bECVP\b|connaissances\s+pratiques|EVC\s+Pratiques|dossiers?\s+(?:clinique|progressif)/gi, 'EVCP'],
];

/** Années citées, avec leur nombre d'occurrences pondéré. */
function anneesSeules(txt, poids = 1) {
  const out = new Map();
  for (const re of MOTIFS_ANNEE_SEULE) {
    re.lastIndex = 0;
    for (const m of txt.matchAll(re)) {
      const n = Number(m[1]);
      if (n < 2005 || n > 2026) continue;
      out.set(n, (out.get(n) ?? 0) + poids);
    }
  }
  return out;
}

/** Types d'épreuve cités, avec leur nombre d'occurrences. */
function typesCites(txt) {
  const out = new Map();
  for (const [re, type] of MOTIFS_TYPE) {
    re.lastIndex = 0;
    const n = [...txt.matchAll(re)].length;
    if (n) out.set(type, n);
  }
  return out;
}

function typeDepuis(fragment) {
  if (/^f$/i.test(fragment)) return 'EVCF';
  if (/^p$/i.test(fragment)) return 'EVCP';
  if (/fondamentales/i.test(fragment)) return 'EVCF';
  if (/pratiques/i.test(fragment)) return 'EVCP';
  return null;
}

/** Détecte les couples (type, année) dans un texte. */
function detecter(txt) {
  const trouves = new Map(); // « EVCF 2019 » -> nombre d'occurrences
  for (const re of MOTIFS) {
    re.lastIndex = 0;
    for (const m of txt.matchAll(re)) {
      const groupes = m.slice(1).filter(Boolean);
      // Le groupe `(19|20)` du motif d'année capture le siècle : on reconstitue
      // l'année depuis le texte apparié plutôt que depuis les groupes.
      const annee = (m[0].match(/\b(20[0-2]\d)\b/) ?? [])[1];
      const type = groupes.map(typeDepuis).find(Boolean);
      const n = Number(annee);
      if (!n || n < 2005 || n > 2026 || !type) continue;
      const cle = type + ' ' + n;
      trouves.set(cle, (trouves.get(cle) ?? 0) + 1);
    }
  }
  return trouves;
}

/** N° de sujet / dossier annoncés dans le texte (« sujet n°3 », « Dossier 1 »). */
function sujetsNumerotes(txt) {
  const nums = new Set();
  for (const m of txt.matchAll(/\b(?:sujet|dossier)\s*(?:n\s*[°º:]?\s*)?(\d{1,2})\b/gi)) {
    const n = Number(m[1]);
    if (n >= 1 && n <= 20) nums.add(n);
  }
  return [...nums].sort((a, b) => a - b);
}

const index = indexSujets();
// Inventaire partiel (--college) : on repart de l'existant pour ne pas perdre
// les collèges déjà analysés.
const resultat = argCollege && existsSync(SORTIE_JSON)
  ? JSON.parse(readFileSync(SORTIE_JSON, 'utf8'))
  : { genereLe: null, colleges: {}, exclusions: [] };
resultat.genereLe = new Date().toISOString().slice(0, 10);
if (argCollege) {
  delete resultat.colleges[argCollege];
  resultat.exclusions = resultat.exclusions.filter((e) => e.dossier !== argCollege);
}

for (const dossier of readdirSync(RACINE)) {
  if (!statSync(join(RACINE, dossier)).isDirectory()) continue;
  if (argCollege && dossier !== argCollege) continue;
  const conf = COLLEGES[dossier];
  if (!conf) {
    resultat.exclusions.push({ dossier, motif: 'Dossier inconnu de scripts/annales/colleges.mjs' });
    continue;
  }
  if (conf.exclu) {
    resultat.exclusions.push({ dossier, fichiers: pdfs(join(RACINE, dossier)).length, motif: conf.exclu });
    continue;
  }

  const entrees = [];
  for (const pdf of pdfs(join(RACINE, dossier))) {
    const rel = enSlash(relative(RACINE, pdf));
    // Les recommandations rangées à côté des annales ne sont pas des annales.
    if (/RECOMMANDATIONS/i.test(rel)) {
      resultat.exclusions.push({ dossier, fichier: rel, motif: 'Document de recommandations, pas une annale' });
      continue;
    }
    const nbPages = pages(pdf);
    const txt = sansPiedDePage(texte(pdf));
    const depuisNom = detecter(rel);
    const depuisTexte = detecter(txt);
    const fusion = new Map(depuisTexte);
    for (const [k, v] of depuisNom) fusion.set(k, (fusion.get(k) ?? 0) + v * 5); // le nom pèse plus

    // Repli : le type et l'année ne sont pas accolés — on les croise.
    if (!fusion.size) {
      const annees = anneesSeules(rel, 10);
      for (const [a, n] of anneesSeules(txt)) annees.set(a, (annees.get(a) ?? 0) + n);
      // Une année du NOM de fichier prime toujours ; sinon on garde celles qui
      // reviennent assez pour ne pas être une simple citation bibliographique.
      const duNom = [...anneesSeules(rel, 1).keys()];
      const retenues = duNom.length ? duNom : [...annees].filter(([, n]) => n >= 3).map(([a]) => a);
      const types = [...typesCites(txt).keys()];
      for (const annee of retenues) {
        for (const type of (types.length ? types : ['?'])) fusion.set(type + ' ' + annee, 1);
      }
    }

    if (!fusion.size) {
      resultat.exclusions.push({
        dossier, fichier: rel, pages: nbPages,
        motif: 'Aucune annale (type EVCF/EVCP + année) détectable : support de cours ou document annexe',
      });
      continue;
    }

    const annales = [...fusion]
      .sort((a, b) => b[1] - a[1])
      .map(([cle, occurrences]) => {
        const [type, anneeS] = cle.split(' ');
        const annee = Number(anneeS);
        const typeIncertain = type === '?';
        return {
          type, annee, occurrences, typeIncertain,
          sujetOfficiel: typeIncertain
            ? (sujetDisponible(index, 'EVCP', annee, conf.codes) ?? sujetDisponible(index, 'EVCF', annee, conf.codes))
            : sujetDisponible(index, type, annee, conf.codes),
          dansLeNom: depuisNom.has(cle),
        };
      });

    entrees.push({
      fichier: rel, pages: nbPages, caracteres: txt.length,
      annales,
      sujetsNumerotes: conf.annalesDansLeContenu ? sujetsNumerotes(txt) : [],
      multiAnnales: annales.length > 1,
    });
  }

  resultat.colleges[dossier] = {
    collegeId: conf.collegeId, nom: conf.nom, codes: conf.codes,
    annalesDansLeContenu: !!conf.annalesDansLeContenu,
    fichiers: entrees,
  };
}

writeFileSync(SORTIE_JSON, JSON.stringify(resultat, null, 2), 'utf8');

// --- rapport lisible ---
const l = [];
l.push('# Inventaire des annales corrigées', '');
l.push('Généré le ' + resultat.genereLe + ' par `scripts/annales/inventaire.mjs`.', '');
l.push('`Sujet officiel` : `doc` = sujet officiel du code spécialité présent dans');
l.push('`Annales/Sujets/` ; `compilation` = présent dans un PDF toutes spécialités ;');
l.push('`—` = année non couverte par le dépôt (annale intégrée depuis le seul corrigé).', '');
for (const [dossier, c] of Object.entries(resultat.colleges)) {
  const codes = 'code' + (c.codes.length > 1 ? 's' : '') + ' ' + c.codes.join(', ');
  l.push('## ' + dossier + ' → ' + c.nom + ' (`' + c.collegeId + '`, ' + codes + ')', '');
  l.push('| Fichier | Pages | Annales détectées | Sujet officiel |', '|---|---|---|---|');
  for (const f of c.fichiers) {
    const a = f.annales.map((x) => (x.typeIncertain ? 'type ? ' : x.type + ' ') + x.annee).join(', ');
    const s = f.annales.map((x) => x.sujetOfficiel ?? '—').join(', ');
    const sn = f.sujetsNumerotes.length ? ' (n° ' + f.sujetsNumerotes.join(', ') + ')' : '';
    l.push('| `' + f.fichier + '` | ' + (f.pages ?? '?') + ' | ' + a + sn + ' | ' + s + ' |');
  }
  l.push('');
}
l.push('## Exclusions', '');
for (const e of resultat.exclusions) {
  const quoi = e.fichier ?? e.dossier;
  const n = e.fichiers ? ' (' + e.fichiers + ' fichiers)' : '';
  l.push('- **' + quoi + '**' + n + ' — ' + e.motif);
}
l.push('');
writeFileSync(SORTIE_MD, l.join('\n'), 'utf8');

const nbFichiers = Object.values(resultat.colleges).reduce((n, c) => n + c.fichiers.length, 0);
console.log(Object.keys(resultat.colleges).length + ' collèges, ' + nbFichiers
  + ' corrigés retenus, ' + resultat.exclusions.length + ' exclusions.');
