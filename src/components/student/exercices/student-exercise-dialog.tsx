'use client';

/**
 * Formulaire de création / modification d'un entraînement personnel d'élève :
 * une flashcard (recto / verso) ou un QCM (énoncé, propositions vrai/faux
 * avec justification, corrigé général). Saisie en texte simple ; le serveur
 * convertit en HTML sûr (`texteVersHtml`).
 */
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Check, Loader2, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  creerFlashcardEleveAction, creerQcmEleveAction, modifierFlashcardEleveAction, modifierQcmEleveAction,
} from '@/app/(student)/mes-entrainements/actions';
import { LETTRES, htmlVersTexte, type StudentExercise } from '@/lib/student-exercises/regles';

export type ExerciceEnEdition =
  | { kind: 'flashcard'; exercice?: StudentExercise | null }
  | { kind: 'qcm'; exercice?: StudentExercise | null };

type ItemBrouillon = { enonce: string; is_correct: boolean; justification: string };

const ITEMS_INITIAUX: ItemBrouillon[] = Array.from({ length: 5 }, () => ({ enonce: '', is_correct: false, justification: '' }));

export function StudentExerciseDialog({ coursId, cible, onClose, onSaved }: {
  coursId: string;
  cible: ExerciceEnEdition;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const existant = cible.exercice ?? null;
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Flashcard
  const [recto, setRecto] = useState(() => htmlVersTexte(existant?.recto));
  const [verso, setVerso] = useState(() => htmlVersTexte(existant?.verso));
  // QCM
  const [enonce, setEnonce] = useState(() => htmlVersTexte(existant?.enonce));
  const [correction, setCorrection] = useState(() => htmlVersTexte(existant?.correction_generale));
  const [items, setItems] = useState<ItemBrouillon[]>(() =>
    existant?.items?.length
      ? existant.items.map((it) => ({ enonce: htmlVersTexte(it.enonce), is_correct: it.is_correct, justification: htmlVersTexte(it.justification) }))
      : ITEMS_INITIAUX,
  );

  const majItem = (i: number, patch: Partial<ItemBrouillon>) =>
    setItems((prev) => prev.map((it, k) => (k === i ? { ...it, ...patch } : it)));

  const enregistrer = () => {
    setError(null);
    start(async () => {
      try {
        const r = cible.kind === 'flashcard'
          ? existant
            ? await modifierFlashcardEleveAction({ id: existant.id, coursId, recto, verso })
            : await creerFlashcardEleveAction({ coursId, recto, verso })
          : existant
            ? await modifierQcmEleveAction({ id: existant.id, coursId, enonce, items: items.filter((it) => it.enonce.trim()), correction_generale: correction })
            : await creerQcmEleveAction({ coursId, enonce, items: items.filter((it) => it.enonce.trim()), correction_generale: correction });
        if (!r.ok) { setError(r.error); return; }
        onSaved?.();
        router.refresh();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Une erreur inattendue est survenue.');
      }
    });
  };

  const titre = cible.kind === 'flashcard'
    ? (existant ? 'Modifier ma flashcard' : 'Créer ma flashcard')
    : (existant ? 'Modifier mon QCM' : 'Créer mon QCM');

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog" aria-modal="true" aria-labelledby="student-exercise-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-(--color-border) bg-white px-5 py-4">
          <div>
            <p className="text-xs text-(--color-ink-muted)">Mes entraînements · visible de vous seul</p>
            <h3 id="student-exercise-title" className="font-semibold text-(--color-ink)">{titre}</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fermer"><X /></Button>
        </header>

        <div className="space-y-4 p-5">
          {cible.kind === 'flashcard' ? (
            <>
              <Champ label="Recto (question)" value={recto} onChange={setRecto} rows={3} placeholder="Ex. Seuil de BNP en faveur d’une insuffisance cardiaque aiguë ?" />
              <Champ label="Verso (réponse)" value={verso} onChange={setVerso} rows={5} placeholder="Ex. BNP > 100 pg/mL (NT-proBNP > 300) ; en dessous, l’insuffisance cardiaque est très improbable." />
            </>
          ) : (
            <>
              <Champ label="Énoncé" value={enonce} onChange={setEnonce} rows={4} placeholder="Ex. Concernant l’insuffisance cardiaque à FEVG modérément réduite, quelles propositions sont exactes ?" />
              <div>
                <p className="text-xs font-medium text-(--color-ink-soft)">Propositions <span className="font-normal text-(--color-ink-muted)">— cochez celles qui sont exactes</span></p>
                <ul className="mt-2 space-y-2">
                  {items.map((it, i) => (
                    <li key={i} className={cn('rounded-xl border p-3', it.is_correct ? 'border-[#2E8B57] bg-[#F1FAF4]' : 'border-(--color-border)')}>
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          onClick={() => majItem(i, { is_correct: !it.is_correct })}
                          aria-pressed={it.is_correct}
                          aria-label={`Proposition ${LETTRES[i]} ${it.is_correct ? 'exacte' : 'fausse'}`}
                          className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors',
                            it.is_correct ? 'border-[#2E8B57] bg-[#2E8B57] text-white' : 'border-(--color-border) bg-white text-(--color-ink)')}
                        >
                          {it.is_correct ? <Check className="h-4 w-4" /> : LETTRES[i]}
                        </button>
                        <div className="min-w-0 flex-1 space-y-2">
                          <input
                            value={it.enonce} onChange={(e) => majItem(i, { enonce: e.target.value })}
                            placeholder={`Proposition ${LETTRES[i]}`}
                            className="h-9 w-full rounded-lg border border-(--color-border) bg-white px-3 text-sm outline-none focus:border-(--color-primary)"
                          />
                          <input
                            value={it.justification} onChange={(e) => majItem(i, { justification: e.target.value })}
                            placeholder="Justification (facultative)"
                            className="h-9 w-full rounded-lg border border-dashed border-(--color-border) bg-white px-3 text-xs outline-none focus:border-(--color-primary)"
                          />
                        </div>
                        {items.length > 2 && (
                          <button type="button" onClick={() => setItems((prev) => prev.filter((_, k) => k !== i))} aria-label="Retirer la proposition" className="mt-1 text-(--color-ink-muted) hover:text-[#B4233C]">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                {items.length < LETTRES.length && (
                  <button type="button" onClick={() => setItems((prev) => [...prev, { enonce: '', is_correct: false, justification: '' }])} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-(--color-primary-deep)">
                    <Plus className="h-3.5 w-3.5" /> Ajouter une proposition
                  </button>
                )}
              </div>
              <Champ label="Corrigé général (facultatif)" value={correction} onChange={setCorrection} rows={3} placeholder="Point clé à retenir…" />
            </>
          )}

          {error && (
            <div role="alert" className="flex gap-2 rounded-xl bg-[#FFF1F2] p-3 text-sm text-[#B4233C]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}
            </div>
          )}
        </div>

        <footer className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-(--color-border) bg-white px-5 py-4">
          <p className="text-xs text-(--color-ink-muted)">L’équipe pédagogique pourra proposer de l’ajouter à la base commune.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={pending}>Annuler</Button>
            <Button onClick={enregistrer} disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Check />} {existant ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Champ({ label, value, onChange, rows, placeholder }: { label: string; value: string; onChange: (v: string) => void; rows: number; placeholder?: string }) {
  return (
    <label className="block text-xs font-medium text-(--color-ink-soft)">
      {label}
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-(--color-border) bg-white px-3 py-2 text-sm text-(--color-ink) outline-none focus:border-(--color-primary)"
      />
    </label>
  );
}
