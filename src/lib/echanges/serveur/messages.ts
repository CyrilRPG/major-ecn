import 'server-only';
import { after } from 'next/server';
import { siteUrl } from '@/lib/email/send';
import { notifier, type NotifLigne } from '@/lib/notifications/centre';
import { deciderPublication, MESSAGE_BLOCAGE } from '../coordonnees';
import { MOTIFS_SIGNALEMENT } from '../moderation-textes';
import { echeanceRelance, libelleEnseignant, mentionsValides, peutModifier, peutSupprimer, verifierQuotas } from '../regles';
import type {
  AuteurDTO, Canal, ChangementsDTO, ContexteDTO, ErreurEchanges, MessageDTO, PageMessagesDTO, TypeAuteur,
} from '../types';
import type { AccesGroupe, Acteur } from './acces';
import { auditer, db, extrait, journaliser, parametres, type Parametres } from './base';
import { resoudreContexte } from './contexte';
import { enfiler, traiterBoite } from './emails';
import { identitesDe, resoudreAuteurs } from './identites';
import { diffuser } from './temps-reel';

/**
 * Messages du module Échanges : lecture paginée, synchronisation des
 * appareils, publication (tags, notifications, contrôles), modification,
 * suppression, réactions, épinglage, signalement.
 */

export const COLONNES_MESSAGE = 'id, groupe_id, canal, auteur_id, auteur_type, contenu, reponse_a, contexte, item_numero, specialite_id, mentions, statut, moderation_motif, important, accuse_lecture_requis, epingle_at, epingle_par, epingle_question_id, modifie_at, nb_modifications, supprime_at, suppression_origine, client_id, nb_pieces_jointes, created_at, maj_at';

export type MessageRow = {
  id: string; groupe_id: string; canal: Canal; auteur_id: string | null; auteur_type: TypeAuteur; contenu: string | null;
  reponse_a: string | null; contexte: ContexteDTO | null; item_numero: number | null; specialite_id: string | null;
  mentions: string[]; statut: 'publie' | 'en_attente' | 'refuse'; moderation_motif: string | null; important: boolean;
  accuse_lecture_requis: boolean; epingle_at: string | null; epingle_par: string | null; epingle_question_id: string | null;
  modifie_at: string | null; nb_modifications: number; supprime_at: string | null; suppression_origine: string | null;
  client_id: string | null; nb_pieces_jointes: number; created_at: string; maj_at: string;
};

const LIBELLE_ATTENTE: Record<string, string> = {
  validation: 'En attente de validation par l’équipe Major ECN',
  coordonnees: 'En attente de vérification par l’équipe Major ECN',
  lien: 'Lien en cours de vérification par l’équipe Major ECN',
  image: 'Pièce jointe en cours de vérification par l’équipe Major ECN',
};

/** Le message est-il visible de cette personne dans le flux ? */
export function visible(m: MessageRow, acteur: Acteur, acces: AccesGroupe): boolean {
  if (m.supprime_at) return false;
  if (m.statut === 'publie') return true;
  if (m.statut === 'en_attente') return m.auteur_id === acteur.id || acces.droits.moderer;
  return false;
}

/* ─────────────────────────── Enrichissement (DTO) ─────────────────────────── */

type Affichage = { prenom: string; libelle: string };

async function affectationsAffichage(groupeId: string): Promise<Map<string, Affichage>> {
  const { data } = await db().from('echanges_enseignants').select('id, user_id, qualite').eq('groupe_id', groupeId);
  const affs = (data ?? []) as { id: string; user_id: string; qualite: string | null }[];
  const ids = await identitesDe(affs.map((a) => a.user_id));
  return new Map(affs.map((a) => {
    const i = ids.get(a.user_id);
    const prenom = i?.prenom_public ?? 'Enseignant';
    return [a.id, { prenom, libelle: libelleEnseignant(prenom, a.qualite || i?.qualite) }];
  }));
}

