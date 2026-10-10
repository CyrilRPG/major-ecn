import 'server-only';
import { envoiBloquant } from '../blocage';
import type { BlockingScope } from '../types';
import { qdb } from './base';
import { envoisOuvertsGarde } from './soumission';

/**
 * Données de la garde des questionnaires pour le layout de l'espace élève :
 * deux petites requêtes indexées. Toute erreur ⇒ aucune garde (on ne bloque
 * jamais un candidat sur une panne).
 */
export async function chargerGardeEnquetes(userId: string): Promise<{
  bloquant: { id: string; titre: string; blocking_scope: BlockingScope } | null;
  enAttente: { id: string; titre: string } | null;
}> {
  try {
    const [envois, { data: etat }] = await Promise.all([
      envoisOuvertsGarde(userId),
      qdb().from('qualite_candidats').select('sans_blocage').eq('user_id', userId).maybeSingle(),
    ]);
    if (!envois.length) return { bloquant: null, enAttente: null };
    const b = envoiBloquant(envois, Date.now(), !!(etat as { sans_blocage?: boolean } | null)?.sans_blocage);
    const autre = envois.find((e) => e.id !== b?.id) ?? null;
    return {
      bloquant: b ? { id: b.id, titre: envois.find((e) => e.id === b.id)?.titre ?? 'Questionnaire', blocking_scope: b.blocking_scope } : null,
      enAttente: autre ? { id: autre.id, titre: autre.titre } : null,
    };
  } catch (err) {
    console.error('[qualite] garde :', err);
    return { bloquant: null, enAttente: null };
  }
}
