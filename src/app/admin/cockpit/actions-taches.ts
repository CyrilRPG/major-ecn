'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { instantParis } from '@/lib/agenda/planning';
import { annoncerAffectation, contexteCockpit, journaliser, notifier, profilsParIds, type Db } from '@/lib/cockpit/server/base';
import { chargerTache, COLONNES_TACHE, type TacheLigne } from '@/lib/cockpit/server/taches';
import {
  ajouterJoursIso, DROITS, estOuverte, nomComplet, peut, peutAdministrer, PRIORITES, prochaineEcheance, RECURRENCES,
  STATUTS_TACHE, STATUT_TACHE_LABEL, type Recurrence,
} from '@/lib/cockpit/regles';

/**
 * Actions serveur des tâches du cockpit (§3, §4). Chaque action recontrôle
 * les droits côté serveur : propriété, affectation ou partage explicite —
 * le rôle administrateur n'ouvre aucune tâche privée d'autrui.
 */

type R<T = undefined> = { ok: true; data?: T } | { ok: false; erreur: string };

const rafraichir = () => {
  revalidatePath('/admin/cockpit', 'layout');
};

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const heure = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/);
const vide = z.literal('').transform(() => null);

const tacheSchema = z.object({
  titre: z.string().trim().min(1, 'Donnez un titre à la tâche.').max(300),
  description: z.string().max(10000).nullish(),
  priorite: z.enum(PRIORITES).default('normale'),
  statut: z.enum(STATUTS_TACHE).optional(),
  categorie: z.string().trim().min(1).max(60).default('administration'),
  echeance: date.nullish().or(vide),
  heure: heure.nullish().or(vide),
  rappel_at: z.string().datetime({ offset: true }).nullish().or(vide),
  recurrence: z.enum(RECURRENCES).default('aucune'),
  notes: z.string().max(10000).nullish(),
  lien_type: z.enum(['enseignant', 'eleve', 'conversation', 'demande', 'reclamation', 'amelioration', 'rdv', 'ressource']).nullish(),
  lien_id: z.string().max(200).nullish(),
  lien_label: z.string().max(300).nullish(),
  assignee_id: z.string().uuid().nullish().or(vide),
});
export type TacheInput = z.input<typeof tacheSchema>;

function premiereErreur(e: z.ZodError): string {
  return e.issues[0]?.message ?? 'Saisie invalide.';
}

async function verifierMembre(d: Db, userId: string): Promise<boolean> {
  const { data } = await d.from('profiles').select('id, role, is_active').eq('id', userId).maybeSingle();
  return !!data && (data.role === 'admin' || data.role === 'professor') && data.is_active !== false;
}

async function confier(d: Db, tache: { id: string; titre: string }, assigneeId: string, auteur: string) {
  await annoncerAffectation(d, { userId: assigneeId, auteur, titre: tache.titre, lien: `/admin/cockpit/taches?t=${tache.id}`, groupKey: `affectation:${tache.id}:${assigneeId}` });
}

/* ------------------------------------------------------------------ */

export async function creerTache(input: TacheInput): Promise<R<{ id: string }>> {
  const { moi, db: d } = await contexteCockpit();
  const p = tacheSchema.safeParse(input);
  if (!p.success) return { ok: false, erreur: premiereErreur(p.error) };
  const v = p.data;
  if (v.assignee_id && v.assignee_id !== moi.id && !(await verifierMembre(d, v.assignee_id))) {
    return { ok: false, erreur: 'Cette personne ne fait pas partie de l’équipe.' };
  }
  const { data, error } = await d
    .from('cockpit_taches')
    .insert({
      owner_id: moi.id,
      titre: v.titre,
      description: v.description || null,
      priorite: v.priorite,
      statut: v.statut ?? 'a_faire',
      categorie: v.categorie,
      echeance: v.echeance ?? null,
      heure: v.heure ?? null,
      rappel_at: v.rappel_at ?? null,
      recurrence: v.recurrence,
      notes: v.notes || null,
      lien_type: v.lien_type ?? null,
      lien_id: v.lien_id ?? null,
      lien_label: v.lien_label ?? null,
      assignee_id: v.assignee_id && v.assignee_id !== moi.id ? v.assignee_id : null,
      ordre: Date.now() / 1000,
    })
    .select('id, titre')
    .single();
  if (error || !data) return { ok: false, erreur: 'La tâche n’a pas pu être créée.' };
  await journaliser(d, { objet_type: 'tache', objet_id: data.id, acteur_id: moi.id, action: 'creation', details: { lien: v.lien_type ?? null } });
  if (v.assignee_id && v.assignee_id !== moi.id) {
    await confier(d, data, v.assignee_id, moi.nom);
    await journaliser(d, { objet_type: 'tache', objet_id: data.id, acteur_id: moi.id, action: 'affectation', details: { a: v.assignee_id }, audit: true });
  }
  rafraichir();
  return { ok: true, data: { id: data.id } };
}

