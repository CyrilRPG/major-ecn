import Image from 'next/image';
import { QuestionnaireForm } from '@/components/qualite/questionnaire-form';
import { envoiParJeton } from '@/lib/qualite/serveur/soumission';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Questionnaire Major ECN', robots: { index: false, follow: false } };

/**
 * Questionnaire par lien sécurisé (enquête post-EVC, suivi différé) : sans
 * connexion à la plateforme (§9). Le jeton n'ouvre que ce questionnaire.
 */
export default async function QuestionnaireLienPage({ params }: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await params;
  const e = await envoiParJeton(jeton);
  return (
    <main className="min-h-dvh bg-(--color-surface-soft) px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex justify-center"><Image src="/major-ecn-logo.png" alt="Major ECN" width={140} height={40} className="h-10 w-auto" /></div>
        <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-5 sm:p-7">
          {!e && <p className="text-sm text-(--color-ink-soft)">Ce lien n&apos;est plus valide. Si vous souhaitez encore répondre, écrivez-nous à contact@major-ecn.fr.</p>}
          {e && e.statut === 'complete' && <p className="text-sm text-(--color-ink)">Vous avez déjà répondu à ce questionnaire. Merci !</p>}
          {e && e.statut !== 'complete' && (e.statut === 'neutralise' || e.statut === 'dispense'
            ? <p className="text-sm text-(--color-ink-soft)">Ce questionnaire n&apos;est plus demandé.</p>
            : <QuestionnaireForm envoiId={e.id} titre={e.titre} intro={e.intro} questions={e.questions} mode={{ type: 'lien', jeton }} />)}
        </div>
      </div>
    </main>
  );
}
