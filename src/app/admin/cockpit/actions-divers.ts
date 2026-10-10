'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { contexteCockpit, FACULTE, journaliser, type Db } from '@/lib/cockpit/server/base';
import { tachesVisibles } from '@/lib/cockpit/server/taches';
import { conversationsDe } from '@/lib/cockpit/server/messagerie';
import { GENRES_RDV, nomComplet } from '@/lib/cockpit/regles';

/**
 * Rendez-vous, objectifs, notes personnelles, notifications, réglages et
 * recherche du cockpit. La recherche ne renvoie jamais une tâche privée
 * d'autrui (C18) : elle part des seules données visibles par l'utilisateur.
 */

type R<T = undefined> = { ok: true; data?: T } | { ok: false; erreur: string };
const rafraichir = () => revalidatePath('/admin/cockpit', 'layout');
const vide = z.literal('').transform(() => null);

/* ------------------------------------------------------------------ */
/* Rendez-vous                                                         */
/* ------------------------------------------------------------------ */

const rdvSchema = z.object({
  titre: z.string().trim().min(1, 'Donnez un titre au rendez-vous.').max(300),
  genre: z.enum(GENRES_RDV).default('rendez_vous'),
  debut: z.string().datetime({ offset: true }),
  fin: z.string().datetime({ offset: true }).nullish().or(vide),
  personne_type: z.enum(['enseignant', 'eleve', 'client', 'externe']).nullish().or(vide),
  personne_id: z.string().uuid().nullish().or(vide),
  personne_label: z.string().trim().max(200).nullish(),
  objet: z.string().trim().max(2000).nullish(),
  lieu: z.string().trim().max(300).nullish(),
  lien_visio: z.string().trim().max(500).regex(/^https:\/\/\S+$/, 'Le lien de visio doit commencer par https://').nullish().or(vide),
  coordonnees: z.string().trim().max(500).nullish(),
  notes: z.string().max(10000).nullish(),
  documents: z.array(z.object({ label: z.string().trim().min(1).max(200), url: z.string().trim().url().max(1000) })).max(20).default([]),
}).refine((v) => !v.fin || v.fin >= v.debut, { message: 'La fin doit être après le début.' });
export type RdvInput = z.input<typeof rdvSchema>;

export async function enregistrerRdv(input: RdvInput, id?: string): Promise<R<{ id: string }>> {
  const { moi, db: d } = await contexteCockpit();
  const p = rdvSchema.safeParse(input);
  if (!p.success) return { ok: false, erreur: p.error.issues[0]?.message ?? 'Saisie invalide.' };
  const v = p.data;
  const champs = {
    titre: v.titre, genre: v.genre, debut: v.debut, fin: v.fin ?? null,
    personne_type: v.personne_type ?? null, personne_id: v.personne_id ?? null, personne_label: v.personne_label || null,
    objet: v.objet || null, lieu: v.lieu || null, lien_visio: v.lien_visio ?? null, coordonnees: v.coordonnees || null,
    notes: v.notes || null, documents: v.documents, updated_at: new Date().toISOString(),
  };
  if (id) {
    const { data } = await d.from('cockpit_rdv').update(champs).eq('id', id).eq('owner_id', moi.id).select('id').maybeSingle();
    if (!data) return { ok: false, erreur: 'Rendez-vous introuvable.' };
    rafraichir();
    return { ok: true, data: { id } };
  }
  const { data, error } = await d.from('cockpit_rdv').insert({ ...champs, owner_id: moi.id }).select('id').single();
  if (error || !data) return { ok: false, erreur: 'Le rendez-vous n’a pas pu être enregistré.' };
  rafraichir();
  return { ok: true, data: { id: data.id } };
}

export async function supprimerRdv(id: string): Promise<R> {
  const { moi, db: d } = await contexteCockpit();
  await d.from('cockpit_rdv').delete().eq('id', id).eq('owner_id', moi.id);
  rafraichir();
  return { ok: true };
}

