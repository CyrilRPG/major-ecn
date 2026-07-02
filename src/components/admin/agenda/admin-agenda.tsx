'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Edit, Plus, Star, Trash2, User, Video } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { upsertPlatformEvent, deletePlatformEvent } from '@/app/admin/agenda/actions';

export type PlatformEventRow = {
  id: string;
  title: string;
  date: string;          // YYYY-MM-DD
  start_time: string | null;
  end_time: string | null;
  college: string | null;
  intervenant: string | null;
  zoom_url: string | null;
  notes: string | null;
  required_offers: string[] | null;
  scope_type: 'all' | 'college';
  scope_colleges: string[] | null;
};

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const COLLEGE_PALETTE: Record<string, { bg: string; fg: string; tag: string }> = {
  'Cardiologie':           { bg: '#FFF1E6', fg: '#B35900', tag: '#FCD9A8' },
  'Pneumologie':           { bg: '#E5F1FF', fg: '#1E4D8B', tag: '#BBD7F7' },
  'Maladies infectieuses': { bg: '#E7F6EC', fg: '#16793C', tag: '#BFE2C9' },
  'ECOS':                  { bg: '#FFF7DC', fg: '#8A6300', tag: '#F3E0A0' },
  'Néphrologie':           { bg: '#FDE7E9', fg: '#C0001F', tag: '#FACBD0' },
  'Transversal':           { bg: '#FFEED5', fg: '#A65500', tag: '#F4D2A1' },
};
const DEFAULT_PALETTE = { bg: '#FDE7E9', fg: '#C0001F', tag: '#FACBD0' };
const paletteFor = (college: string | null) => {
  if (!college) return DEFAULT_PALETTE;
  return COLLEGE_PALETTE[college] ?? DEFAULT_PALETTE;
};

function weekDates(offset = 0): Date[] {
  const now = new Date();
  const dow = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - dow + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i); return d;
  });
}
const dateKey = (d: Date) => d.toISOString().slice(0, 10);

