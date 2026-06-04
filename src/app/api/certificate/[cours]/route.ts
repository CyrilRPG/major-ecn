import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Normalise pour encodage WinAnsi (Helvetica standard ne supporte pas em-dash, smart quotes, ★, etc.). */
function ansi(s: string): string {
  return s
    .replace(/[—–]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
    .replace(/[★☆]/g, '*')
    .replace(/[   ]/g, ' ');
}

/**
 * GET /api/certificate/[coursId]
 * Certificat de fin de parcours signé, A4 portrait, logo officiel Major ECN.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await ctx.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const url = new URL(req.url);
  const overrideUserId = url.searchParams.get('user_id');

  let targetUserId = user.id;
  if (overrideUserId && overrideUserId !== user.id) {
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (prof?.role !== 'admin') return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });
    targetUserId = overrideUserId;
  }

  const { data: completion } = await (supabase as unknown as {
    from: (t: string) => {
      select: (s: string) => {
        eq: (k: string, v: string) => {
          eq: (k: string, v: string) => {
            maybeSingle: () => Promise<{ data: {
              certificate_signed_at: string | null; signature_data_url: string | null; promotion: string | null;
            } | null }>;
          };
        };
      };
    };
  }).from('parcours_completions')
    .select('certificate_signed_at, signature_data_url, promotion')
    .eq('user_id', targetUserId).eq('cours_id', coursId).maybeSingle();

  if (!completion?.certificate_signed_at) {
    return NextResponse.json({ error: 'Certificat non encore signé' }, { status: 404 });
  }

  const [{ data: target }, { data: cours }] = await Promise.all([
    supabase.from('profiles').select('first_name, last_name, promotion').eq('id', targetUserId).maybeSingle(),
    supabase.from('cours').select('titre, matieres(nom)').eq('id', coursId).maybeSingle(),
  ]);

  const firstName = target?.first_name ?? '';
  const lastName  = target?.last_name ?? '';
  const promotion = completion.promotion ?? target?.promotion ?? '';
  const coursTitre = cours?.titre ?? '';
  const matiereNom = (cours as { matieres?: { nom?: string } } | null)?.matieres?.nom ?? '';
  const signedAt = new Date(completion.certificate_signed_at);
  const dateFr = signedAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  /* ============ PDF — A4 portrait ============ */
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]); // A4 portrait
  const { width, height } = page.getSize();

  const fontBold      = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontReg       = await pdf.embedFont(StandardFonts.Helvetica);
  const fontIta       = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const fontSerifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);

  const RED      = rgb(0.753, 0.067, 0.180); // #C0112E
  const NAVY     = rgb(0.059, 0.122, 0.302); // #0F1F4D
  const GOLD     = rgb(0.831, 0.686, 0.216); // #D4AF37
  const INK      = rgb(0.06, 0.09, 0.16);
  const INK_SOFT = rgb(0.32, 0.38, 0.48);
  const GREY     = rgb(0.55, 0.60, 0.68);

  // Bandes décoratives verticales rouges + bordure or
  page.drawRectangle({ x: 0, y: 0, width: 12, height, color: RED });
  page.drawRectangle({ x: width - 12, y: 0, width: 12, height, color: RED });
  const m = 30;
  page.drawRectangle({ x: m, y: m, width: width - 2 * m, height: height - 2 * m, borderColor: GOLD, borderWidth: 2 });
  page.drawRectangle({ x: m + 6, y: m + 6, width: width - 2 * m - 12, height: height - 2 * m - 12, borderColor: GOLD, borderWidth: 0.6 });

  // ============ Logo officiel Major ECN ============
  try {
    const logoPath = join(process.cwd(), 'public', 'major-ecn-logo.png');
    const logoBytes = readFileSync(logoPath);
    const logoImg = await pdf.embedPng(logoBytes);
    const logoH = 90;
    const logoW = (logoImg.width / logoImg.height) * logoH;
    page.drawImage(logoImg, {
      x: (width - logoW) / 2,
      y: height - 60 - logoH,
      width: logoW,
      height: logoH,
    });
  } catch {
    // Fallback texte si le logo manque
    page.drawText('MAJOR', { x: width / 2 - 60, y: height - 110, size: 28, font: fontBold, color: NAVY });
    page.drawText('ECN',   { x: width / 2 + 18, y: height - 110, size: 28, font: fontBold, color: RED });
  }

  // Sous-titre sous le logo
  const subTitle = ansi('PRÉPARATION EVC (PAE) - 18 ANS D\'EXPÉRIENCE');
  page.drawText(subTitle, {
    x: width / 2 - fontBold.widthOfTextAtSize(subTitle, 8) / 2,
    y: height - 175, size: 8, font: fontBold, color: INK_SOFT,
  });

  // Ligne or séparatrice
  page.drawLine({ start: { x: width / 2 - 50, y: height - 195 }, end: { x: width / 2 + 50, y: height - 195 }, color: GOLD, thickness: 1 });

  // ============ Titre CERTIFICAT ============
  const titre1 = ansi('CERTIFICAT');
  const titre1W = fontSerifBold.widthOfTextAtSize(titre1, 40);
  page.drawText(titre1, { x: (width - titre1W) / 2, y: height - 240, size: 40, font: fontSerifBold, color: NAVY });

  const titre2 = ansi('DE FIN DE PARCOURS');
  const titre2W = fontSerifBold.widthOfTextAtSize(titre2, 16);
  page.drawText(titre2, { x: (width - titre2W) / 2, y: height - 268, size: 16, font: fontSerifBold, color: RED });

  // ============ Intro + nom ============
  const intro = ansi('Le présent certificat est décerné à');
  page.drawText(intro, {
    x: width / 2 - fontIta.widthOfTextAtSize(intro, 11) / 2,
    y: height - 320, size: 11, font: fontIta, color: INK_SOFT,
  });

  const nameText = ansi(`${firstName} ${lastName}`.trim().toUpperCase() || '—');
  const nameW = fontSerifBold.widthOfTextAtSize(nameText, 28);
  page.drawText(nameText, { x: (width - nameW) / 2, y: height - 360, size: 28, font: fontSerifBold, color: INK });

  page.drawLine({
    start: { x: (width - nameW) / 2 - 12, y: height - 366 },
    end:   { x: (width + nameW) / 2 + 12, y: height - 366 },
    color: NAVY, thickness: 0.8,
  });

  if (promotion) {
    const promoText = ansi(`Promotion : ${promotion}`);
    page.drawText(promoText, {
      x: width / 2 - fontReg.widthOfTextAtSize(promoText, 11) / 2,
      y: height - 388, size: 11, font: fontReg, color: INK_SOFT,
    });
  }

  // ============ Mention parcours ============
  const mention = ansi('pour avoir mené à terme le parcours pédagogique');
  page.drawText(mention, {
    x: width / 2 - fontReg.widthOfTextAtSize(mention, 12) / 2,
    y: height - 430, size: 12, font: fontReg, color: INK,
  });

  const coursLabel = ansi(matiereNom ? `${matiereNom} - ${coursTitre}` : coursTitre);
  const coursW = fontSerifBold.widthOfTextAtSize(coursLabel, 20);
  page.drawText(coursLabel, {
    x: (width - coursW) / 2,
    y: height - 470, size: 20, font: fontSerifBold, color: RED,
  });

  // ============ Bas de page : date / signature / tampon ============
  // Y baseline pour les libellés du bas (bien plus bas qu'avant pour éviter
  // toute superposition avec le coeur du certificat).
  const labelY = 130; // hauteur des libellés "Délivré le", "Signature", "Tampon"
  const lineY  = 165; // ligne de signature
  const sigY   = 170; // base de la zone signature
  const stampCy = 175;

  // Date (gauche)
  page.drawText(ansi('Délivré le'), { x: 70, y: lineY + 30, size: 8.5, font: fontReg, color: INK_SOFT });
  page.drawText(dateFr, { x: 70, y: lineY + 12, size: 13, font: fontSerifBold, color: INK });
  page.drawLine({ start: { x: 70, y: lineY }, end: { x: 200, y: lineY }, color: GREY, thickness: 0.5 });
  page.drawText(ansi("Date d'émission"), { x: 70, y: labelY, size: 7, font: fontReg, color: GREY });

  // Signature (centre)
  page.drawLine({ start: { x: width / 2 - 75, y: lineY }, end: { x: width / 2 + 75, y: lineY }, color: GREY, thickness: 0.5 });
  const sigLabel = ansi("Signature de l'étudiant");
  page.drawText(sigLabel, {
    x: width / 2 - fontReg.widthOfTextAtSize(sigLabel, 7) / 2,
    y: labelY, size: 7, font: fontReg, color: GREY,
  });
  if (completion.signature_data_url) {
    try {
      const mm = completion.signature_data_url.match(/^data:image\/(png|jpe?g);base64,(.+)$/);
      if (mm) {
        const isPng = mm[1] === 'png';
        const bytes = Buffer.from(mm[2], 'base64');
        const img = isPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
        const scale = Math.min(140 / img.width, 50 / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        page.drawImage(img, { x: width / 2 - w / 2, y: sigY, width: w, height: h });
      }
    } catch { /* best-effort */ }
  }

  // Tampon Major ECN (droite)
  const stampCx = width - 130;
  const R = 38;
  page.drawCircle({ x: stampCx, y: stampCy, size: R, borderColor: RED, borderWidth: 2 });
  page.drawCircle({ x: stampCx, y: stampCy, size: R - 5, borderColor: RED, borderWidth: 0.8 });
  page.drawText('MAJOR',   { x: stampCx - 19, y: stampCy + 6,  size: 10, font: fontBold, color: RED });
  page.drawText('ECN',     { x: stampCx - 10, y: stampCy - 7,  size: 10, font: fontBold, color: RED });
  page.drawText(ansi('CERTIFIÉ'), { x: stampCx - 16, y: stampCy - 21, size: 6, font: fontBold, color: RED });
  page.drawText('*',       { x: stampCx - 3,  y: stampCy + R - 11, size: 11, font: fontBold, color: GOLD });
  page.drawText('Tampon officiel', {
    x: stampCx - fontReg.widthOfTextAtSize('Tampon officiel', 7) / 2,
    y: labelY, size: 7, font: fontReg, color: GREY,
  });

  // ============ Footer ============
  page.drawText(
    ansi('Document généré automatiquement par Major ECN - Préparation EVC (PAE). Toute reproduction non autorisée est interdite.'),
    { x: m + 22, y: m + 18, size: 6, font: fontIta, color: GREY },
  );

  const certId = `${coursId.slice(0, 8)}-${signedAt.getTime().toString(36)}`.toUpperCase();
  page.drawText(ansi(`Réf. : ${certId}`), { x: width - 150, y: m + 18, size: 6, font: fontReg, color: GREY });

  // Filigrane discret en arrière-plan (rotation 30°)
  page.drawText('MAJOR ECN', {
    x: 120, y: 420,
    size: 70, font: fontBold,
    color: rgb(0.95, 0.95, 0.97),
    rotate: degrees(30),
    opacity: 0.5,
  });

  const bytes = await pdf.save();
  const safeName = `${firstName}-${lastName}`.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'eleve';
  const fileName = `certificat-major-ecn-${safeName}-${coursId.slice(0, 8)}.pdf`;
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${fileName}"`,
      'Cache-Control': 'no-store',
    },
  });
}
