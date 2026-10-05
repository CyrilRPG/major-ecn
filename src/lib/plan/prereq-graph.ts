/**
 * Graphe des prérequis (§17) — module PUR : détection des dépendances
 * circulaires avant d'enregistrer une relation « A avant B ».
 */
export type PrereqEdge = { item_id: string; prerequisite_item_id: string };
export type PrereqGraph = { byItem: Map<string, PrereqEdge[]> };

export function buildGraph(edges: PrereqEdge[]): PrereqGraph {
  const byItem = new Map<string, PrereqEdge[]>();
  for (const e of edges) byItem.set(e.item_id, [...(byItem.get(e.item_id) ?? []), e]);
  return { byItem };
}

/** Ajouter « `prerequisiteId` avant `itemId` » créerait-il un cycle ? (l'item est-il déjà un prérequis, direct ou non, du prérequis ?) */
export function wouldCreateCycle(g: PrereqGraph, itemId: string, prerequisiteId: string): boolean {
  if (itemId === prerequisiteId) return true;
  const seen = new Set<string>();
  const stack = [prerequisiteId];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    if (cur === itemId) return true;
    if (seen.has(cur)) continue;
    seen.add(cur);
    for (const e of g.byItem.get(cur) ?? []) stack.push(e.prerequisite_item_id);
  }
  return false;
}
