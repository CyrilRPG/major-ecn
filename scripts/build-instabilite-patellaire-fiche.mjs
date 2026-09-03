/** Source-led editable fiche for Instabilité patellaire. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { compileFicheModel } from './lib/orthopedie-fiche.mjs';

const chapterDir = resolve(process.argv[2] || '../.corpus-orthopedie/instabilite-patellaire');
const out = resolve(process.argv[3] || join(chapterDir, 'delivery', '2026-08-10T14-25-00-source-recovery'));
mkdirSync(out, { recursive: true });
const R = (concept, bullets, marker) => ({ concept, bullets, ...(marker ? { marker } : {}) });

const fiche = {
  title: 'Instabilité patellaire', year: '2025-2026',
  coverSubtitle: 'Physiopathologie · bilan · prise en charge',
  sourceBlocks: [11,14,16,20,21,22,24,29,30,32,37,41,46,48,52,59,64,68,76,78,79,80,81,84,85,104,105,122,124,125,126,133,138,152,157,160,166,175,185,199,204,206,213,217,218,219,223],
  imageException: { reason: 'Les images du corpus ne disposent pas de légendes source suffisamment exploitables ; aucune légende n’est donc affichée ni inventée.' },
  parts: [
    { title: 'Comprendre la stabilité fémoropatellaire', sections: [
      { title: 'Équilibre des forces', rows: [
        R('Articulation peu congruente', ['À chaque degré de flexion, seule une étroite zone de la patella est en contact avec la trochlée.', 'La stabilité dépend de l’équilibre entre forces subluxantes externes et internes.']),
        R('Forces subluxantes externes', ['L’angle Q est formé par les axes du tendon quadricipital et du tendon patellaire ; il est classiquement inférieur à 15°.', 'Un genu valgum associé à une rotation externe tibiale marquée favorise la translation externe.', 'La rétraction du rétinaculum externe, renforcé par le tractus ilio-tibial, latéralise la patella.']),
        R('Stabilisateurs internes', ['Le vaste médial oblique est le stabilisateur dynamique majeur par son effet de médialisation.', 'L’aileron médial comporte le fascia crural, le LFPM et la capsule articulaire.', 'Le LFPM est l’élément principal de stabilité dans les premiers degrés de flexion.'], 'ecn')
      ] },
      { title: 'Course de la patella', rows: [
        R('Extension et début de flexion', ['En extension, la patella repose devant la trochlée ; les tissus mous et l’alignement de l’appareil extenseur assurent la stabilité.', 'La contraction quadricipitale crée une force externe contrebalancée par le vaste médial et la mise en tension du LFPM.']),
        R('Recentrage patellaire', ['Lors du passage de l’extension à la flexion, une patella subluxée en externe doit se recentrer.', 'La rotation interne automatique du segment jambier favorise ce recentrage.', 'Le LFPM joue un rôle principal dans les premiers degrés de flexion.']),
        R('Rôle de la trochlée', ['Vers 30° de flexion, l’engagement dans la gorge trochléenne devient déterminant.', 'La profondeur de la gorge et la pente de la facette latérale stabilisent la patella entre 30° et 100°.', 'Tout obstacle au glissement, à la bascule ou à la translation peut déséquilibrer le système.'], 'trap')
      ] }
    ] },
    { title: 'Reconnaître l’épisode aigu et les récidives', sections: [
      { title: 'Primoluxation patellaire', rows: [
        R('Présentation évocatrice', ['Une adolescente peut décrire un dérobement douloureux lors d’un mouvement forcé en rotation ou en valgus-flexion.', 'Le claquement est suivi d’une impotence fonctionnelle ; la luxation peut se réduire spontanément.', 'À distance, l’épanchement et la douleur du bord médial de la patella orientent le diagnostic.']),
        R('Examen et contexte', ['Rechercher les antécédents personnels ou familiaux de luxation patellaire.', 'Évaluer également les autres ligaments du genou et une éventuelle laxité frontale ou sagittale asymétrique.', 'Un gros genou douloureux après réduction ne doit pas faire méconnaître une lésion associée.']),
        R('Radiographies initiales', ['Réaliser face, profil et incidence fémoropatellaire à 45°.', 'Rechercher épanchement, épaississement médial, arrachement osseux au bord interne de la patella et lésions ostéochondrales.', 'La TDM complète le bilan en cas de doute diagnostique.'], 'ecn')
      ] },
      { title: 'Prise en charge du premier épisode', rows: [
        R('Place de l’IRM', ['L’IRM urgente se discute pour lever un doute ; elle n’est pas systématique à visée thérapeutique dans toute primoluxation.', 'Elle apporte des informations ligamentaires et cartilagineuses utiles au bilan individualisé.']),
        R('Indication chirurgicale urgente', ['Une fracture patellaire ou fémorale associée peut imposer l’ablation d’un corps étranger intra-articulaire ou une ostéosynthèse.', 'Le geste peut être arthroscopique ou par abord direct selon la lésion.']),
        R('Traitement conservateur initial', ['Après réduction, immobiliser le genou près de l’extension pendant environ quatre semaines avec prévention thrombotique.', 'La rééducation associe récupération analytique, proprioception et coordination musculaire.', 'Le choix doit tenir compte de l’histoire naturelle et du risque de récidive.'])
      ] }
    ] },
    { title: 'Conduire le bilan d’une instabilité chronique', sections: [
      { title: 'Examen clinique comparatif', rows: [
        R('Analyse statique', ['Rechercher genu varum ou valgum, troubles de torsion et strabisme patellaire.', 'Apprécier l’amyotrophie quadriceps, surtout du vaste médial, ainsi que la rétraction des ischiojambiers.', 'Observer aussi recurvatum, attitude en triple flexion et marche.']),
        R('Course patellaire', ['En position assise, observer la flexion-extension à la recherche d’une dysharmonie de trajet.', 'Un ressaut, un signe du J ou de la virgule traduisent une subluxation latérale dans les premiers degrés de flexion.']),
        R('Mobilité et appréhension', ['Étudier la mobilité transversale : patella flottante ou préluxable vers l’extérieur orientent la laxité.', 'La manœuvre de Smillie déclenche une appréhension lors de la subluxation externe provoquée en flexion.', 'Mesurer aussi la mobilité verticale et le statut musculaire.'], 'ecn')
      ] },
      { title: 'Imagerie et facteurs anatomiques', rows: [
        R('Radiographies standard', ['Elles recherchent les facteurs anatomiques favorisants et les diagnostics différentiels.', 'Les examens complémentaires sont réservés au doute persistant ou à l’échec du traitement médical.']),
        R('Repères radiographiques', ['Le profil peut montrer le signe du croisement, l’éperon sus-trochléen ou le double contour en cas de dysplasie.', 'L’angle patellaire normal est de 140° ; l’angle de sulcus se situe entre 125° et 145°.', 'L’index d’Insall apprécie la hauteur patellaire.']),
        R('TDM et IRM', ['La TA-GT est le plus souvent mesurée en tomodensitométrie ; une TTA latéralisée favorise l’instabilité.', 'L’IRM apprécie notamment ligaments, cartilage, TA-GT et engagement patellaire.', 'Les patients instables présentent plus souvent trochlée peu profonde, hauteur patellaire et TA-GT augmentées.'], 'yield')
      ] }
    ] },
    { title: 'Adapter le traitement au mécanisme', sections: [
      { title: 'Mesures conservatrices', rows: [
        R('Objectifs de la rééducation', ['Réduire les raideurs et l’hypoextensibilité des chaînes musculotendineuses.', 'Rééquilibrer agonistes et antagonistes et renforcer les muscles déficitaires ou sous-utilisés.', 'Réharmoniser les mouvements lombo-pelviens, de hanche et de genou.']),
        R('Limites des moyens isolés', ['Dans les instabilités patellaires avérées, les mesures conservatrices n’ont pas démontré une efficacité isolée suffisante.', 'Elles complètent la chirurgie ou constituent une option palliative si celle-ci ne peut être réalisée.']),
        R('Facteurs à corriger', ['Les facteurs primaires sont surtout morphologiques : dysplasie trochléenne, TA-GT augmentée, trouble de hauteur ou de bascule.', 'Les facteurs secondaires comprennent genu valgum, recurvatum, antéversion fémorale excessive, rotation fémorotibiale élevée et dysplasie patellaire.'])
      ] },
      { title: 'Gestes chirurgicaux', rows: [
        R('Transposition de la TTA', ['Les gestes osseux portent principalement sur la TTA : abaissement en cas de patella alta ou médialisation de type Elmslie-Trillat selon la TA-GT.', 'La fixation de la transposition est assurée par ostéosynthèse.', 'Une correction trochléenne ou de l’axe peut être associée selon les anomalies.'], 'ecn'),
        R('Reconstruction du LFPM', ['Le LFPM est fréquemment rompu après primoluxation ; sa reconstruction est proposée en cas de récidive.', 'Le greffon, les modalités de fixation et la tension doivent être adaptés à la situation anatomique.', 'Une plastie isolée peut donner des résultats hétérogènes si les facteurs associés ne sont pas corrigés.']),
        R('Autres gestes sur les tissus mous', ['Allongement de l’aileron externe en cas de rétraction.', 'Ténodèse du tendon patellaire si patella alta avec retard d’engagement.', 'Transposition du VMO pour augmenter son effet de médialisation.'], 'trap')
      ] }
    ] },
    { title: 'Décider et organiser les suites', sections: [
      { title: 'Indication individualisée', rows: [
        R('Avant toute chirurgie', ['L’inventaire des données anatomiques et biomécaniques propres au patient est indispensable.', 'Il n’existe pas de geste standard : les causes sont multiples et variables d’un sujet à l’autre.', 'La chirurgie ne corrige pas toujours tous les facteurs.']),
        R('Profil du patient', ['L’âge, la maturation squelettique, la gêne fonctionnelle et les besoins influencent la décision.', 'Chez le sujet dont la croissance n’est pas achevée, différer les gestes osseux lorsque cela est possible.', 'Une chirurgie des parties molles peut être envisagée si les épisodes sont trop fréquents.']),
        R('Objectif de la stratégie', ['Prévenir les récidives responsables de lésions ostéochondrales et d’arthrose précoce.', 'Ne pas proposer de chirurgie trop rapidement : la décision doit répondre aux caractéristiques du patient et à la balance bénéfice-risque.'], 'trap')
      ] },
      { title: 'Suites et surveillance', rows: [
        R('Protection initiale', ['Les associations thérapeutiques nécessitent habituellement attelle en légère flexion, appui protégé et mobilisation en secteur limité.', 'Les contractions actives répétées du quadriceps sont introduites progressivement.']),
        R('Rééducation secondaire', ['Après consolidation et cicatrisation, l’attelle est abandonnée.', 'Le programme intensifie récupération des amplitudes, renforcement statique et dynamique, proprioception et réentraînement à l’effort.', 'La reprise sportive est initialement modérée et se discute selon l’évolution.']),
        R('Résultats et complications', ['Les critères de suivi incluent satisfaction, récidive, test d’appréhension et score de Kujala.', 'La récidive n’est pas la seule complication : une dégénérescence arthrosique secondaire doit être anticipée.'])
      ] }
    ] }
  ],
  synthesis: {
    chiffres: { headers: ['Repère', 'Valeur issue du corpus', 'Interprétation'], rows: [['Angle Q', 'Classiquement < 15°', 'Une valeur supérieure favorise la translation externe'], ['Angle patellaire', '140°', 'Repère morphologique radiographique'], ['Angle de sulcus', '125° à 145°', 'Une trochlée plate réduit la stabilité'], ['Engagement trochléen', 'À partir d’environ 30° de flexion', 'La congruence devient stabilisatrice']] },
    tables: [
      { title: 'Bilan : du symptôme à la décision', headers: ['Étape', 'Ce qui est recherché', 'Conséquence'], rows: [['Épisode aigu', 'Épanchement, douleur médiale, lésion osseuse associée', 'Radiographies, TDM si doute'], ['Clinique chronique', 'Trajet patellaire, appréhension, facteurs d’axe et musculaires', 'Inventaire complet et comparatif'], ['Imagerie', 'Trochlée, hauteur, TA-GT, cartilage et LFPM', 'Identification des facteurs corrigeables'], ['Décision', 'Âge, gêne, besoins et facteurs anatomiques', 'Stratégie individualisée']] },
      { title: 'Facteur dominant et principe thérapeutique', headers: ['Facteur', 'Principe', 'Vigilance'], rows: [['Déficit de contrôle musculaire', 'Rééducation et réharmonisation', 'Ne pas promettre une efficacité isolée dans l’instabilité avérée'], ['TTA latéralisée / patella alta', 'Médialisation ou abaissement de TTA', 'Mesure préalable du facteur anatomique'], ['Rupture / insuffisance du LFPM', 'Reconstruction ligamentaire', 'Adapter la tension et traiter les facteurs associés'], ['Dysplasie ou trouble d’axe', 'Geste osseux éventuellement associé', 'Respecter la maturation squelettique']] }
    ],
    keyPoints: ['La stabilité patellaire dépend de l’équilibre des forces et de l’engagement trochléen.', 'Le LFPM est central dans les premiers degrés de flexion et se rompt fréquemment lors d’une luxation.', 'Une primoluxation se traite le plus souvent de façon conservatrice hors lésion associée imposant un geste urgent.', 'Le bilan chronique est clinique, bilatéral, comparatif et complété par une imagerie ciblée.', 'Trochlée, hauteur patellaire, TA-GT et bascule sont les principaux facteurs morphologiques.', 'La chirurgie se décide sur un inventaire complet, jamais sur un facteur isolé.', 'Les gestes osseux sont temporisés chez le sujet à croissance inachevée.'],
    eclair: ['Penser équilibre des forces : angle Q, valgus / torsion, aileron externe contre VMO et LFPM.', 'Entre 0° et 30°, le LFPM participe au recentrage ; au-delà la trochlée devient stabilisatrice.', 'Primoluxation : épanchement et douleur médiale ; radiographies systématiques.', 'Urgence chirurgicale : fracture associée ou corps étranger intra-articulaire.', 'Instabilité chronique : examen comparatif puis radiographies, TDM et/ou IRM ciblées.', 'Mesurer les facteurs : dysplasie trochléenne, hauteur patellaire, TA-GT et bascule.', 'Traiter le mécanisme, le terrain et les besoins du patient ; prévenir les récidives.']
  }
};

writeFileSync(join(out, 'fiche.model.json'), `${JSON.stringify(fiche, null, 2)}\n`, 'utf8');
writeFileSync(join(out, 'fiche.body.html'), compileFicheModel(fiche, chapterDir), 'utf8');
console.log(`Fiche éditable créée : ${out}`);
