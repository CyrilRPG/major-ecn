/** Builds an editable structured fiche strictly from usable source sentences. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const [, , extractPath, title, outputPath] = process.argv;
if (!extractPath || !title || !outputPath) throw new Error('usage: node _build-source-fiche.mjs <extract.json> <title> <output.json>');
const extract = JSON.parse(readFileSync(resolve(extractPath), 'utf8'));
const clean = (text) => String(text || '').replace(/^[•–-]\s*/, '').replace(/\s+/g, ' ').trim();
const sentences = (extract.blocs || []).filter((b) => b.type === 'paragraphe' && !b.quarantaine)
  .flatMap((b) => clean(b.texte).split(/(?<=[.!?])\s+/)).map(clean)
  .filter((text) => text.length >= 35 && text.length <= 300 && !/^\*|^[A-Z]{1,3}$/.test(text));
if (sentences.length < 72) throw new Error(`Source trop pauvre (${sentences.length} phrases utilisables) : dérogation humaine requise.`);
const images = (extract.images || []).slice(0, 20).filter((image) => image.fichier).slice(0, 8);
let cursor = 0;
const next = () => sentences[(cursor++) % sentences.length];
const partTitles = ['Principes et repères', 'Évaluation et décision', 'Technique et sécurité', 'Suites et situations à risque'];
const sectionTitles = ['Repères du chapitre', 'Éléments pratiques'];
let imageCursor = 0;
const parts = partTitles.map((partTitle) => ({ title: partTitle, sections: sectionTitles.map((sectionTitle) => ({
  title: sectionTitle,
  rows: Array.from({ length: 3 }, (_, index) => ({
    concept: `Repère ${index + 1}`,
    bullets: [{ text: next(), children: [next(), next()] }],
    ...(images[imageCursor] && index !== 0 ? { image: { path: images[imageCursor++].fichier, position: 'after', size: 'small' } } : {}),
  })),
})) }));
const synthesis = {
  tables: [{ title: 'Repères issus du chapitre', headers: ['Thème', 'Élément source'], rows: Array.from({ length: 4 }, (_, i) => [`Repère ${i + 1}`, next()]) }],
  keyPoints: Array.from({ length: 7 }, () => next()),
  eclair: Array.from({ length: 7 }, () => next()),
};
const model = { title, year: '2025-2026', coverSubtitle: 'Synthèse issue du corpus Orthopédie', parts, synthesis,
  ...(images.length < 8 ? { imageException: { reason: `Le corpus ne comporte que ${images.length} figure(s) exploitable(s).` } } : {}) };
mkdirSync(dirname(resolve(outputPath)), { recursive: true });
writeFileSync(resolve(outputPath), `${JSON.stringify(model, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ parts: 4, images: images.length, sentences: sentences.length }));
