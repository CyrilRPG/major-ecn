import { collegeFamily, listColleges, listDomains, listItems, syncStructure } from '@/lib/plan/db';
import { preparationStats } from '@/lib/plan/admin';
import { StructureEditor } from '@/components/admin/plan/structure-editor';
import { SectionCard } from '@/components/admin/suivi/ui';

/**
 * Préparations, structure et domaines (complément « structure variable ») :
 * la structure vient de la matrice de chaque préparation, jamais du nom d'une
 * spécialité dans le code.
 */
export default async function StructurePage() {
  // Rattrapage idempotent : préparations, domaines réels et ordre des items ajoutés depuis.
  await syncStructure().catch((e) => console.error('[plan] structure :', e instanceof Error ? e.message : e));
  const [preps, colleges] = await Promise.all([preparationStats(), listColleges()]);
  const blocks = await Promise.all(preps.map(async (p) => {
    const [domains, items] = await Promise.all([listDomains(p.specialite_id), listItems({ specialites: collegeFamily(p.specialite_id, colleges), activeOnly: true })]);
    items.sort((a, b) => (a.display_order ?? 1e9) - (b.display_order ?? 1e9) || a.nom_item.localeCompare(b.nom_item, 'fr'));
    return { p, domains, items };
  }));
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">Préparations et structure</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">Structure hiérarchique (préparation → domaine → item) ou plate (préparation → item) ; domaines, ordre et rattachement des items ; ouverture aux élèves et Parcours du Major par préparation.</p>
      </header>
      <div className="space-y-6">
        {blocks.map(({ p, domains, items }) => (
          <SectionCard key={p.specialite_id} title={p.name} description={p.hardBlocked ? `hard_priority : ${Math.round(p.hardShare * 1000) / 10} % des items actifs — au-delà de 10 %, publication bloquée.` : p.hardAlert ? `hard_priority : ${Math.round(p.hardShare * 1000) / 10} % des items actifs — au-delà du plafond recommandé de 5 %.` : undefined}>
            <StructureEditor prep={p} domains={domains.map((d) => ({ id: d.id, label: d.label, order_index: d.order_index, active: d.active }))} items={items.map((i) => ({ id: i.id, name: i.nom_item, domain_id: i.domain_id ?? null, display_order: i.display_order ?? null }))} />
          </SectionCard>
        ))}
      </div>
    </main>
  );
}
