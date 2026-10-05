'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { InlineStatus } from '@/components/admin/suivi/ui';
import { recalcAllAction, saveParamsAction } from '@/app/admin/planificateur/actions';
import type { ParamMeta } from '@/lib/plan/config';

/**
 * Paramètres V1 du planificateur (§39, annexe B) : chaque enregistrement crée
 * une nouvelle version (journalisée à chaque génération) ; les valeurs fixées
 * par le CDC sont distinguées des PROPOSITIONS à valider par Major ECN ; les
 * incohérences sont refusées (dont allow_one_miss ⇒ min_evaluable_days ≥ 2).
 */
export function ParamsForm({ meta, values }: { meta: ParamMeta[]; values: Record<string, unknown> }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, unknown>>(values);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const sections = useMemo(() => {
    const m = new Map<string, ParamMeta[]>();
    for (const p of meta) m.set(p.section, [...(m.get(p.section) ?? []), p]);
    return Array.from(m.entries());
  }, [meta]);
  const changed = meta.filter((m) => draft[m.path] !== values[m.path]);
  const save = () => start(async () => {
    setError(null); setStatus(null);
    const r = await saveParamsAction(Object.fromEntries(changed.map((m) => [m.path, draft[m.path]])), note.trim() || null);
    if (!r.ok) { setError(r.error); return; }
    setStatus(`Version ${r.version} enregistrée. Les plannings sont recalculés au prochain passage (ou maintenant ci-dessous).`);
    setNote('');
    router.refresh();
  });
  const recalc = () => start(async () => {
    setError(null);
    const r = await recalcAllAction();
    if (!r.ok) { setError(r.error); return; }
    setStatus(`${r.done} plannings recalculés${r.remaining > 0 ? ` (${r.remaining} restants, traités par le balayage horaire)` : ''}.`);
  });
  return (
    <div className="space-y-6">
      {sections.map(([section, list]) => (
        <section key={section} className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface)">
          <h2 className="border-b border-(--color-border) px-4 py-2.5 text-sm font-semibold text-(--color-ink)">{section}</h2>
          <ul className="divide-y divide-(--color-border)">
            {list.map((m) => {
              const v = draft[m.path];
              return (
                <li key={m.path} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                  <div className="min-w-[260px] flex-1">
                    <p className="text-sm text-(--color-ink)">{m.label}</p>
                    <p className="text-[11px] text-(--color-ink-muted)"><code>{m.path}</code> · {m.cdc ? <span className="text-green-700 dark:text-green-400">valeur du CDC</span> : <span className="font-semibold text-amber-700 dark:text-amber-300">proposition à valider par Major ECN</span>}</p>
                  </div>
                  {m.kind === 'boolean' ? (
                    <input type="checkbox" checked={v === true} onChange={(e) => setDraft({ ...draft, [m.path]: e.target.checked })} className="h-4 w-4" aria-label={m.label} />
                  ) : m.kind === 'number' ? (
                    <span className="flex items-center gap-1.5">
                      <Input type="number" min={m.min} max={m.max} step={m.step ?? 0.01} value={typeof v === 'number' ? v : ''} onChange={(e) => setDraft({ ...draft, [m.path]: e.target.value === '' ? v : Number(e.target.value) })} className="h-8 w-28 text-sm" aria-label={m.label} />
                      {m.unit && <span className="text-xs text-(--color-ink-muted)">{m.unit}</span>}
                    </span>
                  ) : (
                    <Input value={typeof v === 'string' ? v : ''} onChange={(e) => setDraft({ ...draft, [m.path]: e.target.value })} className="h-8 w-40 text-sm" aria-label={m.label} />
                  )}
                  {draft[m.path] !== values[m.path] && <span className="text-[11px] font-semibold text-(--color-primary)">modifié</span>}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <div className="sticky bottom-3 flex flex-wrap items-end gap-3 rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-3 shadow-sm">
        <Textarea rows={1} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Motif de la nouvelle version (facultatif)" className="min-w-[260px] flex-1" />
        <Button disabled={pending || changed.length === 0} onClick={save}>{pending && <Loader2 className="animate-spin" />}Enregistrer {changed.length > 0 ? `(${changed.length})` : ''}</Button>
        <Button variant="outline" disabled={pending} onClick={recalc}><RefreshCw />Recalculer tous les plannings</Button>
        <InlineStatus error={error} status={status} />
      </div>
    </div>
  );
}
