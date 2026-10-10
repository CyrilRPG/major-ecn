import { instantParis } from '@/lib/agenda/planning';
import { contexteCockpit, membresEquipe } from '@/lib/cockpit/server/base';
import { tachesVisibles } from '@/lib/cockpit/server/taches';
import { nomComplet } from '@/lib/cockpit/regles';
import { PageCockpit } from '@/components/admin/cockpit/ui';
import { ListeTaches } from '@/components/admin/cockpit/taches/liste-taches';

export const metadata = { title: 'Mes tâches' };
export const dynamic = 'force-dynamic';

/**
 * « Mes tâches » (§3, §4) : création rapide, statuts, priorités, catégories,
 * rappels, récurrence, partage, historique. Seules les tâches de
 * l'utilisateur, celles qui lui sont affectées et celles partagées avec lui.
 */
export default async function TachesPage({ searchParams }: { searchParams: Promise<{ vue?: string; t?: string }> }) {
  const sp = await searchParams;
  const { moi, db } = await contexteCockpit();
  const [actives, archivees, membres] = await Promise.all([
    tachesVisibles(db, moi.id),
    sp.vue === 'archivees' ? tachesVisibles(db, moi.id, { archivees: true }) : Promise.resolve([]),
    membresEquipe(db),
  ]);
  const aujourdHui = instantParis().date;
  return (
    <PageCockpit>
      <ListeTaches
        taches={[...actives, ...archivees]}
        aujourdHui={aujourdHui}
        moiId={moi.id}
        membres={membres.filter((m) => m.id !== moi.id).map((m) => ({ id: m.id, nom: nomComplet(m) || m.email || 'Membre' }))}
        vueInitiale={sp.vue ?? 'ouvertes'}
        ouverte={sp.t ?? null}
      />
    </PageCockpit>
  );
}
