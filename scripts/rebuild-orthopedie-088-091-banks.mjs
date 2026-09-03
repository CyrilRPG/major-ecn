/**
 * Rebuilds the four corrupted 88–91 learning banks exclusively from the
 * published fiche of the same course.  Those fiches are the clean, validated
 * transcription of their respective source documents; no content is borrowed
 * from another course.  The script only emits chapter packages: publication
 * remains transactional through _ins-chapter.mjs after a snapshot.
 *
 * Usage: node scripts/rebuild-orthopedie-088-091-banks.mjs <output-root>
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer-core';

dotenv({ path: '.env.local' });
const outputRoot = process.argv[2];
if (!outputRoot) throw new Error('Usage: node rebuild-orthopedie-088-091-banks.mjs <output-root>');
const targets = [
  { id: 'fa84180f-c558-4e32-a12b-cbfe6ad51613', order: 88, slug: 'resurfacage-de-hanche', title: 'Resurfaçage de hanche' },
  { id: 'd0396f85-d665-4202-8f36-b15f8aaf6d08', order: 89, slug: 'revision-de-prothese-d-epaule', title: "Révision de prothèse d’épaule" },
  { id: '63d562fe-1abe-404c-b3ed-43d5ac75c434', order: 90, slug: 'revision-des-protheses-totales-de-coude', title: 'Révision des prothèses totales de coude' },
  { id: '0d32588f-44ca-4814-8b4b-26b7d2805d4d', order: 91, slug: 'ruptures-de-l-appareil-extenseur-du-genou-et-fractures-de-la-rotule', title: "Ruptures de l’appareil extenseur du genou et fractures de la rotule" },
];
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL manquants');
const supabase = createClient(url, key, { auth: { persistSession: false } });
const chrome = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();

const normalize = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').replace(/^[•·—–\-\s]+/, '').trim();
const badEncoding = (value) => /(?:Ã[\u0080-\u00ff]|â[\u0080-\u00ff€]|�)/.test(String(value || ''));
const qcmThemes = ['Indications et stratégie', 'Bilan et planification', 'Voies d’abord', 'Technique opératoire', 'Matériel et gestes associés', 'Complications et prévention', 'Suites et rééducation', 'Décision en situation complexe'];
const dpLeads = ['Au temps initial', 'Après l’évaluation clinique', 'Lors de la planification', 'Pendant le geste', 'Au contrôle peropératoire', 'Au premier suivi postopératoire', 'Au suivi radioclinique'];

function uniqueFacts(rawFacts) {
  const seen = new Set();
  return rawFacts.filter((fact) => {
    const key = normalize(fact.answer);
    if (!key || key.length < 18 || key.length > 280 || seen.has(key) || badEncoding(fact.answer) || badEncoding(fact.concept)) return false;
    seen.add(key); return true;
  });
}
function compactFact(fact) {
  // Flashcard backs stay readable by retaining the first complete source
  // sentence.  When that sentence is too long, use a visibly abbreviated
  // verbatim excerpt rather than manufacturing a paraphrase.
  let firstSentence = String(fact.answer || '').split(/(?<=[.!?])\s+/)[0].trim();
  if (!firstSentence) return null;
  if (firstSentence.length > 150) {
    const excerpt = firstSentence.slice(0, 146).replace(/\s+\S*$/, '').trim();
    firstSentence = `${excerpt}…`;
  }
  return { ...fact, answer: firstSentence };
}
function cloze(concept, answer, variant = 0) {
  const words = answer.replace(/\.$/, '').split(/\s+/);
  const mask = Math.max(1, Math.min(4, Math.floor(words.length / 4)));
  if (!variant) {
    const cue = [...words.slice(0, Math.max(2, words.length - mask)), '…'].join(' ');
    return `${concept} — complétez : ${cue}`;
  }
  const cue = [...words.slice(0, Math.min(6, words.length)), '…'].join(' ');
  return `${concept} — identifiez l’affirmation complète : ${cue}`;
}
function contextQuestion(concept, prefix) {
  return `${prefix}, quelle proposition décrit correctement ${concept.toLowerCase()} ?`;
}
function itemsFor(facts, index) {
  const offsets = [0, 17, 31, 53, 71];
  return offsets.map((offset, itemIndex) => {
    const fact = facts[(index + offset) % facts.length];
    return { lettre: String.fromCharCode(65 + itemIndex), enonce: fact.answer, is_correct: itemIndex === 0, justification: itemIndex === 0 ? 'Cette proposition reprend la fiche source de ce cours.' : 'Cette proposition relève d’un autre point de la fiche source.' };
  });
}
function makeSeries(target, facts) {
  const qcm = Array.from({ length: 8 }, (_, seriesIndex) => ({
    label: `QCM ${seriesIndex + 1} — ${qcmThemes[seriesIndex]}`,
    vignette: null,
    questions: Array.from({ length: 5 }, (_, questionIndex) => {
      const factIndex = (seriesIndex * 5 + questionIndex) % facts.length;
      const fact = facts[factIndex];
      return {
        enonce: contextQuestion(fact.concept, 'En pratique'),
        correction_generale: 'Correction fondée exclusivement sur la fiche source du cours.',
        items: itemsFor(facts, factIndex),
      };
    }),
  }));
  const dp = Array.from({ length: 8 }, (_, seriesIndex) => ({
    label: `DP ${seriesIndex + 1} — ${qcmThemes[seriesIndex]}`,
    vignette: `<p><strong>${seriesIndex % 2 ? 'Patiente' : 'Patient'} de ${48 + seriesIndex * 4} ans</strong> pris${seriesIndex % 2 ? 'e' : ''} en charge pour une situation relevant de ${target.title.toLowerCase()}. Le bilan clinique, l’imagerie et les contraintes fonctionnelles sont discutés avant toute décision.</p><p><strong>Au suivi postopératoire</strong>, la douleur, la fonction, la stabilité et les complications éventuelles sont réévaluées avec une adaptation progressive de la rééducation.</p>`,
    questions: Array.from({ length: 7 }, (_, questionIndex) => {
      const factIndex = (40 + seriesIndex * 7 + questionIndex) % facts.length;
      const fact = facts[factIndex];
      return {
        enonce: contextQuestion(fact.concept, dpLeads[questionIndex]),
        correction_generale: 'Correction fondée exclusivement sur la fiche source du cours.',
        items: itemsFor(facts, factIndex),
      };
    }),
  }));
  return [...qcm, ...dp];
}

const report = [];
for (const target of targets) {
  const { data: fiche, error } = await supabase.from('fiches').select('content_html').eq('cours_id', target.id).order('order_index').limit(1).single();
  if (error) throw error;
  await page.setContent(`<!doctype html><html><body>${fiche.content_html || ''}</body></html>`, { waitUntil: 'load' });
  const extracted = await page.evaluate(() => [...document.querySelectorAll('tr')].flatMap((row) => {
    const concept = row.querySelector('.ft-concept')?.innerText.replace(/\s+/g, ' ').trim();
    const detail = row.querySelector('.ft-detail');
    if (!concept || !detail) return [];
    return [...detail.querySelectorAll('li')].map((item) => {
      const copy = item.cloneNode(true);
      copy.querySelectorAll('ul,ol').forEach((child) => child.remove());
      return { concept, answer: copy.textContent.replace(/\s+/g, ' ').trim() };
    });
  }));
  const facts = uniqueFacts(extracted
    .map((fact) => compactFact({ concept: cleanText(fact.concept), answer: cleanText(fact.answer) }))
    .filter(Boolean));
  if (facts.length < 50) throw new Error(`${target.slug}: source propre insuffisante (${facts.length} faits exploitables)`);
  const selected = facts.slice(0, 120);
  const chapter = {
    title: target.title,
    provenance: { sourceOnly: true, source: 'Fiche éditable validée du même cours', note: 'Reconstruction de la banque à partir des seuls faits lisibles de la fiche source correspondante.' },
    flashcards: Array.from({ length: 100 }, (_, index) => {
      const fact = selected[index % selected.length];
      return { recto: cloze(fact.concept, fact.answer, Math.floor(index / selected.length)), verso: fact.answer, source: ['fiche-source'] };
    }),
    series: makeSeries(target, selected),
  };
  const courseDir = resolve(outputRoot, `${String(target.order).padStart(3, '0')}-${target.slug}`);
  mkdirSync(courseDir, { recursive: true });
  const output = join(courseDir, 'chapter-source-only.json');
  writeFileSync(output, `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
  report.push({ ...target, output, availableFacts: facts.length, flashcards: chapter.flashcards.length, series: chapter.series.length, questions: chapter.series.reduce((count, serie) => count + serie.questions.length, 0) });
}
await browser.close();
const reportPath = resolve(outputRoot, 'report.json');
writeFileSync(reportPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), scope: 'courses 88-91 only', rows: report }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report));
