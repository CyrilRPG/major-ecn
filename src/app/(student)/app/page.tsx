import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';

export default async function AppHome() {
  const { profile } = await requireUser();
  // Admin → panneau admin. Professeur → page d'accueil dédiée (vue étudiant
  // adaptée : collèges accessibles + items + forum, avec crayons d'édition).
  if (profile.role === 'admin') redirect('/admin');
  redirect('/accueil');
}
