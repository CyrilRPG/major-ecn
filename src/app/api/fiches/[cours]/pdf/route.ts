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
  const nom = `${firstName} ${lastName}`.trim();

  /** Dessine un watermark à 2 lignes (nom prénom au-dessus, email en-dessous)
   *  centré horizontalement à la hauteur yRatio (de 0 à 1, depuis le bas). */
  const drawWatermark = (
    page: ReturnType<typeof pdf.getPages>[number],
    width: number,
    height: number,
    yRatio: number,
  ) => {
    const sizeBig = Math.max(28, Math.min(width, height) * 0.06);
    const sizeSmall = sizeBig * 0.7;
    const cx = width / 2;
    const cy = height * yRatio;

    // Ligne 1 : Prénom Nom (taille gros)
    const tw1 = font.widthOfTextAtSize(nom || 'Major ECN', sizeBig);
    page.drawText(nom || 'Major ECN', {
      x: cx - (tw1 / 2) * Math.cos(Math.PI / 6.43),
      y: cy + 8,
      size: sizeBig,
      font,
      color: rgb(0.45, 0.45, 0.45),
      opacity: 0.09,
      rotate: degrees(28),
    });

    // Ligne 2 : email (plus petit, juste en dessous)
    if (email) {
      const tw2 = font.widthOfTextAtSize(email, sizeSmall);
      page.drawText(email, {
        x: cx - (tw2 / 2) * Math.cos(Math.PI / 6.43),
        y: cy - sizeBig * 0.6,
        size: sizeSmall,
        font,
        color: rgb(0.45, 0.45, 0.45),
        opacity: 0.09,
        rotate: degrees(28),
      });
    }
  };

  // 2 watermarks par page : un à 1/3 et un à 2/3 de la hauteur.
  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    drawWatermark(page, width, height, 2 / 3); // tiers supérieur
    drawWatermark(page, width, height, 1 / 3); // tiers inférieur
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
