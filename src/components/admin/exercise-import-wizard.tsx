'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, ChevronDown, CircleDollarSign, Eye, Loader2, RotateCw, Send, UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { cancelExerciseImportAction, estimateExerciseImportAction, prepareExerciseImportAction, publishExerciseImportAction } from '@/app/admin/import-exercices/actions';
import { createClient } from '@/lib/supabase/client';
import { fetchAuthentifie } from '@/lib/auth/fresh-token';
import { ImportRelecture, VERDICTS, type ResultatImport } from '@/components/admin/exercise-import-relecture';

export type ImportCollege = { id: string; name: string; parentId: string | null; courses: { id: string; title: string }[] };
export type ImportHistoryRow = {
  id: string; title: string; voie: 'interne' | 'externe'; format: string; status: string; estimatedPriceCents: number; billedPriceCents: number | null;
  result: ResultatImport | null; warnings: string[]; error: string | null; createdAt: string; courseTitle: string; collegeName: string; serieId: string | null;
};
type ProgressionAnalyse = { etape?: string; lotsFaits: number; lotsTotal: number; exercices: number; coutUsd?: number; detail?: string };
type ReponseAnalyse = { ok?: boolean; error?: string; done?: boolean; progress?: ProgressionAnalyse } | null;

const ETAPES: Record<string, string> = {
  analyse: 'Analyse', verification: 'Vérification sur le document', images: 'Extraction des images', relance: 'Relance des pages incomplètes', finalisation: 'Finalisation',
};

