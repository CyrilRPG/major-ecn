import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dir = resolve('../.corpus-orthopedie/voies-d-abord-du-femur');
const out = join(dir, 'delivery', 'source-quality-v2');
mkdirSync(out, { recursive: true });
const repair = (v) => {
  let s = String(v ?? '');
  for (let i = 0; i < 3 && /(?:Ã.|â€™|Â.)/.test(s); i += 1) {
    const next = Buffer.from(s, 'latin1').toString('utf8');
    if (next.includes('�') || next === s) break;
    s = next;
  }
  return s;
};
const deep = (v) => Array.isArray(v) ? v.map(deep) : v && typeof v === 'object'
  ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deep(x)])) : typeof v === 'string' ? repair(v) : v;
const chapter = deep(JSON.parse(readFileSync(join(dir, 'delivery', 'quality-v1', 'chapter.json'), 'utf8')));
chapter.title = 'Voies d’abord du fémur';
for (const serie of chapter.series) {
  for (const question of serie.questions) {
    const stem = String(question.enonce || '');
    question.enonce = /^Nouvel élément\s*:/i.test(stem)
      ? stem.replace(/^Nouvel élément\s*:/i, 'Nouvel élément : dans la planification de cette voie fémorale,')
      : `Dans la planification de cette voie fémorale, ${stem.charAt(0).toLowerCase()}${stem.slice(1)}`;
  }
}
chapter.provenance = { ...chapter.provenance, sourceOnly: true, clinicalFraming: 'Vignettes et assertions techniques rattachées uniquement au corpus ; questions reformulées pour évaluer une décision, sans cloner les cartes.' };
writeFileSync(join(out, 'chapter.json'), `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ title: chapter.title, cards: chapter.flashcards.length, series: chapter.series.length }));
