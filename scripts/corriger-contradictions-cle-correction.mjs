#!/usr/bin/env node
// Correction des contradictions entre la clé d'un QCM et sa correction
// (justification d'une proposition ou correction générale), relevées le
// 05/10/2026 :
//   - orthopédie : les 92 constats « incohérent » ouverts de l'audit des
//     corrigés (qcm_audit_findings), relus un par un ;
//   - autres collèges : les 10 corrections dont l'en-tête « Réponses : … »
//     contredit la clé (relevées par l'audit de la position des réponses).
//
// Chaque décision est écrite ci-dessous avec son motif. Rien n'est appliqué
// si le contenu actuel ne correspond plus à celui qui a été relu (« avant ») :
// une modification faite entre-temps dans l'éditeur n'est jamais écrasée.
// Chaque écriture est consignée dans admin_audit_logs, et les constats
// traités sont clos avec le statut de l'écran /admin/audit-corriges
// (cle_inversee, corrige_manuellement, ignore).
//
// Appliqué en production le 05/10/2026 : --lot=orthopedie (26 propositions,
// 5 questions, 78 constats clos), puis --lot=entetes (10 corrections, 1
// proposition). Relancé, le script ne trouve plus rien à écrire.
//
// Usage :
//   node scripts/corriger-contradictions-cle-correction.mjs --lot=orthopedie            simulation
//   node scripts/corriger-contradictions-cle-correction.mjs --lot=orthopedie --appliquer
//   node scripts/corriger-contradictions-cle-correction.mjs --lot=entetes [--appliquer]
import { join, resolve } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const ROOT = resolve(import.meta.dirname, '..');
const lotDemande = process.argv.find((value) => value.startsWith('--lot='))?.split('=')[1];
const appliquer = process.argv.includes('--appliquer');
if (!['orthopedie', 'entetes'].includes(lotDemande)) {
  console.error('Usage : node scripts/corriger-contradictions-cle-correction.mjs --lot=orthopedie|entetes [--appliquer]');
  process.exit(1);
}