export async function versDTO(rows: MessageRow[], acteur: Acteur, acces: AccesGroupe, prm?: Parametres): Promise<MessageDTO[]> {
  if (rows.length === 0) return [];
  const p = prm ?? (await parametres());
  const g = acces.groupe;
  const ids = rows.map((r) => r.id);
  const repIds = [...new Set(rows.map((r) => r.reponse_a).filter((x): x is string => !!x))];
  const annonces = rows.filter((r) => r.canal === 'annonces').map((r) => r.id);

  type Reac = { message_id: string; user_id: string; emoji: string };
  type Pj = { id: string; message_id: string; nom: string; mime: string | null; taille: number | null; legende: string | null; statut: string };
  type Rep = Pick<MessageRow, 'id' | 'auteur_id' | 'auteur_type' | 'contenu' | 'supprime_at' | 'statut'>;
  type TagL = { message_id: string; affectation_id: string | null; enseignant_id: string; statut: 'en_attente' | 'traitee' | 'annulee' | 'a_reaffecter'; en_retard_at: string | null };
  type Acc = { message_id: string; user_id: string };
  type Lec = { user_id: string; dernier_lu_at: string };
  const [reactions, pieces, reponses, tags, affs, accuses, lecturesAnnonces, membres] = (await Promise.all([
    db().from('echanges_reactions').select('message_id, user_id, emoji').in('message_id', ids).then((r: { data: unknown }) => (r.data ?? []) as { message_id: string; user_id: string; emoji: string }[]),
    db().from('echanges_pieces_jointes').select('id, message_id, nom, mime, taille, legende, statut').in('message_id', ids).is('supprime_at', null).is('purge_at', null)
      .then((r: { data: unknown }) => (r.data ?? []) as { id: string; message_id: string; nom: string; mime: string | null; taille: number | null; legende: string | null; statut: string }[]),
    repIds.length
      ? db().from('echanges_messages').select('id, auteur_id, auteur_type, contenu, supprime_at, statut').in('id', repIds).then((r: { data: unknown }) => (r.data ?? []) as Pick<MessageRow, 'id' | 'auteur_id' | 'auteur_type' | 'contenu' | 'supprime_at' | 'statut'>[])
      : Promise.resolve([] as Pick<MessageRow, 'id' | 'auteur_id' | 'auteur_type' | 'contenu' | 'supprime_at' | 'statut'>[]),
    db().from('echanges_tags').select('message_id, affectation_id, enseignant_id, statut, en_retard_at').in('message_id', ids)
      .then((r: { data: unknown }) => (r.data ?? []) as { message_id: string; affectation_id: string | null; enseignant_id: string; statut: 'en_attente' | 'traitee' | 'annulee' | 'a_reaffecter'; en_retard_at: string | null }[]),
    affectationsAffichage(g.id),
    annonces.length
      ? db().from('echanges_accuses').select('message_id, user_id').in('message_id', annonces).then((r: { data: unknown }) => (r.data ?? []) as { message_id: string; user_id: string }[])
      : Promise.resolve([] as { message_id: string; user_id: string }[]),
    annonces.length && acces.droits.moderer
      ? db().from('echanges_lectures').select('user_id, dernier_lu_at').eq('groupe_id', g.id).eq('canal', 'annonces').then((r: { data: unknown }) => (r.data ?? []) as { user_id: string; dernier_lu_at: string }[])
      : Promise.resolve([] as { user_id: string; dernier_lu_at: string }[]),
    annonces.length && acces.droits.moderer
      ? db().from('echanges_membres').select('user_id', { count: 'exact', head: true }).eq('groupe_id', g.id).eq('statut', 'actif').eq('exclusion_forcee', false).then((r: { count: number | null }) => r.count ?? 0)
      : Promise.resolve(0),
  ])) as [Reac[], Pj[], Rep[], TagL[], Map<string, Affichage>, Acc[], Lec[], number];

  // Affectation → user (pour l'auteur de l'épinglage) et auteurs à résoudre.
  const auteursRequis: { id: string | null; type: TypeAuteur }[] = [
    ...rows.map((r) => ({ id: r.auteur_id, type: r.auteur_type })),
    ...reponses.map((r) => ({ id: r.auteur_id, type: r.auteur_type })),
  ];
  const epingleurs = [...new Set(rows.map((r) => r.epingle_par).filter((x): x is string => !!x))];
  const [auteurs, idsEpingleurs] = await Promise.all([
    resoudreAuteurs({ topic: g.topic, groupeId: g.id, acteurId: acteur.id, auteurs: auteursRequis, mode: p.affichage_eleves }),
    epingleurs.length ? identitesDe(epingleurs) : Promise.resolve(new Map()),
  ]);
  const auteurDe = (id: string | null, type: TypeAuteur): AuteurDTO => auteurs.get(`${type}:${id ?? ''}`)!;
  const repParId = new Map(reponses.map((r) => [r.id, r]));

  return rows.map((r) => {
    const reacs = reactions.filter((x) => x.message_id === r.id);
    const parEmoji = new Map<string, { n: number; moi: boolean }>();
    for (const x of reacs) {
      const e = parEmoji.get(x.emoji) ?? { n: 0, moi: false };
      e.n += 1; if (x.user_id === acteur.id) e.moi = true;
      parEmoji.set(x.emoji, e);
    }
    const rep = r.reponse_a ? repParId.get(r.reponse_a) : undefined;
    const repVisible = rep && !rep.supprime_at && rep.statut === 'publie';
    const finEdition = new Date(new Date(r.created_at).getTime() + p.edition_minutes * 60_000).toISOString();
    const lu = annonces.includes(r.id) && acces.droits.moderer
      ? {
          vus: lecturesAnnonces.filter((l) => new Date(l.dernier_lu_at) >= new Date(r.created_at)).length,
          accuses: accuses.filter((a) => a.message_id === r.id).length,
          membres,
        }
      : null;
    const epingleur = r.epingle_par ? idsEpingleurs.get(r.epingle_par) : null;
    const dto: MessageDTO = {
      id: r.id,
      groupeId: r.groupe_id,
      canal: r.canal,
      auteur: auteurDe(r.auteur_id, r.auteur_type),
      contenu: r.contenu,
      createdAt: r.created_at,
      modifie: r.nb_modifications > 0,
      modifiableJusqua: peutModifier(r, acteur.id, p.edition_minutes) ? finEdition : null,
      supprimable: peutSupprimer(r, { id: acteur.id, role: acces.role, moderer: acces.droits.moderer }),
      signalable: acces.role === 'candidat' && r.auteur_id !== acteur.id && r.auteur_type !== 'systeme',
      reponseA: r.reponse_a
        ? {
            id: r.reponse_a,
            auteur: rep ? auteurDe(rep.auteur_id, rep.auteur_type).nom : '',
            extrait: repVisible ? extrait(rep?.contenu, 120) : 'Message indisponible',
            disponible: !!repVisible,
          }
        : null,
      mentions: (r.mentions ?? []).map((id) => ({ id, nom: affs.get(id)?.prenom ?? 'Enseignant' })),
      reactions: [...parEmoji.entries()].map(([emoji, v]) => ({ emoji, ...v })).sort((a, b) => p.reactions.indexOf(a.emoji) - p.reactions.indexOf(b.emoji)),
      pieces: pieces.filter((x) => x.message_id === r.id).map((x) => ({
        id: x.id, nom: x.nom, mime: x.mime, taille: x.taille, legende: x.legende,
        estImage: !!x.mime && x.mime.startsWith('image/'), enModeration: x.statut === 'en_moderation',
      })),
      epingle: r.epingle_at ? { at: r.epingle_at, par: epingleur?.prenom_public ?? 'Équipe Major ECN', avecQuestion: !!r.epingle_question_id } : null,
      important: r.important,
      accuseRequis: r.accuse_lecture_requis,
      accuse: accuses.some((a) => a.message_id === r.id && a.user_id === acteur.id),
      statut: r.statut,
      attenteMotif: r.statut === 'en_attente' ? LIBELLE_ATTENTE[r.moderation_motif ?? 'validation'] ?? LIBELLE_ATTENTE.validation : null,
      contexte: r.contexte ?? null,
      tags: tags.filter((t) => t.message_id === r.id && t.statut !== 'annulee').map((t) => ({
        enseignantId: t.affectation_id ?? '',
        enseignant: (t.affectation_id && affs.get(t.affectation_id)?.libelle) || 'Enseignant',
        statut: t.statut,
        enRetard: !!t.en_retard_at && t.statut !== 'traitee',
      })),
      lectures: lu,
      moderation: acces.droits.moderer && r.auteur_type === 'candidat' ? { auteurProfilId: r.auteur_id } : null,
    };
    return dto;
  });
}

/* ─────────────────────────────── Lecture ─────────────────────────────── */

function filtreVisibles(q: ReturnType<typeof db>, acteur: Acteur, acces: AccesGroupe) {
  let x = q.is('supprime_at', null);
  x = acces.droits.moderer
    ? x.in('statut', ['publie', 'en_attente'])
    : x.or(`statut.eq.publie,and(statut.eq.en_attente,auteur_id.eq.${acteur.id})`);
  return x;
}

async function dernierLu(acteurId: string, groupeId: string, canal: Canal): Promise<string | null> {
  const { data } = await db().from('echanges_lectures').select('dernier_lu_at').eq('groupe_id', groupeId).eq('user_id', acteurId).eq('canal', canal).maybeSingle();
  return data?.dernier_lu_at ?? null;
}

