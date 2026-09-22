import 'server-only';

/**
 * Lecture intégrale d'une table via PostgREST — côté serveur.
 *
 * L'implémentation vit dans `fetch-all-pure.ts` : elle ne dépend que du
 * client passé en argument, et l'app mobile (Capacitor, hors Next.js) en
 * partage la copie octet-identique (`application/mobile/src/shared`). Ce
 * fichier ne garde que la garde `server-only` pour le web.
 */
export { fetchAllRows } from './fetch-all-pure';
