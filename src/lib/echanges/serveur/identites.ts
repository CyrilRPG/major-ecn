import 'server-only';
import { libelleEnseignant, nomEleve, type ModeAffichageEleve } from '../regles';
import type { AuteurDTO, EnseignantTagDTO, TypeAuteur } from '../types';
import { cleAuteur, db, parTranches } from './base';

/**
 * Identités affichées dans les Échanges (CDC §14-16, §113-117).
 *
 * Un enseignant n'apparaît QUE sous son identité publique (prénom public +
 * qualité), saisie par Major ECN dans `echanges_identites` : son nom de
 * famille, son e-mail et l'identifiant de son compte ne sont jamais lus pour
 * construire ce qui part vers le navigateur. Un enseignant sans identité
 * publique s'affiche « Enseignant Major ECN » et ne peut pas être tagué tant
 * que l'administration ne l'a pas complétée.
 */

export type Identite = {
  user_id: string;
  prenom_public: string;
  qualite: string;
  specialite: string | null;
  avatar_mode: 'initiale' | 'majorecn' | 'neutre' | 'photo';
  avatar_chemin: string | null;
};

export async function identitesDe(userIds: string[]): Promise<Map<string, Identite>> {
  const lignes = await parTranches([...new Set(userIds)], 200, async (lot) => {
    const { data, error } = await db().from('echanges_identites')
      .select('user_id, prenom_public, qualite, specialite, avatar_mode, avatar_chemin').in('user_id', lot);
    if (error) throw new Error(error.message);
    return (data ?? []) as Identite[];
  });
  return new Map(lignes.map((i) => [i.user_id, i]));
}

type ProfilPublic = { id: string; first_name: string | null; last_name: string | null; pseudo: string | null; avatar_seed: string | null };

async function profilsDe(ids: string[]): Promise<Map<string, ProfilPublic>> {
  const lignes = await parTranches([...new Set(ids)], 200, async (lot) => {
    const { data, error } = await db().from('profiles').select('id, first_name, last_name, pseudo, avatar_seed').in('id', lot);
    if (error) throw new Error(error.message);
    return (data ?? []) as ProfilPublic[];
  });
  return new Map(lignes.map((p) => [p.id, p]));
}

/** Qualité affichée d'un enseignant dans un groupe : celle du groupe, sinon son identité publique. */
export type QualiteGroupe = Map<string, string | null>;

export async function qualitesDuGroupe(groupeId: string): Promise<QualiteGroupe> {
  const { data } = await db().from('echanges_enseignants').select('user_id, qualite').eq('groupe_id', groupeId);
  return new Map(((data ?? []) as { user_id: string; qualite: string | null }[]).map((r) => [r.user_id, r.qualite]));
}

function initiale(nom: string): string {
  return (nom.trim().charAt(0) || '?').toUpperCase();
}

/**
 * Résout l'affichage des auteurs d'une page de messages. Les candidats suivent
 * le mode d'affichage choisi par Major ECN (prénom + initiale par défaut).
 */
export async function resoudreAuteurs(args: {
  topic: string;
  groupeId: string;
  acteurId: string;
  auteurs: { id: string | null; type: TypeAuteur }[];
  mode: ModeAffichageEleve;
}): Promise<Map<string, AuteurDTO>> {
  const out = new Map<string, AuteurDTO>();
  const candidats = args.auteurs.filter((x) => x.type === 'candidat' && x.id).map((x) => x.id as string);
  const equipe = args.auteurs.filter((x) => (x.type === 'enseignant' || x.type === 'equipe') && x.id).map((x) => x.id as string);
  const [profils, identites, qualites] = await Promise.all([
    candidats.length ? profilsDe(candidats) : Promise.resolve(new Map<string, ProfilPublic>()),
    equipe.length ? identitesDe(equipe) : Promise.resolve(new Map<string, Identite>()),
    equipe.length ? qualitesDuGroupe(args.groupeId) : Promise.resolve(new Map<string, string | null>()),
  ]);
  for (const a of args.auteurs) {
    const k = `${a.type}:${a.id ?? ''}`;
    if (out.has(k)) continue;
    out.set(k, construireAuteur(a, { topic: args.topic, acteurId: args.acteurId, mode: args.mode, profils, identites, qualites }));
  }
  return out;
}

