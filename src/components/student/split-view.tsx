'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  BookMarked, ClipboardCheck, Columns2, FileText, Layers3, Lock, MonitorPlay,
  NotebookPen, Video, X, type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotesEditor } from './notes-editor';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type SplitContentType = 'fiche' | 'fiche-express' | 'video' | 'qcm' | 'flashcards' | 'seance-approfondie' | 'notes';

type SplitCtx = {
  active: SplitContentType | null;
  open: (type: SplitContentType) => void;
  close: () => void;
  splitPct: number;
  setSplitPct: (pct: number) => void;
  coursId: string;
  hasFiche: boolean;
  hasVideo: boolean;
  hasQcm: boolean;
  hasFlashcards: boolean;
  hasSeanceApprofondie: boolean;
  locked: Partial<Record<string, boolean>>;
  notesHtml: string;
};

const SplitContext = createContext<SplitCtx>({
  active: null, open: () => {}, close: () => {},
  splitPct: 50, setSplitPct: () => {},
  coursId: '', hasFiche: false, hasVideo: false,
  hasQcm: false, hasFlashcards: false, hasSeanceApprofondie: false,
  locked: {}, notesHtml: '',
});
export const useSplitView = () => useContext(SplitContext);

/* ------------------------------------------------------------------ */
/*  Content type config                                                */
/* ------------------------------------------------------------------ */

const SPLIT_OPTIONS: { type: SplitContentType; label: string; Icon: LucideIcon }[] = [
  { type: 'fiche', label: 'Fiche de cours', Icon: FileText },
  { type: 'fiche-express', label: 'Fiche Express', Icon: BookMarked },
  { type: 'video', label: 'Vidéo', Icon: MonitorPlay },
  { type: 'seance-approfondie', label: 'Séance approf.', Icon: Video },
  { type: 'qcm', label: 'DP · QI', Icon: ClipboardCheck },
  { type: 'flashcards', label: 'Flashcards', Icon: Layers3 },
  { type: 'notes', label: 'Prise de notes', Icon: NotebookPen },
];

/* ------------------------------------------------------------------ */
/*  Draggable divider                                                  */
/* ------------------------------------------------------------------ */

function Divider({ onResize }: { onResize: (pct: number) => void }) {
  const dragging = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const parent = (e.currentTarget as HTMLElement).parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const pct = Math.min(80, Math.max(20, ((e.clientX - rect.left) / rect.width) * 100));
    onResize(pct);
  }, [onResize]);

  const onPointerUp = useCallback(() => { dragging.current = false; }, []);

  return (
    <div
      className="group relative z-10 flex w-2 shrink-0 cursor-col-resize items-center justify-center hover:bg-(--color-primary)/10"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="h-8 w-1 rounded-full bg-(--color-border) transition-colors group-hover:bg-(--color-primary)" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Video panel (fetches embed URL client-side)                        */
/* ------------------------------------------------------------------ */

function VideoPanel({ coursId }: { coursId: string }) {
  const [state, setState] = useState<{ embedUrl?: string; signedUrl?: string; error?: string } | null>(null);

  useEffect(() => {
    fetch(`/api/cours/${coursId}/video-embed`)
      .then((r) => r.json())
      .then(setState)
      .catch(() => setState({ error: 'Erreur de chargement' }));
  }, [coursId]);

  if (!state) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-(--color-ink-muted)">
        Chargement de la vidéo…
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-(--color-ink-muted)">
        {state.error}
      </div>
    );
  }

  if (state.embedUrl) {
    return (
      <iframe
        src={state.embedUrl}
        title="Vidéo du cours"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className="h-full w-full border-0"
      />
    );
  }

  if (state.signedUrl) {
    return (
      <video src={state.signedUrl} controls className="h-full w-full bg-black" />
    );
  }

  return null;
}

/* ------------------------------------------------------------------ */
/*  Split panel content                                                */
/* ------------------------------------------------------------------ */

function EmbedPanel({ coursId, path, title }: { coursId: string; path: string; title: string }) {
  return (
    <iframe
      src={`/cours/${coursId}/${path}?embed=1`}
      title={title}
      className="h-full w-full border-0"
    />
  );
}

function SplitPanelContent({ coursId, type, notesHtml }: { coursId: string; type: SplitContentType; notesHtml: string }) {
  switch (type) {
    case 'fiche':
      return <iframe src={`/api/fiches/${coursId}/pdf`} title="Fiche de cours" className="h-full w-full border-0" />;
    case 'fiche-express':
      return <iframe src={`/api/fiches/${coursId}/express`} title="Fiche Express" className="h-full w-full border-0" />;
    case 'video':
      return <VideoPanel coursId={coursId} />;
    case 'seance-approfondie':
      return <EmbedPanel coursId={coursId} path="seance-approfondie" title="Séance approfondie" />;
    case 'qcm':
      return <EmbedPanel coursId={coursId} path="qcm" title="DP · QI" />;
    case 'flashcards':
      return <EmbedPanel coursId={coursId} path="flashcards" title="Flashcards" />;
    case 'notes':
      return (
        <div className="h-full overflow-y-auto p-3">
          <NotesEditor coursId={coursId} initialHtml={notesHtml} />
        </div>
      );
  }
}

/* ------------------------------------------------------------------ */
/*  Split panel (right side)                                           */
/* ------------------------------------------------------------------ */

