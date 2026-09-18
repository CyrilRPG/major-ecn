'use server';

import { revalidatePath } from 'next/cache';
import { requireContentEditor } from '@/lib/auth/require-role';
import { canEditCoursContent } from '@/lib/auth/prof-content-access';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit/log';
import { estTableRelecturesAbsente, type Relecture } from '@/lib/data/relectures';

/**
 * Marques de relecture posées par les professeurs depuis la vue élève
 * (table `content_reviews`) : une série relue, un item entièrement relu.
 *
 * Périmètre : un professeur ne marque que les items qu'il peut éditer
 * (`canEditCoursContent`), sur au moins un des types relus (QCM, fiche,
 * flashcards). L'écriture passe par le client service-role après ce contrôle.
 */

type Resultat = { ok: true; relecture: Relecture | null } | { error: string };

const MSG_TABLE = 'La table des relectures n’existe pas encore : appliquez la migration 20260918120000_content_reviews.sql.';

type Contexte =
  | { error: string }
  | {
      profile: Awaited<ReturnType<typeof requireContentEditor>>['profile'];
      admin: ReturnType<typeof createAdminClient>;
      cours: { id: string; titre: string; matiereNom: string | null };
      nom: string | null;
    };

async function contexte(coursId: string): Promise<Contexte> {
  const { profile } = await requireContentEditor();
  const admin = createAdminClient();
  const { data: cours } = await admin
    .from('cours')
    .select('id, titre, matiere_id, matieres(nom)')
    .eq('id', coursId)
    .maybeSingle();
  if (!cours) return { error: 'Item introuvable.' };
  const peut = (['qcm', 'fiche', 'flashcards'] as const).some((t) => canEditCoursContent(profile, t, cours.matiere_id, cours.id));
  if (!peut) return { error: 'Cet item n’est pas dans votre périmètre.' };
  const nom = `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || profile.email || null;
  const matiereNom = (cours.matieres as unknown as { nom?: string } | null)?.nom ?? null;
  return { profile, admin, cours: { id: cours.id, titre: cours.titre, matiereNom }, nom };
}

/** Bascule « série relue » : pose la marque si elle manque, la retire sinon. */
export async function basculerRelectureSerieAction(input: { coursId: string; serieId: string }): Promise<Resultat> {
  const ctx = await contexte(input.coursId);
  if ('error' in ctx) return ctx;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = ctx.admin as any;
  const { data: serie } = await a.from('qcm_series').select('id, label').eq('id', input.serieId).eq('cours_id', input.coursId).maybeSingle();
  if (!serie) return { error: 'Série introuvable sur cet item.' };

  const { data: existante, error: e1 } = await a
    .from('content_reviews').select('id').eq('scope', 'serie').eq('serie_id', input.serieId).maybeSingle();
  if (e1) return { error: estTableRelecturesAbsente(e1) ? MSG_TABLE : e1.message };

  if (existante) {
    const { error } = await a.from('content_reviews').delete().eq('id', existante.id);
    if (error) return { error: error.message };
    await logAudit({
      actor: ctx.profile, action: 'update', entity: 'qcm_series', entityId: input.serieId,
      coursId: ctx.cours.id, coursTitre: ctx.cours.titre, matiereNom: ctx.cours.matiereNom,
      description: `Relecture retirée sur « ${serie.label} »`, diff: { relue: false },
    });
    revalider(input.coursId, input.serieId);
    return { ok: true, relecture: null };
  }

  const { data: creee, error } = await a
    .from('content_reviews')
    .insert({ scope: 'serie', cours_id: input.coursId, serie_id: input.serieId, reviewed_by: ctx.profile.id, reviewed_by_name: ctx.nom })
    .select('reviewed_by, reviewed_by_name, reviewed_at')
    .single();
  if (error) return { error: estTableRelecturesAbsente(error) ? MSG_TABLE : error.message };
  await logAudit({
    actor: ctx.profile, action: 'update', entity: 'qcm_series', entityId: input.serieId,
    coursId: ctx.cours.id, coursTitre: ctx.cours.titre, matiereNom: ctx.cours.matiereNom,
    description: `Série « ${serie.label} » marquée comme relue`, diff: { relue: true },
  });
  revalider(input.coursId, input.serieId);
  return { ok: true, relecture: { reviewedBy: creee.reviewed_by, reviewedByName: creee.reviewed_by_name, reviewedAt: creee.reviewed_at } };
}

/** Bascule « item entièrement relu » (fiche, flashcards, QCM). */
export async function basculerRelectureCoursAction(input: { coursId: string }): Promise<Resultat> {
  const ctx = await contexte(input.coursId);
  if ('error' in ctx) return ctx;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = ctx.admin as any;
  const { data: existante, error: e1 } = await a
    .from('content_reviews').select('id').eq('scope', 'cours').eq('cours_id', input.coursId).maybeSingle();
  if (e1) return { error: estTableRelecturesAbsente(e1) ? MSG_TABLE : e1.message };

  if (existante) {
    const { error } = await a.from('content_reviews').delete().eq('id', existante.id);
    if (error) return { error: error.message };
    await logAudit({
      actor: ctx.profile, action: 'update', entity: 'cours', entityId: input.coursId,
      coursId: ctx.cours.id, coursTitre: ctx.cours.titre, matiereNom: ctx.cours.matiereNom,
      description: 'Relecture complète de l’item retirée', diff: { relu: false },
    });
    revalider(input.coursId);
    return { ok: true, relecture: null };
  }

  const { data: creee, error } = await a
    .from('content_reviews')
    .insert({ scope: 'cours', cours_id: input.coursId, reviewed_by: ctx.profile.id, reviewed_by_name: ctx.nom })
    .select('reviewed_by, reviewed_by_name, reviewed_at')
    .single();
  if (error) return { error: estTableRelecturesAbsente(error) ? MSG_TABLE : error.message };
  await logAudit({
    actor: ctx.profile, action: 'update', entity: 'cours', entityId: input.coursId,
    coursId: ctx.cours.id, coursTitre: ctx.cours.titre, matiereNom: ctx.cours.matiereNom,
    description: 'Item marqué comme entièrement relu (fiche, flashcards, QCM)', diff: { relu: true },
  });
  revalider(input.coursId);
  return { ok: true, relecture: { reviewedBy: creee.reviewed_by, reviewedByName: creee.reviewed_by_name, reviewedAt: creee.reviewed_at } };
}

function revalider(coursId: string, serieId?: string) {
  revalidatePath(`/cours/${coursId}`);
  revalidatePath(`/cours/${coursId}/qcm`);
  if (serieId) revalidatePath(`/cours/${coursId}/qcm/${serieId}`);
  revalidatePath('/admin/contenu');
}
