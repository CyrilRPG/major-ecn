/**
 * Restitution et prescription du Check-up (§20 à §23, §35, C§21, C§22) —
 * module PUR.
 *
 *  - pourcentage global, points, temps et synthèse ; jamais le mot « Échec »,
 *    aucune prédiction de réussite, aucune « moyenne » sans cohorte
 *    comparable ;
 *  - analyse par domaine / catégorie (ou par dossier en voie externe) et, si
 *    l'effectif le permet, par origine des contenus ; sous-score affiché en
 *    « 70 % (7/10) » à partir de 5 questions, sinon la fraction seule ;
 *  - items À revoir en priorité / À consolider / Signaux positifs ; une bonne
 *    réponse unique ne suffit jamais à déclarer un item maîtrisé (§20).
 */
import { formatSubscore, round2 } from './scoring';
import type { BankFamily, QuestionResult } from './types';

export type ResultQuestion = {
  position: number;
  block: number;
  itemId: string | null;
  itemName: string | null;
  categoryId: string | null;
  categoryName: string | null;
  family: BankFamily;
  points: number;
  result: QuestionResult;
  origin: 'auto' | 'auto_evaluee' | 'vide';
  /** Question réellement affichée au candidat. Une question jamais affichée (fin anticipée,
   *  temps écoulé) compte 0 point dans le score mais ne dit rien de l'item : aucun diagnostic. */
  displayed?: boolean;
};

export type Subscore = { key: string; label: string; obtained: number; possible: number; display: string; percent: number | null };

export type ItemDiagnosis = {
  itemId: string;
  itemName: string;
  correct: number;
  partial: number;
  incorrect: number;
  /** Classement de la prescription (§23). */
  verdict: 'a_revoir' | 'a_consolider' | 'positif';
  /** Au moins une réponse auto-évaluée (QROC) : origine identifiable (§19, §41). */
  selfAssessed: boolean;
};

export type CheckupAnalysis = {
  percent: number;
  obtained: number;
  possible: number;
  byDomain: Subscore[];
  byBlock: Subscore[];
  bySource: Subscore[];
  items: ItemDiagnosis[];
  aRevoir: ItemDiagnosis[];
  aConsolider: ItemDiagnosis[];
  positifs: ItemDiagnosis[];
  /** Questions sans item rattaché (comptent dans le score, ne produisent aucun diagnostic d'item, C§19). */
  withoutItem: number;
  /** Questions jamais affichées (fin anticipée, temps écoulé) : 0 point, aucun diagnostic d'item. */
  notDisplayed?: number;
};

const SOURCE_GROUP: Record<BankFamily, { key: string; label: string }> = {
  structured_item: { key: 'structured', label: 'Banque structurée' },
  des_bank: { key: 'complementaire', label: 'QCM DES / transversaux' },
  transversal_bank: { key: 'complementaire', label: 'QCM DES / transversaux' },
  evc_annale: { key: 'annales', label: 'Annales' },
};

function subscores(groups: Map<string, { label: string; obtained: number; possible: number }>): Subscore[] {
  return Array.from(groups.entries()).map(([key, g]) => ({
    key, label: g.label, obtained: round2(g.obtained), possible: g.possible, display: formatSubscore(g.obtained, g.possible),
    percent: g.possible >= 5 ? Math.round((g.obtained / g.possible) * 100) : null,
  })).sort((a, b) => (a.percent ?? a.obtained / Math.max(1, a.possible) * 100) - (b.percent ?? b.obtained / Math.max(1, b.possible) * 100));
}