export async function modifierTache(id: string, input: Partial<TacheInput>): Promise<R> {
  const { moi, db: d } = await contexteCockpit();
  const acces = await chargerTache(d, id, moi.id);
  if (!acces || !peut(acces.niveau, 'modification')) return { ok: false, erreur: 'Vous n’avez pas le droit de modifier cette tâche.' };
  const p = tacheSchema.partial().safeParse(input);
  if (!p.success) return { ok: false, erreur: premiereErreur(p.error) };
  const v = p.data;
  const patch: Record<string, unknown> = {};
  for (const [k, val] of Object.entries(v)) {
    if (val === undefined) continue;
    patch[k] = val === '' ? null : val;
  }
  // Réaffecter : réservé au propriétaire.
  if ('assignee_id' in patch) {
    if (!peutAdministrer(acces.niveau)) delete patch.assignee_id;
    else if (patch.assignee_id && patch.assignee_id !== moi.id && !(await verifierMembre(d, patch.assignee_id as string))) {
      return { ok: false, erreur: 'Cette personne ne fait pas partie de l’équipe.' };
    } else if (patch.assignee_id === moi.id) patch.assignee_id = null;
  }
  if ('rappel_at' in patch) patch.rappel_envoye_at = null;
  if (patch.statut === 'terminee') patch.terminee_at = new Date().toISOString();
  else if (patch.statut && patch.statut !== 'terminee') patch.terminee_at = null;
  patch.updated_at = new Date().toISOString();
  const { error } = await d.from('cockpit_taches').update(patch).eq('id', id);
  if (error) return { ok: false, erreur: 'La modification n’a pas été enregistrée.' };
  await journaliser(d, { objet_type: 'tache', objet_id: id, acteur_id: moi.id, action: 'modification', details: { champs: Object.keys(patch).filter((k) => k !== 'updated_at') } });
  if (patch.assignee_id && patch.assignee_id !== acces.tache.assignee_id) {
    await confier(d, { id, titre: (patch.titre as string) ?? acces.tache.titre }, patch.assignee_id as string, moi.nom);
    await journaliser(d, { objet_type: 'tache', objet_id: id, acteur_id: moi.id, action: 'affectation', details: { a: patch.assignee_id }, audit: true });
  }
  if (patch.statut === 'terminee') await occurrenceSuivante(d, { ...acces.tache, ...patch } as TacheLigne);
  rafraichir();
  return { ok: true };
}

/** Tâche récurrente terminée : la prochaine occurrence est créée (une seule fois). */
async function occurrenceSuivante(d: Db, t: TacheLigne) {
  if (!t.echeance || t.recurrence === 'aucune') return;
  const suivante = prochaineEcheance(t.echeance, t.recurrence as Recurrence);
  if (!suivante) return;
  const { count } = await d.from('cockpit_taches').select('id', { count: 'exact', head: true })
    .eq('owner_id', t.owner_id).eq('titre', t.titre).eq('echeance', suivante).is('archivee_at', null);
  if ((count ?? 0) > 0) return;
  await d.from('cockpit_taches').insert({
    owner_id: t.owner_id, titre: t.titre, description: t.description, priorite: t.priorite, categorie: t.categorie,
    echeance: suivante, heure: t.heure, recurrence: t.recurrence, notes: t.notes, lien_type: t.lien_type, lien_id: t.lien_id,
    lien_label: t.lien_label, assignee_id: t.assignee_id, ordre: Date.now() / 1000,
  });
}