/** Tâche de suivi après un rendez-vous (prérempli : personne, objet, lendemain). */
export async function tacheSuiviRdv(id: string): Promise<R<{ tacheId: string }>> {
  const { moi, db: d } = await contexteCockpit();
  const { data: r } = await d.from('cockpit_rdv').select('*').eq('id', id).eq('owner_id', moi.id).maybeSingle();
  if (!r) return { ok: false, erreur: 'Rendez-vous introuvable.' };
  if (r.tache_suivi_id) return { ok: true, data: { tacheId: r.tache_suivi_id } };
  const jour = new Date(r.debut).toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' });
  const [y, m, dd] = jour.split('-').map(Number);
  const lendemain = new Date(Date.UTC(y, m - 1, dd + 1)).toISOString().slice(0, 10);
  const { data, error } = await d.from('cockpit_taches').insert({
    owner_id: moi.id,
    titre: `Suivi : ${r.titre}`.slice(0, 300),
    description: [r.objet, r.notes].filter(Boolean).join('\n\n') || null,
    categorie: r.personne_type === 'enseignant' ? 'enseignants' : 'administration',
    echeance: lendemain,
    lien_type: r.personne_type === 'enseignant' ? 'enseignant' : r.personne_type === 'eleve' ? 'eleve' : 'rdv',
    lien_id: r.personne_id ?? r.id,
    lien_label: r.personne_label ?? r.titre,
    ordre: Date.now() / 1000,
  }).select('id').single();
  if (error || !data) return { ok: false, erreur: 'La tâche n’a pas pu être créée.' };
  await d.from('cockpit_rdv').update({ tache_suivi_id: data.id }).eq('id', id);
  rafraichir();
  return { ok: true, data: { tacheId: data.id } };
}

/* ------------------------------------------------------------------ */
/* Objectifs (jour / semaine / mois) et notes personnelles              */
/* ------------------------------------------------------------------ */

export async function enregistrerObjectif(periode: 'jour' | 'semaine' | 'mois', debut: string, texte: string): Promise<R> {
  if (!['jour', 'semaine', 'mois'].includes(periode) || !/^\d{4}-\d{2}-\d{2}$/.test(debut)) return { ok: false, erreur: 'Période invalide.' };
  const { moi, db: d } = await contexteCockpit();
  const t = texte.trim();
  if (!t) {
    await d.from('cockpit_objectifs').delete().eq('owner_id', moi.id).eq('periode', periode).eq('debut', debut);
  } else {
    await d.from('cockpit_objectifs').upsert(
      { owner_id: moi.id, periode, debut, texte: t.slice(0, 500), updated_at: new Date().toISOString() },
      { onConflict: 'owner_id,periode,debut' },
    );
  }
  rafraichir();
  return { ok: true };
}

export async function basculerObjectif(periode: 'jour' | 'semaine' | 'mois', debut: string): Promise<R> {
  const { moi, db: d } = await contexteCockpit();
  const { data } = await d.from('cockpit_objectifs').select('id, atteint').eq('owner_id', moi.id).eq('periode', periode).eq('debut', debut).maybeSingle();
  if (!data) return { ok: false, erreur: 'Objectif introuvable.' };
  await d.from('cockpit_objectifs').update({ atteint: !data.atteint, updated_at: new Date().toISOString() }).eq('id', data.id);
  rafraichir();
  return { ok: true };
}

export async function enregistrerNote(contenu: string, id?: string): Promise<R<{ id: string }>> {
  const { moi, db: d } = await contexteCockpit();
  const c = contenu.trim();
  if (!c) return { ok: false, erreur: 'La note est vide.' };
  if (id) {
    await d.from('cockpit_notes').update({ contenu: c.slice(0, 10000), updated_at: new Date().toISOString() }).eq('id', id).eq('owner_id', moi.id);
    rafraichir();
    return { ok: true, data: { id } };
  }
  const { data, error } = await d.from('cockpit_notes').insert({ owner_id: moi.id, contenu: c.slice(0, 10000) }).select('id').single();
  if (error || !data) return { ok: false, erreur: 'La note n’a pas été enregistrée.' };
  rafraichir();
  return { ok: true, data: { id: data.id } };
}

