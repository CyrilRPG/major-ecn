import { requireDecouvertePage } from '@/lib/decouverte/acces';
import { filtresDepuisQuery } from '@/lib/decouverte/filtres';
import { ModuleRelances } from '@/components/admin/relances-decouverte/module';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Relances Offre Découverte' };

/**
 * Relances de l'Offre Découverte — administrateurs et membres de l'équipe
 * dotés du module « Suivi élèves » (consultation ; rédaction et envoi groupé
 * selon leurs droits, paramétrage réservé aux administrateurs).
 * `?vue=a_relancer` : ouverture directe sur les seuls candidats à relancer
 * (lien de la notification du tableau de bord).
 */
export default async function RelancesDecouvertePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireDecouvertePage();
  const sp = await searchParams;
  const plats = Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  return <ModuleRelances filtresInitiaux={filtresDepuisQuery(plats)} />;
}
