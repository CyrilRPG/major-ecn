'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sendSequenceEmailNow } from '@/app/admin/arena/actions';
import { SEQUENCE_KINDS, SEQUENCE_LABEL, type EmailSequence, type SequenceKind } from '@/lib/arena/types';

export type EmailLogView = { id: string; kind: string; subject: string | null; to: string; sent_at: string; ok: boolean; error: string | null; roundNumber: number | null };

const fmt = (iso: string) => new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }).format(new Date(iso));

/** Emails (§11, §15.4) : déclenchement manuel de chaque étape par manche, journal des envois. */
export function EmailsPanel({ tournamentId, sequence, rounds, log }: { tournamentId: string; sequence: EmailSequence; rounds: { number: number; theme: string }[]; log: EmailLogView[] }) {
  const router = useRouter();
  const [kind, setKind] = useState<SequenceKind>('j1');
  const [round, setRound] = useState<number>(rounds[0]?.number ?? 1);
  const [result, setResult] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-6">
      <section className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)">
        <h3 className="text-base font-bold text-(--color-ink)">Déclencher manuellement une étape</h3>
        <p className="mt-1 text-xs text-(--color-ink-soft)">Respecte le dédoublonnage : un participant déjà servi pour cette étape et cette manche ne reçoit rien. Les étapes désactivées dans la séquence automatique restent déclenchables ici.</p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-sm">Étape<br />
            <select value={kind} onChange={(e) => setKind(e.target.value as SequenceKind)} className="mt-1 h-10 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-3 text-sm">
              {SEQUENCE_KINDS.map((k) => <option key={k} value={k}>{SEQUENCE_LABEL[k]}{sequence[k].enabled ? '' : ' (auto désactivé)'}</option>)}
            </select>
          </label>
          <label className="text-sm">Manche<br />
            <select value={round} onChange={(e) => setRound(Number(e.target.value))} className="mt-1 h-10 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-3 text-sm" disabled={kind === 'validated'}>
              {rounds.map((r) => <option key={r.number} value={r.number}>M{r.number}{r.theme ? ` · ${r.theme}` : ''}</option>)}
            </select>
          </label>
          <Button disabled={pending} onClick={() => { if (!confirm('Envoyer maintenant à tous les participants éligibles ?')) return; setResult(null); start(async () => { const r = await sendSequenceEmailNow(tournamentId, kind, kind === 'validated' ? null : round); setResult(r.ok ? `${r.sent} envoyé(s), ${r.skipped} ignoré(s) (déjà servis ou non concernés), ${r.errors} erreur(s).` : r.error); router.refresh(); }); }}>
            <Send className="mr-1 h-4 w-4" /> {pending ? 'Envoi…' : 'Envoyer maintenant'}
          </Button>
        </div>
        {result && <p className="mt-3 text-sm font-semibold">{result}</p>}
      </section>

      <section className="overflow-x-auto rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft)">
        <table className="w-full text-sm">
          <thead className="bg-(--color-surface-soft) text-left text-xs uppercase tracking-wide text-(--color-ink-muted)">
            <tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Manche</th><th className="px-3 py-2">Destinataire</th><th className="px-3 py-2">Sujet</th><th className="px-3 py-2">État</th></tr>
          </thead>
          <tbody>
            {log.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center text-(--color-ink-soft)">Aucun email envoyé.</td></tr>}
            {log.map((e) => (
              <tr key={e.id} className="border-t border-(--color-border)">
                <td className="px-3 py-2 whitespace-nowrap text-xs">{fmt(e.sent_at)}</td>
                <td className="px-3 py-2 text-xs font-semibold">{e.kind}</td>
                <td className="px-3 py-2 text-xs">{e.roundNumber ? `M${e.roundNumber}` : '—'}</td>
                <td className="px-3 py-2 text-xs">{e.to}</td>
                <td className="px-3 py-2 text-xs">{e.subject}</td>
                <td className="px-3 py-2 text-xs">{e.ok ? <span className="text-emerald-700">envoyé</span> : <span className="text-(--color-danger)" title={e.error ?? ''}>échec</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
