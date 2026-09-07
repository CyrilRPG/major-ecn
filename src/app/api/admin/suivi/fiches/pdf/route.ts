import { NextResponse } from 'next/server';
import { requireSuiviRequest } from '@/lib/suivi/roles';
import { loadFiche, type Fiche } from '@/lib/suivi/fiche';
import { fichesDocumentHtml } from '@/lib/suivi/pdf';
import { htmlToPdf } from '@/lib/suivi/pdf-render';
import { loadCandidates } from '@/lib/suivi/candidates';
import { filterCandidates } from '@/lib/suivi/stats';
import { roleCan } from '@/lib/suivi/types';
import { parseCandidateFilters } from '@/lib/suivi/export-filters';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Plafond : au-delà, le rendu Chromium dépasserait la durée d'exécution. */
const MAX_FICHES = 40;

/**
 * PDF de plusieurs candidats (§17) : `?ids=a,b,c` (sélection) ou les mêmes
 * filtres que l'export CSV.
 */
export async function GET(req: Request) {
  const guard = await requireSuiviRequest(req, 'view');
  if (!guard.ok) return guard.error;
  try {
    const url = new URL(req.url);
    const filters = parseCandidateFilters(url);
    let ids = filters.ids ?? [];
    if (ids.length === 0) {
      const bundle = await loadCandidates();
      ids = filterCandidates(bundle.candidates, filters, bundle.appointments).map((c) => c.id);
    }
    if (ids.length === 0) return NextResponse.json({ error: 'Aucun candidat sélectionné' }, { status: 400 });
    if (ids.length > MAX_FICHES) {
      return NextResponse.json({ error: `Au plus ${MAX_FICHES} fiches par PDF : affinez les filtres ou utilisez l’export CSV.` }, { status: 400 });
    }
    const internal = roleCan(guard.role, 'internal_notes');
    const fiches: Fiche[] = [];
    // L'activité (RPC globale) est lue une fois par fiche : on la coupe au-delà
    // de quelques candidats pour rester sous la durée maximale.
    for (const id of ids) {
      const f = await loadFiche(id, { internalNotes: internal, withActivity: ids.length <= 5 });
      if (f) fiches.push(f);
    }
    if (fiches.length === 0) return NextResponse.json({ error: 'Candidats introuvables' }, { status: 404 });
    const pdf = await htmlToPdf(fichesDocumentHtml(fiches));
    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="fiches-suivi-${stamp}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Génération impossible' }, { status: 500 });
  }
}
