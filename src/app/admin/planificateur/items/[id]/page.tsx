import Link from 'next/link';
import { notFound } from 'next/navigation';
import { collegeFamily, getItem, listColleges, listCoursOfColleges, listDomains, listItems, listPrerequisites } from '@/lib/plan/db';
import { ItemForm } from '@/components/admin/plan/item-form';
import { PrereqEditor } from '@/components/admin/plan/prereq-editor';
import { SectionCard } from '@/components/admin/suivi/ui';

/** Fiche d'un item : matrice (§3), hard_priority (§9.5), prérequis (§17). */
export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) notFound();
  const [colleges, allPrereqs] = await Promise.all([listColleges(), listPrerequisites()]);
  const top = colleges.find((c) => c.id === item.specialite_id)?.parent_matiere_id ?? item.specialite_id;
  const family = collegeFamily(top, colleges);
  const [siblings, cours, domains] = await Promise.all([listItems({ specialites: family }), listCoursOfColleges(family), listDomains(top)]);
  const nameOf = new Map(siblings.map((i) => [i.id, i.nom_item]));
  const prerequisites = allPrereqs.filter((p) => p.item_id === id);
  const dependents = allPrereqs.filter((p) => p.prerequisite_item_id === id).map((p) => ({ id: p.item_id, name: nameOf.get(p.item_id) ?? p.item_id, blocking: p.blocking ?? p.type === 'indispensable' }));
  const coursTitle = item.cours_id ? cours.find((c) => c.id === item.cours_id)?.titre ?? item.cours_id : null;
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <Link href="/admin/planificateur/items" className="text-xs text-(--color-ink-muted) hover:underline">← Matrice</Link>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">{item.nom_item}</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">{colleges.find((c) => c.id === item.specialite_id)?.nom ?? item.specialite_id}{coursTitle ? ` · relié au cours « ${coursTitle} »` : ' · aucun cours relié'}</p>
      </header>
      <div className="space-y-6">
        <SectionCard title="Caractéristiques">
          <ItemForm item={item} colleges={colleges.filter((c) => c.id !== 'col-decouverte').map((c) => ({ id: c.id, nom: c.nom, parent: c.parent_matiere_id }))} cours={cours.map((c) => ({ id: c.id, titre: c.titre, matiere_id: c.matiere_id }))} domains={domains.map((d) => ({ id: d.id, label: d.label }))} />
        </SectionCard>
        <SectionCard title="Prérequis" description="Le moteur remonte le besoin sur le prérequis quand l’item est important et le prérequis insuffisant, et séquence le prérequis avant l’item dans la journée et la semaine.">
          <PrereqEditor itemId={id} prerequisites={prerequisites} candidates={siblings.map((i) => ({ id: i.id, name: i.nom_item }))} dependents={dependents} />
        </SectionCard>
      </div>
    </main>
  );
}
