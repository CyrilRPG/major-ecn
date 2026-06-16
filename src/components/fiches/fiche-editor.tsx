'use client';

/**
 * Éditeur structuré d'une fiche (FicheData), Markdown assisté, avec aperçu en
 * direct (même composant que le PDF) et :
 *   - autosave de la source (content_json) → /api/fiches/[cours]/content (léger)
 *   - « Publier le PDF » → /api/fiches/[cours]/render (Chromium, met à jour le
 *     PDF vu par les élèves)
 *   - « Aperçu PDF fidèle » → /api/fiches/[cours]/render (sans save) ouvert dans
 *     un nouvel onglet.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Eye, FileDown, Loader2, Plus, Save, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { FichePreview } from './fiche-preview';
import {
  REFLEXE_LABELS,
  type FicheData,
  type FicheRowKind,
} from '@/lib/fiches/types';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const ROW_KINDS: { value: FicheRowKind; label: string }[] = [
  { value: 'normal', label: 'Ligne normale (concept | détail)' },
  { value: 'a_retenir', label: REFLEXE_LABELS.a_retenir },
  { value: 'piege', label: REFLEXE_LABELS.piege },
  { value: 'mnemo', label: REFLEXE_LABELS.mnemo },
];

const TABLE_TEMPLATE = '\n\n| Colonne A | Colonne B |\n|---|---|\n| … | … |\n| … | … |\n';

export function FicheEditor({ coursId, initial }: { coursId: string; initial: FicheData }) {
  const [fiche, setFiche] = useState<FicheData>(initial);
  const [save, setSave] = useState<SaveState>('idle');
  const [publishing, setPublishing] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);

  const mutate = useCallback((fn: (d: FicheData) => void) => {
    setFiche((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }, []);

  // Autosave (debounced) de la source structurée — pas de rendu PDF.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    setSave('saving');
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/fiches/${coursId}/content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fiche }),
        });
        setSave(res.ok ? 'saved' : 'error');
      } catch {
        setSave('error');
      }
    }, 1200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [fiche, coursId]);

  async function publish() {
    setPublishing(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/fiches/${coursId}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fiche, save: true }),
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
    setPreviewing(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/fiches/${coursId}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fiche, save: false }),
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

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      {/* Barre d'actions */}
      <div className="flex shrink-0 items-center gap-3 border-b border-(--color-border) bg-(--color-surface) px-4 py-2.5">
        <span className="text-sm font-bold text-(--color-ink)">Édition de la fiche</span>
        <SaveBadge state={save} />
        <div className="ml-auto flex items-center gap-2">
          {msg && <span className="text-xs text-(--color-ink-soft)">{msg}</span>}
          <button
            type="button"
            onClick={previewPdf}
            disabled={previewing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-bold text-(--color-ink) hover:bg-(--color-sand-100) disabled:opacity-60"
          >
            {previewing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
            Aperçu PDF fidèle
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

      {/* Split éditeur / aperçu */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
        <div className="min-h-0 overflow-y-auto border-r border-(--color-border) p-4">
          <Editor fiche={fiche} mutate={mutate} />
        </div>
        <div className="min-h-0 overflow-hidden bg-[#EEF0F3]">
          <FichePreview fiche={fiche} />
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────── Sous-éditeurs ───────────────────────────── */

function Editor({ fiche, mutate }: { fiche: FicheData; mutate: (fn: (d: FicheData) => void) => void }) {
  return (
    <div className="space-y-6">
      {/* Identité */}
      <Section title="Identité">
        <div className="grid grid-cols-2 gap-3">
          <TextInput label="Matière" value={fiche.matiere} onChange={(v) => mutate((d) => { d.matiere = v; })} />
          <TextInput label="Année" value={fiche.annee} onChange={(v) => mutate((d) => { d.annee = v; })} />
        </div>
        <TextInput label="Nom du cours" value={fiche.nom_cours} onChange={(v) => mutate((d) => { d.nom_cours = v; })} />
        <TextInput label="Item (optionnel)" value={fiche.item} onChange={(v) => mutate((d) => { d.item = v; })} />
      </Section>

      {/* Plan (page de garde) */}
      <Section
        title="Plan (page de garde)"
        onAdd={() => mutate((d) => { d.plan.push({ numero: roman(d.plan.length + 1), titre: '', resume: '', sous_parties: [] }); })}
      >
        {fiche.plan.map((p, i) => (
          <ItemRow
            key={i}
            onUp={i > 0 ? () => mutate((d) => { swap(d.plan, i, i - 1); }) : undefined}
            onDown={i < fiche.plan.length - 1 ? () => mutate((d) => { swap(d.plan, i, i + 1); }) : undefined}
            onDelete={() => mutate((d) => { d.plan.splice(i, 1); })}
          >
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <TextInput label="N°" value={p.numero} onChange={(v) => mutate((d) => { d.plan[i].numero = v; })} />
              <TextInput label="Titre de la partie" value={p.titre} onChange={(v) => mutate((d) => { d.plan[i].titre = v; })} />
            </div>
          </ItemRow>
        ))}
      </Section>

      {/* Corps : parties → sous-parties → lignes */}
      <Section
        title="Corps de la fiche"
        onAdd={() => mutate((d) => { d.parties.push({ numero: roman(d.parties.length + 1), titre: '', sous_parties: [] }); })}
      >
        {fiche.parties.map((partie, pi) => (
          <div key={pi} className="rounded-xl border border-(--color-border) p-3">
            <div className="flex items-start gap-2">
              <div className="grid flex-1 grid-cols-[80px_1fr] gap-2">
                <TextInput label="N°" value={partie.numero} onChange={(v) => mutate((d) => { d.parties[pi].numero = v; })} />
                <TextInput label="Titre de la grande partie" value={partie.titre} onChange={(v) => mutate((d) => { d.parties[pi].titre = v; })} />
              </div>
              <MoveDelete
                onUp={pi > 0 ? () => mutate((d) => { swap(d.parties, pi, pi - 1); }) : undefined}
                onDown={pi < fiche.parties.length - 1 ? () => mutate((d) => { swap(d.parties, pi, pi + 1); }) : undefined}
                onDelete={() => mutate((d) => { d.parties.splice(pi, 1); })}
              />
            </div>

            <div className="mt-3 space-y-3 pl-3">
              {partie.sous_parties.map((sp, si) => (
                <div key={si} className="rounded-lg border border-(--color-border) bg-(--color-sand-50) p-3">
                  <div className="flex items-start gap-2">
                    <div className="grid flex-1 grid-cols-[64px_1fr] gap-2">
                      <TextInput label="Lettre" value={sp.lettre} onChange={(v) => mutate((d) => { d.parties[pi].sous_parties[si].lettre = v; })} />
                      <TextInput label="Titre de la sous-partie" value={sp.titre} onChange={(v) => mutate((d) => { d.parties[pi].sous_parties[si].titre = v; })} />
                    </div>
                    <MoveDelete
                      onUp={si > 0 ? () => mutate((d) => { swap(d.parties[pi].sous_parties, si, si - 1); }) : undefined}
                      onDown={si < partie.sous_parties.length - 1 ? () => mutate((d) => { swap(d.parties[pi].sous_parties, si, si + 1); }) : undefined}
                      onDelete={() => mutate((d) => { d.parties[pi].sous_parties.splice(si, 1); })}
                    />
                  </div>

                  {/* Lignes du tableau */}
                  <div className="mt-3 space-y-2">
                    {sp.rows.map((row, ri) => (
                      <div key={ri} className="rounded-md border border-(--color-border) bg-(--color-surface) p-2">
                        <div className="mb-1.5 flex items-center gap-2">
                          <select
                            value={row.kind}
                            onChange={(e) => mutate((d) => { d.parties[pi].sous_parties[si].rows[ri].kind = e.target.value as FicheRowKind; })}
                            className="rounded border border-(--color-border) bg-(--color-surface) px-2 py-1 text-xs"
                          >
                            {ROW_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
                          </select>
                          <div className="ml-auto">
                            <MoveDelete
                              onUp={ri > 0 ? () => mutate((d) => { swap(d.parties[pi].sous_parties[si].rows, ri, ri - 1); }) : undefined}
                              onDown={ri < sp.rows.length - 1 ? () => mutate((d) => { swap(d.parties[pi].sous_parties[si].rows, ri, ri + 1); }) : undefined}
                              onDelete={() => mutate((d) => { d.parties[pi].sous_parties[si].rows.splice(ri, 1); })}
                            />
                          </div>
                        </div>
                        {row.kind === 'normal' && (
                          <TextInput
                            label="Concept (colonne gauche)"
                            value={row.concept}
                            onChange={(v) => mutate((d) => { d.parties[pi].sous_parties[si].rows[ri].concept = v; })}
                          />
                        )}
                        <MarkdownArea
                          label={row.kind === 'normal' ? 'Détail' : 'Contenu'}
                          value={row.detail_md}
                          onChange={(v) => mutate((d) => { d.parties[pi].sous_parties[si].rows[ri].detail_md = v; })}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => mutate((d) => { d.parties[pi].sous_parties[si].rows.push({ concept: '', detail_md: '', kind: 'normal' }); })}
                      className="inline-flex items-center gap-1 text-xs font-bold text-(--color-primary)"
                    >
                      <Plus className="h-3.5 w-3.5" /> Ligne
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => mutate((d) => { d.parties[pi].sous_parties.push({ lettre: letter(partie.sous_parties.length), titre: '', rows: [], images: [] }); })}
                className="inline-flex items-center gap-1 text-xs font-bold text-(--color-primary)"
              >
                <Plus className="h-3.5 w-3.5" /> Sous-partie
              </button>
            </div>
          </div>
        ))}
      </Section>

      {/* Synthèse */}
      <Section
        title="Tableaux de synthèse"
        onAdd={() => mutate((d) => { d.tableaux.push({ titre: '', markdown: '' }); })}
      >
        {fiche.tableaux.map((t, i) => (
          <ItemRow
            key={i}
            onUp={i > 0 ? () => mutate((d) => { swap(d.tableaux, i, i - 1); }) : undefined}
            onDown={i < fiche.tableaux.length - 1 ? () => mutate((d) => { swap(d.tableaux, i, i + 1); }) : undefined}
            onDelete={() => mutate((d) => { d.tableaux.splice(i, 1); })}
          >
            <TextInput label="Titre" value={t.titre} onChange={(v) => mutate((d) => { d.tableaux[i].titre = v; })} />
            <MarkdownArea label="Tableau (Markdown)" value={t.markdown} onChange={(v) => mutate((d) => { d.tableaux[i].markdown = v; })} />
          </ItemRow>
        ))}
      </Section>

      {/* Chiffres-clés */}
      <Section title="Chiffres-clés">
        {fiche.chiffres_cles ? (
          <ItemRow onDelete={() => mutate((d) => { d.chiffres_cles = null; })}>
            <MarkdownArea label="Chiffres-clés (Markdown)" value={fiche.chiffres_cles.markdown} onChange={(v) => mutate((d) => { if (d.chiffres_cles) d.chiffres_cles.markdown = v; })} />
          </ItemRow>
        ) : (
          <button type="button" onClick={() => mutate((d) => { d.chiffres_cles = { titre: 'Chiffres-clés', markdown: '' }; })} className="inline-flex items-center gap-1 text-xs font-bold text-(--color-primary)">
            <Plus className="h-3.5 w-3.5" /> Ajouter
          </button>
        )}
      </Section>

      {/* Points-clés */}
      <Section title="Points-clés (fiche éclair)" onAdd={() => mutate((d) => { d.points_cles.push(''); })}>
        {fiche.points_cles.map((pt, i) => (
          <ItemRow
            key={i}
            onUp={i > 0 ? () => mutate((d) => { swap(d.points_cles, i, i - 1); }) : undefined}
            onDown={i < fiche.points_cles.length - 1 ? () => mutate((d) => { swap(d.points_cles, i, i + 1); }) : undefined}
            onDelete={() => mutate((d) => { d.points_cles.splice(i, 1); })}
          >
            <TextInput label={`Point ${i + 1}`} value={pt} onChange={(v) => mutate((d) => { d.points_cles[i] = v; })} />
          </ItemRow>
        ))}
      </Section>

      {/* Fiche éclair */}
      <Section title="Fiche éclair (texte)">
        <MarkdownArea label="Contenu (Markdown)" value={fiche.fiche_eclair_md} onChange={(v) => mutate((d) => { d.fiche_eclair_md = v; })} />
      </Section>
    </div>
  );
}

/* ────────────────────────────── Primitives UI ───────────────────────────── */

function Section({ title, onAdd, children }: { title: string; onAdd?: () => void; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wide text-(--color-ink-soft)">{title}</h3>
        {onAdd && (
          <button type="button" onClick={onAdd} className="ml-auto inline-flex items-center gap-1 rounded-md border border-(--color-border) px-2 py-1 text-xs font-bold text-(--color-primary)">
            <Plus className="h-3.5 w-3.5" /> Ajouter
          </button>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function ItemRow({ children, onUp, onDown, onDelete }: { children: React.ReactNode; onUp?: () => void; onDown?: () => void; onDelete?: () => void }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-(--color-border) p-2.5">
      <div className="flex-1 space-y-2">{children}</div>
      <MoveDelete onUp={onUp} onDown={onDown} onDelete={onDelete} />
    </div>
  );
}

function MoveDelete({ onUp, onDown, onDelete }: { onUp?: () => void; onDown?: () => void; onDelete?: () => void }) {
  return (
    <div className="flex shrink-0 flex-col gap-1">
      <button type="button" onClick={onUp} disabled={!onUp} className="rounded p-1 text-(--color-ink-soft) hover:bg-(--color-sand-100) disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
      <button type="button" onClick={onDown} disabled={!onDown} className="rounded p-1 text-(--color-ink-soft) hover:bg-(--color-sand-100) disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
      {onDelete && <button type="button" onClick={onDelete} className="rounded p-1 text-(--color-danger) hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>}
    </div>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-0.5 block text-[11px] font-semibold text-(--color-ink-soft)">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-(--color-border) bg-(--color-surface) px-2.5 py-1.5 text-sm text-(--color-ink) focus:outline-none focus:ring-2 focus:ring-(--color-primary)/30"
      />
    </label>
  );
}

function MarkdownArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-0.5 flex items-center gap-2 text-[11px] font-semibold text-(--color-ink-soft)">
        {label}
        <button type="button" onClick={() => onChange((value || '') + TABLE_TEMPLATE)} className="rounded border border-(--color-border) px-1.5 py-0.5 text-[10px] font-bold text-(--color-primary)">
          + tableau
        </button>
        <span className="text-[10px] font-normal text-(--color-ink-muted)">Markdown · ★ ◆ ⚠ pris en charge</span>
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-md border border-(--color-border) bg-(--color-surface) px-2.5 py-1.5 font-mono text-[12.5px] text-(--color-ink) focus:outline-none focus:ring-2 focus:ring-(--color-primary)/30"
      />
    </label>
  );
}

function SaveBadge({ state }: { state: SaveState }) {
  const map: Record<SaveState, { t: string; c: string }> = {
    idle: { t: '', c: '' },
    saving: { t: 'Enregistrement…', c: 'text-(--color-ink-soft)' },
    saved: { t: 'Enregistré', c: 'text-green-600' },
    error: { t: 'Échec d’enregistrement', c: 'text-(--color-danger)' },
  };
  const s = map[state];
  if (!s.t) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${s.c}`}>
      <Save className="h-3 w-3" /> {s.t}
    </span>
  );
}

/* ────────────────────────────── Utilitaires ─────────────────────────────── */

function swap<T>(arr: T[], a: number, b: number) {
  const t = arr[a];
  arr[a] = arr[b];
  arr[b] = t;
}

function roman(n: number): string {
  const map: [number, string][] = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = '';
  for (const [v, s] of map) while (n >= v) { out += s; n -= v; }
  return out || 'I';
}

function letter(i: number): string {
  return String.fromCharCode(65 + (i % 26));
}
