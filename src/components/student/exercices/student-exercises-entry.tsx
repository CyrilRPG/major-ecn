'use client';

/**
 * Point d'entrée « Mes entraînements » sur les pages Flashcards et QCM d'un
 * item : compte des exercices personnels, création directe, accès à l'espace
 * d'entraînement. Quand la table n'existe pas encore (migration à appliquer),
 * la page serveur passe `indisponible` et le bandeau l'explique sans casser
 * la page.
 */
import { useState } from 'react';
import Link from 'next/link';
import { PenLine, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StudentExerciseDialog } from './student-exercise-dialog';
import { MESSAGE_TABLE_ABSENTE } from '@/lib/student-exercises/regles';

export function StudentExercisesEntry({ coursId, kind, count, indisponible = false }: {
  coursId: string;
  kind: 'flashcard' | 'qcm';
  count: number;
  indisponible?: boolean;
}) {
  const [ouvert, setOuvert] = useState(false);
  const nom = kind === 'flashcard' ? 'flashcard' : 'QCM';
  const pluriel = kind === 'flashcard' ? 'flashcards' : 'QCM';
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[#E9D8FD] bg-[#FAF5FF] px-4 py-3 sm:flex-row sm:items-center">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EDE9FE] text-[#6D28D9]">
        <Sparkles className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-(--color-ink)">Mes {pluriel} personnels</p>
        <p className="text-xs text-(--color-ink-soft)">
          {indisponible
            ? MESSAGE_TABLE_ABSENTE
            : count > 0
              ? `${count} ${nom}${count > 1 && kind === 'flashcard' ? 's' : ''} créé${count > 1 ? 's' : ''} par vous sur cet item, visibles de vous seul.`
              : `Ajoutez vos propres ${pluriel} pour cet item : ils n’apparaissent que dans votre espace.`}
        </p>
      </div>
      {!indisponible && (
        <div className="flex shrink-0 gap-2">
          {count > 0 && (
            <Button asChild size="sm" variant="outline">
              <Link href={`/mes-entrainements/${coursId}?onglet=${kind === 'flashcard' ? 'flashcards' : 'qcm'}`}><PenLine /> M’entraîner</Link>
            </Button>
          )}
          <Button size="sm" onClick={() => setOuvert(true)}><Plus /> Créer {kind === 'flashcard' ? 'une flashcard' : 'un QCM'}</Button>
        </div>
      )}
      {ouvert && <StudentExerciseDialog coursId={coursId} cible={{ kind }} onClose={() => setOuvert(false)} />}
    </div>
  );
}
