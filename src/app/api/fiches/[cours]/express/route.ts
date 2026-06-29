import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, degrees, rgb, PDFName, PDFRef, PDFRawStream, PDFArray, decodePDFRawStream } from 'pdf-lib';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/fiches/[coursId]/express
 *
 * Renvoie la « Fiche Express » : dernière page de la fiche du cours
 * (ou avant-dernière si la dernière est quasiment vierge).
 * Le PDF est watermarké comme la fiche complète.
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await ctx.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const [{ data: profile }, { data: fiches }] = await Promise.all([
    supabase.from('profiles').select('first_name, last_name, email').eq('id', user.id).maybeSingle(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('fiches')
      .select('storage_path, pages')
      .eq('cours_id', coursId)
      .not('storage_path', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1),
  ]);

  const fiche = (fiches as { storage_path: string; pages: number | null }[] | null)?.[0];
  if (!fiche?.storage_path) return NextResponse.json({ error: 'Fiche introuvable' }, { status: 404 });

  const admin = createAdminClient();
  const { data: file, error: dlErr } = await admin.storage.from('fiches').download(fiche.storage_path);
  if (dlErr || !file) return NextResponse.json({ error: dlErr?.message ?? 'PDF indisponible' }, { status: 500 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const srcPdf = await PDFDocument.load(bytes);
  const pageCount = srcPdf.getPageCount();
  if (pageCount === 0) return NextResponse.json({ error: 'PDF vide' }, { status: 404 });

  let targetIdx = pageCount - 1;
  if (pageCount >= 2) {
    // Decode the last page's content stream and count text characters.
    // If < 200 visible chars, the page is mostly empty → use previous page.
    try {
      const lastPageNode = srcPdf.getPage(pageCount - 1).node;
      const contentsEntry = lastPageNode.get(PDFName.of('Contents'));
      let decodedBytes = new Uint8Array(0);
      if (contentsEntry) {
        const ctx = srcPdf.context;
        const resolved = contentsEntry instanceof PDFRef ? ctx.lookup(contentsEntry) : contentsEntry;
        if (resolved instanceof PDFRawStream) {
          decodedBytes = new Uint8Array(decodePDFRawStream(resolved).decode());
        } else if (resolved instanceof PDFArray) {
          const parts: Uint8Array[] = [];
          for (let i = 0; i < resolved.size(); i++) {
            const item = resolved.get(i);
            const stream = item instanceof PDFRef ? ctx.lookup(item) : item;
            if (stream instanceof PDFRawStream) {
              parts.push(new Uint8Array(decodePDFRawStream(stream).decode()));
            }
          }
          const total = parts.reduce((s, p) => s + p.length, 0);
          decodedBytes = new Uint8Array(total);
          let off = 0;
          for (const p of parts) { decodedBytes.set(p, off); off += p.length; }
        }
      }
      const ops = Buffer.from(decodedBytes).toString('latin1');
      let charCount = 0;
      for (const m of ops.matchAll(/\(([^)]*)\)\s*Tj/g)) charCount += m[1].length;
      for (const m of ops.matchAll(/\[([^\]]*)\]\s*TJ/g)) {
        for (const tp of m[1].matchAll(/\(([^)]*)\)/g)) charCount += tp[1].length;
      }
      if (charCount < 200) targetIdx = pageCount - 2;
    } catch {
      // fallback: show last page
    }
  }

  // Create a new PDF with just the target page
  const outPdf = await PDFDocument.create();
  const [copiedPage] = await outPdf.copyPages(srcPdf, [targetIdx]);
  outPdf.addPage(copiedPage);

  // Watermark
  const font = await outPdf.embedFont(StandardFonts.HelveticaBold);
  const firstName = profile?.first_name?.trim() || '';
  const lastName = profile?.last_name?.trim() || '';
  const email = profile?.email?.trim() || user.email || '';
  const nom = [firstName, lastName].filter(Boolean).join('   ');

  const page = outPdf.getPage(0);
  const { width, height } = page.getSize();
  const sizeBig = Math.max(28, Math.min(width, height) * 0.06);
  const sizeSmall = sizeBig * 0.7;
  const gap = sizeBig * 1.4;

  for (const yRatio of [1 / 3, 2 / 3]) {
    const cx = width / 2;
    const cy = height * yRatio;
    const angle = Math.PI / 6.43;
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
  }

  const out = await outPdf.save();
  return new NextResponse(out as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="fiche-express.pdf"',
      'Cache-Control': 'private, no-store',
    },
  });
}