export async function supprimerNote(id: string): Promise<R> {
  const { moi, db: d } = await contexteCockpit();
  await d.from('cockpit_notes').delete().eq('id', id).eq('owner_id', moi.id);
  rafraichir();
  return { ok: true };
}

export async function epinglerNote(id: string, epinglee: boolean): Promise<R> {
  const { moi, db: d } = await contexteCockpit();
  await d.from('cockpit_notes').update({ epinglee }).eq('id', id).eq('owner_id', moi.id);
  rafraichir();
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Notifications internes (cloche) et réglages                          */
/* ------------------------------------------------------------------ */

export type NotificationCockpit = {
  id: string; genre: string; titre: string; corps: string | null; lien: string | null; nombre: number; lu_at: string | null; updated_at: string;
};

export async function lireNotifications(): Promise<{ liste: NotificationCockpit[]; nonLues: number }> {
  const { moi, db: d } = await contexteCockpit();
  const [{ data }, { count }] = await Promise.all([
    d.from('cockpit_notifications').select('id, genre, titre, corps, lien, nombre, lu_at, updated_at').eq('user_id', moi.id).order('updated_at', { ascending: false }).limit(40),
    d.from('cockpit_notifications').select('id', { count: 'exact', head: true }).eq('user_id', moi.id).is('lu_at', null),
  ]);
  return { liste: (data ?? []) as NotificationCockpit[], nonLues: count ?? 0 };
}

export async function marquerNotificationsLues(ids?: string[]): Promise<R> {
  const { moi, db: d } = await contexteCockpit();
  let q = d.from('cockpit_notifications').update({ lu_at: new Date().toISOString() }).eq('user_id', moi.id).is('lu_at', null);
  if (ids && ids.length > 0) q = q.in('id', ids.slice(0, 100));
  await q;
  return { ok: true };
}

export async function enregistrerReglages(input: { email_rappels: boolean; email_affectations: boolean; push: boolean; signature: string | null }): Promise<R> {
  const { moi, db: d } = await contexteCockpit();
  await d.from('cockpit_reglages').upsert({
    user_id: moi.id,
    email_rappels: !!input.email_rappels,
    email_affectations: !!input.email_affectations,
    push: !!input.push,
    signature: input.signature?.trim().slice(0, 500) || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  await journaliser(d, { objet_type: 'reglages', objet_id: moi.id, acteur_id: moi.id, action: 'modification', audit: true });
  rafraichir();
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Recherche                                                           */
/* ------------------------------------------------------------------ */

export type Personne = { id: string; nom: string; email: string | null; role: string };

/** Recherche d'un élève / client ou d'un enseignant dans la base Major ECN. */
export async function rechercherPersonnes(q: string, type: 'eleve' | 'enseignant' | 'equipe'): Promise<Personne[]> {
  const { db: d } = await contexteCockpit();
  return chercherProfils(d, q, type);
}

async function chercherProfils(d: Db, q: string, type: 'eleve' | 'enseignant' | 'equipe'): Promise<Personne[]> {
  const terme = q.trim().replace(/[%,()*]/g, ' ').trim();
  let req = d.from('profiles').select('id, first_name, last_name, email, role, is_active').eq('faculte_id', FACULTE);
  req = type === 'eleve' ? req.eq('role', 'student') : type === 'enseignant' ? req.eq('role', 'professor') : req.in('role', ['admin', 'professor']);
  if (terme) {
    const mots = terme.split(/\s+/).slice(0, 3);
    for (const m of mots) req = req.or(`first_name.ilike.%${m}%,last_name.ilike.%${m}%,email.ilike.%${m}%`);
  }
  const { data } = await req.order('last_name').limit(12);
  return ((data ?? []) as { id: string; first_name: string | null; last_name: string | null; email: string | null; role: string; is_active: boolean | null }[])
    .filter((p) => type === 'eleve' || p.is_active !== false)
    .map((p) => ({ id: p.id, nom: nomComplet(p) || p.email || 'Sans nom', email: p.email, role: p.role }));
}

export type ResultatRecherche = { type: 'tache' | 'conversation' | 'candidat' | 'enseignant' | 'reclamation' | 'demande'; id: string; titre: string; sousTitre: string; href: string };

export async function rechercheGlobale(q: string): Promise<ResultatRecherche[]> {
  const { moi, db: d } = await contexteCockpit();
  const terme = q.trim().toLowerCase();
  if (terme.length < 2) return [];
  const contient = (s: string | null | undefined) => !!s && s.toLowerCase().includes(terme);
  const [taches, convs, candidats, enseignants] = await Promise.all([
    tachesVisibles(d, moi.id),
    conversationsDe(d, moi),
    moi.estAdmin ? chercherProfils(d, terme, 'eleve') : Promise.resolve([]),
    chercherProfils(d, terme, 'enseignant'),
  ]);
  const sortie: ResultatRecherche[] = [];
  for (const t of taches.filter((t) => contient(t.titre) || contient(t.description) || contient(t.lien_label)).slice(0, 6)) {
    sortie.push({ type: 'tache', id: t.id, titre: t.titre, sousTitre: t.partagee ? 'Tâche partagée' : 'Ma tâche', href: `/admin/cockpit/taches?t=${t.id}` });
  }
  for (const c of convs.filter((c) => contient(c.sujet) || contient(c.interlocuteur_label)).slice(0, 5)) {
    sortie.push({ type: 'conversation', id: c.id, titre: c.sujet, sousTitre: c.interlocuteur_label, href: `/admin/cockpit/messagerie/${c.id}` });
  }
  for (const p of candidats.slice(0, 5)) sortie.push({ type: 'candidat', id: p.id, titre: p.nom, sousTitre: 'Candidat · fiche de suivi', href: `/admin/suivi/candidats/${p.id}` });
  for (const p of enseignants.slice(0, 5)) sortie.push({ type: 'enseignant', id: p.id, titre: p.nom, sousTitre: 'Enseignant', href: `/admin/cockpit/messagerie?ecrire=${p.id}` });
  const filtre = terme.replace(/[%,()*]/g, ' ');
  const [recl, dem] = await Promise.all([
    d.from('cockpit_reclamations').select('id, sujet, candidat_label, created_by, assignee_id').eq('faculte_id', FACULTE)
      .or(`sujet.ilike.%${filtre}%,candidat_label.ilike.%${filtre}%`).limit(20),
    d.from('cockpit_demandes').select('id, numero, motif, client_label, created_by, assignee_id').eq('faculte_id', FACULTE)
      .or(`motif.ilike.%${filtre}%,client_label.ilike.%${filtre}%`).limit(20),
  ]);
  for (const r of ((recl.data ?? []) as { id: string; sujet: string; candidat_label: string; created_by: string | null; assignee_id: string | null }[])
    .filter((r) => moi.estAdmin || r.created_by === moi.id || r.assignee_id === moi.id).slice(0, 4)) {
    sortie.push({ type: 'reclamation', id: r.id, titre: r.sujet, sousTitre: `Réclamation · ${r.candidat_label}`, href: `/admin/cockpit/reclamations?r=${r.id}` });
  }
  for (const x of ((dem.data ?? []) as { id: string; numero: number; motif: string; client_label: string; created_by: string; assignee_id: string | null }[])
    .filter((x) => moi.estAdmin || x.created_by === moi.id || x.assignee_id === moi.id).slice(0, 4)) {
    sortie.push({ type: 'demande', id: x.id, titre: x.motif, sousTitre: `Demande n° ${x.numero} · ${x.client_label}`, href: `/admin/cockpit/demandes?d=${x.id}` });
  }
  return sortie;
}
