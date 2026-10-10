'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { instantParis } from '@/lib/agenda/planning';
import { contexteCockpit, FACULTE, journaliser } from '@/lib/cockpit/server/base';
import { chargerTache } from '@/lib/cockpit/server/taches';
import {
  chargerConversation, COLONNES_MESSAGE, publierMessage, type Message,
} from '@/lib/cockpit/server/messagerie';
import { assistantCockpit, brouillonIa, suggestionApresReponse, type ContexteIa } from '@/lib/cockpit/server/ia';
import { ACTIONS_IA, nomComplet, peut, prenomDe, TONS } from '@/lib/cockpit/regles';

/**
 * Messagerie administrative privée (§5 à §9) et rédaction assistée (§6).
 * L'envoi n'a lieu que sur action explicite de l'administrateur (C05).
 */

type R<T = undefined> = { ok: true; data?: T } | { ok: false; erreur: string };

const rafraichir = (id?: string) => {
  revalidatePath('/admin/cockpit', 'layout');
  if (id) revalidatePath(`/admin/cockpit/messagerie/${id}`);
};

const ouvertureSchema = z.object({
  interlocuteur_type: z.enum(['enseignant', 'eleve', 'client']),
  interlocuteur_id: z.string().uuid().nullish(),
  interlocuteur_label: z.string().trim().max(200).nullish(),
  interlocuteur_email: z.string().trim().email('Adresse e-mail invalide.').max(320).nullish().or(z.literal('').transform(() => null)),
  sujet: z.string().trim().min(1, 'Indiquez le sujet.').max(300),
  mission: z.string().trim().max(1000).nullish(),
  tache_id: z.string().uuid().nullish(),
});

/**
 * Ouvre (ou retrouve) une conversation. Depuis une tâche liée à un
 * enseignant, le bouton « Écrire » pré-remplit destinataire, sujet et mission
 * et rouvre le même fil s'il existe déjà (C04).
 */
export async function ouvrirConversation(input: z.input<typeof ouvertureSchema>): Promise<R<{ id: string }>> {
  const { moi, db: d } = await contexteCockpit();
  const p = ouvertureSchema.safeParse(input);
  if (!p.success) return { ok: false, erreur: p.error.issues[0]?.message ?? 'Saisie invalide.' };
  const v = p.data;

  if (v.tache_id) {
    const acces = await chargerTache(d, v.tache_id, moi.id);
    if (!acces || !peut(acces.niveau, 'modification')) return { ok: false, erreur: 'Tâche introuvable.' };
  }

  let label = v.interlocuteur_label ?? '';
  let email = v.interlocuteur_email ?? null;
  if (v.interlocuteur_id) {
    const { data: prof } = await d.from('profiles').select('id, role, first_name, last_name, email, faculte_id').eq('id', v.interlocuteur_id).maybeSingle();
    if (!prof) return { ok: false, erreur: 'Destinataire introuvable.' };
    if (v.interlocuteur_type === 'enseignant' && prof.role !== 'professor' && prof.role !== 'admin') {
      return { ok: false, erreur: 'Ce compte n’est pas un compte enseignant.' };
    }
    if (v.interlocuteur_type === 'eleve' && prof.role !== 'student') {
      return { ok: false, erreur: 'Ce compte n’est pas un compte élève.' };
    }
    label = nomComplet(prof) || label;
    email = prof.email ?? email;
  }
  if (v.interlocuteur_type === 'enseignant' && !v.interlocuteur_id) return { ok: false, erreur: 'Choisissez l’enseignant destinataire.' };
  if (v.interlocuteur_type !== 'enseignant' && !email) return { ok: false, erreur: 'Une adresse e-mail est nécessaire pour écrire à un élève ou un client.' };
  if (!label) label = email ?? 'Destinataire';

  // Même tâche + même destinataire : on rouvre le fil existant.
  if (v.tache_id) {
    let q = d.from('cockpit_conversations').select('id').eq('owner_id', moi.id).eq('tache_id', v.tache_id);
    q = v.interlocuteur_id ? q.eq('interlocuteur_id', v.interlocuteur_id) : q.eq('interlocuteur_email', email);
    const { data: existante } = await q.limit(1).maybeSingle();
    if (existante) return { ok: true, data: { id: existante.id } };
  }

  const { data, error } = await d.from('cockpit_conversations').insert({
    owner_id: moi.id,
    interlocuteur_type: v.interlocuteur_type,
    interlocuteur_id: v.interlocuteur_id ?? null,
    interlocuteur_label: label,
    interlocuteur_email: email,
    sujet: v.sujet,
    mission: v.mission || null,
    tache_id: v.tache_id ?? null,
  }).select('id').single();
  if (error || !data) return { ok: false, erreur: 'La conversation n’a pas pu être créée.' };
  await journaliser(d, { objet_type: 'conversation', objet_id: data.id, acteur_id: moi.id, action: 'creation', details: { type: v.interlocuteur_type, tache: v.tache_id ?? null }, audit: true });
  rafraichir();
  return { ok: true, data: { id: data.id } };
}

