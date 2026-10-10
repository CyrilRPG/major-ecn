import { redirect } from 'next/navigation';
import { contexteCockpit, FACULTE } from '@/lib/cockpit/server/base';
import { tachesVisibles } from '@/lib/cockpit/server/taches';
import { conversationsDe } from '@/lib/cockpit/server/messagerie';
import { estOuverte, nomComplet } from '@/lib/cockpit/regles';
import { EntetePage, PageCockpit } from '@/components/admin/cockpit/ui';
import { ListeEnseignants, type FicheEnseignant } from '@/components/admin/cockpit/enseignants/liste-enseignants';

export const metadata = { title: 'Enseignants' };
export const dynamic = 'force-dynamic';

/**
 * Enseignants (cockpit) : depuis la fiche d'un enseignant, créer une tâche
 * qui garde le lien direct (C03) ou lui écrire dans la messagerie
 * administrative (C04). Les compteurs ne portent que sur MES tâches et MES
 * conversations.
 */
export default async function EnseignantsPage() {
  const { moi, db } = await contexteCockpit();
  if (!moi.estAdmin) redirect('/admin/cockpit');
  const [{ data: profs }, taches, convs] = await Promise.all([
    db.from('profiles').select('id, first_name, last_name, email, is_active, permission_scope').eq('role', 'professor').eq('faculte_id', FACULTE).order('last_name').limit(1000),
    tachesVisibles(db, moi.id),
    conversationsDe(db, moi),
  ]);
  type Prof = { id: string; first_name: string | null; last_name: string | null; email: string | null; is_active: boolean | null; permission_scope: { fonction?: string } | null };
  const fiches: FicheEnseignant[] = ((profs ?? []) as Prof[]).map((p) => ({
    id: p.id,
    nom: nomComplet(p) || p.email || 'Enseignant',
    email: p.email,
    actif: p.is_active !== false,
    fonction: p.permission_scope?.fonction ?? null,
    tachesOuvertes: taches.filter((t) => t.owner_id === moi.id && t.lien_type === 'enseignant' && t.lien_id === p.id && estOuverte(t.statut)).length,
    conversations: convs.filter((c) => c.role === 'proprietaire' && c.interlocuteur_id === p.id).map((c) => ({ id: c.id, sujet: c.sujet })),
  }));
  return (
    <PageCockpit>
      <div className="mx-auto max-w-[1300px]">
        <EntetePage
          titre="Enseignants"
          sousTitre="Créez une tâche liée à un enseignant ou écrivez-lui : le lien avec sa fiche est conservé, sa réponse revient dans votre messagerie et en copie par e-mail."
        />
        <ListeEnseignants fiches={fiches} />
      </div>
    </PageCockpit>
  );
}
