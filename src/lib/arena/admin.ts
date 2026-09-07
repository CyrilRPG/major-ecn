import 'server-only';
import { requireAdmin } from '@/lib/auth/require-role';
import type { Profile } from '@/lib/auth/get-profile';
import { arenaDb, arenaLog, listAttemptsForRounds, type TournamentSnapshot } from './db';
import { questionIssues } from './types';

/**
 * EVC Arena — helpers de l'administration (§15).
 */

export type AdminActor = { user: { id: string }; profile: Profile; label: string };

export async function ensureArenaAdmin(): Promise<AdminActor> {
  const { user, profile } = await requireAdmin();
  const label = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || profile?.email || 'admin';
  return { user, profile: profile as Profile, label };
}

export async function logAdmin(actor: AdminActor, entry: { tournamentId: string | null; roundId?: string | null; kind: string; oldValue?: unknown; newValue?: unknown; details?: string }): Promise<void> {
  await arenaLog({ ...entry, actorId: actor.user.id, actorLabel: actor.label });
}

export type IntegrityReport = { ok: boolean; problems: string[]; perRound: { number: number; count: number; issues: string[] }[] };

/**
 * Contrôle d'intégrité (§15.1, §20) exigé pour passer de Brouillon à
 * Programmé : dates de toutes les manches, nombre de questions attendu par
 * manche, chaque question complète et valide.
 */
export function integrityCheck(snap: TournamentSnapshot): IntegrityReport {
  const t = snap.tournament;
  const problems: string[] = [];
  if (!t.slug || !/^[a-z0-9-]{3,60}$/.test(t.slug)) problems.push('URL (slug) invalide : lettres minuscules, chiffres et tirets.');
  if (!t.title.trim()) problems.push('Titre manquant.');
  if (!t.specialty.trim()) problems.push('Spécialité manquante.');
  if (snap.rounds.length === 0) problems.push('Aucune manche.');
  const perRound = snap.rounds.map((r) => {
    const qs = (snap.questionsByRound.get(r.id) ?? []).filter((q) => !q.neutralized_at);
    const issues: string[] = [];
    if (!r.opens_at || !r.closes_at) issues.push('Dates d’ouverture et de clôture manquantes.');
    if (qs.length !== t.questions_per_round) issues.push(`${qs.length} question(s) au lieu de ${t.questions_per_round}.`);
    qs.forEach((q, i) => {
      for (const iss of questionIssues(q)) issues.push(`Question ${i + 1} : ${iss}`);
    });
    return { number: r.number, count: qs.length, issues };
  });
  // Manches dans l'ordre chronologique
  for (let i = 1; i < snap.rounds.length; i++) {
    const a = snap.rounds[i - 1];
    const b = snap.rounds[i];
    if (a.closes_at && b.opens_at && new Date(b.opens_at) < new Date(a.closes_at)) problems.push(`La manche ${b.number} ouvre avant la clôture de la manche ${a.number}.`);
  }
  const ok = problems.length === 0 && perRound.every((r) => r.issues.length === 0);
  return { ok, problems, perRound };
}

/** Une manche « a démarré » dès qu'une tentative réelle existe : ses questions deviennent intouchables (sauf neutralisation). */
export async function roundHasAttempts(roundId: string): Promise<boolean> {
  const attempts = await listAttemptsForRounds([roundId]);
  return attempts.length > 0;
}

export async function tournamentIdOfRound(roundId: string): Promise<string | null> {
  const { data } = await arenaDb().from('arena_rounds').select('tournament_id').eq('id', roundId).maybeSingle();
  return data?.tournament_id ?? null;
}

export function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
