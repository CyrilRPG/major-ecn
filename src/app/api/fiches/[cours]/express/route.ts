import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, degrees, rgb, PDFName, PDFRef, PDFRawStream, PDFArray, decodePDFRawStream } from 'pdf-lib';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertAccessActive } from '@/lib/auth/access';
import { getRequestUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';

export const dynamic = 'force-dynamic';

/**
 * GET /api/fiches/[coursId]/express
 *
 * Renvoie la « Fiche éclair » : dernière page de la fiche du cours
 * (ou avant-dernière si la dernière est quasiment vierge).
 * Le PDF est watermarké comme la fiche complète.
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
    supabase.from('profiles').select('first_name, last_name, email').eq('id', user.id).maybeSingle(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      // Fiche PRINCIPALE de l'item (order_index le plus bas) : la fiche éclair
      // est l'extrait de la fiche de référence, pas d'un document annexe.
      .from('fiches')
      .select('storage_path, pages')
      .eq('cours_id', coursId)
      .not('storage_path', 'is', null)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true })
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

  // Par défaut : DERNIÈRE page. On ne bascule sur l'avant-dernière que si l'on
  // est confiant que la dernière page est quasiment vierge (< 200 caractères).
  let targetIdx = pageCount - 1;
  if (pageCount >= 2) {
    try {
      const ctx = srcPdf.context;
      const lastPageNode = srcPdf.getPage(pageCount - 1).node;

      // Décode un flux (résout les PDFRef, applique les filtres Flate/etc.).
      const decodeStream = (obj: unknown): Uint8Array => {
        const stream = obj instanceof PDFRef ? ctx.lookup(obj) : obj;
        return stream instanceof PDFRawStream
          ? new Uint8Array(decodePDFRawStream(stream).decode())
          : new Uint8Array(0);
      };

      // 1) Flux de contenu de la page (Contents peut être un flux ou un tableau).
      const parts: Uint8Array[] = [];
      const contentsEntry = lastPageNode.get(PDFName.of('Contents'));
      const contents = contentsEntry instanceof PDFRef ? ctx.lookup(contentsEntry) : contentsEntry;
      if (contents instanceof PDFRawStream) {
        parts.push(new Uint8Array(decodePDFRawStream(contents).decode()));
      } else if (contents instanceof PDFArray) {
        for (let i = 0; i < contents.size(); i++) parts.push(decodeStream(contents.get(i)));
      }

      // 2) Le corps de texte vit souvent dans des XObjects de type /Form
      //    (InDesign, etc.) — on inclut leur contenu dans le décompte.
      try {
        const resEntry = lastPageNode.get(PDFName.of('Resources'));
        const resDict = resEntry instanceof PDFRef ? ctx.lookup(resEntry) : resEntry;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const xobjEntry = (resDict as any)?.get?.(PDFName.of('XObject'));
        const xobjDict = xobjEntry instanceof PDFRef ? ctx.lookup(xobjEntry) : xobjEntry;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const keys: any[] = typeof (xobjDict as any)?.keys === 'function' ? (xobjDict as any).keys() : [];
        for (const key of keys) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ref = (xobjDict as any).get(key);
          const xstream = ref instanceof PDFRef ? ctx.lookup(ref) : ref;
          if (xstream instanceof PDFRawStream) {
            const subtype = xstream.dict.get(PDFName.of('Subtype'));
            // On ignore les images (/Image) : seuls les /Form portent du texte.
            if (subtype && subtype.toString() === '/Form') {
              parts.push(new Uint8Array(decodePDFRawStream(xstream).decode()));
            }
          }
        }
      } catch { /* XObjects illisibles : on ignore */ }

      const total = parts.reduce((s, p) => s + p.length, 0);
      const decodedBytes = new Uint8Array(total);
      let off = 0;
      for (const p of parts) { decodedBytes.set(p, off); off += p.length; }

      const ops = Buffer.from(decodedBytes).toString('latin1');
      let charCount = 0;
      const litLen = (s: string) => s.replace(/\\[0-7]{1,3}/g, ' ').replace(/\\./g, ' ').length;
      const hexLen = (s: string) => Math.floor(s.replace(/[^0-9A-Fa-f]/g, '').length / 2);
      // Chaînes littérales : (texte) Tj
      for (const m of ops.matchAll(/\(((?:\\.|[^\\()])*)\)\s*Tj/g)) charCount += litLen(m[1]);
      // Chaînes hexadécimales : <hex> Tj  (polices sous-ensemblées)
      for (const m of ops.matchAll(/<([0-9A-Fa-f\s]+)>\s*Tj/g)) charCount += hexLen(m[1]);
      // Tableaux [ (a) -10 <hex> ] TJ  (littéral ET hex)
      for (const m of ops.matchAll(/\[([^\]]*)\]\s*TJ/g)) {
        for (const tp of m[1].matchAll(/\(((?:\\.|[^\\()])*)\)/g)) charCount += litLen(tp[1]);
        for (const hp of m[1].matchAll(/<([0-9A-Fa-f\s]+)>/g)) charCount += hexLen(hp[1]);
      }
      if (charCount < 200) targetIdx = pageCount - 2;
    } catch {
      // fallback : on affiche la dernière page
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
