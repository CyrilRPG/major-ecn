'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Bell, CalendarCheck, CalendarDays, CheckCircle2, ChevronDown, ClipboardCheck, Clock, Loader2, Play, RefreshCcw, Target, Trophy, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dismissExamInviteAction, dismissNotificationAction, examDateAction, notificationsSeenAction, refreshEngineAction } from '@/app/(student)/accueil/moteur-actions';
import type { ProgramActivity } from '@/lib/moteur/program';
import { TEXTS as CHECKUP_TEXTS } from '@/lib/checkup/types';
import { cn } from '@/lib/utils';

/**
 * Programme du jour UNIQUE (O§28, I§31, I§52) : une seule liste qui répond à
 * « Que dois-je faire aujourd'hui ? » — séances du planificateur, révisions
 * dues, contrôles et activités commencées — avec la durée totale estimée,
 * l'origine et la raison de chaque activité, et « Commencer ma journée ».
 */

export type TodayProgramData = {
  activities: ProgramActivity[];
  totalMinutes: number;
  remainingMinutes: number;
  backlog: number;
  start: ProgramActivity | null;
  attention: number;
  plannerDay: { planned: number; done: number; remainingMinutes: number } | null;
  plannerStatus: 'actif' | 'en_pause' | 'a_reconfigurer' | 'desactive' | 'absent';
  transversal: { assigned: number; completed: number } | null;
  lastCheckup: { id: string; score: number | null; at: string; scope: 'global' | 'cible' } | null;
  pendingCorrection: { id: string } | null;
  recommendation: { recommend: boolean; reason: string | null };
  notifications: { id: string; title: string; body: string | null; cta_label: string | null; cta_href: string | null }[];
  examInvite: boolean;
  examDate: string | null;
  responsibility: string;
  stale: boolean;
};

const KIND_STYLE: Record<ProgramActivity['kind'], { chip: string; Icon: typeof Target }> = {
  en_cours: { chip: 'bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-100', Icon: Play },
  concours_blanc: { chip: 'bg-indigo-100 text-indigo-950 dark:bg-indigo-500/20 dark:text-indigo-100', Icon: Trophy },
  planificateur: { chip: 'bg-violet-100 text-violet-900 dark:bg-violet-500/20 dark:text-violet-100', Icon: CalendarDays },
  revision: { chip: 'bg-red-100 text-red-900 dark:bg-red-500/20 dark:text-red-100', Icon: Target },
  consolidation: { chip: 'bg-amber-100 text-amber-950 dark:bg-amber-500/20 dark:text-amber-100', Icon: RefreshCcw },
  reactivation: { chip: 'bg-green-100 text-green-950 dark:bg-green-500/20 dark:text-green-100', Icon: RefreshCcw },
  controle: { chip: 'bg-orange-100 text-orange-950 dark:bg-orange-500/20 dark:text-orange-100', Icon: ClipboardCheck },
  suggestion: { chip: 'bg-(--color-surface-soft) text-(--color-ink)', Icon: Play },
};

/** Origine déjà portée par le libellé de l'activité : inutile de la répéter en étiquette. */
const IMPLIED_ORIGIN: Partial<Record<ProgramActivity['kind'], string>> = {
  revision: 'Révision', consolidation: 'Révision', reactivation: 'Réactivation', controle: 'Contrôle', planificateur: 'Planificateur', concours_blanc: 'Épreuves blanches',
};

const PLANNER_STATUS: Record<TodayProgramData['plannerStatus'], string> = {
  actif: 'Actif', en_pause: 'En pause', a_reconfigurer: 'À reconfigurer', desactive: 'Désactivé', absent: 'Non configuré',
};

const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : `${m} min`);
const fmtDay = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' });

/** Actualise le moteur après l'affichage (§57) puis recharge si quelque chose a changé. */
function EngineRefresher({ stale }: { stale: boolean }) {
  const router = useRouter();
  const done = useRef(false);
  useEffect(() => {
    if (!stale || done.current) return;
    done.current = true;
    void refreshEngineAction().then((r) => { if (r.ok && r.changed) router.refresh(); });
  }, [stale, router]);
  return null;
}

