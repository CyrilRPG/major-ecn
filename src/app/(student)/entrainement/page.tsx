import { Building2, CheckCircle, HelpCircle, ListChecks, Target, TrendingDown } from 'lucide-react';
import { PEDAGO_ENGINE_STUDENT_ENABLED } from '@/lib/modules-flags';
import { moteurOuvert } from '@/lib/moteur/access';
import { HeroLinks, HeroStat, Panel, SectionTitle, StudentHero, StudentPage } from '@/components/student/ui/page-kit';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { parseScope, canAccessCollege } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { CollegesChooser } from '@/components/student/colleges-chooser';
import { contexteEleve, getLotsQuestionsFaculte, type LotQuestionsCours } from '@/lib/progress/course-progress-data';
import { compterQuestionsAccessibles } from '@/lib/progress/course-progress';

export const metadata = { title: 'Entraînement ciblé' };

type AttemptRow = {
  question_id: string;
  is_correct: boolean;
  qcm_questions: { qcm_series: { cours: { matieres: { id: string; nom: string; semestres: { faculte_id: string } } } } };
};

export default async function EntrainementPage() {
  const { user, profile } = await requireUser();
  const scope = parseScope(profile.permission_scope);
  const supabase = await createClient();

  const [{ data: attemptsRaw }, lots, ctx] = await Promise.all([
    supabase
      .from('qcm_attempts')
      .select('question_id, is_correct, qcm_questions!inner(qcm_series!inner(cours!inner(matieres!inner(id, nom, semestres!inner(faculte_id)))))')
      .eq('user_id', user.id),
    // Questions par collège : les lots de la faculté (cache global) et les
    // règles d'accès de l'élève. Cette page relisait la table `qcm_questions`
    // ENTIÈRE sous RLS — 1,7 s par affichage, et tronquée à 1 000 lignes par
    // PostgREST, donc un décompte faux (audit de lenteur du 29/09/2026).
    getLotsQuestionsFaculte(EDN_FACULTE_ID),
    contexteEleve(scope, { staff: profile.role === 'admin' }),
  ]);

  const perCollege = new Map<string, { id: string; nom: string; fails: number }>();
  const failedQuestions = new Set<string>();
  for (const a of ((attemptsRaw ?? []) as unknown as AttemptRow[])) {
    const m = a.qcm_questions.qcm_series.cours.matieres;
    if (m.semestres.faculte_id !== EDN_FACULTE_ID || !canAccessCollege(scope, m.id)) continue;
    if (!a.is_correct) {
      const e = perCollege.get(m.id) ?? { id: m.id, nom: m.nom, fails: 0 };
      e.fails++;
      perCollege.set(m.id, e);
      failedQuestions.add(a.question_id);
    }
  }

  // Nombre de questions accessibles par collège (périmètre EDN + accès + voie/formule)
  const lotsParCollege = new Map<string, LotQuestionsCours[]>();
  for (const lot of lots) {
    if (!lotsParCollege.has(lot.matiere_id)) lotsParCollege.set(lot.matiere_id, []);
    lotsParCollege.get(lot.matiere_id)!.push(lot);
  }
  const questionsByCollege = new Map<string, number>();
  for (const [matiereId, l] of lotsParCollege) {
    if (!canAccessCollege(scope, matiereId)) continue;
    questionsByCollege.set(matiereId, compterQuestionsAccessibles(l, {
      voie: ctx.voie,
      offers: ctx.offers,
      geriatrieMgBonus: ctx.matieresBonusGeriatrie?.has(matiereId) ?? false,
    }));
  }

  const MAX_Q = 12;
  const weak = [...perCollege.values()].sort((a, b) => b.fails - a.fails).slice(0, 6);
  const maxFails = Math.max(1, ...weak.map((w) => w.fails));
  const weakIds = weak.map((w) => w.id);
  const totalToReview = failedQuestions.size;
  // Taille par défaut affichée : nombre de questions des collèges faibles présélectionnés, capé.
  const defaultAvailable = weak.reduce((sum, c) => sum + (questionsByCollege.get(c.id) ?? 0), 0);
  const sessionSize = Math.min(defaultAvailable || MAX_Q, MAX_Q);

  // Chiffres de la session, repris en pastilles dans l'en-tête.
  const stats = [
    { value: sessionSize, label: 'questions dans la session', Icon: HelpCircle },
    { value: totalToReview, label: 'questions ratées à revoir', Icon: CheckCircle },
    { value: weak.length, label: 'collèges à renforcer', Icon: Building2 },
  ];
  // Voie externe : les questions accessibles sont des QROC.
  const unit = scope.voie === 'externe' ? 'QROC' : 'QCM';
  const steps = [
    { Icon: TrendingDown, t: 'On repère vos erreurs', d: `Analyse de vos ${unit} passés, collège par collège.` },
    { Icon: ListChecks, t: 'On regroupe les bonnes questions', d: `Les ${unit} des collèges où vous vous trompez le plus.` },
    { Icon: Target, t: 'On priorise', d: 'D’abord les questions échouées le plus souvent.' },
  ];
  // Interconnexion : chaque réponse alimente le profil pédagogique (moteur central).
  const liens = moteurOuvert(profile, PEDAGO_ENGINE_STUDENT_ENABLED) ? [{ href: '/mes-priorites', label: 'Mes priorités' }] : [];

  return (
    <StudentPage>
      <StudentHero
        icon={Target}
        eyebrow="Cibler vos erreurs"
        title="Travaillez en priorité ce que vous ratez le plus."
        subtitle={<>Une session sur mesure : les {unit} des collèges où vous faites le plus d’erreurs, en commençant par les questions échouées le plus souvent. Correction et justification à chaque item.</>}
        stats={stats.map((st) => <HeroStat key={st.label} icon={st.Icon} value={st.value} label={st.label} />)}
        links={<HeroLinks links={liens} />}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Panel aria-labelledby="entrainement-session">
          <SectionTitle id="entrainement-session" eyebrow="Votre session" title="Composez votre entraînement" description="Cochez les collèges à inclure, puis lancez la session." />
          <div className="mt-4">
            <CollegesChooser
              options={weak.map((c) => ({ ...c, available: questionsByCollege.get(c.id) ?? 0 }))}
              defaultSelected={weakIds}
              maxQuestions={MAX_Q}
            />
          </div>
        </Panel>

        <Panel aria-labelledby="entrainement-faibles">
          <SectionTitle id="entrainement-faibles" eyebrow="Vos points faibles" title="Collèges à renforcer" description="Classés par nombre d’erreurs." />
          {weak.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {weak.map((c) => (
                <li key={c.nom}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="truncate text-(--color-ink)">{c.nom}</span>
                    <span className="shrink-0 font-semibold tabular-nums text-(--color-ink-soft)">
                      {c.fails} erreur{c.fails > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-(--color-sand-200)">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#E4002B,#F97316)]"
                      style={{ width: `${Math.round((c.fails / maxFails) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-(--color-ink-soft)">
              Pas encore d’erreurs enregistrées : la première session vous proposera un échantillon
              de questions pour démarrer.
            </p>
          )}
        </Panel>
      </div>

      <Panel aria-labelledby="entrainement-fonctionnement">
        <SectionTitle id="entrainement-fonctionnement" eyebrow="Mode d’emploi" title="Comment fonctionne votre session" description="Trois étapes, automatiquement." />
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          {steps.map((st, i) => (
            <li key={st.t} className="flex items-start gap-3 rounded-xl bg-(--color-surface-soft) p-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#FDF4F5] text-[#8B0E22]">
                <st.Icon className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-(--color-ink)">
                  <span className="mr-1.5 text-(--color-ink-muted)">{i + 1}.</span>
                  {st.t}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-(--color-ink-soft)">{st.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </Panel>
    </StudentPage>
  );
}
