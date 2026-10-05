'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Ban, Hammer, Loader2, RefreshCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BankFamily } from '@/lib/checkup/types';
import { neutralizeCheckupAction, rebuildCandidateAction, refreshCandidateAdminAction, saveQuestionMetaAction, saveSerieMetaAction } from './actions';

export type Choice = { id: string; label: string };

/** Listes partagées par toutes les lignes (une seule fois dans la page). */
export function BankDatalists({ items, categories }: { items: Choice[]; categories: Choice[] }) {
  return (
    <>
      <datalist id="bank-items">{items.map((i) => <option key={i.id} value={i.label} />)}</datalist>
      <datalist id="bank-categories">{categories.map((c) => <option key={c.id} value={c.label} />)}</datalist>
    </>
  );
}

const idOf = (label: string, list: Choice[]) => list.find((x) => x.label === label.trim())?.id ?? null;
const labelOf = (id: string | null, list: Choice[]) => (id ? list.find((x) => x.id === id)?.label ?? '' : '');

/** Neutralisation d'un Check-up (incident technique) : motif obligatoire, tracé. */
export function NeutralizeButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-col items-end gap-1">
      <Button variant="outline" size="sm" disabled={pending} onClick={() => {
        const reason = window.prompt('Motif de la neutralisation (incident technique) :');
        if (!reason) return;
        start(async () => {
          const r = await neutralizeCheckupAction(sessionId, reason);
          if (!r.ok) setError(r.error); else router.refresh();
        });
      }}>{pending ? <Loader2 className="animate-spin" /> : <Ban />} Neutraliser</Button>
      {error && <span className="text-[11px] text-(--color-danger)" role="alert">{error}</span>}
    </span>
  );
}

const FAMILIES: { v: BankFamily; l: string }[] = [
  { v: 'structured_item', l: 'Banque structurée' }, { v: 'des_bank', l: 'QCM DES' }, { v: 'transversal_bank', l: 'Banque transversale' }, { v: 'evc_annale', l: 'Annales EVC' },
];

/** Classement manuel d'une série : source, extractibilité des questions, exclusion du Check-up. */
export function SerieMetaForm({ serieId, specialiteId, family, overridden, extractable, excluded, itemId, categoryId, items, categories }: {
  serieId: string; specialiteId: string; family: BankFamily; overridden: boolean; extractable: boolean; excluded: boolean;
  itemId: string | null; categoryId: string | null; items: Choice[]; categories: Choice[];
}) {
  const [src, setSrc] = useState<BankFamily | ''>(overridden ? family : '');
  const [ext, setExt] = useState(extractable);
  const [exc, setExc] = useState(excluded);
  const [item, setItem] = useState(labelOf(itemId, items));
  const [cat, setCat] = useState(labelOf(categoryId, categories));
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <span className="flex flex-nowrap items-center justify-end gap-2 whitespace-nowrap text-xs">
      <select aria-label="Source de contenu" value={src} onChange={(e) => setSrc(e.target.value as BankFamily | '')} className="h-8 rounded-md border border-(--color-border) bg-(--color-surface) px-1.5 text-xs">
        <option value="">Automatique</option>
        {FAMILIES.map((f) => <option key={f.v} value={f.v}>{f.l}</option>)}
      </select>
      <input list="bank-items" aria-label="Item principal (facultatif)" placeholder="Item (facultatif)" value={item} onChange={(e) => setItem(e.target.value)} className="h-8 w-40 rounded-md border border-(--color-border) bg-(--color-surface) px-1.5 text-xs" />
      <input list="bank-categories" aria-label="Catégorie (facultative)" placeholder="Catégorie" value={cat} onChange={(e) => setCat(e.target.value)} className="h-8 w-32 rounded-md border border-(--color-border) bg-(--color-surface) px-1.5 text-xs" />
      <label className="inline-flex items-center gap-1"><input type="checkbox" checked={ext} onChange={(e) => setExt(e.target.checked)} /> Extractible</label>
      <label className="inline-flex items-center gap-1"><input type="checkbox" checked={exc} onChange={(e) => setExc(e.target.checked)} /> Exclue</label>
      <Button size="sm" variant="outline" aria-label="Enregistrer le classement" disabled={pending} onClick={() => start(async () => {
        const itemId = item.trim() ? idOf(item, items) : null;
        const categoryId = cat.trim() ? idOf(cat, categories) : null;
        if (item.trim() && !itemId) { setMsg('Item inconnu : choisissez-le dans la liste.'); return; }
        if (cat.trim() && !categoryId) { setMsg('Catégorie inconnue : choisissez-la dans la liste.'); return; }
        const r = await saveSerieMetaAction({ serieId, specialiteId, contentSource: src || null, extractable: ext, excluded: exc, itemId, categoryId });
        setMsg(r.ok ? 'Enregistré' : r.error);
      })}>{pending ? <Loader2 className="animate-spin" /> : <Save />}</Button>
      {msg && <span className="text-[11px] text-(--color-ink-muted)" role="status">{msg}</span>}
    </span>
  );
}

