import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const chapterDir = resolve(process.argv[2] || '../.corpus-orthopedie/pth-sans-ciment');
const source = join(chapterDir, 'delivery', 'source-quality-v3');
const out = resolve(process.argv[3] || join(chapterDir, 'delivery', '2026-08-10-quality-repair'));

mkdirSync(out, { recursive: true });
for (const name of ['fiche.body.html', 'fiche.html', 'fiche.model.json', 'coverage.json']) {
  cpSync(join(source, name), join(out, name));
}

const chapter = JSON.parse(readFileSync(join(source, 'chapter.json'), 'utf8'));
const questionUpdates = new Map([
  [
    'Que traduit une tige « avalée » par le fémur ?',
    'Lors de la réduction d’essai, comment interpréter une tige qui paraît trop enfoncée dans le fémur ?',
  ],
  [
    'Quelle conduite devant une fissure du calcar ?',
    'Pendant l’impaction de la tige, une fissure du calcar est identifiée : quelle conduite est indiquée ?',
  ],
  [
    'Quel repère vérifie le bon niveau de la râpe ABGII ?',
    'Au cours de la préparation fémorale par voie antérieure, quel signe vérifie la hauteur adaptée de la râpe ABGII ?',
  ],
]);
for (const serie of chapter.series) {
  for (const question of serie.questions) {
    if (questionUpdates.has(question.enonce)) question.enonce = questionUpdates.get(question.enonce);
  }
}
for (const card of chapter.flashcards) {
  if (card.recto === 'Quel repère doit atteindre l’épaule de la râpe ABGII ?') {
    card.recto = 'Quelle hauteur de râpe ABGII est recherchée lors de la préparation fémorale ?';
  }
}
chapter.provenance = {
  ...(chapter.provenance || {}),
  extract: 'extract.json',
  sourceOnly: true,
  note: 'Révision ciblée : formulations cliniques des QCM, suppression des intitulés de type repère et des doublons exacts cartes–QCM.',
};
writeFileSync(join(out, 'chapter.json'), `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
console.log('Package PTH sans ciment prêt');
