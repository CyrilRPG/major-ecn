'use client';

import { Fragment, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Archive, ArrowDownRight, ArrowRight, ArrowUpRight, ChevronDown, Minus } from 'lucide-react';
import { CourbeProgression } from './courbe-progression';
import {
  ARCHIVE_LABEL, STATUT_LABEL, TYPE_COULEUR, TYPE_COURT, TYPES_ORDRE, evolutions, formatDuree, formatEvolution, formatHeure,
  formatJour, formatNote, formatPourcentage, lienDetail, noteVisible, pointsCourbe, precisionEtat,
  type EvalType, type Evaluation,
} from '@/lib/evaluations/historique-core';
import { cn } from '@/lib/utils';

const PAGE = 40;
const display = 'font-(family-name:--font-jakarta)';

const STATUT_TON: Record<Evaluation['statut'], string> = {
  termine: 'bg-green-50 text-green-800 ring-green-200 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-900/50',
  commence: 'bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:ring-sky-900/50',
  non_termine: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-white/5 dark:text-(--color-ink-soft) dark:ring-white/10',
};

function Nature({ type }: { type: EvalType }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-(--color-surface-soft) px-2 py-0.5 text-[11px] font-semibold text-(--color-ink-soft) ring-1 ring-inset ring-(--color-border)">
      <span className="h-2 w-2 rounded-full" style={{ background: TYPE_COULEUR[type] }} aria-hidden />
      {TYPE_COURT[type]}
    </span>
  );
}

function Evolution({ d }: { d: number | null | undefined }) {
  if (d === null || d === undefined) return <span className="text-(--color-ink-muted)">—</span>;
  const Icon = d > 0 ? ArrowUpRight : d < 0 ? ArrowDownRight : Minus;
  return (
    <span className={cn('inline-flex items-center gap-0.5 font-semibold tabular-nums', d > 0 ? 'text-green-700 dark:text-green-300' : d < 0 ? 'text-red-700 dark:text-red-300' : 'text-(--color-ink-soft)')}>
      <Icon className="h-3.5 w-3.5" aria-hidden /> {formatEvolution(d)}
    </span>
  );
}

function Resultat({ e, pourEleve }: { e: Evaluation; pourEleve: boolean }) {
  if (pourEleve && !e.resultatsVisibles && e.statut === 'termine') return <span className="text-xs text-(--color-ink-muted)">Résultats non encore publiés</span>;
  if (!noteVisible(e, pourEleve)) {
    const p = e.statut === 'termine' ? precisionEtat(e) : null;
    return <span className="text-xs text-(--color-ink-muted)">{p ?? '—'}</span>;
  }
  const pct = e.pourcentage!;
  return (
    <span className="block">
      <span className={cn(display, 'text-[15px] font-extrabold tabular-nums', pct >= 70 ? 'text-green-700 dark:text-green-300' : pct >= 50 ? 'text-amber-700 dark:text-amber-300' : 'text-[#B3122E] dark:text-red-300')}>{formatPourcentage(pct)}</span>
      <span className="block text-[11px] tabular-nums text-(--color-ink-muted)">{formatNote(e)}</span>
    </span>
  );
}

type Barre = { cle: string; label: string; pct: number; valeur: string };

