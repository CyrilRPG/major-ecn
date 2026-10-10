import 'server-only';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { copieReponseEmail, messageEnseignantEmail, relanceClientEmail } from '@/lib/email/cockpit';
import {
  cleEnvoi, delaiReprise, ENVOI_MAX_TENTATIVES, lienConversation, nomComplet, objetCopieReponse, objetMessageEnseignant,
  prenomDe, roleDansConversation, statutApresEnvoi, statutApresReponse, type StatutTache,
} from '../regles';
import { journaliser, notifier, type Db, type Moi } from './base';

export type Conversation = {
  id: string;
  owner_id: string;
  interlocuteur_type: 'enseignant' | 'eleve' | 'client';
  interlocuteur_id: string | null;
  interlocuteur_label: string;
  interlocuteur_email: string | null;
  sujet: string;
  mission: string | null;
  tache_id: string | null;
  suivie: boolean;
  archivee_at: string | null;
  dernier_message_at: string;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  auteur_id: string | null;
  sens: 'sortant' | 'entrant';
  corps: string;
  brouillon: boolean;
  cle_idempotence: string | null;
  redige_avec_ia: boolean;
  saisie_manuelle: boolean;
  envoye_at: string | null;
  lu_at: string | null;
  traite_at: string | null;
  created_at: string;
};

export const COLONNES_CONVERSATION =
  'id, owner_id, interlocuteur_type, interlocuteur_id, interlocuteur_label, interlocuteur_email, sujet, mission, tache_id, suivie, archivee_at, dernier_message_at, created_at';
export const COLONNES_MESSAGE =
  'id, conversation_id, auteur_id, sens, corps, brouillon, cle_idempotence, redige_avec_ia, saisie_manuelle, envoye_at, lu_at, traite_at, created_at';

/** Conversation + rôle de l'utilisateur, ou null : aucune fuite, même de l'existence du fil. */
export async function chargerConversation(d: Db, id: string, moi: Moi): Promise<{ conv: Conversation; role: 'proprietaire' | 'enseignant' } | null> {
  const { data } = await d.from('cockpit_conversations').select(COLONNES_CONVERSATION).eq('id', id).maybeSingle();
  if (!data) return null;
  const role = roleDansConversation(data as Conversation, moi.id, moi.role);
  return role ? { conv: data as Conversation, role } : null;
}

/** Conversations de l'utilisateur : les siennes et celles où il est l'enseignant interlocuteur. */
export async function conversationsDe(d: Db, moi: Moi): Promise<(Conversation & { role: 'proprietaire' | 'enseignant' })[]> {
  const [a, b] = await Promise.all([
    d.from('cockpit_conversations').select(COLONNES_CONVERSATION).eq('owner_id', moi.id).order('dernier_message_at', { ascending: false }).limit(500),
    d.from('cockpit_conversations').select(COLONNES_CONVERSATION).eq('interlocuteur_id', moi.id).eq('interlocuteur_type', 'enseignant')
      .neq('owner_id', moi.id).order('dernier_message_at', { ascending: false }).limit(500),
  ]);
  return [
    ...((a.data ?? []) as Conversation[]).map((c) => ({ ...c, role: 'proprietaire' as const })),
    ...((b.data ?? []) as Conversation[]).map((c) => ({ ...c, role: 'enseignant' as const })),
  ].sort((x, y) => (x.dernier_message_at < y.dernier_message_at ? 1 : -1));
}

/* ------------------------------------------------------------------ */
/* Envoi d'un message (§7) et réponse de l'enseignant (§8)             */
/* ------------------------------------------------------------------ */

export type ResultatEnvoi =
  | { ok: true; message: Message; doublon: boolean }
  | { ok: false; erreur: string };

/**
 * Enregistre le message dans le fil (source de vérité), PUIS déclenche les
 * envois externes. Une panne d'e-mail ne fait jamais disparaître le message
 * (C15) ; un rejeu avec la même clé ne crée ni second message ni second
 * e-mail (C12).
 */
