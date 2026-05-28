import { requireUser } from '@/lib/auth/require-role';
import { parseScope } from '@/lib/auth/permissions';
import { CollegesGrid } from '@/components/student/colleges-grid';

export const metadata = { title: 'Médecine' };

export default async function CollegesPage() {
  const { profile } = await requireUser();
  const scope = parseScope(profile.permission_scope);

  return (
    <div className="px-5 py-7 lg:px-10">
      <header className="mb-7">
        <p className="text-xs font-medium text-(--color-ink-muted)">Programme EVC</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-(--color-ink)">Médecine</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          Choisissez un item pour accéder à son contenu et lancer un entraînement.
        </p>
      </header>
      <CollegesGrid scope={scope} />
    </div>
  );
}
