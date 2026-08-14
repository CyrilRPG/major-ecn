import 'server-only';

/**
 * Lecture INTÉGRALE d'une table via PostgREST, par tranches de 1 000 lignes.
 *
 * POURQUOI. PostgREST plafonne chaque requête à 1 000 lignes (db_max_rows) et
 * TRONQUE EN SILENCE au-delà — ni erreur, ni avertissement. Le CRM pédagogique
 * a affiché des élèves actifs à « 0 contenu ouvert » pendant des semaines pour
 * cette raison. Toute lecture « toute la table » doit passer par ce helper (ou
 * mieux : par une agrégation SQL, cf. admin_crm_activity()).
 *
 * IMPORTANT : la requête DOIT être triée de façon stable (ajouter `.order('id')`
 * en dernier critère), sinon les tranches peuvent se chevaucher.
 */
export async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<{
    data: unknown;
    error: { message: string } | null;
  }>,
): Promise<T[]> {
  const CHUNK = 1000;
  const rows: T[] = [];
  for (let from = 0; ; from += CHUNK) {
    const { data, error } = await page(from, from + CHUNK - 1);
    if (error) throw new Error(error.message);
    const chunk = (data ?? []) as T[];
    rows.push(...chunk);
    if (chunk.length < CHUNK) return rows;
  }
}
