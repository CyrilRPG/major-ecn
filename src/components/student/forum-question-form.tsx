'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MessageCircleQuestion, Send } from 'lucide-react';
import { askQuestionAction } from '@/app/(student)/forum/actions';

type College = { id: string; nom: string; cours: { id: string; titre: string }[] };

export function ForumQuestionForm({ colleges }: { colleges: College[] }) {
  const [body, setBody] = useState('');
  const [matiereId, setMatiereId] = useState<string>('');
  const [coursId, setCoursId] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  const selectedCollege = colleges.find((c) => c.id === matiereId);
  const courses = selectedCollege?.cours ?? [];

  const submit = () => {
    setError(null);
    setSuccess(false);
    if (!body.trim() || body.trim().length < 8) {
      setError('Formule ta question en au moins 8 caractères.');
      return;
    }
    start(async () => {
      const res = await askQuestionAction({
        body: body.trim(),
        coursId: coursId || null,
      });
      if ('error' in res) {
        setError(res.error);
        return;
      }
      setSuccess(true);
      setBody('');
      setCoursId('');
      setMatiereId('');
      setOpen(false);
      router.refresh();
    });
  };

  if (!open) {
    return (
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-(--color-primary)/40 bg-(--color-primary-soft)/30 px-4 py-3 text-sm font-bold text-(--color-primary) transition-colors hover:bg-(--color-primary-soft)/50"
        >
          <MessageCircleQuestion className="h-4 w-4" />
          Poser une question
        </button>
        {success && (
          <p className="mt-2 text-center text-xs font-medium text-(--color-success)">
            Ta question a été transmise à l'équipe pédagogique.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-(--color-primary)/30 bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-bold text-(--color-ink)">
          <MessageCircleQuestion className="h-4 w-4 text-(--color-primary)" />
          Poser une question
        </p>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-(--color-ink-soft) hover:text-(--color-ink)">
          Annuler
        </button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-xs">
          <span className="mb-1 block font-bold text-(--color-ink)">Collège (facultatif)</span>
          <select
            value={matiereId}
            onChange={(e) => { setMatiereId(e.target.value); setCoursId(''); }}
            className="w-full rounded-lg border border-(--color-border) bg-white px-3 py-2 text-sm text-(--color-ink) outline-none focus:border-(--color-primary)"
          >
            <option value="">Aucun collège précis</option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </label>
        <label className="block text-xs">
          <span className="mb-1 block font-bold text-(--color-ink)">Item / cours (facultatif)</span>
          <select
            value={coursId}
            onChange={(e) => setCoursId(e.target.value)}
            disabled={!selectedCollege}
            className="w-full rounded-lg border border-(--color-border) bg-white px-3 py-2 text-sm text-(--color-ink) outline-none focus:border-(--color-primary) disabled:bg-(--color-sand-100) disabled:text-(--color-ink-muted)"
          >
            <option value="">Aucun item précis</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.titre}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-3 block text-xs">
        <span className="mb-1 block font-bold text-(--color-ink)">Ta question</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={4000}
          placeholder="Pose ta question le plus précisément possible..."
          className="w-full rounded-lg border border-(--color-border) bg-white px-3 py-2 text-sm text-(--color-ink) outline-none focus:border-(--color-primary)"
        />
        <span className="mt-1 block text-right text-[10px] text-(--color-ink-muted)">
          {body.length} / 4000
        </span>
      </label>

      {error && (
        <p className="mt-2 rounded-lg border border-(--color-danger)/30 bg-red-50 px-3 py-2 text-xs text-(--color-danger)">
          {error}
        </p>
      )}

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={pending || body.trim().length < 8}
          className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-5 py-2.5 text-sm font-bold text-white shadow-(--shadow-soft) disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Envoyer ma question
        </button>
      </div>
    </div>
  );
}
