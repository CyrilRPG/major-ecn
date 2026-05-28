import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ArrowRight, FileText, Sparkles, Timer } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { QcmSession } from '@/components/qcm/qcm-session';
import { TextAnnaleViewer } from '@/components/qcm/text-annale-viewer';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { startAnnaleAction } from './actions';

type SP = { session?: string; mode?: string };

export default async function AnnalePage({
  params,
  searchParams,
}: {
  params: Promise<{ cours: string; annee: string }>;
  searchParams: Promise<SP>;
}) {
  const { cours: coursId, annee: serieId } = await params;
  const sp = await searchParams;
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: c } = await supabase
    .from('cours')
    .select(`id, titre, matiere_id, matieres(id, nom, semestre_id, semestres(id, label, faculte_id, facultes(id, nom)))`)
    .eq('id', coursId)
    .maybeSingle();
  if (!c || !c.matieres?.semestres) notFound();
  if (!canAccessCollege(parseScope(profile.permission_scope), c.matiere_id)) redirect('/facultes');

  const { data: serie } = await supabase
    .from('qcm_series')
    .select('id, label, type, cours_id, qcm_questions(id)' + ', duration_minutes' as 'id, label, type, cours_id, qcm_questions(id)')
    .eq('id', serieId)
    .eq('cours_id', coursId)
    .eq('type', 'annale')
    .maybeSingle();
  if (!serie) notFound();
  const durationMinutes = (serie as unknown as { duration_minutes?: number | null }).duration_minutes ?? null;

  const questionCount = serie.qcm_questions?.length ?? 0;

  // Check format: QROC questions use the interactive session; text-based (no items, no QROC) use read-only viewer
  // NOTE: 'format' column added via migration, not yet in generated types — concat trick bypasses TS check
  const { data: sampleQuestion } = await supabase
    .from('qcm_questions')
    .select('id, qcm_items(id)' + ', format' as 'id, qcm_items(id)')
    .eq('serie_id', serieId)
    .limit(1)
    .maybeSingle();

  const qFormat = (sampleQuestion as unknown as { format?: string })?.format ?? 'qcm';
  const hasItems = sampleQuestion?.qcm_items && sampleQuestion.qcm_items.length > 0;
  const isTextBased = sampleQuestion && !hasItems && qFormat !== 'qroc';

  // ============ TEXT-BASED ANNALE — read-only viewer ============
  if (isTextBased) {
    const { data: questions } = await supabase
      .from('qcm_questions')
      .select('id, enonce, order_index')
      .eq('serie_id', serieId)
      .order('order_index');

    if (!questions || questions.length === 0) notFound();

    const label = serie.label;
    const isDP = /evcp|dossier|dp\b/i.test(label);

    let vignette: string | null = null;
    let displayQuestions = questions;

    if (isDP && questions.length > 1 && questions[0].order_index === 0) {
      vignette = questions[0].enonce;
      displayQuestions = questions.slice(1);
    }

    return (
      <TextAnnaleViewer
        serieLabel={label}
        vignette={vignette}
        questions={displayQuestions}
        backHref={`/cours/${coursId}/annales`}
        isDP={isDP}
      />
    );
  }

  // ============ QCM-BASED ANNALE — interactive session ============

  // RUN MODE — session in URL
  if (sp.session) {
    const { data: sessionRow } = await supabase
      .from('qcm_sessions')
      .select('id, user_id, finished_at')
      .eq('id', sp.session)
      .maybeSingle();
    if (!sessionRow || sessionRow.user_id !== user.id) notFound();
    if (sessionRow.finished_at) redirect(`/cours/${coursId}/resultats/${sp.session}`);

    const { data: questions } = await supabase
      .from('qcm_questions')
      .select('id, enonce, order_index, qcm_items(id, lettre, enonce, is_correct, justification)' + ', format, reponse_attendue' as 'id, enonce, order_index, qcm_items(id, lettre, enonce, is_correct, justification)')
      .eq('serie_id', serieId)
      .order('order_index');
    if (!questions || questions.length === 0) notFound();

    const enrichedQuestions = questions.map((q) => ({
      id: q.id,
      enonce: q.enonce,
      order_index: q.order_index,
      format: (q as unknown as { format: string }).format as 'qcm' | 'qroc',
      reponse_attendue: (q as unknown as { reponse_attendue: string | null }).reponse_attendue,
      items: (q.qcm_items ?? [])
        .map((it) => ({ id: it.id, lettre: it.lettre, enonce: it.enonce, justification: it.justification, is_correct: it.is_correct }))
        .sort((a, b) => a.lettre.localeCompare(b.lettre)),
    }));

    const mode = sp.mode === 'training' ? 'training' : 'live';

    return (
      <QcmSession
        sessionId={sp.session}
        coursId={coursId}
        serieLabel={`Annale ${serie.label}`}
        serieKind="annale"
        mode={mode}
        durationMinutes={mode === 'training' ? durationMinutes : null}
        questions={enrichedQuestions}
        backHref={`/cours/${coursId}/annales`}
      />
    );
  }

  // ============ LAUNCH SCREEN (QCM-based only) ============
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 lg:px-8 lg:py-12">
      <Link
        href={`/cours/${coursId}/annales`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-(--color-ink-soft) hover:text-(--color-ink)"
      >
        <ArrowLeft className="h-4 w-4" />
        Toutes les annales
      </Link>

      <div className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft)">
        <div className="border-b border-(--color-border) bg-(--color-surface-soft) px-6 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-(--color-primary)">Annale</p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-(--color-ink)">
            {serie.label}
          </h1>
          <p className="mt-1.5 inline-flex items-center gap-3 text-sm text-(--color-ink-soft)">
            <span className="inline-flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              {questionCount} questions · format concours
            </span>
            {durationMinutes && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-(--color-primary-soft) px-2.5 py-0.5 text-xs font-semibold text-(--color-primary)">
                <Timer className="h-3.5 w-3.5" />
                {durationMinutes} min en mode conditions réelles
              </span>
            )}
          </p>
        </div>

        <form action={startAnnaleAction} className="px-6 py-6">
          <input type="hidden" name="coursId" value={coursId} />
          <input type="hidden" name="serieId" value={serieId} />

          <fieldset>
            <legend className="text-sm font-semibold text-(--color-ink)">Mode de l'épreuve</legend>
            <p className="mt-1 text-sm text-(--color-ink-soft)">
              Choisissez si vous souhaitez les corrections immédiates ou les conditions d'examen.
            </p>

            <label className="mt-4 flex cursor-pointer items-start gap-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4 transition-colors hover:border-(--color-primary)/40 has-[:checked]:border-(--color-primary) has-[:checked]:bg-(--color-primary-soft)">
              <input
                type="checkbox"
                name="training"
                defaultChecked
                className="peer mt-1 sr-only"
              />
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-(--color-border-strong) bg-(--color-surface) peer-checked:border-(--color-primary) peer-checked:bg-(--color-primary)">
                <svg viewBox="0 0 16 16" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8.5l3.5 3.5L13 4.5" />
                </svg>
              </span>
              <span className="flex-1">
                <span className="flex items-center gap-2 text-sm font-semibold text-(--color-ink)">
                  <Timer className="h-4 w-4 text-(--color-primary)" />
                  Entraînement en conditions réelles
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-(--color-ink-soft)">
                  Aucune correction pendant l'épreuve. Vous obtenez votre note à la fin, puis vous
                  pouvez revoir le corrigé (toutes les questions ou uniquement vos erreurs).
                </span>
              </span>
            </label>

            <div className="mt-2.5 flex items-start gap-2 px-4 text-xs text-(--color-ink-muted)">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Décochez pour un entraînement libre avec correction immédiate à chaque question.
              </span>
            </div>
          </fieldset>

          <button
            type="submit"
            className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-6 py-3.5 text-base font-semibold text-white shadow-(--shadow-soft) transition-transform hover:scale-[1.01]"
          >
            Commencer l'annale
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
