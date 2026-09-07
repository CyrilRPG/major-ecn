import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Check, Download, X } from 'lucide-react';
import { ArenaPage, Notice, Panel } from '@/components/arena/arena-shell';
import { ARENA, BODY, Container, DISPLAY, Eyebrow, TABULAR } from '@/components/arena/arena-ui';
import { ReportDialog } from '@/components/arena/report-dialog';
import { ZoomableImage } from '@/components/qcm/image-zoom';
import { effectiveBareme, getAttempt, getPreviewAttempt, listAnswers, listReportsForParticipant } from '@/lib/arena/db';
import { gradeOne } from '@/lib/arena/grading';
import { arenaMetadata, loadArenaPage } from '@/lib/arena/page-context';
import { correctionsPdfSignedUrl } from '@/lib/arena/pdf-url';
import { COMMERCIAL_AFTER_M3 } from '@/lib/arena/texts';
import { roundState } from '@/lib/arena/time';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string; n: string }>; searchParams: Promise<{ preview?: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug, n } = await params;
  const ctx = await loadArenaPage(slug);
  return arenaMetadata(ctx.snap, { title: `Corrections de la manche ${n}`, noindex: true });
}

const fr = (v: number) => v.toLocaleString('fr-FR', { maximumFractionDigits: 2 });

/**
 * Corrections (§12) : réponses attendues, explication, pièges, erreurs les
 * plus fréquentes (qualitatif, sans effectif), encadré méthodo, références.
 * Accessibles après clôture, même sans avoir joué. Signalement possible sur
 * chaque question (§10.1). Ton commercial uniquement après la dernière manche.
 */
