'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, Download, Loader2, Search, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/admin/suivi/ui';
import { importMatrixAction, publishMatrixVersionAction } from '@/app/admin/planificateur/actions';
import { IMPORT_TEMPLATE_EXAMPLE, IMPORT_TEMPLATE_HEADERS, rowsFromMatrixWorkbook, rowsFromVersionedWorkbook, versionCodeFrom } from '@/lib/plan/import';
import { MATRIX_CHANGE_LABEL, type MatrixChange } from '@/lib/plan/versions';
import type { VersionPreview } from '@/lib/plan/matrix-versions';

type Versioned = { rules: Record<string, string>; code: string; activeFrom: string; specialite: string };

const todayParis = () => new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

/**
 * Import CSV / XLSX de la matrice (§4). Le fichier est lu dans le navigateur
 * (aucun fichier n'entre dans une action serveur : plafond Vercel 4,5 Mo) et
 * les lignes sont envoyées en JSON.
 *
 * Une matrice VERSIONNÉE (onglet MATRICE_<NOM>_V<n>, ex. MIPIC_2026_V1) passe
 * par « Analyser » puis « Publier la version » : code, date d'activation,
 * aperçu des changements ; elle ne peut pas être importée hors versionnage.
 */
export function ImportMatrix({ colleges, defaultCollege }: { colleges: { id: string; nom: string }[]; defaultCollege?: string }) {
  const router = useRouter();
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
  const [fileName, setFileName] = useState('');
  const [defaultSpe, setDefaultSpe] = useState('');
  const [replace, setReplace] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [issues, setIssues] = useState<{ line: number; message: string }[]>([]);
  const [versioned, setVersioned] = useState<Versioned | null>(null);
  const [preview, setPreview] = useState<VersionPreview | null>(null);
  const [pending, start] = useTransition();

  async function parseFile(file: File) {
    setResult(null); setIssues([]); setFileName(file.name); setVersioned(null); setPreview(null);
    try {
      if (/\.(xlsx|xls)$/i.test(file.name)) {
        const XLSX = await import('xlsx');
        const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
        const sheets = Object.fromEntries(wb.SheetNames.map((n) => [n, XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[n], { defval: '' })]));
        // Matrice versionnée (MIPIC…) ; sinon matrice maître MG (onglets MATRICE_MAITRE + voies) ; sinon la première feuille.
        const v = rowsFromVersionedWorkbook(sheets);
        if (v) {
          setRows(v.rows);
          setVersioned({ rules: v.rules, code: versionCodeFrom(file.name, v.sheetCode, new Date().getFullYear()) ?? '', activeFrom: todayParis(), specialite: defaultCollege ?? '' });
          return;
        }
        setRows(rowsFromMatrixWorkbook(sheets) ?? sheets[wb.SheetNames[0]]);
      } else {
        const Papa = (await import('papaparse')).default;
        const text = await file.text();
        const parsed = Papa.parse<Record<string, unknown>>(text, { header: true, skipEmptyLines: true, delimiter: text.includes(';') ? ';' : ',' });
        setRows(parsed.data);
      }
    } catch (e) {
      setResult(e instanceof Error ? e.message : 'Fichier illisible'); setRows(null);
    }
  }

  function downloadTemplate() {
    const csv = [IMPORT_TEMPLATE_HEADERS.join(';'), IMPORT_TEMPLATE_EXAMPLE.join(';')].join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'matrice-pedagogique-modele.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  const versionOpts = () => ({ specialiteId: versioned!.specialite, code: versioned!.code, activeFrom: versioned!.activeFrom, sourceFile: fileName || null, rules: versioned!.rules, label: null });
  const analyse = () => start(async () => {
    setResult(null); setPreview(null);
    const r = await publishMatrixVersionAction(rows, versionOpts(), true);
    if (!r.ok) { setResult(r.error); setIssues([]); return; }
    setPreview(r.preview); setIssues(r.preview.issues);
  });
  const publish = () => {
    if (!preview) return;
    const future = versioned!.activeFrom > todayParis();
    if (!confirm(future
      ? `Programmer ${preview.code} au ${versioned!.activeFrom} ? Elle s’appliquera d’elle-même à cette date.`
      : `Publier et activer ${preview.code} maintenant ? Le planning FUTUR des élèves de la spécialité sera recalculé ; leur travail déjà réalisé reste intact.`)) return;
    start(async () => {
      const r = await publishMatrixVersionAction(rows, versionOpts(), false);
      if (!r.ok) { setResult(r.error); return; }
      setResult(r.activated
        ? `${r.preview.code} en vigueur. Plannings recalculés : ${r.regenerated}${r.remaining > 0 ? ` (${r.remaining} autre(s) à leur prochaine visite ou au balayage de la nuit)` : ''}.`
        : `${r.preview.code} programmée au ${versioned!.activeFrom}.`);
      setPreview(null); setRows(null); setVersioned(null); router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <input type="file" accept=".csv,.xlsx,.xls,text/csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) parseFile(f); }} className="text-sm" />
        <Button variant="ghost" size="sm" onClick={downloadTemplate}><Download /> Modèle CSV</Button>
      </div>
      {rows && <p className="text-sm text-(--color-ink-soft)">{fileName} : {rows.length} ligne(s) lue(s). Colonnes : {Object.keys(rows[0] ?? {}).join(', ') || '—'}</p>}

      {versioned ? (
        <div className="space-y-3 rounded-lg border border-(--color-border) bg-(--color-surface) p-3">
          <p className="flex items-center gap-2 text-sm font-medium text-(--color-ink)"><CalendarClock className="h-4 w-4" /> Matrice versionnée</p>
          <div className="flex flex-wrap items-end gap-3 text-sm">
            <label className="flex flex-col gap-1">Code de version
              <Input className="h-9 w-48" value={versioned.code} onChange={(e) => { setVersioned({ ...versioned, code: e.target.value.toUpperCase() }); setPreview(null); }} placeholder="MIPIC_2026_V1" />
            </label>
            <label className="flex flex-col gap-1">Date d’activation
              <Input type="date" className="h-9 w-44" value={versioned.activeFrom} onChange={(e) => { setVersioned({ ...versioned, activeFrom: e.target.value }); setPreview(null); }} />
            </label>
            <label className="flex flex-col gap-1">Spécialité
              <NativeSelect className="h-9 w-64" value={versioned.specialite} onChange={(e) => { setVersioned({ ...versioned, specialite: e.target.value }); setPreview(null); }}><option value="">—</option>{colleges.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}</NativeSelect>
            </label>
            <Button variant="outline" disabled={pending || !versioned.specialite || !versioned.code} onClick={analyse}>{pending && !preview ? <Loader2 className="animate-spin" /> : <Search />} Analyser</Button>
            <Button disabled={pending || !preview} onClick={publish}>{pending && preview ? <Loader2 className="animate-spin" /> : <Upload />} {versioned.activeFrom > todayParis() ? 'Programmer la version' : 'Publier la version'}</Button>
          </div>
          {preview && <VersionPreviewView preview={preview} />}
          {Object.keys(versioned.rules).length > 0 && (
            <details className="text-xs text-(--color-ink-soft)">
              <summary className="cursor-pointer">Règles du fichier ({Object.keys(versioned.rules).length})</summary>
              <ul className="mt-1 list-disc pl-5">{Object.entries(versioned.rules).map(([k, v]) => <li key={k}><strong>{k}</strong> : {v}</li>)}</ul>
            </details>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label className="flex items-center gap-2">Spécialité par défaut (si absente du fichier)
              <NativeSelect className="h-9 w-56" value={defaultSpe} onChange={(e) => setDefaultSpe(e.target.value)}><option value="">—</option>{colleges.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}</NativeSelect>
            </label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} className="h-4 w-4 accent-(--color-primary)" /> Remplacer les prérequis des items importés</label>
          </div>
          <div className="flex items-center gap-3">
            <Button disabled={pending || !rows || rows.length === 0} onClick={() => start(async () => {
              const r = await importMatrixAction(rows, { defaultSpecialite: defaultSpe || null, replace });
              if (!r.ok) { setResult(r.error); return; }
              setResult(`${r.created} item(s) créé(s), ${r.updated} mis à jour, ${r.prerequisites} prérequis enregistrés.`);
              setIssues(r.issues); router.refresh();
            })}>{pending ? <Loader2 className="animate-spin" /> : <Upload />} Importer</Button>
          </div>
        </>
      )}
      {result && <p className="text-sm text-(--color-ink)">{result}</p>}
      {issues.length > 0 && (
        <ul className="max-h-48 overflow-auto rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-900/15 dark:text-amber-100">
          {issues.slice(0, 200).map((i, k) => <li key={k}>{i.line ? `Ligne ${i.line} : ` : ''}{i.message}</li>)}
        </ul>
      )}
      <p className="text-xs text-(--color-ink-muted)">Matrice versionnée (onglet « MATRICE_MIPIC_V1 »…) : publiée comme une version datée — seuls les items ACTIVE dont le cours a un contenu entrent au planning, les COMING_SOON sont enregistrés sans être proposés, un item absent de la version est retiré (jamais supprimé) et seul le planning futur des élèves est recalculé. Matrice maître MG (classeur « Matrices planificateur MG ») : importée telle quelle, onglets de voie compris — choisir « Médecine générale » comme spécialité par défaut. Autre fichier — colonnes : {IMPORT_TEMPLATE_HEADERS.join(' · ')}. Échelles 1–5 ; années séparées par « ; » ; prérequis = noms d’items séparés par « ; ». La récence est déduite des années si elle est vide.</p>
    </div>
  );
}

const CHANGE_ORDER: MatrixChange[] = ['ajoute', 'active', 'modifie', 'a_venir', 'retire', 'inchange'];

function VersionPreviewView({ preview }: { preview: VersionPreview }) {
  const s = preview.summary;
  return (
    <div className="space-y-2 text-sm">
      <p className="text-(--color-ink)">
        <strong>{preview.code}</strong> : {s.items_active} item(s) planifiable(s), {s.items_coming_soon} bientôt disponible(s)
        {' · '}{CHANGE_ORDER.filter((c) => s[c] > 0).map((c) => `${s[c]} ${MATRIX_CHANGE_LABEL[c].toLowerCase()}`).join(', ')}.
      </p>
      <details>
        <summary className="cursor-pointer text-xs text-(--color-ink-soft)">Détail par item</summary>
        <ul className="mt-1 max-h-64 space-y-0.5 overflow-auto text-xs">
          {CHANGE_ORDER.flatMap((c) => preview.changes.filter((x) => x.change === c)).map((x, k) => (
            <li key={k} className="flex gap-2">
              <span className="w-40 shrink-0 text-(--color-ink-muted)">{MATRIX_CHANGE_LABEL[x.change]}</span>
              <span className="text-(--color-ink)">{x.nom_item}</span>
              {x.change === 'modifie' && <span className="text-(--color-ink-muted)">({Object.keys(x.diff).join(', ')})</span>}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
