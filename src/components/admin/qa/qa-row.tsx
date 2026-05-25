'use client';

import { useState, useTransition } from 'react';
import { AlertCircle, Check, Eye, EyeOff, Loader2, MessagesSquare, Send, Trash2, Archive } from 'lucide-react';
import {
  answerQuestionAction,
  togglePublicAction,
  deleteQuestionAction,
  deleteAnswerAction,
  archiveQuestionAction,
} from '@/app/admin/qa/actions';

export type QaAnswerView = {
  id: string;
  body: string;
  created_at: string;
  professor_name: string;
};

export type QaQuestionView = {
  id: string;
  body: string;
  ai_context: string | null;
  created_at: string;
  student_pseudo: string;
  cours_titre: string | null;
  matiere_nom: string | null;
  status: 'pending' | 'answered' | 'archived';
  is_public: boolean;
  answers: QaAnswerView[];
};

export function QaRow({ q }: { q: QaQuestionView }) {
  const [pending, start] = useTransition();
  const [answer, setAnswer] = useState('');
  const [makePublic, setMakePublic] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedContext, setExpandedContext] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await answerQuestionAction({ questionId: q.id, body: answer, makePublic });
      if ('error' in res) setError(res.error);
      else setAnswer('');
    });
  };

  const onToggle = () => {
    start(async () => {
      await togglePublicAction({ questionId: q.id, isPublic: !q.is_public });
    });
  };

  const onDelete = () => {
    if (!confirm('Supprimer cette question ainsi que ses réponses ?')) return;
    start(async () => { await deleteQuestionAction(q.id); });
  };

  const onArchive = () => {
    start(async () => { await archiveQuestionAction(q.id); });
  };

  const onDeleteAnswer = (id: string) => {
    if (!confirm('Supprimer cette réponse ?')) return;
    start(async () => { await deleteAnswerAction(id); });
  };

  return (
    <article className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono font-semibold text-(--color-ink)">{q.student_pseudo}</span>
            <span className="text-(--color-ink-muted)">·</span>
            <span className="text-(--color-ink-muted)">
              {new Date(q.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
            {(q.cours_titre || q.matiere_nom) && (
              <>
                <span className="text-(--color-ink-muted)">·</span>
                <span className="rounded-full bg-(--color-primary-soft) px-2 py-0.5 text-[11px] font-semibold text-(--color-primary)">
                  {q.cours_titre ?? q.matiere_nom}
                </span>
              </>
            )}
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-(--color-ink)">{q.body}</p>
          {q.ai_context && (
            <button
              type="button"
              onClick={() => setExpandedContext((v) => !v)}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-(--color-ink-muted) hover:text-(--color-primary)"
            >
              {expandedContext ? 'Masquer' : 'Voir'} la conversation IA précédente
            </button>
          )}
          {q.ai_context && expandedContext && (
            <pre className="mt-2 max-h-60 overflow-auto whitespace-pre-wrap rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3 font-mono text-[11px] leading-relaxed text-(--color-ink-soft)">
              {q.ai_context}
            </pre>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className={
            'rounded-full px-2 py-0.5 text-[11px] font-semibold ' +
            (q.status === 'answered'
              ? 'bg-[color-mix(in_srgb,#2E8B57_12%,var(--color-surface))] text-[#1F6B43]'
              : q.status === 'archived'
              ? 'bg-(--color-surface-soft) text-(--color-ink-muted)'
              : 'bg-[color-mix(in_srgb,#F59E0B_18%,var(--color-surface))] text-[#8a4a00]')
          }>
            {q.status === 'pending' ? 'En attente' : q.status === 'answered' ? 'Répondu' : 'Archivé'}
          </span>
          <span className={
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ' +
            (q.is_public ? 'bg-(--color-primary-soft) text-(--color-primary)' : 'bg-(--color-surface-soft) text-(--color-ink-muted)')
          }>
            {q.is_public ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            {q.is_public ? 'Public' : 'Privé'}
          </span>
        </div>
      </div>

      {/* Existing answers */}
      {q.answers.length > 0 && (
        <ul className="mt-4 space-y-2">
          {q.answers.map((a) => (
            <li key={a.id} className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-(--color-primary)">
                    {a.professor_name}
                    <span className="ml-2 font-normal text-(--color-ink-muted)">
                      {new Date(a.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short' })}
                    </span>
                  </p>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-(--color-ink)">{a.body}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteAnswer(a.id)}
                  disabled={pending}
                  className="text-(--color-ink-muted) hover:text-(--color-danger)"
                  aria-label="Supprimer la réponse"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Compose answer */}
      <form onSubmit={onSubmit} className="mt-4 space-y-2">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={3}
          placeholder="Rédigez votre réponse en tant que professeur…"
          className="w-full resize-y rounded-xl border border-(--color-border) bg-(--color-surface) px-3.5 py-2.5 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-primary)"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-xs text-(--color-ink-soft)">
            <input
              type="checkbox"
              checked={makePublic}
              onChange={(e) => setMakePublic(e.target.checked)}
              className="h-4 w-4 rounded border-(--color-border) text-(--color-primary)"
            />
            <span>Publier sur le forum (réponse visible des autres étudiants)</span>
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={onToggle}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-2.5 py-1.5 text-xs font-medium text-(--color-ink-soft) hover:border-(--color-primary)/40 hover:text-(--color-ink)"
            >
              {q.is_public ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {q.is_public ? 'Dépublier' : 'Rendre public'}
            </button>
            <button
              type="button"
              onClick={onArchive}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-2.5 py-1.5 text-xs font-medium text-(--color-ink-soft) hover:border-(--color-primary)/40 hover:text-(--color-ink)"
            >
              <Archive className="h-3.5 w-3.5" />
              Archiver
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-danger)/30 bg-[color-mix(in_srgb,var(--color-danger)_6%,var(--color-surface))] px-2.5 py-1.5 text-xs font-medium text-(--color-danger) hover:bg-[color-mix(in_srgb,var(--color-danger)_12%,var(--color-surface))]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Supprimer
            </button>
            <button
              type="submit"
              disabled={pending || answer.trim().length < 4}
              className="inline-flex items-center gap-1.5 rounded-lg bg-(--color-primary) px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Répondre
            </button>
          </div>
        </div>
        {error && (
          <p className="flex items-start gap-1.5 text-xs text-(--color-danger)">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
          </p>
        )}
      </form>
    </article>
  );
}
