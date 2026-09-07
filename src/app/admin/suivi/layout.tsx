import { requireSuiviPage } from '@/lib/suivi/roles';
import { SuiviTabs } from '@/components/admin/suivi/suivi-tabs';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Suivi individuel' };

/**
 * Module de suivi pédagogique individuel : accès réservé aux administrateurs et
 * aux professeurs dotés d'un rôle du module (§18). Un professeur sans rôle est
 * renvoyé vers son panneau Q&R.
 */
export default async function SuiviLayout({ children }: { children: React.ReactNode }) {
  const { role } = await requireSuiviPage('view');
  return (
    <div className="min-w-0">
      <SuiviTabs role={role} />
      {children}
    </div>
  );
}
