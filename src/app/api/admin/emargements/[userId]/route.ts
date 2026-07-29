/**
 * GET /api/admin/emargements/[userId]
 *
 * Feuilles d'émargement d'un élève, toutes origines confondues :
 *   - `course_attendances` → vidéos visionnées sur la plateforme (vidéo du
 *     cours ou séance approfondie), avec signature manuscrite ;
 *   - `session_presences`  → sessions Zoom en direct, émargées avant ouverture
 *     du lien (pas de signature manuscrite : l'émargement est l'acte d'entrer
 *     en session).
 *
 * `?format=csv` renvoie l'export (sans les images de signature).
 * `?source=plateforme|zoom` filtre l'export sur une seule origine.
 *
 * Réservé aux admins.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** Origine de l'émargement, telle qu'affichée et filtrée côté admin. */
export type Source = 'plateforme' | 'zoom';

export type Emargement = {
  id: string;
  source: Source;
  /** Libellé précis du type : « Vidéo du cours », « Séance approfondie », « Session Zoom ». */
  typeLabel: string;
  college: string | null;
  /** Cours (vidéo plateforme) ou intitulé de la session (Zoom). */
  titre: string;
  /** Date de référence : signature pour la plateforme, émargement pour Zoom. */
  date: string | null;
  /** Déclenchement de l'obligation (plateforme uniquement). */
  requiredAt: string | null;
  signed: boolean;
  signaturePng: string | null;
  watchedRatio: number | null;
  intervenant: string | null;
};

function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function fmt(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
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

  const [{ data: student }, { data: attendances, error: aErr }, { data: presences }, { data: matieres }] =
    await Promise.all([
      db.from('profiles').select('first_name, last_name, email').eq('id', userId).maybeSingle(),
      db.from('course_attendances')
        .select('id, cours_id, cours_titre, matiere_id, kind, required_at, signed_at, signature_png, watched_ratio')
        .eq('user_id', userId).order('required_at', { ascending: false }),
      db.from('session_presences')
        .select('id, event_title, event_date, start_time, college, intervenant, marked_at')
        .eq('user_id', userId).order('marked_at', { ascending: false }),
      // `course_attendances.matiere_id` stocke un identifiant (col-…) : on le
      // résout en nom lisible. Côté Zoom, `college` est déjà un libellé libre.
      db.from('matieres').select('id, nom'),
    ]);

  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });

  const collegeName = new Map<string, string>(
    ((matieres ?? []) as { id: string; nom: string }[]).map((m) => [m.id, m.nom]),
  );

  type ARow = {
    id: string; cours_id: string; cours_titre: string | null; matiere_id: string | null;
    kind: string; required_at: string; signed_at: string | null;
    signature_png: string | null; watched_ratio: number | null;
  };
  type PRow = {
    id: string; event_title: string | null; event_date: string | null; start_time: string | null;
    college: string | null; intervenant: string | null; marked_at: string;
  };

  const fromPlateforme: Emargement[] = ((attendances ?? []) as ARow[]).map((r) => ({
    id: r.id,
    source: 'plateforme',
    typeLabel: r.kind === 'seance' ? 'Séance approfondie' : 'Vidéo du cours',
    college: r.matiere_id ? (collegeName.get(r.matiere_id) ?? r.matiere_id) : null,
    titre: r.cours_titre ?? r.cours_id,
    date: r.signed_at,
    requiredAt: r.required_at,
    signed: !!r.signed_at,
    signaturePng: r.signature_png,
    watchedRatio: r.watched_ratio,
    intervenant: null,
  }));

  const fromZoom: Emargement[] = ((presences ?? []) as PRow[]).map((r) => ({
    id: r.id,
    source: 'zoom',
    typeLabel: 'Session Zoom',
    college: r.college,
    titre: r.event_title ?? 'Session',
    date: r.marked_at,
    requiredAt: null,
    // Émarger une session Zoom, c'est déclarer sa présence avant d'ouvrir le
    // lien : l'acte vaut signature, il n'y a pas de tracé manuscrit.
    signed: true,
    signaturePng: null,
    watchedRatio: null,
    intervenant: r.intervenant,
  }));

  const rows = [...fromPlateforme, ...fromZoom].sort((a, b) => {
    const da = a.date ?? a.requiredAt ?? '';
    const dbb = b.date ?? b.requiredAt ?? '';
    return dbb.localeCompare(da);
  });

  const fullName = `${student?.first_name ?? ''} ${student?.last_name ?? ''}`.trim();
  const url = new URL(req.url);
  const sourceFilter = url.searchParams.get('source');
  const filtered = sourceFilter === 'plateforme' || sourceFilter === 'zoom'
    ? rows.filter((r) => r.source === sourceFilter)
    : rows;

  if (url.searchParams.get('format') === 'csv') {
    const header = ['Élève', 'Email', 'Origine', 'Type', 'Collège', 'Intitulé', 'Vu le', 'Signé le', 'Progression', 'Intervenant'];
    const lines = filtered.map((r) => [
      fullName, student?.email ?? '',
      r.source === 'zoom' ? 'Zoom' : 'Plateforme',
      r.typeLabel, r.college ?? '', r.titre,
      fmt(r.requiredAt), r.signed ? fmt(r.date) : 'NON SIGNÉ',
      r.watchedRatio != null ? `${Math.round(r.watchedRatio * 100)}%` : '',
      r.intervenant ?? '',
    ].map(csvCell).join(';'));
    // BOM : Excel ouvre l'UTF-8 correctement (accents des intitulés).
    const csv = '﻿' + [header.join(';'), ...lines].join('\n');
    const slug = (fullName || 'eleve').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const suffix = sourceFilter ? `-${sourceFilter}` : '';
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="emargements-${slug}${suffix}.csv"`,
      },
    });
  }

  return NextResponse.json({
    student: { name: fullName, email: student?.email ?? null },
    counts: {
      total: rows.length,
      plateforme: fromPlateforme.length,
      zoom: fromZoom.length,
      pending: rows.filter((r) => !r.signed).length,
    },
    rows,
  });
}
