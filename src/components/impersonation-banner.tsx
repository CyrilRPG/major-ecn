'use client';

import { ArrowLeft, Eye, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useSyncExternalStore, useTransition } from 'react';
import { Button } from './ui/button';
import { fetchAuthentifie } from '@/lib/auth/fresh-token';

/**
 * Onglet « en tant que » détaché : cookie d'interface posé par
 * /api/impersonation/ouvrir, dont la valeur est l'échéance (epoch ms).
 * 0 = pas d'onglet détaché.
 */
function echeanceOnglet(): number {
  const c = document.cookie.split(';').map((x) => x.trim()).find((x) => x.startsWith('impersonation_onglet='));
  if (!c) return 0;
  const v = Number(c.slice('impersonation_onglet='.length));
  // Ancienne valeur « 1 » ou valeur illisible : échéance immédiate.
  return Number.isFinite(v) && v > 1 ? v : 1;
}

const abonnementVide = () => () => {};

/** Ferme la session élève de l'onglet détaché. La session admin vit dans
 *  l'onglet d'origine, intacte : on ferme celui-ci (ouvert par script, donc
 *  fermable) ; à défaut, page de connexion. */
async function fermerOnglet() {
  await fetchAuthentifie('/api/admin/stop-impersonation', { method: 'POST' });
  window.close();
  window.location.replace('/login');
}

export function ImpersonationBanner({ targetName }: { targetName?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  // Lu côté client uniquement (cookie d'interface) ; 0 au rendu serveur.
  const echeance = useSyncExternalStore(abonnementVide, echeanceOnglet, () => 0);
  const onglet = echeance > 0;

  // Durée maximale atteinte (12 h) : la session « en tant que » se ferme seule.
  useEffect(() => {
    if (!onglet) return;
    const reste = echeance - Date.now();
    const t = window.setTimeout(() => { void fermerOnglet(); }, Math.max(reste, 0));
    return () => window.clearTimeout(t);
  }, [onglet, echeance]);

  const handleReturn = () => {
    start(async () => {
      if (onglet) {
        await fermerOnglet();
        return;
      }
      await fetchAuthentifie('/api/admin/stop-impersonation', { method: 'POST' });
      router.push('/admin/eleves');
      router.refresh();
    });
  };
  return (
    <div className="sticky top-0 z-50 w-full text-white" style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent-deep))' }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 h-12 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <Eye className="h-4 w-4 shrink-0" />
          <span className="font-semibold">Vous êtes connecté en tant que</span>
          <span className="truncate">{targetName ?? 'un élève'}</span>
          {onglet && <span className="hidden rounded bg-white/15 px-1.5 py-0.5 text-[11px] font-semibold sm:inline">Onglet séparé</span>}
        </div>
        <Button variant="ghost" size="sm" onClick={handleReturn} disabled={pending} className="shrink-0 text-white hover:bg-white/15 hover:text-white">
          {pending ? <Loader2 className="animate-spin" /> : onglet ? <X /> : <ArrowLeft />}
          {onglet ? 'Fermer cette session' : 'Revenir au panel admin'}
        </Button>
      </div>
    </div>
  );
}
