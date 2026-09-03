/**
 * Rewrites learner-facing Orthopedie question stems as actual clinical or
 * operative decisions.  The source items, corrections, flashcards and fiches
 * are deliberately copied byte-for-byte from the pre-publication snapshot.
 *
 * Usage: node scripts/reframe-orthopedie-question-stems-089-133.mjs [--min 89] [--max 133] [--limit N]
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv({ path: '.env.local', quiet: true });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const arg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : Number(process.argv[index + 1]);
};
const min = arg('--min', 89);
const max = arg('--max', 133);
const limit = arg('--limit', Infinity);
const corpus = resolve('..', '.corpus-orthopedie', 'question-reframing-089-133');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const plain = (value) => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const lowercaseInitial = (value) => value ? `${value.charAt(0).toLocaleLowerCase('fr-FR')}${value.slice(1)}` : value;
const order = (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0);
const normalized = (value) => plain(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const problematic = /quelle conduite est correcte concernant|^concernant\b|quelle proposition est exacte|\bquel principe\b|\bquel rep[eè]re\b|[\u00ab\u00bb]|\bquestion\s*\d*\s*:/i;

function latestSnapshot(root) {
  const matches = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const file = join(dir, name);
      if (statSync(file).isDirectory()) walk(file);
      else if (name === 'snapshot.json') matches.push(file);
    }
  };
  walk(join(root, 'delivery'));
  return matches.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
}

function cleanTopic(original, label) {
  let text = plain(original).replace(/\s*\?\s*$/, '').trim();
  text = text.replace(/^(?:question|nouvel\s+élément)\s*:\s*/i, '');
  text = text.replace(/^\s*en pratique\s*,?\s*/i, '');
  let match = text.match(/^quelle conduite est correcte concernant\s*(.+)$/i);
  if (match) text = match[1];
  match = text.match(/^concernant\s+(.+?),?\s+quelles?\s+(?:sont\s+)?propositions?\s+(?:sont\s+)?exactes?$/i);
  if (match) text = match[1];
  text = text.replace(/^quelle proposition est exacte\s*:\s*/i, '');
  text = text.replace(/^quelle proposition décrit correctement\s*/i, '');
  text = text.replace(/^quelles? propositions? (?:sont )?exactes?\s*(?:sur|à propos de)?\s*/i, '');
  text = text.replace(/^quel principe (?:définit|guide|doit guider|s'applique à|s’applique à)\s*/i, '');
  text = text.replace(/^quel repère (?:permet de|guide|doit guider)\s*/i, '');
  // Re-running after an interrupted batch must recover the clinical topic,
  // not turn the previous complete stem into a new artificial fragment.
  match = text.match(/^(?:lors|avant|après|au cours|devant)\b[^,]*,\s*(?:quels?|quelles?)\s+(?:mesures|éléments|données|points|affirmations)\s+(?:permettent\s+d['’]assurer|doivent\s+être\s+vérifiés\s+pour\s+évaluer|orientent\s+la\s+décision\s+pour|sont\s+utiles\s+pour\s+la\s+prise\s+en\s+charge\s+de)\s+(.+)$/i);
  if (match) text = match[1];
  match = text.match(/\bproblème\s+d(?:e\s+|’)(.+)$/i);
  if (match) text = match[1];
  text = text.replace(/^[\s:—–-]+|[\s:—–-]+$/g, '').trim();
  if (!text || text.length < 3) {
    text = plain(label).replace(/^(?:QCM|DP)\s*\d*\s*[—–-]\s*/i, '').trim();
  }
  return text.replace(/[\u00ab\u00bb]/g, '').replace(/\s+/g, ' ').trim();
}

function setting(topic, courseTitle) {
  const key = normalized(`${topic} ${courseTitle}`);
  if (/preparation cutanee|antiseps|incision|champ operatoire/.test(key)) return 'Avant l’incision';
  if (/urgence|infection|complication|syndrome de loge|hemorrag|phlebite/.test(key)) return 'Devant un patient présentant ce tableau';
  if (/imagerie|radiograph|scanner|irm|cliche|bilan/.test(key)) return 'Lors de l’interprétation du bilan';
  if (/anatom|nerf|vaisseau|muscle|tendon|ligament|repere/.test(key)) return 'Lors de la préparation du geste';
  if (/postoper|suivi|reeducation|consolidation|mise en charge/.test(key)) return 'Au cours du suivi postopératoire';
  if (/implant|prothese|greff|fixation|osteosynth|arthro|chirurg|abord/.test(key)) return 'Lors de la planification opératoire';
  return 'Lors de la prise en charge orthopédique';
}

function directQuestion(original, context) {
  const text = plain(original).replace(/[\u00ab\u00bb]/g, '').replace(/\s*\?\s*$/, '').trim();
  if (/^(quand|comment|pourquoi|où|combien|à quel|quel niveau|quel côté|quelle voie|quelle technique)\b/i.test(text)) {
    return `${context}, ${lowercaseInitial(text)} ?`;
  }
  return null;
}

function qcmStem(original, label, courseTitle, ordinal) {
  const originalText = plain(original).replace(/[\u00ab\u00bb]/g, '').replace(/\s*\?\s*$/, '').trim();
  const embeddedProposition = originalText.match(/quelle proposition est exacte\s*:\s*(.+)$/i);
  if (embeddedProposition) {
    let target = embeddedProposition[1].trim();
    const association = target.match(/^(.+?)\s*:\s*association$/i);
    if (association) target = `l’association à ${association[1]}`;
    else target = target.replace(/\s*:\s*/g, ' — ');
    return `${setting(target, courseTitle)}, quels éléments orientent ${lowercaseInitial(target)} ?`;
  }
  const embeddedPropositionAbout = originalText.match(/quelle proposition est exacte concernant\s+(.+)$/i);
  if (embeddedPropositionAbout) {
    return `${setting(embeddedPropositionAbout[1], courseTitle)}, ${lowercaseInitial(embeddedPropositionAbout[1])} ?`;
  }
  const propositionWithoutTail = originalText.match(/^(.+?)\s*:\s*quelle proposition est exacte$/i);
  if (propositionWithoutTail) {
    return `${setting(propositionWithoutTail[1], courseTitle)}, quels éléments permettent d’interpréter ${lowercaseInitial(propositionWithoutTail[1])} ?`;
  }
  const embeddedPropositionWithoutTail = originalText.match(/dans\s+(?:le|la|les)\s+(.+?),\s*quelle proposition est exacte$/i);
  if (embeddedPropositionWithoutTail) {
    return `${setting(embeddedPropositionWithoutTail[1], courseTitle)}, quels éléments orientent la décision dans ${lowercaseInitial(embeddedPropositionWithoutTail[1])} ?`;
  }
  const alreadySituated = originalText.match(/^(pendant|avant|après|lors|au bloc)\b.+,\s*(.+)$/i);
  if (alreadySituated && !/\b(?:principe|repère)\b/i.test(originalText)) return `${originalText} ?`;
  const conduite = originalText.match(/^quelle conduite\s+(.+?)\s+r[ée]duit\s+(.+)$/i);
  if (conduite) return `${setting(conduite[1], courseTitle)}, comment réduire ${lowercaseInitial(conduite[2])} ?`;
  const marker = originalText.match(/^quel repère\s+doit\s+faire\s+interrompre\s+(.+)$/i);
  if (marker) return `${setting(marker[1], courseTitle)}, à quel moment faut-il interrompre ${lowercaseInitial(marker[1])} ?`;
  const genericMarker = originalText.match(/^quel repère\s+(.+)$/i);
  if (genericMarker) return `${setting(genericMarker[1], courseTitle)}, quel élément anatomique ${lowercaseInitial(genericMarker[1])} ?`;
  const embeddedMarker = originalText.match(/quel repère\s+(.+)$/i);
  if (embeddedMarker) return `${setting(embeddedMarker[1], courseTitle)}, quel élément anatomique ${lowercaseInitial(embeddedMarker[1])} ?`;
  const directPrinciple = originalText.match(/^quel principe permet à (.+?) de (.+)$/i);
  if (directPrinciple) {
    return `${setting(directPrinciple[1], courseTitle)}, comment ${lowercaseInitial(directPrinciple[1])} peut-il ${lowercaseInitial(directPrinciple[2])} ?`;
  }
  const mechanicalPrinciple = originalText.match(/^quel principe mécanique est utilisé par (.+)$/i);
  if (mechanicalPrinciple) return `${setting(mechanicalPrinciple[1], courseTitle)}, comment ${lowercaseInitial(mechanicalPrinciple[1])} agit-il mécaniquement ?`;
  const embeddedMechanicalPrinciple = originalText.match(/quel principe mécanique est utilisé par (.+)$/i);
  if (embeddedMechanicalPrinciple) return `${setting(embeddedMechanicalPrinciple[1], courseTitle)}, comment ${lowercaseInitial(embeddedMechanicalPrinciple[1])} agit-il mécaniquement ?`;
  const posteriorApproach = originalText.match(/quel principe est exact pour (.+)$/i);
  if (posteriorApproach) return `${setting(posteriorApproach[1], courseTitle)}, quels éléments sécurisent ${lowercaseInitial(posteriorApproach[1])} ?`;
  const draping = originalText.match(/quel principe de champage est décrit$/i);
  if (draping) return `${setting('champ opératoire', courseTitle)}, comment préparer le champ opératoire pour ce geste ?`;
  const definingPrinciple = originalText.match(/^quel principe (?:définit|caractérise) (.+)$/i);
  if (definingPrinciple) {
    return `${setting(definingPrinciple[1], courseTitle)}, comment caractériser ${lowercaseInitial(definingPrinciple[1])} ?`;
  }
  const guidingPrinciple = originalText.match(/^quel principe (?:guide|doit guider) (.+)$/i);
  if (guidingPrinciple) {
    return `${setting(guidingPrinciple[1], courseTitle)}, quels éléments doivent guider ${lowercaseInitial(guidingPrinciple[1])} ?`;
  }
  const embeddedGuidingPrinciple = originalText.match(/quel principe (?:guide|doit guider) (.+)$/i);
  if (embeddedGuidingPrinciple) {
    return `${setting(embeddedGuidingPrinciple[1], courseTitle)}, quels éléments doivent guider ${lowercaseInitial(embeddedGuidingPrinciple[1])} ?`;
  }
  const embeddedDefiningPrinciple = originalText.match(/quel principe définit (.+)$/i);
  if (embeddedDefiningPrinciple) {
    return `${setting(embeddedDefiningPrinciple[1], courseTitle)}, comment caractériser ${lowercaseInitial(embeddedDefiningPrinciple[1])} ?`;
  }
  const embeddedCharacterizingPrinciple = originalText.match(/quel principe caractérise (.+)$/i);
  if (embeddedCharacterizingPrinciple) {
    return `${setting(embeddedCharacterizingPrinciple[1], courseTitle)}, comment caractériser ${lowercaseInitial(embeddedCharacterizingPrinciple[1])} ?`;
  }
  const applicablePrinciple = originalText.match(/^quel principe de (.+) appliquer (.+)$/i);
  if (applicablePrinciple) {
    return `${setting(applicablePrinciple[1], courseTitle)}, comment appliquer ${lowercaseInitial(applicablePrinciple[1])} ${lowercaseInitial(applicablePrinciple[2])} ?`;
  }
  const preservingPrinciple = originalText.match(/quel principe respecte (.+)$/i);
  if (preservingPrinciple) {
    return `${setting(preservingPrinciple[1], courseTitle)}, comment préserver ${lowercaseInitial(preservingPrinciple[1])} ?`;
  }
  const priorPrinciple = originalText.match(/^quel principe doit précéder (.+)$/i);
  if (priorPrinciple) {
    return `${setting(priorPrinciple[1], courseTitle)}, quels critères doivent être évalués avant ${lowercaseInitial(priorPrinciple[1])} ?`;
  }
  const topic = cleanTopic(originalText, label);
  const context = setting(topic, courseTitle);
  const direct = directQuestion(original, context);
  if (direct && !/\b(?:principe|repère)\b/i.test(direct)) return direct;
  if (/préparation cutanée/i.test(topic)) {
    return `${context}, quelles mesures assurent une préparation cutanée initiale rigoureuse ?`;
  }
  const noArticle = topic.replace(/^l[’']|^(?:le|la|les|un|une|des)\s+/i, '');
  const problem = /^[aàâeéèêëiîïoôöuùûüh]/i.test(noArticle) ? `d’${lowercaseInitial(noArticle)}` : `de ${lowercaseInitial(noArticle)}`;
  const prompts = [
    `${context}, quels choix permettent de répondre au problème ${problem} ?`,
    `${context}, quels éléments doivent être contrôlés face au problème ${problem} ?`,
    `${context}, quelles données orientent la stratégie devant un problème ${problem} ?`,
    `${context}, quelles options de prise en charge sont adaptées à un problème ${problem} ?`,
    `${context}, quelles précautions sont indiquées lorsqu’un problème ${problem} est identifié ?`,
    `${context}, quels éléments permettent de caractériser un problème ${problem} ?`,
  ];
  return prompts[ordinal % prompts.length].replace(/\s+\?/g, ' ?');
}

function dpStem(original, label, courseTitle, ordinal) {
  const current = plain(original).replace(/[\u00ab\u00bb]/g, '').trim();
  if (!problematic.test(current)) return current;
  if (/^(?:quel principe|quel repère|quelle conduite)\b/i.test(current)) {
    return qcmStem(current, label, courseTitle, ordinal);
  }
  const topic = cleanTopic(current, label);
  const context = ordinal === 0 ? setting(topic, courseTitle) : 'À ce stade de la prise en charge';
  const text = current.replace(/^.*?\b(?:quel principe|quel repère)\b\s*/i, '').replace(/\s*\?\s*$/, '').trim();
  if (text && !/^quelle proposition est exacte/i.test(text) && !/^concernant\b/i.test(text)) {
    return `${context}, quelle attitude adopter pour ${lowercaseInitial(text)} ?`;
  }
  return qcmStem(current, label, courseTitle, ordinal);
}

function asChapter(snapshot) {
  const questionsBySeries = new Map();
  for (const question of snapshot.questions || []) {
    questionsBySeries.set(question.serie_id, [...(questionsBySeries.get(question.serie_id) || []), question]);
  }
  const itemsByQuestion = new Map();
  for (const item of snapshot.items || []) {
    itemsByQuestion.set(item.question_id, [...(itemsByQuestion.get(item.question_id) || []), item]);
  }
  let changed = 0;
  let flaggedBefore = 0;
  const series = (snapshot.series || []).sort(order).map((serie, serieIndex) => {
    const isDp = /^DP\b/i.test(serie.label || '') || serie.kind === 'dp';
    const questions = (questionsBySeries.get(serie.id) || []).sort(order).map((question, index) => {
      const original = plain(question.enonce);
      if (problematic.test(original)) flaggedBefore += 1;
      const enonce = isDp ? dpStem(original, serie.label, snapshot.course.titre, index) : qcmStem(original, serie.label, snapshot.course.titre, serieIndex * 5 + index);
      if (enonce !== original) changed += 1;
      if (problematic.test(enonce)) throw new Error(`Gabarit persistant : ${enonce}`);
      return {
        enonce,
        correction_generale: question.correction_generale || '',
        items: (itemsByQuestion.get(question.id) || []).sort((a, b) => String(a.lettre).localeCompare(String(b.lettre))).map((item) => ({
          lettre: item.lettre, enonce: item.enonce, is_correct: item.is_correct, justification: item.justification,
        })),
      };
    });
    return { label: serie.label, vignette: serie.vignette || '', questions };
  });
  return {
    changed,
    flaggedBefore,
    chapter: {
      title: snapshot.course.titre,
      provenance: { sourceOnly: true, note: 'Réécriture éditoriale des seuls énoncés QCM et DP à partir du paquet source publié.' },
      flashcards: (snapshot.flashcards || []).sort(order).map((card) => ({ recto: card.recto, verso: card.verso })),
      series,
    },
  };
}

const { data: foundCourses, error: courseError } = await supabase.from('cours').select('id,order_index,titre').eq('matiere_id', 'col-orthopedie').gte('order_index', min).lte('order_index', max).order('order_index');
if (courseError) throw courseError;
const courses = foundCourses.slice(0, limit);
const report = { generatedAt: new Date().toISOString(), scope: `cours.order_index ${min}..${max}`, planned: courses.length, results: [], failures: [] };
mkdirSync(corpus, { recursive: true });

for (const course of courses) {
  const root = join(corpus, `${String(course.order_index).padStart(3, '0')}-${normalized(course.titre).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 64)}`);
  try {
    execFileSync(process.execPath, ['_snapshot-orthopedie.mjs', course.id, root], { stdio: 'pipe' });
    const snapshotPath = latestSnapshot(root);
    const manifestPath = join(resolve(snapshotPath, '..'), 'manifest.json');
    const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
    const { chapter, changed, flaggedBefore } = asChapter(snapshot);
    const chapterPath = join(root, 'delivery', 'natural-questions.json');
    writeFileSync(chapterPath, `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
    execFileSync(process.execPath, ['_ins-chapter.mjs', course.id, chapterPath, '--replace', '--snapshot', manifestPath, '--question-stems-only'], { stdio: 'pipe' });
    const auditPath = join(root, 'delivery', 'strict-audit.json');
    execFileSync(process.execPath, ['_audit-orthopedie-production.mjs', auditPath, course.id], { stdio: 'pipe' });
    const row = JSON.parse(readFileSync(auditPath, 'utf8')).rows[0];
    if (row.studentScaffolding !== 0 || row.dpClinicalFailures !== 0) throw new Error(`audit strict: scaffolding=${row.studentScaffolding}, dp=${row.dpClinicalFailures}`);
    report.results.push({ orderIndex: course.order_index, coursId: course.id, title: course.titre, changed, flaggedBefore, audit: { defects: row.defects, studentScaffolding: row.studentScaffolding, dpClinicalFailures: row.dpClinicalFailures }, snapshot: manifestPath });
    console.log(`DONE ${course.order_index}/133 ${changed} énoncés réécrits`);
  } catch (error) {
    report.failures.push({ orderIndex: course.order_index, coursId: course.id, title: course.titre, error: error.stderr?.toString() || error.message });
    console.error(`FAILED ${course.order_index}/133: ${error.message}`);
  }
  writeFileSync(join(corpus, 'progress.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}
report.finishedAt = new Date().toISOString();
const reportPath = join(corpus, `report-${stamp}.json`);
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ completed: report.results.length, failed: report.failures.length, changed: report.results.reduce((sum, result) => sum + result.changed, 0), reportPath }));
