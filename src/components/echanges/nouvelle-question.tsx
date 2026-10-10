'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AtSign, BookOpenCheck, Loader2, Users } from 'lucide-react';
import type { ContexteDTO } from '@/lib/echanges/types';
import { api } from './api';

type Groupe = { id: string; nom: string; promotion: string | null; proche: boolean; peutTaguer: boolean };

/**
 * « 💬 Poser une question » depuis une fiche, un QCM, un cas clinique, un
 * replay… (§64-66) : le contexte pédagogique est joint, l'élève choisit de
 * publier dans la communauté ou d'adresser la question à un enseignant.
 */
export function NouvelleQuestion({ type, id }: { type: string; id: string }) {
  const router = useRouter();
  const [contexte, setContexte] = useState<ContexteDTO | null>(null);
  const [groupes, setGroupes] = useState<Groupe[] | null>(null);
  const [groupe, setGroupe] = useState<string>('');
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    api<{ contexte: ContexteDTO; groupes: Groupe[] }>(`/api/echanges/contexte?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`)
      .then((r) => { setContexte(r.contexte); setGroupes(r.groupes); setGroupe(r.groupes[0]?.id ?? ''); })
      .catch((e) => setErreur(e instanceof Error ? e.message : 'Contenu introuvable.'));
  }, [type, id]);

  const aller = (tag: boolean) => {
    if (!groupe) return;
    const p = new URLSearchParams({ type, id });
    if (tag) p.set('tag', '1');
    router.push(`/echanges/${groupe}?${p}`);
  };
  const g = groupes?.find((x) => x.id === groupe);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <button type="button" onClick={() => router.back()} className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-(--color-ink-soft)"><ArrowLeft className="h-4 w-4" />Retour</button>
      <h1 className="text-[22px] font-bold text-(--color-ink)">💬 Poser une question</h1>
      {erreur && <p className="mt-4 rounded-xl bg-(--color-surface) p-4 text-[14px] text-(--color-ink-soft)">{erreur}</p>}
      {!erreur && !contexte && <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>}
      {contexte && groupes && (
        <div className="mt-4 space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
            <BookOpenCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#102C5F]" />
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wide text-(--color-ink-muted)">Question concernant</p>
              <p className="text-[15px] font-semibold text-(--color-ink)">{contexte.titre}</p>
              {contexte.specialiteNom && <p className="text-[13px] text-(--color-ink-soft)">{contexte.specialiteNom}</p>}
            </div>
          </div>
          {groupes.length === 0 ? (
            <p className="rounded-xl bg-(--color-surface) p-4 text-[14px] text-(--color-ink-soft)">Aucun espace d’échanges ne vous est ouvert pour le moment. <Link href="/forum" className="font-semibold underline">Posez votre question sur le forum</Link>.</p>
          ) : (
            <>
              {groupes.length > 1 && (
                <label className="block">
                  <span className="mb-1 block text-[13px] font-semibold text-(--color-ink)">Groupe</span>
                  <select value={groupe} onChange={(e) => setGroupe(e.target.value)} className="h-12 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3 text-[15px]">
                    {groupes.map((x) => <option key={x.id} value={x.id}>{x.nom}{x.promotion ? ` — ${x.promotion}` : ''}</option>)}
                  </select>
                </label>
              )}
              <div className="grid gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => aller(false)} className="flex min-h-14 items-center gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-left hover:border-[#102C5F]">
                  <Users className="h-5 w-5 text-[#102C5F]" />
                  <span><span className="block text-[14.5px] font-bold">Publier dans la communauté</span><span className="block text-[12.5px] text-(--color-ink-soft)">Les candidats de votre promotion pourront répondre.</span></span>
                </button>
                <button type="button" onClick={() => aller(true)} disabled={!g?.peutTaguer} className="flex min-h-14 items-center gap-3 rounded-2xl bg-[#102C5F] px-4 py-3 text-left text-white disabled:opacity-50">
                  <AtSign className="h-5 w-5" />
                  <span><span className="block text-[14.5px] font-bold">Poser la question à un enseignant</span><span className="block text-[12.5px] text-white/80">Tapez @ puis choisissez l’enseignant : il reçoit un e-mail.</span></span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
