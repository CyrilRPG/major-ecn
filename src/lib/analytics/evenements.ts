/**
 * Événements poussés dans le `dataLayer`, à câbler dans Google Tag Manager.
 *
 * Ces noms sont un CONTRAT avec le compte Google Ads : ce sont eux que le
 * webmaster déclenche depuis GTM pour alimenter les trois actions de
 * conversion. Les renommer casse le suivi sans qu'aucun test ne le voie —
 * modifier ici et dans GTM, jamais l'un sans l'autre.
 *
 * Correspondance avec les actions de conversion du compte (07/09/2026) :
 *   « Formulaire contact »     → contact_form_submit
 *   « Formulaire inscription » → signup_form_submit
 *   « Suivi des appels »       → phone_call_click
 */
export const EVENEMENTS = {
  /** Message envoyé depuis /contact (succès serveur confirmé). */
  contactForm: 'contact_form_submit',
  /** Inscription enregistrée : espace découverte ou création de compte. */
  signupForm: 'signup_form_submit',
  /** Clic sur un numéro de téléphone, où qu'il soit sur le site. */
  phoneCall: 'phone_call_click',
  /** Achat confirmé, pour une éventuelle conversion à valeur. */
  purchase: 'purchase',
} as const;

type Donnees = Record<string, unknown>;

/**
 * Pousse un événement dans le `dataLayer`.
 *
 * Le tableau est créé s'il n'existe pas : les appels antérieurs au chargement
 * de GTM sont alors rejoués par le conteneur à son démarrage. Les anciens
 * appels du site testaient `'dataLayer' in window` et ne poussaient donc RIEN
 * tant que la balise n'était pas là — les événements étaient perdus au lieu
 * d'être mis en file.
 */
export function pousserEvenement(nom: string, donnees: Donnees = {}): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event: nom, ...donnees });
}