/** Avancement lisible d'un import en cours d'analyse, depuis sa ligne. */
function avancement(r: ResultatImport | null): string | null {
  if (!r || !r.etape || r.etape === 'ready' || !r.plan) return null;
  if (r.etape !== 'analyse') return ETAPES[r.etape] ?? r.etape;
  const total = (r.plan.lots?.length ?? 0) + (r.plan.lotsCorrige?.length ?? 0);
  const faits = Object.keys(r.partiels ?? {}).length + Object.keys(r.partielsCorrige ?? {}).length;
  return total ? `lot ${Math.min(faits, total)}/${total}` : null;
}
/** Message de progression pendant les appels enchaînés à la route d'analyse. */
function messageProgression(pr: ProgressionAnalyse | undefined): string {
  if (!pr) return 'Analyse en cours…';
  const etape = pr.etape && pr.etape !== 'analyse' ? `${ETAPES[pr.etape] ?? pr.etape}${pr.detail ? ` (${pr.detail})` : ''}…` : `Analyse : lot ${pr.lotsFaits}/${pr.lotsTotal}${pr.detail ? ` · ${pr.detail}` : ''}`;
  return `${etape} · ${pr.exercices} exercice${pr.exercices > 1 ? 's' : ''} trouvé${pr.exercices > 1 ? 's' : ''}`;
}
type Format = 'pdf' | 'docx' | 'txt';
type Mode = 'combined' | 'paired';
const OFFERS = [
  ['essentiel', 'Formule Essentielle'], ['intensif', 'Formule Intensive'], ['approfondi', 'Programme Approfondi'], ['decouverte', 'Espace Découverte'],
] as const;
const money = (cents: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
/** Doit rester égal à `EXERCISE_IMPORT_MAX_FILE_BYTES` côté serveur. */
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MO = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;

/**
 * Message lisible pour n'importe quel échec.
 *
 * Une erreur non rattrapée dans un `useTransition` remonte à la frontière
 * d'erreur de l'application et remplace la page par « Cette page n'a pas pu
 * s'afficher » — c'est ainsi que l'import signalait ses pannes (03/09/2026).
 * Tout appel réseau passe donc par ici, et l'admin voit un encadré rouge.
 */
function messageErreur(e: unknown): string {
  if (e instanceof Error) {
    if (/fetch|network|load failed/i.test(e.message)) {
      return 'La connexion a été interrompue pendant l’envoi. Vérifiez votre réseau et réessayez.';
    }
    // Message de Next quand la réponse d'une action serveur n'est pas lisible
    // (fonction interrompue, redéploiement en cours de requête…). L'écriture en
    // base, elle, a pu aboutir : le message doit le dire, sinon on croit à un
    // échec et on relance une opération déjà faite.
    if (/unexpected response was received from the server/i.test(e.message)) {
      return 'La réponse du serveur s’est perdue en route. L’opération a peut-être abouti : la liste vient d’être rafraîchie, vérifiez l’état de l’import ci-dessous avant de réessayer.';
    }
    return e.message;
  }
  return 'Une erreur inattendue est survenue.';
}

export function ExerciseImportWizard({ colleges, history }: { colleges: ImportCollege[]; history: ImportHistoryRow[] }) {
  const router = useRouter();
  const [voie, setVoie] = useState<'interne' | 'externe' | null>(null);
  const [collegeId, setCollegeId] = useState('');
  const [coursId, setCoursId] = useState('');
  const [offers, setOffers] = useState<string[]>(['essentiel', 'intensif', 'approfondi']);
  const [format, setFormat] = useState<Format>('pdf');
  const [mode, setMode] = useState<Mode>('combined');
  const [subject, setSubject] = useState<File | null>(null);
  const [answer, setAnswer] = useState<File | null>(null);
  const [estimate, setEstimate] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ImportHistoryRow | null>(null);
  const [pending, start] = useTransition();
  const [etape, setEtape] = useState<string | null>(null);
  const courses = useMemo(() => colleges.find((c) => c.id === collegeId)?.courses ?? [], [colleges, collegeId]);
  const ready = !!voie && !!collegeId && !!coursId && offers.length > 0 && !!subject && (mode === 'combined' || !!answer) && !!title.trim();
  const expected = voie === 'interne' ? 'QCM' : 'QROC';

  const selectFiles = (nextSubject: File | null, nextAnswer: File | null) => {
    setSubject(nextSubject); setAnswer(nextAnswer); setEstimate(null); setError(null);
    const files = [nextSubject, nextAnswer].filter(Boolean) as File[];
    const trop = files.find((f) => f.size > MAX_FILE_BYTES);
    if (trop) { setError(`« ${trop.name} » pèse ${MO(trop.size)} : la limite est de ${MO(MAX_FILE_BYTES)} par document.`); return; }
    if (files.length) start(async () => {
      try {
        const r = await estimateExerciseImportAction({ files: files.map((f) => ({ size: f.size })) });
        if (r.ok) setEstimate(r.cents); else setError(r.error);
      } catch (e) { setError(messageErreur(e)); }
    });
  };

  /**
   * Trois étapes, dans cet ordre : brouillon et URL signées, téléversement
   * DIRECT vers le stockage (le fichier ne traverse plus de fonction serveur,
   * qui le refuserait au-delà de 4,5 Mo), puis analyse par la route dédiée qui
   * porte son propre délai maximal.
   */
  const submit = () => {
    if (!ready || !voie || !subject) return;
    setError(null);
    start(async () => {
      try {
        setEtape('Préparation…');
        const prepared = await prepareExerciseImportAction({
          voie, collegeId, coursId, offers, format, sourceMode: mode, title: title.trim(),
          subject: { name: subject.name, size: subject.size },
          answer: answer ? { name: answer.name, size: answer.size } : null,
        });
        if (!prepared.ok) { setError(prepared.error); return; }

        setEtape('Envoi du document…');
        const supabase = createClient();
        const parRole: Record<string, File> = { subject, ...(answer ? { answer } : {}) };
        for (const cible of prepared.uploads) {
          const fichier = parRole[cible.role];
          if (!fichier) continue;
          const { error } = await supabase.storage.from('exercise-imports')
            .uploadToSignedUrl(cible.path, cible.token, fichier, { contentType: fichier.type || undefined });
          if (error) { setError(`Envoi de « ${fichier.name} » impossible : ${error.message}`); router.refresh(); return; }
        }

        setEtape('Analyse en cours…');
        const fin = await analyserJusquAuBout(prepared.id);
        if (!fin.ok) { setError(fin.error); router.refresh(); return; }
        setSubject(null); setAnswer(null); setTitle(''); setEstimate(null);
        router.refresh();
      } catch (e) {
        setError(messageErreur(e));
      } finally {
        setEtape(null);
      }
    });
  };
  /**
   * Relance l'analyse d'un import en échec. Le document est déjà dans le
   * stockage : la route le relit, il n'y a rien à téléverser de nouveau.
   */
  const relancer = (id: string) => {
    setError(null);
    start(async () => {
      try {
        setEtape('Reprise de l’analyse…');
        const fin = await analyserJusquAuBout(id);
        if (!fin.ok) setError(fin.error);
        router.refresh();
      } catch (e) {
        setError(messageErreur(e));
      } finally {
        setEtape(null);
      }
    });
  };

  const toggleOffer = (offer: string) => setOffers((prev) => prev.includes(offer) ? prev.filter((x) => x !== offer) : [...prev, offer]);

  /**
   * Enchaîne les appels à la route d'analyse jusqu'à `done`. Chaque appel
   * traite autant de lots que son délai le permet et persiste l'avancement :
   * un document de plusieurs centaines de pages passe donc en plusieurs
   * appels, sans jamais dépasser la durée maximale d'une fonction.
   */
  const analyserJusquAuBout = async (id: string): Promise<{ ok: true } | { ok: false; error: string }> => {
    for (let tour = 0; tour < 200; tour++) {
      const res = await fetchAuthentifie('/api/admin/import-exercices/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const payload = (await res.json().catch(() => null)) as ReponseAnalyse;
      if (!res.ok || !payload?.ok) {
        return { ok: false, error: payload?.error ?? `L’analyse a échoué (code ${res.status}). L’import est enregistré : relancez-le depuis la liste, les lots déjà analysés sont conservés.` };
      }
      if (payload.done) return { ok: true };
      setEtape(messageProgression(payload.progress));
      router.refresh();
    }
    return { ok: false, error: 'L’analyse n’a pas abouti après de nombreux appels : relancez-la depuis la liste.' };
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 flex flex-col justify-between gap-3 border-b border-(--color-border) pb-5 sm:flex-row sm:items-end">
        <div><p className="text-xs font-medium text-(--color-ink-muted)">Administration · Pédagogie</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-(--color-ink)">Import d’exercices</h1><p className="mt-1 text-sm text-(--color-ink-soft)">Analysez un sujet et son corrigé, vérifiez le résultat, puis publiez-le pour les étudiants ciblés.</p></div>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#EEF6FF] px-3 py-1.5 text-xs font-semibold text-[#1E4D8B]"><CheckCircle2 className="h-4 w-4" /> Publication après validation</span>
      </header>
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-6">
          <div className="mb-6 flex flex-wrap gap-2 text-xs font-semibold">{['Voie', 'Ciblage', 'Document', 'Analyse'].map((label, i) => <span key={label} className={cn('rounded-full px-3 py-1.5', i === 0 || (i === 1 && voie) || (i > 1 && collegeId) ? 'bg-(--color-primary) text-white' : 'bg-(--color-surface-soft) text-(--color-ink-muted)')}>{i + 1}. {label}</span>)}</div>
          <fieldset><legend className="text-sm font-semibold text-(--color-ink)">1. Voie et format pédagogique</legend><p className="mt-1 text-xs text-(--color-ink-muted)">Ce choix détermine le format et l’audience des exercices.</p><div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Choice active={voie === 'interne'} title="Voie interne" text="QCM à propositions" onClick={() => setVoie('interne')} />
            <Choice active={voie === 'externe'} title="Voie externe" text="QROC à réponse courte" onClick={() => setVoie('externe')} />
          </div></fieldset>
          <div className="my-6 border-t border-(--color-border)" />
          <fieldset disabled={!voie} className="disabled:opacity-50"><legend className="text-sm font-semibold text-(--color-ink)">2. Ciblage</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Select label="Collège" value={collegeId} onChange={(v) => { setCollegeId(v); setCoursId(''); }}><option value="">Sélectionner un collège</option>{colleges.map((c) => <option key={c.id} value={c.id}>{c.parentId ? `↳ ${c.name}` : c.name}</option>)}</Select>
            <Select label="Item" value={coursId} onChange={setCoursId} disabled={!collegeId}><option value="">Sélectionner un item</option>{courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</Select>
          </div><div className="mt-4"><p className="text-xs font-medium text-(--color-ink-soft)">Formules autorisées</p><div className="mt-2 flex flex-wrap gap-2">{OFFERS.map(([key, label]) => <button key={key} type="button" onClick={() => toggleOffer(key)} className={cn('rounded-lg border px-3 py-2 text-xs font-semibold transition-colors', offers.includes(key) ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary-deep)' : 'border-(--color-border) text-(--color-ink-soft) hover:bg-(--color-surface-soft)')}>{label}</button>)}</div></div></fieldset>
          <div className="my-6 border-t border-(--color-border)" />
          <fieldset disabled={!coursId} className="disabled:opacity-50"><legend className="text-sm font-semibold text-(--color-ink)">3. Document à analyser</legend><div className="mt-3 grid gap-3 sm:grid-cols-2"><Select label="Format" value={format} onChange={(v) => setFormat(v as Format)}>{[['pdf','PDF'],['docx','Document Word (.docx)'],['txt','Texte (.txt)']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}</Select><Select label="Structure" value={mode} onChange={(v) => { setMode(v as Mode); setAnswer(null); }}>{[['combined','Sujet et corrigé dans un document'],['paired','Sujet et corrigé séparés']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}</Select></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2"><FileDrop label={mode === 'combined' ? 'Document à importer' : 'Sujet'} accept={format} file={subject} onFile={(f) => selectFiles(f, answer)} />{mode === 'paired' && <FileDrop label="Corrigé" accept={format} file={answer} onFile={(f) => selectFiles(subject, f)} />}</div>
            <div className="mt-4"><label className="text-xs font-medium text-(--color-ink-soft)">Titre de la série</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Entraînement cardio — sujet 1" className="mt-1 h-10 w-full rounded-lg border border-(--color-border) bg-white px-3 text-sm outline-none focus:border-(--color-primary)" /></div>
          </fieldset>
          {error && <div role="alert" className="mt-5 flex gap-2 rounded-xl bg-[#FFF1F2] p-3 text-sm text-[#B4233C]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
          <div className="mt-6 flex flex-col gap-3 border-t border-(--color-border) pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-(--color-ink-soft)">{voie ? <>Format attendu : <strong className="text-(--color-ink)">{expected}</strong></> : 'Choisissez la voie pour commencer.'}</p><Button type="button" onClick={submit} disabled={!ready || pending} className="min-w-48">{pending ? <Loader2 className="animate-spin" /> : <Send />} {pending ? (etape ?? 'Analyse en cours…') : 'Importer et analyser'}</Button></div>
        </div>
        <aside className="h-fit rounded-2xl border border-[#C9E6D5] bg-[#F3FBF6] p-5"><div className="flex items-center gap-2 text-sm font-semibold text-[#16793C]"><CircleDollarSign className="h-4 w-4" /> Estimation IA</div><p className="mt-2 text-3xl font-semibold tabular-nums text-[#124A2A]">{estimate == null ? '—' : money(estimate)}</p><p className="mt-2 text-xs leading-5 text-[#38624A]">Calculée avant l’analyse à partir de la taille et du type de document. Le montant affiché est conservé pour cet import.</p></aside>
      </section>
      <section className="mt-8"><h2 className="text-lg font-semibold text-(--color-ink)">Imports récents</h2><p className="mt-1 text-sm text-(--color-ink-soft)">Relisez chaque import (rapport de fiabilité, page source, corrections) avant de le publier.</p><div className="mt-4 overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)">{history.length === 0 ? <p className="px-5 py-10 text-center text-sm text-(--color-ink-muted)">Aucun import pour le moment.</p> : <div className="divide-y divide-(--color-border)">{history.map((row) => {
        const f = row.result?.fiabilite ?? null;
        const verdict = f?.verdict ?? null;
        const publiable = row.status === 'ready' && verdict !== 'rouge';
        return <div key={row.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center" data-testid="ligne-import">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-(--color-ink)">{row.title}</p>
            <p className="text-xs text-(--color-ink-muted)">{row.collegeName} · {row.courseTitle} · {row.voie === 'interne' ? 'QCM' : 'QROC'} · {new Date(row.createdAt).toLocaleDateString('fr-FR')}</p>
            {row.error && <p className="mt-1 text-xs text-[#B4233C]">{row.error}</p>}
            {f && <p className="mt-1 text-[11px] text-(--color-ink-soft)" data-testid="compteurs-ligne">{f.questionsImportees}/{f.questionsDocument || f.questionsImportees} questions · {f.questionsManquantes} manquante{f.questionsManquantes > 1 ? 's' : ''} · {f.corrigesCorriges} corrigé{f.corrigesCorriges > 1 ? 's' : ''} corrigé{f.corrigesCorriges > 1 ? 's' : ''} · {f.imagesRattachees}/{f.imagesDocument} image{f.imagesDocument > 1 ? 's' : ''} · {f.alertesBloquantes} bloquante{f.alertesBloquantes > 1 ? 's' : ''} · {f.alertesARelire} à relire</p>}
            {row.result?.meta?.cout?.usd != null && <p className="mt-1 text-[11px] text-(--color-ink-muted)">{row.result.meta.pages ?? '?'} pages · {row.result.meta.lots ?? '?'} lots{row.result.meta.relances?.lots ? ` + ${row.result.meta.relances.lots} relance(s)` : ''} · coût réel {row.result.meta.cout.usd.toFixed(2)} $ · {row.result.meta.model}</p>}
          </div>
          <div className="flex flex-col items-start gap-1 sm:items-center">
            <span className={cn('w-fit rounded-full px-2.5 py-1 text-xs font-semibold', STATUS[row.status]?.className ?? 'bg-slate-100 text-slate-700')}>{STATUS[row.status]?.label ?? row.status}{row.status === 'processing' && avancement(row.result) ? ` · ${avancement(row.result)}` : ''}</span>
            {verdict && <span data-testid="verdict-ligne" className={cn('w-fit rounded-full px-2.5 py-1 text-xs font-semibold', VERDICTS[verdict].pastille)}>{VERDICTS[verdict].label}</span>}
          </div>
          <span className="text-sm font-semibold tabular-nums text-(--color-ink)" title={row.billedPriceCents != null ? `Facturé (estimation ${money(row.estimatedPriceCents)})` : 'Estimation'}>{money(row.billedPriceCents ?? row.estimatedPriceCents)}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setSelected(row)} disabled={!row.result?.questions?.length && !row.result?.questions_ecartees?.length}><Eye /> {row.status === 'ready' ? 'Relire' : 'Détails'}</Button>
            {row.status === 'ready' && <Button size="sm" onClick={() => { if (!publiable) { setSelected(row); return; } start(async () => { try { const r = await publishExerciseImportAction(row.id); if (!r.ok) setError(r.error); else router.refresh(); } catch (e) { setError(messageErreur(e)); router.refresh(); } }); }} disabled={pending || !publiable} title={!publiable ? `${f?.alertesBloquantes ?? ''} alerte(s) bloquante(s) à traiter dans la relecture` : undefined}>Publier</Button>}
            {(row.status === 'failed' || row.status === 'processing') && <Button size="sm" variant="outline" onClick={() => relancer(row.id)} disabled={pending}><RotateCw className="h-4 w-4" /> {row.status === 'failed' ? 'Relancer' : 'Reprendre'}</Button>}
            {!['published','cancelled'].includes(row.status) && <Button size="sm" variant="ghost" onClick={() => start(async () => { try { const r = await cancelExerciseImportAction(row.id); if (!r.ok) setError(r.error); else router.refresh(); } catch (e) { setError(messageErreur(e)); } })} disabled={pending} aria-label="Annuler l’import"><X /></Button>}
          </div>
        </div>; })}</div>}</div></section>
      {selected && <ImportRelecture row={selected} onClose={() => setSelected(null)} onChanged={() => router.refresh()} />}
    </main>
  );
}
const STATUS: Record<string, { label: string; className: string }> = { draft: { label: 'Brouillon', className: 'bg-slate-100 text-slate-700' }, processing: { label: 'Analyse en cours', className: 'bg-amber-100 text-amber-800' }, ready: { label: 'À valider', className: 'bg-blue-100 text-blue-800' }, publishing: { label: 'Publication', className: 'bg-amber-100 text-amber-800' }, published: { label: 'Publié', className: 'bg-green-100 text-green-800' }, cancelled: { label: 'Annulé', className: 'bg-slate-100 text-slate-700' }, failed: { label: 'Échec', className: 'bg-red-100 text-red-800' } };
function Choice({ active, title, text, onClick }: { active: boolean; title: string; text: string; onClick: () => void }) { return <button type="button" onClick={onClick} className={cn('rounded-xl border p-4 text-left transition-colors', active ? 'border-(--color-primary) bg-(--color-primary-soft)' : 'border-(--color-border) hover:bg-(--color-surface-soft)')}><p className="font-semibold text-(--color-ink)">{title}</p><p className="mt-1 text-xs text-(--color-ink-muted)">{text}</p></button>; }
function Select({ label, value, onChange, children, disabled }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode; disabled?: boolean }) { return <label className="block text-xs font-medium text-(--color-ink-soft)">{label}<span className="relative mt-1 block"><select disabled={disabled} value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full appearance-none rounded-lg border border-(--color-border) bg-white px-3 pr-8 text-sm text-(--color-ink) outline-none focus:border-(--color-primary)">{children}</select><ChevronDown className="pointer-events-none absolute right-2 top-3 h-4 w-4 text-(--color-ink-muted)" /></span></label>; }
function FileDrop({ label, accept, file, onFile }: { label: string; accept: Format; file: File | null; onFile: (file: File | null) => void }) { const mime = accept === 'pdf' ? '.pdf,application/pdf' : accept === 'docx' ? '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document' : '.txt,text/plain'; return <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-4 text-center hover:border-(--color-primary)"><UploadCloud className="h-5 w-5 text-(--color-primary)" /><span className="mt-2 text-xs font-semibold text-(--color-ink)">{label}</span><span className="mt-1 max-w-full truncate text-[11px] text-(--color-ink-muted)">{file ? file.name : `Déposer un ${accept.toUpperCase()}`}</span><input type="file" accept={mime} className="sr-only" onChange={(e) => onFile(e.target.files?.[0] ?? null)} /></label>; }
