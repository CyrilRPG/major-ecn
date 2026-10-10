'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ClipboardList, LifeBuoy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchAvecJetonFrais } from '@/lib/auth/fresh-token';
import { VIDEO_PROGRESS_EVENT, type VideoProgressDetail } from '@/lib/emargement';
import { pageBloquee } from '@/lib/qualite/blocage';
import type { BlockingScope } from '@/lib/qualite/types';
import { QuestionnaireDistant } from './questionnaire-form';

/**
 * Garde des questionnaires (§26-§28), montée par le layout de l'espace élève.
 *
 *   - un questionnaire OBLIGATOIRE exigible, sur une page de son périmètre de
 *     blocage, s'affiche dans une fenêtre que l'on ne peut fermer qu'en
 *     répondant ou en allant vers une page toujours ouverte (assistance,
 *     profil, informations d'examen, démarches…) ;
 *   - le candidat peut signaler un problème technique : le blocage est levé
 *     temporairement (une fois), l'équipe est alertée ;
 *   - un questionnaire non bloquant est rappelé par une simple carte ;
 *   - le visionnage des replays est transmis par tranches de 10 % (le seuil
 *     déclenche le questionnaire à chaud de la séance).
 *
 * En cas d'erreur réseau, rien n'est bloqué (jamais d'écran sans issue).
 */

export type EnqueteGarde = { id: string; titre: string; blocking_scope: BlockingScope };

export function GardeEnquetes({ bloquant, enAttente, lectureSeule }: {
  bloquant: EnqueteGarde | null;
  enAttente: { id: string; titre: string } | null;
  /** Vue « en tant que » d'un administrateur : rien n'est bloqué. */
  lectureSeule?: boolean;
}) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const [repondu, setRepondu] = React.useState<string | null>(null);
  const [carteFermee, setCarteFermee] = React.useState(false);
  const [report, setReport] = React.useState<{ ouvert: boolean; motif: string; msg: string | null; leve: boolean }>({ ouvert: false, motif: '', msg: null, leve: false });

  // Visionnage des replays (tranches de 10 %, une fois par vidéo et par tranche).
  React.useEffect(() => {
    if (lectureSeule) return;
    const vues = new Map<string, number>();
    const onProgress = (e: Event) => {
      const d = (e as CustomEvent<VideoProgressDetail>).detail;
      if (!d?.videoId || !Number.isFinite(d.ratio)) return;
      const tranche = Math.floor(Math.min(1, d.ratio) * 10);
      if (tranche <= (vues.get(d.videoId) ?? 0)) return;
      vues.set(d.videoId, tranche);
      fetchAvecJetonFrais('/api/qualite/visionnage', { videoId: d.videoId, coursId: d.coursId, ratio: d.ratio, seconds: d.seconds }).catch(() => undefined);
    };
    window.addEventListener(VIDEO_PROGRESS_EVENT, onProgress);
    return () => window.removeEventListener(VIDEO_PROGRESS_EVENT, onProgress);
  }, [lectureSeule]);

  const actif = bloquant && repondu !== bloquant.id && !report.leve && !lectureSeule && pageBloquee(pathname, bloquant.blocking_scope);

  React.useEffect(() => {
    if (!actif) return;
    const ancien = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ancien; };
  }, [actif]);

  async function reporter() {
    if (!bloquant) return;
    const res = await fetchAvecJetonFrais(`/api/enquetes/${bloquant.id}`, { action: 'reporter', motif: report.motif }).catch(() => null);
    const j = res ? await res.json().catch(() => ({})) as { ok?: boolean; error?: string } : { ok: false, error: 'Connexion impossible' };
    if (j.ok) setReport((r) => ({ ...r, leve: true, msg: null }));
    else setReport((r) => ({ ...r, msg: j.error ?? 'Impossible pour le moment.' }));
  }

  if (actif && bloquant) {
    return (
      <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="garde-enquete-titre">
        <div className="w-full max-w-2xl rounded-(--radius-card) bg-(--color-surface) p-5 shadow-(--shadow-lifted) sm:p-7">
          <div className="mb-4 flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--color-primary) text-white"><ClipboardList className="h-4 w-4" /></span>
            <div>
              <h2 id="garde-enquete-titre" className="text-lg font-semibold text-(--color-ink)">{bloquant.titre}</h2>
              <p className="text-sm text-(--color-ink-soft)">Ce questionnaire est à compléter avant de poursuivre cette activité. Vos autres espaces restent accessibles.</p>
            </div>
          </div>
          <QuestionnaireDistant envoiId={bloquant.id} compact onTermine={() => setTimeout(() => { setRepondu(bloquant.id); router.refresh(); }, 1500)} />
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-(--color-border) pt-4 text-sm">
            <Link href="/accueil" className="text-(--color-ink-soft) underline-offset-4 hover:underline">Accueil</Link>
            <Link href="/agenda" className="text-(--color-ink-soft) underline-offset-4 hover:underline">Agenda et examens</Link>
            <Link href="/profil" className="text-(--color-ink-soft) underline-offset-4 hover:underline">Mon profil</Link>
            <Link href="/echanges" className="text-(--color-ink-soft) underline-offset-4 hover:underline">Contacter l&apos;équipe</Link>
            <button type="button" onClick={() => setReport((r) => ({ ...r, ouvert: !r.ouvert }))} className="ml-auto inline-flex items-center gap-1 text-(--color-ink-soft) hover:text-(--color-ink)">
              <LifeBuoy className="h-4 w-4" />Problème technique ou besoin d&apos;aménagement ?
            </button>
          </div>
          {report.ouvert && (
            <div className="mt-3 flex flex-col gap-2 rounded-(--radius-button) bg-(--color-surface-soft) p-3">
              <label className="text-sm text-(--color-ink)" htmlFor="garde-motif">Décrivez le problème : le questionnaire sera reporté temporairement et l&apos;équipe prévenue.</label>
              <textarea id="garde-motif" rows={2} value={report.motif} onChange={(e) => setReport((r) => ({ ...r, motif: e.target.value }))}
                className="w-full rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) p-2 text-sm" />
              <div className="flex items-center gap-3">
                <Button type="button" size="sm" variant="outline" onClick={reporter} disabled={report.motif.trim().length < 3}>Reporter le questionnaire</Button>
                {report.msg && <span className="text-xs text-(--color-danger)">{report.msg}</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const carte = !lectureSeule && !carteFermee && enAttente && repondu !== enAttente.id && !pathname.startsWith('/enquetes') ? enAttente : null;
  if (!carte) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[60] w-[calc(100%-2rem)] max-w-sm rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-lifted)">
      <button type="button" aria-label="Masquer" onClick={() => setCarteFermee(true)} className="absolute right-2 top-2 rounded p-1 text-(--color-ink-muted) hover:text-(--color-ink)"><X className="h-4 w-4" /></button>
      <p className="pr-6 text-sm font-semibold text-(--color-ink)">Un questionnaire vous attend</p>
      <p className="mt-0.5 line-clamp-2 text-xs text-(--color-ink-soft)">{carte.titre}</p>
      <Link href={`/enquetes/${carte.id}`} className="mt-3 inline-flex h-9 items-center rounded-(--radius-button) bg-(--color-primary) px-3 text-sm font-medium text-(--color-primary-fg)">Répondre</Link>
    </div>
  );
}
