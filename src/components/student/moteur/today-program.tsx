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
 * l'origine et la raison de chaque activité. « Commencer ma journée » est le
 * bouton de l'en-tête de l'accueil ; la synthèse (priorités, révisions
 * transversales, Check-up, planning) forme les tuiles de pilotage.
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
export function EngineRefresher({ stale }: { stale: boolean }) {
  const router = useRouter();
  const done = useRef(false);
  useEffect(() => {
    if (!stale || done.current) return;
    done.current = true;
    void refreshEngineAction().then((r) => { if (r.ok && r.changed) router.refresh(); });
  }, [stale, router]);
  return null;
}

/** Nombre d'activités visibles avant « Voir les autres » : l'accueil doit tenir sans défiler. */
const VISIBLES = 4;

function ActivityRow({ a, now }: { a: ProgramActivity; now: boolean }) {
  const st = KIND_STYLE[a.kind];
  const origins = a.origins.filter((o) => o !== a.label && o !== IMPLIED_ORIGIN[a.kind]).slice(0, 2);
  const detail = [origins.join(' · '), a.reasons[0]].filter(Boolean).join(' — ');
  return (
    <li className={cn('flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors',
      now ? 'border-[#F6D9DD] bg-[#FDF4F5]' : 'border-(--color-border) bg-(--color-surface) hover:border-[#C0112E]/30')}>
      <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', st.chip)} aria-hidden>
        <st.Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex min-w-0 items-center gap-2">
          <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', st.chip)}>{a.label}</span>
          <span className="truncate text-sm font-bold text-(--color-ink)">{a.itemName}</span>
        </p>
        {detail && <p className="mt-0.5 truncate text-xs text-(--color-ink-soft)" title={a.reasons.join(' · ')}>{detail}</p>}
      </div>
      <span className="hidden shrink-0 items-center gap-1 text-xs font-semibold tabular-nums text-(--color-ink-soft) sm:inline-flex"><Clock className="h-3.5 w-3.5" aria-hidden /> {fmtMin(a.minutes)}</span>
      {now ? (
        <Link href={a.href} className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-xl bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-3 text-xs font-bold text-white shadow-[0_8px_18px_-10px_rgba(228,0,43,0.9)] focus-ring" aria-label={`Commencer : ${a.label} — ${a.itemName}`}>
          Commencer <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      ) : (
        <Link href={a.href} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-(--color-border) text-(--color-ink-soft) hover:border-[#C0112E]/40 hover:text-[#C0112E] focus-ring" aria-label={`Ouvrir : ${a.label} — ${a.itemName}`}>
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </li>
  );
}

export function Notifications({ items }: { items: TodayProgramData['notifications'] }) {
  const [list, setList] = useState(items);
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current || items.length === 0) return;
    sent.current = true;
    void notificationsSeenAction(items.map((n) => n.id));
  }, [items]);
  if (list.length === 0) return null;
  return (
    <ul className="space-y-1.5" aria-label="Notifications">
      {list.map((n) => (
        <li key={n.id} className="flex items-center gap-2.5 rounded-xl bg-(--color-surface-soft) px-3 py-2 text-sm">
          <Bell className="h-4 w-4 shrink-0 text-[#C0112E]" aria-hidden />
          <p className="min-w-0 flex-1 truncate">
            <span className="font-semibold text-(--color-ink)">{n.title}</span>
            {n.body && <span className="text-(--color-ink-soft)"> — {n.body}</span>}
          </p>
          {n.cta_href && n.cta_label && <Link href={n.cta_href} className="shrink-0 text-xs font-semibold text-[#C0112E] hover:underline">{n.cta_label}</Link>}
          <button type="button" aria-label="Fermer la notification" className="shrink-0 rounded-full p-1 text-(--color-ink-muted) hover:bg-(--color-surface) hover:text-(--color-ink) focus-ring"
            onClick={() => { setList((l) => l.filter((x) => x.id !== n.id)); void dismissNotificationAction(n.id); }}>
            <X className="h-3.5 w-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}

export function ExamInvite() {
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

/**
 * « Mon programme du jour », version compacte : la prochaine activité mise en
 * avant avec son bouton, les suivantes sur une ligne chacune (origine et
 * raison en sous-ligne, toutes les raisons en infobulle), au plus quatre
 * visibles — le reste se déplie.
 */
export function TodayProgram({ data }: { data: TodayProgramData }) {
  const [tout, setTout] = useState(false);
  const todo = data.activities.filter((a) => !a.done);
  const done = data.activities.length - todo.length;
  const visibles = tout ? todo : todo.slice(0, VISIBLES);
  const cachees = todo.slice(VISIBLES);
  return (
    <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-5" aria-labelledby="programme-du-jour">
      <EngineRefresher stale={data.stale} />
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FDF4F5] text-[#8B0E22]"><CalendarCheck className="h-5 w-5" aria-hidden /></span>
          <div className="min-w-0">
            <h2 id="programme-du-jour" className="font-(family-name:--font-jakarta) text-lg font-extrabold tracking-[-0.01em] text-[#14254E]">Mon programme du jour</h2>
            <p className="text-[13px] text-(--color-ink-soft)">
              {todo.length === 0
                ? (done > 0 ? 'Programme du jour terminé : vous pouvez poursuivre librement.' : 'Rien d’urgent aujourd’hui : entretenez vos acquis.')
                : <><strong className="text-(--color-ink)">{fmtMin(data.remainingMinutes)}</strong> · {todo.length} activité{todo.length > 1 ? 's' : ''}{done > 0 ? ` · ${done} terminée${done > 1 ? 's' : ''}` : ''}</>}
            </p>
          </div>
        </div>
        {data.plannerStatus === 'actif' && (
          <Link href="/planificateur" className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#C0112E] hover:underline">
            Mon planning <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        )}
      </div>

      {data.plannerDay && (
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-(--color-surface-soft) px-3 py-2 text-[13px] text-(--color-ink-soft)">
          <span><strong className="text-(--color-ink)">{data.plannerDay.done}/{data.plannerDay.planned}</strong> activités du planning · reste {fmtMin(data.plannerDay.remainingMinutes)}</span>
          <span className="ml-auto flex flex-wrap gap-x-3">
            <Link href="/planificateur?action=reporter" className="font-semibold text-(--color-ink) hover:text-[#C0112E] hover:underline">Reporter le reste</Link>
            <Link href="/planificateur?action=journee-incomplete" className="font-semibold text-(--color-ink) hover:text-[#C0112E] hover:underline">Je ne peux pas terminer aujourd’hui</Link>
          </span>
        </p>
      )}

      {data.pendingCorrection && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm" role="status">
          <p className="font-semibold text-amber-950">{CHECKUP_TEXTS.pendingTitle}</p>
          <Link href={`/checkup/${data.pendingCorrection.id}/correction`} className="inline-flex min-h-9 items-center gap-1 rounded-xl bg-(--color-primary) px-3 text-xs font-semibold text-white hover:bg-(--color-primary-deep) focus-ring">
            {CHECKUP_TEXTS.pendingCta} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      )}

      {data.notifications.length > 0 && <div className="mt-3"><Notifications items={data.notifications} /></div>}

      {visibles.length > 0 && (
        <ol className="mt-3 space-y-1.5" aria-label="Activités du jour">
          {visibles.map((a, i) => <ActivityRow key={a.key} a={a} now={i === 0} />)}
        </ol>
      )}
      {(cachees.length > 0 || done > 0 || data.backlog > 0) && (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-(--color-ink-muted)">
          {cachees.length > 0 && (
            <button type="button" onClick={() => setTout((v) => !v)} aria-expanded={tout} className="inline-flex items-center gap-1 font-semibold text-[#C0112E] hover:underline focus-ring">
              {tout ? 'Réduire' : `Voir les ${cachees.length} autre${cachees.length > 1 ? 's' : ''} activité${cachees.length > 1 ? 's' : ''} · ${fmtMin(cachees.reduce((s, a) => s + a.minutes, 0))}`}
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', tout && 'rotate-180')} aria-hidden />
            </button>
          )}
          {done > 0 && <span className="inline-flex items-center gap-1 text-green-700"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> {done} terminée{done > 1 ? 's' : ''} aujourd’hui</span>}
          {data.backlog > 0 && (
            <span>{data.backlog > 1 ? `${data.backlog} autres besoins en attente, proposés les prochains jours selon leur priorité` : '1 autre besoin en attente, proposé les prochains jours selon sa priorité'}</span>
          )}
        </div>
      )}

      {data.examInvite && <div className="mt-3"><ExamInvite /></div>}
    </section>
  );
}

/**
 * Pilotage : quatre tuiles qui disent où en est chaque levier de la
 * préparation (priorités, révisions transversales, Check-up, planning) et
 * mènent à la bonne page en un clic.
 */
export function PilotageTiles({ data }: { data: TodayProgramData }) {
  const checkupHref = data.pendingCorrection ? `/checkup/${data.pendingCorrection.id}/correction` : data.lastCheckup ? `/checkup/${data.lastCheckup.id}/resultat` : '/checkup';
  const tiles: { href: string; Icon: typeof Target; eyebrow: string; value: string; sub: string; cta: string; alert?: boolean }[] = [
    {
      href: '/mes-priorites', Icon: Target, eyebrow: 'Mes priorités',
      value: data.attention > 0 ? String(data.attention) : '0',
      sub: data.attention > 0 ? `item${data.attention > 1 ? 's' : ''} à retravailler` : 'aucun item en difficulté',
      cta: 'Voir mes priorités', alert: data.attention > 0,
    },
    {
      href: '/revisions-transversales', Icon: RefreshCcw, eyebrow: 'Révisions',
      value: data.transversal && data.transversal.assigned > 0 ? `${data.transversal.completed}/${data.transversal.assigned}` : '—',
      sub: data.transversal && data.transversal.assigned > 0 ? 'réalisées sur 14 jours' : 'entretenez vos acquis chaque jour',
      cta: 'Ma révision du jour',
    },
    {
      href: checkupHref, Icon: ClipboardCheck, eyebrow: 'EVC Check-up',
      value: data.pendingCorrection ? 'À corriger' : data.lastCheckup && data.lastCheckup.score !== null ? `${Math.round(data.lastCheckup.score)} %` : '—',
      sub: data.pendingCorrection ? 'vos QROC attendent' : data.lastCheckup ? `le ${fmtDay(data.lastCheckup.at)}${data.lastCheckup.scope === 'cible' ? ' (ciblé)' : ''}` : 'aucun Check-up réalisé',
      cta: data.recommendation.recommend && !data.pendingCorrection ? 'Nouveau Check-up conseillé' : data.lastCheckup ? 'Voir le résultat' : 'Mesurer mon niveau',
      alert: data.recommendation.recommend || !!data.pendingCorrection,
    },
    {
      href: '/planificateur', Icon: CalendarDays, eyebrow: 'Mon planning',
      value: data.plannerDay ? `${data.plannerDay.done}/${data.plannerDay.planned}` : PLANNER_STATUS[data.plannerStatus],
      sub: data.plannerDay ? 'activités du jour réalisées' : data.plannerStatus === 'absent' ? 'organisez votre préparation' : 'votre suivi continue',
      cta: data.plannerStatus === 'absent' ? 'Créer mon planning' : 'Ouvrir mon planning',
    },
  ];
  return (
    <section aria-label="Pilotage de ma préparation" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {tiles.map((t) => (
        <Link key={t.eyebrow} href={t.href} className="group flex flex-col rounded-2xl border border-(--color-border) bg-(--color-surface) p-3.5 shadow-(--shadow-soft) transition-all hover:-translate-y-0.5 hover:border-[#C0112E]/30 hover:shadow-(--shadow-lifted) focus-ring">
          <span className="flex items-center gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#FDF4F5] text-[#8B0E22]"><t.Icon className="h-3.5 w-3.5" aria-hidden /></span>
            <span className="truncate text-[10.5px] font-bold uppercase tracking-[0.12em] text-(--color-ink-muted)">{t.eyebrow}</span>
            {t.alert && <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-[#E4002B]" aria-hidden />}
          </span>
          <span className="mt-2 font-(family-name:--font-jakarta) text-[22px] font-extrabold leading-none tracking-[-0.02em] text-[#14254E]">{t.value}</span>
          <span className="mt-1 text-[12px] leading-snug text-(--color-ink-soft)">{t.sub}</span>
          <span className="mt-auto inline-flex items-center gap-1 pt-2 text-[12px] font-bold text-[#C0112E]">
            {t.cta} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </Link>
      ))}
    </section>
  );
}
