'use client';

import { memo, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, BookOpenCheck, Check, CheckCheck, Clock, FileText, Hourglass, Loader2, MoreHorizontal, Pin, Reply, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tailleLisible } from '@/lib/echanges/fichiers-regles';
import type { MessageDTO, PieceJointeDTO } from '@/lib/echanges/types';
import { heure, urlFichier } from './api';
import { AvatarAuteur, BadgeAuteur, TexteMessage } from './elements';

export type MessageAffiche = MessageDTO & { envoi?: 'en_cours' | 'echec'; erreurEnvoi?: string };

function ImageJointe({ p }: { p: PieceJointeDTO }) {
  const [src, setSrc] = useState<string | null>(null);
  const [erreur, setErreur] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Chargement à l'approche de l'écran : les longues conversations restent légères (§90).
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        urlFichier(p.id).then(setSrc).catch(() => setErreur(true));
      }
    }, { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, [p.id]);
  const ouvrir = async () => {
    try { window.open(await urlFichier(p.id), '_blank', 'noopener'); } catch { setErreur(true); }
  };
  return (
    <button ref={ref} type="button" onClick={ouvrir} className="block overflow-hidden rounded-xl border border-black/5 bg-(--color-surface-soft)" aria-label={`Ouvrir l’image ${p.nom}`}>
      {src && !erreur
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={src} alt={p.legende ?? p.nom} className="max-h-72 w-auto max-w-full object-contain" onError={() => setErreur(true)} />
        : <span className="flex h-40 w-56 max-w-full items-center justify-center text-xs text-(--color-ink-muted)">{erreur ? 'Image indisponible' : <Loader2 className="h-4 w-4 animate-spin" />}</span>}
      {p.legende && <span className="block px-2 py-1 text-left text-xs text-(--color-ink-soft)">{p.legende}</span>}
    </button>
  );
}

