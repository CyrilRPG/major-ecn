import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, BookOpen, CalendarDays, ClipboardCheck, History, RefreshCcw, ShieldCheck, Star, Target } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { PEDAGO_ENGINE_STUDENT_ENABLED } from '@/lib/modules-flags';
import { moteurOuvert } from '@/lib/moteur/access';
import { prioritiesView, type PriorityItem } from '@/lib/moteur/server/priorities';
import { STATUS_EXPLANATION, STATUS_LABEL, SOURCE_LABEL, RESULT_LABEL, type MasteryStatus, type ResultType, type SignalSource } from '@/lib/moteur/types';
import { fmtDateLong } from '@/lib/suivi/format';
import { cn } from '@/lib/utils';

export const metadata = { title: 'Mes priorités' };
export const dynamic = 'force-dynamic';

const SECTIONS: { status: MasteryStatus; title: string; tone: string; dot: string }[] = [
  { status: 'a_revoir', title: 'À revoir en priorité', tone: 'border-red-300/70 dark:border-red-500/40', dot: 'bg-red-600' },
  { status: 'a_consolider', title: 'À consolider', tone: 'border-amber-300/70 dark:border-amber-500/40', dot: 'bg-amber-500' },
  { status: 'en_bonne_voie', title: 'En bonne voie', tone: 'border-sky-300/70 dark:border-sky-500/40', dot: 'bg-sky-600' },
  { status: 'maitrise_consolidee', title: 'Maîtrise consolidée', tone: 'border-emerald-300/70 dark:border-emerald-500/40', dot: 'bg-emerald-600' },
];

const fmtDay = (d: string) => new Date(`${d.slice(0, 10)}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' });

/**
 * Mes priorités (I§32) : l'état central de chaque item, par statut, avec la
 * raison du statut et un accès direct à la fiche, l'entraînement, la révision
 * ou le planning. `?checkup=` montre les lacunes d'un Check-up précis.
 */
export default async function MesPrioritesPage({ searchParams }: { searchParams: Promise<{ checkup?: string; specialite?: string; section?: string }> }) {
  const { user, profile } = await requireUser();
  if (!moteurOuvert(profile, PEDAGO_ENGINE_STUDENT_ENABLED)) redirect('/accueil');
  const sp = await searchParams;
  const view = await prioritiesView(user.id, { checkupId: sp.checkup ?? null });
  if (!view) redirect('/accueil');
  const spec = sp.specialite && view.specialities.some((s) => s.id === sp.specialite) ? sp.specialite : null;
  const checkupSet = view.checkup ? new Set(view.checkup.itemIds) : null;
  const visible = view.items.filter((i) => (!spec || i.specialityId === spec) && (!checkupSet || checkupSet.has(i.itemId)));
  const evaluated = view.items.filter((i) => i.status !== 'non_evalue').length;
  const plannerActive = view.ctx.plannerActive;

  return (
    <main className="mx-auto w-full max-w-5xl space-y-5 px-3 py-5 sm:px-6">
      <header>
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-(--color-primary)"><Target className="h-3.5 w-3.5" aria-hidden /> Profil pédagogique</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-(--color-ink) sm:text-3xl">Mes priorités</h1>
        <p className="mt-1 max-w-3xl text-sm text-(--color-ink-soft)">
          Un seul état par item, alimenté par vos Check-up, vos révisions, votre planning et, si vous y participez, EVC Arena. Une erreur déclenche toujours du travail ; deux difficultés distinctes signalent une lacune.
        </p>
      </header>

      <nav aria-label="Statuts" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SECTIONS.map((s) => (
          <a key={s.status} href={`#${s.status}`} className={cn('rounded-xl border bg-(--color-surface) p-3 hover:bg-(--color-surface-soft) focus-ring', s.tone)}>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-(--color-ink-soft)"><span className={cn('h-2 w-2 rounded-full', s.dot)} aria-hidden />{s.title}</span>
            <span className="mt-1 block text-2xl font-black tabular-nums text-(--color-ink)">{visible.filter((i) => i.status === s.status).length}</span>
          </a>
        ))}
      </nav>

      {view.checkup && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-(--color-primary)/30 bg-(--color-primary-soft) p-3 text-sm">
          <p className="text-(--color-ink)"><ClipboardCheck className="mr-1.5 inline h-4 w-4 text-(--color-primary)" aria-hidden />Lacunes de votre EVC Check-up{view.checkup.scope === 'cible' ? ' ciblé' : ''} du {fmtDateLong(view.checkup.date)} : {view.checkup.itemIds.length} item{view.checkup.itemIds.length > 1 ? 's' : ''}, avec leur statut actuel.</p>
          <Link href="/mes-priorites" className="text-xs font-semibold text-(--color-primary) hover:underline">Voir toutes mes priorités</Link>
        </div>
      )}

      {view.specialities.length > 1 && (
        <nav aria-label="Spécialités" className="flex flex-wrap gap-1.5">
          <Link href={view.checkup ? `/mes-priorites?checkup=${view.checkup.id}` : '/mes-priorites'} className={cn('rounded-full border px-3 py-1 text-xs font-medium', !spec ? 'border-(--color-primary) bg-(--color-primary) text-white' : 'border-(--color-border) text-(--color-ink-soft) hover:text-(--color-ink)')}>Toutes</Link>
          {view.specialities.map((s) => (
            <Link key={s.id} href={`/mes-priorites?specialite=${encodeURIComponent(s.id)}${view.checkup ? `&checkup=${view.checkup.id}` : ''}`}
              className={cn('rounded-full border px-3 py-1 text-xs font-medium', spec === s.id ? 'border-(--color-primary) bg-(--color-primary) text-white' : 'border-(--color-border) text-(--color-ink-soft) hover:text-(--color-ink)')}>
              {s.name} <span className="opacity-70">({s.count})</span>
            </Link>
          ))}
        </nav>
      )}

      {evaluated === 0 && !view.checkup ? (
        <section className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface) p-6 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-(--color-primary)" aria-hidden />
          <h2 className="mt-2 text-lg font-bold text-(--color-ink)">Votre profil se construit au fil de vos résultats</h2>
          <p className="mx-auto mt-1 max-w-xl text-sm text-(--color-ink-soft)">Chaque question réalisée en Check-up, en révision ou en entraînement précise le statut de l’item concerné. Un EVC Check-up donne la photographie la plus fiable de votre niveau.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link href="/checkup" className="inline-flex min-h-10 items-center gap-1.5 rounded-(--radius-button) bg-(--color-primary) px-4 text-sm font-semibold text-white hover:bg-(--color-primary-deep)">Faire un EVC Check-up <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/revisions-transversales" className="inline-flex min-h-10 items-center rounded-(--radius-button) border border-(--color-border) px-4 text-sm font-semibold text-(--color-ink) hover:bg-(--color-surface-soft)">Révisions transversales</Link>
          </div>
        </section>
      ) : (
        SECTIONS.map((s) => {
          const list = visible.filter((i) => i.status === s.status);
          return (
            <section key={s.status} id={s.status} aria-labelledby={`t-${s.status}`} className="scroll-mt-20">
              <h2 id={`t-${s.status}`} className="flex items-center gap-2 text-lg font-bold text-(--color-ink)">
                <span className={cn('h-2.5 w-2.5 rounded-full', s.dot)} aria-hidden />{s.title} <span className="text-sm font-semibold text-(--color-ink-muted)">({list.length})</span>
              </h2>
              <p className="mt-0.5 text-xs text-(--color-ink-muted)">{STATUS_EXPLANATION[s.status]}</p>
              {list.length === 0 ? (
                <p className="mt-2 rounded-xl border border-dashed border-(--color-border) p-3 text-xs text-(--color-ink-muted)">Aucun item pour le moment.</p>
              ) : (
                <ul className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">{list.map((i) => <ItemCard key={i.itemId} i={i} plannerActive={plannerActive} />)}</ul>
              )}
            </section>
          );
        })
      )}
      {view.counts.non_evalue > 0 && evaluated > 0 && (
        <p className="text-xs text-(--color-ink-muted)">{view.counts.non_evalue} item{view.counts.non_evalue > 1 ? 's' : ''} travaillé{view.counts.non_evalue > 1 ? 's' : ''} sans résultat évaluatif suffisant : {STATUS_LABEL.non_evalue.toLowerCase()} pour l’instant.</p>
      )}
    </main>
  );
}

