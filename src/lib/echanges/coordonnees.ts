/**
 * Détection des coordonnées personnelles (CDC §186-198, tests R53-R59) —
 * module PUR, testé dans tests/echanges-coordonnees.test.ts.
 *
 * Objectif : Major ECN reste le canal officiel. On détecte les numéros
 * (français, internationaux, écrits en lettres), les adresses e-mail (y
 * compris déguisées : « arobase », « (at) », « point com »), les comptes de
 * réseaux sociaux et messageries, et les invitations à poursuivre hors de la
 * plateforme. Les valeurs médicales ordinaires restent publiables (R56) :
 * « PA 120/80 », « K+ 5,2 mmol/L », « plaquettes 150 000/mm3 », « item 231 ».
 *
 * Aucun filtre ne garantit une détection parfaite (CDC §198) : les cas limites
 * passent en validation par l'équipe, et un faux positif se corrige en
 * back-office (« Libérer le message »).
 */

export type TypeMotif =
  | 'telephone'
  | 'telephone_international'
  | 'numero_long'
  | 'nombre_en_lettres'
  | 'email'
  | 'email_deguise'
  | 'reseau_social'
  | 'lien_messagerie'
  | 'sollicitation'
  | 'lien_non_reconnu';

export type Motif = { type: TypeMotif; extrait: string };

export const LIBELLE_MOTIF: Record<TypeMotif, string> = {
  telephone: 'Numéro de téléphone',
  telephone_international: 'Numéro international',
  numero_long: 'Numéro probable',
  nombre_en_lettres: 'Numéro écrit en lettres',
  email: 'Adresse e-mail',
  email_deguise: 'Adresse e-mail déguisée',
  reseau_social: 'Compte de réseau social ou messagerie',
  lien_messagerie: 'Lien vers une messagerie ou un réseau social',
  sollicitation: 'Invitation à échanger hors de Major ECN',
  lien_non_reconnu: 'Lien vers un site non reconnu',
};

/** Texte affiché à l'élève quand un message est bloqué (§197). */
export const MESSAGE_BLOCAGE =
  'Pour préserver la confidentialité et la sécurité de notre communauté, les échanges de coordonnées personnelles ne sont pas autorisés. Toutes les discussions doivent rester dans la messagerie Major ECN.';

function normaliser(t: string): string {
  return t
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    // chiffres « pleine chasse » et lettres stylisées courantes
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFF10 + 48))
    .replace(/[​-‍﻿]/g, '')
    .toLowerCase();
}

/* ───────────────────────────── Téléphones ───────────────────────────── */

// Français : 0X XX XX XX XX, +33 X XX…, 0033…, avec séparateurs espace . - / ou rien.
const RE_TEL_FR = /(?<![\d,.])(?:(?:\+|00)\s?33\s?(?:\(0\)\s?)?|0)[1-9](?:[\s.\-/]?\d{2}){4}(?![\d,])/g;
// International : + ou 00, indicatif, puis au moins 7 chiffres au total.
const RE_TEL_INTL = /(?<![\d\w])(?:\+|00)\s?[1-9][\d\s.\-()/]{6,20}\d/g;
// Suite de 9 chiffres ou plus, groupes séparés par un seul séparateur.
const RE_NUMERO_LONG = /(?<![\d,.])\d{2,4}(?:[\s.\-]\d{2,4}){2,6}(?![\d,])|(?<![\d,.])\d{9,15}(?![\d,.])/g;

function compterChiffres(s: string): number {
  return (s.match(/\d/g) ?? []).length;
}

/** Contexte médical juste après un nombre : unités, opérateurs (« 150 000/mm3 », « 120 000 UI »). */
const UNITE_APRES = /^\s*(?:\/|x|×|%|‰|mg|g\b|kg|µg|ug|mcg|ng|pg|ml|l\b|dl|ui|u\/|meq|mmol|µmol|umol|nmol|mm|cm|m\b|mmhg|cmh2o|bpm|\/min|\/mm|\/µl|\/ul|\/l|\/j|j\b|jours?|ans?|mois|semaines?|sa\b|h\b|heures?|min|s\b|sec|kcal|cal|°|copies|cellules|gb|gr|ufc|plaquettes|leucocytes|hematies|globules|euros?|€)/i;