const pieceSchema = z.object({
  chemin: z.string().min(3).max(500),
  nom: z.string().min(1).max(200),
  taille: z.number().int().min(1).max(15 * 1024 * 1024),
  mime: z.string().max(120).nullish(),
});

export async function envoyerMessage(input: {
  conversationId: string;
  corps: string;
  cle: string;
  brouillonId?: string | null;
  redigeAvecIa?: boolean;
  pieces?: z.input<typeof pieceSchema>[];
}): Promise<R<{ messageId: string; doublon: boolean }>> {
  const { moi, db: d } = await contexteCockpit();
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(input.cle)) return { ok: false, erreur: 'Clé d’envoi invalide.' };
  const pieces = z.array(pieceSchema).max(10).safeParse(input.pieces ?? []);
  if (!pieces.success) return { ok: false, erreur: 'Pièce jointe invalide.' };
  // Une pièce jointe ne peut venir que du dossier de téléversement de l'auteur.
  if (pieces.data.some((p) => !p.chemin.startsWith(`${moi.id}/`) || p.chemin.includes('..'))) {
    return { ok: false, erreur: 'Pièce jointe refusée.' };
  }
  const r = await publierMessage(d, moi, {
    conversationId: input.conversationId, corps: input.corps, cle: input.cle,
    brouillonId: input.brouillonId ?? null, redigeAvecIa: !!input.redigeAvecIa,
    pieces: pieces.data.map((p) => ({ chemin: p.chemin, nom: p.nom, taille: p.taille, mime: p.mime ?? null })),
  });
  if (!r.ok) return r;
  rafraichir(input.conversationId);
  return { ok: true, data: { messageId: r.message.id, doublon: r.doublon } };
}

/** Réponse reçue hors plateforme (téléphone, e-mail d'un client) consignée dans le fil. */
export async function consignerReponse(conversationId: string, corps: string): Promise<R> {
  const { moi, db: d } = await contexteCockpit();
  const acces = await chargerConversation(d, conversationId, moi);
  if (!acces || acces.role !== 'proprietaire') return { ok: false, erreur: 'Conversation introuvable.' };
  const r = await publierMessage(d, moi, { conversationId, corps, cle: `manuel-${randomUUID()}`, saisieManuelleEntrante: true });
  if (!r.ok) return r;
  rafraichir(conversationId);
  return { ok: true };
}

export async function enregistrerBrouillon(conversationId: string, corps: string, brouillonId?: string | null): Promise<R<{ id: string }>> {
  const { moi, db: d } = await contexteCockpit();
  const acces = await chargerConversation(d, conversationId, moi);
  if (!acces || acces.role !== 'proprietaire') return { ok: false, erreur: 'Conversation introuvable.' };
  const texte = corps.trim();
  if (!texte) return { ok: false, erreur: 'Le brouillon est vide.' };
  if (brouillonId) {
    const { data } = await d.from('cockpit_messages').update({ corps: texte.slice(0, 20000), updated_at: new Date().toISOString() })
      .eq('id', brouillonId).eq('conversation_id', conversationId).eq('brouillon', true).select('id').maybeSingle();
    if (data) {
      rafraichir(conversationId);
      return { ok: true, data: { id: data.id } };
    }
  }
  const { data, error } = await d.from('cockpit_messages').insert({
    conversation_id: conversationId, auteur_id: moi.id, sens: 'sortant', corps: texte.slice(0, 20000), brouillon: true,
  }).select('id').single();
  if (error || !data) return { ok: false, erreur: 'Le brouillon n’a pas été enregistré.' };
  rafraichir(conversationId);
  return { ok: true, data: { id: data.id } };
}

