/** Render current fiche HTML to PDF/PNG for visual QA. Usage: node scripts/render-published-fiche-qa.mjs <coursId> <outDir> */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer-core';

config({ path: '.env.local' });
const [courseId, outputDir] = process.argv.slice(2);
if (!courseId || !outputDir) throw new Error('Usage: node scripts/render-published-fiche-qa.mjs coursId outDir');
const out = resolve(outputDir); mkdirSync(out, { recursive: true });
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: fiche, error } = await db.from('fiches').select('content_html').eq('cours_id', courseId).single();
if (error) throw error;
const chrome = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
await page.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${fiche.content_html}</body></html>`, { waitUntil: 'load' });
await page.evaluate(() => Promise.all([...document.images].map((image) => image.decode?.().catch(() => undefined))));
await page.pdf({ path: join(out, 'fiche.pdf'), format: 'A4', printBackground: true, margin: { top: '8mm', bottom: '8mm', left: '8mm', right: '8mm' } });
await page.screenshot({ path: join(out, 'page-full.png'), fullPage: true });
const metrics = await page.evaluate(() => ({ figures: document.querySelectorAll('figure.ft-figure').length, broken: [...document.images].filter((image) => !image.naturalWidth || !image.naturalHeight).length, text: document.body.innerText.replace(/\s+/g, ' ').trim().length }));
await browser.close();
writeFileSync(join(out, 'qa.json'), `${JSON.stringify({ courseId, ...metrics }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ courseId, ...metrics, out }));
