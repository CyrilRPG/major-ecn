/**
 * EVC Arena — moteur de barème (cahier des charges §6).
 *
 * Module PUR (aucune dépendance serveur) : il est partagé par le serveur
 * (correction des tentatives, recalcul après neutralisation) et par le client
 * (prévisualisation d'un barème en administration, §6.8). Une seule
 * implémentation garantit que ce qui est montré est ce qui est appliqué.
 *
 * Trois types de question (§6.2) et, pour chacun, un mode :
 *   - `cng`            preset « barème CNG » (§6.4), aucune saisie
 *   - `all_or_nothing` preset « tout ou rien » (§6.5), aucune saisie
 *   - `custom`         grille personnalisée (§6.6) — éventuellement issue d'un
 *                      modèle enregistré (§6.7), dont le nom est conservé
 *
 * Règles indispensable / inacceptable (§6.9) : évaluées EN PREMIER, quel que
 * soit le barème ; si l'une se déclenche, la question vaut 0. Les presets les
 * appliquent toujours ; une grille personnalisée peut les désactiver.
 */

export type QType = 'QRM' | 'QRU' | 'QRP';
export type BaremeMode = 'cng' | 'all_or_nothing' | 'custom';

/** QRM — points (sur 1) par nombre de discordances ; au-delà du dernier palier : 0. */
export type QrmGrid = { points: number[]; apply_rules: boolean };
/** QRU — correction binaire ; `wrong` reste disponible pour une pénalité (négative interdite ici : 0). */
export type QruGrid = { correct: number; wrong: number; apply_rules: boolean };
/**
 * QRP — grille indexée par n (§6.6) : `by_n[n][x]` = points quand x réponses
 * justes sont cochées sans erreur. `error_policy` : `zero` (toute proposition
 * erronée annule la question) ou `penalty` (retrait de `penalty` par erreur).
 */
export type QrpGrid = {
  by_n: Record<string, number[]>;
  error_policy: 'zero' | 'penalty';
  penalty: number;
  apply_rules: boolean;
};
export type AnyGrid = QrmGrid | QruGrid | QrpGrid;

export type TypeBareme = {
  mode: BaremeMode;
  grid?: AnyGrid | null;
  template_id?: string | null;
  template_name?: string | null;
};
export type Bareme = Record<QType, TypeBareme>;

export const QTYPES: QType[] = ['QRM', 'QRU', 'QRP'];

export const QTYPE_LABEL: Record<QType, string> = {
  QRM: 'QRM — réponses multiples',
  QRU: 'QRU — réponse unique',
  QRP: 'QRP — nombre de réponses précisé',
};

export const MODE_LABEL: Record<BaremeMode, string> = {
  cng: 'Barème CNG',
  all_or_nothing: 'Tout ou rien',
  custom: 'Grille personnalisée',
};

export const DEFAULT_BAREME: Bareme = {
  QRM: { mode: 'cng' },
  QRU: { mode: 'cng' },
  QRP: { mode: 'cng' },
};

/* ------------------------------------------------------------------ */
/* Grilles effectives                                                  */
/* ------------------------------------------------------------------ */

/** Preset CNG QRM (§6.4) : 0 → 1 ; 1 → 0,5 ; 2 → 0,2 ; 3 ou plus → 0. */
export const CNG_QRM: QrmGrid = { points: [1, 0.5, 0.2], apply_rules: true };
export const ALL_OR_NOTHING_QRM: QrmGrid = { points: [1], apply_rules: true };
export const CNG_QRU: QruGrid = { correct: 1, wrong: 0, apply_rules: true };

/** x ÷ n pour n donné (§6.4 QRP). */
export function qrpCngRow(n: number): number[] {
  return Array.from({ length: n + 1 }, (_, x) => round3(x / n));
}
export function qrpAllOrNothingRow(n: number): number[] {
  return Array.from({ length: n + 1 }, (_, x) => (x === n ? 1 : 0));
}

