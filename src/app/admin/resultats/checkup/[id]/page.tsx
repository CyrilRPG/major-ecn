import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, MinusCircle, XCircle } from 'lucide-react';
import { requireSuiviPage } from '@/lib/suivi/roles';
import { createAdminClient } from '@/lib/supabase/admin';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { CheckupError, getSession, resultView } from '@/lib/checkup/server/service';
import { synthesis, type Subscore } from '@/lib/checkup/results';
import { fmtPoints } from '@/lib/checkup/scoring';
import { FORMAT_LABEL, STATUS_LABEL } from '@/lib/checkup/types';
import { reponseModele } from '@/lib/qcm/grade';
import { elevesVisibles } from '@/lib/evaluations/historique';
import { formatDuree, formatHeure, formatJour } from '@/lib/evaluations/historique-core';
import { RichText } from '@/components/qcm/rich-text';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Détail d’un EVC Check-up' };

const RESULTAT = {
  correct: { label: 'Correct', Icon: CheckCircle2, cls: 'text-green-700 dark:text-green-300' },
  partial: { label: 'À consolider', Icon: MinusCircle, cls: 'text-amber-700 dark:text-amber-300' },
  incorrect: { label: 'À revoir', Icon: XCircle, cls: 'text-red-700 dark:text-red-300' },
} as const;

