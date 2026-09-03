import { readFileSync, writeFileSync } from 'node:fs';
const path = process.argv[2];
const chapter = JSON.parse(readFileSync(path, 'utf8'));
for (const card of chapter.flashcards) {
  card.recto = String(card.recto)
    .replace(/^Quel repère technique faut-il connaître pour /i, 'Quelle information technique est déterminante pour ')
    .replace(/^Quel principe biomécanique concerne /i, 'Quel principe biomécanique s’applique à ');
}
writeFileSync(path, `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
console.log('Rectos rachis assainis');