// ─── Orthopédie : propositions ───────────────────────────────────────────────
// avant : contenu relu ; apres : contenu écrit ; constat : statut de clôture.
const PROPOSITIONS_ORTHOPEDIE = [
  // Clés fausses : la justification (et la source) avaient raison.
  {
    id: 'ba4b7cb8-5912-42b5-8370-a406f1202552', constat: ['f0fc8494-034e-4132-827c-acf30c7f1c3f', 'cle_inversee'],
    motif: 'Pseudarthrose de l’odontoïde : la plaque C1-C2 est justement l’option d’un trait oblique en bas et en avant (cf. proposition C et correction).',
    avant: { is_correct: false },
    apres: { is_correct: true, justification: 'Vrai : la plaque C1-C2 est nécessaire pour traiter une fracture à trait oblique en bas et en avant, qui contre-indique le vissage simple.' },
  },
  {
    id: 'a4ba97e7-b834-495a-b3d3-9665fb4da097', constat: ['5c675ea7-c0ef-431a-bbc0-491edee6b5c6', 'cle_inversee'],
    motif: 'L’insertion fémorale du poplité est distale (et antérieure) à celle du LCL : la proposition « proximale » est fausse.',
    avant: { is_correct: true },
    apres: { is_correct: false, justification: 'Faux : l’insertion fémorale du tendon poplité est distale et antérieure par rapport à celle du LCL ; sur le profil, elle se situe à 12,2 mm de l’épicondyle latéral, contre 4,3 mm pour le LCL.' },
  },
  {
    id: '28797d3e-6c56-40b4-8ebb-fe4ba4665944', constat: ['5596e828-a378-4c0e-b37f-58bb3e15a152', 'cle_inversee'],
    motif: 'Ligamentoplastie médiale (Jobe) : greffon fixé avant-bras en supination complète, comme l’indiquent la justification et le dossier du lanceur.',
    avant: { is_correct: true },
    apres: { is_correct: false, justification: 'Faux : la fixation du greffon est réalisée avant-bras en supination complète (et non en pronation), coude en léger varus, après vérification de la tension de la ligamentoplastie.' },
  },
  // Clés justes, justifications incomplètes ou mal tournées : complétées
  // d'après la correction générale de la question.
  {
    id: '9802d61d-0035-486b-9ada-a1a61541829a', constat: ['0a2dadf6-decf-4f86-812b-ea9b4246b5b9', 'corrige_manuellement'],
    motif: 'Ostéotomie fémorale de varisation : la justification omettait l’appui complet à 3 mois.',
    avant: { justification: 'Appui partiel dès la 6e semaine.' },
    apres: { justification: 'Vrai : appui partiel dès la 6e semaine, appui complet autorisé à 3 mois.' },
  },
  {
    id: 'a4f93716-cf7c-4709-93d0-4e9b390f89c8', constat: ['ebbbe676-fe7e-4c94-9f04-57138b92cb8b', 'corrige_manuellement'],
    motif: 'Hallux valgus : la fourchette de 3 à 6 semaines n’apparaissait pas dans la justification.',
    avant: { justification: 'Deux à trois semaines pour un geste simple, quatre à six pour une base ou une arthrodèse.' },
    apres: { justification: 'Vrai : 3 à 6 semaines selon l’intervention, deux à trois pour un geste simple, quatre à six pour une ostéotomie de la base ou une arthrodèse.' },
  },
  {
    id: '2d883795-c8b7-4221-9c58-f3ce539b96e4', constat: ['355bbf21-7a5f-47bd-bd89-d4f0ecf88d09', 'corrige_manuellement'],
    motif: 'Prothèse totale du coude : la limite de 2,5 kg après 3 mois (correction) manquait.',
    avant: { justification: 'La limite est de 500 g pendant les 3 premiers mois.' },
    apres: { justification: 'Vrai : pas plus de 500 g pendant les 3 premiers mois, puis pas plus de 2,5 kg par la suite.' },
  },
  {
    id: 'ba5fbf21-54f1-4e9b-9722-82cda5ed35f2', constat: ['6e99ad64-2205-4349-9a5b-8ab8ab18d30d', 'corrige_manuellement'],
    motif: 'Flessum du coude : la justification semblait contredire la proposition alors qu’elle la fonde.',
    avant: { justification: 'On recommande de ne pas exposer au risque vasculaire.' },
    apres: { justification: 'Vrai : devant un flessum fixe très sévère, mieux vaut accepter un flessum résiduel que d’exposer au risque vasculaire en recherchant l’extension complète.' },
  },
  {
    id: '2a083668-1ba6-4266-a05d-1f18f1c7a0a9', constat: ['a423de63-b120-41c1-960a-9b10e001923a', 'corrige_manuellement'],
    motif: 'Désinsertion proximale : la justification n’énonçait que la contraposée.',
    avant: { justification: 'Elle a peu d’intérêt si aucune fonction musculaire ne persiste.' },
    apres: { justification: 'Vrai : la désinsertion proximale garde son intérêt sur un muscle rétracté qui a conservé une fonction ; elle en a peu si aucune fonction musculaire ne persiste.' },
  },
  {
    id: '22baad66-2708-43e9-9aa2-d063a41b6775', constat: ['47ab3779-834c-48f9-8d41-89451b0564fd', 'corrige_manuellement'],
    motif: 'Scaphoïde (Dias) : les deux chiffres n’étaient pas attribués à leur groupe.',
    avant: { justification: 'Selon Dias, le taux de pseudarthrose serait diminué (10/44 contre 0/45) à un délai précoce avec le vissage percutané.' },
    apres: { justification: 'Vrai : selon Dias, le taux de pseudarthrose précoce est diminué par le vissage percutané, 10/44 après traitement orthopédique contre 0/45 après vissage.' },
  },
  {
    id: '20e835c0-5061-43ee-94a6-06d4b6242a60', constat: ['ff41f9a7-6731-4d25-8fea-89a154c9d2bd', 'corrige_manuellement'],
    motif: 'Artifice de Maestro : la justification ne reprenait que la seconde moitié de la phrase source.',
    avant: { justification: 'Pour cet auteur, elle est même inutile.' },
    apres: { justification: 'Vrai : avec une bonne stabilité primaire, la vis distale suffit ; pour Maestro, elle est même inutile (autostabilisation sans fixation).' },
  },
  {
    id: '78627bad-5433-4086-9191-aa37920db15a', constat: ['ebb0355f-eb45-4dd6-93de-53c2d27a6bb8', 'corrige_manuellement'],
    motif: 'Survie des PTG (Rand et Illstrup) : le chiffre à 10 ans manquait.',
    avant: { justification: '99 % à 2 ans, 98 % à 5 ans.' },
    apres: { justification: 'Vrai : 99 % à 2 ans, 98 % à 5 ans et 91 % à 10 ans pour les prothèses modernes conservant le LCP (Rand et Illstrup, 1991).' },
  },
  {
    id: '8d0b710c-7b34-4e10-a7ad-8ea4edb39cd8',
    motif: 'Même question que la précédente (QCM Rand et Illstrup), même omission, sans constat ouvert.',
    avant: { justification: '99 % à 2 ans, 98 % à 5 ans.' },
    apres: { justification: 'Vrai : 99 % à 2 ans, 98 % à 5 ans et 91 % à 10 ans (Rand et Illstrup, 1991).' },
  },
  {
    id: '5a28dfdc-bf63-4122-8f30-77053db696f3', constat: ['4dbe1bbe-b638-43a6-8c6f-cd828cc3e34e', 'corrige_manuellement'],
    motif: 'Survie des PTG à dessin ancien : le chiffre à 10 ans manquait.',
    avant: { justification: '95 % à 2 ans, 89 % à 5 ans.' },
    apres: { justification: 'Vrai : 95 % à 2 ans, 89 % à 5 ans et 78 % à 10 ans pour les prothèses à dessin ancien (Rand et Illstrup, 1991).' },
  },
  {
    id: '95d5b1a3-07f7-4eca-b7cb-f134de54dc51', constat: ['063245a9-f29f-49ea-b645-ce0894553d02', 'corrige_manuellement'],
    motif: 'Cupule de PTH : « le débord antérieur est recherché » se lisait comme une consigne de le créer.',
    avant: { justification: 'Le débord antérieur est recherché car source de conflit avec le psoas.' },
    apres: { justification: 'Vrai : un débord antérieur de la cupule est source de conflit avec le tendon du psoas ; il doit être évité.' },
  },
  {
    id: '395c5c39-fe0d-4bc2-86d9-31c94ff31199', constat: ['d9b900dc-7ece-4a4f-a730-dbe878c163f8', 'corrige_manuellement'],
    motif: 'Hallux valgus : la durée de deux à trois semaines n’était pas citée.',
    avant: { justification: 'La fourchette générale est de 3 à 6 semaines, réduite pour un geste simple.' },
    apres: { justification: 'Vrai : deux à trois semaines pour un geste simple, quatre à six pour une ostéotomie de la base ou une arthrodèse.' },
  },
  {
    id: '6dbeff12-5026-4595-930c-fd83a50d7e48', constat: ['c77be082-13c2-4b87-8e8a-e3f8355dda3f', 'corrige_manuellement'],
    motif: 'Technique de Lin : la justification ne citait que l’abord bilatéral.',
    avant: { justification: 'L\'abord qu\'il proposait était bilatéral.' },
    apres: { justification: 'Vrai : Lin (1982) conservait le ligament interépineux et réalisait une laminotomie avec décompression radiculaire endocanalaire, par un abord bilatéral.' },
  },
  {
    id: '729b31ee-7fd6-4ec7-91fb-6a15bbec25eb', constat: ['09aae258-7b31-46e2-9bdb-b56325de53c8', 'corrige_manuellement'],
    motif: 'Intervention de Keller : la justification décrivait l’autre erreur de résection.',
    avant: { justification: 'Trop importante, elle entraîne au contraire un défaut d\'appui avec métatarsalgie latérale.' },
    apres: { justification: 'Vrai : une résection trop économique de la base phalangienne expose à une raideur douloureuse ; trop importante, elle entraîne au contraire un défaut d’appui avec métatarsalgie latérale.' },
  },
  {
    id: '46853a4a-46b9-4770-be8e-1de16c121fed', constat: ['6f65aaca-9f3c-4b22-a9ee-e8b9a68d7f39', 'corrige_manuellement'],
    motif: 'Biopsie vertébrale : la justification ne parlait que du rachis cervical.',
    avant: { justification: 'Décubitus dorsal pour le cervical (sauf arc postérieur).' },
    apres: { justification: 'Vrai : procubitus pour les rachis dorsal et lombaire ; décubitus dorsal pour le rachis cervical (sauf arc postérieur).' },
  },
  {
    id: '8626d244-3f31-4524-9e4f-ca0492a0d859', constat: ['d698506b-d5f8-45a9-a2bc-96aaa144b4ca', 'corrige_manuellement'],
    motif: 'Culture chondrocytaire : justification vide.',
    avant: { justification: null },
    apres: { justification: 'Vrai : le cartilage sain est prélevé en zone non portante, les chondrocytes sont cultivés trois à six semaines puis implantés sur une matrice, après excision du tissu dévitalisé.' },
  },
  {
    id: '742f60c7-53cf-46ef-9661-72663c4931b2', constat: ['2b27e76b-dece-4699-b5b6-2aadb07b8127', 'corrige_manuellement'],
    motif: 'Lésion chondrale et laxité : justification vide.',
    avant: { justification: null },
    apres: { justification: 'Vrai : la laxité dégrade le cartilage ; l’instabilité fait partie des lésions associées à traiter avant la réparation cartilagineuse.' },
  },
  // Replantation, conditionnement du segment : les cinq propositions étaient
  // des faits exacts présentés en « question : réponse », une seule était
  // cochée. Réécrites en affirmations tirées des mêmes faits (A et C vraies).
  {
    id: 'a5ca9347-4ae9-42ae-b748-39f929ed2a81',
    motif: 'Replantation, conditionnement : proposition réécrite en affirmation (vraie).',
    avant: { is_correct: true, enonce: 'Quel contenant protège le segment amputé  : Une enveloppe hermétiquement close.' },
    apres: { enonce: 'Le segment amputé est protégé dans une enveloppe hermétiquement close.', justification: 'Vrai : c’est le contenant recommandé pour le segment amputé.' },
  },
  {
    id: '8cbd6a46-bf78-4c8e-a7a4-58785ddb9772',
    motif: 'Replantation, conditionnement : proposition réécrite en affirmation (fausse).',
    avant: { is_correct: false, enonce: 'Quel dispositif ne pas poser sur le moignon  : Un garrot.' },
    apres: { enonce: 'Un garrot est posé sur le moignon.', justification: 'Faux : aucun garrot ne doit être posé sur le moignon.' },
  },
  {
    id: 'b7f98701-13b0-4dfd-8982-312627c47794', constat: ['b4cb1445-cdf4-4e41-b505-617b3bd1bfce', 'cle_inversee'],
    motif: 'Replantation : fait exact marqué faux.',
    avant: { is_correct: false, enonce: 'Pourquoi les doigts tolèrent-ils mieux l’ischémie  : Ils ne contiennent pas de tissu musculaire.' },
    apres: { is_correct: true, enonce: 'Les doigts tolèrent mieux l’ischémie car ils ne contiennent pas de tissu musculaire.', justification: 'Vrai : dépourvus de tissu musculaire, les doigts tolèrent mieux l’ischémie.' },
  },
  {
    id: '6a4f944f-a176-415d-9977-d45eb17c703e', constat: ['44823e7b-370a-4fd6-ba9e-38091b1ba2d3', 'corrige_manuellement'],
    motif: 'Replantation : proposition réécrite en affirmation (fausse).',
    avant: { is_correct: false, enonce: 'Pourquoi éviter l’immersion du segment  : Elle favorise œdème et infiltration cellulaire.' },
    apres: { enonce: 'Le segment amputé est immergé dans un liquide pour le transport.', justification: 'Faux : l’immersion est à éviter, elle favorise œdème et infiltration cellulaire.' },
  },
  {
    id: '59db4475-bc89-488e-8932-557f38f96a1c',
    motif: 'Replantation : proposition réécrite en affirmation (fausse).',
    avant: { is_correct: false, enonce: 'Pourquoi éviter le contact direct avec la glace  : Il cause des gelures tissulaires.' },
    apres: { enonce: 'Le segment amputé est placé directement au contact de la glace.', justification: 'Faux : le contact direct avec la glace cause des gelures tissulaires.' },
  },
  {
    id: 'f7cfc07c-e636-4b14-9393-5fe5fd56695c', constat: ['5ac3399e-0dca-49d3-a283-4052c990ec6a', 'corrige_manuellement'],
    motif: 'Reconstruction du LCP : la réponse juste ne répondait pas à l’énoncé (énoncé corrigé, justification précisée).',
    avant: { justification: '<p>Vrai. Intégrer l’anatomie, les lésions associées et le projet fonctionnel.</p>' },
    apres: { justification: '<p>Vrai. La stratégie intègre l’anatomie, les lésions associées et le projet fonctionnel du patient.</p>' },
  },
];

