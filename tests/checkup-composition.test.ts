/**
 * Recette EVC Check-up — barème (§8–§10, §14, §15, §18), restitution (§21,
 * C§21), composition sous contraintes et sources (§4–§7, §12, §13, §38–§40 ;
 * C§3, C§8–§20, C§26, C§27).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregate, blockScores, formatSubscore, scoreQcm, scoreQroc } from '../src/lib/checkup/scoring';
import { buildUnits, composeExterne, composeInterne, computeGauge, deriveFamily, type Exposure, type PoolCours, type PoolQuestion, type PoolSerie } from '../src/lib/checkup/composition';
import { analyze, dueTimerAlerts, shouldRecommendCheckup, synthesis } from '../src/lib/checkup/results';
import { DEFAULT_CHECKUP_CONFIG as C, type CheckupFormat, type CheckupMode } from '../src/lib/checkup/types';

/* ─── Barème ─── */
const items = (correct: string[]) => ['A', 'B', 'C', 'D', 'E'].map((l) => ({ lettre: l, is_correct: correct.includes(l) }));

test('QRU : correcte = 1 ; incorrecte ou non répondue = 0 ; maximum 1 point', () => {
  assert.equal(scoreQcm('QRU', items(['B']), ['B'], C).points, 1);
  assert.equal(scoreQcm('QRU', items(['B']), ['A'], C).points, 0);
  assert.equal(scoreQcm('QRU', items(['B']), ['A', 'B'], C).points, 0);
  assert.equal(scoreQcm('QRU', items(['B']), [], C).points, 0);
});

test('QRM — discordance EVC Arena : 0 → 1 ; 1 → 0,5 ; 2 → 0,2 ; ≥3 → 0 ; non répondue → 0', () => {
  const it = items(['A', 'C']);
  assert.equal(scoreQcm('QRM', it, ['A', 'C'], C).points, 1);
  assert.equal(scoreQcm('QRM', it, ['A'], C).points, 0.5, 'bonne proposition oubliée');
  assert.equal(scoreQcm('QRM', it, ['A', 'C', 'D'], C).points, 0.5, 'mauvaise proposition cochée');
  assert.equal(scoreQcm('QRM', it, ['A', 'D'], C).points, 0.2);
  assert.equal(scoreQcm('QRM', it, ['B', 'D', 'E'], C).points, 0);
  const empty = scoreQcm('QRM', items(['A']), [], C);
  assert.equal(empty.points, 0, 'une QRM vide ne vaut jamais 0,5');
  assert.equal(empty.answered, false);
  assert.equal(scoreQcm('QRM', it, ['A'], C).result, 'partial');
  assert.equal(scoreQcm('QRM', it, ['A', 'D'], C).result, 'incorrect');
});

test('QROC : vide = 0 automatique ; rédigée sans auto-correction = jamais 0 (en attente) ; correcte/partielle/incorrecte = 1/0,5/0', () => {
  assert.deepEqual(scoreQroc('   ', null)?.points, 0);
  assert.equal(scoreQroc('   ', null)?.origin, 'vide');
  assert.equal(scoreQroc('Embolie pulmonaire', null), null);
  assert.equal(scoreQroc('x', 'correct')?.points, 1);
  assert.equal(scoreQroc('x', 'partial')?.points, 0.5);
  assert.equal(scoreQroc('x', 'incorrect')?.points, 0);
  assert.equal(scoreQroc('x', 'partial')?.origin, 'auto_evaluee');
});

test('Score = points / possibles × 100 ; en attente d’auto-correction : pas de score définitif', () => {
  const a = aggregate([{ type: 'QRM', points: 1, block: 0, dossierId: null }, { type: 'QRM', points: 0.5, block: 0, dossierId: null }, { type: 'QROC', points: null, block: 0, dossierId: null }]);
  assert.equal(a.pending, 1);
  assert.equal(a.possible, 3);
  const b = aggregate([{ type: 'QRM', points: 1, block: 0, dossierId: null }, { type: 'QRM', points: 0, block: 0, dossierId: null }]);
  assert.equal(b.percent, 50);
});