export async function listerMessages(acteur: Acteur, acces: AccesGroupe, o: {
  canal: Canal; avant?: string | null; apres?: string | null; autour?: string | null; limite?: number;
}): Promise<PageMessagesDTO> {
  const limite = Math.min(Math.max(o.limite ?? 40, 10), 100);
  const g = acces.groupe;
  const base = () => filtreVisibles(db().from('echanges_messages').select(COLONNES_MESSAGE).eq('groupe_id', g.id).eq('canal', o.canal), acteur, acces);
  const lu = await dernierLu(acteur.id, g.id, o.canal);

  // Reprise de lecture (§63) : premier non-lu, pour ouvrir la conversation à cet endroit.
  let premierNonLu: string | null = null;
  if (lu) {
    const { data } = await base().gt('created_at', lu).neq('auteur_id', acteur.id).order('created_at', { ascending: true }).limit(1);
    premierNonLu = (data?.[0] as MessageRow | undefined)?.id ?? null;
  }

  let ancre = o.autour ?? null;
  if (!ancre && !o.avant && !o.apres && premierNonLu) ancre = premierNonLu;

  let rows: MessageRow[] = [];
  let plusAnciens = false;
  let plusRecents = false;
  if (ancre) {
    const { data: cible } = await db().from('echanges_messages').select('created_at, canal').eq('id', ancre).eq('groupe_id', g.id).maybeSingle();
    if (cible && cible.canal === o.canal) {
      const [{ data: av }, { data: ap }] = await Promise.all([
        base().lte('created_at', cible.created_at).order('created_at', { ascending: false }).limit(Math.ceil(limite / 2) + 1),
        base().gt('created_at', cible.created_at).order('created_at', { ascending: true }).limit(limite + 1),
      ]);
      const avant = (av ?? []) as MessageRow[];
      const apres = (ap ?? []) as MessageRow[];
      plusAnciens = avant.length > Math.ceil(limite / 2);
      plusRecents = apres.length > limite;
      rows = [...avant.slice(0, Math.ceil(limite / 2)).reverse(), ...apres.slice(0, limite)];
    }
  }
  if (rows.length === 0) {
    if (o.apres) {
      const { data } = await base().gt('created_at', o.apres).order('created_at', { ascending: true }).limit(limite + 1);
      const l = (data ?? []) as MessageRow[];
      plusRecents = l.length > limite;
      rows = l.slice(0, limite);
    } else {
      let q = base().order('created_at', { ascending: false }).limit(limite + 1);
      if (o.avant) q = q.lt('created_at', o.avant);
      const { data } = await q;
      const l = (data ?? []) as MessageRow[];
      plusAnciens = l.length > limite;
      rows = l.slice(0, limite).reverse();
    }
  }
  const messages = await versDTO(rows, acteur, acces);
  return {
    messages,
    plusAnciens,
    plusRecents,
    curseur: rows.reduce((m, r) => (r.maj_at > m ? r.maj_at : m), new Date(Date.now() - 1000).toISOString()),
    premierNonLu,
    dernierLuAt: lu,
  };
}

/**
 * Changements depuis un curseur (temps réel et interrogation périodique) :
 * nouveaux messages, modifiés, et ceux qui doivent DISPARAÎTRE du flux
 * (supprimés par l'auteur ou la modération, refusés) — R15, R21.
 */
export async function changements(acteur: Acteur, acces: AccesGroupe, depuis: string): Promise<ChangementsDTO> {
  const borne = Number.isFinite(new Date(depuis).getTime()) ? depuis : new Date(Date.now() - 60_000).toISOString();
  const { data, error } = await db().from('echanges_messages').select(COLONNES_MESSAGE)
    .eq('groupe_id', acces.groupe.id).gt('maj_at', borne).order('maj_at', { ascending: true }).limit(200);
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as MessageRow[];
  const vis = rows.filter((r) => visible(r, acteur, acces));
  const retires = rows.filter((r) => !visible(r, acteur, acces)).map((r) => r.id);
  return {
    messages: await versDTO(vis, acteur, acces),
    retires,
    curseur: rows.reduce((m, r) => (r.maj_at > m ? r.maj_at : m), borne),
  };
}

/* ───────────────────────────── Publication ───────────────────────────── */

export type EntreePublication = {
  canal: Canal;
  contenu: string;
  reponseA?: string | null;
  mentions?: string[];
  pieces?: string[];
  contexte?: { type: string; id: string } | null;
  clientId?: string | null;
  important?: boolean;
  accuseLecture?: boolean;
};

async function enregistrerBlocage(b: { userId: string; groupeId: string | null; type: string; source: string; extrait: string; motifs: string[]; messageId?: string | null; statut?: string }) {
  await db().from('echanges_blocages').insert({
    user_id: b.userId, groupe_id: b.groupeId, type: b.type, source: b.source, extrait: extrait(b.extrait, 500),
    motifs: b.motifs, message_id: b.messageId ?? null, statut: b.statut ?? 'bloque',
  });
}

/** Tentatives répétées de partage de coordonnées : alerte l'équipe une fois par jour et par personne (§198). */
async function surveillerRecidive(userId: string, groupeId: string | null, prm: Parametres) {
  const depuis = new Date(Date.now() - 86_400_000).toISOString();
  const { count } = await db().from('echanges_blocages').select('id', { count: 'exact', head: true })
    .eq('user_id', userId).eq('type', 'coordonnees').gte('created_at', depuis);
  if ((count ?? 0) >= prm.coordonnees_seuil_alerte) {
    const jour = new Date().toISOString().slice(0, 10);
    const { data: p } = await db().from('profiles').select('first_name, last_name').eq('id', userId).maybeSingle();
    await enfiler({
      cle: `blocage:${userId}:${jour}`, type: 'blocage_alerte', groupeId,
      donnees: {
        sujet: 'Major ECN — Tentatives répétées de partage de coordonnées',
        titre: 'Tentatives répétées de contournement',
        lignes: [['Candidat', `${p?.first_name ?? ''} ${p?.last_name ?? ''}`.trim() || userId], ['Tentatives (24 h)', String(count)]],
        lien: `${siteUrl()}/admin/echanges/moderation?onglet=blocages`,
        bouton: 'Voir les tentatives',
      },
    });
    after(() => traiterBoite(5).then(() => undefined));
  }
}

/** Contrôle « coordonnées personnelles » d'un texte, commun aux messages, modifications, légendes et noms. */
export async function controlerTexte(texte: string, ctx: { userId: string; groupeId: string | null; source: 'message' | 'edition' | 'legende' | 'profil'; exempte: boolean }):
  Promise<{ action: 'publier' } | { action: 'moderation'; motif: 'coordonnees' | 'lien'; motifs: string[] } | { action: 'bloquer'; erreur: ErreurEchanges }> {
  if (ctx.exempte || !texte.trim()) return { action: 'publier' };
  const prm = await parametres();
  const d = deciderPublication(texte, {
    actif: prm.coordonnees_blocage_actif, mode: prm.coordonnees_mode,
    domainesAutorises: prm.coordonnees_domaines_autorises, liensNonReconnus: prm.liens_non_reconnus,
  });
  if (d.action === 'publier') return d;
  const motifs = d.motifs.map((m) => m.type);
  const lienSeul = motifs.every((m) => m === 'lien_non_reconnu');
  if (d.action === 'bloquer') {
    await enregistrerBlocage({ userId: ctx.userId, groupeId: ctx.groupeId, type: 'coordonnees', source: ctx.source, extrait: texte, motifs });
    if (!lienSeul) await surveillerRecidive(ctx.userId, ctx.groupeId, prm);
    return {
      action: 'bloquer',
      erreur: { error: lienSeul ? 'Ce lien ne peut pas être publié : seuls les liens vers des sites pédagogiques reconnus sont autorisés.' : MESSAGE_BLOCAGE, code: 'BLOQUE' },
    };
  }
  return { action: 'moderation', motif: lienSeul ? 'lien' : 'coordonnees', motifs };
}

