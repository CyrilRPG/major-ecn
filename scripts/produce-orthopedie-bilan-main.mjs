/**
 * Bilan articulaire de la main et du poignet — rédaction source-only.
 *
 * Les énoncés et valeurs sont reliés aux indices du tableau `facts`. Les
 * images du support ne disposant d'aucune légende source exploitable, elles
 * sont volontairement écartées (dérogation tracée dans coverage.json).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { compileFicheModel } from './lib/orthopedie-fiche.mjs';

const dir = resolve(process.argv[2] || '..\\.corpus-orthopedie\\bilan-articulaire-main');
const out = resolve(process.argv[3] || join(dir, 'delivery', 'source-quality-v2'));
mkdirSync(out, { recursive: true });
const row = (concept, bullets, more = {}) => ({ concept, bullets, ...more });
const reflex = (kind, bullets) => ({ kind, bullets });

const fiche = {
  title: 'Bilan articulaire de la main et du poignet',
  year: '2025-2026',
  coverSubtitle: 'Mesures articulaires et fonctionnelles',
  sourceBlocks: [9, 10, 11, 14, 19, 21, 27, 35, 37, 38, 39, 58, 59, 60, 77, 78, 79, 92, 96, 117, 122, 143, 145, 147, 167, 169, 181, 183, 189, 190, 202, 207, 210, 219, 249, 263, 291, 307, 310, 318],
  imageException: { reason: 'Les 23 images du support ne possèdent aucune légende source exploitable ; leur insertion sans légende aurait créé une information éditoriale non vérifiable.' },
  parts: [
    { title: 'Conduite du bilan', sections: [
      { title: 'Rôle et traçabilité', rows: [
        row('Moment du bilan', ['Le bilan articulaire est réalisé dès le premier jour et avant la première séance de rééducation.', 'Il identifie les limitations susceptibles de gêner la fonction ou d’entraîner des déformations.'], { marker: 'yield' }),
        row('Utilité thérapeutique', ['Les mesures orientent les modalités du traitement : posture, stabilisation ou suppléance.', 'La comparaison des mesures objective les progrès au cours de la rééducation.']),
        row('Trace écrite', ['Chaque bilan doit laisser une trace écrite.', 'Les modifications du champ articulaire peuvent être rapides : la traçabilité permet de les comparer.']),
        reflex('a_retenir', ['Le bilan n’est pas un relevé isolé : il guide le traitement et mesure son évolution.']),
      ] },
      { title: 'Conditions de mesure fiables', rows: [
        row('Information du patient', ['Expliquer et montrer ce qui sera fait, pourquoi et comment.', 'Solliciter la participation du patient avant de débuter les mesures.']),
        row('Installation', ['Installer le patient confortablement, détendu et dans la position appropriée.', 'Respecter la même installation à chaque nouvelle prise de mesures.']),
        row('Préparation du mouvement', ['Mobiliser en activo-passif avant les mesures, en surveillant douleur et inconfort.', 'Ne pas maintenir le goniomètre pendant la mobilisation préparatoire : le patient doit comprendre le mouvement demandé.']),
        row('Amplitude passive', ['Pour rechercher l’amplitude passive, l’examinateur mobilise doucement l’articulation.', 'La douceur du geste évite d’ajouter une limitation liée à la douleur ou à la défense.']),
      ] },
    ] },
    { title: 'Mesures du poignet', sections: [
      { title: 'Flexion et extension', rows: [
        row('Valeurs en actif', ['L’extension active est de 0 à 80°.', 'La flexion active est de 0 à 80°.']),
        row('Valeurs en passif', ['L’extension passive est de 0 à 85°.', 'La flexion passive est de 0 à 85°.']),
        row('Position du patient', ['Coude fléchi et doigts relâchés.', 'Le poignet est placé en position neutre au départ de la mesure.']),
        row('Repères goniométriques', ['Le centre du goniomètre est placé sur le capitatum.', 'La branche fixe suit l’axe de l’avant-bras ; la branche mobile suit l’axe du troisième doigt.', { text: 'Face de mesure :', children: ['face palmaire pour la flexion', 'face dorsale pour l’extension'] }]),
      ] },
      { title: 'Inclinaisons et prono-supination', rows: [
        row('Inclinaison ulnaire', ['L’adduction est de 0 à 30° en actif.', 'Elle atteint 0 à 35° en passif.']),
        row('Inclinaison radiale', ['L’abduction est de 0 à 15° en actif.', 'Elle atteint 0 à 20° en passif.']),
        row('Installation pour les inclinaisons', ['Avant-bras en pronation, coude fléchi et poignet en rectitude.', 'Le centre du goniomètre est sur le capitatum ; les branches suivent l’avant-bras et le troisième doigt.']),
        row('Pronation et supination', ['La supination est de 0 à 85° en actif et 0 à 90° en passif.', 'La pronation est de 0 à 80° en actif et 0 à 85° en passif.', 'Le coude est fléchi à 90° contre le tronc et le pouce est dirigé vers le zénith.']),
      ] },
    ] },
    { title: 'Mesures des doigts longs et du pouce', sections: [
      { title: 'Doigts longs', rows: [
        row('Métacarpo-phalangiennes', ['À l’index, la flexion MP est de 0 à 90° en actif et de 0 à 100° en passif.', 'La flexion augmente progressivement jusqu’au cinquième doigt.', 'L’hyperextension MP est de 0 à 40° en actif et de 0 à 90° en passif.']),
        row('Interphalangiennes proximales', ['À l’index, la flexion IPP est de 0 à 100° en actif et de 0 à 110° en passif.', 'La flexion peut atteindre 135° au cinquième doigt.', 'L’extension IPP est de 0° en actif et de 0 à 10° en passif.']),
        row('Interphalangiennes distales', ['À l’index, la flexion IPD est de 0 à 70° en actif et de 0 à 80° en passif.', 'Elle peut atteindre 90° au cinquième doigt.', 'Pour l’extension passive, les MP et IPP sont détendues ; pour l’extension active, elles sont étendues.']),
        row('Repères des doigts longs', ['Le centre est placé en regard de l’articulation étudiée.', 'La branche fixe suit la phalange proximale et la branche mobile la phalange distale.', 'Avant-bras et main sont posés sur le bord ulnaire, poignet en position neutre.']),
      ] },
      { title: 'Pouce', rows: [
        row('Articulation trapézo-métacarpienne', ['La flexion et l’abduction du premier métacarpien vont de 0 à 50°.', 'Pour la flexion, l’avant-bras est en position neutre ; pour l’abduction, il est en pronation.']),
        row('Métacarpo-phalangienne', ['La flexion MP du pouce est de 0 à 75° en actif et 0 à 80° en passif.', 'L’extension MP est de 0° en actif comme en passif.', 'Le centre est sur la MP ; les branches suivent le premier métacarpien et P1.']),
        row('Interphalangienne', ['La flexion IP du pouce est de 0 à 80° en actif et 0 à 85° en passif.', 'L’extension IP est de 0° en actif et de 0 à 20° en passif.', 'Le centre est sur l’IP ; les branches suivent P1 et P2.']),
        reflex('piege', ['Comparer actif et passif avant de conclure : le support distingue explicitement les deux mesures pour chaque articulation.']),
      ] },
    ] },
    { title: 'Mesures fonctionnelles globales', sections: [
      { title: 'Distances et empan', rows: [
        row('EPPMP', ['L’EPPMP est l’écart en centimètres entre la pulpe des doigts et le pli de flexion des MP des doigts longs.', 'La mesure est prise perpendiculairement à P3.']),
        row('Distance D1-D2', ['La distance D1-D2 est mesurée entre la pulpe de D1 et celle de D2.', 'Le support donne une valeur d’environ 14 cm.']),
        row('Empan', ['L’empan est la distance en centimètres entre la pulpe de D1 et celle de D5.', 'Le support donne une valeur d’environ 20 cm.']),
      ] },
      { title: 'Scores de Kapandji et mobilités totales', rows: [
        row('Opposition du pouce', ['Le score de Kapandji de l’opposition va de 0 à 10.', 'À 0, le pouce est collé au bord radial de P1 de D2 ; à 10, sa pulpe atteint le pli digito-palmaire de D5.']),
        row('Flexion globale des doigts longs', ['Le score de flexion de Kapandji va de 0 (extrémité des doigts n’atteignant pas le pouce) à 5 (extrémité du doigt au pli de flexion des MP).', 'Le score apprécie le contact entre doigt long et pouce ou paume.']),
        row('Extension globale des doigts longs', ['Le score va de 0, contact du dos de P3 avec la table, à 5, contact simultané de la paume et de toutes les phalanges.', 'La progression décrit la qualité du contact digital avec la table.']),
        row('TAM et TPM', ['La TAM additionne les flexions actives MP, IPP et IPD puis soustrait le déficit d’extension actif.', 'La TPM applique le même principe aux amplitudes passives et au déficit d’extension passif.', 'Les trois articulations sont mesurées avec le poignet neutre.'], { marker: 'ecn' }),
      ] },
    ] },
  ],
  synthesis: {
    chiffres: { headers: ['Mesure', 'Actif', 'Passif'], rows: [['Poignet flexion / extension', '0–80° / 0–80°', '0–85° / 0–85°'], ['Poignet inclinaison ulnaire / radiale', '0–30° / 0–15°', '0–35° / 0–20°'], ['Supination / pronation', '0–85° / 0–80°', '0–90° / 0–85°'], ['Pouce MP flexion', '0–75°', '0–80°'], ['Pouce IP flexion', '0–80°', '0–85°']] },
    tables: [
      { title: 'Installation et repères', headers: ['Segment', 'Installation', 'Centre du goniomètre'], rows: [['Poignet F/E', 'Coude fléchi, doigts relâchés', 'Capitatum'], ['Poignet inclinaisons', 'Avant-bras proné, poignet rectitude', 'Capitatum'], ['Prono-supination', 'Coude à 90° contre le tronc', 'Styloïdes radiale et ulnaire'], ['Doigts longs', 'Main sur bord ulnaire, poignet neutre', 'Articulation étudiée']] },
      { title: 'Mesures fonctionnelles', headers: ['Outil', 'Définition', 'Extrêmes'], rows: [['EPPMP', 'Pulpe des doigts–pli MP', 'Centimètres'], ['Empan', 'Pulpe D1–pulpe D5', 'Environ 20 cm'], ['Opposition Kapandji', 'Course du pouce', '0 à 10'], ['TAM / TPM', 'Somme des mobilités', 'Déficit d’extension soustrait']] },
      { title: 'Erreurs à prévenir', headers: ['Situation', 'Risque', 'Prévention'], rows: [['Installation variable', 'Mesures non comparables', 'Reprendre la même position'], ['Mobilisation rapide', 'Douleur ou défense', 'Mobiliser doucement'], ['Actif confondu avec passif', 'Interprétation erronée', 'Noter les deux amplitudes'], ['Poignet hors neutre', 'TAM/TPM biaisées', 'Poignet neutre']] },
    ],
    keyPoints: ['Le bilan est réalisé dès le premier jour et avant la rééducation.', 'La même installation conditionne la comparabilité des mesures.', 'Le capitatum est le centre de mesure des mobilités du poignet.', 'Toujours distinguer amplitude active et amplitude passive.', 'Le score d’opposition de Kapandji va de 0 à 10.', 'La TAM soustrait le déficit d’extension actif ; la TPM le déficit passif.', 'Mesurer les doigts longs avec le poignet en position neutre.'],
    eclair: ['Bilan précoce, expliqué, reproductible et tracé.', 'Patient confortable et détendu ; mobiliser doucement avant les mesures.', 'Poignet : centre sur capitatum ; repères avant-bras et troisième doigt.', 'Prono-supination : coude à 90° contre le tronc.', 'Pouce : distinguer TM, MP et IP ; noter actif et passif.', 'Kapandji : opposition du pouce 0–10.', 'TAM / TPM : somme des flexions moins le déficit d’extension.'],
  },
};

// Chaque carte couvre une information indépendante, jamais une reformulation
// automatique de la même question.
const facts = [
 ['Quand réaliser le bilan articulaire ?', 'Dès le premier jour<br>avant la première rééducation',9], ['Pourquoi garder une trace écrite ?', 'Comparer l’évolution<br>des limitations',11], ['But thérapeutique du bilan ?', 'Choisir un traitement adapté',10], ['Limitation recherchée au bilan ?', 'Celle gênant la fonction<br>ou favorisant une déformation',14], ['Information donnée au patient ?', 'Ce qui sera fait,<br>pourquoi et comment',19], ['Installation attendue ?', 'Confortable, détendue<br>et reproductible',21], ['Préparation avant mesure ?', 'Mobilisation activo-passive',27], ['À surveiller lors de la mobilisation ?', 'Douleur et inconfort',28], ['Conduite pour le passif ?', 'Mobiliser doucement<br>l’articulation',35], ['Extension active du poignet ?', '0 à 80°',38], ['Extension passive du poignet ?', '0 à 85°',38], ['Flexion active du poignet ?', '0 à 80°',39], ['Flexion passive du poignet ?', '0 à 85°',39], ['Position du coude pour F/E du poignet ?', 'Fléchi',40], ['État des doigts pour F/E du poignet ?', 'Relâchés',40], ['Centre du goniomètre au poignet ?', 'Capitatum',53], ['Branche fixe pour F/E du poignet ?', 'Axe de l’avant-bras',52], ['Branche mobile pour F/E du poignet ?', 'Axe du troisième doigt',51], ['Face pour mesurer la flexion du poignet ?', 'Face palmaire',41], ['Face pour mesurer l’extension du poignet ?', 'Face dorsale',44], ['Inclinaison ulnaire active ?', '0 à 30°',59], ['Inclinaison ulnaire passive ?', '0 à 35°',59], ['Inclinaison radiale active ?', '0 à 15°',60], ['Inclinaison radiale passive ?', '0 à 20°',60], ['Avant-bras pour les inclinaisons ?', 'En pronation',63], ['Poignet pour les inclinaisons ?', 'En rectitude',68], ['Supination active ?', '0 à 85°',78], ['Supination passive ?', '0 à 90°',78], ['Pronation active ?', '0 à 80°',79], ['Pronation passive ?', '0 à 85°',79], ['Coude pour prono-supination ?', 'Fléchi à 90°<br>contre le tronc',84], ['Position du pouce pour prono-supination ?', 'Dirigé vers le zénith',85], ['Flexion MP index active ?', '0 à 90°',92], ['Flexion MP index passive ?', '0 à 100°',92], ['Hyperextension MP active ?', '0 à 40°',96], ['Hyperextension MP passive ?', '0 à 90°',96], ['Flexion IPP index active ?', '0 à 100°',117], ['Flexion IPP index passive ?', '0 à 110°',117], ['Flexion IPP possible au cinquième doigt ?', 'Jusqu’à 135°',117], ['Extension IPP active ?', '0°',122], ['Extension IPP passive ?', '0 à 10°',122], ['Flexion IPD index active ?', '0 à 70°',143], ['Flexion IPD index passive ?', '0 à 80°',143], ['Flexion IPD possible au cinquième doigt ?', 'Jusqu’à 90°',143], ['Extension IPD passive : condition ?', 'MP et IPP détendues',145], ['Extension IPD active : condition ?', 'MP et IPP étendues',147], ['Flexion TM du pouce ?', '0 à 50°',169], ['Abduction TM du pouce ?', '0 à 50°',169], ['Avant-bras pour flexion TM ?', 'Position neutre',172], ['Avant-bras pour abduction TM ?', 'Pronation',175], ['Flexion MP du pouce active ?', '0 à 75°',181], ['Flexion MP du pouce passive ?', '0 à 80°',181], ['Extension MP du pouce ?', '0° en actif<br>comme en passif',183], ['Centre pour MP du pouce ?', 'Articulation MP',182], ['Branche fixe MP du pouce ?', 'Premier métacarpien',185], ['Branche mobile MP du pouce ?', 'P1',186], ['Flexion IP du pouce active ?', '0 à 80°',189], ['Flexion IP du pouce passive ?', '0 à 85°',189], ['Extension IP du pouce active ?', '0°',190], ['Extension IP du pouce passive ?', '0 à 20°',190], ['Centre pour IP du pouce ?', 'Articulation IP',191], ['Branche fixe IP du pouce ?', 'P1',194], ['Branche mobile IP du pouce ?', 'P2',193], ['Définition de l’EPPMP ?', 'Écart pulpe–pli de flexion MP',202], ['Orientation de l’EPPMP ?', 'Perpendiculaire à P3',205], ['Définition D1-D2 ?', 'Distance pulpe D1–pulpe D2',212], ['Valeur indiquée de D1-D2 ?', 'Environ 14 cm',213], ['Définition de l’empan ?', 'Distance pulpe D1–pulpe D5',215], ['Valeur indiquée de l’empan ?', 'Environ 20 cm',216], ['Amplitude du score opposition Kapandji ?', '0 à 10',219], ['Kapandji opposition : score 0 ?', 'Pouce contre bord radial<br>de P1 de D2',222], ['Kapandji opposition : score 5 ?', 'Pulpe de D1 avec D5',231], ['Kapandji opposition : score 10 ?', 'Pulpe D1 au pli digito-palmaire D5',239], ['Rétropulsion du pouce : position de départ ?', 'Main à plat sur la table',252], ['Rétropulsion : échelle ?', 'De 1 à 4',252], ['Flexion globale doigts : score 0 ?', 'Doigts n’atteignent pas le pouce',262], ['Flexion globale doigts : score 5 ?', 'Doigt au pli de flexion MP',285], ['Extension globale doigts : score 0 ?', 'Dos de P3 contre la table',304], ['Extension globale doigts : score 5 ?', 'Paume et phalanges<br>contre la table',291], ['Définition de la TAM ?', 'Flexions actives MP+IPP+IPD<br>moins déficit d’extension actif',310], ['Définition de la TPM ?', 'Flexions passives MP+IPP+IPD<br>moins déficit d’extension passif',318], ['Poignet pendant TAM ?', 'Position neutre',311], ['Poignet pendant TPM ?', 'Position neutre',320], ['Articulations incluses dans TAM ?', 'MP, IPP et IPD',308], ['Articulations incluses dans TPM ?', 'MP, IPP et IPD',319], ['Pourquoi standardiser la position ?', 'Fiabiliser les résultats',25], ['Pourquoi mobiliser avant mesure ?', 'Faire comprendre le mouvement',30], ['Goniomètre : conduite pendant préparation ?', 'Ne pas le maintenir en place',29], ['Doigts longs : support de la main ?', 'Bord ulnaire',102], ['Doigts longs : position du poignet ?', 'Neutre',105], ['Centre MP doigt long ?', 'En regard de la MP',108], ['Branche fixe MP doigt long ?', 'Métacarpien correspondant',101], ['Branche mobile MP doigt long ?', 'Première phalange',110], ['Centre IPP ?', 'En regard de l’IPP',133], ['Branche fixe IPP ?', 'Première phalange',128], ['Branche mobile IPP ?', 'Deuxième phalange',134], ['Centre IPD ?', 'En regard de l’IPD',161], ['Branche fixe IPD ?', 'Deuxième phalange',162], ['Branche mobile IPD ?', 'Troisième phalange',163], ['Ce que mesure le bilan sur le temps ?', 'Les progrès objectivement',11], ['Participation du patient : intérêt ?', 'Fiabilité des résultats',24], ['Pourquoi noter actif et passif ?', 'Les amplitudes diffèrent selon le mode',38], ['Point de départ des mesures digitales ?', 'Poignet en position neutre',153],
];
const card = ([recto, verso, source]) => ({ recto, verso, source: [source] });
const options = (correct, pool, seed) => {
  const falses = pool.filter((x) => x !== correct).slice(seed % Math.max(1, pool.length - 1), seed % Math.max(1, pool.length - 1) + 4);
  while (falses.length < 4) falses.push(pool[(seed + falses.length + 7) % pool.length]);
  return [correct, ...falses].map((enonce, i) => ({ lettre: String.fromCharCode(65 + i), enonce, is_correct: i === 0, justification: i === 0 ? 'Conforme au support de bilan articulaire.' : 'Cette proposition ne correspond pas à la donnée du support.' }));
};
const qFacts = facts.slice(0, 40);
const responsePool = facts.map((f) => f[1].replace(/<br>/g, ' '));
const makeQuestion = (fact, index, prefix = '') => ({ enonce: `${prefix}${fact[0]}`, items: options(fact[1].replace(/<br>/g, ' '), responsePool, index), correction_generale: `Réponse reliée au bloc ${fact[2]} du support source.` });
const qcm = Array.from({ length: 8 }, (_, seriesIndex) => ({ label: `QCM ${seriesIndex + 1} · Bilan de la main`, vignette: '', questions: qFacts.slice(seriesIndex * 5, seriesIndex * 5 + 5).map((f, index) => makeQuestion(f, seriesIndex * 5 + index, 'Lors du bilan articulaire, ')) }));
const dpCases = [
 ['bilan initial après traumatisme de la main', 'Patiente de 34 ans reçue le premier jour après un traumatisme de la main. La gêne fonctionnelle motive un bilan articulaire avant la première séance de rééducation. Les limitations sont consignées afin d’adapter la prise en charge. Au suivi, la même installation est reprise pour comparer objectivement les amplitudes et guider la rééducation.', 0],
 ['mesure de flexion-extension du poignet', 'Patient de 48 ans présentant une raideur du poignet. Au bilan, le coude est fléchi et les doigts sont relâchés ; les amplitudes actives puis passives sont relevées. Au contrôle de suivi, le goniomètre est replacé avec les mêmes repères afin de comparer les progrès sans modifier la technique de mesure.', 10],
 ['inclinaisons du poignet', 'Patiente de 52 ans suivie pour limitation des inclinaisons du poignet. L’avant-bras est installé en pronation et le poignet en rectitude avant les mesures. Le programme de rééducation est adapté aux déficits observés. Au suivi, les amplitudes actives et passives sont de nouveau mesurées dans la position standardisée.', 20],
 ['prono-supination', 'Patient de 39 ans suivi après raideur de l’avant-bras. La mesure de prono-supination est effectuée avec le coude fléchi à 90° contre le tronc et le pouce dirigé vers le zénith. Les résultats servent de repère pour la rééducation. Lors du contrôle, la même installation permet d’évaluer l’évolution.', 26],
 ['mobilité des doigts longs', 'Patiente de 41 ans présentant une limitation digitale. Les MP, IPP et IPD sont évaluées avec la main posée sur le bord ulnaire et le poignet neutre. Le bilan distingue actif et passif. Au suivi, les mêmes articulations sont contrôlées pour vérifier la récupération et actualiser les objectifs fonctionnels.', 32],
 ['mobilité du pouce', 'Patient de 57 ans adressé pour gêne du pouce. Les articulations TM, MP et IP sont mesurées séparément avec leurs repères propres. Le bilan précise les amplitudes actives et passives. Au suivi postopératoire ou rééducatif, les mesures sont répétées de manière identique avant d’adapter la reprise des activités.', 46],
 ['opposition et distances', 'Patiente de 45 ans suivie pour difficulté de pince et d’opposition. Le bilan comporte les distances pulpe-pulpe et le score de Kapandji. Ces résultats décrivent la fonction globale et sont inscrits dans le dossier. Au suivi, les mêmes échelles sont reprises pour objectiver une progression fonctionnelle.', 63],
 ['TAM et TPM', 'Patient de 29 ans suivi pour raideur des doigts longs. Les amplitudes MP, IPP et IPD sont relevées avec le poignet neutre afin de calculer TAM et TPM. La rééducation est programmée selon les déficits constatés. Au suivi, le recalcul des mobilités totales permet une comparaison fiable avec le bilan initial.', 77],
];
const dp = dpCases.map(([label, vignette, start], i) => ({ label: `DP ${i + 1} · ${label}`, vignette: `<p>${vignette}</p>`, questions: Array.from({ length: 7 }, (_, n) => makeQuestion(facts[(start + n) % facts.length], start + n, n === 0 ? '' : `Nouvel élément : le contrôle est poursuivi dans la même installation. `)) }));
const chapter = { series: [...qcm, ...dp], flashcards: facts.map(card), provenance: { source: 'extract.json', sourceOnly: true, figures: 'Aucune image publiée : absence de légende source exploitable.' } };
const coverage = { sourceBlocks: fiche.sourceBlocks, facts: facts.length, qcmQuestions: 40, dpQuestions: 56, imageException: fiche.imageException.reason };
writeFileSync(join(out, 'fiche.model.json'), JSON.stringify(fiche, null, 2), 'utf8');
writeFileSync(join(out, 'fiche.body.html'), compileFicheModel(fiche, dir), 'utf8');
writeFileSync(join(out, 'chapter.json'), JSON.stringify(chapter, null, 2), 'utf8');
writeFileSync(join(out, 'coverage.json'), JSON.stringify(coverage, null, 2), 'utf8');
console.log(JSON.stringify({ out, cards: facts.length, qcm: qcm.length, dp: dp.length }));
