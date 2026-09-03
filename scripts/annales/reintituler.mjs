/**
 * Réécrit les intitulés de questions restitués sous forme de paragraphe méta.
 *
 * Certains corrigés ne reproduisent pas l'énoncé officiel des questions. Ces
 * questions avaient été chargées avec un paragraphe en italique décrivant ce
 * sur quoi portait la question (« Intitulé non reproduit par le corrigé.
 * D'après la réponse attendue, la question porte sur… »). Ce commentaire n'a
 * rien à faire dans une annale : l'étudiant doit lire une question, pas une
 * note d'édition. Ce script remplace ces paragraphes par de vrais intitulés.
 *
 * Le préfixe « <b>Question n</b> » est conservé ; seul le texte qui suit est
 * remplacé. Une entrée `null` laisse la question inchangée.
 *
 * Usage :
 *   node scripts/annales/reintituler.mjs --data <fichier.json> --intitules <mapping.json>
 *   node scripts/annales/reintituler.mjs --data <fichier.json> --lister
 *
 * Le mapping est un objet { "<label de la série>": ["intitulé Q1", null, …] }.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const arg = (nom) => (process.argv.includes(nom) ? process.argv[process.argv.indexOf(nom) + 1] : null);
const dataPath = arg('--data');
const intitulesPath = arg('--intitules');
const lister = process.argv.includes('--lister');
if (!dataPath) throw new Error('Usage : --data <fichier.json> [--intitules <mapping.json> | --lister]');

export const EST_META = (enonce) =>
  typeof enonce === 'string' && /Intitulé (officiel )?non (reproduit|disponible)/.test(enonce);

// Tout ce qui précède la phrase méta est conservé tel quel : « <b>Question 3</b> »,
// et le barème « <i>(25 points)</i> » des grilles de correction.
const SEPARATION = /^([\s\S]*?)(?:<i>\s*)?Intitulé (?:officiel )?non (?:reproduit|disponible)[\s\S]*$/;
const prefixeDe = (enonce) => enonce.match(SEPARATION)?.[1] ?? '';

const data = JSON.parse(readFileSync(dataPath, 'utf8'));

if (lister) {
  for (const serie of data.series) {
    const metas = serie.questions.filter((q) => EST_META(q.enonce));
    if (!metas.length) continue;
    console.log(`\n=== ${serie.label} (${metas.length}/${serie.questions.length}) ===`);
    serie.questions.forEach((q, i) => {
      if (!EST_META(q.enonce)) return;
      const meta = q.enonce.slice(prefixeDe(q.enonce).length).replace(/<\/?i>/g, '').trim();
      const reponse = String(q.reponseAttendue ?? q.reponse ?? '').replace(/\s+/g, ' ');
      console.log(`[${i}] ${meta}`);
      console.log(`    → ${reponse.slice(0, 320)}`);
    });
  }
  process.exit(0);
}

if (!intitulesPath) throw new Error('--intitules est requis (ou --lister)');
const intitules = JSON.parse(readFileSync(intitulesPath, 'utf8'));

let remplaces = 0;
let restants = 0;
for (const serie of data.series) {
  const nouveaux = intitules[serie.label];
  serie.questions.forEach((question, i) => {
    if (!EST_META(question.enonce)) return;
    const nouveau = nouveaux?.[i];
    if (!nouveau) {
      restants += 1;
      return;
    }
    if (EST_META(nouveau)) throw new Error(`intitulé encore méta : « ${nouveau.slice(0, 60)} »`);
    if (/<i>|<\/i>/.test(nouveau)) throw new Error(`intitulé en italique : « ${nouveau.slice(0, 60)} »`);
    const prefixe = prefixeDe(question.enonce);
    question.enonce = prefixe + nouveau;
    remplaces += 1;
  });
}

writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`✔ ${dataPath} : ${remplaces} intitulé(s) réécrit(s)${restants ? `, ${restants} restant(s)` : ''}`);
