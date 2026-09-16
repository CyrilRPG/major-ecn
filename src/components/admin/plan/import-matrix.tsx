'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/admin/suivi/ui';
import { importMatrixAction } from '@/app/admin/planificateur/actions';
import { IMPORT_TEMPLATE_EXAMPLE, IMPORT_TEMPLATE_HEADERS } from '@/lib/plan/import';

/**
 * Import CSV / XLSX de la matrice (§4). Le fichier est lu dans le navigateur
 * (aucun fichier n'entre dans une action serveur : plafond Vercel 4,5 Mo) et
 * les lignes sont envoyées en JSON.
 */
export function ImportMatrix({ colleges }: { colleges: { id: string; nom: string }[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
  const [fileName, setFileName] = useState('');
  const [defaultSpe, setDefaultSpe] = useState('');
  const [replace, setReplace] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [issues, setIssues] = useState<{ line: number; message: string }[]>([]);
  const [pending, start] = useTransition();

  async function parseFile(file: File) {
    setResult(null); setIssues([]); setFileName(file.name);
    try {
      if (/\.(xlsx|xls)$/i.test(file.name)) {
        const XLSX = await import('xlsx');
        const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        setRows(XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' }));
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

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <input type="file" accept=".csv,.xlsx,.xls,text/csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) parseFile(f); }} className="text-sm" />
        <Button variant="ghost" size="sm" onClick={downloadTemplate}><Download /> Modèle CSV</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">Spécialité par défaut (si absente du fichier)
          <NativeSelect className="h-9 w-56" value={defaultSpe} onChange={(e) => setDefaultSpe(e.target.value)}><option value="">—</option>{colleges.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}</NativeSelect>
        </label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} className="h-4 w-4 accent-(--color-primary)" /> Remplacer les prérequis des items importés</label>
      </div>
      {rows && <p className="text-sm text-(--color-ink-soft)">{fileName} : {rows.length} ligne(s) lue(s). Colonnes : {Object.keys(rows[0] ?? {}).join(', ') || '—'}</p>}
      <div className="flex items-center gap-3">
        <Button disabled={pending || !rows || rows.length === 0} onClick={() => start(async () => {
          const r = await importMatrixAction(rows, { defaultSpecialite: defaultSpe || null, replace });
          if (!r.ok) { setResult(r.error); return; }
          setResult(`${r.created} item(s) créé(s), ${r.updated} mis à jour, ${r.prerequisites} prérequis enregistrés.`);
          setIssues(r.issues); router.refresh();
        })}>{pending ? <Loader2 className="animate-spin" /> : <Upload />} Importer</Button>
        {result && <p className="text-sm text-(--color-ink)">{result}</p>}
      </div>
      {issues.length > 0 && (
        <ul className="max-h-48 overflow-auto rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-900/15 dark:text-amber-100">
          {issues.slice(0, 200).map((i, k) => <li key={k}>{i.line ? `Ligne ${i.line} : ` : ''}{i.message}</li>)}
        </ul>
      )}
      <p className="text-xs text-(--color-ink-muted)">Colonnes : {IMPORT_TEMPLATE_HEADERS.join(' · ')}. Échelles 1–5 ; années séparées par « ; » ; prérequis = noms d’items séparés par « ; ». La récence est déduite des années si elle est vide.</p>
    </div>
  );
}
