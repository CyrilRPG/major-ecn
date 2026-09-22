import 'server-only';

/**
 * Maintien des acquis — point d'entrée SERVEUR.
 *
 * L'implémentation vit dans `maintien-core.ts`, partagée octet pour octet
 * avec l'app mobile (cf. `application/scripts/check-shared-sync.mjs`). Toute
 * évolution se fait dans le module core, jamais dans la copie mobile.
 */
export * from './maintien-core';
