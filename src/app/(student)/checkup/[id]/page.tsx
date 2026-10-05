import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { Smartphone } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { CHECKUP_STUDENT_ENABLED } from '@/lib/modules-flags';
import { moteurOuvert } from '@/lib/moteur/access';
import { CheckupError, runnerView } from '@/lib/checkup/server/service';
import { CheckupRunner } from '@/components/student/checkup/runner';
import { CHECKUP_DEVICE_COOKIE as DEVICE_COOKIE } from '@/lib/checkup/device';

export const metadata = { title: 'EVC Check-up en cours' };
export const dynamic = 'force-dynamic';

/** Passation d'un Check-up : uniquement sur l'appareil de départ (§28, §29). */
export default async function CheckupRunPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, profile } = await requireUser();
  if (!moteurOuvert(profile, CHECKUP_STUDENT_ENABLED)) redirect('/accueil');
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const device = (await cookies()).get(DEVICE_COOKIE)?.value ?? '';
  let view;
  try {
    view = await runnerView(user.id, id, device);
  } catch (e) {
    if (e instanceof CheckupError && e.code === 'introuvable') notFound();
    throw e;
  }
  if ('redirect' in view) redirect(view.redirect);
  if ('blocked' in view) {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--color-primary-soft) text-(--color-primary)"><Smartphone className="h-7 w-7" /></span>
        <h1 className="mt-4 text-xl font-bold text-(--color-ink)">Check-up en cours sur un autre appareil</h1>
        <p className="mt-2 text-sm text-(--color-ink-soft)">{view.blocked}</p>
        <p className="mt-2 text-xs text-(--color-ink-muted)">Le chronomètre continue. Si vous n’avez plus accès à cet appareil, contactez l’équipe pédagogique.</p>
        <Link href="/checkup" className="mt-6 text-sm font-semibold text-(--color-primary) underline-offset-4 hover:underline">Retour à l’EVC Check-up</Link>
      </main>
    );
  }
  return <CheckupRunner view={view} />;
}
