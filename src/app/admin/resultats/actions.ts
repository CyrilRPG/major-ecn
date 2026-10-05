'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentUserAndProfile } from '@/lib/auth/get-profile';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit/log';
import { scoreBand } from '@/lib/parcours/parcours';

const CorrectionSchema = z.object({
  source: z.enum(['checkup', 'epreuve', 'interrogation_cours', 'parcours_major', 'transversale']),
  id: z.string().uuid(),
  userId: z.string().uuid(),
  score: z.number().finite().min(0),
  scoreMax: z.number().finite().positive().nullable(),
  motif: z.string().trim().min(5, 'Indiquez le motif de la correction (5 caractères au moins).').max(1000),
});

/**
 * Corrige une note DÉFINITIVE (administrateurs seulement). Rien n'est écrasé
 * en silence : la fonction `admin_corriger_evaluation` pose l'auteur et le
 * motif, et les déclencheurs inscrivent l'ancienne et la nouvelle valeur dans
 * `evaluation_corrections` (consultable sur la fiche résultats de l'élève).
 */
export async function corrigerEvaluationAction(input: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile || profile.role !== 'admin' || profile.is_active === false) return { ok: false, error: 'Réservé aux administrateurs.' };
  const parsed = CorrectionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' };
  const c = parsed.data;
  if (c.source === 'parcours_major' && c.score > 10) return { ok: false, error: 'La note du Parcours du Major est sur 10.' };
  if (c.scoreMax !== null && c.score > c.scoreMax) return { ok: false, error: 'La note dépasse le maximum.' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;
  const { error } = await db.rpc('admin_corriger_evaluation', {
    p_source: c.source, p_id: c.id, p_score: c.score,
    p_score_max: c.source === 'parcours_major' ? null : c.scoreMax,
    p_band: c.source === 'parcours_major' ? scoreBand(c.score) : null,
    p_auteur: profile.id, p_motif: c.motif,
  });
  if (error) return { ok: false, error: error.message };

  await logAudit({
    actor: profile, action: 'update', entity: 'evaluation', entityId: c.id,
    description: `Note corrigée (${c.source}) : ${c.score}${c.scoreMax !== null ? ` / ${c.scoreMax}` : ''} — motif : ${c.motif}`,
  });
  revalidatePath(`/admin/resultats/eleve/${c.userId}`);
  revalidatePath('/admin/resultats');
  return { ok: true };
}
