import { NextResponse } from 'next/server';
import { currentStaff } from '@/lib/arena/access';
import { correctionsAccess } from '@/lib/arena/corrections-access';
import { burnWatermark, readCorrectionPage } from '@/lib/arena/corrections-pages';
import { getParticipant, getRound } from '@/lib/arena/db';
import { readSession } from '@/lib/arena/session';
import { staffWatermarkLabel, watermarkLabel } from '@/lib/arena/watermark';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Page k du corrigé d'une manche, pour la visionneuse de l'espace participant.
 *
 * Accès : le participant connecté du tournoi (cookie de session), après
 * clôture et publication des résultats (règles de corrections-access.ts) ; ou
 * le personnel connecté (prévisualisation). L'image est servie avec le
 * filigrane nominatif BRÛLÉ dans les pixels, sans cache et sans nom de
 * fichier : il n'existe ni URL publique ni fichier téléchargeable.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ roundId: string; page: string }> }) {
  const { roundId, page: pageParam } = await ctx.params;
  const page = Number(pageParam);
  if (!Number.isInteger(page) || page < 1) return new NextResponse(null, { status: 404 });
  const round = await getRound(roundId);
  if (!round || !round.corrections_pages || page > round.corrections_pages) return new NextResponse(null, { status: 404 });

  let label: string | null = null;
  const session = await readSession();
  const participant = session ? await getParticipant(session.participantId) : null;
  const access = correctionsAccess({ round, tournamentId: round.tournament_id, participant });
  if (access.allowed) label = watermarkLabel(participant!);
  else {
    const staff = await currentStaff();
    if (staff) label = staffWatermarkLabel(staff.label);
  }
  if (!label) return new NextResponse(null, { status: 403 });

  const png = await readCorrectionPage(round.tournament_id, round.number, page);
  if (!png) return new NextResponse(null, { status: 404 });
  const jpeg = await burnWatermark(png, label);
  return new NextResponse(new Uint8Array(jpeg), {
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, no-store, max-age=0',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
