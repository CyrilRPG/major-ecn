'use client';

import { Fragment } from 'react';
import { BadgeCheck, GraduationCap, UserRound } from 'lucide-react';
import { DrawnAvatar } from '@/components/avatar/drawn-avatar';
import { cn } from '@/lib/utils';
import type { AuteurDTO } from '@/lib/echanges/types';

/** Avatar d'un auteur : dessin pour un candidat, initiale / logo / photo pour l'équipe. */
export function AvatarAuteur({ auteur, taille = 36 }: { auteur: AuteurDTO; taille?: number }) {
  const s = { width: taille, height: taille };
  if (auteur.avatar.mode === 'dessin') {
    return <DrawnAvatar seed={auteur.avatar.seed ?? auteur.cle} size={taille} className="shrink-0 rounded-full" />;
  }
  if (auteur.avatar.mode === 'photo' && auteur.avatar.url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={auteur.avatar.url} alt="" style={s} className="shrink-0 rounded-full object-cover" />;
  }
  if (auteur.avatar.mode === 'majorecn' || auteur.type === 'systeme') {
    return (
      <span style={s} className="flex shrink-0 items-center justify-center rounded-full bg-[#102C5F] text-[11px] font-black tracking-tight text-white">
        M<span className="text-[#E4002B]">E</span>
      </span>
    );
  }
  if (auteur.avatar.mode === 'neutre') {
    return (
      <span style={s} className="flex shrink-0 items-center justify-center rounded-full bg-(--color-surface-sunken) text-(--color-ink-soft)">
        <UserRound className="h-1/2 w-1/2" />
      </span>
    );
  }
  return (
    <span style={{ ...s, fontSize: Math.round(taille * 0.42) }} className="flex shrink-0 items-center justify-center rounded-full bg-[#102C5F] font-bold text-white">
      {auteur.avatar.initiale}
    </span>
  );
}

/** « Thomas · ENSEIGNANT MAJOR ECN ✓ » — distinction immédiate élève / enseignant (§16). */
export function BadgeAuteur({ auteur }: { auteur: AuteurDTO }) {
  if (auteur.type === 'enseignant') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#102C5F] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
        <GraduationCap className="h-3 w-3" />
        {auteur.qualite ?? 'Enseignant Major ECN'}
        <BadgeCheck className="h-3 w-3 text-[#7DD3FC]" />
      </span>
    );
  }
  if (auteur.type === 'equipe') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#E4002B] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
        {auteur.qualite ?? 'Équipe Major ECN'}
        <BadgeCheck className="h-3 w-3" />
      </span>
    );
  }
  return null;
}

const RE_LIEN = /(https?:\/\/[^\s<>"')\]]+|www\.[^\s<>"')\]]+)/g;

/**
 * Texte d'un message : paragraphes, liens cliquables, @mentions des
 * enseignants mises en évidence. Aucun HTML interprété (pas de XSS possible).
 */
export function TexteMessage({ texte, mentions, className }: { texte: string; mentions: string[]; className?: string }) {
  const noms = mentions.filter(Boolean).map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const reMention = noms.length ? new RegExp(`(@(?:${noms.join('|')}))(?![\\p{L}])`, 'giu') : null;
  const morceau = (t: string, k: string) => {
    if (!reMention) return <Fragment key={k}>{t}</Fragment>;
    const parts = t.split(reMention);
    return parts.map((p, i) => (i % 2 === 1
      ? <span key={`${k}-${i}`} className="rounded bg-[#102C5F]/10 px-0.5 font-semibold text-[#102C5F] dark:bg-white/15 dark:text-white">{p}</span>
      : <Fragment key={`${k}-${i}`}>{p}</Fragment>));
  };
  return (
    <div className={cn('whitespace-pre-wrap break-words [overflow-wrap:anywhere]', className)}>
      {texte.split(RE_LIEN).map((p, i) => (i % 2 === 1
        ? (
          <a key={i} href={p.startsWith('http') ? p : `https://${p}`} target="_blank" rel="noopener noreferrer nofollow" className="font-medium text-(--color-primary) underline underline-offset-2">
            {p}
          </a>
        )
        : morceau(p, String(i))))}
    </div>
  );
}

/** Extrait de recherche avec termes en évidence (§124). */
export function ExtraitSurligne({ segments }: { segments: { t: string; fort: boolean }[] }) {
  return (
    <>
      {segments.map((s, i) => (s.fort
        ? <mark key={i} className="rounded bg-[#FDE68A] px-0.5 text-inherit">{s.t}</mark>
        : <Fragment key={i}>{s.t}</Fragment>))}
    </>
  );
}

export function Pastille({ n, className }: { n: number; className?: string }) {
  if (!n) return null;
  return (
    <span className={cn('inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E4002B] px-1.5 text-[11px] font-bold tabular-nums text-white', className)}>
      {n > 99 ? '99+' : n}
    </span>
  );
}
