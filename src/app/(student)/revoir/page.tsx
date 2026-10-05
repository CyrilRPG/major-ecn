import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { Star } from 'lucide-react';
import { HeroStat, StudentHero, StudentPage } from '@/components/student/ui/page-kit';
import { SavedQuestionsList, type SavedQuestion } from '@/components/student/saved-questions-list';

export const metadata = { title: 'Questions à revoir' };
export const dynamic = 'force-dynamic';

export default async function RevoirPage() {
  const { user } = await requireUser();
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: rows } = await db
    .from('student_saved_questions')
    .select(
      'question_id, serie_id, cours_id, created_at, ' +
        'qcm_questions:question_id(enonce, format), ' +
        'qcm_series:serie_id(label), ' +
        'cours:cours_id(titre, matieres(nom, parent_matiere_id, parent:parent_matiere_id(nom)))',
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  type Row = {
    question_id: string;
    serie_id: string | null;
    cours_id: string | null;
    created_at: string;
    qcm_questions: { enonce: string; format: string | null } | null;
    qcm_series: { label: string } | null;
    cours: {
      titre: string;
      matieres: { nom: string; parent_matiere_id: string | null; parent: { nom: string } | null } | null;
    } | null;
  };

  const stripHtml = (s: string) => s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  const questions: SavedQuestion[] = ((rows ?? []) as Row[])
    .filter((r) => r.cours_id && r.serie_id && r.qcm_questions)
    .map((r) => {
      const m = r.cours?.matieres;
      // Collège de 1er niveau = le collège parent s'il existe (cas Médecine
      // générale et ses sous-collèges), sinon la matière elle-même. Le
      // sous-collège n'est renseigné que pour les matières ayant un parent.
      const parentNom = m?.parent?.nom ?? null;
      const college = parentNom ?? m?.nom ?? '';
      const sousCollege = parentNom ? (m?.nom ?? null) : null;
      return {
        questionId: r.question_id,
        coursId: r.cours_id as string,
        serieId: r.serie_id as string,
        college,
        sousCollege,
        coursTitre: r.cours?.titre ?? 'Item inconnu',
        serieLabel: r.qcm_series?.label ?? '',
        format: (r.qcm_questions?.format as 'qcm' | 'qroc' | null) ?? 'qcm',
        preview: stripHtml(r.qcm_questions?.enonce ?? '').slice(0, 220),
        createdAt: r.created_at,
      };
    });

  const colleges = new Set(questions.map((q) => q.college).filter(Boolean)).size;

  return (
    <StudentPage>
      <StudentHero
        icon={Star}
        eyebrow="Votre sélection"
        title="Questions à revoir"
        subtitle="Les questions que vous avez mises de côté pendant vos entraînements, classées par collège : retravaillez-les au bon moment."
        stats={questions.length > 0 ? (
          <>
            <HeroStat icon={Star} value={questions.length} label={questions.length > 1 ? 'questions' : 'question'} />
            {colleges > 0 && <HeroStat value={colleges} label={colleges > 1 ? 'collèges' : 'collège'} />}
          </>
        ) : undefined}
      />
      <SavedQuestionsList questions={questions} />
    </StudentPage>
  );
}
