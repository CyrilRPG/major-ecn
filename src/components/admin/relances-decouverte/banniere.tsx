'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BellRing, ChevronRight } from 'lucide-react';
import { useResumeRelances } from './use-resume';

/**
 * Notification du tableau de bord (cahier §8, §27) : « X candidats Offre
 * Découverte sont à relancer (R1 : a · R2 : b · R3 : c) » + anciens accès.
 * Affichée sur les pages d'atterrissage de l'administration, dès la
 * connexion ; un clic ouvre la liste filtrée sur les SEULS candidats à
 * relancer. Calcul en direct : elle disparaît d'elle-même quand plus rien
 * n'est échu.
 */
const ATTERRISSAGES = new Set(['/admin', '/admin/eleves', '/admin/suivi', '/admin/suivi/eleves']);

export function BanniereRelancesDecouverte({ visible }: { visible: boolean }) {
  const path = usePathname();
  const actif = visible && ATTERRISSAGES.has(path);
  const r = useResumeRelances(actif, path);
  if (!actif || !r || (r.aRelancer === 0 && r.anciensAcces === 0)) return null;
  const pluriel = (n: number, s: string, p: string) => (n > 1 ? p : s);
  return (
    <div className="border-b border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/30">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2">
        <BellRing className="h-5 w-5 shrink-0 text-red-700 dark:text-red-300" aria-hidden />
        <div className="min-w-0 flex-1 text-sm text-red-900 dark:text-red-100">
          {r.aRelancer > 0 && (
            <p className="font-semibold">
              {r.aRelancer} {pluriel(r.aRelancer, 'candidat Offre Découverte est à relancer', 'candidats Offre Découverte sont à relancer')}
              <span className="font-normal"> (R1 : {r.R1} · R2 : {r.R2} · R3 : {r.R3})</span>
            </p>
          )}
          {r.anciensAcces > 0 && (
            <p className={r.aRelancer > 0 ? 'mt-0.5' : 'font-semibold'}>
              {r.anciensAcces} {pluriel(r.anciensAcces, 'ancien accès jamais réactivé', 'anciens accès jamais réactivés')} (campagne de réactivation)
            </p>
          )}
          {r.pause && <p className="mt-0.5 text-xs">Envois actuellement en pause (paramètres).</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {r.aRelancer > 0 && (
            <Link href="/admin/relances-decouverte?vue=a_relancer" className="inline-flex items-center gap-1 rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800 focus-ring">
              Voir les candidats à relancer <ChevronRight className="h-4 w-4" />
            </Link>
          )}
          {r.anciensAcces > 0 && (
            <Link href="/admin/relances-decouverte?vue=anciens" className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 focus-ring dark:bg-transparent dark:text-red-200">
              Anciens accès <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
