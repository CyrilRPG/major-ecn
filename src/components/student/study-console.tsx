'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardCheck, FileText, Layers3, Lock, MessageCircle,
  MonitorPlay, NotebookPen, Sparkles, Telescope, Video, X, type LucideIcon,
} from 'lucide-react';
import { CourseChatbot } from '@/components/course-chatbot';
import { LockedContentModal } from '@/components/espace-decouverte/locked-content-modal';
import { cn } from '@/lib/utils';

export type Availability = {
  video: boolean;
  fiche: boolean;
  qcm: boolean;
  flashcards: boolean;
  seanceApprofondie?: boolean;
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
  isDecouverte = false,
  visibility,
  children,
}: {
  coursId: string;
  titre: string;
  context: string;
  availability: Availability;
  mastery: number;
  /** Mode Découverte : verrouille l'onglet "Cours vidéo" (popup tarifs au clic
   *  au lieu de naviguer vers /video). */
  isDecouverte?: boolean;
  /** Visibilité par onglet (clé = type de contenu). `false` masque totalement
   *  l'onglet. Utilisé pour les professeurs : un type sans droit de lecture
   *  (`content_permissions` = 'none') ne doit pas apparaître du tout. Absent /
   *  undefined = visible (élèves, admin). */
  visibility?: Partial<Record<string, boolean>>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [lockedOpen, setLockedOpen] = useState(false);

  const base = `/cours/${coursId}`;
  const after = pathname.startsWith(base) ? pathname.slice(base.length) : '';
  const activeSeg = after.split('/')[1] ?? '';

  /** Si AUCUN contenu pédagogique n'est encore disponible pour ce cours
   *  (cas typique de « Méthodologie EVC » côté Découverte), on n'affiche
   *  QUE l'onglet Aperçu — les autres tabs (Fiche, Vidéo, QCM, Flashcards)
   *  sont masquées pour ne pas exposer des liens menant à des pages vides. */
  const hasAnyContent =
    availability.fiche || availability.video || availability.qcm || availability.flashcards;

  const tabs: Tab[] = hasAnyContent
    ? [
        { key: 'apercu', label: 'Aperçu', seg: '', Icon: Telescope, available: true },
        { key: 'fiche', label: 'Fiche', seg: 'fiche', Icon: FileText, available: availability.fiche },
        { key: 'video', label: 'Cours vidéo', seg: 'video', Icon: MonitorPlay, available: availability.video },
        { key: 'qcm', label: 'DP · QI', seg: 'qcm', Icon: ClipboardCheck, available: availability.qcm },
        { key: 'flashcards', label: 'Flashcards', seg: 'flashcards', Icon: Layers3, available: availability.flashcards },
        ...(availability.seanceApprofondie
          ? [{ key: 'seance-approfondie', label: 'Séance approfondie', seg: 'seance-approfondie', Icon: Video, available: true }]
          : []),
        { key: 'notes', label: 'Prise de notes', seg: 'notes', Icon: NotebookPen, available: true },
      ]
    : [
        { key: 'apercu', label: 'Aperçu', seg: '', Icon: Telescope, available: true },
        { key: 'notes', label: 'Prise de notes', seg: 'notes', Icon: NotebookPen, available: true },
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
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-white px-2.5 text-sm font-bold text-[#E4002B] transition-transform hover:scale-[1.02] focus-ring sm:px-3"
            style={{
              backgroundImage: assistantOpen
                ? 'linear-gradient(#FFFFFF,#FFFFFF), linear-gradient(90deg,#E4002B 0%,#F97316 100%)'
                : 'linear-gradient(#FFFFFF,#FFFFFF), linear-gradient(0deg,var(--color-border),var(--color-border))',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              border: '1.5px solid transparent',
            }}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] bg-clip-text text-transparent sm:inline">
              Assistant
            </span>
          </button>
        </div>

        {/* Tabs : scroll horizontal sur mobile, icônes seules très étroites */}
        <div className="-mx-3 mt-2 flex gap-0.5 overflow-x-auto px-3 sm:mx-0 sm:mt-3 sm:gap-1 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.filter((t) => visibility?.[t.key] !== false).map((t) => {
            const active = activeSeg === t.seg;
            // Mode Découverte : l'onglet "Cours vidéo" est un cadenas qui ouvre
            // la popup tarifs au lieu de naviguer vers /video.
            const isLockedVideo = isDecouverte && t.seg === 'video';
            const commonInnerClasses = cn(
              'group relative flex items-center gap-1.5 whitespace-nowrap px-2.5 py-2 text-[13px] font-medium transition-colors focus-ring sm:gap-2 sm:px-3 sm:py-2.5 sm:text-sm',
              active
                ? 'text-[#E4002B] font-bold'
                : 'text-(--color-ink-soft) hover:text-(--color-ink)',
            );
            const inner = (
              <>
                <t.Icon className="h-4 w-4 shrink-0" />
                {active ? (
                  <span className="bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] bg-clip-text text-transparent">
                    {t.label}
                  </span>
                ) : (
                  <span>{t.label}</span>
                )}
                {isLockedVideo ? (
                  <Lock
                    className="h-3 w-3 shrink-0"
                    style={{ color: '#C0112E' }}
                    aria-hidden
                  />
                ) : (
                  !t.available && t.seg && (
                    <span
                      className={cn('h-1.5 w-1.5 rounded-full', active ? 'bg-[#E4002B]' : 'bg-(--color-ink-muted)')}
                      title="Bientôt disponible"
                    />
                  )
                )}
                {active && (
                  <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)]" />
                )}
              </>
            );
            if (isLockedVideo) {
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setLockedOpen(true)}
                  aria-label={`${t.label} — verrouillé`}
                  className={commonInnerClasses}
                >
                  {inner}
                </button>
              );
            }
            return (
              <Link
                key={t.key}
                href={`${base}${t.seg ? `/${t.seg}` : ''}`}
                className={commonInnerClasses}
              >
                {inner}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Popup "Ce contenu est réservé" — déclenchée par l'onglet Cours vidéo
          verrouillé en mode Découverte. */}
      <LockedContentModal open={lockedOpen} onClose={() => setLockedOpen(false)} />

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
            <CourseChatbot coursId={coursId} coursTitre={titre} isDecouverte={isDecouverte} />
          </div>
        </aside>
      )}
    </div>
  );
}