test('Voie externe : score de dossier = points / questions ; global = total / total (jamais la moyenne des dossiers)', () => {
  const qs = [
    ...Array.from({ length: 2 }, () => ({ type: 'QROC' as const, points: 1, block: 1, dossierId: 'a' })),
    ...Array.from({ length: 8 }, () => ({ type: 'QROC' as const, points: 0, block: 2, dossierId: 'b' })),
  ];
  const blocks = blockScores(qs);
  assert.equal(blocks[0].percent, 100);
  assert.equal(blocks[1].percent, 0);
  assert.equal(aggregate(qs).percent, 20, 'et non 50 %');
});

test('Sous-scores : ≥ 5 questions → « 70 % (7/10) » ; < 5 → fraction seule', () => {
  assert.equal(formatSubscore(7, 10), '70 % (7/10)');
  assert.equal(formatSubscore(1, 2), '1/2');
  assert.equal(formatSubscore(2.5, 4), '2,5/4');
});

test('Chronomètre : alertes à 30, 10 et 5 min (60 min) ; 60, 30, 10 et 5 (120 min), une seule fois chacune', () => {
  assert.deepEqual(dueTimerAlerts(29 * 60, C.alerts_60, []), [30]);
  assert.deepEqual(dueTimerAlerts(9 * 60, C.alerts_60, [30]), [10]);
  assert.deepEqual(dueTimerAlerts(59 * 60, C.alerts_120, []), [60]);
  assert.deepEqual(dueTimerAlerts(4 * 60, C.alerts_120, [60, 30, 10]), [5]);
});

/* ─── Banque synthétique ─── */
type Bank = { questions: PoolQuestion[]; series: Map<string, PoolSerie>; cours: Map<string, PoolCours>; parentOf: Map<string, string | null> };
let uid = 0;
const id = () => `00000000-0000-4000-8000-${String(++uid).padStart(12, '0')}`;

function bank(opts: {
  categories?: string[]; itemsPerCategory?: number; isolatedPerItem?: number; dpPerItem?: number; dpSize?: number; qroc?: boolean;
  des?: number; transversal?: number; annaleYears?: number[]; annaleSize?: number; annaleQroc?: boolean; noCategory?: boolean;
}): Bank {
  const b: Bank = { questions: [], series: new Map(), cours: new Map(), parentOf: new Map([['spe', null]]) };
  const cats = opts.noCategory ? ['spe'] : (opts.categories ?? ['cat1', 'cat2', 'cat3']);
  for (const c of cats) if (c !== 'spe') b.parentOf.set(c, 'spe');
  const fmt = opts.qroc ? 'qroc' : 'qcm';
  const addSerie = (coursId: string, label: string, n: number, extra: Partial<PoolSerie> = {}, qFormat = fmt) => {
    const sid = id();
    b.series.set(sid, { id: sid, coursId, label, type: 'qcm', kind: qFormat === 'qroc' ? 'qroc' : 'qcm', annee: null, hasVignette: false, nQuestions: n, readable: true, meta: {}, ...extra });
    for (let i = 0; i < n; i++) {
      const qid = id();
      b.questions.push({ id: qid, serieId: sid, order: i, format: qFormat as 'qcm' | 'qroc', nItems: qFormat === 'qroc' ? 0 : 5, nCorrect: qFormat === 'qroc' ? 0 : 2, qruHint: false, hasModel: true, canonicalId: qid, meta: {} });
    }
    return sid;
  };
  cats.forEach((cat, ci) => {
    for (let k = 0; k < (opts.itemsPerCategory ?? 4); k++) {
      const cid = id();
      b.cours.set(cid, { id: cid, titre: `Item ${ci}-${k}`, matiereId: cat, importance: k % 2 === 0 ? 5 : 0 });
      if (opts.isolatedPerItem) addSerie(cid, `QCM — Série ${k}`, opts.isolatedPerItem);
      for (let d = 0; d < (opts.dpPerItem ?? 0); d++) addSerie(cid, `DP ${d}`, opts.dpSize ?? 7, { hasVignette: true, kind: opts.qroc ? 'qroc' : 'dp' });
    }
  });
  if (opts.des) {
    const cid = id(); b.cours.set(cid, { id: cid, titre: 'Annales DESC', matiereId: 'spe', importance: 0 });
    addSerie(cid, 'Annales - Spé - 2019 - DESC', opts.des, { annee: 2019 });
  }
  if (opts.transversal) {
    const cid = id(); b.cours.set(cid, { id: cid, titre: 'Replays - Révisions', matiereId: 'spe', importance: 0 });
    addSerie(cid, 'QCM — Série 1', opts.transversal);
  }
  if (opts.annaleYears) {
    const cid = id(); b.cours.set(cid, { id: cid, titre: 'Annales - Spé', matiereId: 'spe', importance: 0 });
    for (const y of opts.annaleYears) {
      addSerie(cid, `Annales - Spé - ${y} - EVCF`, opts.annaleSize ?? 20, { annee: y }, opts.annaleQroc ? 'qroc' : 'qcm');
      if (opts.annaleQroc) addSerie(cid, `Annales - Spé - ${y} - EVCP - Dossier 1`, 6, { annee: y, hasVignette: true }, 'qroc');
    }
  }
  return b;
}

