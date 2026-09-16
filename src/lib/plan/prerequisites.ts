/**
 * Prérequis (§5, §6, §15) — module PUR.
 *
 * Graphe orienté item → prérequis. Un prérequis INDISPENSABLE bloque l'item
 * tant qu'il n'est pas maîtrisé au seuil (le sien, sinon celui des réglages) ;
 * un prérequis RECOMMANDÉ n'influence que l'ordre. Les chaînes sont remontées
 * récursivement (A → B → C), et les dépendances circulaires sont détectées.
 */
import { prerequisiteMet, type MasteryValue } from './mastery';
import type { PlanPrerequisite } from './types';

export type PrereqGraph = {
  /** item_id → prérequis directs */
  byItem: Map<string, PlanPrerequisite[]>;
  /** prerequisite_item_id → items qui en dépendent */
  dependents: Map<string, string[]>;
};

export function buildGraph(rows: PlanPrerequisite[]): PrereqGraph {
  const byItem = new Map<string, PlanPrerequisite[]>();
  const dependents = new Map<string, string[]>();
  for (const r of rows) {
    if (r.item_id === r.prerequisite_item_id) continue;
    byItem.set(r.item_id, [...(byItem.get(r.item_id) ?? []), r]);
    dependents.set(r.prerequisite_item_id, [...(dependents.get(r.prerequisite_item_id) ?? []), r.item_id]);
  }
  return { byItem, dependents };
}

/**
 * Ajouter `prerequisite → item` créerait-il un cycle ? Vrai si `item` est
 * déjà (transitivement) un prérequis de `prerequisite`.
 */
export function wouldCreateCycle(graph: PrereqGraph, itemId: string, prerequisiteId: string): boolean {
  if (itemId === prerequisiteId) return true;
  const seen = new Set<string>();
  const stack = [prerequisiteId];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    if (cur === itemId) return true;
    if (seen.has(cur)) continue;
    seen.add(cur);
    for (const p of graph.byItem.get(cur) ?? []) stack.push(p.prerequisite_item_id);
  }
  return false;
}

/** Cycles présents dans le graphe (liste d'identifiants impliqués), pour l'administration. */
export function findCycles(graph: PrereqGraph): string[][] {
  const cycles: string[][] = [];
  const color = new Map<string, 0 | 1 | 2>();
  const path: string[] = [];
  const visit = (n: string) => {
    color.set(n, 1); path.push(n);
    for (const p of graph.byItem.get(n) ?? []) {
      const next = p.prerequisite_item_id;
      const c = color.get(next) ?? 0;
      if (c === 1) cycles.push(path.slice(path.indexOf(next)));
      else if (c === 0) visit(next);
    }
    path.pop(); color.set(n, 2);
  };
  for (const n of graph.byItem.keys()) if ((color.get(n) ?? 0) === 0) visit(n);
  return cycles;
}

export type ChainInput = {
  graph: PrereqGraph;
  mastery: Map<string, MasteryValue>;
  defaultThreshold: number;
  /** Items actifs seulement : un prérequis désactivé n'est jamais imposé. */
  isActive: (id: string) => boolean;
};

/**
 * Prérequis indispensables NON satisfaits d'un item, dans l'ordre où ils
 * doivent être travaillés (les plus profonds d'abord : A avant B avant C).
 * Chaque identifiant n'apparaît qu'une fois ; les cycles sont ignorés.
 */
export function unmetChain(itemId: string, input: ChainInput): string[] {
  const out: string[] = [];
  const seen = new Set<string>([itemId]);
  const walk = (id: string) => {
    for (const p of input.graph.byItem.get(id) ?? []) {
      if (p.type !== 'indispensable') continue;
      const pid = p.prerequisite_item_id;
      if (seen.has(pid) || !input.isActive(pid)) continue;
      seen.add(pid);
      const seuil = p.seuil_maitrise ?? input.defaultThreshold;
      if (prerequisiteMet(input.mastery.get(pid) ?? null, seuil)) continue;
      walk(pid);
      out.push(pid);
    }
  };
  walk(itemId);
  return out;
}

/** Prérequis recommandés directs (pour l'ordre et les explications). */
export function recommendedOf(itemId: string, graph: PrereqGraph): string[] {
  return (graph.byItem.get(itemId) ?? []).filter((p) => p.type === 'recommande').map((p) => p.prerequisite_item_id);
}

/** Items débloqués (dépendants directs) par la maîtrise d'un prérequis. */
export function unlockedBy(prerequisiteId: string, graph: PrereqGraph): string[] {
  return graph.dependents.get(prerequisiteId) ?? [];
}
