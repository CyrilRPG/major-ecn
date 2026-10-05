'use client';

import { useSyncExternalStore } from 'react';

const abonnementVide = () => () => {};

/**
 * false au rendu serveur et pendant l'hydratation, true dès que React a la
 * main. Avant ça, les gestionnaires (`onSubmit`…) ne sont pas branchés : un
 * bouton de soumission actif enverrait le formulaire nativement, hors de notre
 * code (voir lib/auth/formulaires-auth.ts).
 */
export function useHydrate(): boolean {
  return useSyncExternalStore(abonnementVide, () => true, () => false);
}
