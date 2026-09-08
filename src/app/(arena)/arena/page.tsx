import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { currentStaff, isPublic } from '@/lib/arena/access';
import { listTournaments } from '@/lib/arena/db';
import { STATUS_LABEL } from '@/lib/arena/time';
import { ArenaLogoStack, ArenaWordmark } from '@/components/arena/arena-logo';
import { ArenaFooter, Panel } from '@/components/arena/arena-shell';
import { Container } from '@/components/arena/arena-ui';
import { Stadium } from '@/components/arena/stadium';
import { ARENA, BODY, CAPS, DISPLAY } from '@/components/arena/tokens';

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
      <header className="relative z-20" style={{ borderBottom: `1px solid ${ARENA.line}`, background: 'rgba(11,15,20,0.9)' }}>
        <Container className="flex h-[4.5rem] items-center justify-between">
          <ArenaWordmark compact />
          <Link href="/arena/connexion" className="text-[13px] font-semibold uppercase tracking-[0.16em]" style={{ color: ARENA.textSoft, fontFamily: DISPLAY }}>Connexion</Link>
        </Container>
      </header>
      <main className="flex-1">
        <Stadium photo="stadiumRed" darken={0.6} tint={0.35} beams position="center 40%" className="py-16 sm:py-24">
          <Container className="flex flex-col items-center text-center">
            <ArenaLogoStack size="lg" />
            <h1 className="mt-6 text-[2rem] leading-none sm:text-[2.8rem]" style={{ ...CAPS, color: ARENA.text, letterSpacing: '0.06em' }}>Tournois de QCM par spécialité</h1>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
              Trois manches, douze questions chronométrées une par une, une seule tentative. Un classement cumulé à défendre.
            </p>
          </Container>
        </Stadium>
        <Container className="py-12">
          <div className="grid gap-4 sm:grid-cols-2">
            {visible.length === 0 && (
              <Panel><p className="text-sm" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Aucun tournoi ouvert pour le moment.</p></Panel>
            )}
            {visible.map((t) => (
              <Link key={t.id} href={`/arena/${t.slug}`} className="block transition-transform hover:-translate-y-0.5">
                <Panel accent={isPublic(t)}>
                  <p className="text-[11px]" style={{ ...CAPS, color: ARENA.redSoft, letterSpacing: '0.22em' }}>
                    {t.specialty}{t.edition_label ? ` · ${t.edition_label}` : ''}
                  </p>
                  <h2 className="mt-2 text-[1.5rem] leading-tight" style={{ ...CAPS, color: ARENA.text, letterSpacing: '0.03em' }}>{t.title}</h2>
                  <p className="mt-2 flex items-center justify-between gap-3 text-[12px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
                    <span>{STATUS_LABEL[t.status]}{!isPublic(t) ? ' · visible du personnel uniquement' : ''}</span>
                    <ArrowRight className="h-4 w-4" style={{ color: ARENA.redSoft }} />
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