/* ════════════════════════════════════════════════════════════════════════ */
export function AdminAgenda({
  events, colleges,
}: {
  events: PlatformEventRow[];
  colleges: { id: string; nom: string }[];
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const dates = weekDates(weekOffset);
  const todayKey = new Date().toDateString();
  const [creatingFor, setCreatingFor] = useState<Date | null>(null);
  const [editing, setEditing] = useState<PlatformEventRow | null>(null);

  const weekLabel = useMemo(() => {
    const first = dates[0]; const last = dates[6];
    const sameMonth = first.getMonth() === last.getMonth();
    const fmtDay = new Intl.DateTimeFormat('fr-FR', { day: 'numeric' });
    const fmtFull = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' });
    const year = last.getFullYear();
    return sameMonth
      ? `${fmtDay.format(first)} → ${fmtFull.format(last)} ${year}`
      : `${fmtFull.format(first)} → ${fmtFull.format(last)} ${year}`;
  }, [dates]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) px-3 py-2 shadow-(--shadow-soft)">
        <button
          type="button"
          onClick={() => setWeekOffset((o) => o - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-ink-soft) hover:bg-(--color-sand-100) hover:text-(--color-ink)"
        ><ChevronLeft className="h-4 w-4" /></button>
        <div className="flex flex-1 items-center justify-center gap-2">
          <p className="text-sm font-semibold text-(--color-ink) first-letter:uppercase">{weekLabel}</p>
          {weekOffset !== 0 && (
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className="rounded-full bg-(--color-primary-soft) px-2.5 py-0.5 text-[11px] font-semibold text-(--color-primary-deep) hover:bg-(--color-primary)/15"
            >Aujourd’hui</button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setWeekOffset((o) => o + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-ink-soft) hover:bg-(--color-sand-100) hover:text-(--color-ink)"
        ><ChevronRight className="h-4 w-4" /></button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {dates.map((date, i) => {
          const dayEvs = events
            .filter((e) => e.date === dateKey(date))
            .sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? ''));
          const isToday = date.toDateString() === todayKey;
          return (
            <div
              key={i}
              className={`flex flex-col overflow-hidden rounded-2xl border bg-(--color-surface) shadow-(--shadow-soft) ${
                isToday ? 'border-(--color-primary) ring-2 ring-(--color-primary)/40' : 'border-(--color-border)'
              }`}
            >
              <div className={`flex items-baseline justify-between px-4 py-3 ${
                isToday ? 'bg-(--color-primary) text-white' : 'bg-(--color-surface-soft)'
              }`}>
                <span className={`flex items-center gap-1.5 text-sm font-semibold ${isToday ? 'text-white' : 'text-(--color-ink)'}`}>
                  {DAYS[i]}{isToday && <Star className="h-3.5 w-3.5 fill-current" />}
                </span>
                <span className={`text-xs tabular-nums ${isToday ? 'text-white/80' : 'text-(--color-ink-muted)'}`}>
                  {date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2.5 p-3">
                {dayEvs.length === 0 && (
                  <div className="flex flex-1 items-center justify-center py-6">
                    <span className="text-xs text-(--color-ink-muted)">Aucun évènement</span>
                  </div>
                )}
                {dayEvs.map((e) => {
                  const pal = paletteFor(e.college);
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => { setEditing(e); setCreatingFor(new Date(e.date + 'T00:00:00')); }}
                      className="group flex flex-col rounded-xl border border-transparent p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-(--shadow-soft) focus-ring"
                      style={{ background: pal.bg }}
                    >
                      <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: pal.fg }}>
                        <Clock className="h-3.5 w-3.5" />
                        {e.start_time ? `${e.start_time.slice(0, 5)}${e.end_time ? ` – ${e.end_time.slice(0, 5)}` : ''}` : 'Journée'}
                      </span>
                      <span className="mt-1.5 block text-sm font-semibold leading-snug text-(--color-ink)">{e.title}</span>
                      {e.college && (
                        <span
                          className="mt-1.5 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                          style={{ background: pal.tag, color: pal.fg }}
                        >{e.college}</span>
                      )}
                      <span className="mt-1.5 flex flex-wrap gap-1 text-[10px]">
                        {(e.required_offers ?? []).map((o) => (
                          <span key={o} className="rounded bg-white/70 px-1.5 py-0.5 font-semibold uppercase tracking-wide" style={{ color: pal.fg }}>{o}</span>
                        ))}
                        {e.scope_type === 'college' && (
                          <span className="rounded bg-white/70 px-1.5 py-0.5 font-semibold text-[10px]" style={{ color: pal.fg }}>
                            {(e.scope_colleges ?? []).length} collège{(e.scope_colleges ?? []).length > 1 ? 's' : ''}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => { setEditing(null); setCreatingFor(date); }}
                  className="mt-auto flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-(--color-border) py-2 text-xs font-medium text-(--color-ink-muted) transition-colors hover:border-(--color-primary)/60 hover:bg-(--color-primary-soft)/40 hover:text-(--color-primary)"
                >
                  <Plus className="h-3.5 w-3.5" /> Ajouter
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <EventFormDialog
        open={creatingFor != null}
        date={creatingFor}
        initial={editing}
        colleges={colleges}
        onClose={() => { setCreatingFor(null); setEditing(null); }}
      />
    </div>
  );
}

/* ──────────────────────── Dialog formulaire ──────────────────────── */
function EventFormDialog({
  open, date, initial, colleges, onClose,
}: {
  open: boolean;
  date: Date | null;
  initial: PlatformEventRow | null;
  colleges: { id: string; nom: string }[];
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [scopeType, setScopeType] = useState<'all' | 'college'>(initial?.scope_type ?? 'all');
  const [scopeColleges, setScopeColleges] = useState<string[]>(initial?.scope_colleges ?? []);
  const [offers, setOffers] = useState<string[]>(initial?.required_offers ?? ['essentiel', 'intensif', 'approfondi']);

  // Réinitialise les états locaux à chaque ouverture
  useEffect(() => {
    if (!open) return;
    setScopeType(initial?.scope_type ?? 'all');
    setScopeColleges(initial?.scope_colleges ?? []);
    setOffers(initial?.required_offers ?? ['essentiel', 'intensif', 'approfondi']);
    setErr(null);
  }, [open, initial]);

  const onSubmit = (formData: FormData) => {
    // Ajoute manuellement les checkboxes non incluses dans le form
    formData.delete('required_offers');
    offers.forEach((o) => formData.append('required_offers', o));
    formData.set('scope_type', scopeType);
    formData.delete('scope_colleges');
    if (scopeType === 'college') {
      scopeColleges.forEach((c) => formData.append('scope_colleges', c));
    }
    setErr(null);
    startTransition(async () => {
      const res = await upsertPlatformEvent(formData);
      if (res.error) setErr(res.error);
      else onClose();
    });
  };

  const onDelete = () => {
    if (!initial) return;
    if (!confirm('Supprimer cet évènement ?')) return;
    startTransition(async () => {
      await deletePlatformEvent(initial.id);
      onClose();
    });
  };

  const toggleOffer = (o: string) => {
    setOffers((cur) => cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o]);
  };
  const toggleCollege = (id: string) => {
    setScopeColleges((cur) => cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-(--color-primary)" />
            {initial ? 'Modifier l’évènement' : 'Nouvel évènement plateforme'}
          </DialogTitle>
          <DialogDescription>
            {date?.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4">
          {initial && <input type="hidden" name="id" value={initial.id} />}
          <input type="hidden" name="date" value={initial?.date ?? (date ? dateKey(date) : '')} />

          <Field label="Titre">
            <input
              name="title" required maxLength={180}
              defaultValue={initial?.title ?? ''}
              placeholder="Ex. : Insuffisance cardiaque — item 234"
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus-ring"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Début">
              <input type="time" name="start_time" defaultValue={initial?.start_time?.slice(0, 5) ?? ''}
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus-ring" />
            </Field>
            <Field label="Fin">
              <input type="time" name="end_time" defaultValue={initial?.end_time?.slice(0, 5) ?? ''}
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus-ring" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Collège (libellé)">
              <input name="college" defaultValue={initial?.college ?? ''}
                placeholder="Ex. : Cardiologie, ECOS, Transversal…"
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus-ring" />
            </Field>
            <Field label="Intervenant">
              <input name="intervenant" defaultValue={initial?.intervenant ?? ''}
                placeholder="Ex. : Dr. A. Lemaire (cardiologue)"
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus-ring" />
            </Field>
          </div>

          <Field label="Lien Zoom">
            <input name="zoom_url" type="url" defaultValue={initial?.zoom_url ?? ''}
              placeholder="https://zoom.us/j/…"
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus-ring" />
          </Field>

          <Field label="Notes internes">
            <textarea name="notes" rows={2} maxLength={2000} defaultValue={initial?.notes ?? ''}
              className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus-ring" />
          </Field>

          {/* ────── Permissions ────── */}
          <fieldset className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3.5">
            <legend className="px-1 text-xs font-bold uppercase tracking-wide text-(--color-ink-soft)">
              Qui voit cet évènement ?
            </legend>

            <p className="mb-2 text-xs font-semibold text-(--color-ink)">Formules autorisées</p>
            <div className="mb-3 flex flex-wrap gap-2">
              {(['essentiel', 'intensif', 'approfondi'] as const).map((o) => (
                <label key={o} className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  offers.includes(o)
                    ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary-deep)'
                    : 'border-(--color-border) text-(--color-ink-soft) hover:bg-(--color-surface)'
                }`}>
                  <input type="checkbox" className="sr-only" checked={offers.includes(o)} onChange={() => toggleOffer(o)} />
                  {o === 'essentiel' ? 'Essentiel' : o === 'intensif' ? 'Intensif' : 'Approfondi'}
                </label>
              ))}
            </div>

            <p className="mb-2 text-xs font-semibold text-(--color-ink)">Spécialités concernées</p>
            <div className="mb-3 flex gap-2">
              {(['all', 'college'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setScopeType(t)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    scopeType === t
                      ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary-deep)'
                      : 'border-(--color-border) text-(--color-ink-soft) hover:bg-(--color-surface)'
                  }`}
                >
                  {t === 'all' ? 'Toutes les spécialités' : 'Spécialités ciblées'}
                </button>
              ))}
            </div>

            {scopeType === 'college' && (
              <div>
                <p className="mb-1.5 text-xs font-semibold text-(--color-ink)">Spécialités ciblées</p>
                <div className="grid max-h-44 grid-cols-2 gap-1.5 overflow-y-auto rounded-lg border border-(--color-border) bg-(--color-surface) p-2">
                  {colleges.map((c) => (
                    <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs hover:bg-(--color-surface-soft)">
                      <input
                        type="checkbox"
                        checked={scopeColleges.includes(c.id)}
                        onChange={() => toggleCollege(c.id)}
                        className="h-3.5 w-3.5 rounded border-(--color-border)"
                      />
                      <span className="text-(--color-ink)">{c.nom}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </fieldset>

          {err && <p className="rounded-lg bg-(--color-primary-soft) px-3 py-2 text-xs text-(--color-primary-deep)">{err}</p>}

          <div className="flex items-center justify-between gap-2 pt-2">
            <div>
              {initial && (
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={pending}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-2 text-sm text-(--color-ink-soft) hover:border-(--color-primary)/60 hover:text-(--color-primary) disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" /> Supprimer
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-(--color-border) px-3 py-2 text-sm text-(--color-ink-soft) hover:bg-(--color-surface-soft)"
              >Annuler</button>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-4 py-2 text-sm font-semibold text-white shadow-(--shadow-soft) hover:opacity-90 disabled:opacity-50"
              >
                {initial ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {pending ? 'Enregistrement…' : (initial ? 'Mettre à jour' : 'Créer')}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-(--color-ink-soft)">{label}</span>
      {children}
    </label>
  );
}

