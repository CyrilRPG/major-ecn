/**
 * Traduction des erreurs d'authentification Supabase.
 *
 * Les pages affichaient jusqu'ici `error.message` brut : un élève bloqué lisait
 * « New password should be different from the old password » sur un e-mail
 * présenté comme une invitation. Message exact, en anglais, et incompréhensible
 * dans ce contexte — les journaux montrent une personne ayant réessayé douze
 * fois en quarante minutes avant d'abandonner.
 *
 * Partagé entre la page d'activation, le changement de mot de passe du profil
 * et la route de confirmation, pour que le même incident n'ait pas deux
 * formulations différentes selon l'écran.
 */

/** Motifs d'échec d'un lien, transmis par /auth/confirm via `?error=`. */
export const MOTIFS_LIEN = {
  lien_consomme:
    'Ce lien a déjà été utilisé. Par sécurité il ne fonctionne qu’une fois — demandez-en un nouveau ci-dessous.',
  lien_expire:
    'Ce lien a expiré. Demandez-en un nouveau ci-dessous, vous le recevrez immédiatement.',
  lien_invalide:
    'Ce lien n’est pas valide. Demandez-en un nouveau ci-dessous.',
} as const;

export type MotifLien = keyof typeof MOTIFS_LIEN;

export function estMotifLien(valeur: string | null): valeur is MotifLien {
  return valeur !== null && valeur in MOTIFS_LIEN;
}

/**
 * Message d'échec d'un lien. Tolère une valeur inconnue — les anciens e-mails
 * en circulation portent encore le message Supabase brut dans `?error=`, qu'on
 * ne veut surtout pas réafficher tel quel.
 */
export function messageLien(valeur: string | null): string {
  return estMotifLien(valeur) ? MOTIFS_LIEN[valeur] : MOTIFS_LIEN.lien_invalide;
}

/** Erreurs renvoyées par `updateUser({ password })` et `signInWithPassword`. */
const MESSAGES_AUTH: Record<string, string> = {
  same_password:
    'Ce mot de passe est déjà celui de votre compte. Vous pouvez vous connecter directement.',
  weak_password:
    'Ce mot de passe est trop simple. Ajoutez des caractères, des chiffres ou des majuscules.',
  over_request_rate_limit:
    'Trop de tentatives en peu de temps. Patientez une minute avant de réessayer.',
  email_not_confirmed:
    'Votre adresse n’est pas encore confirmée. Ouvrez le lien reçu par e-mail.',
  invalid_credentials: 'Adresse e-mail ou mot de passe incorrect.',
  user_not_found: 'Aucun compte ne correspond à cette adresse.',
  session_not_found:
    'Votre session a expiré. Rechargez la page puis recommencez.',
};

/**
 * Message français pour une erreur Supabase. `code` est préféré au message,
 * qui change au fil des versions de GoTrue.
 */
export function messageAuth(code: string | undefined, messageBrut: string): string {
  if (code && MESSAGES_AUTH[code]) return MESSAGES_AUTH[code];
  const m = messageBrut.toLowerCase();
  // Repli sur le texte quand le SDK ne remonte pas de code (versions anciennes).
  if (m.includes('different from the old password')) return MESSAGES_AUTH.same_password;
  if (m.includes('weak') || m.includes('at least')) return MESSAGES_AUTH.weak_password;
  if (m.includes('rate limit')) return MESSAGES_AUTH.over_request_rate_limit;
  if (m.includes('invalid login')) return MESSAGES_AUTH.invalid_credentials;
  return 'Une erreur est survenue. Réessayez, et écrivez-nous si cela persiste.';
}
