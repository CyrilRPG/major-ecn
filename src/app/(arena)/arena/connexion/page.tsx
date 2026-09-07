import Link from 'next/link';
import { ArenaFooter, Notice, Panel, Wordmark } from '@/components/arena/arena-shell';
import { Container } from '@/components/arena/arena-ui';
import { ARENA, BODY, DISPLAY } from '@/components/arena/tokens';
import { LoginForm } from '@/components/arena/login-form';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Connexion — EVC Arena', robots: { index: false, follow: false } };

const ERRORS: Record<string, string> = {
  lien: 'Ce lien n’est plus valable. Demandez un nouveau lien de connexion.',
  expire: 'Ce lien de connexion a expiré (il est valable une heure). Demandez-en un nouveau.',
};

export default async function ArenaLoginPage({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const { erreur } = await searchParams;
  return (
    <>
      <header className="relative z-20" style={{ borderBottom: `1px solid ${ARENA.line}` }}>
        <Container className="flex h-[4.25rem] items-center justify-between">
          <Link href="/arena"><Wordmark /></Link>
        </Container>
      </header>
      <main className="flex-1">
        <Container className="max-w-lg py-14">
          <h1 className="text-3xl font-extrabold sm:text-4xl" style={{ fontFamily: DISPLAY, letterSpacing: '-0.04em' }}>Connexion</h1>
          <p className="mt-3 text-[15px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
            Pas de mot de passe : indiquez l’adresse email de votre inscription, vous recevrez un lien de connexion.
          </p>
          <div className="mt-8 space-y-4">
            {erreur && ERRORS[erreur] && <Notice tone="red">{ERRORS[erreur]}</Notice>}
            <Panel><LoginForm /></Panel>
          </div>
          <p className="mt-6 text-sm" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
            Pas encore inscrit(e) ? <Link href="/arena" className="font-bold underline-offset-4 hover:underline" style={{ color: ARENA.textSoft }}>Voir les tournois</Link>
          </p>
        </Container>
      </main>
      <ArenaFooter slug="" />
    </>
  );
}
