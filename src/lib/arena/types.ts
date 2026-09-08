/**
 * EVC Arena — types des tables `arena_*` (les types Supabase générés ne les
 * connaissent pas) et petits utilitaires purs partagés client/serveur.
 */
import type { Bareme, QType } from './scoring';
import type { TournamentStatus } from './time';

export type ArenaItem = {
  lettre: string;
  enonce: string;
  is_correct: boolean;
  indispensable: boolean;
  inacceptable: boolean;
  justification: string;
};

export type EmailKind =
  | 'confirmation'
  | 'validated'
  | 'j7'
  | 'j1'
  | 'opening'
  | 'relance'
  | 'results'
  | 'login'
  | 'invite'
  | 'report_ack'
  | 'report_update'
  | 'neutralized'
  | 'deleted'
  | 'manual';

/** Étapes automatiques de la séquence (§11), activables individuellement. */
export type SequenceKind = 'validated' | 'j7' | 'j1' | 'opening' | 'relance' | 'results';
export type SequenceStep = { enabled: boolean; subject?: string | null };
export type EmailSequence = Record<SequenceKind, SequenceStep> & { results_delay_minutes?: number };

export const SEQUENCE_KINDS: SequenceKind[] = ['validated', 'j7', 'j1', 'opening', 'relance', 'results'];
export const SEQUENCE_LABEL: Record<SequenceKind, string> = {
  validated: 'Après validation de l’email : règles, barème, date de M1',
  j7: 'J-7 avant chaque manche : annonce ou rappel + thème',
  j1: 'J-1 avant chaque manche : rappel',
  opening: 'Ouverture de la manche : lien direct',
  relance: '3 h avant clôture : relance des inscrits n’ayant pas joué',
  results: 'Clôture (ou différé) : résultats + corrections + PDF',
};

export function defaultEmailSequence(input?: unknown): EmailSequence {
  const src = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const out = {} as EmailSequence;
  for (const k of SEQUENCE_KINDS) {
    const raw = src[k] as Partial<SequenceStep> | undefined;
    out[k] = { enabled: raw?.enabled !== false, subject: raw?.subject ?? null };
  }
  const delay = Number(src.results_delay_minutes);
  out.results_delay_minutes = Number.isFinite(delay) && delay >= 0 ? Math.floor(delay) : 0;
  return out;
}

