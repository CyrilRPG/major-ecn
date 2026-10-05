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
// Corrections qui citent les lettres :
//   - au format « Réponses correctes : A, D » suivi d'une ligne par proposition
//     (« A. Vrai. … », « B : Faux → … », « C, E : Faux. »), la correction est
//     réécrite avec la permutation (en-tête et lignes renumérotés, lignes
//     remises dans l'ordre), à condition que tout concorde avec la clé ;
//   - sinon la question est figée et listée dans le rapport, car la permutation
//     rendrait la correction fausse (annales importées « Réponse : B – E »
//     suivies d'un texte libre, renvois « cf. réponse A »…).
// Les propositions positionnelles (« aucune des propositions précédentes »)
// restent à leur rang. Les séries tirées d'un document source (annales,
// entraînements EVC importés, sessions AREA) gardent l'ordre de ce document :
// elles ne présentent pas le biais des banques générées.
//
// Un collège n'est rééquilibré que si sa répartition est significativement
// inégale (test Q de Cochran, p < 0,01) ; après rééquilibrage, il ne l'est
// plus : le script peut être relancé sans effet, par exemple après l'import
// d'une nouvelle banque (la simulation tient lieu d'audit).
//
// Usage :
//   node scripts/equilibrer-lettres-qcm.mjs --college=col-orthopedie            simulation
//   node scripts/equilibrer-lettres-qcm.mjs --college=col-orthopedie --appliquer
//   node scripts/equilibrer-lettres-qcm.mjs --tous [--appliquer]                 tous les collèges ECN
//   node scripts/equilibrer-lettres-qcm.mjs --restaurer=tmp/equilibrage-lettres/<…>-sauvegarde.json
//   node scripts/equilibrer-lettres-qcm.mjs --rattraper=tmp/equilibrage-lettres/<…>-sauvegarde.json
//     (quelques heures après --appliquer : réponses des séances ouvertes avant la permutation)
// Options : --forcer (rééquilibre même un collège déjà équilibré), --graine=<texte>,
//           --exemples (affiche des corrections renumérotées avant/après).
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
if (!restaurer && !arg('rattraper') && !flag('tous') && collegesDemandes.length === 0) {
  console.error('Usage : node scripts/equilibrer-lettres-qcm.mjs --college=<id>[,<id>] | --tous [--appliquer] [--forcer]');
  console.error('        node scripts/equilibrer-lettres-qcm.mjs --restaurer=<sauvegarde.json> | --rattraper=<sauvegarde.json>');
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
// Séries importées d'un document source, dont l'ordre fait foi.
const SERIE_IMPORTEE = /^Annales?\b|\bEVC\s*\d{4}\b|^Entraînement n°|\bAREA (?:Session|Révisions)\b|Révision Gériatrie/i;

// Propositions dont le sens dépend de leur position dans la liste.
const POSITIONNELLE = /(?:aucune|toutes?|tous|l['’]ensemble)\s+(?:les\s+|des\s+)?(?:propositions|réponses)|(?:propositions?|réponses?)\s+(?:ci-dessus|précédentes?|suivantes?|proposées)|tout(?:es)?\s+ce\s+qui\s+précède/i;

// Correction « Réponses correctes : A, D » + une ligne par proposition ou
// groupe de propositions (« A. Vrai. … », « B : Faux → … », « C, E : Faux. »).
// Renvoie la fonction de réécriture, ou null si quoi que ce soit ne concorde
// pas exactement avec la clé : la question est alors figée.
const ENTETE = /^(\s*Réponses?(?:\s+(?:correctes?|exactes?|justes?))?\s*:\s*)([A-E](?:\s*,\s*[A-E])*)(\.?[ \t]*\n)/;
const LIGNE = /^([A-E](?:\s*,\s*[A-E])*)(\s*[.:]\s*)(Vrai|Faux)(?![A-Za-zÀ-ÿ])(.*)$/;
const RENVOI = new RegExp(`(?:[Pp]ropositions?|[Rr]éponses?|[Ii]tems?|cf\\.?|[Vv]oir)\\s+[A-E](?![${MOT}])`);
function reecritureCorrection(correction, lettres, justes) {
  const source = String(correction ?? '');
  const entete = source.match(ENTETE);
  if (!entete || entete[2].replace(/[\s,]/g, '') !== justes) return null;
  const lignes = source.slice(entete[0].length).replace(/\n+$/, '').split('\n').map((ligne) => ligne.match(LIGNE));
  if (lignes.length === 0 || lignes.some((ligne) => !ligne)) return null;
  const vues = [];
  for (const [, groupe, , verdict, reste] of lignes) {
    for (const lettre of groupe.replace(/[\s,]/g, '')) {
      if ((verdict === 'Vrai') !== justes.includes(lettre)) return null;
      vues.push(lettre);
    }
    if (citeUneLettre(reste) || RENVOI.test(reste)) return null;
  }
  if ([...vues].sort().join('') !== lettres) return null;
  return (permutation) => {
    const liste = (groupe) => [...groupe.replace(/[\s,]/g, '')].map((lettre) => permutation[lettre]).sort();
    const corps = lignes
      .map(([, groupe, separateur, verdict, reste]) => ({ lettres: liste(groupe), separateur, verdict, reste }))
      .sort((a, b) => a.lettres[0].localeCompare(b.lettres[0]))
      .map((ligne) => `${ligne.lettres.join(', ')}${ligne.separateur}${ligne.verdict}${ligne.reste}`);
    return `${entete[1]}${liste(entete[2]).join(', ')}${entete[3]}${corps.join('\n')}`;
  };
}

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
// Test Q de Cochran (réponses binaires, cinq lettres appariées par question),
// seuil du khi-deux à 4 degrés de liberté pour p = 0,01. Un khi-deux simple
// sur les comptes par lettre sous-estime l'écart quand les taux sont élevés.
const Q_COCHRAN_1_POURCENT = 13.277;
function cochran(questions) {
  const k = LETTRES.length;
  const colonnes = Array(k).fill(0);
  let total = 0;
  let carres = 0;
  for (const question of questions) {
    total += question.justes.length;
    carres += question.justes.length ** 2;
    for (const lettre of question.justes) colonnes[LETTRES.indexOf(lettre)] += 1;
  }
  const denominateur = k * total - carres;
  if (denominateur === 0) return 0;
  return ((k - 1) * (k * colonnes.reduce((sum, value) => sum + value ** 2, 0) - total ** 2)) / denominateur;
}
function repartition(questions) {
  // Questions à cinq propositions : pourcentage de questions où chaque lettre est juste.
  const cinq = questions.filter((question) => question.lettres === LETTRES);
  const justes = [...LETTRES].map((lettre) => cinq.filter((question) => question.justes.includes(lettre)).length);
  return { questions: cinq.length, justes, pourcents: justes.map((value) => (cinq.length ? Math.round((1000 * value) / cinq.length) / 10 : 0)) };
}
const desequilibre = (questions) => cochran(questions.filter((question) => question.lettres === LETTRES)) > Q_COCHRAN_1_POURCENT;

// ─── Plan de permutation d'un cours ──────────────────────────────────────────
// Les questions mobiles sont groupées par (lettres permutables, nombre de
// justes). Dans chaque groupe, toutes les combinaisons possibles sont servies
// à parts égales ; le reliquat est attribué aux lettres les moins servies du
// cours (questions figées comprises), puis l'attribution est tirée au hasard.
function planifierCours(coursId, questions) {
  const random = generateur(`${graine}:${coursId}`);
  const servies = Object.fromEntries([...LETTRES].map((lettre) => [lettre, 0]));
  const groupes = new Map();
  // Ordre stable : le plan ne dépend que de la graine et du cours, pas de la portée lue.
  for (const question of [...questions].sort((a, b) => a.id.localeCompare(b.id))) {
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
        permutations.push(question.reecriture
          ? { question_id: question.id, lettres, correction_generale: question.reecriture(lettres), correction_avant: question.correction }
          : { question_id: question.id, lettres });
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
    series.push(...await toutesLesLignes(() => db.from('qcm_series').select('id, cours_id, label').in('cours_id', lot).order('id'), 'séries'));
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
  const seriesImportees = new Set(series.filter((row) => SERIE_IMPORTEE.test(row.label ?? '')).map((row) => row.id));
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
    const justes = propres.filter((item) => item.is_correct).map((item) => item.lettre).join('');
    const citeAilleurs = [question.enonce, question.commentaire_enseignant, ...propres.flatMap((item) => [item.enonce, item.justification])].some(citeUneLettre);
    const citeCorrection = citeUneLettre(question.correction_generale);
    const reecriture = eligible && citeCorrection && !citeAilleurs ? reecritureCorrection(question.correction_generale, lettres, justes) : null;
    const cite = citeAilleurs || (citeCorrection && !reecriture);
    const importee = seriesImportees.has(question.serie_id);
    return {
      id: question.id,
      coursId,
      college: collegeParCours.get(coursId),
      lettres,
      justes,
      fixes: propres.filter((item) => POSITIONNELLE.test(texte(item.enonce))).map((item) => item.lettre),
      eligible,
      cite,
      correction: question.correction_generale,
      reecriture,
      importee,
      mobile: eligible && !cite && !importee,
    };
  });
}

async function tentativesDesQuestions(questionIds) {
  const ids = [];
  for (const lot of paquets(questionIds, 150)) {
    ids.push(...(await toutesLesLignes(() => db.from('qcm_attempts').select('id').in('question_id', lot).order('id'), 'tentatives')).map((row) => row.id));
  }
  return ids;
}

// Applique les permutations par lots. Avec une sauvegarde, chaque lot y est
// consigné dès qu'il est appliqué (permutations, horaires, tentatives déjà
// converties) : une restauration ne défait que ce qui a été fait, et
// --rattraper sait quelles tentatives restent à convertir.
async function appliquerPermutations(permutations, sauvegarde = null) {
  const bilan = { questions: 0, items: 0, corrections: 0, tentatives: 0, evaluations: 0, constats: 0 };
  const lots = paquets(permutations, LOT_APPLICATION);
  for (const [index, lot] of lots.entries()) {
    // correction_avant ne sert qu'à la sauvegarde : il ne part pas en base.
    const envoi = lot.map(({ question_id, lettres, correction_generale }) => (
      correction_generale === undefined ? { question_id, lettres } : { question_id, lettres, correction_generale }));
    const debut = new Date().toISOString();
    const resultat = await must(db.rpc('permuter_lettres_qcm', { p_permutations: envoi }), `lot ${index + 1}`);
    for (const cle of Object.keys(bilan)) bilan[cle] += Number(resultat?.[cle] ?? 0);
    if (sauvegarde) {
      const tentatives = await tentativesDesQuestions(lot.map((permutation) => permutation.question_id));
      sauvegarde.contenu.lots.push({ debut, fin: new Date().toISOString(), permutations: lot, tentatives });
      writeFileSync(sauvegarde.fichier, JSON.stringify(sauvegarde.contenu));
    }
    process.stdout.write(`\r  lot ${index + 1}/${lots.length} appliqué`);
  }
  process.stdout.write('\n');
  return bilan;
}

// ─── Rattrapage ──────────────────────────────────────────────────────────────
// Une séance ouverte avant la permutation a chargé les anciennes lettres : ses
// réponses enregistrées ensuite (web, ou mobile synchronisé plus tard) sont
// converties ici, une seule fois chacune. À relancer quelques heures après.
async function rattraperTentatives() {
  const fichier = resolve(arg('rattraper'));
  const sauvegarde = JSON.parse(readFileSync(fichier, 'utf8'));
  let converties = 0;
  for (const lot of sauvegarde.lots ?? []) {
    const connues = new Set(lot.tentatives);
    const permutationParQuestion = new Map(lot.permutations.map((permutation) => [permutation.question_id, permutation.lettres]));
    for (const questionIds of paquets([...permutationParQuestion.keys()], 150)) {
      const tentatives = await toutesLesLignes(() => db.from('qcm_attempts')
        .select('id, question_id, selected_items, qcm_sessions!inner(started_at)')
        .in('question_id', questionIds).lt('qcm_sessions.started_at', lot.debut).order('id'), 'tentatives');
      for (const tentative of tentatives) {
        if (connues.has(tentative.id)) continue;
        connues.add(tentative.id);
        if (!Array.isArray(tentative.selected_items) || tentative.selected_items.length === 0) continue;
        const lettres = permutationParQuestion.get(tentative.question_id);
        const selection = tentative.selected_items.map((lettre) => lettres[lettre] ?? lettre).sort();
        await must(db.from('qcm_attempts').update({ selected_items: selection }).eq('id', tentative.id), 'tentative');
        converties += 1;
      }
    }
    lot.tentatives = [...connues];
  }
  writeFileSync(fichier, JSON.stringify(sauvegarde));
  console.log(`${converties} tentative(s) enregistrée(s) avec les anciennes lettres, converties.`);
}

// ─── Restauration ────────────────────────────────────────────────────────────
async function restaurerSauvegarde() {
  const sauvegarde = JSON.parse(readFileSync(resolve(restaurer), 'utf8'));
  const appliquees = sauvegarde.lots ? sauvegarde.lots.flatMap((lot) => lot.permutations) : sauvegarde.permutations;
  const inverses = appliquees.map(({ question_id, lettres, correction_avant }) => ({
    question_id,
    lettres: Object.fromEntries(Object.entries(lettres).map(([ancienne, nouvelle]) => [nouvelle, ancienne])),
    ...(correction_avant !== undefined ? { correction_generale: correction_avant } : {}),
  }));
  console.log(`Restauration de ${inverses.length} questions (${sauvegarde.date}, ${sauvegarde.colleges.join(', ')})`);
  console.log(await appliquerPermutations(inverses));
}

// ─── Plan ────────────────────────────────────────────────────────────────────
async function equilibrer() {
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
    // Le test porte sur les banques permutables : les séries importées gardent leur ordre.
    const aTraiter = forcer || desequilibre(liste.filter((question) => !question.importee));
    const importees = liste.filter((question) => question.eligible && question.importee);
    const figees = liste.filter((question) => question.eligible && question.cite && !question.importee);
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
    const reecrites = propres.filter((permutation) => permutation.correction_generale !== undefined);
    permutations.push(...propres);
    rapport.push({
      college,
      questions: liste.length,
      traite: aTraiter,
      q: Math.round(cochran(liste.filter((question) => question.lettres === LETTRES && !question.importee)) * 10) / 10,
      permutees: propres.length,
      correctionsReecrites: reecrites.map((permutation) => permutation.question_id),
      importees: importees.length,
      figees: figees.map((question) => question.id),
      horsPerimetre: horsPerimetre.length,
      positionnelles: positionnelles.length,
      avant,
      apres,
    });
    const statut = aTraiter ? `, ${propres.length} permutés` : liste.some((question) => question.mobile) ? ', déjà équilibré' : ', rien à permuter';
    console.log(`\n${college} — ${liste.length} QCM${statut}`
      + `${reecrites.length ? ` dont ${reecrites.length} avec correction renumérotée` : ''}`
      + `${importees.length ? `, ${importees.length} de séries importées (ordre du document source)` : ''}`
      + `${figees.length ? `, ${figees.length} figés (correction qui cite les lettres)` : ''}`
      + `${horsPerimetre.length ? `, ${horsPerimetre.length} hors périmètre (≠ 2 à 5 propositions A…)` : ''}`
      + `${positionnelles.length ? `, ${positionnelles.length} avec proposition positionnelle laissée en place` : ''}`);
    console.log(`  avant  ${fmt(avant.pourcents)}   Q de Cochran ${rapport.at(-1).q} (seuil ${Q_COCHRAN_1_POURCENT}, hors séries importées)`);
    if (aTraiter) console.log(`  après  ${fmt(apres.pourcents)}`);
  }

  const horodatage = new Date().toISOString().replace(/[:.]/g, '-');
  const dossier = join(ROOT, 'tmp', 'equilibrage-lettres');
  mkdirSync(dossier, { recursive: true });
  const portee = flag('tous') ? 'tous' : colleges.join('+');
  writeFileSync(join(dossier, `${horodatage}-${portee}-rapport.json`), JSON.stringify({ date: horodatage, graine, appliquer, rapport }, null, 2));

  if (flag('exemples')) {
    for (const permutation of permutations.filter((entry) => entry.correction_generale !== undefined).slice(0, 4)) {
      console.log(`\n— ${permutation.question_id} ${JSON.stringify(permutation.lettres)}\n${permutation.correction_avant}\n  ⇣\n${permutation.correction_generale}`);
    }
  }
  console.log(`\n${permutations.length} questions à permuter.`);
  if (!appliquer || permutations.length === 0) {
    if (!appliquer) console.log('Simulation : rien n’a été écrit. Relancer avec --appliquer.');
    return;
  }

  const fichier = join(dossier, `${horodatage}-${portee}-sauvegarde.json`);
  const contenu = { date: horodatage, colleges, graine, lots: [] };
  writeFileSync(fichier, JSON.stringify(contenu));
  console.log(`Sauvegarde (pour --restaurer et --rattraper) : ${fichier}`);
  console.log(await appliquerPermutations(permutations, { fichier, contenu }));
}

if (restaurer) await restaurerSauvegarde();
else if (arg('rattraper')) await rattraperTentatives();
else await equilibrer();