export async function publierMessage(
  d: Db,
  moi: Moi,
  o: {
    conversationId: string;
    corps: string;
    cle: string;
    redigeAvecIa?: boolean;
    /** Brouillon existant à transformer en message envoyé. */
    brouillonId?: string | null;
    /** Réponse reçue hors plateforme (téléphone, e-mail d'un client) saisie par le propriétaire. */
    saisieManuelleEntrante?: boolean;
    /** Pièces jointes déjà téléversées (chemins validés par l'appelant). */
    pieces?: { chemin: string; nom: string; taille: number; mime: string | null }[];
  },
): Promise<ResultatEnvoi> {
  const acces = await chargerConversation(d, o.conversationId, moi);
  if (!acces) return { ok: false, erreur: 'Conversation introuvable.' };
  const { conv, role } = acces;
  const corps = o.corps.trim();
  if (!corps) return { ok: false, erreur: 'Le message est vide.' };
  if (corps.length > 20000) return { ok: false, erreur: 'Message trop long (20 000 caractères au plus).' };

  // Rejeu : le message existe déjà sous cette clé → on le renvoie tel quel.
  const joindre = async (messageId: string) => {
    if (!o.pieces || o.pieces.length === 0) return;
    await d.from('cockpit_pieces_jointes').upsert(
      o.pieces.map((p) => ({ message_id: messageId, chemin: p.chemin, nom: p.nom, taille: p.taille, mime: p.mime })),
      { onConflict: 'chemin', ignoreDuplicates: true },
    );
  };
  const { data: deja } = await d.from('cockpit_messages').select(COLONNES_MESSAGE).eq('cle_idempotence', o.cle).maybeSingle();
  if (deja) {
    if ((deja as Message).conversation_id !== conv.id) return { ok: false, erreur: 'Clé d’envoi déjà utilisée.' };
    // Rejeu après une coupure : les pièces jointes manquantes sont rattachées, sans nouvel envoi.
    await joindre((deja as Message).id);
    return { ok: true, message: deja as Message, doublon: true };
  }

  const entrant = role === 'enseignant' || (role === 'proprietaire' && !!o.saisieManuelleEntrante);
  const maintenant = new Date().toISOString();
  const champs = {
    conversation_id: conv.id,
    auteur_id: role === 'proprietaire' && o.saisieManuelleEntrante ? conv.interlocuteur_id : moi.id,
    sens: entrant ? 'entrant' : 'sortant',
    corps,
    brouillon: false,
    cle_idempotence: o.cle,
    redige_avec_ia: !!o.redigeAvecIa,
    saisie_manuelle: !!o.saisieManuelleEntrante,
    envoye_at: maintenant,
    updated_at: maintenant,
  };

  let message: Message | null = null;
  if (o.brouillonId && role === 'proprietaire' && !entrant) {
    const { data } = await d
      .from('cockpit_messages')
      .update(champs)
      .eq('id', o.brouillonId)
      .eq('conversation_id', conv.id)
      .eq('brouillon', true)
      .select(COLONNES_MESSAGE)
      .maybeSingle();
    message = (data as Message | null) ?? null;
  }
  if (!message) {
    const { data, error } = await d.from('cockpit_messages').insert(champs).select(COLONNES_MESSAGE).single();
    if (error) {
      // Deux clics simultanés : la contrainte unique a tranché, on relit le gagnant.
      if (error.code === '23505') {
        const { data: gagnant } = await d.from('cockpit_messages').select(COLONNES_MESSAGE).eq('cle_idempotence', o.cle).maybeSingle();
        if (gagnant) return { ok: true, message: gagnant as Message, doublon: true };
      }
      return { ok: false, erreur: 'Le message n’a pas pu être enregistré.' };
    }
    message = data as Message;
  }

  // Pièces jointes AVANT les envois : l'e-mail annonce leur nombre.
  await joindre(message.id);
  await d.from('cockpit_conversations').update({ dernier_message_at: maintenant, archivee_at: null }).eq('id', conv.id);

  // Tâche liée : « En attente de réponse » après un envoi, « Réponse reçue » après une réponse (C13).
  if (conv.tache_id) {
    const { data: t } = await d.from('cockpit_taches').select('id, statut').eq('id', conv.tache_id).maybeSingle();
    if (t) {
      const suivant = entrant ? statutApresReponse(t.statut as StatutTache) : statutApresEnvoi(t.statut as StatutTache);
      if (suivant !== t.statut) {
        await d.from('cockpit_taches').update({ statut: suivant, updated_at: maintenant }).eq('id', t.id);
        await journaliser(d, { objet_type: 'tache', objet_id: t.id, acteur_id: moi.id, action: 'statut', details: { de: t.statut, vers: suivant, via: 'messagerie' } });
      }
    }
  }

  await journaliser(d, {
    objet_type: 'conversation', objet_id: conv.id, acteur_id: moi.id,
    action: entrant ? (o.saisieManuelleEntrante ? 'reponse_saisie' : 'reponse') : 'envoi',
    details: { message_id: message.id, ia: !!o.redigeAvecIa },
    audit: true,
  });

  // Envois externes : une ligne par canal et par rôle (contrainte unique).
  const envois: { canal: 'email' | 'push'; role: 'destinataire' | 'copie_proprietaire' }[] = [];
  if (!entrant) {
    envois.push({ canal: 'email', role: 'destinataire' });
    if (conv.interlocuteur_type === 'enseignant') envois.push({ canal: 'push', role: 'destinataire' });
  } else if (!o.saisieManuelleEntrante) {
    // EXIGENCE PRIORITAIRE (§8) : copie e-mail complète au propriétaire.
    envois.push({ canal: 'email', role: 'copie_proprietaire' });
    envois.push({ canal: 'push', role: 'copie_proprietaire' });
  }
  if (envois.length > 0) {
    await d.from('cockpit_envois').upsert(
      envois.map((e) => ({ message_id: message!.id, canal: e.canal, role: e.role })),
      { onConflict: 'message_id,canal,role', ignoreDuplicates: true },
    );
    const { data: lignes } = await d.from('cockpit_envois').select('id').eq('message_id', message.id).in('statut', ['en_file', 'echec']);
    for (const l of (lignes ?? []) as { id: string }[]) await traiterEnvoi(d, l.id);
  }

  // Notification interne : réponse → propriétaire ; message → enseignant.
  if (entrant && !o.saisieManuelleEntrante) {
    await notifier(d, {
      user_id: conv.owner_id, genre: 'reponse',
      titre: `Réponse de ${conv.interlocuteur_label}`,
      corps: corps.slice(0, 160),
      lien: `/admin/cockpit/messagerie/${conv.id}`,
      group_key: `reponse:${conv.id}`,
    });
  } else if (!entrant && conv.interlocuteur_type === 'enseignant' && conv.interlocuteur_id) {
    await notifier(d, {
      user_id: conv.interlocuteur_id, genre: 'message',
      titre: `Nouveau message : ${conv.sujet}`,
      corps: corps.slice(0, 160),
      lien: `/admin/cockpit/messagerie/${conv.id}`,
      group_key: `message:${conv.id}`,
    });
  }

  return { ok: true, message, doublon: false };
}

