import 'server-only';
import { journaliser } from './base';

/**
 * Temps réel (CDC §13) — diffusion Supabase Realtime « broadcast ».
 *
 * Le serveur publie un simple SIGNAL sur le canal secret du groupe
 * (`echanges:<topic>`, 244 bits d'aléa, jamais devinable) : « quelque chose a
 * changé ». La charge utile ne contient AUCUN contenu ; l'appareil qui le
 * reçoit va chercher les changements par la route autorisée
 * `/api/echanges/groupes/<id>/changements`, qui applique tous les contrôles
 * d'accès. Un canal deviné ne livrerait donc rien.
 *
 * Si le service temps réel est indisponible, l'interface retombe sur une
 * interrogation périodique : la messagerie reste fonctionnelle (§141).
 */

export type Signal = { t: 'message' | 'maj' | 'retrait' | 'lecture' | 'groupe'; ids?: string[] };

export async function diffuser(topic: string, signal: Signal): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;
  try {
    const res = await fetch(`${url}/realtime/v1/api/broadcast`, {
      method: 'POST',
      signal: AbortSignal.timeout(3000),
      headers: { 'content-type': 'application/json', apikey: key, authorization: `Bearer ${key}` },
      body: JSON.stringify({
        messages: [{ topic: `echanges:${topic}`, event: 'signal', payload: { ...signal, ids: (signal.ids ?? []).slice(0, 50) }, private: false }],
      }),
    });
    if (!res.ok) {
      await journaliser('alerte', 'temps_reel', `Diffusion refusée (${res.status})`, { corps: (await res.text().catch(() => '')).slice(0, 200) });
      return false;
    }
    return true;
  } catch (e) {
    await journaliser('alerte', 'temps_reel', 'Diffusion impossible', { erreur: String(e) });
    return false;
  }
}
