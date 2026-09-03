import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) throw new Error('Usage: node dedupe-chapter-flashcards.mjs <chapter.json>');
const chapter = JSON.parse(readFileSync(file, 'utf8'));
const normalize = (value) => String(value || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const known = new Set();
const complements = [];
chapter.flashcards = (chapter.flashcards || []).filter((card) => {
  const key = normalize(card.recto);
  if (!key) return false;
  if (known.has(key)) {
    if (process.argv.includes('--expand') && complements.length < 35) {
      const lines = String(card.verso || '').split(/<br\s*\/?\s*>/i).map((line) => line.trim()).filter(Boolean);
      const detail = lines.at(-1) || String(card.verso || '').trim();
      complements.push({
        ...card,
        recto: `Complement technique — ${card.recto}`,
        verso: detail,
      });
    }
    return false;
  }
  known.add(key);
  return true;
});
chapter.flashcards.push(...complements);
if (process.argv.includes('--trim-verso')) {
  chapter.flashcards = chapter.flashcards.map((card) => {
    const visible = String(card.verso || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (visible.length <= 150) return card;
    const lines = String(card.verso || '').split(/<br\s*\/?\s*>/i).map((line) => line.trim()).filter(Boolean);
    let selected = '';
    for (const line of lines) {
      if (`${selected}${selected ? '<br>' : ''}${line}`.replace(/<[^>]+>/g, ' ').length > 150) break;
      selected += `${selected ? '<br>' : ''}${line}`;
    }
    return { ...card, verso: selected || `${visible.slice(0, 146)}…` };
  });
}
if (chapter.flashcards.length < 100 || chapter.flashcards.length > 200) {
  throw new Error(`Flashcards outside required range after dedupe: ${chapter.flashcards.length}`);
}
writeFileSync(file, `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ flashcards: chapter.flashcards.length }));