function units(b: Bank, format: CheckupFormat, mode: CheckupMode = 'global', sel: { categoryIds?: string[]; itemIds?: string[] } = {}, exposures = new Map<string, Exposure>()) {
  return buildUnits({
    questions: b.questions, series: b.series, cours: b.cours, parentOf: b.parentOf, exposures, nowSec: Date.parse('2026-10-05T10:00:00Z') / 1000,
    config: C, format, scope: { specialiteId: 'spe', mode, categoryIds: sel.categoryIds ?? [], itemIds: sel.itemIds ?? [] },
  });
}

test('Familles : annales, DES, transversal, banque structurée', () => {
  assert.equal(deriveFamily({ label: 'Annales - Ortho - 2019 - DESC' }, { titre: 'Annales DESC' }), 'des_bank');
  assert.equal(deriveFamily({ label: 'Annales - Pédiatrie - 2024 - EVCF' }, { titre: 'Annales - Pédiatrie' }), 'evc_annale');
  assert.equal(deriveFamily({ label: 'Entraînement transversal — AREA Session 3' }, { titre: 'Replays - Révisions' }), 'transversal_bank');
  assert.equal(deriveFamily({ label: 'QCM — Série 2' }, { titre: 'Embolie pulmonaire' }), 'structured_item');
});

test('Voie interne : 40 questions ; DP jamais coupés ; un même canonical_question_id jamais deux fois', () => {
  const b = bank({ isolatedPerItem: 5, dpPerItem: 1, dpSize: 7 });
  // Deux copies de la même question (même identifiant canonique).
  const first = b.questions[0];
  const copyOf = b.questions[1];
  copyOf.canonicalId = first.canonicalId;
  const { units: us } = units(b, 'interne_40_60');
  const r = composeInterne(us, C, 'seed-1');
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.questions.length, 40);
  const canon = r.questions.map((q) => q.canonicalId);
  assert.equal(new Set(canon).size, canon.length);
  // Chaque dossier présent l'est en entier, dans l'ordre et d'un seul tenant.
  const byDossier = new Map<string, number[]>();
  r.questions.forEach((q, i) => { if (q.dossierId) byDossier.set(q.dossierId, [...(byDossier.get(q.dossierId) ?? []), i]); });
  for (const [, idx] of byDossier) {
    assert.equal(idx.length, 7);
    assert.equal(idx[idx.length - 1] - idx[0], 6, 'contigu');
  }
});

