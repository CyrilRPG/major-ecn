/**
 * Logique pure de POST /api/mobile/sync (sans accès base), testée par
 * `sync-core.test.ts` (`npx tsx --test src/app/api/mobile/sync/sync-core.test.ts`).
 */

/**
 * Nature d'un rejet renvoyé à l'app :
 *  - `definitive` : la donnée ne passera jamais (contrainte, format, ligne
 *    d'un autre compte) → l'app retire l'op de sa file ;
 *  - `transient`  : incident passager (base saturée, délai dépassé, schéma en
 *    cours de déploiement…) → l'app garde l'op et réessaie plus tard.
 */
export type RejectKind = 'definitive' | 'transient';

export type DbErrorLike =
  | { code?: string | null; message?: string | null; details?: string | null; hint?: string | null }
  | null
  | undefined;

/**
 * Classe une erreur Postgres/PostgREST. Seules les classes SQLSTATE 22
 * (donnée invalide) et 23 (contrainte d'intégrité : clé étrangère vers une
 * question supprimée, NOT NULL…) sont définitives : rejouer la même ligne
 * échouerait toujours. Tout le reste (57014 délai, 53xxx ressources, 08xxx
 * connexion, 40001/40P01 concurrence, PGRST schéma, erreur réseau sans code)
 * est transitoire : perdre la réponse d'un élève sur une panne serait pire
 * qu'un nouvel essai.
 */
export function classifyDbError(err: DbErrorLike): RejectKind {
  const code = err?.code ?? '';
  if (/^2[23][0-9A-Z]{3}$/.test(code)) return 'definitive';
  return 'transient';
}

/**
 * Classement propre à `qcm_attempts`. Une clé étrangère (23503) vers la
 * SÉANCE manquante est transitoire : la séance créée hors ligne n'a pas
 * encore été écrite (échec passager du bloc `qcm_sessions`) et le sera au
 * prochain essai — la déclarer définitive faisait effacer par l'app les
 * réponses faites hors ligne. Une clé étrangère vers une QUESTION supprimée
 * reste définitive : sinon une seule question retirée bloquerait à jamais le
 * lot entier dans la file de l'app.
 */
export function classifyAttemptError(err: DbErrorLike): RejectKind {
  if (err?.code === '23503') {
    const text = `${err.message ?? ''} ${err.details ?? ''}`;
    if (/question_id/i.test(text)) return 'definitive';
    return 'transient';
  }
  return classifyDbError(err);
}

/**
 * Tri des tentatives QCM selon leur séance : une tentative rattachée à une
 * séance ni présente en base ni écrite dans cette requête ne doit PAS être
 * insérée (violation de clé étrangère) ; elle est mise de côté (`pending`)
 * pour être rejetée en transitoire et rejouée plus tard. Une tentative sans
 * séance (`session_id` nul) passe.
 */
export function splitAttemptsBySession<T>(
  items: T[],
  sessionOf: (item: T) => string | null | undefined,
  knownSessionIds: ReadonlySet<string>,
): { ready: T[]; pending: T[] } {
  const ready: T[] = [];
  const pending: T[] = [];
  for (const item of items) {
    const sid = sessionOf(item);
    if (!sid || knownSessionIds.has(sid)) ready.push(item);
    else pending.push(item);
  }
  return { ready, pending };
}

/**
 * Écriture d'un lot avec isolement des lignes fautives par DICHOTOMIE, bornée
 * en nombre d'écritures et en temps. Un échec transitoire rend toute la
 * tranche transitoire ; un échec définitif sur une tranche de plusieurs
 * lignes la coupe en deux (k lignes fautives parmi n → O(k·log n) écritures,
 * au lieu de n allers-retours). Budget épuisé → les tranches restantes sont
 * renvoyées dans `deferred` (ni écrites ni rejetées : la route libère leur
 * réservation et l'app les rejoue plus tard).
 */
export type BisectBudget = { deadline: number; writesLeft: number; now?: () => number };
export type BisectResult<G> = {
  ok: G[];
  failed: { group: G; error: NonNullable<DbErrorLike>; kind: RejectKind }[];
  transient: { groups: G[]; error: NonNullable<DbErrorLike> }[];
  deferred: G[];
};

export async function writeByBisection<G>(
  groups: G[],
  write: (groups: G[]) => Promise<DbErrorLike>,
  classify: (err: DbErrorLike) => RejectKind,
  budget: BisectBudget,
): Promise<BisectResult<G>> {
  const now = budget.now ?? Date.now;
  const out: BisectResult<G> = { ok: [], failed: [], transient: [], deferred: [] };
  const step = async (slice: G[]): Promise<void> => {
    if (slice.length === 0) return;
    if (budget.writesLeft <= 0 || now() >= budget.deadline) { out.deferred.push(...slice); return; }
    budget.writesLeft -= 1;
    const error = await write(slice);
    if (!error) { out.ok.push(...slice); return; }
    const kind = classify(error);
    if (kind === 'transient') { out.transient.push({ groups: slice, error }); return; }
    if (slice.length === 1) { out.failed.push({ group: slice[0], error, kind }); return; }
    const mid = Math.ceil(slice.length / 2);
    await step(slice.slice(0, mid));
    await step(slice.slice(mid));
  };
  await step(groups);
  return out;
}

/**
 * Regroupe des éléments par clé en conservant l'ordre de première apparition.
 * `last` est le DERNIER élément du groupe : c'est lui qui gagne (dernier état
 * poussé). Sert à dédoublonner les ops avant un upsert — Postgres refuse
 * qu'un même INSERT … ON CONFLICT DO UPDATE touche deux fois la même ligne
 * (« ON CONFLICT DO UPDATE command cannot affect row a second time »), ce qui
 * rejetait toute séance QCM faite hors ligne (création puis clôture).
 */
export function groupByKey<T>(items: T[], key: (item: T) => string): { key: string; items: T[]; last: T }[] {
  const groups = new Map<string, { key: string; items: T[]; last: T }>();
  for (const item of items) {
    const k = key(item);
    const g = groups.get(k);
    if (g) {
      g.items.push(item);
      g.last = item;
    } else {
      groups.set(k, { key: k, items: [item], last: item });
    }
  }
  return Array.from(groups.values());
}

/** Découpe une liste en tranches (les `.in()` PostgREST passent dans l'URL). */
export function chunk<T>(list: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

/**
 * Curseur de reprise d'une table du pull. Table complète → l'heure serveur
 * relevée AVANT les lectures (rien d'écrit pendant la lecture n'est sauté) ;
 * table tronquée au plafond → la valeur de tri de la dernière ligne reçue
 * (relue en `>=` au prochain appel, les doublons se fusionnent par clé).
 */
export function nextPullCursor(
  complete: boolean,
  serverTime: string,
  lastSortValue: string | null | undefined,
  previous: string | null,
): string | null {
  if (complete) return serverTime;
  return lastSortValue ?? previous;
}
