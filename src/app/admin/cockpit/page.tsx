import { contexteCockpit } from '@/lib/cockpit/server/base';
import { chargerCockpit, meteoParis } from '@/lib/cockpit/server/donnees';
import { ongletsDe } from '@/lib/auth/onglets-equipe';
import { requireStaff } from '@/lib/auth/require-role';
import { CockpitAccueil } from '@/components/admin/cockpit/accueil/cockpit-accueil';

export const metadata = { title: 'Mon cockpit' };
export const dynamic = 'force-dynamic';

/**
 * « Mon cockpit » — page d'accueil par défaut de l'administrateur (CDC
 * 08/10/2026 et addendum « Cockpit de pilotage opérationnel ») : priorités,
 * tâches, planning, rendez-vous, relances, réponses reçues, réclamations et
 * améliorations, sans défilement de plusieurs écrans sur ordinateur.
 * Strictement personnel : rien d'un autre administrateur n'y apparaît.
 */
export default async function CockpitPage() {
  const { moi, db } = await contexteCockpit();
  const { profile } = await requireStaff();
  const voitCours = moi.estAdmin || (await ongletsDe(profile)).agenda;
  const [donnees, meteo] = await Promise.all([chargerCockpit(db, moi, voitCours), meteoParis()]);
  return <CockpitAccueil donnees={donnees} meteo={meteo} prenom={moi.prenom || moi.nom} estAdmin={moi.estAdmin} />;
}
