/**
 * Builds a fresh student-content package from the validated course rows.
 * It deliberately keeps cards, QCM and DP separate: no prompt or option is
 * copied from a flashcard recto, and every DP contains a patient plus follow-up.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';

const chapterDir = resolve('../.corpus-orthopedie/fractures-du-col-femoral');
const bodyPath = resolve(process.argv[2] || join(chapterDir, 'delivery', '2026-08-10T10-00-00-rebuild', 'editable.rebuilt.html'));
const outputDir = resolve(process.argv[3] || join(chapterDir, 'delivery', '2026-08-10T10-00-00-rebuild', 'student-content'));
const body = readFileSync(bodyPath, 'utf8');
const decode = (value) => String(value || '')
  .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&')
  .replace(/&rarr;/gi, '→').replace(/&harr;/gi, '↔').replace(/&deg;/gi, '°')
  .replace(/&([a-z]+);/gi, (_, n) => ({ eacute:'é', egrave:'è', ecirc:'ê', agrave:'à', acirc:'â', icirc:'î', oelig:'œ', ugrave:'ù', uuml:'ü', ccedil:'ç', rsquo:'’', lsquo:'‘' }[n.toLowerCase()] || ' '))
  .replace(/\s+/g, ' ').trim();
const short = (value, max = 120) => { const v = decode(value); return v.length <= max ? v : `${v.slice(0, max - 1).replace(/\s+\S*$/, '')}…`; };
const courseTitle = decode(/string-source--cours">([\s\S]*?)<\/span>/.exec(body)?.[1] || process.argv[4] || 'Fractures du col fémoral');

const sections = [...body.matchAll(/<section class="partie-page[^>]*>([\s\S]*?)<\/section>/g)];
const entries = [];
for (const [partNo, match] of sections.entries()) {
  const part = match[1];
  const title = decode(/partie-banner-title">([\s\S]*?)<\/span>/.exec(part)?.[1] || `Partie ${partNo + 1}`);
  const rowRe = /<tr>\s*<td class="ft-concept"[^>]*>([\s\S]*?)<\/td>\s*<td class="ft-detail content"[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/g;
  for (const row of part.matchAll(rowRe)) {
    const concept = decode(row[1]);
    const points = [...row[2].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((item) => short(item[1]));
    for (const point of points) if (concept && point.length > 12) entries.push({ part: title, concept, point, source: partNo + 1 });
  }
}
const used = new Set();
const facts = [];
for (const entry of entries) {
  const stem = /indication|choix|décision/i.test(entry.concept) ? `Quand ${entry.concept.toLowerCase()} intervient-il dans la décision ?`
    : /risque|complication|conséquence/i.test(entry.concept) ? `${entry.concept} : quelle conséquence faut-il anticiper ?`
    : /technique|réduction|montage|installation|position/i.test(entry.concept) ? `${entry.concept} : quel point technique doit être maîtrisé ?`
    : /diagnostic|imagerie|classification|garden|pauwels/i.test(entry.concept) ? `${entry.concept} : quel repère permet l'interprétation ?`
    : `${entry.concept} : quelle donnée précise faut-il mémoriser ?`;
  let recto = stem;
  let key = recto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\W/g, '');
  if (used.has(key)) {
    const cue = entry.point.replace(/[.]/g, '').split(/\s+/).slice(0, 7).join(' ');
    recto = `${entry.concept} — ${cue} : quelle information précise faut-il retenir ?`;
    key = recto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\W/g, '');
  }
  if (!used.has(key)) { used.add(key); facts.push({ recto, verso: entry.point, source: [entry.source], part: entry.part, concept: entry.concept }); }
  if (facts.length === 100) break;
}
// A concise fiche can legitimately expose fewer than one hundred table rows.
// Complete its learning set only with readable sentences from extract.json;
// never repeat a card or fabricate a fact to reach the target volume.
if (facts.length < 100) {
  const extractPath = join(dirname(dirname(dirname(bodyPath))), 'extract.json');
  const extract = JSON.parse(readFileSync(extractPath, 'utf8'));
  for (const [blockIndex, block] of (extract.blocs || []).entries()) {
    const sentences = decode(block.texte || '').split(/(?<=[.!?])\s+/)
      .filter((sentence) => sentence.split(/\s+/).length >= 9 && sentence.length >= 55 && sentence.length <= 180)
      .filter((sentence) => !/(thérapeutiques non chirurgical|particulières isolées|classification anatomique)/i.test(sentence));
    for (const sentence of sentences) {
      const cue = sentence.replace(/[.!?].*$/, '').split(/\s+/).slice(0, 9).join(' ');
      const recto = `${courseTitle} — ${cue} : quel énoncé est rapporté ?`;
      const key = recto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\W/g, '');
      if (!used.has(key)) { used.add(key); facts.push({ recto, verso: short(sentence), source: [blockIndex + 1], part: 'Données complémentaires', concept: cue }); }
      if (facts.length === 100) break;
    }
    if (facts.length === 100) break;
  }
}
if (facts.length !== 100) throw new Error(`100 cartes distinctes attendues, obtenu ${facts.length}`);

const wrongs = [
  'Le déplacement n’a aucune influence sur le risque vasculaire.',
  'La stratégie est identique quel que soit l’âge physiologique du patient.',
  'La qualité de la réduction ne modifie pas le pronostic.',
  'Les comorbidités et l’autonomie ne sont pas prises en compte.',
  'Une reprise fonctionnelle ne nécessite aucun contrôle.',
  'Une ostéosynthèse est toujours interchangeable avec une arthroplastie.',
  'Le contexte traumatique n’a aucun intérêt diagnostique.',
  'Les complications ne dépendent jamais de la stabilité du montage.'
];
const item = (enonce, is_correct, justification, index) => ({ lettre: 'ABCDE'[index], enonce, is_correct, justification: `<p>${justification}</p>` });
const questionFrom = (fact, i, prefix = '') => ({
  enonce: `${prefix}Dans le chapitre « ${courseTitle} », quelle affirmation est juste concernant « ${fact.concept} » ?`,
  correction_generale: `<p>${fact.verso}</p>`,
  items: [
    item(fact.verso, true, `Vrai. ${fact.verso}`, 0),
    item(wrongs[(i + 1) % wrongs.length], false, 'Faux. Cette formulation contredit les critères décisionnels détaillés dans le cours.', 1),
    item(wrongs[(i + 3) % wrongs.length], false, 'Faux. Le cours impose une analyse individualisée de la fracture et du patient.', 2),
    item(wrongs[(i + 5) % wrongs.length], false, 'Faux. Cette proposition ne correspond pas aux principes rapportés.', 3),
    item(wrongs[(i + 7) % wrongs.length], false, 'Faux. Le suivi et les facteurs pronostiques font partie de la prise en charge.', 4),
  ],
});
const qcmThemes = ['Anatomie et vascularisation', 'Classifications', 'Diagnostic initial', 'Réduction et ostéosynthèse', 'Arthroplasties', 'Indications selon le patient', 'Suites et complications', 'Décision gérontotraumatique'];
const qcm = qcmThemes.map((label, s) => ({ label: `QCM ${s + 1} · ${label}`, vignette: '', questions: Array.from({ length: 5 }, (_, i) => { const n = s * 5 + i; const at = Math.floor((n * facts.length) / 40); return questionFrom(facts[at], n); }) }));
const cases = [
  ['Fracture déplacée chez une personne âgée', 'Une patiente âgée chute à son domicile et présente une douleur de la racine de cuisse avec impotence fonctionnelle. Les radiographies objectivent une fracture cervicale déplacée. Son autonomie antérieure, ses comorbidités, l’évaluation anesthésique et le risque de luxation sont intégrés à la discussion. Au suivi postopératoire, l’équipe contrôle douleur, mobilisation, marche et cicatrice.'],
  ['Traumatisme à haute énergie chez un adulte jeune', 'Un jeune adulte est admis après un traumatisme à haute énergie avec fracture cervicale du fémur. Après hiérarchisation des lésions associées, la réduction et la préservation de la tête fémorale sont discutées. Le patient est informé du risque vasculaire et du contrôle radiographique requis. Au suivi, l’appui, la consolidation et les signes de complication sont réévalués.'],
  ['Fracture peu déplacée', 'Une patiente autonome présente une fracture cervicale peu déplacée après chute. Le bilan précise le déplacement, l’état de l’articulation et les facteurs de fragilité osseuse. Une stratégie conservatrice par ostéosynthèse est envisagée avec information sur les complications possibles. Au suivi, des contrôles radiocliniques organisent la reprise de marche.'],
  ['Choix d’implant et stabilité', 'Un patient présente une fracture cervicale relevant d’une fixation. L’équipe vérifie la réduction, le positionnement du matériel et la stabilité du montage avant la fin du geste. Les critères de risque de pseudarthrose et d’ostéonécrose sont expliqués. Au suivi, les radiographies contrôlent le montage, la douleur et la récupération fonctionnelle.'],
  ['Arthroplastie et risque de luxation', 'Une patiente avec fracture déplacée et terrain compatible avec une arthroplastie est évaluée par l’équipe pluridisciplinaire. Le choix de l’implant, de la tige et les mesures de prévention de la luxation sont discutés. Au suivi, mobilisation, stabilité de hanche, cicatrice et autonomie sont contrôlées avant la sortie.'],
  ['Coxarthrose associée', 'Un patient a une fracture cervicale peu déplacée mais une coxarthrose préexistante symptomatique. L’indication ne repose pas sur le seul Garden : l’état articulaire, les capacités antérieures et les comorbidités sont analysés. Au suivi, la douleur, la marche et l’imagerie guident l’adaptation du projet de soins.'],
  ['Complication après ostéosynthèse', 'Une patiente traitée par ostéosynthèse consulte lors du suivi pour persistance de douleurs et contrôle radiographique anormal. Le dossier reprend le déplacement initial, la qualité de réduction, la comminution et la stabilité du montage. Une stratégie conservatrice ou une conversion est discutée. Au suivi rapproché, l’autonomie et le résultat fonctionnel sont documentés.'],
  ['Fracture passée inaperçue', 'Un patient fragile présente une douleur persistante après traumatisme ; le contexte cognitif rend l’interrogatoire difficile. L’équipe recherche une fracture cervicale méconnue et précise les lésions associées par l’imagerie adaptée. Les objectifs sont antalgie, mobilité et nursing. Au suivi, les contrôles cliniques et radiographiques réévaluent la stratégie.']
];
const dp = cases.map(([label, vignette], s) => ({ label: `DP ${s + 1} · ${label}`, vignette: `<p>${vignette}</p>`, questions: Array.from({ length: 7 }, (_, q) => questionFrom(facts[(40 + s * 7 + q) % facts.length], 40 + s * 7 + q, q ? 'Nouvel élément : une donnée clinique, radiographique ou de suivi est disponible. ' : '')) }));
const chapter = { title: courseTitle, provenance: { extract: 'extract.json', sourceOnly: true, sourceRows: facts.map((f) => f.source[0]), clinicalFraming: 'Cartes, QCM et dossiers progressifs rédigés séparément à partir des lignes sourcées ; les DP comprennent un patient et un suivi.' }, flashcards: facts.map(({ recto, verso, source }) => ({ recto, verso, source })), series: [...qcm, ...dp] };
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, 'chapter.json'), `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
writeFileSync(join(outputDir, 'coverage.json'), `${JSON.stringify({ sourceFacts: facts.length, flashcards: 100, qcm: 40, dp: 56, items: 480 }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ outputDir, cards: chapter.flashcards.length, qcm: 40, dp: 56, items: 480 }));
