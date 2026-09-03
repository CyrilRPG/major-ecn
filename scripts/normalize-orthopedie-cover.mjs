/**
 * Remplace une page de garde HTML historique par la couverture Major ECN
 * actuelle, sans toucher au corps médical. Les données proviennent de la
 * fiche elle-même : titre stocké et titres de parties.
 *
 * Usage: node scripts/normalize-orthopedie-cover.mjs <editable-body.html>
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const path = resolve(process.argv[2] || '');
if (!process.argv[2]) process.exit(1);
const source = readFileSync(path, 'utf8');
const firstPart = source.search(/<section class="partie-page[^>]*id="partie-1"/);
const title = /string-source--cours">([\s\S]*?)<\/span>/.exec(source)?.[1]?.trim();
if (firstPart < 0 || !title) {
  console.error('Couverture ou première partie introuvable.');
  process.exit(2);
}
// Restrict the plan to actual course parts: the synthesis page also carries a
// visual banner but must never appear as an additional numbered part.
const partTitles = [...source.matchAll(/<section class="partie-page[^>]*>[\s\S]*?<span class="partie-banner-title(?:[^"]*)">([\s\S]*?)<\/span>/g)]
  .map((match) => match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
  .filter((value, index, values) => value && values.indexOf(value) === index)
  .slice(0, 7);
if (partTitles.length < 4 || partTitles.length > 7) {
  console.error(`Nombre de parties invalide pour la couverture : ${partTitles.length}`);
  process.exit(3);
}
const titleText = title.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const titleDisplay = titleText.length > 52
  ? titleText.split(' ').reduce((lines, word) => {
    const current = lines.at(-1) || '';
    if (!current || `${current} ${word}`.length <= 22) {
      lines[lines.length - 1] = current ? `${current} ${word}` : word;
    } else {
      lines.push(word);
    }
    return lines;
  }, ['']).filter(Boolean).join('<br>')
  : title;
const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const plan = partTitles.map((part, index) => `<li class="cover-plan-item"><a class="cover-plan-link" href="#partie-${index + 1}"><span class="cover-plan-num">${roman[index]}</span><span class="cover-plan-text">${part}</span></a></li>`).join('');
const titleClass = title.replace(/<[^>]+>/g, '').length > 52 ? 'cover-title cover-title--long' : 'cover-title';
const cover = `<div class="page-watermark"><img src="__IMG_1__" alt=""></div><span class="string-source string-source--cours">${title}</span><span class="string-source string-source--footer">Major ECN&nbsp;&middot;&nbsp;2025-2026</span><section class="cover"><div class="cover-band"></div><div class="cover-content"><div class="cover-head"><img class="cover-logo" src="__IMG_2__" alt="Major ECN"><div class="cover-matiere">Orthopédie</div><h1 class="${titleClass}">${titleDisplay}</h1><div class="cover-year">Année&nbsp;2025-2026</div></div><div class="cover-plan"><div class="cover-section-label">Plan du cours</div><ol class="cover-plan-list">${plan}</ol></div><div class="cover-legend"><div class="cover-section-label">Légende</div><div class="cover-legend-items"><span class="cover-legend-item"><span class="cover-legend-sym cover-legend-sym--1">★</span><span class="cover-legend-text">Déjà tombé aux EVC</span></span><span class="cover-legend-item"><span class="cover-legend-sym cover-legend-sym--2">◆</span><span class="cover-legend-text">Notion à haut rendement</span></span><span class="cover-legend-item"><span class="cover-legend-sym cover-legend-sym--3">⚠</span><span class="cover-legend-text">Piège classique</span></span></div></div></div></section>`;
const brandedCover = cover.replaceAll('__IMG_1__', '__WATERMARK__').replaceAll('__IMG_2__', '__LOGO__');
writeFileSync(path, `${brandedCover}${source.slice(firstPart)}`, 'utf8');
console.log(`✓ Couverture Major ECN normalisée : ${path}`);
