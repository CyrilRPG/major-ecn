'use server';

import { revalidatePath } from 'next/cache';
import {
  acteurBackOffice, basculerConservationLegale, chercherEleves, ciblesDansPerimetre, enregistrerParametres, enregistrerStaff, groupeAccessible,
} from '@/lib/echanges/serveur/admin';
import {
  affecterEnseignant, apercuCriteres, basculerVisibilite, changerStatut, creerGroupe, dupliquerGroupe, enregistrerIdentite,
  gererParticipants, modifierGroupe, synchroniserGroupe, type EntreeGroupe,
} from '@/lib/echanges/serveur/groupes';
import {
  appliquerSanction, leverSanction, libererBlocage, refuserMessages, reintegrer, restaurerMessages, traiterSignalement, validerMessages,
  exportRgpd, effacementRgpd,
} from '@/lib/echanges/serveur/moderation';
import { creerRessource, modifierRessource, retirerRessource, transformerEnPermanente, type EditionRessource } from '@/lib/echanges/serveur/bibliotheque';
import { reaffecter } from '@/lib/echanges/serveur/questions';
import type { Parametres } from '@/lib/echanges/serveur/base';
import type { Criteres, ModeParticipants, StatutGroupe, TypeSanction } from '@/lib/echanges/regles';

/**
 * Actions serveur du back-office des Échanges. Chacune recharge l'acteur
 * (niveau Échanges) et délègue aux fonctions serveur du module, qui
 * revérifient la capacité requise et écrivent le journal d'audit.
 */

type R<T = undefined> = { ok: true; data?: T } | { ok: false; erreur: string };

async function acteur() {
  const a = await acteurBackOffice();
  if (!a) throw new Error('Accès réservé à l’administration des échanges.');
  return a;
}

function resultat<T>(r: unknown): R<T> {
  if (r && typeof r === 'object' && 'error' in r) return { ok: false, erreur: String((r as { error: string }).error) };
  return { ok: true, data: r as T };
}

const rafraichir = (id?: string) => {
  revalidatePath('/admin/echanges', 'layout');
  if (id) revalidatePath(`/admin/echanges/groupes/${id}`);
};

async function garde<T>(f: () => Promise<R<T>>): Promise<R<T>> {
  try {
    return await f();
  } catch (e) {
    return { ok: false, erreur: e instanceof Error ? e.message : 'Action impossible.' };
  }
}

const HORS_PERIMETRE = 'Cette action concerne une promotion hors de votre périmètre.';

/** Acteur + contrôle de périmètre des cibles (modérateur limité à certaines promotions). */
async function surCibles(type: 'message' | 'signalement' | 'blocage' | 'sanction' | 'tag', ids: string[]) {
  const a = await acteur();
  if (!(await ciblesDansPerimetre(a, type, ids))) throw new Error(HORS_PERIMETRE);
  return a;
}

async function surGroupe(id: string) {
  const a = await acteur();
  if (!(await groupeAccessible(a, id))) throw new Error('Cette promotion ne fait pas partie de votre périmètre.');
  return a;
}

/* ─────────────────────────── Promotions ─────────────────────────── */

export async function creerPromotion(e: EntreeGroupe): Promise<R<{ id: string }>> {
  return garde(async () => {
    const r = resultat<{ id: string }>(await creerGroupe(await acteur(), e));
    rafraichir();
    return r;
  });
}

export async function modifierPromotion(id: string, e: Partial<EntreeGroupe>): Promise<R> {
  return garde(async () => {
    const r = resultat(await modifierGroupe(await surGroupe(id), id, e));
    rafraichir(id);
    return r as R;
  });
}

/** Aperçu des ajouts / retraits AVANT d'appliquer de nouveaux critères (§181). */
export async function previsualiserCriteres(id: string, mode: ModeParticipants, criteres: Criteres) {
  return garde(async () => resultat<{ ajoutes: { id: string; nom: string; email: string | null }[]; retires: { id: string; nom: string; email: string | null }[]; exceptionsInclusion: { id: string; nom: string; email: string | null }[]; exceptionsExclusion: { id: string; nom: string; email: string | null }[] }>(
    await apercuCriteres(await surGroupe(id), id, { mode, criteres }),
  ));
}

