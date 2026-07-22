import { redirect } from 'next/navigation';
import { CalendarClock } from 'lucide-react';
import { getCurrentUserAndProfile } from '@/lib/auth/get-profile';
import { getAccessInfo } from '@/lib/auth/access';
import { BrandLogo } from '@/components/brand/brand-logo';
import { LogoutButton } from './logout-button';

export const metadata = { title: 'Accès expiré' };

/**
 * Page de blocage à expiration de l'accès (session EVC).
 * Volontairement HORS du layout (student) : requireUser() y redirige les
 * étudiants expirés — la placer dedans créerait une boucle de redirection.
 */
export default async function AccesExpirePage() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile) redirect('/login');

  const { accessEnd, expired } = getAccessInfo(profile);
  // Accès encore valide (ou renouvelé entre-temps) → retour à la plateforme.
  if (!expired) redirect('/accueil');

  const endLabel = accessEnd
    ? new Date(accessEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-(--color-surface-soft) px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-(--color-border) bg-(--color-surface) p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex justify-center"><BrandLogo /></div>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <CalendarClock className="h-6 w-6 text-red-600" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">Votre accès a expiré</h1>
        <p className="mt-2 text-sm text-(--color-ink-soft)">
          {endLabel
            ? <>Votre période d&apos;accès à la plateforme s&apos;est terminée le <strong>{endLabel}</strong>.</>
            : <>Votre période d&apos;accès à la plateforme est terminée.</>}
        </p>
        <p className="mt-2 text-sm text-(--color-ink-soft)">
          Pour poursuivre votre préparation, renouvelez votre inscription. Si vous venez de renouveler,
          reconnectez-vous : votre accès sera réactivé automatiquement.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <a
            href="/tarifs"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-(--color-primary) px-4 text-sm font-bold text-white hover:opacity-90"
          >
            Voir les formules
          </a>
          <a
            href="/contact"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-(--color-border) bg-(--color-surface) px-4 text-sm font-bold text-(--color-ink) hover:bg-(--color-sand-100)"
          >
            Contacter l&apos;équipe
          </a>
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
