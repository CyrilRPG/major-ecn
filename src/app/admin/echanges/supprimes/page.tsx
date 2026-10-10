import { redirect } from 'next/navigation';
import { acteurBackOffice, messagesSupprimes, peut } from '@/lib/echanges/serveur/admin';
import { db, FACULTE, parametres } from '@/lib/echanges/serveur/base';
import { ListeSupprimes } from '@/components/admin/echanges/moderation/liste-supprimes';

export const dynamic = 'force-dynamic';

/** Origines de suppression connues (contrainte de la table echanges_messages). */
const ORIGINES = ['auteur', 'moderation', 'refus', 'rgpd'];

/**
 * Messages supprimés (CDC §136-138) : par l'auteur, la modération, un refus
 * de la file de validation ou un effacement RGPD. Restaurables par le Super
 * Admin tant qu'ils ne sont pas purgés (délai de conservation des paramètres).
 */
export default async function SupprimesPage({ searchParams }: { searchParams: Promise<{ groupe?: string; origine?: string; q?: string }> }) {
  const a = await acteurBackOffice();
  if (!a) redirect('/admin');
  if (!peut(a, 'messages_supprimes')) redirect('/admin/echanges');

  const sp = await searchParams;
  const filtres = {
    groupe: sp.groupe && /^[0-9a-f-]{36}$/i.test(sp.groupe) ? sp.groupe : '',
    origine: sp.origine && ORIGINES.includes(sp.origine) ? sp.origine : '',
    q: sp.q?.trim().slice(0, 200) || '',
  };

  // Liste légère des promotions (filtre) : nom seulement, périmètre du modérateur respecté.
  const [messages, { data: gs }, prm] = await Promise.all([
    messagesSupprimes(a, { groupeId: filtres.groupe || null, origine: filtres.origine || null, q: filtres.q || null }),
    db().from('echanges_groupes').select('id, nom, statut').eq('faculte_id', FACULTE).order('nom'),
    parametres(),
  ]);
  const groupes = ((gs ?? []) as { id: string; nom: string; statut: string }[])
    .filter((g) => !a.staffGroupes || a.staffGroupes.includes(g.id))
    .map((g) => ({ id: g.id, nom: g.statut === 'archivee' ? `${g.nom} (archivée)` : g.nom }));

  return (
    <ListeSupprimes
      messages={messages}
      groupes={groupes}
      filtres={filtres}
      peutRestaurer={peut(a, 'restaurer')}
      conservationJours={prm.conservation_supprimes_jours}
    />
  );
}
