/**
 * GET /api/admin/emargements/[userId]
 *
 * Feuilles d'émargement d'un élève, pour la liste élèves de l'admin.
 *   - `?format=csv` renvoie un export CSV (sans les images de signature) ;
 *   - sinon, JSON avec la signature en data URL pour affichage.
 *
 * Réservé aux admins.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type Row = {
  cours_id: string;
  cours_titre: string | null;
  matiere_id: string | null;
  required_at: string;
  signed_at: string | null;
  signature_png: string | null;
  watched_ratio: number | null;
  watched_seconds: number | null;
};

function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { data: me } = await supabase
    .from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Réservé admin' }, { status: 403 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: student } = await db
    .from('profiles').select('first_name, last_name, email').eq('id', userId).maybeSingle();

  const { data, error } = await db
    .from('course_attendances')
    .select('cours_id, cours_titre, matiere_id, required_at, signed_at, signature_png, watched_ratio, watched_seconds')
    .eq('user_id', userId)
    .order('required_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as Row[];
  const fullName = `${student?.first_name ?? ''} ${student?.last_name ?? ''}`.trim();

  if (new URL(req.url).searchParams.get('format') === 'csv') {
    const header = ['Élève', 'Email', 'Cours', 'Collège', 'Vu le', 'Signé le', 'Progression'];
    const lines = rows.map((r) => [
      fullName, student?.email ?? '', r.cours_titre ?? r.cours_id, r.matiere_id ?? '',
      r.required_at, r.signed_at ?? 'NON SIGNÉ',
      r.watched_ratio != null ? `${Math.round(r.watched_ratio * 100)}%` : '',
    ].map(csvCell).join(';'));
    // BOM : Excel ouvre l'UTF-8 correctement (accents des titres de cours).
    const csv = '﻿' + [header.join(';'), ...lines].join('\n');
    const slug = (fullName || 'eleve').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="emargements-${slug}.csv"`,
      },
    });
  }

  return NextResponse.json({
    student: { name: fullName, email: student?.email ?? null },
    total: rows.length,
    signed: rows.filter((r) => r.signed_at).length,
    pending: rows.filter((r) => !r.signed_at).length,
    rows,
  });
}
