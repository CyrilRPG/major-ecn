'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Placement, Postit, Tache } from '@/lib/postits/regles';
import { actionPostit, type ReponseAction } from './api';

/**
 * État partagé d'un ensemble de Post-it (calque d'une page OU bibliothèque) :
 * la liste, les fenêtres demandées (archiver, supprimer, déplacer, ouvrir en
 * grand) et l'appel unique à l'API, qui affiche ses erreurs dans un bandeau.
 */

export type Demande =
  | { genre: 'archiver'; postit: Postit }
  | { genre: 'supprimer'; postit: Postit }
  | { genre: 'deplacer'; postit: Postit; mode: 'deplacer' | 'afficherAussi' | 'restaurer'; depuis: string | null }
  | { genre: 'ouvrir'; postitId: string };

type Ctx = {
  postits: Postit[];
  /** Emplacement de la page courante (null : bibliothèque). */
  cleCourante: string | null;
  /** Aujourd'hui, date LOCALE de l'appareil (AAAA-MM-JJ). */
  aujourdHui: string;
  remplacer: (p: Postit) => void;
  ajouter: (p: Postit) => void;
  majPlacement: (postitId: string, placementId: string, patch: Partial<Placement>) => void;
  majTache: (postitId: string, t: Tache) => void;
  enleverTache: (postitId: string, tacheId: string) => void;
  appeler: (corps: Record<string, unknown> & { action: string }) => Promise<ReponseAction | null>;
  demande: Demande | null;
  demander: (d: Demande | null) => void;
  signaler: (message: string) => void;
};

const Contexte = createContext<Ctx | null>(null);

export function usePostits(): Ctx {
  const c = useContext(Contexte);
  if (!c) throw new Error('usePostits hors de <FournisseurPostits>');
  return c;
}

/** Date locale du jour — jamais `toISOString()` (décalage UTC le soir). */
export function dateLocale(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function FournisseurPostits({
  postits, setPostits, cleCourante, children,
}: {
  postits: Postit[];
  setPostits: (f: (l: Postit[]) => Postit[]) => void;
  cleCourante: string | null;
  children: ReactNode;
}) {
  const [demande, demander] = useState<Demande | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const minuterie = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [aujourdHui] = useState(() => dateLocale());

  const signaler = useCallback((m: string) => {
    setMessage(m);
    if (minuterie.current) clearTimeout(minuterie.current);
    minuterie.current = setTimeout(() => setMessage(null), 5000);
  }, []);

  const remplacer = useCallback((p: Postit) => {
    setPostits((l) => (l.some((x) => x.id === p.id) ? l.map((x) => (x.id === p.id ? p : x)) : [...l, p]));
  }, [setPostits]);
  const ajouter = remplacer;

  const majPlacement = useCallback((postitId: string, placementId: string, patch: Partial<Placement>) => {
    setPostits((l) => l.map((p) => (p.id !== postitId ? p : {
      ...p, placements: p.placements.map((pl) => (pl.id === placementId ? { ...pl, ...patch } : pl)),
    })));
  }, [setPostits]);

  const majTache = useCallback((postitId: string, t: Tache) => {
    setPostits((l) => l.map((p) => (p.id !== postitId ? p : {
      ...p, taches: p.taches.some((x) => x.id === t.id) ? p.taches.map((x) => (x.id === t.id ? t : x)) : [...p.taches, t],
    })));
  }, [setPostits]);

  const enleverTache = useCallback((postitId: string, tacheId: string) => {
    setPostits((l) => l.map((p) => (p.id !== postitId ? p : { ...p, taches: p.taches.filter((x) => x.id !== tacheId) })));
  }, [setPostits]);

  const appeler = useCallback(async (corps: Record<string, unknown> & { action: string }) => {
    try {
      const r = await actionPostit(corps);
      if (r.postit) remplacer(r.postit);
      return r;
    } catch (e) {
      signaler(e instanceof Error ? e.message : 'Opération impossible.');
      return null;
    }
  }, [remplacer, signaler]);

  const valeur = useMemo<Ctx>(() => ({
    postits, cleCourante, aujourdHui, remplacer, ajouter, majPlacement, majTache, enleverTache, appeler, demande, demander, signaler,
  }), [postits, cleCourante, aujourdHui, remplacer, ajouter, majPlacement, majTache, enleverTache, appeler, demande, signaler]);

  return (
    <Contexte.Provider value={valeur}>
      {children}
      {message && (
        <div role="status" className="fixed bottom-5 left-1/2 z-[70] max-w-[92vw] -translate-x-1/2 rounded-xl bg-[#2A0A14] px-4 py-2.5 text-[13px] font-semibold text-white shadow-2xl">
          {message}
        </div>
      )}
    </Contexte.Provider>
  );
}