function round3(v: number): number {
  return Math.round(v * 1000) / 1000;
}

function clamp01(v: unknown): number {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : 0;
  return Math.min(1, Math.max(0, n));
}

/** Grille QRM effective pour un mode donné (grille personnalisée assainie). */
export function resolveQrm(b: TypeBareme | undefined): QrmGrid {
  if (!b || b.mode === 'cng') return CNG_QRM;
  if (b.mode === 'all_or_nothing') return ALL_OR_NOTHING_QRM;
  const g = b.grid as Partial<QrmGrid> | null | undefined;
  const points = Array.isArray(g?.points) && g.points.length > 0 ? g.points.map(clamp01) : CNG_QRM.points;
  return { points, apply_rules: g?.apply_rules !== false };
}

export function resolveQru(b: TypeBareme | undefined): QruGrid {
  if (!b || b.mode !== 'custom') return CNG_QRU;
  const g = b.grid as Partial<QruGrid> | null | undefined;
  return {
    correct: typeof g?.correct === 'number' ? clamp01(g.correct) : 1,
    wrong: typeof g?.wrong === 'number' ? clamp01(g.wrong) : 0,
    apply_rules: g?.apply_rules !== false,
  };
}

/**
 * Ligne QRP effective pour n. Un mode personnalisé ne définit une ligne que
 * pour les n réellement présents dans le tournoi (§6.6) : à défaut, repli sur
 * la ligne CNG, jamais sur un 0 silencieux.
 */
export function resolveQrpRow(b: TypeBareme | undefined, n: number): { row: number[]; error_policy: 'zero' | 'penalty'; penalty: number; apply_rules: boolean } {
  if (!b || b.mode === 'cng') return { row: qrpCngRow(n), error_policy: 'zero', penalty: 0, apply_rules: true };
  if (b.mode === 'all_or_nothing') return { row: qrpAllOrNothingRow(n), error_policy: 'zero', penalty: 0, apply_rules: true };
  const g = b.grid as Partial<QrpGrid> | null | undefined;
  const raw = g?.by_n?.[String(n)];
  const row =
    Array.isArray(raw) && raw.length === n + 1
      ? raw.map(clamp01)
      : qrpCngRow(n);
  const policy = g?.error_policy === 'penalty' ? 'penalty' : 'zero';
  const penalty = policy === 'penalty' ? clamp01(g?.penalty) : 0;
  return { row, error_policy: policy, penalty, apply_rules: g?.apply_rules !== false };
}

/* ------------------------------------------------------------------ */
/* Correction d'une question                                           */
/* ------------------------------------------------------------------ */

export type ScoringItem = {
  lettre: string;
  is_correct: boolean;
  indispensable?: boolean | null;
  inacceptable?: boolean | null;
};

export type ScoringQuestion = {
  type: QType;
  expected_count?: number | null;
  weight?: number | null;
  items: ScoringItem[];
  neutralized?: boolean;
};

export type RuleTriggered = 'indispensable' | 'inacceptable' | null;

export type ScoreResult = {
  /** Points obtenus (pondération appliquée). */
  score: number;
  /** Maximum atteignable pour la question (pondération appliquée). */
  max: number;
  /** Fraction du maximum, entre 0 et 1. */
  unit: number;
  discordances: number;
  /** Réponse parfaite (§6.13) : score maximal, aucune règle déclenchée. */
  is_perfect: boolean;
  rule_triggered: RuleTriggered;
  neutralized: boolean;
};

export function letterSet(selected: readonly string[]): Set<string> {
  return new Set(selected.map((l) => l.trim().toUpperCase()).filter(Boolean));
}

/** Nombre de discordances (§6.3), compté sur l'ensemble des propositions. */
export function countDiscordances(items: readonly ScoringItem[], selected: Set<string>): number {
  let d = 0;
  for (const it of items) if (it.is_correct !== selected.has(it.lettre.toUpperCase())) d++;
  return d;
}

