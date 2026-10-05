'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { CalendarDays, Gauge, PauseCircle, PowerOff, RefreshCw, SlidersHorizontal, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ObjectivesData } from '@/lib/plan/pages';
import {
  DISABLE_REASON_LABEL, EDIT_SELF_ASSESSMENT, SPECIALTY_CHANGE_CANCEL, SPECIALTY_CHANGE_CONFIRM, SPECIALTY_CHANGE_TEXT, SPECIALTY_CHANGE_TITLE, VOIE_LABEL,
  type Availability, type DisableReason,
} from '@/lib/plan/types';
import {
  adaptAction, changeSpecialtyAction, declareUnavailabilityAction, disableAction, pauseAction, reactivateAction, resumeAction, updateAvailabilityAction,
} from '@/app/(student)/planificateur/actions';
import { planSerif } from './fonts';
import { AvailabilityStep } from './onboarding/availability';
import { Btn, ErrorText, PlanDialog, addDaysClient, fmtDay } from './today/dialogs';
import { fmtMinutes } from './today/activity-card';

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="pl-card px-[20px] py-[16px]">
      <h2 className={cn(planSerif.className, 'flex items-center gap-3 text-[19px] font-bold text-(--pl-ink)')}><span className="text-(--pl-bordeaux)">{icon}</span>{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/**
 * « Mes objectifs » : épreuve, disponibilités, charge (« Adapter mon
 * programme »), indisponibilité exceptionnelle, préférences et
 * auto-évaluation, statut du planificateur (pause, désactivation,
 * réactivation) et changement de spécialité (§36.1).
 */
export function ObjectivesView({ data, today, action }: { data: ObjectivesData; today: string; action: string | null }) {
  const router = useRouter();
  const p = data.profile;
  const [availability, setAvailability] = useState<Availability>(p.availability);
  const [unavailable, setUnavailable] = useState<string[]>(p.unavailable_days);
  const [timezone, setTimezone] = useState<string | null>(p.timezone ?? null);
  const [examDate, setExamDate] = useState(p.exam_date ?? '');
  const [load, setLoad] = useState(Math.round((p.load_factor ?? 1) * 100));
  const [maxMinutes, setMaxMinutes] = useState<number | null>(p.max_daily_minutes ?? null);
  const [maxItems, setMaxItems] = useState<number | null>(p.max_daily_items ?? null);
  const status = p.planner_status ?? 'actif';
  // Liens d'action venus de l'accueil ou d'une alerte : la fenêtre concernée s'ouvre d'emblée.
  const [dialog, setDialog] = useState<'adapter' | 'desactiver' | 'pause' | 'specialite' | 'indispo' | null>(() =>
    action === 'adapter' ? 'adapter'
      : action === 'desactiver' && status !== 'desactive' ? 'desactiver'
        : action === 'pause' && status === 'actif' ? 'pause' : null);
  const fromAlert = action === 'adapter' || action === 'desactiver';
  const [reason, setReason] = useState<DisableReason | null>(null);
  const [comment, setComment] = useState('');
  const [pause, setPause] = useState<'demain' | 'jours' | 'date'>('demain');
  const [pauseDays, setPauseDays] = useState(3);
  const [pauseDate, setPauseDate] = useState('');
  const [spec, setSpec] = useState(p.specialite_id ?? '');
  const [indispoDays, setIndispoDays] = useState<string[]>([today]);
  const [indispoMinutes, setIndispoMinutes] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [pending, start] = useTransition();
  // Une seule exécution du lien d'action (le mode strict de React rejoue les effets en développement).
  const actionRan = useRef(false);
  useEffect(() => {
    if (actionRan.current) return;
    actionRan.current = true;
    if (action === 'reactiver' && status !== 'actif') start(async () => { const r = status === 'en_pause' ? await resumeAction() : await reactivateAction(); if (!r.ok) setError(r.error); router.replace('/planificateur'); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string, close = true, then?: () => void) => start(async () => {
    setError(null); setSaved(null);
    const r = await fn();
    if (!r.ok) { setError(r.error ?? 'Erreur'); return; }
    setSaved(ok);
    if (close) setDialog(null);
    router.refresh();
    then?.();
  });

  return (
    <div className="mt-[18px] grid gap-[16px] lg:grid-cols-2">
      <div className="lg:col-span-2"><ErrorText error={error} />{saved && <p role="status" className="rounded-[10px] bg-(--pl-green-bg) px-3 py-2 text-[13.5px] font-semibold text-(--pl-green)">{saved}</p>}</div>

      <Section title="Mon épreuve" icon={<CalendarDays className="h-6 w-6" />}>
        <p className="text-[14.5px] text-(--pl-text)">{p.voie ? VOIE_LABEL[p.voie] : 'Voie non renseignée'} · épreuve le <strong className="text-(--pl-ink)">{p.exam_date ? fmtDay(p.exam_date) : '—'}</strong>{data.examFromCalendar ? ' (calendrier officiel)' : ''}</p>
        {!data.examFromCalendar && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input type="date" min={addDaysClient(today, 1)} value={examDate} onChange={(e) => setExamDate(e.target.value)} className="h-[40px] rounded-[10px] border border-(--pl-card-border) bg-(--pl-card) px-3 text-[14px]" aria-label="Date de l’épreuve" />
            <Btn pending={pending} onClick={() => run(() => updateAvailabilityAction({ availability, unavailable_days: unavailable, exam_date: examDate, timezone }), 'Date de l’épreuve enregistrée : votre planning est recalculé.', false)}>Enregistrer la date</Btn>
          </div>
        )}
        {data.preparations.length > 1 && <div className="mt-3"><Btn onClick={() => setDialog('specialite')}>Changer de spécialité</Btn></div>}
      </Section>

      <Section title="Mes préférences et mon niveau" icon={<Sparkles className="h-6 w-6" />}>
        <p className="text-[14.5px] text-(--pl-text)">{p.preferences?.none ? 'Pas de préférence particulière.' : 'Vos spécialités appréciées, repoussées ou à consolider orientent la composition de vos journées, jamais vos priorités.'}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/planificateur/preferences" className="inline-flex h-[40px] items-center rounded-full border border-(--pl-pill) px-[16px] text-[14px] font-semibold text-(--pl-pill)">Modifier mes préférences</Link>
          <Link href="/planificateur/auto-evaluation" className="inline-flex h-[40px] items-center rounded-full border border-(--pl-card-border) px-[16px] text-[14px] font-semibold text-(--pl-ink)">{EDIT_SELF_ASSESSMENT}</Link>
        </div>
      </Section>

      <div className="lg:col-span-2">
        <Section title="Mes disponibilités" icon={<CalendarDays className="h-6 w-6" />}>
          <AvailabilityStep availability={availability} onAvailability={setAvailability} unavailable={unavailable} onUnavailable={setUnavailable} timezone={timezone} onTimezone={setTimezone} today={today} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Btn primary pending={pending} onClick={() => run(() => updateAvailabilityAction({ availability, unavailable_days: unavailable, timezone }), 'Disponibilités enregistrées : votre planning est recalculé.', false)}>Enregistrer mes disponibilités</Btn>
            <Btn onClick={() => setDialog('indispo')}>Déclarer une disponibilité réduite (garde, travail…)</Btn>
          </div>
        </Section>
      </div>

      <Section title="Ma charge de travail" icon={<Gauge className="h-6 w-6" />}>
        <p className="text-[14.5px] text-(--pl-text)">Programme appliqué : <strong className="text-(--pl-ink)">{Math.round((p.load_factor ?? 1) * 100)} %</strong> de vos disponibilités{p.max_daily_minutes ? ` · au plus ${fmtMinutes(p.max_daily_minutes)} par jour` : ''}{p.max_daily_items ? ` · au plus ${p.max_daily_items} items par jour` : ''}.</p>
        <div className="mt-3"><Btn onClick={() => setDialog('adapter')}><SlidersHorizontal className="h-4 w-4" />Adapter mon programme</Btn></div>
      </Section>

      <Section title="Mon planificateur" icon={status === 'actif' ? <RefreshCw className="h-6 w-6" /> : status === 'en_pause' ? <PauseCircle className="h-6 w-6" /> : <PowerOff className="h-6 w-6" />}>
        <p className="text-[14.5px] text-(--pl-text)">{status === 'actif' ? 'Actif.' : status === 'en_pause' ? `En pause jusqu’au ${p.pause_until ? fmtDay(p.pause_until) : '—'}.` : status === 'desactive' ? 'Désactivé : votre suivi pédagogique général continue.' : 'À reconfigurer.'}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {status === 'actif' && <><Btn onClick={() => setDialog('pause')}><PauseCircle className="h-4 w-4" />Mettre mon planning en pause</Btn><Btn onClick={() => setDialog('desactiver')}><PowerOff className="h-4 w-4" />Désactiver mon planificateur</Btn></>}
          {status === 'en_pause' && <Btn primary pending={pending} onClick={() => run(resumeAction, 'Planificateur repris : votre programme est recalculé.')}>Reprendre maintenant</Btn>}
          {(status === 'desactive' || status === 'a_reconfigurer') && <Btn primary pending={pending} onClick={() => run(reactivateAction, 'Planificateur réactivé : votre programme est recalculé à partir d’aujourd’hui.')}>Réactiver mon planificateur</Btn>}
        </div>
      </Section>

      <PlanDialog open={dialog === 'adapter'} onOpenChange={(v) => !v && setDialog(null)} title="Adapter mon programme" description="Un programme réaliste vaut mieux qu’un programme intenable : le planificateur priorise les connaissances essentielles dans le temps que vous lui donnez.">
        <label className="block text-[14px] text-(--pl-text)">Part de vos disponibilités programmée : <strong className="text-(--pl-ink)">{load} %</strong>
          <input type="range" min={30} max={100} step={5} value={load} onChange={(e) => setLoad(Number(e.target.value))} className="mt-2 w-full accent-[#850016]" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-[14px] text-(--pl-text)">Au plus par jour
            <select value={maxMinutes ?? ''} onChange={(e) => setMaxMinutes(e.target.value ? Number(e.target.value) : null)} className="mt-1 h-[40px] w-full rounded-[10px] border border-(--pl-card-border) bg-(--pl-card) px-3">
              <option value="">Sans plafond personnel</option>
              {[60, 90, 120, 150, 180, 240, 300, 360, 480].map((m) => <option key={m} value={m}>{fmtMinutes(m)}</option>)}
            </select>
          </label>
          <label className="block text-[14px] text-(--pl-text)">Items différents par jour
            <select value={maxItems ?? ''} onChange={(e) => setMaxItems(e.target.value ? Number(e.target.value) : null)} className="mt-1 h-[40px] w-full rounded-[10px] border border-(--pl-card-border) bg-(--pl-card) px-3">
              <option value="">Sans plafond personnel</option>
              {[2, 3, 4, 5, 6, 8, 10].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
        </div>
        <ErrorText error={error} />
        <div className="flex justify-end gap-2"><Btn onClick={() => setDialog(null)}>Annuler</Btn><Btn primary pending={pending} onClick={() => run(() => adaptAction({ load_factor: load / 100, max_daily_minutes: maxMinutes, max_daily_items: maxItems }, action === 'adapter'), 'Programme adapté : il est recalculé.')}>Adapter</Btn></div>
      </PlanDialog>

      <PlanDialog open={dialog === 'pause'} onOpenChange={(v) => !v && setDialog(null)} title="Mettre mon planning en pause" description="Aucun retard n’est créé pendant la pause ; votre suivi pédagogique général continue. À la reprise, le programme est recalculé.">
        <div className="space-y-2">
          {(['demain', 'jours', 'date'] as const).map((c) => (
            <label key={c} className={cn('flex cursor-pointer items-center gap-3 rounded-[12px] border px-4 py-[10px] text-[14.5px]', pause === c ? 'border-(--pl-pill) bg-(--pl-rose-50)' : 'border-(--pl-card-border)')}>
              <input type="radio" name="pause" checked={pause === c} onChange={() => setPause(c)} className="h-4 w-4 accent-[#850016]" />
              {c === 'demain' ? 'Jusqu’à demain' : c === 'jours' ? 'Quelques jours' : 'Jusqu’à une date'}
              {c === 'jours' && pause === 'jours' && <select value={pauseDays} onChange={(e) => setPauseDays(Number(e.target.value))} className="ml-auto h-[34px] rounded-[8px] border border-(--pl-card-border) bg-(--pl-card) px-2">{[2, 3, 4, 5, 7, 10, 14].map((n) => <option key={n} value={n}>{n} jours</option>)}</select>}
              {c === 'date' && pause === 'date' && <input type="date" min={addDaysClient(today, 1)} value={pauseDate} onChange={(e) => setPauseDate(e.target.value)} className="ml-auto h-[34px] rounded-[8px] border border-(--pl-card-border) bg-(--pl-card) px-2" />}
            </label>
          ))}
        </div>
        <ErrorText error={error} />
        <div className="flex justify-end gap-2"><Btn onClick={() => setDialog(null)}>Annuler</Btn><Btn primary pending={pending} onClick={() => run(() => pauseAction(pause, pause === 'jours' ? pauseDays : null, pause === 'date' ? pauseDate || null : null), 'Planning mis en pause.', true, () => router.push('/planificateur'))}>Mettre en pause</Btn></div>
      </PlanDialog>

      <PlanDialog open={dialog === 'desactiver'} onOpenChange={(v) => !v && setDialog(null)} title="Désactiver mon planificateur" description="Votre planning disparaît, mais votre suivi pédagogique général continue et toutes vos données sont conservées. Vous pourrez le réactiver à tout moment.">
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(DISABLE_REASON_LABEL) as DisableReason[]).map((r) => (
            <label key={r} className={cn('flex cursor-pointer items-center gap-3 rounded-[12px] border px-4 py-[10px] text-[14.5px]', reason === r ? 'border-(--pl-pill) bg-(--pl-rose-50)' : 'border-(--pl-card-border)')}>
              <input type="radio" name="desactivation" checked={reason === r} onChange={() => setReason(r)} className="h-4 w-4 accent-[#850016]" />{DISABLE_REASON_LABEL[r]}
            </label>
          ))}
        </div>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} placeholder="Commentaire (facultatif)" aria-label="Commentaire facultatif" className="min-h-[70px] w-full rounded-[10px] border border-(--pl-card-border) bg-(--pl-card) px-3 py-2 text-[14.5px]" />
        <ErrorText error={error} />
        <div className="flex justify-end gap-2"><Btn onClick={() => setDialog(null)}>Annuler</Btn><Btn primary pending={pending} disabled={!reason} onClick={() => reason && run(() => disableAction(reason, comment.trim() || null, fromAlert), 'Planificateur désactivé.', true, () => router.push('/planificateur'))}>Désactiver</Btn></div>
      </PlanDialog>

      <PlanDialog open={dialog === 'indispo'} onOpenChange={(v) => !v && setDialog(null)} title="Disponibilité exceptionnellement réduite" description="Garde, travail, imprévu : le programme est réparti sans surcharge et cette période ne compte pas comme un abandon.">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Jours concernés">
          {Array.from({ length: 14 }, (_, k) => addDaysClient(today, k)).map((d) => {
            const on = indispoDays.includes(d);
            return <button key={d} type="button" aria-pressed={on} onClick={() => setIndispoDays(on ? indispoDays.filter((x) => x !== d) : [...indispoDays, d])} className={cn('rounded-full border px-3 py-1 text-[13px]', on ? 'border-(--pl-pill) bg-(--pl-pill) text-white' : 'border-(--pl-card-border)')}>{d === today ? 'Aujourd’hui' : fmtDay(d)}</button>;
          })}
        </div>
        <label className="block text-[14px] text-(--pl-text)">Temps disponible ces jours-là
          <select value={indispoMinutes} onChange={(e) => setIndispoMinutes(Number(e.target.value))} className="mt-1 h-[40px] w-full rounded-[10px] border border-(--pl-card-border) bg-(--pl-card) px-3">
            {[0, 30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m === 0 ? 'Aucun (indisponible)' : fmtMinutes(m)}</option>)}
          </select>
        </label>
        <ErrorText error={error} />
        <div className="flex justify-end gap-2"><Btn onClick={() => setDialog(null)}>Annuler</Btn><Btn primary pending={pending} disabled={indispoDays.length === 0} onClick={() => run(() => declareUnavailabilityAction(indispoDays, indispoMinutes), 'Disponibilité enregistrée : le programme est réparti.')}>Enregistrer</Btn></div>
      </PlanDialog>

      <PlanDialog open={dialog === 'specialite'} onOpenChange={(v) => !v && setDialog(null)} title={SPECIALTY_CHANGE_TITLE} description={SPECIALTY_CHANGE_TEXT}>
        <select value={spec} onChange={(e) => setSpec(e.target.value)} aria-label="Nouvelle spécialité" className="h-[42px] w-full rounded-[10px] border border-(--pl-card-border) bg-(--pl-card) px-3 text-[14.5px]">
          {data.preparations.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
        </select>
        <ErrorText error={error} />
        <div className="flex justify-end gap-2"><Btn onClick={() => setDialog(null)}>{SPECIALTY_CHANGE_CANCEL}</Btn><Btn primary pending={pending} disabled={spec === p.specialite_id} onClick={() => run(() => changeSpecialtyAction(spec), 'Spécialité changée : votre planning est entièrement recalculé.', true, () => router.push('/planificateur'))}>{SPECIALTY_CHANGE_CONFIRM}</Btn></div>
      </PlanDialog>
    </div>
  );
}
