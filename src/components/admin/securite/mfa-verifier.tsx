'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

/** Défi + vérification TOTP : la session passe au niveau AAL2, puis on repart. */
export function MfaVerifier({ factorId, next }: { factorId: string; next: string }) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const verifier = () => {
    setError(null);
    start(async () => {
      const supabase = createClient();
      const { data: ch, error: e1 } = await supabase.auth.mfa.challenge({ factorId });
      if (e1 || !ch) { setError(e1?.message ?? 'Vérification impossible.'); return; }
      const { error: e2 } = await supabase.auth.mfa.verify({ factorId, challengeId: ch.id, code: code.trim() });
      if (e2) { setError('Code refusé. Vérifiez l’heure de votre téléphone et réessayez.'); setCode(''); return; }
      // Le cookie de session est réécrit avec le niveau AAL2 : la navigation
      // serveur qui suit lit une session vérifiée.
      router.replace(next);
      router.refresh();
    });
  };

  return (
    <form
      className="mt-5 flex flex-col gap-3"
      onSubmit={(e) => { e.preventDefault(); if (code.length === 6) verifier(); }}
    >
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus
        placeholder="000000"
        aria-label="Code à six chiffres"
        className="h-12 rounded-lg border border-(--color-border) bg-white px-3 text-center font-mono text-2xl tracking-[0.4em] text-(--color-ink)"
      />
      <Button type="submit" disabled={pending || code.length !== 6}>
        {pending ? <Loader2 className="animate-spin" /> : <ShieldCheck />} Vérifier
      </Button>
      {error && <p className="text-sm font-medium text-[#A91D2C]">{error}</p>}
    </form>
  );
}
