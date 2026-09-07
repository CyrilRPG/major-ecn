'use client';

/**
 * Espace d'entraînement personnel d'un élève sur un item : ses flashcards
 * (révision recto/verso) et ses QCM (correction immédiate, même logique que
 * les séries officielles : `gradeQuestion` + `QcmItem`), avec création,
 * modification et suppression.
 *
 * Aucune persistance des tentatives : ces exercices n'ont pas de ligne dans
 * `qcm_questions` / `flashcards`, donc pas de clé étrangère pour
 * `qcm_attempts` ou `flashcard_reviews`. L'élève s'entraîne, c'est tout.
 */
import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, Layers3, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flashcard } from '@/components/flashcards/flashcard';
import { QcmItem } from '@/components/qcm/qcm-item';
import { gradeQuestion, type ItemOutcome } from '@/lib/qcm/grade';
import { sanitizeBlockHtml } from '@/lib/flashcards/rich-text';
import { cn } from '@/lib/utils';
import { supprimerExerciceEleveAction } from '@/app/(student)/mes-entrainements/actions';
import { htmlVersTexte, type StudentExercise } from '@/lib/student-exercises/regles';
import { StudentExerciseDialog, type ExerciceEnEdition } from './student-exercise-dialog';

const STATUT: Record<StudentExercise['status'], { label: string; className: string }> = {
  private: { label: 'Personnel', className: 'bg-slate-100 text-slate-700' },
  published: { label: 'Dans la base commune', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Non retenu', className: 'bg-amber-100 text-amber-800' },
};

export function StudentExercisesTrainer({ coursId, coursTitre, exercices, backHref, ongletInitial = 'flashcards' }: {
  coursId: string;
  coursTitre: string;
  exercices: StudentExercise[];
  backHref: string;
  ongletInitial?: 'flashcards' | 'qcm';
}) {
  const router = useRouter();
  const [dialog, setDialog] = useState<ExerciceEnEdition | null>(null);
  const [pending, start] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  const flashcards = useMemo(() => exercices.filter((e) => e.kind === 'flashcard'), [exercices]);
  const qcms = useMemo(() => exercices.filter((e) => e.kind === 'qcm'), [exercices]);

  const supprimer = (e: StudentExercise) => {
    if (!confirm(e.kind === 'flashcard' ? 'Supprimer cette flashcard de votre espace ?' : 'Supprimer ce QCM de votre espace ?')) return;
    setErreur(null);
    start(async () => {
      const r = await supprimerExerciceEleveAction({ id: e.id, coursId });
      if (!r.ok) setErreur(r.error); else router.refresh();
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <a href={backHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-(--color-ink-soft) hover:text-(--color-ink)">
          <ArrowLeft className="h-4 w-4" /> {coursTitre}
        </a>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setDialog({ kind: 'flashcard' })}><Plus /> Flashcard</Button>
          <Button size="sm" onClick={() => setDialog({ kind: 'qcm' })}><Plus /> QCM</Button>
        </div>
      </div>

      {erreur && <div role="alert" className="mb-4 rounded-xl bg-[#FFF1F2] p-3 text-sm text-[#B4233C]">{erreur}</div>}

      <Tabs defaultValue={ongletInitial}>
        <TabsList>
          <TabsTrigger value="flashcards"><Layers3 className="mr-1.5 h-4 w-4" /> Mes flashcards ({flashcards.length})</TabsTrigger>
          <TabsTrigger value="qcm"><ClipboardCheck className="mr-1.5 h-4 w-4" /> Mes QCM ({qcms.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="flashcards" className="mt-4 space-y-6">
          {flashcards.length === 0 ? (
            <Vide texte="Aucune flashcard personnelle sur cet item." action={() => setDialog({ kind: 'flashcard' })} libelle="Créer ma première flashcard" />
          ) : (
            <>
              <RevisionFlashcards cartes={flashcards} />
              <ListeExercices exercices={flashcards} pending={pending} onEdit={(e) => setDialog({ kind: 'flashcard', exercice: e })} onDelete={supprimer} />
            </>
          )}
        </TabsContent>

        <TabsContent value="qcm" className="mt-4 space-y-6">
          {qcms.length === 0 ? (
            <Vide texte="Aucun QCM personnel sur cet item." action={() => setDialog({ kind: 'qcm' })} libelle="Créer mon premier QCM" />
          ) : (
            <>
              <EntrainementQcm questions={qcms} />
              <ListeExercices exercices={qcms} pending={pending} onEdit={(e) => setDialog({ kind: 'qcm', exercice: e })} onDelete={supprimer} />
            </>
          )}
        </TabsContent>
      </Tabs>

      {dialog && <StudentExerciseDialog coursId={coursId} cible={dialog} onClose={() => setDialog(null)} />}
    </div>
  );
}

function Vide({ texte, action, libelle }: { texte: string; action: () => void; libelle: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface) p-8 text-center">
      <p className="text-sm text-(--color-ink-soft)">{texte}</p>
      <Button className="mt-4" onClick={action}><Plus /> {libelle}</Button>
    </div>
  );
}

/* ───── Révision des flashcards (file simple, sans persistance) ───── */

function RevisionFlashcards({ cartes }: { cartes: StudentExercise[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const carte = cartes[Math.min(index, cartes.length - 1)];
  const suivante = (delta: number) => { setFlipped(false); setIndex((i) => (i + delta + cartes.length) % cartes.length); };
  return (
    <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft)">
      <div className="relative mx-auto h-72 max-w-xl">
        <Flashcard recto={carte.recto ?? ''} verso={carte.verso ?? ''} flipped={flipped} onFlip={() => setFlipped((f) => !f)} index={index} total={cartes.length} />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => suivante(-1)} disabled={cartes.length < 2}><ArrowLeft /> Précédente</Button>
        <span className="text-xs text-(--color-ink-muted)">Carte {index + 1} / {cartes.length} · touchez la carte pour la retourner</span>
        <Button variant="outline" size="sm" onClick={() => suivante(1)} disabled={cartes.length < 2}>Suivante <ArrowRight /></Button>
      </div>
    </section>
  );
}

/* ───── Entraînement QCM (correction immédiate, sans persistance) ───── */

function EntrainementQcm({ questions }: { questions: StudentExercise[] }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});
  const [validated, setValidated] = useState<Record<string, Record<string, ItemOutcome>>>({});
  const q = questions[Math.min(index, questions.length - 1)];
  const sel = selected[q.id] ?? new Set<string>();
  const outcome = validated[q.id] ?? null;
  const score = useMemo(() => {
    let ok = 0, n = 0;
    for (const qq of questions) {
      const v = validated[qq.id];
      if (!v) continue;
      n++;
      if (Object.values(v).every((o) => o === 'correct')) ok++;
    }
    return { ok, n };
  }, [questions, validated]);

  const toggle = (lettre: string) => {
    if (outcome) return;
    setSelected((prev) => {
      const next = new Set(prev[q.id] ?? []);
      if (next.has(lettre)) next.delete(lettre); else next.add(lettre);
      return { ...prev, [q.id]: next };
    });
  };
  const valider = () => {
    const { perItem } = gradeQuestion(q.items.map((it) => ({ lettre: it.lettre, is_correct: it.is_correct, selected: sel.has(it.lettre) })));
    setValidated((prev) => ({ ...prev, [q.id]: perItem }));
  };
  const recommencer = () => { setSelected({}); setValidated({}); setIndex(0); };

  return (
    <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-5">
      <div className="mb-3 flex items-center justify-between text-xs text-(--color-ink-muted)">
        <span>Question {index + 1} / {questions.length}</span>
        <span className="inline-flex items-center gap-2">
          {score.n > 0 && <span className="rounded-full bg-[#E7F6EC] px-2 py-0.5 font-semibold text-[#16793C]">{score.ok}/{score.n} justes</span>}
          <button type="button" onClick={recommencer} className="inline-flex items-center gap-1 hover:text-(--color-ink)"><RotateCcw className="h-3.5 w-3.5" /> Recommencer</button>
        </span>
      </div>
      <div className="prose prose-sm max-w-none text-[15px] leading-7 text-(--color-ink)" dangerouslySetInnerHTML={{ __html: sanitizeBlockHtml(q.enonce ?? '') }} />
      <ul className="mt-4 space-y-2">
        {q.items.map((it) => (
          <li key={it.lettre}>
            <QcmItem
              item={{ id: `${q.id}-${it.lettre}`, lettre: it.lettre, enonce: it.enonce, justification: it.justification }}
              selected={sel.has(it.lettre)}
              onToggle={() => toggle(it.lettre)}
              outcome={outcome ? outcome[it.lettre] ?? null : null}
              disabled={!!outcome}
              isCorrect={it.is_correct}
            />
          </li>
        ))}
      </ul>
      {outcome && q.correction_generale && (
        <div className="mt-4 rounded-xl border border-[#C9E6D5] bg-[#F3FBF6] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#16793C]">Corrigé</p>
          <div className="mt-1 text-sm leading-6 text-(--color-ink)" dangerouslySetInnerHTML={{ __html: sanitizeBlockHtml(q.correction_generale) }} />
        </div>
      )}
      <div className="mt-4 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}><ArrowLeft /> Précédente</Button>
        {outcome
          ? <Button size="sm" onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))} disabled={index === questions.length - 1}>Suivante <ArrowRight /></Button>
          : <Button size="sm" onClick={valider} disabled={sel.size === 0}><CheckCircle2 /> Valider</Button>}
      </div>
    </section>
  );
}

