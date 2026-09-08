'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw } from 'lucide-react';
import { restartPreview, startAttempt } from '@/app/(arena)/arena/[slug]/actions';
import { ArenaButton } from './arena-ui';
import { FormError } from './form-ui';

export function StartRoundButton({ slug, roundNumber, label, preview }: { slug: string; roundNumber: number; label: string; preview: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="space-y-3">
      <FormError>{error}</FormError>
      <ArenaButton
        size="lg"
        disabled={pending}
        className="w-full"
        onClick={() => {
          setError(null);
          start(async () => {
            const r = await startAttempt(slug, roundNumber, preview);
            if (!r.ok) { setError(r.error); return; }
            // Rechargement complet : garantit l'écran de passation immédiatement (router.refresh()
            // pouvait laisser l'écran d'accueil affiché plusieurs secondes en recette).
            window.location.assign(window.location.pathname + window.location.search);
          });
        }}
      >
        {pending ? 'Démarrage…' : label}
      </ArenaButton>
    </div>
  );
}

export function RestartPreviewButton({ slug, roundNumber }: { slug: string; roundNumber: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <ArenaButton variant="ghost" disabled={pending} onClick={() => start(async () => { await restartPreview(slug, roundNumber); router.refresh(); })}>
      <RotateCcw className="h-4 w-4" /> Rejouer la prévisualisation
    </ArenaButton>
  );
}
