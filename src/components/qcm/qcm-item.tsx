'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ItemOutcome } from '@/lib/qcm/grade';
import { sanitizeFlashcardHtml, flashcardPlainText } from '@/lib/flashcards/rich-text';
import { RichTextZoom, ZoomableImage } from './image-zoom';

/** Caractères avant troncature « voir plus » sur une justification d'item. */
const JUSTIF_MAX = 280;

const GREEN = '#2E8B57';

/**
 * État visuel d'un item APRÈS validation — couleur la plus intuitive par cas
 * (croisement coché × vrai) :
 *  - 'ok-picked'    coché + vrai   → vert plein (bien répondu) + ✓
 *  - 'bad-picked'   coché + faux   → rouge + ⚠ (erreur)
 *  - 'missed'       non coché + vrai → encadré vert + ✓ + ⚠ (bonne réponse manquée)
 *  - 'ok-unpicked'  non coché + faux → encadré vert SANS fond + ⚠ (énoncé faux)
 * Le sigle ⚠ rouge marque toutes les erreurs de l'élève (coché+faux, manquée)
 * ainsi que l'énoncé faux non coché. Avant validation : 'idle' / 'sel'.
 */
type ItemState = 'idle' | 'sel' | 'ok-picked' | 'bad-picked' | 'missed' | 'ok-unpicked';

const STATE_LABEL: Record<Exclude<ItemState, 'idle' | 'sel'>, string> = {
  'ok-picked': 'Bonne réponse — bien cochée',
  'bad-picked': 'Erreur — à ne pas cocher',
  'missed': 'Bonne réponse — non cochée',
  'ok-unpicked': 'Énoncé faux — à ne pas cocher',
};

export type QcmItemView = {
  id: string;
  lettre: string;
  enonce: string;
  justification: string | null;
  images?: string[] | null;
};

export function QcmItem({
  item,
  selected,
  onToggle,
  outcome,
  disabled,
  isCorrect,
}: {
  item: QcmItemView;
  selected: boolean;
  onToggle: () => void;
  outcome: ItemOutcome | null;
  disabled: boolean;
  isCorrect: boolean | null;
}) {
  // `outcome` non nul = correction révélée. On dérive alors l'état des 4 cas
  // depuis (coché × vrai) plutôt que du simple 'correct'/'wrong'.
  const revealed = outcome !== null;
  const state: ItemState = !revealed
    ? (selected ? 'sel' : 'idle')
    : selected && isCorrect
    ? 'ok-picked'
    : selected && !isCorrect
    ? 'bad-picked'
    : !selected && isCorrect
    ? 'missed'
    : 'ok-unpicked';

  const showCheck = state === 'ok-picked' || state === 'missed';
  const showWarn = state === 'bad-picked' || state === 'missed' || state === 'ok-unpicked';

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={cn(
          'group w-full text-left flex items-start gap-3 rounded-xl border px-3.5 py-2.5 focus-ring transition',
          state === 'idle' && 'border-(--color-border) bg-(--color-surface) hover:border-(--color-primary)/40 hover:bg-(--color-primary-soft)/40',
          state === 'sel' && 'border-(--color-primary) bg-(--color-primary-soft)',
          state === 'ok-picked' && 'border-[#2E8B57] bg-[color-mix(in_srgb,#2E8B57_14%,var(--color-surface))]',
          state === 'bad-picked' && 'border-(--color-danger) bg-[color-mix(in_srgb,var(--color-danger)_12%,var(--color-surface))]',
          // Bonne réponse manquée : encadré vert (bordure pointillée) + léger fond vert.
          state === 'missed' && 'border-2 border-dashed border-[#2E8B57] bg-[color-mix(in_srgb,#2E8B57_6%,var(--color-surface))]',
          // Énoncé faux non coché : encadré vert plein SANS fond vert (fond neutre).
          state === 'ok-unpicked' && 'border-2 border-[#2E8B57]/70 bg-(--color-surface)',
          disabled && 'cursor-default',
        )}
      >
        <span
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-semibold',
            state === 'idle' && 'bg-(--color-surface-soft) text-(--color-ink-soft) group-hover:bg-(--color-primary)/15 group-hover:text-(--color-primary-deep)',
            state === 'sel' && 'bg-(--color-primary) text-(--color-primary-fg)',
            state === 'ok-picked' && 'bg-[#2E8B57] text-white',
            state === 'bad-picked' && 'bg-(--color-danger) text-white',
            state === 'missed' && 'border-2 border-[#2E8B57] bg-transparent text-[#2E8B57]',
            state === 'ok-unpicked' && 'border-2 border-[#2E8B57]/70 bg-transparent text-[#2E8B57]',
          )}
        >
          {item.lettre}
        </span>
        <span className="flex-1 text-sm leading-snug text-(--color-ink)">
          <RichTextZoom>
            <span className="[&_img]:my-1 [&_img]:max-h-56 [&_img]:rounded" dangerouslySetInnerHTML={{ __html: sanitizeFlashcardHtml(item.enonce) }} />
          </RichTextZoom>
          {(item.images?.length ?? 0) > 0 && (
            <span className="mt-2 flex flex-wrap gap-2">
              {item.images!.map((src) => (
                <ZoomableImage key={src} src={src} className="h-32 w-32 sm:h-40 sm:w-40" sizes="160px" />
              ))}
            </span>
          )}
        </span>
        {/* Repères à droite : ✓ vert = bonne réponse (cochée ou manquée) ;
            ⚠ rouge = « attention » sur les erreurs de l'élève et les énoncés faux. */}
        {revealed && (showCheck || showWarn) && (
          <span className="flex shrink-0 items-center gap-1.5 pt-0.5">
            {showCheck && <Check className="h-4 w-4" strokeWidth={3} style={{ color: GREEN }} />}
            {showWarn && (
              <AlertTriangle
                className="h-4 w-4 text-(--color-danger)"
                strokeWidth={2.5}
                aria-label="Attention"
              />
            )}
          </span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {revealed && item.justification && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div
              className="ml-10 mt-1 border-l-2 py-0.5 pl-4 pr-2"
              style={{ borderColor: state === 'bad-picked' ? 'var(--color-danger)' : GREEN }}
            >
              <p
                className="text-[10px] uppercase tracking-wider font-medium"
                style={{ color: state === 'bad-picked' ? 'var(--color-danger)' : GREEN }}
              >
                {state === 'idle' || state === 'sel' ? '' : STATE_LABEL[state]}
              </p>
              <JustificationText text={item.justification} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Affiche la justification avec un « voir plus » si elle dépasse JUSTIF_MAX. */
function JustificationText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const plain = flashcardPlainText(text);
  const isLong = plain.length > JUSTIF_MAX;
  return (
    <>
      {(!isLong || expanded) ? (
        <RichTextZoom>
          <div
            className="mt-0.5 whitespace-pre-line text-xs text-(--color-ink-soft) leading-snug [&_img]:my-1 [&_img]:max-h-56 [&_img]:rounded"
            dangerouslySetInnerHTML={{ __html: sanitizeFlashcardHtml(text) }}
          />
        </RichTextZoom>
      ) : (
        <p className="mt-0.5 whitespace-pre-line text-xs text-(--color-ink-soft) leading-snug">
          {plain.slice(0, JUSTIF_MAX).trimEnd() + '…'}
        </p>
      )}
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-(--color-primary) hover:underline"
        >
          {expanded ? <><ChevronUp className="h-3 w-3" /> Voir moins</> : <><ChevronDown className="h-3 w-3" /> Voir plus</>}
        </button>
      )}
    </>
  );
}