test('Diversité : toutes les catégories couvertes ; pas deux questions du même item tant que d’autres sont disponibles', () => {
  const b = bank({ categories: ['c1', 'c2', 'c3', 'c4'], itemsPerCategory: 12, isolatedPerItem: 5 });
  const r = composeInterne(units(b, 'interne_40_60').units, C, 'seed-2');
  assert.ok(r.ok && r.questions.length === 40);
  if (!r.ok) return;
  const cats = new Set(r.questions.map((q) => q.categoryId));
  assert.equal(cats.size, 4);
  const perItem = new Map<string, number>();
  for (const q of r.questions) perItem.set(q.itemId!, (perItem.get(q.itemId!) ?? 0) + 1);
  assert.ok(Math.max(...perItem.values()) === 1, '48 items disponibles : un seul passage par item');
  const starred = r.questions.filter((q) => q.importance > 0).length;
  assert.ok(starred > 10 && starred < 35, `items étoilés et non étoilés mélangés (${starred}/40)`);
});

test('Sources vides : aucune banque DES/transversale/annale → 100 % structuré (test obligatoire 1)', () => {
  const b = bank({ isolatedPerItem: 5 });
  const r = composeInterne(units(b, 'interne_40_60').units, C, 'seed-3');
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.questions.filter((q) => q.family === 'structured_item').length, 40);
});

test('DES + transversal cumulés ≤ 8/40 en régime normal ; transversal vide → aucune place réservée (tests 2 et 3)', () => {
  const b = bank({ isolatedPerItem: 5, des: 50, transversal: 60 });
  const r = composeInterne(units(b, 'interne_40_60').units, C, 'seed-4');
  assert.ok(r.ok);
  if (!r.ok) return;
  const dt = r.questions.filter((q) => q.family === 'des_bank' || q.family === 'transversal_bank').length;
  assert.ok(dt >= 1 && dt <= 8, `${dt} questions DES/transversales`);
  const onlyDes = bank({ isolatedPerItem: 5, des: 50 });
  const r2 = composeInterne(units(onlyDes, 'interne_40_60').units, C, 'seed-5');
  assert.ok(r2.ok && r2.questions.every((q) => q.family !== 'transversal_bank'));
});

test('Annales QCM : une seule année → au plus 2/40 ; plusieurs années → au plus 4/40', () => {
  const one = composeInterne(units(bank({ isolatedPerItem: 5, annaleYears: [2025], annaleSize: 40 }), 'interne_40_60').units, C, 'seed-6');
  assert.ok(one.ok);
  if (one.ok) {
    const n = one.questions.filter((q) => q.family === 'evc_annale').length;
    assert.ok(n >= 1 && n <= 2, `${n} annale(s)`);
  }
  const many = composeInterne(units(bank({ isolatedPerItem: 5, annaleYears: [2023, 2024, 2025], annaleSize: 30 }), 'interne_40_60').units, C, 'seed-7');
  assert.ok(many.ok);
  if (many.ok) assert.ok(many.questions.filter((q) => q.family === 'evc_annale').length <= 4);
});

test('Repli : banque structurée insuffisante → les plafonds peuvent être dépassés, et la jauge le compte', () => {
  const b = bank({ categories: ['c1'], itemsPerCategory: 2, isolatedPerItem: 10, des: 50 });
  const u = units(b, 'interne_40_60').units;
  const g = computeGauge(u, 'interne_40_60', C);
  assert.equal(g.eligible, 70);
  assert.equal(g.ok, true);
  assert.equal(g.fallbackNotice, true);
  const r = composeInterne(u, C, 'seed-8');
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.questions.length, 40);
    assert.ok(r.questions.filter((q) => q.family === 'des_bank').length > 8);
    assert.equal(r.summary.fallbackUsed, true);
  }
});

test('Une banque qui existe mais sans format compatible avec la voie est traitée comme vide (test 4) ; les sources vides ne réduisent pas la jauge (test 5)', () => {
  const b = bank({ isolatedPerItem: 5, annaleYears: [2024], annaleQroc: true });
  const g = computeGauge(units(b, 'interne_40_60').units, 'interne_40_60', C);
  assert.equal(g.byFamily.evc_annale, 0);
  assert.equal(g.eligible, 60);
});

