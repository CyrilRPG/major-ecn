import { journaliser } from '@/lib/echanges/serveur/base';
import { authentifier, garde, lireJson, ok } from '@/lib/echanges/serveur/http';

export const dynamic = 'force-dynamic';

/** Anomalies remontées par l'interface (temps réel indisponible, envoi échoué) — observabilité, §142. */
export async function POST(req: Request) {
  return garde('telemetrie', async () => {
    const a = await authentifier(req);
    if ('reponse' in a) return a.reponse;
    const b = await lireJson<{ type?: string; detail?: string }>(req);
    const type = String(b.type ?? '').slice(0, 40);
    if (!['temps_reel', 'envoi', 'fichier'].includes(type)) return ok({ ok: true });
    await journaliser('alerte', type === 'temps_reel' ? 'temps_reel' : type === 'fichier' ? 'fichier' : 'publication', `Signalé par l’interface : ${String(b.detail ?? '').slice(0, 200)}`, { utilisateur: a.acteur.id });
    return ok({ ok: true });
  });
}
