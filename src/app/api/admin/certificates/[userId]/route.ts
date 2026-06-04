import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/certificates/[userId]
 *
 * Renvoie un PDF unique qui concatène tous les certificats de fin de parcours
 * signés par l'élève (un certificat = 1 page A4 paysage). Admin uniquement.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ userId: string }> }) {
  await requireAdmin();
  const { userId } = await ctx.params;
  const admin = createAdminClient();

  const { data: signed } = await (admin as unknown as {
    from: (t: string) => {
      select: (s: string) => {
        eq: (k: string, v: string) => {
          not: (k: string, op: string, v: null) => {
            order: (k: string, o: { ascending: boolean }) => Promise<{ data: Array<{ cours_id: string; certificate_signed_at: string }> | null }>;
          };
        };
      };
    };
  }).from('parcours_completions')
    .select('cours_id, certificate_signed_at')
    .eq('user_id', userId)
    .not('certificate_signed_at', 'is', null)
    .order('certificate_signed_at', { ascending: true });

  if (!signed || signed.length === 0) {
    return NextResponse.json({ error: 'Aucun certificat signé pour cet élève' }, { status: 404 });
  }

  const merged = await PDFDocument.create();
  const origin = new URL(req.url).origin;

  for (const s of signed) {
    // Fetch each individual certificate PDF (forward admin cookies via the call to our own route)
    const res = await fetch(`${origin}/api/certificate/${s.cours_id}?user_id=${userId}`, {
      headers: { cookie: req.headers.get('cookie') ?? '' },
    });
    if (!res.ok) continue;
    const bytes = new Uint8Array(await res.arrayBuffer());
    const sub = await PDFDocument.load(bytes);
    const copied = await merged.copyPages(sub, sub.getPageIndices());
    copied.forEach((p) => merged.addPage(p));
  }

  const { data: prof } = await admin.from('profiles').select('first_name, last_name').eq('id', userId).maybeSingle();
  const safeName = `${prof?.first_name ?? ''}-${prof?.last_name ?? ''}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const fileName = `certificats-major-ecn-${safeName}.pdf`;
  const bytes = await merged.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-store',
    },
  });
}
