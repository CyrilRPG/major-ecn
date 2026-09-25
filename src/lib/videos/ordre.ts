/**
 * Ordre des vidéos d'une liste (un item × une catégorie) — règles PURES du
 * glisser-déposer de /admin/videos, partagées par le navigateur (calcul de la
 * place de dépôt, mise à jour optimiste) et le serveur (écriture des
 * `order_index`). C'est cet ordre que suivent les pages élève : `chargerReplays`
 * et `grouperParRubrique` trient par `order_index` (puis date de création).
 */

/** Copie de `liste` où l'élément d'indice `de` est déplacé à l'indice `vers`. */
export function deplacerElement<T>(liste: readonly T[], de: number, vers: number): T[] {
  const copie = liste.slice();
  if (de < 0 || de >= copie.length) return copie;
  const cible = Math.max(0, Math.min(copie.length - 1, vers));
  if (cible === de) return copie;
  const [el] = copie.splice(de, 1);
  copie.splice(cible, 0, el);
  return copie;
}

/**
 * Place de dépôt pendant un glisser : l'élément glissé (indice `de`, centre
 * vertical actuel `centre`) prend la place qui laisse avant lui toutes les
 * AUTRES cartes dont le milieu (position d'origine) est au-dessus de son centre.
 */
export function indiceDeDepot(milieux: readonly number[], de: number, centre: number): number {
  let avant = 0;
  milieux.forEach((m, i) => { if (i !== de && centre > m) avant++; });
  return avant;
}

/**
 * Décalage vertical d'une carte pendant qu'une autre glisse de `de` vers
 * `vers` : les cartes franchies se poussent de la hauteur de la carte glissée
 * (espacement compris) pour libérer l'emplacement de dépôt.
 */
export function decalagePendantGlisser(i: number, de: number, vers: number, hauteur: number): number {
  if (i === de) return 0;
  if (de < vers && i > de && i <= vers) return -hauteur;
  if (vers < de && i >= vers && i < de) return hauteur;
  return 0;
}

/** Même ensemble d'identifiants, sans doublon (l'ordre mis à part). */
export function memesIdentifiants(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length || new Set(a).size !== a.length) return false;
  const ens = new Set(b);
  return a.every((id) => ens.has(id));
}

/**
 * Écritures nécessaires pour que la liste prenne l'ordre `nouvelOrdre`
 * (indices 0..n-1, recompactés) : seules les lignes dont l'index change.
 */
export function ecrituresOrdre(
  actuelles: readonly { id: string; order_index: number | null }[],
  nouvelOrdre: readonly string[],
): { id: string; order_index: number }[] {
  const avant = new Map(actuelles.map((v) => [v.id, v.order_index]));
  return nouvelOrdre
    .map((id, i) => ({ id, order_index: i }))
    .filter((e) => avant.get(e.id) !== e.order_index);
}

/**
 * Élément qui a « bougé » entre deux ordres (pour le journal) : le seul
 * déplacé quand il n'y en a qu'un, sinon null. Renvoie ses positions (1-based).
 */
export function elementDeplace(
  avant: readonly string[],
  apres: readonly string[],
): { id: string; de: number; vers: number } | null {
  if (!memesIdentifiants(avant, apres)) return null;
  // Seule la plage [premier, dernier] où les deux ordres diffèrent peut avoir
  // bougé : un déplacement unique y fait descendre sa première carte ou y
  // fait monter sa dernière.
  let premier = 0;
  while (premier < avant.length && avant[premier] === apres[premier]) premier++;
  if (premier === avant.length) return null;
  let dernier = avant.length - 1;
  while (avant[dernier] === apres[dernier]) dernier--;
  const pareil = (essai: string[]) => essai.every((id, i) => id === apres[i]);
  if (pareil(deplacerElement(avant, premier, dernier))) return { id: avant[premier], de: premier + 1, vers: dernier + 1 };
  if (pareil(deplacerElement(avant, dernier, premier))) return { id: avant[dernier], de: dernier + 1, vers: premier + 1 };
  return null;
}
