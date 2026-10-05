'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { ActivityCard } from '@/lib/plan/pages';
import { ADD_KEEP, ADD_REPLACE, CANCEL_REASON_LABEL, INCOMPLETE_REASON_LABEL, type CancelReason, type IncompleteReason } from '@/lib/plan/types';
import {
  addToTodayAction, cancelActivityAction, claimExtraAction, declareUnavailabilityAction, incompleteDayAction, postponeAction, redistributeAction,
} from '@/app/(student)/planificateur/actions';
import { planSerif } from '../fonts';
import { fmtMinutes } from './activity-card';

/* ─── Briques ─── */
export function PlanDialog({ open, onOpenChange, title, description, children, wide = false }: {
  open: boolean; onOpenChange: (v: boolean) => void; title: string; description?: React.ReactNode; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('plan-v4 rounded-[18px] border border-(--pl-card-border) bg-(--pl-card) p-6 text-(--pl-text)', wide ? 'max-w-[640px]' : 'max-w-[520px]')}>
        <DialogTitle className={cn(planSerif.className, 'pr-8 text-[21px] font-bold leading-tight text-(--pl-ink)')}>{title}</DialogTitle>
        {description && <DialogDescription asChild><div className="text-[14.5px] leading-relaxed text-(--pl-text)">{description}</div></DialogDescription>}
        {children}
      </DialogContent>
    </Dialog>
  );
}
export function Btn({ children, onClick, primary = false, disabled = false, pending = false, type = 'button' }: { children: React.ReactNode; onClick?: () => void; primary?: boolean; disabled?: boolean; pending?: boolean; type?: 'button' | 'submit' }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled || pending}
      className={cn('inline-flex h-[42px] items-center justify-center gap-2 rounded-full px-[18px] text-[14.5px] font-semibold transition disabled:opacity-60',
        primary ? 'bg-(--pl-pill) text-white hover:brightness-110' : 'border border-(--pl-pill) text-(--pl-pill) hover:bg-(--pl-rose-50)')}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}{children}
    </button>
  );
}
function Choice({ checked, onChange, children, name }: { checked: boolean; onChange: () => void; children: React.ReactNode; name: string }) {
  return (
    <label className={cn('flex cursor-pointer items-center gap-3 rounded-[12px] border px-4 py-[10px] text-[14.5px] transition', checked ? 'border-(--pl-pill) bg-(--pl-rose-50) text-(--pl-ink)' : 'border-(--pl-card-border) text-(--pl-text) hover:bg-(--pl-rose-50)')}>
      <input type="radio" name={name} checked={checked} onChange={onChange} className="h-4 w-4 accent-[#850016]" />
      <span>{children}</span>
    </label>
  );
}
export function ErrorText({ error }: { error: string | null }) {
  return error ? <p role="alert" className="rounded-[10px] bg-(--pl-rose-50) px-3 py-2 text-[13.5px] font-semibold text-(--pl-bordeaux)">{error}</p> : null;
}
const inputCls = 'h-[42px] w-full rounded-[10px] border border-(--pl-card-border) bg-(--pl-card) px-3 text-[14.5px] text-(--pl-ink)';
const areaCls = 'min-h-[70px] w-full rounded-[10px] border border-(--pl-card-border) bg-(--pl-card) px-3 py-2 text-[14.5px] text-(--pl-ink)';

