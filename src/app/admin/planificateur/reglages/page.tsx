import { getConfig } from '@/lib/plan/db';
import { PlanSettingsForm } from '@/components/admin/plan/plan-settings-form';

export default async function PlanReglagesPage() {
  const config = await getConfig();
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">Réglages du moteur</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">Coefficients de priorité, seuils, intervalles de répétition, durées de séance, charge par volume. La formule reste une somme pondérée : les coefficients définitifs de Major ECN s’y saisissent directement.</p>
      </header>
      <PlanSettingsForm config={config} />
    </main>
  );
}
