/**
 * Découpage en lots et fusion — incident du 06/09/2026 : un sujet de 160 pages
 * analysé en une seule requête ne rendait que 30 pages d'exercices. Le
 * document est désormais traité par lots qui se recouvrent d'une page, puis
 * fusionné ; ces tests fixent les invariants du plan et de la fusion.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  planifierLots, paginerTexte, fusionnerLots, appliquerCorrections, cleExercice,
  correctionsSchema, outputSchema,
} from '../src/lib/ai/exercise-import-schema';
import type { ExerciseImportResult, ImportedQuestion } from '../src/lib/ai/exercise-import-schema';

const q = (over: Partial<ImportedQuestion>): ImportedQuestion => ({
  client_id: '', numero_source: null, source_pages: [1], format: 'qcm', enonce: 'Énoncé', images: [],
  items: [
    { lettre: 'A', enonce: 'a', is_correct: true, justification: '', images: [] },
    { lettre: 'B', enonce: 'b', is_correct: false, justification: '', images: [] },
  ],
  reponse_attendue: '', correction_generale: '', warnings: [], ...over,
});

test('le plan couvre toutes les pages, avec des cœurs disjoints et un recouvrement d’une page', () => {
  const lots = planifierLots(160, 8, 1);
  assert.equal(lots.length, 20);
  // Cœurs : contigus, disjoints, de 1 à 160.
  assert.equal(lots[0].coeurDebut, 1);
  assert.equal(lots.at(-1)!.coeurFin, 160);
  for (let i = 1; i < lots.length; i++) assert.equal(lots[i].coeurDebut, lots[i - 1].coeurFin + 1);
  // Pages envoyées : cœur élargi d'une page de chaque côté, borné au document.
  assert.deepEqual([lots[0].debut, lots[0].fin], [1, 9]);
  assert.deepEqual([lots[5].debut, lots[5].fin], [40, 49]);
  assert.deepEqual([lots.at(-1)!.debut, lots.at(-1)!.fin], [152, 160]);
  // Indices stables : une reprise retrouve le même plan.
  assert.deepEqual(planifierLots(160, 8, 1), lots);
});

test('un document plus court qu’un lot donne un seul lot ; un document vide, aucun', () => {
  assert.deepEqual(planifierLots(3), [{ index: 0, debut: 1, fin: 3, coeurDebut: 1, coeurFin: 3 }]);
  assert.deepEqual(planifierLots(0), []);
});

test('le texte est paginé à une frontière de paragraphe, sans perdre un caractère utile', () => {
  const paragraphes = Array.from({ length: 30 }, (_, i) => `Paragraphe ${i + 1} ${'x'.repeat(400)}`);
  const texte = paragraphes.join('\n\n');
  const pages = paginerTexte(texte, 3000);
  assert.ok(pages.length > 1);
  for (const p of pages) assert.ok(p.length <= 3000, `page trop longue : ${p.length}`);
  // Aucune coupure au milieu d'un paragraphe : chaque page commence par « Paragraphe ».
  for (const p of pages) assert.match(p, /^Paragraphe \d+/);
  assert.equal(pages.join('\n\n').replace(/\s+/g, ''), texte.replace(/\s+/g, ''));
});

test('la fusion garde l’ordre du document et dédoublonne un exercice vu par deux lots voisins', () => {
  const lotA: ExerciseImportResult = {
    questions: [q({ numero_source: '1', enonce: 'Première question', source_pages: [1] }), q({ numero_source: '2', enonce: 'Deuxième question à cheval', source_pages: [8, 9] })],
    warnings: ['tableau page 3 illisible'],
  };
  // Le lot suivant revoit la question 2 (page de recouvrement), avec une
  // proposition de plus : c'est la version la plus complète qui doit rester.
  const lotB: ExerciseImportResult = {
    questions: [
      q({ numero_source: '2', enonce: 'Deuxième question à cheval', source_pages: [8, 9], items: [
        { lettre: 'A', enonce: 'a', is_correct: true, justification: 'j', images: [] },
        { lettre: 'B', enonce: 'b', is_correct: false, justification: 'j', images: [] },
        { lettre: 'C', enonce: 'c', is_correct: false, justification: 'j', images: [] },
      ] }),
      q({ numero_source: '3', enonce: 'Troisième', source_pages: [10] }),
    ],
    warnings: [],
  };
  // Fourni dans le désordre : c'est `ordre` qui tranche.
  const fusion = fusionnerLots([{ ordre: 9, label: 'Pages 9-16', result: lotB }, { ordre: 1, label: 'Pages 1-8', result: lotA }]);
  assert.deepEqual(fusion.questions.map((x) => x.numero_source), ['1', '2', '3']);
  assert.equal(fusion.questions[1].items.length, 3, 'la version la plus complète du doublon est conservée');
  assert.ok(fusion.warnings.some((w) => w.startsWith('1 exercice(s) vu(s) dans deux lots')));
  assert.ok(fusion.warnings.includes('Pages 1-8 : tableau page 3 illisible'));
});

test('sans numéro imprimé, la clé de dédoublonnage repose sur le début de l’énoncé', () => {
  const a = cleExercice({ numero_source: null, enonce: 'Madame L., 79 ans, HTA, consulte pour une dyspnée aiguë brutale nocturne avec orthopnée.' });
  const b = cleExercice({ numero_source: null, enonce: 'Madame L., 79 ans, HTA, consulte pour une dyspnée aiguë brutale nocturne avec orthopnée…' });
  const c = cleExercice({ numero_source: null, enonce: 'Un homme de 67 ans consulte aux urgences pour une douleur thoracique gauche.' });
  assert.equal(a, b);
  assert.notEqual(a, c);
  // Deux exercices numérotés différemment ne fusionnent jamais, même énoncé proche.
  assert.notEqual(cleExercice({ numero_source: 'Q1', enonce: 'Concernant la rhinite' }), cleExercice({ numero_source: 'Q2', enonce: 'Concernant la rhinite' }));
});

test('un corrigé séparé est recollé par numéro : clés, justifications, corrigé général', () => {
  const sujet: ExerciseImportResult = {
    questions: [
      q({ numero_source: '12', items: [
        { lettre: 'A', enonce: 'a', is_correct: false, justification: '', images: [] },
        { lettre: 'B', enonce: 'b', is_correct: false, justification: '', images: [] },
        { lettre: 'C', enonce: 'c', is_correct: false, justification: '', images: [] },
      ] }),
      q({ numero_source: '13' }),
    ],
    warnings: [],
  };
  const fusion = appliquerCorrections(sujet, {
    corrections: [
      { numero_source: 'Q12', source_pages: [40], lettres_justes: ['a', 'C)'], justifications: [{ lettre: 'B', texte: 'faux car…' }], reponse_attendue: '', correction_generale: 'Corrigé 12' },
      { numero_source: '99', source_pages: [41], lettres_justes: ['A'], justifications: [], reponse_attendue: '', correction_generale: '' },
    ],
    warnings: ['numérotation manuscrite page 41'],
  });
  const q12 = fusion.questions[0];
  assert.deepEqual(q12.items.map((i) => i.is_correct), [true, false, true]);
  assert.equal(q12.items[1].justification, 'faux car…');
  assert.equal(q12.correction_generale, 'Corrigé 12');
  assert.ok(fusion.questions[1].warnings.some((w) => /Aucun corrigé/.test(w)), 'la question 13 est signalée sans corrigé');
  assert.ok(fusion.warnings.some((w) => /1 corrigé\(s\) sans exercice/.test(w)));
  assert.ok(fusion.warnings.includes('Corrigé : numérotation manuscrite page 41'));
});

test('le schéma des questions expose numero_source, requis et nullable', () => {
  const question = (outputSchema as unknown as { properties: { questions: { items: { required: string[]; properties: Record<string, { type: unknown }> } } } }).properties.questions.items;
  assert.ok(question.required.includes('numero_source'));
  assert.deepEqual(question.properties.numero_source.type, ['string', 'null']);
});

test('le schéma des corrections respecte les mêmes règles de forme (required exhaustif, additionalProperties false)', () => {
  type Noeud = { type?: unknown; properties?: Record<string, Noeud>; required?: string[]; additionalProperties?: unknown; items?: Noeud };
  const anomalies = (n: Noeud, chemin = '$'): string[] => {
    const out: string[] = [];
    if (n.type === 'object' || n.properties) {
      if (n.additionalProperties !== false) out.push(`${chemin} : additionalProperties`);
      const props = Object.keys(n.properties ?? {});
      const req = n.required ?? [];
      for (const k of props) if (!req.includes(k)) out.push(`${chemin}.${k} absent de required`);
      for (const [k, v] of Object.entries(n.properties ?? {})) out.push(...anomalies(v, `${chemin}.${k}`));
    }
    if (n.items) out.push(...anomalies(n.items, `${chemin}[]`));
    return out;
  };
  assert.deepEqual(anomalies(correctionsSchema as unknown as Noeud), []);
});
