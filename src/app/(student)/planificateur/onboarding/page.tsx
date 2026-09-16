import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { parseScope } from '@/lib/auth/permissions';
import { collegeFamily, getProfile, listColleges, listItems } from '@/lib/plan/db';
import { collegesForStudent } from '@/lib/plan/service';
import { todayKey } from '@/lib/suivi/format';
import { OnboardingWizard, type OnboardingCollege } from '@/components/student/plan/onboarding-wizard';

/** Première utilisation (§3) : le planning est généré dès la fin de ces quatre étapes (§11). */
export default async function PlanOnboardingPage() {
  const { user, profile } = await requireUser();
  const existing = await getProfile(user.id);
  if (existing?.onboarding_done) redirect('/planificateur');
  const [colleges, all, items] = await Promise.all([collegesForStudent(profile.permission_scope), listColleges(), listItems({ activeOnly: true })]);
  const nameOf = new Map(all.map((c) => [c.id, c.nom]));
  const data: OnboardingCollege[] = colleges.map((c) => {
    const family = new Set(collegeFamily(c.id, all));
    return {
      id: c.id, nom: c.nom,
      items: items.filter((i) => family.has(i.specialite_id)).sort((a, b) => a.nom_item.localeCompare(b.nom_item, 'fr'))
        .map((i) => ({ id: i.id, name: i.nom_item, group: i.specialite_id === c.id ? c.nom : nameOf.get(i.specialite_id) ?? '' })),
    };
  });
  const scope = parseScope(profile.permission_scope);

  return (
    <main className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-(--color-ink)">Mon planning personnalisé</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">Quelques minutes suffisent : votre spécialité, la date des épreuves, vos disponibilités et une auto-évaluation rapide. Votre planning est généré immédiatement, puis s’affine avec vos résultats.</p>
      </header>
      {data.length === 0 ? (
        <div className="rounded-(--radius-card) border border-dashed border-(--color-border) p-6 text-sm text-(--color-ink-soft)">
          Le programme de votre spécialité n’est pas encore paramétré dans le planificateur. L’équipe Major ECN le met en place ; revenez bientôt.
        </div>
      ) : (
        <OnboardingWizard colleges={data} defaultVoie={scope.voie ?? null} today={todayKey()} />
      )}
    </main>
  );
}