function ActivityRow({ a }: { a: ProgramActivity }) {
  const [open, setOpen] = useState(false);
  const st = KIND_STYLE[a.kind];
  return (
    <li className={cn('rounded-xl border border-(--color-border) bg-(--color-surface) transition-colors', !a.done && 'hover:border-(--color-primary)/40')}>
      <div className="flex items-start gap-3 p-3">
        <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', a.done ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200' : st.chip)} aria-hidden>
          {a.done ? <CheckCircle2 className="h-4 w-4" /> : <st.Icon className="h-4 w-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={cn('rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide', st.chip)}>{a.label}</span>
            {a.origins.filter((o) => o !== a.label && o !== IMPLIED_ORIGIN[a.kind]).slice(0, 3).map((o) => (
              <span key={o} className="rounded-full border border-(--color-border) px-2 py-0.5 text-[10.5px] font-medium text-(--color-ink-soft)">{o}</span>
            ))}
            {a.done && <span className="text-[11px] font-semibold text-green-700 dark:text-green-300">Terminée</span>}
          </p>
          <p className={cn('mt-1 truncate text-sm font-bold text-(--color-ink)', a.done && 'text-(--color-ink-soft) line-through')}>{a.itemName}</p>
          {a.reasons[0] && <p className="mt-0.5 line-clamp-2 text-xs text-(--color-ink-soft)">{a.reasons[0]}</p>}
          {a.reasons.length > 1 && (
            <>
              <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-medium text-(--color-ink-muted) hover:text-(--color-ink) focus-ring">
                {open ? 'Masquer' : `+ ${a.reasons.length - 1} raison${a.reasons.length > 2 ? 's' : ''}`} <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
              </button>
              {open && <ul className="mt-1 space-y-0.5 text-xs text-(--color-ink-soft)">{a.reasons.slice(1).map((r) => <li key={r}>• {r}</li>)}</ul>}
            </>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs font-semibold tabular-nums text-(--color-ink-soft)"><Clock className="h-3.5 w-3.5" aria-hidden /> {fmtMin(a.minutes)}</span>
          {!a.done && (
            <Link href={a.href} className="inline-flex min-h-9 items-center gap-1 rounded-(--radius-button) border border-(--color-border) px-3 text-xs font-semibold text-(--color-ink) hover:border-(--color-primary) hover:text-(--color-primary) focus-ring" aria-label={`Ouvrir : ${a.label} — ${a.itemName}`}>
              Ouvrir <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </li>
  );
}

function Notifications({ items }: { items: TodayProgramData['notifications'] }) {
  const [list, setList] = useState(items);
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current || items.length === 0) return;
    sent.current = true;
    void notificationsSeenAction(items.map((n) => n.id));
  }, [items]);
  if (list.length === 0) return null;
  return (
    <ul className="space-y-2" aria-label="Notifications">
      {list.map((n) => (
        <li key={n.id} className="flex items-start gap-3 rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3 text-sm">
          <Bell className="mt-0.5 h-4 w-4 shrink-0 text-(--color-primary)" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-(--color-ink)">{n.title}</p>
            {n.body && <p className="mt-0.5 text-xs text-(--color-ink-soft)">{n.body}</p>}
            {n.cta_href && n.cta_label && <Link href={n.cta_href} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-(--color-primary) hover:underline">{n.cta_label} <ArrowRight className="h-3 w-3" /></Link>}
          </div>
          <button type="button" aria-label="Fermer la notification" className="rounded-full p-1 text-(--color-ink-muted) hover:bg-(--color-surface) hover:text-(--color-ink) focus-ring"
            onClick={() => { setList((l) => l.filter((x) => x.id !== n.id)); void dismissNotificationAction(n.id); }}>
            <X className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function ExamInvite() {
  const router = useRouter();
  const [date, setDate] = useState('');
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <form className="flex flex-col gap-2 rounded-xl border border-dashed border-(--color-border) p-3 text-sm sm:flex-row sm:items-center"
      onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await examDateAction(date); if (!r.ok) setError(r.error); else { setHidden(true); router.refresh(); } }); }}>
      <label htmlFor="evc-date" className="flex-1 text-(--color-ink-soft)"><CalendarDays className="mr-1.5 inline h-4 w-4 text-(--color-primary)" aria-hidden />Renseignez la date de votre EVC : vos priorités tiendront compte du temps restant.</label>
      <div className="flex items-center gap-2">
        <input id="evc-date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="h-10 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-2 text-sm text-(--color-ink) focus-ring" />
        <Button type="submit" size="sm" disabled={pending || !date}>{pending ? <Loader2 className="animate-spin" /> : 'Enregistrer'}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => start(async () => { await dismissExamInviteAction(); setHidden(true); })}>Plus tard</Button>
      </div>
      {error && <p className="text-xs text-(--color-danger)" role="alert">{error}</p>}
    </form>
  );
}