export async function supprimerBrouillon(brouillonId: string): Promise<R> {
  const { moi, db: d } = await contexteCockpit();
  const { data: m } = await d.from('cockpit_messages').select('id, conversation_id, brouillon').eq('id', brouillonId).maybeSingle();
  if (!m || !m.brouillon) return { ok: false, erreur: 'Brouillon introuvable.' };
  const acces = await chargerConversation(d, m.conversation_id, moi);
  if (!acces || acces.role !== 'proprietaire') return { ok: false, erreur: 'Brouillon introuvable.' };
  await d.from('cockpit_messages').delete().eq('id', brouillonId).eq('brouillon', true);
  rafraichir(m.conversation_id);
  return { ok: true };
}

/** Le propriétaire a traité les réponses du fil (elles quittent « Réponses reçues »). */
export async function marquerTraite(conversationId: string): Promise<R> {
  const { moi, db: d } = await contexteCockpit();
  const acces = await chargerConversation(d, conversationId, moi);
  if (!acces || acces.role !== 'proprietaire') return { ok: false, erreur: 'Conversation introuvable.' };
  await d.from('cockpit_messages').update({ traite_at: new Date().toISOString() })
    .eq('conversation_id', conversationId).eq('sens', 'entrant').is('traite_at', null);
  await d.from('cockpit_notifications').update({ lu_at: new Date().toISOString() })
    .eq('user_id', moi.id).eq('group_key', `reponse:${conversationId}`);
  rafraichir(conversationId);
  return { ok: true };
}

export async function archiverConversation(conversationId: string, archiver: boolean): Promise<R> {
  const { moi, db: d } = await contexteCockpit();
  const acces = await chargerConversation(d, conversationId, moi);
  if (!acces || acces.role !== 'proprietaire') return { ok: false, erreur: 'Conversation introuvable.' };
  await d.from('cockpit_conversations').update({ archivee_at: archiver ? new Date().toISOString() : null }).eq('id', conversationId);
  rafraichir(conversationId);
  return { ok: true };
}

export async function suivreConversation(conversationId: string, suivie: boolean): Promise<R> {
  const { moi, db: d } = await contexteCockpit();
  const acces = await chargerConversation(d, conversationId, moi);
  if (!acces || acces.role !== 'proprietaire') return { ok: false, erreur: 'Conversation introuvable.' };
  await d.from('cockpit_conversations').update({ suivie }).eq('id', conversationId);
  rafraichir(conversationId);
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Pièces jointes : téléversement direct vers le seau privé            */
/* ------------------------------------------------------------------ */

const TYPES_AUTORISES = /^(application\/pdf|image\/(png|jpeg|webp|gif)|text\/plain|application\/(msword|vnd\.openxmlformats-officedocument\.[a-z.]+|vnd\.ms-excel|vnd\.ms-powerpoint|zip))$/;

export async function preparerTeleversement(nom: string, taille: number, mime: string): Promise<R<{ chemin: string; url: string }>> {
  const { moi, db: d } = await contexteCockpit();
  if (!Number.isFinite(taille) || taille < 1 || taille > 15 * 1024 * 1024) return { ok: false, erreur: 'Fichier trop volumineux (15 Mo au plus).' };
  if (!TYPES_AUTORISES.test(mime)) return { ok: false, erreur: 'Type de fichier non autorisé (PDF, image, texte, Word, Excel, PowerPoint, ZIP).' };
  const propre = nom.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9._-]+/g, '_').slice(-120) || 'fichier';
  const chemin = `${moi.id}/${randomUUID()}/${propre}`;
  const { data, error } = await d.storage.from('cockpit').createSignedUploadUrl(chemin);
  if (error || !data) return { ok: false, erreur: 'Le téléversement n’a pas pu être préparé.' };
  return { ok: true, data: { chemin, url: data.signedUrl } };
}

/** Lien de téléchargement temporaire, après contrôle d'accès à la conversation. */
export async function lienPieceJointe(pieceId: string): Promise<R<{ url: string }>> {
  const { moi, db: d } = await contexteCockpit();
  const { data: pj } = await d.from('cockpit_pieces_jointes').select('id, chemin, nom, message_id').eq('id', pieceId).maybeSingle();
  if (!pj) return { ok: false, erreur: 'Pièce jointe introuvable.' };
  const { data: m } = await d.from('cockpit_messages').select('conversation_id, brouillon').eq('id', pj.message_id).maybeSingle();
  if (!m || m.brouillon) return { ok: false, erreur: 'Pièce jointe introuvable.' };
  const acces = await chargerConversation(d, m.conversation_id, moi);
  if (!acces) return { ok: false, erreur: 'Pièce jointe introuvable.' };
  const { data } = await d.storage.from('cockpit').createSignedUrl(pj.chemin, 300, { download: pj.nom });
  if (!data?.signedUrl) return { ok: false, erreur: 'Lien indisponible.' };
  return { ok: true, data: { url: data.signedUrl } };
}