export function analyze(questions: ResultQuestion[], opts: { externe: boolean }): CheckupAnalysis {
  const obtained = round2(questions.reduce((n, q) => n + q.points, 0));
  const possible = questions.length;
  const percent = possible > 0 ? round2((obtained / possible) * 100) : 0;
  const add = (m: Map<string, { label: string; obtained: number; possible: number }>, key: string, label: string, pts: number) => {
    const cur = m.get(key) ?? { label, obtained: 0, possible: 0 };
    cur.obtained += pts; cur.possible += 1;
    m.set(key, cur);
  };
  const domains = new Map<string, { label: string; obtained: number; possible: number }>();
  const blocks = new Map<string, { label: string; obtained: number; possible: number }>();
  const sources = new Map<string, { label: string; obtained: number; possible: number }>();
  for (const q of questions) {
    if (q.categoryId) add(domains, q.categoryId, q.categoryName ?? 'Catégorie', q.points);
    else if (q.itemId) add(domains, `item:${q.itemId}`, q.itemName ?? 'Item', q.points);
    if (opts.externe) add(blocks, String(q.block), `Bloc ${q.block}`, q.points);
    const sg = SOURCE_GROUP[q.family];
    add(sources, sg.key, sg.label, q.points);
  }
  const itemMap = new Map<string, ItemDiagnosis>();
  for (const q of questions) {
    if (!q.itemId || q.displayed === false) continue;
    const d = itemMap.get(q.itemId) ?? { itemId: q.itemId, itemName: q.itemName ?? 'Item', correct: 0, partial: 0, incorrect: 0, verdict: 'positif' as const, selfAssessed: false };
    if (q.result === 'correct') d.correct++; else if (q.result === 'partial') d.partial++; else d.incorrect++;
    if (q.origin === 'auto_evaluee') d.selfAssessed = true;
    itemMap.set(q.itemId, d);
  }
  const items = Array.from(itemMap.values()).map((d) => ({
    ...d, verdict: (d.incorrect > 0 ? 'a_revoir' : d.partial > 0 ? 'a_consolider' : 'positif') as ItemDiagnosis['verdict'],
  })).sort((a, b) => b.incorrect - a.incorrect || b.partial - a.partial || a.itemName.localeCompare(b.itemName, 'fr'));
  // Les sous-scores par origine ne s'affichent que si plusieurs origines coexistent (C§22).
  const bySource = sources.size > 1 ? subscores(sources) : [];
  return {
    percent, obtained, possible,
    byDomain: subscores(domains),
    byBlock: opts.externe ? Array.from(blocks.entries()).sort((a, b) => Number(a[0]) - Number(b[0])).map(([key, g]) => ({
      key, label: g.label, obtained: round2(g.obtained), possible: g.possible, display: formatSubscore(g.obtained, g.possible),
      percent: g.possible >= 5 ? Math.round((g.obtained / g.possible) * 100) : null,
    })) : [],
    bySource,
    items,
    aRevoir: items.filter((i) => i.verdict === 'a_revoir'),
    aConsolider: items.filter((i) => i.verdict === 'a_consolider'),
    positifs: items.filter((i) => i.verdict === 'positif'),
    withoutItem: questions.filter((q) => !q.itemId).length,
    notDisplayed: questions.filter((q) => q.displayed === false).length,
  };
}

/** Synthèse en une phrase (§35) — jamais « échec », jamais de prédiction. */
export function synthesis(a: CheckupAnalysis): string {
  const parts: string[] = [];
  if (a.aRevoir.length > 0) parts.push(`${a.aRevoir.length} item${a.aRevoir.length > 1 ? 's' : ''} à revoir en priorité`);
  if (a.aConsolider.length > 0) parts.push(`${a.aConsolider.length} à consolider`);
  if (a.positifs.length > 0) parts.push(`${a.positifs.length} avec des signaux positifs`);
  if (parts.length === 0) return 'Votre résultat est enregistré : il alimente votre profil pédagogique.';
  return `${parts.join(', ')}. Votre plan de reprise est prêt : il transforme ce résultat en programme de travail.`;
}

/** Un Check-up recommandé (O§32, I§24) : jamais lancé automatiquement. */
export function shouldRecommendCheckup(input: { lastCheckupAt: string | null; newItemsWorkedSince: number; now: string; newItemsThreshold: number; daysThreshold: number }): { recommend: boolean; reason: string | null } {
  if (input.newItemsWorkedSince >= input.newItemsThreshold) {
    return {
      recommend: true,
      reason: input.lastCheckupAt
        ? `${input.newItemsWorkedSince} nouveaux items travaillés depuis votre dernier Check-up.`
        : `${input.newItemsWorkedSince} items travaillés : mesurez votre niveau pour orienter vos révisions.`,
    };
  }
  if (!input.lastCheckupAt) return { recommend: input.newItemsWorkedSince > 0, reason: input.newItemsWorkedSince > 0 ? 'Mesurez votre niveau pour orienter vos révisions.' : null };
  const days = Math.floor((Date.parse(input.now) - Date.parse(input.lastCheckupAt)) / 86_400_000);
  if (days >= input.daysThreshold) return { recommend: true, reason: `Votre dernier Check-up date de ${days} jours.` };
  return { recommend: false, reason: null };
}

/** Alertes de temps restant à émettre (§27) : seuils franchis non encore signalés. */
export function dueTimerAlerts(remainingSeconds: number, alerts: number[], sent: number[]): number[] {
  return alerts.filter((m) => remainingSeconds <= m * 60 && !sent.includes(m)).sort((a, b) => b - a);
}
