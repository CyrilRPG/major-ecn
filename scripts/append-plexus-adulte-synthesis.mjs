/** Ajoute les blocs finaux manquants de la fiche plexus brachial adulte.
 * Les formulations reprennent uniquement les notions déjà présentes dans la
 * fiche et dans son extract.json ; aucune donnée chiffrée incertaine n'est
 * réintroduite.
 * Usage: node scripts/append-plexus-adulte-synthesis.mjs <editable-body.html>
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const path = resolve(process.argv[2] || '');
if (!process.argv[2]) process.exit(1);
const body = readFileSync(path, 'utf8');
if (body.includes('fiche-eclair-page')) {
  console.error('Synthèse déjà présente : aucune modification.');
  process.exit(2);
}

const finalBlocks = `
<section class="page synthese-page">
  <div class="partie-banner partie-banner--plain"><span class="partie-banner-title">Synthèse — Tableaux de révision</span></div>
  <div class="synthese-bloc"><h3 class="synthese-titre">Topographie lésionnelle et objectif fonctionnel</h3><div class="table-synthese content"><table><thead><tr><th>Situation</th><th>Point décisif</th><th>Objectif de reconstruction</th></tr></thead><tbody>
    <tr><td>Avulsion complète C5–T1</td><td>Absence de racine greffable</td><td>Stabiliser l'épaule, réanimer la flexion du coude et obtenir une sensibilité protectrice de la main par transferts nerveux.</td></tr>
    <tr><td>Atteinte C5–C6 ± C7 avec main préservée</td><td>Atteinte incomplète, meilleur potentiel fonctionnel</td><td>Réanimer l'épaule et la flexion du coude, en privilégiant des transferts proches des effecteurs.</td></tr>
    <tr><td>Lésion rétro- ou infraclaviculaire</td><td>Association possible à une atteinte ostéoarticulaire ou vasculaire</td><td>Évaluer chaque contingent ; réparer précocement lorsque les branches distales sont accessibles.</td></tr>
  </tbody></table></div></div>
  <div class="synthese-bloc"><h3 class="synthese-titre">Bilan et stratégie opératoire</h3><div class="table-synthese content"><table><thead><tr><th>Étape</th><th>Éléments à recueillir</th><th>Impact</th></tr></thead><tbody>
    <tr><td>Examen clinique répété</td><td>Testing moteur muscle par muscle, sensibilité, douleurs neuropathiques, signes sympathiques et lésions associées.</td><td>Précise la gravité et recherche une récupération débutante.</td></tr>
    <tr><td>Explorations</td><td>EMG, IRM du plexus et imagerie des lésions associées selon le contexte.</td><td>Distinguent les niveaux lésionnels et complètent la planification.</td></tr>
    <tr><td>Choix de la réparation</td><td>Rupture postganglionnaire, avulsion, disponibilité des donneurs et délai.</td><td>Suture ou greffe si possible ; transfert nerveux lorsque la racine n'est pas greffable.</td></tr>
  </tbody></table></div></div>
  <div class="synthese-bloc"><h3 class="synthese-titre">Transferts et solutions secondaires</h3><div class="table-synthese content"><table><thead><tr><th>Fonction visée</th><th>Solution rapportée</th><th>Place</th></tr></thead><tbody>
    <tr><td>Stabilisation et rotation de l'épaule</td><td>Nerf spinal accessoire vers nerf suprascapulaire ; branche du triceps vers nerf axillaire.</td><td>Priorité des lésions proximales.</td></tr>
    <tr><td>Flexion du coude</td><td>Transfert fasciculaire ulnaire vers biceps, éventuellement associé à un transfert médian vers brachial.</td><td>Transfert à proximité des effecteurs ; récupération plus rapide rapportée.</td></tr>
    <tr><td>Déficit résiduel</td><td>Arthrodèse, transferts tendineux ou lambeau libre selon la fonction restante.</td><td>Chirurgie palliative secondaire, après appréciation du résultat de la réinnervation.</td></tr>
  </tbody></table></div></div>
</section>
<section class="page eclair-page fiche-eclair-page"><div class="eclair-card"><div class="eclair-eyebrow">Révision express</div><h2 class="eclair-title">Fiche éclair</h2><p class="eclair-sub">Chirurgie de réparation du plexus brachial de l'adulte</p><div class="eclair-rule"></div><div class="eclair-body content"><ul class="ft-list">
  <li>Une lésion traumatique du plexus impose un <strong>bilan topographique, moteur, sensitif et vasculaire répété</strong>.</li>
  <li>La distinction majeure est celle entre <strong>rupture postganglionnaire</strong>, potentiellement greffable, et <strong>avulsion radiculaire</strong>, qui impose une stratégie de transfert.</li>
  <li>Dans les avulsions C5–T1, les objectifs réalistes sont l'<strong>épaule stable</strong>, la <strong>flexion du coude</strong> et une sensibilité protectrice de la main.</li>
  <li>Une atteinte C5–C6 avec fonction distale conservée a un meilleur potentiel ; les transferts nerveux y privilégient la proximité des effecteurs.</li>
  <li>Le transfert <strong>spinal accessoire–suprascapulaire</strong> vise l'épaule ; le transfert <strong>ulnaire–biceps</strong> vise la flexion du coude.</li>
  <li>Les lésions rétro- et infraclaviculaires doivent faire rechercher les <strong>atteintes vasculaires et ostéoarticulaires associées</strong>.</li>
  <li>La récupération est prolongée et partielle : le suivi associe l'évaluation fonctionnelle, la prise en charge de la douleur et la réinsertion socioprofessionnelle.</li>
  <li>Les gestes palliatifs ne remplacent pas la réparation précoce ; ils s'envisagent selon la fonction résiduelle.</li>
</ul></div><h3 class="eclair-points-titre">À retenir absolument</h3><ul class="eclair-points"><li>Ne pas promettre une restitution complète du plexus : fixer des objectifs fonctionnels hiérarchisés.</li><li>Le diagnostic de gravité repose sur un examen clinique répété et les explorations adaptées.</li><li>Avulsion radiculaire : pas de racine greffable, donc transfert nerveux.</li><li>La conservation de la main oriente vers la récupération de l'épaule et du coude.</li><li>Les transferts tendineux et arthrodèses relèvent d'une stratégie secondaire.</li><li>La douleur neuropathique et l'enjeu professionnel font partie du suivi.</li></ul><div class="eclair-footer"><div class="eclair-footer-text">Major ECN&nbsp;&middot;&nbsp;2025-2026</div></div></div></section>`;

writeFileSync(path, `${body}${finalBlocks}`, 'utf8');
console.log(`✓ Synthèse et fiche éclair ajoutées : ${path}`);
