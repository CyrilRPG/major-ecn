import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { currentStaff, isPublic } from '@/lib/arena/access';
import { listTournaments } from '@/lib/arena/db';
import { STATUS_LABEL } from '@/lib/arena/time';
import { ArenaLogoStack } from '@/components/arena/arena-logo';
import { ArenaFooter } from '@/components/arena/arena-shell';
import { ArenaNavigation } from '@/components/arena/arena-navigation';
import { arenaSection, arenaSectionHref } from '@/lib/arena/navigation';
import { Container } from '@/components/arena/arena-ui';
import { ArenaFxStyles, Enter, GoldEyebrow, GoldRule, Reveal } from '@/components/arena/landing/fx';
import { Stadium } from '@/components/arena/stadium';
import { ARENA, BODY, CAPS, DISPLAY, HEADLINE } from '@/components/arena/tokens';

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
  const destinationLabel = { accueil: 'Entrer dans l’arène', regles: 'Voir les règles', calendrier: 'Voir le calendrier', classement: 'Voir les meilleurs scores' }[section];
  const pickerTitle = { accueil: 'Choisissez votre tournoi', regles: 'Les règles de votre tournoi', calendrier: 'Le calendrier de votre tournoi', classement: 'Les meilleurs scores par tournoi' }[section];


  return (
    <>
      <ArenaFxStyles />
      <ArenaNavigation />

      <main className="flex-1">
        <Stadium
          photo="heroArena"
          darken={0.34}
          tint={0.12}
          gold={0}
          topShade={0.78}
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

        <section id="tournois" style={{ background: ARENA.bg }}>
          <Container className="py-14 sm:py-20">
            <Reveal className="flex flex-col items-center text-center">
              <GoldEyebrow align="center">Les arènes</GoldEyebrow>
              <h2 className="mt-4 text-[2rem] leading-none sm:text-[2.6rem]" style={{ fontFamily: HEADLINE, color: ARENA.text, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                {pickerTitle}
              </h2>
            </Reveal>

            {visible.length === 0 ? (
              <Reveal delay={0.1} className="mx-auto mt-10 max-w-xl">
                <div
                  className="rounded-2xl px-6 py-10 text-center"
                  style={{ background: ARENA.surface, boxShadow: `inset 0 0 0 1px ${ARENA.line}, 0 24px 48px -32px rgba(0,0,0,0.9)` }}
                >
                  <p className="text-[15px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                    Aucun tournoi ouvert pour le moment. Le prochain sera annoncé ici et par courriel.
                  </p>
                </div>
              </Reveal>
            ) : (
              <div className="mt-10 grid gap-5 sm:grid-cols-2">
                {visible.map((t, i) => {
                  const ouvert = isPublic(t);
                  return (
                    <Reveal key={t.id} delay={i * 0.08}>
                      <Link href={arenaSectionHref(t.slug, section)} className="arena-lift block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4" style={{ outlineColor: ARENA.gold }}>
                        <article
                          className="flex h-full flex-col rounded-2xl p-6 sm:p-7"
                          style={{
                            background: ouvert ? 'linear-gradient(180deg, rgba(228,0,43,0.10), rgba(20,26,34,0.92))' : ARENA.surface,
                            boxShadow: `inset 0 0 0 1px ${ouvert ? 'rgba(228,0,43,0.45)' : ARENA.line}, 0 24px 48px -32px rgba(0,0,0,0.9)`,
                          }}
                        >
                          <p className="text-[11px]" style={{ ...CAPS, color: ARENA.redSoft, letterSpacing: '0.22em' }}>
                            {t.specialty}{t.edition_label ? ` · ${t.edition_label}` : ''}
                          </p>
                          <h3 className="mt-3 text-[1.6rem] leading-tight" style={{ fontFamily: HEADLINE, color: ARENA.text, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                            {t.title}
                          </h3>
                          <GoldRule width={64} className="mt-4" />
                          <p className="mt-4 text-[13px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                            {t.questions_per_round} questions par manche · {t.seconds_per_question} s par question · une seule tentative
                          </p>
                          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-5" style={{ borderTop: `1px solid ${ARENA.line}` }}>
                            <span
                              className="inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white"
                              style={{ background: ouvert ? ARENA.red : ARENA.raised2, fontFamily: DISPLAY }}
                            >
                              {STATUS_LABEL[t.status]}
                            </span>
                            <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: ARENA.gold, fontFamily: DISPLAY }}>
                              {destinationLabel} <ArrowRight className="h-4 w-4" />
                            </span>
                          </div>
                          {!ouvert && (
                            <p className="mt-3 text-[11.5px] font-bold uppercase tracking-[0.18em]" style={{ color: ARENA.preview, fontFamily: BODY }}>
                              Visible du personnel uniquement
                            </p>
                          )}
                        </article>
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
            )}
          </Container>
        </section>
      </main>
      <ArenaFooter slug={pub[0]?.slug ?? visible[0]?.slug ?? ''} />
    </>
  );
}
