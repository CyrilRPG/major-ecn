import { requireSuiviPage } from '@/lib/suivi/roles';
import { getSettings, listStaffProfiles, listStaffRoles, listStudents, listTemplates } from '@/lib/suivi/db';
import { studentSpecialty } from '@/lib/suivi/students';
import { specialtyColor } from '@/lib/suivi/colors';
import { ENROLLABLE_SPECIALTY_NAMES } from '@/lib/data/enrollable-colleges';
import { SettingsForm, SpecialtyColorsForm, StaffRolesPanel, TemplatesEditor } from '@/components/admin/suivi/settings-panels';

export const dynamic = 'force-dynamic';

/** Réglages (administrateur) : paramètres, couleurs, modèles d'emails, rôles (§5, §6, §9, §15, §18). */
export default async function ReglagesPage() {
  await requireSuiviPage('settings');
  const [settings, templates, staff, roles, students] = await Promise.all([getSettings(), listTemplates(), listStaffProfiles(), listStaffRoles(), listStudents()]);
  const present = new Set(students.map((s) => studentSpecialty(s.permission_scope)).filter(Boolean));
  const specialties = Array.from(new Set([...ENROLLABLE_SPECIALTY_NAMES, ...present])).sort((a, b) => a.localeCompare(b, 'fr'));
  const colors = Object.fromEntries(specialties.map((s) => [s, specialtyColor(s, settings.specialty_colors)]));
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">Réglages du suivi individuel</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">Durée des créneaux, rappels, conservation, couleurs de l’agenda, modèles d’emails et rôles de l’équipe.</p>
      </header>
      <div className="space-y-6">
        <SettingsForm settings={settings} />
        <TemplatesEditor templates={templates} />
        <SpecialtyColorsForm specialties={specialties} colors={colors} />
        <StaffRolesPanel professors={staff.filter((s) => s.role === 'professor')} roles={Object.fromEntries(roles.map((r) => [r.user_id, r.role]))} />
      </div>
    </main>
  );
}
