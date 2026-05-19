import Link from 'next/link';
import { ArrowRight, Play, Target, AlertTriangle } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { parseScope, canAccessCollege } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';

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

  const perCollege = new Map<string, { nom: string; fails: number; total: number }>();
  const failedQuestions = new Set<string>();
  for (const a of ((attemptsRaw ?? []) as unknown as AttemptRow[])) {
    const m = a.qcm_questions.qcm_series.cours.matieres;
    if (m.semestres.faculte_id !== EDN_FACULTE_ID || !canAccessCollege(scope, m.id)) continue;
    const e = perCollege.get(m.id) ?? { nom: m.nom, fails: 0, total: 0 };
    e.total++;
    if (!a.is_correct) {
      e.fails++;
      failedQuestions.add(a.question_id);
    }
    perCollege.set(m.id, e);
  }

  const weak = [...perCollege.values()]
    .filter((c) => c.fails > 0)
    .sort((a, b) => b.fails - a.fails)
    .slice(0, 5);

  const totalToReview = failedQuestions.size;
  const hasData = totalToReview > 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 lg:px-8">
      {/* Hero CTA */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-(--color-primary) to-(--color-accent) p-7 text-white shadow-(--shadow-lifted) sm:p-9">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium ring-1 ring-white/20">
            <Target className="h-3.5 w-3.5" /> Entraînement ciblé
          </span>
          <h1 className="mt-4 font-display text-3xl leading-tight sm:text-4xl">
            Travaille en priorité ce que tu rates le plus.
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/80">
            On rassemble les QCM des collèges où tu fais le plus d’erreurs et on te
            represente d’abord les questions échouées le plus souvent — correction et
            justification à chaque item.
          </p>

          <Link
            href="/entrainement/session"
            className="mt-6 inline-flex items-center gap-2.5 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-(--color-primary) shadow-(--shadow-soft) transition-transform hover:scale-[1.02]"
          >
            <Play className="h-5 w-5 fill-current" />
            Lancer l’entraînement ciblé
          </Link>
        </div>
      </section>

      {/* Preview */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft)">
          <p className="text-2xl font-bold text-(--color-ink)">{Math.min(totalToReview, 12) || '—'}</p>
          <p className="mt-0.5 text-xs text-(--color-ink-muted)">questions dans la session</p>
        </div>
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft)">
          <p className="text-2xl font-bold text-(--color-ink)">{totalToReview}</p>
          <p className="mt-0.5 text-xs text-(--color-ink-muted)">questions ratées à revoir</p>
        </div>
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft)">
          <p className="text-2xl font-bold text-(--color-ink)">{weak.length}</p>
          <p className="mt-0.5 text-xs text-(--color-ink-muted)">collèges à renforcer</p>
        </div>
      </div>

      {/* Aperçu du contenu */}
      <div className="mt-5 rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-(--color-ink)">
          <AlertTriangle className="h-4 w-4 text-(--color-primary)" />
          Aperçu de ta session
        </h2>
        {hasData ? (
          <ul className="mt-3 space-y-2">
            {weak.map((c) => (
              <li
                key={c.nom}
                className="flex items-center justify-between rounded-lg border border-(--color-border) bg-(--color-surface-soft) px-3.5 py-2.5"
              >
                <span className="truncate text-sm font-medium text-(--color-ink)">{c.nom}</span>
                <span className="shrink-0 rounded-full bg-(--color-primary-soft) px-2.5 py-0.5 text-xs font-semibold text-(--color-primary-deep)">
                  {c.fails} erreur{c.fails > 1 ? 's' : ''}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-(--color-ink-soft)">
            Pas encore d’erreurs enregistrées : la session te proposera un échantillon de
            questions pour démarrer. Plus tu t’entraînes, plus elle cible tes points faibles.
          </p>
        )}
        <p className="mt-4 flex items-center gap-1.5 text-xs text-(--color-ink-muted)">
          Priorité aux questions échouées le plus souvent
          <ArrowRight className="h-3.5 w-3.5" />
        </p>
      </div>
    </div>
  );
}
