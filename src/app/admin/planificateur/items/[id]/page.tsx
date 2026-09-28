import Link from 'next/link';
import { notFound } from 'next/navigation';
import { collegeFamily, getConfig, getItem, listColleges, listCoursOfColleges, listItems, listOverlaps, listPrerequisites } from '@/lib/plan/db';
import { ItemForm } from '@/components/admin/plan/item-form';
import { OverlapEditor } from '@/components/admin/plan/overlap-editor';
import { PrereqEditor } from '@/components/admin/plan/prereq-editor';
import { SectionCard } from '@/components/admin/suivi/ui';

/** Fiche d'un item : caractéristiques (§4) et prérequis (§5). */
export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) notFound();
  const [colleges, config, allPrereqs] = await Promise.all([listColleges(), getConfig(), listPrerequisites()]);
  const top = colleges.find((c) => c.id === item.specialite_id)?.parent_matiere_id ?? item.specialite_id;
  const family = collegeFamily(top, colleges);
  const [siblings, cours, overlaps, allItems] = await Promise.all([listItems({ specialites: family }), listCoursOfColleges(family), listOverlaps([id]), listItems()]);
  const collegeName = new Map(colleges.map((c) => [c.id, c.nom]));
  const nameOf = new Map(siblings.map((i) => [i.id, i.nom_item]));
  const prerequisites = allPrereqs.filter((p) => p.item_id === id);
  const dependents = allPrereqs.filter((p) => p.prerequisite_item_id === id).map((p) => ({ id: p.item_id, name: nameOf.get(p.item_id) ?? p.item_id, type: p.type }));

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <Link href="/admin/planificateur/items" className="text-xs text-(--color-ink-muted) hover:underline">← Matrice</Link>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">{item.nom_item}</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">{colleges.find((c) => c.id === item.specialite_id)?.nom ?? item.specialite_id}{item.cours_id ? ` · relié au cours ${cours.find((c) => c.id === item.cours_id)?.titre ?? item.cours_id}` : ' · aucun cours relié'}</p>
      </header>
      <div className="space-y-6">
        <SectionCard title="Caractéristiques">
          <ItemForm item={item} colleges={colleges.filter((c) => c.id !== 'col-decouverte').map((c) => ({ id: c.id, nom: c.nom, parent: c.parent_matiere_id }))} cours={cours.map((c) => ({ id: c.id, titre: c.titre, matiere_id: c.matiere_id }))} />
        </SectionCard>
        <SectionCard title="Prérequis" description={`Indispensable : l’item n’est pas programmé tant que le prérequis n’est pas maîtrisé au seuil (défaut ${config.thresholds.prerequis} %). Recommandé : influence l’ordre sans bloquer. Les chaînes (A → B → C) sont remontées automatiquement.`}>
          <PrereqEditor itemId={id} prerequisites={prerequisites} candidates={siblings.map((i) => ({ id: i.id, name: i.nom_item }))} defaultThreshold={config.thresholds.prerequis} dependents={dependents} />
        </SectionCard>
        <SectionCard title="Recouvrements" description="Connaissances de cet item déjà travaillées dans un autre (souvent pour un item ajouté par une nouvelle version de la matrice) : le temps passé sur l’item apparenté est imputé au prorata et son niveau observé sert d’estimation de départ, pour éviter les répétitions inutiles. Une évaluation courte confirme toujours le niveau.">
          <OverlapEditor itemId={id} overlaps={overlaps} candidates={allItems.map((i) => ({ id: i.id, name: i.nom_item, group: collegeName.get(i.specialite_id) ?? i.specialite_id }))} />
        </SectionCard>
      </div>
    </main>
  );
}
