/**
 * Assessment Engine (§13, §14) — partie PURE : sélection des questions d'une
 * évaluation courte et correction.
 *
 *  - QCM : corrigé automatiquement (ensemble exact des bonnes réponses = 1,
 *    aucune mauvaise cochée et au moins la moitié des bonnes = 0,5, sinon 0) ;
 *  - question rédactionnelle (QROC) : le candidat lit la réponse attendue et
 *    s'auto-corrige (juste = 1, partiel = 0,5, faux = 0) — mesure moins fiable,
 *    la confiance de la source le reflète.
 */
export type EvalQuestion = {
  id: string;
  enonce: string;
  format: 'qcm' | 'qroc';
  items: { lettre: string; enonce: string; is_correct: boolean; justification: string }[];
  reponse_attendue: string | null;
  correction_generale: string | null;
  serie_label: string;
};

export type EvalAnswer =
  | { kind: 'qcm'; selected: string[] }
  | { kind: 'qroc'; text: string; self: 'juste' | 'partiel' | 'faux' };

/**
 * Tire `n` questions parmi le vivier, en écartant celles déjà utilisées pour
 * mesurer ce candidat, réparties sur les séries. Déterministe pour une graine
 * donnée (identifiant de l'évaluation) : rejouable, testable.
 */
export function pickQuestions<T extends { id: string; serie_label: string }>(pool: T[], used: Set<string>, n: number, seed: string): T[] {
  const fresh = pool.filter((q) => !used.has(q.id));
  const source = fresh.length >= Math.min(n, 3) ? fresh : pool; // vivier épuisé : on réutilise
  const rnd = mulberry32(hashSeed(seed));
  const shuffled = [...source].sort(() => rnd() - 0.5);
  // Alterner les séries pour couvrir l'item largement.
  const bySerie = new Map<string, T[]>();
  for (const q of shuffled) bySerie.set(q.serie_label, [...(bySerie.get(q.serie_label) ?? []), q]);
  const lists = Array.from(bySerie.values());
  const out: T[] = [];
  let i = 0;
  while (out.length < n && lists.some((l) => l.length > 0)) {
    const l = lists[i % lists.length];
    if (l.length > 0) out.push(l.shift()!);
    i++;
  }
  return out;
}

export function scoreQuestion(q: EvalQuestion, a: EvalAnswer | undefined): number {
  if (!a) return 0;
  if (q.format === 'qcm' && a.kind === 'qcm') {
    const correct = new Set(q.items.filter((i) => i.is_correct).map((i) => i.lettre));
    const selected = new Set(a.selected);
    if (selected.size === 0) return 0;
    const wrong = [...selected].some((l) => !correct.has(l));
    if (wrong) return 0;
    const hit = [...selected].filter((l) => correct.has(l)).length;
    if (hit === correct.size) return 1;
    return hit >= Math.ceil(correct.size / 2) ? 0.5 : 0;
  }
  if (q.format === 'qroc' && a.kind === 'qroc') return a.self === 'juste' ? 1 : a.self === 'partiel' ? 0.5 : 0;
  return 0;
}

export function scoreEvaluation(questions: EvalQuestion[], answers: Record<string, EvalAnswer>): { points: number; total: number; pct: number } {
  const total = questions.length;
  const points = questions.reduce((n, q) => n + scoreQuestion(q, answers[q.id]), 0);
  return { points, total, pct: total > 0 ? Math.round((points / total) * 100) : 0 };
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
