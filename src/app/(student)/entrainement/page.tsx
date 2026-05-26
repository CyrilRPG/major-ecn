import Link from 'next/link';
import { ArrowRight, ListChecks, Target, TrendingDown } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { parseScope, canAccessCollege } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { CollegesChooser } from '@/components/student/colleges-chooser';

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

  const { data: attemptsRaw } = await supabase
    .from('qcm_attempts')
    .select('question_id, is_correct, qcm_questions!inner(qcm_series!inner(cours!inner(matieres!inner(id, nom, semestres!inner(faculte_id)))))')
    .eq('user_id', user.id);

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

  const weak = [...perCollege.values()].sort((a, b) => b.fails - a.fails).slice(0, 6);
  const maxFails = Math.max(1, ...weak.map((w) => w.fails));
  const weakIds = weak.map((w) => w.id);
  const totalToReview = failedQuestions.size;
  const sessionSize = Math.min(totalToReview || 12, 12);

  const stats = [
    { value: sessionSize, label: 'questions dans la session' },
    { value: totalToReview, label: 'questions ratées à revoir' },
    { value: weak.length, label: 'collèges à renforcer' },
  ];
  const steps = [
    { Icon: TrendingDown, t: 'On repère tes erreurs', d: 'Analyse de tes QCM passés, collège par collège.' },
    { Icon: ListChecks, t: 'On regroupe les bonnes questions', d: 'Les QCM des collèges où tu te trompes le plus.' },
    { Icon: Target, t: 'On priorise', d: 'D’abord les questions échouées le plus souvent.' },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-7 lg:px-8">
      {/* Hero — large, sobre */}
      <section className="grid items-center gap-6 rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-soft) lg:grid-cols-[1.5fr_1fr] lg:p-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-(--color-primary-soft) px-3 py-1 text-xs font-semibold text-(--color-primary-deep)">
            <Target className="h-3.5 w-3.5" />
            Entraînement ciblé
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-(--color-ink) sm:text-3xl">
            Travaille en priorité ce que tu rates le plus.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-(--color-ink-soft)">
            Une session sur-mesure : les QCM des collèges où tu fais le plus d’erreurs, en
            commençant par les questions échouées le plus souvent. Correction et justification
            à chaque item.
          </p>
          <div className="mt-5">
            <CollegesChooser options={weak} defaultSelected={weakIds} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-4 py-3 text-center lg:flex lg:items-center lg:gap-3 lg:text-left"
            >
              <p className="text-2xl font-bold tabular-nums text-(--color-primary)">{s.value}</p>
              <p className="mt-0.5 text-xs leading-tight text-(--color-ink-muted) lg:mt-0">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Body — 2 colonnes */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)">
          <h2 className="text-sm font-semibold text-(--color-ink)">Collèges à renforcer</h2>
          <p className="mb-4 text-xs text-(--color-ink-muted)">Classés par nombre d’erreurs.</p>
          {weak.length > 0 ? (
            <ul className="space-y-3">
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
                      className="h-full rounded-full bg-(--color-primary)"
                      style={{ width: `${Math.round((c.fails / maxFails) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-sm text-(--color-ink-soft)">
              Pas encore d’erreurs enregistrées — la première session te proposera un échantillon
              de questions pour démarrer.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)">
          <h2 className="text-sm font-semibold text-(--color-ink)">Comment fonctionne ta session</h2>
          <p className="mb-4 text-xs text-(--color-ink-muted)">Trois étapes, automatiquement.</p>
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={s.t} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-primary-soft) text-(--color-primary)">
                  <s.Icon className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-(--color-ink)">
                    <span className="mr-1.5 text-(--color-ink-muted)">{i + 1}.</span>
                    {s.t}
                  </p>
                  <p className="text-xs text-(--color-ink-soft)">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-xs text-(--color-ink-muted)">
            👉 Sélectionnez les collèges à inclure dans le bloc à gauche, puis lancez la session.
          </p>
        </section>
      </div>
    </div>
  );
}
