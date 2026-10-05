import Link from 'next/link';
import { ArrowRight, Clock, RefreshCcw } from 'lucide-react';
import { dueRevisions } from '@/lib/moteur/server/today';
import { TEXTS } from '@/lib/engagement/types';

/**
 * Révisions dues selon le profil pédagogique (moteur central) : les lacunes
 * du Check-up, les erreurs d'entraînement ou d'EVC Arena et les
 * réactivations J+7/J+14/J+30/J+60 arrivent ici sans que le candidat ait à
 * les transférer lui-même (I§62). Révisions proposées / réalisées (§14).
 */
export async function PedagoDue({ userId }: { userId: string }) {
  const due = await dueRevisions(userId).catch(() => null);
  if (!due) return null;
  if (due.items.length === 0 && due.assigned === 0) return null;
  const all = due.items.slice(0, 12).map((i) => i.itemId).join(',');
  return (
    <section aria-labelledby="revisions-dues" className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="revisions-dues" className="flex items-center gap-2 text-base font-bold text-(--color-ink)">
            <RefreshCcw className="h-4 w-4 text-(--color-primary)" aria-hidden /> Vos révisions du jour
          </h2>
          <p className="mt-0.5 text-sm text-(--color-ink-soft)">
            {due.assigned > 0
              ? <><strong className="text-(--color-ink)">{due.completed}</strong> réalisée{due.completed > 1 ? 's' : ''} sur <strong className="text-(--color-ink)">{due.assigned}</strong> proposée{due.assigned > 1 ? 's' : ''} ces 14 derniers jours.</>
              : 'Révisions programmées par votre profil pédagogique.'}
          </p>
          {due.vigilance && <p className="mt-1 text-xs font-semibold text-amber-800 dark:text-amber-200">{TEXTS.vigilance.transversalTitle}</p>}
        </div>
        {due.items.length > 0 && (
          <Link href={`/revisions-transversales/ciblee?items=${all}&motif=revision`} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-(--radius-button) bg-(--color-primary) px-4 text-sm font-semibold text-white hover:bg-(--color-primary-deep) focus-ring">
            {TEXTS.vigilance.ctaRevisions} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </div>
      {due.items.length > 0 ? (
        <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          {due.items.slice(0, 8).map((i) => (
            <li key={i.itemId}>
              <Link href={`/revisions-transversales/ciblee?item=${i.itemId}`} className="flex items-start gap-3 rounded-xl border border-(--color-border) p-3 text-sm hover:border-(--color-primary)/40 focus-ring">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-(--color-ink)">{i.name}</span>
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-(--color-primary)">{i.label}</span>
                  {i.reason && <span className="mt-0.5 block line-clamp-2 text-xs text-(--color-ink-soft)">{i.reason}</span>}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs text-(--color-ink-muted)"><Clock className="h-3.5 w-3.5" aria-hidden /> {i.minutes} min</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-(--color-ink-muted)">Aucune réactivation due aujourd’hui : votre révision du jour ci-dessous entretient l’ensemble de vos acquis.</p>
      )}
      {due.items.length > 8 && <p className="mt-2 text-xs text-(--color-ink-muted)"><Link href="/mes-priorites" className="font-semibold text-(--color-primary) hover:underline">Voir toutes mes priorités</Link> ({due.items.length} items dus).</p>}
    </section>
  );
}
