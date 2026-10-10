import 'server-only';
import { callClaude, DEFAULT_MODEL } from '@/lib/ai/anthropic';
import { TON_LABEL, type ActionIa, type Ton } from '../regles';

/**
 * Rédaction assistée (§6). L'IA ne fait que proposer : elle n'envoie jamais
 * rien (C05) et, si elle est indisponible, la rédaction manuelle reste
 * possible (C17). Seul le contexte AUTORISÉ lui est transmis : prénom du
 * destinataire, mission, échéance, extraits des échanges professionnels du
 * fil — jamais d'adresse e-mail, de téléphone ni de donnée financière.
 */

export type ContexteIa = {
  prenom?: string | null;
  mission?: string | null;
  sujet?: string | null;
  echeance?: string | null;
  /** Derniers messages du fil, du plus ancien au plus récent. */
  echanges?: { de: 'moi' | 'interlocuteur'; texte: string }[];
  /** Dossier (demande client, réclamation) : résumé saisi par l'équipe. */
  dossier?: string | null;
  signature?: string | null;
};

const SYSTEME = `Tu es l'assistant de rédaction de l'administration de Major ECN, organisme de préparation aux épreuves de médecine (EDN/ECOS).
Tu rédiges des messages en français, prêts à être relus puis envoyés PAR un administrateur, qui les valide lui-même.
Règles absolues :
- N'invente AUCUN fait, délai, date, montant, engagement ou promesse absent du contexte fourni. Si une information manque, formule une question ou laisse une mention entre crochets, par exemple [date à préciser].
- Pas de formule creuse, pas d'emoji, pas de markdown (ni astérisques ni titres).
- Vouvoiement. Message complet : salutation, corps, formule de politesse, signature.
- Signature par défaut : « L’équipe Major ECN », sauf signature fournie.`;

const CONSIGNE_ACTION: Record<ActionIa, string> = {
  rediger: 'Rédige un message complet à partir de la consigne et du contexte.',
  corriger: 'Corrige l’orthographe, la grammaire et la ponctuation du texte fourni sans en changer le sens ni le ton. Renvoie le texte corrigé complet.',
  reformuler: 'Reformule le texte fourni dans le ton demandé, en gardant toutes les informations.',
  raccourcir: 'Raccourcis nettement le texte fourni en gardant l’essentiel et la formule de politesse.',
  developper: 'Développe le texte fourni avec plus de précision et de courtoisie, sans ajouter de fait nouveau.',
  objet: 'Propose uniquement un objet d’e-mail court (moins de 80 caractères) adapté au message.',
};

function blocContexte(c: ContexteIa): string {
  const lignes: string[] = [];
  if (c.prenom) lignes.push(`Prénom du destinataire : ${c.prenom}`);
  if (c.sujet) lignes.push(`Sujet : ${c.sujet}`);
  if (c.mission) lignes.push(`Mission / tâche : ${c.mission}`);
  if (c.echeance) lignes.push(`Échéance connue : ${c.echeance}`);
  if (c.dossier) lignes.push(`Dossier : ${c.dossier.slice(0, 1500)}`);
  if (c.signature) lignes.push(`Signature à utiliser : ${c.signature}`);
  const echanges = (c.echanges ?? []).slice(-6);
  if (echanges.length > 0) {
    lignes.push('Derniers échanges du fil :');
    for (const e of echanges) lignes.push(`- ${e.de === 'moi' ? 'Administration' : 'Interlocuteur'} : ${e.texte.slice(0, 800)}`);
  }
  return lignes.length > 0 ? lignes.join('\n') : '(aucun contexte)';
}

export async function brouillonIa(o: {
  action: ActionIa;
  ton: Ton;
  consigne?: string | null;
  texte?: string | null;
  contexte: ContexteIa;
}): Promise<{ ok: true; texte: string } | { ok: false; erreur: string }> {
  const user = [
    `Tâche : ${CONSIGNE_ACTION[o.action]}`,
    `Ton : ${TON_LABEL[o.ton]}.`,
    o.consigne ? `Consigne de l’administrateur : ${o.consigne.slice(0, 1500)}` : null,
    `Contexte autorisé :\n${blocContexte(o.contexte)}`,
    o.texte ? `Texte actuel :\n${o.texte.slice(0, 8000)}` : null,
    'Réponds uniquement par le texte demandé, sans commentaire.',
  ].filter(Boolean).join('\n\n');
  try {
    const r = await callClaude({ system: SYSTEME, user, model: DEFAULT_MODEL, maxTokens: 1500, temperature: 0.4 });
    const brut = r.text.trim();
    const texte = o.action === 'objet' ? brut.replace(/^objet\s*:\s*/i, '').split('\n')[0].trim() : brut;
    if (!texte) return { ok: false, erreur: 'L’assistant n’a rien proposé. Vous pouvez rédiger le message vous-même.' };
    return { ok: true, texte };
  } catch (err) {
    console.error('[cockpit] IA', err instanceof Error ? err.message : err);
    return { ok: false, erreur: 'L’assistant IA est indisponible pour le moment. La rédaction manuelle reste possible.' };
  }
}

/** Assistant libre du cockpit (rédiger une relance, synthétiser ou analyser une réclamation, planifier une amélioration). */
export async function assistantCockpit(consigne: string, dossier: string | null): Promise<{ ok: true; texte: string } | { ok: false; erreur: string }> {
  const user = [
    `Demande de l’administrateur : ${consigne.slice(0, 2000)}`,
    dossier ? `Éléments du dossier (seule source de faits) :\n${dossier.slice(0, 4000)}` : 'Aucun dossier sélectionné : reste générique et laisse des [champs à compléter].',
    'Réponds en texte brut, structuré par des tirets simples si nécessaire.',
  ].join('\n\n');
  try {
    const r = await callClaude({ system: SYSTEME, user, model: DEFAULT_MODEL, maxTokens: 1500, temperature: 0.4 });
    const texte = r.text.trim();
    return texte ? { ok: true, texte } : { ok: false, erreur: 'L’assistant n’a rien proposé.' };
  } catch (err) {
    console.error('[cockpit] IA', err instanceof Error ? err.message : err);
    return { ok: false, erreur: 'L’assistant IA est indisponible pour le moment.' };
  }
}

/**
 * Suggestion facultative (§9) après une réponse : l'IA repère une date
 * annoncée. La modification de l'échéance exige TOUJOURS une confirmation.
 */
export async function suggestionApresReponse(reponse: string, echeance: string | null, aujourdHui: string): Promise<{ texte: string; date: string | null } | null> {
  const user = [
    `Aujourd’hui : ${aujourdHui}. Échéance actuelle de la tâche : ${echeance ?? 'aucune'}.`,
    `Réponse reçue :\n${reponse.slice(0, 4000)}`,
    'Si la réponse annonce explicitement une date de fin ou de livraison, réponds sur une seule ligne au format : DATE=AAAA-MM-JJ | <phrase courte proposant de déplacer l’échéance à cette date et de créer un rappel>.',
    'Sinon réponds exactement : AUCUNE',
  ].join('\n\n');
  try {
    const r = await callClaude({ system: SYSTEME, user, model: DEFAULT_MODEL, maxTokens: 200, temperature: 0 });
    const t = r.text.trim();
    const m = /^DATE=(\d{4}-\d{2}-\d{2})\s*\|\s*([\s\S]+)$/.exec(t);
    if (!m) return null;
    return { date: m[1], texte: m[2].trim() };
  } catch {
    return null;
  }
}
