import { redirect } from 'next/navigation';
import { ArenaLogoStack } from '@/components/arena/arena-logo';
import { ArenaPage, Notice } from '@/components/arena/arena-shell';
import { Container } from '@/components/arena/arena-ui';
import { LocalTime } from '@/components/arena/countdown';
import { RegisterForm } from '@/components/arena/register-form';
import { Stadium } from '@/components/arena/stadium';
import { ARENA, BODY, CAPS } from '@/components/arena/tokens';
import { ENROLLABLE_SPECIALTIES } from '@/lib/data/enrollable-colleges';
import { arenaMetadata, loadArenaPage } from '@/lib/arena/page-context';
import { roundState } from '@/lib/arena/time';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const ctx = await loadArenaPage(slug);
  return arenaMetadata(ctx.snap, { title: 'Inscription', noindex: true });
}

/**
 * Inscription (§3, §2.3 — maquette « 1. Inscription ») : carte centrée sur
 * les tribunes, logo, accroche, formulaire ; le formulaire indique clairement
 * quelles manches restent jouables au moment de l'inscription.
 */
export default async function RegisterPage({ params, searchParams }: Params) {
  const { slug } = await params;
  const sp = await searchParams;
  const ctx = await loadArenaPage(slug);
  if (ctx.participant) redirect(`/arena/${slug}/espace`);
  const t = ctx.snap.tournament;
  const now = new Date();
  const playable = ctx.snap.rounds.filter((r) => roundState(r, now) !== 'closed');
  const closed = ctx.snap.rounds.filter((r) => roundState(r, now) === 'closed');

  const names = ENROLLABLE_SPECIALTIES.map((s) => s.name);
  const specialties = names.includes(t.specialty) ? [t.specialty, ...names.filter((n) => n !== t.specialty)] : [t.specialty, ...names];
  const utm: Record<string, string> = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) if (sp[k]) utm[k] = sp[k] as string;
  const source = sp.i ? 'invitation' : sp.utm_source ?? (sp.src ?? null);

  return (
    <ArenaPage nav={ctx.nav}>
      <Stadium photo="seatsRed" darken={0.72} tint={0.2} position="center 40%" className="py-10 sm:py-16">
        <Container className="max-w-xl">
          <div className="rounded-[1.6rem] p-6 sm:p-9" style={{ background: 'rgba(11,15,20,0.88)', boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}, 0 50px 100px -40px rgba(0,0,0,0.95)`, backdropFilter: 'blur(10px)' }}>
            <div className="flex flex-col items-center text-center">
              <ArenaLogoStack size="md" />
              <p className="mt-4 text-[1.35rem] leading-tight sm:text-[1.6rem]" style={{ ...CAPS, color: ARENA.text, letterSpacing: '0.04em' }}>
                Relevez le défi. <span style={{ color: ARENA.red }}>Mesurez-vous aux meilleurs.</span>
              </p>
              <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                {t.specialty}{t.edition_label ? ` · ${t.edition_label}` : ''}. Aucun paiement, aucune dotation : un entraînement ludique entre médecins candidats aux EVC.
              </p>
            </div>

            {!ctx.registrationOpen ? (
              <div className="mt-8"><Notice tone="red">Les inscriptions sont closes : le tournoi est terminé.</Notice></div>
            ) : (
              <>
                <div className="mt-7">
                  <Notice tone={closed.length ? 'amber' : 'neutral'}>
                    {closed.length === 0 ? (
                      <>Toutes les manches restent jouables. {playable[0]?.opens_at && <>Première manche le <LocalTime iso={playable[0].opens_at} />.</>}</>
                    ) : playable.length === 0 ? (
                      'Toutes les manches sont clôturées.'
                    ) : (
                      <>
                        Manche{closed.length > 1 ? 's' : ''} déjà clôturée{closed.length > 1 ? 's' : ''} : {closed.map((r) => `M${r.number}`).join(', ')}. Vous pouvez encore jouer {playable.map((r) => `M${r.number}`).join(' et ')}
                        {playable.length >= t.min_rounds_final ? ` et rester éligible au classement final (${t.min_rounds_final} manches sur ${ctx.snap.rounds.length}).` : ` ; le classement final exige ${t.min_rounds_final} manches, mais chaque manche jouée compte pour le classement provisoire et vous recevrez toutes les corrections.`}
                      </>
                    )}
                  </Notice>
                </div>
                <div className="mt-6">
                  <RegisterForm slug={slug} specialties={specialties} defaultSpecialty={t.specialty} inviteCode={sp.i ?? null} source={source} utm={Object.keys(utm).length ? utm : null} />
                </div>
              </>
            )}
          </div>
        </Container>
      </Stadium>
    </ArenaPage>
  );
}
