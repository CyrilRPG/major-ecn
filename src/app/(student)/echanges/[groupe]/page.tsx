import { requireUser } from '@/lib/auth/require-role';
import { EchangesApp } from '@/components/echanges/echanges-app';
import { chargerActeur } from '@/lib/echanges/serveur/acces';
import { resoudreContexte } from '@/lib/echanges/serveur/contexte';

export const metadata = { title: 'Échanges' };

/**
 * Conversation d'un groupe. `?m=<id>` : ouvre la conversation sur ce message
 * (lien direct, résultat de recherche) ; `?type=&id=` : question posée depuis
 * un contenu pédagogique (contexte vérifié côté serveur, §64-65).
 */
export default async function GroupePage({ params, searchParams }: {
  params: Promise<{ groupe: string }>;
  searchParams: Promise<{ m?: string; canal?: string; type?: string; id?: string }>;
}) {
  const { user, profile } = await requireUser();
  const { groupe } = await params;
  const sp = await searchParams;
  let contexte = null;
  if (sp.type && sp.id) {
    const acteur = await chargerActeur(user.id);
    if (acteur) contexte = await resoudreContexte(acteur, sp.type, sp.id).catch(() => null);
  }
  return (
    <EchangesApp
      groupeId={groupe}
      canal={sp.canal === 'annonces' ? 'annonces' : 'discussion'}
      autour={sp.m && /^[0-9a-f-]{36}$/i.test(sp.m) ? sp.m : null}
      contexte={contexte}
      estStaff={profile.role === 'admin'}
    />
  );
}
