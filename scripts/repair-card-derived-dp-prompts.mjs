/**
 * Rewrites every DP prompt that was mechanically copied from a flashcard.
 * Source vocabulary comes only from the existing source-derived prompt and
 * its named DP topic; fiche, images and card wording remain untouched.
 *
 * Usage: node scripts/repair-card-derived-dp-prompts.mjs <coursId> <report.json>
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv({ path: '.env.local' });
const [coursId, reportArg] = process.argv.slice(2);
if (!coursId || !reportArg) throw new Error('usage: node scripts/repair-card-derived-dp-prompts.mjs <coursId> <report.json>');
const permitted = new Map([
  ['b77cb159-6a17-456e-a6ef-790af6bb1632', 'traitement-chirurgical-des-fractures-de-l-extremite-superieure-de-l-humerus-de-l'],
  ['1f492987-85f0-49e6-9e13-bd8df8559e66', 'traitement-chirurgicale-des-lesions-du-lca'],
  ['262d34ac-e877-45a7-b440-3afbd1efcc73', 'traumatismes-recents-du-rachis-thoracolombaire'],
]);
const slug = permitted.get(coursId);
if (!slug) throw new Error(`Cours non autorisé : ${coursId}`);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL manquants');
const supabase = createClient(url, key, { auth: { persistSession: false } });
const root = resolve('../.corpus-orthopedie');
const worklist = JSON.parse(readFileSync(join(root, 'worklist.json'), 'utf8'));
if (!worklist.some((entry) => entry.coursId === coursId && entry.slug === slug)) throw new Error('Triplet worklist invalide');
const plain = (value) => String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const normalize = (value) => plain(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const lower = (value) => value ? `${value.charAt(0).toLowerCase()}${value.slice(1)}` : value;
const topicFrom = (label) => plain(label).replace(/^DP\s*\d+\s*[—-]\s*/i, '').trim();