// ─── Orthopédie : questions ──────────────────────────────────────────────────
const QUESTIONS_ORTHOPEDIE = [
  {
    id: '3063684a-d0a4-428d-9f36-076d75c8d1b3',
    motif: 'Replantation, conditionnement : énoncé incompréhensible et correction vide.',
    avant: { enonce: 'Chez un patient pris en charge pour replantations digitales, quel objectif pratique est retenu par le situation ?', correction_generale: 'Correction fondée sur les éléments du chapitre.' },
    apres: {
      enonce: 'Concernant le conditionnement d’un segment digital amputé, quelles propositions sont exactes ?',
      correction_generale: 'Le segment amputé est protégé dans une enveloppe hermétiquement close, sans immersion (qui favorise œdème et infiltration cellulaire) ni contact direct avec la glace (gelures tissulaires). Aucun garrot n’est posé sur le moignon. Dépourvus de tissu musculaire, les doigts tolèrent mieux l’ischémie.',
    },
  },
  {
    id: 'e4c92e87-556d-4967-8c5e-4b0e0d6f34ef',
    motif: 'Reconstruction du LCP : l’énoncé demandait comment valider le montage, les propositions portent sur les principes de la prise en charge.',
    avant: { enonce: 'Au premier contrôle postopératoire, comment valider passage, fixation et réduction ?', correction_generale: '<p>Le dossier suit une reconstruction du LCP source-only, de la décision au suivi.</p>' },
    apres: {
      enonce: 'Au premier contrôle postopératoire, le chirurgien rappelle les principes de la reconstruction du LCP. Quelle attitude est juste ?',
      correction_generale: '<p>La reconstruction du LCP intègre l’anatomie, les lésions associées et le projet fonctionnel : le bilan des lésions associées modifie la stratégie, le forage du tunnel tibial genou en extension complète augmente le risque postérieur, un tunnel mal placé compromet la stabilité et doit être corrigé, et le suivi fonctionnel reste indispensable après une fixation stable.</p>',
    },
  },
  {
    id: 'eb084eb3-2dd9-4605-ac5b-15070b4ffb51', constat: ['eb55ab54-8422-476a-a6df-9c294d25e949', 'corrige_manuellement'],
    motif: 'Reconstruction cartilagineuse : énoncé incompréhensible (clé juste).',
    avant: { enonce: 'Lors de la prise en charge orthopédique, quelles options de prise en charge sont adaptées à un problème de quelle attitude pédagogique est conforme à la source ?' },
    apres: { enonce: 'Lors de l’information d’un patient candidat à une reconstruction cartilagineuse, quelles attitudes sont adaptées ?' },
  },
  {
    id: 'eeccacd7-270c-4c3d-946b-5fa0dd6bc833', constat: ['18008392-8404-4c9c-b2bd-a38b78af93d3', 'corrige_manuellement'],
    motif: 'Reprise de LCA : la réponse D (ligaments artificiels) est juste mais ne porte pas sur le tunnel fémoral que visait l’énoncé.',
    avant: { enonce: 'Après le geste, à 4 mois de l\'arthrolyse, le patient récupère une extension complète et une flexion à 130°. L\'instabilité est modérée (Lachman positif à arrêt dur retardé). Concernant la reconstruction itérative du LCA à envisager, quelle technique est à proscrire pour le tunnel fémoral ?' },
    apres: { enonce: 'Après le geste, à 4 mois de l\'arthrolyse, le patient récupère une extension complète et une flexion à 130°. L\'instabilité est modérée (Lachman positif à arrêt dur retardé). Concernant la reconstruction itérative du LCA à envisager, quelle(s) option(s) est (sont) à proscrire ?' },
  },
  {
    id: '84df9fca-ed06-453e-bc97-763e54f3f3ab',
    motif: 'Cupule de PTH : même tournure ambiguë que la justification de B.',
    avant: { correction_generale: 'Le débord antérieur est recherché car source de conflit avec le psoas.' },
    apres: { correction_generale: 'Un débord antérieur de la cupule doit être évité : il est source de conflit avec le tendon du psoas.' },
  },
];