/** Détail par thématique (domaine, item ou spécialité) disponible dans la ligne. */
function barres(e: Evaluation, matieres: Record<string, string>): { titre: string; lignes: Barre[] } | null {
  const d = e.detail;
  if (Array.isArray(d.domaines) && d.domaines.length > 0) {
    const lignes = (d.domaines as { key: string; label: string; display?: string; obtained: number; possible: number }[])
      .map((x) => ({ cle: x.key, label: x.label, pct: x.possible > 0 ? Math.round((x.obtained / x.possible) * 100) : 0, valeur: x.display ?? `${x.obtained} / ${x.possible}` }));
    return { titre: lignes.some((l) => !l.cle.startsWith('item:')) ? 'Par domaine' : 'Par item', lignes };
  }
  if (d.specialites && typeof d.specialites === 'object') {
    const lignes = Object.entries(d.specialites as Record<string, { pct?: number; correct?: number; total?: number; points?: number; maxPoints?: number }>)
      .map(([k, v]) => ({ cle: k, label: matieres[k] ?? (k === 'Autres' ? 'Autres' : k), pct: Math.round(Number(v.pct ?? 0)), valeur: v.maxPoints ? `${v.points ?? 0} / ${v.maxPoints} pts` : `${v.correct ?? 0} / ${v.total ?? 0}` }));
    return lignes.length > 0 ? { titre: 'Par spécialité', lignes } : null;
  }
  if (d.specialites_ratio && typeof d.specialites_ratio === 'object') {
    const lignes = Object.entries(d.specialites_ratio as Record<string, number>)
      .map(([k, v]) => ({ cle: k, label: matieres[k] ?? k, pct: Math.round(Number(v) * 100), valeur: `${Math.round(Number(v) * 100)} %` }));
    return lignes.length > 0 ? { titre: 'Par spécialité', lignes } : null;
  }
  return null;
}