export async function changerStatutTache(id: string, statut: (typeof STATUTS_TACHE)[number]): Promise<R> {
  if (!(STATUTS_TACHE as readonly string[]).includes(statut)) return { ok: false, erreur: 'Statut inconnu.' };
  const { moi, db: d } = await contexteCockpit();
  const acces = await chargerTache(d, id, moi.id);
  if (!acces || !peut(acces.niveau, 'modification')) return { ok: false, erreur: 'Vous n’avez pas le droit de modifier cette tâche.' };
  const maintenant = new Date().toISOString();
  const { error } = await d.from('cockpit_taches').update({
    statut, terminee_at: statut === 'terminee' ? maintenant : null, updated_at: maintenant,
  }).eq('id', id);
  if (error) return { ok: false, erreur: 'Le statut n’a pas été enregistré.' };
  await journaliser(d, { objet_type: 'tache', objet_id: id, acteur_id: moi.id, action: 'statut', details: { de: acces.tache.statut, vers: statut } });
  if (statut === 'terminee') await occurrenceSuivante(d, acces.tache);
  // Le propriétaire est prévenu quand la personne affectée termine sa tâche.
  if (statut === 'terminee' && acces.tache.owner_id !== moi.id) {
    await notifier(d, {
      user_id: acces.tache.owner_id, genre: 'affectation', titre: `${moi.nom} a terminé une tâche`,
      corps: acces.tache.titre, lien: `/admin/cockpit/taches?t=${id}`, group_key: `terminee:${id}`,
    });
  }
  rafraichir();
  return { ok: true };
}

/** Cocher / décocher depuis une liste. */
export async function basculerTerminee(id: string): Promise<R> {
  const { moi, db: d } = await contexteCockpit();
  const acces = await chargerTache(d, id, moi.id);
  if (!acces) return { ok: false, erreur: 'Tâche introuvable.' };
  return changerStatutTache(id, acces.tache.statut === 'terminee' ? 'a_faire' : 'terminee');
}

/** Reporter à demain (ou à une date) : statut « Reportée ». */
export async function reporterTache(id: string, nouvelleDate?: string): Promise<R> {
  const { moi, db: d } = await contexteCockpit();
  const acces = await chargerTache(d, id, moi.id);
  if (!acces || !peut(acces.niveau, 'modification')) return { ok: false, erreur: 'Vous n’avez pas le droit de modifier cette tâche.' };
  const aujourdHui = instantParis().date;
  const cible = nouvelleDate && /^\d{4}-\d{2}-\d{2}$/.test(nouvelleDate)
    ? nouvelleDate
    : ajouterJoursIso(acces.tache.echeance && acces.tache.echeance > aujourdHui ? acces.tache.echeance : aujourdHui, 1);
  const { error } = await d.from('cockpit_taches').update({
    echeance: cible,
    statut: estOuverte(acces.tache.statut) ? 'reportee' : acces.tache.statut,
    priorite_jour: null, rang_priorite: null,
    updated_at: new Date().toISOString(),
  }).eq('id', id);
  if (error) return { ok: false, erreur: 'Le report n’a pas été enregistré.' };
  await journaliser(d, { objet_type: 'tache', objet_id: id, acteur_id: moi.id, action: 'report', details: { de: acces.tache.echeance, vers: cible } });
  rafraichir();
  return { ok: true };
}

/** Glisser-déposer d'un jour à l'autre (agenda). */
export async function deplacerTache(id: string, nouvelleDate: string): Promise<R> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(nouvelleDate)) return { ok: false, erreur: 'Date invalide.' };
  const { moi, db: d } = await contexteCockpit();
  const acces = await chargerTache(d, id, moi.id);
  if (!acces || !peut(acces.niveau, 'modification')) return { ok: false, erreur: 'Vous n’avez pas le droit de déplacer cette tâche.' };
  if (acces.tache.echeance === nouvelleDate) return { ok: true };
  await d.from('cockpit_taches').update({ echeance: nouvelleDate, updated_at: new Date().toISOString() }).eq('id', id);
  await journaliser(d, { objet_type: 'tache', objet_id: id, acteur_id: moi.id, action: 'deplacement', details: { de: acces.tache.echeance, vers: nouvelleDate } });
  rafraichir();
  return { ok: true };
}

/**
 * « Mes 3 priorités du jour », réordonnables : la liste reçue (≤ 3 ids)
 * devient l'ordre du jour ; les autres tâches épinglées aujourd'hui sont
 * désépinglées.
 */
