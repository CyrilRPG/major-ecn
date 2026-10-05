#!/usr/bin/env node
// Publie EN PLACE la banque régénérée d'un cours (16 séries : 8 QCM × 5 et
// 8 DP × 7 questions, 5 propositions ; 100 à 120 flashcards), via
// public.publier_banque_cours_en_place : identifiants conservés, transaction
// unique, empreintes recalculées par le cron, constats d'audit ouverts clos.
//
// Avant l'envoi :
//   - le titre du cours en base doit être celui de la banque (garde contre
//     une erreur d'identifiant) ;
//   - la position des réponses justes est rééquilibrée : à nombre de réponses
//     justes égal, toutes les combinaisons de lettres sont servies à parts
//     égales (tirage reproductible, graine = identifiant du cours). Les
//     justifications ne citent jamais de lettre, la permutation est donc sûre ;
//   - le contenu actuel est sauvegardé dans tmp/regeneration-banques/.
//
// Usage :
//   node scripts/publier-banque-cours.mjs --banque=scripts/banques/orthopedie/<cours>.json            essai à blanc
//   node scripts/publier-banque-cours.mjs --banque=scripts/banques/orthopedie/<cours>.json --appliquer
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const ROOT = resolve(import.meta.dirname, '..');
const arg = (name) => process.argv.find((value) => value.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const appliquer = process.argv.includes('--appliquer');
if (!arg('banque')) {
  console.error('Usage : node scripts/publier-banque-cours.mjs --banque=<fichier.json> [--appliquer]');
  process.exit(1);
}
const banque = JSON.parse(readFileSync(resolve(ROOT, arg('banque')), 'utf8'));
if (!banque.cours_id || !banque.titre) throw new Error('La banque doit porter cours_id et titre.');

config({ path: join(ROOT, '.env.local') });
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const must = async (query, label) => {
  const result = await query;
  if (result.error) throw new Error(`${label} : ${result.error.message}`);
  return result.data;
};

// ─── Rééquilibrage des lettres ───────────────────────────────────────────────
const LETTRES = 'ABCDE';
function generateur(seed) {
  let state = [...seed].reduce((hash, char) => Math.imul(hash ^ char.charCodeAt(0), 16777619), 2166136261) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const melanger = (list, random) => {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
};
const combinaisons = (taille, debut = 0, prefixe = '', sortie = []) => {
  if (prefixe.length === taille) { sortie.push(prefixe); return sortie; }
  for (let index = debut; index <= LETTRES.length - (taille - prefixe.length); index += 1) combinaisons(taille, index + 1, prefixe + LETTRES[index], sortie);
  return sortie;
};
function equilibrer(series, graine) {
  const random = generateur(graine);
  const questions = series.flatMap((serie) => serie.questions);
  const servies = Object.fromEntries([...LETTRES].map((lettre) => [lettre, 0]));
  for (let k = 1; k <= 5; k += 1) {
    const groupe = questions.filter((question) => question.items.filter((item) => item.is_correct).length === k);
    const possibles = combinaisons(k);
    const tours = Math.floor(groupe.length / possibles.length);
    const cibles = possibles.flatMap((combinaison) => Array(tours).fill(combinaison));
    for (const combinaison of cibles) for (const lettre of combinaison) servies[lettre] += 1;
    const restantes = melanger(possibles, random);
    while (cibles.length < groupe.length) {
      restantes.sort((a, b) => [...a].reduce((s, l) => s + servies[l], 0) - [...b].reduce((s, l) => s + servies[l], 0));
      const combinaison = restantes.shift();
      cibles.push(combinaison);
      for (const lettre of combinaison) servies[lettre] += 1;
    }
    const attribution = melanger(cibles, random);
    melanger(groupe, random).forEach((question, index) => {
      const justes = melanger(question.items.filter((item) => item.is_correct), random);
      const fausses = melanger(question.items.filter((item) => !item.is_correct), random);
      const lettresJustes = [...attribution[index]];
      const lettresFausses = [...LETTRES].filter((lettre) => !lettresJustes.includes(lettre));
      const placees = [
        ...justes.map((item, rang) => ({ ...item, lettre: lettresJustes[rang] })),
        ...fausses.map((item, rang) => ({ ...item, lettre: lettresFausses[rang] })),
      ];
      question.items = placees.sort((a, b) => a.lettre.localeCompare(b.lettre));
    });
  }
  const parLettre = [...LETTRES].map((lettre) => questions.filter((question) => question.items.find((item) => item.lettre === lettre).is_correct).length);
  return { questions: questions.length, justesParLettre: Object.fromEntries([...LETTRES].map((lettre, i) => [lettre, parLettre[i]])) };
}

// ─── Publication ─────────────────────────────────────────────────────────────
const cours = await must(db.from('cours').select('id, titre, matiere_id').eq('id', banque.cours_id).maybeSingle(), 'cours');
if (!cours) throw new Error(`Cours ${banque.cours_id} introuvable.`);
// Certains titres sont stockés en Unicode décomposé (é = e + accent) : on compare en NFC.
if (cours.titre.normalize('NFC') !== banque.titre.normalize('NFC')) throw new Error(`Titre en base « ${cours.titre} » ≠ titre de la banque « ${banque.titre} ».`);

const series = structuredClone(banque.series);
const equilibre = equilibrer(series, `banque:${cours.id}`);
const payload = { series, flashcards: banque.flashcards.map(({ recto, verso }) => ({ recto, verso })) };
console.log(`${cours.titre} — ${equilibre.questions} questions, réponses justes par lettre :`, equilibre.justesParLettre);
console.log('Essai à blanc :', await must(db.rpc('publier_banque_cours_en_place', { p_cours_id: cours.id, p_payload: payload, p_dry_run: true }), 'essai'));
if (!appliquer) {
  console.log('Rien n’a été écrit. Relancer avec --appliquer.');
} else {
  const ancien = await must(db.from('qcm_series')
    .select('id, label, kind, vignette, order_index, qcm_questions(id, order_index, enonce, correction_generale, commentaire_enseignant, images, qcm_items(id, lettre, enonce, is_correct, justification, images))')
    .eq('cours_id', cours.id).eq('type', 'qcm').order('order_index'), 'sauvegarde séries');
  const cartes = await must(db.from('flashcards').select('id, recto, verso, order_index').eq('cours_id', cours.id).order('order_index'), 'sauvegarde flashcards');
  const dossier = join(ROOT, 'tmp', 'regeneration-banques');
  mkdirSync(dossier, { recursive: true });
  const fichier = join(dossier, `${new Date().toISOString().replace(/[:.]/g, '-')}-${cours.id}.json`);
  writeFileSync(fichier, JSON.stringify({ cours, series: ancien, flashcards: cartes }));
  console.log(`Ancien contenu sauvegardé : ${fichier}`);
  const resultat = await must(db.rpc('publier_banque_cours_en_place', { p_cours_id: cours.id, p_payload: payload, p_dry_run: false }), 'publication');
  console.log('Publié :', resultat);
  await must(db.from('admin_audit_logs').insert({
    actor_name: 'Script — régénération de banque', actor_role: 'script', action: 'update',
    entity_type: 'cours', entity_id: cours.id, cours_id: cours.id, cours_titre: cours.titre,
    description: `Banque de questions et flashcards régénérées depuis le chapitre source (${resultat.questions} questions, ${resultat.flashcards} flashcards), identifiants conservés`,
    diff: { banque: arg('banque'), sauvegarde: fichier, resultat, justesParLettre: equilibre.justesParLettre },
  }), 'journal');
}
