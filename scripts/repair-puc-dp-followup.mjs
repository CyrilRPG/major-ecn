import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const chapterPath = resolve(process.argv[2] || '');
if (!chapterPath) throw new Error('Usage: node scripts/repair-puc-dp-followup.mjs <chapter.json>');

const chapter = JSON.parse(readFileSync(chapterPath, 'utf8'));
const dps = chapter.series?.filter((series) => /^DP\b/i.test(series.label || '')) || [];
if (dps.length !== 8) throw new Error(`8 DP attendus, ${dps.length} reçus`);

for (const dp of dps) {
  const text = String(dp.vignette || '');
  if (!/\b(suivi|contrôle|postopératoire|rééducation|mise en charge)\b/i.test(text)) {
    dp.vignette = `${text}<p>Le patient est revu en consultation de <strong>suivi postopératoire</strong> : l'évolution fonctionnelle et les contrôles programmés orientent la suite de la prise en charge.</p>`;
  }
}

// Les dénominations commerciales et les chiffres isolés servent d'illustration
// dans le corpus, mais ne constituent pas des objectifs de mémorisation utiles.
// On garde la notion technique, sans transformer un exemple en flashcard.
const replacements = new Map([
  ['Un exemple de chaque type de prothèse ?', {
    recto: 'Quels sont les deux grands concepts de prothèse unicompartimentale ?',
    verso: 'Prothèse par <strong>coupe</strong><br>Prothèse par <strong>resurfaçage</strong>',
  }],
  ['Exemple de hauteur de coupe tibiale ?', {
    recto: 'Comment planifier la hauteur de résection tibiale lors d’une UNI ?',
    verso: 'Intégrer l’épaisseur des composants<br>Préserver une laxité adaptée<br>Vérifier l’équilibre ligamentaire',
  }],
  ['Quels exemples de systèmes de stabilisation antéropostérieure ?', {
    recto: 'Quels mécanismes peuvent assurer la stabilité sagittale d’une PTG ?',
    verso: 'Conservation du LCP<br>Congruence articulaire<br>Dispositif de stabilisation antéropostérieure',
  }],
]);
for (const card of chapter.flashcards || []) {
  const replacement = replacements.get(card.recto);
  if (replacement) Object.assign(card, replacement);
}

writeFileSync(chapterPath, `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
console.log(`DP normalisés : ${dps.length}`);
