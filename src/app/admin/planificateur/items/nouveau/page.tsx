import Link from 'next/link';
import { listColleges, listCoursOfColleges, listDomains, listPreparations } from '@/lib/plan/db';
import { ItemForm } from '@/components/admin/plan/item-form';

/** Nouvel item (§34) : un nouvel item 2026 peut être prioritaire sans historique, intégré progressivement. */
export default async function NouvelItemPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const colleges = (await listColleges()).filter((c) => c.id !== 'col-decouverte');
  const cours = await listCoursOfColleges(colleges.map((c) => c.id));
  const college = typeof sp.college === 'string' ? sp.college : undefined;
  const preps = await listPreparations();
  const domains = college && preps.some((p) => p.specialite_id === college) ? await listDomains(college) : [];
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <Link href="/admin/planificateur/items" className="text-xs text-(--color-ink-muted) hover:underline">← Matrice</Link>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">Nouvel item</h1>
      </header>
      <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-5">
        <ItemForm item={null} colleges={colleges.map((c) => ({ id: c.id, nom: c.nom, parent: c.parent_matiere_id }))} cours={cours.map((c) => ({ id: c.id, titre: c.titre, matiere_id: c.matiere_id }))} domains={domains.map((d) => ({ id: d.id, label: d.label }))} defaultCollege={college} />
      </div>
    </main>
  );
}
