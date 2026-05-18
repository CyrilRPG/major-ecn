'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { BookOpen, GraduationCap, Layers3, Search } from 'lucide-react';
import type { NavFaculte } from '@/lib/data/navigator';

type Flat = {
  id: string;
  href: string;
  label: string;
  hint: string;
  kind: 'faculte' | 'matiere' | 'cours';
};

export function CommandPalette({
  tree,
  open,
  onOpenChange,
}: {
  tree: NavFaculte[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();

  const items = useMemo<Flat[]>(() => {
    const out: Flat[] = [];
    for (const f of tree) {
      out.push({ id: f.id, href: `/facultes/${f.id}`, label: f.nom, hint: f.ville, kind: 'faculte' });
      for (const s of f.semestres) {
        for (const m of s.matieres) {
          out.push({
            id: m.id,
            href: `/matieres/${m.id}`,
            label: m.nom,
            hint: `${f.nom} · ${s.label}`,
            kind: 'matiere',
          });
          for (const c of m.cours) {
            out.push({
              id: c.id,
              href: `/cours/${c.id}`,
              label: c.titre,
              hint: `${m.nom} · ${s.label}`,
              kind: 'cours',
            });
          }
        }
      }
    }
    return out;
  }, [tree]);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  const ICON = {
    faculte: GraduationCap,
    matiere: BookOpen,
    cours: Layers3,
  } as const;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 p-4 pt-[12vh]"
      onClick={() => onOpenChange(false)}
    >
      <Command
        label="Recherche globale"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-lifted)"
        onClick={(e) => e.stopPropagation()}
        loop
      >
        <div className="flex items-center gap-2 border-b border-(--color-border) px-4">
          <Search className="h-4 w-4 text-(--color-ink-muted)" />
          <Command.Input
            autoFocus
            placeholder="Rechercher une faculté, une matière, un cours…"
            className="h-12 w-full bg-transparent text-sm text-(--color-ink) outline-none placeholder:text-(--color-ink-muted)"
          />
          <kbd className="hidden sm:block rounded border border-(--color-border) px-1.5 py-0.5 text-[10px] text-(--color-ink-muted)">
            Esc
          </kbd>
        </div>
        <Command.List className="max-h-[50vh] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-8 text-center text-sm text-(--color-ink-muted)">
            Aucun résultat.
          </Command.Empty>
          {(['cours', 'matiere', 'faculte'] as const).map((kind) => {
            const group = items.filter((i) => i.kind === kind);
            if (group.length === 0) return null;
            const Icon = ICON[kind];
            const heading = kind === 'cours' ? 'Cours' : kind === 'matiere' ? 'Matières' : 'Facultés';
            return (
              <Command.Group
                key={kind}
                heading={heading}
                className="px-1 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-ink-muted) [&_[cmdk-group-items]]:mt-1"
              >
                {group.map((i) => (
                  <Command.Item
                    key={`${kind}-${i.id}`}
                    value={`${i.label} ${i.hint}`}
                    onSelect={() => go(i.href)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-(--color-ink) data-[selected=true]:bg-(--color-primary) data-[selected=true]:text-white"
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-70" />
                    <span className="flex-1 truncate font-normal normal-case tracking-normal">{i.label}</span>
                    <span className="truncate text-xs opacity-60 normal-case tracking-normal">{i.hint}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            );
          })}
        </Command.List>
      </Command>
    </div>
  );
}
