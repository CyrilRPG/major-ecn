import Link from 'next/link';
import { ForgotPasswordForm } from './forgot-password-form';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';

export const metadata = { title: 'Mot de passe oublié — Major ECN' };

export default function ForgotPasswordPage() {
  return (
    <div className="theme-manus relative isolate flex min-h-screen flex-col bg-(--color-surface) font-sans text-(--color-ink)">
      <MarketingHeader />
      <main className="relative flex-1">
        <div aria-hidden className="absolute -right-32 -top-32 -z-10 h-[420px] w-[420px] rounded-full bg-(--color-primary)/12 blur-[120px]" />
        <div className="mx-auto flex max-w-md flex-col px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-7 shadow-(--shadow-soft)">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-(--color-ink-soft)">
              Mot de passe oublié
            </h2>
            <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-(--color-ink)">
              On vous envoie un lien
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-(--color-ink-soft)">
              Entrez votre adresse email — vous recevrez un lien sécurisé pour choisir un nouveau mot de passe.
              Fonctionne pour les comptes Élèves et Enseignants.
            </p>
            <div className="mt-6">
              <ForgotPasswordForm />
            </div>
            <p className="mt-6 rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-4 py-3 text-xs leading-relaxed text-(--color-ink-soft)">
              Vous participez à <strong>EVC Arena</strong> (tournoi de QCM) ? Il n’y a pas de mot de passe : la connexion se fait par un lien envoyé à votre adresse email, depuis <Link href="/arena/connexion" className="font-semibold text-(--color-primary) underline-offset-4 hover:underline">la page de connexion de l’arène</Link>.
            </p>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