export async function changerStatutPromotion(id: string, statut: StatutGroupe, transfert?: 'tout' | 'aucun' | string[]): Promise<R> {
  return garde(async () => {
    const r = resultat(await changerStatut(await surGroupe(id), id, statut, { transfert }));
    rafraichir(id);
    return r as R;
  });
}

export async function visibilitePromotion(id: string, visible: boolean): Promise<R> {
  return garde(async () => {
    const r = resultat(await basculerVisibilite(await surGroupe(id), id, visible));
    rafraichir(id);
    return r as R;
  });
}

export async function dupliquerPromotion(id: string, o: { nom: string; annee: number | null; promotion: string | null }): Promise<R<{ id: string; enseignantsProposes: { userId: string; prenom: string | null }[] }>> {
  return garde(async () => {
    const r = resultat<{ id: string; enseignantsProposes: { userId: string; prenom: string | null }[] }>(await dupliquerGroupe(await surGroupe(id), id, o));
    rafraichir();
    return r;
  });
}

export async function synchroniserPromotion(id: string): Promise<R<{ ajoutes: number; retires: number }>> {
  return garde(async () => {
    const a = await surGroupe(id);
    if (!a.capacites.has('gerer_groupes')) return { ok: false, erreur: 'Action réservée à l’administration des échanges.' };
    const r = await synchroniserGroupe(id);
    rafraichir(id);
    return { ok: true, data: r };
  });
}

export async function conservationLegale(id: string, actif: boolean): Promise<R> {
  return garde(async () => {
    const r = resultat(await basculerConservationLegale(await surGroupe(id), id, actif));
    rafraichir(id);
    return r as R;
  });
}

export async function participants(id: string, action: 'ajouter' | 'retirer' | 'exclure' | 'retablir', userIds: string[]): Promise<R<{ ok: true; n: number }>> {
  return garde(async () => {
    const r = resultat<{ ok: true; n: number }>(await gererParticipants(await surGroupe(id), id, action, userIds));
    rafraichir(id);
    return r;
  });
}

export async function rechercherEleves(q: string) {
  await acteur();
  return chercherEleves(q);
}

export async function identiteEnseignant(userId: string, i: { prenomPublic: string; qualite: string; specialite: string | null; avatarMode: 'initiale' | 'majorecn' | 'neutre' | 'photo' }): Promise<R> {
  return garde(async () => {
    const r = resultat(await enregistrerIdentite(await acteur(), userId, i));
    rafraichir();
    return r as R;
  });
}

export async function affectation(groupeId: string, e: {
  userId: string; qualite: string | null; specialitePublique: string | null; emailNotification: string | null;
  peutPublier: boolean; peutEpingler: boolean; actif: boolean; annoncer?: boolean;
}): Promise<R> {
  return garde(async () => {
    const r = resultat(await affecterEnseignant(await surGroupe(groupeId), groupeId, e));
    rafraichir(groupeId);
    return r as R;
  });
}

export async function reaffecterQuestion(tagId: string, affectationId: string): Promise<R> {
  return garde(async () => {
    const r = resultat(await reaffecter(await surCibles('tag', [tagId]), tagId, affectationId));
    rafraichir();
    return r as R;
  });
}

/* ─────────────────────────── Modération ─────────────────────────── */

export async function valider(ids: string[]): Promise<R<{ valides: number }>> {
  return garde(async () => {
    const r = resultat<{ valides: number }>(await validerMessages(await surCibles('message', ids), ids));
    rafraichir();
    return r;
  });
}

export async function refuser(ids: string[], motif: string | null): Promise<R<{ refuses: number }>> {
  return garde(async () => {
    const r = resultat<{ refuses: number }>(await refuserMessages(await surCibles('message', ids), ids, motif));
    rafraichir();
    return r;
  });
}

export async function signalement(id: string, statut: 'traite' | 'sans_suite' | 'a_examiner', note: string | null): Promise<R> {
  return garde(async () => {
    const r = resultat(await traiterSignalement(await surCibles('signalement', [id]), id, statut, note));
    rafraichir();
    return r as R;
  });
}

