'use client';

import { useState, useTransition } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { listContentTree, listContentQuestions, snapshotFromContent, type PickerQuestion, type ContentTree, type ContentType } from '@/app/admin/epreuves-blanches/actions';
import type { CollegeOption } from './exam-editor';

const inputCls = 'w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-ink) outline-none focus:border-(--color-primary)';

const TYPE_LABEL: Record<ContentType, string> = { qcm: 'QCM', qroc: 'QROC', dp_qcm: 'DP QCM', dp_qroc: 'DP QROC' };
const TYPE_BADGE: Record<ContentType, string> = {
  qcm: 'bg-(--color-primary-soft) text-(--color-primary)',
  qroc: 'bg-[#E0F2F1] text-[#00695C]',
  dp_qcm: 'bg-[#FDE7E9] text-[#C0001F]',
  dp_qroc: 'bg-[#CCFBF1] text-[#0F766E]',
};

export function ContentPickerDialog({ examId, colleges, onClose }: { examId: string; colleges: CollegeOption[]; onClose: () => void }) {
  const [pending, start] = useTransition();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matiere, setMatiere] = useState('');
  const [tree, setTree] = useState<ContentTree | null>(null);
  const [coursId, setCoursId] = useState('');
  const [serieId, setSerieId] = useState('');
  const [types, setTypes] = useState<Set<ContentType>>(new Set());
  const [questions, setQuestions] = useState<PickerQuestion[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Vrai quand la base a renvoyé autant de lignes que le plafond : la liste
  // affichée n'est alors qu'une partie de la banque, il faut affiner.
  const [tronque, setTronque] = useState(false);

  const reloadQuestions = (m: string, c: string, s: string, t: Set<ContentType>, q = search) => {
    if (!m) { setQuestions([]); setTronque(false); return; }
    setLoading(true);
    // La recherche est envoyée à la base : filtrer seulement la page déjà
    // chargée masquerait tout ce qui se trouve au-delà du plafond.
    listContentQuestions({ matiereId: m, coursId: c || null, serieId: s || null, types: Array.from(t), search: q || null }).then((res) => {
      setLoading(false);
      if (res.ok) { setQuestions(res.questions); setTronque(res.tronque); } else setError(res.error);
    });
  };

  const onMatiere = (m: string) => {
    setMatiere(m); setCoursId(''); setSerieId(''); setSelected(new Set()); setTree(null); setQuestions([]);
    if (!m) return;
    listContentTree(m).then((res) => { if (res.ok) setTree(res.tree); });
    reloadQuestions(m, '', '', types);
  };
  const onCours = (c: string) => { setCoursId(c); setSerieId(''); reloadQuestions(matiere, c, '', types); };
  const onSerie = (s: string) => { setSerieId(s); reloadQuestions(matiere, coursId, s, types); };
  const toggleType = (t: ContentType) => {
    const n = new Set(types); if (n.has(t)) n.delete(t); else n.add(t); setTypes(n);
    reloadQuestions(matiere, coursId, serieId, n);
  };

  const toggle = (id: string) => setSelected((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const filtered = questions;
  const seriesOfCours = tree?.cours.find((c) => c.id === coursId)?.series ?? [];

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
        <DialogHeader><DialogTitle>Piocher des questions dans le contenu</DialogTitle></DialogHeader>
        <p className="text-xs text-(--color-ink-soft)">Les questions choisies sont <strong>copiées</strong> dans l’épreuve (figées : indépendantes des modifications ultérieures du contenu source).</p>

        {/* Filtres cascade : collège → item (optionnel) → série (optionnel) → type */}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <label className="block"><span className="mb-1 block text-[11px] font-semibold text-(--color-ink)">Collège</span>
            <select value={matiere} onChange={(e) => onMatiere(e.target.value)} className={inputCls}>
              <option value="">— Choisir —</option>
              {colleges.map((c) => <option key={c.id} value={c.id}>{c.nom}{c.parentId ? ' (MG)' : ''}</option>)}
            </select>
          </label>
          <label className="block"><span className="mb-1 block text-[11px] font-semibold text-(--color-ink)">Item (optionnel)</span>
            <select value={coursId} onChange={(e) => onCours(e.target.value)} className={inputCls} disabled={!tree}>
              <option value="">— Tous les items —</option>
              {(tree?.cours ?? []).map((c) => <option key={c.id} value={c.id}>{c.titre}</option>)}
            </select>
          </label>
          {coursId && (
            <label className="block sm:col-span-2"><span className="mb-1 block text-[11px] font-semibold text-(--color-ink)">Série (optionnel)</span>
              <select value={serieId} onChange={(e) => onSerie(e.target.value)} className={inputCls}>
                <option value="">— Toutes les séries —</option>
                {seriesOfCours.map((s) => <option key={s.id} value={s.id}>{s.label}{s.is_dp ? ' · DP' : ''}</option>)}
              </select>
            </label>
          )}
        </div>

        {/* Type (facultatif, dans tous les cas) */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(['qcm', 'qroc', 'dp_qcm', 'dp_qroc'] as ContentType[]).map((t) => (
            <label key={t} className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs ${types.has(t) ? 'border-(--color-primary) bg-(--color-primary-soft)' : 'border-(--color-border)'}`}>
              <input type="checkbox" checked={types.has(t)} onChange={() => toggleType(t)} /> {TYPE_LABEL[t]}
            </label>
          ))}
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); }}
            onKeyDown={(e) => { if (e.key === 'Enter') reloadQuestions(matiere, coursId, serieId, types, search); }}
            onBlur={() => reloadQuestions(matiere, coursId, serieId, types, search)}
            className={inputCls + ' ml-auto max-w-[220px]'}
            placeholder="Rechercher dans les énoncés…"
            disabled={!matiere}
          />
        </div>

        {tronque && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Cette spécialité contient plus de questions que la liste ne peut en afficher.
            Affinez par item, par série ou par recherche pour atteindre le reste de la banque
            — les annales EVC, ajoutées en dernier, en font partie.
          </p>
        )}

        <div className="mt-3 min-h-[180px]">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-sm text-(--color-ink-soft)"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Chargement…</div>
          ) : !matiere ? (
            <p className="py-10 text-center text-sm text-(--color-ink-soft)">Choisissez un collège pour voir ses questions.</p>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-(--color-ink-soft)">Aucune question pour ces filtres.</p>
          ) : (
            <ul className="max-h-[42vh] space-y-1.5 overflow-y-auto">
              {filtered.map((q) => (
                <li key={q.id}>
                  <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-(--color-border) p-2 text-sm hover:bg-(--color-sand-100)/40 has-[:checked]:border-(--color-primary) has-[:checked]:bg-(--color-primary-soft)/30">
                    <input type="checkbox" checked={selected.has(q.id)} onChange={() => toggle(q.id)} className="mt-1" />
                    <span className="min-w-0 flex-1">
                      <span className={`mr-1.5 rounded px-1 py-0.5 text-[9px] font-bold uppercase ${TYPE_BADGE[q.type]}`}>{TYPE_LABEL[q.type]}</span>
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
