import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Profile } from '@/lib/auth/get-profile';

export type AuditAction = 'create' | 'update' | 'delete' | 'replace';
export type AuditEntity =
  | 'qcm_question'
  | 'qcm_item'
  | 'qcm_series'
  | 'flashcard'
  | 'fiche'
  | 'video'
  | 'annale'
  | 'cours'
  | 'matiere'
  | 'platform_event';

export type AuditPayload = {
  actor: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'email' | 'role'>;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string | null;
  coursId?: string | null;
  coursTitre?: string | null;
  matiereNom?: string | null;
  description: string;
  diff?: Record<string, unknown> | null;
};

/**
 * Insère une entrée dans le journal d'activité admin.
 * Tolérant aux erreurs (jamais throw) : un log raté ne doit pas bloquer
 * l'action métier qui l'a déclenché.
 */
export async function logAudit(p: AuditPayload): Promise<void> {
  try {
    const admin = createAdminClient();
    const fullName = [p.actor.first_name, p.actor.last_name].filter(Boolean).join(' ').trim() || p.actor.email || 'Inconnu';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('admin_audit_logs').insert({
      actor_id: p.actor.id,
      actor_email: p.actor.email,
      actor_name: fullName,
      actor_role: p.actor.role,
      action: p.action,
      entity_type: p.entity,
      entity_id: p.entityId ?? null,
      cours_id: p.coursId ?? null,
      cours_titre: p.coursTitre ?? null,
      matiere_nom: p.matiereNom ?? null,
      description: p.description,
      diff: p.diff ?? null,
    });
  } catch (err) {
    // On n'interrompt jamais le flux applicatif pour un log.
    console.error('[audit] failed to write log:', err);
  }
}
