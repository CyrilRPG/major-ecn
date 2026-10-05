#!/usr/bin/env node
// Équilibre la position des propositions justes des QCM : dans un collège,
// chaque lettre doit avoir la même probabilité d'être juste, et une question
// à k réponses justes doit pouvoir porter n'importe laquelle des combinaisons
// possibles (les banques générées plaçaient les réponses justes en tête : en
// orthopédie, A juste dans 49 % des questions, E dans 28 %).
//
// Aucun contenu n'est réécrit : les propositions sont permutées. Chacune garde
// son identifiant, son énoncé, sa justification et sa valeur de vérité. La
// permutation est appliquée côté base par public.permuter_lettres_qcm, qui
// convertit dans la même transaction l'historique des élèves (tentatives,
// évaluations du planificateur, constats d'audit).
//
// Restent à leur place :
//   - les propositions positionnelles (« aucune des propositions précédentes ») ;
//   - les questions dont un texte cite les propositions par leur lettre
//     (« Réponses : A, C », « B. Faux », « (cf. D) ») : elles sont figées et
//     listées dans le rapport, car la permutation rendrait la correction fausse.
//
// Un collège n'est rééquilibré que si sa répartition est significativement
// inégale (khi-deux, p < 0,01) ; après rééquilibrage, il ne l'est plus : le
// script peut être relancé sans effet.
//
// Usage :
//   node scripts/equilibrer-lettres-qcm.mjs --college=col-orthopedie            simulation
//   node scripts/equilibrer-lettres-qcm.mjs --college=col-orthopedie --appliquer
//   node scripts/equilibrer-lettres-qcm.mjs --tous [--appliquer]                 tous les collèges ECN
//   node scripts/equilibrer-lettres-qcm.mjs --restaurer=tmp/equilibrage-lettres/<fichier>.json
// Options : --forcer (rééquilibre même un collège déjà équilibré), --graine=<texte>.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const ROOT = resolve(import.meta.dirname, '..');
const LETTRES = 'ABCDE';
const LOT_APPLICATION = 1000;

// ─── Arguments ───────────────────────────────────────────────────────────────
const arg = (name) => process.argv.find((value) => value.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const flag = (name) => process.argv.includes(`--${name}`);
const appliquer = flag('appliquer');
const forcer = flag('forcer');
const graine = arg('graine') ?? 'equilibrage-lettres-v1';
const restaurer = arg('restaurer');
const collegesDemandes = (arg('college') ?? '').split(',').map((value) => value.trim()).filter(Boolean);
if (!restaurer && !flag('tous') && collegesDemandes.length === 0) {
  console.error('Usage : node scripts/equilibrer-lettres-qcm.mjs --college=<id>[,<id>] | --tous [--appliquer] [--forcer]');
  console.error('        node scripts/equilibrer-lettres-qcm.mjs --restaurer=<sauvegarde.json>');
  process.exit(1);
}

config({ path: join(ROOT, '.env.local') });
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const must = async (query, label) => {
  const result = await query;
  if (result.error) throw new Error(`${label} : ${result.error.message}`);
  return result.data ?? [];
};
const paquets = (list, size) => Array.from({ length: Math.ceil(list.length / size) }, (_, index) => list.slice(index * size, index * size + size));
async function toutesLesLignes(build, label) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const page = await must(build().range(from, from + 999), label);
    rows.push(...page);
    if (page.length < 1000) return rows;
  }
}

// ─── Détection ───────────────────────────────────────────────────────────────
const MOT = "A-Za-zÀ-ÿ0-9'’";
const texte = (value) => String(value ?? '')
  .replace(/<br\s*\/?>/gi, '\n').replace(/<\/(?:p|li|div)>/gi, '\n').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
