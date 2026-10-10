'use client';

import { useEffect, useRef } from 'react';
import { fetchAuthentifie } from '@/lib/auth/fresh-token';
import { createClient } from '@/lib/supabase/client';

/**
 * Appels du module Échanges depuis le navigateur. Jeton toujours frais
 * (`fetchAuthentifie`) : une conversation reste ouverte des heures, le cookie
 * expire au bout d'une heure.
 */

export class ErreurApi extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
  }
}

export async function api<T>(url: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetchAuthentifie(url, {
    method: init.method ?? 'GET',
    cache: 'no-store',
    headers: init.body !== undefined ? { 'Content-Type': 'application/json' } : {},
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  const j = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
  if (!res.ok) throw new ErreurApi(j.error ?? 'Une erreur est survenue. Réessayez.', res.status, j.code);
  return j as T;
}

export function signalerAnomalie(type: 'temps_reel' | 'envoi' | 'fichier', detail: string) {
  void api('/api/echanges/telemetrie', { method: 'POST', body: { type, detail } }).catch(() => undefined);
}

/**
 * Temps réel : abonnement au canal secret du groupe. Le signal ne contient
 * aucun contenu ; on va chercher les changements par la route autorisée. En
 * cas d'indisponibilité, interrogation périodique (15 s quand l'onglet est
 * visible) : la messagerie reste utilisable sans temps réel.
 */
export function useTempsReel(topic: string | null, surSignal: () => void) {
  const ref = useRef(surSignal);
  useEffect(() => { ref.current = surSignal; }, [surSignal]);

  useEffect(() => {
    if (!topic) return;
    let connecte = false;
    let annule = false;
    const supabase = createClient();
    const canal = supabase.channel(`echanges:${topic}`, { config: { broadcast: { self: false } } })
      .on('broadcast', { event: 'signal' }, () => ref.current())
      .subscribe((statut) => {
        if (annule) return;
        if (statut === 'SUBSCRIBED') { connecte = true; ref.current(); }
        if (statut === 'CHANNEL_ERROR' || statut === 'TIMED_OUT') {
          if (connecte) signalerAnomalie('temps_reel', `Canal ${statut}`);
          connecte = false;
        }
        if (statut === 'CLOSED') connecte = false;
      });
    // Filet de sécurité : interrogation lente si connecté, rapide sinon.
    const t = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      ref.current();
    }, 15_000);
    const t2 = window.setInterval(() => {
      if (document.visibilityState === 'visible' && !connecte) ref.current();
    }, 5_000);
    const vis = () => { if (document.visibilityState === 'visible') ref.current(); };
    document.addEventListener('visibilitychange', vis);
    window.addEventListener('online', vis);
    return () => {
      annule = true;
      window.clearInterval(t); window.clearInterval(t2);
      document.removeEventListener('visibilitychange', vis);
      window.removeEventListener('online', vis);
      void supabase.removeChannel(canal);
    };
  }, [topic]);
}

/** Téléversement direct vers le stockage privé (URL signée émise par le serveur). */
export async function televerser(groupeId: string, fichier: File, legende: string | null): Promise<{ id: string; enModeration: boolean }> {
  const prep = await api<{ id: string; chemin: string; jeton: string }>(`/api/echanges/groupes/${groupeId}/fichiers`, {
    method: 'POST',
    body: { nom: fichier.name, mime: fichier.type || 'application/octet-stream', taille: fichier.size, legende },
  });
  const supabase = createClient();
  const { error } = await supabase.storage.from('echanges').uploadToSignedUrl(prep.chemin, prep.jeton, fichier, { contentType: fichier.type });
  if (error) {
    signalerAnomalie('fichier', error.message);
    throw new ErreurApi('L’envoi du fichier a échoué. Vérifiez votre connexion et réessayez.', 0);
  }
  const v = await api<{ piece: { id: string; enModeration: boolean } }>(`/api/echanges/fichiers/${prep.id}`, { method: 'POST' });
  return { id: v.piece.id, enModeration: v.piece.enModeration };
}

/** URL signée (60 s) d'une pièce jointe, demandée avec un jeton frais. */
export async function urlFichier(id: string, telecharger = false): Promise<string> {
  const r = await api<{ url: string }>(`/api/echanges/fichiers/${id}?format=json${telecharger ? '&telecharger=1' : ''}`);
  return r.url;
}

export function heure(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });
}

export function jourLisible(iso: string): string {
  const d = new Date(iso);
  const auj = new Date();
  const cle = (x: Date) => x.toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' });
  const hier = new Date(auj.getTime() - 86_400_000);
  if (cle(d) === cle(auj)) return 'Aujourd’hui';
  if (cle(d) === cle(hier)) return 'Hier';
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: d.getFullYear() === auj.getFullYear() ? undefined : 'numeric', timeZone: 'Europe/Paris' });
}

export function depuisCourt(iso: string): string {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return 'à l’instant';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  const j = Math.floor(h / 24);
  return j === 1 ? 'hier' : `${j} j`;
}
