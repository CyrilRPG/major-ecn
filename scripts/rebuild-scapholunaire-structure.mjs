/**
 * Reprise structurelle de la fiche historique « dissociations scapholunaires
 * et pseudarthroses scaphoïdiennes ». Le texte et les tableaux médicaux
 * proviennent du corps existant : ce script ne les résume pas et ne les
 * complète pas. Il leur applique uniquement le gabarit HTML éditable Major.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const path = resolve(process.argv[2] || '');
if (!process.argv[2]) throw new Error('usage: node rebuild-scapholunaire-structure.mjs <body.html>');
const source = readFileSync(path, 'utf8');
const title = 'Chirurgies des séquelles de dissociations scapholunaires et pseudarthroses scaphoïdiennes';
const roman = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const beforeFinal = source.split('<!-- SYNTHESE 1 -->')[0];
const partChunks = beforeFinal.split(/<!-- PARTIE \d+ -->/).slice(1);
if (partChunks.length !== 6) throw new Error(`6 parties attendues, trouvées ${partChunks.length}`);

const clean = (html) => html.replace(/<span class="fmark [^"]+">[\s\S]*?<\/span>\s*/g, '').trim();
const parsePart = (chunk, partIndex) => {
  const partTitle = /ft-part-text">([\s\S]*?)<\/span>/.exec(chunk)?.[1]?.trim();
  const subChunks = chunk.split(/<!-- SP \d+\.\d+ -->/).slice(1);
  if (!partTitle || !subChunks.length) throw new Error(`partie ${partIndex + 1} incomplète`);
  const tables = subChunks.map((sub, subIndex) => {
    const subTitle = clean(/ft-subtitle-text">([\s\S]*?)<\/span><\/div>\s*<table/.exec(sub)?.[1] || '');
    const oldTable = /<table class="fiche-table">([\s\S]*?)<\/table>/.exec(sub)?.[1];
    if (!subTitle || !oldTable) throw new Error(`sous-partie ${partIndex + 1}.${subIndex + 1} incomplète`);
    const banner = subIndex === 0 ? `<tr class="ft-banner-row"><td colspan="2"><span class="partie-banner-num">${roman[partIndex]}</span><span class="partie-banner-title">${partTitle}</span></td></tr>` : '';
    return `<table class="fiche-table"><colgroup><col class="ft-col-concept"><col class="ft-col-detail"></colgroup><thead>${banner}<tr class="ft-head-row"><th class="ft-tag">${roman[partIndex]}</th><th class="ft-subtitle"><span class="ft-subtitle-text">${letters[subIndex]}.&nbsp;&nbsp;${subTitle}</span></th></tr></thead><tbody>${oldTable}</tbody></table>`;
  });
  return { title: partTitle, html: `<section class="partie-page${partIndex === 0 ? ' partie-page--first' : ''}" id="partie-${partIndex + 1}">${tables.join('')}</section>` };
};
const parts = partChunks.map(parsePart);
const plan = parts.map((part, index) => `<li class="cover-plan-item"><a class="cover-plan-link" href="#partie-${index + 1}"><span class="cover-plan-num">${roman[index]}</span><span class="cover-plan-text">${part.title}</span></a></li>`).join('');
const cover = `<div class="page-watermark"><img src="__WATERMARK__" alt=""></div><span class="string-source string-source--cours">${title}</span><span class="string-source string-source--footer">Major ECN&nbsp;&middot;&nbsp;2025-2026</span><section class="cover"><div class="cover-band"></div><div class="cover-content"><div class="cover-head"><img class="cover-logo" src="__LOGO__" alt="Major ECN"><div class="cover-matiere">Orthopédie</div><h1 class="cover-title cover-title--long">Chirurgies des séquelles de dissociations<br>scapholunaires et pseudarthroses<br>scaphoïdiennes</h1><div class="cover-year">Année&nbsp;2025-2026</div></div><div class="cover-plan"><div class="cover-section-label">Plan du cours</div><ol class="cover-plan-list">${plan}</ol></div></div></section>`;

const finalSource = source.slice(source.indexOf('<!-- SYNTHESE 1 -->'));
const syntheses = [...finalSource.matchAll(/<div class="synthese-bloc"><div class="synthese-titre">([\s\S]*?)<\/div>\s*(<table class="synthese-table">[\s\S]*?<\/table>)\s*<\/div>/g)];
if (syntheses.length !== 5) throw new Error(`5 synthèses attendues, trouvées ${syntheses.length}`);
const synthesis = `<section class="page synthese-page"><div class="partie-banner partie-banner--plain"><span class="partie-banner-title">Synthèse — Tableaux de révision</span></div>${syntheses.map((m) => `<div class="synthese-bloc"><h3 class="synthese-titre">${m[1]}</h3><div class="table-synthese content">${m[2].replace('class="synthese-table"', '')}</div></div>`).join('')}</section>`;

const eclairItems = [...finalSource.matchAll(/<!-- FICHE ECLAIR -->[\s\S]*?<ul>([\s\S]*?)<\/ul>/g)].flatMap((m) => [...m[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((li) => li[1]));
const selected = [0, 1, 4, 5, 9, 10, 12, 14].map((index) => eclairItems[index]).filter(Boolean);
if (selected.length !== 8) throw new Error('8 points éclair attendus');
const eclair = `<section class="page eclair-page fiche-eclair-page"><div class="eclair-card"><div class="eclair-eyebrow">Révision express</div><h2 class="eclair-title">Fiche éclair</h2><p class="eclair-sub">Dissociations scapholunaires et pseudarthroses scaphoïdiennes</p><div class="eclair-rule"></div><div class="eclair-body content"><ul class="ft-list">${selected.map((item) => `<li>${item}</li>`).join('')}</ul></div><h3 class="eclair-points-titre">À retenir absolument</h3><ul class="eclair-points"><li>Classer la dissociation scapholunaire avant de choisir le geste.</li><li>Évaluer la réductibilité, l’état des moignons et l’arthrose.</li><li>La pseudarthrose du scaphoïde peut conduire à une arthrose progressive.</li><li>Le respect de l’interligne radiolunaire conditionne les options conservatrices.</li><li>La dénervation conserve une place si une mobilité utile persiste.</li><li>Une arthrodèse totale est une solution de dernier recours fonctionnel.</li></ul><div class="eclair-footer"><div class="eclair-footer-text">Major ECN&nbsp;&middot;&nbsp;2025-2026</div></div></div></section>`;

writeFileSync(path, `${cover}${parts.map((part) => part.html).join('')}${synthesis}${eclair}`, 'utf8');
console.log(`✓ Fiche scapholunaire reconstruite : ${path}`);
