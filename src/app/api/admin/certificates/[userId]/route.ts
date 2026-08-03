import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
// Sans `maxDuration`, cette route retombait sur le délai par défaut : au-delà
// d'une poignée de certificats, l'onglet restait blanc puis affichait un 504,
// sans que l'administrateur sache pourquoi.
export const maxDuration = 60;

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

  // Les certificats étaient récupérés UN PAR UN, chaque appel attendant le
  // précédent : pour un élève ayant terminé vingt parcours, vingt allers-
  // retours HTTP enchaînés. On les récupère de front, par paquets bornés pour
  // ne pas saturer la fonction. `Promise.all` conserve l'ordre, la
  // chronologie des certificats dans le PDF final est donc inchangée.
  const LOT = 5;
  const cookie = req.headers.get('cookie') ?? '';
  const pdfs: (Uint8Array | null)[] = [];
  for (let i = 0; i < signed.length; i += LOT) {
    const lot = await Promise.all(
      signed.slice(i, i + LOT).map(async (s) => {
        try {
          const res = await fetch(`${origin}/api/certificate/${s.cours_id}?user_id=${userId}`, {
            headers: { cookie },
          });
          if (!res.ok) return null;
          return new Uint8Array(await res.arrayBuffer());
        } catch {
          return null;
        }
      }),
    );
    pdfs.push(...lot);
  }

  for (const bytes of pdfs) {
    if (!bytes) continue;
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
