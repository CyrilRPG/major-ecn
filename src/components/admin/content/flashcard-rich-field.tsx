'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bold, Italic, Underline, ImagePlus, Baseline, Highlighter, Eraser, Loader2 } from 'lucide-react';
import { sanitizeFlashcardHtml } from '@/lib/flashcards/rich-text';
import { uploadFlashcardImageAction } from '@/app/admin/contenu/[cours]/qcm-actions';

/** Palette de couleurs proposée au professeur (texte). */
const COLORS: { name: string; value: string }[] = [
  { name: 'Rouge', value: '#E11D2A' },
  { name: 'Bleu marine', value: '#0F1F4D' },
  { name: 'Bleu', value: '#2563EB' },
  { name: 'Vert', value: '#16A34A' },
  { name: 'Orange', value: '#D97706' },
  { name: 'Violet', value: '#7C3AED' },
  { name: 'Rose', value: '#DB2777' },
  { name: 'Noir', value: '#111827' },
];

/** Surlignage : fonds clairs, lisibles sous du texte noir. */
const HIGHLIGHTS: { name: string; value: string }[] = [
  { name: 'Jaune', value: '#FEF08A' },
  { name: 'Vert', value: '#BBF7D0' },
  { name: 'Bleu', value: '#BFDBFE' },
  { name: 'Rose', value: '#FBCFE8' },
];

type Props = {
  coursId: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  label?: string;
  minHeight?: number;
};