// ─── Orthopédie : constats clos sans modification ────────────────────────────
// La clé et la justification concordent (le relecteur automatique a mal lu le
// sens de la proposition ou jugé la médecine plutôt que la cohérence).
const FAUX_POSITIFS_ORTHOPEDIE = [
  '527cc9c0-f421-4548-977f-36d010709edd', 'c96fc74e-7354-4ca1-b326-c041f2a689ee', '8da8243b-3fe2-45bf-aa41-078febf049d2',
  '40d7b15d-edca-434b-aa52-2a2dd6ce59bf', '02121f60-17c1-4991-8167-57a82a30fa30', '4913dc77-c212-4033-8a33-b49f47715778',
  'dabc743d-2012-4ff0-8fd8-1e647d7cbc44', '7755988e-bd07-449a-bc35-fec303bfb4dd', 'ef2c458f-8c41-49b0-a38d-9e1b060b0788',
  '9a059e7c-b5dc-473d-af62-c9c11ee64012', '61de8bd0-14dc-430d-8fa5-1ff0e0af9c3d', '2d915de6-fe7c-47bd-ada8-02ee96d7bafc',
  'd1ee150d-f5dd-40c0-af4f-188b6a3e8127', '1689e036-3898-4d3e-9511-3c46c8cd0d4d', '255bcf22-374c-4d33-9fbf-5c52a13ac7a6',
  '3d506e5b-123c-4090-8e53-5093c8e9a356', 'a9538a2e-5861-4bd5-aee1-2b28f1ec0bdd', '70a8fb7b-8819-45d3-bee2-6da7eed100cc',
  'd3624cc4-aa5b-446d-8422-1d9f341848ca', '0d599d94-7a9f-423c-a0d2-8f97179a6b78', 'ee3f4da7-5e15-4ea7-b92d-866e7ad342a8',
  'bda42851-9e7e-4cdb-a4ae-be87f4ede81b', '25648b20-a5df-4df7-8ef7-9ff93f9c8efb', '86162451-3d8b-40c1-bd0e-048c745895b2',
  '1820e49d-7f95-407c-8c47-4c3879a5e0e2', '5877a87a-27cc-4419-8958-5283a1e7d63e', 'b5fb64f3-e2a6-4867-80e1-39d695b3cbdc',
  'fb9311d3-cb39-4378-9a56-bfc8a9d47c70', 'dad47130-eb38-42c8-8d6a-2a3afe54e680', 'd76b04ae-8ef7-4284-9bb4-2e64783baf54',
  'cf20cb57-07f2-49c1-ab27-cc1d31df11d9', 'e4793073-5b69-42c2-b298-72881b6319f0', '40df3fce-ac82-4e9d-925d-d57330869116',
  '0ff7d77f-56d8-4082-825b-b34d61b9c562', '19e13c88-ac43-412d-8310-01e7962b5d83', '38471936-cbb3-4e30-86cb-d60e89aa0434',
  '97a4a6ee-16da-48a6-aaa4-3d89f84864ce', '1258d5a4-58e4-4636-94d5-1e52d171bbe0', '0de42f51-e2ce-4f28-9f6c-69f4e5f46837',
  'b21cb5dd-5390-4771-bf91-8574cd9838f1', 'e4d48345-33db-46df-b97a-ac7abaf000e1', 'e135ff45-96e5-4a81-a6fb-aca265777967',
  '212c196d-b6b1-4ac3-addc-dbcbd071053e', '2d6d42a2-7bab-44ef-bd7a-0f4253e8dae8', 'd9e0218a-06b5-492f-96d8-d872bae5f89e',
  '89380d7c-e586-4d0b-ac9c-745ccf015bb5', 'bf861a60-596c-474b-a578-47d875d0c696', '8c4141e0-9f27-4717-b96f-5f502bba81dc',
  'd8c00526-36b7-4083-9237-553d88082894',
];
// Clé déjà corrigée dans l'éditeur depuis l'audit, constat resté ouvert.
const DEJA_CORRIGES_ORTHOPEDIE = [
  '3a1acd7d-6419-4650-b0aa-d01f7606c3d9', '5f7115dd-ed20-4c65-bb8c-af49f58b3d6c', 'bbcbf8af-da67-4964-8591-74a4cba02464',
  '27848889-e298-44a3-90cf-da350572db23', '7858fa49-0d78-4c70-b63e-930e000fe289',
];
// Restent ouverts : les constats des cours « Fractures du pilon tibial » et
// « Fractures récentes et anciennes des deux os de l'avant-bras chez
// l'adulte », dont toutes les questions (comme celles des « Fractures
// périprothétiques de hanche et de genou ») sont des fragments du chapitre
// avec une justification générique : ces banques sont à régénérer.

