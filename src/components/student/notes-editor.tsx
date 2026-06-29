'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Heading2, Highlighter, Printer, Save, Loader2, Eraser, Check, AlertCircle } from 'lucide-react';

const COLORS = ['#1F2937', '#C0112E', '#1D4ED8', '#15803D', '#B45309', '#7C3AED'];
const HIGHLIGHTS = ['#FEF08A', '#BBF7D0', '#BFDBFE', '#FBCFE8'];
const AUTOSAVE_DELAY = 2000;

export function NotesEditor({ coursId, initialHtml }: { coursId: string; initialHtml: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedHtml = useRef(initialHtml || '');

  useEffect(() => {
    if (ref.current && !ref.current.innerHTML) {
      ref.current.innerHTML = initialHtml || '';
    }
  }, [initialHtml]);

  const save = useCallback(async () => {
    if (!ref.current) return;
    const html = ref.current.innerHTML;
    if (html === lastSavedHtml.current) {
      setDirty(false);
      return;
    }
    setSaving(true);
    setStatus('idle');
    try {
      const res = await fetch(`/api/cours/${coursId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: html }),
      });
      if (res.ok) {
        lastSavedHtml.current = html;
        setDirty(false);
        setStatus('saved');
        setSavedAt(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  }, [coursId]);

  const scheduleAutosave = useCallback(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => { save(); }, AUTOSAVE_DELAY);
  }, [save]);

  // Ctrl+S / Cmd+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
        save();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [save]);

  // Save on unmount / page leave if dirty
  useEffect(() => {
    const handler = () => { if (dirty && ref.current) save(); };
    window.addEventListener('beforeunload', handler);
    return () => {
      window.removeEventListener('beforeunload', handler);
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      handler();
    };
  }, [dirty, save]);

  function exec(cmd: string, value?: string) {
    ref.current?.focus();
    document.execCommand(cmd, false, value);
    setDirty(true);
    scheduleAutosave();
  }

  function handleInput() {
    setDirty(true);
    setStatus('idle');
    scheduleAutosave();
  }

  function printNotes() {
    const html = ref.current?.innerHTML ?? '';
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;
    w.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>Mes notes</title>` +
        `<style>body{font-family:'Inter',system-ui,sans-serif;color:#1F2937;line-height:1.6;` +
        `max-width:720px;margin:32px auto;padding:0 24px;} h2{color:#0F1F4D;} ` +
        `mark{padding:0 2px;border-radius:2px;} @media print{body{margin:0;}}</style></head>` +
        `<body>${html}</body></html>`,
    );
    w.document.close();
    w.focus();
    w.print();
  }

  return (
    <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft)">
      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-1 border-b border-(--color-border) p-2">
        <TBtn onClick={() => exec('bold')} title="Gras"><Bold className="h-4 w-4" /></TBtn>
        <TBtn onClick={() => exec('italic')} title="Italique"><Italic className="h-4 w-4" /></TBtn>
        <TBtn onClick={() => exec('underline')} title="Souligné"><Underline className="h-4 w-4" /></TBtn>
        <TBtn onClick={() => exec('formatBlock', 'h2')} title="Titre"><Heading2 className="h-4 w-4" /></TBtn>
        <TBtn onClick={() => exec('insertUnorderedList')} title="Liste à puces"><List className="h-4 w-4" /></TBtn>
        <TBtn onClick={() => exec('insertOrderedList')} title="Liste numérotée"><ListOrdered className="h-4 w-4" /></TBtn>

        <span className="mx-1 h-5 w-px bg-(--color-border)" />
        <span className="flex items-center gap-1" title="Couleur du texte">
          {COLORS.map((c) => (
            <button key={c} type="button" onClick={() => exec('foreColor', c)} className="h-5 w-5 rounded-full border border-black/10" style={{ background: c }} aria-label={`Couleur ${c}`} />
          ))}
        </span>
        <span className="mx-1 h-5 w-px bg-(--color-border)" />
        <Highlighter className="h-3.5 w-3.5 text-(--color-ink-muted)" />
        <span className="flex items-center gap-1" title="Surligner">
          {HIGHLIGHTS.map((c) => (
            <button key={c} type="button" onClick={() => exec('hiliteColor', c)} className="h-5 w-5 rounded-full border border-black/10" style={{ background: c }} aria-label={`Surlignage ${c}`} />
          ))}
        </span>
        <TBtn onClick={() => exec('removeFormat')} title="Effacer la mise en forme"><Eraser className="h-4 w-4" /></TBtn>

        <div className="ml-auto flex items-center gap-2">
          {status === 'saved' && !dirty && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <Check className="h-3 w-3" /> Enregistré{savedAt ? ` à ${savedAt}` : ''}
            </span>
          )}
          {status === 'error' && (
            <span className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3 w-3" /> Erreur de sauvegarde
            </span>
          )}
          {dirty && status !== 'error' && (
            <span className="text-xs text-(--color-ink-muted)">
              {saving ? 'Enregistrement…' : 'Sauvegarde auto'}
            </span>
          )}
          <TBtn onClick={printNotes} title="Imprimer"><Printer className="h-4 w-4" /></TBtn>
          <button
            type="button"
            onClick={() => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); save(); }}
            disabled={saving || !dirty}
            title="Ctrl+S"
            className="inline-flex items-center gap-1.5 rounded-lg bg-(--color-primary) px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Sauvegarder
          </button>
        </div>
      </div>

      {/* Zone d'édition */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder="Prenez vos notes ici…"
        className="notes-area min-h-[50vh] w-full px-4 py-3 text-[15px] leading-relaxed text-(--color-ink) focus:outline-none"
      />
      <style>{`
        .notes-area:empty:before { content: attr(data-placeholder); color: #9AA1AE; }
        .notes-area h2 { font-size: 1.15rem; font-weight: 800; color: #0F1F4D; margin: 0.6em 0 0.2em; }
        .notes-area ul { list-style: disc; padding-left: 1.4em; }
        .notes-area ol { list-style: decimal; padding-left: 1.4em; }
        .notes-area a { color: #C0112E; text-decoration: underline; }
      `}</style>
    </div>
  );
}

function TBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className="flex h-8 w-8 items-center justify-center rounded-md text-(--color-ink) hover:bg-(--color-sand-100)"
    >
      {children}
    </button>
  );
}