function Sous({ titre, lignes }: { titre: string; lignes: Subscore[] }) {
  if (lignes.length === 0) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-(--color-ink)">{titre}</h3>
      <ul className="mt-2 space-y-2">
        {lignes.map((r) => {
          const pct = r.possible > 0 ? Math.round((r.obtained / r.possible) * 100) : 0;
          return (
            <li key={r.key}>
              <div className="flex items-baseline justify-between gap-2 text-sm"><span className="min-w-0 truncate text-(--color-ink)">{r.label}</span><span className="shrink-0 tabular-nums font-semibold text-(--color-ink)">{r.display}</span></div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-(--color-border)" aria-hidden><div className={cn('h-full rounded-full', pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${pct}%` }} /></div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Détail d'un EVC Check-up pour l'équipe : la même analyse que l'élève voit
 * (score, domaines, items à revoir et à consolider) et la copie question par
 * question, réponses de l'élève comprises.
 */
export default async function AdminCheckupPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireSuiviPage('view');
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const s0 = await getSession(id);
  if (!s0) notFound();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: eleve } = await (createAdminClient() as any).from('profiles').select('id, first_name, last_name, email').eq('id', s0.user_id).eq('faculte_id', EDN_FACULTE_ID).maybeSingle();
  if (!eleve) notFound();
  const visibles = await elevesVisibles(actor);
  if (visibles && !visibles.has(s0.user_id)) notFound();
  let view;
  try { view = await resultView(s0.user_id, id); } catch (e) { if (e instanceof CheckupError) notFound(); throw e; }
  const s = view.session;
  const a = view.analysis;
  const nom = [eleve.first_name, eleve.last_name].filter(Boolean).join(' ') || eleve.email;
  const note = s.status === 'completed' || s.status === 'expired';

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href={`/admin/resultats/eleve/${s.user_id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--color-ink-soft) hover:text-(--color-ink)">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Évaluations & progression — {nom}
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-(--color-border) pb-5">
        <div>
          <p className="text-xs font-medium text-(--color-ink-muted)">EVC Check-up · {view.specialiteName}</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">{s.mode === 'global' ? 'Check-up global' : 'Check-up ciblé'} — {nom}</h1>
          <p className="mt-0.5 text-sm text-(--color-ink-soft)">
            {FORMAT_LABEL[s.format]} · commencé le {formatJour(s.started_at)} à {formatHeure(s.started_at)} · durée {formatDuree(s.duration_seconds)} · {s.question_count} questions · {STATUS_LABEL[s.status]}
          </p>
          {s.neutralized_reason && <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">Neutralisé : {s.neutralized_reason}</p>}
        </div>
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) px-5 py-3 text-right">
          <p className="text-xs text-(--color-ink-muted)">Résultat</p>
          <p className="text-3xl font-semibold tabular-nums text-(--color-ink)">{note ? `${Math.round(Number(s.score_percent ?? 0))} %` : '—'}</p>
          {note && <p className="text-xs tabular-nums text-(--color-ink-muted)">{fmtPoints(Number(s.points_obtained ?? 0))} / {s.points_possible} pts</p>}
        </div>
      </header>

      {a && (
        <>
          <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
            <p className="text-sm text-(--color-ink)"><span className="font-semibold">Synthèse montrée à l’élève :</span> {synthesis(a)}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {([['À revoir en priorité', a.aRevoir, 'text-red-700 dark:text-red-300'], ['À consolider', a.aConsolider, 'text-amber-700 dark:text-amber-300'], ['Signaux positifs', a.positifs, 'text-green-700 dark:text-green-300']] as const).map(([titre, liste, ton]) => (
                <div key={titre} className="rounded-xl border border-(--color-border) p-3">
                  <h2 className={cn('text-sm font-bold', ton)}>{titre} <span className="font-normal text-(--color-ink-muted)">({liste.length})</span></h2>
                  <ul className="mt-2 space-y-1 text-sm text-(--color-ink)">
                    {liste.slice(0, 15).map((i) => <li key={i.itemId}>{i.itemName}</li>)}
                    {liste.length > 15 && <li className="text-xs text-(--color-ink-muted)">… et {liste.length - 15} autre(s)</li>}
                    {liste.length === 0 && <li className="text-xs text-(--color-ink-muted)">Aucun item.</li>}
                  </ul>
                </div>
              ))}
            </div>
          </section>
          <section className="grid gap-6 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 md:grid-cols-2">
            <Sous titre={a.byDomain.some((d) => !d.key.startsWith('item:')) ? 'Par domaine' : 'Par item'} lignes={a.byDomain} />
            <div className="space-y-6"><Sous titre="Par dossier" lignes={a.byBlock} /><Sous titre="Par origine des questions" lignes={a.bySource} /></div>
          </section>
        </>
      )}

      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
        <h2 className="text-base font-semibold text-(--color-ink)">Copie question par question</h2>
        {view.questions.length === 0 ? <p className="mt-2 text-sm text-(--color-ink-soft)">Aucune question enregistrée pour cette évaluation.</p> : (
          <ol className="mt-3 space-y-2">
            {view.questions.map((q, k) => {
              const r = q.result ? RESULTAT[q.result] : null;
              const sel = new Set(q.answer?.selected ?? []);
              return (
                <li key={q.position}>
                  <details className="rounded-xl border border-(--color-border)">
                    <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2.5 text-sm">
                      <span className="w-8 shrink-0 font-mono text-xs text-(--color-ink-muted)">{k + 1}</span>
                      <span className="min-w-0 flex-1 truncate text-(--color-ink)">{q.snapshot.item_name ?? q.snapshot.serie_label ?? 'Question'}</span>
                      <span className="shrink-0 text-xs text-(--color-ink-muted)">{q.question_type}</span>
                      {r && <span className={cn('inline-flex shrink-0 items-center gap-1 text-xs font-semibold', r.cls)}><r.Icon className="h-3.5 w-3.5" aria-hidden /> {fmtPoints(Number(q.points ?? 0))}</span>}
                    </summary>
                    <div className="space-y-2 border-t border-(--color-border) px-3 py-3 text-sm">
                      <p className="whitespace-pre-line font-medium text-(--color-ink)"><RichText html={q.snapshot.enonce} /></p>
                      {q.question_type === 'QROC' ? (
                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="rounded-lg border border-(--color-border) p-2.5"><p className="text-[11px] font-bold uppercase text-(--color-ink-muted)">Réponse de l’élève</p><p className="mt-1 whitespace-pre-wrap text-(--color-ink)">{q.answer?.text?.trim() ? q.answer.text : '— (vide)'}</p>{q.self_grade && <p className="mt-1 text-xs text-(--color-ink-muted)">Auto-correction : {q.self_grade === 'correct' ? 'correcte' : q.self_grade === 'partial' ? 'partielle' : 'incorrecte'}</p>}</div>
                          <div className="rounded-lg border border-green-600/30 p-2.5"><p className="text-[11px] font-bold uppercase text-green-700 dark:text-green-300">Réponse attendue</p>{q.snapshot.reponse_attendue && <p className="mt-1 font-semibold text-(--color-ink)">{reponseModele(q.snapshot.reponse_attendue)}</p>}</div>
                        </div>
                      ) : (
                        <ul className="space-y-1">
                          {q.snapshot.items.map((it) => (
                            <li key={it.lettre} className={cn('flex items-start gap-2 rounded-lg border px-3 py-1.5', it.is_correct ? 'border-green-600/50' : sel.has(it.lettre) ? 'border-red-500/50' : 'border-(--color-border)')}>
                              <span className="font-mono text-xs font-bold text-(--color-ink-soft)">{it.lettre}</span>
                              <span className="flex-1 text-(--color-ink)"><RichText html={it.enonce} /></span>
                              <span className="shrink-0 text-[11px] font-semibold">{it.is_correct ? <span className="text-green-700 dark:text-green-300">Vrai</span> : <span className="text-(--color-ink-muted)">Faux</span>}{sel.has(it.lettre) ? <span className="ml-1 text-(--color-ink)">· coché</span> : ''}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </details>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </main>
  );
}