function checkRules(items: readonly ScoringItem[], selected: Set<string>): RuleTriggered {
  for (const it of items) {
    const on = selected.has(it.lettre.toUpperCase());
    if (it.indispensable && !on) return 'indispensable';
    if (it.inacceptable && on) return 'inacceptable';
  }
  return null;
}

/** n attendu d'une QRP : valeur saisie, sinon nombre de propositions exactes. */
export function expectedCount(q: Pick<ScoringQuestion, 'expected_count' | 'items'>): number {
  const declared = q.expected_count ?? 0;
  if (declared >= 1) return declared;
  return Math.max(1, q.items.filter((i) => i.is_correct).length);
}

export function questionMaxUnit(q: ScoringQuestion, bareme: Bareme): number {
  if (q.type === 'QRM') return Math.max(...resolveQrm(bareme.QRM).points, 0);
  if (q.type === 'QRU') return resolveQru(bareme.QRU).correct;
  const n = expectedCount(q);
  return Math.max(...resolveQrpRow(bareme.QRP, n).row, 0);
}

export function scoreQuestion(q: ScoringQuestion, selectedLetters: readonly string[], bareme: Bareme): ScoreResult {
  const weight = q.weight && q.weight > 0 ? q.weight : 1;
  const selected = letterSet(selectedLetters);
  const discordances = countDiscordances(q.items, selected);

  if (q.neutralized) {
    return { score: 0, max: 0, unit: 0, discordances, is_perfect: false, rule_triggered: null, neutralized: true };
  }

  let unit = 0;
  let maxUnit = 1;
  let rule: RuleTriggered = null;

  if (q.type === 'QRM') {
    const g = resolveQrm(bareme.QRM);
    maxUnit = Math.max(...g.points, 0);
    rule = g.apply_rules ? checkRules(q.items, selected) : null;
    unit = rule ? 0 : (g.points[discordances] ?? 0);
  } else if (q.type === 'QRU') {
    const g = resolveQru(bareme.QRU);
    maxUnit = g.correct;
    rule = g.apply_rules ? checkRules(q.items, selected) : null;
    const only = selected.size === 1 ? [...selected][0] : null;
    const good = only !== null && q.items.some((it) => it.lettre.toUpperCase() === only && it.is_correct);
    unit = rule ? 0 : good ? g.correct : g.wrong;
  } else {
    const n = expectedCount(q);
    const g = resolveQrpRow(bareme.QRP, n);
    maxUnit = Math.max(...g.row, 0);
    rule = g.apply_rules ? checkRules(q.items, selected) : null;
    const x = q.items.filter((it) => it.is_correct && selected.has(it.lettre.toUpperCase())).length;
    const wrong = q.items.filter((it) => !it.is_correct && selected.has(it.lettre.toUpperCase())).length;
    const base = g.row[Math.min(x, n)] ?? 0;
    if (rule) unit = 0;
    else if (wrong === 0) unit = base;
    else unit = g.error_policy === 'zero' ? 0 : Math.max(0, base - g.penalty * wrong);
  }

  unit = round3(unit);
  const is_perfect = rule === null && maxUnit > 0 && unit >= maxUnit;
  return {
    score: round3(unit * weight),
    max: round3(maxUnit * weight),
    unit,
    discordances,
    is_perfect,
    rule_triggered: rule,
    neutralized: false,
  };
}

/* ------------------------------------------------------------------ */
/* Affichage du barème (§6.12 — généré depuis le paramétrage, jamais saisi) */
/* ------------------------------------------------------------------ */

export type BaremeLine = { situation: string; points: string };

export function formatPoints(v: number): string {
  const s = v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
  return `${s} point${v > 1 ? 's' : ''}`;
}

