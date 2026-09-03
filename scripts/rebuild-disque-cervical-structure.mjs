/** Recompose l'export historique sans perdre ses lignes médicales ni ses figures source. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const path = resolve(process.argv[2] || '');
const outputPath = process.argv[3] ? resolve(process.argv[3]) : path;
if (!process.argv[2]) throw new Error('usage: node rebuild-disque-cervical-structure.mjs <body.html>');
const source = readFileSync(path, 'utf8');
const title = 'Chirurgie du disque intervertébral cervical';
const roman = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
// Un ancien export a ouvert plusieurs <figure> sans les fermer. La deuxième
// sous-partie endoscopique est elle aussi englobée ; on rétablit son marqueur
// avant de retirer ces fragments, car les illustrations seront replacées avec
// leur légende provenant de extract.json.
const recoverable = source
  .replace(/__IMG_8__"ft-head-row">/g, '__IMG_8__</figure></td></tr><tr class="ft-head-row">')
  .replace(/<tr><td colspan="2">\s*<figure\b[\s\S]*?(?=<tr class=|<table class=|$)/g, '')
  .replace(/<figure\b[\s\S]*?(?=<tr class=|<table class=|$)/g, '');
const events = [...recoverable.matchAll(/<tr class="(ft-banner-row|ft-head-row)">[\s\S]*?<th colspan="2">([\s\S]*?)<\/th><\/tr>/g)]
  .map((m) => ({ kind: m[1], title: m[2].replace(/<[^>]+>/g, '').trim(), start: m.index, end: m.index + m[0].length }));
const partEvents = events.filter((event) => /^Partie \d+\s+—/.test(event.title));
const headingEvents = events.filter((event) => /^\d+\.\d+\s+/.test(event.title));
if (partEvents.length !== 6 || headingEvents.length !== 12) throw new Error(`marqueurs attendus 6/12, trouvés ${partEvents.length}/${headingEvents.length}`);

const figures = [
  ['__IMGFILE:img/img_001.png__', 'Figure 1. Coupe cervicale et abord antérolatéral.'],
  ['__IMGFILE:img/img_002.png__', 'Figure 2. Abord cervical antérolatéral : individualisation des muscles sterno-cléido-mastoïdien et omohyoïdien, et de l’aponévrose cervicale moyenne.'],
  ['__IMGFILE:img/img_003.png__', 'Figure 3. Abord cervical antérolatéral : dissection du plan prévertébral.'],
  ['__IMGFILE:img/img_004.png__', 'Figure 4. Abord cervical antérolatéral : vue de profil de l’arthrodèse par greffon tricortical d’origine iliaque et plaque antérieure.'],
  ['__IMGFILE:img/img_005.png__', 'Figure 5. Abord cervical postérieur : ablation de la hernie discale exclue en réclinant précautionneusement la racine vers le haut.'],
  ['__IMGFILE:img/img_006.png__', 'Figure 6. Discectomie cervicale par abord antérieur : ablation du fragment discal à l’aide de la pince emporte-pièce.'],
  ['__IMGFILE:img/img_007.png__', 'Figure 7. Discectomie cervicale par abord postérieur : abord de la racine et de la hernie discale après la résection osseuse des lames et de la partie médiale de l’articulaire postérieure.'],
  ['__IMGFILE:img/img_008.png__', 'Figure 8. Discectomie cervicale par abord postérieur : ablation du fragment discal à l’aide de la pince emporte-pièce.'],
];
const figureFor = new Map([
  ['0-1', [0, 1, 2]], ['1-1', [3]], ['3-1', [4]], ['4-0', [5]], ['4-1', [6, 7]],
]);
const imageHtml = (indexes) => (indexes || []).map((index) => {
  const [token, caption] = figures[index];
  return `<figure class="ft-figure ft-figure--large"><img src="${token}" alt=""><figcaption>${caption}</figcaption></figure>`;
}).join('');

const partTitle = (event) => event.title.replace(/^Partie \d+\s+—\s*/, '');
const headersForPart = partEvents.map((part, partIndex) => {
  const next = partEvents[partIndex + 1]?.start ?? recoverable.indexOf('<table class="fiche-table">', part.end + 1) + 1;
  return headingEvents.filter((heading) => heading.start > part.start && heading.start < next);
});
if (headersForPart.some((headers) => headers.length !== 2)) throw new Error('chaque partie doit contenir deux sous-parties');
const regularRows = (from, to) => [...recoverable.slice(from, to).matchAll(/<tr>([\s\S]*?)<\/tr>/g)]
  .map((m) => `<tr>${m[1]}</tr>`)
  .filter((row) => row.includes('ft-concept') && row.includes('ft-detail content'));
