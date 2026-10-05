'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Clock, Info, Layers, ListChecks, Loader2, Play, Search, Sparkles, Star, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { gaugeAction, startCheckupAction } from '@/app/(student)/checkup/actions';
import { FORMAT_LABEL, TEXTS, type CheckupFormat, type CheckupMode } from '@/lib/checkup/types';
import { cn } from '@/lib/utils';

type Specialty = { id: string; nom: string; categories: { id: string; nom: string }[]; items: { id: string; nom: string; categoryId: string | null; stars: number }[] };
type GaugeView = { needed: number; unit: 'questions' | 'blocs'; eligible: number; unseen: number; ok: boolean; fallbackText: string | null; blockedText: string | null };

const MODES: { id: CheckupMode; label: string; hint: string; Icon: typeof Target }[] = [
  { id: 'global', label: 'Globale', hint: 'Tout le programme de la spécialité', Icon: Layers },
  { id: 'categories', label: 'Par catégories', hint: 'Les domaines que vous choisissez', Icon: ListChecks },
  { id: 'items', label: 'Par items', hint: 'Des items précis (plusieurs recommandés)', Icon: Target },
];

/**
 * Écran de lancement (§34) : périmètre (globale / catégories / items), format
 * selon la voie, jauge de disponibilité EN TEMPS RÉEL (§5) — total éligible,
 * questions déjà vues comprises, et « dont X inédites pour vous » à part. Un
 * contenu insuffisant bloque le lancement : rien n'est élargi en silence.
 */