test('Contrôle de banque : blocage selon le total éligible (déjà vues comprises), inédites affichées à part', () => {
  const b = bank({ categories: ['c1'], itemsPerCategory: 3, isolatedPerItem: 10 });
  const seen = new Map<string, Exposure>(b.questions.slice(0, 20).map((q) => [q.canonicalId, { last: Date.parse('2026-09-30T00:00:00Z') / 1000, checkup: null }]));
  const g = computeGauge(units(b, 'interne_40_60', 'global', {}, seen).units, 'interne_40_60', C);
  assert.equal(g.eligible, 30);
  assert.equal(g.unseen, 10);
  assert.equal(g.ok, false, '30 < 40 : blocage, aucun élargissement silencieux');
  assert.equal(composeInterne(units(b, 'interne_40_60').units, C, 's').ok, false);
});

test('Anti-répétition : jamais vues d’abord ; les questions récentes seulement si nécessaire', () => {
  const b = bank({ categories: ['c1', 'c2'], itemsPerCategory: 6, isolatedPerItem: 5 });
  const now = Date.parse('2026-10-05T10:00:00Z') / 1000;
  const recent = new Map<string, Exposure>(b.questions.slice(0, 15).map((q) => [q.canonicalId, { last: now - 2 * 86_400, checkup: now - 2 * 86_400 }]));
  const r = composeInterne(units(b, 'interne_40_60', 'global', {}, recent).units, C, 'seed-9');
  assert.ok(r.ok);
  if (r.ok) assert.equal(r.questions.filter((q) => q.freshness === 3).length, 0, '45 non récentes disponibles pour 40 places');
});

test('Check-up ciblé par items : seuls les contenus de ces items ; DES/annales sans item exclus ; aucun élargissement', () => {
  const b = bank({ isolatedPerItem: 5, des: 50, annaleYears: [2025] });
  const ids = Array.from(b.cours.values()).filter((c) => c.titre.startsWith('Item')).slice(0, 9).map((c) => c.id);
  const u = units(b, 'interne_40_60', 'items', { itemIds: ids }).units;
  assert.ok(u.every((x) => x.itemIds.every((i) => ids.includes(i)) && x.itemIds.length > 0));
  assert.equal(u.filter((x) => x.family !== 'structured_item').length, 0);
});

test('Check-up ciblé par catégorie : une question est éligible si son item appartient à la catégorie (sans category_id propre)', () => {
  const b = bank({ categories: ['c1', 'c2'], isolatedPerItem: 5 });
  const u = units(b, 'interne_40_60', 'categories', { categoryIds: ['c1'] }).units;
  assert.ok(u.length > 0 && u.every((x) => x.categoryId === 'c1'));
});

test('Une question avec item_id mais sans category_id est retrouvée via la catégorie de son item ; un contenu sans item n’est pas dans un ciblé', () => {
  const b = bank({ categories: ['c1'], isolatedPerItem: 2, des: 10 });
  const item = Array.from(b.cours.values()).find((c) => c.titre.startsWith('Item'))!;
  const desQ = b.questions.find((q) => b.series.get(q.serieId)!.label!.includes('DESC'))!;
  desQ.meta = { itemId: item.id };
  const u = units(b, 'interne_40_60', 'categories', { categoryIds: ['c1'] }).units;
  assert.ok(u.some((x) => x.questions.some((q) => q.id === desQ.id)));
  assert.equal(u.filter((x) => x.family === 'des_bank').length, 1);
});

test('Voie externe : 3 blocs / 60 min et 5 blocs / 120 min ; dossier trop long jamais coupé (non éligible)', () => {
  const b = bank({ qroc: true, dpPerItem: 1, dpSize: 7, isolatedPerItem: 5, itemsPerCategory: 3 });
  const tooLong = bank({ qroc: true, dpPerItem: 1, dpSize: 30, itemsPerCategory: 2, categories: ['c1'] });
  const r3 = composeExterne(units(b, 'externe_3_60').units, 'externe_3_60', C, 'e1');
  assert.ok(r3.ok && r3.blocks === 3);
  const r5 = composeExterne(units(b, 'externe_5_120').units, 'externe_5_120', C, 'e2');
  assert.ok(r5.ok && r5.blocks === 5);
  const longUnits = units(tooLong, 'externe_3_60');
  assert.equal(longUnits.units.length, 0);
  assert.ok(longUnits.excludedDossiers > 0);
  assert.equal(computeGauge(longUnits.units, 'externe_3_60', C).ok, false);
});

