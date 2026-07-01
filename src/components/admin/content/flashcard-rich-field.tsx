'use client';

import { useEffect, useRef, useState } from 'react';
import { Bold, Italic, ImagePlus, Baseline, Eraser, Loader2 } from 'lucide-react';
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
  const [empty, setEmpty] = useState(!value);

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

  const sync = () => {
    if (!ref.current) return;
    const html = sanitizeFlashcardHtml(ref.current.innerHTML);
    lastHtml.current = html;
    setEmpty(!ref.current.textContent && !ref.current.querySelector('img'));
    onChange(html);
  };

  const exec = (command: string, arg?: string) => {
    ref.current?.focus();
    try { document.execCommand('styleWithCSS', false, 'true'); } catch { /* ignore */ }
    document.execCommand(command, false, arg);
    sync();
  };

  const applyColor = (color: string) => {
    exec('foreColor', color);
    setShowColors(false);
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
  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    sync();
  };

  const btn =
    'inline-flex h-8 w-8 items-center justify-center rounded-lg text-(--color-ink-soft) transition-colors hover:bg-(--color-sand-100) hover:text-(--color-ink) focus-ring';

  return (
    <div className="space-y-1.5">
      {label && <span className="text-sm font-medium text-(--color-ink)">{label}</span>}
      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) focus-within:border-(--color-primary)">
        {/* Barre d'outils */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-(--color-border) px-1.5 py-1">
          <button type="button" className={btn} title="Gras (Ctrl+B)" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('bold')}>
            <Bold className="h-4 w-4" />
          </button>
          <button type="button" className={btn} title="Italique (Ctrl+I)" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('italic')}>
            <Italic className="h-4 w-4" />
          </button>

          {/* Couleur du texte */}
          <div className="relative">
            <button
              type="button"
              className={btn}
              title="Couleur du texte"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowColors((v) => !v)}
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

        {/* Zone éditable */}
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
            className="max-h-72 overflow-y-auto px-3 py-2.5 text-sm leading-relaxed text-(--color-ink) outline-none [&_img]:my-1.5 [&_img]:max-h-40 [&_img]:rounded-lg"
            style={{ minHeight }}
          />
        </div>
      </div>
      <p className="text-[11px] text-(--color-ink-muted)">
        Sélectionnez du texte puis appliquez le gras, l’italique ou une couleur. Le bouton image insère une illustration.
      </p>
    </div>
  );
}
