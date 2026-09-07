import { requireSuiviPage } from '@/lib/suivi/roles';
import { loadCandidates } from '@/lib/suivi/candidates';
import { CandidatesTable } from '@/components/admin/suivi/candidates-table';

export const dynamic = 'force-dynamic';

/** Vue globale des candidats (§10) + recherche par nom ou email (§11) + exports (§17). */
export default async function CandidatsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireSuiviPage('view');
  const sp = await searchParams;
  const q = typeof sp.q === 'string' ? sp.q : '';
  const bundle = await loadCandidates();
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">Candidats</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">Où en est chaque candidat : déjà suivi ou jamais contacté, rendez-vous réalisé, programmé, absent, sans réservation, à relancer. Cliquez sur un nom pour ouvrir son dossier complet.</p>
      </header>
      <CandidatesTable
        candidates={bundle.candidates}
        appointments={bundle.appointments}
        campaigns={bundle.campaigns.map((c) => ({ id: c.id, name: c.name }))}
        specialties={bundle.specialties}
        initialQuery={q}
      />
    </main>
  );
}