/* ───────────────────────── Nombres écrits en lettres ───────────────────────── */

const MOTS_NOMBRES = new Set([
  'zero', 'un', 'une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze',
  'treize', 'quatorze', 'quinze', 'seize', 'vingt', 'vingts', 'trente', 'quarante', 'cinquante', 'soixante',
  'septante', 'octante', 'huitante', 'nonante', 'cent', 'cents', 'et', 'zéro',
]);
const MOTS_FORTS = new Set(['zero', 'zéro', 'six', 'sept', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante']);

function nombresEnLettres(t: string): string | null {
  const mots = t.split(/[\s\-,.;:]+/).filter(Boolean);
  let debut = -1;
  let n = 0;
  let forts = 0;
  for (let i = 0; i <= mots.length; i++) {
    const m = mots[i];
    if (m !== undefined && (MOTS_NOMBRES.has(m) || /^\d{1,2}$/.test(m))) {
      if (debut < 0) debut = i;
      n += 1;
      if (MOTS_FORTS.has(m) || /^\d{1,2}$/.test(m)) forts += 1;
    } else {
      // 8 mots-nombres d'affilée dont au moins 4 « forts » : un numéro dicté.
      if (n >= 8 && forts >= 4 && debut >= 0) return mots.slice(debut, i).join(' ');
      debut = -1; n = 0; forts = 0;
    }
  }
  return null;
}

/* ─────────────────────────────── E-mails ─────────────────────────────── */

const RE_EMAIL = /[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}/g;
const ARO = String.raw`(?:@|\(\s*at\s*\)|\[\s*at\s*\]|\{\s*at\s*\}|\barobase\b|\barobas\b|\barrobase\b|\bat\b)`;
const POINT = String.raw`(?:\.|\(\s*(?:dot|point)\s*\)|\[\s*(?:dot|point)\s*\]|\bdot\b|\bpoint\b)`;
const TLD = String.raw`(?:com|fr|net|org|eu|io|be|ch|ca|info|me|co|uk|de|es|it)`;
const RE_EMAIL_DEGUISE = new RegExp(String.raw`[a-z0-9._%+-]{2,}\s*${ARO}\s*[a-z0-9-]{2,}\s*${POINT}\s*${TLD}\b`, 'g');
const FOURNISSEURS = String.raw`(?:gmail|hotmail|yahoo|outlook|live|icloud|me\.com|protonmail|proton|orange|wanadoo|free|sfr|laposte|aol|gmx|yandex|bbox|neuf)`;
const RE_FOURNISSEUR = new RegExp(String.raw`(?:${ARO}\s*${FOURNISSEURS}|\b${FOURNISSEURS}\s*${POINT}\s*${TLD}\b)`, 'g');

/* ───────────────────────── Réseaux sociaux et liens ───────────────────────── */

const DOMAINES_MESSAGERIE = [
  'wa.me', 'whatsapp.com', 'chat.whatsapp.com', 't.me', 'telegram.me', 'telegram.org', 'signal.me', 'signal.group',
  'instagram.com', 'instagr.am', 'snapchat.com', 'facebook.com', 'fb.me', 'fb.com', 'm.me', 'messenger.com',
  'discord.gg', 'discord.com', 'discordapp.com', 'linkedin.com', 'lnkd.in', 'tiktok.com', 'twitter.com', 'x.com',
  'threads.net', 'skype.com', 'join.skype.com', 'viber.com', 'wechat.com', 'calendly.com', 'linktr.ee', 'bit.ly',
  'tinyurl.com', 'zoom.us', 'meet.google.com', 'teams.microsoft.com', 'gmail.com', 'outlook.com', 'hotmail.com',
];

const RESEAUX = String.raw`(?:snap|snapchat|insta|instagram|ig|whatsapp|whats\s?app|watsap|wats?app|wtsp|telegram|tg|discord|messenger|tiktok|tik\s?tok|twitter|linkedin|facebook|fb|skype|viber|wechat|signal)`;
// « mon snap : jean_75 », « insta @jean », « ajoute moi sur whatsapp »
const RE_RESEAU_HANDLE = new RegExp(String.raw`\b${RESEAUX}\b\s*(?:[:=\-–>]|c['’]?est|est)?\s*@?[a-z0-9._]*[\d_.][a-z0-9._]*|@[a-z0-9._]{3,}\s*(?:sur|on|\(|\[)?\s*${RESEAUX}\b`, 'g');
const RE_SOLLICITATION = new RegExp(
  String.raw`\b(?:ajoute|ajoutez|add|ecris|ecrivez|contacte|contactez|retrouve|retrouvez|rejoins|rejoignez|appelle|appelez|joins|joignez|texte|textez|envoie|envoyez)[\s-]*(?:moi|nous)\s*(?:sur|par|au|en|via)\s*(?:${RESEAUX}|mp|dm|prive|message prive|tel|telephone|portable|mail|email|e-mail|sms|whatsapp)\b`
  + String.raw`|\b(?:mon|ma|mes)\s+(?:num|numero|numeros|06|07|tel|telephone|portable|phone|snap|snapchat|insta|instagram|whatsapp|watsap|telegram|discord|adresse\s+mail|adresse\s+e-?mail|mail\s+perso|e-?mail\s+perso|insta\s+perso)\b`
  + String.raw`|\b(?:en|par)\s+(?:mp|dm|message\s+prive|messages\s+prives)\b|\bviens?\s+en\s+(?:prive|mp|dm)\b`,
  'g',
);

const RE_URL = /\b(?:https?:\/\/|www\.)[^\s<>"')\]]+|\b(?:[a-z0-9-]+\.)+(?:com|fr|net|org|eu|io|be|ch|ca|info|me|co|gg|ly|ee|app|link|site|xyz|online|gouv\.fr|edu)\b(?:\/[^\s<>"')\]]*)?/g;

export function domaineDe(url: string): string | null {
  try {
    const u = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

/** Le domaine est-il autorisé (lui-même ou un sous-domaine d'un domaine de la liste) ? */
export function domaineAutorise(domaine: string, autorises: string[]): boolean {
  const d = domaine.toLowerCase();
  return autorises.some((a) => {
    const x = a.trim().toLowerCase().replace(/^www\./, '');
    return x.length > 0 && (d === x || d.endsWith(`.${x}`));
  });
}

function estMessagerie(domaine: string): boolean {
  return DOMAINES_MESSAGERIE.some((m) => domaine === m || domaine.endsWith(`.${m}`));
}

/* ─────────────────────────────── Analyse ─────────────────────────────── */

export type Analyse = {
  motifs: Motif[];
  /** Coordonnées détectées : publication refusée (ou validation, selon le réglage). */
  bloquant: boolean;
  /** Seulement des liens non reconnus : traitement selon `liens_non_reconnus`. */
  liensNonReconnus: string[];
};

export function analyserCoordonnees(texteBrut: string, opts: { domainesAutorises: string[] }): Analyse {
  const texte = normaliser(texteBrut ?? '');
  const motifs: Motif[] = [];
  const ajouter = (type: TypeMotif, extrait: string) => {
    const e = extrait.trim().slice(0, 80);
    if (!motifs.some((m) => m.type === type && m.extrait === e)) motifs.push({ type, extrait: e });
  };

  // E-mails d'abord (« jean arobase orange.fr » n'est pas un lien vers orange.fr).
  let sansEmails = texte;
  for (const m of texte.matchAll(RE_EMAIL)) {
    ajouter('email', m[0]);
    sansEmails = sansEmails.replace(m[0], ' ');
  }
  for (const m of sansEmails.matchAll(RE_EMAIL_DEGUISE)) {
    ajouter('email_deguise', m[0]);
    sansEmails = sansEmails.replace(m[0], ' ');
  }
  for (const m of sansEmails.matchAll(RE_FOURNISSEUR)) {
    ajouter('email_deguise', m[0]);
    sansEmails = sansEmails.replace(m[0], ' ');
  }

  // Puis les liens : leurs chiffres (identifiants, DOI) ne sont pas des numéros.
  const liensNonReconnus: string[] = [];
  for (const m of sansEmails.matchAll(RE_URL)) {
    const brut = m[0].replace(/[.,;:!?]+$/, '');
    const dom = domaineDe(brut);
    sansEmails = sansEmails.replace(m[0], ' ');
    if (!dom) continue;
    if (estMessagerie(dom)) ajouter('lien_messagerie', brut);
    else if (!domaineAutorise(dom, opts.domainesAutorises)) liensNonReconnus.push(brut);
  }

  for (const m of sansEmails.matchAll(RE_TEL_FR)) ajouter('telephone', m[0]);
  for (const m of sansEmails.matchAll(RE_TEL_INTL)) {
    if (compterChiffres(m[0]) >= 8 && !motifs.some((x) => x.type === 'telephone' && m[0].includes(x.extrait.replace(/\s/g, '').slice(-6)))) {
      ajouter('telephone_international', m[0]);
    }
  }
  for (const m of sansEmails.matchAll(RE_NUMERO_LONG)) {
    const n = compterChiffres(m[0]);
    if (n < 9 || n > 15) continue;
    const apres = sansEmails.slice((m.index ?? 0) + m[0].length, (m.index ?? 0) + m[0].length + 14);
    if (UNITE_APRES.test(apres)) continue;
    if (motifs.some((x) => (x.type === 'telephone' || x.type === 'telephone_international') && x.extrait.replace(/\D/g, '').endsWith(m[0].replace(/\D/g, '').slice(-8)))) continue;
    ajouter('numero_long', m[0]);
  }
  const lettres = nombresEnLettres(sansEmails);
  if (lettres) ajouter('nombre_en_lettres', lettres);

  for (const m of sansEmails.matchAll(RE_RESEAU_HANDLE)) ajouter('reseau_social', m[0]);
  for (const m of sansEmails.matchAll(RE_SOLLICITATION)) ajouter('sollicitation', m[0]);

  for (const l of liensNonReconnus) ajouter('lien_non_reconnu', l);
  const bloquant = motifs.some((m) => m.type !== 'lien_non_reconnu');
  return { motifs, bloquant, liensNonReconnus };
}

/**
 * Décision de publication pour un texte (message, modification, légende,
 * nom affiché) selon les réglages de Major ECN.
 */
export type DecisionCoordonnees =
  | { action: 'publier' }
  | { action: 'moderation'; motifs: Motif[] }
  | { action: 'bloquer'; motifs: Motif[] };

export function deciderPublication(
  texte: string,
  reglages: { actif: boolean; mode: 'bloquer' | 'moderation'; domainesAutorises: string[]; liensNonReconnus: 'autoriser' | 'moderation' | 'bloquer' },
): DecisionCoordonnees {
  if (!reglages.actif) return { action: 'publier' };
  const a = analyserCoordonnees(texte, { domainesAutorises: reglages.domainesAutorises });
  if (a.bloquant) {
    const motifs = a.motifs.filter((m) => m.type !== 'lien_non_reconnu');
    return reglages.mode === 'moderation' ? { action: 'moderation', motifs } : { action: 'bloquer', motifs };
  }
  if (a.liensNonReconnus.length > 0) {
    const motifs = a.motifs.filter((m) => m.type === 'lien_non_reconnu');
    if (reglages.liensNonReconnus === 'bloquer') return { action: 'bloquer', motifs };
    if (reglages.liensNonReconnus === 'moderation') return { action: 'moderation', motifs };
  }
  return { action: 'publier' };
}
