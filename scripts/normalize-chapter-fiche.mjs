import { readFileSync, writeFileSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const file = process.argv[2];
if (!file) throw new Error('Usage: node normalize-chapter-fiche.mjs <chapter.json>');
const chapter = JSON.parse(readFileSync(file, 'utf8'));
const fiche = chapter.fiche;
if (!fiche?.content_html) throw new Error('Fiche HTML absente');
const chrome = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setContent(`<!doctype html><html><body>${fiche.content_html}</body></html>`);
fiche.content_html = await page.evaluate(() => {
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
    const list = document.createElement('ul');
    const entry = document.createElement('li');
    while (cell.firstChild) entry.appendChild(cell.firstChild);
    list.appendChild(entry); cell.appendChild(list);
  }
  return document.body.innerHTML;
});
await browser.close();
writeFileSync(file, `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ normalized: true }));
