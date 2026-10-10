import Link from 'next/link';
import { requireUser } from '@/lib/auth/require-role';
import { envoisDuCandidat } from '@/lib/qualite/serveur/soumission';
import { FAMILLE_LABEL } from '@/lib/qualite/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mes questionnaires' };

const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris', day: 'numeric', month: 'long', year: 'numeric' }) : '');

/** Questionnaires du candidat : à compléter, puis l'historique de ses réponses. */
export default async function MesQuestionnairesPage() {
  const { user } = await requireUser();
  const envois = await envoisDuCandidat(user.id);
  const aFaire = envois.filter((e) => e.statut !== 'complete');
  const faits = envois.filter((e) => e.statut === 'complete');
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">Mes questionnaires</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">Vos avis sur les séances et sur la formation. Chaque réponse est lue par l&apos;équipe pédagogique.</p>
      </header>
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-(--color-ink-muted)">À compléter ({aFaire.length})</h2>
        {aFaire.length === 0 && <p className="text-sm text-(--color-ink-soft)">Aucun questionnaire en attente. Merci !</p>}
        <ul className="flex flex-col gap-2">
          {aFaire.map((e) => (
            <li key={e.id}>
              <Link href={`/enquetes/${e.id}`} className="flex items-center justify-between gap-3 rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-4 hover:border-(--color-primary)">
                <span>
                  <span className="block text-sm font-medium text-(--color-ink)">{e.titre}</span>
                  <span className="text-xs text-(--color-ink-muted)">{FAMILLE_LABEL[e.famille]} · {e.obligatoire ? 'à compléter' : 'facultatif'}{e.echeance ? ` · jusqu’au ${date(e.echeance)}` : ''}</span>
                </span>
                <span className="text-sm font-medium text-(--color-primary)">Répondre</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-(--color-ink-muted)">Complétés ({faits.length})</h2>
        <ul className="flex flex-col divide-y divide-(--color-border) rounded-(--radius-card) border border-(--color-border) bg-(--color-surface)">
          {faits.length === 0 && <li className="p-4 text-sm text-(--color-ink-soft)">Aucun pour l&apos;instant.</li>}
          {faits.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 p-4 text-sm">
              <span className="text-(--color-ink)">{e.titre}</span>
              <span className="text-xs text-(--color-ink-muted)">le {date(e.complete_at)}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
