/**
 * Reconstruction source-only du cours 112.
 * La fiche publiée portait par erreur sur les escarres ; aucun de son contenu
 * n'est repris ici. Les banques d'apprentissage restent volontairement
 * inchangées : cette opération corrige exclusivement la fiche et ses titres.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { compileFicheModel, validateFicheModel } from './lib/orthopedie-fiche.mjs';

const courseId = 'd95fe191-ecfc-4984-878a-1071848ef04b';
const title = 'Traitement chirurgical des tumeurs malignes primitives du rachis et du sacrum';
const slug = 'traitement-chirurgical-des-tumeurs-malignes-primitives-du-rachis-et-du-sacrum';
const chapterDir = resolve('../.corpus-orthopedie', slug);
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const delivery = join(chapterDir, 'delivery', `${stamp}-reconstruction-source-only`);
const row = (concept, bullets) => ({ concept, bullets });
const section = (title, rows) => ({ title, rows });

// Le document est très illustré, mais son OCR dissocie les planches de leurs
// légendes et tronque plusieurs numéros. Aucune image ne peut donc être
// attribuée de façon fiable sans créer une fausse association pédagogique.
const fiche = {
  title,
  year: '2025-2026',
  coverSubtitle: 'Bilan carcinologique, exérèse en bloc et reconstruction rachidienne ou sacrée',
  sourceBlocks: [15, 16, 18, 20, 24, 31, 34, 44, 58, 68, 82, 93, 106, 117, 131, 145, 174, 193, 195],
  imageException: { reason: 'Les légendes des planches du document source sont fragmentées par l’OCR ; aucune figure n’est publiée sans association et légende source vérifiables.' },
  parts: [
    {
      title: 'Établir le diagnostic et la stadification',
      sections: [
        section('Reconnaître une situation suspecte', [
          row('Douleur axiale prolongée', ['Une douleur rachidienne ou pelvienne prolongée, non mécanique et résistante au traitement médical doit faire évoquer une tumeur maligne.', 'Le diagnostic peut être tardif car les signes initiaux sont peu spécifiques.']),
          row('Signes neurologiques ou sphinctériens', ['Une atteinte neurologique inaugurale traduit volontiers un envahissement du canal spinal.', 'Des troubles vésicosphinctériens progressifs sont particulièrement évocateurs dans les localisations lombosacrées.']),
          row('Enjeu de la première prise en charge', ['La qualité du diagnostic et de l’exérèse initiale conditionne les possibilités de contrôle carcinologique.', 'La stratégie doit être discutée par une équipe multidisciplinaire habituée à ces tumeurs rares.'])
        ]),
        section('Utiliser une imagerie complémentaire', [
          row('IRM rachis entier injectée', ['L’IRM est indispensable pour le diagnostic, l’extension locorégionale et l’évaluation de la résécabilité.', 'Elle analyse l’axe rachidien, les parties molles, le canal spinal, les foramens et une éventuelle compression nerveuse.']),
          row('Tomodensitométrie', ['La TDM précise l’atteinte osseuse, la composante lytique ou condensante et certaines calcifications intratumorales.', 'Elle renseigne aussi sur le capital osseux nécessaire à la planification d’une fixation vertébrale.']),
          row('Bilan d’extension', ['Après confirmation de malignité, un bilan thoraco-abdomino-pelvien injecté est réalisé ; une TEP peut le compléter selon le contexte.', 'L’imagerie sert également à apprécier la réponse aux traitements néoadjuvants dans les sarcomes de haut grade.'])
        ])
      ]
    },
    {
      title: 'Obtenir un diagnostic histologique fiable',
      sections: [
        section('Indiquer et préparer la biopsie', [
          row('Certitude histologique', ['Une preuve histologique est indispensable avant d’organiser un traitement potentiellement agressif.', 'La biopsie est indiquée devant une tumeur osseuse ou des tissus mous sans contexte récent de cancer connu, hors aspect radiologique typique.']),
          row('Priorité à la ponction radioguidée', ['Dans les localisations vertébrales, la biopsie chirurgicale est réservée à l’échec des prélèvements radioguidés, sauf urgence neurologique.', 'La ponction doit être pensée avec l’équipe susceptible de réaliser ensuite la résection.']),
          row('Centre de référence', ['Toute biopsie osseuse pour une tumeur primitive doit être réalisée dans un centre de référence.', 'Un trajet ou une technique inadaptés peuvent contaminer les tissus et compromettre une résection curative.'])
        ]),
        section('Respecter le trajet et les prélèvements', [
          row('Trajet excisable', ['Le trajet doit pouvoir être retiré avec la tumeur lors de la chirurgie définitive.', 'Il suit les voies d’abord possibles, va directement vers la lésion et évite les dissections ou décollements intempestifs.']),
          row('Zone à biopsier', ['La jonction entre tumeur et os est la zone active à privilégier ; le centre tumoral peut être nécrosé et non informatif.', 'La biopsie vise aussi la composante la plus condensée lorsqu’elle est présente.']),
          row('Prélèvements exploitables', ['Plusieurs prélèvements sont adressés pour l’histologie et la bactériologie, avec résumé clinico-radiologique.', 'Il faut éviter de traverser un canal spinal indemne ou des cavités susceptibles d’être contaminées par le trajet.'])
        ])
      ]
    },
    {
      title: 'Choisir l’indication carcinologique',
      sections: [
        section('Identifier le type tumoral et son extension', [
          row('Tumeurs primitives fréquentes', ['Les chordomes, chondrosarcomes, ostéosarcomes et sarcomes d’Ewing font partie des tumeurs malignes primitives décrites.', 'Le chordome est une tumeur axiale, volontiers sacrée ou du clivus, avec une évolution souvent lente.']),
          row('Classification de l’envahissement', ['L’extension vertébrale et l’atteinte des structures voisines déterminent la possibilité d’une exérèse en bloc.', 'La planification tient compte des parties molles, du canal, des racines, des vaisseaux et des articulations adjacentes.']),
          row('Traitement néoadjuvant', ['Dans les sarcomes de haut grade, la réponse aux traitements néoadjuvants contribue à la stratégie opératoire.', 'La décision associe oncologie, imagerie, anatomopathologie et chirurgie spécialisée.'])
        ]),
        section('Définir l’objectif de résection', [
          row('Exérèse en bloc', ['L’objectif est d’obtenir des marges saines sans ouvrir la tumeur lorsque la situation carcinologique le permet.', 'La première chirurgie est déterminante : une contamination du champ opératoire réduit fortement les possibilités de rattrapage.']),
          row('Préserver sans compromettre les marges', ['Les choix de sacrifice ou de préservation neurologique sont anticipés avec le patient selon le niveau et l’envahissement tumoral.', 'Une résection limitée ne doit pas être retenue si elle compromet l’objectif carcinologique défini en réunion multidisciplinaire.']),
          row('Situations non résécables', ['Une stratégie non chirurgicale ou palliative peut être discutée lorsque les marges ne sont pas accessibles ou que le rapport bénéfice-risque est défavorable.', 'La décision reste individualisée selon l’histologie, la réponse aux traitements et l’état clinique.'])
        ])
      ]
    },
    {
      title: 'Planifier les voies d’abord et l’exérèse',
      sections: [
        section('Adapter les voies au niveau vertébral', [
          row('Rachis cervical', ['Les voies antérieures et postérieures sont combinées lorsque le contrôle des structures antérieures et l’exérèse l’exigent.', 'La protection des vaisseaux, de la trachée, de l’œsophage et des éléments neurologiques guide la séquence opératoire.']),
          row('Rachis thoracique et charnière dorsolombaire', ['Un double abord avec contrôle antérieur et temps postérieur permet de sécuriser les structures nobles et les coupes osseuses.', 'La thoracoscopie ou la thoracotomie peut faciliter la libération antérieure selon le niveau et l’extension.']),
          row('Rachis lombaire', ['Deux voies sont souvent nécessaires pour libérer les structures antérieures, instrumenter le rachis et réaliser les ostéotomies en sécurité.', 'La séquence des temps dépend des impératifs de résection et de reconstruction.'])
        ]),
        section('Réaliser une exérèse contrôlée', [
          row('Contrôle antérieur et postérieur', ['Le contrôle simultané des structures antérieures et postérieures évite les gestes aveugles au contact des vaisseaux ou de l’œsophage.', 'Les coupes osseuses sont préparées en zone saine selon la cartographie de l’envahissement.']),
          row('Arc postérieur et corps vertébral', ['Une hémivertébrectomie ou une vertébrectomie est choisie selon l’atteinte de l’arc postérieur et du corps vertébral.', 'L’instrumentation postérieure peut précéder l’ostéotomie afin de maintenir la stabilité durant l’exérèse.']),
          row('Pièce de résection', ['La pièce est extraite sans effraction tumorale dans le respect de la planification carcinologique.', 'Les gestes sont coordonnés dans la même séquence lorsque cela évite un saignement ou une difficulté d’extraction supplémentaire.'])
        ])
      ]
    },
    {
      title: 'Reconstruire et surveiller les complications',
      sections: [
        section('Assurer la stabilité rachidienne ou pelvienne', [
          row('Reconstruction antérieure', ['Après vertébrectomie, une cage ou une allogreffe peut restaurer la colonne antérieure.', 'La reconstruction est adaptée au niveau, à la perte osseuse et à l’ostéosynthèse disponible.']),
          row('Arthrodèse et instrumentation', ['L’ostéosynthèse postérieure assure la stabilité pendant et après la résection.', 'Une arthrodèse circonférentielle peut être nécessaire dans les résections lombaires étendues.']),
          row('Particularités de la sacrectomie', ['Une sacrectomie épargnant S1 et les articulations sacro-iliaques ne nécessite pas habituellement de reconstruction osseuse.', 'Une sacrectomie totale ou le sacrifice d’une grande partie de l’articulation sacro-iliaque peut imposer une arthrodèse lombo-iliaque.'])
        ]),
        section('Anticiper les conséquences et le suivi', [
          row('Séquelle neurologique sacrée', ['Le niveau de la section sacrée détermine le risque de syndrome de la queue de cheval et de troubles vésicosphinctériens.', 'Cette information doit faire partie de la décision préopératoire et du consentement.']),
          row('Complications postopératoires', ['Ces chirurgies exposent notamment aux complications infectieuses, mécaniques et neurologiques.', 'La couverture des tissus mous et la prévention du saignement sont intégrées à la planification, particulièrement au sacrum.']),
          row('Surveillance oncologique', ['Le suivi recherche une récidive locale, distingue récidive et remaniements cicatriciels, et réévalue le statut histologique avant une nouvelle séquence agressive.', 'Une reprise après chirurgie initiale contaminée est difficile ; la qualité de la prise en charge initiale reste donc essentielle.'])
        ])
      ]
    }
  ],
  synthesis: {
    tables: [
      { title: 'Bilan avant toute décision', headers: ['Étape', 'Information recherchée', 'Conséquence'], rows: [
        ['IRM rachis entier', 'Extension osseuse, canal, nerfs et parties molles', 'Résécabilité et cartographie opératoire'],
        ['TDM', 'Destruction osseuse, calcifications, capital osseux', 'Choix de la fixation et des coupes'],
        ['Bilan d’extension', 'Atteinte thoraco-abdomino-pelvienne et autres lésions', 'Stadification et stratégie globale'],
        ['Biopsie planifiée', 'Histologie et prélèvements microbiologiques', 'Traitement adapté sans contamination évitable']
      ]},
      { title: 'Principes opératoires', headers: ['Situation', 'Principe', 'Vigilance'], rows: [
        ['Tumeur vertébrale résécable', 'Exérèse en bloc avec marges planifiées', 'Ne pas ouvrir ni contaminer la tumeur'],
        ['Atteinte thoracique ou lombaire', 'Double contrôle antérieur et postérieur', 'Vaisseaux, œsophage, structures nerveuses'],
        ['Vertébrectomie', 'Instrumentation et reconstruction antérieure', 'Stabilité durant les ostéotomies'],
        ['Tumeur sacrée proximale', 'Libération antérieure puis abord postérieur', 'Fonction neurologique et couverture des tissus mous']
      ]}
    ],
    keyPoints: [
      'Toute douleur rachidienne ou pelvienne prolongée, non mécanique et résistante au traitement doit faire évoquer une tumeur.',
      'L’IRM rachis entier injectée et la TDM sont complémentaires pour la stadification et la planification.',
      'La biopsie est un geste carcinologique : son trajet doit être excisable lors de la chirurgie définitive.',
      'La première exérèse conditionne le contrôle local ; une chirurgie contaminante peut compromettre le pronostic.',
      'L’exérèse en bloc exige une planification multidisciplinaire et le contrôle des structures antérieures et postérieures.',
      'Après vertébrectomie, l’instrumentation et la reconstruction antérieure restaurent la stabilité.',
      'Au sacrum, le niveau de résection conditionne les séquelles neurologiques et le besoin de reconstruction lombo-iliaque.'
    ],
    eclair: [
      'Évoquer une tumeur devant une douleur axiale prolongée atypique ou des signes neurologiques et sphinctériens progressifs.',
      'Bilan : IRM rachis entier injectée, TDM osseuse et bilan d’extension thoraco-abdomino-pelvien.',
      'Avant tout traitement agressif : preuve histologique et discussion en centre de référence.',
      'Biopsie : voie radioguidée privilégiée ; trajet direct, planifié et résécable avec la tumeur.',
      'Objectif opératoire : exérèse en bloc avec marges saines quand elle est accessible.',
      'Voies d’abord : contrôle antérieur et postérieur adapté au niveau et aux structures à protéger.',
      'Après résection : stabiliser, reconstruire si nécessaire, prévenir les complications et surveiller la récidive.'
    ]
  }
};

const validation = validateFicheModel(fiche, chapterDir);
if (validation.errors.length) throw new Error(`Modèle invalide :\n- ${validation.errors.join('\n- ')}`);
// Chaque grande partie ouvre une page distincte. La longueur de ce cours rend
// cette rupture nécessaire : sans elle, Chrome pouvait accrocher une bannière
// de partie au bord supérieur de la page imprimée.
const html = compileFicheModel(fiche, chapterDir)
  .replaceAll('<section class="partie-page"', '<section class="partie-page" style="break-before: page; page-break-before: always;"');
mkdirSync(delivery, { recursive: true });
writeFileSync(join(delivery, 'fiche.model.json'), `${JSON.stringify(fiche, null, 2)}\n`, 'utf8');
writeFileSync(join(delivery, 'fiche.body.html'), html, 'utf8');

config({ path: '.env.local' });
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: course, error: courseError } = await db.from('cours').select('id,titre,order_index').eq('id', courseId).single();
if (courseError) throw courseError;
if (course.order_index !== 112) throw new Error(`Cours inattendu : ordre ${course.order_index}`);
const { data: ficheBefore, error: ficheError } = await db.from('fiches').select('id,cours_id,titre,content_html,content_format,storage_path,pages,order_index').eq('cours_id', courseId).single();
if (ficheError) throw ficheError;
const snapshot = { version: 1, createdAt: new Date().toISOString(), course, fiche: ficheBefore, operation: 'reconstruction-source-only-ch112' };
const snapshotJson = `${JSON.stringify(snapshot, null, 2)}\n`;
writeFileSync(join(delivery, 'snapshot-before.json'), snapshotJson, 'utf8');

if (course.titre !== title) {
  const { error } = await db.from('cours').update({ titre: title }).eq('id', courseId);
  if (error) throw error;
}
const { error: updateError } = await db.from('fiches').update({ titre: title, content_html: html, content_format: 'html' }).eq('id', ficheBefore.id);
if (updateError) throw updateError;
const { data: readback, error: readbackError } = await db.from('fiches').select('titre,content_html,content_format').eq('id', ficheBefore.id).single();
if (readbackError) throw readbackError;
if (readback.titre !== title || readback.content_html !== html || readback.content_format !== 'html') throw new Error('Readback de publication invalide');
const { data: courseReadback, error: courseReadbackError } = await db.from('cours').select('titre').eq('id', courseId).single();
if (courseReadbackError || courseReadback.titre !== title) throw courseReadbackError || new Error('Titre du cours non synchronisé');
const manifest = {
  createdAt: new Date().toISOString(), course: { id: courseId, orderIndex: 112, title }, ficheId: ficheBefore.id,
  scope: 'fiche et titres uniquement ; banques QCM/DP/cartes inchangées', sourceOnly: true,
  validation, sourceBlocks: fiche.sourceBlocks, snapshotSha256: createHash('sha256').update(snapshotJson).digest('hex'),
  htmlSha256: createHash('sha256').update(html).digest('hex'), readback: { title: readback.titre, htmlChars: readback.content_html.length, contentFormat: readback.content_format }
};
writeFileSync(join(delivery, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ delivery, title, figures: validation.figureCount, htmlChars: html.length, ficheId: ficheBefore.id }));
