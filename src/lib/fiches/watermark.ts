import 'server-only';

/**
 * Applique un watermark diagonal (prénom + nom au-dessus, email en-dessous),
 * répété 2× par page, sur un PDF — dissuasion contre la diffusion non autorisée.
 *
 * Factorisé pour être réutilisé par :
 *  - /api/fiches/[cours]/pdf       (consultation élève)
 *  - /api/fiches/[cours]/download  (téléchargement professeur)
 */
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';

export type WatermarkIdentity = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

export async function watermarkPdf(bytes: Uint8Array, who: WatermarkIdentity): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(bytes);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  const firstName = who.firstName?.trim() || '';
  const lastName = who.lastName?.trim() || '';
  const email = who.email?.trim() || '';
  // Espacement élargi entre prénom et nom (triple espace : WinAnsi ne gère pas
  // les espaces cadratins Unicode).
  const nom = [firstName, lastName].filter(Boolean).join('   ');

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
    const gap = sizeBig * 1.4;
    const angle = Math.PI / 6.43; // ≈ 28°
    const tilt = Math.cos(angle);
    const slide = Math.sin(angle);

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

  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    drawWatermark(page, width, height, 2 / 3);
    drawWatermark(page, width, height, 1 / 3);
  }

  return await pdf.save();
}