/** Outils d'intervention sur le profil d'un candidat. */
export function CandidateTools({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" disabled={pending} onClick={() => start(async () => {
        const r = await refreshCandidateAdminAction(userId);
        setMsg(r.ok ? 'Profil actualisé.' : r.error);
        if (r.ok) router.refresh();
      })}>{pending ? <Loader2 className="animate-spin" /> : <RefreshCcw />} Actualiser maintenant</Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => {
        if (!window.confirm('Reconstruire tout le profil de ce candidat en rejouant son historique ? L’historique est conservé.')) return;
        start(async () => {
          const r = await rebuildCandidateAction(userId);
          setMsg(r.ok ? 'Profil reconstruit.' : r.error);
          if (r.ok) router.refresh();
        });
      }}><Hammer /> Reconstruire le profil</Button>
      {msg && <span className="text-xs text-(--color-ink-muted)" role="status">{msg}</span>}
    </div>
  );
}

/** Classement d'une question précise (complément §5 et §23) : tout est facultatif. */
export function QuestionMetaForm({ specialiteId, items, categories }: { specialiteId: string; items: Choice[]; categories: Choice[] }) {
  const [qid, setQid] = useState('');
  const [src, setSrc] = useState<BankFamily | ''>('');
  const [item, setItem] = useState('');
  const [cat, setCat] = useState('');
  const [type, setType] = useState<'' | 'QRU' | 'QRM'>('');
  const [ext, setExt] = useState<'' | 'oui' | 'non'>('');
  const [year, setYear] = useState('');
  const [annaleType, setAnnaleType] = useState('');
  const [exc, setExc] = useState(false);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const field = 'h-9 rounded-md border border-(--color-border) bg-(--color-surface) px-2 text-sm';
  return (
    <form className="rounded-2xl border border-(--color-border) p-3 text-sm" onSubmit={(e) => {
      e.preventDefault();
      const itemId = item.trim() ? idOf(item, items) : null;
      const categoryId = cat.trim() ? idOf(cat, categories) : null;
      if (item.trim() && !itemId) { setMsg('Item inconnu : choisissez-le dans la liste.'); return; }
      if (cat.trim() && !categoryId) { setMsg('Catégorie inconnue : choisissez-la dans la liste.'); return; }
      start(async () => {
        const r = await saveQuestionMetaAction({
          questionId: qid.trim(), specialiteId, contentSource: src || null, itemId, categoryId, questionType: type || null,
          extractable: ext === '' ? null : ext === 'oui', annaleYear: year.trim() ? Number(year) : null, annaleType: annaleType.trim() || null, excluded: exc,
        });
        setMsg(r.ok ? 'Question classée.' : r.error);
      });
    }}>
      <p className="font-semibold text-(--color-ink)">Classer une question précise</p>
      <p className="text-xs text-(--color-ink-muted)">Facultatif : une question non classée fonctionne déjà dans un Check-up global. Un item renseigné la rend exploitable par le moteur de maîtrise.</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input required value={qid} onChange={(e) => setQid(e.target.value)} placeholder="Identifiant de la question" aria-label="Identifiant de la question" className={`${field} w-72`} />
        <select aria-label="Source de contenu" value={src} onChange={(e) => setSrc(e.target.value as BankFamily | '')} className={field}>
          <option value="">Source automatique</option>
          {FAMILIES.map((f) => <option key={f.v} value={f.v}>{f.l}</option>)}
        </select>
        <input list="bank-items" value={item} onChange={(e) => setItem(e.target.value)} placeholder="Item principal" aria-label="Item principal" className={`${field} w-56`} />
        <input list="bank-categories" value={cat} onChange={(e) => setCat(e.target.value)} placeholder="Catégorie" aria-label="Catégorie" className={`${field} w-44`} />
        <select aria-label="Type de question" value={type} onChange={(e) => setType(e.target.value as '' | 'QRU' | 'QRM')} className={field}><option value="">Type automatique</option><option value="QRU">QRU</option><option value="QRM">QRM</option></select>
        <select aria-label="Extractible" value={ext} onChange={(e) => setExt(e.target.value as '' | 'oui' | 'non')} className={field}><option value="">Extractible : auto</option><option value="oui">Extractible</option><option value="non">Non extractible</option></select>
        <input value={year} onChange={(e) => setYear(e.target.value)} inputMode="numeric" placeholder="Année d’annale" aria-label="Année d’annale" className={`${field} w-32`} />
        <input value={annaleType} onChange={(e) => setAnnaleType(e.target.value)} placeholder="Type d’annale" aria-label="Type d’annale" className={`${field} w-36`} />
        <label className="inline-flex items-center gap-1"><input type="checkbox" checked={exc} onChange={(e) => setExc(e.target.checked)} /> Exclue du Check-up</label>
        <Button type="submit" size="sm" disabled={pending || !qid.trim()}>{pending ? <Loader2 className="animate-spin" /> : <Save />} Enregistrer</Button>
      </div>
      {msg && <p className="mt-2 text-xs text-(--color-ink-muted)" role="status">{msg}</p>}
    </form>
  );
}
