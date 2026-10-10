import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MessageSquareOff } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { accesGroupe, chargerActeur } from '@/lib/echanges/serveur/acces';
import { db, journaliser } from '@/lib/echanges/serveur/base';
import { visible, COLONNES_MESSAGE, type MessageRow } from '@/lib/echanges/serveur/messages';

export const metadata = { title: 'Échanges' };
export const dynamic = 'force-dynamic';

/**
 * Lien direct d'un message (bouton « Répondre à la question » des e-mails,
 * notifications). Non connecté : le middleware renvoie vers la connexion
 * avec `next=/echanges/m/<id>`, puis on revient ici (§23, R10). L'accès au
 * groupe est revérifié : un enseignant retiré du groupe ne rouvre rien (R41).
 * Une question supprimée affiche sobrement qu'elle n'est plus disponible (§75).
 */
export default async function LienMessage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = await requireUser();
  const { id } = await params;
  const acteur = await chargerActeur(user.id);
  let cible: string | null = null;
  if (acteur && /^[0-9a-f-]{36}$/i.test(id)) {
    const { data } = await db().from('echanges_messages').select(COLONNES_MESSAGE).eq('id', id).maybeSingle();
    const m = data as MessageRow | null;
    if (m) {
      const acces = await accesGroupe(acteur, m.groupe_id);
      if (acces && acces.droits.lire && visible(m, acteur, acces)) {
        cible = `/echanges/${m.groupe_id}?m=${m.id}${m.canal === 'annonces' ? '&canal=annonces' : ''}`;
      } else if (!acces) {
        await journaliser('info', 'permission', 'Lien direct refusé', { acteur: acteur.id, message: id });
      }
    }
  }
  if (cible) redirect(cible);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <MessageSquareOff className="h-10 w-10 text-(--color-ink-muted)" />
      <p className="text-[16px] font-semibold text-(--color-ink)">Cette question n’est plus disponible.</p>
      <Link href="/echanges" className="rounded-xl bg-[#102C5F] px-4 py-2.5 text-sm font-bold text-white">Ouvrir les échanges</Link>
    </div>
  );
}
