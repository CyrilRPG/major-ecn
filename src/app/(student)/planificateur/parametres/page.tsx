import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { loadStudentContext } from '@/lib/plan/service';
import { AvailabilityForm } from '@/components/student/plan/availability-form';
import { updateAvailabilityAction } from '@/app/(student)/planificateur/actions';
import { DECLARED_LEVEL_LABEL, VOIE_LABEL } from '@/lib/plan/types';
import { fmtDateLong, fmtDateTime } from '@/lib/suivi/format';

/**
 * Disponibilités (addendum §3, §7) : jours et temps disponibles, jours
 * d'indisponibilité — toute modification recalcule immédiatement le planning.
 * La voie et la date de l'EVC viennent de la plateforme (lecture seule).
 */
export default async function PlanParametresPage() {
  const { user } = await requireUser();
  const ctx = await loadStudentContext(user.id);
  if (!ctx) redirect('/planificateur/onboarding');
  const names = new Map(ctx.colleges.map((c) => [c.id, c.nom]));
  const levels = Object.entries(ctx.profile.specialty_levels);
  return (
    <main className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-(--color-ink)">Mes disponibilités</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">Vos jours de travail, votre temps selon les jours et vos jours d’indisponibilité. Toute modification recalcule immédiatement votre planning.</p>
      </header>
      <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-4 sm:p-5">
        <AvailabilityForm
          initial={ctx.profile.availability} unavailable={ctx.profile.unavailable_days} today={ctx.today}
          examDate={ctx.profile.exam_date ?? ''} examDateEditable={ctx.profile.exam_date_source === 'candidat'}
          firstPending={!ctx.profile.first_plan_ack_at} onSave={updateAvailabilityAction}
        />
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div><dt className="text-(--color-ink-muted)">Spécialité</dt><dd className="text-(--color-ink)">{ctx.college?.nom ?? ctx.profile.specialite_id}</dd></div>
        <div><dt className="text-(--color-ink-muted)">Voie (profil)</dt><dd className="text-(--color-ink)">{ctx.voie ? VOIE_LABEL[ctx.voie] : '—'}</dd></div>
        <div><dt className="text-(--color-ink-muted)">Épreuve</dt><dd className="text-(--color-ink)">{ctx.profile.exam_date ? fmtDateLong(`${ctx.profile.exam_date}T12:00:00Z`) : '—'} <span className="text-xs text-(--color-ink-muted)">(J-{ctx.daysLeft})</span></dd></div>
        <div><dt className="text-(--color-ink-muted)">Planning validé le</dt><dd className="text-(--color-ink)">{ctx.profile.first_plan_ack_at ? fmtDateTime(ctx.profile.first_plan_ack_at) : 'pas encore'}</dd></div>
      </dl>
      {levels.length > 0 && (
        <section className="text-sm">
          <h2 className="font-semibold text-(--color-ink)">Niveau déclaré au premier lancement</h2>
          <p className="mt-0.5 text-xs text-(--color-ink-soft)">Il a servi à initialiser le planning ; vos résultats réels prennent progressivement le relais.</p>
          <ul className="mt-2 flex flex-wrap gap-1.5 text-xs">
            {levels.map(([id, l]) => <li key={id} className="rounded-full border border-(--color-border) px-2.5 py-1 text-(--color-ink-soft)">{names.get(id) ?? id} : <strong className="text-(--color-ink)">{DECLARED_LEVEL_LABEL[l]}</strong></li>)}
          </ul>
        </section>
      )}
    </main>
  );
}
