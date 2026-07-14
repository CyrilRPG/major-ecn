'use client';

import { useState, useTransition } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { listContentQuestions, snapshotFromContent, type PickerQuestion } from '@/app/admin/epreuves-blanches/actions';
import type { CollegeOption } from './exam-editor';

const inputCls = 'w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-ink) outline-none focus:border-(--color-primary)';

export function ContentPickerDialog({ examId, colleges, onClose }: { examId: string; colleges: CollegeOption[]; onClose: () => void }) {
  const [pending, start] = useTransition();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matiere, setMatiere] = useState('');
  const [questions, setQuestions] = useState<PickerQuestion[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = (matiereId: string) => {
    setMatiere(matiereId);
    setSelected(new Set());
    setQuestions([]);
    if (!matiereId) return;
    setLoading(true);
    listContentQuestions(matiereId).then((res) => {
      setLoading(false);
      if (res.ok) setQuestions(res.questions);
      else setError(res.error);
    });
  };

  const toggle = (id: string) => setSelected((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const filtered = questions.filter((q) => !search || (q.enonce + q.cours_titre + q.serie_label).toLowerCase().includes(search.toLowerCase()));

  const importSel = () => {
    setError(null);
    if (selected.size === 0) { setError('Sélectionnez au moins une question'); return; }
    start(async () => {
      const res = await snapshotFromContent({ examId, questionIds: Array.from(selected) });
      if (!res.ok) { setError(res.error); return; }
      onClose();
    });
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Piocher des questions dans le contenu</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-(--color-ink-soft)">Les questions choisies sont <strong>copiées</strong> dans l’épreuve (figées : indépendantes des modifications ultérieures du contenu source).</p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <select value={matiere} onChange={(e) => load(e.target.value)} className={inputCls}>
            <option value="">— Choisir une spécialité —</option>
            {colleges.map((c) => <option key={c.id} value={c.id}>{c.nom}{c.parentId ? ' (MG)' : ''}</option>)}
          </select>
          <input value={search} onChange={(e) => setSearch(e.target.value)} className={inputCls} placeholder="Filtrer…" disabled={!questions.length} />
        </div>

        <div className="mt-3 min-h-[200px]">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-sm text-(--color-ink-soft)"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Chargement…</div>
          ) : !matiere ? (
            <p className="py-10 text-center text-sm text-(--color-ink-soft)">Choisissez une spécialité pour voir ses questions.</p>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-(--color-ink-soft)">Aucune question.</p>
          ) : (
            <ul className="max-h-[45vh] space-y-1.5 overflow-y-auto">
              {filtered.map((q) => (
                <li key={q.id}>
                  <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-(--color-border) p-2 text-sm hover:bg-(--color-sand-100)/40 has-[:checked]:border-(--color-primary) has-[:checked]:bg-(--color-primary-soft)/30">
                    <input type="checkbox" checked={selected.has(q.id)} onChange={() => toggle(q.id)} className="mt-1" />
                    <span className="min-w-0 flex-1">
                      <span className={`mr-1.5 rounded px-1 py-0.5 text-[9px] font-bold uppercase ${q.format === 'qroc' ? 'bg-[#E0F2F1] text-[#00695C]' : 'bg-(--color-primary-soft) text-(--color-primary)'}`}>{q.format}</span>
                      <span className="text-(--color-ink)">{q.enonce || '(sans énoncé)'}</span>
                      <span className="mt-0.5 block text-[11px] text-(--color-ink-muted)">{q.cours_titre} · {q.serie_label}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-(--color-danger)">{error}</p>}

        <DialogFooter>
          <span className="mr-auto text-sm text-(--color-ink-soft)">{selected.size} sélectionnée(s)</span>
          <Button variant="ghost" onClick={onClose} disabled={pending}>Fermer</Button>
          <Button onClick={importSel} disabled={pending || selected.size === 0}>{pending ? <Loader2 className="animate-spin" /> : <Download className="h-4 w-4" />} Importer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
