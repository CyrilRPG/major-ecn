/** Blocs finaux source-fidèles pour la fiche des traumatismes cervicaux récents.
 * Usage: node scripts/append-trauma-rachis-cervical-synthesis.mjs <body.html>
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const path = resolve(process.argv[2] || '');
if (!process.argv[2]) process.exit(1);
const body = readFileSync(path, 'utf8');
if (body.includes('fiche-eclair-page')) process.exit(2);
const end = `
<section class="page synthese-page"><div class="partie-banner partie-banner--plain"><span class="partie-banner-title">Synthèse — Tableaux de révision</span></div>
<div class="synthese-bloc"><h3 class="synthese-titre">Conduite initiale</h3><div class="table-synthese content"><table><thead><tr><th>Priorité</th><th>Éléments du cours</th><th>Décision</th></tr></thead><tbody>
<tr><td>Double objectif</td><td>Préserver la fonction neurologique et stabiliser le rachis.</td><td>Le traitement orthopédique et le traitement chirurgical se discutent après bilan lésionnel complet.</td></tr>
<tr><td>Situation urgente</td><td>Déficit neurologique ou compression à évaluer immédiatement.</td><td>Organiser la stratégie de réduction et de décompression selon le niveau et l'instabilité.</td></tr>
<tr><td>Imagerie</td><td>Scanner, IRM selon l'indication, clichés dynamiques seulement dans un cadre sécurisé.</td><td>Préciser les lésions osseuses, disco-ligamentaires, médullaires et les lésions associées.</td></tr>
</tbody></table></div></div>
<div class="synthese-bloc"><h3 class="synthese-titre">Rachis cervical supérieur</h3><div class="table-synthese content"><table><thead><tr><th>Lésion</th><th>Point discriminant</th><th>Principe de traitement présenté</th></tr></thead><tbody>
<tr><td>Jonction occipitocervicale</td><td>Rapport entre stabilité, réduction et choix de l'arthrodèse occipitocervicale.</td><td>Installation, angle occipitocervical, fixation occipitale et greffe conditionnent le montage.</td></tr>
<tr><td>C1–C2</td><td>Jefferson, entorse transverse, subluxation rotatoire ou association avec l'odontoïde.</td><td>Choisir entre traitement conservateur, arthrodèse et technique de vissage selon la stabilité et la réduction.</td></tr>
<tr><td>Odontoïde</td><td>Type d'Anderson–Alonzo, déplacement, orientation du trait et possibilité de réduction.</td><td>Le vissage antérieur n'est envisagé que lorsque ses conditions sont réunies ; sinon une autre stabilisation est discutée.</td></tr>
</tbody></table></div></div>
<div class="synthese-bloc"><h3 class="synthese-titre">Rachis cervical sous-axial</h3><div class="table-synthese content"><table><thead><tr><th>Situation</th><th>Analyse</th><th>Voie et montage</th></tr></thead><tbody>
<tr><td>Lésions de type A</td><td>Tassement, comminution ou tear-drop selon la classification d'Argenson.</td><td>Réduction, reconstruction et stabilisation adaptées à la gravité du trait.</td></tr>
<tr><td>Lésions de type B</td><td>Entorse, rupture disco-ligamentaire ou luxation biarticulaire.</td><td>Le caractère instable guide l'indication d'une stabilisation, par voie antérieure, postérieure ou combinée.</td></tr>
<tr><td>Lésions de type C et D</td><td>Extension sur canal étroit, fractures-luxations et lésions articulaires.</td><td>La réduction sécurisée, la décompression si nécessaire et le choix des vis dépendent des rapports anatomiques.</td></tr>
</tbody></table></div></div></section>
<section class="page eclair-page fiche-eclair-page"><div class="eclair-card"><div class="eclair-eyebrow">Révision express</div><h2 class="eclair-title">Fiche éclair</h2><p class="eclair-sub">Chirurgie des traumatismes récents du rachis cervical</p><div class="eclair-rule"></div><div class="eclair-body content"><ul class="ft-list"><li>Un traumatisme cervical associe toujours deux objectifs : <strong>protection neurologique</strong> et <strong>stabilité rachidienne</strong>.</li><li>Le bilan d'imagerie doit identifier les lésions osseuses, disco-ligamentaires, médullaires et associées avant de choisir la voie.</li><li>Un déficit neurologique constitue une situation urgente qui structure la stratégie de réduction et de décompression.</li><li>Au rachis cervical supérieur, la stabilité C1–C2 et les conditions de réduction orientent le choix entre traitement conservateur, vissage et arthrodèse.</li><li>Le vissage antérieur de l'odontoïde dépend du déplacement, de l'orientation du trait et de la possibilité de réduction.</li><li>Au rachis sous-axial, la classification d'Argenson aide à distinguer compression, entorse et fractures-luxations.</li><li>Une lésion disco-ligamentaire instable ne se raisonne pas comme une fracture isolée.</li><li>Les rapports anatomiques à risque conditionnent le choix et l'exécution des vis cervicales.</li></ul></div><h3 class="eclair-points-titre">À retenir absolument</h3><ul class="eclair-points"><li>Ne pas différer le bilan neurologique et l'imagerie utile devant une instabilité suspectée.</li><li>Réduire sans stratégie complète expose à une aggravation neurologique ou mécanique.</li><li>Le niveau lésionnel sépare le raisonnement occipitocervical/C1–C2 du rachis sous-axial.</li><li>Les lésions de type B à D imposent une analyse fine de l'instabilité.</li><li>Le choix antérieur, postérieur ou combiné est une décision lésionnelle, pas un automatisme.</li><li>La précision du montage et la greffe font partie de la stabilité finale.</li></ul><div class="eclair-footer"><div class="eclair-footer-text">Major ECN&nbsp;&middot;&nbsp;2025-2026</div></div></div></section>`;
writeFileSync(path, `${body}${end}`, 'utf8');
console.log(`✓ Synthèse et fiche éclair ajoutées : ${path}`);