export function FlashcardRichField({ coursId, value, onChange, placeholder, label, minHeight = 96 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const lastHtml = useRef<string>(value);
  const [uploading, setUploading] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [empty, setEmpty] = useState(!value);
  // État actif des boutons : sans ce retour visuel, le professeur ne sait pas
  // si le gras est appliqué à sa sélection.
  const [marks, setMarks] = useState({ bold: false, italic: false, underline: false });

  // Synchronise le DOM éditable uniquement lors d'un changement EXTERNE de
  // `value` (ex. réinitialisation du formulaire) — jamais pendant la frappe,
  // pour ne pas déplacer le curseur.
  useEffect(() => {
    if (ref.current && value !== lastHtml.current) {
      ref.current.innerHTML = value || '';
      lastHtml.current = value;
      setEmpty(!ref.current.textContent && !ref.current.querySelector('img'));
    }
  }, [value]);

  // Montage initial : injecte la valeur de départ.
  useEffect(() => {
    if (ref.current && !ref.current.innerHTML && value) {
      ref.current.innerHTML = value;
      setEmpty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshMarks = useCallback(() => {
    const el = ref.current;
    if (!el || document.activeElement !== el) return;
    try {
      setMarks({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
      });
    } catch {
      // queryCommandState est déprécié : son absence ne doit rien casser.
    }
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', refreshMarks);
    return () => document.removeEventListener('selectionchange', refreshMarks);
  }, [refreshMarks]);

  const sync = () => {
    if (!ref.current) return;
    const html = sanitizeFlashcardHtml(ref.current.innerHTML);
    lastHtml.current = html;
    setEmpty(!ref.current.textContent && !ref.current.querySelector('img'));
    onChange(html);
  };

  /**
   * `useCss` = false → le navigateur produit `<b>` / `<i>` / `<u>`, balises
   * conservées telles quelles par la liste blanche. Avec styleWithCSS actif il
   * produisait des `<span style>` dont la mise en forme survivait mal au
   * nettoyage : le gras semblait appliqué dans l'éditeur puis disparaissait à
   * l'enregistrement. Seule la couleur (foreColor) a besoin du mode CSS.
   */
  const exec = (command: string, arg?: string, useCss = false) => {
    ref.current?.focus();
    try { document.execCommand('styleWithCSS', false, useCss ? 'true' : 'false'); } catch { /* ignore */ }
    document.execCommand(command, false, arg);
    sync();
    refreshMarks();
  };

  const applyColor = (color: string) => {
    exec('foreColor', color, true);
    setShowColors(false);
  };

  const applyHighlight = (color: string | null) => {
    // hiliteColor n'est pas implémenté partout ; backColor prend le relais.
    ref.current?.focus();
    try { document.execCommand('styleWithCSS', false, 'true'); } catch { /* ignore */ }
    const arg = color ?? 'transparent';
    if (!document.execCommand('hiliteColor', false, arg)) {
      document.execCommand('backColor', false, arg);
    }
    sync();
    setShowHighlights(false);
  };

  const onPickImage = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await uploadFlashcardImageAction(fd);
      if ('error' in res) { alert(res.error); return; }
      ref.current?.focus();
      document.execCommand('insertHTML', false, `<img src="${res.url}" alt="" />`);
      sync();
    } finally {
      setUploading(false);
    }
  };

  // Colle en texte brut pour éviter d'importer du HTML arbitraire (Word, web…).
  // Les retours à la ligne du presse-papiers deviennent de vrais <br>.
  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const lines = text.split(/\r?\n/);
    lines.forEach((line, i) => {
      if (i > 0) document.execCommand('insertLineBreak');
      if (line) document.execCommand('insertText', false, line);
    });
    sync();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    // Entrée insère un <br> plutôt qu'un <div> : c'est exactement ce que la
    // liste blanche conserve, donc ce que voit le professeur est ce qui est
    // enregistré.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertLineBreak');
      sync();
      return;
    }
    // Raccourcis clavier passés par exec() pour que sync() soit appelé.
    if (e.metaKey || e.ctrlKey) {
      const k = e.key.toLowerCase();
      if (k === 'b' || k === 'i' || k === 'u') {
        e.preventDefault();
        exec(k === 'b' ? 'bold' : k === 'i' ? 'italic' : 'underline');
      }
    }
  };

  const btn =
    'inline-flex h-8 w-8 items-center justify-center rounded-lg text-(--color-ink-soft) transition-colors hover:bg-(--color-sand-100) hover:text-(--color-ink) focus-ring';
  const btnOn =
    'inline-flex h-8 w-8 items-center justify-center rounded-lg bg-(--color-primary-soft) text-(--color-primary-deep) transition-colors focus-ring';

  return (
    <div className="space-y-1.5">
      {label && <span className="text-sm font-medium text-(--color-ink)">{label}</span>}
      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) focus-within:border-(--color-primary)">
        {/* Barre d'outils — collante : elle reste atteignable dans un corrigé long */}
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-t-xl border-b border-(--color-border) bg-(--color-surface) px-1.5 py-1">
          <button type="button" className={marks.bold ? btnOn : btn} title="Gras (Ctrl+B)" aria-pressed={marks.bold} onMouseDown={(e) => e.preventDefault()} onClick={() => exec('bold')}>
            <Bold className="h-4 w-4" />
          </button>
          <button type="button" className={marks.italic ? btnOn : btn} title="Italique (Ctrl+I)" aria-pressed={marks.italic} onMouseDown={(e) => e.preventDefault()} onClick={() => exec('italic')}>
            <Italic className="h-4 w-4" />
          </button>
          <button type="button" className={marks.underline ? btnOn : btn} title="Souligné (Ctrl+U)" aria-pressed={marks.underline} onMouseDown={(e) => e.preventDefault()} onClick={() => exec('underline')}>
            <Underline className="h-4 w-4" />
          </button>

          {/* Couleur du texte */}
          <div className="relative">
            <button
              type="button"
              className={btn}
              title="Couleur du texte"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { setShowColors((v) => !v); setShowHighlights(false); }}
            >
              <Baseline className="h-4 w-4" />
            </button>
            {showColors && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowColors(false)} />
                <div className="absolute left-0 top-9 z-20 grid grid-cols-4 gap-1.5 rounded-xl border border-(--color-border) bg-(--color-surface) p-2 shadow-(--shadow-soft)">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.name}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyColor(c.value)}
                      className="h-6 w-6 rounded-full border border-black/10 transition-transform hover:scale-110"
                      style={{ background: c.value }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Surlignage */}
          <div className="relative">
            <button
              type="button"
              className={btn}
              title="Surligner"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { setShowHighlights((v) => !v); setShowColors(false); }}
            >
              <Highlighter className="h-4 w-4" />
            </button>
            {showHighlights && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowHighlights(false)} />
                <div className="absolute left-0 top-9 z-20 flex items-center gap-1.5 rounded-xl border border-(--color-border) bg-(--color-surface) p-2 shadow-(--shadow-soft)">
                  {HIGHLIGHTS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.name}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyHighlight(c.value)}
                      className="h-6 w-6 rounded-full border border-black/10 transition-transform hover:scale-110"
                      style={{ background: c.value }}
                    />
                  ))}
                  <button
                    type="button"
                    title="Retirer le surlignage"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyHighlight(null)}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-(--color-border) text-(--color-ink-soft) transition-transform hover:scale-110"
                  >
                    <Eraser className="h-3 w-3" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Image */}
          <label className={`${btn} cursor-pointer`} title="Insérer une image">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              disabled={uploading}
              onChange={(e) => { void onPickImage(e.target.files?.[0]); e.currentTarget.value = ''; }}
            />
          </label>

          <span className="mx-1 h-5 w-px bg-(--color-border)" />

          <button type="button" className={btn} title="Effacer la mise en forme" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('removeFormat')}>
            <Eraser className="h-4 w-4" />
          </button>
        </div>

        {/* Zone éditable — redimensionnable, sans hauteur maximale imposée :
            un corrigé long s'édite d'un seul tenant. */}
        <div className="relative">
          {empty && placeholder && (
            <span className="pointer-events-none absolute left-3 top-2.5 text-sm text-(--color-ink-muted)">{placeholder}</span>
          )}
          <div
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label={label}
            onInput={sync}
            onBlur={sync}
            onPaste={onPaste}
            onKeyDown={onKeyDown}
            onKeyUp={refreshMarks}
            onMouseUp={refreshMarks}
            onFocus={refreshMarks}
            className="overflow-y-auto px-3 py-2.5 text-sm leading-relaxed text-(--color-ink) outline-none [&_img]:my-1.5 [&_img]:max-h-40 [&_img]:rounded-lg"
            style={{ minHeight, resize: 'vertical' }}
          />
        </div>
      </div>
      <p className="text-[11px] text-(--color-ink-muted)">
        Sélectionnez du texte puis appliquez le gras (Ctrl+B), l’italique, un surlignage ou une couleur.
        Entrée crée un retour à la ligne. Étirez le coin inférieur droit pour agrandir la zone.
      </p>
    </div>
  );
}
