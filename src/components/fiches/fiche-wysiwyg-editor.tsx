'use client';

/**
 * Éditeur de fiche WYSIWYG « in-place » — fidélité 100 % avec le PDF.
 *
 * Le rendu éditable vit dans un IFRAME isolé : on y injecte la VRAIE charte CSS
 * (`ficheCss`, identique à celle utilisée par Chromium au rendu PDF) et le corps
 * de la fiche en `contenteditable`. L'isolation garantit que ni le CSS de l'app
 * (Tailwind) ni la charte (sélecteurs globaux `* {}`, `body`, `table`…) ne se
 * polluent — donc « ce que le prof voit = le PDF ».
 *
 * - Mise en forme : `execCommand` sur le document de l'iframe (gras, italique,
 *   souligné, couleurs charte, listes, alignement, marqueurs ★ ◆ ⚠).
 * - Structure : insertion/suppression de lignes et encadrés au format charte.
 * - Sauvegarde : on sérialise le corps de l'iframe (nettoyé) → autosave `/html`.
 * - Publier : `/render-html` (Chromium) reconvertit le HTML en PDF.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Image as ImageIcon, Loader2, FileDown, Eye, AlignLeft, AlignCenter,
  AlignRight, RemoveFormatting, Plus, Trash2, Star, Diamond,
  TriangleAlert, Rows3, Highlighter, Eraser, PencilLine, BookOpenCheck,
} from 'lucide-react';
import {
  marquerModifications, contientMarques, compterMarques, CSS_MODIFICATIONS, CLASSE_AJOUT, CLASSE_RETRAIT,
} from '@/lib/fiches/modifications-visibles';
import { ficheCss } from '@/lib/fiches/css';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const COLORS = [
  { label: 'Encre', value: '#1F2A38' },
  { label: 'Bleu nuit', value: '#1C2E49' },
  { label: 'Bordeaux', value: '#8C2F39' },
  { label: 'Ocre', value: '#B5934A' },
];

export function FicheWysiwygEditor({
  coursId, initialHtml, nomCours, annee, ficheId,
}: {
  coursId: string;
  initialHtml: string;
  nomCours: string;
  annee: string;
  /** Fiche éditée. Absent → fiche principale de l'item (un item peut en
   *  porter plusieurs, toutes affichées dans l'onglet « Fiche de cours »). */
  ficheId?: string;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [save, setSave] = useState<SaveState>('idle');
  const [publishing, setPublishing] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // « Faire apparaître les modifications » : décoché = fiche propre. Coché
  // d'office si la fiche porte déjà des marques (mise à jour précédente).
  const [montrer, setMontrer] = useState(() => contientMarques(initialHtml));
  const montrerRef = useRef(montrer);
  const [vue, setVue] = useState<'edition' | 'eleve'>('edition');
  const [apercuEleve, setApercuEleve] = useState('');
  const [nbModifs, setNbModifs] = useState(() => compterMarques(initialHtml));
  // Version de référence : la fiche telle qu'ouverte (ou telle qu'après
  // « Retirer les marques »). Sérialisée comme le corps de l'iframe, pour que
  // la normalisation du navigateur ne passe pas pour une modification.
  const reference = useRef<string | null>(null);

  // Document de l'iframe (construit une seule fois). La charte + le corps de la
  // fiche, isolés du reste de l'app.
  const srcDoc = useMemo(
    () => buildSrcDoc(initialHtml),
    [initialHtml],
  );

  const doc = () => frameRef.current?.contentDocument ?? null;
  const win = () => frameRef.current?.contentWindow ?? null;

  /** Ajuste la hauteur de l'iframe à son contenu (la page externe scrolle). */
  const fitHeight = useCallback(() => {
    const d = doc();
    if (d && frameRef.current) {
      frameRef.current.style.height = `${d.documentElement.scrollHeight + 8}px`;
    }
  }, []);

  /** Sérialise le corps de l'iframe en HTML propre (stockage + Chromium). */
  const serialize = useCallback((): string => {
    const d = doc();
    if (!d?.body) return '';
    return serializeBody(d.body);
  }, []);

  /** Référence paresseuse : le HTML initial passé par le même parseur. */
  const lireReference = useCallback((): string => {
    if (reference.current === null) {
      const d = new DOMParser().parseFromString(`<!doctype html><html><body>${normalizeInbound(initialHtml)}</body></html>`, 'text/html');
      reference.current = serializeBody(d.body);
    }
    return reference.current;
  }, [initialHtml]);

  /** HTML enregistré et publié : propre, ou avec les modifications apparentes. */
  const contenu = useCallback((): string => {
    const actuel = serialize();
    if (!montrerRef.current) return actuel;
    return marquerModifications(lireReference(), actuel);
  }, [serialize, lireReference]);

  const scheduleSave = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setSave('saving');
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/fiches/${coursId}/html`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content_html: contenu(), ficheId }),
        });
        setSave(res.ok ? 'saved' : 'error');
      } catch { setSave('error'); }
    }, 1200);
  }, [coursId, ficheId, contenu]);

  // Branche les écouteurs une fois l'iframe chargée.
  const onFrameLoad = useCallback(() => {
    const d = doc();
    if (!d) return;
    d.body.setAttribute('contenteditable', 'true');
    d.body.spellcheck = true;
    d.addEventListener('input', () => { scheduleSave(); fitHeight(); });
    fitHeight();
  }, [scheduleSave, fitHeight]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  // ── Mise en forme (execCommand dans l'iframe) ────────────────────────────
  const exec = useCallback((cmd: string, value?: string) => {
    const d = doc();
    if (!d) return;
    d.body.focus();
    d.execCommand(cmd, false, value);
    scheduleSave(); fitHeight();
  }, [scheduleSave, fitHeight]);

  const setColor = useCallback((color: string) => {
    const d = doc();
    if (!d) return;
    d.body.focus();
    d.execCommand('styleWithCSS', false, 'true');
    d.execCommand('foreColor', false, color);
    scheduleSave();
  }, [scheduleSave]);

  const insertImage = useCallback(() => {
    const url = window.prompt('URL de l’image (https://… ou data:image/…)');
    if (!url) return;
    const d = doc();
    d?.body.focus();
    d?.execCommand('insertHTML', false,
      `<figure class="ft-figure ft-figure--large"><img src="${escapeAttr(url)}" alt=""/></figure>`);
    scheduleSave(); fitHeight();
  }, [fitHeight, scheduleSave]);

  // ── Opérations de structure ──────────────────────────────────────────────
  const currentRow = (): HTMLTableRowElement | null => {
    const sel = win()?.getSelection();
    let n: Node | null = sel?.anchorNode ?? null;
    const body = doc()?.body ?? null;
    while (n && n !== body) {
      if (n instanceof HTMLTableRowElement) return n;
      n = n.parentNode;
    }
    return null;
  };

  const insertRow = useCallback((kind: keyof typeof ROW_TEMPLATES) => {
    const d = doc();
    if (!d) return;
    const row = currentRow();
    const html = ROW_TEMPLATES[kind];
    if (row?.parentElement) {
      row.insertAdjacentHTML('afterend', html);
    } else {
      d.body.focus();
      d.execCommand('insertHTML', false,
        `<table class="fiche-table"><colgroup><col class="ft-col-concept"/><col class="ft-col-detail"/></colgroup><tbody>${html}</tbody></table>`);
    }
    scheduleSave(); fitHeight();
  }, [fitHeight, scheduleSave]);

  const deleteRow = useCallback(() => {
    const row = currentRow();
    if (!row) { setMsg('Place le curseur dans la ligne à supprimer.'); return; }
    if (row.closest('thead')) { setMsg('Cette ligne d’en-tête ne peut pas être supprimée.'); return; }
    if (!window.confirm('Supprimer cette ligne ?')) return;
    row.remove();
    scheduleSave(); fitHeight();
  }, [fitHeight, scheduleSave]);

  // ── Modifications apparentes ─────────────────────────────────────────────
  const basculerMontrer = useCallback((v: boolean) => {
    montrerRef.current = v;
    setMontrer(v);
    if (!v) setVue('edition');
    setNbModifs(compterMarques(contenu()));
    scheduleSave();
  }, [contenu, scheduleSave]);

  const voirRenduEleve = useCallback(() => {
    const d = doc();
    const html = contenu();
    setNbModifs(compterMarques(html));
    // Même <head> que l'éditeur (charte + surcharges), corps en lecture seule.
    setApercuEleve(`<!doctype html><html lang="fr"><head>${d?.head.innerHTML ?? ''}</head><body>${html}</body></html>`);
    setVue('eleve');
  }, [contenu]);

  /** Accepte toutes les marques : retraits effacés, ajouts gardés sans surlignage. */
  const retirerMarques = useCallback(() => {
    const d = doc();
    if (!d) return;
    if (!window.confirm('Retirer toutes les marques de modification ? La fiche redevient propre : le texte raturé disparaît et le texte surligné est conservé sans surlignage.')) return;
    d.querySelectorAll(`del.${CLASSE_RETRAIT}`).forEach((el) => el.remove());
    d.querySelectorAll(`ins.${CLASSE_AJOUT}`).forEach((el) => el.replaceWith(...Array.from(el.childNodes)));
    reference.current = serialize();
    montrerRef.current = false;
    setMontrer(false);
    setVue('edition');
    setNbModifs({ ajouts: 0, retraits: 0 });
    scheduleSave(); fitHeight();
  }, [serialize, scheduleSave, fitHeight]);

  // Compteur tenu à jour pendant la saisie (le calcul suit l'enregistrement).
  useEffect(() => {
    if (save === 'saved' && montrerRef.current) setNbModifs(compterMarques(contenu()));
  }, [save, contenu]);

  // ── Publication / aperçu ─────────────────────────────────────────────────
  async function renderPdf(savePdf: boolean) {
    const setBusy = savePdf ? setPublishing : setPreviewing;
    setBusy(true); setMsg(null);
    try {
      const res = await fetch(`/api/fiches/${coursId}/render-html`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_html: contenu(), save: savePdf, nom_cours: nomCours, annee, ficheId }),
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
        <label
          className={'ml-2 inline-flex cursor-pointer select-none items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-bold transition-colors ' +
            (montrer ? 'border-[#C0112E]/40 bg-[#C0112E]/[0.07] text-[#8C0D22]' : 'border-(--color-border) text-(--color-ink-soft) hover:bg-(--color-sand-100)')}
          title="Coché : les élèves voient l’ancien texte raturé et le nouveau surligné en rouge. Décoché : la fiche reste propre."
        >
          <input type="checkbox" className="sr-only" checked={montrer} onChange={(e) => basculerMontrer(e.target.checked)} />
          <span aria-hidden className={'relative h-4 w-7 rounded-full transition-colors ' + (montrer ? 'bg-[#C0112E]' : 'bg-(--color-border)')}>
            <span className={'absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all ' + (montrer ? 'left-3.5' : 'left-0.5')} />
          </span>
          <Highlighter className="h-3.5 w-3.5" />
          Faire apparaître les modifications
        </label>
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
            <button key={c.value} type="button" title={c.label} onMouseDown={(e) => e.preventDefault()} onClick={() => setColor(c.value)}
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
        <Div />
        <Grp>
          <Tb onClick={() => exec('insertText', '★ ')} title="Marqueur ★ (déjà tombé)"><Star className="h-4 w-4" /></Tb>
          <Tb onClick={() => exec('insertText', '◆ ')} title="Marqueur ◆ (haut rendement)"><Diamond className="h-4 w-4" /></Tb>
          <Tb onClick={() => exec('insertText', '⚠ ')} title="Marqueur ⚠ (piège)"><TriangleAlert className="h-4 w-4" /></Tb>
        </Grp>
      </div>

      {/* Barre structure */}
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

      {/* Modifications apparentes : état, rendu élève, retrait des marques */}
      {(montrer || nbModifs.ajouts + nbModifs.retraits > 0) && (
        <div className="flex flex-wrap items-center gap-2 border-b border-[#C0112E]/20 bg-[#C0112E]/[0.05] px-3 py-1.5 text-xs text-[#8C0D22]">
          <Highlighter className="h-3.5 w-3.5 shrink-0" />
          <span className="font-semibold">
            {montrer
              ? 'Vos changements apparaîtront aux élèves : ancien texte '
              : 'Cette fiche porte des marques de modification : ancien texte '}
            <del className="decoration-[#C0112E] opacity-70">raturé</del>, nouveau <ins className="rounded-sm bg-[#C0112E]/15 px-0.5 no-underline">surligné</ins>
            {nbModifs.ajouts + nbModifs.retraits > 0 && ` — ${nbModifs.ajouts + nbModifs.retraits} passage${nbModifs.ajouts + nbModifs.retraits > 1 ? 's' : ''} marqué${nbModifs.ajouts + nbModifs.retraits > 1 ? 's' : ''}`}
            . Pensez à « Publier le PDF ».
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="inline-flex overflow-hidden rounded-md border border-[#C0112E]/30 bg-white">
              <button type="button" onClick={() => setVue('edition')}
                className={'inline-flex items-center gap-1 px-2 py-1 font-bold ' + (vue === 'edition' ? 'bg-[#C0112E] text-white' : 'text-[#8C0D22] hover:bg-[#C0112E]/10')}>
                <PencilLine className="h-3.5 w-3.5" /> Édition
              </button>
              <button type="button" onClick={voirRenduEleve}
                className={'inline-flex items-center gap-1 px-2 py-1 font-bold ' + (vue === 'eleve' ? 'bg-[#C0112E] text-white' : 'text-[#8C0D22] hover:bg-[#C0112E]/10')}>
                <BookOpenCheck className="h-3.5 w-3.5" /> Rendu élève
              </button>
            </div>
            <button type="button" onClick={retirerMarques}
              className="inline-flex items-center gap-1 rounded-md border border-[#C0112E]/30 bg-white px-2 py-1 font-bold text-[#8C0D22] hover:bg-[#C0112E]/10">
              <Eraser className="h-3.5 w-3.5" /> Retirer les marques
            </button>
          </div>
        </div>
      )}

      {/* Surface = iframe isolée (rendu réel de la fiche) */}
      <div className="flex-1 overflow-y-auto py-6">
        <iframe
          ref={frameRef}
          title="Aperçu éditable de la fiche"
          onLoad={onFrameLoad}
          srcDoc={srcDoc}
          className={'mx-auto w-[210mm] max-w-full border-0 bg-white shadow-(--shadow-lifted) ' + (vue === 'eleve' ? 'hidden' : 'block')}
        />
        {vue === 'eleve' && (
          <iframe
            title="Rendu de la fiche pour les élèves"
            srcDoc={apercuEleve}
            onLoad={(e) => {
              const f = e.currentTarget;
              const d = f.contentDocument;
              if (d) f.style.height = `${d.documentElement.offsetHeight + 8}px`;
            }}
            className="mx-auto block w-[210mm] max-w-full border-0 bg-white shadow-(--shadow-lifted)"
          />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── construction iframe ─────────────────────────── */
function buildSrcDoc(initialHtml: string): string {
  const css = ficheCss('/fonts/fiches');
  return (
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"/>` +
    `<style>${css}</style><style>${IFRAME_OVERRIDES}</style><style>${CSS_MODIFICATIONS}</style></head>` +
    `<body contenteditable="true" spellcheck="true">${normalizeInbound(initialHtml)}</body></html>`
  );
}

