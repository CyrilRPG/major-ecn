import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/fiches/[coursId]/download
 *
 * Télécharge le PDF original (sans watermark) de la fiche, en pièce jointe.
 * RÉSERVÉ aux administrateurs et professeurs — les étudiants n'y ont pas accès
 * (ils consultent uniquement la version watermarkée via /api/fiches/[cours]/pdf).
 */
export async function GET(_req: Request, ctx: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await ctx.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'professor')) {
    return NextResponse.json(
      { error: 'Téléchargement réservé aux administrateurs et professeurs' },
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
  const bytes = new Uint8Array(await file.arrayBuffer());

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
