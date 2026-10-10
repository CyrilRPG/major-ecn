'use client';

import { useEffect, useState } from 'react';
import { BadgeCheck, Loader2, MessageSquareQuote, Paperclip, Pin, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BibliothequeDTO, EnseignantTagDTO, MessageDTO, ResultatRechercheDTO } from '@/lib/echanges/types';
import { api, jourLisible } from './api';
import { BadgeAuteur, ExtraitSurligne, TexteMessage } from './elements';

function Champ({ valeur, onChange, placeholder }: { valeur: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
      <input value={valeur} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder}
        className="h-11 w-full rounded-xl border border-(--color-border) bg-(--color-surface-soft) pl-9 pr-3 text-[14.5px] outline-none focus:border-(--color-border-strong) focus:bg-(--color-surface)" />
    </label>
  );
}

function useDebounce<T>(v: T, ms = 350): T {
  const [d, setD] = useState(v);
  useEffect(() => { const t = window.setTimeout(() => setD(v), ms); return () => window.clearTimeout(t); }, [v, ms]);
  return d;
}

/* ───────────────────────── 📌 Réponses importantes (§33) ───────────────────────── */

export function PanneauEpingles({ groupeId, enseignants, onOuvrir }: { groupeId: string; enseignants: EnseignantTagDTO[]; onOuvrir: (id: string) => void }) {
  const [q, setQ] = useState('');
  const [ens, setEns] = useState('');
  const [item, setItem] = useState('');
  const [depuis, setDepuis] = useState('');
  const [liste, setListe] = useState<{ message: MessageDTO; question: MessageDTO | null }[] | null>(null);
  const qd = useDebounce(q);
  const itemD = useDebounce(item);
  useEffect(() => {
    const t = window.setTimeout(() => {
      setListe(null);
      const p = new URLSearchParams();
      if (qd) p.set('q', qd);
      if (ens) p.set('enseignant', ens);
      if (itemD && /^\d+$/.test(itemD)) p.set('item', itemD);
      if (depuis) p.set('depuis', new Date(depuis).toISOString());
      api<{ reponses: { message: MessageDTO; question: MessageDTO | null }[] }>(`/api/echanges/groupes/${groupeId}/epingles?${p}`)
        .then((r) => setListe(r.reponses)).catch(() => setListe([]));
    }, 0);
    return () => window.clearTimeout(t);
  }, [groupeId, qd, ens, itemD, depuis]);
  return (
    <div className="space-y-3 px-2 pb-3">
      <Champ valeur={q} onChange={setQ} placeholder="Mot-clé" />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <select value={ens} onChange={(e) => setEns(e.target.value)} aria-label="Enseignant" className="h-11 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 text-[14px]">
          <option value="">Tous les enseignants</option>
          {enseignants.map((e) => <option key={e.id} value={e.id}>{e.libelle}</option>)}
        </select>
        <input value={item} onChange={(e) => setItem(e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="N° d’item" aria-label="Numéro d’item" className="h-11 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 text-[14px]" />
        <input type="date" value={depuis} onChange={(e) => setDepuis(e.target.value)} aria-label="Depuis le" className="h-11 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 text-[14px]" />
      </div>
      {liste === null ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
        : liste.length === 0 ? <p className="py-8 text-center text-[14px] text-(--color-ink-muted)">Aucune réponse épinglée pour le moment.</p>
          : (
            <ul className="space-y-3">
              {liste.map(({ message: m, question }) => (
                <li key={m.id} className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                  <p className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-[#B45309]"><Pin className="h-3 w-3" /> À retenir · {jourLisible(m.createdAt)}</p>
                  {m.contexte && <p className="mb-1 text-[12px] font-semibold text-(--color-ink-soft)">{m.contexte.titre}</p>}
                  {question?.contenu && (
                    <div className="mb-2 rounded-xl bg-(--color-surface) p-2 text-[13px]">
                      <p className="text-[11px] font-bold text-(--color-ink-muted)">Question</p>
                      <TexteMessage texte={question.contenu} mentions={question.mentions.map((x) => x.nom)} className="line-clamp-4" />
                    </div>
                  )}
                  <div className="mb-1 flex flex-wrap items-center gap-1.5 text-[13px] font-bold">{m.auteur.nom} <BadgeAuteur auteur={m.auteur} /></div>
                  {m.contenu && <TexteMessage texte={m.contenu} mentions={[]} className="text-[14px]" />}
                  <button type="button" onClick={() => onOuvrir(m.id)} className="mt-2 text-[13px] font-bold text-[#102C5F] underline dark:text-white">Voir dans la conversation</button>
                </li>
              ))}
            </ul>
          )}
    </div>
  );
}

/* ───────────────────────── 📚 Réponses des enseignants (§35, §122) ───────────────────────── */

export function PanneauBibliotheque() {
  const [q, setQ] = useState('');
  const [liste, setListe] = useState<BibliothequeDTO[] | null>(null);
  const [ouvert, setOuvert] = useState<string | null>(null);
  const qd = useDebounce(q);
  useEffect(() => {
    const t = window.setTimeout(() => {
      setListe(null);
      api<{ bibliotheque: BibliothequeDTO[] }>(`/api/echanges/recherche?bibliotheque=seule&q=${encodeURIComponent(qd)}`)
        .then((r) => setListe(r.bibliotheque)).catch(() => setListe([]));
    }, 0);
    return () => window.clearTimeout(t);
  }, [qd]);
  return (
    <div className="space-y-3 px-2 pb-3">
      <p className="text-[13px] text-(--color-ink-soft)">Les meilleures réponses des enseignants, sélectionnées et validées par Major ECN au fil des promotions.</p>
      <Champ valeur={q} onChange={setQ} placeholder="Rechercher (ex. anticoagulant, item 231)" />
      {liste === null ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
        : liste.length === 0 ? <p className="py-8 text-center text-[14px] text-(--color-ink-muted)">Aucune réponse trouvée.</p>
          : (
            <ul className="space-y-2">
              {liste.map((b) => (
                <li key={b.id} className="rounded-2xl border border-(--color-border) bg-(--color-surface)">
                  <button type="button" onClick={() => setOuvert(ouvert === b.id ? null : b.id)} className="w-full px-3 py-3 text-left">
                    <span className="block text-[14px] font-bold text-(--color-ink)">{b.titre}</span>
                    <span className="mt-0.5 block text-[12px] text-(--color-ink-muted)">{[b.specialiteNom, b.itemNumero ? `Item ${b.itemNumero}` : null, b.enseignant].filter(Boolean).join(' · ')}</span>
                  </button>
                  {ouvert === b.id && (
                    <div className="space-y-2 border-t border-(--color-border) px-3 py-3 text-[14px]">
                      {b.question && (
                        <div className="rounded-xl bg-(--color-surface-soft) p-2">
                          <p className="text-[11px] font-bold text-(--color-ink-muted)">{b.questionAuteur}</p>
                          <TexteMessage texte={b.question} mentions={[]} />
                        </div>
                      )}
                      <p className="text-[12px] font-bold text-[#102C5F] dark:text-white"><MessageSquareQuote className="mr-1 inline h-3.5 w-3.5" />Réponse — {b.enseignant ?? 'Enseignant Major ECN'}</p>
                      <TexteMessage texte={b.reponse} mentions={[]} />
                      <p className="flex items-center gap-1 text-[12px] text-green-700 dark:text-green-300"><BadgeCheck className="h-3.5 w-3.5" /> {b.valideLabel} · Mise à jour : {new Date(b.valideAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
    </div>
  );
}

/* ───────────────────────── 🔎 Recherche (§36-37, §123-126) ───────────────────────── */

export function PanneauRecherche({ groupeId, onOuvrir, archives = false }: { groupeId: string | null; onOuvrir: (r: ResultatRechercheDTO) => void; archives?: boolean }) {
  const [q, setQ] = useState('');
  const [type, setType] = useState<'tous' | 'enseignants' | 'importants' | 'pieces'>('tous');
  const [auteur, setAuteur] = useState<'tous' | 'moi' | 'candidats' | 'enseignants'>('tous');
  const [portee, setPortee] = useState<'groupe' | 'tous'>(groupeId ? 'groupe' : 'tous');
  const [depuis, setDepuis] = useState('');
  const [jusqua, setJusqua] = useState('');
  const [res, setRes] = useState<ResultatRechercheDTO[] | null>([]);
  const qd = useDebounce(q, 400);
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!qd.trim() && type === 'tous') { setRes([]); return; }
      setRes(null);
      const p = new URLSearchParams({ q: qd, type, auteur });
      if (portee === 'groupe' && groupeId) p.set('groupe', groupeId);
      if (depuis) p.set('depuis', new Date(depuis).toISOString());
      if (jusqua) p.set('jusqua', new Date(`${jusqua}T23:59:59`).toISOString());
      if (archives) p.set('archives', '1');
      api<{ resultats: ResultatRechercheDTO[] }>(`/api/echanges/recherche?${p}`).then((r) => setRes(r.resultats)).catch(() => setRes([]));
    }, 0);
    return () => window.clearTimeout(t);
  }, [qd, type, auteur, portee, groupeId, depuis, jusqua, archives]);
  const puce = (actif: boolean) => cn('min-h-9 rounded-full border px-3 text-[12.5px] font-semibold', actif ? 'border-[#102C5F] bg-[#102C5F] text-white' : 'border-(--color-border) text-(--color-ink-soft)');
  return (
    <div className="space-y-3 px-2 pb-3">
      <Champ valeur={q} onChange={setQ} placeholder="Rechercher un mot, « item 231 »…" />
      <div className="flex flex-wrap gap-1.5">
        {([['tous', 'Tous les messages'], ['enseignants', 'Réponses enseignants'], ['importants', 'Réponses importantes'], ['pieces', 'Pièces jointes']] as const).map(([v, l]) => (
          <button key={v} type="button" className={puce(type === v)} onClick={() => setType(v)}>{l}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <select value={auteur} onChange={(e) => setAuteur(e.target.value as typeof auteur)} aria-label="Auteur" className="h-10 rounded-xl border border-(--color-border) bg-(--color-surface) px-2 text-[13px]">
          <option value="tous">Tous les auteurs</option><option value="moi">Mes messages</option><option value="candidats">Candidats</option><option value="enseignants">Enseignants</option>
        </select>
        {groupeId && (
          <select value={portee} onChange={(e) => setPortee(e.target.value as typeof portee)} aria-label="Portée" className="h-10 rounded-xl border border-(--color-border) bg-(--color-surface) px-2 text-[13px]">
            <option value="groupe">Ce groupe</option><option value="tous">Tous mes groupes</option>
          </select>
        )}
        <input type="date" value={depuis} onChange={(e) => setDepuis(e.target.value)} aria-label="Depuis le" className="h-10 rounded-xl border border-(--color-border) bg-(--color-surface) px-2 text-[13px]" />
        <input type="date" value={jusqua} onChange={(e) => setJusqua(e.target.value)} aria-label="Jusqu’au" className="h-10 rounded-xl border border-(--color-border) bg-(--color-surface) px-2 text-[13px]" />
      </div>
      {res === null ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
        : res.length === 0 ? <p className="py-6 text-center text-[13.5px] text-(--color-ink-muted)">{q.trim() ? 'Aucun résultat.' : 'Saisissez un mot-clé ou choisissez un filtre.'}</p>
          : (
            <ul className="divide-y divide-(--color-border) rounded-2xl border border-(--color-border) bg-(--color-surface)">
              {res.map((r) => (
                <li key={`${r.source}-${r.id}`}>
                  <button type="button" onClick={() => onOuvrir(r)} className="w-full px-3 py-3 text-left hover:bg-(--color-surface-soft)">
                    <span className="flex flex-wrap items-center gap-1.5 text-[12px] text-(--color-ink-muted)">
                      {r.source === 'bibliotheque' && <span className="rounded bg-green-100 px-1.5 font-bold text-green-800">Réponse validée</span>}
                      {r.epingle && r.source === 'message' && <span className="rounded bg-amber-100 px-1.5 font-bold text-amber-800">📌 À retenir</span>}
                      <span className={cn('font-semibold', (r.auteurType === 'enseignant' || r.auteurType === 'equipe') && 'text-[#102C5F] dark:text-white')}>{r.auteur}</span>
                      {r.groupeNom && <span>· {r.groupeNom}</span>}
                      <span>· {jourLisible(r.at)}</span>
                      {r.pieces > 0 && <Paperclip className="h-3 w-3" />}
                    </span>
                    {r.titre && <span className="mt-0.5 block text-[12.5px] font-semibold text-(--color-ink-soft)">{r.titre}</span>}
                    <span className="mt-1 block text-[13.5px] leading-snug text-(--color-ink)"><ExtraitSurligne segments={r.extrait} /></span>
                    <span className="mt-1 block text-[12px] font-bold text-[#102C5F] dark:text-white">{r.source === 'bibliotheque' ? 'Lire la réponse' : 'Voir dans la conversation'}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
    </div>
  );
}
