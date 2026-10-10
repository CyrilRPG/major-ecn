import { NextResponse } from 'next/server';
import { lireFiltres } from '@/lib/qualite/filtres';
import { journaliser } from '@/lib/qualite/serveur/base';
import { requireQualiteRequest } from '@/lib/qualite/serveur/droits';
import { construireExport } from '@/lib/qualite/serveur/exports';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const cellule = (v: unknown) => {
  const t = v === null || v === undefined ? '' : String(v);
  return /[;"\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};

/** Exports du module Qualité (Excel multi-feuilles ou CSV d'un registre). Administrateurs seulement. */
export async function GET(req: Request) {
  const g = await requireQualiteRequest(req);
  if (!g.ok) return g.error;
  const url = new URL(req.url);
  const type = url.searchParams.get('type') ?? 'qualiopi';
  const format = url.searchParams.get('format') === 'csv' ? 'csv' : 'xlsx';
  const f = lireFiltres(Object.fromEntries(url.searchParams.entries()));
  try {
    const feuilles = await construireExport(type, f);
    await journaliser({ objet_type: 'export', action: `export_${type}`, auteur_id: g.userId, details: { format, filtres: f } });
    const stamp = new Date().toISOString().slice(0, 10);
    if (format === 'csv') {
      const fe = feuilles[0];
      const cols = Array.from(new Set(fe.lignes.flatMap((l) => Object.keys(l))));
      const csv = '﻿' + [cols.map(cellule).join(';'), ...fe.lignes.map((l) => cols.map((c) => cellule(l[c])).join(';'))].join('\r\n');
      return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="qualite-${type}-${stamp}.csv"`, 'Cache-Control': 'private, no-store' } });
    }
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    for (const fe of feuilles) {
      const ws = XLSX.utils.json_to_sheet(fe.lignes.length ? fe.lignes : [{ Information: 'Aucune donnée sur la période' }]);
      XLSX.utils.book_append_sheet(wb, ws, fe.nom.slice(0, 31));
    }
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="qualite-${type}-${stamp}.xlsx"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Export impossible' }, { status: 500 });
  }
}
