import 'server-only';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { canAccessCollege, canAccessCours, parseScope } from '@/lib/auth/permissions';
import { chargerProgressionCours } from '@/lib/progress/course-progress-data';
import { calculerProgressionAgregee } from '@/lib/progress/course-progress';
import { suiviDb } from './db';

/**
 * Données de la plateforme affichées dans la fiche candidat (§11) : progression
 * globale (LA formule commune de `lib/progress`), couverture des items et
 * derniers résultats d'évaluation (séries QCM terminées).
 */
export type PlatformResult = { at: string; label: string; cours: string; correct: number; total: number };

export type PlatformSnapshot = {
  /** Progression moyenne sur les items accessibles (0–100), null si aucun item. */
  progression: number | null;
  coursAccessibles: number;
  coursCommences: number;
  coursTermines: number;
  results: PlatformResult[];
};

type CoursRow = { id: string; titre: string; matiere_id: string; access_type: string | null; matieres: { parent_matiere_id: string | null } | null };

export async function loadPlatformSnapshot(userId: string, permissionScope: unknown): Promise<PlatformSnapshot> {
  const db = suiviDb();
  const scope = parseScope(permissionScope);
  const [{ data: coursRaw }, { data: cpRaw }, { data: sessRaw }] = await Promise.all([
    db.from('cours').select('id, titre, matiere_id, access_type, matieres!inner(parent_matiere_id, semestres!inner(faculte_id))').eq('matieres.semestres.faculte_id', EDN_FACULTE_ID),
    db.from('course_progress').select('cours_id, video_watched, fiche_read').eq('user_id', userId),
    db.from('qcm_sessions').select('finished_at, score_correct, score_total, qcm_series(label, cours(titre))').eq('user_id', userId).not('finished_at', 'is', null).order('finished_at', { ascending: false }).limit(12),
  ]);
  const cours = ((coursRaw ?? []) as CoursRow[]).filter((c) => {
    const collegeId = canAccessCollege(scope, c.matiere_id) ? c.matiere_id : (c.matieres?.parent_matiere_id && canAccessCollege(scope, c.matieres.parent_matiere_id) ? c.matieres.parent_matiere_id : c.matiere_id);
    return canAccessCours(scope, collegeId, c.id, (c.access_type as 'all' | 'specific') ?? 'all');
  });
  const cp = new Map(((cpRaw ?? []) as { cours_id: string; video_watched: boolean | null; fiche_read: boolean | null }[]).map((r) => [r.cours_id, r]));

  let progression: number | null = null;
  let termines = 0;
  if (cours.length > 0) {
    try {
      const map = await chargerProgressionCours({
        userId, faculteId: EDN_FACULTE_ID, scope,
        cours: cours.map((c) => ({ id: c.id, course_progress: cp.has(c.id) ? [cp.get(c.id)!] : [] })),
      });
      const values = Array.from(map.values());
      progression = calculerProgressionAgregee(values.map((v) => v.input));
      termines = values.filter((v) => v.progression >= 100).length;
    } catch (err) {
      console.error('[suivi] progression indisponible :', err);
    }
  }

  type Sess = { finished_at: string; score_correct: number; score_total: number; qcm_series: { label: string; cours: { titre: string } | null } | null };
  const results: PlatformResult[] = ((sessRaw ?? []) as Sess[]).map((s) => ({
    at: s.finished_at, label: s.qcm_series?.label ?? 'Série', cours: s.qcm_series?.cours?.titre ?? '', correct: s.score_correct, total: s.score_total,
  }));

  return { progression, coursAccessibles: cours.length, coursCommences: cours.filter((c) => cp.has(c.id)).length, coursTermines: termines, results };
}
