import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { compileFicheModel } from './orthopedie-fiche.mjs';

// Intentionally only compiles and validates authored data.  It must never turn
// flashcards into QCM options: that shortcut was the source of repetitive,
// incoherent student content.
export function emitOrthopediePackage({ chapterDir, outputDir, fiche, facts, series }) {
  const dir = resolve(chapterDir);
  const out = resolve(outputDir || join(dir, 'delivery', 'source-quality-v2'));
  if (!Array.isArray(facts) || facts.length < 100 || facts.length > 200) {
    throw new Error(`100–200 cartes requises, reçu ${facts?.length ?? 0}`);
  }
  if (!Array.isArray(series) || series.length !== 16) {
    throw new Error('16 séries rédigées requises (8 QCM + 8 DP).');
  }
  const seen = new Set();
  for (const fact of facts) {
    const key = String(fact.recto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\W/g, '');
    if (!key || seen.has(key)) throw new Error(`Recto vide ou dupliqué : ${fact.recto}`);
    seen.add(key);
  }
  for (const [seriesIndex, entry] of series.entries()) {
    const isDp = /^DP\b/i.test(entry.label ?? '');
    const expected = isDp ? 7 : 5;
    if (!Array.isArray(entry.questions) || entry.questions.length !== expected) {
      throw new Error(`Série ${seriesIndex + 1}: ${expected} questions rédigées attendues.`);
    }
    for (const question of entry.questions) {
      if (!question.enonce || !Array.isArray(question.items) || question.items.length !== 5 || !question.items.some(item => item.is_correct)) {
        throw new Error(`Question invalide dans ${entry.label}.`);
      }
    }
  }
  const dp = series.filter(entry => /^DP\b/i.test(entry.label ?? ''));
  const qcm = series.filter(entry => /^QCM\b/i.test(entry.label ?? ''));
  if (dp.length !== 8 || qcm.length !== 8) throw new Error('Répartition attendue : 8 QCM et 8 DP.');
  mkdirSync(out, { recursive: true });
  const chapter = {
    title: fiche.title,
    provenance: { extract: 'extract.json', sourceOnly: true, clinicalFraming: 'Questions et cartes rédigées et sourcées individuellement.' },
    flashcards: facts,
    series,
  };
  writeFileSync(join(out, 'fiche.model.json'), `${JSON.stringify(fiche, null, 2)}\n`, 'utf8');
  writeFileSync(join(out, 'fiche.body.html'), compileFicheModel(fiche, dir), 'utf8');
  writeFileSync(join(out, 'chapter.json'), `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
  writeFileSync(join(out, 'coverage.json'), `${JSON.stringify({ sourceBlocks: fiche.sourceBlocks, flashcards: facts.length, qcm: 40, dp: 56 }, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ title: fiche.title, outputDir: out, flashcards: facts.length, qcm: qcm.length, dp: dp.length }));
}
