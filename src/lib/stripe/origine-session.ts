/**
 * Origine d'une session Stripe Checkout.
 *
 * Major ECN et Major Odontologie partagent le MÊME compte Stripe : chaque
 * webhook reçoit donc `checkout.session.completed` pour TOUS les achats du
 * compte, y compris ceux de l'autre plateforme. Le 13/09/2026, une élève
 * inscrite en Gériatrie sur Major ECN a été provisionnée par le webhook
 * d'odontologie (compte `faculte_id: major-odonto`, e-mail « Major Odonto »
 * avec un lien vers major-odontologie.vercel.app), et notre propre webhook,
 * arrivé après, a trouvé le mail « déjà envoyé » et n'a rien expédié.
 *
 * Chaque tunnel signe désormais ses sessions (`metadata.app`) et chaque
 * webhook ignore celles qui ne sont pas les siennes. Pour les sessions
 * antérieures à cette signature, la forme des métadonnées suffit : le tunnel
 * ECN écrit `first_name` / `specialty` / `college_id`, celui d'odontologie
 * `firstName` / `faculte` / `annee_concours`.
 *
 * Miroir exact dans Major Odontologie : `lib/stripe/origine-session.ts`.
 */
export const APP_ID = 'major-ecn';

export type OrigineSession = 'major-ecn' | 'major-odonto' | 'inconnue';

type Metadata = Record<string, string | undefined> | null | undefined;

export function origineSession(metadata: Metadata): OrigineSession {
  const m = metadata ?? {};
  const app = (m.app ?? '').trim();
  if (app === 'major-ecn' || app === 'major-odonto') return app;
  if (app) return 'inconnue';
  const source = m.source ?? '';
  if (source.startsWith('major-ecn')) return 'major-ecn';
  if (source.startsWith('major-odonto')) return 'major-odonto';
  if ('firstName' in m || 'faculte' in m || 'annee_concours' in m) return 'major-odonto';
  if ('first_name' in m || 'specialty' in m || 'college_id' in m) return 'major-ecn';
  return 'inconnue';
}

/** Vrai si la session vient d'une AUTRE application : ne jamais la provisionner
 *  ici. Une origine inconnue reste traitée comme la nôtre (liens de paiement
 *  privés sans métadonnées de tunnel). */
export function sessionEstEtrangere(metadata: Metadata): boolean {
  const origine = origineSession(metadata);
  return origine !== 'inconnue' && origine !== APP_ID;
}
