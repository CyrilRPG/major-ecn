import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { collegeFamily, getProfile, listColleges, listItems } from '@/lib/plan/db';
import { collegesForStudent, examDateForCollege, loadStudentContext, voieOfScope } from '@/lib/plan/service';
import { todayKey } from '@/lib/suivi/format';
import { OnboardingWizard, type OnboardingCollege } from '@/components/student/plan/onboarding-wizard';

/**
 * Premier lancement (addendum §3) : disponibilités, jours d'indisponibilité,
 * niveau par spécialité. Voie et date de l'EVC viennent de la plateforme. Le
 * planning est généré dès la fin (§11) puis présenté avec le message obligatoire.
 */
export default async function PlanOnboardingPage() {
  const { user, profile } = await requireUser();
  const existing = await getProfile(user.id);
  // Profil incomplet (spécialité supprimée, date absente) : on refait le premier lancement plutôt que de boucler.
  if (existing?.onboarding_done && (await loadStudentContext(user.id))) redirect('/planificateur');
  const [colleges, all, items] = await Promise.all([collegesForStudent(profile.permission_scope), listColleges(), listItems({ activeOnly: true })]);
  const data: OnboardingCollege[] = await Promise.all(colleges.map(async (c) => {
    const family = collegeFamily(c.id, all);
    const count = new Map<string, number>();
    for (const i of items) if (family.includes(i.specialite_id)) count.set(i.specialite_id, (count.get(i.specialite_id) ?? 0) + 1);
    const specialties = all
      .filter((m) => family.includes(m.id) && (count.get(m.id) ?? 0) > 0)
      .map((m) => ({ id: m.id, nom: m.id === c.id ? `${m.nom} (tronc commun)` : m.nom, items: count.get(m.id) ?? 0 }))
      .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    return { id: c.id, nom: c.nom, items: Array.from(count.values()).reduce((a, b) => a + b, 0), examDate: await examDateForCollege(c.id), specialties };
  }));

  return (
    <main className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-(--color-ink)">Mon planning personnalisé</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">Deux étapes seulement : vos disponibilités, puis votre niveau estimé par spécialité. Votre voie et la date de l’épreuve sont déjà connues : votre planning est généré immédiatement, puis s’affine avec vos résultats.</p>
      </header>
      {data.length === 0 ? (
        <div className="rounded-(--radius-card) border border-dashed border-(--color-border) p-6 text-sm text-(--color-ink-soft)">
          Le programme de votre spécialité n’est pas encore paramétré dans le planificateur. L’équipe Major ECN le met en place ; revenez bientôt.
        </div>
      ) : (
        <OnboardingWizard colleges={data} voie={voieOfScope(profile.permission_scope)} today={todayKey()} />
      )}
    </main>
  );
}