function naturalQuestion(raw, topic) {
  let stem = plain(raw)
    .replace(/\s*[—-]\s*repère de décision\s*\d+\s*/gi, ' ')
    .replace(/^conséquence pratique\s*[—-]\s*/i, '')
    .replace(/^repère\s+[^?]+\?\s*/i, '')
    .replace(/\s+/g, ' ').trim().replace(/\?+$/, '').trim();
  // Turn the common mechanical shorthand into an actual clinical question.
  stem = stem.replace(/^rééducation\s*:\s*dépend de$/i, 'quel paramètre conditionne la rééducation');
  stem = stem.replace(/^rôle de (.+)$/i, 'quel est le rôle de $1');
  stem = stem.replace(/^but de (.+)$/i, 'quel est le but de $1');
  stem = stem.replace(/^nombre de (.+)$/i, 'combien de $1');
  stem = stem.replace(/^nerfs atteints fréquemment$/i, 'quels nerfs sont fréquemment atteints');
  stem = stem.replace(/^imagerie systématique$/i, 'quelle imagerie doit être demandée systématiquement');
  stem = stem.replace(/^installation standard$/i, 'quelle installation est habituellement retenue');
  stem = stem.replace(/^mobilisation initiale$/i, 'quelle règle doit guider la mobilisation initiale');
  stem = stem.replace(/^lésion associée à rechercher$/i, 'quelle lésion associée doit être recherchée');
  stem = stem.replace(/^stabilisation habituelle$/i, 'quelle stabilisation est habituellement utilisée');
  stem = stem.replace(/^geste de décompression$/i, 'quel geste de décompression est adapté');
  stem = stem.replace(/^moment de décompression$/i, 'à quel moment réaliser la décompression');
  stem = stem.replace(/^voie de l’urgence neurologique$/i, 'quelle voie privilégier devant une urgence neurologique');
  stem = stem.replace(/^type ([ABC]) AO$/i, 'quelle définition correspond au type $1 de la classification AO');
  stem = stem.replace(/^fracture burst$/i, 'quel élément rechercher devant une fracture burst');
  stem = stem.replace(/^inversée\s*:\s*indication âge$/i, 'à partir de quel âge la prothèse inversée est-elle indiquée');
  stem = stem.replace(/^inversée\s*:\s*autre indication$/i, 'quelle autre indication peut conduire à une prothèse inversée');
  stem = stem.replace(/^hémi\s*:\s*temps essentiel$/i, 'quel temps est essentiel lors d’une hémiarthroplastie');
  stem = stem.replace(/^clou\s*:\s*atout$/i, 'quel est l’atout du clou');
  stem = stem.replace(/^clou\s*:\s*conflit évité par$/i, 'quel geste évite le conflit avec le clou');
  stem = stem.replace(/^plaque\s*:\s*position bicipitale$/i, 'quelle position de plaque respecte la gouttière bicipitale');
  stem = stem.replace(/^plaque\s*:\s*sous trochiter$/i, 'quelle distance sous le trochiter doit respecter la plaque');
  stem = stem.replace(/^platine inversée$/i, 'quelle position doit avoir la platine d’une prothèse inversée');
  stem = stem.replace(/^règle glénoïde$/i, 'quelle règle de mesure doit guider la préparation glénoïdienne');
  stem = stem.replace(/^rétroversion inversée$/i, 'quelle rétroversion est recherchée pour une prothèse inversée');
  stem = stem.replace(/^tubérosités inversée$/i, 'quelle conduite adopter pour les tubérosités lors d’une prothèse inversée');
  stem = stem.replace(/^formule pelvienne$/i, 'quelle formule relie les paramètres pelviens');
  stem = stem.replace(/^incidence pelvienne$/i, 'quelle propriété définit l’incidence pelvienne');
  stem = stem.replace(/^vertébroplastie$/i, 'quel principe définit la vertébroplastie');
  stem = stem.replace(/^cyphoplastie$/i, 'quel principe définit la cyphoplastie');
  stem = stem.replace(/^percutané sans déficit$/i, 'dans quelle situation une stabilisation percutanée peut-elle être discutée');
  stem = stem.replace(/^décompression sans déficit$/i, 'la décompression est-elle systématique en l’absence de déficit neurologique');
  stem = stem.replace(/^contrôle des vis céphaliques$/i, 'comment contrôler la position des vis céphaliques');
  stem = stem.replace(/^imagerie peropératoire$/i, 'quelle imagerie peropératoire faut-il utiliser');
  stem = stem.replace(/^fenêtre idéale rapportée$/i, 'quelle fenêtre opératoire est rapportée');
  stem = stem.replace(/^délai maximal recommandé$/i, 'quel délai maximal est recommandé');
  stem = stem.replace(/^rééducation\s*:\s*dépend de$/i, 'quel paramètre conditionne la rééducation');
  if (!/^(quel|quelle|quels|quelles|combien|comment|pourquoi|quand|où|à quel|dans quelle|la décompression)/i.test(stem)) {
    stem = `quelle proposition décrit correctement ${lower(stem)}`;
  }
  return `Dans ce dossier de ${lower(topic)}, ${stem} ?`.replace(/\s+\?/g, ' ?');
}

const { data: course, error: courseError } = await supabase.from('cours').select('id,titre,order_index').eq('id', coursId).single();
if (courseError) throw courseError;
const { data: series, error: seriesError } = await supabase.from('qcm_series').select('id,type,kind,label,vignette,order_index').eq('cours_id', coursId).eq('type', 'qcm').order('order_index');
if (seriesError) throw seriesError;
const seriesIds = series.map((serie) => serie.id);
const { data: questions, error: questionError } = await supabase.from('qcm_questions').select('id,serie_id,enonce,order_index,correction_generale').in('serie_id', seriesIds).order('order_index');
if (questionError) throw questionError;
const { data: items, error: itemError } = await supabase.from('qcm_items').select('id,question_id,lettre,enonce,is_correct,justification').in('question_id', questions.map((question) => question.id)).order('lettre');
if (itemError) throw itemError;
const { data: flashcards, error: flashError } = await supabase.from('flashcards').select('id,recto,verso,order_index').eq('cours_id', coursId).order('order_index');
if (flashError) throw flashError;
const promptSet = new Set(flashcards.map((card) => normalize(card.recto)).filter(Boolean));
const matching = questions.filter((question) => promptSet.has(normalize(question.enonce)));
if (matching.length !== 48) throw new Error(`Attendu 48 reprises de recto, trouvé ${matching.length}`);
const seriesById = new Map(series.map((serie) => [serie.id, serie]));
if (!matching.every((question) => seriesById.get(question.serie_id)?.kind === 'dp')) throw new Error('Un énoncé cloné n’appartient pas à un DP');

