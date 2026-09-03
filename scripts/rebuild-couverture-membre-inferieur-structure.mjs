/** Répare la structure de la fiche historique de couverture du membre inférieur. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const path = resolve(process.argv[2] || '');
if (!process.argv[2]) throw new Error('usage: node rebuild-couverture-membre-inferieur-structure.mjs <body.html>');
const source = readFileSync(path, 'utf8');
const title = 'Couverture et pertes de substances post-traumatiques du membre inférieur';
const roman = ['I', 'II', 'III', 'IV', 'V'];
// L'ancienne fiche avait supprimé les accents du texte médical. Cette table ne
// change aucun terme ni aucune donnée : elle rétablit uniquement l'orthographe
// française à partir des formulations présentes dans le corpus source.
const accentMap = {
  'generalites': 'généralités', 'inferieur': 'inférieur', 'inferieure': 'inférieure', 'inferieurs': 'inférieurs', 'superieur': 'supérieur', 'superieure': 'supérieure', 'superieurs': 'supérieurs',
  'progres': 'progrès', 'considerables': 'considérables', 'annees': 'années', 'reduction': 'réduction', 'reeducation': 'rééducation', 'sequelles': 'séquelles', 'unite': 'unité', 'majorite': 'majorité', 'age': 'âge', 'dependance': 'dépendance',
  'predicitfs': 'prédictifs', 'predictifs': 'prédictifs', 'differee': 'différée', 'education': 'éducation', 'pauvrete': 'pauvreté', 'meme': 'même', 'particulierement': 'particulièrement', 'lesions': 'lésions', 'recuperation': 'récupération',
  'heterogene': 'hétérogène', 'interet': 'intérêt', 'necessite': 'nécessite', 'reparation': 'réparation', 'tres': 'très', 'platre': 'plâtre', 'platree': 'plâtrée', 'contre-indiquee': 'contre-indiquée', 'aleatoire': 'aléatoire', 'eleve': 'élevé',
  'osteosynthese': 'ostéosynthèse', 'recommandee': 'recommandée', 'deperiostage': 'dépériostage', 'duree': 'durée', 'fermees': 'fermées', 'classiquement': 'classiquement', 'contre-indique': 'contre-indiqué', 'meta-analyse': 'méta-analyse', 'etudes': 'études', 'difference': 'différence',
  'devascularisation': 'dévascularisation', 'penible': 'pénible', 'frequentes': 'fréquentes', 'reduire': 'réduire', 'vascularise': 'vascularisé', 'precoce': 'précoce', 'dynamisation': 'dynamisation', 'reduit': 'réduit', 'apres': 'après', 'strategie': 'stratégie',
  'pedicules': 'pédiculés', 'fasciocutanes': 'fasciocutanés', 'generaux': 'généraux', 'prelevables': 'prélevables', 'prelevement': 'prélèvement', 'prejudice': 'préjudice', 'libere': 'libéré', 'denervation': 'dénervation', 'etalement': 'étalement',
  'gastrocnemien': 'gastrocnémien', 'medial': 'médial', 'laterale': 'latérale', 'laterales': 'latérales', 'decubitus': 'décubitus', 'flechi': 'fléchi', 'aponeurotomies': 'aponévrotomies', 'desinsertion': 'désinsertion', 'decroisement': 'décroisement', 'tunnelisation': 'tunnelisation', 'compression': 'compression',
  'hemisoleaire': 'hémisoléaire', 'deconseille': 'déconseillé', 'extension': 'extension', 'elegante': 'élégante', 'malleole': 'malléole', 'malleolaire': 'malléolaire', 'malleolaires': 'malléolaires', 'laterale': 'latérale', 'laterales': 'latérales',
  'reseau': 'réseau', 'arteriel': 'artériel', 'veineux': 'veineux', 'segmentaires': 'segmentaires', 'peri-nerveux': 'périnerveux', 'perinerveux': 'périnerveux', 'musculocutanee': 'musculocutanée', 'septocutanee': 'septocutanée', 'theorie': 'théorie', 'morbidite': 'morbidité',
  'saphene': 'saphène', 'region': 'région', 'fiabilisee': 'fiabilisée', 'artere': 'artère', 'deconseille': 'déconseillé', 'preleve': 'prélevé', 'artere': 'artère', 'traversant': 'traversant', 'malleole': 'malléole', 'inferieur': 'inférieur', 'talonniere': 'talonnière',
  'limitation': 'limitation', 'engorgement': 'engorgement', 'difficulte': 'difficulté', 'posterieur': 'postérieur', 'indications': 'indications', 'vascularisation': 'vascularisation', 'anastomoses': 'anastomoses', 'peroniere': 'péronière', 'alitement': 'alitement',
  'difficile': 'difficile', 'qualite': 'qualité', 'technique': 'technique', 'branche': 'branche', 'distale': 'distale', 'voute': 'voûte', 'appui': 'appui', 'sensible': 'sensible', 'reperage': 'repérage', 'preoperatoire': 'préopératoire', 'degres': 'degrés', 'helice': 'hélice',
  'localisation': 'localisation', 'cote': 'côté', 'securite': 'sécurité', 'rapidite': 'rapidité', 'inconvenients': 'inconvénients', 'variabilite': 'variabilité', 'changement': 'changement', 'criteres': 'critères', 'possibilites': 'possibilités', 'reintervention': 'réintervention',
  'musculaires': 'musculaires', 'fiabilite': 'fiabilité', 'reference': 'référence', 'grande': 'grande', 'epanchement': 'épanchement', 'esthetiques': 'esthétiques', 'douleur': 'douleur', 'anterieur': 'antérieur', 'consequence': 'conséquence', 'surface': 'surface',
  'strategie': 'stratégie', 'vasculaire': 'vasculaire', 'receveuse': 'receveuse', 'posterieur': 'postérieur', 'fragile': 'fragile', 'eviter': 'éviter', 'terminolaterales': 'terminolatérales', 'branchement': 'branchement', 'seule': 'seule',
};
const restoreAccents = (html) => html.replace(new RegExp(`\\b(${Object.keys(accentMap).join('|')})\\b`, 'gi'), (found) => {
  const fixed = accentMap[found.toLowerCase()] || found;
  return found[0] === found[0].toUpperCase() ? `${fixed[0].toUpperCase()}${fixed.slice(1)}` : fixed;
});
const firstThead = source.indexOf('<thead>');
const firstEnd = source.indexOf('</table>', firstThead);
if (firstThead < 0 || firstEnd < 0) throw new Error('premier tableau historique introuvable');
const tables = [`<table class="fiche-table">${source.slice(firstThead, firstEnd + 8)}`, ...[...source.matchAll(/<table class="fiche-table">[\s\S]*?<\/table>/g)].map((m) => m[0])];
if (tables.length !== 6) throw new Error(`6 tableaux sources attendus, trouvés ${tables.length}`);
const tbody = (table) => /<tbody>([\s\S]*?)<\/tbody>/.exec(table)?.[1]?.trim() || '';
const sourceBodies = tables.map(tbody);
if (sourceBodies.some((body) => !body)) throw new Error('un tableau source est vide');
const config = [
  { title: 'Généralités et classifications', sections: [['Principes de prise en charge et classifications', sourceBodies[0]]] },
  { title: 'Stabilisation osseuse et planification', sections: [['Stabilisation, parage et calendrier de couverture', sourceBodies[1]]] },
  { title: 'Lambeaux pédiculés', sections: [['Lambeaux musculaires', sourceBodies[2]], ['Lambeaux fasciocutanés et perforants', sourceBodies[3]]] },
  { title: 'Lambeaux libres', sections: [['Choix et caractéristiques des lambeaux libres', sourceBodies[4]]] },
  { title: 'Stratégie vasculaire et choix par localisation', sections: [['Bilan vasculaire et couverture selon la zone', sourceBodies[5]]] },
];
const tableHtml = (partIndex, sectionIndex, sectionTitle, rows) => {
  const banner = sectionIndex === 0 ? `<tr class="ft-banner-row"><td colspan="2"><span class="partie-banner-num">${roman[partIndex]}</span><span class="partie-banner-title">${config[partIndex].title}</span></td></tr>` : '';
  const letter = String.fromCharCode(65 + sectionIndex);
  return `<table class="fiche-table"><colgroup><col class="ft-col-concept"><col class="ft-col-detail"></colgroup><thead>${banner}<tr class="ft-head-row"><th class="ft-tag">${roman[partIndex]}</th><th class="ft-subtitle"><span class="ft-subtitle-text">${letter}.&nbsp;&nbsp;${sectionTitle}</span></th></tr></thead><tbody>${rows}</tbody></table>`;
};
const parts = config.map((part, partIndex) => ({
  title: part.title,
  html: `<section class="partie-page${partIndex === 0 ? ' partie-page--first' : ''}" id="partie-${partIndex + 1}">${part.sections.map(([sectionTitle, rows], sectionIndex) => tableHtml(partIndex, sectionIndex, sectionTitle, rows)).join('')}</section>`,
}));
const plan = parts.map((part, index) => `<li class="cover-plan-item"><a class="cover-plan-link" href="#partie-${index + 1}"><span class="cover-plan-num">${roman[index]}</span><span class="cover-plan-text">${part.title}</span></a></li>`).join('');
const cover = `<div class="page-watermark"><img src="__WATERMARK__" alt=""></div><span class="string-source string-source--cours">${title}</span><span class="string-source string-source--footer">Major ECN&nbsp;&middot;&nbsp;2025-2026</span><section class="cover"><div class="cover-band"></div><div class="cover-content"><div class="cover-head"><img class="cover-logo" src="__LOGO__" alt="Major ECN"><div class="cover-matiere">Orthopédie</div><h1 class="cover-title cover-title--long">Couverture et pertes de substances<br>post-traumatiques du membre inférieur</h1><div class="cover-year">Année&nbsp;2025-2026</div></div><div class="cover-plan"><div class="cover-section-label">Plan du cours</div><ol class="cover-plan-list">${plan}</ol></div></div></section>`;
const synthesis = `<section class="page synthese-page"><div class="partie-banner partie-banner--plain"><span class="partie-banner-title">Synthèse — Tableaux de révision</span></div><div class="synthese-bloc"><h3 class="synthese-titre">Stabilisation et timing</h3><div class="table-synthese content"><table><thead><tr><th>Temps</th><th>Principe source</th></tr></thead><tbody><tr><td>Stabilisation</td><td>Le fixateur externe est le traitement de choix dans les fractures ouvertes de jambe.</td></tr><tr><td>Parage</td><td>Parage carcinologique précoce, indépendamment de la stratégie de reconstruction.</td></tr><tr><td>Couverture</td><td>Consensus : 5 à 7 jours après 1 à 3 parages.</td></tr><tr><td>Greffe osseuse</td><td>Environ 2 mois après la couverture.</td></tr></tbody></table></div></div><div class="synthese-bloc"><h3 class="synthese-titre">Lambeaux pédiculés selon la zone</h3><div class="table-synthese content"><table><thead><tr><th>Zone</th><th>Option rapportée</th></tr></thead><tbody><tr><td>Genou / tiers supérieur</td><td>Gastrocnémien médial, en première intention.</td></tr><tr><td>Tiers moyen de jambe</td><td>Hémisoléaire médial.</td></tr><tr><td>Malléole interne</td><td>Perforant tibial postérieur en hélice.</td></tr><tr><td>Malléole externe</td><td>Supramalléolaire externe.</td></tr><tr><td>Talon</td><td>Plantaire interne, ou sural à pédicule distal.</td></tr></tbody></table></div></div><div class="synthese-bloc"><h3 class="synthese-titre">Bilan vasculaire avant lambeau libre</h3><div class="table-synthese content"><table><thead><tr><th>Élément</th><th>Rappel source</th></tr></thead><tbody><tr><td>Imagerie</td><td>Angioscanner systématique des trois axes.</td></tr><tr><td>Artère receveuse</td><td>La tibiale postérieure est la plus fiable ; la tibiale antérieure est fragile sur son trajet traumatique.</td></tr><tr><td>Dernier choix</td><td>L’artère fibulaire.</td></tr><tr><td>Anastomose</td><td>Terminolatérale, branchement proximal, une seule veine.</td></tr></tbody></table></div></div></section>`;
const eclair = `<section class="page eclair-page fiche-eclair-page"><div class="eclair-card"><div class="eclair-eyebrow">Révision express</div><h2 class="eclair-title">Fiche éclair</h2><p class="eclair-sub">Couverture des pertes de substances du membre inférieur</p><div class="eclair-rule"></div><div class="eclair-body content"><ul class="ft-list"><li>Le <strong>fixateur externe</strong> est la stabilisation de choix dans la fracture ouverte de jambe.</li><li>La couverture est idéalement réalisée entre <strong>5 et 7 jours</strong>, après 1 à 3 parages.</li><li>Le gastrocnémien médial couvre le <strong>genou et le tiers supérieur</strong> ; l’hémisoléaire médial, le tiers moyen.</li><li>Le lambeau supramalléolaire externe couvre la région malléolaire externe et le dos du pied.</li><li>Le lambeau plantaire interne est la technique de choix pour le <strong>talon</strong>.</li><li>Les lambeaux libres se discutent selon la composition, la taille de la perte de substance et les possibilités de branchement.</li><li>L’<strong>angioscanner</strong> des trois axes précède un lambeau libre.</li><li>La tibiale postérieure est l’artère receveuse la plus fiable ; la fibulaire est un dernier choix.</li></ul></div><h3 class="eclair-points-titre">À retenir absolument</h3><ul class="eclair-points"><li>La qualité des parties molles conditionne le résultat fonctionnel à long terme.</li><li>Une prise en charge multidisciplinaire réduit les complications.</li><li>Le tabac est un facteur péjoratif majeur de consolidation.</li><li>La stratégie de couverture se décide après stabilisation et parage.</li><li>Ne pas choisir un lambeau libre sans bilan vasculaire.</li><li>Adapter la reconstruction à la zone d’appui et au projet fonctionnel.</li></ul><div class="eclair-footer"><div class="eclair-footer-text">Major ECN&nbsp;&middot;&nbsp;2025-2026</div></div></div></section>`;
writeFileSync(path, restoreAccents(`${cover}${parts.map((part) => part.html).join('')}${synthesis}${eclair}`), 'utf8');
console.log(`✓ Fiche couverture membre inférieur reconstruite : ${path}`);
