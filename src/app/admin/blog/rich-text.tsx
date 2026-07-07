'use client';

import { useRef, useId, useState } from 'react';
import { Bold, Italic, Underline, Link2, Paintbrush, Eraser } from 'lucide-react';

const COLORS = [
  { label: 'Rouge Major', value: '#E4002B' },
  { label: 'Bleu', value: '#1E4D8B' },
  { label: 'Vert', value: '#16793C' },
  { label: 'Orange', value: '#B26A00' },
  { label: 'Violet', value: '#6D28D9' },
  { label: 'Encre', value: '#1A2233' },
];

/** Nettoie le HTML produit par contentEditable : on ne garde que le formatage inline sûr. */
export function sanitizeInlineHtml(html: string): string {
  if (typeof window === 'undefined') return html;
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  const ALLOWED = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'A', 'SPAN', 'BR', 'FONT']);
  const walk = (node: Node) => {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        if (!ALLOWED.has(el.tagName)) {
          // Remplace la balise interdite par son contenu texte/enfants.
          const parent = el.parentNode!;
          while (el.firstChild) parent.insertBefore(el.firstChild, el);
          parent.removeChild(el);
          continue;
        }
        // Nettoie les attributs : href sûr, style couleur, color (font) uniquement.
        for (const attr of Array.from(el.attributes)) {
          const name = attr.name.toLowerCase();
          if (el.tagName === 'A' && name === 'href') {
            if (/^\s*javascript:/i.test(attr.value)) el.removeAttribute(attr.name);
            continue;
          }
          if (name === 'color' && el.tagName === 'FONT') continue;
          if (name === 'style') {
            const color = /color:\s*([^;]+)/i.exec(attr.value);
            el.setAttribute('style', color ? `color: ${color[1].trim()}` : '');
            if (!color) el.removeAttribute('style');
            continue;
          }
          el.removeAttribute(attr.name);
        }
        if (el.tagName === 'A') el.setAttribute('rel', 'noopener');
        walk(el);
      }
    }
  };
  walk(tpl.content);
  return tpl.innerHTML.trim();
}

function TbBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      // preventDefault : ne pas perdre la sélection dans l'éditeur au clic
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md text-(--color-ink-muted) hover:bg-(--color-surface-soft) hover:text-(--color-ink)"
    >
      {children}
    </button>
  );
}

export function RichText({
  value,
  onChange,
  placeholder,
  singleLine = true,
  minHeight = 40,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  singleLine?: boolean;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const [showColors, setShowColors] = useState(false);
  // La valeur initiale n'est posée qu'au montage (évite les sauts de curseur).
  const [initialHtml] = useState(value);

  const exec = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg);
    emit();
  };
  const emit = () => {
    if (ref.current) onChange(sanitizeInlineHtml(ref.current.innerHTML));
  };
  const addLink = () => {
    const url = window.prompt('URL du lien (interne ex. /blog/mon-article, ou https://…) :', 'https://');
    if (!url) return;
    exec('createLink', url);
  };

  return (
    <div className="rounded-lg border border-(--color-border) bg-white">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-(--color-border) px-1.5 py-1">
        <TbBtn title="Gras" onClick={() => exec('bold')}><Bold className="h-3.5 w-3.5" /></TbBtn>
        <TbBtn title="Italique" onClick={() => exec('italic')}><Italic className="h-3.5 w-3.5" /></TbBtn>
        <TbBtn title="Souligné" onClick={() => exec('underline')}><Underline className="h-3.5 w-3.5" /></TbBtn>
        <TbBtn title="Lien" onClick={addLink}><Link2 className="h-3.5 w-3.5" /></TbBtn>
        <div className="relative">
          <TbBtn title="Couleur du texte" onClick={() => setShowColors((v) => !v)}>
            <Paintbrush className="h-3.5 w-3.5" />
          </TbBtn>
          {showColors && (
            <div
              className="absolute left-0 top-8 z-20 flex gap-1 rounded-lg border border-(--color-border) bg-white p-1.5 shadow-lg"
              onMouseDown={(e) => e.preventDefault()}
            >
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => {
                    exec('foreColor', c.value);
                    setShowColors(false);
                  }}
                  className="h-5 w-5 rounded-full border border-black/10"
                  style={{ background: c.value }}
                />
              ))}
            </div>
          )}
        </div>
        <TbBtn title="Effacer le formatage" onClick={() => exec('removeFormat')}>
          <Eraser className="h-3.5 w-3.5" />
        </TbBtn>
      </div>
      <div
        ref={ref}
        id={id}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={emit}
        onKeyDown={(e) => {
          if (singleLine && e.key === 'Enter') e.preventDefault();
        }}
        className="prose-none w-full px-3 py-2 text-[14px] leading-relaxed text-(--color-ink) outline-none [&:empty::before]:text-(--color-ink-muted) [&:empty::before]:content-[attr(data-placeholder)] [&_a]:text-[#E4002B] [&_a]:underline"
        style={{ minHeight }}
        dangerouslySetInnerHTML={{ __html: initialHtml }}
      />
    </div>
  );
}
