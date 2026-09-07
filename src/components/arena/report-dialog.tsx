'use client';

import { useState, useTransition } from 'react';
import { Flag } from 'lucide-react';
import { submitReport } from '@/app/(arena)/arena/[slug]/actions';
import { REPORT_MOTIFS } from '@/lib/arena/texts';
import { ArenaButton, ARENA, BODY } from './arena-ui';
import { Field, FormError, SelectInput, TextArea, TextInput } from './form-ui';

/** « Signaler un problème sur cette question » (§10.1) — lien discret, formulaire minimal, accusé de réception par email. */
export function ReportDialog({ slug, questionId, questionLabel, alreadyReported }: { slug: string; questionId: string; questionLabel: string; alreadyReported: boolean }) {
  const [open, setOpen] = useState(false);
  const [motif, setMotif] = useState<string>('enonce_ambigu');
  const [comment, setComment] = useState('');
  const [reference, setReference] = useState('');
  const [done, setDone] = useState(alreadyReported);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (done) return <p className="text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Signalement transmis — merci. Un accusé de réception vous a été envoyé.</p>;

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-xs font-bold underline-offset-4 hover:underline" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
        <Flag className="h-3.5 w-3.5" /> Signaler un problème sur cette question
      </button>
    );
  }

  return (
    <form
      className="mt-2 space-y-3 rounded-xl p-4"
      style={{ background: 'rgba(255,255,255,0.03)', boxShadow: `inset 0 0 0 1px ${ARENA.line}` }}
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const r = await submitReport(slug, { questionId, motif: motif as 'autre', comment, reference: reference || null });
          if (r.ok) setDone(true);
          else setError(r.error);
        });
      }}
    >
      <p className="text-sm font-bold" style={{ fontFamily: BODY }}>Signalement — {questionLabel}</p>
      <Field label="Motif" htmlFor={`rep-motif-${questionId}`}>
        <SelectInput id={`rep-motif-${questionId}`} value={motif} onChange={(e) => setMotif(e.target.value)}>
          {Object.entries(REPORT_MOTIFS).map(([k, v]) => <option key={k} value={k} style={{ color: '#111' }}>{v}</option>)}
        </SelectInput>
      </Field>
      <Field label="Précisions (facultatif)" htmlFor={`rep-c-${questionId}`}>
        <TextArea id={`rep-c-${questionId}`} maxLength={2000} value={comment} onChange={(e) => setComment(e.target.value)} className="!min-h-[90px]" />
      </Field>
      <Field label="Référence bibliographique (facultatif)" htmlFor={`rep-r-${questionId}`}>
        <TextInput id={`rep-r-${questionId}`} maxLength={300} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Recommandation, article, édition…" />
      </Field>
      <FormError>{error}</FormError>
      <div className="flex gap-2">
        <ArenaButton type="submit" className="!px-4 !py-2 !text-[13px]" disabled={pending}>{pending ? 'Envoi…' : 'Envoyer le signalement'}</ArenaButton>
        <ArenaButton type="button" variant="ghost" className="!px-4 !py-2 !text-[13px]" onClick={() => setOpen(false)}>Annuler</ArenaButton>
      </div>
    </form>
  );
}
