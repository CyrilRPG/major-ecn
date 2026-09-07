import Link from 'next/link';
import { requireSuiviPage } from '@/lib/suivi/roles';
import { getAlert, getSettings, listEvcSessions, listStudents } from '@/lib/suivi/db';
import { studentName, studentSpecialty } from '@/lib/suivi/students';
import { ENROLLABLE_SPECIALTY_NAMES } from '@/lib/data/enrollable-colleges';
import { CampaignForm } from '@/components/admin/suivi/campaign-form';

export const dynamic = 'force-dynamic';

/** Création d'une campagne (§2). `?alert=` préremplit depuis une alerte (§4). */
export default async function NouvelleCampagnePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireSuiviPage('manage');
  const sp = await searchParams;
  const alertId = typeof sp.alert === 'string' ? sp.alert : null;
  const [settings, sessions, students, alert] = await Promise.all([
    getSettings(), listEvcSessions(), listStudents(), alertId ? getAlert(alertId) : Promise.resolve(null),
  ]);
  const present = new Set(students.map((s) => studentSpecialty(s.permission_scope)).filter(Boolean));
  const specialties = Array.from(new Set([...ENROLLABLE_SPECIALTY_NAMES, ...present])).sort((a, b) => a.localeCompare(b, 'fr'));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <Link href="/admin/suivi/campagnes" className="text-xs text-(--color-ink-muted) hover:underline">← Campagnes</Link>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">Nouvelle campagne</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">Combinez librement les filtres. L’audience est calculée en direct ; rien n’est envoyé aux candidats à cette étape.</p>
      </header>
      <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)">
        <CampaignForm
          initial={alert ? { name: alert.title.replace(/^créer la campagne\s*:?\s*/i, ''), description: alert.note } : undefined}
          specialties={specialties}
          sessions={sessions}
          students={students.filter((s) => s.is_active !== false).map((s) => ({ id: s.id, name: studentName(s), email: s.email ?? '', specialty: studentSpecialty(s.permission_scope) }))}
          defaultSlotMinutes={settings.default_slot_minutes}
        />
      </div>
    </main>
  );
}
