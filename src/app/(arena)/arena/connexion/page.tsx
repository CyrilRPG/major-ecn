import Link from 'next/link';
import { ArenaLogoStack, ArenaWordmark } from '@/components/arena/arena-logo';
import { ArenaFooter, Notice } from '@/components/arena/arena-shell';
import { Container } from '@/components/arena/arena-ui';
import { LoginForm } from '@/components/arena/login-form';
import { Stadium } from '@/components/arena/stadium';
import { ARENA, BODY, CAPS } from '@/components/arena/tokens';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Connexion — EVC Arena', robots: { index: false, follow: false } };

const ERRORS: Record<string, string> = {
  lien: 'Ce lien n’est plus valable. Demandez un nouveau lien de connexion.',
  expire: 'Ce lien de connexion a expiré (il est valable une heure). Demandez-en un nouveau.',
};

/** Connexion par lien magique (sans mot de passe), carte centrée sous les projecteurs. */
export default async function ArenaLoginPage({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const { erreur } = await searchParams;
  return (
    <>
      <header className="relative z-20" style={{ borderBottom: `1px solid ${ARENA.line}`, background: 'rgba(11,15,20,0.9)' }}>
        <Container className="flex h-[4.5rem] items-center justify-between">
          <Link href="/arena" aria-label="EVC Arena — accueil"><ArenaWordmark compact /></Link>
        </Container>
      </header>
      <main className="flex-1">
        <Stadium photo="floodlights" darken={0.6} tint={0.22} position="center 30%" className="flex min-h-[calc(100svh-4.5rem)] items-center py-12">
          <Container className="max-w-md">
            <div className="rounded-[1.6rem] p-6 text-center sm:p-9" style={{ background: 'rgba(11,15,20,0.86)', boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}, 0 50px 100px -40px rgba(0,0,0,0.95)`, backdropFilter: 'blur(10px)' }}>
              <ArenaLogoStack size="sm" />
              <h1 className="mt-6 text-[2rem] leading-none sm:text-[2.4rem]" style={{ ...CAPS, color: ARENA.text }}>Connexion</h1>
              <p className="mt-3 text-[14px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                Pas de mot de passe : indiquez l’adresse email de votre inscription, vous recevrez un lien de connexion.
              </p>
              <div className="mt-7 space-y-4 text-left">
                {erreur && ERRORS[erreur] && <Notice tone="red">{ERRORS[erreur]}</Notice>}
                <LoginForm />
              </div>
              <p className="mt-6 text-[13px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
                Pas encore inscrit(e) ? <Link href="/arena" className="font-semibold underline-offset-4 hover:underline" style={{ color: ARENA.redSoft }}>Voir les tournois</Link>
              </p>
            </div>
          </Container>
        </Stadium>
      </main>
      <ArenaFooter slug="" />
    </>
  );
}
