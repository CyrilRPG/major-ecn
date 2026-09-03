/**
 * R&eacute;pare la fiche historique des fractures de l'extr&eacute;mit&eacute; sup&eacute;rieure du radius.
 * Les anciens encadr&eacute;s &laquo; fiche &eacute;clair &raquo; int&eacute;gr&eacute;s dans le cours redeviennent
 * des listes source ; une seule synth&egrave;se et une seule fiche &eacute;clair sont ajout&eacute;es
 * &agrave; la fin, selon le template Major ECN.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const bodyPath = resolve(process.argv[2] || '');
if (!process.argv[2]) throw new Error('usage: node rebuild-radius-superieur-final-blocks.mjs <body.html>');
const original = readFileSync(bodyPath, 'utf8');
let core = original
  .replace(/<div class="eclair-card">\s*(<ul>[\s\S]*?<\/ul>)\s*<\/div>/g, '$1')
  .replace(/<p>([\s\S]*?)<\/p>/g, '<ul><li>$1</li></ul>')
  .replace('<section class="partie-page" id="partie-1">', '<section class="partie-page partie-page--first" id="partie-1">');
if ((original.match(/class="eclair-card"/g) || []).length !== 4) {
  throw new Error('Le nombre d\'anciens encadr&eacute;s &eacute;clair est inattendu.');
}
if (core.includes('class="eclair-card"')) throw new Error('Un ancien encadr&eacute; &eacute;clair subsiste dans le cours.');

const finalBlocks = `
<!-- ===== SYNTHESE ===== -->
<section class="page synthese-page">
  <div class="partie-banner partie-banner--plain"><span class="partie-banner-title">Synth&egrave;se &mdash; Tableaux de r&eacute;vision</span></div>
  <div class="synthese-bloc">
    <h3 class="synthese-titre">Choisir une strat&eacute;gie pour la t&ecirc;te radiale</h3>
    <div class="table-synthese content"><table><thead><tr><th>Situation d&eacute;crite dans le cours</th><th>Principe &agrave; retenir</th></tr></thead><tbody>
      <tr><td>Fracture non d&eacute;plac&eacute;e (Mason 1)</td><td>Traitement fonctionnel, r&eacute;&eacute;ducation imm&eacute;diate et contr&ocirc;les &agrave; S1, J15 puis J45.</td></tr>
      <tr><td>Fracture synth&eacute;sable</td><td>Pr&eacute;server la t&ecirc;te radiale par ost&eacute;osynth&egrave;se lorsque les fragments articulaires sont reconstructibles.</td></tr>
      <tr><td>Fracture comminutive non synth&eacute;sable</td><td>R&eacute;section &eacute;conomique ou arthroplastie selon la stabilit&eacute; et les l&eacute;sions associ&eacute;es.</td></tr>
      <tr><td>Atteinte ligamentaire ou l&eacute;sion associ&eacute;e</td><td>Restaurer la console lat&eacute;rale et r&eacute;parer les stabilisateurs identifi&eacute;s.</td></tr>
    </tbody></table></div>
  </div>
  <div class="synthese-bloc">
    <h3 class="synthese-titre">R&eacute;section et arthroplastie : points de d&eacute;cision</h3>
    <div class="table-synthese content"><table><thead><tr><th>Rep&egrave;re</th><th>Cons&eacute;quence pratique</th></tr></thead><tbody>
      <tr><td>Avant une r&eacute;section</td><td>Faire un bilan du poignet ; rechercher notamment une atteinte radio-ulnaire distale ou de la membrane interosseuse.</td></tr>
      <tr><td>R&eacute;section simple</td><td>Elle est contre-indiqu&eacute;e en cas de rupture du LCM, syndrome d'Essex-Lopresti, fracture de Monteggia ou index radio-ulnaire positif.</td></tr>
      <tr><td>Hauteur de l'implant</td><td>Le bord sup&eacute;rieur de la cupule doit &ecirc;tre au niveau de l'apophyse corono&iuml;de ; tester avec les implants d'essai.</td></tr>
      <tr><td>Malposition haute</td><td>Elle expose &agrave; une hyperpression sur le capitulum et &agrave; l'usure cartilagineuse.</td></tr>
    </tbody></table></div>
  </div>
  <div class="synthese-bloc">
    <h3 class="synthese-titre">Mobilisation, complications et associations</h3>
    <div class="table-synthese content"><table><thead><tr><th>Temps de prise en charge</th><th>Message op&eacute;ratoire ou de surveillance</th></tr></thead><tbody>
      <tr><td>Apr&egrave;s une reconstruction stable</td><td>La mobilisation pr&eacute;coce du coude est l'objectif ; elle pr&eacute;vient l'enraidissement.</td></tr>
      <tr><td>Instabilit&eacute; persistante en extension</td><td>R&eacute;parer le plan lat&eacute;ral ; la suture m&eacute;diale est discut&eacute;e si l'instabilit&eacute; persiste.</td></tr>
      <tr><td>Fracture de l'ulna associ&eacute;e</td><td>Obtenir une synth&egrave;se ulnaire stable ; ne pas r&eacute;s&eacute;quer la t&ecirc;te radiale qui participe &agrave; la console lat&eacute;rale.</td></tr>
      <tr><td>Arthrolyse</td><td>La voie lat&eacute;rale est particuli&egrave;rement adapt&eacute;e car elle suit l'axe de rotation du coude.</td></tr>
    </tbody></table></div>
  </div>
</section>
<!-- ===== FICHE ECLAIR ===== -->
<section class="page eclair-page fiche-eclair-page"><div class="eclair-card">
  <div class="eclair-eyebrow">R&eacute;vision express</div><h2 class="eclair-title">Fiche &eacute;clair</h2>
  <p class="eclair-sub">Fractures de l'extr&eacute;mit&eacute; sup&eacute;rieure du radius</p><div class="eclair-rule"></div>
  <div class="eclair-body content"><ul class="ft-list">
    <li>Une fracture de type Mason 1 rel&egrave;ve d'un <strong>traitement fonctionnel</strong> avec mobilisation pr&eacute;coce.</li>
    <li>La <strong>voie lat&eacute;rale</strong> est la moins traumatisante pour la vascularisation de la t&ecirc;te radiale.</li>
    <li>Avant toute r&eacute;section, faire un <strong>bilan du poignet</strong> et rechercher une l&eacute;sion radio-ulnaire associ&eacute;e.</li>
    <li>Une r&eacute;section simple est contre-indiqu&eacute;e si le <strong>LCM</strong> est rompu ou dans un syndrome d'Essex-Lopresti.</li>
    <li>Une t&ecirc;te radiale non synth&eacute;sable peut n&eacute;cessiter une <strong>arthroplastie</strong> pour maintenir la stabilit&eacute; lat&eacute;rale.</li>
    <li>Une cupule trop haute entra&icirc;ne une <strong>hyperpression capitellaire</strong>.</li>
    <li>Apr&egrave;s une stabilisation fiable, viser une <strong>mobilisation imm&eacute;diate</strong> du coude.</li>
    <li>Avec une fracture de l'ulna, la r&eacute;section de la t&ecirc;te radiale est <strong>contre-indiqu&eacute;e</strong>.</li>
  </ul></div>
  <h3 class="eclair-points-titre">&Agrave; retenir absolument</h3><ul class="eclair-points">
    <li>R&eacute;parer le ligament annulaire au cours de l'abord lat&eacute;ral.</li>
    <li>V&eacute;rifier la stabilit&eacute; du coude apr&egrave;s chaque geste de reconstruction.</li>
    <li>Contr&ocirc;ler la hauteur de la proth&egrave;se avec les implants d'essai.</li>
    <li>Surveiller le d&eacute;placement secondaire &agrave; S1 et J15.</li>
    <li>La consolidation est &eacute;valu&eacute;e &agrave; J45 dans le protocole fonctionnel.</li>
    <li>La pr&eacute;servation de la console lat&eacute;rale conditionne la stabilit&eacute; dans les l&eacute;sions associ&eacute;es.</li>
  </ul><div class="eclair-footer"><div class="eclair-footer-text">Major ECN&nbsp;&middot;&nbsp;2025-2026</div></div>
</div></section>`;

writeFileSync(bodyPath, `${core.trim()}${finalBlocks}`, 'utf8');
console.log(`Blocs finaux reconstruits : ${bodyPath}`);