function Detail({ e, mode, matieres, extra }: { e: Evaluation; mode: 'eleve' | 'admin'; matieres: Record<string, string>; extra?: ReactNode }) {
  const b = mode === 'eleve' && !e.resultatsVisibles ? null : barres(e, matieres);
  const lien = lienDetail(e, mode);
  return (
    <div className="space-y-4 rounded-xl bg-(--color-surface-soft) p-4 text-sm">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">Début</dt><dd className="mt-0.5 text-(--color-ink)">{e.debut ? `${formatJour(e.debut)} · ${formatHeure(e.debut)}` : '—'}</dd></div>
        <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">Fin</dt><dd className="mt-0.5 text-(--color-ink)">{e.fin ? `${formatJour(e.fin)} · ${formatHeure(e.fin)}` : '—'}</dd></div>
        <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">Durée</dt><dd className="mt-0.5 text-(--color-ink)">{formatDuree(e.dureeSecondes)}</dd></div>
        <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">{e.source === 'epreuve' ? 'Réponses enregistrées' : 'Questions'}</dt><dd className="mt-0.5 text-(--color-ink)">{e.nbQuestions ?? '—'}</dd></div>
      </dl>

      {e.archive && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/10 dark:text-amber-200">
          <Archive className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            {e.archiveRaison ? ARCHIVE_LABEL[e.archiveRaison] : 'Tentative archivée'}
            {e.archiveLe ? ` le ${formatJour(e.archiveLe)} à ${formatHeure(e.archiveLe)}` : ''}
            {mode === 'admin' && e.archiveAuteur ? ` par ${e.archiveAuteur}` : ''}
            {e.archiveMotif ? ` — ${e.archiveMotif}` : ''}. Elle reste comptée dans l’historique.
          </span>
        </p>
      )}

      {b && (
        <div>
          <h4 className="text-[13px] font-bold text-(--color-ink)">{b.titre}</h4>
          <ul className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {b.lignes.slice(0, 24).map((l) => (
              <li key={l.cle}>
                <div className="flex items-baseline justify-between gap-2 text-[13px]">
                  <span className="min-w-0 truncate text-(--color-ink)">{l.label}</span>
                  <span className="shrink-0 tabular-nums font-semibold text-(--color-ink)">{l.valeur}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-(--color-border)" aria-hidden>
                  <div className={cn('h-full rounded-full', l.pct >= 70 ? 'bg-green-500' : l.pct >= 50 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${Math.max(0, Math.min(100, l.pct))}%` }} />
                </div>
              </li>
            ))}
          </ul>
          {b.lignes.length > 24 && <p className="mt-2 text-xs text-(--color-ink-muted)">… et {b.lignes.length - 24} autre(s).</p>}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {lien && (
          <Link href={lien} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-3.5 text-[13px] font-bold text-white shadow-[0_10px_24px_-14px_rgba(228,0,43,0.9)] transition-transform hover:scale-[1.02] focus-ring">
            {mode === 'admin' ? 'Ouvrir le détail' : e.statut === 'commence' ? 'Reprendre' : 'Voir la correction'} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
        {extra}
      </div>
    </div>
  );
}

/**
 * Évaluations & progression : filtres par nature, courbe, puis tableau
 * chronologique (une ligne par tentative, archivées comprises) avec
 * l'évolution par rapport à l'évaluation précédente de même nature et le
 * détail de chacune. `mode="eleve"` : les lignes arrivent déjà expurgées de
 * ce qui n'est pas publié (cf. `pourEleve`).
 */
export function HistoriqueEvaluations({
  evaluations, mode, matieres = {}, actions, entete,
}: {
  evaluations: Evaluation[];
  mode: 'eleve' | 'admin';
  /** Spécialités : identifiant → nom (détail par spécialité). */
  matieres?: Record<string, string>;
  /** Administration : actions d'une ligne (corriger…). */
  actions?: (e: Evaluation) => ReactNode;
  /** Contenu ajouté au-dessus du tableau (exports, qui reprennent les filtres de l’écran). */
  entete?: (filtres: { types: EvalType[]; entrainement: boolean }) => ReactNode;
}) {
  const pourEleve = mode === 'eleve';
  const presents = useMemo(() => TYPES_ORDRE.filter((t) => evaluations.some((e) => e.type === t)), [evaluations]);
  const [types, setTypes] = useState<EvalType[]>([]);
  const [entrainement, setEntrainement] = useState(false);
  const [ouverts, setOuverts] = useState<Set<string>>(() => new Set());
  const [limite, setLimite] = useState(PAGE);

  const visibles = useMemo(() => evaluations.filter((e) => {
    if (types.length > 0) return types.includes(e.type);
    return entrainement || e.type !== 'entrainement';
  }), [evaluations, types, entrainement]);
  const points = useMemo(() => pointsCourbe(visibles, pourEleve), [visibles, pourEleve]);
  const evo = useMemo(() => evolutions(visibles, pourEleve), [visibles, pourEleve]);
  const tri = useMemo(() => [...visibles].sort((a, b) => b.date.localeCompare(a.date) || a.cle.localeCompare(b.cle)), [visibles]);

  const basculer = (t: EvalType) => { setTypes((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t])); setLimite(PAGE); };
  const ouvrir = (cle: string) => setOuverts((cur) => { const n = new Set(cur); if (n.has(cle)) n.delete(cle); else n.add(cle); return n; });
  const nbEntrainement = evaluations.filter((e) => e.type === 'entrainement').length;

  const chip = (on: boolean) => cn(
    'inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold ring-1 ring-inset transition-colors focus-ring',
    on ? 'bg-[#14254E] text-white ring-[#14254E] dark:bg-white dark:text-[#14254E]' : 'bg-(--color-surface) text-(--color-ink-soft) ring-(--color-border) hover:text-(--color-ink)',
  );

  return (
    <div className="space-y-5">
      {presents.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer par nature d’évaluation">
          <button type="button" className={chip(types.length === 0)} aria-pressed={types.length === 0} onClick={() => { setTypes([]); setLimite(PAGE); }}>
            Toutes les évaluations
          </button>
          {presents.filter((t) => t !== 'entrainement').map((t) => (
            <button key={t} type="button" className={chip(types.includes(t))} aria-pressed={types.includes(t)} onClick={() => basculer(t)}>
              <span className="h-2 w-2 rounded-full" style={{ background: TYPE_COULEUR[t] }} aria-hidden />
              {TYPE_COURT[t]}
              <span className="tabular-nums opacity-70">{evaluations.filter((e) => e.type === t).length}</span>
            </button>
          ))}
          {nbEntrainement > 0 && types.length === 0 && (
            <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-[13px] text-(--color-ink-soft)">
              <input type="checkbox" className="h-4 w-4 accent-[#E4002B]" checked={entrainement} onChange={(ev) => { setEntrainement(ev.target.checked); setLimite(PAGE); }} />
              Inclure les révisions transversales du quotidien ({nbEntrainement})
            </label>
          )}
        </div>
      )}

      <section aria-labelledby="courbe-titre" className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6">
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8B0E22] dark:text-[#F89BA3]">Progression</p>
          <h2 id="courbe-titre" className={cn(display, 'mt-1 text-lg font-extrabold tracking-[-0.01em] text-[#14254E] dark:text-(--color-ink) sm:text-xl')}>Courbe de progression</h2>
          <p className="mt-1 text-sm text-(--color-ink-soft)">Résultats en pourcentage, dans l’ordre chronologique : une couleur par nature d’évaluation.</p>
        </div>
        <CourbeProgression points={points} />
      </section>

      <section aria-labelledby="historique-titre" className="rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft)">
        <div className="flex flex-wrap items-end justify-between gap-3 p-5 pb-3 sm:p-6 sm:pb-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8B0E22] dark:text-[#F89BA3]">Historique</p>
            <h2 id="historique-titre" className={cn(display, 'mt-1 text-lg font-extrabold tracking-[-0.01em] text-[#14254E] dark:text-(--color-ink) sm:text-xl')}>
              {tri.length} évaluation{tri.length > 1 ? 's' : ''}
            </h2>
            <p className="mt-1 text-sm text-(--color-ink-soft)">Chaque tentative est conservée : une reprise ne remplace jamais la précédente.</p>
          </div>
          {entete?.({ types, entrainement })}
        </div>

        {tri.length === 0 ? (
          <p className="px-6 pb-8 pt-4 text-center text-sm text-(--color-ink-soft)">Aucune évaluation pour ces critères.</p>
        ) : (
          <>
            {/* Tableau (tablette et ordinateur) */}
            <div className="hidden md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-y border-(--color-border) bg-(--color-surface-soft) text-[11px] font-bold uppercase tracking-wide text-(--color-ink-muted)">
                    <th scope="col" className="py-2.5 pl-6 pr-3">Date</th>
                    <th scope="col" className="px-3 py-2.5">Évaluation</th>
                    <th scope="col" className="px-3 py-2.5">Statut</th>
                    <th scope="col" className="px-3 py-2.5">Résultat</th>
                    <th scope="col" className="px-3 py-2.5">Évolution</th>
                    <th scope="col" className="px-3 py-2.5">Durée</th>
                    <th scope="col" className="py-2.5 pl-3 pr-6"><span className="sr-only">Détail</span></th>
                  </tr>
                </thead>
                <tbody>
                  {tri.slice(0, limite).map((e) => {
                    const open = ouverts.has(e.cle);
                    return (
                      <Fragment key={e.cle}>
                        <tr className={cn('border-b border-(--color-border) align-top', e.archive && 'bg-amber-50/40 dark:bg-amber-900/5')}>
                          <td className="whitespace-nowrap py-3 pl-6 pr-3 tabular-nums">
                            <span className="font-semibold text-(--color-ink)">{formatJour(e.date)}</span>
                            <span className="block text-xs text-(--color-ink-muted)">{formatHeure(e.date)}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="flex flex-wrap items-center gap-1.5">
                              <Nature type={e.type} />
                              {e.archive && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900 dark:bg-amber-900/30 dark:text-amber-200"><Archive className="h-3 w-3" aria-hidden /> Archivée</span>}
                            </span>
                            <span className="mt-1 block font-semibold text-(--color-ink)">{e.intitule}</span>
                            {e.specialite && <span className="block text-xs text-(--color-ink-soft)">{e.specialite}</span>}
                          </td>
                          <td className="px-3 py-3">
                            <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset', STATUT_TON[e.statut])}>{STATUT_LABEL[e.statut]}</span>
                            {e.statut !== 'termine' && precisionEtat(e) && <span className="mt-1 block text-[11px] text-(--color-ink-muted)">{precisionEtat(e)}</span>}
                          </td>
                          <td className="px-3 py-3"><Resultat e={e} pourEleve={pourEleve} /></td>
                          <td className="px-3 py-3 text-[13px]"><Evolution d={evo.get(e.cle)} /></td>
                          <td className="whitespace-nowrap px-3 py-3 text-[13px] text-(--color-ink-soft)">{formatDuree(e.dureeSecondes)}</td>
                          <td className="py-3 pl-3 pr-6 text-right">
                            <button type="button" onClick={() => ouvrir(e.cle)} aria-expanded={open} aria-controls={`detail-${e.cle}`} className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2.5 text-[13px] font-semibold text-(--color-ink-soft) ring-1 ring-inset ring-(--color-border) transition-colors hover:text-(--color-ink) focus-ring">
                              Détail <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden />
                            </button>
                          </td>
                        </tr>
                        {open && (
                          <tr id={`detail-${e.cle}`} className="border-b border-(--color-border)">
                            <td colSpan={7} className="px-6 py-3"><Detail e={e} mode={mode} matieres={matieres} extra={actions?.(e)} /></td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Cartes (téléphone) */}
            <ul className="space-y-3 px-4 pb-4 md:hidden">
              {tri.slice(0, limite).map((e) => {
                const open = ouverts.has(e.cle);
                return (
                  <li key={e.cle} className={cn('rounded-xl border border-(--color-border) p-3.5', e.archive && 'border-amber-200 bg-amber-50/40 dark:border-amber-900/50')}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-1.5 text-xs text-(--color-ink-muted)">
                          <Nature type={e.type} /> {formatJour(e.date)} · {formatHeure(e.date)}
                        </p>
                        <p className="mt-1.5 font-semibold text-(--color-ink)">{e.intitule}</p>
                        {e.specialite && <p className="text-xs text-(--color-ink-soft)">{e.specialite}</p>}
                      </div>
                      <div className="shrink-0 text-right"><Resultat e={e} pourEleve={pourEleve} /></div>
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px]">
                      <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset', STATUT_TON[e.statut])}>{STATUT_LABEL[e.statut]}</span>
                      {e.archive && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 dark:text-amber-200"><Archive className="h-3 w-3" aria-hidden /> Archivée</span>}
                      <Evolution d={evo.get(e.cle)} />
                      <span className="text-(--color-ink-soft)">{formatDuree(e.dureeSecondes)}</span>
                      <button type="button" onClick={() => ouvrir(e.cle)} aria-expanded={open} className="ml-auto inline-flex min-h-9 items-center gap-1 rounded-lg px-2.5 text-[13px] font-semibold text-(--color-ink-soft) ring-1 ring-inset ring-(--color-border) focus-ring">
                        Détail <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden />
                      </button>
                    </div>
                    {open && <div className="mt-3"><Detail e={e} mode={mode} matieres={matieres} extra={actions?.(e)} /></div>}
                  </li>
                );
              })}
            </ul>

            {tri.length > limite && (
              <div className="border-t border-(--color-border) p-4 text-center">
                <button type="button" onClick={() => setLimite((l) => l + PAGE * 2)} className="inline-flex min-h-10 items-center rounded-xl px-4 text-sm font-semibold text-(--color-ink) ring-1 ring-inset ring-(--color-border) hover:bg-(--color-surface-soft) focus-ring">
                  Afficher plus ({tri.length - limite} restante{tri.length - limite > 1 ? 's' : ''})
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