const ROW_TEMPLATES = {
  normal:
    '<tr><td class="ft-concept">Concept</td><td class="ft-detail content"><p>Détail…</p></td></tr>',
  a_retenir:
    '<tr class="ft-reflexe ft-reflexe--a_retenir"><td colspan="2"><span class="ft-reflexe-label">À retenir</span><span class="ft-reflexe-body content"><p>…</p></span></td></tr>',
  piege:
    '<tr class="ft-reflexe ft-reflexe--piege"><td colspan="2"><span class="ft-reflexe-label">Piège</span><span class="ft-reflexe-body content"><p>…</p></span></td></tr>',
  mnemo:
    '<tr class="ft-reflexe ft-reflexe--mnemo"><td colspan="2"><span class="ft-reflexe-label">Moyen mnémotechnique</span><span class="ft-reflexe-body content"><p>…</p></span></td></tr>',
} as const;

// Surcharges écran (dans l'iframe uniquement) : on simule les marges de page,
// on masque la page de garde (auto-générée, non éditable ici) et le filigrane.
const IFRAME_OVERRIDES = `
html, body { background: #fff; }
body { padding: 16mm 18mm 20mm 18mm; box-sizing: border-box; }
.cover, .page-watermark, .string-source { display: none !important; }
.partie-page--first { break-before: auto; }
td:hover { box-shadow: inset 0 0 0 1px rgba(28,46,73,0.15); }
:focus { outline: none; }
`;

