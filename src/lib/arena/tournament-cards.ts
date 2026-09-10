/**
 * EVC Arena — cartes de la section « Choisissez votre tournoi » (maquette
 * client du 10/09/2026). Module pur, testable : à partir des tournois visibles
 * et de leurs manches, produit les groupes « Tournois actuellement ouverts »
 * et « Prochains tournois », le statut affiché, le compte à rebours et l'appel
 * à l'action de chaque carte.
 */
import { roundState, type TournamentStatus } from './time';
import { specialtyVisual, coverImageUrl, type SpecialtyVisual } from './specialty-visual';

export type CardSource = {
  id: string;
  slug: string;
  title: string;
  specialty: string;
  specialty_id: string | null;
  cover_image_path?: string | null;
  status: TournamentStatus;
  questions_per_round: number;
  seconds_per_question: number;
  rounds: { number: number; theme: string; opens_at: string | null; closes_at: string | null; duration_minutes: number | null }[];
};

export type CardGroup = 'open' | 'upcoming' | 'finished';

export type TournamentCard = {
  id: string;
  slug: string;
  title: string;
  specialty: string;
  visual: SpecialtyVisual;
  questions: number;
  seconds: number;
  group: CardGroup;
  /** Ligne de statut : « Manche 1 ouverte », « Tournoi à venir », « Inscriptions ouvertes », « Tournoi terminé ». */
  statusLabel: string;
  /** Thème de la manche concernée (ou vide). */
  theme: string;
  /** Compte à rebours : vers la clôture de la manche ouverte, ou vers l'ouverture de la prochaine manche. */
  countdown: { kind: 'closes' | 'opens'; at: string } | null;
  href: string;
  cta: string;
  /** Vrai pour un tournoi visible du personnel seulement (brouillon, programmé). */
  staffOnly: boolean;
};

export type TournamentCardGroups = { open: TournamentCard[]; upcoming: TournamentCard[]; finished: TournamentCard[] };

export function buildTournamentCard(t: CardSource, opts: { now?: Date; supabaseUrl?: string; isPublic: boolean }): TournamentCard {
  const now = opts.now ?? new Date();
  const rounds = [...t.rounds].sort((a, b) => a.number - b.number);
  const openRound = rounds.find((r) => roundState(r, now) === 'open') ?? null;
  const nextRound = rounds.find((r) => roundState(r, now) === 'upcoming') ?? null;
  const custom = coverImageUrl(opts.supabaseUrl, t.cover_image_path);
  const visual = custom ? { src: custom, alt: t.title } : specialtyVisual(t.specialty, t.specialty_id);
  const base = `/arena/${t.slug}`;
  const finished = t.status === 'finished' || t.status === 'archived';
  const staffOnly = !opts.isPublic;

  let group: CardGroup;
  let statusLabel: string;
  let theme = '';
  let countdown: TournamentCard['countdown'] = null;
  let cta: string;

  if (finished) {
    group = 'finished';
    statusLabel = 'Tournoi terminé';
    cta = 'Voir les résultats';
  } else if (openRound) {
    group = 'open';
    statusLabel = `Manche ${openRound.number} ouverte`;
    theme = openRound.theme;
    countdown = openRound.closes_at ? { kind: 'closes', at: openRound.closes_at } : null;
    cta = 'Entrer dans l’Arena';
  } else if (t.status === 'registration_open' || t.status === 'round_closed') {
    group = 'open';
    statusLabel = nextRound ? `Manche ${nextRound.number} à venir` : 'Inscriptions ouvertes';
    theme = nextRound?.theme ?? '';
    countdown = nextRound?.opens_at ? { kind: 'opens', at: nextRound.opens_at } : null;
    cta = 'Entrer dans l’Arena';
  } else {
    group = 'upcoming';
    statusLabel = 'Tournoi à venir';
    theme = nextRound?.theme ?? rounds[0]?.theme ?? '';
    const first = nextRound ?? rounds[0] ?? null;
    countdown = first?.opens_at ? { kind: 'opens', at: first.opens_at } : null;
    cta = 'Voir le tournoi';
  }

  return {
    id: t.id, slug: t.slug, title: t.title, specialty: t.specialty, visual,
    questions: t.questions_per_round, seconds: t.seconds_per_question,
    group, statusLabel, theme, countdown, href: base, cta, staffOnly,
  };
}

export function groupTournamentCards(cards: TournamentCard[]): TournamentCardGroups {
  return {
    open: cards.filter((c) => c.group === 'open'),
    upcoming: cards.filter((c) => c.group === 'upcoming'),
    finished: cards.filter((c) => c.group === 'finished'),
  };
}

/** « 1 j 08 h 24 min », « 12 h 17 min », « 8 min 05 s » ; « 0 s » une fois l'échéance passée. */
export function formatRemaining(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (d > 0) return `${d} j ${pad(h)} h ${pad(m)} min`;
  if (h > 0) return `${h} h ${pad(m)} min`;
  if (m > 0) return `${m} min ${pad(sec)} s`;
  return `${sec} s`;
}

/** Libellé de saison : année de la première manche datée, sinon de la date courante. */
export function seasonLabel(cards: { countdown: { at: string } | null }[], now = new Date()): string {
  const first = cards.map((c) => c.countdown?.at).filter((x): x is string => Boolean(x)).sort()[0];
  const year = first ? new Date(first).getUTCFullYear() : now.getUTCFullYear();
  return `Saison ${year}`;
}
