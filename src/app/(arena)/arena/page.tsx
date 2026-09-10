import { redirect } from 'next/navigation';
import { currentStaff, isPublic } from '@/lib/arena/access';
import { listTournaments } from '@/lib/arena/db';
import { loadTournamentCards } from '@/lib/arena/cards-data';
import { ArenaLogoStack } from '@/components/arena/arena-logo';
import { ArenaFooter } from '@/components/arena/arena-shell';
import { ArenaNavigation } from '@/components/arena/arena-navigation';
import { arenaSection, arenaSectionHref } from '@/lib/arena/navigation';
import { Container } from '@/components/arena/arena-ui';
import { ArenaFxStyles, Enter, GoldRule } from '@/components/arena/landing/fx';
import { TournamentPicker } from '@/components/arena/landing/tournament-picker';
import { Stadium } from '@/components/arena/stadium';
import { ARENA, BODY, CAPS } from '@/components/arena/tokens';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'EVC Arena — tournois de QCM', robots: { index: false, follow: false } };

/**
 * Hub EVC Arena : liste les tournois visibles. Un seul tournoi public → on y
 * va directement. Le personnel voit aussi les brouillons (prévisualisation).
 *
 * Mise au modèle client du 07/09/2026 (08/09/2026) : le hub était resté sur la
 * mise en page d'origine — bandeau plat, hero court, cartes sans relief —
 * alors que la landing d'un tournoi avait été refaite. Il reprend désormais la
 * même scène (photo d'arène en travelling, casque + wordmark, filet doré,
 * sur-titres dorés, entrées animées) et la même carte que les manches.
 */
export default async function ArenaHubPage({ searchParams }: { searchParams: Promise<{ vue?: string }> }) {
  const section = arenaSection((await searchParams).vue);
  const staff = await currentStaff();
  const all = await listTournaments();
  const visible = all.filter((t) => isPublic(t) || staff);
  const pub = visible.filter(isPublic);
  if (!staff && pub.length === 1) redirect(arenaSectionHref(pub[0].slug, section));
  const cards = await loadTournamentCards();

  return (
    <>
      <ArenaFxStyles />
      <ArenaNavigation />

      <main className="flex-1">
        <Stadium
          photo="heroArena"
          darken={0.12}
          tint={0.08}
          gold={0}
          topShade={0.45}
          animate
          priority
          position="center 30%"
          className="flex min-h-[calc(72svh-4.5rem)]"
        >
          <Container className="flex flex-1 flex-col items-center justify-center py-12 text-center sm:py-16">
            <Enter delay={0.05} y={26} scale={0.96}>
              <div className="origin-bottom scale-[0.72] sm:scale-90 lg:scale-100"><ArenaLogoStack size="xl" priority /></div>
            </Enter>
            <Enter delay={0.25}>
              <p
                className="mt-4 text-[1.1rem] sm:text-[1.5rem] lg:text-[1.7rem]"
                style={{ ...CAPS, color: ARENA.text, letterSpacing: '0.2em', fontWeight: 500, textShadow: '0 6px 24px rgba(0,0,0,0.7)' }}
              >
                Le tournoi de QCM des EVC
              </p>
              <GoldRule align="center" width={140} className="mt-3" />
              <p
                className="mt-3 text-[12px] sm:text-[14px]"
                style={{ ...CAPS, color: ARENA.goldSoft, letterSpacing: '0.16em', fontWeight: 500, textShadow: '0 6px 24px rgba(0,0,0,0.7)' }}
              >
                Tournois par spécialité
              </p>
              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed" style={{ color: ARENA.text, fontFamily: BODY, textShadow: '0 6px 24px rgba(0,0,0,0.7)' }}>
                Trois manches, des questions chronométrées une par une, une seule tentative. Un classement cumulé à défendre.
              </p>
            </Enter>
          </Container>
        </Stadium>

        {/* « Choisissez votre tournoi » — maquette client du 10/09/2026 (une carte
            par spécialité, visuel du tournoi, statut de manche, compte à rebours,
            encart « Autres spécialités à venir »). */}
        <TournamentPicker groups={cards} calendarHref={pub[0] ? arenaSectionHref(pub[0].slug, 'calendrier') : undefined} source="arena-hub" />
      </main>
      <ArenaFooter slug={pub[0]?.slug ?? visible[0]?.slug ?? ''} />
    </>
  );
}
