import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { parseScope } from '@/lib/auth/permissions';
import { isExamTargeted } from '@/lib/exams/targeting';
import { interrogationsComposees, ouverturesInterrogation } from '@/lib/pedago/interrogation';

type Eleve = { id: string; role?: string | null; permission_scope?: unknown; promotion?: string | null };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Epreuve = any;

/**
 * Une épreuve publiée (`mock_exams`, lue en service-role) est-elle ouverte à cet
 * élève sur le web ? Pendant de `isExamAvailable` / `interrogationComposable`
 * de `/api/mobile/exams` (01/10/2026 : la page `/epreuves-blanches/[id]` et ses
 * actions ne regardaient que le ciblage — l'interrogation de n'importe quel
 * item ou spécialité, corrigé compris, s'ouvrait à tout élève connecté par son
 * identifiant).
 *
 * - interrogation officielle de SPÉCIALITÉ (`specialite_id`) : jamais ici, elle
 *   se passe et se note sur `/matieres/[matiere]/evaluation` ;
 * - interrogation COMPOSÉE d'un item (`cours_id`) : seulement si la page
 *   d'interrogation de l'item la servirait à l'élève (`ouverturesInterrogation`
 *   + interrogation retenue pour l'item) — `pageEpreuve` la refuse toujours,
 *   car elle ne se compose que depuis l'item ;
 * - épreuve blanche : date de publication atteinte et ciblage.
 */
export async function epreuveOuverteAEleve(
  exam: Epreuve,
  eleve: Eleve,
  options: { pageEpreuve?: boolean } = {},
): Promise<boolean> {
  if (!exam || exam.status !== 'published') return false;
  if (exam.specialite_id) return false;
  const scope = parseScope(eleve.permission_scope);
  if (!isExamTargeted(exam, scope, eleve.promotion ?? undefined, eleve.id)) return false;
  if (exam.cours_id) {
    if (options.pageEpreuve) return false;
    const coursId: string = exam.cours_id;
    const db = await createClient();
    const [ouvertures, composees] = await Promise.all([
      ouverturesInterrogation(db, { id: eleve.id, role: eleve.role ?? null, permission_scope: eleve.permission_scope ?? null }, [coursId]),
      interrogationsComposees([coursId]),
    ]);
    return !!ouvertures.get(coursId)?.ok && composees.get(coursId)?.id === exam.id;
  }
  return !exam.publish_at || new Date(exam.publish_at).getTime() <= Date.now();
}
