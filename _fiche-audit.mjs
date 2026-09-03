/**
 * Structural audit for a generated fiche body. Metrics come from Chrome's DOM,
 * not from regular expressions, so embedded data-URI images never pollute the
 * text count.
 *
 * Usage: node _fiche-audit.mjs <body.html> [report.json]
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import puppeteer from 'puppeteer-core';

const [, , htmlPath, reportPath] = process.argv;
if (!htmlPath) {
  console.error('usage: node _fiche-audit.mjs <body.html> [report.json]');
  process.exit(1);
}
const chrome = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const html = readFileSync(resolve(htmlPath), 'utf8');
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setContent(`<!doctype html><html lang="fr"><body>${html}</body></html>`, { waitUntil: 'load' });
const report = await page.evaluate(() => {
  const text = document.body.innerText.replace(/\s+/g, ' ').trim();
  const ficheTables = [...document.querySelectorAll('table.fiche-table')];
  const tableErrors = ficheTables.flatMap((table, index) => {
    const headers = table.querySelectorAll(':scope > thead > .ft-head-row').length;
    const banners = table.querySelectorAll(':scope > thead > .ft-banner-row').length;
    return headers === 1 && banners <= 1 ? [] : [`table ${index + 1}: ${headers} ft-head-row, ${banners} ft-banner-row`];
  });
  const partErrors = [...document.querySelectorAll('section.partie-page')].flatMap((part, index) => {
    const tables = [...part.querySelectorAll(':scope > table.fiche-table')];
    if (!tables.length) return [`partie ${index + 1}: aucune sous-partie`];
    const banners = tables.map((table) => table.querySelectorAll(':scope > thead > .ft-banner-row').length);
    const firstHasBanner = banners[0] === 1;
    const modern = banners.slice(1).every((count) => count === 0);
    const legacy = banners.slice(1).every((count, tableIndex) => count === 1
      && tables[tableIndex + 1].querySelector('.partie-banner-title--repeat'));
    // Le gabarit actuel affiche la bannière au début de chaque partie. Les
    // fiches antérieures qui répètent explicitement cette bannière restent
    // lisibles à l'impression : on les accepte pendant l'audit de reprise,
    // sans pénaliser leur contenu médical ni leur imposer une réécriture.
    return firstHasBanner && (modern || legacy) ? [] : [`partie ${index + 1}: bannière de partie invalide`];
  });
  const bareDetails = document.querySelectorAll('td.ft-detail:not(.content)').length;
  const paragraphDetails = [...document.querySelectorAll('td.ft-detail.content')]
    .filter((cell) => cell.querySelector(':scope > p')).length;
  // Une ligne pédagogique doit avoir une structure éditable. La liste est le
  // cas courant ; un tableau comparatif ou une figure autonome sont aussi des
  // structures légitimes du gabarit Major ECN et ne doivent surtout pas être
  // transformés en fausses puces uniquement pour satisfaire l'audit.
  const listlessDetails = [...document.querySelectorAll('td.ft-detail.content')]
    .filter((cell) => !cell.querySelector(':scope > ul, :scope > table, :scope > .table-synthese, :scope > figure.ft-figure')).length;
  // Les exports historiques emploient parfois `partie-page` pour la synthèse
  // et la fiche éclair. Seules les sections numérotées constituent le plan
  // pédagogique à contrôler (4 à 7 parties).
  const parts = document.querySelectorAll('section.partie-page[id^="partie-"]').length;
  const synthesis = document.querySelectorAll('section.synthese-page').length;
  const eclair = document.querySelectorAll('.eclair-card').length;
  const eclairPage = document.querySelectorAll('section.fiche-eclair-page').length;
  const eclairLast = document.body.lastElementChild?.matches('section.fiche-eclair-page') ?? false;
  const editableBody = !document.body.innerHTML.includes('__IMGFILE:');
  const figures = document.querySelectorAll('figure.ft-figure').length;
  const missingImageSrc = [...document.querySelectorAll('figure.ft-figure img')]
    .filter((image) => !image.getAttribute('src') || image.getAttribute('src').includes('__IMGFILE:')).length;
  return {
    textCharacters: text.length,
    parts,
    ficheTables: ficheTables.length,
    figures,
    synthesis,
    eclair,
    eclairPage,
    eclairLast,
    editableBody,
    bareDetails,
    paragraphDetails,
    listlessDetails,
    missingImageSrc,
    tableErrors,
    partErrors,
  };
});
await browser.close();

const errors = [
  ...(report.parts < 4 || report.parts > 7 ? [`parties = ${report.parts}, attendu 4-7`] : []),
  ...(report.textCharacters > 50000 ? [`texte = ${report.textCharacters}, maximum 50000`] : []),
  ...(report.synthesis !== 1 ? [`synthèse = ${report.synthesis}, attendu 1`] : []),
  ...(report.eclair !== 1 ? [`fiche éclair = ${report.eclair}, attendu 1`] : []),
  ...(report.eclairPage !== 1 || !report.eclairLast ? ['fiche éclair non isolée sur la dernière page'] : []),
  ...(!report.editableBody ? ['HTML non éditable : jeton image non résolu'] : []),
  ...(report.bareDetails ? [`${report.bareDetails} cellule(s) ft-detail sans classe content`] : []),
  ...(report.paragraphDetails ? [`${report.paragraphDetails} cellule(s) de détail avec paragraphe direct`] : []),
  ...(report.listlessDetails ? [`${report.listlessDetails} cellule(s) de détail sans structure éditable (liste, tableau ou figure)`] : []),
  ...(report.missingImageSrc ? [`${report.missingImageSrc} image(s) non résolue(s)`] : []),
  ...report.tableErrors,
  ...report.partErrors,
];
const output = { ...report, errors, passed: errors.length === 0 };
if (reportPath) {
  mkdirSync(dirname(resolve(reportPath)), { recursive: true });
  writeFileSync(resolve(reportPath), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
}
console.log(JSON.stringify(output, null, 2));
process.exitCode = errors.length ? 1 : 0;