/* ───── Liste avec édition / suppression ───── */

function ListeExercices({ exercices, pending, onEdit, onDelete }: {
  exercices: StudentExercise[]; pending: boolean;
  onEdit: (e: StudentExercise) => void; onDelete: (e: StudentExercise) => void;
}) {
  return (
    <ul className="divide-y divide-(--color-border) overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)">
      {exercices.map((e) => (
        <li key={e.id} className="flex items-start gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-(--color-ink)">{htmlVersTexte(e.kind === 'flashcard' ? e.recto : e.enonce).slice(0, 140)}</p>
            <p className="mt-0.5 text-xs text-(--color-ink-muted)">
              {e.kind === 'flashcard' ? 'Flashcard' : `QCM · ${e.items.length} propositions`} · {new Date(e.created_at).toLocaleDateString('fr-FR')}
              {e.status === 'rejected' && e.review_note && <> · <span className="text-amber-800">Retour de l’équipe : {e.review_note}</span></>}
            </p>
          </div>
          <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold', STATUT[e.status].className)}>{STATUT[e.status].label}</span>
          <div className="flex shrink-0 gap-1">
            {e.status !== 'published' && (
              <button type="button" onClick={() => onEdit(e)} aria-label="Modifier" className="rounded-lg p-1.5 text-(--color-ink-muted) hover:bg-(--color-surface-soft) hover:text-(--color-ink)"><Pencil className="h-4 w-4" /></button>
            )}
            <button type="button" onClick={() => onDelete(e)} disabled={pending} aria-label="Supprimer" className="rounded-lg p-1.5 text-(--color-ink-muted) hover:bg-[#FFF1F2] hover:text-[#B4233C]"><Trash2 className="h-4 w-4" /></button>
          </div>
        </li>
      ))}
    </ul>
  );
}
