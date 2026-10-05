'use client';

import { useMemo, useState, useTransition } from 'react';
import { Loader2, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { settingsLabel, type SettingsLeaf, type SettingsModule } from '@/lib/moteur/settings-labels';
import { resetModuleSettingsAction, saveModuleSettingsAction } from './actions';

/**
 * Éditeur générique des réglages d'un module : chaque paramètre avec son
 * libellé, sa valeur courante et sa valeur initiale. Les valeurs hors bornes
 * sont refusées côté serveur et signalées.
 */
export function SettingsEditor({ module, title, leaves }: { module: SettingsModule; title: string; leaves: SettingsLeaf[] }) {
  const [values, setValues] = useState<Record<string, string | boolean>>(() =>
    Object.fromEntries(leaves.map((l) => [l.path, l.kind === 'boolean' ? (l.value as boolean) : l.kind === 'numbers' ? (l.value as number[]).join(', ') : String(l.value)])),
  );
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const groups = useMemo(() => {
    const m = new Map<string, SettingsLeaf[]>();
    for (const l of leaves) {
      const g = l.path.includes('.') ? l.path.split('.').slice(0, -1).join('.') : '';
      m.set(g, [...(m.get(g) ?? []), l]);
    }
    return Array.from(m.entries());
  }, [leaves]);
  const changed = leaves.filter((l) => {
    const v = values[l.path];
    const cur = l.kind === 'boolean' ? l.value : l.kind === 'numbers' ? (l.value as number[]).join(', ') : String(l.value);
    return v !== cur;
  }).length;

  const save = () => start(async () => {
    setMsg(null);
    const payload: { path: string; value: number | boolean | number[] }[] = [];
    for (const l of leaves) {
      const v = values[l.path];
      if (l.kind === 'boolean') payload.push({ path: l.path, value: !!v });
      else if (l.kind === 'numbers') payload.push({ path: l.path, value: String(v).split(/[,;\s]+/).filter(Boolean).map(Number).filter((n) => Number.isFinite(n)) });
      else payload.push({ path: l.path, value: Number(String(v).replace(',', '.')) });
    }
    const r = await saveModuleSettingsAction(module, payload);
    if (!r.ok) { setMsg({ ok: false, text: r.error }); return; }
    setMsg(r.rejected && r.rejected.length > 0
      ? { ok: false, text: `Enregistré. Valeurs hors bornes remplacées par la valeur initiale : ${r.rejected.map((p) => settingsLabel(module, p)).join(' ; ')}.` }
      : { ok: true, text: 'Réglages enregistrés : ils s’appliquent aux prochains calculs.' });
  });
  const reset = () => start(async () => {
    if (!window.confirm('Rétablir toutes les valeurs initiales de ce module ?')) return;
    const r = await resetModuleSettingsAction(module);
    setMsg(r.ok ? { ok: true, text: 'Valeurs initiales rétablies. Rechargez la page pour les voir.' } : { ok: false, text: r.error });
  });

  return (
    <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-(--color-ink)">{title}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={reset} disabled={pending}><RotateCcw /> Valeurs initiales</Button>
          <Button size="sm" onClick={save} disabled={pending || changed === 0}>{pending ? <Loader2 className="animate-spin" /> : <Save />} Enregistrer{changed > 0 ? ` (${changed})` : ''}</Button>
        </div>
      </div>
      {msg && <p className={`mt-2 rounded-lg px-3 py-2 text-sm ${msg.ok ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-100' : 'bg-amber-50 text-amber-950 dark:bg-amber-900/20 dark:text-amber-100'}`} role="status">{msg.text}</p>}
      <div className="mt-3 space-y-4">
        {groups.map(([g, list]) => (
          <fieldset key={g || 'racine'} className="rounded-xl border border-(--color-border) p-3">
            {g && <legend className="px-1 text-xs font-bold uppercase tracking-wide text-(--color-ink-muted)">{settingsLabel(module, g)}</legend>}
            <div className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2">
              {list.map((l) => {
                const id = `${module}-${l.path}`;
                const initial = l.kind === 'numbers' ? (l.initial as number[]).join(', ') : String(l.initial);
                return (
                  <div key={l.path} className="flex items-center justify-between gap-3 text-sm">
                    <label htmlFor={id} className="min-w-0 flex-1 text-(--color-ink-soft)">
                      {settingsLabel(module, l.path)}
                      <span className="block text-[11px] text-(--color-ink-muted)">Valeur initiale : {l.kind === 'boolean' ? (l.initial ? 'oui' : 'non') : initial}</span>
                    </label>
                    {l.kind === 'boolean' ? (
                      <input id={id} type="checkbox" checked={!!values[l.path]} onChange={(e) => setValues((v) => ({ ...v, [l.path]: e.target.checked }))} className="h-4 w-4" />
                    ) : (
                      <input id={id} type="text" inputMode={l.kind === 'numbers' ? 'text' : 'decimal'} value={String(values[l.path])}
                        onChange={(e) => setValues((v) => ({ ...v, [l.path]: e.target.value }))}
                        className="h-9 w-32 shrink-0 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-2 text-right text-sm tabular-nums text-(--color-ink) focus-ring" />
                    )}
                  </div>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </section>
  );
}
