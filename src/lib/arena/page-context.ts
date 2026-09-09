import 'server-only';
import { notFound } from 'next/navigation';
import { registrationOpen, visibleSnapshot, type StaffInfo } from './access';
import { computeTournamentStandings, currentParticipant, type TournamentSnapshot } from './db';
import type { ShellNav } from '@/components/arena/arena-shell';
import type { ParticipantRow } from './types';
import { roundState } from './time';

/**
 * Contexte commun des pages publiques d'un tournoi : instantané (tournoi,
 * manches, questions), personnel éventuel, participant connecté, et données
 * de navigation de la coque. 404 si le tournoi n'est pas visible.
 */
export type ArenaPageContext = {
  snap: TournamentSnapshot;
  staff: StaffInfo;
  participant: ParticipantRow | null;
  nav: ShellNav;
  registrationOpen: boolean;
};

export async function loadArenaPage(slug: string, opts: { preview?: boolean } = {}): Promise<ArenaPageContext> {
  const v = await visibleSnapshot(slug);
  if (!v) notFound();
  const { snap, staff } = v;
  const participant = await currentParticipant(snap.tournament.id);
  const rank = participant ? (await computeTournamentStandings(snap)).standings.find(s => s.participantId === participant.id)?.rank ?? null : null;
  const open = registrationOpen(snap);
  return {
    snap,
    staff,
    participant,
    registrationOpen: open,
    nav: {
      slug,
      title: snap.tournament.title,
      editionLabel: snap.tournament.edition_label,
      participant: participant ? { pseudo: participant.pseudo, avatar_seed: participant.avatar_seed, rank } : null,
      registrationOpen: open,
      leaderboardEnabled: snap.tournament.leaderboard_enabled,
      staffPreview: Boolean(opts.preview && staff),
      updates: snap.rounds.flatMap(r => {
        const base = `/arena/${slug}`;
        if (r.results_published_at) return [{ title: `Résultats de la manche ${r.number}`, detail: 'Résultats et corrections publiés.', href: `${base}/manche/${r.number}/corrections` }];
        const state = roundState(r);
        const date = state === 'open' ? r.closes_at : r.opens_at;
        if (!date || state === 'closed') return [];
        return [{ title: `Manche ${r.number} — ${state === 'open' ? 'ouverte' : 'à venir'}`, detail: `${state === 'open' ? 'Clôture' : 'Ouverture'} le ${new Date(date).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })} (heure de Paris).`, href: `${base}/manche/${r.number}` }];
      }),
    },
  };
}

/** Métadonnées : jamais indexé tant que le tournoi n'est pas marqué indexable. */
export function arenaMetadata(snap: TournamentSnapshot, page?: { title?: string; description?: string; noindex?: boolean }) {
  const t = snap.tournament;
  const title = page?.title ? `${page.title} — ${t.title}` : (t.meta_title ?? t.title);
  const description = page?.description ?? t.meta_description ?? `Tournoi de QCM ${t.specialty} : trois manches, ${t.questions_per_round} questions chronométrées une par une, une seule tentative.`;
  const index = t.indexable && !page?.noindex;
  return {
    title,
    description,
    robots: { index, follow: index },
    openGraph: { title, description, type: 'website', locale: 'fr_FR', siteName: 'Major ECN' },
  };
}
