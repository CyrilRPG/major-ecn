/**
 * Remplace les tableaux finaux historiques par les blocs Major ECN : synthèse
 * comparée et fiche éclair finale. Les éléments proviennent exclusivement des
 * sections déjà présentes dans la fiche source.
 * Usage: node scripts/rebuild-tetraplegie-final-blocks.mjs <body.html>
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const path = resolve(process.argv[2] || '');
if (!process.argv[2]) process.exit(1);
const body = readFileSync(path, 'utf8');
const cut = body.indexOf('<section class="partie-page partie-page--synthese"');
if (cut < 0) {
  console.error('Section finale historique introuvable.');
  process.exit(2);
}
const core = body.slice(0, cut);
const finalBlocks = `<section class="page synthese-page"><div class="partie-banner partie-banner--plain"><span class="partie-banner-title">Synthèse — Tableaux de révision</span></div>
<div class="synthese-bloc"><h3 class="synthese-titre">Objectifs fonctionnels hiérarchisés</h3><div class="table-synthese content"><table><thead><tr><th>Fonction</th><th>Principe du cours</th><th>Conséquence pratique</th></tr></thead><tbody>
<tr><td>Extension du poignet</td><td>Premier moteur de la prise par ténodèse.</td><td>Elle est prioritaire dans le raisonnement de Möberg et dans la planification des transferts.</td></tr>
<tr><td>Extension du coude</td><td>Permet l'utilisation du membre supérieur dans l'espace.</td><td>Le transfert du deltoïde ou du biceps vers le triceps est discuté selon les muscles disponibles.</td></tr>
<tr><td>Key grip puis grasp</td><td>La pince terminolatérale est la prise la plus simple à reconstruire ; le grasp demande une stratégie dédiée.</td><td>Choisir une reconstruction passive ou active selon le groupe fonctionnel.</td></tr>
</tbody></table></div></div>
<div class="synthese-bloc"><h3 class="synthese-titre">Indication et évaluation préopératoire</h3><div class="table-synthese content"><table><thead><tr><th>Élément</th><th>À vérifier</th><th>Impact</th></tr></thead><tbody>
<tr><td>Stabilité neurologique</td><td>État neurologique stabilisé, délai après l'accident, installation assise et motivation.</td><td>Conditionne l'accès à la chirurgie fonctionnelle.</td></tr>
<tr><td>Muscles disponibles</td><td>Classification de Giens, cotation musculaire et muscles non indispensables.</td><td>Le geste est construit « à la carte » ; le muscle transféré doit garder une force suffisante.</td></tr>
<tr><td>Spasticité et complications</td><td>Spasticité handicapante, escarres et contraintes de rééducation.</td><td>Ces problèmes sont traités avant la reconstruction.</td></tr>
</tbody></table></div></div>
<div class="synthese-bloc"><h3 class="synthese-titre">Gestes à connaître et pièges</h3><div class="table-synthese content"><table><thead><tr><th>Situation</th><th>Geste rapporté</th><th>Point de vigilance</th></tr></thead><tbody>
<tr><td>Avant-bras en pronation</td><td>Transfert pronateur de Zancolli si réductible ; ostéotomie pronatrice dans les situations fixées.</td><td>La disponibilité du biceps oriente le choix.</td></tr>
<tr><td>Extension du poignet</td><td>Transfert brachioradial vers ECRB.</td><td>Vérifier la présence de l'ECRB avant de transférer l'ECRL.</td></tr>
<tr><td>Key grip et grasp</td><td>Ténodèse en miroir ou transfert BR–FPL ; ECRL–FDP avec ouverture associée pour le grasp.</td><td>Le FCR n'est jamais sacrifié ; un grasp bilatéral est contre-indiqué.</td></tr>
</tbody></table></div></div></section>
<section class="page eclair-page fiche-eclair-page"><div class="eclair-card"><div class="eclair-eyebrow">Révision express</div><h2 class="eclair-title">Fiche éclair</h2><p class="eclair-sub">Chirurgie fonctionnelle du membre supérieur du tétraplégique</p><div class="eclair-rule"></div><div class="eclair-body content"><ul class="ft-list"><li>La chirurgie fonctionnelle repose sur des <strong>transferts tendineux</strong>, selon les muscles disponibles et l'objectif prioritaire.</li><li>Les trois priorités de Möberg sont l'<strong>extension du poignet</strong>, l'<strong>extension du coude</strong> et le <strong>key grip</strong>.</li><li>La classification de Giens et le testing musculaire permettent de raisonner l'indication « à la carte ».</li><li>Le patient doit avoir un état neurologique stabilisé, des escarres réglées, une station assise possible et une motivation réelle.</li><li>La spasticité handicapante est prise en charge avant la reconstruction.</li><li>Le transfert BR–ECRB réanime l'extension du poignet ; vérifier l'ECRB avant de mobiliser l'ECRL.</li><li>Le key grip peut être passif ou actif ; le grasp associe une stratégie de fermeture et d'ouverture.</li><li>Le FCR n'est jamais sacrifié et un grasp bilatéral est contre-indiqué.</li></ul></div><h3 class="eclair-points-titre">À retenir absolument</h3><ul class="eclair-points"><li>L'extension du poignet est le moteur de toute prise par ténodèse.</li><li>Le geste dépend de la fonction résiduelle, non d'un protocole unique.</li><li>Traiter spasticité et problèmes cutanés avant la chirurgie fonctionnelle.</li><li>Un muscle transféré doit conserver une force utile après le transfert.</li><li>Vérifier les structures à préserver avant chaque transfert.</li><li>Programmer la rééducation avec le geste choisi.</li></ul><div class="eclair-footer"><div class="eclair-footer-text">Major ECN&nbsp;&middot;&nbsp;2025-2026</div></div></div></section>`;
writeFileSync(path, `${core}${finalBlocks}`, 'utf8');
console.log(`✓ Blocs finaux Major ECN reconstruits : ${path}`);
