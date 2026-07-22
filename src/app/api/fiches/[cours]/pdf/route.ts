import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertAccessActive } from '@/lib/auth/access';
import { getRequestUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';

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
  // Auth duale : cookie (web) ou Bearer (app mobile, avec contrôle d'appareil).
  const auth = await getRequestUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { supabase, user } = auth;
  if (auth.via === 'bearer') {
    const check = await assertDeviceSlot(user.id, req.headers.get(DEVICE_HEADER));
    if (!check.ok) return check.response;
  }

  const expiredRes = await assertAccessActive(supabase, user.id);
  if (expiredRes) return expiredRes;

  const [{ data: profile }, { data: fiches }] = await Promise.all([
    supabase.from('profiles').select('first_name, last_name, email, role').eq('id', user.id).maybeSingle(),
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

  // Téléchargement explicite : ?download=1 → attachment + PDF clair (sans
  // filigrane). Réservé au staff (admin / professeur) ; pour un étudiant
  // qui forgerait la query, on l'ignore silencieusement et on renvoie le
  // PDF inline watermarké comme avant.
  const isStaff = profile?.role === 'admin' || profile?.role === 'professor';
  const wantsDownload = isStaff && new URL(req.url).searchParams.get('download') === '1';

  // Téléchargement du PDF original via service role (bypass RLS storage)
  const admin = createAdminClient();
  const { data: file, error: dlErr } = await admin.storage.from('fiches').download(fiche.storage_path);
  if (dlErr || !file) return NextResponse.json({ error: dlErr?.message ?? 'PDF indisponible' }, { status: 500 });

  // Staff en mode téléchargement : PDF original, sans modification, en
  // attachment. Pas besoin d'embarquer pdf-lib ni les watermarks dans ce
  // chemin → on renvoie directement les bytes du fichier source.
  if (wantsDownload) {
    const bytesRaw = new Uint8Array(await file.arrayBuffer());
    return new NextResponse(bytesRaw as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="fiche-${coursId}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await PDFDocument.load(bytes);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  const firstName = profile?.first_name?.trim() || '';
  const lastName = profile?.last_name?.trim() || '';
  const email = profile?.email?.trim() || user.email || '';
  // Espacement élargi entre prénom et nom (les watermarks penchés les
  // serraient trop) : triple espace normal (WinAnsi ne gère pas les
  // espaces cadratins Unicode).
  const nom = [firstName, lastName].filter(Boolean).join('   ');

  /** Dessine un watermark à 2 lignes (nom prénom au-dessus, email en-dessous)
   *  centré horizontalement à la hauteur yRatio (de 0 à 1, depuis le bas).
   *  Les 2 lignes sont écartées d'environ 1.4× la hauteur du nom pour
   *  éviter tout chevauchement (notamment avec l'inclinaison à 28°). */
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
    // Offset vertical des baselines : garantit un blanc lisible entre nom
    // et email, même après rotation. Tenir compte de l'inclinaison sin(28°)
    // pour décaler aussi horizontalement l'email vers la droite afin que les
    // deux lignes restent alignées perpendiculairement au texte.
    const gap = sizeBig * 1.4;
    const angle = Math.PI / 6.43; // ≈ 28°
    const tilt = Math.cos(angle);
    const slide = Math.sin(angle);

    // Ligne 1 : Prénom Nom (taille gros), au-dessus du centre
    const tw1 = font.widthOfTextAtSize(nom || 'Major ECN', sizeBig);
    page.drawText(nom || 'Major ECN', {
      x: cx - (tw1 / 2) * tilt,
      y: cy + gap / 2,
      size: sizeBig,
      font,
      color: rgb(0.45, 0.45, 0.45),
      opacity: 0.09,
      rotate: degrees(28),
    });

    // Ligne 2 : email (plus petit), espacé d'un cran complet sous le nom
    if (email) {
      const tw2 = font.widthOfTextAtSize(email, sizeSmall);
      page.drawText(email, {
        x: cx - (tw2 / 2) * tilt + gap * slide,
        y: cy - gap / 2,
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
