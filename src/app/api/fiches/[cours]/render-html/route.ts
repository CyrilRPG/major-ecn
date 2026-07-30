import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { launchBrowser } from '@/lib/fiches/chromium';
import { charteCss } from '@/lib/fiches/charte';
import { getVerifiedUser } from '@/lib/auth/verified-user';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * POST /api/fiches/[cours]/render-html
 *
 * Rend une chaîne HTML (issue de l'éditeur Tiptap ou du générateur Python)
 * en PDF via Chromium, en l'enveloppant avec le CSS charte. Réservé aux
 * éditeurs (admin / professeur).
 *
 * Body : { content_html: string, save?: boolean, nom_cours?: string, annee?: string }
 *   - save absent/false → renvoie le PDF inline (aperçu fidèle).
 *   - save = true → enregistre dans Storage + met à jour `fiches.storage_path`
 *     et `fiches.content_html`, puis renvoie { ok, pages, storagePath }.
 */

const NAVY = '#1C2E49';
const PEARL = '#8E99A8';
const MARGIN_MM = { top: 24, right: 18, bottom: 22, left: 18 } as const;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;',
  );
}

function headerTemplate(coursName: string): string {
  return (
    `<div style="width:100%;font-size:8pt;font-family:Inter,sans-serif;` +
    `padding:0 ${MARGIN_MM.left}mm;display:flex;justify-content:space-between;` +
    `border-top:0.7pt solid ${NAVY};padding-top:2mm;">` +
    `<span style="color:${PEARL};">${escapeHtml(coursName)}</span>` +
    `<span style="color:${NAVY};font-style:italic;">` +
    `<span class="pageNumber"></span>/<span class="totalPages"></span></span></div>`
  );
}

function footerTemplate(annee: string): string {
  return (
    `<div style="width:100%;font-size:7.6pt;font-family:Inter,sans-serif;` +
    `padding:0 ${MARGIN_MM.left}mm;display:flex;justify-content:space-between;` +
    `align-items:center;">` +
    `<span style="color:${PEARL};letter-spacing:0.12em;text-transform:uppercase;">` +
    `Major ECN &middot; ${escapeHtml(annee)}</span>` +
    `<span style="color:#fff;background:${NAVY};border-radius:2.4mm;` +
    `padding:1.5mm 4mm;font-weight:700;font-size:8pt;">` +
    `<span class="pageNumber"></span>/<span class="totalPages"></span></span></div>`
  );
}

/** Détecte si l'HTML reçu est déjà un document complet (`<!doctype html>` ou
 *  `<html>` racine). Dans ce cas, on ne l'enveloppe pas — on l'utilise tel
 *  quel (typiquement le HTML standalone produit par le générateur Python).
 *  Sinon, on l'enveloppe avec le CSS charte (cas de l'éditeur Tiptap qui
 *  sauve uniquement le contenu du body). */
function isFullDocument(html: string): boolean {
  const head = html.trimStart().slice(0, 200).toLowerCase();
  return head.startsWith('<!doctype') || head.startsWith('<html');
}

function wrapWithCharte(bodyHtml: string, origin: string, title: string): string {
  const css = charteCss(`${origin}/fonts/fiches`);
  return (
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"/>` +
    `<title>${escapeHtml(title)}</title><style>${css}</style></head>` +
    `<body>${bodyHtml}</body></html>`
  );
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await ctx.params;

  const supabase = await createClient();
  const user = await getVerifiedUser(supabase);
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'professor')) {
    return NextResponse.json({ error: 'Réservé aux éditeurs (admin / professeur)' }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as {
    content_html?: string;
    save?: boolean;
    nom_cours?: string;
    annee?: string;
  } | null;
  if (!body?.content_html || typeof body.content_html !== 'string') {
    return NextResponse.json({ error: 'content_html manquant' }, { status: 400 });
  }
  if (body.content_html.length > 5_000_000) {
    return NextResponse.json({ error: 'content_html trop volumineux' }, { status: 400 });
  }
  const save = body.save === true;
  const nomCours = (body.nom_cours ?? 'Major ECN').slice(0, 200);
  const annee = (body.annee ?? '2025-2026').slice(0, 20);

  const origin = new URL(req.url).origin;
  const html = isFullDocument(body.content_html)
    ? body.content_html
    : wrapWithCharte(body.content_html, origin, `${nomCours}`);

  let pdfBytes: Uint8Array;
  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(
      () => (document as unknown as { fonts: { ready: Promise<unknown> } }).fonts.ready,
    );
    // La fiche éclair doit tenir sur UNE page : on la réduit via `zoom` (qui,
    // contrairement à `transform`, réduit aussi la hauteur de mise en page).
    await page.evaluate((margins: number[]) => {
      const [topMm, bottomMm] = margins;
      const mmToPx = (mm: number) => (mm * 96) / 25.4;
      const avail = mmToPx(297 - topMm - bottomMm) - 4;
      document.querySelectorAll('.eclair-card').forEach((el) => {
        const card = el as HTMLElement;
        card.style.zoom = '1';
        const h = card.getBoundingClientRect().height;
        if (h > avail) card.style.zoom = String(Math.max(0.5, avail / h));
      });
    }, [MARGIN_MM.top, MARGIN_MM.bottom]);
    const out = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: `${MARGIN_MM.top}mm`,
        right: `${MARGIN_MM.right}mm`,
        bottom: `${MARGIN_MM.bottom}mm`,
        left: `${MARGIN_MM.left}mm`,
      },
      displayHeaderFooter: true,
      headerTemplate: headerTemplate(nomCours),
      footerTemplate: footerTemplate(annee),
    });
    pdfBytes = new Uint8Array(out);
  } catch (e) {
    console.error('[fiches/render-html] chromium error', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Échec du rendu PDF' },
      { status: 500 },
    );
  } finally {
    if (browser) await browser.close().catch(() => null);
  }

  let pages = 0;
  try { pages = (await PDFDocument.load(pdfBytes)).getPageCount(); } catch { /* ignore */ }

  if (!save) {
    return new NextResponse(pdfBytes as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="apercu.pdf"',
        'Cache-Control': 'private, no-store',
      },
    });
  }

  // — Enregistrement : Storage + fiche.
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;

  const { data: existing } = await a
    .from('fiches')
    .select('id, storage_path')
    .eq('cours_id', coursId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const storagePath = (existing?.storage_path as string | undefined)
    ?? `${coursId}/${crypto.randomUUID()}.pdf`;

  const { error: upErr } = await admin.storage
    .from('fiches')
    .upload(storagePath, Buffer.from(pdfBytes), {
      contentType: 'application/pdf', upsert: true,
    });
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  const patch = {
    storage_path: storagePath,
    pages,
    content_html: body.content_html,
    content_format: 'html',
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    await a.from('fiches').update(patch).eq('id', existing.id);
  } else {
    await a.from('fiches').insert({
      cours_id: coursId,
      titre: nomCours,
      ...patch,
    });
  }

  return NextResponse.json({ ok: true, pages, storagePath });
}
