'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit/log';
import { requireSuiviAction } from '@/lib/suivi/roles';
import { eleveAccessible, listerCollaborateursSuivi, scopeDeActeur, STATUTS_SUIVI, STATUT_SUIVI_LABEL, type StatutSuivi } from '@/lib/suivi/eleves';
import { studentName } from '@/lib/suivi/students';

/**
 * Actions du tableau de travail « Suivi élèves » (cahier des charges
 * 18/09/2026, §3-4). Chaque action : garde de rôle du module, PUIS contrôle
 * que l'élève est dans le périmètre et la population de l'acteur (les actions
 * passent par le client service-role : la RLS ne protège pas), PUIS journal
 * d'activité horodaté au nom de la personne.
 */

type Ok<T = object> = { ok: true } & T;
type Err = { ok: false; error: string };
const fail = (e: unknown): Err => ({ ok: false, error: e instanceof Error ? e.message : 'Erreur inattendue' });

const StatutSchema = z.object({
  userId: z.string().uuid(),
  statut: z.enum(STATUTS_SUIVI as [StatutSuivi, ...StatutSuivi[]]).optional(),
  /** YYYY-MM-DD, '' = effacer. */
  prochainContact: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/).optional(),
  note: z.string().max(2000).optional(),
});

const CompteRenduSchema = z.object({
  userId: z.string().uuid(),
  /** Date du contact (YYYY-MM-DD) — par défaut aujourd'hui. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  contact_type: z.enum(['telephone', 'visio', 'email', 'whatsapp', 'sms', 'rendez_vous']),
  motif: z.string().trim().min(1, 'Le motif est obligatoire').max(200),
  compte_rendu: z.string().trim().min(1, 'Le compte rendu est obligatoire').max(5000),
  difficulte: z.string().trim().max(2000).optional(),
  action_decidee: z.string().trim().max(2000).optional(),
  prochaine_relance: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/).optional(),
  /** Statut de suivi à poser en même temps (par défaut : Contacté). */
  statut: z.enum(STATUTS_SUIVI as [StatutSuivi, ...StatutSuivi[]]).optional(),
});

function db() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createAdminClient() as any;
}

function revalider(userId: string) {
  revalidatePath('/admin/suivi/eleves');
  revalidatePath(`/admin/suivi/eleves/${userId}`);
  revalidatePath(`/admin/suivi/candidats/${userId}`);
}

/** Statut de suivi, prochain contact prévu, note courte. */
export async function majSuiviEleveAction(input: unknown): Promise<Ok | Err> {
  try {
    const actor = await requireSuiviAction('report');
    const p = StatutSchema.parse(input);
    const acces = await eleveAccessible(actor, p.userId);
    if (!acces.ok) return acces;
    const patch: Record<string, unknown> = { updated_by: actor.profile.id, updated_at: new Date().toISOString() };
    if (p.statut) patch.statut = p.statut;
    if (p.prochainContact !== undefined) patch.prochain_contact_at = p.prochainContact || null;
    if (p.note !== undefined) patch.note = p.note.trim() || null;
    const { error } = await db().from('suivi_followups').upsert({ user_id: p.userId, faculte_id: EDN_FACULTE_ID, ...patch }, { onConflict: 'user_id' });
    if (error) return { ok: false, error: error.message };
    await logAudit({
      actor: actor.profile, action: 'update', entity: 'student_followup', entityId: p.userId,
      description: `Suivi de ${acces.ligne.nom}${p.statut ? ` → ${STATUT_SUIVI_LABEL[p.statut]}` : ''}${p.prochainContact ? ` · prochain contact le ${p.prochainContact}` : ''}`,
      diff: patch,
    });
    revalider(p.userId);
    return { ok: true };
  } catch (e) { return fail(e); }
}

/** « Affecter à : Sarah / David / Commercial 1 » — administrateur ou gestion du module. */
export async function affecterEleveAction(input: unknown): Promise<Ok | Err> {
  try {
    const actor = await requireSuiviAction('manage');
    const p = z.object({ userId: z.string().uuid(), collaborateurId: z.string().uuid().nullable() }).parse(input);
    const scope = scopeDeActeur(actor);
    if (scope && !scope.modules.suivi.gerer) return { ok: false, error: 'L’affectation des élèves demande le droit « Gérer le module ».' };
    const acces = await eleveAccessible(actor, p.userId);
    if (!acces.ok) return acces;
    let nomCollab: string | null = null;
    if (p.collaborateurId) {
      const collab = (await listerCollaborateursSuivi()).find((c) => c.id === p.collaborateurId);
      if (!collab) return { ok: false, error: 'Ce compte ne fait pas partie de l’équipe de suivi.' };
      nomCollab = collab.nom;
    }
    const { error } = await db().from('suivi_followups').upsert({
      user_id: p.userId, faculte_id: EDN_FACULTE_ID, assigned_to: p.collaborateurId, assigned_by: actor.profile.id,
      assigned_at: p.collaborateurId ? new Date().toISOString() : null, updated_by: actor.profile.id, updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (error) return { ok: false, error: error.message };
    await logAudit({
      actor: actor.profile, action: 'update', entity: 'student_followup', entityId: p.userId,
      description: nomCollab ? `${acces.ligne.nom} affecté à ${nomCollab}` : `${acces.ligne.nom} : affectation retirée`,
      diff: { assigned_to: p.collaborateurId },
    });
    revalider(p.userId);
    return { ok: true };
  } catch (e) { return fail(e); }
}

/**
 * Compte rendu après un appel : date, moyen, motif, compte rendu, difficulté,
 * action décidée, prochaine relance. Écrit dans `pedagogical_notes` — table
 * immuable (trigger) : personne ne modifie ni n'efface un compte rendu, et
 * l'identité de l'auteur est figée dans la ligne.
 */
export async function ajouterCompteRenduAction(input: unknown): Promise<Ok<{ id: string }> | Err> {
  try {
    const actor = await requireSuiviAction('report');
    const p = CompteRenduSchema.parse(input);
    const acces = await eleveAccessible(actor, p.userId);
    if (!acces.ok) return acces;
    const auteur = studentName(actor.profile);
    const relance = p.prochaine_relance || null;
    const { data, error } = await db().from('pedagogical_notes').insert({
      user_id: p.userId,
      author_id: actor.profile.id,
      author_name: auteur,
      contact_type: p.contact_type,
      motif: p.motif,
      observations: p.compte_rendu,
      difficultes: p.difficulte?.trim() || null,
      actions_recommandees: p.action_decidee?.trim() || null,
      relance_date: relance,
      prochaine_relance_at: relance,
      ...(p.date ? { created_at: `${p.date}T12:00:00+02:00` } : {}),
    }).select('id').single();
    if (error) return { ok: false, error: error.message };
    // Le statut suit l'appel : Contacté par défaut, À rappeler si une relance est prévue.
    const statut: StatutSuivi = p.statut ?? (relance ? 'a_rappeler' : 'contacte');
    await db().from('suivi_followups').upsert({
      user_id: p.userId, faculte_id: EDN_FACULTE_ID, statut, prochain_contact_at: relance,
      updated_by: actor.profile.id, updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    await logAudit({
      actor: actor.profile, action: 'create', entity: 'pedagogical_note', entityId: data.id as string,
      description: `Compte rendu (${p.contact_type}) pour ${acces.ligne.nom} — ${p.motif}`,
      diff: { statut, relance },
    });
    revalider(p.userId);
    return { ok: true, id: data.id as string };
  } catch (e) { return fail(e); }
}