/* ------------------------------------------------------------------ */
/* Envois externes (e-mail, push) — reprise sans doublon                */
/* ------------------------------------------------------------------ */

type EnvoiLigne = {
  id: string; message_id: string; canal: 'email' | 'push'; role: 'destinataire' | 'copie_proprietaire';
  statut: string; tentatives: number; updated_at: string;
};

/**
 * Exécute un envoi. La clé d'idempotence transmise au fournisseur est la même
 * à chaque tentative : un e-mail parti mais mal acquitté n'est pas dupliqué.
 */
export async function traiterEnvoi(d: Db, envoiId: string): Promise<'envoye' | 'echec' | 'non_disponible' | 'ignore'> {
  const { data: envoi } = await d.from('cockpit_envois').select('id, message_id, canal, role, statut, tentatives, updated_at').eq('id', envoiId).maybeSingle();
  const e = envoi as EnvoiLigne | null;
  if (!e || e.statut === 'envoye' || e.statut === 'non_disponible') return 'ignore';
  if (e.tentatives >= ENVOI_MAX_TENTATIVES) return 'ignore';

  const { data: msg } = await d.from('cockpit_messages').select(COLONNES_MESSAGE).eq('id', e.message_id).maybeSingle();
  if (!msg) return 'ignore';
  const message = msg as Message;
  const { data: c } = await d.from('cockpit_conversations').select(COLONNES_CONVERSATION).eq('id', message.conversation_id).maybeSingle();
  if (!c) return 'ignore';
  const conv = c as Conversation;
  const { count: pj } = await d.from('cockpit_pieces_jointes').select('id', { count: 'exact', head: true }).eq('message_id', message.id);

  const maj = async (champs: Record<string, unknown>) =>
    d.from('cockpit_envois').update({ ...champs, updated_at: new Date().toISOString() }).eq('id', e.id);

  if (e.canal === 'push') {
    // Aucun service de push n'est raccordé à la messagerie administrative :
    // on le trace honnêtement plutôt que de prétendre l'avoir envoyé (C08).
    await maj({ statut: 'non_disponible', derniere_erreur: 'Notification push non disponible pour ce compte.' });
    return 'non_disponible';
  }

  const ids = [conv.owner_id, conv.interlocuteur_id, message.auteur_id].filter(Boolean) as string[];
  const { data: profils } = await d.from('profiles').select('id, first_name, last_name, email').in('id', ids);
  const parId = new Map(((profils ?? []) as { id: string; first_name: string | null; last_name: string | null; email: string | null }[]).map((p) => [p.id, p]));
  const proprietaire = parId.get(conv.owner_id);
  const lien = lienConversation(siteUrl(), conv.id);

  let destinataire: string | null = null;
  let mail: { subject: string; html: string; text: string };
  if (e.role === 'destinataire') {
    const interlocuteur = conv.interlocuteur_id ? parId.get(conv.interlocuteur_id) : undefined;
    destinataire = interlocuteur?.email ?? conv.interlocuteur_email;
    if (conv.interlocuteur_type === 'enseignant') {
      mail = messageEnseignantEmail({
        subject: objetMessageEnseignant(conv.sujet),
        prenomDestinataire: prenomDe(interlocuteur) || conv.interlocuteur_label,
        expediteur: nomComplet(proprietaire) || 'L’équipe Major ECN',
        sujet: conv.sujet,
        corps: message.corps,
        lien,
        piecesJointes: pj ?? 0,
      });
    } else {
      mail = relanceClientEmail({ subject: objetMessageEnseignant(conv.sujet), corps: message.corps });
    }
  } else {
    destinataire = proprietaire?.email ?? null;
    const auteur = message.auteur_id ? parId.get(message.auteur_id) : undefined;
    let tache: string | null = null;
    if (conv.tache_id) {
      const { data: t } = await d.from('cockpit_taches').select('titre').eq('id', conv.tache_id).maybeSingle();
      tache = t?.titre ?? null;
    }
    mail = copieReponseEmail({
      subject: objetCopieReponse(prenomDe(auteur) || conv.interlocuteur_label, conv.sujet),
      prenomProprietaire: prenomDe(proprietaire),
      auteur: nomComplet(auteur) || conv.interlocuteur_label,
      auteurEmail: auteur?.email ?? null,
      sujet: conv.sujet,
      dateIso: message.envoye_at ?? message.created_at,
      corps: message.corps,
      lien,
      tache,
      piecesJointes: pj ?? 0,
    });
  }

  if (!destinataire) {
    await maj({ statut: 'echec', tentatives: ENVOI_MAX_TENTATIVES, derniere_erreur: 'Aucune adresse e-mail pour ce destinataire.' });
    return 'echec';
  }

  try {
    const r = await sendEmail({
      to: destinataire,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      idempotencyKey: cleEnvoi(e.id),
      sansBcc: true,
      timeoutMs: 15_000,
    });
    if (r.ok) {
      await maj({ statut: 'envoye', destinataire, objet: mail.subject, fournisseur_id: r.id, tentatives: e.tentatives + 1, envoye_at: new Date().toISOString(), derniere_erreur: null });
      return 'envoye';
    }
    await maj({ statut: 'echec', destinataire, objet: mail.subject, tentatives: e.tentatives + 1, derniere_erreur: r.error.slice(0, 500) });
  } catch (err) {
    await maj({ statut: 'echec', destinataire, objet: mail.subject, tentatives: e.tentatives + 1, derniere_erreur: (err instanceof Error ? err.message : String(err)).slice(0, 500) });
  }
  await journaliser(d, { objet_type: 'envoi', objet_id: e.id, acteur_id: null, action: 'echec_email', details: { message_id: e.message_id, role: e.role }, audit: true });
  return 'echec';
}

/** Reprise des envois en échec (balayage) : délai croissant, plafond de tentatives. */
export async function reprendreEnvois(d: Db): Promise<{ repris: number; envoyes: number }> {
  const { data } = await d
    .from('cockpit_envois')
    .select('id, statut, tentatives, updated_at')
    .in('statut', ['en_file', 'echec'])
    .eq('canal', 'email')
    .lt('tentatives', ENVOI_MAX_TENTATIVES)
    .order('updated_at')
    .limit(50);
  let repris = 0;
  let envoyes = 0;
  const maintenant = Date.now();
  for (const e of (data ?? []) as EnvoiLigne[]) {
    if (e.statut === 'echec' && maintenant - new Date(e.updated_at).getTime() < delaiReprise(e.tentatives)) continue;
    if (e.statut === 'en_file' && maintenant - new Date(e.updated_at).getTime() < 60_000) continue;
    repris++;
    if ((await traiterEnvoi(d, e.id)) === 'envoye') envoyes++;
  }
  return { repris, envoyes };
}