const parts = partEvents.map((part, partIndex) => {
  const headers = headersForPart[partIndex];
  const tables = headers.map((heading, subIndex) => {
    const next = headers[subIndex + 1]?.start ?? partEvents[partIndex + 1]?.start ?? recoverable.indexOf('<table class="fiche-table">', heading.end + 1) + 1;
    const rows = regularRows(heading.end, next);
    if (!rows.length) throw new Error(`aucune ligne récupérable pour ${heading.title}`);
    const banner = subIndex === 0 ? `<tr class="ft-banner-row"><td colspan="2"><span class="partie-banner-num">${roman[partIndex]}</span><span class="partie-banner-title">${partTitle(part)}</span></td></tr>` : '';
    const subTitle = heading.title.replace(/^\d+\.\d+\s+/, '');
    return `<table class="fiche-table"><colgroup><col class="ft-col-concept"><col class="ft-col-detail"></colgroup><thead>${banner}<tr class="ft-head-row"><th class="ft-tag">${roman[partIndex]}</th><th class="ft-subtitle"><span class="ft-subtitle-text">${letters[subIndex]}.&nbsp;&nbsp;${subTitle}</span></th></tr></thead><tbody>${rows.join('')}</tbody></table>${imageHtml(figureFor.get(`${partIndex}-${subIndex}`))}`;
  });
  return { title: partTitle(part), html: `<section class="partie-page${partIndex === 0 ? ' partie-page--first' : ''}" id="partie-${partIndex + 1}">${tables.join('')}</section>` };
});
const plan = parts.map((part, index) => `<li class="cover-plan-item"><a class="cover-plan-link" href="#partie-${index + 1}"><span class="cover-plan-num">${roman[index]}</span><span class="cover-plan-text">${part.title}</span></a></li>`).join('');
const cover = `<div class="page-watermark"><img src="__WATERMARK__" alt=""></div><span class="string-source string-source--cours">${title}</span><span class="string-source string-source--footer">Major ECN&nbsp;&middot;&nbsp;2025-2026</span><section class="cover"><div class="cover-band"></div><div class="cover-content"><div class="cover-head"><img class="cover-logo" src="__LOGO__" alt="Major ECN"><div class="cover-matiere">Orthopédie</div><h1 class="cover-title">${title}</h1><div class="cover-year">Année&nbsp;2025-2026</div></div><div class="cover-plan"><div class="cover-section-label">Plan du cours</div><ol class="cover-plan-list">${plan}</ol></div></div></section>`;
const synthesis = `<section class="page synthese-page"><div class="partie-banner partie-banner--plain"><span class="partie-banner-title">Synthèse — Tableaux de révision</span></div><div class="synthese-bloc"><h3 class="synthese-titre">Voies d’abord : indications et installation</h3><div class="table-synthese content"><table><thead><tr><th>Voie</th><th>Indication rapportée</th><th>Installation</th></tr></thead><tbody><tr><td>Antérolatérale (Smith et Robinson)</td><td>Hernies molles et dures, quelle que soit leur situation.</td><td>Décubitus dorsal, tête légèrement en extension, table radiotransparente.</td></tr><tr><td>Postérieure</td><td>Hernie molle postérolatérale avec symptomatologie radiculaire pure.</td><td>Décubitus ventral, tête en flexion et table légèrement proclive.</td></tr><tr><td>Endoscopique</td><td>Hernies médiolatérales ou postérolatérales modérées selon la voie.</td><td>Installation adaptée à la voie ; indication limitée.</td></tr></tbody></table></div></div><div class="synthese-bloc"><h3 class="synthese-titre">Repères techniques et suites</h3><div class="table-synthese content"><table><thead><tr><th>Temps</th><th>Point-clé source</th><th>Suite rapportée</th></tr></thead><tbody><tr><td>Abord antérolatéral</td><td>Paquet jugulocarotidien rétracté en dehors et axe aérodigestif en dedans ; contrôle du niveau par aiguille.</td><td>Drain de Redon et fermeture plan par plan.</td></tr><tr><td>Arthrodèse</td><td>Greffon tricortical iliaque ou cage ; plaque surtout utile au multi-niveaux.</td><td>Collier cervical mousse 6 semaines après autogreffe.</td></tr><tr><td>Abord postérieur</td><td>Préserver l’articulaire et récliner la racine avec précaution.</td><td>Collier antalgique 2 semaines ; ablation des fils au 12e jour.</td></tr></tbody></table></div></div><div class="synthese-bloc"><h3 class="synthese-titre">Complications de la discectomie avec arthrodèse</h3><div class="table-synthese content"><table><thead><tr><th>Événement</th><th>Fréquence rapportée</th></tr></thead><tbody><tr><td>Morbidité globale / mortalité</td><td>19,3 % / 0,1 %</td></tr><tr><td>Dysphagie / hématome</td><td>9,5 % / 5,6 %</td></tr><tr><td>Paralysie récurrentielle / brèche durale</td><td>3,1 % / 0,5 %</td></tr><tr><td>Lésion œsophagienne / Claude Bernard-Horner / infection</td><td>0,3 % / 0,1 % / 0,1 %</td></tr></tbody></table></div></div></section>`;
const eclair = `<section class="page eclair-page fiche-eclair-page"><div class="eclair-card"><div class="eclair-eyebrow">Révision express</div><h2 class="eclair-title">Fiche éclair</h2><p class="eclair-sub">Chirurgie du disque intervertébral cervical</p><div class="eclair-rule"></div><div class="eclair-body content"><ul class="ft-list"><li><strong>Smith et Robinson</strong> est la voie antérolatérale de référence, utilisable pour les hernies molles et dures.</li><li>Le patient est en <strong>décubitus dorsal</strong>, tête légèrement en extension, sur table radiotransparente.</li><li>À l’abord antérolatéral, le paquet jugulocarotidien est rétracté en dehors et l’axe aérodigestif en dedans.</li><li>Le contrôle radiographique du niveau intervient avant le geste discal.</li><li>L’arthrodèse utilise un greffon tricortical iliaque ou une cage ; une plaque peut être ajoutée, surtout au multi-niveaux.</li><li>La voie postérieure est réservée aux hernies molles postérolatérales avec atteinte radiculaire pure.</li><li>Les techniques endoscopiques ont des indications limitées et un recul à moyen ou long terme insuffisant.</li><li>La dysphagie est la complication la plus fréquente rapportée après discectomie avec arthrodèse.</li></ul></div><h3 class="eclair-points-titre">À retenir absolument</h3><ul class="eclair-points"><li>Le choix de voie dépend de la position et de la nature de la hernie.</li><li>La protection des structures vasculaires et aérodigestives conditionne l’abord antérieur.</li><li>La conservation de l’articulaire est un repère de la voie postérieure.</li><li>Informer le patient des avantages et limites de chaque technique.</li><li>Un hématome cervical compressif est une urgence respiratoire.</li><li>Les suites d’immobilisation diffèrent selon la voie et l’implant.</li></ul><div class="eclair-footer"><div class="eclair-footer-text">Major ECN&nbsp;&middot;&nbsp;2025-2026</div></div></div></section>`;
const output = `${cover}${parts.map((part) => part.html).join('')}${synthesis}${eclair}`;
writeFileSync(outputPath, output, 'utf8');
console.log(`✓ Fiche disque cervical reconstruite : ${outputPath}`);
