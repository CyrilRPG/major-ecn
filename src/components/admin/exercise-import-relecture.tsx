'use client';

/**
 * Import d'exercices — ÉCRAN DE RELECTURE (10/09/2026).
 *
 * L'ancien « aperçu » montrait la question telle que l'élève la verrait, et
 * rien d'autre : ni les avertissements de l'analyse, ni la page du document,
 * ni le moindre moyen de corriger. L'administrateur publiait à l'aveugle.
 *
 * Ici, en tête, le RAPPORT DE FIABILITÉ (bandeau vert / orange / rouge,
 * compteurs, alertes bloquantes et à relire avec numéro, page et lien) ; les
 * avertissements globaux, repliables ; puis, question par question : la page
 * source dans un panneau (URL signée du PDF, visionneuse du navigateur), les
 * badges d'écart (corrigé aligné sur la couleur, propositions complétées,
 * vignette ajoutée, image douteuse), l'édition inline (énoncé, propositions,
 * vrai/faux, justification, réponse attendue, corrigé, images), la case
 * « Vérifiée » et « Écarter ». Le bouton « Publier » reste désactivé, avec le
 * motif, tant que le verdict est rouge ; en orange, une case « J'ai relu les
 * points signalés » le débloque. Le serveur refait le même contrôle
 * (`publishExerciseImportAction`).
 */

import { useMemo, useState, useTransition } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ExternalLink, FileText, ImageIcon, Loader2, RotateCcw, Save, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { reponseModele } from '@/lib/qcm/grade';
import { VariantesAcceptees } from '@/components/qcm/variantes-acceptees';
import {
  acknowledgeImportAlerteAction, getExerciseImportSourceUrlAction, publishExerciseImportAction, updateImportQuestionAction,
} from '@/app/admin/import-exercices/actions';
import type { AlerteImport, Fiabilite, QuestionFinale, RapportResume, Verdict } from '@/lib/ai/exercise-import-pipeline';

/* ─────────── Formes lues depuis `exercise_imports.result` ─────────── */

/** Résultat final d'un import (forme B), tel que persisté. Les champs de
 *  fiabilité sont absents des imports analysés avant le 10/09/2026. */
export type ResultatImport = {
  etape?: string;
  questions?: QuestionFinale[];
  questions_ecartees?: QuestionFinale[];
  warnings?: string[];
  alertes?: AlerteImport[];
  rapport?: RapportResume;
  fiabilite?: Fiabilite;
  meta?: { model?: string; effort?: string; lots?: number; pages?: number; cout?: { usd?: number; appels?: number }; relances?: { lots?: number }; lotsEnEchec?: number; images?: { extraites?: number } };
  /** Forme « progression » (analyse en cours). */
  plan?: { lots?: unknown[]; lotsCorrige?: unknown[]; nbPagesSujet?: number };
  partiels?: Record<string, unknown>;
  partielsCorrige?: Record<string, unknown>;
};

export type LigneImport = {
  id: string; title: string; voie: 'interne' | 'externe'; status: string; result: ResultatImport | null;
};

export const VERDICTS: Record<Verdict, { label: string; bandeau: string; pastille: string; explication: string }> = {
  vert: { label: 'Fiable', bandeau: 'border-[#C9E6D5] bg-[#F3FBF6] text-[#124A2A]', pastille: 'bg-green-100 text-green-800', explication: 'Aucun écart bloquant ni à relire : le corrigé a été vérifié sur la couleur du document.' },
  orange: { label: 'À relire', bandeau: 'border-amber-200 bg-amber-50 text-amber-900', pastille: 'bg-amber-100 text-amber-800', explication: 'Des points restent à relire, ou le corrigé du document n’a pas pu être vérifié par la couleur.' },
  rouge: { label: 'Bloqué', bandeau: 'border-red-200 bg-red-50 text-red-900', pastille: 'bg-red-100 text-red-800', explication: 'Des écarts bloquants restent à traiter avant toute publication.' },
};

const BADGES: Record<string, { label: string; className: string }> = {
  corrige: { label: 'Corrigé aligné sur la couleur du document', className: 'bg-[#EEF6FF] text-[#1E4D8B]' },
  proposition_completee: { label: 'Propositions complétées depuis le document', className: 'bg-amber-100 text-amber-800' },
  vignette_prefixee: { label: 'Vignette ajoutée', className: 'bg-amber-100 text-amber-800' },
  placeholder_retire: { label: 'Note du modèle retirée', className: 'bg-amber-100 text-amber-800' },
  image_douteuse: { label: 'Image rattachée avec doute', className: 'bg-amber-100 text-amber-800' },
  bloquant: { label: 'Bloquant', className: 'bg-red-100 text-red-800' },
  a_relire: { label: 'À relire', className: 'bg-amber-100 text-amber-800' },
};