// ─── Autres collèges : en-têtes de correction contraires à la clé ────────────
// Dans les dix cas, la clé et le commentaire de l'enseignant concordent : c'est
// l'en-tête (et parfois une ligne) de la correction d'origine qui se trompe.
const HSA = [
  ['Réponses correctes : A, B, C, D, E\n', 'Réponses correctes : A, B, C, E\n'],
  ['D : Vrai → Contexte post-traumatique', 'D : Faux → Une HSA spontanée est par définition non traumatique : l’HSA post-traumatique est une autre entité.'],
];
const HYPERKALIEMIE = [
  ['Réponses : A, B, C, D\n', 'Réponses : A, B, C\n'],
  ['D. Vrai. Toujours vérifier une pseudo-hyperkaliémie (hémolyse, thrombocytose).', 'D. Faux. Une pseudo-hyperkaliémie (hémolyse, thrombocytose) se discute devant une kaliémie élevée sans anomalie ECG ; des signes ECG francs prouvent ici une hyperkaliémie vraie.'],
];
const CURB65 = [
  ['Réponses correctes : A, B, C, E\n', 'Réponses correctes : A, B, C, D, E\n'],
  ['D : Faux → Hypotension = critère de Fine, pas CURB-65.', 'D : Vrai → Pression artérielle basse (PAS < 90 mmHg ou PAD ≤ 60 mmHg) : c’est le « B » de CURB-65.'],
];
const QUESTIONS_ENTETES = [
  { id: '22bd4f16-2722-5bb0-ade4-33b60f75f87c', motif: 'HSA spontanée (médecine intensive) : le traumatisme crânien n’en est pas une étiologie.', remplacements: HSA },
  { id: '51c96245-cd0e-4cdc-82ff-0e4c96093d74', motif: 'HSA spontanée (MIR) : le traumatisme crânien n’en est pas une étiologie.', remplacements: HSA },
  { id: '6e868380-d951-5cdd-bb2e-3798f62aea47', motif: 'Hyperkaliémie (médecine intensive) : les signes ECG excluent la pseudo-hyperkaliémie.', remplacements: HYPERKALIEMIE },
  { id: '87b4e6f0-1a55-4dd4-b6e2-dea3c6e8ab5a', motif: 'Hyperkaliémie (MIR) : les signes ECG excluent la pseudo-hyperkaliémie.', remplacements: HYPERKALIEMIE },
  { id: 'e9b7e2be-08e4-5318-ac0b-46b384fc77fa', motif: 'CURB-65 (médecine intensive) : la PAS < 90 mmHg est le « B » du score.', remplacements: CURB65 },
  { id: 'd09b9cf1-eee9-421d-82cd-233668270c14', motif: 'CURB-65 (MIR) : la PAS < 90 mmHg est le « B » du score.', remplacements: CURB65 },
  {
    id: '63f2660a-076e-4aca-b47a-78bc2d5d7f89', motif: 'PIO en anesthésie : « modifient » couvre aussi le propofol et l’atracurium, qui la diminuent.',
    remplacements: [['Réponse : B, D\n', 'Réponses : A, B, C, D\nModifient la PIO : la célocurine et la kétamine l’augmentent, le propofol et l’atracurium (curare non dépolarisant) la diminuent.\n']],
  },
  {
    id: '249c0b3d-d647-4be9-a64c-6589c8067a87', motif: 'Cellulite maxillo-faciale : toutes les propositions sont justes, « Tous les précédents » compris.',
    remplacements: [['Réponse : D\n', 'Réponses : A, B, C, D\n']],
  },
  {
    id: 'f7d81048-b3e3-4371-a1e8-d08b0ac0379b', motif: 'Thrombopénies constitutionnelles : pas de sur-risque thrombotique (le document source retenait D).',
    remplacements: [['Réponse : A – B – C – D', 'Réponse : A – B – C\nLes thrombopénies constitutionnelles exposent à un risque hémorragique, pas à un sur-risque thrombotique (le corrigé du document source retenait aussi D).']],
  },
  {
    id: 'ccf5f890-eac3-437f-9f49-3b2b897741c2', motif: 'Vaccinations et SEP : la question n’a que trois propositions (le document source annonçait aussi D).',
    remplacements: [['Réponses : B – C – D<br>', 'Réponses : B – C (le corrigé du document source citait aussi une proposition D, absente de la question)<br>']],
  },
];
const PROPOSITIONS_ENTETES = [
  {
    id: null, question: '63f2660a-076e-4aca-b47a-78bc2d5d7f89', lettre: 'F',
    motif: 'PIO en anesthésie : coquille dans la proposition F.',
    avant: { enonce: 'Le protoxyde d’azolte' }, apres: { enonce: 'Le protoxyde d’azote' },
  },
];

