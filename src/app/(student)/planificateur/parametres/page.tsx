import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { loadStudentContext } from '@/lib/plan/service';
import { AvailabilityForm } from '@/components/student/plan/availability-form';
import { updateAvailabilityAction } from '@/app/(student)/planificateur/actions';
import { fmtDateTime } from '@/lib/suivi/format';

/** Disponibilités et date des épreuves (§3), modifiables à tout moment → recalcul (§17). */
export default async function PlanParametresPage() {
  const { user } = await requireUser();
  const ctx = await loadStudentContext(user.id);
  if (!ctx) redirect('/planificateur/onboarding');
  return (
    <main className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-(--color-ink)">Mes disponibilités</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">Votre temps disponible par jour et la date de vos épreuves. Toute modification recalcule immédiatement votre planning.</p>
      </header>
      <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-4 sm:p-5">
        <AvailabilityForm initial={ctx.profile.availability} examDate={ctx.profile.exam_date ?? ''} onSave={updateAvailabilityAction} />
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div><dt className="text-(--color-ink-muted)">Spécialité</dt><dd className="text-(--color-ink)">{ctx.college?.nom ?? ctx.profile.specialite_id}</dd></div>
        <div><dt className="text-(--color-ink-muted)">Voie</dt><dd className="text-(--color-ink)">{ctx.profile.voie ? (ctx.profile.voie === 'interne' ? 'Voie interne' : 'Voie externe') : '—'}</dd></div>
        <div><dt className="text-(--color-ink-muted)">Début de préparation</dt><dd className="text-(--color-ink)">{ctx.profile.start_date}</dd></div>
        <div><dt className="text-(--color-ink-muted)">Information acceptée le</dt><dd className="text-(--color-ink)">{fmtDateTime(ctx.profile.consent_accepted_at)} (v{ctx.profile.consent_version ?? '—'})</dd></div>
      </dl>
    </main>
  );
}
