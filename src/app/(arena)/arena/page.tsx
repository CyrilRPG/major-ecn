import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentStaff, isPublic } from '@/lib/arena/access';
import { listTournaments } from '@/lib/arena/db';
import { STATUS_LABEL } from '@/lib/arena/time';
import { ArenaFooter, Panel, Wordmark } from '@/components/arena/arena-shell';
import { Container } from '@/components/arena/arena-ui';
import { ARENA, BODY, DISPLAY } from '@/components/arena/tokens';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'EVC Arena — tournois de QCM', robots: { index: false, follow: false } };

/**
 * Hub EVC Arena : liste les tournois visibles. Un seul tournoi public → on y
 * va directement. Le personnel voit aussi les brouillons (prévisualisation).
 */
export default async function ArenaHubPage() {
  const staff = await currentStaff();
  const all = await listTournaments();
  const visible = all.filter((t) => isPublic(t) || staff);
  const pub = visible.filter(isPublic);
  if (!staff && pub.length === 1) redirect(`/arena/${pub[0].slug}`);

  return (
    <>
      <header className="relative z-20" style={{ borderBottom: `1px solid ${ARENA.line}` }}>
        <Container className="flex h-[4.25rem] items-center justify-between">
          <Wordmark />
          <Link href="/arena/connexion" className="text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Connexion</Link>
        </Container>
      </header>
      <main className="flex-1">
        <Container className="py-14">
          <h1 className="text-3xl font-extrabold sm:text-5xl" style={{ fontFamily: DISPLAY, letterSpacing: '-0.04em' }}>Tournois de QCM</h1>
          <p className="mt-3 max-w-xl text-[15px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
            Trois manches, douze questions, douze minutes, une seule tentative. Un tournoi par spécialité.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {visible.length === 0 && (
              <Panel><p className="text-sm" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Aucun tournoi ouvert pour le moment.</p></Panel>
            )}
            {visible.map((t) => (
              <Link key={t.id} href={`/arena/${t.slug}`} className="block transition-transform hover:-translate-y-0.5">
                <Panel accent={isPublic(t)}>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ARENA.redSoft, fontFamily: BODY }}>
                    {t.specialty}{t.edition_label ? ` · ${t.edition_label}` : ''}
                  </p>
                  <h2 className="mt-2 text-xl font-extrabold" style={{ fontFamily: DISPLAY, letterSpacing: '-0.02em' }}>{t.title}</h2>
                  <p className="mt-2 text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
                    {STATUS_LABEL[t.status]}{!isPublic(t) ? ' · visible du personnel uniquement' : ''}
                  </p>
                </Panel>
              </Link>
            ))}
          </div>
        </Container>
      </main>
      <ArenaFooter slug={pub[0]?.slug ?? visible[0]?.slug ?? ''} />
    </>
  );
}
