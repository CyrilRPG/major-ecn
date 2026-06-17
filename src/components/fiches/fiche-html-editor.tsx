'use client';

/**
 * Éditeur WYSIWYG « Word-like » pour le contenu HTML d'une fiche.
 *
 * Source de vérité : `fiches.content_html` (un seul format, pas de JSON ↔ HTML
 * round-trip). L'éditeur charge l'HTML brut, l'utilisateur édite à la souris/
 * clavier avec une toolbar, l'autosave POST vers `/api/fiches/[cours]/html`.
 *
 * Architecture :
 *   - Tiptap (ProseMirror) gère contentEditable, undo, copier-coller propre
 *     (notamment depuis Word).
 *   - Le CSS charte « médicale sobre » est injecté dans un `<style>` scopé
 *     `.fiche-editor-paper` pour que ce que voit l'éditeur ressemble au PDF.
 *   - « Publier le PDF » appelle `/api/fiches/[cours]/render-html` qui prend
 *     le HTML, l'enveloppe côté serveur avec le CSS complet et le rend via
 *     Chromium → upload Storage + maj `fiches.storage_path`.
 *   - « Aperçu PDF » fait la même chose mais avec `save:false`, et ouvre le
 *     blob dans un nouvel onglet.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Image } from '@tiptap/extension-image';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Quote, Link as LinkIcon,
  Heading1, Heading2, Heading3, Image as ImageIcon, Table as TableIcon,
  Undo2, Redo2, Loader2, FileDown, Eye, Trash2, RotateCcw,
  AlignLeft, AlignCenter, AlignRight, Highlighter,
} from 'lucide-react';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export function FicheHtmlEditor({
  coursId,
  initialHtml,
  nomCours,
  annee,
}: {
  coursId: string;
  initialHtml: string;
  nomCours: string;
  annee: string;
}) {
  const [save, setSave] = useState<SaveState>('idle');
  const [publishing, setPublishing] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipFirstSave = useRef(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        // On garde l'historique undo/redo natif de StarterKit.
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener', target: '_blank' },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialHtml || '<p></p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'fiche-editor-prose outline-none focus:outline-none min-h-[60vh] ' +
          'prose-styles',
        spellcheck: 'true',
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (skipFirstSave.current) {
        skipFirstSave.current = false;
        return;
      }
      if (timer.current) clearTimeout(timer.current);
      setSave('saving');
      timer.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/fiches/${coursId}/html`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content_html: ed.getHTML() }),
          });
          setSave(res.ok ? 'saved' : 'error');
        } catch {
          setSave('error');
        }
      }, 1200);
    },
  });

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // ── Actions toolbar ────────────────────────────────────────────────────
  const askLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL du lien', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const askImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('URL de l\'image (https://… ou data:image/…)');
    if (!url) return;
    editor.chain().focus().setImage({ src: url, alt: '' }).run();
  }, [editor]);

  const insertTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 2, withHeaderRow: true }).run();
  }, [editor]);

  async function publish() {
    if (!editor) return;
    setPublishing(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/fiches/${coursId}/render-html`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_html: editor.getHTML(),
          save: true,
          nom_cours: nomCours,
          annee,
        }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; pages?: number; error?: string };
      setMsg(res.ok && j.ok ? `PDF publié (${j.pages ?? '?'} pages).` : `Échec : ${j.error ?? 'erreur'}`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Erreur réseau');
    } finally {
      setPublishing(false);
    }
  }

  async function previewPdf() {
    if (!editor) return;
    setPreviewing(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/fiches/${coursId}/render-html`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_html: editor.getHTML(),
          save: false,
          nom_cours: nomCours,
          annee,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setMsg(`Échec aperçu : ${j.error ?? 'erreur'}`);
        return;
      }
      const blob = await res.blob();
      window.open(URL.createObjectURL(blob), '_blank');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Erreur réseau');
    } finally {
      setPreviewing(false);
    }
  }

  function clearAll() {
    if (!editor) return;
    if (!window.confirm('Vider la fiche et repartir d\'une page vierge ?')) return;
    editor.commands.setContent('<p></p>');
  }

  if (!editor) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-(--color-ink-soft)">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Chargement de l\'éditeur…
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col bg-(--color-surface-soft)">
      {/* ── Barre d'actions principale ─────────────────────────────────── */}
      <div className="flex shrink-0 items-center gap-3 border-b border-(--color-border) bg-white px-4 py-2">
        <span className="text-sm font-bold text-(--color-ink)">Édition de la fiche</span>
        <SaveBadge state={save} />
        <div className="ml-auto flex items-center gap-2">
          {msg && <span className="hidden text-xs text-(--color-ink-soft) lg:inline">{msg}</span>}
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-semibold text-(--color-ink-soft) hover:bg-(--color-sand-100)"
            title="Vider la fiche"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Repartir vierge
          </button>
          <button
            type="button"
            onClick={previewPdf}
            disabled={previewing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-bold text-(--color-ink) hover:bg-(--color-sand-100) disabled:opacity-60"
          >
            {previewing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
            Aperçu PDF
          </button>
          <button
            type="button"
            onClick={publish}
            disabled={publishing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-(--color-primary) px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-60"
          >
            {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
            Publier le PDF
          </button>
        </div>
      </div>

      {/* ── Toolbar « Word-like » ──────────────────────────────────────── */}
      <Toolbar
        editor={editor}
        askLink={askLink}
        askImage={askImage}
        insertTable={insertTable}
      />

      {/* ── Surface d'édition (page A4 centrée) ────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="fiche-editor-paper mx-auto my-6 max-w-[210mm] bg-white p-[18mm_18mm_22mm_18mm] shadow-(--shadow-lifted)">
          <EditorContent editor={editor} />
        </div>
      </div>

      <style>{EDITOR_PAGE_CSS}</style>
    </div>
  );
}

/* ────────────────────────────── Toolbar ─────────────────────────────────── */

function Toolbar({
  editor, askLink, askImage, insertTable,
}: {
  editor: Editor;
  askLink: () => void;
  askImage: () => void;
  insertTable: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-(--color-border) bg-white px-3 py-1.5">
      <TbGroup>
        <TbBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Annuler">
          <Undo2 className="h-4 w-4" />
        </TbBtn>
        <TbBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Rétablir">
          <Redo2 className="h-4 w-4" />
        </TbBtn>
      </TbGroup>
      <TbDivider />
      <TbGroup>
        <TbBtn
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Titre 1"
        >
          <Heading1 className="h-4 w-4" />
        </TbBtn>
        <TbBtn
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Titre 2"
        >
          <Heading2 className="h-4 w-4" />
        </TbBtn>
        <TbBtn
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Titre 3"
        >
          <Heading3 className="h-4 w-4" />
        </TbBtn>
      </TbGroup>
      <TbDivider />
      <TbGroup>
        <TbBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Gras ⌘B">
          <Bold className="h-4 w-4" />
        </TbBtn>
        <TbBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italique ⌘I">
          <Italic className="h-4 w-4" />
        </TbBtn>
        <TbBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Souligné ⌘U">
          <UnderlineIcon className="h-4 w-4" />
        </TbBtn>
        <TbBtn active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()} title="Surligner">
          <Highlighter className="h-4 w-4" />
        </TbBtn>
      </TbGroup>
      <TbDivider />
      <TbGroup>
        <TbBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Liste à puces">
          <List className="h-4 w-4" />
        </TbBtn>
        <TbBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Liste numérotée">
          <ListOrdered className="h-4 w-4" />
        </TbBtn>
        <TbBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Citation">
          <Quote className="h-4 w-4" />
        </TbBtn>
      </TbGroup>
      <TbDivider />
      <TbGroup>
        <TbBtn
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Aligner à gauche"
        >
          <AlignLeft className="h-4 w-4" />
        </TbBtn>
        <TbBtn
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Centrer"
        >
          <AlignCenter className="h-4 w-4" />
        </TbBtn>
        <TbBtn
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Aligner à droite"
        >
          <AlignRight className="h-4 w-4" />
        </TbBtn>
      </TbGroup>
      <TbDivider />
      <TbGroup>
        <TbBtn onClick={askLink} active={editor.isActive('link')} title="Lien">
          <LinkIcon className="h-4 w-4" />
        </TbBtn>
        <TbBtn onClick={askImage} title="Image">
          <ImageIcon className="h-4 w-4" />
        </TbBtn>
        <TbBtn onClick={insertTable} title="Tableau">
          <TableIcon className="h-4 w-4" />
        </TbBtn>
      </TbGroup>
      {editor.isActive('table') && (
        <>
          <TbDivider />
          <TbGroup>
            <TbTextBtn onClick={() => editor.chain().focus().addRowAfter().run()}>+ Ligne</TbTextBtn>
            <TbTextBtn onClick={() => editor.chain().focus().addColumnAfter().run()}>+ Col</TbTextBtn>
            <TbTextBtn onClick={() => editor.chain().focus().deleteRow().run()} danger>− Ligne</TbTextBtn>
            <TbTextBtn onClick={() => editor.chain().focus().deleteColumn().run()} danger>− Col</TbTextBtn>
            <TbBtn onClick={() => editor.chain().focus().deleteTable().run()} title="Supprimer le tableau">
              <Trash2 className="h-4 w-4" />
            </TbBtn>
          </TbGroup>
        </>
      )}
    </div>
  );
}

function TbGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}
function TbDivider() {
  return <span className="mx-1.5 h-5 w-px shrink-0 bg-(--color-border)" />;
}
function TbBtn({
  children, onClick, active, disabled, title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={
        'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ' +
        (active
          ? 'bg-(--color-primary)/10 text-(--color-primary)'
          : 'text-(--color-ink-soft) hover:bg-(--color-sand-100) hover:text-(--color-ink)') +
        ' disabled:cursor-not-allowed disabled:opacity-40'
      }
    >
      {children}
    </button>
  );
}
function TbTextBtn({
  children, onClick, danger,
}: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'inline-flex h-8 items-center rounded-md px-2 text-xs font-semibold ' +
        (danger
          ? 'text-(--color-danger) hover:bg-red-50'
          : 'text-(--color-ink-soft) hover:bg-(--color-sand-100)')
      }
    >
      {children}
    </button>
  );
}

function SaveBadge({ state }: { state: SaveState }) {
  const map: Record<SaveState, { t: string; c: string } | null> = {
    idle: null,
    saving: { t: 'Enregistrement…', c: 'text-(--color-ink-soft)' },
    saved: { t: 'Enregistré', c: 'text-green-600' },
    error: { t: 'Échec d\'enregistrement', c: 'text-(--color-danger)' },
  };
  const s = map[state];
  if (!s) return null;
  return <span className={`text-xs font-semibold ${s.c}`}>{s.t}</span>;
}

/* ─────────────────────── CSS éditeur (charte light) ─────────────────────── */
// Note : on charge UN sous-ensemble du CSS charte (sans @page, sans cover
// pleine page) directement dans l'éditeur pour que l'utilisateur voie un
// rendu fidèle de ce qu'aura le PDF. Le CSS complet est appliqué côté
// serveur au moment du rendu PDF (Chromium).
const EDITOR_PAGE_CSS = `
.fiche-editor-paper {
  font-family: 'Inter', -apple-system, Segoe UI, sans-serif;
  font-size: 10.5pt;
  color: #1F2A38;
  line-height: 1.5;
}
.fiche-editor-paper .fiche-editor-prose:focus-visible { outline: none; }
.fiche-editor-paper h1 {
  font-family: 'Playfair Display', 'Times New Roman', serif;
  font-weight: 700;
  font-size: 22pt;
  color: #1C2E49;
  margin: 14mm 0 4mm;
  letter-spacing: -0.01em;
}
.fiche-editor-paper h2 {
  font-family: 'Playfair Display', 'Times New Roman', serif;
  font-weight: 700;
  font-size: 16pt;
  color: #1C2E49;
  margin: 8mm 0 3mm;
  padding-bottom: 1.5mm;
  border-bottom: 0.6pt solid #B5934A;
}
.fiche-editor-paper h3 {
  font-family: 'Cormorant Garamond', 'Times New Roman', serif;
  font-weight: 600;
  font-size: 13.5pt;
  color: #1C2E49;
  margin: 6mm 0 2mm;
}
.fiche-editor-paper h4 {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 600;
  font-size: 11.5pt;
  margin: 4mm 0 2mm;
}
.fiche-editor-paper p { margin: 2mm 0; }
.fiche-editor-paper strong { color: #8C2F39; font-weight: 700; }
.fiche-editor-paper em { color: #1F2A38; }
.fiche-editor-paper a { color: #1C2E49; text-decoration: underline; text-underline-offset: 2px; }

/* Puces charte : cercle contour noir / intérieur blanc, indenté d'un tab. */
.fiche-editor-paper ul {
  list-style: none;
  margin: 2mm 0;
  padding-left: 0;
}
.fiche-editor-paper ul > li {
  position: relative;
  padding-left: 6mm;
  margin: 1.2mm 0;
}
.fiche-editor-paper ul > li::before {
  content: '';
  position: absolute;
  left: 1.6mm;
  top: 0.55em;
  width: 1.9mm;
  height: 1.9mm;
  border: 0.5pt solid #1F2A38;
  background: #fff;
  border-radius: 50%;
  box-sizing: border-box;
}
.fiche-editor-paper ul ul > li::before {
  border-radius: 0;
  border-color: #1C2E49;
}
.fiche-editor-paper ul ul ul > li::before {
  transform: rotate(45deg);
  border-color: #B5934A;
}
.fiche-editor-paper ol {
  margin: 2mm 0 2mm 4mm;
  padding-left: 2mm;
}
.fiche-editor-paper ol > li { margin: 1.2mm 0; padding-left: 1mm; }

/* Tableaux Tiptap */
.fiche-editor-paper table {
  border-collapse: collapse;
  width: 100%;
  margin: 4mm 0;
  font-size: 9.6pt;
  table-layout: fixed;
}
.fiche-editor-paper th, .fiche-editor-paper td {
  border: 0.5pt solid #D3D9E2;
  padding: 2mm 2.8mm;
  vertical-align: top;
  position: relative;
}
.fiche-editor-paper th {
  background: #1C2E49;
  color: #fff;
  font-weight: 700;
}
.fiche-editor-paper tbody tr:nth-child(even) { background: #F5F6F8; }

/* Citation = encadré « À retenir » charte (sobre, gauche navy) */
.fiche-editor-paper blockquote {
  border-left: 2.4mm solid #1C2E49;
  background: #EEF0F3;
  padding: 2mm 4mm;
  margin: 3mm 0;
  border-radius: 0 1.2mm 1.2mm 0;
}
.fiche-editor-paper blockquote p { margin: 1mm 0; }

/* Highlight charte (jaune ocre doux) */
.fiche-editor-paper mark {
  background: #F6F1E4;
  color: #1F2A38;
  padding: 0 1mm;
  border-radius: 0.8mm;
}

/* Image */
.fiche-editor-paper img {
  max-width: 100%;
  border: 0.8pt solid #D3D9E2;
  padding: 1.4mm;
  background: #fff;
  border-radius: 0.8mm;
}

/* Sélection ProseMirror */
.fiche-editor-paper .ProseMirror-selectednode {
  outline: 2px solid #1C2E49;
  outline-offset: 2px;
}

/* Curseur visible dans une cellule vide */
.fiche-editor-paper .ProseMirror p.is-editor-empty:first-child::before {
  content: 'Tapez le contenu de la fiche… (toolbar ci-dessus pour le formatage)';
  float: left;
  color: #8E99A8;
  pointer-events: none;
  height: 0;
}
`;
