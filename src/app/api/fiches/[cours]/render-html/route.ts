import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { launchBrowser } from '@/lib/fiches/chromium';
import { charteCss } from '@/lib/fiches/charte';
import { CSS_MODIFICATIONS, contientMarques } from '@/lib/fiches/modifications-visibles';
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
    // Marques « modifications apparentes » (ancien texte raturé, nouveau surligné).
    `<title>${escapeHtml(title)}</title><style>${css}</style><style>${CSS_MODIFICATIONS}</style></head>` +
    `<body>${bodyHtml}</body></html>`
  );
}

/** Document HTML complet à imprimer pour un corps de fiche. */
function documentAImprimer(contentHtml: string, origin: string, nomCours: string): string {
  return isFullDocument(contentHtml)
    // Document complet (générateur Python) : styles des marques ajoutés s'il en porte.
    ? (contientMarques(contentHtml)
      ? contentHtml.replace(/<\/head>/i, `<style>${CSS_MODIFICATIONS}</style></head>`)
      : contentHtml)
    : wrapWithCharte(contentHtml, origin, `${nomCours}`);
}

async function rendrePdf(
  browser: Awaited<ReturnType<typeof launchBrowser>>,
  html: string,
  nomCours: string,
  annee: string,
): Promise<Uint8Array> {
  const page = await browser.newPage();
  try {
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
    return new Uint8Array(out);
  } finally {
    await page.close().catch(() => null);
  }
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
    /** Fiche visée. Absent → fiche principale de l'item. */
    ficheId?: string;
    /** Crée une NOUVELLE fiche à la suite au lieu d'écraser une existante. */
    createNew?: boolean;
    /** Nom affiché à l'élève (création ou renommage à la publication). */
    titre?: string;
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
  const html = documentAImprimer(body.content_html, origin, nomCours);

  let pdfBytes: Uint8Array;
  let browser;
  try {
    browser = await launchBrowser();
    pdfBytes = await rendrePdf(browser, html, nomCours, annee);
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

  const titre = (body.titre ?? '').trim().slice(0, 200);

  // Fiche visée :
  //   - `createNew` → aucune, on insère une nouvelle fiche à la fin ;
  //   - `ficheId`   → celle-là, à condition qu'elle appartienne bien à l'item ;
  //   - sinon       → la fiche PRINCIPALE (order_index le plus bas), pour ne
  //     jamais écraser une fiche ajoutée à sa suite.
  const { data: rows } = await a
    .from('fiches')
    .select('id, storage_path, order_index')
    .eq('cours_id', coursId)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });
  const liste = (rows ?? []) as { id: string; storage_path: string | null; order_index: number }[];

  let existing: { id: string; storage_path: string | null } | null = null;
  if (!body.createNew) {
    if (body.ficheId) {
      existing = liste.find((f) => f.id === body.ficheId) ?? null;
      if (!existing) return NextResponse.json({ error: 'Fiche introuvable sur cet item.' }, { status: 404 });
    } else {
      existing = liste[0] ?? null;
    }
  }

  const storagePath = existing?.storage_path ?? `${coursId}/${crypto.randomUUID()}.pdf`;

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

  let ficheId: string;
  if (existing) {
    // Le titre n'est réécrit que s'il est fourni : republier une fiche depuis
    // l'éditeur ne doit pas effacer le nom choisi par l'administrateur.
    await a.from('fiches').update(titre ? { ...patch, titre } : patch).eq('id', existing.id);
    ficheId = existing.id;
  } else {
    const rang = liste.length > 0 ? Math.max(...liste.map((f) => f.order_index ?? 0)) + 1 : 0;
    const { data: cree, error: insErr } = await a
      .from('fiches')
      .insert({ cours_id: coursId, titre: titre || nomCours, order_index: rang, ...patch })
      .select('id')
      .single();
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
    ficheId = cree.id as string;
  }

  // Item partagé entre collèges : les fiches jumelles ont reçu le même HTML
  // (couverture à leur collège) par déclencheur ; on re-rend leur PDF.
  try {
    await rerendreFichesJumelles(a, ficheId, storagePath, origin, annee);
  } catch (e) {
    console.error('[fiches/render-html] fiches jumelles', e);
  }

  return NextResponse.json({ ok: true, pages, storagePath, ficheId });
}

/**
 * Re-rend le PDF des fiches jumelles d'une fiche d'item partagé
 * (migration 20261005220000_items_partages). Chaque jumelle garde son propre
 * fichier : si elle partageait celui qu'on vient d'écraser, elle en reçoit un
 * nouveau. L'enregistrement passe par `partage_fiche_set_pdf`, qui n'est pas
 * répercuté aux autres membres.
 */
async function rerendreFichesJumelles(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  a: any,
  ficheId: string,
  storagePathPublie: string,
  origin: string,
  annee: string,
): Promise<void> {
  const { data, error } = await a.rpc('partage_fiches_jumelles', { p_fiche_id: ficheId });
  if (error) throw new Error(error.message);
  const jumelles = (data ?? []) as {
    fiche_id: string; cours_id: string; cours_titre: string;
    storage_path: string | null; content_html: string | null;
  }[];
  if (!jumelles.some((j) => j.content_html)) return;
  const browser = await launchBrowser();
  try {
    for (const j of jumelles) {
      if (!j.content_html) continue;
      const bytes = await rendrePdf(browser, documentAImprimer(j.content_html, origin, j.cours_titre), j.cours_titre, annee);
      let pagesJ = 0;
      try { pagesJ = (await PDFDocument.load(bytes)).getPageCount(); } catch { /* ignore */ }
      const chemin = j.storage_path && j.storage_path !== storagePathPublie
        ? j.storage_path
        : `${j.cours_id}/${crypto.randomUUID()}.pdf`;
      const { error: upErr } = await a.storage.from('fiches')
        .upload(chemin, Buffer.from(bytes), { contentType: 'application/pdf', upsert: true });
      if (upErr) throw new Error(upErr.message);
      const { error: setErr } = await a.rpc('partage_fiche_set_pdf', {
        p_fiche_id: j.fiche_id, p_storage_path: chemin, p_pages: pagesJ,
      });
      if (setErr) throw new Error(setErr.message);
    }
  } finally {
    await browser.close().catch(() => null);
  }
}
