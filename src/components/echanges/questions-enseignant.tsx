'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, Loader2, MessageSquareReply } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuestionEnseignantDTO } from '@/lib/echanges/types';
import { api, depuisCourt } from './api';

/**
 * « Questions qui me sont adressées » (§28) : À traiter / Traitées, avec
 * promotion, date, extrait, temps écoulé et accès direct à la question.
 */
export function QuestionsEnseignant({ marquerTraite }: { marquerTraite: boolean }) {
  const [onglet, setOnglet] = useState<'a_traiter' | 'traitees'>('a_traiter');
  const [liste, setListe] = useState<QuestionEnseignantDTO[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const charger = useCallback(() => {
    setListe(null);
    api<{ questions: QuestionEnseignantDTO[] }>(`/api/echanges/questions?onglet=${onglet}`)
      .then((r) => setListe(r.questions)).catch((e) => { setErreur(e instanceof Error ? e.message : 'Indisponible'); setListe([]); });
  }, [onglet]);
  useEffect(() => { const t = window.setTimeout(charger, 0); return () => window.clearTimeout(t); }, [charger]);

  const traiter = async (q: QuestionEnseignantDTO) => {
    try {
      await api('/api/echanges/questions', { method: 'POST', body: { tagId: q.tagId } });
      charger();
    } catch (e) { setErreur(e instanceof Error ? e.message : 'Action impossible.'); }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6">
      <Link href="/echanges" className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-(--color-ink-soft) hover:text-(--color-ink)"><ArrowLeft className="h-4 w-4" />Échanges</Link>
      <h1 className="text-[22px] font-bold text-(--color-ink)">Questions qui me sont adressées</h1>
      <p className="mt-1 text-[13.5px] text-(--color-ink-soft)">Seules les questions où un candidat vous a explicitement tagué apparaissent ici. Répondez dans la conversation : votre réponse traite la question et annule le rappel.</p>
      <div className="mt-4 flex gap-1.5" role="tablist">
        {([['a_traiter', 'À traiter'], ['traitees', 'Traitées']] as const).map(([v, l]) => (
          <button key={v} type="button" role="tab" aria-selected={onglet === v} onClick={() => setOnglet(v)}
            className={cn('min-h-10 rounded-xl px-4 text-[14px] font-semibold', onglet === v ? 'bg-[#102C5F] text-white' : 'bg-(--color-surface) text-(--color-ink-soft) hover:bg-(--color-surface-sunken)')}>{l}</button>
        ))}
      </div>
      {erreur && <p className="mt-3 text-[13px] font-semibold text-[#E4002B]">{erreur}</p>}
      {liste === null ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        : liste.length === 0 ? <p className="mt-6 rounded-2xl bg-(--color-surface) px-4 py-10 text-center text-[14px] text-(--color-ink-soft)">{onglet === 'a_traiter' ? 'Aucune question en attente. 🎉' : 'Aucune question traitée pour le moment.'}</p>
          : (
            <ul className="mt-4 space-y-3">
              {liste.map((q) => (
                <li key={q.tagId} className={cn('rounded-2xl border bg-(--color-surface) p-4', q.enRetard && q.statut !== 'traitee' ? 'border-amber-300' : 'border-(--color-border)')}>
                  <div className="flex flex-wrap items-center gap-2 text-[12px] text-(--color-ink-muted)">
                    <span className="font-semibold text-(--color-ink-soft)">{q.groupeNom}</span>
                    {q.promotion && <span>· {q.promotion}</span>}
                    <span>· {new Date(q.tagAt).toLocaleString('fr-FR', { timeZone: 'Europe/Paris', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    {q.statut !== 'traitee'
                      ? <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold', q.enRetard ? 'bg-amber-100 text-amber-800' : 'bg-(--color-surface-sunken) text-(--color-ink-soft)')}><Clock className="h-3 w-3" />{q.enRetard ? 'En retard · ' : ''}il y a {depuisCourt(q.tagAt)}</span>
                      : <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 font-bold text-green-800"><CheckCircle2 className="h-3 w-3" />Traitée {q.reponduAt ? `en ${depuisCourt(q.tagAt).replace('hier', '1 j')}` : ''}</span>}
                  </div>
                  <p className="mt-1.5 text-[12.5px] font-semibold text-(--color-ink-soft)">{q.eleve}</p>
                  <p className="mt-1 whitespace-pre-line text-[14.5px] text-(--color-ink)">{q.extrait}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {q.disponible && (
                      <Link href={`/echanges/${q.groupeId}?m=${q.messageId}`} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#102C5F] px-4 text-[13.5px] font-bold text-white">
                        <MessageSquareReply className="h-4 w-4" />{q.statut === 'traitee' ? 'Voir dans la conversation' : 'Répondre à la question'}
                      </Link>
                    )}
                    {marquerTraite && q.statut !== 'traitee' && q.disponible && (
                      <button type="button" onClick={() => void traiter(q)} className="h-10 rounded-xl border border-(--color-border) px-4 text-[13.5px] font-semibold hover:bg-(--color-surface-soft)">Marquer comme traité</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
    </div>
  );
}