function Document({ p }: { p: PieceJointeDTO }) {
  const [charge, setCharge] = useState(false);
  const ouvrir = async () => {
    setCharge(true);
    try { window.open(await urlFichier(p.id, true), '_blank', 'noopener'); } finally { setCharge(false); }
  };
  return (
    <button type="button" onClick={ouvrir} className="flex w-full max-w-xs items-center gap-2.5 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2 text-left hover:border-(--color-border-strong)">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E4002B]/10 text-[#E4002B]">
        {charge ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold text-(--color-ink)">{p.nom}</span>
        <span className="block text-[11px] text-(--color-ink-muted)">{[p.mime === 'application/pdf' ? 'PDF' : 'Document', tailleLisible(p.taille)].filter(Boolean).join(' · ')}{p.legende ? ` — ${p.legende}` : ''}</span>
      </span>
    </button>
  );
}

export const BulleMessage = memo(function BulleMessage({
  m, groupe, surligne, selection, selectionne, selectionnable, onSelection, onActions, onRepondre, onReagir, onCiter, onAccuser,
}: {
  m: MessageAffiche;
  /** Même auteur que le message précédent, à moins de 5 minutes : nom et avatar masqués. */
  groupe: boolean;
  surligne: boolean;
  selection: boolean;
  selectionne: boolean;
  selectionnable: boolean;
  onSelection: (id: string) => void;
  onActions: (m: MessageAffiche) => void;
  onRepondre: (m: MessageAffiche) => void;
  onReagir: (m: MessageAffiche, emoji: string) => void;
  onCiter: (id: string) => void;
  onAccuser: (m: MessageAffiche) => void;
}) {
  const appui = useRef<number | null>(null);
  if (m.auteur.type === 'systeme') {
    return (
      <div id={`m-${m.id}`} className="my-3 flex justify-center px-4">
        <span className="max-w-md rounded-full bg-(--color-surface-sunken) px-3 py-1 text-center text-xs text-(--color-ink-soft)">{m.contenu}</span>
      </div>
    );
  }
  const moi = m.auteur.moi;
  const prof = m.auteur.type === 'enseignant';
  const equipe = m.auteur.type === 'equipe';
  const debutAppui = () => {
    appui.current = window.setTimeout(() => { appui.current = null; onActions(m); }, 450);
  };
  const finAppui = () => { if (appui.current) { window.clearTimeout(appui.current); appui.current = null; } };

  return (
    <div
      id={`m-${m.id}`}
      className={cn(
        'group relative flex gap-2 px-3 sm:px-4',
        groupe ? 'mt-0.5' : 'mt-3',
        moi ? 'flex-row-reverse' : 'flex-row',
        selection && selectionnable && 'cursor-pointer',
      )}
      onClick={selection && selectionnable ? () => onSelection(m.id) : undefined}
    >
      {selection && (
        <span className={cn('mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2', selectionnable ? (selectionne ? 'border-[#E4002B] bg-[#E4002B] text-white' : 'border-(--color-border-strong)') : 'border-transparent')}>
          {selectionne && <Check className="h-3 w-3" />}
        </span>
      )}
      <div className={cn('w-9 shrink-0', moi && 'hidden sm:block')}>
        {!groupe && !moi && <AvatarAuteur auteur={m.auteur} />}
      </div>
      <div className={cn('flex min-w-0 max-w-[85%] flex-col sm:max-w-[72%]', moi ? 'items-end' : 'items-start')}>
        {!groupe && !moi && (
          <div className="mb-0.5 flex flex-wrap items-center gap-1.5 px-1">
            <span className={cn('text-[13px] font-bold', prof || equipe ? 'text-[#102C5F] dark:text-white' : 'text-(--color-ink)')}>{m.auteur.nom}</span>
            <BadgeAuteur auteur={m.auteur} />
          </div>
        )}
        <div
          onTouchStart={debutAppui}
          onTouchEnd={finAppui}
          onTouchMove={finAppui}
          onContextMenu={(e) => { e.preventDefault(); onActions(m); }}
          className={cn(
            'relative rounded-2xl px-3 py-2 text-[14.5px] leading-relaxed shadow-sm transition-shadow',
            moi
              ? 'rounded-tr-md bg-[#DCF1FF] text-(--color-ink) dark:bg-[#0F3A5C] dark:text-white'
              : prof
                ? 'rounded-tl-md border border-[#102C5F]/25 bg-[#F1F5FF] text-(--color-ink) dark:bg-[#132447] dark:text-white'
                : equipe
                  ? 'rounded-tl-md border border-[#E4002B]/20 bg-[#FFF5F6] text-(--color-ink) dark:bg-[#3A0A14] dark:text-white'
                  : 'rounded-tl-md bg-(--color-surface) text-(--color-ink)',
            surligne && 'ring-2 ring-[#F59E0B] ring-offset-2 ring-offset-(--color-surface-soft)',
            m.statut === 'en_attente' && 'opacity-80 outline-dashed outline-1 outline-[#F59E0B]',
            m.envoi === 'echec' && 'outline outline-1 outline-[#E4002B]',
          )}
        >
          {m.important && (
            <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-[#E4002B] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              <AlertTriangle className="h-3 w-3" /> Important
            </span>
          )}
          {m.epingle && (
            <span className="mb-1 flex items-center gap-1 text-[11px] font-bold text-[#B45309]">
              <Pin className="h-3 w-3" /> À retenir
            </span>
          )}
          {m.contexte && (
            <Link href={m.contexte.lien ?? '#'} className="mb-1.5 flex items-center gap-1.5 rounded-lg bg-black/5 px-2 py-1 text-[12px] font-medium text-(--color-ink-soft) hover:bg-black/10 dark:bg-white/10">
              <BookOpenCheck className="h-3.5 w-3.5 shrink-0 text-[#102C5F] dark:text-white" />
              <span className="truncate">Question concernant : {m.contexte.titre}</span>
            </Link>
          )}
          {m.reponseA && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); if (m.reponseA?.disponible) onCiter(m.reponseA.id); }}
              className="mb-1.5 block w-full rounded-lg border-l-4 border-[#102C5F] bg-black/5 px-2 py-1 text-left text-[12px] hover:bg-black/10 dark:border-white/60 dark:bg-white/10"
            >
              <span className="block font-bold text-[#102C5F] dark:text-white">{m.reponseA.auteur || 'Message'}</span>
              <span className="line-clamp-2 text-(--color-ink-soft)">{m.reponseA.extrait}</span>
            </button>
          )}
          {m.contenu && <TexteMessage texte={m.contenu} mentions={m.mentions.map((x) => x.nom)} />}
          {m.pieces.length > 0 && (
            <div className="mt-1.5 flex flex-col gap-1.5">
              {m.pieces.map((p) => (p.estImage ? <ImageJointe key={p.id} p={p} /> : <Document key={p.id} p={p} />))}
            </div>
          )}
          {m.tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {m.tags.map((t) => (
                <span key={t.enseignantId} className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  t.statut === 'traitee' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200')}>
                  {t.statut === 'traitee' ? <CheckCheck className="h-3 w-3" /> : <Hourglass className="h-3 w-3" />}
                  {t.enseignant} · {t.statut === 'traitee' ? 'a répondu' : t.statut === 'a_reaffecter' ? 'en cours de réaffectation' : 'question transmise'}
                </span>
              ))}
            </div>
          )}
          <div className={cn('mt-1 flex items-center justify-end gap-1.5 text-[10.5px] text-(--color-ink-muted)')}>
            {m.statut === 'en_attente' && <span className="inline-flex items-center gap-1 font-semibold text-[#B45309]"><ShieldAlert className="h-3 w-3" />{m.attenteMotif}</span>}
            {m.modifie && <span>modifié</span>}
            {m.envoi === 'en_cours' ? <Clock className="h-3 w-3" /> : <span>{heure(m.createdAt)}</span>}
            {moi && m.envoi !== 'en_cours' && m.statut === 'publie' && <Check className="h-3 w-3" />}
          </div>
          {m.envoi === 'echec' && <p className="mt-1 text-[12px] font-semibold text-[#E4002B]">{m.erreurEnvoi ?? 'Non envoyé'}</p>}
        </div>
        {m.reactions.length > 0 && (
          <div className={cn('-mt-1.5 flex flex-wrap gap-1 px-2', moi ? 'justify-end' : 'justify-start')}>
            {m.reactions.map((r) => (
              <button key={r.emoji} type="button" onClick={(e) => { e.stopPropagation(); onReagir(m, r.emoji); }}
                className={cn('rounded-full border bg-(--color-surface) px-1.5 py-0.5 text-[12px] shadow-sm', r.moi ? 'border-[#102C5F]/40' : 'border-(--color-border)')}
                aria-label={`${r.emoji} ${r.n}`}>
                {r.emoji} <span className="tabular-nums text-(--color-ink-soft)">{r.n}</span>
              </button>
            ))}
          </div>
        )}
        {m.accuseRequis && m.canal === 'annonces' && !moi && (
          m.accuse
            ? <span className="mt-1 px-1 text-[11px] font-semibold text-green-700 dark:text-green-300">✓ Vous avez pris connaissance de cette annonce</span>
            : <button type="button" onClick={() => onAccuser(m)} className="mt-1 rounded-full bg-[#102C5F] px-3 py-1 text-[12px] font-bold text-white">J’ai pris connaissance</button>
        )}
        {m.lectures && (
          <span className="mt-1 px-1 text-[11px] text-(--color-ink-muted)">Vue par {m.lectures.vus}/{m.lectures.membres}{m.accuseRequis ? ` · ${m.lectures.accuses} accusé(s) de lecture` : ''}</span>
        )}
      </div>
      {!selection && m.envoi !== 'en_cours' && (
        <div className={cn('flex shrink-0 items-start gap-0.5 pt-6 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:focus-within:opacity-100', moi ? 'flex-row-reverse' : '')}>
          <button type="button" onClick={() => onRepondre(m)} className="hidden rounded-full p-1.5 text-(--color-ink-muted) hover:bg-(--color-surface) hover:text-(--color-ink) sm:block" aria-label="Répondre">
            <Reply className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => onActions(m)} className="rounded-full p-1.5 text-(--color-ink-muted) hover:bg-(--color-surface) hover:text-(--color-ink)" aria-label="Plus d’actions">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
});
