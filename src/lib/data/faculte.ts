/**
 * Identifiant de la faculté servie par la plateforme Major ECN.
 *
 * POURQUOI un module à part — le projet Supabase est PARTAGÉ avec Major
 * Odontologie et cette constante est le pivot du cloisonnement entre les deux
 * produits. Elle doit donc être lisible aussi bien côté serveur
 * (`lib/data/navigator.ts`) que depuis des modules client-safe
 * (`lib/supabase/client.ts`), ce qu'interdirait un import de `navigator.ts`,
 * marqué `server-only`.
 */
export const EDN_FACULTE_ID = 'major-ecn';
