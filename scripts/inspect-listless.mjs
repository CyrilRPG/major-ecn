import { readFileSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const [file] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setContent(`<body>${readFileSync(file, 'utf8')}</body>`);
console.log(JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('td.ft-detail.content')]
  .filter((cell) => !cell.querySelector('ul') && !cell.querySelector('figure.ft-figure'))
  .map((cell) => cell.outerHTML)), null, 2));
await browser.close();
