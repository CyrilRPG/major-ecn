import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';

export default async function AppHome() {
  const { profile } = await requireUser();
  if (profile.role === 'admin') redirect('/admin');
  redirect('/facultes');
}
