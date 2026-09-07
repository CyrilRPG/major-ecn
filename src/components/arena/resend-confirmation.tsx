'use client';

import { useState, useTransition } from 'react';
import { resendConfirmation } from '@/app/(arena)/arena/[slug]/actions';
import { ArenaButton, ARENA, BODY } from './arena-ui';
import { FormError } from './form-ui';

export function ResendConfirmation({ slug, email }: { slug: string; email: string }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="space-y-3">
      <ArenaButton
        variant="ghost"
        disabled={pending || done}
        onClick={() => {
          setError(null);
          start(async () => {
            const r = await resendConfirmation(slug, email);
            if (r.ok) setDone(true);
            else setError(r.error);
          });
        }}
      >
        {done ? 'Email renvoyé' : pending ? 'Envoi…' : 'Renvoyer l’email de confirmation'}
      </ArenaButton>
      <FormError>{error}</FormError>
      {done && <p className="text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Vérifiez aussi vos courriers indésirables.</p>}
    </div>
  );
}
