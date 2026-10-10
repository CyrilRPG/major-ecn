import 'server-only';
import { instantParis } from '@/lib/agenda/planning';
import { auditer, db, heartbeat, journaliser, parametres } from './base';
import { traiterBoite } from './emails';
import { effacerDuStockage } from './fichiers';
import { echeancesGroupes, synchroniserTout } from './groupes';

/**
 * Tâche planifiée du module Échanges (vercel.json, toutes les 5 minutes) :
 *  1. relances H+12 dues — une seule par tag (SQL atomique), tolérance ≤ 5 min (§24, §161) ;
 *  2. escalade à l'équipe si activée (§130) ;
 *  3. boîte d'envoi (e-mails initiaux non partis, relances, alertes) avec reprise contrôlée (§87, R42) ;
 *  4. échéances des groupes : clôture et archivage programmés, alerte préalable (§79) ;
 *  5. synchronisation des participants avec les inscriptions (toutes les 15 min, §84, §178) ;
 *  6. purge de conservation, une fois par nuit (§139, R20).
 * Chaque étape est isolée : l'échec de l'une n'empêche pas les autres (§141).
 */
export async function balayageEchanges(now = new Date()): Promise<Record<string, unknown>> {
  const debut = Date.now();
  const resultat: Record<string, unknown> = {};
  const etape = async (nom: string, f: () => Promise<unknown>) => {
    try {
      resultat[nom] = await f();
    } catch (e) {
      resultat[nom] = { erreur: String(e).slice(0, 300) };
      await journaliser('erreur', 'cron', `Étape « ${nom} » en échec`, { erreur: String(e).slice(0, 500) });
    }
  };
  const prm = await parametres(true);

  await etape('relances', async () => {
    const { data, error } = await db().rpc('echanges_relances_dues', { p_maintenant: now.toISOString() });
    if (error) throw new Error(error.message);
    const n = (data ?? []).length;
    if (n > 0) await journaliser('info', 'relance', `${n} relance(s) H+${prm.relance_heures} programmée(s)`);
    return n;
  });
  if (prm.escalade_active) {
    await etape('escalades', async () => {
      const { data, error } = await db().rpc('echanges_escalades_dues', { p_heures: prm.escalade_heures, p_maintenant: now.toISOString() });
      if (error) throw new Error(error.message);
      return (data ?? []).length;
    });
  }
  await etape('emails', () => traiterBoite(100));
  await etape('echeances', () => echeancesGroupes());

  const paris = instantParis(now);
  const minute = Number(paris.heure.slice(3, 5));
  if (minute % 15 < 5) await etape('synchronisation', () => synchroniserTout());

  // Purge : entre 03:00 et 03:04 (heure de Paris), une fois.
  if (paris.heure >= '03:00' && paris.heure < '03:05') {
    await etape('purge', async () => {
      const { data, error } = await db().rpc('echanges_purger', { p_maintenant: now.toISOString() });
      if (error) throw new Error(error.message);
      const lignes = (data ?? []) as { categorie: string; nombre: number; chemins: string[] }[];
      const chemins = lignes.flatMap((l) => l.chemins ?? []);
      const fichiers = chemins.length ? await effacerDuStockage(chemins) : 0;
      const bilan = Object.fromEntries(lignes.map((l) => [l.categorie, l.nombre]));
      if (Object.values(bilan).some((n) => Number(n) > 0) || fichiers > 0) {
        await auditer({ action: 'purge', acteurId: null, acteurRole: 'systeme', details: { ...bilan, fichiers } });
      }
      return { ...bilan, fichiers };
    });
  }

  await heartbeat('echanges', debut, resultat);
  return resultat;
}
