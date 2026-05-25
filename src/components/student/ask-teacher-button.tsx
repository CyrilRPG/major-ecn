'use client';

import { useState, useTransition } from 'react';
import { AlertCircle, CheckCircle2, GraduationCap, Loader2, Send, X } from 'lucide-react';
import { askQuestionAction } from '@/app/(student)/forum/actions';

export function AskTeacherButton({
  coursId,
  aiContext,
}: {
  coursId?: string | null;
  /** Conversation IA précédente (texte multiligne) — sera transférée au prof. */
  aiContext?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await askQuestionAction({
        body,
        coursId: coursId ?? null,
        aiContext: aiContext ?? null,
      });
      if ('error' in res) setError(res.error);
      else {
        setDone(true);
        setBody('');
        setTimeout(() => { setOpen(false); setDone(false); }, 2200);
      }
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-primary)/30 bg-(--color-primary-soft) px-3 py-1.5 text-xs font-semibold text-(--color-primary) transition-colors hover:bg-(--color-primary) hover:text-white"
      >
        <GraduationCap className="h-3.5 w-3.5" />
        Appeler un professeur
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-xl border border-(--color-primary)/25 bg-(--color-primary-soft)/40 p-3.5">
      {done ? (
        <p className="flex items-center gap-2 text-sm font-semibold text-[#1F6B43]">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Question envoyée au prof. Vous serez notifié·e dès qu’il répond.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-(--color-primary)">
              <GraduationCap className="h-3.5 w-3.5" />
              Poser ma question à un professeur
            </p>
            <button
              type="button"
              onClick={() => { setOpen(false); setError(null); }}
              aria-label="Annuler"
              className="text-(--color-ink-muted) hover:text-(--color-ink)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[11px] text-(--color-ink-soft)">
            La conversation avec l’IA est automatiquement jointe pour donner du contexte au prof.
          </p>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Décrivez précisément ce que vous voulez comprendre…"
            className="w-full resize-y rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-ink) outline-none focus:border-(--color-primary)"
          />
          {error && (
            <p className="flex items-start gap-1.5 text-[11px] text-(--color-danger)">
              <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" /> {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending || body.trim().length < 8}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-(--color-primary) px-3 py-2 text-xs font-bold text-white transition-transform hover:scale-[1.01] disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Envoyer au prof
          </button>
        </form>
      )}
    </div>
  );
}
