'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FileText, NotebookPen, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NoteEntry = {
  coursId: string;
  titre: string;
  college: string;
  preview: string;
  html: string;
  updatedAt: string;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function NotesGrid({ notes }: { notes: NoteEntry[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return notes;
    const q = query.toLowerCase();
    return notes.filter(
      (n) =>
        n.titre.toLowerCase().includes(q) ||
        n.college.toLowerCase().includes(q) ||
        n.preview.toLowerCase().includes(q),
    );
  }, [notes, query]);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ background: '#FEF9C3', color: '#CA8A04' }}
          >
            <NotebookPen className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-(--color-ink) sm:text-2xl">
              Prises de notes
            </h1>
            <p className="text-sm text-(--color-ink-soft)">
              {notes.length === 0
                ? 'Aucune note pour le moment'
                : `${notes.length} item${notes.length > 1 ? 's' : ''} avec des notes`}
            </p>
          </div>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-(--color-border) bg-(--color-surface) px-6 py-16 text-center">
          <span
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: '#FEF9C3', color: '#CA8A04' }}
          >
            <NotebookPen className="h-8 w-8" />
          </span>
          <h2 className="text-lg font-bold text-(--color-ink)">
            Aucune prise de notes
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-(--color-ink-soft)">
            Vous n'avez pas encore de notes enregistrées. Rendez-vous dans un item
            et ouvrez l'onglet « Prise de notes » pour commencer.
          </p>
        </div>
      ) : (
        <>
          {/* Search bar */}
          <div className="relative mb-5">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher dans les notes (titre, collège, contenu)…"
              className="h-11 w-full rounded-xl border border-(--color-border) bg-(--color-surface) pl-10 pr-4 text-sm text-(--color-ink) outline-none transition-colors placeholder:text-(--color-ink-muted) focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-(--color-border) bg-(--color-surface) px-6 py-12 text-center">
              <p className="text-sm text-(--color-ink-soft)">
                Aucune note ne correspond à « {query} ».
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((n) => (
                <Link
                  key={n.coursId}
                  href={`/notes/${n.coursId}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) transition-all hover:-translate-y-0.5 hover:shadow-(--shadow-lifted)"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-50"
                    style={{ background: 'linear-gradient(135deg, transparent 55%, #FEF9C3 100%)' }}
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-5 bottom-0 select-none opacity-[0.07]"
                    style={{ color: '#CA8A04' }}
                  >
                    <NotebookPen className="h-36 w-36" strokeWidth={1.4} />
                  </span>

                  <div className="relative">
                    <div className="mb-3 flex items-start gap-2.5">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: '#FEF9C3', color: '#CA8A04' }}
                      >
                        <FileText className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-(--color-ink-muted)">
                          {n.college}
                        </p>
                        <h3 className="truncate text-sm font-bold text-(--color-ink)">
                          {n.titre}
                        </h3>
                      </div>
                    </div>
                    <p className="line-clamp-3 text-[13px] leading-relaxed text-(--color-ink-soft)">
                      {n.preview}
                    </p>
                  </div>

                  <div className="relative mt-4 flex items-center justify-between">
                    <span className="text-[11px] text-(--color-ink-muted)">
                      {formatDate(n.updatedAt)}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold"
                      style={{ color: '#CA8A04' }}
                    >
                      Ouvrir <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