/* ─── Reporter (§20-§22) ─── */
export function PostponeDialog({ open, onOpenChange, activities, today, title = 'Reporter' }: {
  open: boolean; onOpenChange: (v: boolean) => void; activities: ActivityCard[]; today: string; title?: string;
}) {
  const router = useRouter();
  const [to, setTo] = useState<'demain' | 'apres_demain' | 'date' | 'auto'>('demain');
  const [date, setDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [overload, setOverload] = useState<{ day: string; planned: number; budget: number } | null>(null);
  const [pending, start] = useTransition();
  const minutes = activities.reduce((s, a) => s + a.minutes, 0);
  const submit = () => start(async () => {
    setError(null);
    const target = to === 'date' ? date : to;
    if (to === 'date' && !date) { setError('Choisissez une date.'); return; }
    const r = await postponeAction(activities.map((a) => a.id), target, null, null);
    if (!r.ok) { setError(r.error); return; }
    if (r.overload && r.day) { setOverload({ day: r.day, planned: r.plannedMinutes, budget: r.budget }); router.refresh(); return; }
    onOpenChange(false);
    router.refresh();
  });
  const spread = () => start(async () => {
    const r = await redistributeAction();
    if (!r.ok) { setError(r.error); return; }
    setOverload(null);
    onOpenChange(false);
    router.refresh();
  });
  return (
    <PlanDialog open={open} onOpenChange={(v) => { if (!v) setOverload(null); onOpenChange(v); }} title={overload ? 'Votre programme deviendrait trop chargé' : title}
      description={overload
        ? <>Avec ce report, votre programme du {fmtDay(overload.day)} atteindrait {fmtMinutes(overload.planned)} pour {fmtMinutes(overload.budget)} disponibles. Le planificateur peut répartir automatiquement ces activités selon vos priorités, vos prérequis et votre charge maximale quotidienne.</>
        : <>{activities.length > 1 ? `${activities.length} activités (${fmtMinutes(minutes)})` : `« ${activities[0]?.itemName ?? activities[0]?.typeLabel ?? ''} » (${fmtMinutes(minutes)})`}. Rien n’est empilé aveuglément : la charge future est recalculée.</>}>
      {overload ? (
        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <Btn onClick={() => { setOverload(null); onOpenChange(false); }}>Conserver ce report</Btn>
          <Btn primary pending={pending} onClick={spread}>Répartir automatiquement</Btn>
        </div>
      ) : (
        <div className="space-y-2.5">
          <Choice name="report" checked={to === 'demain'} onChange={() => setTo('demain')}>Demain</Choice>
          <Choice name="report" checked={to === 'apres_demain'} onChange={() => setTo('apres_demain')}>Dans 2 jours</Choice>
          <Choice name="report" checked={to === 'date'} onChange={() => setTo('date')}>Date personnalisée</Choice>
          {to === 'date' && <input type="date" min={addDaysClient(today, 1)} value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} aria-label="Date du report" />}
          <Choice name="report" checked={to === 'auto'} onChange={() => setTo('auto')}>Laisser le planificateur le replacer selon mes priorités</Choice>
          <ErrorText error={error} />
          <div className="flex justify-end gap-2 pt-1">
            <Btn onClick={() => onOpenChange(false)}>Annuler</Btn>
            <Btn primary pending={pending} onClick={submit}>Reporter</Btn>
          </div>
        </div>
      )}
    </PlanDialog>
  );
}

/* ─── Je ne peux pas terminer aujourd'hui (§23-§27) ─── */
export function IncompleteDayDialog({ open, onOpenChange, items, today }: { open: boolean; onOpenChange: (v: boolean) => void; items: { id: string; name: string }[]; today: string }) {
  const router = useRouter();
  const [reason, setReason] = useState<IncompleteReason | null>(null);
  const [comment, setComment] = useState('');
  const [difficult, setDifficult] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [follow, setFollow] = useState<{ adapt: boolean; unavailability: boolean } | null>(null);
  const [days, setDays] = useState<string[]>([addDaysClient(today, 1)]);
  const [minutes, setMinutes] = useState(0);
  const [pending, start] = useTransition();
  const submit = () => start(async () => {
    setError(null);
    if (!reason) { setError('Choisissez un motif.'); return; }
    const r = await incompleteDayAction(reason, comment.trim() || null, reason === 'difficulte_items' ? difficult : []);
    if (!r.ok) { setError(r.error); return; }
    router.refresh();
    if (r.suggestAdapt || r.suggestUnavailability) { setFollow({ adapt: r.suggestAdapt, unavailability: r.suggestUnavailability }); return; }
    onOpenChange(false);
  });
  const saveUnavailability = () => start(async () => {
    const r = await declareUnavailabilityAction(days, minutes);
    if (!r.ok) { setError(r.error); return; }
    onOpenChange(false);
    router.refresh();
  });
  if (follow) {
    return (
      <PlanDialog open={open} onOpenChange={onOpenChange} title="C’est noté"
        description={follow.adapt ? 'Votre programme semble supérieur à votre disponibilité actuelle. Un programme réaliste vaut mieux qu’un programme intenable.' : 'Vous pouvez déclarer une disponibilité réduite : le programme sera réparti sans surcharge et cette période ne sera pas comptée comme un abandon.'}>
        {follow.adapt && <div className="flex justify-end"><Btn primary onClick={() => router.push('/planificateur/objectifs?action=adapter')}>Adapter mon programme</Btn></div>}
        {follow.unavailability && (
          <div className="space-y-3">
            <p className="text-[14px] font-semibold text-(--pl-ink)">Disponibilité exceptionnellement réduite</p>
            <DayPicker today={today} value={days} onChange={setDays} />
            <label className="block text-[14px]">Temps disponible ces jours-là
              <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className={cn(inputCls, 'mt-1')}>
                {[0, 30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m === 0 ? 'Aucun (indisponible)' : fmtMinutes(m)}</option>)}
              </select>
            </label>
            <ErrorText error={error} />
            <div className="flex justify-end gap-2"><Btn onClick={() => onOpenChange(false)}>Plus tard</Btn><Btn primary pending={pending} onClick={saveUnavailability}>Enregistrer</Btn></div>
          </div>
        )}
      </PlanDialog>
    );
  }
  return (
    <PlanDialog open={open} onOpenChange={onOpenChange} title="Je ne peux pas terminer aujourd’hui"
      description="Indiquez simplement la raison principale : elle aide le planificateur à vous proposer un programme réaliste. Aucune justification écrite n’est demandée.">
      <div className="grid gap-2 sm:grid-cols-2">
        {(Object.keys(INCOMPLETE_REASON_LABEL) as IncompleteReason[]).map((r) => (
          <Choice key={r} name="motif" checked={reason === r} onChange={() => setReason(r)}>{INCOMPLETE_REASON_LABEL[r]}</Choice>
        ))}
      </div>
      {reason === 'difficulte_items' && items.length > 0 && (
        <fieldset className="space-y-1.5">
          <legend className="text-[14px] font-semibold text-(--pl-ink)">Sur quels items ? (facultatif)</legend>
          {items.map((i) => (
            <label key={i.id} className="flex items-center gap-2 text-[14px]">
              <input type="checkbox" className="h-4 w-4 accent-[#850016]" checked={difficult.includes(i.id)} onChange={(e) => setDifficult((d) => (e.target.checked ? [...d, i.id] : d.filter((x) => x !== i.id)))} />{i.name}
            </label>
          ))}
          <p className="text-[12.5px] text-(--pl-muted)">Ces items restent prioritaires : le planificateur vous proposera la fiche et un entraînement ciblé.</p>
        </fieldset>
      )}
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} placeholder="Commentaire (facultatif)" className={areaCls} aria-label="Commentaire facultatif" />
      <ErrorText error={error} />
      <div className="flex justify-end gap-2"><Btn onClick={() => onOpenChange(false)}>Annuler</Btn><Btn primary pending={pending} onClick={submit}>Enregistrer</Btn></div>
    </PlanDialog>
  );
}

