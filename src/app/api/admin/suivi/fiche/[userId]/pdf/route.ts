import { NextResponse } from 'next/server';
import { requireSuiviRequest } from '@/lib/suivi/roles';
import { loadFiche } from '@/lib/suivi/fiche';
import { fichesDocumentHtml } from '@/lib/suivi/pdf';
import { htmlToPdf } from '@/lib/suivi/pdf-render';
import { roleCan } from '@/lib/suivi/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** PDF individuel d'un candidat (§17). Notes internes selon le rôle (§18). */
export async function GET(req: Request, ctx: { params: Promise<{ userId: string }> }) {
  const guard = await requireSuiviRequest(req, 'view');
  if (!guard.ok) return guard.error;
  const { userId } = await ctx.params;
  try {
    const fiche = await loadFiche(userId, { internalNotes: roleCan(guard.role, 'internal_notes') });
    if (!fiche) return NextResponse.json({ error: 'Candidat introuvable' }, { status: 404 });
    const pdf = await htmlToPdf(fichesDocumentHtml([fiche]));
    const safe = fiche.name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="fiche-suivi-${safe || 'candidat'}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Génération impossible' }, { status: 500 });
  }
}
