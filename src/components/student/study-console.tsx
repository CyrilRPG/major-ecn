'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardCheck, FileText, History, Layers3, MessageCircle,
  MonitorPlay, PanelRight, Telescope, X, type LucideIcon,
} from 'lucide-react';
import { CourseChatbot } from '@/components/course-chatbot';
import { cn } from '@/lib/utils';

export type Availability = {
  video: boolean;
  fiche: boolean;
  qcm: boolean;
  annales: boolean;
  flashcards: boolean;
};

type Tab = { key: string; label: string; seg: string; Icon: LucideIcon; available: boolean };

function MasteryGauge({ value }: { value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--color-sand-200)" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * Math.min(100, Math.max(0, value))) / 100}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums text-(--color-ink)">
        {value}%
      </span>
    </div>
  );
}

export function StudyConsole({
  coursId,
  titre,
  context,
  availability,
  mastery,
  children,
}: {
  coursId: string;
  titre: string;
  context: string;
  availability: Availability;
  mastery: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [assistantOpen, setAssistantOpen] = useState(false);

  const base = `/cours/${coursId}`;
  const after = pathname.startsWith(base) ? pathname.slice(base.length) : '';
  const activeSeg = after.split('/')[1] ?? '';

  const tabs: Tab[] = [
    { key: 'apercu', label: 'Aperçu', seg: '', Icon: Telescope, available: true },
    { key: 'video', label: 'Cours vidéo', seg: 'video', Icon: MonitorPlay, available: availability.video },
    { key: 'fiche', label: 'Fiche', seg: 'fiche', Icon: FileText, available: availability.fiche },
    { key: 'qcm', label: 'DP · QI', seg: 'qcm', Icon: ClipboardCheck, available: availability.qcm },
    { key: 'annales', label: 'Annales', seg: 'annales', Icon: History, available: availability.annales },
    { key: 'flashcards', label: 'Flashcards', seg: 'flashcards', Icon: Layers3, available: availability.flashcards },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Console header */}
      <div className="border-b border-(--color-border) bg-(--color-surface) px-4 py-4 lg:px-8">
        <div className="flex items-center gap-4">
          <MasteryGauge value={mastery} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-(--color-ink-muted)">{context}</p>
            <h1 className="truncate text-lg font-semibold tracking-tight text-(--color-ink)">{titre}</h1>
          </div>
          <button
            type="button"
            onClick={() => setAssistantOpen(true)}
            className="flex h-9 items-center gap-2 rounded-lg border border-(--color-border) bg-(--color-surface-soft) px-3 text-sm text-(--color-ink-soft) hover:border-(--color-border-strong) focus-ring"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Assistant</span>
          </button>
        </div>

        {/* Activity switcher */}
        <div className="mt-4 flex gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const active = activeSeg === t.seg;
            return (
              <Link
                key={t.key}
                href={`${base}${t.seg ? `/${t.seg}` : ''}`}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors focus-ring',
                  active
                    ? 'bg-(--color-primary) text-white'
                    : 'text-(--color-ink-soft) hover:bg-(--color-sand-100)',
                )}
              >
                <t.Icon className="h-4 w-4" />
                {t.label}
                {!t.available && t.seg && (
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      active ? 'bg-white/60' : 'bg-(--color-ink-muted)',
                    )}
                    title="Bientôt disponible"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Viewer pane */}
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

      {/* Assistant slide-over */}
      {assistantOpen && (
        <div className="fixed inset-0 z-[55]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAssistantOpen(false)} />
          <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-(--color-border) bg-(--color-surface) shadow-(--shadow-lifted)">
            <div className="flex items-center justify-between border-b border-(--color-border) px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-(--color-ink)">
                <PanelRight className="h-4 w-4 text-(--color-accent)" />
                Assistant du cours
              </span>
              <button
                type="button"
                onClick={() => setAssistantOpen(false)}
                aria-label="Fermer l’assistant"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-ink-soft) hover:bg-(--color-sand-100) focus-ring"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <CourseChatbot coursId={coursId} coursTitre={titre} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