/* ─── Retirer une activité, un item prioritaire (§39-§40) ─── */
export function CancelDialog({ open, onOpenChange, activity }: { open: boolean; onOpenChange: (v: boolean) => void; activity: ActivityCard | null }) {
  const router = useRouter();
  const [reason, setReason] = useState<CancelReason | null>(null);
  const [comment, setComment] = useState('');
  const [confirm, setConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (!activity) return null;
  const send = (choice: 'conserver' | 'reporter' | 'version_courte' | 'retirer' | null) => start(async () => {
    setError(null);
    if (!reason) { setError('Choisissez un motif.'); return; }
    if (choice === 'conserver') { onOpenChange(false); return; }
    const r = await cancelActivityAction(activity.id, reason, comment.trim() || null, choice);
    if (!r.ok) { setError(r.error); return; }
    if (r.needsConfirmation) { setConfirm(r.itemName ?? activity.itemName ?? 'Cet item'); return; }
    onOpenChange(false);
    router.refresh();
  });
  return (
    <PlanDialog open={open} onOpenChange={(v) => { if (!v) setConfirm(null); onOpenChange(v); }} title={confirm ? 'Cet item est considéré comme prioritaire pour votre préparation.' : 'Retirer cette activité'}
      description={confirm
        ? <>« {confirm} » fait partie des connaissances essentielles. Plutôt que de le retirer, vous pouvez le conserver, le reporter ou en faire une version courte (survol structuré). Si vous le retirez malgré tout, la décision est conservée et vous pourrez le remettre à tout moment dans « Mes révisions ».</>
        : activity.fundamental ? <span className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-(--pl-bordeaux)" />Activité fondamentale : nous vous recommandons au minimum un survol ou une révision courte.</span> : 'Le besoin pédagogique reste suivi par le moteur : rien n’est jamais perdu.'}>
      {confirm ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <Btn onClick={() => send('conserver')}>Conserver</Btn>
          <Btn onClick={() => send('reporter')} pending={pending}>Reporter</Btn>
          <Btn onClick={() => send('version_courte')} pending={pending}>Faire une version courte</Btn>
          <Btn primary onClick={() => send('retirer')} pending={pending}>Retirer malgré tout</Btn>
          <div className="sm:col-span-2"><ErrorText error={error} /></div>
        </div>
      ) : (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(CANCEL_REASON_LABEL) as CancelReason[]).map((r) => <Choice key={r} name="annulation" checked={reason === r} onChange={() => setReason(r)}>{CANCEL_REASON_LABEL[r]}</Choice>)}
          </div>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} placeholder="Commentaire (facultatif)" className={areaCls} aria-label="Commentaire facultatif" />
          <ErrorText error={error} />
          <div className="flex justify-end gap-2"><Btn onClick={() => onOpenChange(false)}>Annuler</Btn><Btn primary pending={pending} onClick={() => send(null)}>Retirer</Btn></div>
        </>
      )}
    </PlanDialog>
  );
}