/* ------------------------------------------------------------------ */
/* Rédaction avec l'IA (§6) — aucun envoi automatique                  */
/* ------------------------------------------------------------------ */

export async function redigerAvecIa(input: {
  action: (typeof ACTIONS_IA)[number];
  ton: (typeof TONS)[number];
  consigne?: string | null;
  texte?: string | null;
  conversationId?: string | null;
  tacheId?: string | null;
  demandeId?: string | null;
  reclamationId?: string | null;
  destinataire?: string | null;
}): Promise<R<{ texte: string }>> {
  if (!(ACTIONS_IA as readonly string[]).includes(input.action) || !(TONS as readonly string[]).includes(input.ton)) {
    return { ok: false, erreur: 'Demande invalide.' };
  }
  const { moi, db: d } = await contexteCockpit();
  const contexte: ContexteIa = {};
  const { data: reglages } = await d.from('cockpit_reglages').select('signature').eq('user_id', moi.id).maybeSingle();
  contexte.signature = reglages?.signature ?? null;

  if (input.conversationId) {
    const acces = await chargerConversation(d, input.conversationId, moi);
    if (!acces) return { ok: false, erreur: 'Conversation introuvable.' };
    const { conv } = acces;
    contexte.sujet = conv.sujet;
    contexte.mission = conv.mission;
    if (conv.interlocuteur_id) {
      const { data: p } = await d.from('profiles').select('first_name, email').eq('id', conv.interlocuteur_id).maybeSingle();
      contexte.prenom = prenomDe(p) || null;
    } else {
      contexte.prenom = conv.interlocuteur_label.split(/\s+/)[0] ?? null;
    }
    const { data: ms } = await d.from('cockpit_messages').select('sens, corps').eq('conversation_id', conv.id).eq('brouillon', false)
      .order('created_at', { ascending: false }).limit(6);
    contexte.echanges = ((ms ?? []) as { sens: string; corps: string }[]).reverse()
      .map((m) => ({ de: (m.sens === 'sortant') === (acces.role === 'proprietaire') ? 'moi' as const : 'interlocuteur' as const, texte: m.corps }));
    if (conv.tache_id) {
      const t = await chargerTache(d, conv.tache_id, moi.id);
      if (t) {
        contexte.mission = contexte.mission ?? t.tache.titre;
        contexte.echeance = t.tache.echeance;
      }
    }
  }
  if (input.tacheId) {
    const t = await chargerTache(d, input.tacheId, moi.id);
    if (!t) return { ok: false, erreur: 'Tâche introuvable.' };
    contexte.mission = t.tache.titre;
    contexte.echeance = t.tache.echeance;
    if (!contexte.prenom && t.tache.lien_label) contexte.prenom = t.tache.lien_label.replace(/^(dr|pr|mme|m)\.?\s+/i, '').split(/\s+/)[0];
  }
  if (input.demandeId) {
    const { data: dem } = await d.from('cockpit_demandes').select('created_by, assignee_id, client_label, motif, resume, nature, sous_type, echeance, faculte_id').eq('id', input.demandeId).maybeSingle();
    if (!dem || dem.faculte_id !== FACULTE || !(moi.estAdmin || dem.created_by === moi.id || dem.assignee_id === moi.id)) return { ok: false, erreur: 'Demande introuvable.' };
    contexte.prenom = contexte.prenom ?? dem.client_label.replace(/^(dr|pr|mme|m)\.?\s+/i, '').split(/\s+/)[0];
    contexte.dossier = `Demande ${dem.nature}${dem.sous_type ? ` (${dem.sous_type})` : ''} : ${dem.motif}. ${dem.resume ?? ''}`;
  }
  if (input.reclamationId) {
    const { data: rec } = await d.from('cockpit_reclamations').select('created_by, assignee_id, candidat_label, sujet, description, categorie, faculte_id').eq('id', input.reclamationId).maybeSingle();
    if (!rec || rec.faculte_id !== FACULTE || !(moi.estAdmin || rec.created_by === moi.id || rec.assignee_id === moi.id)) return { ok: false, erreur: 'Réclamation introuvable.' };
    contexte.prenom = contexte.prenom ?? rec.candidat_label.replace(/^(dr|pr|mme|m)\.?\s+/i, '').split(/\s+/)[0];
    contexte.dossier = `Réclamation (${rec.categorie}) : ${rec.sujet}. ${rec.description ?? ''}`;
  }
  if (input.destinataire && !contexte.prenom) contexte.prenom = input.destinataire.split(/\s+/)[0];

  const r = await brouillonIa({ action: input.action, ton: input.ton, consigne: input.consigne, texte: input.texte, contexte, facturerA: moi.id });
  if (!r.ok) return r;
  await journaliser(d, { objet_type: 'ia', objet_id: input.conversationId ?? input.tacheId ?? input.demandeId ?? input.reclamationId ?? 'libre', acteur_id: moi.id, action: `ia_${input.action}`, audit: true });
  return { ok: true, data: { texte: r.texte } };
}

