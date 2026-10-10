'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { annoncerAffectation, contexteCockpit, FACULTE, journaliser, type Db, type Moi } from '@/lib/cockpit/server/base';
import {
  CANAUX, CATEGORIES_RECLAMATION, NATURES_DEMANDE, NATURE_DEMANDE_LABEL, peutVoirDemande, peutVoirReclamation, PRIORITES,
  SOUS_TYPES_COMPTABLES, SOUS_TYPE_LABEL, STATUTS_AMELIORATION, STATUTS_DEMANDE, STATUTS_RECLAMATION, TYPES_PROBLEME,
} from '@/lib/cockpit/regles';

/**
 * Demandes clients (téléphone, e-mail…), réclamations et améliorations
 * (addendum D/E, rubrique « Réclamations & Améliorations »). Ce sont des
 * dossiers d'équipe : visibles des administrateurs, de leur auteur et de la
 * personne affectée — jamais d'un collaborateur non concerné.
 */

type R<T = undefined> = { ok: true; data?: T } | { ok: false; erreur: string };

const rafraichir = () => revalidatePath('/admin/cockpit', 'layout');
const vide = z.literal('').transform(() => null);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const premiere = (e: z.ZodError) => e.issues[0]?.message ?? 'Saisie invalide.';

async function membreValide(d: Db, id: string | null | undefined): Promise<boolean> {
  if (!id) return true;
  const { data } = await d.from('profiles').select('role, is_active').eq('id', id).maybeSingle();
  return !!data && (data.role === 'admin' || data.role === 'professor') && data.is_active !== false;
}

async function annoncer(d: Db, moi: Moi, userId: string | null | undefined, genre: 'demande' | 'reclamation' | 'affectation', _titre: string, corps: string, lien: string, cle: string) {
  if (!userId || userId === moi.id) return;
  await annoncerAffectation(d, { userId, auteur: moi.nom, titre: corps, lien, groupKey: `${cle}:${userId}`, genre });
}

/* ------------------------------------------------------------------ */
/* Demandes clients                                                    */
/* ------------------------------------------------------------------ */

const demandeSchema = z.object({
  client_id: z.string().uuid().nullish().or(vide),
  client_label: z.string().trim().min(1, 'Indiquez le client.').max(200),
  client_contact: z.string().trim().max(300).nullish(),
  canal: z.enum(CANAUX).default('telephone'),
  recue_at: z.string().datetime({ offset: true }).nullish().or(vide),
  nature: z.enum(NATURES_DEMANDE).default('administrative'),
  sous_type: z.enum(SOUS_TYPES_COMPTABLES).nullish().or(vide),
  motif: z.string().trim().min(1, 'Indiquez le motif.').max(300),
  resume: z.string().max(10000).nullish(),
  priorite: z.enum(PRIORITES).default('normale'),
  assignee_id: z.string().uuid().nullish().or(vide),
  echeance: date.nullish().or(vide),
  statut: z.enum(STATUTS_DEMANDE).default('a_traiter'),
});
export type DemandeInput = z.input<typeof demandeSchema>;

async function chargerDemande(d: Db, id: string, moi: Moi) {
  const { data } = await d.from('cockpit_demandes').select('*').eq('id', id).maybeSingle();
  if (!data || data.faculte_id !== FACULTE || !peutVoirDemande(data, moi.id, moi.estAdmin)) return null;
  return data as Record<string, unknown> & { id: string; created_by: string; assignee_id: string | null; nature: string; numero: number; motif: string; client_label: string; tache_id: string | null; resume: string | null; echeance: string | null; priorite: string; sous_type: string | null; client_id: string | null; statut: string };
}

