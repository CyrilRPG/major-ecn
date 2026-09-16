import Link from 'next/link';
import { getConfig, listColleges, listItems, listPrerequisites, listProfiles } from '@/lib/plan/db';
import { buildGraph, findCycles } from '@/lib/plan/prerequisites';
import { Kpi, SectionCard } from '@/components/admin/suivi/ui';
import { PLAN_STUDENT_ENABLED } from '@/lib/modules-flags';

/** Vue d'ensemble : état de la matrice par spécialité, candidats, réglages. */
export default async function PlanAdminHome() {
  const [items, prereqs, profiles, colleges, config] = await Promise.all([listItems(), listPrerequisites(), listProfiles(), listColleges(), getConfig()]);
  const nameOf = new Map(colleges.map((c) => [c.id, c.nom]));
  const parentOf = new Map(colleges.map((c) => [c.id, c.parent_matiere_id]));
  const perCollege = new Map<string, { total: number; actifs: number; avecCours: number }>();
  for (const i of items) {
    const top = parentOf.get(i.specialite_id) ?? i.specialite_id;
    const d = perCollege.get(top) ?? { total: 0, actifs: 0, avecCours: 0 };
    d.total++; if (i.actif) d.actifs++; if (i.cours_id) d.avecCours++;
    perCollege.set(top, d);
  }
  const cycles = findCycles(buildGraph(prereqs));
  const onboarded = profiles.filter((p) => p.onboarding_done);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">Planificateur adaptatif EVC</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">Référentiel pédagogique, prérequis, coefficients du moteur et suivi des candidats. {PLAN_STUDENT_ENABLED ? 'Module ouvert aux élèves.' : 'Module en recette : visible du personnel seulement (vue étudiant).'}</p>
      </header>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        <Kpi label="Items de la matrice" value={items.length} hint={`${items.filter((i) => i.actif).length} actifs`} />
        <Kpi label="Reliés à un cours" value={items.filter((i) => i.cours_id).length} hint="évaluations et QCM possibles" />
        <Kpi label="Prérequis" value={prereqs.length} hint={`${prereqs.filter((p) => p.type === 'indispensable').length} indispensables`} />
        <Kpi label="Cycles détectés" value={cycles.length} tone={cycles.length > 0 ? 'danger' : 'success'} />
        <Kpi label="Candidats avec planning" value={onboarded.length} />
        <Kpi label="Questions par validation" value={config.questions_per_validation} hint={`seuils ${config.thresholds.consolidation} / ${config.thresholds.maitrise} %`} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard title="Matrice par spécialité" description="Une spécialité sans item ne propose pas de planning à ses candidats." action={<Link href="/admin/planificateur/items" className="text-sm font-medium text-(--color-primary) underline-offset-4 hover:underline">Gérer la matrice</Link>}>
          <ul className="divide-y divide-(--color-border) text-sm">
            {colleges.filter((c) => !c.parent_matiere_id && c.id !== 'col-decouverte').map((c) => {
              const d = perCollege.get(c.id);
              return (
                <li key={c.id} className="flex items-center gap-3 py-2">
                  <Link href={`/admin/planificateur/items?college=${c.id}`} className="min-w-0 flex-1 truncate text-(--color-ink) underline-offset-4 hover:underline">{c.nom}</Link>
                  <span className={`tabular-nums ${d ? 'text-(--color-ink)' : 'text-(--color-ink-muted)'}`}>{d ? `${d.actifs} actifs / ${d.total}` : 'aucun item'}</span>
                  {d && <span className="text-xs text-(--color-ink-muted)">{d.avecCours} reliés</span>}
                </li>
              );
            })}
          </ul>
        </SectionCard>
        <SectionCard title="Comment démarrer" description="Sans attendre la matrice définitive (§26).">
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-(--color-ink-soft)">
            <li>Dans <strong>Matrice pédagogique</strong>, cliquez « Créer depuis les cours » pour une spécialité : un item par cours, avec des valeurs par défaut (importance des étoiles admin, volume 3).</li>
            <li>Ajustez importance, volume, transversalité, fréquence et années d’occurrence — ou importez le fichier CSV/XLSX de Major ECN (modèle téléchargeable).</li>
            <li>Déclarez les prérequis (indispensables / recommandés) depuis la fiche d’un item ; les cycles sont refusés.</li>
            <li>Réglez coefficients, seuils et intervalles dans <strong>Réglages du moteur</strong> ; rien n’est codé en dur.</li>
            <li>Testez en vue étudiant : <Link href="/planificateur" className="text-(--color-primary) underline-offset-4 hover:underline">/planificateur</Link> (onboarding, planning J0, évaluations).</li>
          </ol>
          {cycles.length > 0 && <p className="mt-3 text-sm text-(--color-danger)">Dépendances circulaires à corriger : {cycles.map((c) => c.map((id) => items.find((i) => i.id === id)?.nom_item ?? id).join(' → ')).join(' ; ')}</p>}
          <p className="mt-3 text-xs text-(--color-ink-muted)">Spécialités reconnues à l’import : {colleges.filter((c) => !c.parent_matiere_id).map((c) => `${c.nom} (${c.id})`).join(', ')}. {nameOf.size} collèges.</p>
        </SectionCard>
      </div>
    </main>
  );
}
