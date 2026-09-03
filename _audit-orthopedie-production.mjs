/**
 * Audits the currently published Orthopédie fiches with Chrome's HTML parser.
 * It is deliberately separate from generation: this is the source of truth
 * for prioritising repairs after every batch.
 *
 * Usage: node _audit-orthopedie-production.mjs [report.json]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer-core';

dotenv({ path: '.env.local' });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL manquants');
const chrome = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const supabase = createClient(url, key, { auth: { persistSession: false } });
const { data: courses, error: courseError } = await supabase
  .from('cours').select('id,order_index,titre').eq('matiere_id', 'col-orthopedie').order('order_index');
if (courseError) throw courseError;
// Optional course UUIDs make focused recovery audits fast and avoid treating a
// large all-college audit as the only way to validate one repair batch.
const requestedCourseIds = new Set(process.argv.slice(2).filter((arg) => /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(arg)));
const minArg = process.argv.indexOf('--min-order');
const maxArg = process.argv.indexOf('--max-order');
const minOrder = minArg >= 0 ? Number(process.argv[minArg + 1]) : -Infinity;
const maxOrder = maxArg >= 0 ? Number(process.argv[maxArg + 1]) : Infinity;
const auditedCourses = (requestedCourseIds.size ? courses.filter((course) => requestedCourseIds.has(course.id)) : courses)
  .filter((course) => course.order_index >= minOrder && course.order_index <= maxOrder);
if (requestedCourseIds.size && auditedCourses.length !== requestedCourseIds.size) {
  throw new Error(`Cours Orthopédie introuvable(s) : demandé ${requestedCourseIds.size}, trouvé ${auditedCourses.length}`);
}

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
const rows = [];
for (const course of auditedCourses) {
  const { data: fiche, error } = await supabase
    .from('fiches').select('pages,content_html,order_index').eq('cours_id', course.id).order('order_index').limit(1).maybeSingle();
  if (error) throw error;
  if (!fiche) {
    rows.push({ coursId: course.id, orderIndex: course.order_index, title: course.titre, status: 'missing' });
    continue;
  }
  // Signatures des anciens paquets mécaniques : elles imposent un remplacement
  // complet (fiche + séries + questions + items + cartes), jamais une retouche.
  const { data: series } = await supabase.from('qcm_series').select('id,label,vignette').eq('cours_id', course.id);
  const seriesIds = (series || []).map((serie) => serie.id);
  const { data: questions } = seriesIds.length
    ? await supabase.from('qcm_questions').select('enonce,serie_id').in('serie_id', seriesIds)
    : { data: [] };
  const { data: flashcards } = await supabase.from('flashcards').select('recto,verso').eq('cours_id', course.id);
  // Match normalized ASCII words: detection must not depend on file/terminal
  // encoding.  The second mechanical generator hid behind structurally valid
  // fiches with prompts such as “point N : quel élément retenir ?”.
  const normalizeWords = (text) => String(text || '').replace(/<[^>]+>/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const normalized = (text) => normalizeWords(text).replace(/ /g, '');
  const mechanicalPattern = /temps technique decrit dans le corpus|quel repere technique|synthese issue de|(?:^| )repere\s*\d+(?: |$)|(?:^| )(?:point|aspect)\s*\d+\s*quel (?:element|point) (?:faut il|doit on) retenir/i;
  const genericStemPattern = /^(?:a propos de|concernant) .{3,120} quelle proposition est exacte\s*$/i;
  // These prompts read like a generated template rather than a clinical or
  // operative question.  In particular, never expose an isolated source
  // fragment in quotation marks and ask the student to validate it.
  const templateQuestionPattern = /\bquelle conduite est (?:correcte|appropri[eé]e) concernant\b|\bquelle (?:proposition|affirmation) est exacte concernant\b|^(?:concernant|a propos de)\s+[«“"][^»”"]{3,}[»”"]|[«“"][^»”"]{3,}[»”"]\s*\?\s*$|\b(?:quel|quelle) (?:principe|rep[eè]re) (?:faut[- ]il|doit[- ]on|est) (?:retenir|conna[iî]tre|appliquer)\b/i;
  // Do not confuse valid temporal French ("au cours de la journée") with an
  // actual reference to the teaching material.
  const studentScaffoldingPattern = /\b(?:question|nouvel\s+élément|nouvel\s+element)\s*:\s*|\b(?:dans|selon|au regard du|à partir du)\s+(?:ce\s+)?(?:sous-thème|sous-theme|cours|chapitre|corpus)\b|\bce\s+(?:cours|chapitre|corpus)\b|\bqcm\s*[—–-]?\s*s[ée]rie\s*\d+/i;
  // This version runs after punctuation has been normalized away for the DP
  // progression check.  A medical question can naturally contain the noun
  // “question”; only the retired “nouvel élément” authoring label is unsafe.
  const normalizedStudentScaffoldingPattern = /\bnouvel element\b|\b(?:dans|selon|au regard du|a partir du)\s+(?:ce\s+)?(?:sous theme|cours|chapitre|corpus)\b|\bce\s+(?:cours|chapitre|corpus)\b|\bqcm\s*(?:serie)?\s*\d+/i;
  const unsupportedAnnalesPattern = /(?:★|tomb[ée] aux (?:evc|annales)|déjà tomb[ée])/i;
  // Do not flag valid French such as « âgé »: mojibake pairs use a high-byte
  // continuation character (Ã©, â€™, …), never a plain ASCII letter.
  const mojibakePattern = /(?:Ã[\u0080-\u00FF]|â[\u0080-\u00FF€]|�)/;
  const cleanQuestionStem = (text) => normalizeWords(text).replace(/^nouvel element [^.?]+[.?] /, '');
  const cardPrompts = new Set((flashcards || []).map((card) => normalized(card.recto)).filter(Boolean));
  // A QCM must test a decision or a discriminating proposition, not simply
  // repeat a flashcard prompt.  This detects the retired cards→QCM generator.
  const cardPromptQuestions = (questions || []).filter((question) => cardPrompts.has(normalized((question.enonce || '').replace(/^nouvel élément\s*:\s*/i, '')))).length;
  const genericQuestionCount = (questions || []).filter((question) => genericStemPattern.test(cleanQuestionStem(question.enonce))).length;
  const repeatedQuestionStems = Object.values((questions || []).reduce((counts, question) => {
    const stem = cleanQuestionStem(question.enonce);
    if (stem) counts[stem] = (counts[stem] || 0) + 1;
    return counts;
  }, {})).filter((count) => count > 1).reduce((sum, count) => sum + count, 0);
  // A repeated stem is diagnostic when it accompanies the generic
  // "Concernant … quelle proposition" generator.  It is deliberately not a
  // standalone blocker: a genuine clinical DP can revisit the same named
  // decision at two different stages of a vignette.
  const templateQuestionCount = (questions || []).filter((question) => templateQuestionPattern.test(String(question.enonce || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())).length;
  const mechanicalQuestions = (questions || []).filter((question) => mechanicalPattern.test(normalizeWords(question.enonce))).length
    + cardPromptQuestions + genericQuestionCount + templateQuestionCount + (genericQuestionCount ? repeatedQuestionStems : 0);
  const mechanicalCards = (flashcards || []).filter((card) => mechanicalPattern.test(normalizeWords(`${card.recto || ''} ${card.verso || ''}`))).length;
  const genericSeries = (series || []).filter((serie) => /^(QCM|DP)\s*\d+\s*$/i.test(serie.label || '')).length;
  const studentScaffolding = (questions || []).filter((question) => studentScaffoldingPattern.test(String(question.enonce || ''))).length;
  const unsupportedAnnales = unsupportedAnnalesPattern.test(String(fiche.content_html || ''))
    || (questions || []).some((question) => unsupportedAnnalesPattern.test(String(question.enonce || '')))
    || (flashcards || []).some((card) => unsupportedAnnalesPattern.test(`${card.recto || ''} ${card.verso || ''}`));
  const mojibake = mojibakePattern.test(String(fiche.content_html || ''))
    || (questions || []).some((question) => mojibakePattern.test(String(question.enonce || '')))
    || (flashcards || []).some((card) => mojibakePattern.test(`${card.recto || ''} ${card.verso || ''}`));
  // A DP is not a collection of QCMs with a vignette prepended.  Check the
  // patient, the follow-up and the clinical progression independently of the
  // package-count guard enforced at publication time.
  const dpClinicalFailures = (series || []).filter((serie) => /^DP\b/i.test(serie.label || '')).filter((serie) => {
    const vignette = normalizeWords(serie.vignette);
    const dpQuestions = (questions || []).filter((question) => question.serie_id === serie.id);
    const hasPatient = /\b(patient|patiente|homme|femme|adolescent|adolescente|garcon|fille|jeune adulte)\b/.test(vignette);
    const hasFollowUp = /\b(suivi|controle|postoperatoire|reeducation|mise en charge)\b/.test(vignette);
    const progresses = dpQuestions.length === 7 && dpQuestions.slice(1).every((question) => {
      const text = normalizeWords(question.enonce);
      return Boolean(text) && !normalizedStudentScaffoldingPattern.test(text);
    });
    const allGeneric = dpQuestions.length > 0 && dpQuestions.every((question) => genericStemPattern.test(cleanQuestionStem(question.enonce)));
    return !hasPatient || !hasFollowUp || !progresses || allGeneric;
  }).length;
  await page.setContent(`<!doctype html><html><body>${fiche.content_html || ''}</body></html>`, { waitUntil: 'load' });
  await page.waitForFunction(() => [...document.querySelectorAll('figure.ft-figure img')].every((image) => image.complete), { timeout: 5_000 }).catch(() => undefined);
  const metrics = await page.evaluate(() => {
    const ficheTables = [...document.querySelectorAll('table.fiche-table')];
    const tableErrors = ficheTables.filter((table) => table.querySelectorAll(':scope > thead > .ft-head-row').length !== 1 || table.querySelectorAll(':scope > thead > .ft-banner-row').length !== 1).length;
    const partHeaderErrors = [...document.querySelectorAll('section.partie-page')].filter((part) => {
      const tables = [...part.querySelectorAll(':scope > table.fiche-table')];
      return !tables.length || tables.slice(1).some((table) => !table.querySelector('.partie-banner-title--repeat'));
    }).length;
    return {
      textCharacters: document.body.innerText.replace(/\s+/g, ' ').trim().length,
      mechanicalFiche: /synthèse issue de|\brepère\s+\d+\b/i.test(document.body.innerText),
      parts: document.querySelectorAll('section.partie-page').length,
      ficheTables: ficheTables.length,
      tableErrors,
      partHeaderErrors,
      bareDetails: document.querySelectorAll('td.ft-detail:not(.content)').length,
      paragraphDetails: [...document.querySelectorAll('td.ft-detail.content')].filter((cell) => cell.querySelector(':scope > p')).length,
      listlessDetails: [...document.querySelectorAll('td.ft-detail.content')].filter((cell) => !cell.querySelector(':scope > ul')).length,
      figures: document.querySelectorAll('figure.ft-figure').length,
      brokenFigureImages: [...document.querySelectorAll('figure.ft-figure img')].filter((image) => !image.getAttribute('src')?.trim() || image.naturalWidth === 0 || image.naturalHeight === 0).length,
      nestedLists: document.querySelectorAll('td.ft-detail.content ul ul').length,
      synthesis: document.querySelectorAll('section.synthese-page').length,
      eclair: document.querySelectorAll('.eclair-card').length,
    };
  });
  metrics.mechanicalQuestions = mechanicalQuestions;
  metrics.cardPromptQuestions = cardPromptQuestions;
  metrics.genericQuestionCount = genericQuestionCount;
  metrics.templateQuestionCount = templateQuestionCount;
  metrics.repeatedQuestionStems = repeatedQuestionStems;
  metrics.dpClinicalFailures = dpClinicalFailures;
  metrics.mechanicalCards = mechanicalCards;
  metrics.genericSeries = genericSeries;
  metrics.studentScaffolding = studentScaffolding;
  metrics.unsupportedAnnales = unsupportedAnnales;
  metrics.mojibake = mojibake;
  const defects = [
    ...(metrics.parts < 4 || metrics.parts > 7 ? ['parts'] : []),
    ...(metrics.tableErrors || metrics.partHeaderErrors ? ['table-head'] : []),
    ...(metrics.bareDetails ? ['bare-detail'] : []),
    ...(metrics.paragraphDetails ? ['paragraph-detail'] : []),
    ...(metrics.listlessDetails ? ['listless-detail'] : []),
    ...(metrics.brokenFigureImages ? ['broken-figure'] : []),
    ...(metrics.mechanicalFiche || metrics.mechanicalQuestions || metrics.mechanicalCards || metrics.genericSeries ? ['mechanical-content'] : []),
    ...(metrics.studentScaffolding ? ['student-scaffolding'] : []),
    ...(metrics.unsupportedAnnales ? ['unsupported-annales'] : []),
    ...(metrics.mojibake ? ['encoding'] : []),
    ...(metrics.dpClinicalFailures ? ['dp-clinical'] : []),
    ...(metrics.synthesis !== 1 || metrics.eclair !== 1 ? ['missing-summary'] : []),
    ...(fiche.pages < 7 || fiche.pages > 40 || metrics.textCharacters > 50000 ? ['length'] : []),
  ];
  rows.push({ coursId: course.id, orderIndex: course.order_index, title: course.titre, pages: fiche.pages, ...metrics, defects, status: defects.length ? 'repair' : 'ok' });
}
await browser.close();
const report = {
  generatedAt: new Date().toISOString(),
  totals: { courses: rows.length, ok: rows.filter((row) => row.status === 'ok').length, repair: rows.filter((row) => row.status === 'repair').length, missing: rows.filter((row) => row.status === 'missing').length },
  rows,
};
const outputPath = process.argv.slice(2).find((arg) => arg.toLowerCase().endsWith('.json'));
if (outputPath) {
  if (basename(resolve(outputPath)).toLowerCase() === 'worklist.json') {
    throw new Error('Refus de remplacer worklist.json par un rapport d’audit. Choisir un chemin audit-production-*.json.');
  }
  mkdirSync(dirname(resolve(outputPath)), { recursive: true });
  writeFileSync(resolve(outputPath), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}
console.log(JSON.stringify(report.totals));
console.table(rows.filter((row) => row.status !== 'ok').map((row) => ({ n: row.orderIndex, status: row.status, pages: row.pages, defects: (row.defects || []).join(','), title: row.title })));