export function CheckupLauncher({ specialties, formats, defaultSpecialty }: { specialties: Specialty[]; formats: CheckupFormat[]; defaultSpecialty: string | null }) {
  const router = useRouter();
  const [specialiteId, setSpecialiteId] = useState(defaultSpecialty ?? specialties[0]?.id ?? '');
  const [mode, setMode] = useState<CheckupMode>('global');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [itemIds, setItemIds] = useState<string[]>([]);
  const [format, setFormat] = useState<CheckupFormat>(formats[0]);
  const [search, setSearch] = useState('');
  const [gauge, setGauge] = useState<GaugeView | null>(null);
  const [gaugeError, setGaugeError] = useState<string | null>(null);
  const [loadingGauge, setLoadingGauge] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [starting, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const spec = specialties.find((s) => s.id === specialiteId) ?? null;
  const hasCategories = (spec?.categories.length ?? 0) > 0;
  const reqId = useRef(0);

  // Changement de spécialité : on repart d'un périmètre vide.
  const changeSpecialty = (id: string) => { setSpecialiteId(id); setCategoryIds([]); setItemIds([]); setMode('global'); setSearch(''); };
  const params = useMemo(() => ({ specialiteId, mode, categoryIds: mode === 'categories' ? categoryIds : [], itemIds: mode === 'items' ? itemIds : [], format }), [specialiteId, mode, categoryIds, itemIds, format]);
  const incomplete = (mode === 'categories' && categoryIds.length === 0) || (mode === 'items' && itemIds.length === 0) || !specialiteId;

  useEffect(() => {
    if (incomplete) return;
    const id = ++reqId.current;
    const t = setTimeout(async () => {
      setLoadingGauge(true);
      setGaugeError(null);
      const r = await gaugeAction(params);
      if (id !== reqId.current) return;
      setLoadingGauge(false);
      if (r.ok) setGauge(r.gauge); else { setGauge(null); setGaugeError(r.error); }
    }, 350);
    return () => clearTimeout(t);
  }, [params, incomplete]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (spec?.items ?? []).filter((i) => !q || i.nom.toLowerCase().includes(q));
  }, [spec, search]);

  const launch = () => startTransition(async () => {
    setError(null);
    const r = await startCheckupAction(params);
    if (!r.ok) { setError(r.error); setConfirm(false); return; }
    router.push(`/checkup/${r.id}`);
  });

  const showGauge = !incomplete ? gauge : null;
  const pct = showGauge ? Math.min(100, Math.round((showGauge.eligible / Math.max(1, showGauge.needed)) * 100)) : 0;

  return (
    <section aria-labelledby="checkup-launch" className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-6">
      <h2 id="checkup-launch" className="flex items-center gap-2 text-base font-bold text-(--color-ink)"><Sparkles className="h-4 w-4 text-(--color-primary)" /> Composer mon Check-up</h2>

      {/* Spécialité */}
      <div className="mt-4">
        <label htmlFor="checkup-spe" className="text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">Spécialité</label>
        <select id="checkup-spe" value={specialiteId} onChange={(e) => changeSpecialty(e.target.value)}
          className="mt-1 h-11 w-full rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-ink) focus-ring">
          {specialties.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
        </select>
      </div>

      {/* Mode de sélection (§3) */}
      <fieldset className="mt-5">
        <legend className="text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">Périmètre</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3" role="radiogroup">
          {MODES.filter((m) => m.id !== 'categories' || hasCategories).map((m) => (
            <button key={m.id} type="button" role="radio" aria-checked={mode === m.id} onClick={() => setMode(m.id)}
              className={cn('flex items-start gap-3 rounded-xl border p-3 text-left transition focus-ring',
                mode === m.id ? 'border-(--color-primary) bg-(--color-primary-soft)' : 'border-(--color-border) hover:border-(--color-primary)/50')}>
              <m.Icon className={cn('mt-0.5 h-4 w-4 shrink-0', mode === m.id ? 'text-(--color-primary)' : 'text-(--color-ink-muted)')} />
              <span><span className="block text-sm font-semibold text-(--color-ink)">{m.label}</span><span className="block text-xs text-(--color-ink-soft)">{m.hint}</span></span>
            </button>
          ))}
        </div>
      </fieldset>

      {mode === 'categories' && spec && (
        <div className="mt-3 flex flex-wrap gap-2">
          {spec.categories.map((c) => {
            const on = categoryIds.includes(c.id);
            return (
              <button key={c.id} type="button" aria-pressed={on} onClick={() => setCategoryIds((v) => on ? v.filter((x) => x !== c.id) : [...v, c.id])}
                className={cn('rounded-full border px-3 py-1.5 text-sm transition focus-ring', on ? 'border-(--color-primary) bg-(--color-primary) text-white' : 'border-(--color-border) text-(--color-ink) hover:border-(--color-primary)/60')}>
                {c.nom}
              </button>
            );
          })}
        </div>
      )}

      {mode === 'items' && spec && (
        <div className="mt-3 rounded-xl border border-(--color-border)">
          <div className="flex items-center gap-2 border-b border-(--color-border) px-3 py-2">
            <Search className="h-4 w-4 text-(--color-ink-muted)" aria-hidden />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un item…" aria-label="Rechercher un item"
              className="h-8 flex-1 bg-transparent text-sm text-(--color-ink) outline-none placeholder:text-(--color-ink-muted)" />
            <span className="text-xs text-(--color-ink-muted)">{itemIds.length} sélectionné{itemIds.length > 1 ? 's' : ''}</span>
          </div>
          <ul className="max-h-72 overflow-y-auto p-1">
            {filteredItems.map((i) => {
              const on = itemIds.includes(i.id);
              return (
                <li key={i.id}>
                  <label className={cn('flex cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-sm', on ? 'bg-(--color-primary-soft)' : 'hover:bg-(--color-surface-soft)')}>
                    <input type="checkbox" checked={on} onChange={() => setItemIds((v) => on ? v.filter((x) => x !== i.id) : [...v, i.id])} className="mt-0.5 h-4 w-4 accent-(--color-primary)" />
                    <span className="flex-1 text-(--color-ink)">{i.nom}</span>
                    {i.stars > 0 && <span className="flex shrink-0 items-center gap-0.5 text-amber-500" aria-label={`${i.stars} étoile${i.stars > 1 ? 's' : ''}`}>{Array.from({ length: Math.min(5, i.stars) }, (_, k) => <Star key={k} className="h-3 w-3 fill-current" />)}</span>}
                  </label>
                </li>
              );
            })}
            {filteredItems.length === 0 && <li className="px-3 py-4 text-center text-sm text-(--color-ink-muted)">Aucun item pour cette recherche.</li>}
          </ul>
          {itemIds.length === 1 && <p className="border-t border-(--color-border) px-3 py-2 text-xs text-(--color-ink-soft)"><Info className="mr-1 inline h-3.5 w-3.5" />Un seul item est possible si la banque suffit, mais plusieurs items sont recommandés.</p>}
        </div>
      )}

      {/* Format (§7, §13, §34) */}
      <fieldset className="mt-5">
        <legend className="text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">Format</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3" role="radiogroup">
          {formats.map((f) => (
            <button key={f} type="button" role="radio" aria-checked={format === f} onClick={() => setFormat(f)}
              className={cn('flex items-center gap-3 rounded-xl border p-3 text-left transition focus-ring',
                format === f ? 'border-(--color-primary) bg-(--color-primary-soft)' : 'border-(--color-border) hover:border-(--color-primary)/50')}>
              <Clock className={cn('h-4 w-4 shrink-0', format === f ? 'text-(--color-primary)' : 'text-(--color-ink-muted)')} />
              <span>
                <span className="block text-sm font-semibold text-(--color-ink)">{f === 'interne_40_60' ? 'Voie interne' : 'Voie externe'}</span>
                <span className="block text-xs text-(--color-ink-soft)">{FORMAT_LABEL[f]}</span>
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Jauge de disponibilité (§5) */}
      <div className="mt-5 rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-4" aria-live="polite">
        {incomplete ? (
          <p className="text-sm text-(--color-ink-soft)">{mode === 'items' ? 'Sélectionnez au moins un item.' : 'Sélectionnez au moins une catégorie.'}</p>
        ) : loadingGauge && !showGauge ? (
          <p className="flex items-center gap-2 text-sm text-(--color-ink-soft)"><Loader2 className="h-4 w-4 animate-spin" /> Vérification de la banque de questions…</p>
        ) : gaugeError ? (
          <p className="text-sm text-(--color-danger)" role="alert">{gaugeError}</p>
        ) : showGauge ? (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-(--color-ink)">
                <span className="text-2xl tabular-nums">{Math.min(showGauge.eligible, 9999)}</span>
                <span className="text-(--color-ink-soft)"> / {showGauge.needed} {showGauge.unit} éligibles</span>
                {loadingGauge && <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin text-(--color-ink-muted)" />}
              </p>
              <p className="text-sm text-(--color-ink-soft)">dont <strong className="text-(--color-ink)">{showGauge.unseen}</strong> inédite{showGauge.unseen > 1 ? 's' : ''} pour vous</p>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-(--color-border)" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Disponibilité de la banque">
              <div className={cn('h-full rounded-full transition-all', showGauge.ok ? 'bg-emerald-500' : 'bg-amber-500')} style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-(--color-ink-muted)">Questions déjà vues incluses dans le total ; les questions jamais vues sont tirées en priorité.</p>
            {showGauge.ok ? (
              <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0" /> Banque suffisante pour ce Check-up.</p>
            ) : (
              <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-amber-800 dark:text-amber-200" role="alert"><AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" /> {showGauge.blockedText}</p>
            )}
            {showGauge.fallbackText && <p className="mt-1.5 text-xs text-(--color-ink-soft)">{showGauge.fallbackText}</p>}
          </>
        ) : null}
      </div>

      {error && <p className="mt-3 text-sm text-(--color-danger)" role="alert">{error}</p>}
      <div className="mt-5 flex justify-end">
        <Button size="lg" disabled={incomplete || !showGauge?.ok || starting} onClick={() => setConfirm(true)} className="w-full sm:w-auto">
          {starting ? <Loader2 className="animate-spin" /> : <Play />} {TEXTS.launchCta}
        </Button>
      </div>

      <Dialog open={confirm} onOpenChange={(v) => !starting && setConfirm(v)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avant de commencer</DialogTitle>
            <DialogDescription>{FORMAT_LABEL[format]} · {spec?.nom}</DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 text-sm text-(--color-ink-soft)">
            <li>• Le chronomètre démarre immédiatement et continue même si vous quittez la page, changez d’onglet ou verrouillez votre écran.</li>
            <li>• Chaque réponse est enregistrée automatiquement ; vous pouvez revenir en arrière et modifier tant que le temps reste.</li>
            <li>• Aucune aide ni correction avant la soumission. À 00:00, vos réponses enregistrées sont soumises automatiquement.</li>
            <li>• Dans un dossier progressif, une question validée devient lisible mais non modifiable.</li>
            <li>• Votre Check-up se poursuit uniquement sur cet appareil.</li>
            {format !== 'interne_40_60' && <li>• Après la partie chronométrée, vous corrigerez vous-même vos QROC à l’aide de la correction Major ECN.</li>}
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(false)} disabled={starting}>Annuler</Button>
            <Button onClick={launch} disabled={starting}>{starting ? <Loader2 className="animate-spin" /> : <Play />} Commencer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
