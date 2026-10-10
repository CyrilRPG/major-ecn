import { Caveat } from 'next/font/google';

/**
 * Écriture manuscrite du contenu des Post-it (§23). Chargée avec le module
 * Post-it (import dynamique) : aucune page ne la télécharge tant que le
 * calque n'est pas monté.
 */
export const policeManuscrite = Caveat({ subsets: ['latin'], weight: ['400', '600', '700'], display: 'swap' });
