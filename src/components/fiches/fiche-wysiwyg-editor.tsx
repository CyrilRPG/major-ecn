'use client';

/**
 * Éditeur de fiche WYSIWYG « in-place » — fidélité 100 % avec le PDF.
 *
 * Principe : au lieu de ré-interpréter le HTML dans un schéma (Tiptap), on
 * édite DIRECTEMENT le rendu réel de la fiche. Le conteneur `.fiche-paper`
 * reçoit le `content_html` (fragment de corps) et la VRAIE charte CSS
 * (`ficheCss`, identique à celle utilisée par Chromium au rendu PDF). Le
 * professeur tape/supprime/met en forme le texte exactement comme dans Word ;
 * la mise en page (tableaux concept|détail, encadrés, bannières) ne bouge pas.
 *
 * - Mise en forme : `document.execCommand` (gras, italique, souligné, listes,
 *   couleurs, alignement) sur la sélection courante.
 * - Structure : boutons qui insèrent/suppriment des lignes et encadrés au bon
 *   format charte, à l'emplacement du curseur.
 * - Sauvegarde : on sérialise le DOM édité (nettoyé) → autosave `/html`.
 * - Publier : `/render-html` (Chromium) reconvertit le HTML en PDF.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Image as ImageIcon, Loader2, FileDown, Eye, AlignLeft, AlignCenter,
  AlignRight, RemoveFormatting, Plus, Trash2, Star, Diamond,
  TriangleAlert, Rows3,
} from 'lucide-react';
import { ficheCss } from '@/lib/fiches/css';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/** Couleurs sémantiques de la charte proposées dans la palette. */
const COLORS = [
  { label: 'Encre', value: '#1F2A38' },
  { label: 'Bleu nuit', value: '#1C2E49' },
  { label: 'Bordeaux', value: '#8C2F39' },
  { label: 'Ocre', value: '#B5934A' },
];

