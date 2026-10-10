import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { QuestionnaireForm } from '@/components/qualite/questionnaire-form';
import { envoiDuCandidat, marquerAffiche } from '@/lib/qualite/serveur/soumission';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Questionnaire' };

export default async function QuestionnairePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await requireUser();
  const e = await envoiDuCandidat(user.id, id);
  if (!e) notFound();
  await marquerAffiche(e);
  const s = (e.contexte as { seance?: { titre?: string; enseignant?: string | null } }).seance;
  const ferme = e.statut === 'complete' || e.statut === 'neutralise' || e.statut === 'dispense';
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 lg:px-8">
      <Link href="/enquetes" className="mb-4 inline-block text-sm text-(--color-ink-soft) hover:underline">← Mes questionnaires</Link>
      {ferme ? (
        <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-6">
          <h1 className="text-lg font-semibold text-(--color-ink)">{e.titre}</h1>
          <p className="mt-2 text-sm text-(--color-ink-soft)">{e.statut === 'complete' ? 'Vous avez déjà répondu à ce questionnaire. Merci !' : 'Ce questionnaire n’est plus demandé.'}</p>
        </div>
      ) : (
        <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-5 sm:p-7">
          <QuestionnaireForm
            envoiId={e.id} titre={e.titre} intro={e.intro} questions={e.questions} brouillon={e.brouillon}
            mode={{ type: 'connecte' }} contexte={s ? [s.titre, s.enseignant].filter(Boolean).join(' · ') : null}
          />
        </div>
      )}
    </main>
  );
}
