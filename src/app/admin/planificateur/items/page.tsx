import Link from 'next/link';
import { collegeFamily, listColleges, listItems, listPrerequisites } from '@/lib/plan/db';
import { ItemsTable } from '@/components/admin/plan/items-table';
import { ImportMatrix } from '@/components/admin/plan/import-matrix';
import { SeedFromCollege } from '@/components/admin/plan/seed-from-college';
import { SectionCard } from '@/components/admin/suivi/ui';

/** Matrice pédagogique (§4, §22) : liste, édition en ligne, import, création depuis les cours. */
export default async function PlanItemsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const college = typeof sp.college === 'string' ? sp.college : '';
  const colleges = await listColleges();
  const family = college ? collegeFamily(college, colleges) : undefined;
  const [items, prereqs] = await Promise.all([listItems({ specialites: family }), listPrerequisites()]);
  const prereqCount = new Map<string, number>();
  for (const p of prereqs) prereqCount.set(p.item_id, (prereqCount.get(p.item_id) ?? 0) + 1);
  const tops = colleges.filter((c) => !c.parent_matiere_id && c.id !== 'col-decouverte');
  const nameOf = Object.fromEntries(colleges.map((c) => [c.id, c.nom]));

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-(--color-border) pb-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">Matrice pédagogique</h1>
          <p className="mt-1 text-sm text-(--color-ink-soft)">Importance, volume, temps de référence, transversalité, fréquence et années aux annales, récence, prérequis, priorité forcée. Modifiable ici sans intervention du développeur.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SeedFromCollege colleges={tops.map((c) => ({ id: c.id, nom: c.nom }))} />
          <Link href={`/admin/planificateur/items/nouveau${college ? `?college=${college}` : ''}`} className="inline-flex h-9 items-center rounded-(--radius-button) bg-(--color-primary) px-3 text-sm font-medium text-(--color-primary-fg)">Nouvel item</Link>
        </div>
      </header>
      <div className="space-y-6">
        <form method="get" className="flex flex-wrap items-center gap-2">
          <select name="college" defaultValue={college} className="h-9 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-2 text-sm text-(--color-ink)">
            <option value="">Toutes les spécialités</option>
            {tops.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <button type="submit" className="h-9 rounded-(--radius-button) border border-(--color-border) px-3 text-sm text-(--color-ink)">Filtrer</button>
          <span className="text-sm text-(--color-ink-soft)">{items.length} item(s)</span>
        </form>
        <ItemsTable items={items} collegeNames={nameOf} prereqCount={Object.fromEntries(prereqCount)} />
        <SectionCard title="Importer la matrice (CSV / XLSX)" description="Les items existants (même spécialité, même nom) sont mis à jour ; les autres sont créés. Les prérequis peuvent être nommés dans le fichier.">
          <ImportMatrix colleges={tops.map((c) => ({ id: c.id, nom: c.nom }))} />
        </SectionCard>
      </div>
    </main>
  );
}
