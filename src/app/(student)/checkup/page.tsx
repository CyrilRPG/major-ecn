import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, BarChart3, ClipboardCheck, History, PenLine, RefreshCcw, Repeat, Target, TrendingUp } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { CHECKUP_STUDENT_ENABLED, PEDAGO_ENGINE_STUDENT_ENABLED } from '@/lib/modules-flags';
import { moteurOuvert } from '@/lib/moteur/access';
import { history, launchOptions } from '@/lib/checkup/server/service';
import { candidateContext } from '@/lib/moteur/server/candidate';
import { FORMAT_LABEL, STATUS_LABEL, TEXTS, type CheckupStatus } from '@/lib/checkup/types';
import { CheckupLauncher } from '@/components/student/checkup/launcher';
import { fmtDateTime } from '@/lib/suivi/format';
import { cn } from '@/lib/utils';
import { HeroLinks, Panel, SectionTitle, StudentHero, StudentPage } from '@/components/student/ui/page-kit';

export const metadata = { title: 'EVC Check-up' };
export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<CheckupStatus, string> = {
  active: 'text-(--color-primary)', expired: 'text-(--color-ink-soft)', pending_self_review: 'text-amber-700 dark:text-amber-300', completed: 'text-green-700 dark:text-green-300',
  abandoned: 'text-(--color-ink-muted)', cancelled_technical: 'text-(--color-ink-muted)',
};

/**
 * EVC Check-up — écran de lancement (§34) et historique (§25) : Check-up
 * globaux et ciblés présentés SÉPARÉMENT ; deux tirages ne sont jamais
 * présentés comme strictement équivalents.
 */
export default async function CheckupPage() {
  const { user, profile } = await requireUser();
  if (!moteurOuvert(profile, CHECKUP_STUDENT_ENABLED)) redirect('/accueil');
  const me = { id: user.id, role: profile.role ?? 'student', permission_scope: profile.permission_scope };
  const [opts, hist, ctx] = await Promise.all([launchOptions(me), history(user.id), candidateContext(user.id)]);

  // Interconnexion : les résultats d'un Check-up mettent à jour les priorités et, s'il est actif, le planning.
  const liens = [
    ...(moteurOuvert(profile, PEDAGO_ENGINE_STUDENT_ENABLED) ? [{ href: '/mes-priorites', label: 'Mes priorités' }] : []),
    ...(ctx?.plannerActive ? [{ href: '/planificateur', label: 'Mon planning' }] : []),
  ];

  return (
    <StudentPage>
      <StudentHero
        aide="checkup"
        icon={ClipboardCheck}
        eyebrow="Mesurer votre niveau"
        title={TEXTS.launchTitle}
        subtitle={TEXTS.signature}
        links={<HeroLinks links={liens} />}
      >
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xs font-medium text-white/85" aria-label="La boucle du Check-up">
          {[['Évaluation', ClipboardCheck], ['Score', BarChart3], ['Lacunes', Target], ['Plan de reprise', Repeat], ['Révision', RefreshCcw], ['Réévaluation', TrendingUp]].map(([label, Icon], i, all) => {
            const I = Icon as typeof Target;
            return (
              <li key={label as string} className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 ring-1 ring-inset ring-white/10"><I className="h-3.5 w-3.5 text-[#F5C84B]" />{label as string}</span>
                {i < all.length - 1 && <ArrowRight className="h-3 w-3 text-white/40" aria-hidden />}
              </li>
            );
          })}
        </ol>
      </StudentHero>

      {opts.active && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-(--color-primary)/40 bg-(--color-primary-soft) p-4">
          <p className="text-sm font-semibold text-(--color-ink)">Un EVC Check-up est en cours. Le chronomètre continue : reprenez-le maintenant.</p>
          <Link href={`/checkup/${opts.active.id}`} className="inline-flex h-10 items-center gap-2 rounded-(--radius-button) bg-(--color-primary) px-4 text-sm font-semibold text-white hover:bg-(--color-primary-deep)">Reprendre mon Check-up <ArrowRight className="h-4 w-4" /></Link>
        </div>
      )}
      {opts.pendingCorrections.map((p) => (
        <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-900/15">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-950 dark:text-amber-100"><PenLine className="h-4 w-4" /> {TEXTS.pendingTitle} <span className="font-normal">(Check-up du {fmtDateTime(p.started_at)})</span></p>
          <Link href={`/checkup/${p.id}/correction`} className="inline-flex h-10 items-center gap-2 rounded-(--radius-button) bg-amber-600 px-4 text-sm font-semibold text-white hover:bg-amber-700">{TEXTS.pendingCta} <ArrowRight className="h-4 w-4" /></Link>
        </div>
      ))}
      {opts.recommendation.recommend && !opts.active && (
        <p className="rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm text-(--color-ink-soft)">
          <strong className="text-(--color-ink)">Un nouveau Check-up est recommandé.</strong> {opts.recommendation.reason}
        </p>
      )}

      {opts.specialties.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-(--color-border) p-6 text-center text-sm text-(--color-ink-soft)">Aucune spécialité de votre formule ne propose encore de Check-up.</p>
      ) : (
        !opts.active && <CheckupLauncher specialties={opts.specialties} formats={opts.formats} defaultSpecialty={ctx?.mainSpecialty ?? null} />
      )}

      <Panel aria-labelledby="checkup-history">
        <SectionTitle id="checkup-history" eyebrow="Vos Check-up" title={<span className="flex items-center gap-2"><History className="h-4 w-4 text-(--color-primary)" aria-hidden /> Historique</span>} description={TEXTS.comparisonNotice} />
        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          {([['Check-up globaux', hist.global], ['Check-up ciblés', hist.cible]] as const).map(([title, rows]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-(--color-ink)">{title}</h3>
              {rows.length === 0 ? <p className="mt-2 text-sm text-(--color-ink-muted)">Aucun pour le moment.</p> : (
                <ul className="mt-2 divide-y divide-(--color-border) rounded-xl border border-(--color-border)">
                  {rows.map((r) => {
                    const done = r.status === 'completed' || r.status === 'expired';
                    const href = r.status === 'active' ? `/checkup/${r.id}` : r.status === 'pending_self_review' ? `/checkup/${r.id}/correction` : `/checkup/${r.id}/resultat`;
                    return (
                      <li key={r.id}>
                        <Link href={href} className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-(--color-surface-soft)">
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-(--color-ink)">{r.specialiteName}{r.mode !== 'global' ? ` · ${r.mode === 'items' ? `${r.item_ids.length} item(s)` : `${r.category_ids.length} catégorie(s)`}` : ''}</span>
                            <span className="block text-xs text-(--color-ink-muted)">{fmtDateTime(r.started_at)} · {FORMAT_LABEL[r.format]}{r.duration_seconds ? ` · ${Math.round(r.duration_seconds / 60)} min` : ''}</span>
                          </span>
                          <span className="text-right">
                            {done && r.score_percent !== null ? <span className="block text-base font-bold tabular-nums text-(--color-ink)">{Math.round(Number(r.score_percent))} %</span> : null}
                            <span className={cn('block text-xs font-medium', STATUS_TONE[r.status])}>{STATUS_LABEL[r.status]}</span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Panel>
      <p className="text-center text-xs text-(--color-ink-muted)">{TEXTS.finalPrinciple}</p>
    </StudentPage>
  );
}
