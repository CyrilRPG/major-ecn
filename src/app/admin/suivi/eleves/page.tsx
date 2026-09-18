import { requireSuiviPage } from '@/lib/suivi/roles';
import { chargerTableauEleves } from '@/lib/suivi/eleves';
import { ElevesTable } from '@/components/admin/suivi/eleves-table';

export const dynamic = 'force-dynamic';

/**
 * Tableau de travail « Suivi élèves / Commercial » (cahier des charges
 * 18/09/2026, §3-4) : uniquement les élèves du périmètre de la personne, avec
 * la petite logique CRM de l'administrateur — affectés, à rappeler
 * aujourd'hui, sans contact depuis 10 jours, urgents.
 */
export default async function ElevesSuiviPage() {
  const actor = await requireSuiviPage('view');
  const t = await chargerTableauEleves(actor);
  const kpis: { label: string; valeur: number; aide: string }[] = [
    { label: t.perimetreRestreint ? 'Élèves de mon périmètre' : 'Élèves', valeur: t.stats.total, aide: 'population visible' },
    { label: 'Affectés', valeur: t.stats.affectes, aide: 'à un collaborateur' },
    { label: 'À rappeler aujourd’hui', valeur: t.stats.aRappelerAujourdhui, aide: 'statut « à rappeler », date atteinte' },
    { label: 'Sans contact depuis 10 j', valeur: t.stats.sansContact10j, aide: 'aucun compte rendu récent' },
    { label: 'Urgents', valeur: t.stats.urgents, aide: 'statut « urgent »' },
    { label: 'En alerte', valeur: t.stats.enAlerte, aide: 'au moins une alerte automatique' },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
      <header className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">Suivi élèves — tableau de travail</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          {t.perimetreRestreint
            ? 'Les élèves qui entrent dans votre périmètre d’autorisation (spécialités, formules, population). Ouvrez une fiche pour renseigner un appel.'
            : 'Vue globale de tous les élèves. Affectez-les aux collaborateurs, suivez les relances et les alertes.'}
        </p>
      </header>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 py-3">
            <p className="text-2xl font-bold tabular-nums text-(--color-ink)">{k.valeur}</p>
            <p className="text-xs font-semibold text-(--color-ink)">{k.label}</p>
            <p className="text-[11px] text-(--color-ink-muted)">{k.aide}</p>
          </div>
        ))}
      </div>

      <ElevesTable lignes={t.lignes} collaborateurs={t.collaborateurs} peutAffecter={t.peutAffecter} peutRediger={t.peutRediger} moi={actor.profile.id} />
    </main>
  );
}
