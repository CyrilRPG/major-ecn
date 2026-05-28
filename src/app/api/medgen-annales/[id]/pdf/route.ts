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

  // En prod Vercel, process.cwd() peut différer du root du projet. On essaie
  // plusieurs emplacements possibles et on remonte une erreur lisible.
  const candidates = [
    path.join(process.cwd(), 'data', 'medgen-annales', filePath),
    path.join(process.cwd(), '.next', 'standalone', 'data', 'medgen-annales', filePath),
    path.join('/var/task/data/medgen-annales', filePath),
  ];
  const absPath = candidates.find((p) => existsSync(p));
  if (!absPath) {
    console.error('[medgen-annales] PDF introuvable. Candidats testés :', candidates);
    return NextResponse.json(
      { error: 'Fichier PDF manquant sur le serveur — vérifiez le bundle de la fonction (outputFileTracingIncludes).' },
      { status: 500 },
    );
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

  /** Dessine un watermark 2 lignes (nom prénom + email) centré au yRatio donné. */
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

    const tw1 = font.widthOfTextAtSize(nom || 'Major ECN', sizeBig);
    page.drawText(nom || 'Major ECN', {
      x: cx - (tw1 / 2) * Math.cos(Math.PI / 6.43),
      y: cy + 8,
      size: sizeBig,
      font,
      color: rgb(0.45, 0.45, 0.45),
      opacity: 0.22,
      rotate: degrees(28),
    });

    if (email) {
      const tw2 = font.widthOfTextAtSize(email, sizeSmall);
      page.drawText(email, {
        x: cx - (tw2 / 2) * Math.cos(Math.PI / 6.43),
        y: cy - sizeBig * 0.6,
        size: sizeSmall,
        font,
        color: rgb(0.45, 0.45, 0.45),
        opacity: 0.22,
        rotate: degrees(28),
      });
    }
  };

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

    // 2. Deux watermarks identité — à 1/3 et 2/3 de la hauteur, en diagonale
    drawWatermark(page, width, height, 2 / 3);
    drawWatermark(page, width, height, 1 / 3);
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
