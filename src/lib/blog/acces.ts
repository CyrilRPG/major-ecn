import 'server-only';
import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/auth/require-role';
import { getCurrentUserAndProfile, type Profile } from '@/lib/auth/get-profile';
import { lireScopeEquipe, peutBlog, premierePage, type DroitBlog } from '@/lib/auth/collaborateurs';

/**
 * Module « Blog » (cahier des charges 18/09/2026, §6) : permissions
 * indépendantes — créer, modifier ses articles, modifier tous les articles,
 * publier, dépublier, supprimer. L'administrateur a tout ; un membre du
 * personnel suit son module blog.
 */
export type DroitsBlog = Record<DroitBlog, boolean> & { voir: boolean };

export const TOUS_DROITS_BLOG: DroitsBlog = {
  voir: true, creer: true, modifier_siens: true, modifier_tous: true, publier: true, depublier: true, supprimer: true,
};

export function droitsBlogDe(profile: Pick<Profile, 'role' | 'permission_scope'>): DroitsBlog {
  if (profile.role === 'admin') return TOUS_DROITS_BLOG;
  const scope = lireScopeEquipe(profile.permission_scope);
  return {
    voir: peutBlog(scope, 'voir'),
    creer: peutBlog(scope, 'creer'),
    modifier_siens: peutBlog(scope, 'modifier_siens'),
    modifier_tous: peutBlog(scope, 'modifier_tous'),
    publier: peutBlog(scope, 'publier'),
    depublier: peutBlog(scope, 'depublier'),
    supprimer: peutBlog(scope, 'supprimer'),
  };
}

/** Peut-on modifier CET article ? (ses propres articles, ou tous) */
export function peutModifierArticle(droits: DroitsBlog, authorId: string | null | undefined, userId: string): boolean {
  return droits.modifier_tous || (droits.modifier_siens && !!authorId && authorId === userId);
}

export type ActeurBlog = { user: { id: string }; profile: Profile; isAdmin: boolean; droits: DroitsBlog };

/** Garde de PAGE : sans module blog, retour à la première page de la personne. */
export async function requireBlogPage(): Promise<ActeurBlog> {
  const { user, profile, isAdmin } = await requireStaff();
  const droits = droitsBlogDe(profile);
  if (!droits.voir) redirect(isAdmin ? '/admin' : premierePage(lireScopeEquipe(profile.permission_scope)));
  return { user, profile, isAdmin, droits };
}

/** Garde de SERVER ACTION : lève une erreur lisible. */
export async function requireBlogAction(): Promise<ActeurBlog> {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile) throw new Error('Non authentifié');
  if (profile.is_active === false) throw new Error('Compte désactivé');
  if (profile.role !== 'admin' && profile.role !== 'professor') throw new Error('Réservé à l’équipe');
  const droits = droitsBlogDe(profile);
  if (!droits.voir) throw new Error('Votre accès ne comprend pas le module Blog.');
  return { user, profile, isAdmin: profile.role === 'admin', droits };
}
