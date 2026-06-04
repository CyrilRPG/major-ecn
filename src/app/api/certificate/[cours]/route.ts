import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/certificate/[coursId]
 *
 * Génère un PDF de certificat de fin de parcours signé, design pro :
 * - Logo Major ECN
 * - Encadré or
 * - Nom + prénom de l'élève
 * - Spécialité (cours)
 * - Date
 * - Signature scannée
 * - Tampon Major ECN
 *
 * Accessible :
 * - par l'élève propriétaire du certificat
 * - par un admin (via param ?user_id=<uuid>)
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await ctx.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const url = new URL(req.url);
  const overrideUserId = url.searchParams.get('user_id');

  // Si admin demande pour un autre élève → utilise overrideUserId
  let targetUserId = user.id;
  if (overrideUserId && overrideUserId !== user.id) {
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (prof?.role !== 'admin') return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });
    targetUserId = overrideUserId;
  }

  // Lit le certificat signé
  const { data: completion } = await (supabase as unknown as {
    from: (t: string) => {
      select: (s: string) => {
        eq: (k: string, v: string) => {
          eq: (k: string, v: string) => {
            maybeSingle: () => Promise<{ data: {
              qcm_test_score: number | null; qcm_test_total: number | null;
              certificate_signed_at: string | null; signature_data_url: string | null;
              promotion: string | null;
            } | null }>;
          };
        };
      };
    };
  }).from('parcours_completions')
    .select('qcm_test_score, qcm_test_total, certificate_signed_at, signature_data_url, promotion')
    .eq('user_id', targetUserId).eq('cours_id', coursId).maybeSingle();

  if (!completion?.certificate_signed_at) {
    return NextResponse.json({ error: 'Certificat non encore signé' }, { status: 404 });
  }

  const [{ data: target }, { data: cours }] = await Promise.all([
    supabase.from('profiles').select('first_name, last_name, promotion').eq('id', targetUserId).maybeSingle(),
    supabase.from('cours').select('titre, matieres(nom)').eq('id', coursId).maybeSingle(),
  ]);

  const firstName = target?.first_name ?? '—';
  const lastName = target?.last_name ?? '—';
  const promotion = completion.promotion ?? target?.promotion ?? '—';
  const coursTitre = cours?.titre ?? '—';
  const matiereNom = (cours as { matieres?: { nom?: string } } | null)?.matieres?.nom ?? '';
  const signedAt = new Date(completion.certificate_signed_at);
  const dateFr = signedAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const score = completion.qcm_test_score ?? 0;
  const total = completion.qcm_test_total ?? 0;

  // ============ PDF ============
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]); // A4 paysage
  const { width, height } = page.getSize();

  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontReg = await pdf.embedFont(StandardFonts.Helvetica);
  const fontIta = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const fontSerif = await pdf.embedFont(StandardFonts.TimesRoman);
  const fontSerifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);

  const RED = rgb(0.753, 0.067, 0.180);  // #C0112E
  const NAVY = rgb(0.059, 0.122, 0.302); // #0F1F4D
  const GOLD = rgb(0.831, 0.686, 0.216); // #D4AF37
  const INK = rgb(0.06, 0.09, 0.16);
  const INK_SOFT = rgb(0.32, 0.38, 0.48);
  const GREY = rgb(0.55, 0.60, 0.68);

  // Bandes décoratives verticales rouges (gauche + droite)
  page.drawRectangle({ x: 0, y: 0, width: 14, height, color: RED });
  page.drawRectangle({ x: width - 14, y: 0, width: 14, height, color: RED });

  // Bordure principale or
  const m = 32;
  page.drawRectangle({ x: m, y: m, width: width - 2 * m, height: height - 2 * m, borderColor: GOLD, borderWidth: 2 });
  page.drawRectangle({ x: m + 6, y: m + 6, width: width - 2 * m - 12, height: height - 2 * m - 12, borderColor: GOLD, borderWidth: 0.6 });

  // Logo Major ECN (texte stylisé)
  page.drawText('MAJOR', { x: width / 2 - 70, y: height - 80, size: 26, font: fontBold, color: NAVY });
  page.drawText('ECN', { x: width / 2 + 8, y: height - 80, size: 26, font: fontBold, color: RED });
  page.drawText('PRÉPARATION EVC (PAE) — 18 ANS D\'EXPÉRIENCE', { x: width / 2 - 130, y: height - 100, size: 8, font: fontBold, color: INK_SOFT });

  // Titre
  page.drawText('CERTIFICAT', { x: width / 2 - 105, y: height - 165, size: 36, font: fontSerifBold, color: NAVY });
  page.drawText('DE FIN DE PARCOURS', { x: width / 2 - 115, y: height - 195, size: 16, font: fontSerifBold, color: RED });

  // Ligne d'or
  page.drawLine({ start: { x: width / 2 - 60, y: height - 215 }, end: { x: width / 2 + 60, y: height - 215 }, color: GOLD, thickness: 1.2 });

  // Texte d'introduction
  page.drawText('Le présent certificat est décerné à', {
    x: width / 2 - 110, y: height - 240, size: 11, font: fontIta, color: INK_SOFT,
  });

  // Nom + prénom
  const nameText = `${firstName} ${lastName}`.toUpperCase();
  const nameWidth = fontSerifBold.widthOfTextAtSize(nameText, 30);
  page.drawText(nameText, { x: (width - nameWidth) / 2, y: height - 285, size: 30, font: fontSerifBold, color: INK });

  // Underline sous le nom
  page.drawLine({
    start: { x: (width - nameWidth) / 2 - 10, y: height - 290 },
    end:   { x: (width + nameWidth) / 2 + 10, y: height - 290 },
    color: NAVY, thickness: 0.8,
  });

  // Promo
  page.drawText(`Promotion : ${promotion}`, {
    x: width / 2 - fontReg.widthOfTextAtSize(`Promotion : ${promotion}`, 11) / 2,
    y: height - 310, size: 11, font: fontReg, color: INK_SOFT,
  });

  // Mention parcours
  page.drawText('pour avoir mené à terme le parcours pédagogique', {
    x: width / 2 - fontReg.widthOfTextAtSize('pour avoir mené à terme le parcours pédagogique', 12) / 2,
    y: height - 345, size: 12, font: fontReg, color: INK,
  });
  const coursLabel = matiereNom ? `${matiereNom} — ${coursTitre}` : coursTitre;
  const coursWidth = fontSerifBold.widthOfTextAtSize(coursLabel, 18);
  page.drawText(coursLabel, {
    x: (width - coursWidth) / 2,
    y: height - 375, size: 18, font: fontSerifBold, color: RED,
  });

  // Score + date
  if (total > 0) {
    const scoreText = `Score à l'interrogation finale : ${score} / ${total} (${Math.round((score / total) * 100)}%)`;
    page.drawText(scoreText, {
      x: width / 2 - fontReg.widthOfTextAtSize(scoreText, 10) / 2,
      y: height - 400, size: 10, font: fontIta, color: INK_SOFT,
    });
  }

  // ============ Bas du certificat : date / signature / tampon ============
  const baseY = 130;

  // Date (gauche)
  page.drawText('Délivré le', { x: 100, y: baseY + 60, size: 9, font: fontReg, color: INK_SOFT });
  page.drawText(dateFr, { x: 100, y: baseY + 42, size: 13, font: fontSerifBold, color: INK });
  page.drawLine({ start: { x: 100, y: baseY + 35 }, end: { x: 240, y: baseY + 35 }, color: GREY, thickness: 0.5 });
  page.drawText('Date d\'émission', { x: 100, y: baseY + 22, size: 7, font: fontReg, color: GREY });

  // Signature étudiant (milieu)
  page.drawLine({ start: { x: width / 2 - 80, y: baseY + 35 }, end: { x: width / 2 + 80, y: baseY + 35 }, color: GREY, thickness: 0.5 });
  page.drawText('Signature de l\'étudiant', { x: width / 2 - fontReg.widthOfTextAtSize('Signature de l\'étudiant', 7) / 2, y: baseY + 22, size: 7, font: fontReg, color: GREY });
  // Embed la signature data URL
  if (completion.signature_data_url) {
    try {
      const m = completion.signature_data_url.match(/^data:image\/(png|jpe?g);base64,(.+)$/);
      if (m) {
        const isPng = m[1] === 'png';
        const bytes = Buffer.from(m[2], 'base64');
        const img = isPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
        const scale = Math.min(150 / img.width, 60 / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        page.drawImage(img, { x: width / 2 - w / 2, y: baseY + 38, width: w, height: h });
      }
    } catch { /* image embed best-effort */ }
  }

  // Tampon Major ECN (droite) — cercle rouge stylisé
  const stampCx = width - 180;
  const stampCy = baseY + 55;
  const R = 40;
  page.drawCircle({ x: stampCx, y: stampCy, size: R, borderColor: RED, borderWidth: 2 });
  page.drawCircle({ x: stampCx, y: stampCy, size: R - 5, borderColor: RED, borderWidth: 0.8 });
  // Texte sur le tampon
  page.drawText('MAJOR', { x: stampCx - 23, y: stampCy + 6, size: 11, font: fontBold, color: RED });
  page.drawText('ECN', { x: stampCx - 11, y: stampCy - 8, size: 11, font: fontBold, color: RED });
  page.drawText('CERTIFIÉ', { x: stampCx - 17, y: stampCy - 22, size: 6, font: fontBold, color: RED });
  // Petit tilt visuel (overlay arc avec rotation)
  page.drawText('★', { x: stampCx - 4, y: stampCy + R - 12, size: 12, font: fontBold, color: GOLD });

  // Mention bas de page
  page.drawText(
    'Document généré automatiquement par Major ECN — Préparation EVC (PAE). Toute reproduction non autorisée est interdite.',
    { x: m + 30, y: m + 14, size: 6.5, font: fontIta, color: GREY },
  );

  // ID unique de vérification (en bas-droite, discret)
  const certId = `${coursId.slice(0, 8)}-${signedAt.getTime().toString(36)}`.toUpperCase();
  page.drawText(`Réf. : ${certId}`, { x: width - 180, y: m + 14, size: 6.5, font: fontReg, color: GREY });

  // Filigrane MAJOR ECN en arrière-plan (rotation 30°)
  page.drawText('MAJOR ECN', {
    x: 200, y: 250,
    size: 90, font: fontBold,
    color: rgb(0.94, 0.94, 0.96),
    rotate: degrees(30),
    opacity: 0.6,
  });

  const bytes = await pdf.save();
  const safeName = `${firstName}-${lastName}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const fileName = `certificat-major-ecn-${safeName}-${coursId.slice(0, 8)}.pdf`;
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${fileName}"`,
      'Cache-Control': 'no-store',
    },
  });
}
