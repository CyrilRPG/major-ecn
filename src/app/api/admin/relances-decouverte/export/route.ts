import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { requireDecouverteRequest } from '@/lib/decouverte/acces';
import { etatEvalue } from '@/lib/decouverte/serveur';
import { appliquer, filtresDepuisQuery, VUE_LABEL, ANCIENNETE_LABEL } from '@/lib/decouverte/filtres';
import { calculerKpi } from '@/lib/decouverte/kpi';
import { tableHistorique, tableListe, tablesStats, type Table } from '@/lib/decouverte/exports';
import { versCsv } from '@/lib/decouverte/csv';
import { formatJour, jourParis } from '@/lib/decouverte/dates';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Exports CSV / Excel (§21, §29) : liste filtrée, historique des envois des
 * candidats filtrés, statistiques du même périmètre. Les filtres arrivent dans
 * l'URL et passent par la MÊME fonction que l'écran (`appliquer`) : l'export
 * reflète exactement la sélection affichée.
 */
export async function GET(req: Request) {
  const g = await requireDecouverteRequest(req, 'consulter');
  if (!g.ok) return g.error;
  const url = new URL(req.url);
  const vue = url.searchParams.get('export') ?? 'liste';
  const format = url.searchParams.get('format') === 'xlsx' ? 'xlsx' : 'csv';
  const f = filtresDepuisQuery(url.searchParams);
  try {
    const { lignes } = await etatEvalue({ synchro: false });
    const choisies = appliquer(lignes, f);
    const perimetre = [
      `Vue : ${VUE_LABEL[f.vue]}`,
      f.specialite && `spécialité : ${f.specialite}`,
      f.voie && `voie : ${f.voie}`,
      f.anciennete && `ancienneté : ${f.anciennete === 'perso' ? `${f.ancienneteMin ?? 0} à ${f.ancienneteMax ?? '∞'} j` : ANCIENNETE_LABEL[f.anciennete]}`,
      (f.demandeDu || f.demandeAu) && `demande du ${formatJour(f.demandeDu) || '…'} au ${formatJour(f.demandeAu) || '…'}`,
      f.recherche && `recherche « ${f.recherche} »`,
      `${choisies.length} candidat(s)`,
    ].filter(Boolean).join(' · ');
    const tables: Table[] = vue === 'historique' ? [tableHistorique(choisies)] : vue === 'stats' ? tablesStats(calculerKpi(choisies), perimetre) : [tableListe(choisies)];
    const nom = `relances-decouverte-${vue}-${jourParis(new Date())}`;
    if (format === 'xlsx') {
      const wb = XLSX.utils.book_new();
      for (const t of tables) {
        const ws = XLSX.utils.aoa_to_sheet([t.entetes, ...t.lignes]);
        ws['!cols'] = t.entetes.map((h) => ({ wch: Math.min(40, Math.max(12, h.length + 2)) }));
        XLSX.utils.book_append_sheet(wb, ws, t.nom.slice(0, 31));
      }
      if (vue !== 'stats') XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Filtres'], [perimetre]]), 'Filtres');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${nom}.xlsx"`,
          'Cache-Control': 'no-store',
        },
      });
    }
    // Plusieurs tables (statistiques) : à la suite, titrées, un seul BOM en tête.
    const csv = tables.map((t, i) => {
      const corps = versCsv(t.entetes, t.lignes);
      return i === 0 ? corps : `\r\n${t.nom}\r\n${corps.replace(/^﻿/, '')}`;
    }).join('');
    return new NextResponse(csv, {
      headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${nom}.csv"`, 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erreur' }, { status: 500 });
  }
}
