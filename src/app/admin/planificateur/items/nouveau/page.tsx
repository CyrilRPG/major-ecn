import Link from 'next/link';
import { listColleges, listCoursOfColleges } from '@/lib/plan/db';
import { ItemForm } from '@/components/admin/plan/item-form';

export default async function NouvelItemPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const colleges = (await listColleges()).filter((c) => c.id !== 'col-decouverte');
  const cours = await listCoursOfColleges(colleges.map((c) => c.id));
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <Link href="/admin/planificateur/items" className="text-xs text-(--color-ink-muted) hover:underline">← Matrice</Link>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">Nouvel item</h1>
      </header>
      <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-5">
        <ItemForm item={null} colleges={colleges.map((c) => ({ id: c.id, nom: c.nom, parent: c.parent_matiere_id }))} cours={cours.map((c) => ({ id: c.id, titre: c.titre, matiere_id: c.matiere_id }))} defaultCollege={typeof sp.college === 'string' ? sp.college : undefined} />
      </div>
    </main>
  );
}
