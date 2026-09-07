'use client';

/**
 * « Entraînements d'élèves » — tableau de relecture pour l'équipe pédagogique.
 * Chaque proposition (flashcard ou QCM d'un élève) se déplie pour être lue en
 * entier ; « Ajouter à la base commune » la copie dans les contenus publics
 * de l'item, « Ne pas retenir » la laisse dans l'espace de l'élève avec un
 * retour facultatif.
 */
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Check, ChevronDown, ChevronUp, ClipboardCheck, Layers3, Loader2, RotateCcw, Undo2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { sanitizeBlockHtml } from '@/lib/flashcards/rich-text';
import { publierExerciceEleveAction, refuserExerciceEleveAction, reouvrirExerciceEleveAction } from '@/app/admin/entrainements-eleves/actions';
import { htmlVersTexte, type StudentExercise } from '@/lib/student-exercises/regles';

export type StudentExerciseRow = StudentExercise & {
  eleve: { nom: string; email: string | null };
  cours: { id: string; titre: string; college: string };
  /** Le lecteur peut agir (droit d'écriture sur le type ET item dans son périmètre). */
  peutAgir: boolean;
};

export type FiltreStatut = 'private' | 'published' | 'rejected' | 'all';

const STATUT: Record<StudentExercise['status'], { label: string; className: string }> = {
  private: { label: 'À examiner', className: 'bg-blue-100 text-blue-800' },
  published: { label: 'Dans la base commune', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Non retenu', className: 'bg-amber-100 text-amber-800' },
};

export function StudentExercisesTable({ rows, filtre, compteurs }: {
  rows: StudentExerciseRow[];
  filtre: FiltreStatut;
  compteurs: Record<FiltreStatut, number>;
}) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const agir = (id: string, fn: () => Promise<{ ok: true } | { ok: false; error: string }>) => {
    setErreur(null); setEnCours(id);
    start(async () => {
      try {
        const r = await fn();
        if (!r.ok) setErreur(r.error); else router.refresh();
      } catch (e) {
        setErreur(e instanceof Error ? e.message : 'Une erreur inattendue est survenue.');
      } finally {
        setEnCours(null);
      }
    });
  };
  const refuser = (id: string) => {
    const note = prompt('Retour à l’élève (facultatif) :', '') ?? undefined;
    if (note === undefined && !confirm('Ne pas retenir cette proposition ?')) return;
    agir(id, () => refuserExerciceEleveAction({ id, note: note || undefined }));
  };

  const onglets: Array<[FiltreStatut, string]> = [['private', 'À examiner'], ['published', 'Dans la base commune'], ['rejected', 'Non retenus'], ['all', 'Tous']];

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {onglets.map(([k, label]) => (
          <Link key={k} href={`/admin/entrainements-eleves?statut=${k}`} className={cn('rounded-full px-3 py-1.5 text-xs font-semibold transition-colors', filtre === k ? 'bg-(--color-primary) text-white' : 'bg-(--color-surface-soft) text-(--color-ink-soft) hover:bg-(--color-sand-100)')}>
            {label} <span className="opacity-70">({compteurs[k]})</span>
          </Link>
        ))}
      </div>

      {erreur && <div role="alert" className="mb-4 flex gap-2 rounded-xl bg-[#FFF1F2] p-3 text-sm text-[#B4233C]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{erreur}</div>}

      <div className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)">
        {rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-(--color-ink-muted)">Aucune proposition dans cette catégorie.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--color-border) bg-(--color-surface-soft)">
                  {['Type', 'Aperçu', 'Élève', 'Item', 'Date', 'Statut', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-(--color-ink-muted)">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-border)">
                {rows.map((r) => {
                  const estOuvert = ouvert === r.id;
                  const occupe = pending && enCours === r.id;
                  return (
                    <RowGroup key={r.id}>
                      <tr className="align-top">
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--color-ink)">
                            {r.kind === 'flashcard' ? <Layers3 className="h-4 w-4 text-[#6D28D9]" /> : <ClipboardCheck className="h-4 w-4 text-[#1E4D8B]" />}
                            {r.kind === 'flashcard' ? 'Flashcard' : `QCM · ${r.items.length}`}
                          </span>
                        </td>
                        <td className="max-w-md px-4 py-3">
                          <button type="button" onClick={() => setOuvert(estOuvert ? null : r.id)} className="flex w-full items-start gap-2 text-left">
                            <span className="line-clamp-2 text-(--color-ink)">{htmlVersTexte(r.kind === 'flashcard' ? r.recto : r.enonce).slice(0, 200)}</span>
                            {estOuvert ? <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-(--color-ink-muted)" /> : <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-(--color-ink-muted)" />}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <p className="font-medium text-(--color-ink)">{r.eleve.nom}</p>
                          {r.eleve.email && <p className="text-(--color-ink-muted)">{r.eleve.email}</p>}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <p className="text-(--color-ink-muted)">{r.cours.college}</p>
                          <Link href={`/admin/contenu/${r.cours.id}`} className="font-medium text-(--color-ink) underline-offset-2 hover:underline">{r.cours.titre}</Link>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-(--color-ink-soft)">{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                        <td className="px-4 py-3">
                          <span className={cn('whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold', STATUT[r.status].className)}>{STATUT[r.status].label}</span>
                          {r.status === 'rejected' && r.review_note && <p className="mt-1 max-w-[16rem] text-[11px] text-amber-800">{r.review_note}</p>}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {r.peutAgir ? (
                            <div className="flex justify-end gap-1.5">
                              {r.status === 'private' && (
                                <>
                                  <Button size="sm" onClick={() => agir(r.id, () => publierExerciceEleveAction(r.id))} disabled={pending}>
                                    {occupe ? <Loader2 className="animate-spin" /> : <Check />} Ajouter à la base commune
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => refuser(r.id)} disabled={pending}><X /> Ne pas retenir</Button>
                                </>
                              )}
                              {r.status === 'rejected' && (
                                <Button size="sm" variant="outline" onClick={() => agir(r.id, () => reouvrirExerciceEleveAction(r.id))} disabled={pending}><Undo2 /> Réexaminer</Button>
                              )}
                              {r.status === 'published' && (
                                <Button asChild size="sm" variant="outline">
                                  <Link href={`/admin/contenu/${r.cours.id}`}><RotateCcw /> Voir dans Contenu</Link>
                                </Button>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-(--color-ink-muted)">Lecture seule (hors périmètre)</span>
                          )}
                        </td>
                      </tr>
                      {estOuvert && (
                        <tr className="bg-(--color-surface-soft)/60">
                          <td colSpan={7} className="px-6 py-4">
                            <Apercu r={r} />
                          </td>
                        </tr>
                      )}
                    </RowGroup>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function RowGroup({ children }: { children: React.ReactNode }) { return <>{children}</>; }

function Apercu({ r }: { r: StudentExerciseRow }) {
  if (r.kind === 'flashcard') {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--color-border) bg-white p-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">Recto</p><div className="mt-1 text-sm leading-6" dangerouslySetInnerHTML={{ __html: sanitizeBlockHtml(r.recto ?? '') }} /></div>
        <div className="rounded-xl border border-(--color-border) bg-white p-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">Verso</p><div className="mt-1 text-sm leading-6" dangerouslySetInnerHTML={{ __html: sanitizeBlockHtml(r.verso ?? '') }} /></div>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-(--color-border) bg-white p-3 text-sm leading-6" dangerouslySetInnerHTML={{ __html: sanitizeBlockHtml(r.enonce ?? '') }} />
      <ul className="space-y-2">
        {r.items.map((it) => (
          <li key={it.lettre} className={cn('rounded-xl border p-3 text-sm', it.is_correct ? 'border-[#2E8B57] bg-[#F1FAF4]' : 'border-(--color-border) bg-white')}>
            <p className="flex items-start gap-2 font-medium text-(--color-ink)">
              <span className={cn('inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold', it.is_correct ? 'bg-[#2E8B57] text-white' : 'bg-(--color-surface-soft)')}>{it.lettre}</span>
              <span dangerouslySetInnerHTML={{ __html: sanitizeBlockHtml(it.enonce) }} />
            </p>
            {it.justification && <div className="mt-1 pl-8 text-xs leading-5 text-(--color-ink-soft)" dangerouslySetInnerHTML={{ __html: sanitizeBlockHtml(it.justification) }} />}
          </li>
        ))}
      </ul>
      {r.correction_generale && (
        <div className="rounded-xl border border-[#C9E6D5] bg-[#F3FBF6] p-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-[#16793C]">Corrigé général</p><div className="mt-1 text-sm leading-6" dangerouslySetInnerHTML={{ __html: sanitizeBlockHtml(r.correction_generale) }} /></div>
      )}
    </div>
  );
}