/* ─── Ajouter à aujourd'hui (§20) ─── */
export function AddTodayDialog({ open, onOpenChange, activity, replaceable }: { open: boolean; onOpenChange: (v: boolean) => void; activity: ActivityCard | null; replaceable: ActivityCard[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<'conserver' | 'remplacer'>('conserver');
  const [replaceId, setReplaceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (!activity) return null;
  const submit = () => start(async () => {
    setError(null);
    const r = await addToTodayAction(activity.id, mode, mode === 'remplacer' ? replaceId : null);
    if (!r.ok) { setError(r.error); return; }
    onOpenChange(false);
    router.refresh();
  });
  return (
    <PlanDialog open={open} onOpenChange={onOpenChange} title="Ajouter à aujourd’hui" description={`« ${activity.itemName ?? activity.typeLabel} » (${fmtMinutes(activity.minutes)}) est prévue le ${fmtDay(activity.day)}.`}>
      <div className="space-y-2.5">
        <Choice name="ajout" checked={mode === 'conserver'} onChange={() => setMode('conserver')}>{ADD_KEEP} <span className="text-(--pl-muted)">— l’activité s’ajoute en plus</span></Choice>
        <Choice name="ajout" checked={mode === 'remplacer'} onChange={() => setMode('remplacer')}>{ADD_REPLACE} <span className="text-(--pl-muted)">— une activité du jour est reportée</span></Choice>
        {mode === 'remplacer' && (
          <select value={replaceId ?? ''} onChange={(e) => setReplaceId(e.target.value || null)} className={inputCls} aria-label="Activité à reporter">
            <option value="">Choisissez l’activité à reporter…</option>
            {replaceable.map((a) => <option key={a.id} value={a.id}>{a.blockLabel} — {a.itemName ?? a.typeLabel} ({fmtMinutes(a.minutes)})</option>)}
          </select>
        )}
        <ErrorText error={error} />
        <div className="flex justify-end gap-2 pt-1"><Btn onClick={() => onOpenChange(false)}>Annuler</Btn><Btn primary pending={pending} onClick={submit} disabled={mode === 'remplacer' && !replaceId}>Ajouter</Btn></div>
      </div>
    </PlanDialog>
  );
}

/* ─── J'ai encore du temps (§32) ─── */
export function ExtraTimeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const pick = (budget: number | null) => start(async () => {
    setError(null);
    const r = await claimExtraAction(budget);
    if (!r.ok) { setError(r.error); return; }
    if (!r.activityId) { setError('Aucune activité à venir ne tient dans ce temps : tout votre programme prévu est déjà réalisé.'); return; }
    onOpenChange(false);
    router.push(`/planificateur/activite/${r.activityId}`);
  });
  return (
    <PlanDialog open={open} onOpenChange={onOpenChange} title="Il vous reste du temps ?" description="Le planificateur avance la prochaine activité prévue la plus pertinente : elle disparaît de sa date initiale et vos prochains jours s’allègent d’autant.">
      <div className="grid grid-cols-2 gap-2">
        {[15, 30, 60].map((m) => <Btn key={m} onClick={() => pick(m)} pending={pending}>{m} min</Btn>)}
        <Btn primary onClick={() => pick(null)} pending={pending}>Sans limite</Btn>
      </div>
      <ErrorText error={error} />
    </PlanDialog>
  );
}

/* ─── Outils ─── */
export function addDaysClient(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const WEEKDAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
export function fmtDay(day: string, withWeekday = true): string {
  const [y, m, d] = day.split('-').map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${withWeekday ? `${WEEKDAYS[wd]} ` : ''}${d === 1 ? '1er' : d} ${MONTHS[m - 1]}`;
}
function DayPicker({ today, value, onChange }: { today: string; value: string[]; onChange: (v: string[]) => void }) {
  const days = Array.from({ length: 14 }, (_, i) => addDaysClient(today, i));
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Jours concernés">
      {days.map((d) => {
        const on = value.includes(d);
        return (
          <button key={d} type="button" aria-pressed={on} onClick={() => onChange(on ? value.filter((x) => x !== d) : [...value, d])}
            className={cn('rounded-full border px-3 py-1 text-[13px]', on ? 'border-(--pl-pill) bg-(--pl-pill) text-white' : 'border-(--pl-card-border) text-(--pl-text) hover:bg-(--pl-rose-50)')}>
            {d === today ? 'Aujourd’hui' : fmtDay(d)}
          </button>
        );
      })}
    </div>
  );
}