function SplitPanel({
  coursId,
  type,
  onChangeType,
  onClose,
  hasFiche,
  hasVideo,
  hasQcm,
  hasFlashcards,
  hasSeanceApprofondie,
  locked,
  notesHtml,
}: {
  coursId: string;
  type: SplitContentType;
  onChangeType: (t: SplitContentType) => void;
  onClose: () => void;
  hasFiche: boolean;
  hasVideo: boolean;
  hasQcm: boolean;
  hasFlashcards: boolean;
  hasSeanceApprofondie: boolean;
  locked: Partial<Record<string, boolean>>;
  notesHtml: string;
}) {
  const available = SPLIT_OPTIONS.filter((o) => {
    if (o.type === 'fiche' || o.type === 'fiche-express') return hasFiche;
    if (o.type === 'video') return hasVideo;
    if (o.type === 'qcm') return hasQcm;
    if (o.type === 'flashcards') return hasFlashcards;
    if (o.type === 'seance-approfondie') return hasSeanceApprofondie;
    return true;
  });

  const isTypeLocked = locked[type] === true;

  return (
    <div className="flex h-full flex-col border-l border-(--color-border) bg-(--color-surface)">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-(--color-border) px-2 py-1.5">
        {available.map((o) => {
          const oLocked = locked[o.type] === true;
          return (
            <button
              key={o.type}
              type="button"
              onClick={() => !oLocked && onChangeType(o.type)}
              disabled={oLocked}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors',
                oLocked
                  ? 'opacity-50 cursor-not-allowed text-(--color-ink-muted)'
                  : type === o.type
                  ? 'bg-(--color-primary)/10 text-(--color-primary) font-bold'
                  : 'text-(--color-ink-soft) hover:bg-(--color-sand-100)',
              )}
            >
              <o.Icon className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">{o.label}</span>
              {oLocked && <Lock className="h-3 w-3 shrink-0" style={{ color: '#C0112E' }} />}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onClose}
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-(--color-ink-soft) hover:bg-(--color-sand-100)"
          aria-label="Fermer le panneau"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {/* Content */}
      <div className="min-h-0 flex-1">
        {isTypeLocked ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <Lock className="h-8 w-8 text-(--color-ink-muted)" />
            <p className="text-sm font-semibold text-(--color-ink-soft)">
              Contenu réservé à une formule supérieure
            </p>
          </div>
        ) : (
          <SplitPanelContent coursId={coursId} type={type} notesHtml={notesHtml} />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toggle button (in console header)                                  */
/* ------------------------------------------------------------------ */

export function SplitViewToggle() {
  const { active, open, close, locked } = useSplitView();
  const defaultType = SPLIT_OPTIONS.find((o) => locked[o.type] !== true)?.type ?? 'notes';
  return (
    <button
      type="button"
      onClick={() => (active ? close() : open(defaultType as SplitContentType))}
      title={active ? 'Fermer la vue partagée' : 'Ouvrir la vue partagée'}
      aria-label="Vue partagée"
      className={cn(
        'hidden items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-colors lg:inline-flex',
        active
          ? 'border-(--color-primary)/30 bg-(--color-primary)/10 text-(--color-primary)'
          : 'border-(--color-border) bg-(--color-surface) text-(--color-ink-soft) hover:border-(--color-border-strong)',
      )}
    >
      <Columns2 className="h-3.5 w-3.5" />
      Split
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  SplitLayout — wraps children with split flex when active           */
/* ------------------------------------------------------------------ */

export function SplitLayout({ children }: { children: React.ReactNode }) {
  const { active, open, close, splitPct, setSplitPct, coursId, hasFiche, hasVideo, hasQcm, hasFlashcards, hasSeanceApprofondie, locked, notesHtml } = useSplitView();

  if (!active) return <>{children}</>;

  return (
    <div className="flex h-[calc(100dvh-140px)]">
      <div className="min-w-0 overflow-y-auto" style={{ width: `${splitPct}%` }}>
        {children}
      </div>
      <Divider onResize={setSplitPct} />
      <div className="min-w-0" style={{ width: `${100 - splitPct}%` }}>
        <SplitPanel
          coursId={coursId}
          type={active}
          onChangeType={open}
          onClose={close}
          hasFiche={hasFiche}
          hasVideo={hasVideo}
          hasQcm={hasQcm}
          hasFlashcards={hasFlashcards}
          hasSeanceApprofondie={hasSeanceApprofondie}
          locked={locked}
          notesHtml={notesHtml}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Provider — pure context, no layout                                 */
/* ------------------------------------------------------------------ */

export function SplitViewProvider({
  coursId,
  hasFiche,
  hasVideo,
  hasQcm = false,
  hasFlashcards = false,
  hasSeanceApprofondie = false,
  locked = {},
  notesHtml,
  children,
}: {
  coursId: string;
  hasFiche: boolean;
  hasVideo: boolean;
  hasQcm?: boolean;
  hasFlashcards?: boolean;
  hasSeanceApprofondie?: boolean;
  locked?: Partial<Record<string, boolean>>;
  notesHtml: string;
  children: React.ReactNode;
}) {
  const [active, setActive] = useState<SplitContentType | null>(null);
  const [splitPct, setSplitPct] = useState(50);

  const open = useCallback((type: SplitContentType) => setActive(type), []);
  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active, close]);

  return (
    <SplitContext.Provider value={{ active, open, close, splitPct, setSplitPct, coursId, hasFiche, hasVideo, hasQcm, hasFlashcards, hasSeanceApprofondie, locked, notesHtml }}>
      {children}
    </SplitContext.Provider>
  );
}
