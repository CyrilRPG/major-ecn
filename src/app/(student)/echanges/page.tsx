import { requireUser } from '@/lib/auth/require-role';
import { EchangesApp } from '@/components/echanges/echanges-app';

export const metadata = { title: 'Échanges' };

/** 💬 Échanges : la messagerie collective de la promotion (CDC §1-3). */
export default async function EchangesPage() {
  const { profile } = await requireUser();
  return <EchangesApp estStaff={profile.role === 'admin'} />;
}
