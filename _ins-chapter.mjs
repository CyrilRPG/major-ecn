/**
 * Publie un chapitre généré dans UNE transaction PostgreSQL.
 * La fonction SQL refuse un remplacement sans --snapshot afin que la copie
 * publiée soit toujours récupérable depuis le corpus.
 *
 * Usage:
 *   node _ins-chapter.mjs <coursId> <chapter.json> [--thin]
 *   node _ins-chapter.mjs <coursId> <chapter.json> --replace --snapshot <manifest.json> [--thin]
 */
import { existsSync, readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { config as dotenv } from 'dotenv';

dotenv({ path: '.env.local' });
const args = process.argv.slice(2);
const positional = args.filter((arg) => !arg.startsWith('--') && arg !== 'true');
const [coursId, jsonFile] = positional;
const thin = args.includes('--thin');
const replace = args.includes('--replace');
// A stem-only repair copies the existing cards unchanged from its snapshot.
// Do not let an unrelated legacy card prevent a validated question repair.
const questionStemsOnly = args.includes('--question-stems-only');
const snapshotIndex = args.indexOf('--snapshot');
const snapshotPath = snapshotIndex >= 0 ? args[snapshotIndex + 1] : null;
if (!coursId || !jsonFile) {
  console.error('usage: node _ins-chapter.mjs <coursId> <chapter.json> [--thin] [--replace --snapshot <manifest.json>]');
  process.exit(1);
}
if (replace && (!snapshotPath || !existsSync(snapshotPath))) {
  console.error('Un remplacement exige --snapshot <manifest.json> créé avant publication.');
  process.exit(1);
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL manquants');

const doc = JSON.parse(readFileSync(jsonFile, 'utf8'));
const series = Array.isArray(doc.series) ? doc.series : [];
const flashcards = Array.isArray(doc.flashcards) ? doc.flashcards : [];
const qcm = series.filter((serie) => /^QCM/i.test(serie.label || ''));
const dp = series.filter((serie) => /^DP\b/i.test(serie.label || ''));
const errors = [];
const textOnly = (value) => String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const normalized = (value) => textOnly(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const bannedQuestionTemplates = /temps technique décrit dans le corpus|parmi les propositions suivantes[, ]+laquelle|quel repère technique|quelle conduite est correcte concernant|^concernant\b|quelle proposition est exacte|\bquel principe\b|\bquel repère\b|[\u00ab\u00bb]/i;
const bannedExamplePrompt = /^(exemple|quel exemple)|\bexemple (illustratif|donné|cité)\b/i;
// Les étudiants ne doivent jamais voir la charpente de génération. La
// progression d'un DP est portée par les données cliniques, pas par une étiquette.
const bannedStudentScaffolding = /\b(?:question|nouvel\s+élément|nouvel\s+element)\s*:\s*|\b(?:dans|selon|au regard du|à partir du)\s+(?:ce\s+)?(?:sous-thème|sous-theme|cours|chapitre|corpus)\b|\bce\s+(?:cours|chapitre|corpus)\b|\bqcm\s*[—–-]?\s*s[ée]rie\s*\d+/i;
if (thin) {
  if (qcm.length < 1 || qcm.length > 8 || dp.length > 8) errors.push(`séries thin invalides : ${qcm.length} QCM, ${dp.length} DP`);
} else if (qcm.length !== 8 || dp.length !== 8) {
  errors.push(`séries standard attendues : 8 QCM et 8 DP (reçu ${qcm.length}/${dp.length})`);
}
if (flashcards.length < 100 || flashcards.length > 200) errors.push(`flashcards = ${flashcards.length}, attendu 100-200`);
const fronts = flashcards.map((card) => normalized(card.recto));
if (new Set(fronts).size !== fronts.length) errors.push('rectos flashcards dupliqués ou sémantiquement identiques');
if (!questionStemsOnly) {
  for (const card of flashcards) {
    if (!textOnly(card.recto) || bannedQuestionTemplates.test(textOnly(card.recto)) || bannedExamplePrompt.test(textOnly(card.recto))) {
      errors.push(`flashcard : recto générique ou fondé sur un exemple (« ${textOnly(card.recto).slice(0, 80)} »)`);
    }
  }
}
for (const serie of series) {
  const isDp = /^DP\b/i.test(serie.label || '');
  const count = Array.isArray(serie.questions) ? serie.questions.length : 0;
  if (isDp ? (thin ? count < 5 || count > 7 : count !== 7) : count !== 5) errors.push(`« ${serie.label} » : ${count} questions invalide`);
  if (isDp && !serie.vignette) errors.push(`« ${serie.label} » : vignette absente`);
  if (isDp) {
    const vignette = normalized(serie.vignette);
    if (textOnly(serie.vignette).length < 260) errors.push(`« ${serie.label} » : vignette trop courte pour un dossier progressif`);
    if (!/(patient|patiente|homme|femme|adolescent|adolescente|garcon|fille|jeune adulte)/.test(vignette)) errors.push(`« ${serie.label} » : patient absent de la vignette`);
    if (!/(suivi|controle|postoperatoire|reeducation|mise en charge)/.test(vignette)) errors.push(`« ${serie.label} » : suivi absent de la vignette`);
  }
  if (/entra[iî]nement/i.test(serie.label || '')) errors.push(`« ${serie.label} » : libellé interdit`);
  for (const [index, question] of (serie.questions || []).entries()) {
    if ((question.items || []).length !== 5) errors.push(`« ${serie.label} » Q${index + 1} : 5 items requis`);
    if (!(question.items || []).some((item) => item.is_correct)) errors.push(`« ${serie.label} » Q${index + 1} : aucune réponse juste`);
    const questionText = textOnly(question.enonce || '');
    if (bannedQuestionTemplates.test(questionText) || bannedExamplePrompt.test(questionText) || bannedStudentScaffolding.test(questionText)) errors.push(`« ${serie.label} » Q${index + 1} : énoncé générique, de gabarit ou fondé sur un exemple`);
    if (isDp && index >= 1 && !questionText) errors.push(`« ${serie.label} » Q${index + 1} : étape clinique vide`);
  }
}
const tooLong = flashcards.filter((card) => String(card.verso || '').replace(/<[^>]+>/g, '').length > 150);
if (tooLong.length) errors.push(`${tooLong.length} verso(s) flashcard > 150 caractères visibles`);
if (errors.length) {
  console.error(`VALIDATION ÉCHOUÉE :\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const payload = { series, flashcards, thin };
const { data, error } = await supabase.rpc('replace_cours_generated_content', {
  p_cours_id: coursId,
  p_payload: payload,
  p_replace: replace,
});
if (error) {
  console.error(`Publication annulée (aucune écriture partielle) : ${error.message}`);
  process.exit(1);
}
console.log(`✔ ${coursId} publié atomiquement : ${JSON.stringify(data)}`);
