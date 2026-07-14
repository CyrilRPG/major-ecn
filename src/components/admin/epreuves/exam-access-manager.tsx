'use client';

import { useEffect, useState, useTransition } from 'react';
import { Loader2, Plus, Trash2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listExamAccess, grantExamAccess, revokeExamAccess, type ExamAccessRow } from '@/app/admin/epreuves-blanches/actions';

const inputCls = 'w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm outline-none focus:border-(--color-primary)';
const toLocal = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso); const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const fromLocal = (v: string) => (v ? new Date(v).toISOString() : null);

export function ExamAccessManager({ examId }: { examId: string }) {
  const [rows, setRows] = useState<ExamAccessRow[]>([]);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [open, setOpen] = useState('');
  const [close, setClose] = useState('');
  const [duration, setDuration] = useState('');

  const reload = () => listExamAccess(examId).then((r) => { if (r.ok) setRows(r.rows); });
  useEffect(() => { reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [examId]);

  const add = () => {
    setError(null);
    start(async () => {
      const res = await grantExamAccess({ examId, email: email.trim(), open_at: fromLocal(open), close_at: fromLocal(close), duration_minutes: duration ? Number(duration) : null });
      if (!res.ok) { setError(res.error); return; }
      setEmail(''); setOpen(''); setClose(''); setDuration('');
      reload();
    });
  };
  const remove = (id: string) => start(async () => { await revokeExamAccess(examId, id); reload(); });

  return (
    <div className="rounded-xl border border-dashed border-(--color-border) bg-(--color-primary-soft)/10 p-4">
      <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-(--color-ink-muted)"><UserPlus className="h-3.5 w-3.5" /> Déblocage individuel</p>
      <p className="mb-3 text-[11px] text-(--color-ink-soft)">Autorisez un candidat à composer sur une fenêtre spécifique (ex. indisponible le soir de l’épreuve).</p>

      {rows.length > 0 && (
        <ul className="mb-3 space-y-1.5">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center gap-2 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-xs">
              <span className="min-w-0 flex-1 truncate"><strong>{r.name || r.email}</strong>{r.open_at ? ` · ${new Date(r.open_at).toLocaleString('fr-FR')}` : ''}{r.close_at ? ` → ${new Date(r.close_at).toLocaleString('fr-FR')}` : ''}{r.duration_minutes ? ` · ${r.duration_minutes} min` : ''}</span>
              <button type="button" onClick={() => remove(r.id)} className="text-(--color-danger)"><Trash2 className="h-3.5 w-3.5" /></button>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="email de l’élève" />
        <input type="number" min={1} value={duration} onChange={(e) => setDuration(e.target.value)} className={inputCls} placeholder="durée (min, optionnel)" />
        <label className="text-[11px] text-(--color-ink-soft)">Ouverture<input type="datetime-local" value={open} onChange={(e) => setOpen(e.target.value)} className={inputCls} /></label>
        <label className="text-[11px] text-(--color-ink-soft)">Fermeture<input type="datetime-local" value={close} onChange={(e) => setClose(e.target.value)} className={inputCls} /></label>
      </div>
      {error && <p className="mt-2 text-xs text-(--color-danger)">{error}</p>}
      <Button size="sm" className="mt-2" onClick={add} disabled={pending || !email.trim()}>{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Débloquer</Button>
    </div>
  );
}
