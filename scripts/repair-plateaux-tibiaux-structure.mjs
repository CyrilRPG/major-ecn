import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const path = resolve(process.argv[2] || '');
const mapPath = process.argv[3] ? resolve(process.argv[3]) : null;
if (!process.argv[2]) throw new Error('usage: node repair-plateaux-tibiaux-structure.mjs <body.html> [image-map.json]');
let html = readFileSync(path, 'utf8');
const p8 = /<section class="partie-page(?: partie-page--first)?" id="partie-8">/.exec(html);
if (!p8) throw new Error('partie VIII introuvable');
const close7 = html.lastIndexOf('</section>', p8.index);
html = `${html.slice(0, close7)}${html.slice(p8.index + p8[0].length)}`;
const banner = html.indexOf('<tr class="ft-banner-row">', close7);
const bannerEnd = html.indexOf('</tr>', banner);
html = `${html.slice(0, banner)}${html.slice(bannerEnd + 5)}`;
const part7 = html.indexOf('id="partie-7"');
const firstBanner = html.indexOf('<tr class="ft-banner-row">', part7);
const firstBannerEnd = html.indexOf('</tr>', firstBanner) + 5;
html = `${html.slice(0, firstBannerEnd)}${html.slice(firstBannerEnd).replace(/<tr class="ft-banner-row">[\s\S]*?<\/tr>\s*/g, '')}`;
html = html.replace(/<li class="cover-plan-item"><a class="cover-plan-link" href="#partie-8">[\s\S]*?<\/li>\s*/g, '')
  .replace('Chirurgie percut. sous arthroscopie</span></a></li>', 'Chirurgie percutanée, traitement non sanglant et indications</span></a></li>')
  .replace('<section class="page eclair-page">', '<section class="page eclair-page fiche-eclair-page">');
if (mapPath) for (const [token, uri] of Object.entries(JSON.parse(readFileSync(mapPath, 'utf8')))) html = html.replaceAll(token, uri);
writeFileSync(path, html, 'utf8');
console.log(`✓ Structure plateaux tibiaux réparée : ${path}`);