test('Voie externe : au plus 1 bloc d’annale (60 min), 2 (120 min) ; aucune annale → 100 % autres banques', () => {
  const b = bank({ qroc: true, dpPerItem: 1, dpSize: 7, itemsPerCategory: 3, annaleYears: [2021, 2022, 2023], annaleQroc: true });
  for (let i = 0; i < 10; i++) {
    const r = composeExterne(units(b, 'externe_3_60').units, 'externe_3_60', C, `a${i}`);
    assert.ok(r.ok);
    if (r.ok) assert.ok(new Set(r.questions.filter((q) => q.family === 'evc_annale').map((q) => q.block)).size <= 1);
    const r5 = composeExterne(units(b, 'externe_5_120').units, 'externe_5_120', C, `b${i}`);
    assert.ok(r5.ok);
    if (r5.ok) assert.ok(new Set(r5.questions.filter((q) => q.family === 'evc_annale').map((q) => q.block)).size <= 2);
  }
  const none = composeExterne(units(bank({ qroc: true, dpPerItem: 1, dpSize: 7, itemsPerCategory: 3 }), 'externe_3_60').units, 'externe_3_60', C, 'n');
  assert.ok(none.ok && none.questions.every((q) => q.family !== 'evc_annale'));
});

test('Restitution : items à revoir / à consolider / signaux positifs ; sous-scores par domaine ; synthèse sans « échec »', () => {
  const qs = [
    { position: 1, block: 0, itemId: 'i1', itemName: 'BPCO', categoryId: 'c1', categoryName: 'Pneumologie', family: 'structured_item' as const, points: 0, result: 'incorrect' as const, origin: 'auto' as const },
    { position: 2, block: 0, itemId: 'i2', itemName: 'Asthme', categoryId: 'c1', categoryName: 'Pneumologie', family: 'structured_item' as const, points: 0.5, result: 'partial' as const, origin: 'auto' as const },
    { position: 3, block: 0, itemId: 'i3', itemName: 'HTA', categoryId: 'c2', categoryName: 'Cardiologie', family: 'structured_item' as const, points: 1, result: 'correct' as const, origin: 'auto' as const },
    { position: 4, block: 0, itemId: null, itemName: null, categoryId: null, categoryName: null, family: 'des_bank' as const, points: 1, result: 'correct' as const, origin: 'auto' as const },
  ];
  const a = analyze(qs, { externe: false });
  assert.equal(a.percent, 62.5);
  assert.deepEqual(a.aRevoir.map((i) => i.itemName), ['BPCO']);
  assert.deepEqual(a.aConsolider.map((i) => i.itemName), ['Asthme']);
  assert.deepEqual(a.positifs.map((i) => i.itemName), ['HTA']);
  assert.equal(a.withoutItem, 1, 'contenu sans item : dans le score, aucun diagnostic d’item');
  assert.equal(a.byDomain.find((d) => d.key === 'c1')?.display, '0,5/2');
  assert.equal(/[ée]chec/i.test(synthesis(a)), false);
});

test('Recommandation de Check-up : 20 nouveaux items travaillés OU 21 jours, jamais de lancement automatique', () => {
  const base = { now: '2026-10-05T10:00:00Z', newItemsThreshold: 20, daysThreshold: 21 };
  assert.equal(shouldRecommendCheckup({ ...base, lastCheckupAt: '2026-10-01T10:00:00Z', newItemsWorkedSince: 20 }).recommend, true);
  assert.equal(shouldRecommendCheckup({ ...base, lastCheckupAt: '2026-09-10T10:00:00Z', newItemsWorkedSince: 3 }).recommend, true);
  assert.equal(shouldRecommendCheckup({ ...base, lastCheckupAt: '2026-10-01T10:00:00Z', newItemsWorkedSince: 3 }).recommend, false);
});