export default async function CorrectionsPage({ params, searchParams }: Params) {
  const { slug, n } = await params;
  const { preview: previewParam } = await searchParams;
  const number = Number(n);
  if (!Number.isInteger(number)) notFound();
  const wantPreview = previewParam === '1';
  const ctx = await loadArenaPage(slug, { preview: wantPreview });
  const preview = wantPreview && Boolean(ctx.staff);
  if (!preview && !ctx.participant) redirect('/arena/connexion');
  const t = ctx.snap.tournament;
  const round = ctx.snap.rounds.find((r) => r.number === number);
  if (!round) notFound();
  const base = `/arena/${slug}`;
  const nav = ctx.nav;

  const closed = roundState(round) === 'closed';
  if (!preview && (!closed || !round.results_published_at)) {
    return (
      <ArenaPage nav={nav}>
        <Container className="max-w-3xl py-12"><Notice>Les corrections de la manche {number} sont publiées après sa clôture.</Notice></Container>
      </ArenaPage>
    );
  }

  const questions = ctx.snap.questionsByRound.get(round.id) ?? [];
  const bareme = effectiveBareme(t, round);
  const attempt = preview ? await getPreviewAttempt(round.id, ctx.staff!.id) : await getAttempt(round.id, ctx.participant!.id);
  const answers = attempt ? await listAnswers(attempt.id) : [];
  const reports = ctx.participant ? await listReportsForParticipant(ctx.participant.id) : [];
  const isLast = number === Math.max(...ctx.snap.rounds.map((r) => r.number));
  const pdfUrl = round.corrections_pdf_path ? await correctionsPdfSignedUrl(round.corrections_pdf_path, 3600) : null;

  return (
    <ArenaPage nav={nav}>
      <Container className="max-w-3xl py-10 sm:py-14">
        <Eyebrow>Corrections · manche {number}{round.theme ? ` · ${round.theme}` : ''}</Eyebrow>
        <h1 className="mt-4 text-3xl font-extrabold sm:text-5xl" style={{ fontFamily: DISPLAY, letterSpacing: '-0.04em' }}>Les corrections détaillées.</h1>
        {round.corrections_intro && <p className="mt-4 text-[15px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY, whiteSpace: 'pre-line' }}>{round.corrections_intro}</p>}
        {pdfUrl && (
          <a href={pdfUrl} className="mt-5 inline-flex items-center gap-2 text-sm font-bold underline-offset-4 hover:underline" style={{ color: ARENA.redSoft, fontFamily: BODY }}>
            <Download className="h-4 w-4" /> Télécharger le PDF des corrections
          </a>
        )}

        {round.corrections_methodo && (
          <Panel className="mt-8" accent>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ARENA.redSoft, fontFamily: BODY }}>Méthode · {round.theme || `manche ${number}`}</p>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ fontFamily: BODY, whiteSpace: 'pre-line' }}>{round.corrections_methodo}</p>
          </Panel>
        )}
        {round.corrections_errors && (
          <Panel className="mt-4">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Erreurs les plus fréquentes sur la manche</p>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY, whiteSpace: 'pre-line' }}>{round.corrections_errors}</p>
          </Panel>
        )}

        <ol className="mt-10 space-y-6">
          {questions.map((q, i) => {
            const mine = answers.find((a) => a.question_id === q.id);
            const graded = mine ? gradeOne(q, mine.selected, bareme) : null;
            const sel = new Set(mine?.selected ?? []);
            const expected = q.items.filter((it) => it.is_correct).map((it) => it.lettre).join(' + ') || '—';
            return (
              <li key={q.id} className="rounded-[1.25rem] p-5 sm:p-7" style={{ background: ARENA.surface, boxShadow: `inset 0 0 0 1px ${ARENA.line}` }}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.16em]" style={{ color: ARENA.redSoft, fontFamily: BODY }}>
                    Question {i + 1} · {q.type}{q.type === 'QRP' ? ` · n = ${q.expected_count ?? q.items.filter((it) => it.is_correct).length}` : ''}{q.weight !== 1 ? ` · coefficient ${q.weight}` : ''}
                  </p>
                  {q.neutralized_at ? (
                    <span className="rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em]" style={{ background: 'rgba(245,179,43,0.14)', color: ARENA.preview, fontFamily: BODY }}>Neutralisée</span>
                  ) : graded ? (
                    <span className="text-lg" style={{ ...TABULAR, color: graded.is_perfect ? ARENA.text : ARENA.textSoft }}>{fr(graded.score)} / {fr(graded.max)}</span>
                  ) : (
                    <span className="text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Non jouée</span>
                  )}
                </div>
                {q.neutralized_at && <p className="mt-2 text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Retirée du barème{q.neutralized_reason ? ` : ${q.neutralized_reason}` : ''}. Les scores ont été recalculés.</p>}
                {q.vignette && <p className="mt-3 rounded-xl px-4 py-3 text-[14px] leading-relaxed" style={{ background: 'rgba(255,255,255,0.04)', color: ARENA.textSoft, fontFamily: BODY, whiteSpace: 'pre-line' }}>{q.vignette}</p>}
                <p className="mt-3 text-[16px] font-bold leading-snug" style={{ fontFamily: DISPLAY, whiteSpace: 'pre-line' }}>{q.enonce}</p>
                {q.images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {q.images.map((src) => <span key={src} className="relative block h-40 w-40 overflow-hidden rounded-xl bg-white"><ZoomableImage src={src} sizes="160px" /></span>)}
                  </div>
                )}

                <ul className="mt-4 space-y-2">
                  {q.items.map((it) => {
                    const picked = sel.has(it.lettre);
                    const good = it.is_correct;
                    const tone = good ? 'rgba(34,197,94,0.10)' : picked ? 'rgba(228,0,43,0.10)' : 'transparent';
                    const border = good ? 'rgba(34,197,94,0.45)' : picked ? 'rgba(228,0,43,0.45)' : ARENA.line;
                    return (
                      <li key={it.lettre} className="rounded-xl px-4 py-3" style={{ background: tone, boxShadow: `inset 0 0 0 1px ${border}` }}>
                        <div className="flex items-start gap-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-extrabold" style={{ background: good ? 'rgba(34,197,94,0.25)' : picked ? ARENA.red : 'rgba(255,255,255,0.06)', color: '#fff', fontFamily: DISPLAY }}>
                            {good ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : picked ? <X className="h-3.5 w-3.5" strokeWidth={3} /> : it.lettre}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[14px]" style={{ fontFamily: BODY, color: ARENA.text }}>
                              <span className="mr-1.5 font-extrabold" style={{ fontFamily: DISPLAY }}>{it.lettre}.</span>{it.enonce}
                              {it.indispensable && <span className="ml-2 text-[10px] font-extrabold uppercase tracking-[0.1em]" style={{ color: ARENA.redSoft }}>indispensable</span>}
                              {it.inacceptable && <span className="ml-2 text-[10px] font-extrabold uppercase tracking-[0.1em]" style={{ color: ARENA.redSoft }}>inacceptable</span>}
                              {mine && <span className="ml-2 text-[10px] uppercase tracking-[0.1em]" style={{ color: ARENA.textMuted }}>{picked ? 'cochée' : 'non cochée'}</span>}
                            </p>
                            {it.justification && <p className="mt-1 text-[13px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{it.justification}</p>}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-4 space-y-3 text-[14px] leading-relaxed" style={{ fontFamily: BODY }}>
                  <p><span className="font-extrabold" style={{ fontFamily: DISPLAY }}>Réponse attendue : {expected}.</span>{graded?.rule_triggered && <span className="ml-2 text-xs" style={{ color: ARENA.redSoft }}>Règle {graded.rule_triggered} déclenchée : question à 0.</span>}</p>
                  {q.explanation && <p style={{ color: ARENA.textSoft, whiteSpace: 'pre-line' }}>{q.explanation}</p>}
                  {q.pieges && <p><span className="font-bold">Pièges de l’énoncé — </span><span style={{ color: ARENA.textSoft, whiteSpace: 'pre-line' }}>{q.pieges}</span></p>}
                  {q.erreurs_frequentes && <p><span className="font-bold">Erreurs les plus fréquentes — </span><span style={{ color: ARENA.textSoft, whiteSpace: 'pre-line' }}>{q.erreurs_frequentes}</span></p>}
                  {q.references_text && <p className="text-xs" style={{ color: ARENA.textMuted, whiteSpace: 'pre-line' }}>Références : {q.references_text}</p>}
                </div>
                {ctx.participant && !q.neutralized_at && (
                  <div className="mt-4">
                    <ReportDialog slug={slug} questionId={q.id} questionLabel={`question ${i + 1}`} alreadyReported={reports.some((r) => r.question_id === q.id)} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {round.corrections_references && (
          <Panel className="mt-8">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Références et recommandations mobilisées</p>
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY, whiteSpace: 'pre-line' }}>{round.corrections_references}</p>
          </Panel>
        )}

        {isLast && !preview && (
          <p className="mt-10 text-sm" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
            {COMMERCIAL_AFTER_M3} <Link href="/" className="font-bold underline-offset-4 hover:underline" style={{ color: ARENA.redSoft }}>major-ecn.fr</Link>
          </p>
        )}
        <p className="mt-8"><Link href={`${base}/espace`} className="text-sm font-bold underline-offset-4 hover:underline" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Retour à mon espace</Link></p>
      </Container>
    </ArenaPage>
  );
}
