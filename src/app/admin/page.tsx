import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/auth/require-role';
import { atterrissageEquipe } from '@/lib/auth/onglets-equipe';

/**
 * Atterrissage de l'administration : l'administrateur ouvre son cockpit,
 * page d'accueil par défaut de son compte (CDC « Mon cockpit », 08/10/2026) ;
 * un membre du personnel la première page que ses modules lui ouvrent (cahier
 * des charges 18/09/2026 — un commercial n'a rien à faire sur la liste des
 * élèves de l'admin, un rédacteur arrive sur le blog).
 */
export default async function AdminRoot() {
  const { profile, isAdmin } = await requireStaff();
  redirect(isAdmin ? '/admin/cockpit' : await atterrissageEquipe(profile));
}
