'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { BookOpen, ClipboardCheck, FileText, Layers3, MonitorPlay, Search, Zap } from 'lucide-react';
import type { NavCollege } from '@/lib/data/navigator';

type Kind = 'cours' | 'college' | 'fiche' | 'video' | 'qcm' | 'flashcards';

type Flat = {
  id: string;
  href: string;
  label: string;
  hint: string;
  kind: Kind;
};

const CONTENT_TYPES = [
  { kind: 'fiche' as const, label: 'Fiche', flag: 'hasFiche' as const, seg: 'fiche' },
  { kind: 'video' as const, label: 'Vidéo', flag: 'hasVideo' as const, seg: 'video' },
  { kind: 'qcm' as const, label: 'DP · QI', flag: 'hasQcm' as const, seg: 'qcm' },
  { kind: 'flashcards' as const, label: 'Flashcards', flag: 'hasFlashcards' as const, seg: 'flashcards' },
] as const;

const ICON: Record<Kind, typeof BookOpen> = {
  college: BookOpen,
  cours: Layers3,
  fiche: FileText,
  video: MonitorPlay,
  qcm: ClipboardCheck,
  flashcards: Zap,
};

const GROUP_LABEL: Record<Kind, string> = {
  cours: 'Items',
  college: 'Collèges',
  fiche: 'Fiches de cours',
  video: 'Vidéos',
  qcm: 'DP · QI',
  flashcards: 'Flashcards',
};

export function CommandPalette({
  tree,
  open,
  onOpenChange,
}: {
  tree: NavCollege[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();

  const items = useMemo<Flat[]>(() => {
    const out: Flat[] = [];
    for (const col of tree) {
      out.push({ id: col.id, href: `/matieres/${col.id}`, label: col.nom, hint: 'Collège', kind: 'college' });
      for (const c of col.cours) {
        out.push({ id: c.id, href: `/cours/${c.id}`, label: c.titre, hint: col.nom, kind: 'cours' });
        for (const ct of CONTENT_TYPES) {
          if (c[ct.flag]) {
            out.push({
              id: `${c.id}-${ct.kind}`,
              href: `/cours/${c.id}/${ct.seg}`,
              label: `${ct.label} · ${c.titre}`,
              hint: col.nom,
              kind: ct.kind,
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

  if (!open) return null;

  const ORDER: Kind[] = ['cours', 'fiche', 'video', 'qcm', 'flashcards', 'college'];

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
            placeholder="Rechercher un item, une fiche, une vidéo…"
            className="h-12 w-full bg-transparent text-sm text-(--color-ink) outline-none placeholder:text-(--color-ink-muted)"
          />
          <kbd className="hidden rounded border border-(--color-border) px-1.5 py-0.5 text-[10px] text-(--color-ink-muted) sm:block">
            Esc
          </kbd>
        </div>
        <Command.List className="max-h-[50vh] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-8 text-center text-sm text-(--color-ink-muted)">
            Aucun résultat.
          </Command.Empty>
          {ORDER.map((kind) => {
            const group = items.filter((i) => i.kind === kind);
            if (group.length === 0) return null;
            const Icon = ICON[kind];
            return (
              <Command.Group
                key={kind}
                heading={GROUP_LABEL[kind]}
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
