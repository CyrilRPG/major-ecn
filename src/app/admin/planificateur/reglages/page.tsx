import { getParam, PARAM_META } from '@/lib/plan/config';
import { getParameterSet, listParameterSets } from '@/lib/plan/db';
import { ParamsForm } from '@/components/admin/plan/params-form';

/**
 * Paramètres V1 (§39) : les valeurs de l'orchestrateur central (poids
 * 40/30/20/10, réactivations, transitions) se règlent dans le moteur
 * pédagogique ; ici, ceux du planificateur seulement.
 */
export default async function ReglagesPage() {
  const [current, history] = await Promise.all([getParameterSet(), listParameterSets(15)]);
  const values = Object.fromEntries(PARAM_META.map((m) => [m.path, getParam(current.params, m.path)]));
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">Paramètres du planificateur</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          Version en vigueur : <strong>{current.version === 0 ? 'valeurs V1 du cahier des charges' : `n° ${current.version}`}</strong>{current.created_at ? ` (${new Date(current.created_at).toLocaleString('fr-FR')})` : ''}.
          Le score de priorité (40/30/20/10), les réactivations et les statuts de maîtrise appartiennent au moteur pédagogique central (Administration → Moteur pédagogique) : le planificateur n’en contient aucune copie.
        </p>
      </header>
      <ParamsForm meta={PARAM_META} values={values} />
      {history.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-(--color-ink)">Historique des versions</h2>
          <ul className="mt-2 divide-y divide-(--color-border) rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) text-sm">
            {history.map((h) => <li key={h.version} className="px-4 py-2"><strong>Version {h.version}</strong> · {h.created_at ? new Date(h.created_at).toLocaleString('fr-FR') : ''}{h.note ? ` — ${h.note}` : ''}</li>)}
          </ul>
        </section>
      )}
    </main>
  );
}
