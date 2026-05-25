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
  if (profile?.role !== 'admin') {
    // Profs are redirected to their Q&R panel; everyone else to /app.
    redirect(profile?.role === 'professor' ? '/admin/qa' : '/app');
  }
  return { user, profile };
}

/** Allows admins or professors. Used for the Q&R management panel. */
export async function requireStaff() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user) redirect('/login');
  if (!profile || (profile.role !== 'admin' && profile.role !== 'professor')) redirect('/app');
  return { user, profile, isAdmin: profile.role === 'admin' };
}
