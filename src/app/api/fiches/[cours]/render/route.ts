import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createElement } from 'react';
import { wrapFicheHtml, PDF_MARGINS_MM } from '@/lib/fiches/render-html';
import { FicheDocument } from '@/lib/fiches/fiche-document';
import { launchBrowser } from '@/lib/fiches/chromium';
import type { FicheData } from '@/lib/fiches/types';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * POST /api/fiches/[cours]/render
 *
 * Rend une `FicheData` en PDF via Chromium (charte Major ECN, 100 % fidèle au
 * générateur), réservé aux éditeurs (admin / professeur).
 *
 * Body : { fiche: FicheData, save?: boolean }
 *   - save absent / false → renvoie le PDF inline (aperçu « rendu fidèle »).
 *   - save = true → enregistre le PDF dans Storage + met à jour la fiche
 *     (content_json, storage_path, pages…) + snapshot de version, puis renvoie
 *     { ok, pages, storagePath }.
 *
 * Le watermark par-utilisateur n'est PAS appliqué ici : il l'est à la lecture
 * élève via /api/fiches/[cours]/pdf (inchangé). Ce PDF-ci est le canonique.
 */

const NAVY = '#1C2E49';
const PEARL = '#8E99A8';

function headerTemplate(coursName: string): string {
  return (
    `<div style="width:100%;font-size:8pt;font-family:Inter,sans-serif;` +
    `padding:0 ${PDF_MARGINS_MM.left}mm;display:flex;justify-content:space-between;` +
    `border-top:0.7pt solid ${NAVY};padding-top:2mm;">` +
    `<span style="color:${PEARL};">${escapeHtml(coursName)}</span>` +
    `<span style="color:${NAVY};font-style:italic;">` +
    `<span class="pageNumber"></span>/<span class="totalPages"></span></span></div>`
  );
}

function footerTemplate(annee: string): string {
  return (
    `<div style="width:100%;font-size:7.6pt;font-family:Inter,sans-serif;` +
    `padding:0 ${PDF_MARGINS_MM.left}mm;display:flex;justify-content:space-between;` +
    `align-items:center;">` +
    `<span style="color:${PEARL};letter-spacing:0.12em;text-transform:uppercase;">` +
    `Major ECN &middot; ${escapeHtml(annee)}</span>` +
    `<span style="color:#fff;background:${NAVY};border-radius:2.4mm;` +
    `padding:1.5mm 4mm;font-weight:700;font-size:8pt;">` +
    `<span class="pageNumber"></span>/<span class="totalPages"></span></span></div>`
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;',
  );
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await ctx.params;

  // — Auth : éditeurs de contenu uniquement (admin ou professeur).
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'professor')) {
    return NextResponse.json({ error: 'Réservé aux éditeurs (admin / professeur)' }, { status: 403 });
  }

  // — Corps.
  const body = (await req.json().catch(() => null)) as { fiche?: FicheData; save?: boolean } | null;
  const fiche = body?.fiche;
  if (!fiche || typeof fiche !== 'object') {
    return NextResponse.json({ error: 'FicheData manquante' }, { status: 400 });
  }
  const save = body?.save === true;

  // — Rendu HTML (polices servies depuis CETTE déploiement → fidélité garantie).
  const origin = new URL(req.url).origin;
  // React SSR via import dynamique : évite d'importer statiquement
  // react-dom/server dans le graphe de l'app (interdit par Turbopack).
  const { renderToStaticMarkup } = await import('react-dom/server');
  const bodyHtml = renderToStaticMarkup(createElement(FicheDocument, { fiche }));
  const html = wrapFicheHtml(bodyHtml, {
    matiere: fiche.matiere,
    nomCours: fiche.nom_cours,
    fontBaseUrl: `${origin}/fonts/fiches`,
    forPdf: true,
  });

  // — Chromium → PDF.
  let pdfBytes: Uint8Array;
  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    // Garantit que les @font-face sont chargées avant l'impression.
    await page.evaluate(() => (document as unknown as { fonts: { ready: Promise<unknown> } }).fonts.ready);
    const out = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: `${PDF_MARGINS_MM.top}mm`,
        right: `${PDF_MARGINS_MM.right}mm`,
        bottom: `${PDF_MARGINS_MM.bottom}mm`,
        left: `${PDF_MARGINS_MM.left}mm`,
      },
      displayHeaderFooter: true,
      headerTemplate: headerTemplate(fiche.nom_cours || 'Major ECN'),
      footerTemplate: footerTemplate(fiche.annee || ''),
    });
    pdfBytes = new Uint8Array(out);
  } catch (e) {
    console.error('[fiches/render] chromium error', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Échec du rendu PDF' },
      { status: 500 },
    );
  } finally {
    if (browser) await browser.close().catch(() => null);
  }

  // — Nombre de pages.
  let pages = 0;
  try {
    pages = (await PDFDocument.load(pdfBytes)).getPageCount();
  } catch {
    /* ignore */
  }

  // — Aperçu : renvoie le PDF inline.
  if (!save) {
    return new NextResponse(pdfBytes as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="apercu.pdf"',
        'Cache-Control': 'private, no-store',
      },
    });
  }

  // — Enregistrement : Storage + fiche + version.
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;

  const { data: existing } = await a
    .from('fiches')
    .select('id, storage_path')
    .eq('cours_id', coursId)
    .order('created_at', { ascending: false })
    .limit(1);
  const row = existing?.[0] as { id: string; storage_path: string | null } | undefined;

  const storagePath = row?.storage_path ?? `${coursId}/${crypto.randomUUID()}.pdf`;
  const { error: upErr } = await admin.storage
    .from('fiches')
    .upload(storagePath, Buffer.from(pdfBytes), { contentType: 'application/pdf', upsert: true });
  if (upErr) {
    console.error('[fiches/render] storage upload error', upErr);
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  const patch = {
    storage_path: storagePath,
    pages,
    content_json: fiche,
    content_format: 'structured',
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  };

  let ficheId = row?.id;
  if (row) {
    await a.from('fiches').update(patch).eq('id', row.id);
  } else {
    const { data: ins } = await a
      .from('fiches')
      .insert({ cours_id: coursId, titre: fiche.nom_cours || 'Fiche', ...patch })
      .select('id')
      .maybeSingle();
    ficheId = ins?.id;
  }

  if (ficheId) {
    await a
      .from('fiche_versions')
      .insert({ fiche_id: ficheId, content_json: fiche, created_by: user.id });
  }

  return NextResponse.json({ ok: true, pages, storagePath });
}