/** Assistant libre du cockpit : la demande et, si choisi, le résumé d'un dossier autorisé. */
export async function demanderAssistant(consigne: string, dossier?: { type: 'reclamation' | 'demande' | 'amelioration'; id: string } | null): Promise<R<{ texte: string }>> {
  const { moi, db: d } = await contexteCockpit();
  const c = consigne.trim();
  if (!c) return { ok: false, erreur: 'Écrivez votre demande.' };
  let texteDossier: string | null = null;
  if (dossier) {
    const table = dossier.type === 'reclamation' ? 'cockpit_reclamations' : dossier.type === 'demande' ? 'cockpit_demandes' : 'cockpit_ameliorations';
    const { data } = await d.from(table).select('*').eq('id', dossier.id).maybeSingle();
    const autorise = data && data.faculte_id === FACULTE && (moi.estAdmin || data.created_by === moi.id || data.assignee_id === moi.id || data.responsable_id === moi.id);
    if (!autorise) return { ok: false, erreur: 'Dossier introuvable.' };
    // Champs autorisés seulement : pas d'e-mail ni de téléphone (client_contact).
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client_contact: _c, client_id: _i, candidat_id: _k, created_by: _b, assignee_id: _a, responsable_id: _r, faculte_id: _f, ...sur } = data as Record<string, unknown>;
    texteDossier = JSON.stringify(sur);
    if (dossier.type === 'amelioration') {
      const { data: recl } = await d.from('cockpit_reclamations').select('sujet, specialite, categorie, description').eq('amelioration_id', dossier.id).limit(20);
      texteDossier += `\nRéclamations rattachées : ${JSON.stringify(recl ?? [])}`;
    }
  }
  const r = await assistantCockpit(c, texteDossier, moi.id);
  if (r.ok) await journaliser(d, { objet_type: 'ia', objet_id: dossier?.id ?? 'libre', acteur_id: moi.id, action: 'ia_assistant', audit: true });
  return r.ok ? { ok: true, data: { texte: r.texte } } : r;
}

/** Suggestion facultative après une réponse (§9) : jamais appliquée sans confirmation. */
export async function suggererSuite(messageId: string): Promise<R<{ texte: string; date: string | null; tacheId: string | null }>> {
  const { moi, db: d } = await contexteCockpit();
  const { data: m } = await d.from('cockpit_messages').select(COLONNES_MESSAGE).eq('id', messageId).maybeSingle();
  if (!m || (m as Message).sens !== 'entrant') return { ok: false, erreur: 'Message introuvable.' };
  const acces = await chargerConversation(d, (m as Message).conversation_id, moi);
  if (!acces || acces.role !== 'proprietaire') return { ok: false, erreur: 'Message introuvable.' };
  let echeance: string | null = null;
  if (acces.conv.tache_id) {
    const t = await chargerTache(d, acces.conv.tache_id, moi.id);
    echeance = t?.tache.echeance ?? null;
  }
  const s = await suggestionApresReponse((m as Message).corps, echeance, instantParis().date, moi.id);
  if (!s) return { ok: true, data: { texte: 'Aucune date annoncée dans cette réponse.', date: null, tacheId: acces.conv.tache_id } };
  return { ok: true, data: { ...s, tacheId: acces.conv.tache_id } };
}
