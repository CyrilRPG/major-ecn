import Link from 'next/link';
import { collegeFamily, getParameterSet, listColleges, listDomains, listItems, listPrerequisites, listPreparations } from '@/lib/plan/db';
import { hardPriorityStatus, structuralScore } from '@/lib/plan/matrix';
import { ItemsTable } from '@/components/admin/plan/items-table';
import { ImportMatrix } from '@/components/admin/plan/import-matrix';
import { SeedFromCollege } from '@/components/admin/plan/seed-from-college';
import { SectionCard } from '@/components/admin/suivi/ui';

// Publier une version de la matrice recalcule le planning futur des élèves de la spécialité.
export const maxDuration = 60;

/** Matrice pédagogique (§3, §34) : liste, édition en ligne, hard_priority, import, création depuis les cours. */
export default async function PlanItemsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const college = typeof sp.college === 'string' ? sp.college : '';
  const [colleges, preps, paramSet] = await Promise.all([listColleges(), listPreparations(), getParameterSet()]);
  const family = college ? collegeFamily(college, colleges) : undefined;
  const [items, prereqs] = await Promise.all([listItems({ specialites: family }), listPrerequisites()]);
  const prereqCount = new Map<string, number>();
  for (const p of prereqs) prereqCount.set(p.item_id, (prereqCount.get(p.item_id) ?? 0) + 1);
  const tops = colleges.filter((c) => !c.parent_matiere_id && c.id !== 'col-decouverte');
  const nameOf = Object.fromEntries(colleges.map((c) => [c.id, c.nom]));
  const domainNames: Record<string, string> = {};
  for (const p of preps) for (const d of await listDomains(p.specialite_id)) domainNames[d.id] = d.label;
  const scores = Object.fromEntries(items.map((i) => [i.id, { interne: structuralScore(i, 'interne', paramSet.params), externe: structuralScore(i, 'externe', paramSet.params) }]));
  const active = items.filter((i) => i.actif && (i.statut ?? 'active') === 'active');
  const hard = active.filter((i) => i.hard_priority).length;
  const st = hardPriorityStatus(active.length, hard, paramSet.params);
  const tone = st.blocked ? 'bg-red-100 text-red-800' : st.alert ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800';
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-(--color-border) pb-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">Matrice pédagogique</h1>
          <p className="mt-1 text-sm text-(--color-ink-soft)">Importance structurelle de chaque item (jamais la faiblesse individuelle) : critères, niveaux P1–P4 par voie, pertinence 2026, hard_priority, charge et temps de référence. Modifiable ici sans intervention du développeur.</p>
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
          {college && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
              hard_priority : {hard}/{active.length} items actifs ({Math.round(st.share * 1000) / 10} %){st.blocked ? ' — au-delà de 10 % : publication bloquée' : st.alert ? ' — au-delà du plafond recommandé de 5 %' : ''}
            </span>
          )}
        </form>
        <ItemsTable items={items} collegeNames={nameOf} domainNames={domainNames} prereqCount={Object.fromEntries(prereqCount)} scores={scores} />
        <SectionCard title="Importer la matrice (CSV / XLSX)" description="Matrice versionnée (MG_2026_V1…) : publiée comme une version datée, voir l’onglet Versions. Autre fichier : les items existants (même spécialité, même nom) sont mis à jour ; les autres sont créés.">
          <ImportMatrix colleges={tops.map((c) => ({ id: c.id, nom: c.nom }))} defaultCollege={college || undefined} />
        </SectionCard>
      </div>
    </main>
  );
}
