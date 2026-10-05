// Règles de qualité d'une banque de cours (16 séries : 8 QCM × 5 et 8 DP × 7
// questions à 5 propositions, 100 à 120 flashcards), appliquées aux banques
// d'orthopédie régénérées le 05/10/2026 (scripts/banques/orthopedie/).
//
//   node scripts/banques/valider-banque-cours.mjs <dossier>   series-01.json … series-16.json + flashcards.json,
//                                                              assemblés dans <dossier>/chapter.json si valides
//   node scripts/banques/valider-banque-cours.mjs <banque.json> banque déjà assemblée (contrôle seul)
// Code de sortie 1 si une règle n'est pas respectée.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dir = resolve(process.argv[2] ?? '.');
const erreurs = [];
const err = (m) => erreurs.push(m);
const MOT = "A-Za-zÀ-ÿ0-9'’";
const CITATIONS = [
  new RegExp(`(?:[Pp]ropositions?|[Rr]éponses?|[Ii]tems?|[Ll]ettres?|[Cc]hoix)(?:\\s+(?:justes?|exactes?|vraies?|fausses?|correctes?|inexactes?|attendues?|retenues?))?\\s*:?\\s*[A-K]+(?![${MOT}])`),
  /(?:^|\n)\s*[•\-–—]?\s*[A-K]\s*[:.)–—-]\s*(?:vrai|faux|exact|inexact|juste|correct|incorrect)/i,
  new RegExp(`\\((?:cf\\.?|voir)\\s*[A-K](?:\\s*(?:,|et|ou)\\s*[A-K])*\\)`),
];
const POSITIONNELLE = /(?:aucune|toutes?|tous|l['’]ensemble)\s+(?:les\s+|des\s+)?(?:propositions|réponses)|(?:propositions?|réponses?)\s+(?:ci-dessus|précédentes?|suivantes?|proposées)|tout(?:es)?\s+ce\s+qui\s+précède/i;
const INTERDITS = [
  [/\bselon (?:le|ce) (?:texte|chapitre|cours|document|article)\b/i, 'renvoi au texte source'],
  [/\b(?:le|ce) (?:texte|chapitre|document|article) (?:indique|précise|rapporte|mentionne)/i, 'renvoi au texte source'],
  [/(?:^|[.!?]\s+)Nous\s/, '« Nous » de l’auteur source'],
  [/\(Fig\.|\bfig\.\s*\d/i, 'renvoi à une figure'],
  [/cette donnée (?:ne )?répond|est applicable dans/i, 'justification générique'],
  [/\bquestion (?:précédente|suivante)\b/i, 'renvoi à une autre question'],
];
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const texte = (s) => String(s ?? '').replace(/<[^>]+>/g, ' ');
const verifierTexte = (s, ou) => {
  const t = texte(s);
  if (CITATIONS.some((re) => re.test(t))) err(`${ou} : cite une proposition par sa lettre`);
  for (const [re, quoi] of INTERDITS) if (re.test(t)) err(`${ou} : ${quoi}`);
};

const fichierBanque = dir.endsWith('.json') ? JSON.parse(readFileSync(dir, 'utf8')) : null;
const series = fichierBanque ? fichierBanque.series.map((s, i) => ({ n: i + 1, ...s })) : [];
for (let n = 1; n <= 16 && !fichierBanque; n += 1) {
  const f = join(dir, `series-${String(n).padStart(2, '0')}.json`);
  if (!existsSync(f)) { err(`fichier manquant : series-${String(n).padStart(2, '0')}.json`); continue; }
  let s;
  try { s = JSON.parse(readFileSync(f, 'utf8')); } catch (e) { err(`series-${n} : JSON invalide (${e.message})`); continue; }
  series.push({ n, ...s });
}

const cardinalites = [0, 0, 0, 0, 0, 0];
const enonces = new Map();
const propositions = new Map();
for (const s of series) {
  const ou = `série ${s.n}`;
  const dp = s.n > 8;
  const attendu = dp ? 7 : 5;
  const rang = dp ? s.n - 8 : s.n;
  if (!new RegExp(`^${dp ? 'DP' : 'QCM'} ${rang} — \\S`).test(s.label ?? '')) err(`${ou} : libellé attendu « ${dp ? 'DP' : 'QCM'} ${rang} — <thème> », reçu « ${s.label} »`);
  if (/entra[iî]nement/i.test(s.label ?? '')) err(`${ou} : « entraînement » interdit dans le libellé`);
  if ((s.kind ?? '') !== (dp ? 'dp' : 'qcm')) err(`${ou} : kind attendu ${dp ? 'dp' : 'qcm'}`);
  if (dp && texte(s.vignette).trim().length < 300) err(`${ou} : vignette de DP < 300 caractères`);
  if (!dp && s.vignette) err(`${ou} : une série QCM n'a pas de vignette`);
  if (dp) verifierTexte(s.vignette, `${ou} vignette`);
  if (!Array.isArray(s.questions) || s.questions.length !== attendu) { err(`${ou} : ${attendu} questions attendues`); continue; }
  const cardSerie = [];
  s.questions.forEach((q, qi) => {
    const oq = `${ou} Q${qi + 1}`;
    const e = texte(q.enonce).trim();
    if (e.length < 30) err(`${oq} : énoncé trop court`);
    if (!/\?\s*$/.test(e)) err(`${oq} : l'énoncé doit finir par « ? »`);
    if (enonces.has(norm(e))) err(`${oq} : énoncé identique à ${enonces.get(norm(e))}`); else enonces.set(norm(e), oq);
    verifierTexte(q.enonce, `${oq} énoncé`);
    if (texte(q.correction_generale).trim().length < 80) err(`${oq} : correction générale < 80 caractères`);
    verifierTexte(q.correction_generale, `${oq} correction`);
    if (!Array.isArray(q.items) || q.items.length !== 5) { err(`${oq} : 5 propositions attendues`); return; }
    let k = 0;
    q.items.forEach((it, ii) => {
      const oi = `${oq}${'ABCDE'[ii]}`;
      if (it.lettre !== 'ABCDE'[ii]) err(`${oi} : lettre attendue ${'ABCDE'[ii]}`);
      if (typeof it.is_correct !== 'boolean') err(`${oi} : is_correct doit être un booléen`);
      if (it.is_correct) k += 1;
      const ie = texte(it.enonce).trim();
      if (ie.length < 12 || ie.length > 400) err(`${oi} : proposition de ${ie.length} caractères (12 à 400)`);
      if (POSITIONNELLE.test(ie)) err(`${oi} : proposition positionnelle interdite`);
      verifierTexte(it.enonce, oi);
      const j = String(it.justification ?? '').trim();
      const prefixe = it.is_correct ? 'Vrai : ' : 'Faux : ';
      if (!j.startsWith(prefixe)) err(`${oi} : la justification doit commencer par « ${prefixe}» (clé ${it.is_correct ? 'vraie' : 'fausse'})`);
      if (j.length < 40) err(`${oi} : justification trop courte`);
      verifierTexte(j, `${oi} justification`);
      const cle = norm(ie);
      if (propositions.has(cle)) err(`${oi} : proposition identique à ${propositions.get(cle)}`); else propositions.set(cle, oi);
    });
    if (k < 1) err(`${oq} : aucune proposition juste`);
    cardinalites[k] += 1;
    cardSerie.push(k);
  });
  const freq = {}; for (const k of cardSerie) freq[k] = (freq[k] || 0) + 1;
  if (Math.max(...Object.values(freq)) > 3) err(`${ou} : plus de 3 questions avec ${Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]} réponse(s) juste(s) (${cardSerie.join('-')})`);
  if (Object.keys(freq).length < (dp ? 3 : 2)) err(`${ou} : nombres de réponses justes trop peu variés (${cardSerie.join('-')})`);
}
const total = cardinalites.reduce((a, b) => a + b, 0);
if (total === 96) {
  for (const k of [1, 2, 3, 4]) if (cardinalites[k] < 12) err(`cours : seulement ${cardinalites[k]} questions à ${k} réponse(s) juste(s) (≥ 12 attendues)`);
  if (cardinalites[5] > 12) err(`cours : ${cardinalites[5]} questions à 5 réponses justes (≤ 12)`);
  for (const k of [1, 2, 3, 4]) if (cardinalites[k] > 32) err(`cours : ${cardinalites[k]} questions à ${k} réponse(s) juste(s) (≤ 32)`);
}

let flashcards = [];
const ff = join(dir, 'flashcards.json');
if (!fichierBanque && !existsSync(ff)) err('fichier manquant : flashcards.json');
else {
  if (fichierBanque) flashcards = fichierBanque.flashcards;
  else try { flashcards = JSON.parse(readFileSync(ff, 'utf8')); } catch (e) { err(`flashcards.json : JSON invalide (${e.message})`); }
  if (!Array.isArray(flashcards) || flashcards.length < 100 || flashcards.length > 120) err(`flashcards : 100 à 120 attendues, reçu ${flashcards?.length}`);
  const vus = new Set();
  (flashcards || []).forEach((c, i) => {
    const r = String(c.recto ?? '').trim(); const v = String(c.verso ?? '').trim();
    if (!/\?\s*$/.test(r) || r.length < 15) err(`flashcard ${i + 1} : recto = une question finissant par « ? »`);
    if (v.length < 15) err(`flashcard ${i + 1} : verso trop court`);
    if (vus.has(norm(r))) err(`flashcard ${i + 1} : recto en double`); vus.add(norm(r));
    verifierTexte(r, `flashcard ${i + 1}`); verifierTexte(v, `flashcard ${i + 1}`);
  });
}

const stats = { series: series.length, questions: total, cardinalites: { 1: cardinalites[1], 2: cardinalites[2], 3: cardinalites[3], 4: cardinalites[4], 5: cardinalites[5] }, flashcards: flashcards?.length ?? 0 };
if (erreurs.length) {
  console.log(`${erreurs.length} erreur(s) :\n- ${erreurs.slice(0, 80).join('\n- ')}${erreurs.length > 80 ? '\n…' : ''}`);
  console.log(JSON.stringify(stats));
  process.exitCode = 1;
} else if (fichierBanque) {
  console.log('Banque valide.', JSON.stringify(stats));
} else {
  writeFileSync(join(dir, 'chapter.json'), JSON.stringify({ series: series.map((serie) => Object.fromEntries(Object.entries(serie).filter(([cle]) => cle !== 'n'))), flashcards }, null, 2));
  console.log('Banque valide.', JSON.stringify(stats));
}
