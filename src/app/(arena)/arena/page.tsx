import { redirect } from 'next/navigation';
import { currentStaff, isPublic } from '@/lib/arena/access';
import { listTournaments } from '@/lib/arena/db';
import { loadTournamentCards } from '@/lib/arena/cards-data';
import { arenaSection, arenaSectionHref } from '@/lib/arena/navigation';
import { SeasonPage } from '@/components/arena/season-page';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'EVC Arena — tournois de QCM', robots: { index: false, follow: false } };

/**
 * Hub EVC Arena : liste les tournois visibles. Un seul tournoi public → on y
 * va directement. Le personnel voit aussi les brouillons (prévisualisation).
 *
 * Refonte du 24/09/2026 : le hub est la page « Choisissez votre tournoi —
 * Saison » des maquettes client (15_06_19, 15_08_21), la même que l'onglet
 * CALENDRIER (`/arena/calendrier`), servie ici quand aucun tournoi unique ne
 * s'impose.
 */
export default async function ArenaHubPage({ searchParams }: { searchParams: Promise<{ vue?: string }> }) {
  const section = arenaSection((await searchParams).vue);
  const staff = await currentStaff();
  const all = await listTournaments();
  const visible = all.filter((t) => isPublic(t) || staff);
  const pub = visible.filter(isPublic);
  if (!staff && pub.length === 1) redirect(arenaSectionHref(pub[0].slug, section));
  const groups = await loadTournamentCards();
  const editions = Object.fromEntries(visible.map((t) => [t.slug, t.edition_label]));
  return <SeasonPage groups={groups} editions={editions} />;
}
