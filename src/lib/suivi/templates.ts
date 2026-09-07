/**
 * Bibliothèque d'emails (§15) — partie PURE : modèles par défaut et rendu des
 * variables. L'envoi (Resend) et la journalisation vivent dans `emails.ts`.
 *
 * Variables disponibles : {{prenom}}, {{specialite}}, {{date}}, {{heure}},
 * {{lien}}. Une variable absente des valeurs fournies est remplacée par une
 * chaîne vide : un modèle ne doit jamais partir avec « {{prenom}} » en clair.
 */
import type { EmailTemplateKey } from './types';

export const TEMPLATE_VARIABLES: { key: string; label: string }[] = [
  { key: 'prenom', label: 'Prénom du candidat' },
  { key: 'specialite', label: 'Spécialité' },
  { key: 'date', label: 'Date (rendez-vous ou début de période)' },
  { key: 'heure', label: 'Heure du rendez-vous' },
  { key: 'lien', label: 'Lien de réservation / déplacement' },
];

export type TemplateVars = Partial<Record<'prenom' | 'specialite' | 'date' | 'heure' | 'lien', string>>;

export type DefaultTemplate = { key: EmailTemplateKey; name: string; subject: string; body: string };

export const DEFAULT_TEMPLATES: Record<EmailTemplateKey, DefaultTemplate> = {
  planning_announce: {
    key: 'planning_announce',
    name: 'Annonce d’un planning futur',
    subject: 'Suivi individuel {{specialite}} : prochaine période de rendez-vous',
    body:
      'Bonjour {{prenom}},\n\n' +
      'Une nouvelle période de rendez-vous de suivi individuel s’ouvrira à partir du {{date}}.\n\n' +
      'Vous recevrez prochainement une invitation pour choisir votre créneau. Ces points sont l’occasion de faire le bilan de votre préparation et d’ajuster votre programme.\n\n' +
      'À très bientôt,\nL’équipe Major ECN',
  },
  invite: {
    key: 'invite',
    name: 'Invitation à choisir un créneau',
    subject: 'Choisissez votre créneau de suivi individuel',
    body:
      'Bonjour {{prenom}},\n\n' +
      'Nous vous proposons un point individuel sur votre préparation en {{specialite}}.\n\n' +
      'Choisissez le créneau qui vous convient en cliquant sur le lien ci-dessous :\n{{lien}}\n\n' +
      'Le rendez-vous dure une dizaine de minutes. Vous pourrez le déplacer à tout moment depuis ce même lien ou depuis votre espace personnel.\n\n' +
      'À très bientôt,\nL’équipe Major ECN',
  },
  reminder_no_booking: {
    key: 'reminder_no_booking',
    name: 'Relance sans réservation',
    subject: 'Rappel : votre créneau de suivi vous attend',
    body:
      'Bonjour {{prenom}},\n\n' +
      'Vous n’avez pas encore réservé votre rendez-vous de suivi individuel en {{specialite}}. Des créneaux restent disponibles :\n{{lien}}\n\n' +
      'Ce point est important pour faire le bilan de votre préparation et décider ensemble des prochaines étapes.\n\n' +
      'À très bientôt,\nL’équipe Major ECN',
  },
  reminder_before: {
    key: 'reminder_before',
    name: 'Rappel avant rendez-vous',
    subject: 'Rappel : votre rendez-vous de suivi le {{date}} à {{heure}}',
    body:
      'Bonjour {{prenom}},\n\n' +
      'Nous vous rappelons votre rendez-vous de suivi individuel le {{date}} à {{heure}}.\n\n' +
      'Un empêchement ? Vous pouvez déplacer votre rendez-vous vers un autre créneau disponible :\n{{lien}}\n\n' +
      'À très bientôt,\nL’équipe Major ECN',
  },
  absence: {
    key: 'absence',
    name: 'Absence / injoignable',
    subject: 'Nous n’avons pas pu vous joindre',
    body:
      'Bonjour {{prenom}},\n\n' +
      'Nous n’avons pas pu vous joindre lors de votre rendez-vous de suivi du {{date}} à {{heure}}.\n\n' +
      'Pour reprogrammer un point individuel, choisissez un nouveau créneau :\n{{lien}}\n\n' +
      'À très bientôt,\nL’équipe Major ECN',
  },
  after_meeting: {
    key: 'after_meeting',
    name: 'Après entretien',
    subject: 'Suite à notre échange du {{date}}',
    body:
      'Bonjour {{prenom}},\n\n' +
      'Merci pour notre échange du {{date}}. Voici un rappel des points décidés ensemble :\n\n' +
      '- \n\n' +
      'N’hésitez pas à nous écrire si vous avez la moindre question.\n\n' +
      'Bonne continuation,\nL’équipe Major ECN',
  },
  action: {
    key: 'action',
    name: 'Message lié à une action',
    subject: 'Point sur votre suivi en {{specialite}}',
    body:
      'Bonjour {{prenom}},\n\n' +
      'Suite à votre dernier point de suivi, voici une information concernant l’action décidée ensemble :\n\n' +
      '\n\n' +
      'À très bientôt,\nL’équipe Major ECN',
  },
};

/** Remplace les variables `{{nom}}` (insensible aux espaces et à la casse). */
export function renderTemplate(text: string, vars: TemplateVars): string {
  return text.replace(/\{\{\s*([a-zA-Z_]+)\s*\}\}/g, (_m, name: string) => {
    const key = name.toLowerCase() as keyof TemplateVars;
    return vars[key] ?? '';
  });
}

/** Variables réellement utilisées par un texte (pour l'aide de l'éditeur). */
export function templateVariablesUsed(text: string): string[] {
  const found = new Set<string>();
  for (const m of text.matchAll(/\{\{\s*([a-zA-Z_]+)\s*\}\}/g)) found.add(m[1].toLowerCase());
  return Array.from(found);
}
