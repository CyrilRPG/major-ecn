import { redirect } from 'next/navigation';
import { acteurBackOffice, equipeDisponible, equipeModeration, peut } from '@/lib/echanges/serveur/admin';
import { db, FACULTE, parametres, parTranches } from '@/lib/echanges/serveur/base';
import { dateParis } from '@/components/admin/echanges/pilotage/commun';
import { FormulaireParametres, type Personne } from '@/components/admin/echanges/pilotage/parametres-module';
import { EquipeModeration } from '@/components/admin/echanges/pilotage/equipe-moderation';

export const metadata = { title: 'Échanges — paramètres' };
export const dynamic = 'force-dynamic';

const ROLE: Record<string, Personne['type']> = { student: 'candidat', professor: 'equipe', admin: 'admin' };

/**
 * Paramètres du module Échanges (Super Admin, §141-148, §186-198, §209) :
 * mode du module et comptes testeurs, relances, quotas, pièces jointes,
 * affichage, protection des coordonnées, conservation. Puis l'équipe de
 * modération (§102-103). Le serveur revalide chaque valeur et trace
 * l'avant / après dans le journal d'audit.
 */
export default async function ParametresPage() {
  const a = await acteurBackOffice();
  if (!a) redirect('/admin');
  if (!peut(a, 'parametres')) redirect('/admin/echanges');

  const prm = await parametres(true);
  const [profilsTesteurs, membres, dispo, { data: gs }] = await Promise.all([
    parTranches(prm.testeurs ?? [], 150, async (lot) => ((await db().from('profiles').select('id, first_name, last_name, email, role').in('id', lot)).data ?? []) as { id: string; first_name: string | null; last_name: string | null; email: string | null; role: string }[]),
    equipeModeration(),
    equipeDisponible(),
    db().from('echanges_groupes').select('id, nom, promotion, statut').eq('faculte_id', FACULTE).neq('statut', 'archivee').order('nom'),
  ]);
  const testeurs: Personne[] = (prm.testeurs ?? []).map((id) => {
    const p = profilsTesteurs.find((x) => x.id === id);
    return {
      id,
      nom: p ? [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email || id : 'Compte supprimé',
      email: p?.email ?? null,
      type: p ? ROLE[p.role] ?? 'equipe' : 'equipe',
    };
  });
  const equipe: Personne[] = dispo.map((p) => ({ id: p.userId, nom: p.nom, email: p.email, type: p.role === 'admin' ? 'admin' : 'equipe' }));
  const groupes = ((gs ?? []) as { id: string; nom: string; promotion: string | null; statut: string }[])
    .map((g) => ({ id: g.id, nom: g.promotion ? `${g.nom} · ${g.promotion}` : g.nom }));

  return (
    <div className="space-y-6">
      <FormulaireParametres initial={prm} testeurs={testeurs} equipe={equipe} majLe={prm.updated_at ? dateParis(prm.updated_at) : null} />
      <EquipeModeration
        membres={membres.map((m) => ({ ...m, depuis: m.depuis ? dateParis(m.depuis, false) : null }))}
        disponibles={dispo.filter((p) => p.role === 'professor').map((p) => ({ userId: p.userId, nom: p.nom, email: p.email }))}
        groupes={groupes}
      />
    </div>
  );
}