const snapshot = { version: 1, createdAt: new Date().toISOString(), course, series, questions, items, flashcards };
const serialized = `${JSON.stringify(snapshot, null, 2)}\n`;
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const snapshotDir = join(root, slug, 'delivery', stamp, 'published-before-card-prompt-repair');
mkdirSync(snapshotDir, { recursive: true });
writeFileSync(join(snapshotDir, 'snapshot.json'), serialized, 'utf8');
writeFileSync(join(snapshotDir, 'manifest.json'), `${JSON.stringify({ courseId: coursId, slug, sha256: createHash('sha256').update(serialized).digest('hex'), counts: { series: series.length, questions: questions.length, items: items.length, flashcards: flashcards.length } }, null, 2)}\n`, 'utf8');

const replacements = new Map(matching.map((question) => [question.id, naturalQuestion(question.enonce, topicFrom(seriesById.get(question.serie_id).label))]));
const itemsByQuestion = new Map();
for (const item of items) itemsByQuestion.set(item.question_id, [...(itemsByQuestion.get(item.question_id) || []), { lettre: item.lettre, enonce: item.enonce, is_correct: item.is_correct, justification: item.justification }]);
const questionsBySeries = new Map();
for (const question of questions) questionsBySeries.set(question.serie_id, [...(questionsBySeries.get(question.serie_id) || []), question]);
const payload = { series: series.map((serie) => ({ label: serie.label, vignette: serie.vignette || '', questions: (questionsBySeries.get(serie.id) || []).map((question) => ({ enonce: replacements.get(question.id) || plain(question.enonce), correction_generale: question.correction_generale || '', items: itemsByQuestion.get(question.id) || [] })) })), flashcards: flashcards.map((card) => ({ recto: card.recto, verso: card.verso })), thin: false };
const pending = payload.series.flatMap((serie) => serie.questions).filter((question) => promptSet.has(normalize(question.enonce)));
if (pending.length) throw new Error(`${pending.length} reprises de recto subsistent`);
if (payload.series.length !== 16 || payload.series.reduce((sum, serie) => sum + serie.questions.length, 0) !== 96 || items.length !== 480 || flashcards.length < 100 || flashcards.length > 200) throw new Error('Paquet incomplet : publication annulée');
const { data: published, error: publishError } = await supabase.rpc('replace_cours_generated_content', { p_cours_id: coursId, p_payload: payload, p_replace: true });
if (publishError) throw publishError;
const { data: afterSeries, error: afterSeriesError } = await supabase.from('qcm_series').select('id').eq('cours_id', coursId).eq('type', 'qcm');
if (afterSeriesError) throw afterSeriesError;
const { data: afterQuestions, error: afterQuestionError } = await supabase.from('qcm_questions').select('enonce').in('serie_id', afterSeries.map((serie) => serie.id));
if (afterQuestionError) throw afterQuestionError;
const { data: afterCards, error: afterCardError } = await supabase.from('flashcards').select('recto').eq('cours_id', coursId);
if (afterCardError) throw afterCardError;
const afterPromptSet = new Set(afterCards.map((card) => normalize(card.recto)).filter(Boolean));
const repeatedAfter = afterQuestions.filter((question) => afterPromptSet.has(normalize(question.enonce))).length;
if (afterSeries.length !== 16 || afterQuestions.length !== 96 || afterCards.length !== flashcards.length || repeatedAfter !== 0) throw new Error(`Readback invalide : séries ${afterSeries.length}, questions ${afterQuestions.length}, cartes ${afterCards.length}, reprises ${repeatedAfter}`);
const report = { generatedAt: new Date().toISOString(), course: { coursId, slug, title: course.titre }, snapshot: snapshotDir, published, qa: { series: afterSeries.length, questions: afterQuestions.length, flashcards: afterCards.length, cardPromptQuestionsBefore: matching.length, cardPromptQuestionsAfter: repeatedAfter }, rewritten: matching.map((question) => ({ questionId: question.id, before: question.enonce, after: replacements.get(question.id) })) };
mkdirSync(dirname(resolve(reportArg)), { recursive: true });
writeFileSync(resolve(reportArg), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report.qa));