function messageErreur(e: unknown): string {
  if (e instanceof Error) {
    if (/unexpected response was received from the server/i.test(e.message)) return 'La réponse du serveur s’est perdue en route : rechargez la page pour vérifier l’état de l’import.';
    return e.message;
  }
  return 'Une erreur inattendue est survenue.';
}

const alerteActive = (a: AlerteImport, questions: QuestionFinale[]) => {
  if (a.traitee) return false;
  if (!a.question_client_id) return true;
  const q = questions.find((x) => x.client_id === a.question_client_id);
  return !!q && !q.validee_par_admin;
};

type Brouillon = { enonce: string; items: Array<{ lettre: string; enonce: string; is_correct: boolean; justification: string }>; reponse_attendue: string; correction_generale: string; images: string[] };
const brouillonDe = (q: QuestionFinale): Brouillon => ({
  enonce: q.enonce, items: (q.items ?? []).map((i) => ({ lettre: i.lettre, enonce: i.enonce, is_correct: !!i.is_correct, justification: i.justification ?? '' })),
  reponse_attendue: q.reponse_attendue ?? '', correction_generale: q.correction_generale ?? '', images: [...(q.images ?? [])],
});

/* ─────────── Composant ─────────── */

export function ImportRelecture({ row, onClose, onChanged }: { row: LigneImport; onClose: () => void; onChanged: () => void }) {
  const [result, setResult] = useState<ResultatImport>(() => ({ ...(row.result ?? {}), questions: [...(row.result?.questions ?? [])], questions_ecartees: [...(row.result?.questions_ecartees ?? [])], alertes: [...(row.result?.alertes ?? [])], warnings: [...(row.result?.warnings ?? [])] }));
  const [index, setIndex] = useState(0);
  const [seulementAlertes, setSeulementAlertes] = useState(false);
  const [pdf, setPdf] = useState<{ url: string; page: number } | null>(null);
  const [pdfErreur, setPdfErreur] = useState<string | null>(null);
  // Brouillon d'édition, rattaché à l'OBJET question : une autre question,
  // ou la même renvoyée par le serveur après enregistrement, repart de zéro.
  const [brouillonEtat, setBrouillonEtat] = useState<{ pour: QuestionFinale; valeur: Brouillon } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [relu, setRelu] = useState(false);
  const [pending, start] = useTransition();

  const questions = useMemo(() => result.questions ?? [], [result.questions]);
  const alertes = useMemo(() => result.alertes ?? [], [result.alertes]);
  const fiabilite = result.fiabilite ?? null;
  const legacy = !fiabilite;
  const verdict: Verdict = fiabilite?.verdict ?? 'orange';

  const alertesParQuestion = useMemo(() => {
    const m = new Map<string, AlerteImport[]>();
    for (const a of alertes) if (a.question_client_id) { const l = m.get(a.question_client_id) ?? []; l.push(a); m.set(a.question_client_id, l); }
    return m;
  }, [alertes]);
  const indexAvecAlerte = useMemo(() => questions.map((q, i) => ((alertesParQuestion.get(q.client_id) ?? []).some((a) => alerteActive(a, questions)) ? i : -1)).filter((i) => i >= 0), [questions, alertesParQuestion]);
  const visibles = seulementAlertes ? indexAvecAlerte : questions.map((_, i) => i);
  // Filtre « seulement les alertes » : si la question courante n'en fait pas partie, on montre la première.
  const indexEffectif = visibles.length && !visibles.includes(index) ? visibles[0] : index;
  const position = Math.max(0, visibles.indexOf(indexEffectif));
  const q = questions[indexEffectif];
  const brouillon: Brouillon | null = q ? (brouillonEtat?.pour === q ? brouillonEtat.valeur : brouillonDe(q)) : null;
  const setBrouillon = (valeur: Brouillon) => { if (q) setBrouillonEtat({ pour: q, valeur }); };

  const allerA = (i: number) => { if (i >= 0 && i < questions.length) { setIndex(i); setInfo(null); } };
  const allerAQuestion = (clientId: string | undefined) => { const i = questions.findIndex((x) => x.client_id === clientId); if (i >= 0) { setSeulementAlertes(false); allerA(i); } };
  const precedent = () => { if (position > 0) allerA(visibles[position - 1]); };
  const suivant = () => { if (position < visibles.length - 1) allerA(visibles[position + 1]); };

  const voirPage = (page: number | null | undefined) => {
    const p = Math.max(1, page ?? 1);
    setPdfErreur(null);
    if (pdf) { setPdf({ url: pdf.url, page: p }); return; }
    start(async () => {
      try {
        const r = await getExerciseImportSourceUrlAction(row.id);
        if (!r.ok) { setPdfErreur(r.error); return; }
        if (r.format !== 'pdf') { setPdfErreur('Le document source n’est pas un PDF : la page ne peut pas être affichée.'); return; }
        setPdf({ url: r.url, page: p });
      } catch (e) { setPdfErreur(messageErreur(e)); }
    });
  };

  const appliquer = (patch: Record<string, unknown>, clientId = q?.client_id) => {
    if (!clientId) return;
    setErreur(null); setInfo(null);
    start(async () => {
      try {
        const r = await updateImportQuestionAction(row.id, clientId, patch);
        if (!r.ok) { setErreur(r.error); return; }
        setResult((prev) => {
          const suivant: ResultatImport = { ...prev, fiabilite: r.fiabilite, warnings: r.warnings };
          const qs = [...(prev.questions ?? [])]; const ecartees = [...(prev.questions_ecartees ?? [])];
          const nq = r.question;
          if (nq) {
            const i = qs.findIndex((x) => x.client_id === clientId); const j = ecartees.findIndex((x) => x.client_id === clientId);
            if (nq.supprimee) { if (i >= 0) qs.splice(i, 1); if (j >= 0) ecartees[j] = nq; else ecartees.push(nq); }
            else if (i >= 0) qs[i] = nq;
            else { if (j >= 0) ecartees.splice(j, 1); const cible = qs.findIndex((x) => (x.index_origine ?? Number.MAX_SAFE_INTEGER) > (nq.index_origine ?? 0)); if (cible < 0) qs.push(nq); else qs.splice(cible, 0, nq); }
          }
          suivant.questions = qs; suivant.questions_ecartees = ecartees;
          return suivant;
        });
        if (r.question?.supprimee) setIndex((i) => Math.max(0, Math.min(i, questions.length - 2)));
        else if (r.question) setBrouillonEtat(null);
        setInfo(r.modifications.length ? `Enregistré : ${r.modifications.join(', ')}.` : 'Aucun changement.');
        onChanged();
      } catch (e) { setErreur(messageErreur(e)); }
    });
  };

  const enregistrer = () => {
    if (!q || !brouillon) return;
    const patch: Record<string, unknown> = {};
    if (brouillon.enonce !== q.enonce) patch.enonce = brouillon.enonce;
    const items = brouillon.items.filter((b) => { const o = q.items.find((x) => x.lettre === b.lettre); return o && (o.enonce !== b.enonce || !!o.is_correct !== b.is_correct || (o.justification ?? '') !== b.justification); });
    if (items.length) patch.items = items;
    if (brouillon.reponse_attendue !== (q.reponse_attendue ?? '')) patch.reponse_attendue = brouillon.reponse_attendue;
    if (brouillon.correction_generale !== (q.correction_generale ?? '')) patch.correction_generale = brouillon.correction_generale;
    if (brouillon.images.join('\n') !== (q.images ?? []).join('\n')) patch.images = brouillon.images;
    if (!Object.keys(patch).length) { setInfo('Aucun changement à enregistrer.'); return; }
    appliquer(patch);
  };

  const acquitter = (i: number, traitee: boolean) => {
    setErreur(null);
    start(async () => {
      try {
        const r = await acknowledgeImportAlerteAction(row.id, i, traitee);
        if (!r.ok) { setErreur(r.error); return; }
        setResult((prev) => { const al = [...(prev.alertes ?? [])]; al[i] = r.alerte; return { ...prev, alertes: al, fiabilite: r.fiabilite, warnings: r.warnings }; });
        onChanged();
      } catch (e) { setErreur(messageErreur(e)); }
    });
  };

  const publier = () => {
    setErreur(null);
    start(async () => {
      try {
        const r = await publishExerciseImportAction(row.id);
        if (!r.ok) { setErreur(r.error); return; }
        onChanged(); onClose();
      } catch (e) { setErreur(messageErreur(e)); onChanged(); }
    });
  };

  const bloquantesActives = alertes.filter((a) => a.gravite === 'bloquant' && alerteActive(a, questions));
  const aRelireActives = alertes.filter((a) => a.gravite === 'a_relire' && alerteActive(a, questions));
  const peutPublier = row.status === 'ready' && (legacy || (verdict === 'vert' || (verdict === 'orange' && relu)));
  const motifPublication = verdict === 'rouge' ? `${bloquantesActives.length} alerte(s) bloquante(s) à traiter avant publication.` : verdict === 'orange' && !relu ? 'Cochez « J’ai relu les points signalés » pour publier.' : null;
  const reparations = q && result.rapport ? result.rapport.reparations.filter((r) => r.question_client_id === q.client_id) : [];
  const alertesQ = q ? alertesParQuestion.get(q.client_id) ?? [] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/50 p-2 sm:p-4">
      <div role="dialog" aria-modal="true" aria-label={`Relecture de l’import ${row.title}`} className="flex w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between gap-3 border-b border-(--color-border) px-5 py-3">
          <div className="min-w-0"><p className="text-xs text-(--color-ink-muted)">Relecture · {row.voie === 'interne' ? 'QCM' : 'QROC'}</p><h3 className="truncate font-semibold text-(--color-ink)">{row.title}</h3></div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fermer"><X /></Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* ── Rapport de fiabilité ── */}
          {legacy ? (
            <div className="m-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" data-testid="fiabilite-legacy">
              Cet import a été analysé avant la mise en place du rapport de fiabilité : aucune confrontation au document n’est disponible et les questions ne sont pas modifiables ici. Relancez son analyse pour obtenir le rapport, ou publiez-le en l’état sous votre responsabilité.
            </div>
          ) : fiabilite && (
            <section data-testid="fiabilite" className={cn('m-4 rounded-2xl border p-4', VERDICTS[verdict].bandeau)}>
              <div className="flex flex-wrap items-center gap-3">
                <span data-testid="verdict" className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold', VERDICTS[verdict].pastille)}>
                  {verdict === 'vert' ? <CheckCircle2 className="h-4 w-4" /> : verdict === 'orange' ? <AlertTriangle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {VERDICTS[verdict].label}
                </span>
                <p className="text-sm">{VERDICTS[verdict].explication}</p>
              </div>
              <ul data-testid="compteurs" className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <li><strong>{fiabilite.questionsDocument}</strong> question{fiabilite.questionsDocument > 1 ? 's' : ''} dans le document · <strong>{fiabilite.questionsImportees}</strong> importée{fiabilite.questionsImportees > 1 ? 's' : ''} · <strong>{fiabilite.questionsManquantes}</strong> manquante{fiabilite.questionsManquantes > 1 ? 's' : ''}</li>
                <li><strong>{fiabilite.questionsTronquees}</strong> liste{fiabilite.questionsTronquees > 1 ? 's' : ''} de propositions tronquée{fiabilite.questionsTronquees > 1 ? 's' : ''} · <strong>{fiabilite.vignettesAjoutees}</strong> vignette{fiabilite.vignettesAjoutees > 1 ? 's' : ''} ajoutée{fiabilite.vignettesAjoutees > 1 ? 's' : ''}</li>
                <li>{fiabilite.statutDocument === 'colore' ? <><strong>{fiabilite.corrigesVerifiesParCouleur}</strong> propositions vérifiées par la couleur · <strong>{fiabilite.corrigesCorriges}</strong> corrigé{fiabilite.corrigesCorriges > 1 ? 's' : ''} corrigé{fiabilite.corrigesCorriges > 1 ? 's' : ''} d’après la couleur</> : <>Corrigé <strong>non vérifiable</strong> par la couleur ({fiabilite.statutDocument === 'non-colore' ? 'document sans vert' : fiabilite.statutDocument === 'illisible' ? 'document illisible' : 'document non lu'})</>}</li>
                <li><strong>{fiabilite.imagesRattachees}</strong> image{fiabilite.imagesRattachees > 1 ? 's' : ''} sur <strong>{fiabilite.imagesDocument}</strong> rattachée{fiabilite.imagesRattachees > 1 ? 's' : ''}{fiabilite.imagesDouteuses ? ` (${fiabilite.imagesDouteuses} avec doute)` : ''}</li>
                <li><strong>{fiabilite.alertesBloquantes}</strong> bloquante{fiabilite.alertesBloquantes > 1 ? 's' : ''} · <strong>{fiabilite.alertesARelire}</strong> à relire</li>
                {result.meta?.cout?.usd != null && <li className="text-xs opacity-80">{result.meta.pages ?? '?'} pages · {result.meta.lots ?? '?'} lots{result.meta.relances?.lots ? ` + ${result.meta.relances.lots} relance(s)` : ''} · coût réel {result.meta.cout.usd.toFixed(2)} $ · {result.meta.model}{result.meta.effort ? ` (${result.meta.effort})` : ''}</li>}
              </ul>
              {(bloquantesActives.length > 0 || aRelireActives.length > 0) && (
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <ListeAlertes titre="Bloquantes" gravite="bloquant" alertes={alertes} questions={questions} onQuestion={allerAQuestion} onPage={voirPage} onAcquitter={acquitter} />
                  <ListeAlertes titre="À relire" gravite="a_relire" alertes={alertes} questions={questions} onQuestion={allerAQuestion} onPage={voirPage} onAcquitter={acquitter} />
                </div>
              )}
            </section>
          )}

          {(result.warnings ?? []).length > 0 && (
            <details className="mx-4 mb-4 rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-4 py-2 text-sm" data-testid="warnings">
              <summary className="cursor-pointer font-semibold text-(--color-ink)">Avertissements de l’analyse ({(result.warnings ?? []).length})</summary>
              <ul className="mt-2 max-h-64 list-disc space-y-1 overflow-y-auto pl-5 text-xs text-(--color-ink-soft)">{(result.warnings ?? []).map((w, i) => <li key={i}>{w}</li>)}</ul>
            </details>
          )}

          {/* ── Navigation ── */}
          <div className="mx-4 flex flex-wrap items-center gap-2 border-y border-(--color-border) py-2 text-sm">
            <Button size="sm" variant="outline" onClick={precedent} disabled={position <= 0}><ChevronLeft className="h-4 w-4" /> Précédent</Button>
            <span data-testid="position" className="tabular-nums text-(--color-ink-soft)">Question {visibles.length ? position + 1 : 0} / {visibles.length}{seulementAlertes ? ` (sur ${questions.length})` : ''}</span>
            <Button size="sm" variant="outline" onClick={suivant} disabled={position >= visibles.length - 1}>Suivant <ChevronRight className="h-4 w-4" /></Button>
            {!legacy && <label className="ml-2 inline-flex items-center gap-2 text-xs"><input type="checkbox" checked={seulementAlertes} onChange={(e) => setSeulementAlertes(e.target.checked)} /> Seulement les alertes ({indexAvecAlerte.length})</label>}
            {q && <Button size="sm" variant="outline" className="ml-auto" onClick={() => voirPage(q.page_document ?? q.source_pages?.[0])} disabled={pending}><FileText className="h-4 w-4" /> Voir la page {q.page_document ?? q.source_pages?.[0] ?? '?'}</Button>}
            {pdf && <Button size="sm" variant="ghost" onClick={() => setPdf(null)}>Masquer le PDF</Button>}
          </div>
          {pdfErreur && <p className="mx-4 mt-2 text-xs text-[#B4233C]">{pdfErreur}</p>}

          {/* ── Question ── */}
          {q && brouillon ? (
            <div className={cn('grid gap-4 p-4', pdf ? 'lg:grid-cols-[minmax(0,1fr)_minmax(320px,45%)]' : '')}>
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-(--color-surface-soft) px-2.5 py-1 font-semibold text-(--color-ink)">{q.numero_document ?? q.numero_source ?? `Question ${indexEffectif + 1}`}{q.page_document ? ` · p.${q.page_document}` : ''}</span>
                  {q.validee_par_admin && <span className="rounded-full bg-green-100 px-2.5 py-1 font-semibold text-green-800">Vérifiée</span>}
                  {[...new Set(reparations.map((r) => r.type))].map((t) => <span key={t} className={cn('rounded-full px-2.5 py-1 font-semibold', BADGES[t]?.className)} title={reparations.filter((r) => r.type === t).map((r) => r.detail).join('\n')}>{BADGES[t]?.label ?? t}</span>)}
                  {q.images_rattachees?.some((i) => i.confiance === 'douteuse') && <span className={cn('rounded-full px-2.5 py-1 font-semibold', BADGES.image_douteuse.className)}>{BADGES.image_douteuse.label}</span>}
                  {alertesQ.filter((a) => alerteActive(a, questions)).map((a, i) => <span key={i} className={cn('rounded-full px-2.5 py-1 font-semibold', BADGES[a.gravite]?.className)} title={a.message}>{BADGES[a.gravite]?.label ?? a.gravite} · {a.code.replace(/_/g, ' ')}</span>)}
                </div>
                {alertesQ.length > 0 && <ul className="mb-3 space-y-1 text-xs text-amber-800">{alertesQ.map((a, i) => <li key={i} className={cn(!alerteActive(a, questions) && 'line-through opacity-60')}>{a.message}</li>)}</ul>}
                {(reparations.length > 0) && <details className="mb-3 text-xs text-(--color-ink-soft)"><summary className="cursor-pointer">Réparations automatiques ({reparations.length})</summary><ul className="mt-1 list-disc space-y-1 pl-5">{reparations.map((r, i) => <li key={i}>{r.detail}</li>)}</ul></details>}

                <label className="block text-xs font-medium text-(--color-ink-soft)">Énoncé
                  <textarea disabled={legacy} value={brouillon.enonce} onChange={(e) => setBrouillon({ ...brouillon, enonce: e.target.value })} rows={Math.min(14, Math.max(4, brouillon.enonce.split('\n').length + 1))} className="mt-1 w-full rounded-lg border border-(--color-border) bg-white px-3 py-2 text-[15px] leading-7 text-(--color-ink) outline-none focus:border-(--color-primary) disabled:bg-(--color-surface-soft)" />
                </label>

                {/* Images */}
                <div className="mt-3 rounded-xl border border-dashed border-(--color-border) p-3 text-xs text-(--color-ink-soft)">
                  <p className="font-semibold text-(--color-ink)"><ImageIcon className="mr-1 inline h-4 w-4" />Images du document ({brouillon.images.length})</p>
                  {brouillon.images.length > 0 && <div className="mt-2 flex flex-wrap gap-3">{brouillon.images.map((url) => { const rat = q.images_rattachees?.find((i) => i.url === url); return (
                    <figure key={url} className="w-40">
                      {/* eslint-disable-next-line @next/next/no-img-element -- URL publique du bucket, dimensions inconnues */}
                      <img src={url} alt="" className="h-28 w-40 rounded-lg border border-(--color-border) bg-white object-contain" />
                      <figcaption className="mt-1 flex items-center justify-between gap-1">{rat ? <span className={cn(rat.confiance === 'douteuse' && 'text-amber-700')} title={rat.motif}>p.{rat.page} · {rat.confiance === 'sure' ? 'sûre' : 'douteuse'}</span> : <span>image</span>}{!legacy && <button type="button" className="text-[#B4233C] hover:underline" onClick={() => setBrouillon({ ...brouillon, images: brouillon.images.filter((u) => u !== url) })}>Retirer</button>}</figcaption>
                    </figure>); })}</div>}
                  {(q.images_rattachees ?? []).filter((i) => !brouillon.images.includes(i.url)).length > 0 && <p className="mt-2">Retirées : {(q.images_rattachees ?? []).filter((i) => !brouillon.images.includes(i.url)).map((i) => <button key={i.url} type="button" className="mr-2 text-(--color-primary) hover:underline" onClick={() => setBrouillon({ ...brouillon, images: [...brouillon.images, i.url] })}>rétablir p.{i.page}</button>)}</p>}
                  {(q.images_modele ?? []).length > 0 && <p className="mt-2">Décrites par le modèle : {(q.images_modele ?? []).map((i) => `${i.source_description}${i.source_page ? ` (p.${i.source_page})` : ''}`).join(' · ')}</p>}
                  {brouillon.images.length === 0 && (q.images_modele ?? []).length === 0 && <p className="mt-1">Aucune image.</p>}
                </div>

                {q.format === 'qcm' ? (
                  <div className="mt-4 space-y-2">{brouillon.items.map((it, k) => (
                    <div key={it.lettre} className={cn('rounded-xl border p-3', it.is_correct ? 'border-[#C9E6D5] bg-[#F9FDFA]' : 'border-(--color-border)')}>
                      <div className="flex items-start gap-2">
                        <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--color-surface-soft) text-xs font-semibold">{it.lettre}</span>
                        <textarea disabled={legacy} value={it.enonce} onChange={(e) => setBrouillon({ ...brouillon, items: brouillon.items.map((x, j) => j === k ? { ...x, enonce: e.target.value } : x) })} rows={Math.max(1, Math.ceil(it.enonce.length / 90))} className="w-full resize-y rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm text-(--color-ink) outline-none focus:border-(--color-primary) focus:bg-white" />
                        <label className={cn('inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', it.is_correct ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700')}>
                          <input type="checkbox" disabled={legacy} checked={it.is_correct} onChange={(e) => setBrouillon({ ...brouillon, items: brouillon.items.map((x, j) => j === k ? { ...x, is_correct: e.target.checked } : x) })} className="sr-only" />{it.is_correct ? 'Vrai' : 'Faux'}
                        </label>
                      </div>
                      <textarea disabled={legacy} value={it.justification} placeholder="Justification" onChange={(e) => setBrouillon({ ...brouillon, items: brouillon.items.map((x, j) => j === k ? { ...x, justification: e.target.value } : x) })} rows={Math.max(1, Math.ceil(it.justification.length / 110))} className="mt-1 ml-8 w-[calc(100%-2rem)] resize-y rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs text-(--color-ink-soft) outline-none focus:border-(--color-primary) focus:bg-white" />
                    </div>))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-4">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">Réponse attendue (variantes séparées par |)
                      <textarea disabled={legacy} value={brouillon.reponse_attendue} onChange={(e) => setBrouillon({ ...brouillon, reponse_attendue: e.target.value })} rows={2} className="mt-1 w-full rounded-lg border border-(--color-border) bg-white px-3 py-2 text-sm normal-case tracking-normal text-(--color-ink) outline-none focus:border-(--color-primary)" />
                    </label>
                    <p className="mt-2 text-xs text-(--color-ink-soft)">Affichée à l’élève : {reponseModele(brouillon.reponse_attendue) || 'À vérifier'}</p>
                    <VariantesAcceptees reponseAttendue={brouillon.reponse_attendue} />
                  </div>
                )}

                <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-[#16793C]">Correction
                  <textarea disabled={legacy} value={brouillon.correction_generale} onChange={(e) => setBrouillon({ ...brouillon, correction_generale: e.target.value })} rows={Math.min(12, Math.max(2, brouillon.correction_generale.split('\n').length + 1))} className="mt-1 w-full rounded-lg border border-[#C9E6D5] bg-[#F3FBF6] px-3 py-2 text-sm normal-case leading-6 tracking-normal text-(--color-ink) outline-none focus:border-(--color-primary)" />
                </label>
                {(q.warnings ?? []).length > 0 && <div className="mt-3 text-xs text-amber-700">À vérifier : {q.warnings.join(' · ')}</div>}

                {!legacy && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-(--color-border) pt-3">
                    <Button size="sm" onClick={enregistrer} disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : <Save />} Enregistrer</Button>
                    <label className="inline-flex items-center gap-2 rounded-lg border border-(--color-border) px-3 py-1.5 text-sm"><input type="checkbox" checked={!!q.validee_par_admin} disabled={pending} onChange={(e) => appliquer({ validee_par_admin: e.target.checked })} /> J’ai vérifié cette question</label>
                    <Button size="sm" variant="ghost" className="text-[#B4233C]" disabled={pending} onClick={() => appliquer({ supprimee: true })}><Trash2 className="h-4 w-4" /> Écarter la question</Button>
                    {info && <span className="text-xs text-(--color-ink-soft)">{info}</span>}
                  </div>
                )}
              </div>

              {pdf && (
                <div className="min-h-[60vh] overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface-soft)" data-testid="panneau-pdf">
                  <div className="flex items-center justify-between border-b border-(--color-border) px-3 py-1.5 text-xs text-(--color-ink-soft)"><span>Document source · page {pdf.page}</span><a href={`${pdf.url}#page=${pdf.page}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-(--color-primary) hover:underline">Ouvrir <ExternalLink className="h-3 w-3" /></a></div>
                  <iframe key={pdf.page} title={`Page ${pdf.page} du document source`} src={`${pdf.url}#page=${pdf.page}&zoom=page-width`} className="h-[70vh] w-full bg-white" />
                </div>
              )}
            </div>
          ) : <p className="p-8 text-center text-sm text-(--color-ink-muted)">{questions.length === 0 ? 'Aucune question dans cet import (toutes ont été écartées ?).' : 'Aucune question ne correspond au filtre.'}</p>}

          {(result.questions_ecartees ?? []).length > 0 && (
            <details className="mx-4 mb-4 rounded-xl border border-(--color-border) px-4 py-2 text-sm" data-testid="ecartees">
              <summary className="cursor-pointer font-semibold text-(--color-ink)">Questions écartées ({(result.questions_ecartees ?? []).length})</summary>
              <ul className="mt-2 space-y-1 text-xs">{(result.questions_ecartees ?? []).map((e) => <li key={e.client_id} className="flex items-center justify-between gap-2"><span className="truncate text-(--color-ink-soft)">{e.numero_document ?? e.numero_source ?? '—'} · {e.enonce.slice(0, 90)}</span><button type="button" className="inline-flex shrink-0 items-center gap-1 text-(--color-primary) hover:underline" disabled={pending} onClick={() => appliquer({ supprimee: false }, e.client_id)}><RotateCcw className="h-3 w-3" /> Restaurer</button></li>)}</ul>
            </details>
          )}
        </div>

        <footer className="flex flex-col gap-2 border-t border-(--color-border) px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-xs">
            {erreur && <p role="alert" className="flex items-center gap-1 text-[#B4233C]"><AlertCircle className="h-4 w-4 shrink-0" />{erreur}</p>}
            {!erreur && motifPublication && row.status === 'ready' && <p data-testid="motif-publication" className="text-(--color-ink-soft)">{motifPublication}</p>}
            {!erreur && !motifPublication && row.status === 'ready' && <p className="text-(--color-ink-soft)">{legacy ? 'Publication sans rapport de fiabilité.' : 'Prêt à publier.'}</p>}
          </div>
          <div className="flex items-center gap-3">
            {verdict === 'orange' && !legacy && row.status === 'ready' && <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={relu} onChange={(e) => setRelu(e.target.checked)} /> J’ai relu les points signalés</label>}
            {row.status === 'ready' && <Button onClick={publier} disabled={!peutPublier || pending} title={motifPublication ?? undefined} data-testid="publier">{pending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Publier</Button>}
          </div>
        </footer>
      </div>
    </div>
  );
}

function ListeAlertes({ titre, gravite, alertes, questions, onQuestion, onPage, onAcquitter }: {
  titre: string; gravite: 'bloquant' | 'a_relire'; alertes: AlerteImport[]; questions: QuestionFinale[];
  onQuestion: (clientId: string | undefined) => void; onPage: (page: number | null | undefined) => void; onAcquitter: (index: number, traitee: boolean) => void;
}) {
  const [ouvert, setOuvert] = useState(gravite === 'bloquant');
  const liste = alertes.map((a, i) => ({ a, i })).filter(({ a }) => a.gravite === gravite);
  const actives = liste.filter(({ a }) => alerteActive(a, questions));
  if (!liste.length) return null;
  return (
    <div className="rounded-xl border border-white/60 bg-white/70 p-3" data-testid={`alertes-${gravite}`}>
      <button type="button" className="flex w-full items-center justify-between text-left text-sm font-semibold" onClick={() => setOuvert(!ouvert)}>
        <span>{titre} · {actives.length} active{actives.length > 1 ? 's' : ''}{liste.length !== actives.length ? ` (${liste.length - actives.length} traitée${liste.length - actives.length > 1 ? 's' : ''})` : ''}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', ouvert && 'rotate-180')} />
      </button>
      {ouvert && (
        <ul className="mt-2 max-h-56 space-y-1.5 overflow-y-auto text-xs">
          {liste.map(({ a, i }) => {
            const active = alerteActive(a, questions);
            return (
              <li key={i} className={cn('flex flex-wrap items-start gap-x-2 gap-y-1', !active && 'opacity-60')}>
                <span className="shrink-0 rounded bg-(--color-surface-soft) px-1.5 py-0.5 font-mono text-[11px]">{a.numeroImprime ?? '—'}{a.page ? ` · p.${a.page}` : ''}</span>
                <span className={cn('min-w-0 flex-1', !active && 'line-through')}>{a.message}</span>
                <span className="flex shrink-0 gap-2">
                  {a.question_client_id && <button type="button" className="text-(--color-primary) hover:underline" onClick={() => onQuestion(a.question_client_id)}>Voir la question</button>}
                  {a.page ? <button type="button" className="text-(--color-primary) hover:underline" onClick={() => onPage(a.page)}>Page {a.page}</button> : null}
                  {!a.question_client_id && <label className="inline-flex items-center gap-1"><input type="checkbox" checked={!!a.traitee} onChange={(e) => onAcquitter(i, e.target.checked)} /> J’ai vérifié</label>}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