// ─── Moteur ──────────────────────────────────────────────────────────────────
config({ path: join(ROOT, '.env.local') });
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const must = async (query, label) => {
  const result = await query;
  if (result.error) throw new Error(`${label} : ${result.error.message}`);
  return result.data;
};
const maintenant = () => new Date().toISOString();
const bilan = { propositions: 0, questions: 0, constats: 0, ignores: [], refus: [] };

async function contexteCours(questionId) {
  const question = await must(db.from('qcm_questions').select('qcm_series(cours_id, cours(titre))').eq('id', questionId).single(), 'cours');
  return { coursId: question.qcm_series?.cours_id ?? null, coursTitre: question.qcm_series?.cours?.titre ?? null };
}
async function journal(entite, entiteId, questionId, description, diff) {
  if (!appliquer) return;
  const { coursId, coursTitre } = await contexteCours(questionId);
  await must(db.from('admin_audit_logs').insert({
    actor_name: 'Script — contradictions clé/correction', actor_role: 'script', action: 'update',
    entity_type: entite, entity_id: entiteId, cours_id: coursId, cours_titre: coursTitre, description, diff,
  }), 'journal');
}
async function clore(constat, statut) {
  if (!constat) return;
  const ligne = await must(db.from('qcm_audit_findings').select('id, statut').eq('id', constat).maybeSingle(), 'constat');
  if (!ligne) { bilan.refus.push(`constat ${constat} introuvable`); return; }
  if (ligne.statut !== 'ouvert') { bilan.ignores.push(`constat ${constat} déjà ${ligne.statut}`); return; }
  if (appliquer) await must(db.from('qcm_audit_findings').update({ statut, resolved_at: maintenant() }).eq('id', constat), 'clôture');
  bilan.constats += 1;
}
const egal = (a, b) => (a ?? null) === (b ?? null);

