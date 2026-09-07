'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { handleReport } from '@/app/admin/arena/actions';
import { REPORT_MOTIFS } from '@/lib/arena/texts';

export type ReportView = {
  id: string; questionId: string; roundNumber: number; questionIndex: number; enonce: string;
  pseudo: string; motif: string; comment: string; reference: string | null; status: 'open' | 'validated' | 'rejected';
  admin_response: string | null; created_at: string; countForQuestion: number; neutralized: boolean;
};

/** Signalements (§10.1) triés par nombre de signalements par question ; validation = neutralisation + recalcul + emails. */
export function ReportsPanel({ reports }: { reports: ReportView[] }) {
  const router = useRouter();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const sorted = [...reports].sort((a, b) => (a.status === 'open' ? 0 : 1) - (b.status === 'open' ? 0 : 1) || b.countForQuestion - a.countForQuestion || a.created_at.localeCompare(b.created_at));

  const act = (id: string, status: 'validated' | 'rejected') => start(async () => {
    const r = await handleReport(id, status, responses[id] ?? '');
    if (!r.ok) setError(r.error);
    router.refresh();
  });

  return (
    <div className="space-y-3">
      {error && <p className="text-sm font-semibold text-(--color-danger)">{error}</p>}
      {sorted.length === 0 && <p className="text-sm text-(--color-ink-soft)">Aucun signalement.</p>}
      {sorted.map((r) => (
        <div key={r.id} className={`rounded-(--radius-card) border p-4 ${r.status === 'open' ? 'border-amber-200 bg-amber-50/40' : 'border-(--color-border) bg-(--color-surface)'}`}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">M{r.roundNumber} · question {r.questionIndex} <span className="ml-2 rounded bg-(--color-surface-sunken) px-1.5 py-0.5 text-[11px] font-bold">{r.countForQuestion} signalement{r.countForQuestion > 1 ? 's' : ''} sur cette question</span>{r.neutralized && <span className="ml-2 text-[11px] font-bold text-amber-700">neutralisée</span>}</p>
              <p className="mt-0.5 text-xs text-(--color-ink-soft)">{r.enonce.slice(0, 140)}{r.enonce.length > 140 ? '…' : ''}</p>
            </div>
            <span className="text-xs text-(--color-ink-muted)">{r.status === 'open' ? 'À traiter' : r.status === 'validated' ? 'Validé' : 'Écarté'} · {new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }).format(new Date(r.created_at))}</span>
          </div>
          <p className="mt-2 text-sm"><span className="font-semibold">{r.pseudo}</span> · {REPORT_MOTIFS[r.motif] ?? r.motif}{r.reference ? ` · réf. ${r.reference}` : ''}</p>
          {r.comment && <p className="mt-1 text-sm text-(--color-ink-soft)" style={{ whiteSpace: 'pre-line' }}>{r.comment}</p>}
          {r.status === 'open' ? (
            <div className="mt-3 space-y-2">
              <Textarea rows={2} placeholder="Réponse au participant (facultative, envoyée par email)" value={responses[r.id] ?? ''} onChange={(e) => setResponses((s) => ({ ...s, [r.id]: e.target.value }))} />
              <div className="flex gap-2">
                <Button size="sm" variant="danger" disabled={pending} onClick={() => { if (confirm('Valider : neutralise la question, recalcule les scores et informe tous les participants de la manche. Continuer ?')) act(r.id, 'validated'); }}>Valider (neutraliser)</Button>
                <Button size="sm" variant="outline" disabled={pending} onClick={() => act(r.id, 'rejected')}>Écarter (réponse individuelle)</Button>
              </div>
            </div>
          ) : r.admin_response ? <p className="mt-2 text-xs text-(--color-ink-muted)">Réponse : {r.admin_response}</p> : null}
        </div>
      ))}
    </div>
  );
}
