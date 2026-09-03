/** Replace legacy in-body summaries by the required final synthesis and standalone revision sheet. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const path = resolve(process.argv[2] || '');
if (!process.argv[2]) throw new Error('usage: node rebuild-col-femoral-final-blocks.mjs <body.html>');
let core = readFileSync(path, 'utf8');
const marker = core.indexOf('<div class="synthese-bloc">');
if (marker < 0) throw new Error('Synthèse historique introuvable.');
const legacyEclair = core.indexOf('<div class="eclair-card">', marker);
const remainingCourse = core.indexOf('<table class="fiche-table">', legacyEclair);
if (legacyEclair < marker || remainingCourse < legacyEclair) throw new Error('Fin de la synthèse historique introuvable.');
core = core.slice(0, marker) + core.slice(remainingCourse);
// This historical image map has a surgical figure in slots 1–2; never use it
// as a cover asset. The renderer substitutes the current approved assets.
core = core
  .replace('<div class="page-watermark"><img src="__IMG_1__" alt=""></div>', '<div class="page-watermark"><img src="__WATERMARK__" alt=""></div>')
  .replace('<img class="cover-logo" src="__IMG_2__" alt="Major ECN">', '<img class="cover-logo" src="__LOGO__" alt="Major ECN">');
const ending = `<section class="page synthese-page"><div class="partie-banner partie-banner--plain"><span class="partie-banner-title">Synthèse — Tableaux de révision</span></div>
<div class="synthese-bloc"><h3 class="synthese-titre">Repères décisionnels</h3><div class="table-synthese content"><table><thead><tr><th>Situation</th><th>Principe rapporté dans le cours</th></tr></thead><tbody>
<tr><td>Fracture Garden I-II</td><td>Une ostéosynthèse in situ est le traitement conservateur de référence.</td></tr>
<tr><td>Fracture Garden III-IV chez le sujet âgé</td><td>Le risque vasculaire et l'état fonctionnel font discuter une arthroplastie de première intention.</td></tr>
<tr><td>Sujet jeune</td><td>La préservation céphalique par réduction et ostéosynthèse est prioritaire, quel que soit le Garden.</td></tr>
<tr><td>Coxarthrose préexistante</td><td>Elle peut faire retenir une arthroplastie même devant une fracture peu déplacée.</td></tr>
</tbody></table></div></div>
<div class="synthese-bloc"><h3 class="synthese-titre">Classifications et pronostic</h3><div class="table-synthese content"><table><thead><tr><th>Repère</th><th>Utilité</th></tr></thead><tbody>
<tr><td>Garden simplifiée</td><td>Elle distingue les fractures peu déplacées des fractures déplacées et guide les indications.</td></tr>
<tr><td>Pauwels</td><td>Plus le trait est vertical, plus le cisaillement et le risque de pseudarthrose augmentent.</td></tr>
<tr><td>Déplacement</td><td>Il conditionne le risque d'interruption de la vascularisation cervicocéphalique.</td></tr>
<tr><td>Réduction et montage</td><td>Leur qualité est un déterminant opérateur-dépendant des complications.</td></tr>
</tbody></table></div></div>
<div class="synthese-bloc"><h3 class="synthese-titre">Surveillance et complications</h3><div class="table-synthese content"><table><thead><tr><th>Point de vigilance</th><th>Conduite ou conséquence</th></tr></thead><tbody>
<tr><td>Ostéosynthèse</td><td>Surveiller ostéonécrose céphalique et pseudarthrose ; le déplacement et la comminution influencent le risque.</td></tr>
<tr><td>Arthroplastie</td><td>Prévenir la luxation par un abord adapté, la réparation capsulaire et, selon le cas, la double mobilité.</td></tr>
<tr><td>Échec d'ostéosynthèse</td><td>L'arthroplastie secondaire est moins favorable qu'une arthroplastie de première intention.</td></tr>
<tr><td>Patient âgé</td><td>La prise en charge est multidisciplinaire avec évaluation anesthésique, gériatrique et fonctionnelle.</td></tr>
</tbody></table></div></div></section>
<section class="page eclair-page fiche-eclair-page"><div class="eclair-card"><div class="eclair-eyebrow">Révision express</div><h2 class="eclair-title">Fiche éclair</h2><p class="eclair-sub">Fractures du col fémoral</p><div class="eclair-rule"></div><div class="eclair-body content"><ul class="ft-list">
<li>Une fracture cervicale vraie est <strong>intracapsulaire</strong> ; le déplacement menace la vascularisation céphalique.</li>
<li>La <strong>classification de Garden simplifiée</strong> est la base pratique des indications.</li>
<li>Chez le sujet jeune, préserver la tête fémorale par <strong>ostéosynthèse</strong> après réduction.</li>
<li>Chez le sujet âgé avec Garden III-IV, une <strong>arthroplastie</strong> est habituellement discutée.</li>
<li>Une fracture Garden I-II relève d'une <strong>ostéosynthèse in situ</strong> si le contexte le permet.</li>
<li>La verticalité du trait selon <strong>Pauwels</strong> augmente les contraintes de cisaillement.</li>
<li>La qualité de la réduction et la stabilité du montage conditionnent le risque de <strong>pseudarthrose</strong>.</li>
<li>Une arthroplastie secondaire après échec est <strong>moins favorable</strong> qu'un choix initial adapté.</li>
</ul></div><h3 class="eclair-points-titre">À retenir absolument</h3><ul class="eclair-points"><li>Déplacement, âge physiologique et autonomie orientent la décision.</li><li>Rechercher une coxarthrose et les comorbidités avant l'indication.</li><li>Organiser une prise en charge gérontotraumatique chez la personne âgée.</li><li>Documenter réduction et positionnement du matériel.</li><li>Prévenir le risque de luxation après arthroplastie.</li><li>Prévoir le suivi fonctionnel et radiographique.</li></ul><div class="eclair-footer"><div class="eclair-footer-text">Major ECN&nbsp;&middot;&nbsp;2025-2026</div></div></div></section>`;
writeFileSync(path, `${core.trim()}${ending}`, 'utf8');
console.log(`Blocs finaux reconstruits : ${path}`);
