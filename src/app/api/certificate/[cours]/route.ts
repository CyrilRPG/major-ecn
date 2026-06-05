import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Normalise pour encodage WinAnsi (Helvetica standard ne supporte pas em-dash, smart quotes, etc.). */
function ansi(s: string): string {
  return s
    .replace(/[—–]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
    .replace(/[★☆]/g, '*')
    .replace(/[   ]/g, ' ')
    .replace(/[«»]/g, '"');
}

/**
 * GET /api/certificate/[coursId]
 * Feuille d'émargement « Révisions et formation » signée par l'étudiant,
 * tamponnée PAE Formation. Format A4 portrait. Conserve la palette
 * et l'encadrement de l'ancien certificat (rouge / or / navy).
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

  // Charge l'enregistrement de complétion (date de signature, signature, score)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: completion } = await (supabase as any)
    .from('parcours_completions')
    .select('certificate_signed_at, signature_data_url, promotion, qcm_test_score, qcm_test_total, qcm_test_completed_at')
    .eq('user_id', targetUserId).eq('cours_id', coursId).maybeSingle();

  if (!completion?.certificate_signed_at) {
    return NextResponse.json({ error: 'Feuille d\'émargement non encore signée' }, { status: 404 });
  }

  const [{ data: target }, { data: cours }] = await Promise.all([
    supabase.from('profiles').select('first_name, last_name, promotion, email').eq('id', targetUserId).maybeSingle(),
    supabase.from('cours').select('titre, matieres(nom)').eq('id', coursId).maybeSingle(),
  ]);

  const firstName = target?.first_name ?? '';
  const lastName  = target?.last_name ?? '';
  const fullName  = `${firstName} ${lastName}`.trim() || target?.email || '—';
  const promotion = (completion as { promotion?: string | null }).promotion ?? target?.promotion ?? '—';
  const coursTitre = cours?.titre ?? '—';
  const matiereNom = (cours as { matieres?: { nom?: string } } | null)?.matieres?.nom ?? '';
  const parcours = matiereNom ? `${matiereNom} - ${coursTitre}` : coursTitre;

  const signedAt = new Date(completion.certificate_signed_at as string);
  const signDay = signedAt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const signHour = signedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // Note : on essaie d'utiliser le score d'interrogation s'il existe.
  const score = (completion as { qcm_test_score?: number | null }).qcm_test_score ?? null;
  const total = (completion as { qcm_test_total?: number | null }).qcm_test_total ?? null;
  let noteText = '—';
  if (score != null && total != null && total > 0) {
    const note20 = (score / total) * 20;
    noteText = `${note20.toFixed(1).replace('.', ',')} / 20`;
  }

  // Si l'interrogation a sa propre date, on l'utilise pour le jour/heure
  const testAt = (completion as { qcm_test_completed_at?: string | null }).qcm_test_completed_at;
  let testDay = signDay;
  let testHour = signHour;
  if (testAt) {
    const d = new Date(testAt);
    testDay = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    testHour = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  /* ============ PDF — A4 portrait ============ */
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
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
  const ROW_BG   = rgb(0.98, 0.98, 0.99);

  /* ── Décor extérieur (identique à l'ancien certificat) ── */
  page.drawRectangle({ x: 0, y: 0, width: 12, height, color: RED });
  page.drawRectangle({ x: width - 12, y: 0, width: 12, height, color: RED });
  const m = 30;
  page.drawRectangle({ x: m, y: m, width: width - 2 * m, height: height - 2 * m, borderColor: GOLD, borderWidth: 2 });
  page.drawRectangle({ x: m + 6, y: m + 6, width: width - 2 * m - 12, height: height - 2 * m - 12, borderColor: GOLD, borderWidth: 0.6 });

  /* ── Logo officiel + watermark (réutilisés) ── */
  let logoImg: Awaited<ReturnType<typeof pdf.embedPng>> | null = null;
  try {
    const logoPath = join(process.cwd(), 'public', 'major-ecn-logo.png');
    const logoBytes = readFileSync(logoPath);
    logoImg = await pdf.embedPng(logoBytes);
    const wmH = 480;
    const wmW = (logoImg.width / logoImg.height) * wmH;
    page.drawImage(logoImg, {
      x: (width - wmW) / 2,
      y: (height - wmH) / 2,
      width: wmW, height: wmH,
      opacity: 0.05,
    });
  } catch { /* logo manquant : on continue */ }

  if (logoImg) {
    const logoH = 72;
    const logoW = (logoImg.width / logoImg.height) * logoH;
    page.drawImage(logoImg, {
      x: (width - logoW) / 2,
      y: height - 60 - logoH,
      width: logoW, height: logoH,
    });
  } else {
    page.drawText('MAJOR', { x: width / 2 - 60, y: height - 110, size: 28, font: fontBold, color: NAVY });
    page.drawText('ECN',   { x: width / 2 + 18, y: height - 110, size: 28, font: fontBold, color: RED });
  }

  const subTitle = ansi('PRÉPARATION EVC (PAE) - 18 ANS D\'EXPÉRIENCE');
  page.drawText(subTitle, {
    x: width / 2 - fontBold.widthOfTextAtSize(subTitle, 8) / 2,
    y: height - 155, size: 8, font: fontBold, color: INK_SOFT,
  });

  page.drawLine({ start: { x: width / 2 - 50, y: height - 172 }, end: { x: width / 2 + 50, y: height - 172 }, color: GOLD, thickness: 1 });

  /* ── Titre principal ── */
  const t1 = ansi('FEUILLE D\'ÉMARGEMENT');
  const t1W = fontSerifBold.widthOfTextAtSize(t1, 30);
  page.drawText(t1, { x: (width - t1W) / 2, y: height - 215, size: 30, font: fontSerifBold, color: NAVY });

  const t2 = ansi('Révisions et formation');
  const t2W = fontSerifBold.widthOfTextAtSize(t2, 14);
  page.drawText(t2, { x: (width - t2W) / 2, y: height - 240, size: 14, font: fontSerifBold, color: RED });

  /* ── Bandeau d'identité élève ── */
  const idBoxY = height - 320;
  page.drawRectangle({ x: 60, y: idBoxY, width: width - 120, height: 55, borderColor: GOLD, borderWidth: 0.6, color: rgb(0.99, 0.97, 0.91) });

  page.drawText(ansi('Élève'), { x: 75, y: idBoxY + 36, size: 8.5, font: fontBold, color: INK_SOFT });
  page.drawText(ansi(fullName.toUpperCase()), { x: 75, y: idBoxY + 18, size: 14, font: fontSerifBold, color: INK });

  page.drawText(ansi('Promotion'), { x: width / 2 + 10, y: idBoxY + 36, size: 8.5, font: fontBold, color: INK_SOFT });
  page.drawText(ansi(promotion), { x: width / 2 + 10, y: idBoxY + 18, size: 12, font: fontSerifBold, color: INK });

  /* ── Tableau d'émargement ── */
  // Colonnes : Date | Heure | Parcours suivi | Note | Signature
  const tableTop = idBoxY - 40;
  const tableLeft = 60;
  const tableRight = width - 60;
  const tableW = tableRight - tableLeft;
  const colW = [70, 60, tableW - 70 - 60 - 80 - 110, 80, 110]; // 5 colonnes
  const headers = ['Date', 'Heure', 'Parcours suivi', 'Note', 'Signature'];

  // En-tête du tableau
  const headerH = 26;
  page.drawRectangle({ x: tableLeft, y: tableTop - headerH, width: tableW, height: headerH, color: NAVY });
  let cx = tableLeft;
  headers.forEach((h, i) => {
    const text = ansi(h);
    const w = fontBold.widthOfTextAtSize(text, 9);
    page.drawText(text, {
      x: cx + (colW[i] - w) / 2,
      y: tableTop - 17,
      size: 9, font: fontBold, color: rgb(1, 1, 1),
    });
    cx += colW[i];
  });

  // Ligne de données (1 seule entrée pour ce cours)
  const rowH = 56;
  const rowY = tableTop - headerH - rowH;
  page.drawRectangle({ x: tableLeft, y: rowY, width: tableW, height: rowH, color: ROW_BG, borderColor: GOLD, borderWidth: 0.4 });

  // Séparateurs verticaux
  cx = tableLeft;
  for (let i = 0; i < colW.length - 1; i++) {
    cx += colW[i];
    page.drawLine({ start: { x: cx, y: rowY }, end: { x: cx, y: rowY + rowH }, color: GREY, thickness: 0.3 });
  }

  // Texte des cellules
  // Date
  cx = tableLeft;
  page.drawText(ansi(testDay), {
    x: cx + (colW[0] - fontSerifBold.widthOfTextAtSize(testDay, 10)) / 2,
    y: rowY + rowH / 2 - 3, size: 10, font: fontSerifBold, color: INK,
  });
  cx += colW[0];
  // Heure
  page.drawText(ansi(testHour), {
    x: cx + (colW[1] - fontSerifBold.widthOfTextAtSize(testHour, 10)) / 2,
    y: rowY + rowH / 2 - 3, size: 10, font: fontSerifBold, color: INK,
  });
  cx += colW[1];
  // Parcours suivi (peut nécessiter un retour à la ligne si trop long)
  const maxParcoursW = colW[2] - 14;
  const drawWrapped = (text: string, x0: number, y0: number, maxW: number, size: number, font: typeof fontReg, color: ReturnType<typeof rgb>) => {
    const safe = ansi(text);
    const words = safe.split(' ');
    let line = '';
    let lineY = y0;
    for (const w of words) {
      const tryLine = line ? line + ' ' + w : w;
      if (font.widthOfTextAtSize(tryLine, size) > maxW) {
        page.drawText(line, { x: x0, y: lineY, size, font, color });
        lineY -= size + 2;
        line = w;
      } else {
        line = tryLine;
      }
    }
    if (line) page.drawText(line, { x: x0, y: lineY, size, font, color });
  };
  drawWrapped(parcours, cx + 7, rowY + rowH - 16, maxParcoursW, 10, fontSerifBold, INK);
  cx += colW[2];
  // Note
  page.drawText(ansi(noteText), {
    x: cx + (colW[3] - fontSerifBold.widthOfTextAtSize(noteText, 11)) / 2,
    y: rowY + rowH / 2 - 4, size: 11, font: fontSerifBold, color: RED,
  });
  cx += colW[3];
  // Signature (intégrée si data URL présente)
  const sigCellX = cx;
  const sigCellW = colW[4];
  if ((completion as { signature_data_url?: string | null }).signature_data_url) {
    try {
      const mm = (completion.signature_data_url as string).match(/^data:image\/(png|jpe?g);base64,(.+)$/);
      if (mm) {
        const isPng = mm[1] === 'png';
        const bytes = Buffer.from(mm[2], 'base64');
        const img = isPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
        const scale = Math.min((sigCellW - 14) / img.width, (rowH - 10) / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        page.drawImage(img, {
          x: sigCellX + (sigCellW - w) / 2,
          y: rowY + (rowH - h) / 2,
          width: w, height: h,
        });
      }
    } catch { /* best-effort */ }
  } else {
    // Placeholder : ligne pointillée
    page.drawLine({
      start: { x: sigCellX + 8, y: rowY + 14 },
      end: { x: sigCellX + sigCellW - 8, y: rowY + 14 },
      color: GREY, thickness: 0.5, dashArray: [2, 2],
    });
  }

  /* ── Légende sous le tableau ── */
  page.drawText(ansi('Document attestant la réalisation effective du parcours pédagogique en autoformation supervisée.'), {
    x: tableLeft, y: rowY - 18, size: 8, font: fontIta, color: GREY,
  });

  /* ── Tampon PAE Formation (en bas à droite) ── */
  const stampPath = join(process.cwd(), 'public', 'tampon-pae-formation.png');
  const stampCx = width - 145;
  const stampCy = 175;
  if (existsSync(stampPath)) {
    try {
      const stampBytes = readFileSync(stampPath);
      const stampImg = await pdf.embedPng(stampBytes);
      const stampH = 110;
      const stampW = (stampImg.width / stampImg.height) * stampH;
      page.drawImage(stampImg, {
        x: stampCx - stampW / 2, y: stampCy - stampH / 2,
        width: stampW, height: stampH,
        opacity: 0.92,
      });
    } catch {
      drawVectorPaeStamp(page, stampCx, stampCy, fontBold, fontReg, RED);
    }
  } else {
    drawVectorPaeStamp(page, stampCx, stampCy, fontBold, fontReg, RED);
  }
  page.drawText(ansi('Tampon de l\'organisme de formation'), {
    x: stampCx - fontReg.widthOfTextAtSize(ansi('Tampon de l\'organisme de formation'), 7) / 2,
    y: stampCy - 75, size: 7, font: fontReg, color: GREY,
  });

  /* ── Bloc « Date d'émargement » à gauche ── */
  const leftBlockY = 175;
  page.drawText(ansi('Émargement'), { x: 70, y: leftBlockY + 28, size: 8.5, font: fontBold, color: INK_SOFT });
  page.drawText(ansi(`Le ${signDay} à ${signHour}`), { x: 70, y: leftBlockY + 10, size: 11, font: fontSerifBold, color: INK });
  page.drawLine({ start: { x: 70, y: leftBlockY }, end: { x: 220, y: leftBlockY }, color: GREY, thickness: 0.5 });
  page.drawText(ansi('Date et heure de signature'), { x: 70, y: leftBlockY - 12, size: 7, font: fontReg, color: GREY });

  /* ── Footer ── */
  page.drawText(
    ansi('Feuille d\'émargement générée automatiquement par Major ECN - Préparation EVC (PAE). PAE Formation, 3 rue Rosa Bonheur, 75015 Paris.'),
    { x: m + 22, y: m + 18, size: 6, font: fontIta, color: GREY },
  );
  const certId = `${coursId.slice(0, 8)}-${signedAt.getTime().toString(36)}`.toUpperCase();
  page.drawText(ansi(`Réf. : ${certId}`), { x: width - 150, y: m + 18, size: 6, font: fontReg, color: GREY });

  const bytes = await pdf.save();
  const safeName = `${firstName}-${lastName}`.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'eleve';
  const fileName = `emargement-major-ecn-${safeName}-${coursId.slice(0, 8)}.pdf`;
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${fileName}"`,
      'Cache-Control': 'no-store',
    },
  });
}

