import { readFileSync } from 'node:fs';
import puppeteer from 'puppeteer-core';
const input = process.argv[2];
const chrome = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setContent(`<!doctype html><html><body>${readFileSync(input, 'utf8')}</body></html>`);
const result = await page.evaluate(() => [...document.querySelectorAll('section.partie-page')].map((part, i) => ({
  part: i + 1,
  tables: [...part.querySelectorAll(':scope > table.fiche-table')].map((table, j) => ({
    table: j + 1,
    banner: table.querySelectorAll(':scope > thead > .ft-banner-row').length,
    head: table.querySelectorAll(':scope > thead > .ft-head-row').length,
    repeat: !!table.querySelector('.partie-banner-title--repeat'),
  })),
})));
console.log(JSON.stringify(result, null, 2));
await browser.close();
