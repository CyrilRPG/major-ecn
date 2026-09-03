/** Répare et exécute le paquet source-only d'enclouage, sans réécrire les données validées. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { compileFicheModel } from './lib/orthopedie-fiche.mjs';

const generatorFile = resolve('scripts/produce-orthopedie-enclouage-femur.mjs');
const source = readFileSync(generatorFile, 'utf8');
const prefix = source.slice(source.indexOf('\n') + 1, source.indexOf('\nconst pool='));
// Le préfixe contient uniquement les données éditoriales (fiche et faits)
// et les helpers R/X ; les imports sont fournis explicitement ici.
const loadData = new Function('mkdirSync', 'resolve', 'join', 'compileFicheModel', `${prefix}\nreturn { dir, out, fiche, facts };`);
const { dir, out, fiche, facts } = loadData(mkdirSync, resolve, join, compileFicheModel);

const pool = facts.map((fact) => fact[1]);
const choices = (truth, index) => {
  const offset = (index * 5) % Math.max(1, pool.length - 4);
  return [truth, ...pool.filter((value) => value !== truth).slice(offset, offset + 4)].map((enonce, itemIndex) => ({
    lettre: String.fromCharCode(65 + itemIndex), enonce, is_correct: itemIndex === 0,
    justification: itemIndex === 0 ? 'Conforme au chapitre source.' : 'Cette proposition ne correspond pas au chapitre source.',
  }));
};
const question = (fact, index, intro = '') => ({ enonce: `${intro}${fact[0]}`, items: choices(fact[1], index), correction_generale: `Notion issue du bloc ${fact[2]} du corpus.` });
const qcm = Array.from({ length: 8 }, (_, seriesIndex) => ({
  label: `QCM ${seriesIndex + 1} · Enclouage fémoral`, vignette: '',
  questions: facts.slice(seriesIndex * 5, seriesIndex * 5 + 5).map((fact, index) => question(fact, seriesIndex * 5 + index, 'Pour un enclouage centromédullaire fémoral, ')),
}));
const cases = [
  ['installation', 'Un patient de 32 ans présente une fracture diaphysaire fémorale. Il est préparé sur table orthopédique avec scopie ; l’installation protège le périnée et le membre controlatéral. Au suivi postopératoire, les pouls et l’examen neurologique sont documentés.', 6],
  ['réduction', 'Une patiente de 45 ans a une fracture distale avec flessum. La réduction sous amplificateur est obtenue avant tout alésage, sans tolérer de rotation. Après stabilisation, le contrôle radiographique et la reprise de mobilisation sont programmés.', 11],
  ['entrée trochantérienne', 'Un patient est installé pour enclouage à foyer fermé. Après la voie trochantérienne, le point d’entrée est contrôlé par scopie et orienté selon l’antécurvatum. Au suivi, les douleurs locales et le résultat radiologique sont évalués.', 16],
  ['guide et alésage', 'Une patiente bénéficie d’un cathétérisme du canal avec guide mousse. Le centrage est vérifié sur face et profil avant un alésage progressif. Après l’intervention, la mise en charge est adaptée au contact interfragmentaire.', 25],
  ['enclouage', 'Un patient présente une fracture médiodiaphysaire réduite. Le clou est choisi après mesure, introduit sans rotation puis impacté après relâchement de traction. Au suivi, le sommet trochantérien et la consolidation sont contrôlés.', 43],
  ['verrouillage proximal', 'Une patiente nécessite un verrouillage pour risque d’angulation. La visée proximale est préparée avec l’ancillaire et contrôlée par scopie. Après le geste, le contrôle de longueur de vis et le drainage sont consignés.', 53],
  ['verrouillage distal', 'Un patient a un clou verrouillé distalement. L’amplificateur est réglé jusqu’à obtenir un trou parfaitement rond avant forage. Au suivi, les radiographies vérifient le montage et l’absence de complication neurologique.', 62],
  ['suites', 'Une patiente a un montage statique avec contact interfragmentaire insuffisant. L’appui et la mobilisation sont prescrits selon le protocole, avec contrôle radiologique à six semaines. Au suivi, un cal insuffisant fait discuter une dynamisation.', 77],
];
const dp = cases.map(([label, vignette, start], seriesIndex) => ({
  label: `DP ${seriesIndex + 1} · ${label}`, vignette: `<p>${vignette} La stratégie est expliquée au patient ; l’équipe consigne le contrôle opératoire, les consignes de mobilisation et la date du prochain contrôle clinique et radiographique.</p>`,
  questions: Array.from({ length: 7 }, (_, index) => question(facts[(start + index) % facts.length], start + index, index ? 'Nouvel élément : une donnée de contrôle opératoire ou de suivi est disponible. ' : '')),
}));
const chapter = { series: [...qcm, ...dp], flashcards: facts.map(([recto, verso, sourceBlock]) => ({ recto, verso, source: [sourceBlock] })), provenance: { source: 'extract.json', sourceOnly: true } };
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'fiche.model.json'), JSON.stringify(fiche, null, 2), 'utf8');
writeFileSync(join(out, 'fiche.body.html'), compileFicheModel(fiche, dir), 'utf8');
writeFileSync(join(out, 'chapter.json'), JSON.stringify(chapter, null, 2), 'utf8');
writeFileSync(join(out, 'coverage.json'), JSON.stringify({ sourceBlocks: fiche.sourceBlocks, cards: facts.length, qcm: 40, dp: 56, imageException: fiche.imageException.reason }, null, 2), 'utf8');
console.log(JSON.stringify({ out, cards: facts.length, qcm: qcm.length, dp: dp.length }));
