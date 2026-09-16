'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { regenerateAction } from '@/app/(student)/planificateur/actions';

export function RegenerateButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-col items-end gap-1">
      <Button variant="outline" size="sm" disabled={pending} onClick={() => start(async () => { setError(null); const r = await regenerateAction(); if (!r.ok) setError(r.error); else router.refresh(); })}>
        {pending ? <Loader2 className="animate-spin" /> : <RefreshCcw />} Recalculer le planning
      </Button>
      {error && <span className="text-xs text-(--color-danger)">{error}</span>}
    </span>
  );
}
