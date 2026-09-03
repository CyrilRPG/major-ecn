import { readFileSync, writeFileSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const [snapshotFile, outputFile] = process.argv.slice(2);
if (!snapshotFile || !outputFile) throw new Error('Usage: node normalize-snapshot-fiche.mjs <snapshot.json> <fiche.html>');
const snapshot = JSON.parse(readFileSync(snapshotFile, 'utf8'));
const fiche = snapshot.fiches?.[0];
if (!fiche?.content_html) throw new Error('Fiche HTML absente du snapshot');
const chrome = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setContent(`<!doctype html><html><body>${fiche.content_html}</body></html>`);
const html = await page.evaluate(() => {
  for (const part of document.querySelectorAll('section.partie-page')) {
    const tables = [...part.querySelectorAll(':scope > table.fiche-table')];
    const firstBanner = tables[0]?.querySelector(':scope > thead > .ft-banner-row');
    if (!firstBanner) throw new Error('Bannière initiale absente');
    for (const table of tables.slice(1)) {
      const thead = table.querySelector(':scope > thead');
      let banner = table.querySelector(':scope > thead > .ft-banner-row');
      if (!banner) { banner = firstBanner.cloneNode(true); thead.prepend(banner); }
      banner.querySelector('.partie-banner-title')?.classList.add('partie-banner-title--repeat');
    }
  }
  for (const cell of document.querySelectorAll('td.ft-detail.content')) {
    if (cell.querySelector(':scope > ul')) continue;
    const list = document.createElement('ul'); const item = document.createElement('li');
    while (cell.firstChild) item.appendChild(cell.firstChild);
    list.appendChild(item); cell.appendChild(list);
  }
  return document.body.innerHTML;
});
await browser.close();
writeFileSync(outputFile, html, 'utf8');
console.log(JSON.stringify({ output: outputFile }));
