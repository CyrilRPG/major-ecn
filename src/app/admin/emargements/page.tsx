import { titreFeuille } from '@/lib/emargement';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { EmargementsGlobal, type FeuilleAdmin } from '@/components/admin/emargements/emargements-global';

export const metadata = { title: 'Feuilles d’émargement' };
export const dynamic = 'force-dynamic';

/**
 * Toutes les feuilles d'émargement de la plateforme, tous élèves confondus
 * (la vue par élève reste dans la liste des élèves) :
 *   - `course_attendances`   → vidéo du cours / séance approfondie ;
 *   - `parcours_completions` → interrogation de fin de parcours (PDF signé) ;
 *   - `session_presences`    → sessions Zoom.
 * Les signatures (PNG) ne sont pas chargées ici : la fiche de l'élève les montre.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function toutes<T>(db: any, table: string, select: string, filtre?: (q: any) => any): Promise<T[]> {
  const out: T[] = [];
  // PostgREST plafonne à 1000 lignes : pagination explicite.
  for (let d = 0; ; d += 1000) {
    let q = db.from(table).select(select);
    if (filtre) q = filtre(q);
    const { data, error } = await q.order('id', { ascending: true }).range(d, d + 999);
    if (error) throw new Error(`${table} : ${error.message}`);
    out.push(...(data as T[]));
    if ((data as T[]).length < 1000) break;
  }
  return out;
}

export default async function AdminEmargementsPage() {
  await requireAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;

  let erreur: string | null = null;
  let feuilles: FeuilleAdmin[] = [];
  try {
    const [attendances, presences, zoomSansSignature, completions, matieres] = await Promise.all([
      toutes<{ id: string; user_id: string; cours_id: string; cours_titre: string | null; video_titre: string | null; matiere_id: string | null; kind: string; required_at: string; signed_at: string | null; watched_ratio: number | null }>(
        db, 'course_attendances', 'id, user_id, cours_id, cours_titre, video_titre, matiere_id, kind, required_at, signed_at, watched_ratio'),
      toutes<{ id: string; user_id: string; event_title: string | null; event_date: string | null; start_time: string | null; end_time: string | null; college: string | null; intervenant: string | null; marked_at: string }>(
        db, 'session_presences', 'id, user_id, event_title, event_date, start_time, end_time, college, intervenant, marked_at'),
      // Signatures non lues (PNG lourds) : seules les feuilles Zoom SANS tracé sont repérées.
      toutes<{ id: string }>(db, 'session_presences', 'id', (q) => q.is('signature_png', null)),
      toutes<{ id: string; user_id: string; cours_id: string; certificate_signed_at: string; qcm_test_score: number | null; qcm_test_total: number | null; cours: { titre: string | null; matiere_id: string | null } | null }>(
        db, 'parcours_completions', 'id, user_id, cours_id, certificate_signed_at, qcm_test_score, qcm_test_total, cours(titre, matiere_id)',
        (q) => q.not('certificate_signed_at', 'is', null)),
      toutes<{ id: string; nom: string }>(db, 'matieres', 'id, nom'),
    ]);
    const college = new Map(matieres.map((m) => [m.id, m.nom]));
    const sansSignature = new Set(zoomSansSignature.map((r) => r.id));

    const ids = [...new Set([...attendances, ...presences, ...completions].map((r) => r.user_id))];
    const eleves = new Map<string, { nom: string; email: string | null }>();
    // `in()` en URL : tranches de 50 identifiants.
    for (let i = 0; i < ids.length; i += 50) {
      const { data } = await db.from('profiles').select('id, first_name, last_name, email').in('id', ids.slice(i, i + 50));
      for (const p of (data ?? []) as { id: string; first_name: string | null; last_name: string | null; email: string | null }[]) {
        eleves.set(p.id, { nom: `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || p.email || 'Élève', email: p.email });
      }
    }
    const eleve = (id: string) => eleves.get(id) ?? { nom: 'Compte supprimé', email: null };

    feuilles = [
      ...attendances.map((r): FeuilleAdmin => ({
        id: r.id,
        userId: r.user_id, eleve: eleve(r.user_id).nom, email: eleve(r.user_id).email,
        type: r.kind === 'seance' ? 'seance' : 'video',
        titre: titreFeuille(r.cours_titre, r.video_titre) ?? 'Cours',
        college: r.matiere_id ? (college.get(r.matiere_id) ?? null) : null,
        date: r.signed_at ?? r.required_at,
        signe: !!r.signed_at,
        detail: r.watched_ratio != null ? `${Math.round(r.watched_ratio * 100)} % vu` : null,
        pdf: null,
      })),
      ...completions.map((r): FeuilleAdmin => ({
        id: r.id,
        userId: r.user_id, eleve: eleve(r.user_id).nom, email: eleve(r.user_id).email,
        type: 'interrogation',
        titre: r.cours?.titre ?? 'Cours',
        college: r.cours?.matiere_id ? (college.get(r.cours.matiere_id) ?? null) : null,
        date: r.certificate_signed_at,
        signe: true,
        detail: r.qcm_test_score != null && r.qcm_test_total
          ? `${((r.qcm_test_score / r.qcm_test_total) * 20).toFixed(1).replace('.', ',')} / 20`
          : null,
        pdf: `/api/certificate/${r.cours_id}?user_id=${r.user_id}`,
      })),
      ...presences.map((r): FeuilleAdmin => ({
        id: r.id,
        userId: r.user_id, eleve: eleve(r.user_id).nom, email: eleve(r.user_id).email,
        type: 'zoom',
        titre: r.event_title ?? 'Session',
        college: r.college,
        date: r.marked_at,
        signe: !sansSignature.has(r.id),
        detail: [
          r.event_date ? `${r.event_date.slice(8, 10)}/${r.event_date.slice(5, 7)}/${r.event_date.slice(0, 4)}` : null,
          r.start_time ? `${r.start_time.slice(0, 5)}${r.end_time ? `–${r.end_time.slice(0, 5)}` : ''}` : null,
          r.intervenant,
        ].filter(Boolean).join(' · ') || null,
        pdf: null,
      })),
    ].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  } catch (e) {
    erreur = e instanceof Error ? e.message : String(e);
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">Feuilles d’émargement</h1>
        <p className="mt-0.5 text-sm text-(--color-ink-soft)">
          Toutes les feuilles signées sur la plateforme : vidéos de cours, séances approfondies,
          interrogations de fin de parcours et sessions Zoom.
        </p>
      </header>
      {erreur ? (
        <p className="rounded-xl bg-(--color-primary-soft) px-4 py-3 text-sm text-(--color-primary-deep)">
          Impossible de charger les feuilles : {erreur}
        </p>
      ) : (
        <EmargementsGlobal feuilles={feuilles} />
      )}
    </main>
  );
}
