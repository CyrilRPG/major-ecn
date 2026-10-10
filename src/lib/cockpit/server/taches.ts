import 'server-only';
import { niveauAccesTache, type NiveauAcces, type PartageAcces } from '../regles';
import type { Db } from './base';

export type TacheLigne = {
  id: string;
  owner_id: string;
  titre: string;
  description: string | null;
  priorite: string;
  statut: string;
  categorie: string;
  echeance: string | null;
  heure: string | null;
  rappel_at: string | null;
  recurrence: string;
  notes: string | null;
  lien_type: string | null;
  lien_id: string | null;
  lien_label: string | null;
  assignee_id: string | null;
  priorite_jour: string | null;
  rang_priorite: number | null;
  ordre: number;
  terminee_at: string | null;
  archivee_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TacheVisible = TacheLigne & { niveau: NiveauAcces; partagee: boolean };

export const COLONNES_TACHE =
  'id, owner_id, titre, description, priorite, statut, categorie, echeance, heure, rappel_at, recurrence, notes, lien_type, lien_id, lien_label, assignee_id, priorite_jour, rang_priorite, ordre, terminee_at, archivee_at, created_at, updated_at';

/**
 * Toutes les tâches qu'un utilisateur a le droit de voir — et elles seules
 * (C01, C18) : les siennes, celles qui lui sont affectées, celles qu'on lui a
 * explicitement partagées (partage non révoqué). Le rôle administrateur
 * n'élargit rien.
 */
export async function tachesVisibles(d: Db, userId: string, opts: { archivees?: boolean } = {}): Promise<TacheVisible[]> {
  const { data: partages } = await d
    .from('cockpit_partages')
    .select('objet_id, user_id, droit, revoque_at')
    .eq('objet_type', 'tache')
    .eq('user_id', userId)
    .is('revoque_at', null);
  const idsPartages = [...new Set(((partages ?? []) as { objet_id: string }[]).map((p) => p.objet_id))];

  const filtreArchive = (q: Db) => (opts.archivees ? q.not('archivee_at', 'is', null) : q.is('archivee_at', null));
  const requetes = [
    filtreArchive(d.from('cockpit_taches').select(COLONNES_TACHE).eq('owner_id', userId)).limit(2000),
    filtreArchive(d.from('cockpit_taches').select(COLONNES_TACHE).eq('assignee_id', userId).neq('owner_id', userId)).limit(1000),
  ];
  for (let i = 0; i < idsPartages.length; i += 200) {
    requetes.push(filtreArchive(d.from('cockpit_taches').select(COLONNES_TACHE).in('id', idsPartages.slice(i, i + 200))));
  }
  const resultats = await Promise.all(requetes);
  const parId = new Map<string, TacheLigne>();
  for (const r of resultats) for (const t of (r.data ?? []) as TacheLigne[]) parId.set(t.id, t);

  const partagesParTache = new Map<string, PartageAcces[]>();
  for (const p of (partages ?? []) as (PartageAcces & { objet_id: string })[]) {
    const l = partagesParTache.get(p.objet_id) ?? [];
    l.push(p);
    partagesParTache.set(p.objet_id, l);
  }

  const sortie: TacheVisible[] = [];
  for (const t of parId.values()) {
    const niveau = niveauAccesTache(t, partagesParTache.get(t.id) ?? [], userId);
    if (!niveau) continue; // garde de sûreté : jamais une tâche sans droit
    sortie.push({ ...t, niveau, partagee: niveau !== 'proprietaire' });
  }
  return sortie;
}

/** Une tâche + le niveau d'accès de l'utilisateur, ou null s'il n'a aucun droit. */
export async function chargerTache(d: Db, id: string, userId: string): Promise<{ tache: TacheLigne; niveau: NiveauAcces } | null> {
  const { data: tache } = await d.from('cockpit_taches').select(COLONNES_TACHE).eq('id', id).maybeSingle();
  if (!tache) return null;
  const { data: partages } = await d
    .from('cockpit_partages')
    .select('user_id, droit, revoque_at')
    .eq('objet_type', 'tache')
    .eq('objet_id', id)
    .is('revoque_at', null);
  const niveau = niveauAccesTache(tache as TacheLigne, (partages ?? []) as PartageAcces[], userId);
  return niveau ? { tache: tache as TacheLigne, niveau } : null;
}
