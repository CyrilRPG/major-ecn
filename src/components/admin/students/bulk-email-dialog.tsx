'use client';

import { useState } from 'react';
import { Loader2, Mail, Send, X } from 'lucide-react';

export function BulkEmailDialog({
  open,
  onClose,
  studentIds,
  contextLabel,
}: {
  open: boolean;
  onClose: () => void;
  studentIds: string[];
  /** Libellé du groupe ciblé (ex. « 12 élèves · Cardiologie »). */
  contextLabel: string;
}) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<string | null>(null);

  if (!open) return null;

  async function send() {
    if (!subject.trim() || !message.trim()) {
      setResult('Sujet et message requis.'); setStatus('error'); return;
    }
    setStatus('sending'); setResult(null);
    try {
      const res = await fetch('/api/admin/bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds, subject, message }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; sent?: number; failed?: number; total?: number; error?: string };
      if (!res.ok || !j.ok) { setResult(j.error ?? 'Échec de l’envoi.'); setStatus('error'); return; }
      setResult(`${j.sent ?? 0} email(s) envoyé(s)${j.failed ? `, ${j.failed} échec(s)` : ''}.`);
      setStatus('done');
    } catch {
      setResult('Erreur réseau.'); setStatus('error');
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-16">
      <div className="relative w-full max-w-lg rounded-2xl bg-(--color-surface) p-6 shadow-2xl">
        <button onClick={onClose} aria-label="Fermer" className="absolute right-3 top-3 rounded-full p-1 hover:bg-(--color-sand-100)">
          <X className="h-5 w-5 text-(--color-ink-soft)" />
        </button>
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
            <Mail className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-black text-(--color-ink)">Message groupé</h2>
            <p className="text-xs text-(--color-ink-soft)">{contextLabel}</p>
          </div>
        </div>

        {status === 'done' ? (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            ✓ {result}
            <div className="mt-4 text-right">
              <button onClick={onClose} className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-bold text-white">Fermer</button>
            </div>
          </div>
        ) : (
          <>
            <label className="mt-4 block">
              <span className="mb-1 block text-xs font-semibold text-(--color-ink-soft)">Sujet</span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex. Rappel : session EVC à venir"
                className="w-full rounded-lg border border-(--color-border) bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-semibold text-(--color-ink-soft)">Message</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                placeholder="Votre message…"
                className="w-full rounded-lg border border-(--color-border) bg-white px-3 py-2 text-sm"
              />
            </label>
            {result && status === 'error' && (
              <p className="mt-2 text-xs font-medium text-(--color-danger)">{result}</p>
            )}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-(--color-ink-soft)">{studentIds.length} destinataire(s)</p>
              <button
                onClick={send}
                disabled={status === 'sending' || studentIds.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
              >
                {status === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {status === 'sending' ? 'Envoi…' : 'Envoyer'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
