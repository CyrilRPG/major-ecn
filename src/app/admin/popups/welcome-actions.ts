'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit/log';

/**
 * Configuration du popup d'accueil, par spécialité (`college_id`) ou par défaut
 * (`college_id` null). Réservé aux administrateurs.
 */

export type WelcomeInput = {
  id?: string | null;
  collegeId: string | null;
  active: boolean;
  titre: string;
  accroche: string;
  intro: string;
  demarrageActif: boolean;
  demarrageIntro: string;
  demarrageColleges: string[];
};

export async function saveWelcomePopupAction(
  input: WelcomeInput,
): Promise<{ ok: true; id: string } | { error: string }> {
  const { profile } = await requireAdmin();

  const titre = input.titre.trim().slice(0, 200);
  if (!titre) return { error: 'Le titre ne peut pas être vide.' };

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;

  const patch = {
    college_id: input.collegeId,
    active: input.active,
    titre,
    accroche: input.accroche.trim().slice(0, 300),
    intro: input.intro.trim().slice(0, 1000),
    demarrage_actif: input.demarrageActif,
    demarrage_intro: input.demarrageIntro.trim().slice(0, 1000),
    demarrage_colleges: input.demarrageColleges,
    updated_at: new Date().toISOString(),
  };

  let id = input.id ?? null;
  if (id) {
    const { error } = await a.from('welcome_popups').update(patch).eq('id', id);
    if (error) return { error: error.message };
  } else {
    // Une seule configuration par spécialité : si elle existe déjà, on la met
    // à jour plutôt que de créer un doublon (l'index unique le refuserait).
    const base = a.from('welcome_popups').select('id');
    const { data: deja } = await (input.collegeId === null
      ? base.is('college_id', null)
      : base.eq('college_id', input.collegeId)
    ).limit(1).maybeSingle();
    if (deja?.id) {
      const { error } = await a.from('welcome_popups').update(patch).eq('id', deja.id);
      if (error) return { error: error.message };
      id = deja.id as string;
    } else {
      const { data: cree, error } = await a.from('welcome_popups').insert(patch).select('id').single();
      if (error) return { error: error.message };
      id = cree.id as string;
    }
  }

  await logAudit({
    actor: profile,
    action: 'update',
    entity: 'platform_event',
    entityId: id,
    description: input.collegeId
      ? `Popup d’accueil de ${input.collegeId} ${input.active ? 'activé' : 'désactivé'}`
      : `Popup d’accueil par défaut ${input.active ? 'activé' : 'désactivé'}`,
    diff: { college_id: input.collegeId, active: input.active },
  });

  revalidatePath('/admin/popups');
  return { ok: true, id: id as string };
}

export async function deleteWelcomePopupAction(
  id: string,
): Promise<{ ok: true } | { error: string }> {
  const { profile } = await requireAdmin();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('welcome_popups').delete().eq('id', id);
  if (error) return { error: error.message };
  await logAudit({
    actor: profile,
    action: 'delete',
    entity: 'platform_event',
    entityId: id,
    description: 'Suppression d’une configuration de popup d’accueil',
  });
  revalidatePath('/admin/popups');
  return { ok: true };
}