export type TournamentRow = {
  id: string;
  faculte_id: string;
  slug: string;
  title: string;
  edition_label: string;
  specialty: string;
  specialty_id: string | null;
  status: TournamentStatus;
  indexable: boolean;
  meta_title: string | null;
  meta_description: string | null;
  intro_text: string;
  og_image_path: string | null;
  leaderboard_enabled: boolean;
  leaderboard_size: number;
  threshold_pct: number;
  min_rounds_final: number;
  questions_per_round: number;
  /** Plafond de sécurité de la manche entière (min). Le minutage réel est
   *  la somme des durées de questions ; cette valeur borne les débordements. */
  round_duration_minutes: number;
  /** Durée par défaut d'une question, en secondes (§3.4). */
  seconds_per_question: number;
  retention_days: number;
  bareme: Bareme;
  email_sequence: EmailSequence;
  texts: Record<string, string>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type RoundRow = {
  id: string;
  tournament_id: string;
  number: number;
  theme: string;
  opens_at: string | null;
  closes_at: string | null;
  duration_minutes: number | null;
  bareme_snapshot: Bareme | null;
  bareme_locked_at: string | null;
  results_published_at: string | null;
  results_publish_delay_minutes: number;
  corrections_intro: string;
  corrections_methodo: string;
  corrections_errors: string;
  corrections_references: string;
  corrections_pdf_path: string | null;
  corrections_pdf_source: 'generated' | 'uploaded' | null;
  corrections_pdf_generated_at: string | null;
  created_at: string;
  updated_at: string;
};

export type QuestionRow = {
  id: string;
  round_id: string;
  order_index: number;
  type: QType;
  expected_count: number | null;
  weight: number;
  enonce: string;
  vignette: string | null;
  images: string[];
  items: ArenaItem[];
  explanation: string;
  pieges: string;
  erreurs_frequentes: string;
  references_text: string;
  source_question_id: string | null;
  /** Durée propre à cette question, en secondes. `null` = celle du tournoi. */
  duration_seconds: number | null;
  neutralized_at: string | null;
  neutralized_reason: string | null;
  neutralized_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ParticipantRow = {
  id: string;
  faculte_id: string;
  tournament_id: string;
  first_name: string;
  last_name: string;
  email: string;
  specialty: string;
  pseudo: string;
  pseudo_key: string;
  avatar_seed: string;
  timezone: string | null;
  email_confirmed_at: string | null;
  confirmation_token_hash: string | null;
  confirmation_sent_at: string | null;
  login_token_hash: string | null;
  login_token_expires_at: string | null;
  consent_tournament_at: string;
  consent_tournament_version: string;
  consent_marketing: boolean;
  consent_marketing_at: string | null;
  consent_marketing_version: string | null;
  marketing_unsubscribed_at: string | null;
  acquisition_source: string | null;
  utm: Record<string, string> | null;
  invited_by: string | null;
  invite_code: string;
  blocked_at: string | null;
  blocked_reason: string | null;
  anonymized_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AttemptStatus = 'in_progress' | 'submitted' | 'expired';

export type AttemptRow = {
  id: string;
  round_id: string;
  participant_id: string | null;
  is_preview: boolean;
  preview_user_id: string | null;
  started_at: string;
  deadline_at: string;
  truncated: boolean;
  submitted_at: string | null;
  status: AttemptStatus;
  score: number | null;
  max_score: number | null;
  perfect_count: number | null;
  duration_seconds: number | null;
  question_order: string[];
  created_at: string;
};

export type AnswerRow = {
  id: string;
  attempt_id: string;
  question_id: string;
  selected: string[];
  validated_at: string;
  score: number | null;
  max_score: number | null;
  discordances: number | null;
  is_perfect: boolean | null;
  rule_triggered: string | null;
};

export type ReportRow = {
  id: string;
  question_id: string;
  participant_id: string;
  motif: string;
  comment: string;
  reference: string | null;
  status: 'open' | 'validated' | 'rejected';
  admin_response: string | null;
  handled_at: string | null;
  handled_by: string | null;
  created_at: string;
};

/** Question telle que servie au candidat : jamais de `is_correct` ni de règle. */
/**
 * Durée d'une question quand rien ne la fixe.
 *
 * Sert aussi de filet tant que la migration `20260908120000_arena_duree_par_question`
 * n'est pas appliquée : les colonnes manquent alors dans les lignes lues, et
 * un `undefined` propagé jusqu'au chronomètre donnerait un compte à rebours
 * NaN, donc une manche injouable. Avec ce repli, le code déployé avant la
 * migration se comporte comme avant : une minute par question.
 */
export const DEFAULT_SECONDS_PER_QUESTION = 60;

export type PublicQuestion = {
  id: string;
  order_index: number;
  type: QType;
  expected_count: number | null;
  weight: number;
  enonce: string;
  vignette: string | null;
  images: string[];
  items: { lettre: string; enonce: string }[];
  /** Durée allouée à CETTE question, en secondes, déjà résolue depuis le
   *  tournoi. Le client s'en sert pour son chronomètre ; le serveur reste
   *  seul juge (cf. `answerQuestion`). */
  duration_seconds: number;
};

export function toPublicQuestion(q: QuestionRow, secondsPerQuestion: number | null | undefined): PublicQuestion {
  return {
    id: q.id,
    order_index: q.order_index,
    type: q.type,
    expected_count: q.type === 'QRP' ? (q.expected_count ?? q.items.filter((i) => i.is_correct).length) : null,
    weight: q.weight,
    enonce: q.enonce,
    vignette: q.vignette,
    images: Array.isArray(q.images) ? q.images : [],
    items: q.items.map((i) => ({ lettre: i.lettre, enonce: i.enonce })),
    duration_seconds: q.duration_seconds ?? secondsPerQuestion ?? DEFAULT_SECONDS_PER_QUESTION,
  };
}

/* ------------------------------------------------------------------ */
/* Utilitaires purs                                                    */
/* ------------------------------------------------------------------ */

export const LETTERS = 'ABCDEFGHIJK'.split('');

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Clé d'unicité d'un pseudonyme : minuscules, sans accents ni espaces multiples. */
export function pseudoKey(pseudo: string): string {
  return pseudo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function isValidPseudo(pseudo: string): boolean {
  const p = pseudo.trim();
  return p.length >= 3 && p.length <= 24 && /^[\p{L}\p{N} _.\-]+$/u.test(p);
}

export function randomAvatarSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

export type ItemIssue = string;

/**
 * Assainit et valide une liste de propositions (§6.9, §20) : lettres A..K
 * uniques et consécutives, au moins deux propositions, au moins une exacte,
 * jamais indispensable ET inacceptable sur la même proposition.
 */
export function sanitizeItems(input: unknown, type: QType, expectedCount?: number | null): { items: ArenaItem[]; issues: ItemIssue[] } {
  const issues: ItemIssue[] = [];
  const raw = Array.isArray(input) ? input : [];
  const items: ArenaItem[] = raw
    .map((r, i) => {
      const o = (r && typeof r === 'object' ? r : {}) as Record<string, unknown>;
      return {
        lettre: LETTERS[i] ?? '?',
        enonce: String(o.enonce ?? '').trim(),
        is_correct: Boolean(o.is_correct),
        indispensable: Boolean(o.indispensable),
        inacceptable: Boolean(o.inacceptable),
        justification: String(o.justification ?? '').trim(),
      };
    })
    .filter((it) => it.enonce.length > 0)
    .map((it, i) => ({ ...it, lettre: LETTERS[i] ?? '?' }));

  if (items.length < 2) issues.push('Au moins deux propositions sont nécessaires.');
  if (items.length > LETTERS.length) issues.push(`Au plus ${LETTERS.length} propositions.`);
  const correct = items.filter((i) => i.is_correct).length;
  if (correct === 0) issues.push('Aucune proposition n’est marquée comme exacte.');
  if (type === 'QRU' && correct > 1) issues.push('Une QRU ne peut avoir qu’une seule bonne réponse.');
  if (type === 'QRP') {
    const n = expectedCount ?? correct;
    if (n < 1) issues.push('Une QRP doit préciser le nombre de réponses attendues.');
    if (n !== correct) issues.push(`QRP : ${correct} proposition(s) exacte(s) alors que n = ${n}.`);
  }
  for (const it of items) {
    if (it.indispensable && it.inacceptable) issues.push(`Proposition ${it.lettre} : indispensable et inacceptable à la fois.`);
    if (it.indispensable && !it.is_correct) issues.push(`Proposition ${it.lettre} : indispensable mais non exacte.`);
    if (it.inacceptable && it.is_correct) issues.push(`Proposition ${it.lettre} : inacceptable mais marquée exacte.`);
  }
  return { items, issues };
}

/** Contrôle d'intégrité d'une question (passage Brouillon → Programmé, §15.1 / §20). */
export function questionIssues(q: Pick<QuestionRow, 'type' | 'expected_count' | 'enonce' | 'items' | 'weight'>): string[] {
  const issues: string[] = [];
  if (!q.enonce.trim()) issues.push('Énoncé vide.');
  if (!(q.weight > 0)) issues.push('Pondération manquante.');
  issues.push(...sanitizeItems(q.items, q.type, q.expected_count).issues);
  return issues;
}

/** Valeurs de n présentes dans une manche (pour l'affichage du barème QRP, §6.6). */
export function qrpNs(questions: readonly Pick<QuestionRow, 'type' | 'expected_count' | 'items'>[]): number[] {
  const ns = new Set<number>();
  for (const q of questions) {
    if (q.type !== 'QRP') continue;
    ns.add(q.expected_count ?? q.items.filter((i) => i.is_correct).length);
  }
  return [...ns].sort((a, b) => a - b);
}
