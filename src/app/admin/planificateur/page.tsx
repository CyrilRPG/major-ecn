import Link from 'next/link';
import { adminOverview } from '@/lib/plan/admin';
import { CURRICULUM_STRUCTURE_LABEL } from '@/lib/plan/model';
import { Kpi, SectionCard } from '@/components/admin/suivi/ui';

const pct = (v: number | null) => (v === null ? '—' : `${Math.round(v * 100)} %`);
const h = (m: number) => `${Math.round(m / 60)} h`;

/**
 * Vue d'ensemble du planificateur (§34, §35) : préparations, hard_priority,
 * candidats, réalisation (unités validées, jamais le temps passé), usage.
 */
export default async function PlanAdminHome() {
  const o = await adminOverview();
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 lg:px-8">
      <header className="border-b border-(--color-border) pb-5">
        <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">Planificateur adaptatif EVC — V4.1</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">L’orchestrateur central décide ce qui mérite de remonter ; le planificateur décide quand et comment le faire travailler. Paramètres : {o.paramVersion === 0 ? 'valeurs V1 du CDC' : `version ${o.paramVersion}`}.</p>
      </header>

      <SectionCard title="Préparations">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-(--color-ink-soft)"><tr><th className="py-1.5 pr-3">Préparation</th><th className="pr-3">Structure</th><th className="pr-3">Élèves</th><th className="pr-3">Parcours du Major</th><th className="pr-3">Items actifs</th><th className="pr-3">hard_priority</th></tr></thead>
            <tbody className="divide-y divide-(--color-border)">
              {o.preparations.map((p) => (
                <tr key={p.specialite_id}>
                  <td className="py-2 pr-3 font-medium text-(--color-ink)">{p.name}</td>
                  <td className="pr-3">{CURRICULUM_STRUCTURE_LABEL[p.curriculum_structure]}{p.curriculum_structure === 'HIERARCHICAL' ? ` · ${p.domains} domaines` : ''}</td>
                  <td className="pr-3">{p.student_enabled ? 'Ouvert' : 'Fermé'}</td>
                  <td className="pr-3">{p.coaching_enabled ? 'Activé' : '—'}</td>
                  <td className="pr-3">{p.items}{p.itemsWithoutDomain > 0 ? ` (${p.itemsWithoutDomain} sans domaine)` : ''}</td>
                  <td className={p.hardBlocked ? 'pr-3 font-semibold text-red-700' : p.hardAlert ? 'pr-3 font-semibold text-amber-700' : 'pr-3'}>{p.hard} · {Math.round(p.hardShare * 1000) / 10} %{p.hardBlocked ? ' — blocage (> 10 %)' : p.hardAlert ? ' — alerte (> 5 %)' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-(--color-ink-muted)"><Link href="/admin/planificateur/structure" className="underline">Structure, domaines et ouverture</Link> · <Link href="/admin/planificateur/items" className="underline">Matrice</Link></p>
      </SectionCard>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Candidats avec un planning" value={o.candidates.total} hint={`${o.candidates.actif} actifs · ${o.candidates.en_pause} en pause · ${o.candidates.desactive} désactivés`} />
        <Kpi label="En mode prioritaire" value={o.candidates.priorityMode} hint={`${o.usage.priorityEntries30} entrées · ${o.usage.priorityExits30} sorties sur 30 j`} tone={o.candidates.priorityMode > 0 ? 'warning' : undefined} />
        <Kpi label="Réalisation (7 jours)" value={pct(o.realisation.completion7)} hint={`30 jours : ${pct(o.realisation.completion30)}`} />
        <Kpi label="Journées planifiées travaillées (30 j)" value={pct(o.realisation.workedShare30)} hint={`Taux de report : ${pct(o.realisation.postponeRate30)}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Planification et réalisation (30 jours)">
          <ul className="space-y-1.5 text-sm text-(--color-ink)">
            <li>Temps prévu : <strong>{h(o.realisation.plannedMinutes30)}</strong> · temps réel déclaré ou mesuré : <strong>{h(o.realisation.actualMinutes30)}</strong></li>
            <li>Part de progression prévue : <strong>{pct(o.realisation.progressionShare30)}</strong> (consolidation et révisions : {o.realisation.progressionShare30 === null ? '—' : pct(1 - o.realisation.progressionShare30)})</li>
            <li>Activités réalisées en avance : <strong>{o.usage.advance30}</strong> · « J’ai encore du temps » : <strong>{o.usage.extra30}</strong> · ajoutées par le candidat : <strong>{o.usage.added30}</strong></li>
            <li>Candidats migrés depuis l’ancienne version : <strong>{o.candidates.migrated}</strong></li>
          </ul>
        </SectionCard>
        <SectionCard title="Préférences et coachings">
          <ul className="space-y-1.5 text-sm text-(--color-ink)">
            <li>Candidats ayant indiqué des préférences : <strong>{o.usage.preferencesUsed}</strong></li>
            <li>Spécialités le plus souvent repoussées : {o.usage.avoided.length === 0 ? '—' : o.usage.avoided.map((a) => `${a.label} (${a.count})`).join(', ')}</li>
            <li>Coachings (30 j) : <strong>{o.usage.coachings.planifies}</strong> planifiés · <strong>{o.usage.coachings.termines}</strong> terminés · <strong>{o.usage.coachings.coaching_vu}</strong> vus · <strong>{o.usage.coachings.coaching_ignore}</strong> ignorés</li>
          </ul>
        </SectionCard>
      </div>
    </main>
  );
}
