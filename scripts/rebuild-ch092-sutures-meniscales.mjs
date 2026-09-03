import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { compileFicheModel } from './lib/orthopedie-fiche.mjs';

const dir = resolve('../.corpus-orthopedie/sutures-meniscales');
const out = join(dir, 'delivery', 'quality-v3');
mkdirSync(out, { recursive: true });
const extract = JSON.parse(readFileSync(join(dir, 'extract.json'), 'utf8'));
const fix = (s) => { let v = String(s ?? ''); for (let i = 0; i < 2 && /Ã.|â€™|â€œ|â€/.test(v); i += 1) { const n = Buffer.from(v, 'latin1').toString('utf8'); if (n.includes('�') || n === v) break; v = n; } return v.replace(/\s+/g, ' ').trim(); };
const usable = extract.blocs.map((b, i) => ({ i, text: fix(b.texte) })).filter((b) => b.text.length > 160 && b.text.length < 2400);
const sentenceBullets = (index) => {
  const text = usable.find((b) => b.i === index)?.text ?? usable[Math.min(usable.length - 1, index)]?.text ?? '';
  const parts = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  return parts.slice(0, 3).map((p) => p.trim()).filter(Boolean);
};
const picks = [6, 8, 10, 13, 17, 21, 25, 31, 39, 47, 56, 68, 79, 91, 104, 116, 129, 142, 154, 166, 178, 185, 189, 192];
const concepts = [
  'Anatomie macroscopique', 'Microstructure et résistance', 'Vascularisation périphérique', 'Fonctions méniscales', 'Conséquences de la méniscectomie', 'Cicatrisation physiologique',
  'Facteurs de cicatrisation', 'Bilan de la lésion', 'Indications de conservation', 'Lésions réparables', 'Limites de l’indication', 'Préparation arthroscopique',
  'Principes de suture', 'Techniques tout-en-dedans', 'Techniques dedans-dehors', 'Techniques dehors-dedans', 'Protection des structures à risque', 'Gestes associés',
  'Rééducation postopératoire', 'Surveillance de la cicatrisation', 'Échecs et complications', 'Résultats fonctionnels', 'Préservation du capital méniscal', 'Décision individualisée',
];
const row = (n) => ({ concept: concepts[n], bullets: sentenceBullets(picks[n]) });
const sections = (a, b) => [{ title: concepts[a], rows: [row(a), row(a + 1), row(a + 2)] }, { title: concepts[b], rows: [row(b), row(b + 1), row(b + 2)] }];
const model = {
  title: 'Sutures méniscales', year: '2025-2026', sourceBlocks: picks,
  imageException: { reason: 'Les figures du corpus ne comportent pas de légende source exploitable ; aucune légende n’est inventée.' },
  parts: [
    { title: 'Comprendre le ménisque à préserver', sections: sections(0, 3) },
    { title: 'Cicatrisation, bilan et indications', sections: sections(6, 9) },
    { title: 'Choisir une technique de suture', sections: sections(12, 15) },
    { title: 'Suivi et résultats de la réparation', sections: sections(18, 21) },
  ],
  synthesis: {
    chiffres: { headers: ['Repère', 'Donnée du corpus', 'Conséquence'], rows: [
      ['Vascularisation adulte', 'Tiers périphérique vascularisé', 'Potentiel de cicatrisation supérieur en périphérie'],
      ['Contraintes en extension', 'Environ 50 % transmises par les ménisques', 'Préserver le capital méniscal'],
      ['Contraintes à 90° de flexion', 'Environ 85 % transmises par les ménisques', 'Importance de la fonction méniscale'],
      ['Cicatrice à 8 semaines', 'Résistance biomécanique rapportée à 33 %', 'Protection postopératoire nécessaire'],
      ['Cicatrice à 4 mois', 'Résistance biomécanique rapportée à 52 %', 'Progression de la rééducation'],
      ['Cicatrice à 6 mois', 'Résistance biomécanique rapportée à 62 %', 'Suivi prolongé de la reprise fonctionnelle'],
    ] },
    tables: [
      { title: 'Raisonner l’indication', headers: ['Élément', 'À analyser', 'Impact'], rows: [['Lésion', 'Localisation, stabilité, qualité tissulaire', 'Réparabilité'], ['Patient', 'Symptômes et projet fonctionnel', 'Objectif de conservation'], ['Genou', 'Lésions associées et stabilité', 'Geste associé éventuel']] },
      { title: 'Temps de la prise en charge', headers: ['Temps', 'Objectif', 'Contrôle'], rows: [['Bilan', 'Caractériser la lésion', 'Imagerie et arthroscopie'], ['Suture', 'Rapprocher les berges', 'Stabilité de la réparation'], ['Suivi', 'Protéger puis récupérer la fonction', 'Clinique et progression fonctionnelle']] },
    ],
    keyPoints: ['La préservation méniscale vise à limiter les conséquences délétères de la méniscectomie.', 'La vascularisation périphérique conditionne une grande part du potentiel de cicatrisation.', 'La lésion doit être analysée avec le patient et dans le contexte global du genou.', 'La technique de suture est choisie selon la topographie et l’accessibilité de la lésion.', 'La protection postopératoire est justifiée par la maturation progressive du tissu cicatriciel.', 'Le suivi évalue douleur, mobilité, reprise fonctionnelle et échec de réparation.'],
    eclair: ['Préserver le ménisque lorsque la lésion est réparable.', 'Le tiers périphérique est vascularisé chez l’adulte ; la zone centrale est avasculaire.', 'Les ménisques transmettent environ 50 % des contraintes en extension et 85 % à 90° de flexion.', 'La méniscectomie réduit la surface de contact et augmente les pressions.', 'La cicatrice méniscale mûrit progressivement : 33 % à 8 semaines, 52 % à 4 mois, 62 % à 6 mois.', 'Choisir la suture selon la lésion, l’accessibilité et le contexte du genou.', 'Le suivi est clinique, fonctionnel et adapté à la progression de la cicatrisation.'],
  },
};
writeFileSync(join(out, 'fiche.model.json'), `${JSON.stringify(model, null, 2)}\n`, 'utf8');
writeFileSync(join(out, 'fiche.body.html'), compileFicheModel(model, dir), 'utf8');
console.log(JSON.stringify({ title: model.title, parts: model.parts.length, blocks: picks.length }));
