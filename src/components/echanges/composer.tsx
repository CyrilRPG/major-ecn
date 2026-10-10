'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, AtSign, BookOpenCheck, FileText, ImageIcon, Lightbulb, Loader2, Paperclip, Pencil, Send, ShieldAlert, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LIBELLE_FORMAT } from '@/lib/echanges/fichiers-regles';
import type { ContexteDTO, DroitsDTO, EnseignantTagDTO, ResultatRechercheDTO } from '@/lib/echanges/types';
import { api, ErreurApi, televerser } from './api';
import { ExtraitSurligne } from './elements';
import type { MessageAffiche } from './message';

type Piece = { cle: string; nom: string; image: boolean; statut: 'envoi' | 'pret' | 'erreur'; id?: string; erreur?: string; moderation?: boolean };

export type EnvoiComposer = {
  contenu: string;
  mentions: string[];
  pieces: string[];
  important: boolean;
  accuseLecture: boolean;
};

export function Composer({
  groupeId, canal, droits, enseignants, reglages, estEquipe, reponseA, onAnnulerReponse, contexte, onRetirerContexte,
  edition, onAnnulerEdition, onModifier, onEnvoyer, onOuvrirResultat, cleBrouillon,
}: {
  groupeId: string;
  canal: 'discussion' | 'annonces';
  droits: DroitsDTO;
  enseignants: EnseignantTagDTO[];
  reglages: { formats: string[]; tailleMaxMo: number; pjMax: number; longueurMax: number };
  estEquipe: boolean;
  reponseA: MessageAffiche | null;
  onAnnulerReponse: () => void;
  contexte: ContexteDTO | null;
  onRetirerContexte: () => void;
  edition: MessageAffiche | null;
  onAnnulerEdition: () => void;
  onModifier: (id: string, contenu: string) => Promise<void>;
  onEnvoyer: (e: EnvoiComposer) => Promise<boolean>;
  onOuvrirResultat: (r: ResultatRechercheDTO) => void;
  cleBrouillon: string;
}) {
  const [texte, setTexte] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [important, setImportant] = useState(false);
  const [accuse, setAccuse] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [requeteMention, setRequeteMention] = useState<string | null>(null);
  const [indexMention, setIndexMention] = useState(0);
  const [similaires, setSimilaires] = useState<ResultatRechercheDTO[]>([]);
  const [similairesVus, setSimilairesVus] = useState(false);
  const zone = useRef<HTMLTextAreaElement>(null);
  const fichier = useRef<HTMLInputElement>(null);

  const peutEcrire = canal === 'annonces' ? droits.publierAnnonce : droits.publier;

  // Brouillon non envoyé conservé sur l'appareil (confort, jamais critique).
  useEffect(() => {
    try { const b = window.localStorage.getItem(cleBrouillon); if (b) setTexte(b); } catch { /* stockage indisponible */ }
  }, [cleBrouillon]);
  useEffect(() => {
    if (edition) return;
    const t = window.setTimeout(() => {
      try { if (texte) window.localStorage.setItem(cleBrouillon, texte); else window.localStorage.removeItem(cleBrouillon); } catch { /* noop */ }
    }, 400);
    return () => window.clearTimeout(t);
  }, [texte, cleBrouillon, edition]);

  useEffect(() => {
    if (edition) { setTexte(edition.contenu ?? ''); window.setTimeout(() => zone.current?.focus(), 0); }
  }, [edition]);
  useEffect(() => { if (reponseA) zone.current?.focus(); }, [reponseA]);

  // Hauteur automatique.
  useEffect(() => {
    const z = zone.current;
    if (!z) return;
    z.style.height = 'auto';
    z.style.height = `${Math.min(z.scrollHeight, 200)}px`;
  }, [texte]);

  // Réponses similaires (§67) : avant de solliciter un enseignant.
  useEffect(() => {
    if (mentions.length === 0 || similairesVus || texte.trim().length < 25) { setSimilaires([]); return; }
    const t = window.setTimeout(() => {
      api<{ resultats: ResultatRechercheDTO[] }>(`/api/echanges/similaires?groupe=${groupeId}&q=${encodeURIComponent(texte.slice(0, 300))}`)
        .then((r) => setSimilaires(r.resultats)).catch(() => setSimilaires([]));
    }, 900);
    return () => window.clearTimeout(t);
  }, [texte, mentions.length, groupeId, similairesVus]);

  const candidatsMention = useMemo(() => {
    if (requeteMention === null) return [];
    const q = requeteMention.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    return enseignants.filter((e) => `${e.prenom} ${e.libelle} ${e.specialite ?? ''}`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().includes(q)).slice(0, 6);
  }, [requeteMention, enseignants]);

  const surSaisie = (v: string) => {
    setTexte(v);
    setErreur(null);
    const z = zone.current;
    const pos = z?.selectionStart ?? v.length;
    const avant = v.slice(0, pos);
    const m = /(?:^|\s)@([\p{L}\-]{0,20})$/u.exec(avant);
    if (m && droits.taguer && canal === 'discussion' && enseignants.length > 0) { setRequeteMention(m[1]); setIndexMention(0); }
    else setRequeteMention(null);
  };

  const choisirMention = (e: EnseignantTagDTO) => {
    const z = zone.current;
    const pos = z?.selectionStart ?? texte.length;
    const avant = texte.slice(0, pos).replace(/@([\p{L}\-]{0,20})$/u, `@${e.prenom} `);
    const nouveau = avant + texte.slice(pos);
    setTexte(nouveau);
    setMentions((l) => (l.includes(e.id) ? l : [...l, e.id]));
    setRequeteMention(null);
    window.setTimeout(() => { z?.focus(); z?.setSelectionRange(avant.length, avant.length); }, 0);
  };

  // Un tag effacé du texte n'est plus envoyé (le serveur le vérifie aussi).
  const mentionsActives = mentions.filter((id) => {
    const e = enseignants.find((x) => x.id === id);
    return !!e && texte.toLowerCase().includes(`@${e.prenom.toLowerCase()}`);
  });

  const ajouterFichiers = async (liste: FileList | null) => {
    if (!liste) return;
    const fichiers = Array.from(liste).slice(0, Math.max(0, reglages.pjMax - pieces.length));
    for (const f of fichiers) {
      const cle = `${f.name}-${f.size}-${Date.now()}`;
      if (!reglages.formats.includes(f.type)) {
        setErreur(`Format non autorisé (${reglages.formats.map((m) => LIBELLE_FORMAT[m] ?? m).join(', ')}).`);
        continue;
      }
      if (f.size > reglages.tailleMaxMo * 1024 * 1024) { setErreur(`« ${f.name} » dépasse ${reglages.tailleMaxMo} Mo.`); continue; }
      setPieces((l) => [...l, { cle, nom: f.name, image: f.type.startsWith('image/'), statut: 'envoi' }]);
      try {
        const r = await televerser(groupeId, f, null);
        setPieces((l) => l.map((p) => (p.cle === cle ? { ...p, statut: 'pret', id: r.id, moderation: r.enModeration } : p)));
      } catch (e) {
        setPieces((l) => l.map((p) => (p.cle === cle ? { ...p, statut: 'erreur', erreur: e instanceof Error ? e.message : 'Échec' } : p)));
      }
    }
    if (fichier.current) fichier.current.value = '';
  };

  const envoyer = useCallback(async () => {
    if (envoi) return;
    const contenu = texte.trim();
    if (edition) {
      if (!contenu) return;
      setEnvoi(true);
      try { await onModifier(edition.id, contenu); setTexte(''); onAnnulerEdition(); } catch (e) { setErreur(e instanceof ErreurApi || e instanceof Error ? e.message : 'Modification impossible.'); } finally { setEnvoi(false); }
      return;
    }
    const prets = pieces.filter((p) => p.statut === 'pret' && p.id).map((p) => p.id as string);
    if (pieces.some((p) => p.statut === 'envoi')) { setErreur('Patientez : un fichier est en cours d’envoi.'); return; }
    if (!contenu && prets.length === 0) return;
    if (contenu.length > reglages.longueurMax) { setErreur(`Message trop long (${reglages.longueurMax} caractères au maximum).`); return; }
    setEnvoi(true);
    const ok = await onEnvoyer({ contenu, mentions: mentionsActives, pieces: prets, important, accuseLecture: accuse });
    setEnvoi(false);
    if (ok) {
      setTexte(''); setMentions([]); setPieces([]); setImportant(false); setAccuse(false); setSimilaires([]); setSimilairesVus(false);
      try { window.localStorage.removeItem(cleBrouillon); } catch { /* noop */ }
    }
  }, [envoi, texte, edition, pieces, reglages.longueurMax, onEnvoyer, mentionsActives, important, accuse, onModifier, onAnnulerEdition, cleBrouillon]);

  const surTouche = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (requeteMention !== null && candidatsMention.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setIndexMention((i) => (i + 1) % candidatsMention.length); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setIndexMention((i) => (i - 1 + candidatsMention.length) % candidatsMention.length); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); choisirMention(candidatsMention[indexMention]); return; }
      if (e.key === 'Escape') { setRequeteMention(null); return; }
    }
    if (e.key === 'Escape' && edition) { onAnnulerEdition(); setTexte(''); return; }
    // Ordinateur : Entrée envoie, Maj+Entrée va à la ligne. Écran tactile : Entrée va à la ligne.
    const tactile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
    if (e.key === 'Enter' && !e.shiftKey && !tactile && !e.nativeEvent.isComposing) { e.preventDefault(); void envoyer(); }
  };

  if (!peutEcrire) {
    return (
      <div className="border-t border-(--color-border) bg-(--color-surface) px-4 py-3 text-center text-[13px] text-(--color-ink-soft) pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {canal === 'annonces' ? 'Seule l’équipe Major ECN publie dans les annonces.' : droits.motif ?? 'La publication est fermée dans cette conversation.'}
      </div>
    );
  }

  return (
    <div className="relative border-t border-(--color-border) bg-(--color-surface) pb-[env(safe-area-inset-bottom)]">
      {similaires.length > 0 && (
        <div className="mx-3 mt-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-[13px] dark:border-amber-700 dark:bg-amber-950/40">
          <p className="mb-1.5 flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200"><Lightbulb className="h-4 w-4" /> Une réponse similaire existe peut-être déjà</p>
          <ul className="space-y-1.5">
            {similaires.map((r) => (
              <li key={`${r.source}-${r.id}`}>
                <button type="button" onClick={() => onOuvrirResultat(r)} className="text-left hover:underline">
                  <span className="font-semibold text-[#102C5F] dark:text-white">{r.auteur}</span>
                  <span className="text-(--color-ink-soft)"> — « <ExtraitSurligne segments={r.extrait} /> »</span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => { setSimilairesVus(true); setSimilaires([]); }} className="mt-2 text-[12px] font-bold text-amber-900 underline dark:text-amber-200">Poser quand même ma question</button>
        </div>
      )}
      {(reponseA || edition || contexte) && (
        <div className="flex flex-col gap-1 px-3 pt-2">
          {contexte && (
            <div className="flex items-center gap-2 rounded-lg bg-[#102C5F]/8 px-3 py-1.5 text-[12.5px] dark:bg-white/10">
              <BookOpenCheck className="h-4 w-4 shrink-0 text-[#102C5F] dark:text-white" />
              <span className="min-w-0 flex-1 truncate"><span className="font-semibold">Question concernant :</span> {contexte.titre}</span>
              <button type="button" onClick={onRetirerContexte} aria-label="Retirer le contexte" className="rounded p-0.5 hover:bg-black/10"><X className="h-3.5 w-3.5" /></button>
            </div>
          )}
          {reponseA && !edition && (
            <div className="flex items-center gap-2 rounded-lg border-l-4 border-[#102C5F] bg-(--color-surface-soft) px-3 py-1.5 text-[12.5px]">
              <span className="min-w-0 flex-1"><span className="block font-bold text-[#102C5F] dark:text-white">Répondre à {reponseA.auteur.moi ? 'vous-même' : reponseA.auteur.nom}</span><span className="line-clamp-1 text-(--color-ink-soft)">{reponseA.contenu ?? 'Pièce jointe'}</span></span>
              <button type="button" onClick={onAnnulerReponse} aria-label="Annuler la réponse" className="rounded p-0.5 hover:bg-black/10"><X className="h-3.5 w-3.5" /></button>
            </div>
          )}
          {edition && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-[12.5px] text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              <Pencil className="h-3.5 w-3.5" /><span className="flex-1 font-semibold">Modification du message</span>
              <button type="button" onClick={() => { onAnnulerEdition(); setTexte(''); }} aria-label="Annuler la modification" className="rounded p-0.5 hover:bg-black/10"><X className="h-3.5 w-3.5" /></button>
            </div>
          )}
        </div>
      )}
      {pieces.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-3 pt-2">
          {pieces.map((p) => (
            <span key={p.cle} className={cn('inline-flex max-w-[220px] items-center gap-1.5 rounded-lg border px-2 py-1 text-[12px]', p.statut === 'erreur' ? 'border-[#E4002B] text-[#E4002B]' : 'border-(--color-border)')}>
              {p.statut === 'envoi' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : p.image ? <ImageIcon className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
              <span className="truncate">{p.statut === 'erreur' ? p.erreur : p.nom}</span>
              {p.moderation && <ShieldAlert className="h-3.5 w-3.5 text-amber-600" aria-label="Vérification par l’équipe" />}
              <button type="button" onClick={() => setPieces((l) => l.filter((x) => x.cle !== p.cle))} aria-label={`Retirer ${p.nom}`}><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      )}
      {estEquipe && canal === 'annonces' && !edition && (
        <div className="flex flex-wrap gap-3 px-4 pt-2 text-[12.5px]">
          <label className="inline-flex items-center gap-1.5 font-semibold text-[#E4002B]">
            <input type="checkbox" checked={important} onChange={(e) => setImportant(e.target.checked)} className="h-4 w-4 accent-[#E4002B]" />
            <AlertTriangle className="h-3.5 w-3.5" /> Important (notifie tous les membres)
          </label>
          <label className="inline-flex items-center gap-1.5 text-(--color-ink-soft)">
            <input type="checkbox" checked={accuse} onChange={(e) => setAccuse(e.target.checked)} className="h-4 w-4" />
            Demander un accusé de lecture
          </label>
        </div>
      )}
      {requeteMention !== null && candidatsMention.length > 0 && (
        <ul role="listbox" className="absolute bottom-full left-3 right-3 z-20 mb-2 max-w-sm overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-lifted) sm:right-auto sm:w-80">
          <li className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-(--color-ink-muted)">Adresser la question à</li>
          {candidatsMention.map((e, i) => (
            <li key={e.id} role="option" aria-selected={i === indexMention}>
              <button type="button" onMouseDown={(ev) => { ev.preventDefault(); choisirMention(e); }}
                className={cn('flex w-full items-center gap-2 px-3 py-2 text-left text-[13.5px]', i === indexMention ? 'bg-(--color-primary-soft)' : 'hover:bg-(--color-surface-soft)')}>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102C5F] text-[12px] font-bold text-white">{e.prenom.charAt(0)}</span>
                <span><span className="font-bold">@{e.prenom}</span> <span className="text-(--color-ink-soft)">— {e.libelle.split(' · ')[1] ?? e.specialite}</span></span>
              </button>
            </li>
          ))}
          <li className="border-t border-(--color-border) px-3 py-1.5 text-[11px] text-(--color-ink-muted)">L’enseignant tagué reçoit un e-mail.</li>
        </ul>
      )}
      {erreur && <p className="px-4 pt-2 text-[12.5px] font-semibold text-[#E4002B]" role="alert">{erreur}</p>}
      {mentionsActives.length > 0 && (
        <p className="px-4 pt-1.5 text-[12px] text-[#102C5F] dark:text-white">
          <AtSign className="mr-1 inline h-3 w-3" />
          Question adressée à {mentionsActives.map((id) => enseignants.find((e) => e.id === id)?.libelle).filter(Boolean).join(', ')} — un e-mail lui sera envoyé.
        </p>
      )}
      <div className="flex items-end gap-1.5 px-2 py-2 sm:px-3">
        {(droits.joindre || (canal === 'annonces' && droits.publierAnnonce)) && !edition && (
          <>
            <input ref={fichier} type="file" multiple accept={reglages.formats.join(',')} className="hidden" onChange={(e) => void ajouterFichiers(e.target.files)} />
            <button type="button" onClick={() => fichier.current?.click()} disabled={pieces.length >= reglages.pjMax}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-(--color-ink-soft) hover:bg-(--color-surface-soft) disabled:opacity-40" aria-label="Joindre un fichier (image, capture, PDF)">
              <Paperclip className="h-5 w-5" />
            </button>
          </>
        )}
        {droits.taguer && canal === 'discussion' && enseignants.length > 0 && !edition && (
          <button type="button" onClick={() => { const v = `${texte}${texte && !texte.endsWith(' ') ? ' ' : ''}@`; setTexte(v); setRequeteMention(''); window.setTimeout(() => zone.current?.focus(), 0); }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-(--color-ink-soft) hover:bg-(--color-surface-soft)" aria-label="Taguer un enseignant">
            <AtSign className="h-5 w-5" />
          </button>
        )}
        <textarea
          ref={zone}
          value={texte}
          onChange={(e) => surSaisie(e.target.value)}
          onKeyDown={surTouche}
          rows={1}
          maxLength={reglages.longueurMax + 50}
          placeholder={canal === 'annonces' ? 'Rédiger une annonce…' : droits.taguer ? 'Votre message… (@ pour taguer un enseignant)' : 'Votre message…'}
          aria-label="Message"
          className="max-h-[200px] min-h-11 flex-1 resize-none rounded-2xl border border-(--color-border) bg-(--color-surface-soft) px-4 py-2.5 text-[15px] leading-snug text-(--color-ink) outline-none placeholder:text-(--color-ink-muted) focus:border-(--color-border-strong) focus:bg-(--color-surface)"
        />
        <button type="button" onClick={() => void envoyer()} disabled={envoi || (!texte.trim() && !pieces.some((p) => p.statut === 'pret'))}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E4002B] text-white shadow-sm transition-transform enabled:hover:scale-105 disabled:opacity-40" aria-label={edition ? 'Enregistrer la modification' : 'Envoyer'}>
          {envoi ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
