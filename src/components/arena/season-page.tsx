import { ArenaBackdropPhoto } from './arena-backdrop';
import { ArenaNavigation } from './arena-navigation';
import { ArenaLegalBar } from './arena-footers';
import { ArenaFxStyles } from './landing/fx';
import { LandingSteps } from './landing/steps';
import { TournamentPicker } from './landing/tournament-picker';
import { PHOTOS } from './tokens';
import type { TournamentCardGroups } from '@/lib/arena/tournament-cards';

/**
 * Page « Choisissez votre tournoi — Saison » (maquettes client du 24/09/2026,
 * 15_06_19 puis 15_08_21) : servie par `/arena/calendrier` (onglet
 * CALENDRIER) et par le hub `/arena` quand plusieurs tournois sont visibles.
 * Photo de l'arène au caducée sous un voile nuit, sélecteur en tête de page,
 * « Comment se déroule un Battle ? » en section claire signée, bandeau légal.
 */
export function SeasonPage({ groups, editions, slug, calendarHref }: { groups: TournamentCardGroups; editions: Record<string, string>; slug?: string; calendarHref?: string }) {
  const cards = [...groups.open, ...groups.upcoming, ...groups.finished];
  return (
    <div className="arena-experience ev-season">
      <ArenaBackdropPhoto src={PHOTOS.heroArena} srcMobile={PHOTOS.heroArenaMobile} veil="dark" position="right top" size="max(140%, 1600px) auto" />
      <ArenaFxStyles />
      <ArenaNavigation slug={slug} />
      <main className="arena-experience-main">
        <TournamentPicker groups={groups} editions={editions} heading="h1" hero source="arena-calendrier" calendarHref={calendarHref} />
        <LandingSteps questions={cards.map((c) => c.questions)} seconds={cards.map((c) => c.seconds)} signature />
      </main>
      <ArenaLegalBar />
    </div>
  );
}
