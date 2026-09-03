/** Ajoute les blocs finaux manquants de la fiche laxités périphériques du genou.
 * Source : notions déjà traitées dans les six parties de la fiche et extract.json.
 * Usage: node scripts/append-laxites-genou-synthesis.mjs <editable-body.html>
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const path = resolve(process.argv[2] || '');
if (!process.argv[2]) process.exit(1);
const body = readFileSync(path, 'utf8');
if (body.includes('fiche-eclair-page')) process.exit(2);
const finalBlocks = `
<section class="page synthese-page"><div class="partie-banner partie-banner--plain"><span class="partie-banner-title">Synthèse — Tableaux de révision</span></div>
<div class="synthese-bloc"><h3 class="synthese-titre">Démarche devant une laxité chronique du genou</h3><div class="table-synthese content"><table><thead><tr><th>Temps</th><th>À rechercher</th><th>Conséquence</th></tr></thead><tbody>
<tr><td>Identifier le pattern</td><td>Laxité isolée ou combinée, atteinte du pivot central et compartiment concerné.</td><td>Évite de traiter une laxité périphérique comme une rupture isolée du pivot central.</td></tr>
<tr><td>Objectiver</td><td>Examen clinique comparatif, radiographies dynamiques et IRM.</td><td>Précise le plan lésionnel et prépare la stratégie de reconstruction.</td></tr>
<tr><td>Intégrer l'axe</td><td>Déformation frontale ou sagittale et contraintes du compartiment.</td><td>Discute une ostéotomie associée au geste ligamentaire.</td></tr>
</tbody></table></div></div>
<div class="synthese-bloc"><h3 class="synthese-titre">Compartiment médial : principes opératoires</h3><div class="table-synthese content"><table><thead><tr><th>Structure</th><th>Évaluation</th><th>Principe traité dans le cours</th></tr></thead><tbody>
<tr><td>LCM superficiel</td><td>Tests cliniques en valgus, étude de la laxité et du retentissement fonctionnel.</td><td>Retension selon le siège, ou reconstruction par plastie lorsque la lésion n'est pas réparable.</td></tr>
<tr><td>POL et semi-membraneux</td><td>Analyse de la laxité médiale associée et de la rotation.</td><td>Reconstruction simultanée LCM + POL dans les insuffisances combinées.</td></tr>
<tr><td>MPFL</td><td>Bilan spécifique de l'instabilité patellaire.</td><td>Reconstruction lorsque l'indication est retenue après analyse du contexte patellofémoral.</td></tr>
</tbody></table></div></div>
<div class="synthese-bloc"><h3 class="synthese-titre">Compartiment latéral et stratégie combinée</h3><div class="table-synthese content"><table><thead><tr><th>Situation</th><th>Repères</th><th>Décision</th></tr></thead><tbody>
<tr><td>LCL isolé</td><td>Tests de varus et repères radiologiques dédiés.</td><td>Retension ou reconstruction isolée selon la qualité tissulaire et la chronicité.</td></tr>
<tr><td>Complexe poplité / PAPE</td><td>Tests de rotation externe, examen du compartiment latéral et voie d'abord adaptée.</td><td>Reconstruire le plan atteint ; ne pas réduire la stratégie à une plastie médiale.</td></tr>
<tr><td>Laxité multiligamentaire</td><td>Association au LCA ou au LCP, axe du membre et degré de correction.</td><td>Planifier l'ordre des reconstructions et discuter un ou deux temps.</td></tr>
</tbody></table></div></div></section>
<section class="page eclair-page fiche-eclair-page"><div class="eclair-card"><div class="eclair-eyebrow">Révision express</div><h2 class="eclair-title">Fiche éclair</h2><p class="eclair-sub">Chirurgie des laxités chroniques périphériques du genou</p><div class="eclair-rule"></div><div class="eclair-body content"><ul class="ft-list">
<li>Devant une instabilité chronique, distinguer une <strong>laxité isolée</strong> d'une <strong>laxité combinée</strong> et rechercher le rôle du pivot central.</li>
<li>Le bilan associe examen clinique comparatif, <strong>mesure objective</strong>, radiographies dynamiques et IRM.</li>
<li>Une laxité médiale se raisonne sur le <strong>LCM</strong>, le <strong>POL</strong> et les structures associées ; une reconstruction LCM + POL est une option des insuffisances combinées.</li>
<li>Les atteintes latérales imposent d'analyser séparément le <strong>LCL</strong>, le complexe poplité et le <strong>PAPE</strong>.</li>
<li>Les tests de varus et de rotation externe orientent l'analyse du compartiment latéral.</li>
<li>Une reconstruction périphérique ne se décide pas sans intégrer l'<strong>axe du membre</strong> ; une ostéotomie peut conditionner le résultat.</li>
<li>Dans les lésions multiligamentaires, l'ordre des reconstructions et la réalisation en un ou deux temps sont planifiés.</li>
<li>La rééducation fait partie de la stratégie et doit être adaptée au montage réalisé.</li>
</ul></div><h3 class="eclair-points-titre">À retenir absolument</h3><ul class="eclair-points"><li>Ne pas traiter un pivot central sans rechercher une laxité périphérique associée.</li><li>Objectiver la laxité avant de choisir une plastie.</li><li>LCM et POL doivent être analysés ensemble dans les laxités médiales complexes.</li><li>LCL et plan postéro-latéral ne relèvent pas du même raisonnement que le compartiment médial.</li><li>Penser à l'axe et à l'ostéotomie dans les laxités chroniques.</li><li>Planifier le suivi et la rééducation dès la stratégie opératoire.</li></ul><div class="eclair-footer"><div class="eclair-footer-text">Major ECN&nbsp;&middot;&nbsp;2025-2026</div></div></div></section>`;
writeFileSync(path, `${body}${finalBlocks}`, 'utf8');
console.log(`✓ Synthèse et fiche éclair ajoutées : ${path}`);
