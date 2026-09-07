'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InlineStatus } from './ui';
import { deleteCampaign, resyncMembers, setCampaignStatus } from '@/app/admin/suivi/campagnes/actions';
import type { CampaignStatus } from '@/lib/suivi/types';

export function CampaignStatusButtons({ id, status }: { id: string; status: CampaignStatus }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; error?: string; added?: number; removed?: number; total?: number }>, after?: 'list') {
    setError(null); setInfo(null);
    start(async () => {
      const r = await fn();
      if (!r.ok) { setError(r.error ?? 'Erreur'); return; }
      if (r.total !== undefined) setInfo(`Audience synchronisée : ${r.added} ajouté(s), ${r.removed} retiré(s), ${r.total} au total.`);
      if (after === 'list') router.push('/admin/suivi/campagnes'); else router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => resyncMembers(id))}>Resynchroniser l’audience</Button>
        {status === 'draft' && <Button size="sm" disabled={pending} onClick={() => run(() => setCampaignStatus(id, 'active'))}>Activer</Button>}
        {status === 'active' && <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setCampaignStatus(id, 'closed'))}>Clôturer</Button>}
        {status === 'closed' && <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setCampaignStatus(id, 'active'))}>Rouvrir</Button>}
        {status === 'draft' && (
          <Button size="sm" variant="danger" disabled={pending} onClick={() => { if (confirm('Supprimer cette campagne (brouillon) ?')) run(() => deleteCampaign(id), 'list'); }}>Supprimer</Button>
        )}
        {pending && <Loader2 className="h-4 w-4 animate-spin self-center text-(--color-ink-muted)" />}
      </div>
      <InlineStatus error={error} status={info} />
    </div>
  );
}
