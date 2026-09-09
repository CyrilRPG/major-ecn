'use client';

import { useEffect, useState, useTransition } from 'react';
import { resendConfirmation } from '@/app/(arena)/arena/[slug]/actions';
import { ArenaButton, ARENA, BODY } from './arena-ui';
import { FormError } from './form-ui';

export function ResendConfirmation({ slug, email }: { slug: string; email: string }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!remaining) return;
    const timer = window.setTimeout(() => setRemaining(n => Math.max(0, n - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [remaining]);
  return (
    <div className="space-y-3">
      <ArenaButton
        variant="ghost"
        disabled={pending || remaining > 0}
        onClick={() => {
          setError(null);
          start(async () => {
            try {
              const r = await resendConfirmation(slug, email);
              if (r.ok) { setDone(true); setRemaining(60); }
              else setError(r.error);
            } catch {
              setError('La demande n’a pas abouti. Vérifiez votre connexion et réessayez.');
            }
          });
        }}
      >
        {pending ? 'Demande en cours…' : remaining > 0 ? `Renvoyer un lien dans ${remaining} s` : 'Renvoyer un lien d’accès'}
      </ArenaButton>
      <FormError>{error}</FormError>
      {done && <p role="status" className="text-sm leading-relaxed" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Vérifiez votre messagerie et les indésirables. Un seul envoi est possible par minute. Vos liens précédents restent valables jusqu’à leur expiration.</p>}
    </div>
  );
}
