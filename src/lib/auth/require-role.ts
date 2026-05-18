import 'server-only';
import { redirect } from 'next/navigation';
import { getCurrentUserAndProfile } from './get-profile';

export async function requireUser() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile) redirect('/login');
  return { user, profile };
}

export async function requireAdmin() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user) redirect('/login');
  if (profile?.role !== 'admin') redirect('/app');
  return { user, profile };
}
