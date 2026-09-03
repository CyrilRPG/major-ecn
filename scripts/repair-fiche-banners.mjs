/**
 * Normalise les en-têtes de sous-parties des anciennes fiches HTML.
 *
 * Les premiers exports Orthopédie avaient bien une ligne `ft-banner-row`,
 * mais y plaçaient du texte brut. La charte Major ECN attend les deux spans
 * qui portent respectivement le numéro de partie et son intitulé ; les
 * sous-parties suivantes répètent explicitement le titre de la partie.
 *
 * Usage: node scripts/repair-fiche-banners.mjs <input.html> <output.html>
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer-core';

const [, , inputArg, outputArg] = process.argv;
if (!inputArg || !outputArg) {
  console.error('usage: node scripts/repair-fiche-banners.mjs <input.html> <output.html>');
  process.exit(1);
}

const chrome = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const source = readFileSync(resolve(inputArg), 'utf8');
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setContent(`<!doctype html><html lang="fr"><body>${source}</body></html>`, { waitUntil: 'load' });

const result = await page.evaluate(() => {
  const roman = (value) => {
    const number = Number(value);
    if (!Number.isInteger(number) || number < 1 || number > 7) return String(value).trim();
    return ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][number - 1];
  };
  const changes = [];
  for (const [partIndex, part] of [...document.querySelectorAll('section.partie-page[id^="partie-"]')].entries()) {
    const tables = [...part.querySelectorAll(':scope > table.fiche-table')];
    for (const [tableIndex, table] of tables.entries()) {
      const thead = table.querySelector(':scope > thead');
      if (!thead) continue;
      const banners = [...thead.querySelectorAll(':scope > .ft-banner-row')];
      const banner = banners[0];
      if (!banner) continue;
      // Ne jamais laisser une double bannière : l'audit exige exactement une.
      banners.slice(1).forEach((node) => node.remove());
      const cell = banner.querySelector(':scope > td[colspan="2"]') || banner.querySelector(':scope > td');
      if (!cell) continue;
      const raw = cell.textContent.replace(/\s+/g, ' ').trim();
      const match = raw.match(/^(?:partie\s*)?([ivxlcdm]+|\d+)\s*[—–-]\s*(.+)$/i);
      const headerTag = table.querySelector(':scope > thead > .ft-head-row .ft-tag')?.textContent?.trim();
      const number = roman(match?.[1] || headerTag || partIndex + 1);
      const title = match?.[2]?.trim() || raw || `Partie ${number}`;
      cell.replaceChildren();
      const numberNode = document.createElement('span');
      numberNode.className = 'partie-banner-num';
      numberNode.textContent = number;
      const titleNode = document.createElement('span');
      titleNode.className = `partie-banner-title${tableIndex > 0 ? ' partie-banner-title--repeat' : ''}`;
      titleNode.textContent = title;
      cell.append(numberNode, titleNode);
      changes.push({ part: partIndex + 1, table: tableIndex + 1, number, title, repeated: tableIndex > 0 });
    }
  }
  return { html: document.body.innerHTML, changes };
});
await browser.close();
writeFileSync(resolve(outputArg), result.html, 'utf8');
console.log(JSON.stringify({ output: resolve(outputArg), changes: result.changes }, null, 2));