export async function definirPriorites(ids: string[]): Promise<R> {
  const { moi, db: d } = await contexteCockpit();
  const aujourdHui = instantParis().date;
  const liste = [...new Set(ids)].slice(0, 3);
  for (const id of liste) {
    const acces = await chargerTache(d, id, moi.id);
    if (!acces || !peut(acces.niveau, 'modification')) return { ok: false, erreur: 'Une des tâches n’est pas modifiable.' };
  }
  await d.from('cockpit_taches').update({ priorite_jour: null, rang_priorite: null })
    .eq('priorite_jour', aujourdHui).or(`owner_id.eq.${moi.id},assignee_id.eq.${moi.id}`).not('id', 'in', `(${liste.length ? liste.join(',') : '00000000-0000-0000-0000-000000000000'})`);
  for (const [i, id] of liste.entries()) {
    await d.from('cockpit_taches').update({ priorite_jour: aujourdHui, rang_priorite: i + 1 }).eq('id', id);
  }
  rafraichir();
  return { ok: true };
}

export async function archiverTache(id: string): Promise<R> {
  const { moi, db: d } = await contexteCockpit();
  const acces = await chargerTache(d, id, moi.id);
  if (!acces || !peutAdministrer(acces.niveau)) return { ok: false, erreur: 'Seul le propriétaire peut archiver cette tâche.' };
  await d.from('cockpit_taches').update({ archivee_at: acces.tache.archivee_at ? null : new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', id);
  await journaliser(d, { objet_type: 'tache', objet_id: id, acteur_id: moi.id, action: acces.tache.archivee_at ? 'desarchivage' : 'archivage' });
  rafraichir();
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Partage (§4) — C02                                                  */
/* ------------------------------------------------------------------ */

export async function partagerTache(id: string, userId: string, droit: (typeof DROITS)[number]): Promise<R> {
  if (!(DROITS as readonly string[]).includes(droit)) return { ok: false, erreur: 'Droit inconnu.' };
  const { moi, db: d } = await contexteCockpit();
  const acces = await chargerTache(d, id, moi.id);
  if (!acces || !peutAdministrer(acces.niveau)) return { ok: false, erreur: 'Seul le propriétaire peut partager cette tâche.' };
  if (userId === moi.id) return { ok: false, erreur: 'Vous êtes déjà propriétaire de la tâche.' };
  if (!(await verifierMembre(d, userId))) return { ok: false, erreur: 'On ne partage qu’avec un membre actif de l’équipe.' };
  // Un partage actif par personne : on remplace le droit.
  await d.from('cockpit_partages').update({ revoque_at: new Date().toISOString() })
    .eq('objet_type', 'tache').eq('objet_id', id).eq('user_id', userId).is('revoque_at', null);
  const { error } = await d.from('cockpit_partages').insert({ objet_type: 'tache', objet_id: id, owner_id: moi.id, user_id: userId, droit });
  if (error) return { ok: false, erreur: 'Le partage n’a pas été enregistré.' };
  await journaliser(d, { objet_type: 'tache', objet_id: id, acteur_id: moi.id, action: 'partage', details: { avec: userId, droit }, audit: true });
  await notifier(d, {
    user_id: userId, genre: 'partage', titre: `${moi.nom} a partagé une tâche avec vous`,
    corps: acces.tache.titre, lien: `/admin/cockpit/taches?t=${id}`, group_key: `partage:${id}`,
  });
  rafraichir();
  return { ok: true };
}

export async function revoquerPartage(id: string, userId: string): Promise<R> {
  const { moi, db: d } = await contexteCockpit();
  const acces = await chargerTache(d, id, moi.id);
  if (!acces || !peutAdministrer(acces.niveau)) return { ok: false, erreur: 'Seul le propriétaire peut révoquer un partage.' };
  await d.from('cockpit_partages').update({ revoque_at: new Date().toISOString() })
    .eq('objet_type', 'tache').eq('objet_id', id).eq('user_id', userId).is('revoque_at', null);
  await journaliser(d, { objet_type: 'tache', objet_id: id, acteur_id: moi.id, action: 'revocation', details: { avec: userId }, audit: true });
  rafraichir();
  return { ok: true };
}

export async function commenterTache(id: string, texte: string): Promise<R> {
  const { moi, db: d } = await contexteCockpit();
  const t = texte.trim();
  if (!t) return { ok: false, erreur: 'Le commentaire est vide.' };
  const acces = await chargerTache(d, id, moi.id);
  if (!acces || !peut(acces.niveau, 'commentaire')) return { ok: false, erreur: 'Vous n’avez pas le droit de commenter cette tâche.' };
  await d.from('cockpit_commentaires').insert({ tache_id: id, auteur_id: moi.id, texte: t.slice(0, 4000) });
  const autres = [acces.tache.owner_id, acces.tache.assignee_id].filter((x): x is string => !!x && x !== moi.id);
  for (const u of autres) {
    await notifier(d, { user_id: u, genre: 'message', titre: `${moi.nom} a commenté une tâche`, corps: acces.tache.titre, lien: `/admin/cockpit/taches?t=${id}`, group_key: `commentaire:${id}` });
  }
  rafraichir();
  return { ok: true };
}

export type DetailTache = {
  tache: TacheLigne;
  niveau: string;
  proprietaire: string;
  assignee: string | null;
  partages: { user_id: string; nom: string; droit: string }[];
  commentaires: { id: string; auteur: string; texte: string; created_at: string }[];
  historique: { action: string; acteur: string; details: Record<string, unknown>; created_at: string }[];
  conversations: { id: string; sujet: string; interlocuteur: string }[];
};

/** Fiche complète d'une tâche (historique retrouvable, §3). */
export async function detailTache(id: string): Promise<R<DetailTache>> {
  const { moi, db: d } = await contexteCockpit();
  const acces = await chargerTache(d, id, moi.id);
  if (!acces) return { ok: false, erreur: 'Tâche introuvable.' };
  const peutVoirPartages = peutAdministrer(acces.niveau);
  const [partages, commentaires, historique, convs] = await Promise.all([
    peutVoirPartages
      ? d.from('cockpit_partages').select('user_id, droit').eq('objet_type', 'tache').eq('objet_id', id).is('revoque_at', null)
      : Promise.resolve({ data: [] }),
    d.from('cockpit_commentaires').select('id, auteur_id, texte, created_at').eq('tache_id', id).order('created_at'),
    d.from('cockpit_journal').select('action, acteur_id, details, created_at').eq('objet_type', 'tache').eq('objet_id', id).order('created_at', { ascending: false }).limit(100),
    acces.niveau === 'proprietaire'
      ? d.from('cockpit_conversations').select('id, sujet, interlocuteur_label').eq('tache_id', id).eq('owner_id', moi.id)
      : Promise.resolve({ data: [] }),
  ]);
  const profils = await profilsParIds(d, [
    acces.tache.owner_id, acces.tache.assignee_id,
    ...((partages.data ?? []) as { user_id: string }[]).map((p) => p.user_id),
    ...((commentaires.data ?? []) as { auteur_id: string }[]).map((c) => c.auteur_id),
    ...((historique.data ?? []) as { acteur_id: string | null }[]).map((h) => h.acteur_id),
  ]);
  const nom = (uid: string | null) => (uid ? nomComplet(profils.get(uid)) || 'Membre de l’équipe' : 'Système');
  return {
    ok: true,
    data: {
      tache: acces.tache,
      niveau: acces.niveau,
      proprietaire: nom(acces.tache.owner_id),
      assignee: acces.tache.assignee_id ? nom(acces.tache.assignee_id) : null,
      partages: ((partages.data ?? []) as { user_id: string; droit: string }[]).map((p) => ({ ...p, nom: nom(p.user_id) })),
      commentaires: ((commentaires.data ?? []) as { id: string; auteur_id: string; texte: string; created_at: string }[]).map((c) => ({ id: c.id, auteur: nom(c.auteur_id), texte: c.texte, created_at: c.created_at })),
      historique: ((historique.data ?? []) as { action: string; acteur_id: string | null; details: Record<string, unknown>; created_at: string }[]).map((h) => ({
        action: h.action === 'statut' && typeof h.details?.vers === 'string' ? `Statut : ${STATUT_TACHE_LABEL[h.details.vers as keyof typeof STATUT_TACHE_LABEL] ?? h.details.vers}` : h.action,
        acteur: nom(h.acteur_id), details: h.details, created_at: h.created_at,
      })),
      conversations: ((convs.data ?? []) as { id: string; sujet: string; interlocuteur_label: string }[]).map((c) => ({ id: c.id, sujet: c.sujet, interlocuteur: c.interlocuteur_label })),
    },
  };
}

/** Relit une tâche (après une action client) — mêmes droits. */
export async function lireTache(id: string): Promise<R<TacheLigne>> {
  const { moi, db: d } = await contexteCockpit();
  const { data } = await d.from('cockpit_taches').select(COLONNES_TACHE).eq('id', id).maybeSingle();
  if (!data) return { ok: false, erreur: 'Tâche introuvable.' };
  const acces = await chargerTache(d, id, moi.id);
  return acces ? { ok: true, data: acces.tache } : { ok: false, erreur: 'Tâche introuvable.' };
}
