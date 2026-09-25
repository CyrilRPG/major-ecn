import Link from 'next/link';
import { arenaDb, getParticipant } from '@/lib/arena/db';
import { verifySignedLinkToken } from '@/lib/arena/session';
import { unsubscribeAction } from './actions';
import { ArrowRight } from 'lucide-react';
import { ArenaFooter } from '@/components/arena/arena-shell';
import { ArenaNavigation } from '@/components/arena/arena-navigation';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Désinscription — EVC Arena', robots: { index: false, follow: false } };

/**
 * Désinscription des informations Major ECN (consentement n° 2, §3.1) par
 * lien signé présent dans chaque email. Les emails opérationnels du tournoi
 * ne sont pas concernés : pour ne plus rien recevoir, le participant supprime
 * son compte depuis son espace.
 */
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ t?: string; fait?: string }> }) {
  const { t, fait } = await searchParams;
  const participantId = t ? verifySignedLinkToken(t, 'unsub') : null;
  // Le GET ne modifie rien (antivirus de messagerie) : un bouton confirme, l'action enregistre.
  let valid = false;
  let slug: string | null = null;
  if (participantId) {
    const p = await getParticipant(participantId);
    if (p && !p.anonymized_at) {
      const { data } = await arenaDb().from('arena_tournaments').select('slug').eq('id', p.tournament_id).maybeSingle();
      slug = data?.slug ?? null;
      valid = true;
    }
  }
  const done = valid && (fait === '1');
  return (
    <>
      <ArenaNavigation slug={slug ?? undefined} />
      <main className="flex-1 ev-doc">
        <div className="ev-wrap ev-doc-wrap">
          <p className="ev-eyebrow"><span aria-hidden className="ev-rule" />Informations Major ECN</p>
          <h1 className="ev-title-xl">
            {done ? <>Vous êtes <em>désinscrit(e)</em></> : valid ? <>Se <em>désinscrire</em></> : <>Lien <em>invalide</em></>}
          </h1>
          <div className="ev-doc-panel">
            <p>
              {!done && valid
                ? 'Confirmez que vous ne souhaitez plus recevoir les informations de Major ECN sur la préparation aux EVC. Les emails nécessaires au déroulement du tournoi (convocations, résultats, corrections) continuent de vous parvenir tant que votre inscription est active.'
                : done
                ? 'Vous ne recevrez plus les informations de Major ECN sur la préparation aux EVC. Les emails nécessaires au déroulement du tournoi (convocations, résultats, corrections) continuent de vous parvenir tant que votre inscription est active.'
                : 'Ce lien de désinscription n’est pas reconnu. Vous pouvez gérer vos préférences depuis votre espace participant.'}
            </p>
            {((valid && !done) || slug) && (
              <div className="ev-doc-actions">
                {valid && !done && (
                  <form action={unsubscribeAction}>
                    <input type="hidden" name="t" value={t} />
                    <button type="submit" className="ev-btn ev-btn--red">Confirmer ma désinscription <ArrowRight aria-hidden /></button>
                  </form>
                )}
                {slug && <Link href={`/arena/${slug}/espace`} className="ev-link-caps">Ouvrir mon espace <ArrowRight aria-hidden /></Link>}
              </div>
            )}
          </div>
        </div>
      </main>
      <ArenaFooter slug={slug ?? ''} />
    </>
  );
}