async function corrigerProposition(entree) {
  const requete = db.from('qcm_items').select('id, question_id, lettre, enonce, is_correct, justification');
  const item = await must(entree.id ? requete.eq('id', entree.id).maybeSingle() : requete.eq('question_id', entree.question).eq('lettre', entree.lettre).maybeSingle(), 'proposition');
  if (!item) { bilan.refus.push(`${entree.id ?? entree.question} : proposition introuvable`); return; }
  if (Object.entries(entree.apres).every(([champ, valeur]) => egal(item[champ], valeur))) {
    bilan.ignores.push(`${item.id} (${item.lettre}) déjà corrigée`);
    await clore(entree.constat?.[0], entree.constat?.[1]);
    return;
  }
  const ecarts = Object.entries(entree.avant).filter(([champ, valeur]) => !egal(item[champ], valeur)).map(([champ]) => champ);
  if (ecarts.length) { bilan.refus.push(`${item.id} (${item.lettre}) : ${ecarts.join(', ')} modifié(s) depuis la relecture, rien n'est écrit`); return; }
  const changement = Object.fromEntries(Object.entries(entree.apres).filter(([champ, valeur]) => !egal(item[champ], valeur)));
  if (Object.keys(changement).length) {
    if (appliquer) await must(db.from('qcm_items').update({ ...changement, updated_at: maintenant() }).eq('id', item.id), 'écriture proposition');
    const avant = Object.fromEntries(Object.keys(changement).map((champ) => [champ, item[champ]]));
    await journal('qcm_item', item.id, item.question_id, `Contradiction clé/correction, proposition ${item.lettre} : ${entree.motif}`, { avant, apres: changement, constat: entree.constat?.[0] ?? null });
    bilan.propositions += 1;
    console.log(`  ${item.lettre} ${item.id} ← ${Object.keys(changement).join(', ')}`);
  }
  await clore(entree.constat?.[0], entree.constat?.[1]);
}

