'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2, Rocket, Undo2, SendHorizonal } from 'lucide-react';
import { deletePost, setPostStatus } from './actions';

export function DeletePostButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        title="Supprimer"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(`Supprimer définitivement « ${title || 'cet article'} » ?`)) return;
          setError(null);
          start(async () => {
            const r = await deletePost(id);
            if (!r.ok) { setError(r.error ?? 'Erreur'); return; }
            router.refresh();
          });
        }}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-ink-muted) hover:bg-[#FDE7E9] hover:text-[#C0001F] disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
      {error && <span className="text-[11px] text-[#C0001F]">{error}</span>}
    </span>
  );
}

/**
 * Publier / dépublier / soumettre à validation depuis la liste (cahier §6).
 * Les boutons proposés dépendent des droits de la personne et du statut.
 */
export function PostStatusButtons({
  id, status, droits,
}: {
  id: string; status: 'draft' | 'pending' | 'published'; droits: { publier: boolean; depublier: boolean; modifier: boolean };
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const go = (s: 'draft' | 'pending' | 'published') => {
    setError(null);
    start(async () => { const r = await setPostStatus(id, s); if (!r.ok) { setError(r.error ?? 'Erreur'); return; } router.refresh(); });
  };
  const BTN = 'inline-flex h-8 items-center gap-1 rounded-lg border px-2 text-[11px] font-bold disabled:opacity-50';
  return (
    <span className="inline-flex items-center gap-1">
      {status !== 'published' && droits.publier && (
        <button type="button" disabled={pending} onClick={() => go('published')} className={`${BTN} border-[#16793C]/30 bg-[#E7F6EC] text-[#16793C]`} title="Publier">
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />} Publier
        </button>
      )}
      {status === 'draft' && !droits.publier && droits.modifier && (
        <button type="button" disabled={pending} onClick={() => go('pending')} className={`${BTN} border-[#B26A00]/30 bg-[#FEF3E2] text-[#B26A00]`} title="Soumettre à validation">
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <SendHorizonal className="h-3.5 w-3.5" />} Soumettre
        </button>
      )}
      {status === 'published' && droits.depublier && (
        <button type="button" disabled={pending} onClick={() => { if (window.confirm('Dépublier cet article ? Il repassera en brouillon.')) go('draft'); }} className={`${BTN} border-(--color-border) bg-white text-(--color-ink-soft)`} title="Dépublier">
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Undo2 className="h-3.5 w-3.5" />} Dépublier
        </button>
      )}
      {error && <span className="text-[11px] text-[#C0001F]">{error}</span>}
    </span>
  );
}