export async function enregistrerDemande(input: DemandeInput, id?: string): Promise<R<{ id: string }>> {
  const { moi, db: d } = await contexteCockpit();
  const p = demandeSchema.safeParse(input);
  if (!p.success) return { ok: false, erreur: premiere(p.error) };
  const v = p.data;
  if (!(await membreValide(d, v.assignee_id))) return { ok: false, erreur: 'La personne chargée du traitement doit faire partie de l’équipe.' };
  const champs = {
    client_id: v.client_id ?? null, client_label: v.client_label, client_contact: v.client_contact || null,
    canal: v.canal, nature: v.nature, sous_type: v.nature === 'comptable' ? (v.sous_type ?? 'autre') : null,
    motif: v.motif, resume: v.resume || null, priorite: v.priorite, assignee_id: v.assignee_id ?? null,
    echeance: v.echeance ?? null, statut: v.statut,
    cloturee_at: v.statut === 'terminee' ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
  if (id) {
    const avant = await chargerDemande(d, id, moi);
    if (!avant) return { ok: false, erreur: 'Demande introuvable.' };
    // La date de clôture d'une demande déjà terminée n'est pas réécrite.
    if (avant.statut === 'terminee' && v.statut === 'terminee') delete (champs as Record<string, unknown>).cloturee_at;
    await d.from('cockpit_demandes').update({ ...champs, ...(v.recue_at ? { recue_at: v.recue_at } : {}) }).eq('id', id);
    await journaliser(d, { objet_type: 'demande', objet_id: id, acteur_id: moi.id, action: 'modification', audit: v.nature === 'comptable' });
    if (v.assignee_id && v.assignee_id !== avant.assignee_id) {
      await annoncer(d, moi, v.assignee_id, 'demande', `${moi.nom} vous a confié une demande client`, `${v.client_label} — ${v.motif}`, `/admin/cockpit/demandes?d=${id}`, `demande:${id}`);
    }
    rafraichir();
    return { ok: true, data: { id } };
  }
  const { data, error } = await d.from('cockpit_demandes')
    .insert({ ...champs, created_by: moi.id, faculte_id: FACULTE, recue_at: v.recue_at ?? new Date().toISOString() })
    .select('id').single();
  if (error || !data) return { ok: false, erreur: 'La demande n’a pas pu être enregistrée.' };
  await journaliser(d, { objet_type: 'demande', objet_id: data.id, acteur_id: moi.id, action: 'creation', details: { nature: v.nature, canal: v.canal }, audit: v.nature === 'comptable' });
  await annoncer(d, moi, v.assignee_id, 'demande', `${moi.nom} vous a confié une demande client`, `${v.client_label} — ${v.motif}`, `/admin/cockpit/demandes?d=${data.id}`, `demande:${data.id}`);
  rafraichir();
  return { ok: true, data: { id: data.id } };
}

export async function changerStatutDemande(id: string, statut: (typeof STATUTS_DEMANDE)[number]): Promise<R> {
  if (!(STATUTS_DEMANDE as readonly string[]).includes(statut)) return { ok: false, erreur: 'Statut inconnu.' };
  const { moi, db: d } = await contexteCockpit();
  const dem = await chargerDemande(d, id, moi);
  if (!dem) return { ok: false, erreur: 'Demande introuvable.' };
  if (dem.statut === statut) return { ok: true };
  await d.from('cockpit_demandes').update({ statut, cloturee_at: statut === 'terminee' ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq('id', id);
  await journaliser(d, { objet_type: 'demande', objet_id: id, acteur_id: moi.id, action: 'statut', details: { vers: statut } });
  rafraichir();
  return { ok: true };
}

/** Transformer une demande en tâche en un clic, sans ressaisie (addendum D). */
export async function demandeVersTache(id: string): Promise<R<{ tacheId: string }>> {
  const { moi, db: d } = await contexteCockpit();
  const dem = await chargerDemande(d, id, moi);
  if (!dem) return { ok: false, erreur: 'Demande introuvable.' };
  if (dem.tache_id) {
    const { data: t } = await d.from('cockpit_taches').select('id').eq('id', dem.tache_id).maybeSingle();
    if (t) return { ok: true, data: { tacheId: t.id } };
  }
  const nature = NATURE_DEMANDE_LABEL[dem.nature as keyof typeof NATURE_DEMANDE_LABEL] ?? dem.nature;
  const { data, error } = await d.from('cockpit_taches').insert({
    owner_id: moi.id,
    titre: `${dem.sous_type ? SOUS_TYPE_LABEL[dem.sous_type] : dem.motif} — ${dem.client_label}`.slice(0, 300),
    description: [`Demande n° ${dem.numero} (${nature})`, dem.motif, dem.resume].filter(Boolean).join('\n\n'),
    priorite: dem.priorite,
    categorie: dem.nature === 'comptable' ? 'finances' : dem.nature === 'commerciale' ? 'commercial' : dem.nature === 'pedagogique' ? 'pedagogie' : 'administration',
    echeance: dem.echeance,
    lien_type: 'demande', lien_id: dem.id, lien_label: `Demande n° ${dem.numero} — ${dem.client_label}`,
    assignee_id: dem.assignee_id && dem.assignee_id !== moi.id ? dem.assignee_id : null,
    ordre: Date.now() / 1000,
  }).select('id').single();
  if (error || !data) return { ok: false, erreur: 'La tâche n’a pas pu être créée.' };
  await d.from('cockpit_demandes').update({ tache_id: data.id, statut: dem.statut === 'a_traiter' ? 'en_cours' : dem.statut, updated_at: new Date().toISOString() }).eq('id', id);
  await journaliser(d, { objet_type: 'demande', objet_id: id, acteur_id: moi.id, action: 'vers_tache', details: { tache: data.id } });
  await journaliser(d, { objet_type: 'tache', objet_id: data.id, acteur_id: moi.id, action: 'creation', details: { depuis: 'demande', demande: id } });
  rafraichir();
  return { ok: true, data: { tacheId: data.id } };
}

/* ------------------------------------------------------------------ */
/* Réclamations                                                        */
/* ------------------------------------------------------------------ */

const reclamationSchema = z.object({
  candidat_id: z.string().uuid().nullish().or(vide),
  candidat_label: z.string().trim().min(1, 'Indiquez le candidat.').max(200),
  specialite: z.string().trim().max(120).nullish(),
  categorie: z.enum(CATEGORIES_RECLAMATION).default('fonctionnalite'),
  type_probleme: z.enum(TYPES_PROBLEME).default('individuel'),
  sujet: z.string().trim().min(1, 'Indiquez le sujet.').max(300),
  description: z.string().max(10000).nullish(),
  canal: z.enum(CANAUX).default('telephone'),
  priorite: z.enum(PRIORITES).default('normale'),
  statut: z.enum(STATUTS_RECLAMATION).default('a_traiter'),
  assignee_id: z.string().uuid().nullish().or(vide),
  amelioration_id: z.string().uuid().nullish().or(vide),
  a_recontacter: z.boolean().default(false),
});
export type ReclamationInput = z.input<typeof reclamationSchema>;

async function chargerReclamation(d: Db, id: string, moi: Moi) {
  const { data } = await d.from('cockpit_reclamations').select('*').eq('id', id).maybeSingle();
  if (!data || data.faculte_id !== FACULTE || !peutVoirReclamation(data, moi.id, moi.estAdmin)) return null;
  return data as Record<string, unknown> & { id: string; sujet: string; candidat_label: string; candidat_id: string | null; specialite: string | null; description: string | null; priorite: string; amelioration_id: string | null; tache_id: string | null; assignee_id: string | null; statut: string };
}

export async function enregistrerReclamation(input: ReclamationInput, id?: string): Promise<R<{ id: string }>> {
  const { moi, db: d } = await contexteCockpit();
  const p = reclamationSchema.safeParse(input);
  if (!p.success) return { ok: false, erreur: premiere(p.error) };
  const v = p.data;
  if (!(await membreValide(d, v.assignee_id))) return { ok: false, erreur: 'La personne affectée doit faire partie de l’équipe.' };
  const champs = {
    candidat_id: v.candidat_id ?? null, candidat_label: v.candidat_label, specialite: v.specialite || null,
    categorie: v.categorie, type_probleme: v.type_probleme, sujet: v.sujet, description: v.description || null,
    canal: v.canal, priorite: v.priorite, statut: v.statut, assignee_id: v.assignee_id ?? null,
    amelioration_id: v.amelioration_id ?? null, a_recontacter: v.a_recontacter,
    resolue_at: v.statut === 'resolu' || v.statut === 'cloturee' ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
  if (id) {
    const avant = await chargerReclamation(d, id, moi);
    if (!avant) return { ok: false, erreur: 'Réclamation introuvable.' };
    const maj: Record<string, unknown> = { ...champs };
    // Champs non transmis : on conserve le rattachement et le « à recontacter ».
    if (input.amelioration_id === undefined) delete maj.amelioration_id;
    if (input.a_recontacter === undefined) delete maj.a_recontacter;
    const clos = (s: string) => s === 'resolu' || s === 'cloturee';
    if (clos(avant.statut) && clos(v.statut)) delete maj.resolue_at;
    await d.from('cockpit_reclamations').update(maj).eq('id', id);
    await journaliser(d, { objet_type: 'reclamation', objet_id: id, acteur_id: moi.id, action: 'modification' });
    if (v.assignee_id && v.assignee_id !== avant.assignee_id) {
      await annoncer(d, moi, v.assignee_id, 'reclamation', `${moi.nom} vous a confié une réclamation`, v.sujet, `/admin/cockpit/reclamations?r=${id}`, `reclamation:${id}`);
    }
    rafraichir();
    return { ok: true, data: { id } };
  }
  const { data, error } = await d.from('cockpit_reclamations').insert({ ...champs, created_by: moi.id, faculte_id: FACULTE }).select('id').single();
  if (error || !data) return { ok: false, erreur: 'La réclamation n’a pas pu être enregistrée.' };
  await journaliser(d, { objet_type: 'reclamation', objet_id: data.id, acteur_id: moi.id, action: 'creation', details: { candidat: v.candidat_id ?? null } });
  await annoncer(d, moi, v.assignee_id, 'reclamation', `${moi.nom} vous a confié une réclamation`, v.sujet, `/admin/cockpit/reclamations?r=${data.id}`, `reclamation:${data.id}`);
  rafraichir();
  return { ok: true, data: { id: data.id } };
}

export async function changerStatutReclamation(id: string, statut: (typeof STATUTS_RECLAMATION)[number]): Promise<R> {
  if (!(STATUTS_RECLAMATION as readonly string[]).includes(statut)) return { ok: false, erreur: 'Statut inconnu.' };
  const { moi, db: d } = await contexteCockpit();
  const avant = await chargerReclamation(d, id, moi);
  if (!avant) return { ok: false, erreur: 'Réclamation introuvable.' };
  if (avant.statut === statut) return { ok: true };
  await d.from('cockpit_reclamations').update({
    statut, resolue_at: statut === 'resolu' || statut === 'cloturee' ? new Date().toISOString() : null, updated_at: new Date().toISOString(),
  }).eq('id', id);
  await journaliser(d, { objet_type: 'reclamation', objet_id: id, acteur_id: moi.id, action: 'statut', details: { vers: statut } });
  rafraichir();
  return { ok: true };
}

/** Candidat recontacté après correction (avec son ressenti). */
export async function marquerRecontacte(id: string, satisfaction: 'satisfait' | 'neutre' | 'insatisfait' | null): Promise<R> {
  const { moi, db: d } = await contexteCockpit();
  if (!(await chargerReclamation(d, id, moi))) return { ok: false, erreur: 'Réclamation introuvable.' };
  await d.from('cockpit_reclamations').update({
    a_recontacter: false, recontacte_at: new Date().toISOString(), satisfaction, updated_at: new Date().toISOString(),
  }).eq('id', id);
  await journaliser(d, { objet_type: 'reclamation', objet_id: id, acteur_id: moi.id, action: 'recontacte', details: { satisfaction } });
  rafraichir();
  return { ok: true };
}

export async function reclamationVersTache(id: string): Promise<R<{ tacheId: string }>> {
  const { moi, db: d } = await contexteCockpit();
  const r = await chargerReclamation(d, id, moi);
  if (!r) return { ok: false, erreur: 'Réclamation introuvable.' };
  if (r.tache_id) {
    const { data: t } = await d.from('cockpit_taches').select('id').eq('id', r.tache_id).maybeSingle();
    if (t) return { ok: true, data: { tacheId: t.id } };
  }
  const { data, error } = await d.from('cockpit_taches').insert({
    owner_id: moi.id,
    titre: `Répondre à la réclamation (${r.candidat_label})`.slice(0, 300),
    description: [r.sujet, r.description].filter(Boolean).join('\n\n'),
    priorite: r.priorite, categorie: 'client',
    lien_type: 'reclamation', lien_id: r.id, lien_label: `Réclamation — ${r.candidat_label}`,
    assignee_id: r.assignee_id && r.assignee_id !== moi.id ? r.assignee_id : null,
    ordre: Date.now() / 1000,
  }).select('id').single();
  if (error || !data) return { ok: false, erreur: 'La tâche n’a pas pu être créée.' };
  await d.from('cockpit_reclamations').update({ tache_id: data.id, statut: r.statut === 'a_traiter' ? 'en_cours' : r.statut }).eq('id', id);
  await journaliser(d, { objet_type: 'reclamation', objet_id: id, acteur_id: moi.id, action: 'vers_tache', details: { tache: data.id } });
  rafraichir();
  return { ok: true, data: { tacheId: data.id } };
}

/* ------------------------------------------------------------------ */
/* Améliorations (regroupement des reproches récurrents)               */
/* ------------------------------------------------------------------ */

const ameliorationSchema = z.object({
  titre: z.string().trim().min(1, 'Donnez un titre à l’amélioration.').max(300),
  module: z.string().trim().max(120).nullish(),
  probleme: z.string().max(10000).nullish(),
  action_prevue: z.string().max(10000).nullish(),
  suivi: z.string().max(10000).nullish(),
  priorite: z.enum(PRIORITES).default('normale'),
  statut: z.enum(STATUTS_AMELIORATION).default('a_planifier'),
  responsable_id: z.string().uuid().nullish().or(vide),
  echeance: date.nullish().or(vide),
});
export type AmeliorationInput = z.input<typeof ameliorationSchema>;

async function chargerAmelioration(d: Db, id: string, moi: Moi) {
  const { data } = await d.from('cockpit_ameliorations').select('*').eq('id', id).maybeSingle();
  if (!data || data.faculte_id !== FACULTE) return null;
  if (!moi.estAdmin && data.responsable_id !== moi.id && data.created_by !== moi.id) return null;
  return data as Record<string, unknown> & { id: string; numero: number; titre: string; statut: string; responsable_id: string | null; tache_id: string | null; priorite: string; echeance: string | null; probleme: string | null; action_prevue: string | null };
}

export async function enregistrerAmelioration(input: AmeliorationInput, id?: string, reclamationIds: string[] = []): Promise<R<{ id: string }>> {
  const { moi, db: d } = await contexteCockpit();
  if (!moi.estAdmin && !id) return { ok: false, erreur: 'Seuls les administrateurs créent une amélioration.' };
  const p = ameliorationSchema.safeParse(input);
  if (!p.success) return { ok: false, erreur: premiere(p.error) };
  const v = p.data;
  if (!(await membreValide(d, v.responsable_id))) return { ok: false, erreur: 'Le responsable doit faire partie de l’équipe.' };
  const champs = {
    titre: v.titre, module: v.module || null, probleme: v.probleme || null, action_prevue: v.action_prevue || null,
    suivi: v.suivi || null, priorite: v.priorite, statut: v.statut, responsable_id: v.responsable_id ?? null,
    echeance: v.echeance ?? null, updated_at: new Date().toISOString(),
  };
  let ameliorationId = id;
  let ancienResponsable: string | null = null;
  if (id) {
    const avant = await chargerAmelioration(d, id, moi);
    if (!avant) return { ok: false, erreur: 'Amélioration introuvable.' };
    ancienResponsable = avant.responsable_id;
    await d.from('cockpit_ameliorations').update(champs).eq('id', id);
    if (v.statut !== avant.statut) await apresChangementStatut(d, moi, id, avant.statut, v.statut);
  } else {
    const { data, error } = await d.from('cockpit_ameliorations').insert({ ...champs, created_by: moi.id, faculte_id: FACULTE }).select('id').single();
    if (error || !data) return { ok: false, erreur: 'L’amélioration n’a pas pu être enregistrée.' };
    ameliorationId = data.id;
    await journaliser(d, { objet_type: 'amelioration', objet_id: data.id, acteur_id: moi.id, action: 'creation' });
  }
  if (reclamationIds.length > 0 && ameliorationId) await rattacher(d, moi, reclamationIds, ameliorationId);
  if (v.responsable_id && v.responsable_id !== ancienResponsable) {
    await annoncer(d, moi, v.responsable_id, 'affectation', `${moi.nom} vous a confié une amélioration`, v.titre, `/admin/cockpit/reclamations?vue=ameliorations&a=${ameliorationId}`, `amelioration:${ameliorationId}`);
  }
  rafraichir();
  return { ok: true, data: { id: ameliorationId! } };
}

async function rattacher(d: Db, moi: Moi, reclamationIds: string[], ameliorationId: string) {
  for (const rid of reclamationIds.slice(0, 200)) {
    const r = await chargerReclamation(d, rid, moi);
    if (!r) continue;
    await d.from('cockpit_reclamations').update({ amelioration_id: ameliorationId, statut: r.statut === 'a_traiter' ? 'a_analyser' : r.statut, updated_at: new Date().toISOString() }).eq('id', rid);
    await journaliser(d, { objet_type: 'reclamation', objet_id: rid, acteur_id: moi.id, action: 'rattachement', details: { amelioration: ameliorationId } });
  }
}

/** Regroupe plusieurs réclamations dans une amélioration, en conservant chaque dossier individuel. */
export async function rattacherReclamations(reclamationIds: string[], ameliorationId: string | null): Promise<R> {
  const { moi, db: d } = await contexteCockpit();
  if (ameliorationId) {
    if (!(await chargerAmelioration(d, ameliorationId, moi))) return { ok: false, erreur: 'Amélioration introuvable.' };
    await rattacher(d, moi, reclamationIds, ameliorationId);
  } else {
    for (const rid of reclamationIds) {
      if (await chargerReclamation(d, rid, moi)) await d.from('cockpit_reclamations').update({ amelioration_id: null }).eq('id', rid);
    }
  }
  rafraichir();
  return { ok: true };
}

/** Correction réalisée : les candidats concernés passent « à recontacter ». */
async function apresChangementStatut(d: Db, moi: Moi, id: string, de: string, vers: string) {
  await journaliser(d, { objet_type: 'amelioration', objet_id: id, acteur_id: moi.id, action: 'statut', details: { de, vers } });
  const faite = (s: string) => s === 'realisee' || s === 'verifiee';
  if (faite(de) && !faite(vers)) await d.from('cockpit_ameliorations').update({ realisee_at: null }).eq('id', id);
  if ((vers === 'realisee' || vers === 'verifiee') && de !== 'realisee' && de !== 'verifiee') {
    await d.from('cockpit_ameliorations').update({ realisee_at: new Date().toISOString() }).eq('id', id);
    await d.from('cockpit_reclamations').update({ a_recontacter: true, updated_at: new Date().toISOString() })
      .eq('amelioration_id', id).is('recontacte_at', null);
  }
}

export async function changerStatutAmelioration(id: string, statut: (typeof STATUTS_AMELIORATION)[number]): Promise<R> {
  if (!(STATUTS_AMELIORATION as readonly string[]).includes(statut)) return { ok: false, erreur: 'Statut inconnu.' };
  const { moi, db: d } = await contexteCockpit();
  const a = await chargerAmelioration(d, id, moi);
  if (!a) return { ok: false, erreur: 'Amélioration introuvable.' };
  await d.from('cockpit_ameliorations').update({ statut, updated_at: new Date().toISOString() }).eq('id', id);
  await apresChangementStatut(d, moi, id, a.statut, statut);
  rafraichir();
  return { ok: true };
}

/** Tâche de pilotage dans le cockpit (responsable, priorité, échéance, demande au développeur). */
export async function ameliorationVersTache(id: string): Promise<R<{ tacheId: string }>> {
  const { moi, db: d } = await contexteCockpit();
  const a = await chargerAmelioration(d, id, moi);
  if (!a) return { ok: false, erreur: 'Amélioration introuvable.' };
  if (a.tache_id) {
    const { data: t } = await d.from('cockpit_taches').select('id').eq('id', a.tache_id).maybeSingle();
    if (t) return { ok: true, data: { tacheId: t.id } };
  }
  const { data, error } = await d.from('cockpit_taches').insert({
    owner_id: moi.id,
    titre: `Piloter l’amélioration n° ${String(a.numero).padStart(3, '0')} — ${a.titre}`.slice(0, 300),
    description: [a.probleme && `Problème : ${a.probleme}`, a.action_prevue && `Action : ${a.action_prevue}`].filter(Boolean).join('\n\n') || null,
    priorite: a.priorite, categorie: 'developpement', echeance: a.echeance,
    lien_type: 'amelioration', lien_id: a.id, lien_label: `Amélioration n° ${String(a.numero).padStart(3, '0')}`,
    assignee_id: a.responsable_id && a.responsable_id !== moi.id ? a.responsable_id : null,
    ordre: Date.now() / 1000,
  }).select('id').single();
  if (error || !data) return { ok: false, erreur: 'La tâche n’a pas pu être créée.' };
  await d.from('cockpit_ameliorations').update({ tache_id: data.id }).eq('id', id);
  await journaliser(d, { objet_type: 'amelioration', objet_id: id, acteur_id: moi.id, action: 'vers_tache', details: { tache: data.id } });
  rafraichir();
  return { ok: true, data: { tacheId: data.id } };
}