/* ───────────────────────────── helpers ──────────────────────────────────── */
/** Corps de fiche → HTML propre (stockage + Chromium) : sans contenteditable,
 *  <b>/<i> normalisés en <strong>/<em>. */
function serializeBody(body: HTMLElement): string {
  const clone = body.cloneNode(true) as HTMLElement;
  clone.removeAttribute('contenteditable');
  clone.removeAttribute('spellcheck');
  clone.querySelectorAll('[contenteditable]').forEach((el) => el.removeAttribute('contenteditable'));
  return clone.innerHTML
    .replace(/<b(\s[^>]*)?>/gi, '<strong>').replace(/<\/b>/gi, '</strong>')
    .replace(/<i(\s[^>]*)?>/gi, '<em>').replace(/<\/i>/gi, '</em>');
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Si l'HTML reçu est un document complet (pipeline Python), on n'en garde que
 *  le corps ; on retire un éventuel <style> inline (la charte est fournie à
 *  part). */
function normalizeInbound(html: string): string {
  let body = html;
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (m) body = m[1];
  body = body.replace(/<style[\s\S]*?<\/style>/gi, '');
  return body.trim() || '<p>Commencez à rédiger la fiche…</p>';
}

/* ───────────────────────────── UI ────────────────────────────────────────── */
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
