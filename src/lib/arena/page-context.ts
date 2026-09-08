import 'server-only';
import { notFound } from 'next/navigation';
import { registrationOpen, visibleSnapshot, type StaffInfo } from './access';
import { currentParticipant, type TournamentSnapshot } from './db';
import type { ShellNav } from '@/components/arena/arena-shell';
import type { ParticipantRow } from './types';

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
      participant: participant ? { pseudo: participant.pseudo } : null,
      registrationOpen: open,
      leaderboardEnabled: snap.tournament.leaderboard_enabled,
      staffPreview: Boolean(opts.preview && staff),
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