export function construireAuteur(
  a: { id: string | null; type: TypeAuteur },
  c: { topic: string; acteurId: string; mode: ModeAffichageEleve; profils: Map<string, ProfilPublic>; identites: Map<string, Identite>; qualites: QualiteGroupe },
): AuteurDTO {
  const moi = !!a.id && a.id === c.acteurId;
  const cle = cleAuteur(c.topic, a.id);
  if (a.type === 'systeme' || !a.id) {
    return { cle: 'systeme', nom: 'Major ECN', type: 'systeme', qualite: null, avatar: { mode: 'majorecn', seed: null, initiale: 'M', url: null }, moi: false };
  }
  if (a.type === 'candidat') {
    const p = c.profils.get(a.id);
    const nom = p ? nomEleve(p, c.mode) : 'Candidat';
    return { cle, nom, type: 'candidat', qualite: null, avatar: { mode: 'dessin', seed: p?.avatar_seed ?? cle, initiale: initiale(nom), url: null }, moi };
  }
  const id = c.identites.get(a.id);
  if (a.type === 'enseignant') {
    const prenom = id?.prenom_public ?? 'Enseignant';
    const qualite = (c.qualites.get(a.id) ?? null) || id?.qualite || 'Enseignant Major ECN';
    return {
      cle, nom: prenom, type: 'enseignant', qualite,
      avatar: { mode: id?.avatar_mode === 'photo' && id.avatar_chemin ? 'photo' : (id?.avatar_mode === 'photo' ? 'initiale' : id?.avatar_mode ?? 'initiale'), seed: null, initiale: initiale(prenom), url: id?.avatar_mode === 'photo' ? id.avatar_chemin : null },
      moi,
    };
  }
  // Équipe Major ECN : prénom public s'il a été défini, sinon la marque.
  const nom = id?.prenom_public ?? 'Équipe Major ECN';
  return {
    cle, nom, type: 'equipe', qualite: id ? (id.qualite || 'Équipe Major ECN') : null,
    avatar: { mode: id?.avatar_mode === 'photo' && id.avatar_chemin ? 'photo' : 'majorecn', seed: null, initiale: initiale(nom), url: id?.avatar_mode === 'photo' ? id.avatar_chemin : null },
    moi,
  };
}

/**
 * Enseignants qu'un candidat peut taguer dans un groupe (§20) : affectations
 * actives, comptes actifs, identité publique renseignée. L'identifiant exposé
 * est celui de l'AFFECTATION, jamais celui du compte (§100).
 */
export async function enseignantsTaguables(groupeId: string): Promise<(EnseignantTagDTO & { userId: string; email: string | null })[]> {
  const { data, error } = await db().from('echanges_enseignants')
    .select('id, user_id, qualite, specialite_publique, email_notification, actif').eq('groupe_id', groupeId).eq('actif', true);
  if (error) throw new Error(error.message);
  const affs = (data ?? []) as { id: string; user_id: string; qualite: string | null; specialite_publique: string | null; email_notification: string | null }[];
  if (affs.length === 0) return [];
  const [ids, { data: profs }] = await Promise.all([
    identitesDe(affs.map((x) => x.user_id)),
    db().from('profiles').select('id, role, is_active, access_end, email').in('id', affs.map((x) => x.user_id)),
  ]);
  const p = new Map(((profs ?? []) as { id: string; role: string; is_active: boolean | null; access_end: string | null; email: string | null }[]).map((r) => [r.id, r]));
  return affs
    .filter((x) => {
      const pr = p.get(x.user_id);
      if (!pr || pr.is_active === false) return false;
      if (pr.role === 'professor' && pr.access_end && new Date(pr.access_end).getTime() < Date.now()) return false;
      return ids.has(x.user_id);
    })
    .map((x) => {
      const id = ids.get(x.user_id)!;
      const qualite = x.qualite || id.qualite;
      return {
        id: x.id,
        userId: x.user_id,
        prenom: id.prenom_public,
        libelle: libelleEnseignant(id.prenom_public, qualite),
        specialite: x.specialite_publique || id.specialite || null,
        email: x.email_notification || p.get(x.user_id)?.email || null,
      };
    })
    .sort((a, b) => a.prenom.localeCompare(b.prenom, 'fr'));
}