export async function publier(acteur: Acteur, acces: AccesGroupe, e: EntreePublication): Promise<{ message: MessageDTO } | ErreurEchanges> {
  const prm = await parametres();
  const g = acces.groupe;
  // Un membre de l'équipe également enseignant du groupe répond en enseignant
  // dans la discussion (ses réponses traitent ses questions) ; les annonces
  // sont toujours signées Major ECN.
  const typeAuteur: TypeAuteur = acces.role === 'candidat'
    ? 'candidat'
    : acces.role === 'enseignant'
      ? 'enseignant'
      : acces.affectation && e.canal === 'discussion' ? 'enseignant' : 'equipe';

  // 1. Droits (serveur, §97).
  if (e.canal === 'annonces') {
    if (!acces.droits.publierAnnonce) return { error: 'Seule l’équipe Major ECN publie dans les annonces.', code: 'DROITS' };
  } else if (!acces.droits.publier) {
    return { error: acces.droits.motif ?? 'Vous ne pouvez pas publier dans cette conversation.', code: 'DROITS' };
  }
  if (acces.role === 'candidat' && prm.regles_acceptation_requise && !acces.adhesion?.regles_acceptees_at) {
    return { error: 'Merci d’accepter les règles de bonne conduite avant votre premier message.', code: 'REGLES' };
  }

  // 2. Idempotence (double clic, réseau, §88).
  const clientId = (e.clientId ?? '').slice(0, 80) || null;
  if (clientId) {
    const { data: deja } = await db().from('echanges_messages').select(COLONNES_MESSAGE).eq('auteur_id', acteur.id).eq('client_id', clientId).maybeSingle();
    if (deja) return { message: (await versDTO([deja as MessageRow], acteur, acces, prm))[0] };
  }

  // 3. Contenu.
  const contenu = (e.contenu ?? '').replace(/\r\n/g, '\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
  const pieces = [...new Set(e.pieces ?? [])].slice(0, prm.pj_max_par_message + 1);
  if (!contenu && pieces.length === 0) return { error: 'Écrivez un message ou joignez un fichier.', code: 'INVALIDE' };
  if (contenu.length > prm.longueur_max) return { error: `Message trop long (${prm.longueur_max} caractères au maximum).`, code: 'INVALIDE' };
  if (pieces.length > prm.pj_max_par_message) return { error: `${prm.pj_max_par_message} pièces jointes au maximum par message.`, code: 'INVALIDE' };
  if ((e.important || e.accuseLecture) && acces.role !== 'equipe') return { error: 'Option réservée à Major ECN.', code: 'DROITS' };

  // 4. Message cité : même groupe, même canal, visible.
  let cite: MessageRow | null = null;
  if (e.reponseA) {
    const { data } = await db().from('echanges_messages').select(COLONNES_MESSAGE).eq('id', e.reponseA).eq('groupe_id', g.id).maybeSingle();
    cite = (data as MessageRow | null) ?? null;
    if (!cite || !visible(cite, acteur, acces) || cite.canal !== e.canal) return { error: 'Le message auquel vous répondez n’est plus disponible.', code: 'INTROUVABLE' };
  }

  // 5. Tags : candidats seulement, enseignants actifs du groupe, @Prénom visible.
  let mentions: string[] = [];
  if ((e.mentions ?? []).length > 0 && acces.role === 'candidat' && e.canal === 'discussion') {
    if (!acces.droits.taguer) return { error: acces.droits.motif ?? 'Vous ne pouvez pas taguer d’enseignant pour le moment.', code: 'DROITS' };
    const { enseignantsTaguables } = await import('./identites');
    const ens = await enseignantsTaguables(g.id);
    mentions = mentionsValides(contenu, e.mentions ?? [], ens.map((x) => ({ id: x.id, prenom: x.prenom, actif: true })));
  }

  // 6. Quotas anti-abus (§71-72) — candidats seulement.
  if (acces.role === 'candidat') {
    const depuisH = new Date(Date.now() - 3_600_000).toISOString();
    const depuisJ = new Date(Date.now() - 86_400_000).toISOString();
    const [{ data: recents }, { data: tagsRecents }, { count: pjH }] = await Promise.all([
      db().from('echanges_messages').select('created_at, contenu').eq('auteur_id', acteur.id).gte('created_at', depuisH).order('created_at', { ascending: false }).limit(200),
      db().from('echanges_tags').select('tag_at, affectation_id').eq('eleve_id', acteur.id).gte('tag_at', depuisJ),
      db().from('echanges_pieces_jointes').select('id', { count: 'exact', head: true }).eq('uploader_id', acteur.id).gte('created_at', depuisH),
    ]);
    const v = verifierQuotas({
      quotas: prm,
      activite: {
        messages: (recents ?? []) as { created_at: string; contenu: string | null }[],
        tags: ((tagsRecents ?? []) as { tag_at: string; affectation_id: string }[]).map((t) => ({ tag_at: t.tag_at, enseignant_id: t.affectation_id })),
        piecesJointes: Math.max(0, (pjH ?? 0) - pieces.length),
      },
      contenu,
      nouveauxTags: mentions,
      nouvellesPj: pieces.length,
    });
    if (!v.ok) {
      await enregistrerBlocage({ userId: acteur.id, groupeId: g.id, type: v.type, source: 'message', extrait: contenu, motifs: [v.type] });
      return { error: v.message, code: 'QUOTA' };
    }
  }

  // 7. Coordonnées personnelles (tous les participants sauf l'équipe Major ECN).
  let statut: 'publie' | 'en_attente' = 'publie';
  let motifAttente: string | null = null;
  const c = await controlerTexte(contenu, { userId: acteur.id, groupeId: g.id, source: 'message', exempte: acces.role === 'equipe' });
  if (c.action === 'bloquer') return c.erreur;
  if (c.action === 'moderation') { statut = 'en_attente'; motifAttente = c.motif; }

  // 8. Validation préalable du groupe (§ modération activable par groupe).
  if (statut === 'publie' && acces.role === 'candidat' && g.moderation_prealable) { statut = 'en_attente'; motifAttente = 'validation'; }

  // 9. Pièces jointes : téléversées par l'auteur, dans ce groupe, validées.
  let pjRows: { id: string; statut: string }[] = [];
  if (pieces.length > 0) {
    if (!acces.droits.joindre && !(e.canal === 'annonces' && acces.droits.publierAnnonce)) return { error: 'Vous ne pouvez pas joindre de fichier ici.', code: 'DROITS' };
    const { data } = await db().from('echanges_pieces_jointes').select('id, statut, message_id, uploader_id, groupe_id').in('id', pieces);
    pjRows = ((data ?? []) as { id: string; statut: string; message_id: string | null; uploader_id: string; groupe_id: string }[])
      .filter((x) => x.uploader_id === acteur.id && x.groupe_id === g.id && !x.message_id && (x.statut === 'pret' || x.statut === 'en_moderation'));
    if (pjRows.length !== pieces.length) return { error: 'Une pièce jointe n’est pas prête ou n’est plus disponible. Réessayez de la joindre.', code: 'INVALIDE' };
    if (pjRows.some((x) => x.statut === 'en_moderation') && statut === 'publie') { statut = 'en_attente'; motifAttente = 'image'; }
  }

  // 10. Contexte pédagogique (§64-65), recalculé côté serveur.
  let contexte: ContexteDTO | null = null;
  if (e.contexte?.type && e.contexte.id) contexte = await resoudreContexte(acteur, e.contexte.type, e.contexte.id);

  // 11. Écriture.
  const { data: ins, error } = await db().from('echanges_messages').insert({
    groupe_id: g.id,
    canal: e.canal,
    auteur_id: acteur.id,
    auteur_type: typeAuteur,
    contenu: contenu || null,
    reponse_a: cite?.id ?? null,
    contexte,
    item_numero: contexte?.itemNumero ?? null,
    specialite_id: contexte?.specialiteId ?? g.specialite_id ?? null,
    mentions,
    statut,
    moderation_motif: motifAttente,
    important: !!e.important && e.canal === 'annonces',
    accuse_lecture_requis: !!e.accuseLecture && e.canal === 'annonces',
    client_id: clientId,
    nb_pieces_jointes: pjRows.length,
  }).select(COLONNES_MESSAGE).single();
  if (error) {
    if (String(error.code) === '23505' && clientId) {
      const { data: deja } = await db().from('echanges_messages').select(COLONNES_MESSAGE).eq('auteur_id', acteur.id).eq('client_id', clientId).maybeSingle();
      if (deja) return { message: (await versDTO([deja as MessageRow], acteur, acces, prm))[0] };
    }
    await journaliser('erreur', 'publication', 'Publication impossible', { groupe: g.id, erreur: error.message });
    return { error: 'Le message n’a pas pu être publié. Réessayez.', code: 'INVALIDE' };
  }
  const row = ins as MessageRow;
  if (pjRows.length > 0) {
    await db().from('echanges_pieces_jointes').update({ message_id: row.id, statut: 'attache' }).in('id', pjRows.filter((x) => x.statut === 'pret').map((x) => x.id));
    await db().from('echanges_pieces_jointes').update({ message_id: row.id }).in('id', pjRows.filter((x) => x.statut === 'en_moderation').map((x) => x.id));
  }
  if (statut === 'en_attente' && motifAttente !== 'validation') {
    await enregistrerBlocage({ userId: acteur.id, groupeId: g.id, type: motifAttente === 'image' ? 'piece_jointe' : 'coordonnees', source: motifAttente === 'image' ? 'image' : 'message', extrait: contenu, motifs: c.action === 'moderation' ? c.motifs : [motifAttente ?? ''], messageId: row.id, statut: 'en_moderation' });
  }

  if (statut === 'publie') {
    await apresPublication(row, g.id);
  } else {
    void diffuser(g.topic, { t: 'message', ids: [row.id] });
  }
  if (e.important && e.canal === 'annonces') {
    await auditer({ action: 'annonce_importante', acteurId: acteur.id, acteurRole: acteur.role, groupeId: g.id, messageId: row.id, details: { extrait: extrait(contenu, 200), accuse: !!e.accuseLecture } });
  }
  return { message: (await versDTO([row], acteur, acces, prm))[0] };
}

/**
 * Effets d'une publication EFFECTIVE (immédiate, ou à la validation par
 * l'équipe) : tags et e-mails enseignants, résolution des questions par la
 * réponse d'un enseignant, notifications des candidats, signal temps réel.
 * Aucune notification pour un message en attente de validation.
 */
export async function apresPublication(row: MessageRow, groupeId: string): Promise<void> {
  const prm = await parametres();
  const { data: g } = await db().from('echanges_groupes').select('id, nom, topic, notifier_chaque_message').eq('id', groupeId).maybeSingle();
  if (!g) return;
  void diffuser(g.topic, { t: 'message', ids: [row.id] });

  try {
    // Tags (§21-22) : une ligne et un e-mail par enseignant, idempotents.
    if ((row.mentions ?? []).length > 0 && row.auteur_type === 'candidat') {
      const { data: affs } = await db().from('echanges_enseignants').select('id, user_id, actif').in('id', row.mentions).eq('groupe_id', groupeId);
      const tagAt = new Date().toISOString();
      const lignes = ((affs ?? []) as { id: string; user_id: string; actif: boolean }[]).filter((a) => a.actif).map((a) => ({
        message_id: row.id, groupe_id: groupeId, affectation_id: a.id, enseignant_id: a.user_id, eleve_id: row.auteur_id,
        tag_at: tagAt, relance_due_at: echeanceRelance(tagAt, prm.relance_heures).toISOString(),
      }));
      if (lignes.length > 0) {
        const { data: tags, error } = await db().from('echanges_tags').upsert(lignes, { onConflict: 'message_id,enseignant_id', ignoreDuplicates: true }).select('id');
        if (error) throw new Error(`Tags non créés : ${error.message}`);
        for (const t of (tags ?? []) as { id: string }[]) {
          await enfiler({ cle: `tag:${t.id}:initial`, type: 'tag_initial', tagId: t.id, groupeId });
        }
        // E-mail immédiat (§22) : envoyé juste après la réponse HTTP, sans la retarder.
        after(() => traiterBoite(20).then(() => undefined));
      }
    }

    // Réponse d'un enseignant (§26) : résout ses questions en attente de la chaîne citée.
    const notifs: NotifLigne[] = [];
    if (row.auteur_type === 'enseignant' && row.reponse_a && row.auteur_id) {
      const chaine: string[] = [];
      let courant: string | null = row.reponse_a;
      for (let i = 0; i < 15 && courant; i++) {
        chaine.push(courant);
        const { data: parent }: { data: { reponse_a: string | null } | null } = await db().from('echanges_messages').select('reponse_a').eq('id', courant).maybeSingle();
        courant = parent?.reponse_a ?? null;
      }
      const maintenant = new Date().toISOString();
      let q = db().from('echanges_tags').update({ statut: 'traitee', repondu_at: maintenant, reponse_message_id: row.id, traite_par: row.auteur_id })
        .in('message_id', chaine).in('statut', ['en_attente', 'a_reaffecter']);
      if (!prm.reponse_un_annule_autres) q = q.eq('enseignant_id', row.auteur_id);
      const { data: resolus } = await q.select('id, eleve_id, message_id');
      const ids = await identitesDe([row.auteur_id]);
      const { data: aff } = await db().from('echanges_enseignants').select('qualite').eq('groupe_id', groupeId).eq('user_id', row.auteur_id).maybeSingle();
      const ident = ids.get(row.auteur_id);
      const libelle = libelleEnseignant(ident?.prenom_public ?? 'Votre enseignant', aff?.qualite || ident?.qualite);
      const eleves = new Set(((resolus ?? []) as { eleve_id: string | null }[]).map((t) => t.eleve_id).filter((x): x is string => !!x));
      // L'auteur du message cité, même sans tag, est prévenu de la réponse de l'enseignant.
      const { data: citeRow } = await db().from('echanges_messages').select('auteur_id, auteur_type').eq('id', row.reponse_a).maybeSingle();
      if (citeRow?.auteur_type === 'candidat' && citeRow.auteur_id) eleves.add(citeRow.auteur_id);
      for (const eleve of eleves) {
        notifs.push({
          userId: eleve, categorie: 'teacher', kind: 'echanges_reponse_enseignant',
          groupKey: `echanges:reponse:${row.reponse_a}`,
          titre: `${libelle} a répondu à votre question.`,
          corps: `${g.nom} — « ${extrait(row.contenu, 110)} »`,
          ctaLabel: 'Lire la réponse', ctaHref: `/echanges/m/${row.id}`,
          payload: { groupe_id: groupeId, message_id: row.id },
        });
      }
    } else if (row.reponse_a && row.canal === 'discussion') {
      // Réponse d'un candidat ou de l'équipe : mention personnelle de l'auteur cité.
      const { data: citeRow } = await db().from('echanges_messages').select('auteur_id, auteur_type').eq('id', row.reponse_a).maybeSingle();
      if (citeRow?.auteur_type === 'candidat' && citeRow.auteur_id && citeRow.auteur_id !== row.auteur_id) {
        notifs.push({
          userId: citeRow.auteur_id, categorie: 'mention', kind: 'echanges_mention',
          groupKey: `echanges:reponse:${row.reponse_a}`,
          titre: 'Nouvelle réponse à votre message',
          corps: `${g.nom} — « ${extrait(row.contenu, 110)} »`,
          ctaLabel: 'Voir la réponse', ctaHref: `/echanges/m/${row.id}`,
          payload: { groupe_id: groupeId, message_id: row.id },
          cumul: { count: 1, titre: (n) => (n > 1 ? `${n} réponses à votre message` : 'Nouvelle réponse à votre message') },
        });
      }
    }

    // Annonces (§58-60) et alerte à chaque message (réglage du groupe).
    const versTous = row.canal === 'annonces' || (row.canal === 'discussion' && g.notifier_chaque_message);
    if (versTous) {
      const { data: membres } = await db().from('echanges_membres').select('user_id, sourdine')
        .eq('groupe_id', groupeId).eq('statut', 'actif').eq('exclusion_forcee', false);
      for (const m of (membres ?? []) as { user_id: string; sourdine: boolean }[]) {
        if (m.user_id === row.auteur_id) continue;
        if (notifs.some((n) => n.userId === m.user_id)) continue;
        if (row.canal === 'annonces') {
          notifs.push(row.important
            ? {
                userId: m.user_id, categorie: 'annonces', kind: 'echanges_annonce_importante', prioritaire: true,
                groupKey: `echanges:annonce:${row.id}`,
                titre: `Annonce importante — ${g.nom}`,
                corps: extrait(row.contenu, 160),
                ctaLabel: 'Lire l’annonce', ctaHref: `/echanges/m/${row.id}`,
                payload: { groupe_id: groupeId, message_id: row.id },
                cleEmail: `annonce:${row.id}:${m.user_id}`,
              }
            : {
                userId: m.user_id, categorie: 'annonces', kind: 'echanges_annonce',
                groupKey: `echanges:annonces:${groupeId}`,
                titre: `Nouvelle annonce — ${g.nom}`,
                corps: extrait(row.contenu, 140),
                ctaLabel: 'Lire', ctaHref: `/echanges/${groupeId}?canal=annonces`,
                payload: { groupe_id: groupeId },
                cumul: { count: 1, titre: (n) => (n > 1 ? `${n} nouvelles annonces — ${g.nom}` : `Nouvelle annonce — ${g.nom}`), corps: (n) => (n > 1 ? 'Ouvrez les annonces de votre promotion.' : extrait(row.contenu, 140)) },
              });
        } else if (!m.sourdine) {
          notifs.push({
            userId: m.user_id, categorie: 'chat', kind: 'echanges_messages',
            groupKey: `echanges:messages:${groupeId}`,
            titre: `Nouveau message — ${g.nom}`,
            corps: extrait(row.contenu, 120),
            ctaLabel: 'Ouvrir', ctaHref: `/echanges/${groupeId}`,
            payload: { groupe_id: groupeId },
            cumul: { count: 1, titre: (n) => (n > 1 ? `${n} nouveaux messages — ${g.nom}` : `Nouveau message — ${g.nom}`) },
          });
        }
      }
    }
    if (notifs.length > 0) await notifier(notifs);
  } catch (err) {
    await journaliser('erreur', 'publication', 'Effets de publication incomplets', { message: row.id, erreur: String(err) });
  }
}

/* ─────────────────────────── Modification (§73-74) ─────────────────────────── */

export async function modifier(acteur: Acteur, acces: AccesGroupe, id: string, contenuBrut: string): Promise<{ message: MessageDTO } | ErreurEchanges> {
  const prm = await parametres();
  const { data } = await db().from('echanges_messages').select(COLONNES_MESSAGE).eq('id', id).eq('groupe_id', acces.groupe.id).maybeSingle();
  const m = data as MessageRow | null;
  if (!m || !visible(m, acteur, acces)) return { error: 'Message introuvable.', code: 'INTROUVABLE' };
  if (!peutModifier(m, acteur.id, prm.edition_minutes)) {
    return { error: `Un message ne peut être modifié que dans les ${prm.edition_minutes} minutes qui suivent sa publication.`, code: 'DROITS' };
  }
  if (!acces.droits.publier && !acces.droits.publierAnnonce) return { error: acces.droits.motif ?? 'Modification impossible.', code: 'DROITS' };
  const contenu = (contenuBrut ?? '').replace(/\r\n/g, '\n').trim();
  if (!contenu && m.nb_pieces_jointes === 0) return { error: 'Le message ne peut pas être vide.', code: 'INVALIDE' };
  if (contenu.length > prm.longueur_max) return { error: `Message trop long (${prm.longueur_max} caractères au maximum).`, code: 'INVALIDE' };
  if (contenu === (m.contenu ?? '')) return { message: (await versDTO([m], acteur, acces, prm))[0] };
  const c = await controlerTexte(contenu, { userId: acteur.id, groupeId: acces.groupe.id, source: 'edition', exempte: acces.role === 'equipe' });
  if (c.action === 'bloquer') return c.erreur;
  await db().from('echanges_versions').insert({ message_id: m.id, contenu: m.contenu, par: acteur.id });
  // Les tags restent ceux de la publication : une modification n'envoie jamais de second e-mail (§74).
  const maj: Record<string, unknown> = { contenu, modifie_at: new Date().toISOString(), nb_modifications: m.nb_modifications + 1 };
  if (c.action === 'moderation' && m.statut === 'publie') { maj.statut = 'en_attente'; maj.moderation_motif = c.motif; }
  const { data: up, error } = await db().from('echanges_messages').update(maj).eq('id', m.id).select(COLONNES_MESSAGE).single();
  if (error) return { error: 'Modification impossible. Réessayez.', code: 'INVALIDE' };
  if (c.action === 'moderation') {
    await enregistrerBlocage({ userId: acteur.id, groupeId: acces.groupe.id, type: 'coordonnees', source: 'edition', extrait: contenu, motifs: c.motifs, messageId: m.id, statut: 'en_moderation' });
  }
  void diffuser(acces.groupe.topic, { t: 'maj', ids: [m.id] });
  return { message: (await versDTO([up as MessageRow], acteur, acces, prm))[0] };
}

/* ─────────────────────────── Suppression (§39-46, §135) ─────────────────────────── */

export async function supprimer(acteur: Acteur, acces: AccesGroupe, ids: string[]): Promise<{ supprimes: string[] } | ErreurEchanges> {
  const uniques = [...new Set(ids)].filter((x) => /^[0-9a-f-]{36}$/i.test(x)).slice(0, 200);
  if (uniques.length === 0) return { error: 'Aucun message sélectionné.', code: 'INVALIDE' };
  const { data } = await db().from('echanges_messages').select(COLONNES_MESSAGE).in('id', uniques).eq('groupe_id', acces.groupe.id);
  const rows = ((data ?? []) as MessageRow[]).filter((m) => !m.supprime_at);
  // Contrôle message par message : un candidat ne supprime jamais le contenu d'un tiers (R17).
  const autorises = rows.filter((m) => peutSupprimer(m, { id: acteur.id, role: acces.role, moderer: acces.droits.moderer }));
  if (autorises.length < rows.length && !acces.droits.moderer) {
    await journaliser('alerte', 'permission', 'Tentative de suppression du message d’un tiers', { acteur: acteur.id, groupe: acces.groupe.id });
    return { error: 'Vous ne pouvez supprimer que vos propres messages.', code: 'DROITS' };
  }
  if (autorises.length === 0) return { supprimes: [] };
  const parModeration = autorises.some((m) => m.auteur_id !== acteur.id);
  const maintenant = new Date().toISOString();
  const { error } = await db().from('echanges_messages')
    .update({ supprime_at: maintenant, supprime_par: acteur.id, suppression_origine: parModeration ? 'moderation' : 'auteur' })
    .in('id', autorises.map((m) => m.id));
  if (error) return { error: 'Suppression impossible. Réessayez.', code: 'INVALIDE' };
  for (const m of autorises) {
    await db().rpc('echanges_annuler_tags_message', { p_message: m.id, p_motif: parModeration ? 'Message retiré par la modération' : 'Question supprimée par son auteur' });
  }
  // Une réponse d'enseignant supprimée rouvre la question qu'elle avait traitée.
  await db().from('echanges_tags').update({ statut: 'en_attente', repondu_at: null, reponse_message_id: null, traite_par: null })
    .in('reponse_message_id', autorises.map((m) => m.id)).eq('statut', 'traitee');
  await auditer({
    action: parModeration ? 'suppression_moderation' : 'suppression_auteur',
    acteurId: acteur.id, acteurRole: acteur.role, groupeId: acces.groupe.id,
    cibleUserId: autorises.length === 1 ? autorises[0].auteur_id : null,
    messageId: autorises.length === 1 ? autorises[0].id : null,
    details: {
      nombre: autorises.length,
      messages: autorises.map((m) => ({ id: m.id, auteur: m.auteur_id, extrait: extrait(m.contenu, 200), publie_le: m.created_at })),
    },
  });
  void diffuser(acces.groupe.topic, { t: 'retrait', ids: autorises.map((m) => m.id) });
  return { supprimes: autorises.map((m) => m.id) };
}

/* ─────────────────────────────── Réactions (§19) ─────────────────────────────── */

export async function reagir(acteur: Acteur, acces: AccesGroupe, id: string, emoji: string): Promise<{ ok: true } | ErreurEchanges> {
  const prm = await parametres();
  if (!acces.droits.reagir) return { error: 'Les réactions ne sont pas disponibles pour vous ici.', code: 'DROITS' };
  if (!prm.reactions.includes(emoji)) return { error: 'Réaction non disponible.', code: 'INVALIDE' };
  const { data } = await db().from('echanges_messages').select(COLONNES_MESSAGE).eq('id', id).eq('groupe_id', acces.groupe.id).maybeSingle();
  if (!data || !visible(data as MessageRow, acteur, acces) || (data as MessageRow).statut !== 'publie') return { error: 'Message introuvable.', code: 'INTROUVABLE' };
  const { data: deja } = await db().from('echanges_reactions').select('emoji').eq('message_id', id).eq('user_id', acteur.id).eq('emoji', emoji).maybeSingle();
  if (deja) await db().from('echanges_reactions').delete().eq('message_id', id).eq('user_id', acteur.id).eq('emoji', emoji);
  else await db().from('echanges_reactions').insert({ message_id: id, user_id: acteur.id, emoji });
  void diffuser(acces.groupe.topic, { t: 'maj', ids: [id] });
  return { ok: true };
}

/* ─────────────────────────────── Épinglage (§31-32, §118-119) ─────────────────────────────── */

export async function epingler(acteur: Acteur, acces: AccesGroupe, id: string, o: { epingle: boolean; avecQuestion?: boolean }): Promise<{ ok: true } | ErreurEchanges> {
  if (!acces.droits.epingler) return { error: 'Seuls les enseignants autorisés et l’équipe Major ECN épinglent une réponse.', code: 'DROITS' };
  const { data } = await db().from('echanges_messages').select(COLONNES_MESSAGE).eq('id', id).eq('groupe_id', acces.groupe.id).maybeSingle();
  const m = data as MessageRow | null;
  if (!m || m.supprime_at || m.statut !== 'publie') return { error: 'Message introuvable.', code: 'INTROUVABLE' };
  const maj = o.epingle
    ? { epingle_at: new Date().toISOString(), epingle_par: acteur.id, epingle_question_id: o.avecQuestion !== false ? m.reponse_a : null }
    : { epingle_at: null, epingle_par: null, epingle_question_id: null };
  await db().from('echanges_messages').update(maj).eq('id', id);
  await auditer({ action: o.epingle ? 'epinglage' : 'desepinglage', acteurId: acteur.id, acteurRole: acteur.role, groupeId: acces.groupe.id, messageId: id, details: { extrait: extrait(m.contenu, 160) } });
  void diffuser(acces.groupe.topic, { t: 'maj', ids: [id] });
  return { ok: true };
}

/* ─────────────────────────────── Signalement (§55-57) ─────────────────────────────── */

export async function signaler(acteur: Acteur, acces: AccesGroupe, id: string, motif: string, details: string | null): Promise<{ ok: true } | ErreurEchanges> {
  if (acces.role !== 'candidat' && acces.role !== 'enseignant') return { error: 'Action réservée aux participants.', code: 'DROITS' };
  const { data } = await db().from('echanges_messages').select(COLONNES_MESSAGE).eq('id', id).eq('groupe_id', acces.groupe.id).maybeSingle();
  const m = data as MessageRow | null;
  if (!m || !visible(m, acteur, acces)) return { error: 'Message introuvable.', code: 'INTROUVABLE' };
  if (m.auteur_id === acteur.id) return { error: 'Vous ne pouvez pas signaler votre propre message.', code: 'INVALIDE' };
  const mo = MOTIFS_SIGNALEMENT.includes(motif) ? motif : 'Autre';
  await db().from('echanges_signalements').upsert({
    message_id: id, groupe_id: acces.groupe.id, signale_par: acteur.id, motif: mo, details: (details ?? '').slice(0, 1000) || null,
  }, { onConflict: 'message_id,signale_par', ignoreDuplicates: true });
  // Aucune mention publique, aucun signal à l'auteur (§56).
  return { ok: true };
}

/* ─────────────────────── Lecture, accusés, règles, sourdine ─────────────────────── */

export async function marquerLu(acteur: Acteur, acces: AccesGroupe, canal: Canal, jusqua?: string | null): Promise<void> {
  const t = jusqua && Number.isFinite(new Date(jusqua).getTime()) ? new Date(Math.min(new Date(jusqua).getTime(), Date.now())).toISOString() : new Date().toISOString();
  const { data: l } = await db().from('echanges_lectures').select('dernier_lu_at').eq('groupe_id', acces.groupe.id).eq('user_id', acteur.id).eq('canal', canal).maybeSingle();
  if (l && l.dernier_lu_at >= t) return;
  await db().from('echanges_lectures').upsert({ groupe_id: acces.groupe.id, user_id: acteur.id, canal, dernier_lu_at: t }, { onConflict: 'groupe_id,user_id,canal' });
  // Les notifications de la cloche liées à ce groupe sont considérées comme lues.
  await db().from('pedago_notifications').update({ displayed_at: new Date().toISOString() })
    .eq('user_id', acteur.id).is('displayed_at', null)
    .in('group_key', [`echanges:messages:${acces.groupe.id}`, `echanges:annonces:${acces.groupe.id}`]);
}

export async function accuserLecture(acteur: Acteur, acces: AccesGroupe, id: string): Promise<{ ok: true } | ErreurEchanges> {
  const { data } = await db().from('echanges_messages').select('id, canal, accuse_lecture_requis, supprime_at, statut').eq('id', id).eq('groupe_id', acces.groupe.id).maybeSingle();
  if (!data || data.supprime_at || data.statut !== 'publie' || data.canal !== 'annonces') return { error: 'Annonce introuvable.', code: 'INTROUVABLE' };
  await db().from('echanges_accuses').upsert({ message_id: id, user_id: acteur.id }, { onConflict: 'message_id,user_id', ignoreDuplicates: true });
  return { ok: true };
}

export async function accepterRegles(acteur: Acteur, acces: AccesGroupe): Promise<void> {
  if (acces.role !== 'candidat') return;
  await db().from('echanges_membres').upsert({
    groupe_id: acces.groupe.id, user_id: acteur.id, source: acces.adhesion?.source ?? 'auto', statut: 'actif',
    regles_acceptees_at: new Date().toISOString(),
  }, { onConflict: 'groupe_id,user_id' });
  // Une acceptation vaut pour toutes les messageries de l'élève.
  await db().from('echanges_membres').update({ regles_acceptees_at: new Date().toISOString() }).eq('user_id', acteur.id).is('regles_acceptees_at', null);
}

export async function basculerSourdine(acteur: Acteur, acces: AccesGroupe, sourdine: boolean): Promise<void> {
  if (acces.role !== 'candidat') return;
  await db().from('echanges_membres').update({ sourdine }).eq('groupe_id', acces.groupe.id).eq('user_id', acteur.id);
}

/* ─────────────────────── Réponses importantes (§33, §119) ─────────────────────── */

export async function listerEpingles(acteur: Acteur, acces: AccesGroupe, f: {
  q?: string | null; enseignant?: string | null; specialiteId?: string | null; item?: number | null; depuis?: string | null; jusqua?: string | null;
}): Promise<{ message: MessageDTO; question: MessageDTO | null }[]> {
  const { analyserRequete } = await import('../recherche-texte');
  const g = acces.groupe;
  let q = filtreVisibles(db().from('echanges_messages').select(COLONNES_MESSAGE).eq('groupe_id', g.id), acteur, acces)
    .not('epingle_at', 'is', null).order('epingle_at', { ascending: false }).limit(200);
  const req = analyserRequete(f.q ?? '');
  if (req.tsquery) q = q.textSearch('recherche', req.tsquery, { config: 'french' });
  const item = f.item ?? req.item;
  if (item) q = q.eq('item_numero', item);
  if (f.specialiteId) q = q.eq('specialite_id', f.specialiteId);
  if (f.depuis) q = q.gte('created_at', f.depuis);
  if (f.jusqua) q = q.lte('created_at', f.jusqua);
  if (f.enseignant) {
    const { data: aff } = await db().from('echanges_enseignants').select('user_id').eq('id', f.enseignant).eq('groupe_id', g.id).maybeSingle();
    if (!aff) return [];
    q = q.eq('auteur_id', aff.user_id);
  }
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as MessageRow[];
  const qIds = [...new Set(rows.map((r) => r.epingle_question_id).filter((x): x is string => !!x))];
  const { data: qs } = qIds.length
    ? await db().from('echanges_messages').select(COLONNES_MESSAGE).in('id', qIds)
    : { data: [] };
  const questions = ((qs ?? []) as MessageRow[]).filter((r) => visible(r, acteur, acces));
  const [dtos, qdtos] = await Promise.all([versDTO(rows, acteur, acces), versDTO(questions, acteur, acces)]);
  const parId = new Map(qdtos.map((d) => [d.id, d]));
  return dtos.map((d, i) => ({ message: d, question: rows[i].epingle_question_id ? parId.get(rows[i].epingle_question_id as string) ?? null : null }));
}