// Citations des propositions par leur lettre (sensible à la casse : « A » seul).
const CITATIONS = [
  new RegExp(`(?:[Pp]ropositions?|[Rr]éponses?|[Ii]tems?|[Ll]ettres?|[Cc]hoix)(?:\\s+(?:justes?|exactes?|vraies?|fausses?|correctes?|inexactes?|attendues?|retenues?))?\\s*:?\\s*[A-K]+(?![${MOT}])`),
  /(?:^|\n)\s*[•\-–—]?\s*[A-K]\s*[:.)–—-]\s*(?:vrai|faux|exact|inexact|juste|correct|incorrect)/i,
  new RegExp(`\\((?:cf\\.?|voir)\\s*[A-K](?:\\s*(?:,|et|ou)\\s*[A-K])*\\)`),
  new RegExp(`(?:^|\\n)\\s*[A-K](?:\\s*,\\s*[A-K])+\\s*(?:→|:)`),
];
const citeUneLettre = (value) => {
  const plain = texte(value);
  return CITATIONS.some((pattern) => pattern.test(plain));
};
// Propositions dont le sens dépend de leur position dans la liste.
const POSITIONNELLE = /(?:aucune|toutes?|tous|l['’]ensemble)\s+(?:les\s+|des\s+)?(?:propositions|réponses)|(?:propositions?|réponses?)\s+(?:ci-dessus|précédentes?|suivantes?|proposées)|tout(?:es)?\s+ce\s+qui\s+précède/i;

// ─── Hasard reproductible ────────────────────────────────────────────────────
function hacher(value) {
  let hash = 2166136261;
  for (const char of value) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}
function generateur(seed) {
  let state = hacher(seed);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function melanger(list, random) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}
function combinaisons(lettres, taille, debut = 0, prefixe = '', sortie = []) {
  if (prefixe.length === taille) { sortie.push(prefixe); return sortie; }
  for (let index = debut; index <= lettres.length - (taille - prefixe.length); index += 1) {
    combinaisons(lettres, taille, index + 1, prefixe + lettres[index], sortie);
  }
  return sortie;
}

// ─── Statistique ─────────────────────────────────────────────────────────────
// Seuils du khi-deux à p = 0,01 selon le nombre de degrés de liberté.
const KHI2_1_POURCENT = { 1: 6.635, 2: 9.21, 3: 11.345, 4: 13.277 };
function khiDeux(compteurs) {
  const total = compteurs.reduce((sum, value) => sum + value, 0);
  if (total === 0) return 0;
  const attendu = total / compteurs.length;
  return compteurs.reduce((sum, value) => sum + ((value - attendu) ** 2) / attendu, 0);
}
function repartition(questions) {
  // Questions à cinq propositions : pourcentage de questions où chaque lettre est juste.
  const cinq = questions.filter((question) => question.lettres === LETTRES);
  const justes = [...LETTRES].map((lettre) => cinq.filter((question) => question.justes.includes(lettre)).length);
  return { questions: cinq.length, justes, pourcents: justes.map((value) => (cinq.length ? Math.round((1000 * value) / cinq.length) / 10 : 0)) };
}
const desequilibre = (questions) => {
  const { justes } = repartition(questions);
  return khiDeux(justes) > KHI2_1_POURCENT[4];
};

// ─── Plan de permutation d'un cours ──────────────────────────────────────────
// Les questions mobiles sont groupées par (lettres permutables, nombre de
// justes). Dans chaque groupe, toutes les combinaisons possibles sont servies
// à parts égales ; le reliquat est attribué aux lettres les moins servies du
// cours (questions figées comprises), puis l'attribution est tirée au hasard.
function planifierCours(coursId, questions) {
  const random = generateur(`${graine}:${coursId}`);
  const servies = Object.fromEntries([...LETTRES].map((lettre) => [lettre, 0]));
  const groupes = new Map();
  for (const question of questions) {
    if (!question.mobile) {
      for (const lettre of question.justes) servies[lettre] += 1;
      continue;
    }
    const fixes = new Set(question.fixes);
    for (const lettre of question.justes) if (fixes.has(lettre)) servies[lettre] += 1;
    const permutables = [...question.lettres].filter((lettre) => !fixes.has(lettre)).join('');
    const justesPermutables = [...question.justes].filter((lettre) => !fixes.has(lettre)).length;
    if (justesPermutables === 0 || justesPermutables === permutables.length) continue;
    const cle = `${permutables}|${justesPermutables}`;
    if (!groupes.has(cle)) groupes.set(cle, { permutables, justes: justesPermutables, questions: [] });
    groupes.get(cle).questions.push(question);
  }

  const permutations = [];
  for (const cle of [...groupes.keys()].sort()) {
    const groupe = groupes.get(cle);
    const possibles = combinaisons(groupe.permutables, groupe.justes);
    const tours = Math.floor(groupe.questions.length / possibles.length);
    const cibles = possibles.flatMap((combinaison) => Array(tours).fill(combinaison));
    for (const combinaison of cibles) for (const lettre of combinaison) servies[lettre] += 1;
    const restantes = melanger(possibles, random);
    for (let reste = groupe.questions.length - cibles.length; reste > 0; reste -= 1) {
      restantes.sort((a, b) => [...a].reduce((sum, lettre) => sum + servies[lettre], 0) - [...b].reduce((sum, lettre) => sum + servies[lettre], 0));
      const combinaison = restantes.shift();
      cibles.push(combinaison);
      for (const lettre of combinaison) servies[lettre] += 1;
    }
    const attribution = melanger(cibles, random);
    melanger(groupe.questions, random).forEach((question, index) => {
      const cible = attribution[index];
      const fixes = new Set(question.fixes);
      const permutables = [...question.lettres].filter((lettre) => !fixes.has(lettre));
      const justes = permutables.filter((lettre) => question.justes.includes(lettre));
      const fausses = permutables.filter((lettre) => !question.justes.includes(lettre));
      const arriveeJustes = [...cible];
      const arriveeFausses = permutables.filter((lettre) => !cible.includes(lettre));
      const lettres = Object.fromEntries([...question.lettres].map((lettre) => [lettre, lettre]));
      justes.forEach((lettre, rang) => { lettres[lettre] = arriveeJustes[rang]; });
      fausses.forEach((lettre, rang) => { lettres[lettre] = arriveeFausses[rang]; });
      if (Object.entries(lettres).some(([ancienne, nouvelle]) => ancienne !== nouvelle)) {
        permutations.push({ question_id: question.id, lettres });
      }
      question.justesApres = [...question.justes].map((lettre) => lettres[lettre]).sort().join('');
    });
  }
  return permutations;
}

// ─── Lecture ─────────────────────────────────────────────────────────────────
async function lireColleges(colleges) {
  const cours = await toutesLesLignes(() => db.from('cours').select('id, matiere_id, order_index, titre').in('matiere_id', colleges).order('id'), 'cours');
  const series = [];
  for (const lot of paquets(cours.map((row) => row.id), 100)) {
    series.push(...await toutesLesLignes(() => db.from('qcm_series').select('id, cours_id').in('cours_id', lot).order('id'), 'séries'));
  }
  const questions = [];
  for (const lot of paquets(series.map((row) => row.id), 100)) {
    questions.push(...await toutesLesLignes(() => db.from('qcm_questions')
      .select('id, serie_id, format, enonce, correction_generale, commentaire_enseignant').in('serie_id', lot).order('id'), 'questions'));
  }
  const qcm = questions.filter((question) => (question.format ?? 'qcm') === 'qcm');
  const items = [];
  const file = paquets(qcm.map((row) => row.id), 150);
  await Promise.all(Array.from({ length: 6 }, async () => {
    for (let lot = file.shift(); lot; lot = file.shift()) {
      items.push(...await toutesLesLignes(() => db.from('qcm_items')
        .select('id, question_id, lettre, enonce, is_correct, justification').in('question_id', lot).order('id'), 'propositions'));
    }
  }));
  const coursParSerie = new Map(series.map((row) => [row.id, row.cours_id]));
  const collegeParCours = new Map(cours.map((row) => [row.id, row.matiere_id]));
  const itemsParQuestion = new Map();
  for (const item of items) {
    if (!itemsParQuestion.has(item.question_id)) itemsParQuestion.set(item.question_id, []);
    itemsParQuestion.get(item.question_id).push(item);
  }
  return qcm.map((question) => {
    const propres = (itemsParQuestion.get(question.id) ?? []).sort((a, b) => a.lettre.localeCompare(b.lettre));
    const lettres = propres.map((item) => item.lettre).join('');
    const coursId = coursParSerie.get(question.serie_id);
    const eligible = propres.length >= 2 && propres.length <= 5 && lettres === LETTRES.slice(0, propres.length);
    const cite = [question.enonce, question.correction_generale, question.commentaire_enseignant, ...propres.flatMap((item) => [item.enonce, item.justification])].some(citeUneLettre);
    return {
      id: question.id,
      coursId,
      college: collegeParCours.get(coursId),
      lettres,
      justes: propres.filter((item) => item.is_correct).map((item) => item.lettre).join(''),
      fixes: propres.filter((item) => POSITIONNELLE.test(texte(item.enonce))).map((item) => item.lettre),
      eligible,
      cite,
      mobile: eligible && !cite,
    };
  });
}

async function appliquerPermutations(permutations) {
  const bilan = { questions: 0, items: 0, tentatives: 0, evaluations: 0, constats: 0 };
  for (const [index, lot] of paquets(permutations, LOT_APPLICATION).entries()) {
    const resultat = await must(db.rpc('permuter_lettres_qcm', { p_permutations: lot }), `lot ${index + 1}`);
    for (const cle of Object.keys(bilan)) bilan[cle] += Number(resultat?.[cle] ?? 0);
    process.stdout.write(`\r  lot ${index + 1}/${Math.ceil(permutations.length / LOT_APPLICATION)} appliqué`);
  }
  process.stdout.write('\n');
  return bilan;
}

// ─── Restauration ────────────────────────────────────────────────────────────
if (restaurer) {
  const sauvegarde = JSON.parse(readFileSync(resolve(restaurer), 'utf8'));
  const inverses = sauvegarde.permutations.map(({ question_id, lettres }) => ({
    question_id,
    lettres: Object.fromEntries(Object.entries(lettres).map(([ancienne, nouvelle]) => [nouvelle, ancienne])),
  }));
  console.log(`Restauration de ${inverses.length} questions (${sauvegarde.date}, ${sauvegarde.colleges.join(', ')})`);
  console.log(await appliquerPermutations(inverses));
  process.exit(0);
}

// ─── Plan ────────────────────────────────────────────────────────────────────
let colleges = collegesDemandes;
if (flag('tous')) {
  // Collèges de la plateforme ECN. Les collèges col-odonto-* appartiennent à
  // Major Odonto, les identifiants exam-* et pha-* à d'autres plateformes.
  const matieres = await toutesLesLignes(() => db.from('matieres').select('id').like('id', 'col-%').order('id'), 'matières');
  colleges = matieres.map((row) => row.id).filter((id) => !id.startsWith('col-odonto-'));
}

const questions = await lireColleges(colleges);
const parCollege = new Map();
for (const question of questions) {
  if (!parCollege.has(question.college)) parCollege.set(question.college, []);
  parCollege.get(question.college).push(question);
}

const permutations = [];
const rapport = [];
const fmt = (values) => [...LETTRES].map((lettre, index) => `${lettre} ${String(values[index]).padStart(4)} %`).join('  ');
for (const college of [...parCollege.keys()].sort()) {
  const liste = parCollege.get(college);
  const avant = repartition(liste);
  const aTraiter = forcer || desequilibre(liste);
  const figees = liste.filter((question) => question.eligible && question.cite);
  const horsPerimetre = liste.filter((question) => !question.eligible);
  const positionnelles = liste.filter((question) => question.mobile && question.fixes.length > 0);
  for (const question of liste) question.justesApres = question.justes;
  const propres = [];
  if (aTraiter) {
    const parCours = new Map();
    for (const question of liste) {
      if (!parCours.has(question.coursId)) parCours.set(question.coursId, []);
      parCours.get(question.coursId).push(question);
    }
    for (const coursId of [...parCours.keys()].sort()) propres.push(...planifierCours(coursId, parCours.get(coursId)));
  }
  const apres = repartition(liste.map((question) => ({ ...question, justes: question.justesApres })));
  permutations.push(...propres);
  rapport.push({
    college,
    questions: liste.length,
    traite: aTraiter,
    permutees: propres.length,
    figees: figees.map((question) => question.id),
    horsPerimetre: horsPerimetre.length,
    positionnelles: positionnelles.length,
    avant,
    apres,
  });
  console.log(`\n${college} — ${liste.length} QCM${aTraiter ? `, ${propres.length} permutés` : ', déjà équilibré'}`
    + `${figees.length ? `, ${figees.length} figés (correction qui cite les lettres)` : ''}`
    + `${horsPerimetre.length ? `, ${horsPerimetre.length} hors périmètre (≠ 2 à 5 propositions A…)` : ''}`
    + `${positionnelles.length ? `, ${positionnelles.length} avec proposition positionnelle laissée en place` : ''}`);
  console.log(`  avant  ${fmt(avant.pourcents)}`);
  if (aTraiter) console.log(`  après  ${fmt(apres.pourcents)}`);
}

const horodatage = new Date().toISOString().replace(/[:.]/g, '-');
const dossier = join(ROOT, 'tmp', 'equilibrage-lettres');
mkdirSync(dossier, { recursive: true });
const portee = flag('tous') ? 'tous' : colleges.join('+');
writeFileSync(join(dossier, `${horodatage}-${portee}-rapport.json`), JSON.stringify({ date: horodatage, graine, appliquer, rapport }, null, 2));

console.log(`\n${permutations.length} questions à permuter.`);
if (!appliquer || permutations.length === 0) {
  if (!appliquer) console.log('Simulation : rien n’a été écrit. Relancer avec --appliquer.');
  process.exit(0);
}

const fichierSauvegarde = join(dossier, `${horodatage}-${portee}-sauvegarde.json`);
writeFileSync(fichierSauvegarde, JSON.stringify({ date: horodatage, colleges, graine, permutations }));
console.log(`Sauvegarde (pour --restaurer) : ${fichierSauvegarde}`);
console.log(await appliquerPermutations(permutations));
