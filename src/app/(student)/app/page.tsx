import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';

export default async function AppHome() {
  const { profile } = await requireUser();
  // Admin ET professeur vont sur le panneau admin (/admin redirige ensuite
  // vers /admin/eleves pour l'admin, ou /admin/qa pour le prof via requireAdmin).
  if (profile.role === 'admin' || profile.role === 'professor') redirect('/admin');
  redirect('/accueil');
}
