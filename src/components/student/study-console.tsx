'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardCheck, FileText, Layers3, MessageCircle,
  MonitorPlay, Telescope, X, type LucideIcon,
} from 'lucide-react';
import { CourseChatbot } from '@/components/course-chatbot';
import { cn } from '@/lib/utils';

export type Availability = {
  video: boolean;
  fiche: boolean;
  qcm: boolean;
  flashcards: boolean;
};

type Tab = { key: string; label: string; seg: string; Icon: LucideIcon; available: boolean };

function MasteryGauge({ value }: { value: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-12 w-12 shrink-0 sm:h-14 sm:w-14">
      <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="var(--color-sand-200)" strokeWidth="5" />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * Math.min(100, Math.max(0, value))) / 100}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums text-(--color-ink) sm:text-sm">
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
    { key: 'flashcards', label: 'Flashcards', seg: 'flashcards', Icon: Layers3, available: availability.flashcards },
  ];

  return (
    <div className="relative">
      {/* Console header — sticky, page scrolls underneath (so QCM/long content scrolls).
          Mobile : padding réduit, gauge compacte, titre 1 ligne tronqué. */}
      <div className="sticky top-0 z-20 border-b border-(--color-border) bg-(--color-surface)/95 px-3 py-2 backdrop-blur sm:px-4 sm:py-3 lg:px-8">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <MasteryGauge value={mastery} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-medium text-(--color-ink-muted) sm:text-xs">{context}</p>
            <h1 className="truncate text-sm font-semibold tracking-tight text-(--color-ink) sm:text-lg">{titre}</h1>
          </div>
          <button
            type="button"
            onClick={() => setAssistantOpen((v) => !v)}
            aria-label="Assistant du cours"
            className={cn(
              'flex h-9 shrink-0 items-center gap-2 rounded-lg px-2.5 text-sm font-semibold transition-colors focus-ring sm:px-3',
              assistantOpen
                ? 'bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] text-white shadow-[0_6px_20px_-8px_rgba(228,0,43,0.6)]'
                : 'border border-(--color-border) bg-(--color-surface-soft) text-(--color-ink-soft) hover:border-(--color-border-strong)',
            )}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Assistant</span>
          </button>
        </div>

        {/* Tabs : scroll horizontal sur mobile, icônes seules très étroites */}
        <div className="-mx-3 mt-2 flex gap-0.5 overflow-x-auto px-3 sm:mx-0 sm:mt-3 sm:gap-1 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => {
            const active = activeSeg === t.seg;
            return (
              <Link
                key={t.key}
                href={`${base}${t.seg ? `/${t.seg}` : ''}`}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-colors focus-ring sm:gap-2 sm:px-3 sm:py-2.5 sm:text-sm',
                  active
                    ? 'bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] text-white shadow-[0_6px_20px_-8px_rgba(228,0,43,0.6)]'
                    : 'text-(--color-ink-soft) hover:bg-(--color-sand-100) hover:text-(--color-ink)',
                )}
              >
                <t.Icon className="h-4 w-4 shrink-0" />
                {t.label}
                {!t.available && t.seg && (
                  <span
                    className={cn('h-1.5 w-1.5 rounded-full', active ? 'bg-white' : 'bg-(--color-ink-muted)')}
                    title="Bientôt disponible"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Viewer — when assistant is docked, leave room on large screens */}
      <div className={cn('transition-[padding]', assistantOpen && 'lg:pr-[380px]')}>{children}</div>

      {/* Non-modal assistant dock: no backdrop, platform stays usable */}
      {assistantOpen && (
        <aside
          className={cn(
            'fixed z-40 flex flex-col border-(--color-border) bg-(--color-surface) shadow-(--shadow-lifted)',
            // mobile: bottom sheet · desktop: right dock
            'inset-x-0 bottom-0 h-[70vh] rounded-t-2xl border-t',
            'lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-[380px] lg:rounded-none lg:border-l lg:border-t-0',
          )}
        >
          <div className="flex items-center justify-between border-b border-(--color-border) px-4 py-3">
            <span className="text-sm font-semibold text-(--color-ink)">Assistant du cours</span>
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
      )}
    </div>
  );
}
