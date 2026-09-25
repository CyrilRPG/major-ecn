import { NextResponse } from 'next/server';
import { requireSuiviRequest } from '@/lib/suivi/roles';
import { loadCandidates } from '@/lib/suivi/candidates';
import { filtreElevesSuivi } from '@/lib/suivi/perimetre';
import { CANDIDATE_STATUS_LABEL, filterCandidates } from '@/lib/suivi/stats';
import { fmtDateTime } from '@/lib/suivi/format';
import { parseCandidateFilters } from '@/lib/suivi/export-filters';
import { OFFER_SHORT_LABEL, VOIE_LABEL } from '@/lib/suivi/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const csvCell = (v: string | number | null | undefined) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Export global (§17) : CSV (séparateur `;`, BOM UTF-8) ou Excel (`?format=xlsx`). */
export async function GET(req: Request) {
  const guard = await requireSuiviRequest(req, 'view');
  if (!guard.ok) return guard.error;
  try {
    const url = new URL(req.url);
    const filters = parseCandidateFilters(url);
    const bundle = await loadCandidates(await filtreElevesSuivi(guard.userId, guard.role));
    const rows = filterCandidates(bundle.candidates, filters, bundle.appointments);
    const campaignName = new Map(bundle.campaigns.map((c) => [c.id, c.name]));
    const header = ['Nom', 'Email', 'Spécialité', 'Formule', 'Voie', 'Statut', 'Dernier suivi', 'Suivis réalisés', 'Prochain rendez-vous', 'Dernière connexion', 'Actions ouvertes', 'Actions en retard', 'Campagnes'];
    const lines = rows.map((c) => [
      c.name, c.email, c.specialty, OFFER_SHORT_LABEL[c.offer] ?? c.offer, c.voie ? VOIE_LABEL[c.voie] : '',
      CANDIDATE_STATUS_LABEL[c.status], c.lastFollowUp ? fmtDateTime(c.lastFollowUp) : '', c.doneCount,
      c.nextAppointment ? fmtDateTime(c.nextAppointment.starts_at) : '', c.lastSignIn ? fmtDateTime(c.lastSignIn) : '',
      c.openActions, c.lateActions, c.campaignIds.map((id) => campaignName.get(id) ?? id).join(' | '),
    ].map(csvCell).join(';'));
    const stamp = new Date().toISOString().slice(0, 10);
    if (url.searchParams.get('format') === 'xlsx') {
      const XLSX = await import('xlsx');
      const data = rows.map((c) => ({
        Nom: c.name, Email: c.email ?? '', 'Spécialité': c.specialty, Formule: OFFER_SHORT_LABEL[c.offer] ?? c.offer, Voie: c.voie ? VOIE_LABEL[c.voie] : '',
        Statut: CANDIDATE_STATUS_LABEL[c.status], 'Dernier suivi': c.lastFollowUp ? fmtDateTime(c.lastFollowUp) : '', 'Suivis réalisés': c.doneCount,
        'Prochain rendez-vous': c.nextAppointment ? fmtDateTime(c.nextAppointment.starts_at) : '', 'Dernière connexion': c.lastSignIn ? fmtDateTime(c.lastSignIn) : '',
        'Actions ouvertes': c.openActions, 'Actions en retard': c.lateActions, Campagnes: c.campaignIds.map((id) => campaignName.get(id) ?? id).join(' | '),
      }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data, { header }), 'Candidats');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="suivi-candidats-${stamp}.xlsx"`,
          'Cache-Control': 'private, no-store',
        },
      });
    }
    const csv = '﻿' + [header.join(';'), ...lines].join('\r\n');
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="suivi-candidats-${stamp}.csv"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Export impossible' }, { status: 500 });
  }
}