export function FicheWysiwygEditor({
  coursId, initialHtml, nomCours, annee,
}: {
  coursId: string;
  initialHtml: string;
  nomCours: string;
  annee: string;
}) {
  const paperRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [save, setSave] = useState<SaveState>('idle');
  const [publishing, setPublishing] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Injection initiale du HTML (une seule fois — l'éditeur est non contrôlé :
  // React ne ré-écrit jamais le DOM édité, sinon il effacerait les frappes).
  useEffect(() => {
    if (paperRef.current && !paperRef.current.dataset.loaded) {
      paperRef.current.innerHTML = normalizeInbound(initialHtml);
      paperRef.current.dataset.loaded = '1';
    }
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [initialHtml]);

  /** Sérialise le DOM édité en HTML propre (prêt pour le stockage + Chromium). */
  const serialize = useCallback((): string => {
    const node = paperRef.current;
    if (!node) return '';
    const clone = node.cloneNode(true) as HTMLElement;
    // Retire les artefacts d'édition.
    clone.querySelectorAll('[contenteditable]').forEach((el) =>
      el.removeAttribute('contenteditable'));
    clone.querySelectorAll('.fiche-row-tools, .fiche-empty-hint').forEach((el) => el.remove());
    let html = clone.innerHTML;
    // Normalise les balises produites par execCommand vers la charte
    // (<b>→<strong>, <i>→<em>) pour que les styles charte s'appliquent au PDF.
    html = html
      .replace(/<b(\s[^>]*)?>/gi, '<strong>').replace(/<\/b>/gi, '</strong>')
      .replace(/<i(\s[^>]*)?>/gi, '<em>').replace(/<\/i>/gi, '</em>');
    return html;
  }, []);

  /** Autosave debounced du contenu courant. */
  const scheduleSave = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setSave('saving');
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/fiches/${coursId}/html`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content_html: serialize() }),
        });
        setSave(res.ok ? 'saved' : 'error');
      } catch { setSave('error'); }
    }, 1200);
  }, [coursId, serialize]);

  // ── Commandes de mise en forme (execCommand sur la sélection) ────────────
  const exec = useCallback((cmd: string, value?: string) => {
    paperRef.current?.focus();
    document.execCommand(cmd, false, value);
    scheduleSave();
  }, [scheduleSave]);

  const setColor = useCallback((color: string) => {
    paperRef.current?.focus();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand('foreColor', false, color);
    scheduleSave();
  }, [scheduleSave]);

  const insertImage = useCallback(() => {
    const url = window.prompt('URL de l’image (https://… ou data:image/…)');
    if (!url) return;
    paperRef.current?.focus();
    document.execCommand('insertHTML', false,
      `<figure class="ft-figure ft-figure--large"><img src="${escapeAttr(url)}" alt=""/></figure>`);
    scheduleSave();
  }, [scheduleSave]);

  // ── Opérations de structure (au niveau de la ligne sélectionnée) ─────────
  const currentRow = (): HTMLTableRowElement | null => {
    const sel = window.getSelection();
    let n = sel?.anchorNode ?? null;
    while (n && n !== paperRef.current) {
      if (n instanceof HTMLTableRowElement) return n;
      n = n.parentNode;
    }
    return null;
  };

  const insertRow = useCallback((kind: 'normal' | 'a_retenir' | 'piege' | 'mnemo') => {
    const row = currentRow();
    const html = ROW_TEMPLATES[kind];
    if (row && row.parentElement) {
      row.insertAdjacentHTML('afterend', html);
    } else {
      // Pas de tableau ciblé : on insère un mini-tableau autonome au curseur.
      paperRef.current?.focus();
      document.execCommand('insertHTML', false,
        `<table class="fiche-table"><colgroup><col class="ft-col-concept"/><col class="ft-col-detail"/></colgroup><tbody>${html}</tbody></table>`);
    }
    scheduleSave();
  }, [scheduleSave]);

  const deleteRow = useCallback(() => {
    const row = currentRow();
    if (!row) { setMsg('Place le curseur dans la ligne à supprimer.'); return; }
    if (row.closest('thead')) { setMsg('Cette ligne d’en-tête ne peut pas être supprimée ici.'); return; }
    if (!window.confirm('Supprimer cette ligne ?')) return;
    row.remove();
    scheduleSave();
  }, [scheduleSave]);

  // ── Publication / aperçu PDF ─────────────────────────────────────────────
  async function renderPdf(savePdf: boolean) {
    const setBusy = savePdf ? setPublishing : setPreviewing;
    setBusy(true); setMsg(null);
    try {
      const res = await fetch(`/api/fiches/${coursId}/render-html`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_html: serialize(), save: savePdf, nom_cours: nomCours, annee }),
      });
      if (savePdf) {
        const j = (await res.json().catch(() => ({}))) as { ok?: boolean; pages?: number; error?: string };
        setMsg(res.ok && j.ok ? `PDF publié (${j.pages ?? '?'} pages).` : `Échec : ${j.error ?? 'erreur'}`);
      } else {
        if (!res.ok) { const j = await res.json().catch(() => ({})); setMsg(`Échec aperçu : ${(j as { error?: string }).error ?? 'erreur'}`); return; }
        window.open(URL.createObjectURL(await res.blob()), '_blank');
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Erreur réseau');
    } finally { setBusy(false); }
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col bg-(--color-surface-soft)">
      {/* Barre principale */}
      <div className="flex shrink-0 items-center gap-3 border-b border-(--color-border) bg-white px-4 py-2">
        <span className="text-sm font-bold text-(--color-ink)">Édition de la fiche</span>
        <SaveBadge state={save} />
        <div className="ml-auto flex items-center gap-2">
          {msg && <span className="hidden max-w-[40ch] truncate text-xs text-(--color-ink-soft) lg:inline">{msg}</span>}
          <ActBtn onClick={() => renderPdf(false)} busy={previewing} icon={<Eye className="h-3.5 w-3.5" />} label="Aperçu PDF" />
          <ActBtn onClick={() => renderPdf(true)} busy={publishing} icon={<FileDown className="h-3.5 w-3.5" />} label="Publier le PDF" primary />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-(--color-border) bg-white px-3 py-1.5">
        <Grp>
          <Tb onClick={() => exec('bold')} title="Gras"><Bold className="h-4 w-4" /></Tb>
          <Tb onClick={() => exec('italic')} title="Italique"><Italic className="h-4 w-4" /></Tb>
          <Tb onClick={() => exec('underline')} title="Souligné"><UnderlineIcon className="h-4 w-4" /></Tb>
          <Tb onClick={() => exec('removeFormat')} title="Effacer la mise en forme"><RemoveFormatting className="h-4 w-4" /></Tb>
        </Grp>
        <Div />
        <Grp>
          {COLORS.map((c) => (
            <button key={c.value} type="button" title={c.label} onClick={() => setColor(c.value)}
              className="h-6 w-6 rounded-full border border-(--color-border)" style={{ background: c.value }} />
          ))}
        </Grp>
        <Div />
        <Grp>
          <Tb onClick={() => exec('insertUnorderedList')} title="Liste à puces"><List className="h-4 w-4" /></Tb>
          <Tb onClick={() => exec('insertOrderedList')} title="Liste numérotée"><ListOrdered className="h-4 w-4" /></Tb>
        </Grp>
        <Div />
        <Grp>
          <Tb onClick={() => exec('justifyLeft')} title="Aligner à gauche"><AlignLeft className="h-4 w-4" /></Tb>
          <Tb onClick={() => exec('justifyCenter')} title="Centrer"><AlignCenter className="h-4 w-4" /></Tb>
          <Tb onClick={() => exec('justifyRight')} title="Aligner à droite"><AlignRight className="h-4 w-4" /></Tb>
        </Grp>
        <Div />
        <Grp>
          <Tb onClick={insertImage} title="Insérer une image"><ImageIcon className="h-4 w-4" /></Tb>
        </Grp>
        {/* Marqueurs charte ★ ◆ ⚠ */}
        <Div />
        <Grp>
          <Tb onClick={() => exec('insertText', '★ ')} title="Marqueur ★ (déjà tombé)"><Star className="h-4 w-4" /></Tb>
          <Tb onClick={() => exec('insertText', '◆ ')} title="Marqueur ◆ (haut rendement)"><Diamond className="h-4 w-4" /></Tb>
          <Tb onClick={() => exec('insertText', '⚠ ')} title="Marqueur ⚠ (piège)"><TriangleAlert className="h-4 w-4" /></Tb>
        </Grp>
      </div>

      {/* Barre « structure » */}
      <div className="flex flex-wrap items-center gap-2 border-b border-(--color-border) bg-(--color-sand-50) px-3 py-1.5 text-xs">
        <span className="font-semibold text-(--color-ink-soft)">Structure :</span>
        <TxtBtn onClick={() => insertRow('normal')} icon={<Plus className="h-3.5 w-3.5" />}>Ligne concept/détail</TxtBtn>
        <TxtBtn onClick={() => insertRow('a_retenir')} icon={<Plus className="h-3.5 w-3.5" />}>Encadré « À retenir »</TxtBtn>
        <TxtBtn onClick={() => insertRow('piege')} icon={<Plus className="h-3.5 w-3.5" />}>Encadré « Piège »</TxtBtn>
        <TxtBtn onClick={() => insertRow('mnemo')} icon={<Plus className="h-3.5 w-3.5" />}>Encadré « Mnémo »</TxtBtn>
        <TxtBtn onClick={deleteRow} icon={<Trash2 className="h-3.5 w-3.5" />} danger>Supprimer la ligne</TxtBtn>
        <span className="ml-auto inline-flex items-center gap-1 text-(--color-ink-soft)">
          <Rows3 className="h-3.5 w-3.5" /> Place le curseur dans une ligne avant d’agir
        </span>
      </div>

      {/* Surface d'édition = rendu réel de la fiche (A4) */}
      <div className="flex-1 overflow-y-auto py-6">
        <div
          ref={paperRef}
          contentEditable
          suppressContentEditableWarning
          spellCheck
          onInput={scheduleSave}
          className="fiche-paper mx-auto bg-white shadow-(--shadow-lifted) outline-none"
        />
      </div>

      <style>{ficheCss('/fonts/fiches')}</style>
      <style>{EDITOR_OVERRIDES}</style>
    </div>
  );
}

/* ─────────────────────────── templates de lignes ────────────────────────── */
const ROW_TEMPLATES: Record<'normal' | 'a_retenir' | 'piege' | 'mnemo', string> = {
  normal:
    '<tr><td class="ft-concept">Concept</td><td class="ft-detail content"><p>Détail…</p></td></tr>',
  a_retenir:
    '<tr class="ft-reflexe ft-reflexe--a_retenir"><td colspan="2"><span class="ft-reflexe-label">À retenir</span><span class="ft-reflexe-body content"><p>…</p></span></td></tr>',
  piege:
    '<tr class="ft-reflexe ft-reflexe--piege"><td colspan="2"><span class="ft-reflexe-label">Piège</span><span class="ft-reflexe-body content"><p>…</p></span></td></tr>',
  mnemo:
    '<tr class="ft-reflexe ft-reflexe--mnemo"><td colspan="2"><span class="ft-reflexe-label">Moyen mnémotechnique</span><span class="ft-reflexe-body content"><p>…</p></span></td></tr>',
};

/* ───────────────────────────── helpers HTML ─────────────────────────────── */
function escapeAttr(s: string): string {
  return s.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Nettoie le HTML entrant : si c'est un document complet (généré par le
 *  pipeline Python), on n'en garde que le corps ; on retire le filigrane et
 *  les sources de chaîne (artefacts d'impression inutiles à l'écran). */
function normalizeInbound(html: string): string {
  let body = html;
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (m) body = m[1];
  // Retire un éventuel <style> inline (la charte est fournie séparément).
  body = body.replace(/<style[\s\S]*?<\/style>/gi, '');
  return body.trim() || '<p></p>';
}

/* ───────────────────────────── sous-composants UI ───────────────────────── */
function Grp({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}
function Div() { return <span className="mx-1.5 h-5 w-px shrink-0 bg-(--color-border)" />; }
function Tb({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title?: string }) {
  return (
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onClick} title={title}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-(--color-ink-soft) transition-colors hover:bg-(--color-sand-100) hover:text-(--color-ink)">
      {children}
    </button>
  );
}
function TxtBtn({ children, onClick, icon, danger }: { children: React.ReactNode; onClick: () => void; icon?: React.ReactNode; danger?: boolean }) {
  return (
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onClick}
      className={'inline-flex items-center gap-1 rounded-md border px-2 py-1 font-semibold ' +
        (danger ? 'border-red-200 text-(--color-danger) hover:bg-red-50'
          : 'border-(--color-border) text-(--color-ink) hover:bg-(--color-sand-100)')}>
      {icon}{children}
    </button>
  );
}
function ActBtn({ onClick, busy, icon, label, primary }: { onClick: () => void; busy: boolean; icon: React.ReactNode; label: string; primary?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={busy}
      className={'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-60 ' +
        (primary ? 'bg-(--color-primary) text-white hover:opacity-90'
          : 'border border-(--color-border) text-(--color-ink) hover:bg-(--color-sand-100)')}>
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : icon}{label}
    </button>
  );
}
function SaveBadge({ state }: { state: SaveState }) {
  const map: Record<SaveState, { t: string; c: string } | null> = {
    idle: null,
    saving: { t: 'Enregistrement…', c: 'text-(--color-ink-soft)' },
    saved: { t: 'Enregistré', c: 'text-green-600' },
    error: { t: 'Échec d’enregistrement', c: 'text-(--color-danger)' },
  };
  const s = map[state];
  return s ? <span className={`text-xs font-semibold ${s.c}`}>{s.t}</span> : null;
}

/* ──────────────────────── overrides CSS éditeur (écran) ──────────────────── */
// La charte est conçue pour l'impression A4. À l'écran, on neutralise les
// règles plein-page et on simule la page (largeur A4 + marges + ombre), sans
// jamais toucher au style du CONTENU (tableaux, encadrés, puces, figures…),
// pour garantir « ce que je vois = le PDF ».
const EDITOR_OVERRIDES = `
.fiche-paper {
  width: 210mm;
  min-height: 297mm;
  padding: 18mm 18mm 22mm 18mm;
  box-sizing: border-box;
}
.fiche-paper .page-watermark { display: none; }
.fiche-paper .string-source { display: none; }
/* La page de garde garde son design mais n'occupe pas une page entière à l'écran. */
.fiche-paper .cover { height: auto; min-height: 0; page-break-after: unset; margin-bottom: 8mm; }
.fiche-paper [contenteditable] { outline: none; }
.fiche-paper:focus { outline: none; }
/* Repère visuel discret de la cellule survolée (aide à l'édition). */
.fiche-paper td:hover { box-shadow: inset 0 0 0 1px rgba(28,46,73,0.18); }
`;
