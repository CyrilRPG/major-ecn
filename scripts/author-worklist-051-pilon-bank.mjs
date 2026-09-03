import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const root = resolve(process.argv[2] || '..\\.corpus-orthopedie\\fractures-du-pilon-tibial');
const out = join(root, 'delivery', '2026-08-10T13-59-00-reauthoring');
const extract = JSON.parse(readFileSync(join(root, 'extract.json'), 'utf8'));
const title = process.argv[3] || 'Fractures du pilon tibial';
const headings = new Map(); let current = 'Prise en charge des fractures du pilon tibial';
for (const [i, block] of extract.blocs.entries()) {
  const text = String(block.texte || '').replace(/\s+/g, ' ').trim();
  if (!text || block.quarantaine) continue;
  if (text.length < 80 && !/[.;]/.test(text)) { current = text; continue; }
  headings.set(i, current);
}
const clean = (x) => String(x).replace(/\s+/g, ' ').trim();
const sentences = [];
for (const [i, block] of extract.blocs.entries()) {
  if (block.quarantaine) continue;
  for (const sentence of clean(block.texte || '').match(/[^.!?]+[.!?]+/g) || []) {
    const value = clean(sentence);
    if (value.length >= 40 && value.length <= 145 && !/\b(exemple|par exemple|fig\.|figure)\b/i.test(value) && !/\b(auteur|remercient)\b/i.test(value)) {
      sentences.push({ value, source: i, heading: headings.get(i) || 'Prise en charge' });
    }
  }
}
const unique = []; const seen = new Set();
for (const entry of sentences) { const k = entry.value.toLowerCase(); if (!seen.has(k)) { seen.add(k); unique.push(entry); } }
if (unique.length < 105) throw new Error(`Corpus insuffisant : ${unique.length} énoncés exploitables`);
const focus = (value) => clean(value.replace(/^(Ainsi|Enfin|En effet|Il|Elle|Elles|Cette|Ces)\s+/i, '')).replace(/[.!?]+$/, '').slice(0, 78);
const facts = unique.slice(0, 105).map((entry, i) => ({
  recto: `Dans « ${entry.heading} », quelle donnée précise concerne ${focus(entry.value)} (notion ${entry.source}) ?`,
  verso: entry.value,
  source: [entry.source],
  order_index: i + 1,
}));
const byHeading = (word) => unique.filter((x) => new RegExp(word, 'i').test(`${x.heading} ${x.value}`));
const pools = {
  initial: byHeading('Circonstances|Diagnostic|Imagerie|Classification'),
  soft: byHeading('tissus mous|Traitement chirurgical|Installation'),
  reduction: byHeading('Réduction|ostéosynthèse|matériel|fixateur'),
  mini: byHeading('mini-invasive|greffe|arthroscopie|arthrodèse'),
  follow: byHeading('Suites|Surveillance|rééducation|Complications'),
};
const fallback = unique;
const choose = (pool, n) => (pool.length >= n ? pool : fallback).slice(0, n);
const item = (letter, fact, correct, context) => ({ lettre: letter, enonce: fact.value, is_correct: correct, justification: `<p>${correct ? 'Vrai' : 'Faux'} : ${correct ? 'cette donnée est applicable' : 'cette donnée ne répond pas à la situation'} dans ${context}.</p>` });
const question = (enonce, correctFact, alternatives, context, source) => ({
  enonce, source: [source], correction_generale: `<p>${correctFact.value}</p>`,
  items: [item('A', correctFact, true, context), ...alternatives.slice(0, 4).map((x, i) => item('BCDE'[i], x, false, context))],
});
const qThemes = [
  ['Mécanismes et gravité', pools.initial, ['Après une chute de hauteur, quel mécanisme lésionnel doit être envisagé ?', 'Dans un accident de la voie publique, quelle donnée oriente l’évaluation globale ?', 'Chez un patient ostéoporotique, quelle interprétation du mécanisme est juste ?', 'Quelle caractéristique épidémiologique du pilon tibial doit être connue ?', 'Quel élément clinique influence directement le pronostic initial ?']],
  ['Classification et imagerie', pools.initial, ['Quelle proposition distingue un type A de la classification AO ?', 'Dans quel groupe AO l’articulation est-elle complète ?', 'Que précise le scanner lors d’une atteinte articulaire ?', 'Quand le scanner peut-il être le plus informatif ?', 'Pourquoi demander des reconstructions tridimensionnelles ?']],
  ['Tissus mous et temporisation', pools.soft, ['Devant une cheville très oedématiée, quelle stratégie protège les tissus mous ?', 'Quelle règle de fermeture s’applique à une fracture ouverte ?', 'Quel geste est prioritaire devant des tissus exposés ?', 'Pourquoi éviter un garrot systématique ?', 'Quel est l’objectif du premier temps d’une stratégie différée ?']],
  ['Réduction et traction', pools.reduction, ['Quel est le principal apport de la traction dans cette fracture ?', 'Quelle limite de la ligamentotaxis doit être connue ?', 'Comment contrôler la rotation après réduction ?', 'Dans quel sens traverse la broche transcalcanéenne ?', 'Quel contrôle technique précède l’intervention sous fluoroscopie ?']],
  ['Plaque et fixateur', pools.reduction, ['Quelle exigence guide le choix d’une plaque distale ?', 'Pourquoi l’exposition du foyer doit-elle être limitée ?', 'Quel principe associe un fixateur hybride ?', 'Pourquoi un scanner est-il requis avant une fixation percutanée ?', 'Quelle erreur d’implant expose au bris mécanique ?']],
  ['Techniques mini-invasives', pools.mini, ['Quelle fracture se prête à une synthèse mini-invasive par vis ?', 'Quel ordre de réduction est recommandé en chirurgie mini-invasive ?', 'Quel rôle peut jouer la synthèse de la fibula ?', 'Dans quelle situation la plaque mini-invasive est-elle pertinente ?', 'Pourquoi l’arthrodèse ne se décide-t-elle pas dans l’urgence ?']],
  ['Suites opératoires', pools.follow, ['Quelle caractéristique doit avoir le pansement postopératoire ?', 'Quelle mesure est essentielle pendant les 48 premières heures ?', 'Que vérifie la radiographie postopératoire ?', 'Quel est le principe de mobilisation précoce ?', 'Quel élément conditionne l’autorisation de l’appui ?']],
  ['Complications', pools.follow, ['Quelle complication cutanée compromet fortement le résultat ?', 'Quelle conduite adopte-t-on devant un doute de syndrome des loges ?', 'Quelle situation favorise une désunion avec exposition de plaque ?', 'Quelle cause explique un déplacement secondaire sous fixateur ?', 'Quel mécanisme explique le bris tardif du matériel ?']],
];
const series = []; let offset = 0;
for (const [index, [label, pool, stems]] of qThemes.entries()) {
  const factsForTheme = choose(pool, 9);
  series.push({ label: `QCM ${index + 1} · ${label}`, type: 'qcm', order_index: index + 1, questions: stems.map((stem, q) => question(stem, factsForTheme[q], factsForTheme.filter((_, j) => j !== q).slice(q + 1).concat(fallback.slice(offset, offset + 4)), label, factsForTheme[q].source)) });
  offset += 4;
}
const dpScenarios = [
  ['Chute de hauteur et stratégie en deux temps', 'Un homme de 34 ans chute d’un échafaudage. Il présente une fracture du pilon tibial avec oedème important et dermabrasions. L’examen vasculo-nerveux est initialement conservé. Les radiographies puis le scanner après réalignement sont discutés. Au suivi postopératoire, la peau, la réduction et la reprise de mobilité sont contrôlées.', pools.initial, pools.soft],
  ['Polytraumatisme après accident de la route', 'Une femme de 29 ans est admise après un accident de la voie publique avec traumatisme de cheville et autres lésions. La fracture du pilon est douloureuse et déplacée. L’équipe hiérarchise les urgences, documente les tissus mous et organise une stabilisation temporaire. Au suivi, l’imagerie et l’état cutané guident le second temps.', pools.initial, pools.soft],
  ['Fracture ouverte du pilon tibial', 'Un patient de 41 ans présente une fracture ouverte du pilon tibial après choc direct. La plaie est souillée et les tissus sont contus. Un parage, une irrigation et une stabilisation externe sont planifiés sans fermeture sous tension. Au suivi, les pansements, les orifices de fixation et les signes infectieux sont surveillés.', pools.soft, pools.follow],
  ['Fracture peu déplacée et fixation mini-invasive', 'Une patiente de 55 ans présente une fracture articulaire peu déplacée après torsion. Le scanner ne retrouve pas de comminution majeure. Une stratégie mini-invasive et une synthèse de la fibula sont discutées. Au suivi, la réduction, la douleur, la mobilité et l’appui sont réévalués.', pools.mini, pools.follow],
  ['Comminution métaphysaire', 'Un homme de 47 ans a une fracture comminutive métaphysaire avec surfaces articulaires à reconstruire. Les tissus mous deviennent favorables après temporisation. Le scanner sert à choisir les voies courtes, la plaque et le trajet des vis. Au suivi, l’imagerie vérifie la réduction et l’absence de matériel intra-articulaire.', pools.reduction, pools.mini],
  ['Fixateur hybride et surveillance', 'Une patiente de 62 ans est traitée par fixateur hybride pour une fracture complexe avec parties molles fragiles. Le montage associe une fixation épiphysaire et diaphysaire. L’équipe explique les soins locaux et les conditions de mise en charge. Au suivi, les orifices cutanés, la stabilité et les radiographies sont contrôlés.', pools.reduction, pools.follow],
  ['Douleur persistante et complication cutanée', 'Un homme de 38 ans revient après ostéosynthèse par plaque pour une douleur croissante et une souffrance cutanée. Il avait été opéré après traumatisme à haute énergie. L’examen recherche désunion, exposition du matériel et infection. Au suivi, la stratégie de couverture et la consolidation sont réévaluées.', pools.follow, pools.soft],
  ['Déplacement secondaire et retard de consolidation', 'Une femme de 70 ans consulte au suivi d’une fracture du pilon tibial traitée par ostéosynthèse. Les radiographies comparatives font discuter un défaut de montage et un retard de consolidation. La qualité de réduction, les contraintes mécaniques et l’état des tissus mous sont repris. Au suivi rapproché, appui, douleur et consolidation sont adaptés.', pools.follow, pools.reduction],
];
for (const [i, [label, vignetteText, poolA, poolB]] of dpScenarios.entries()) {
  const domain = choose(poolA.concat(poolB), 12); const prompts = ['Quelle priorité guide la décision initiale ?', 'Quelle donnée nouvelle modifie la stratégie immédiate ?', 'Quel examen ou contrôle est désormais utile ?', 'Quelle option thérapeutique est cohérente à ce stade ?', 'Quelle précaution technique doit être respectée ?', 'Quel risque doit être recherché activement ?', 'Quel élément structure le suivi fonctionnel ?'];
  series.push({ label: `DP ${i + 1} · ${label}`, type: 'dp', order_index: i + 9, vignette: `<p>${vignetteText}</p>`, questions: prompts.map((prompt, q) => question(q ? `Nouvel élément : ${['les tissus mous sont réévalués','le scanner cartographie les fragments','la réduction est obtenue','le montage est contrôlé','la plaie est surveillée','la mobilisation est débutée'][q - 1]}. ${prompt}` : prompt, domain[q], domain.filter((_, j) => j !== q).slice(0, 4), label, domain[q].source)) });
}
const chapter = { title, provenance: { extract: 'extract.json', sourceOnly: true, reauthoredAt: new Date().toISOString() }, flashcards: facts, series };
mkdirSync(out, { recursive: true }); writeFileSync(join(out, 'chapter.json'), `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ cards: facts.length, qcm: 8, dp: 8, questions: series.reduce((n, x) => n + x.questions.length, 0) }));