/** Lignes lisibles du barème d'un type, pour l'écran d'accueil de manche et les règles. */
export function describeBareme(type: QType, bareme: Bareme, qrpNs: number[] = []): { title: string; lines: BaremeLine[]; notes: string[] } {
  const b = bareme[type];
  const mode = b?.mode ?? 'cng';
  const title = b?.template_name ? `${MODE_LABEL[mode]} · ${b.template_name}` : MODE_LABEL[mode];
  const notes: string[] = [];

  if (type === 'QRM') {
    const g = resolveQrm(b);
    const lines: BaremeLine[] = g.points.map((p, d) => ({
      situation: d === 0 ? 'Aucune discordance' : `${d} discordance${d > 1 ? 's' : ''}`,
      points: formatPoints(p),
    }));
    lines.push({ situation: `${g.points.length} discordance${g.points.length > 1 ? 's' : ''} ou plus`, points: formatPoints(0) });
    notes.push('Une discordance est une proposition cochée à tort ou une proposition attendue non cochée, comptée sur l’ensemble des propositions.');
    if (g.apply_rules) notes.push('Une proposition indispensable non cochée ou une proposition inacceptable cochée donne 0 à la question.');
    return { title, lines, notes };
  }

  if (type === 'QRU') {
    const g = resolveQru(b);
    const lines: BaremeLine[] = [
      { situation: 'La bonne réponse est cochée', points: formatPoints(g.correct) },
      { situation: 'Tout autre cas, absence de réponse comprise', points: formatPoints(g.wrong) },
    ];
    notes.push('Une seule proposition peut être cochée : cocher une seconde proposition désélectionne la première.');
    return { title, lines, notes };
  }

  const ns = qrpNs.length ? [...new Set(qrpNs)].sort((a, c) => a - c) : [2, 3];
  const lines: BaremeLine[] = [];
  for (const n of ns) {
    const g = resolveQrpRow(b, n);
    for (let x = n; x >= 0; x--) {
      lines.push({ situation: `${n} attendues · ${x} juste${x > 1 ? 's' : ''} sans erreur`, points: formatPoints(g.row[x] ?? 0) });
    }
    lines.push({
      situation: `${n} attendues · au moins une proposition erronée`,
      points: g.error_policy === 'zero' ? formatPoints(0) : `retrait de ${formatPoints(g.penalty)} par erreur`,
    });
  }
  notes.push('Le nombre de réponses attendues est indiqué sur chaque question ; l’interface impose de cocher exactement ce nombre.');
  return { title, lines, notes };
}

/* ------------------------------------------------------------------ */
/* Validation d'une configuration venue de l'administration           */
/* ------------------------------------------------------------------ */

export function sanitizeBareme(input: unknown): Bareme {
  const src = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const out = { ...DEFAULT_BAREME } as Bareme;
  for (const t of QTYPES) {
    const raw = src[t] as Partial<TypeBareme> | undefined;
    const mode: BaremeMode = raw?.mode === 'all_or_nothing' || raw?.mode === 'custom' ? raw.mode : 'cng';
    const entry: TypeBareme = { mode, template_id: raw?.template_id ?? null, template_name: raw?.template_name ?? null };
    if (mode === 'custom') {
      if (t === 'QRM') entry.grid = resolveQrm({ mode, grid: raw?.grid });
      else if (t === 'QRU') entry.grid = resolveQru({ mode, grid: raw?.grid });
      else {
        const g = (raw?.grid ?? {}) as Partial<QrpGrid>;
        const by_n: Record<string, number[]> = {};
        for (const [k, v] of Object.entries(g.by_n ?? {})) {
          const n = Number(k);
          if (Number.isInteger(n) && n >= 1 && Array.isArray(v) && v.length === n + 1) by_n[k] = v.map(clamp01);
        }
        entry.grid = {
          by_n,
          error_policy: g.error_policy === 'penalty' ? 'penalty' : 'zero',
          penalty: clamp01(g.penalty),
          apply_rules: g.apply_rules !== false,
        };
      }
    }
    out[t] = entry;
  }
  return out;
}
