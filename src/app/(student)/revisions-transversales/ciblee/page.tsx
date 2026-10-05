import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, BookOpen, Target } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { PEDAGO_ENGINE_STUDENT_ENABLED } from '@/lib/modules-flags';
import { moteurOuvert } from '@/lib/moteur/access';
import { composeTargeted } from '@/lib/moteur/server/targeted';
import { TargetedRunner } from '@/components/student/moteur/targeted-runner';

export const metadata = { title: 'Révision ciblée' };
export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MOTIFS: Record<string, string> = {
  revision: 'Révision prioritaire',
  reactivation: 'Réactivation',
  controle: 'Contrôle',
  checkup: 'Lacunes de votre EVC Check-up',
  lacunes: 'Vos lacunes',
};

/**
 * Révision ciblée d'un ou plusieurs items (programme du jour, lacunes d'un
 * Check-up) : questions de l'item les moins récemment vues, dossiers entiers,
 * correction après chaque validation.
 */
export default async function RevisionCibleePage({ searchParams }: { searchParams: Promise<{ item?: string; items?: string; motif?: string }> }) {
  const { user, profile } = await requireUser();
  if (!moteurOuvert(profile, PEDAGO_ENGINE_STUDENT_ENABLED)) redirect('/revisions-transversales');
  const sp = await searchParams;
  const ids = Array.from(new Set([sp.item ?? '', ...(sp.items ?? '').split(',')].map((s) => s.trim()).filter((s) => UUID.test(s)))).slice(0, 12);
  const motif = sp.motif && MOTIFS[sp.motif] ? sp.motif : 'revision';
  if (ids.length === 0) redirect('/revisions-transversales');

  const session = await composeTargeted(user.id, profile.permission_scope, ids, motif);
  const names = 'error' in session ? [] : Object.entries(session.itemNames);

  return (
    <main className="mx-auto w-full max-w-3xl space-y-5 px-3 py-5 sm:px-6">
      <Link href="/accueil" className="inline-flex items-center gap-1.5 text-sm text-(--color-ink-soft) hover:text-(--color-ink)"><ArrowLeft className="h-4 w-4" /> Mon programme du jour</Link>
      <header>
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-(--color-primary)"><Target className="h-3.5 w-3.5" /> {MOTIFS[motif]}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-(--color-ink)">Révision ciblée</h1>
        {names.length > 0 && <p className="mt-1 text-sm text-(--color-ink-soft)">{names.map(([, n]) => n).join(' · ')}</p>}
        <p className="mt-2 text-xs text-(--color-ink-muted)">Répondez, validez, lisez la correction : chaque réponse met à jour votre profil pédagogique.</p>
      </header>
      {'error' in session ? (
        <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 text-sm">
          <p className="font-semibold text-(--color-ink)">{session.error}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {ids.map((id) => (
              <Link key={id} href={`/cours/${id}/fiche`} className="inline-flex items-center gap-1.5 rounded-(--radius-button) border border-(--color-border) px-3 py-2 text-sm font-medium text-(--color-ink) hover:bg-(--color-surface-soft)"><BookOpen className="h-4 w-4" /> Relire la fiche</Link>
            ))}
            <Link href="/accueil" className="inline-flex items-center rounded-(--radius-button) bg-(--color-primary) px-3 py-2 text-sm font-semibold text-white hover:bg-(--color-primary-deep)">Retour à l’accueil</Link>
          </div>
        </section>
      ) : (
        <>
          <TargetedRunner token={session.token} questions={session.questions} />
          <nav aria-label="Ressources de l’item" className="flex flex-wrap gap-2 border-t border-(--color-border) pt-4 text-sm">
            {names.map(([id, n]) => (
              <Link key={id} href={`/cours/${id}/fiche`} className="inline-flex items-center gap-1.5 rounded-full border border-(--color-border) px-3 py-1.5 text-xs font-medium text-(--color-ink-soft) hover:text-(--color-ink)"><BookOpen className="h-3.5 w-3.5" /> Fiche · {n}</Link>
            ))}
          </nav>
        </>
      )}
    </main>
  );
}
