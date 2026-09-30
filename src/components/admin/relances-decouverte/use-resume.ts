'use client';

import { useEffect, useState } from 'react';
import { fetchAuthentifie } from '@/lib/auth/fresh-token';

/**
 * Résumé « à relancer » partagé par la bannière du tableau de bord et la
 * pastille du menu : un seul appel par minute et par onglet, quel que soit le
 * nombre d'abonnés. Invalidé par le module après chaque envoi.
 */
export type ResumeRelances = { aRelancer: number; R1: number; R2: number; R3: number; anciensAcces: number; pause: boolean };

let cache: { valeur: ResumeRelances | null; at: number } | null = null;
let enVol: Promise<ResumeRelances | null> | null = null;
const abonnes = new Set<(r: ResumeRelances | null) => void>();
const DUREE = 60_000;

async function charger(force = false): Promise<ResumeRelances | null> {
  if (!force && cache && Date.now() - cache.at < DUREE) return cache.valeur;
  if (enVol) return enVol;
  enVol = (async () => {
    try {
      const res = await fetchAuthentifie('/api/admin/relances-decouverte/resume');
      const valeur = res.ok ? ((await res.json()) as ResumeRelances) : null;
      cache = { valeur, at: Date.now() };
      abonnes.forEach((f) => f(valeur));
      return valeur;
    } catch {
      return cache?.valeur ?? null;
    } finally {
      enVol = null;
    }
  })();
  return enVol;
}

/** À appeler après un envoi ou une synchronisation : bannière et pastille se recalculent. */
export function rafraichirResumeRelances() {
  void charger(true);
}

export function useResumeRelances(actif: boolean, cle?: string): ResumeRelances | null {
  const [r, setR] = useState<ResumeRelances | null>(cache?.valeur ?? null);
  useEffect(() => {
    if (!actif) return;
    abonnes.add(setR);
    void charger().then(setR);
    return () => { abonnes.delete(setR); };
  }, [actif, cle]);
  return actif ? r : null;
}
