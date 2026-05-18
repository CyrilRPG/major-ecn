'use client';

import { ArrowLeft, Eye, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from './ui/button';

export function ImpersonationBanner({ targetName }: { targetName?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const handleReturn = () => {
    start(async () => {
      await fetch('/api/admin/stop-impersonation', { method: 'POST' });
      router.push('/admin/eleves');
      router.refresh();
    });
  };
  return (
    <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 h-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Eye className="h-4 w-4" />
          <span className="font-semibold">Tu es connecté en tant que</span>
          <span>{targetName ?? 'un élève'}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReturn} disabled={pending} className="text-white hover:bg-white/15 hover:text-white">
          {pending ? <Loader2 className="animate-spin" /> : <ArrowLeft />}
          Revenir au panel admin
        </Button>
      </div>
    </div>
  );
}
