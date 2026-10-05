import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, CheckCircle2, ClipboardCheck, History, MinusCircle, RefreshCcw, XCircle } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { PEDAGO_ENGINE_STUDENT_ENABLED } from '@/lib/modules-flags';
import { moteurOuvert } from '@/lib/moteur/access';
import { itemHistory, type HistoryEntry } from '@/lib/moteur/server/priorities';
import { RESULT_LABEL, STATUS_EXPLANATION, STATUS_LABEL } from '@/lib/moteur/types';
import { fmtDateTime } from '@/lib/suivi/format';
import { cn } from '@/lib/utils';

export const metadata = { title: 'Historique de l’item' };
export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const RESULT_UI = {
  positive: { Icon: CheckCircle2, cls: 'text-green-700 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-500/20' },
  partial: { Icon: MinusCircle, cls: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-500/20' },
  incorrect: { Icon: XCircle, cls: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-500/20' },
} as const;
const KIND_LABEL: Record<HistoryEntry['kind'], string> = {
  resultat: 'Résultat', echeance: 'Échéance', statut: 'Statut', maitrise: 'Maîtrise', reactivation: 'Réactivation', controle: 'Contrôle', activite: 'Activité',
};

/**
 * Historique visible par item (I§38) : date, source et résultat de chaque
 * mesure, trajectoire (« Check-up Incorrect → Révision Correct → … ») et
 * chaque décision du moteur, expliquée (O§33).
 */
export default async function ItemHistoryPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { user, profile } = await requireUser();
  if (!moteurOuvert(profile, PEDAGO_ENGINE_STUDENT_ENABLED)) redirect('/accueil');
  const { itemId } = await params;
  if (!UUID.test(itemId)) notFound();
  const h = await itemHistory(user.id, itemId);
  if (!h) notFound();
  const action = 'inline-flex min-h-10 items-center gap-1.5 rounded-(--radius-button) border border-(--color-border) px-3 text-sm font-semibold text-(--color-ink) hover:border-(--color-primary) hover:text-(--color-primary) focus-ring';

  return (
    <main className="mx-auto w-full max-w-4xl space-y-5 px-3 py-5 sm:px-6">
      <Link href="/mes-priorites" className="inline-flex items-center gap-1.5 text-sm text-(--color-ink-soft) hover:text-(--color-ink)"><ArrowLeft className="h-4 w-4" /> Mes priorités</Link>
      <header className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 sm:p-5">
        <p className="text-xs font-semibold text-(--color-ink-muted)">{h.specialityName}</p>
        <h1 className="mt-0.5 text-xl font-bold text-(--color-ink) sm:text-2xl">{h.name}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-(--color-primary-soft) px-2.5 py-0.5 text-xs font-bold text-(--color-accent)">{STATUS_LABEL[h.status]}</span>
          {h.controlPending && <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-950 dark:bg-orange-500/20 dark:text-orange-100">Contrôle attendu</span>}
          {h.nextReview && <span className="text-xs text-(--color-ink-soft)">Prochaine réactivation : {new Date(`${h.nextReview.slice(0, 10)}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span>}
        </p>
        <p className="mt-2 text-sm text-(--color-ink-soft)">{h.reason ?? STATUS_EXPLANATION[h.status]}</p>
        {h.needReasons.length > 0 && <ul className="mt-1 space-y-0.5 text-xs text-(--color-ink-muted)">{h.needReasons.slice(0, 4).map((r) => <li key={r}>• {r}</li>)}</ul>}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/revisions-transversales/ciblee?item=${h.itemId}`} className={cn(action, 'border-(--color-primary) bg-(--color-primary) text-white hover:bg-(--color-primary-deep) hover:text-white')}><RefreshCcw className="h-4 w-4" aria-hidden /> Réviser cet item</Link>
          <Link href={`/cours/${h.itemId}/fiche`} className={action}><BookOpen className="h-4 w-4" aria-hidden /> Fiche</Link>
          <Link href={`/cours/${h.itemId}/qcm`} className={action}><ClipboardCheck className="h-4 w-4" aria-hidden /> Entraînement</Link>
          {h.plannerActive && <Link href="/planificateur" className={action}><CalendarDays className="h-4 w-4" aria-hidden /> Planning</Link>}
        </div>
      </header>

      <section aria-labelledby="trajectoire" className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 sm:p-5">
        <h2 id="trajectoire" className="text-base font-bold text-(--color-ink)">Trajectoire</h2>
        {h.trajectory.length === 0 ? (
          <p className="mt-2 text-sm text-(--color-ink-muted)">Aucun résultat évaluatif sur cet item pour le moment.</p>
        ) : (
          <ol className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-xs" aria-label="Résultats successifs">
            {h.trajectory.map((t, i) => {
              const R = RESULT_UI[t.result];
              return (
                <li key={`${t.at}-${i}`} className="flex items-center gap-1.5">
                  <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold', R.bg, R.cls)} title={fmtDateTime(t.at)}>
                    <R.Icon className="h-3.5 w-3.5" aria-hidden /> {t.source} · {RESULT_LABEL[t.result]}
                  </span>
                  {i < h.trajectory.length - 1 && <ArrowRight className="h-3 w-3 text-(--color-ink-muted)" aria-hidden />}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section aria-labelledby="historique" className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 sm:p-5">
        <h2 id="historique" className="flex items-center gap-2 text-base font-bold text-(--color-ink)"><History className="h-4 w-4" aria-hidden /> Historique détaillé</h2>
        {h.entries.length === 0 ? (
          <p className="mt-2 text-sm text-(--color-ink-muted)">Rien n’est encore enregistré pour cet item.</p>
        ) : (
          <ol className="mt-3 space-y-2">
            {h.entries.map((e, i) => {
              const R = e.result ? RESULT_UI[e.result] : null;
              return (
                <li key={`${e.at}-${i}`} className="flex gap-3 rounded-xl border border-(--color-border) p-3 text-sm">
                  <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', R ? R.bg : 'bg-(--color-surface-soft)')} aria-hidden>
                    {R ? <R.Icon className={cn('h-4 w-4', R.cls)} /> : <History className="h-4 w-4 text-(--color-ink-muted)" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-(--color-ink)">{e.label}</p>
                    {e.detail && <p className="mt-0.5 text-xs text-(--color-ink-soft)">{e.detail}</p>}
                  </div>
                  <div className="shrink-0 text-right text-[11px] text-(--color-ink-muted)">
                    <p className="font-semibold uppercase tracking-wide">{KIND_LABEL[e.kind]}</p>
                    <p>{fmtDateTime(e.at)}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </main>
  );
}
