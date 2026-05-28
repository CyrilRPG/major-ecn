import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/fiches/[coursId]/pdf
 *
 * Renvoie le PDF de la fiche du cours, watermarké avec le prénom, le nom et
 * l'email de l'utilisateur connecté (gros texte gris transparent en diagonale,
 * répété sur chaque page) → dissuasion contre la diffusion non autorisée.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await ctx.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const [{ data: profile }, { data: fiches }] = await Promise.all([
    supabase.from('profiles').select('first_name, last_name, email').eq('id', user.id).maybeSingle(),
    // Tolère plusieurs lignes éventuelles : on prend celle qui a un storage_path.
    supabase
      .from('fiches')
      .select('storage_path')
      .eq('cours_id', coursId)
      .not('storage_path', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1),
  ]);

  const fiche = fiches?.[0];
  if (!fiche?.storage_path) return NextResponse.json({ error: 'Fiche introuvable' }, { status: 404 });

  // Téléchargement du PDF original via service role (bypass RLS storage)
  const admin = createAdminClient();
  const { data: file, error: dlErr } = await admin.storage.from('fiches').download(fiche.storage_path);
  if (dlErr || !file) return NextResponse.json({ error: dlErr?.message ?? 'PDF indisponible' }, { status: 500 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await PDFDocument.load(bytes);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  const firstName = profile?.first_name?.trim() || '';
  const lastName = profile?.last_name?.trim() || '';
  const email = profile?.email?.trim() || user.email || '';
  const line1 = `${firstName} ${lastName}`.trim();
  const line2 = email;

  // Quelques URL sont signées : on annote chaque page avec un watermark diagonal.
  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    const fontSize = Math.max(36, Math.min(width, height) * 0.075);
    const text = line1 && line2 ? `${line1}  ·  ${line2}` : line1 || line2 || 'Major ECN';

    // Watermark principal (diagonale, gris transparent)
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    page.drawText(text, {
      x: (width - textWidth * Math.cos(Math.PI / 6)) / 2,
      y: height / 2 - fontSize / 2,
      size: fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: 0.18,
      rotate: degrees(30),
    });

    // Deux watermarks secondaires (haut-droite + bas-gauche) pour densifier
    const small = fontSize * 0.45;
    const textWidthSmall = font.widthOfTextAtSize(text, small);
    page.drawText(text, {
      x: width - textWidthSmall - 24,
      y: height - small - 18,
      size: small,
      font,
      color: rgb(0.55, 0.55, 0.55),
      opacity: 0.22,
    });
    page.drawText(text, {
      x: 24,
      y: 18,
      size: small,
      font,
      color: rgb(0.55, 0.55, 0.55),
      opacity: 0.22,
    });
  }

  const out = await pdf.save();
  return new NextResponse(out as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="fiche.pdf"',
      'Cache-Control': 'private, no-store',
    },
  });
}
