import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { ongletsDe } from '@/lib/auth/onglets-equipe';

export default async function AppHome() {
  const { profile } = await requireUser();
  // Admin → panneau admin. Professeur → page d'accueil dédiée (vue étudiant
  // adaptée : collèges accessibles + items + forum, avec crayons d'édition).
  if (profile.role === 'admin') redirect('/admin');
  // Un collaborateur sans contenu pédagogique (monteur vidéo, commercial,
  // rédacteur blog…) atterrit directement sur sa première page d'administration.
  if (profile.role === 'professor' && !(await ongletsDe(profile)).contenu) redirect('/admin');
  redirect('/accueil');
}
