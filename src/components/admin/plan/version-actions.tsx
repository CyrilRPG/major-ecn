'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InlineStatus } from '@/components/admin/suivi/ui';
import { activateMatrixVersionAction, cancelMatrixVersionAction } from '@/app/admin/planificateur/actions';

/** Version programmée : l'activer avant sa date, ou l'annuler (jamais une version déjà appliquée). */
export function VersionActions({ id, code }: { id: string; code: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  return (
    <span className="inline-flex items-center gap-2">
      <InlineStatus error={error} status={status} />
      <Button size="sm" variant="outline" disabled={pending} onClick={() => {
        if (!confirm(`Activer ${code} dès maintenant ? Le planning futur des élèves de la spécialité sera recalculé ; leur travail déjà réalisé reste intact.`)) return;
        start(async () => {
          setError(null);
          const r = await activateMatrixVersionAction(id);
          if (!r.ok) { setError(r.error); return; }
          setStatus(`Activée — ${r.regenerated} planning(s) recalculé(s)${r.remaining > 0 ? `, ${r.remaining} à leur prochaine visite` : ''}.`);
          router.refresh();
        });
      }}>{pending ? <Loader2 className="animate-spin" /> : null} Activer maintenant</Button>
      <Button size="sm" variant="ghost" disabled={pending} onClick={() => {
        if (!confirm(`Annuler la version programmée ${code} ?`)) return;
        start(async () => {
          setError(null);
          const r = await cancelMatrixVersionAction(id);
          if (!r.ok) { setError(r.error); return; }
          router.refresh();
        });
      }}>Annuler</Button>
    </span>
  );
}
