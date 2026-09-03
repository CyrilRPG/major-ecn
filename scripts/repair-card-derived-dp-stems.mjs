/**
 * Rewrites only the DP question stems that duplicated flashcard rectos.
 * It atomically re-emits the existing question/item/card package through the
 * publication RPC, preserving the fiche, images and flashcard wording.
 *
 * Usage: node scripts/repair-card-derived-dp-stems.mjs <coursId> <report.json>
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv({ path: '.env.local' });
const [coursId, reportArg] = process.argv.slice(2);
if (!coursId || !reportArg) throw new Error('usage: node scripts/repair-card-derived-dp-stems.mjs <coursId> <report.json>');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL manquants');
const supabase = createClient(url, key, { auth: { persistSession: false } });
const corpusRoot = resolve('../.corpus-orthopedie');
const worklist = JSON.parse(readFileSync(join(corpusRoot, 'worklist.json'), 'utf8'));

const targets = {
  '73aa488f-99e9-4a7f-b9ce-875d8f68a61b': {
    slug: 'reprises-de-protheses-totales-du-genou',
    stems: {
      '7c225856-caca-46f6-94ee-c8e1cea56773': 'Chez ce patient multiopéré, quelle conséquence rotulienne faut-il anticiper si l’insert tibial est épaissi ?',
      'eb8fc37e-4f81-44e0-b5fa-13ac04593abb': 'Au cours de l’éversion rotulienne de ce genou déjà opéré, quelle structure doit être préservée ?',
      '79d0983c-eb4e-4469-9c7d-de02d5d40805': 'Chez ce patient en flessum, quel élément peut fausser l’interprétation des radiographies de reprise ?',
      '2d1c17b4-57e3-4f16-bf9f-0bb06ab4ab7f': 'Devant cette perte osseuse au cours de la reprise, quel objectif justifie l’emploi de cales métalliques ?',
      '23dcdb0c-af58-40b5-b291-29ca8a88914d': 'Avant de programmer la reprise de cette prothèse douloureuse, quelle démarche doit guider la décision initiale ?',
      'c3035977-f3a3-44bd-9c80-f3d864d0594b': 'Chez ce patient dont la rotation des composants est suspecte, quel type de laxité est fréquemment associé à cette malrotation ?',
      '9d8dfe26-62e0-4d7c-8dbd-8581752b9708': 'Lorsqu’un bouton rotulien doit être retiré, quelle technique de dépose est recommandée par le chapitre ?',
      'b0b633d3-5cba-4e96-8557-3b7669729300': 'Lors du démontage de cet implant descellé, à quelle interface les ostéotomes doivent-ils être placés ?',
    },
  },
  'a1261414-9b4d-421c-98cc-14dbf4e6f8bf': {
    slug: 'technique-operatoire-des-protheses-femoropatellaires',
    stems: {
      '603636f6-e1f2-4a8c-b278-9d77b3a36acd': 'Avant de retenir une arthroplastie fémoropatellaire chez ce patient, quel compartiment articulaire doit rester évalué ?',
      'dcf22d08-2cc3-4671-8e64-07e7d0269b75': 'À l’essai, un contact entre la trochlée et le plateau tibial apparaît en extension : quel défaut de positionnement faut-il évoquer ?',
      '4a2a9b15-b49e-49bb-91a1-2bccc8fced17': 'L’essai met en évidence une rotule basse : quelle correction de position du médaillon est indiquée ?',
      '8abb302c-1cc9-46c9-a65f-07842dfc148b': 'Après réglage de la rotation du guide fémoral, quel geste permet de stabiliser ce repère avant la coupe ?',
      '745a510c-de0a-4ca4-8774-592f0e72b234': 'Pour exposer ce genou dans le cadre d’une prothèse fémoropatellaire, quelle voie d’abord est habituellement retenue ?',
      '4912b7c4-537f-4ac1-bfa8-53670e74535e': 'Le choix se porte sur un implant Hermès : quelle est sa contrainte selon le chapitre ?',
      '5e257274-c2a7-4f4a-8c3d-6e98d8929249': 'Lors de la préparation rotulienne décrite dans le chapitre, quelle épaisseur osseuse est réséquée ?',
      '6470fd66-c2ff-4004-a944-3652e32b419a': 'Chez ce patient douloureux malgré le traitement médical, quelle indication correspond à une prothèse fémoropatellaire ?',
    },
  },
  '581caa10-99f7-43bd-b56d-a0be723330da': {
    slug: 'techniques-d-osteosynthese-des-fractures-diaphysaires-de-la-jambe',
    stems: {
      '7e923713-06f9-40a0-b415-3627c4a50fe7': 'Dans cette fracture bifocale stabilisée par enclouage, quel détail de conception permet une dynamisation malgré le verrouillage ?',
      '584fccb3-2e49-43f5-a3ba-bf887dd0f893': 'Au moment du verrouillage distal de ce clou tibial, quelle technique de repérage est habituellement utilisée ?',
      'de22a777-793b-49fb-8f9e-d69f0672927d': 'Devant une fracture métaphysaire proximale avec risque de mauvais centrage, quelle synthèse associée peut aider au contrôle distal ?',
      'c5c44fb0-0029-4265-87d8-af99bbe953dc': 'Après parage d’une fracture ouverte avec besoin de couverture, quel délai de couverture secondaire est rapporté dans le chapitre ?',
      '2f6a04ea-ead9-4db3-b058-b3c744f2c68b': 'Devant une douleur croissante sous plâtre, quel paramètre de pression contribue au diagnostic de syndrome de loges ?',
      '23862303-8fc5-4958-b523-21c88ed0bc60': 'Dans cette fracture bifocale dont la consolidation est insuffisante, quelle stratégie peut stimuler l’ostéogenèse selon le contexte ?',
      '17530407-ff9e-47c1-8ae1-f6b7d167b138': 'Chez ce traumatisé de jambe, quel élément pronostique doit être évalué au même titre que la lésion osseuse ?',
      '2ebf4a89-fe9a-42cb-b493-14bb75a8a2d3': 'Lors du passage du guide à travers le foyer de fracture, quel contrôle d’imagerie est nécessaire ?',
    },
  },
};
const target = targets[coursId];
if (!target) throw new Error(`Cours non autorisé pour ce correctif : ${coursId}`);
const entry = worklist.find((item) => item.coursId === coursId && item.slug === target.slug);
if (!entry) throw new Error(`Triplet worklist invalide pour ${coursId}`);
const plain = (value) => String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const normalize = (value) => plain(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');

const { data: course, error: courseError } = await supabase.from('cours').select('id,titre,order_index').eq('id', coursId).single();
if (courseError) throw courseError;
const { data: series, error: seriesError } = await supabase.from('qcm_series').select('id,label,vignette,order_index,kind,type').eq('cours_id', coursId).eq('type', 'qcm').order('order_index');
if (seriesError) throw seriesError;
const seriesIds = series.map((item) => item.id);
const { data: questions, error: questionError } = await supabase.from('qcm_questions').select('id,serie_id,enonce,order_index,correction_generale').in('serie_id', seriesIds).order('order_index');
if (questionError) throw questionError;
const { data: items, error: itemError } = await supabase.from('qcm_items').select('id,question_id,lettre,enonce,is_correct,justification').in('question_id', questions.map((item) => item.id)).order('lettre');
if (itemError) throw itemError;
const { data: flashcards, error: cardError } = await supabase.from('flashcards').select('id,recto,verso,order_index').eq('cours_id', coursId).order('order_index');
if (cardError) throw cardError;

const snapshot = { version: 1, createdAt: new Date().toISOString(), course, series, questions, items, flashcards };
const serialized = `${JSON.stringify(snapshot, null, 2)}\n`;
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const snapshotDir = join(corpusRoot, target.slug, 'delivery', stamp, 'published-before-card-stem-repair');
mkdirSync(snapshotDir, { recursive: true });
writeFileSync(join(snapshotDir, 'snapshot.json'), serialized, 'utf8');
writeFileSync(join(snapshotDir, 'manifest.json'), `${JSON.stringify({ courseId: coursId, slug: target.slug, sha256: createHash('sha256').update(serialized).digest('hex'), counts: { series: series.length, questions: questions.length, items: items.length, flashcards: flashcards.length } }, null, 2)}\n`, 'utf8');

const promptSet = new Set(flashcards.map((card) => normalize(card.recto)).filter(Boolean));
const matchingBefore = questions.filter((question) => promptSet.has(normalize(question.enonce)));
if (matchingBefore.length !== Object.keys(target.stems).length || !matchingBefore.every((question) => target.stems[question.id])) {
  throw new Error(`Attendu ${Object.keys(target.stems).length} reprises de recto, trouvé ${matchingBefore.length}`);
}
const itemsByQuestion = new Map();
for (const item of items) itemsByQuestion.set(item.question_id, [...(itemsByQuestion.get(item.question_id) || []), { lettre: item.lettre, enonce: item.enonce, is_correct: item.is_correct, justification: item.justification }]);
const questionsBySeries = new Map();
for (const question of questions) questionsBySeries.set(question.serie_id, [...(questionsBySeries.get(question.serie_id) || []), question]);
const payload = {
  series: series.map((serie) => ({
    label: serie.label,
    vignette: serie.vignette || '',
    questions: (questionsBySeries.get(serie.id) || []).map((question) => ({
      enonce: target.stems[question.id] || plain(question.enonce),
      correction_generale: question.correction_generale || '',
      items: itemsByQuestion.get(question.id) || [],
    })),
  })),
  flashcards: flashcards.map((card) => ({ recto: card.recto, verso: card.verso })),
  thin: false,
};
if (payload.series.length !== 16 || payload.series.reduce((sum, serie) => sum + serie.questions.length, 0) !== 96 || items.length !== 480 || flashcards.length < 100 || flashcards.length > 200) throw new Error('Paquet incomplet : publication annulée');
const remainingBeforePublish = payload.series.flatMap((serie) => serie.questions).filter((question) => promptSet.has(normalize(question.enonce)));
if (remainingBeforePublish.length) throw new Error(`${remainingBeforePublish.length} énoncé(s) recopie(nt) encore un recto`);
const { data: published, error: publishError } = await supabase.rpc('replace_cours_generated_content', { p_cours_id: coursId, p_payload: payload, p_replace: true });
if (publishError) throw publishError;
// Readback validates atomic publication and the exact targeted quality gate.
const { data: afterSeries, error: afterSeriesError } = await supabase.from('qcm_series').select('id').eq('cours_id', coursId).eq('type', 'qcm');
if (afterSeriesError) throw afterSeriesError;
const { data: afterQuestions, error: afterQuestionError } = await supabase.from('qcm_questions').select('enonce,serie_id').in('serie_id', afterSeries.map((serie) => serie.id));
if (afterQuestionError) throw afterQuestionError;
const { data: afterCards, error: afterCardError } = await supabase.from('flashcards').select('recto').eq('cours_id', coursId);
if (afterCardError) throw afterCardError;
const afterPrompts = new Set(afterCards.map((card) => normalize(card.recto)).filter(Boolean));
const matchingAfter = afterQuestions.filter((question) => afterPrompts.has(normalize(question.enonce))).length;
if (afterSeries.length !== 16 || afterQuestions.length !== 96 || afterCards.length !== flashcards.length || matchingAfter !== 0) throw new Error(`Readback invalide : ${afterSeries.length} séries, ${afterQuestions.length} questions, ${afterCards.length} cartes, ${matchingAfter} reprises`);
const report = { generatedAt: new Date().toISOString(), course: { coursId, slug: target.slug, title: course.titre }, snapshot: snapshotDir, published, changedQuestions: Object.entries(target.stems).map(([id, enonce]) => ({ originalQuestionId: id, enonce })), qa: { series: afterSeries.length, questions: afterQuestions.length, flashcards: afterCards.length, cardPromptQuestionsBefore: matchingBefore.length, cardPromptQuestionsAfter: matchingAfter } };
mkdirSync(dirname(resolve(reportArg)), { recursive: true });
writeFileSync(resolve(reportArg), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report.qa));
