import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const path = resolve(process.argv[2] || '');
const mapPath = process.argv[3] ? resolve(process.argv[3]) : null;
if (!process.argv[2]) throw new Error('usage: node repair-entorses-mcp-structure.mjs <body.html> [image-map.json]');
const source = readFileSync(path, 'utf8');
const title = 'Entorses graves de la MCP du pouce';
const eclairStart = source.indexOf('<section class="page eclair-page">');
const eclairEnd = source.indexOf('</section>', eclairStart);
const firstPart = source.indexOf('<section class="partie-page');
if (eclairStart < 0 || eclairEnd < 0 || firstPart < 0) throw new Error('fiche éclair ou corps introuvable');
let core = source.slice(0, eclairStart);
const part8Match = /<section class="partie-page(?: partie-page--first)?" id="partie-8">/.exec(core);
const part8Start = part8Match?.index ?? -1;
const close7 = core.lastIndexOf('</section>', part8Start);
if (part8Start < 0 || close7 < 0) throw new Error('partie VIII introuvable');
core = `${core.slice(0, close7)}${core.slice(part8Start + part8Match[0].length)}`;
const firstBanner8 = core.indexOf('<tr class="ft-banner-row">', close7);
const firstBanner8End = core.indexOf('</tr>', firstBanner8);
if (firstBanner8 < 0 || firstBanner8End < 0) throw new Error('bannière VIII introuvable');
core = `${core.slice(0, firstBanner8)}${core.slice(firstBanner8End + 5)}`;
const afterMerge = core.slice(close7).replace('A. Anatomie et mecanisme', 'D. Anatomie et mécanisme');
core = `${core.slice(0, close7)}${afterMerge}`;
// Une partie fusionnée ne conserve qu'une bannière : les sous-parties restent
// identifiées par leurs en-têtes A–F, sans répéter une bannière contradictoire.
const part7Start = core.indexOf('id="partie-7"');
const firstPart7Banner = core.indexOf('<tr class="ft-banner-row">', part7Start);
const firstPart7BannerEnd = core.indexOf('</tr>', firstPart7Banner) + 5;
core = `${core.slice(0, firstPart7BannerEnd)}${core.slice(firstPart7BannerEnd).replace(/<tr class="ft-banner-row">[\s\S]*?<\/tr>\s*/g, '')}`;
const titles = ['Rappel anatomique', 'Entorses graves récentes : diagnostic', 'Indications thérapeutiques', 'Technique de réparation du LCU', 'Réparation arthroscopique et LCR', 'Instabilités chroniques', 'Ligamentoplasties, arthrodèse et plaque palmaire'];
const roman = ['I','II','III','IV','V','VI','VII'];
const plan = titles.map((name, i) => `<li class="cover-plan-item"><a class="cover-plan-link" href="#partie-${i + 1}"><span class="cover-plan-num">${roman[i]}</span><span class="cover-plan-text">${name}</span></a></li>`).join('');
const cover = `<span class="string-source string-source--cours">${title}</span><span class="string-source string-source--footer">Major ECN&nbsp;&middot;&nbsp;2025-2026</span><section class="cover"><div class="cover-band"></div><div class="cover-content"><div class="cover-head"><img class="cover-logo" src="__LOGO__" alt="Major ECN"><div class="cover-matiere">Orthopédie</div><h1 class="cover-title">${title}</h1><div class="cover-year">Année&nbsp;2025-2026</div></div><div class="cover-plan"><div class="cover-section-label">Plan du cours</div><ol class="cover-plan-list">${plan}</ol></div></div></section>`;
let eclair = source.slice(eclairStart, eclairEnd + 10)
  .replace('<section class="page eclair-page">', '<section class="page eclair-page fiche-eclair-page">')
  .replace('Revision express', 'Révision express').replace('Fiche eclair', 'Fiche éclair');
let output = `${cover}${core}${eclair}`;
if (mapPath) for (const [token, uri] of Object.entries(JSON.parse(readFileSync(mapPath, 'utf8')))) output = output.replaceAll(token, uri);
writeFileSync(path, output, 'utf8');
console.log(`✓ Structure MCP réparée : ${path}`);
