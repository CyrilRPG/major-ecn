/**
 * Rebuild only the editable fiche for course d0396f85-d665-4202-8f36-b15f8aaf6d08.
 * The model is deliberately restricted to the canonical re-extraction of
 * « Révision de prothèse d'épaule » (64 text blocks and six captioned figures).
 * It does not read, alter or publish flashcards, QCM or DP.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { compileFicheModel, validateFicheModel } from './lib/orthopedie-fiche.mjs';

const coursId = 'd0396f85-d665-4202-8f36-b15f8aaf6d08';
const chapterDir = resolve('../.corpus-orthopedie/revision-de-prothese-d-epaule');
const outputDir = join(chapterDir, 'delivery', 'reconstruction-editoriale-2026-08-11');
mkdirSync(outputDir, { recursive: true });

const row = (concept, bullets, options = {}) => ({ concept, bullets, ...options });
const figure = (path, caption, sourceCaption, size = 'large') => ({ path, caption, sourceCaption, size, position: 'after' });

// Captions are concise learner-facing restatements of the accompanying source
// captions; sourceCaption preserves the canonical figure provenance.
const captions = {
  instabilite: 'Excentration supérieure avec descellement glénoïdien secondaire.',
  extraction: 'Trois voies d’extraction d’une tige humérale.',
  fracture: 'Fracture proximale traitée par tige longue et cerclages.',
  conversion: 'Conversion d’une prothèse anatomique vers une inversée.',
  mesure: 'Conversion sur mesure sur tige conservée.',
  spacer: 'Espaceur antibiotique après ablation d’une prothèse infectée.',
};
const sourceCaptions = {
  instabilite: 'Radiographie d’une prothèse totale anatomique : l’excentration supérieure tardive accompagne une insuffisance de coiffe et un descellement du composant glénoïdien.',
  extraction: 'Différentes approches pour enlever une tige humérale cimentée ou non : volet osseux, ostéotomie le long de la gouttière bicipitale et fenêtre médiale.',
  fracture: 'Fracture proximale de l’humérus peropératoire après ablation, traitée par prothèse inversée à longue tige cimentée et cerclages.',
  conversion: 'Prothèse anatomique avec coiffe insuffisante et descellement, puis révision vers un modèle inversé grâce à la modularité.',
  mesure: 'Exemple d’implant inversé sur mesure monté sur une tige avec cône Morse conservée.',
  spacer: 'Radiographie d’un espaceur de ciment acrylique à la gentamicine après ablation d’une prothèse inversée infectée.',
};

const model = {
  title: 'Révision de prothèse d’épaule',
  year: '2025-2026',
  coverSubtitle: 'Causes d’échec · bilan de reprise · reconstruction et conversion',
  sourceBlocks: [0, 1, 2, 3, 4, 6, 8, 12, 14, 16, 18, 20, 23, 25, 28, 32, 39, 43, 44, 45, 46, 47, 50, 52, 54, 56, 58, 60, 62, 63],
  imageException: { reason: 'La ré-extraction canonique ne contient que six figures, toutes légendées et toutes intégrées ; aucune image supplémentaire ne peut être ajoutée sans sortir du corpus source.' },
  parts: [
    {
      title: 'Identifier la cause de l’échec',
      sections: [
        { title: 'Raideur douloureuse après arthroplastie', rows: [
          row('Mobilisation sous anesthésie', ['Elle peut être discutée dans certaines raideurs.', 'Le geste est réalisé avec prudence, idéalement sous contrôle de l’amplificateur de brillance.']),
          row('Arthrolyse arthroscopique', ['Elle libère les adhérences glénohumérales et sous-acromiales.', 'L’exiguïté articulaire et les reflets sur la tête métallique rendent le geste difficile ; il est réservé à une équipe entraînée.']),
          row('Raideur en rotation externe', ['Une contracture du subscapulaire peut limiter fortement la rotation externe.', 'Capsulotomie antérieure et mobilisation du subscapulaire sont des options sélectionnées ; leur prévention se joue dès la chirurgie initiale.'])
        ] },
        { title: 'Instabilité : reconnaître le mécanisme', rows: [
          row('Instabilité multidirectionnelle', ['Elle évoque une calotte humérale inadaptée ou un déséquilibre des parties molles.', 'Si l’implant est modulaire, le changement de calotte peut suffire dans des cas sélectionnés.']),
          row('Instabilité antérieure ou supérieure', ['L’antérieure associe volontiers malrotation humérale, défaut glénoïdien antérieur, défaillance du subscapulaire ou du plan capsulaire.', 'La supérieure traduit une insuffisance de coiffe et expose le composant glénoïdien à des contraintes excentrées.'], { image: figure('img/img_001.png', captions.instabilite, sourceCaptions.instabilite) }),
          row('Instabilité postérieure ou inférieure', ['La postérieure fait rechercher rétroversion excessive, érosion glénoïdienne postérieure et déséquilibre tissulaire.', 'L’inférieure peut relever d’une restauration insuffisante de la longueur humérale, notamment après tumeur ou fracture.'])
        ] }
      ]
    },
    {
      title: 'Évaluer les tissus, les implants et le stock osseux',
      sections: [
        { title: 'Coiffe des rotateurs et parties molles', rows: [
          row('Tubérosités après fracture', ['Une migration secondaire des tubérosités compromet la coiffe ; la réinsertion anatomique initiale est déterminante.', 'Les fils diaphyso-tubérositaires et intertubérositaires participent à la prévention de cette migration.']),
          row('Rupture secondaire de coiffe', ['Elle entraîne une migration supérieure progressive et altère le résultat fonctionnel.', 'Interventions multiples, tension excessive, rééducation trop agressive et qualité tendineuse altérée favorisent notamment l’atteinte du subscapulaire.']),
          row('Choix de la reprise', ['Une réparation directe, un transfert de grand pectoral ou une allogreffe peuvent être discutés selon les tissus.', 'Quand la coiffe est irréparable et l’épaule pseudoparalytique, la conversion vers une prothèse inversée est une option de reprise.'])
        ] },
        { title: 'Descellement et bilan radiologique', rows: [
          row('Composant glénoïdien', ['Le descellement concerne fréquemment la glène.', 'Un liseré os-ciment n’est pas à lui seul synonyme de descellement évolutif : migration, bascule et évolution clinique guident l’interprétation.']),
          row('Préserver ou reconstruire la glène', ['La conservation de l’os sous-chondral et un fraisage concentrique limitent les contraintes.', 'Avant une reprise, le scanner évalue impérativement le stock osseux glénoïdien résiduel.']),
          row('Composant huméral', ['Enfoncement de tige, bascule frontale ou liseré important doivent faire suspecter une faillite humérale.', 'Une tige descellée fait rechercher un granulome sur polyéthylène pour les implants non cimentés ou une infection.'])
        ] }
      ]
    },
    {
      title: 'Adapter la stratégie de reconstruction',
      sections: [
        { title: 'Fracture périprothétique', rows: [
          row('Facteurs de risque', ['Mauvaise qualité osseuse, âge avancé, sexe féminin et arthrite rhumatoïde sont rapportés.', 'Les fractures sont souvent peropératoires ; une chute peut également les révéler secondairement.']),
          row('Prévenir pendant la reprise', ['Fraisage inadapté, impaction excessive et rotation externe forcée favorisent la fracture.', 'La préparation diaphysaire doit éviter toute perforation corticale.']),
          row('Stabiliser la fracture', ['Les fractures proximales peuvent relever de cerclages ; une fracture sous la tige appelle une tige longue de reprise.', 'La prothèse doit ponter la fracture d’au moins deux diamètres diaphysaires.'], { image: figure('img/img_003.png', captions.fracture, sourceCaptions.fracture, 'small') })
        ] },
        { title: 'Extraction d’un implant huméral', rows: [
          row('Voie d’abord', ['La voie deltopectorale étendue facilite l’exposition tout en évitant de désinsérer le deltoïde.', 'La difficulté dépend surtout du scellement, de l’adhérence de la tige et du capital osseux.']),
          row('Trois options d’extraction', ['Un volet osseux antérieur, une ostéotomie le long de la gouttière bicipitale ou une fenêtre médiale sont décrits.', 'Chaque option vise à extraire l’implant sans créer de fracture diaphysaire.'], { image: figure('img/img_002.png', captions.extraction, sourceCaptions.extraction) }),
          row('Tige longue de reprise', ['En cas de support osseux insuffisant, le scellement d’une tige longue est souvent nécessaire.', 'Les fragments proximaux peuvent être stabilisés autour de la tige par cerclages.'])
        ] }
      ]
    },
    {
      title: 'Traiter le descellement glénoïdien et convertir si nécessaire',
      sections: [
        { title: 'Reprise du composant glénoïdien', rows: [
          row('Exposition de la glène', ['La voie deltopectorale donne un accès direct ; le subscapulaire et le nerf axillaire sont identifiés puis protégés.', 'La libération du récessus inférieur facilite la luxation sans contrainte diaphysaire.']),
          row('Après dépose du composant', ['Cureter les tissus fibreux et granulomateux avant d’évaluer la perte osseuse réelle.', 'La décision dépend ensuite de l’infection, du défaut osseux et de la possibilité d’une fixation fiable.']),
          row('Greffe et réimplantation', ['Un défaut limité peut être comblé par autogreffe ou allogreffe avant réimplantation d’un composant à plots.', 'Un défaut cavitaire profond peut imposer une reconstruction en deux temps.'])
        ] },
        { title: 'Conversion vers une prothèse inversée', rows: [
          row('Indication de conversion', ['Une insuffisance de coiffe associée à une arthroplastie anatomique douloureuse ou instable oriente vers l’inversée.', 'La chirurgie de reprise tient compte de l’os, des cicatrices, de la qualité musculaire et de la stabilité attendue.']),
          row('Intérêt de la modularité', ['Certains systèmes permettent de convertir l’implant anatomique en inversé sans retirer une tige stable.', 'Cette option limite le risque fracturaire lié à l’extraction d’une tige bien fixée.'], { image: figure('img/img_004.png', captions.conversion, sourceCaptions.conversion) }),
          row('Solution sur mesure', ['Un implant inversé sur mesure peut parfois être monté sur un cône Morse conservé.', 'La solution est exceptionnelle et sa faisabilité dépend du système implanté et de la stratégie de reprise.'], { image: figure('img/img_005.png', captions.mesure, sourceCaptions.mesure, 'small') })
        ] }
      ]
    },
    {
      title: 'Prendre en charge l’infection et annoncer le pronostic',
      sections: [
        { title: 'Infection aiguë ou chronique', rows: [
          row('Infection postopératoire précoce', ['Un débridement et un lavage précoces sont associés à une antibiothérapie dirigée.', 'La surveillance clinique et biologique confirme la disparition des signes infectieux.']),
          row('Infection chronique ou hématogène', ['La stratégie habituelle est une révision en deux temps.', 'Le premier temps associe ablation, curetage, lavage et mise en place d’un espaceur au ciment antibiotique ; la réimplantation attend la normalisation du bilan infectieux.'], { image: figure('img/img_006.png', captions.spacer, sourceCaptions.spacer, 'small') }),
          row('Préparer le second temps', ['Antibiogramme, capital osseux et matériel de reprise disponible déterminent la planification.', 'Tiges de longueurs variées, implant inversé et composants de révision glénoïdiens doivent pouvoir être mobilisés.'])
        ] },
        { title: 'Résultats et information du patient', rows: [
          row('Résultat d’une reprise', ['La douleur peut s’améliorer, mais la récupération fonctionnelle dépend fortement de l’indication, de l’os, de la coiffe et des cicatrices.', 'Une révision n’a pas le pronostic fonctionnel d’une arthroplastie primaire.']),
          row('Instabilité persistante', ['Un geste isolé sur les parties molles produit des résultats inconstants lorsque la cause mécanique persiste.', 'La reprise doit corriger simultanément positionnement, contraintes tissulaires et défaut osseux.']),
          row('Décision partagée', ['Le patient doit connaître le caractère parfois imprévisible de la récupération et le risque de complications.', 'La stratégie est individualisée après bilan de la cause d’échec et des possibilités de reconstruction.'])
        ] }
      ]
    }
  ],
  synthesis: {
    tables: [
      { title: 'Lecture d’une douleur ou d’une perte de fonction', headers: ['Présentation', 'Causes à rechercher', 'Orientation'], rows: [
        ['Raideur', 'Adhérences, contracture du subscapulaire', 'Mobilisation prudente ou arthrolyse sélectionnée'],
        ['Instabilité antérieure', 'Subscapulaire, capsule, rotation humérale, défaut glénoïdien', 'Corriger la cause mécanique avant tout geste isolé'],
        ['Migration supérieure', 'Défaillance de coiffe', 'Évaluer la possibilité de conversion vers une inversée'],
        ['Douleur avec liseré évolutif', 'Descellement glénoïdien', 'Scanner du stock osseux et plan de reconstruction']
      ] },
      { title: 'Choisir une stratégie de reprise', headers: ['Situation', 'Principe', 'Vigilance'], rows: [
        ['Tige humérale à extraire', 'Exposition élargie et extraction contrôlée', 'Prévenir fracture et perte osseuse'],
        ['Fracture autour de tige', 'Tige longue pontant la fracture, cerclages si besoin', 'Ponter d’au moins deux diamètres diaphysaires'],
        ['Glène descellée avec défaut limité', 'Curetage, greffe si nécessaire, réimplantation possible', 'Contrôler infection et qualité du support'],
        ['Infection chronique', 'Ablation, espaceur antibiotique, reprise en deux temps', 'Réimplanter après contrôle infectieux']
      ] }
    ],
    keyPoints: [
      'Une reprise commence par l’identification précise de la cause d’échec : raideur, instabilité, coiffe, descellement, fracture ou infection.',
      'La rupture du subscapulaire et le déséquilibre des parties molles sont des causes majeures d’instabilité antérieure.',
      'Le scanner préopératoire est indispensable pour apprécier le stock osseux glénoïdien avant une reprise.',
      'L’extraction d’une tige bien fixée doit être planifiée pour limiter fracture et perte de substance osseuse.',
      'Une insuffisance de coiffe peut conduire à convertir une prothèse anatomique vers une prothèse inversée.',
      'Devant une infection chronique, la reprise en deux temps avec espaceur antibiotique structure la stratégie.',
      'Le résultat fonctionnel dépend de l’indication, du capital osseux, de la qualité musculaire et des cicatrices.'
    ],
    eclair: [
      'Devant une épaule prothésée douloureuse : distinguer raideur, instabilité, coiffe, descellement, fracture et infection.',
      'Instabilité antérieure : penser subscapulaire, capsule, rotation humérale et défaut glénoïdien.',
      'Migration supérieure : rechercher insuffisance de coiffe et usure secondaire de la glène.',
      'Scanner : indispensable pour mesurer le capital osseux glénoïdien avant reprise.',
      'Tige difficile à déposer : planifier une extraction qui préserve les corticales et le deltoïde.',
      'Fracture périprothétique : tige longue de reprise et pontage suffisant de la fracture.',
      'Infection chronique : ablation, prélèvements, espaceur antibiotique puis réimplantation différée.'
    ]
  }
};

// The shared renderer predates the UTF-8 clean-up and contains a few static
// double-encoded labels. Model content remains native UTF-8; repair only the
// renderer literals in the assembled HTML, never the clinical source text.
const repairRendererLiterals = (html) => html
  .replaceAll('OrthopÃ©die', 'Orthopédie')
  .replaceAll('AnnÃ©e', 'Année')
  .replaceAll('SynthÃ¨se', 'Synthèse')
  .replaceAll('RÃ©vision', 'Révision')
  .replaceAll('Fiche Ã©clair', 'Fiche éclair')
  .replaceAll('Ã€ retenir', 'À retenir')
  .replaceAll('Chiffres-clÃ©s', 'Chiffres-clés');

const injectSourceImages = (html) => html.replace(/__IMGFILE:([^"\r\n]+?)__/g, (token, relativePath) => {
  const imagePath = resolve(chapterDir, relativePath);
  if (!imagePath.startsWith(`${chapterDir}\\`) || !existsSync(imagePath)) throw new Error(`Image source introuvable : ${relativePath}`);
  return `data:image/png;base64,${readFileSync(imagePath).toString('base64')}`;
});
const injectBrandAssets = (html) => {
  const asPng = (file) => `data:image/png;base64,${readFileSync(file).toString('base64')}`;
  return html
    .replaceAll('__WATERMARK__', asPng(resolve('../major-ecn-fiche/assets/logo_watermark.png')))
    .replaceAll('__LOGO__', asPng(resolve('public/major-ecn-logo.png')));
};

const validation = validateFicheModel(model, chapterDir);
if (validation.errors.length) throw new Error(validation.errors.join('\n'));
const html = injectBrandAssets(injectSourceImages(repairRendererLiterals(compileFicheModel(model, chapterDir))));
if (/__(?:IMGFILE|LOGO|WATERMARK)__/.test(html)) throw new Error('Jeton image non résolu');
if (/(?:Ã[\u0080-\u00ff]|â[\u0080-\u00ff€]|�)/.test(html)) throw new Error('Mojibake résiduel dans la fiche générée');
writeFileSync(join(outputDir, 'fiche.model.json'), `${JSON.stringify(model, null, 2)}\n`, 'utf8');
writeFileSync(join(outputDir, 'fiche.body.html'), html, 'utf8');

config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data: fiche, error: ficheError } = await supabase.from('fiches').select('id,content_html,content_format,updated_at').eq('cours_id', coursId).order('order_index').limit(1).single();
if (ficheError) throw ficheError;
const snapshot = { createdAt: new Date().toISOString(), coursId, fiche };
const snapshotText = `${JSON.stringify(snapshot, null, 2)}\n`;
const snapshotPath = join(outputDir, 'snapshot-before-reconstruction.json');
if (!existsSync(snapshotPath)) writeFileSync(snapshotPath, snapshotText, 'utf8');
const committedSnapshotText = readFileSync(snapshotPath, 'utf8');

const { error: updateError } = await supabase.from('fiches').update({ content_html: html, content_format: 'html' }).eq('id', fiche.id);
if (updateError) throw updateError;
const { data: readback, error: readbackError } = await supabase.from('fiches').select('content_html,content_format').eq('id', fiche.id).single();
if (readbackError || readback.content_html !== html || readback.content_format !== 'html') throw readbackError || new Error('Lecture de contrôle incohérente');

const manifest = { coursId, ficheId: fiche.id, title: model.title, sourceOnly: true, canonicalExtract: 'delivery/canonical-reextract-20260811/extract.json', figures: validation.figureCount, parts: model.parts.length, sections: model.parts.reduce((n, part) => n + part.sections.length, 0), rows: model.parts.reduce((n, part) => n + part.sections.reduce((m, section) => m + section.rows.length, 0), 0), snapshot: snapshotPath, snapshotSha256: createHash('sha256').update(committedSnapshotText).digest('hex'), published: true, readbackVerified: true };
writeFileSync(join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(manifest));
