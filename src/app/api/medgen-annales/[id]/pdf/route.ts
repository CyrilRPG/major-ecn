import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { requireUser } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/medgen-annales/[id]/pdf?type=sujet|corrige
 *
 * Lit le PDF source dans data/medgen-annales/ et le restitue après
 * application du watermark utilisateur (logo Major ECN en fond + identité
 * en diagonale au milieu).
 */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const kind = (url.searchParams.get('type') ?? 'sujet') as 'sujet' | 'corrige';

  const { user } = await requireUser();
  const admin = createAdminClient();

  const [{ data: row }, { data: profile }] = await Promise.all([
    admin.from('medgen_annales').select('label, sujet_path, corrige_path').eq('id', id).maybeSingle(),
    admin.from('profiles').select('first_name, last_name, email').eq('id', user.id).maybeSingle(),
  ]);
  if (!row) return NextResponse.json({ error: 'Annale introuvable' }, { status: 404 });

  const filePath = kind === 'corrige' ? row.corrige_path : row.sujet_path;
  if (!filePath) {
    return NextResponse.json({ error: 'Corrigé à venir — pas encore disponible.' }, { status: 404 });
  }

  const absPath = path.join(process.cwd(), 'data', 'medgen-annales', filePath);
  if (!existsSync(absPath)) {
    return NextResponse.json({ error: 'Fichier PDF manquant sur le serveur.' }, { status: 500 });
  }

  const bytes = readFileSync(absPath);
  const pdf = await PDFDocument.load(bytes);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  const firstName = profile?.first_name?.trim() || '';
  const lastName = profile?.last_name?.trim() || '';
  const email = profile?.email?.trim() || user.email || '';
  const nom = `${firstName} ${lastName}`.trim() || email;

  // Charge le logo Major ECN pour le filigrane de fond (PNG)
  let logoImage = null;
  try {
    const logoPath = path.join(process.cwd(), 'public', 'major-ecn-logo.png');
    if (existsSync(logoPath)) {
      logoImage = await pdf.embedPng(readFileSync(logoPath));
    }
  } catch {/* ignore */}

  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();

    // 1. Logo Major ECN en filigrane de fond (centré, très transparent)
    if (logoImage) {
      const targetW = Math.min(width, height) * 0.62;
      const scale = targetW / logoImage.width;
      const w = logoImage.width * scale;
      const h = logoImage.height * scale;
      page.drawImage(logoImage, {
        x: (width - w) / 2,
        y: (height - h) / 2,
        width: w,
        height: h,
        opacity: 0.06,
      });
    }

    // 2. Nom prénom + email en diagonale au milieu (gris transparent)
    const size = Math.max(28, Math.min(width, height) * 0.06);
    const tw1 = font.widthOfTextAtSize(nom, size);
    const tw2 = font.widthOfTextAtSize(email, size * 0.7);
    const cx = width / 2;
    const cy = height / 2;
    // Ligne 1 (nom prénom)
    page.drawText(nom, {
      x: cx - tw1 / 2 * Math.cos(Math.PI / 6),
      y: cy + 8,
      size,
      font,
      color: rgb(0.45, 0.45, 0.45),
      opacity: 0.22,
      rotate: degrees(28),
    });
    // Ligne 2 (email) — sous le nom, même rotation
    page.drawText(email, {
      x: cx - tw2 / 2 * Math.cos(Math.PI / 6),
      y: cy - size * 0.6,
      size: size * 0.7,
      font,
      color: rgb(0.45, 0.45, 0.45),
      opacity: 0.22,
      rotate: degrees(28),
    });
  }

  const out = await pdf.save();
  return new NextResponse(out as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${row.label}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
