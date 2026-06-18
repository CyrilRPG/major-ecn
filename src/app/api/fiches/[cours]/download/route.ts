import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { watermarkPdf } from '@/lib/fiches/watermark';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/fiches/[coursId]/download
 *
 * Télécharge le PDF de la fiche, en pièce jointe. RÉSERVÉ au staff :
 *  - ADMIN      → PDF original, SANS watermark.
 *  - PROFESSEUR → PDF watermarké à son identité (comme la consultation élève).
 * Les étudiants n'ont pas accès au téléchargement.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await ctx.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select('role, first_name, last_name, email, can_download' as any)
    .eq('id', user.id)
    .maybeSingle();
  // Par défaut, seul l'admin télécharge. Un prof ou un élève (client) ne peut
  // télécharger que si l'admin lui a explicitement accordé la permission
  // (profiles.can_download = true).
  const p = profile as ({ role?: string; first_name?: string; last_name?: string; email?: string; can_download?: boolean } | null);
  const isAdmin = p?.role === 'admin';
  const allowed = isAdmin || p?.can_download === true;
  if (!p || !allowed) {
    return NextResponse.json(
      { error: 'Téléchargement non autorisé. Demandez l’accès à un administrateur.' },
      { status: 403 },
    );
  }

  const [{ data: fiche }, { data: c }] = await Promise.all([
    supabase
      .from('fiches')
      .select('storage_path')
      .eq('cours_id', coursId)
      .not('storage_path', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('cours').select('titre, matieres(nom)').eq('id', coursId).maybeSingle(),
  ]);

  if (!fiche?.storage_path) {
    return NextResponse.json({ error: 'Fiche introuvable' }, { status: 404 });
  }

  // Téléchargement de l'original via service role (bypass RLS storage).
  const admin = createAdminClient();
  const { data: file, error } = await admin.storage.from('fiches').download(fiche.storage_path);
  if (error || !file) {
    return NextResponse.json({ error: error?.message ?? 'PDF indisponible' }, { status: 500 });
  }
  let bytes: Uint8Array = new Uint8Array(await file.arrayBuffer());

  // Admin → original sans filigrane. Tout autre utilisateur autorisé (prof ou
  // élève) → PDF filigrané à son identité, pour la traçabilité.
  if (!isAdmin) {
    bytes = await watermarkPdf(bytes, {
      firstName: p.first_name,
      lastName: p.last_name,
      email: p.email ?? user.email,
    });
  }

  const matiere = (c as { matieres?: { nom?: string } | null } | null)?.matieres?.nom;
  const titre = (c as { titre?: string } | null)?.titre ?? 'cours';
  const rawName = `Fiche - ${matiere ? `${matiere} - ` : ''}${titre}.pdf`;
  const safe = rawName.replace(/[\\/?%*:|"<>]/g, '-');
  const ascii = safe.replace(/[^\x20-\x7E]/g, '_');

  return new NextResponse(bytes as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(safe)}`,
      'Cache-Control': 'private, no-store',
    },
  });
}
