'use client';

/**
 * Liste de toutes les feuilles d'émargement (/admin/emargements) : recherche
 * par élève ou cours, filtres par type et statut, export CSV de la sélection.
 * Le détail d'un élève (signatures manuscrites) s'ouvre dans la fiche
 * d'émargements existante.
 */
import { useMemo, useState } from 'react';
import { Download, FileText, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EmargementsDialog } from '@/components/admin/students/emargements-dialog';

export type TypeFeuille = 'video' | 'seance' | 'interrogation' | 'zoom';

export type FeuilleAdmin = {
  id: string;
  userId: string;
  eleve: string;
  email: string | null;
  type: TypeFeuille;
  titre: string;
  college: string | null;
  /** Signature, sinon naissance de l'obligation (feuille non signée). */
  date: string | null;
  signe: boolean;
  /** Part vue, note sur 20 ou horaire de la séance Zoom. */
  detail: string | null;
  /** PDF de la feuille d'interrogation. */
  pdf: string | null;
};

const LIBELLE: Record<TypeFeuille, string> = {
  video: 'Vidéo du cours',
  seance: 'Séance approfondie',
  interrogation: 'Interrogation',
  zoom: 'Session Zoom',
};

function fmt(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
      timeZone: 'Europe/Paris',
    });
  } catch { return iso; }
}

const sansAccent = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function EmargementsGlobal({ feuilles }: { feuilles: FeuilleAdmin[] }) {
  const [q, setQ] = useState('');
  const [type, setType] = useState<'tous' | TypeFeuille>('tous');
  const [statut, setStatut] = useState<'tous' | 'signe' | 'attente'>('tous');

  const compte = useMemo(() => {
    const c: Record<'tous' | TypeFeuille, number> = { tous: feuilles.length, video: 0, seance: 0, interrogation: 0, zoom: 0 };
    for (const f of feuilles) c[f.type]++;
    return c;
  }, [feuilles]);

  const visibles = useMemo(() => {
    const m = sansAccent(q.trim());
    return feuilles.filter((f) =>
      (type === 'tous' || f.type === type)
      && (statut === 'tous' || (statut === 'signe') === f.signe)
      && (!m || sansAccent(`${f.eleve} ${f.email ?? ''} ${f.titre} ${f.college ?? ''}`).includes(m)));
  }, [feuilles, q, type, statut]);

  const eleves = useMemo(() => new Set(visibles.map((f) => f.userId)).size, [visibles]);
  const enAttente = useMemo(() => feuilles.filter((f) => !f.signe).length, [feuilles]);

  function exporter() {
    const entete = ['Élève', 'Email', 'Type', 'Collège', 'Intitulé', 'Détail', 'Statut', 'Date (heure de Paris)'];
    const lignes = visibles.map((f) => [
      f.eleve, f.email ?? '', LIBELLE[f.type], f.college ?? '', f.titre, f.detail ?? '',
      f.signe ? 'Signée' : 'NON SIGNÉE', fmt(f.date),
    ].map(csvCell).join(';'));
    // BOM : Excel ouvre l'UTF-8 correctement (accents des intitulés).
    const blob = new Blob(['﻿' + [entete.join(';'), ...lignes].join('\n')], { type: 'text/csv;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = `feuilles-emargement-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(href);
  }

  const puce = (actif: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${actif
      ? 'border-(--color-primary) bg-(--color-primary) text-white'
      : 'border-(--color-border) bg-(--color-surface) text-(--color-ink-soft) hover:text-(--color-ink)'}`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(['video', 'seance', 'interrogation', 'zoom'] as TypeFeuille[]).map((t) => (
          <div key={t} className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3">
            <p className="text-xs text-(--color-ink-muted)">{LIBELLE[t]}</p>
            <p className="text-xl font-bold text-(--color-ink)">{compte[t]}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Élève, e-mail, cours ou collège…" className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['tous', 'video', 'seance', 'interrogation', 'zoom'] as const).map((t) => (
            <button key={t} type="button" className={puce(type === t)} onClick={() => setType(t)}>
              {t === 'tous' ? 'Tous' : LIBELLE[t]} ({compte[t]})
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" className={puce(statut === 'tous')} onClick={() => setStatut('tous')}>Tous statuts</button>
          <button type="button" className={puce(statut === 'signe')} onClick={() => setStatut('signe')}>Signées</button>
          <button type="button" className={puce(statut === 'attente')} onClick={() => setStatut('attente')}>Non signées ({enAttente})</button>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={exporter} disabled={visibles.length === 0}>
          <Download className="h-4 w-4" /> CSV
        </Button>
      </div>

      <p className="text-xs text-(--color-ink-muted)">
        {visibles.length} feuille{visibles.length > 1 ? 's' : ''} · {eleves} élève{eleves > 1 ? 's' : ''}
      </p>

      {visibles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-(--color-border) px-4 py-10 text-center text-sm text-(--color-ink-soft)">
          Aucune feuille pour ces critères.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-(--color-border)">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-(--color-sand-50) text-left text-xs text-(--color-ink-muted)">
              <tr>
                <th className="px-3 py-2 font-semibold">Élève</th>
                <th className="px-3 py-2 font-semibold">Type</th>
                <th className="px-3 py-2 font-semibold">Intitulé</th>
                <th className="px-3 py-2 font-semibold">Détail</th>
                <th className="px-3 py-2 font-semibold">Signée le</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {visibles.map((f) => (
                <tr key={`${f.type}-${f.id}`} className="border-t border-(--color-border) align-top">
                  <td className="px-3 py-2">
                    <p className="font-semibold text-(--color-ink)">{f.eleve}</p>
                    {f.email && <p className="text-xs text-(--color-ink-muted)">{f.email}</p>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-(--color-ink-soft)">{LIBELLE[f.type]}</td>
                  <td className="px-3 py-2">
                    <p className="text-(--color-ink)">{f.titre}</p>
                    {f.college && <p className="text-xs text-(--color-ink-muted)">{f.college}</p>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-(--color-ink-soft)">{f.detail ?? '—'}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs">
                    {f.signe
                      ? <span className="text-(--color-ink-soft)">{fmt(f.date)}</span>
                      : <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 font-semibold text-[#B45309]">Non signée</span>}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1.5">
                      {f.pdf && (
                        <a
                          href={f.pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Feuille d'émargement de l'interrogation (PDF)"
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-(--color-border) px-2 text-xs font-bold text-(--color-ink-soft) hover:text-(--color-ink)"
                        >
                          <FileText className="h-3.5 w-3.5" /> PDF
                        </a>
                      )}
                      <EmargementsDialog studentId={f.userId} studentName={f.eleve} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
