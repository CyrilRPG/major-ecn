'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { History, Loader2, Trash2, Wand2 } from 'lucide-react';
import { convertirAnciensBlocs, supprimerBloc } from './actions';

export type AncienBlocVue = { id: string; kind: string; title: string; cible: string };

const TYPE: Record<string, string> = { countdown: 'Compte à rebours', event_list: 'Calendrier', stat: 'Statistique' };

/**
 * Anciens blocs compte à rebours / calendrier / statistique : ils ne sont plus
 * affichés tels quels aux élèves (ils faisaient doublon) ; ceux qui visaient
 * une spécialité alimentent sa fiche tant qu'ils ne sont pas convertis.
 */
export function AnciensBlocs({ blocs, heritees, sections }: { blocs: AncienBlocVue[]; heritees: number; sections: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  if (blocs.length === 0 && heritees === 0 && sections === 0) return null;

  return (
    <section className="rounded-2xl border border-[#F5C99B] bg-[#FFF8F1] p-4">
      <h2 className="flex items-center gap-2 text-sm font-bold text-[#8A4B00]"><History className="h-4 w-4" /> Anciens blocs (avant la refonte)</h2>
      <p className="mt-1 text-xs text-[#8A4B00]/90">
        Les anciens comptes à rebours, calendriers et statistiques ne s’affichent plus séparément : c’est ce qui créait les
        doublons (trois « J−113 » pour une même élève). Ceux qui visaient une spécialité sont repris dans sa fiche
        ({heritees} fiche{heritees > 1 ? 's' : ''} concernée{heritees > 1 ? 's' : ''}). Convertis-les pour en faire de vraies fiches et nettoyer la base.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => start(async () => {
            const r = await convertirAnciensBlocs();
            setMsg(r.ok ? (r.message ?? 'Converti.') : r.error);
            router.refresh();
          })}
          className="inline-flex items-center gap-2 rounded-lg bg-[#B45B00] px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} Convertir en fiches et nettoyer
        </button>
        {msg && <span className="text-xs font-bold text-[#8A4B00]">{msg}</span>}
      </div>
      {blocs.length > 0 && (
        <ul className="mt-3 divide-y divide-[#F5C99B]/60 rounded-xl border border-[#F5C99B]/60 bg-white">
          {blocs.map((b) => (
            <li key={b.id} className="flex items-center gap-3 px-3 py-2 text-sm">
              <span className="rounded-md bg-[#FFEAD9] px-2 py-0.5 text-[10px] font-bold uppercase text-[#B45B00]">{TYPE[b.kind] ?? b.kind}</span>
              <span className="min-w-0 flex-1 truncate font-semibold text-(--color-ink)">{b.title}</span>
              <span className="hidden truncate text-[11px] text-(--color-ink-muted) sm:inline">{b.cible}</span>
              <button
                type="button"
                disabled={pending}
                onClick={() => { if (confirm(`Supprimer l’ancien bloc « ${b.title} » ?`)) start(async () => { await supprimerBloc(b.id); router.refresh(); }); }}
                className="rounded-md p-1.5 text-(--color-ink-soft) hover:bg-(--color-sand-100)"
                aria-label="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
