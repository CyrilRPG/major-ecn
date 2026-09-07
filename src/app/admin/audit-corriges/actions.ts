'use server';

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Audit des corrigés QCM — actions admin : création d'un audit, estimation,
 * annulation, et résolution des constats (inverser la clé, ignorer, marquer
 * corrigé à la main).
 *
 * « Inverser la clé » est la seule action qui touche au contenu : elle
 * retourne `is_correct` de la proposition ET recalcule
 * `qcm_questions.reponse_attendue` (lettres justes triées), comme le fait
 * l'éditeur admin — sinon la clé dérivée reste périmée.
 */
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit/log';
import {
  listerColleges, compterPerimetre, estimerSelonKind, lireRun, annulerRun, modelePourKind,
  estTableAuditAbsente, MESSAGE_AUDIT_TABLE_ABSENTE,
} from '@/lib/qcm-audit/serveur';
import type { AuditKind } from '@/lib/qcm-audit/regles';

const Kind = z.enum(['coherence', 'justifications']);

type Res<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const Id = z.string().uuid();

export async function estimerAuditAction(input: { collegeId: string | null; kind?: AuditKind }): Promise<Res<{ nbQuestions: number; nbItems: number; coutUsd: number; model: string; partiel: boolean }>> {
  await requireAdmin();
  const kind = Kind.catch('coherence').parse(input.kind);
  try {
    const { nbQuestions, nbItems, partiel } = await compterPerimetre(input.collegeId, kind);
    return { ok: true, nbQuestions, nbItems, partiel, coutUsd: estimerSelonKind(kind, nbQuestions, nbItems), model: modelePourKind(kind) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Estimation impossible.' };
  }
}

/** Crée l'audit (statut `preparation`) ; le lancement effectif passe par la route `lancer`. */
export async function creerAuditAction(input: { collegeId: string | null; kind?: AuditKind; coutEstimeUsd?: number | null }): Promise<Res<{ runId: string }>> {
  const { profile } = await requireAdmin();
  const parsed = z.object({ collegeId: z.string().min(1).nullable(), kind: Kind.default('coherence'), coutEstimeUsd: z.number().nullable().optional() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Périmètre invalide.' };
  const colleges = await listerColleges();
  const cible = parsed.data.collegeId ? colleges.find((c) => c.id === parsed.data.collegeId) : null;
  if (parsed.data.collegeId && !cible) return { ok: false, error: 'Collège introuvable.' };
  const restants = cible ? [cible.id] : colleges.map((c) => c.id);

  const admin = createAdminClient() as any;
  const { data, error } = await admin.from('qcm_audit_runs').insert({
    created_by: profile.id,
    college_id: cible?.id ?? null,
    college_nom: cible?.nom ?? null,
    model: modelePourKind(parsed.data.kind),
    kind: parsed.data.kind,
    status: 'preparation',
    restants,
    cout_estime_usd: parsed.data.coutEstimeUsd ?? null,
  }).select('id').single();
  if (error) return { ok: false, error: estTableAuditAbsente(error) ? MESSAGE_AUDIT_TABLE_ABSENTE : error.message };
  revalidatePath('/admin/audit-corriges');
  return { ok: true, runId: data.id };
}

export async function annulerAuditAction(runId: string): Promise<Res> {
  await requireAdmin();
  const id = Id.safeParse(runId);
  if (!id.success) return { ok: false, error: 'Audit invalide.' };
  try {
    const run = await lireRun(id.data);
    if (!run) return { ok: false, error: 'Audit introuvable.' };
    if (run.status === 'termine' || run.status === 'annule') return { ok: true };
    await annulerRun(run);
    revalidatePath('/admin/audit-corriges');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Annulation impossible.' };
  }
}

/* ─────────── Constats ─────────── */

async function chargerConstat(admin: any, id: string) {
  const { data, error } = await admin.from('qcm_audit_findings')
    .select('id, run_id, item_id, question_id, cours_id, lettre, statut, is_correct_actuel')
    .eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as { id: string; run_id: string; item_id: string; question_id: string; cours_id: string | null; lettre: string; statut: string; is_correct_actuel: boolean } | null;
}

/** Retourne la clé de la proposition (la justification avait raison) et resynchronise `reponse_attendue`. */
export async function inverserCleAction(findingId: string): Promise<Res<{ nouvelleCle: boolean }>> {
  const { profile } = await requireAdmin();
  const id = Id.safeParse(findingId);
  if (!id.success) return { ok: false, error: 'Constat invalide.' };
  const admin = createAdminClient() as any;
  try {
    const f = await chargerConstat(admin, id.data);
    if (!f) return { ok: false, error: 'Constat introuvable.' };
    if (f.statut !== 'ouvert') return { ok: false, error: 'Ce constat est déjà traité.' };

    const { data: item, error: itErr } = await admin.from('qcm_items').select('id, is_correct, lettre, question_id').eq('id', f.item_id).maybeSingle();
    if (itErr) throw new Error(itErr.message);
    if (!item) return { ok: false, error: 'La proposition n’existe plus.' };
    const nouvelle = !item.is_correct;
    const { error: upErr } = await admin.from('qcm_items').update({ is_correct: nouvelle, updated_at: new Date().toISOString() }).eq('id', item.id);
    if (upErr) throw new Error(upErr.message);

    // Clé dérivée de la question (« ACE ») : recalculée depuis les propositions.
    const { data: freres } = await admin.from('qcm_items').select('lettre, is_correct').eq('question_id', item.question_id);
    const lettres = ((freres ?? []) as { lettre: string; is_correct: boolean }[]).filter((x) => x.is_correct).map((x) => x.lettre).sort().join('');
    const { data: q } = await admin.from('qcm_questions').select('reponse_attendue, qcm_series(cours_id, cours(titre))').eq('id', item.question_id).maybeSingle();
    if (q && q.reponse_attendue != null && String(q.reponse_attendue).trim() !== '') {
      await admin.from('qcm_questions').update({ reponse_attendue: lettres, updated_at: new Date().toISOString() }).eq('id', item.question_id);
    }

    await admin.from('qcm_audit_findings').update({ statut: 'cle_inversee', resolved_by: profile.id, resolved_at: new Date().toISOString() }).eq('id', f.id);
    await logAudit({
      actor: profile, action: 'update', entity: 'qcm_item', entityId: item.id,
      coursId: f.cours_id, coursTitre: q?.qcm_series?.cours?.titre ?? null,
      description: `Audit des corrigés : clé de la proposition ${item.lettre} inversée (${item.is_correct ? 'vrai' : 'faux'} → ${nouvelle ? 'vrai' : 'faux'})`,
      diff: { finding_id: f.id, avant: item.is_correct, apres: nouvelle },
    });
    revalidatePath(`/admin/audit-corriges/${f.run_id}`);
    if (f.cours_id) revalidatePath(`/admin/contenu/${f.cours_id}`);
    return { ok: true, nouvelleCle: nouvelle };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Correction impossible.' };
  }
}

async function cloreConstat(findingId: string, statut: 'ignore' | 'corrige_manuellement'): Promise<Res> {
  const { profile } = await requireAdmin();
  const id = Id.safeParse(findingId);
  if (!id.success) return { ok: false, error: 'Constat invalide.' };
  const admin = createAdminClient() as any;
  const f = await chargerConstat(admin, id.data).catch(() => null);
  if (!f) return { ok: false, error: 'Constat introuvable.' };
  const { error } = await admin.from('qcm_audit_findings').update({ statut, resolved_by: profile.id, resolved_at: new Date().toISOString() }).eq('id', f.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/audit-corriges/${f.run_id}`);
  return { ok: true };
}

/** La clé avait raison (faux positif du modèle, ou question inversée mal lue). */
export async function ignorerConstatAction(findingId: string): Promise<Res> {
  return cloreConstat(findingId, 'ignore');
}

/** La correction a été faite dans l'éditeur (justification réécrite, etc.). */
export async function marquerCorrigeAction(findingId: string): Promise<Res> {
  return cloreConstat(findingId, 'corrige_manuellement');
}

/* ─────────── Passage « justifications » : appliquer les rédactions ─────────── */

async function appliquerLot(admin: any, profile: { id: string }, findings: Array<{ id: string; item_id: string; proposition: string | null; lettre: string; cours_id: string | null }>): Promise<number> {
  let n = 0;
  for (const f of findings) {
    const texte = (f.proposition ?? '').trim();
    if (!texte) continue;
    const { error: upErr } = await admin.from('qcm_items').update({ justification: texte, updated_at: new Date().toISOString() }).eq('id', f.item_id);
    if (upErr) throw new Error(upErr.message);
    await admin.from('qcm_audit_findings').update({ statut: 'proposition_appliquee', resolved_by: profile.id, resolved_at: new Date().toISOString() }).eq('id', f.id);
    n++;
  }
  return n;
}

/** Écrit la justification rédigée par le modèle dans la proposition. */
export async function appliquerPropositionAction(findingId: string): Promise<Res> {
  const { profile } = await requireAdmin();
  const id = Id.safeParse(findingId);
  if (!id.success) return { ok: false, error: 'Constat invalide.' };
  const admin = createAdminClient() as any;
  const { data: f, error } = await admin.from('qcm_audit_findings').select('id, run_id, item_id, proposition, lettre, cours_id, statut, gravite').eq('id', id.data).maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!f) return { ok: false, error: 'Constat introuvable.' };
  if (f.gravite !== 'justification' || !f.proposition) return { ok: false, error: 'Ce constat ne porte pas de proposition de justification.' };
  if (f.statut !== 'ouvert') return { ok: false, error: 'Ce constat est déjà traité.' };
  try {
    await appliquerLot(admin, profile, [f]);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Application impossible.' };
  }
  await logAudit({ actor: profile, action: 'update', entity: 'qcm_item', entityId: f.item_id, coursId: f.cours_id, description: `Audit des corrigés : justification de la proposition ${f.lettre} rédigée par IA appliquée`, diff: { finding_id: f.id } });
  revalidatePath(`/admin/audit-corriges/${f.run_id}`);
  if (f.cours_id) revalidatePath(`/admin/contenu/${f.cours_id}`);
  return { ok: true };
}

/**
 * Applique TOUTES les propositions encore ouvertes d'un audit, par tranches,
 * dans la limite du délai de la fonction ; renvoie ce qui reste à faire
 * (le bouton se rappelle tant que `restants > 0`).
 */
export async function appliquerToutesPropositionsAction(runId: string): Promise<Res<{ appliquees: number; restants: number }>> {
  const { profile } = await requireAdmin();
  const id = Id.safeParse(runId);
  if (!id.success) return { ok: false, error: 'Audit invalide.' };
  const admin = createAdminClient() as any;
  const debut = Date.now();
  let appliquees = 0;
  try {
    while (Date.now() - debut < 200_000) {
      const { data, error } = await admin.from('qcm_audit_findings')
        .select('id, item_id, proposition, lettre, cours_id')
        .eq('run_id', id.data).eq('gravite', 'justification').eq('statut', 'ouvert')
        .order('created_at').limit(100);
      if (error) throw new Error(error.message);
      if (!data || data.length === 0) break;
      appliquees += await appliquerLot(admin, profile, data);
      if (data.length < 100) break;
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Application impossible.' };
  }
  const { count } = await admin.from('qcm_audit_findings').select('id', { count: 'exact', head: true }).eq('run_id', id.data).eq('gravite', 'justification').eq('statut', 'ouvert');
  if (appliquees > 0) {
    await logAudit({ actor: profile, action: 'update', entity: 'qcm_item', entityId: null, description: `Audit des corrigés : ${appliquees} justification(s) rédigée(s) par IA appliquée(s) (audit ${id.data.slice(0, 8)})`, diff: { run_id: id.data, appliquees } });
  }
  revalidatePath(`/admin/audit-corriges/${id.data}`);
  revalidatePath('/admin/audit-corriges');
  return { ok: true, appliquees, restants: count ?? 0 };
}