function ItemCard({ i, plannerActive }: { i: PriorityItem; plannerActive: boolean }) {
  const reason = i.needReasons[0] ?? i.reason;
  const action = 'inline-flex min-h-9 items-center gap-1 rounded-(--radius-button) border border-(--color-border) px-2.5 text-xs font-semibold text-(--color-ink) hover:border-(--color-primary) hover:text-(--color-primary) focus-ring';
  return (
    <li className="flex flex-col rounded-xl border border-(--color-border) bg-(--color-surface) p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/mes-priorites/${i.itemId}`} className="block text-sm font-bold text-(--color-ink) underline-offset-4 hover:underline">{i.name}</Link>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-(--color-ink-muted)">
            <span>{i.specialityName}{i.categoryName ? ` · ${i.categoryName}` : ''}</span>
            {i.stars > 0 && <span className="inline-flex items-center gap-0.5" aria-label={`${i.stars} étoile${i.stars > 1 ? 's' : ''}`}>{Array.from({ length: Math.min(5, i.stars) }).map((_, k) => <Star key={k} className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden />)}</span>}
          </p>
        </div>
        {i.controlPending && <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-[10.5px] font-bold text-orange-950 dark:bg-orange-500/20 dark:text-orange-100">Contrôle attendu</span>}
      </div>
      {reason && <p className="mt-2 text-xs text-(--color-ink-soft)">{reason}</p>}
      <p className="mt-1 text-[11px] text-(--color-ink-muted)">
        {i.lastResult ? <>Dernier résultat : {RESULT_LABEL[i.lastResult.result as ResultType] ?? i.lastResult.result}{i.lastResult.source ? ` (${SOURCE_LABEL[i.lastResult.source as SignalSource] ?? i.lastResult.source})` : ''}{i.lastResult.at ? ` · ${fmtDay(i.lastResult.at)}` : ''}</> : null}
        {i.nextReview && <>{i.lastResult ? ' · ' : ''}Prochaine réactivation : {fmtDay(i.nextReview)}</>}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Link href={`/revisions-transversales/ciblee?item=${i.itemId}`} className={cn(action, 'border-(--color-primary)/40 text-(--color-primary)')}><RefreshCcw className="h-3.5 w-3.5" aria-hidden /> Réviser</Link>
        <Link href={`/cours/${i.itemId}/fiche`} className={action}><BookOpen className="h-3.5 w-3.5" aria-hidden /> Fiche</Link>
        <Link href={`/cours/${i.itemId}/qcm`} className={action}><ClipboardCheck className="h-3.5 w-3.5" aria-hidden /> Entraînement</Link>
        {plannerActive && <Link href="/planificateur" className={action}><CalendarDays className="h-3.5 w-3.5" aria-hidden /> Planning</Link>}
        <Link href={`/mes-priorites/${i.itemId}`} className={action}><History className="h-3.5 w-3.5" aria-hidden /> Historique</Link>
      </div>
    </li>
  );
}