/* ──────────────────────────────────────────────
   Tampon vectoriel « PAE Formation » de secours
   (utilisé tant que public/tampon-pae-formation.png
   n'est pas fourni).
   ────────────────────────────────────────────── */
type PdfPage = Parameters<PDFDocument['addPage']> extends [] ? never : ReturnType<PDFDocument['addPage']>;

function drawVectorPaeStamp(
  page: PdfPage,
  cx: number,
  cy: number,
  fontBold: Awaited<ReturnType<PDFDocument['embedFont']>>,
  fontReg: Awaited<ReturnType<PDFDocument['embedFont']>>,
  red: ReturnType<typeof rgb>,
) {
  // Ovale extérieur (approximé par 2 cercles + rectangle) — on se contente d'une
  // bordure ovale stylisée par un rectangle arrondi à bord rouge.
  const w = 120;
  const h = 70;
  const x0 = cx - w / 2;
  const y0 = cy - h / 2;

  // Rectangle ovale (bordure)
  page.drawRectangle({ x: x0, y: y0, width: w, height: h, borderColor: red, borderWidth: 1.4, opacity: 0.9 });
  page.drawRectangle({ x: x0 + 3, y: y0 + 3, width: w - 6, height: h - 6, borderColor: red, borderWidth: 0.6, opacity: 0.7 });

  // Logo « PAE » stylisé en gros à gauche (légèrement penché)
  page.drawText('PAE', {
    x: x0 + 6, y: y0 + h / 2 + 4,
    size: 14, font: fontBold, color: red, rotate: degrees(-6),
  });
  page.drawText('FORMATION', {
    x: x0 + 6, y: y0 + h / 2 - 10,
    size: 7, font: fontBold, color: red, rotate: degrees(-6),
  });

  // Coordonnées sur 4 lignes à droite, façon tampon authentique
  const lines = [
    'PAE Formation',
    '3 rue Rosa Bonheur',
    '75015 - Paris',
    'Tél. : 01.47.34.35.71',
    'Siret 821 740 537 00013',
  ];
  let ly = y0 + h - 12;
  for (const line of lines) {
    page.drawText(line, { x: x0 + 50, y: ly, size: 6, font: fontReg, color: red, opacity: 0.9 });
    ly -= 7.5;
  }
}