async function corrigerQuestion(entree) {
  const question = await must(db.from('qcm_questions').select('id, enonce, correction_generale').eq('id', entree.id).maybeSingle(), 'question');
  if (!question) { bilan.refus.push(`${entree.id} : question introuvable`); return; }
  const correction = String(question.correction_generale ?? '');
  const dejaFaite = entree.remplacements
    ? entree.remplacements.every(([ancien, nouveau]) => correction.includes(nouveau) && !correction.includes(ancien))
    : Object.entries(entree.apres).every(([champ, valeur]) => egal(question[champ], valeur));
  if (dejaFaite) {
    bilan.ignores.push(`question ${question.id} déjà corrigée`);
    await clore(entree.constat?.[0], entree.constat?.[1]);
    return;
  }
  let apres = { ...(entree.apres ?? {}) };
  if (entree.avant) {
    const ecarts = Object.entries(entree.avant).filter(([champ, valeur]) => !egal(question[champ], valeur)).map(([champ]) => champ);
    if (ecarts.length) { bilan.refus.push(`${question.id} : ${ecarts.join(', ')} modifié(s) depuis la relecture, rien n'est écrit`); return; }
  }
  if (entree.remplacements) {
    let texte = String(question.correction_generale ?? '');
    for (const [ancien, nouveau] of entree.remplacements) {
      if (texte.split(ancien).length !== 2) { bilan.refus.push(`${question.id} : « ${ancien.trim().slice(0, 40)} » absent ou répété, rien n'est écrit`); return; }
      texte = texte.replace(ancien, nouveau);
    }
    apres = { correction_generale: texte };
  }
  const changement = Object.fromEntries(Object.entries(apres).filter(([champ, valeur]) => !egal(question[champ], valeur)));
  if (Object.keys(changement).length) {
    if (appliquer) await must(db.from('qcm_questions').update({ ...changement, updated_at: maintenant() }).eq('id', question.id), 'écriture question');
    const avant = Object.fromEntries(Object.keys(changement).map((champ) => [champ, question[champ]]));
    await journal('qcm_question', question.id, question.id, `Contradiction clé/correction : ${entree.motif}`, { avant, apres: changement, constat: entree.constat?.[0] ?? null });
    bilan.questions += 1;
    console.log(`  question ${question.id} ← ${Object.keys(changement).join(', ')}`);
  }
  await clore(entree.constat?.[0], entree.constat?.[1]);
}

console.log(`${appliquer ? 'Application' : 'Simulation'} — lot ${lotDemande}`);
if (lotDemande === 'orthopedie') {
  for (const entree of PROPOSITIONS_ORTHOPEDIE) await corrigerProposition(entree);
  for (const entree of QUESTIONS_ORTHOPEDIE) await corrigerQuestion(entree);
  for (const constat of FAUX_POSITIFS_ORTHOPEDIE) await clore(constat, 'ignore');
  for (const constat of DEJA_CORRIGES_ORTHOPEDIE) await clore(constat, 'corrige_manuellement');
} else {
  for (const entree of QUESTIONS_ENTETES) await corrigerQuestion(entree);
  for (const entree of PROPOSITIONS_ENTETES) await corrigerProposition(entree);
}
console.log(bilan);
if (!appliquer) console.log('Simulation : rien n’a été écrit. Relancer avec --appliquer.');