export function TodayProgram({ data }: { data: TodayProgramData }) {
  const todo = data.activities.filter((a) => !a.done);
  const done = data.activities.length - todo.length;
  return (
    <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-5" aria-labelledby="programme-du-jour">
      <EngineRefresher stale={data.stale} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 id="programme-du-jour" className="flex items-center gap-2 text-lg font-bold text-(--color-ink)">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--color-primary-soft) text-(--color-primary)"><CalendarCheck className="h-4 w-4" aria-hidden /></span>
            Mon programme du jour
          </h2>
          <p className="mt-1 text-sm text-(--color-ink-soft)">
            {todo.length === 0
              ? (done > 0 ? 'Programme du jour terminé. Vous pouvez poursuivre librement.' : 'Rien d’urgent aujourd’hui : entretenez vos acquis.')
              : <>Durée estimée : <strong className="text-(--color-ink)">{fmtMin(data.remainingMinutes)}</strong> · {todo.length} activité{todo.length > 1 ? 's' : ''}{done > 0 ? ` · ${done} terminée${done > 1 ? 's' : ''}` : ''}</>}
          </p>
        </div>
        {data.start && (
          <Link href={data.start.href} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white shadow-(--shadow-soft) transition-transform hover:scale-[1.02] focus-ring"
            style={{ background: 'linear-gradient(90deg,#E4002B 0%,#F97316 100%)' }}>
            <Play className="h-4 w-4" aria-hidden /> Commencer ma journée
          </Link>
        )}
      </div>

      {data.plannerDay && (
        <div className="mt-3 flex flex-col gap-2 rounded-xl bg-(--color-surface-soft) p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-(--color-ink)"><strong>{data.plannerDay.done}/{data.plannerDay.planned}</strong> activités du planning réalisées · reste environ {fmtMin(data.plannerDay.remainingMinutes)}</p>
          <div className="flex flex-wrap gap-2">
            {data.start && <Link href={data.start.href} className="inline-flex min-h-9 items-center rounded-(--radius-button) bg-(--color-primary) px-3 text-xs font-semibold text-white hover:bg-(--color-primary-deep) focus-ring">Continuer maintenant</Link>}
            <Link href="/planificateur?action=reporter" className="inline-flex min-h-9 items-center rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-3 text-xs font-semibold text-(--color-ink) hover:bg-(--color-surface-soft) focus-ring">Reporter le reste</Link>
            <Link href="/planificateur?action=journee-incomplete" className="inline-flex min-h-9 items-center rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-3 text-xs font-semibold text-(--color-ink) hover:bg-(--color-surface-soft) focus-ring">Je ne peux pas terminer aujourd’hui</Link>
          </div>
        </div>
      )}

      {data.pendingCorrection && (
        <div className="mt-3 flex flex-col gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/40 dark:bg-amber-900/15" role="status">
          <p className="font-semibold text-amber-950 dark:text-amber-100">{CHECKUP_TEXTS.pendingTitle}</p>
          <Link href={`/checkup/${data.pendingCorrection.id}/correction`} className="inline-flex min-h-9 items-center justify-center gap-1 rounded-(--radius-button) bg-(--color-primary) px-3 text-xs font-semibold text-white hover:bg-(--color-primary-deep) focus-ring">
            {CHECKUP_TEXTS.pendingCta} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      )}

      {data.notifications.length > 0 && <div className="mt-3"><Notifications items={data.notifications} /></div>}

      {data.activities.length > 0 && <ul className="mt-3 space-y-2">{data.activities.map((a) => <ActivityRow key={a.key} a={a} />)}</ul>}
      {data.backlog > 0 && (
        <p className="mt-2 text-xs text-(--color-ink-muted)">
          {data.backlog > 1
            ? `${data.backlog} autres besoins en attente : ils vous seront proposés les prochains jours, selon leur priorité — sans s’accumuler.`
            : '1 autre besoin en attente : il vous sera proposé les prochains jours, selon sa priorité — sans s’accumuler.'}
        </p>
      )}

      {/* Synthèse unique : priorités, révisions transversales, dernier Check-up, planificateur (I§31). */}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/mes-priorites" className="group rounded-xl border border-(--color-border) p-3 hover:border-(--color-primary)/40 focus-ring">
          <p className="text-[11px] font-bold uppercase tracking-wide text-(--color-ink-muted)">Mes priorités</p>
          <p className="mt-1 text-sm font-semibold text-(--color-ink)">{data.attention > 0 ? `${data.attention} item${data.attention > 1 ? 's' : ''} nécessite${data.attention > 1 ? 'nt' : ''} actuellement votre attention` : 'Aucun item en difficulté pour le moment'}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-(--color-primary)">Voir mes priorités <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" /></p>
        </Link>
        <Link href="/revisions-transversales" className="group rounded-xl border border-(--color-border) p-3 hover:border-(--color-primary)/40 focus-ring">
          <p className="text-[11px] font-bold uppercase tracking-wide text-(--color-ink-muted)">Révisions transversales</p>
          <p className="mt-1 text-sm font-semibold text-(--color-ink)">{data.transversal && data.transversal.assigned > 0 ? `${data.transversal.completed} réalisée${data.transversal.completed > 1 ? 's' : ''} sur ${data.transversal.assigned} proposée${data.transversal.assigned > 1 ? 's' : ''}` : 'Entretenez vos acquis chaque jour'}</p>
          <p className="mt-1 text-xs text-(--color-ink-muted)">{data.transversal && data.transversal.assigned > 0 ? '14 derniers jours' : 'Révision du jour disponible'}</p>
        </Link>
        <Link href={data.pendingCorrection ? `/checkup/${data.pendingCorrection.id}/correction` : data.lastCheckup ? `/checkup/${data.lastCheckup.id}/resultat` : '/checkup'} className="group rounded-xl border border-(--color-border) p-3 hover:border-(--color-primary)/40 focus-ring">
          <p className="text-[11px] font-bold uppercase tracking-wide text-(--color-ink-muted)">EVC Check-up</p>
          <p className="mt-1 text-sm font-semibold text-(--color-ink)">
            {data.pendingCorrection ? 'Correction de vos QROC à terminer' : data.lastCheckup ? `Dernier : ${data.lastCheckup.score === null ? '—' : Math.round(data.lastCheckup.score)} %${data.lastCheckup.scope === 'cible' ? ' (ciblé)' : ''} · ${fmtDay(data.lastCheckup.at)}` : 'Aucun Check-up réalisé'}
          </p>
          <p className="mt-1 text-xs text-(--color-ink-muted)">{data.recommendation.recommend ? `Recommandé : ${data.recommendation.reason ?? 'mesurez votre niveau'}` : data.lastCheckup ? 'Voir le résultat et le plan de reprise' : 'Mesurez votre niveau'}</p>
        </Link>
        <Link href="/planificateur" className="group rounded-xl border border-(--color-border) p-3 hover:border-(--color-primary)/40 focus-ring">
          <p className="text-[11px] font-bold uppercase tracking-wide text-(--color-ink-muted)">Planificateur</p>
          <p className="mt-1 text-sm font-semibold text-(--color-ink)">{PLANNER_STATUS[data.plannerStatus]}</p>
          <p className="mt-1 text-xs text-(--color-ink-muted)">{data.plannerStatus === 'actif' ? 'Vos séances du jour sont intégrées ci-dessus' : data.plannerStatus === 'absent' ? 'Organisez votre préparation jusqu’à l’EVC' : 'Votre suivi pédagogique continue'}</p>
        </Link>
      </div>

      {data.examInvite && <div className="mt-3"><ExamInvite /></div>}
      <p className="mt-4 border-t border-(--color-border) pt-3 text-[11.5px] leading-relaxed text-(--color-ink-muted)">{data.responsibility}</p>
    </section>
  );
}
