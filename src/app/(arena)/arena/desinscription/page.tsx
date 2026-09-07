import Link from 'next/link';
import { arenaDb, getParticipant } from '@/lib/arena/db';
import { verifySignedLinkToken } from '@/lib/arena/session';
import { ArenaFooter, Panel, Wordmark } from '@/components/arena/arena-shell';
import { ARENA, BODY, Container, DISPLAY } from '@/components/arena/arena-ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Désinscription — EVC Arena', robots: { index: false, follow: false } };

/**
 * Désinscription des informations Major ECN (consentement n° 2, §3.1) par
 * lien signé présent dans chaque email. Les emails opérationnels du tournoi
 * ne sont pas concernés : pour ne plus rien recevoir, le participant supprime
 * son compte depuis son espace.
 */
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  const participantId = t ? verifySignedLinkToken(t, 'unsub') : null;
  let done = false;
  let slug: string | null = null;
  if (participantId) {
    const p = await getParticipant(participantId);
    if (p && !p.anonymized_at) {
      await arenaDb().from('arena_participants').update({ consent_marketing: false, marketing_unsubscribed_at: new Date().toISOString() }).eq('id', p.id);
      const { data } = await arenaDb().from('arena_tournaments').select('slug').eq('id', p.tournament_id).maybeSingle();
      slug = data?.slug ?? null;
      done = true;
    }
  }
  return (
    <>
      <header className="relative z-20" style={{ borderBottom: `1px solid ${ARENA.line}` }}>
        <Container className="flex h-[4.25rem] items-center"><Link href="/arena"><Wordmark /></Link></Container>
      </header>
      <main className="flex-1">
        <Container className="max-w-lg py-14">
          <h1 className="text-3xl font-extrabold" style={{ fontFamily: DISPLAY, letterSpacing: '-0.04em' }}>
            {done ? 'Vous êtes désinscrit(e)' : 'Lien invalide'}
          </h1>
          <Panel className="mt-6">
            <p className="text-[15px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
              {done
                ? 'Vous ne recevrez plus les informations de Major ECN sur la préparation aux EVC. Les emails nécessaires au déroulement du tournoi (convocations, résultats, corrections) continuent de vous parvenir tant que votre inscription est active.'
                : 'Ce lien de désinscription n’est pas reconnu. Vous pouvez gérer vos préférences depuis votre espace participant.'}
            </p>
            {slug && (
              <Link href={`/arena/${slug}/espace`} className="mt-5 inline-block text-sm font-bold underline-offset-4 hover:underline" style={{ color: ARENA.redSoft, fontFamily: BODY }}>
                Ouvrir mon espace
              </Link>
            )}
          </Panel>
        </Container>
      </main>
      <ArenaFooter slug={slug ?? ''} />
    </>
  );
}
