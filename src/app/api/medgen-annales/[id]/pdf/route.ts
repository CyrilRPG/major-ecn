import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { requireUser } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessAnnalesEvc, parseScope } from '@/lib/auth/permissions';

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

  const { user, profile: authProfile } = await requireUser();
  // Réservé à la Médecine générale (même règle que les pages /annales).
  // Sans ce check, un élève d'une autre spécialité pouvait ouvrir le PDF
  // directement via l'URL de l'API.
  if (
    authProfile.role === 'student' &&
    !canAccessAnnalesEvc(parseScope(authProfile.permission_scope))
  ) {
    return NextResponse.json(
      { error: 'Annales EVC réservées à la Médecine générale.' },
      { status: 403 },
    );
  }
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

  // Charge le PDF source. Si pdf-lib échoue, on renvoie le PDF brut sans
  // watermark plutôt qu'un écran blanc → l'élève voit au moins le sujet.
  let pdf: PDFDocument;
  try {
    pdf = await PDFDocument.load(bytes);
  } catch (e) {
    console.error('[medgen-annales] pdf-lib load failed, fallback brut :', (e as Error).message);
    return new NextResponse(Buffer.from(bytes) as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="annale.pdf"',
        'Cache-Control': 'private, no-store',
      },
    });
  }
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  const firstName = profile?.first_name?.trim() || '';
  const lastName = profile?.last_name?.trim() || '';
  const email = profile?.email?.trim() || user.email || '';
  // Sanitize : pdf-lib (WinAnsi) ne supporte pas certains caractères
  const safe = (s: string) => s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/[^\x09\x0a\x0d\x20-\x7e\xa0-\xff]/g, '');
  const nom = safe(`${firstName} ${lastName}`.trim() || email);
  const emailSafe = safe(email);

  // Charge le logo Major ECN pour le filigrane de fond (PNG)
  let logoImage = null;
  try {
    const logoPath = path.join(process.cwd(), 'public', 'major-ecn-logo.png');
    if (existsSync(logoPath)) {
      logoImage = await pdf.embedPng(readFileSync(logoPath));
    }
  } catch {/* ignore */}

  /** Dessine un watermark identité (nom + email) en diagonale, centré
   *  horizontalement, à la hauteur yRatio (0 = bas, 1 = haut). Appelé deux
   *  fois par page pour matérialiser le marquage au tiers supérieur ET
   *  inférieur (le logo Major ECN reste au centre). */
  const drawIdentityWatermark = (
    page: ReturnType<typeof pdf.getPages>[number],
    width: number,
    height: number,
    yRatio: number,
  ) => {
    const angleDeg = 28;
    const a = (angleDeg * Math.PI) / 180;
    const sizeBig = Math.max(24, Math.min(width, height) * 0.045);
    const sizeSmall = sizeBig * 0.6;
    const cx = width / 2;
    const cy = height * yRatio;

    const drawAtCenter = (text: string, size: number, offsetY: number) => {
      if (!text) return;
      const tw = font.widthOfTextAtSize(text, size);
      // Compense la rotation pour que le CENTRE du texte tombe en (cx, cy+offset).
      const x = cx - (tw / 2) * Math.cos(a) + (size / 2) * Math.sin(a) - offsetY * Math.sin(a);
      const y = cy - (tw / 2) * Math.sin(a) - (size / 2) * Math.cos(a) + offsetY * Math.cos(a);
      page.drawText(text, {
        x, y, size, font,
        color: rgb(0.55, 0.55, 0.6),
        opacity: 0.09,
        rotate: degrees(angleDeg),
      });
    };

    drawAtCenter(nom || 'Major ECN', sizeBig, sizeBig * 0.45);
    if (emailSafe) drawAtCenter(emailSafe, sizeSmall, -sizeBig * 0.55);
  };

  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();

    // 1. Logo Major ECN en filigrane de fond (centré, très transparent) — inchangé.
    if (logoImage) {
      const targetW = Math.min(width, height) * 0.5;
      const scale = targetW / logoImage.width;
      const w = logoImage.width * scale;
      const h = logoImage.height * scale;
      page.drawImage(logoImage, {
        x: (width - w) / 2,
        y: (height - h) / 2,
        width: w,
        height: h,
        opacity: 0.035,
      });
    }

    // 2. Deux watermarks identité, au tiers supérieur (yRatio = 2/3) et au
    //    tiers inférieur (yRatio = 1/3). Le logo Major ECN reste au centre,
    //    encadré par les deux marquages.
    drawIdentityWatermark(page, width, height, 2 / 3);
    drawIdentityWatermark(page, width, height, 1 / 3);
  }

  let out: Uint8Array;
  try {
    out = await pdf.save();
  } catch (e) {
    console.error('[medgen-annales] pdf-lib save failed, fallback brut :', (e as Error).message);
    return new NextResponse(Buffer.from(bytes) as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="annale.pdf"',
        'Cache-Control': 'private, no-store',
      },
    });
  }
  // ASCII-safe filename pour Content-Disposition (RFC 6266 strict)
  const asciiName = row.label.replace(/[^\x20-\x7e]/g, '_');
  return new NextResponse(Buffer.from(out) as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(out.byteLength),
      'Content-Disposition': `inline; filename="${asciiName}.pdf"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
