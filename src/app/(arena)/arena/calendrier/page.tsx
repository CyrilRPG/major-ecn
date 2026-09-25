import { currentStaff, isPublic } from '@/lib/arena/access';
import { listTournaments } from '@/lib/arena/db';
import { loadTournamentCards } from '@/lib/arena/cards-data';
import { SeasonPage } from '@/components/arena/season-page';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Calendrier des tournois', robots: { index: false, follow: false } };

/**
 * Onglet CALENDRIER (maquette client du 24/09/2026, 15_06_19) : la saison des
 * tournois EVC Arena — ouverts (compte à rebours de la manche), à venir,
 * terminés — quel que soit le tournoi consulté. `?tournoi=<slug>` garde ce
 * tournoi en contexte pour le reste du menu (Accueil, Règles, Meilleurs scores).
 * Le calendrier des manches d'un tournoi reste sur sa page (`#manches`).
 */
export default async function ArenaCalendarPage({ searchParams }: { searchParams: Promise<{ tournoi?: string }> }) {
  const { tournoi } = await searchParams;
  const staff = await currentStaff();
  const visible = (await listTournaments()).filter((t) => isPublic(t) || staff);
  const slug = tournoi && visible.some((t) => t.slug === tournoi) ? tournoi : undefined;
  const groups = await loadTournamentCards();
  const editions = Object.fromEntries(visible.map((t) => [t.slug, t.edition_label]));
  return <SeasonPage groups={groups} editions={editions} slug={slug} calendarHref={slug ? `/arena/${slug}#manches` : undefined} />;
}
