'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { iconFromKey } from '@/lib/icons';
import { cn } from '@/lib/utils';
import type { NavFaculte } from '@/lib/data/navigator';

function Ring({ value }: { value: number }) {
  const r = 7;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4 shrink-0 -rotate-90" aria-hidden>
      <circle cx="9" cy="9" r={r} fill="none" stroke="var(--color-border)" strokeWidth="2.5" />
      <circle
        cx="9"
        cy="9"
        r={r}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (c * Math.min(100, Math.max(0, value))) / 100}
      />
    </svg>
  );
}

function Node({
  label,
  depth,
  open,
  onToggle,
  hasChildren,
  active,
  href,
  trailing,
  icon,
}: {
  label: string;
  depth: number;
  open?: boolean;
  onToggle?: () => void;
  hasChildren?: boolean;
  active?: boolean;
  href?: string;
  trailing?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const pad = { paddingLeft: `${0.5 + depth * 0.75}rem` };
  const inner = (
    <>
      {hasChildren ? (
        <ChevronRight
          className={cn('h-3.5 w-3.5 shrink-0 text-(--color-ink-muted) transition-transform', open && 'rotate-90')}
        />
      ) : (
        <span className="w-3.5 shrink-0" />
      )}
      {icon}
      <span className="truncate flex-1">{label}</span>
      {trailing}
    </>
  );
  const base =
    'group flex w-full items-center gap-2 rounded-md py-1.5 pr-2 text-sm transition-colors text-left';
  if (href) {
    return (
      <Link
        href={href}
        style={pad}
        className={cn(
          base,
          active
            ? 'bg-(--color-primary) text-white font-medium'
            : 'text-(--color-ink-soft) hover:bg-(--color-sand-100) hover:text-(--color-ink)',
        )}
      >
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onToggle} style={pad} className={cn(base, 'text-(--color-ink) hover:bg-(--color-sand-100)')}>
      {inner}
    </button>
  );
}

export function Navigator({ tree }: { tree: NavFaculte[] }) {
  const pathname = usePathname();

  const activeCoursId = pathname.startsWith('/cours/') ? pathname.split('/')[2] : null;
  const activeMatiereId = pathname.startsWith('/matieres/') ? pathname.split('/')[2] : null;

  // Resolve ancestors of the active course for auto-expansion.
  const ancestors = useMemo(() => {
    const set = new Set<string>();
    for (const f of tree) {
      for (const s of f.semestres) {
        for (const m of s.matieres) {
          const isActiveM = m.id === activeMatiereId;
          const hasActiveC = m.cours.some((c) => c.id === activeCoursId);
          if (isActiveM || hasActiveC) {
            set.add(f.id);
            set.add(s.id);
            set.add(m.id);
          }
        }
      }
    }
    return set;
  }, [tree, activeCoursId, activeMatiereId]);

  const [open, setOpen] = useState<Set<string>>(ancestors);
  const isOpen = (id: string) => open.has(id) || ancestors.has(id);
  const toggle = (id: string) =>
    setOpen((prev) => {
      const n = new Set(prev);
      const currentlyOpen = n.has(id) || ancestors.has(id);
      if (currentlyOpen) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <nav aria-label="Arborescence des cours" className="space-y-0.5 px-2 pb-8">
      {tree.length === 0 && (
        <p className="px-3 py-6 text-xs text-(--color-ink-muted)">Aucun contenu accessible.</p>
      )}
      {tree.map((f) => (
        <div key={f.id}>
          <Node
            label={f.nom}
            depth={0}
            hasChildren
            open={isOpen(f.id)}
            onToggle={() => toggle(f.id)}
          />
          {isOpen(f.id) &&
            f.semestres.map((s) => (
              <div key={s.id}>
                <Node
                  label={s.label}
                  depth={1}
                  hasChildren
                  open={isOpen(s.id)}
                  onToggle={() => toggle(s.id)}
                />
                {isOpen(s.id) &&
                  s.matieres.map((m) => {
                    const Icon = iconFromKey(m.iconKey ?? undefined);
                    return (
                      <div key={m.id}>
                        <Node
                          label={m.nom}
                          depth={2}
                          hasChildren={m.cours.length > 0}
                          open={isOpen(m.id)}
                          onToggle={() => toggle(m.id)}
                          icon={
                            <Icon
                              className="h-3.5 w-3.5 shrink-0"
                              style={{ color: m.colorHex ?? 'var(--color-accent)' }}
                            />
                          }
                        />
                        {isOpen(m.id) &&
                          m.cours.map((c) => (
                            <Node
                              key={c.id}
                              label={c.titre}
                              depth={3}
                              href={`/cours/${c.id}`}
                              active={c.id === activeCoursId}
                              trailing={<Ring value={c.progress} />}
                            />
                          ))}
                      </div>
                    );
                  })}
              </div>
            ))}
        </div>
      ))}
    </nav>
  );
}