export async function liberer(id: string): Promise<R> {
  return garde(async () => {
    const r = resultat(await libererBlocage(await surCibles('blocage', [id]), id));
    rafraichir();
    return r as R;
  });
}

export async function sanctionner(s: {
  userId: string; groupeId: string | null; type: TypeSanction; motif: string | null; messageEleve: string | null;
  dureeHeures?: number | null; jusqua?: string | null; notifierApp: boolean; notifierEmail: boolean;
}): Promise<R> {
  return garde(async () => {
    const a = await acteur();
    // Modérateur limité : une mesure porte toujours sur l'une de SES promotions.
    if (a.staffGroupes && (!s.groupeId || !a.staffGroupes.includes(s.groupeId))) return { ok: false, erreur: HORS_PERIMETRE };
    const r = resultat(await appliquerSanction(a, s));
    rafraichir();
    return r as R;
  });
}

export async function lever(sanctionId: string, motif: string | null): Promise<R> {
  return garde(async () => {
    const r = resultat(await leverSanction(await surCibles('sanction', [sanctionId]), sanctionId, motif));
    rafraichir();
    return r as R;
  });
}

export async function reintegrerCandidat(userId: string, groupeId: string | null, motif: string | null): Promise<R> {
  return garde(async () => {
    const a = await acteur();
    if (a.staffGroupes && (!groupeId || !a.staffGroupes.includes(groupeId))) return { ok: false, erreur: HORS_PERIMETRE };
    const r = resultat(await reintegrer(a, userId, groupeId, motif));
    rafraichir();
    return r as R;
  });
}

export async function restaurer(ids: string[]): Promise<R<{ restaures: number }>> {
  return garde(async () => {
    const r = resultat<{ restaures: number }>(await restaurerMessages(await surCibles('message', ids), ids));
    rafraichir();
    return r;
  });
}

export async function rgpdExport(userId: string): Promise<R<Record<string, unknown>>> {
  return garde(async () => resultat<Record<string, unknown>>(await exportRgpd(await acteur(), userId)));
}

export async function rgpdEffacement(userId: string, confirmation: string): Promise<R<{ purges: number; conserves: number }>> {
  if (confirmation !== 'EFFACER') return { ok: false, erreur: 'Tapez EFFACER pour confirmer.' };
  return garde(async () => {
    const r = resultat<{ purges: number; conserves: number }>(await effacementRgpd(await acteur(), userId));
    rafraichir();
    return r;
  });
}

/* ─────────────────────────── Bibliothèque ─────────────────────────── */

export async function versBibliotheque(messageId: string, anonymiser = true): Promise<R<{ id: string }>> {
  return garde(async () => {
    const r = resultat<{ id: string }>(await transformerEnPermanente(await surCibles('message', [messageId]), messageId, { anonymiser }));
    rafraichir();
    return r;
  });
}

export async function enregistrerRessource(e: EditionRessource & { titre?: string; reponse?: string }, id?: string): Promise<R<{ id: string }>> {
  return garde(async () => {
    const a = await acteur();
    const r = id
      ? resultat<{ id: string }>(await modifierRessource(a, id, e))
      : resultat<{ id: string }>(await creerRessource(a, { ...e, titre: e.titre ?? '', reponse: e.reponse ?? '' }));
    rafraichir();
    return r.ok && id ? { ok: true, data: { id } } : r;
  });
}

export async function supprimerRessource(id: string): Promise<R> {
  return garde(async () => {
    const r = resultat(await retirerRessource(await acteur(), id));
    rafraichir();
    return r as R;
  });
}

/* ─────────────────────────── Paramètres et équipe ─────────────────────────── */

export async function sauverParametres(patch: Partial<Parametres>): Promise<R> {
  return garde(async () => {
    const r = resultat(await enregistrerParametres(await acteur(), patch));
    rafraichir();
    return r as R;
  });
}

export async function sauverStaff(userId: string, e: { niveau: 'moderateur' | 'admin_pedagogique' | null; groupes: string[] | null; peutSuspendre: boolean }): Promise<R> {
  return garde(async () => {
    const r = resultat(await enregistrerStaff(await acteur(), userId, e));
    rafraichir();
    revalidatePath('/admin', 'layout');
    return r as R;
  });
}
