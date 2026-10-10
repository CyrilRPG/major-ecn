import Link from 'next/link';
import { redirect } from 'next/navigation';
import { acteurBackOffice } from '@/lib/echanges/serveur/admin';
import { parametres } from '@/lib/echanges/serveur/base';
import { LIBELLE_NIVEAU, type Capacite } from '@/lib/echanges/regles';
import { NavEchanges, type OngletEchanges } from '@/components/admin/echanges/nav';

export const metadata = { title: 'Échanges — administration' };
export const dynamic = 'force-dynamic';

const ONGLETS: (OngletEchanges & { requis: Capacite[] })[] = [
  { href: '/admin/echanges', label: 'Tableau de bord', exact: true, requis: [] },
  { href: '/admin/echanges/groupes', label: 'Promotions', requis: ['gerer_groupes'] },
  { href: '/admin/echanges/moderation', label: 'Modération', requis: ['moderer', 'signalements'] },
  { href: '/admin/echanges/supprimes', label: 'Messages supprimés', requis: ['messages_supprimes'] },
  { href: '/admin/echanges/statistiques', label: 'Statistiques', requis: ['statistiques'] },
  { href: '/admin/echanges/archives', label: 'Archives', requis: ['gerer_groupes'] },
  { href: '/admin/echanges/bibliotheque', label: 'Bibliothèque', requis: ['bibliotheque'] },
  { href: '/admin/echanges/parametres', label: 'Paramètres', requis: ['parametres'] },
  { href: '/admin/echanges/journal', label: 'Journal d’audit', requis: ['audit'] },
];

const LIBELLE_MODE = {
  desactive: { texte: 'Module désactivé : seuls les Super Admins y ont accès (configuration).', ton: 'bg-(--color-surface-sunken) text-(--color-ink-soft)' },
  interne: { texte: 'Mode interne : l’équipe, les enseignants affectés et les comptes de test seulement. Les candidats ne voient pas encore les échanges.', ton: 'bg-[#FFF3E0] text-[#B45309]' },
  actif: { texte: 'Module actif : ouvert aux candidats de chaque promotion.', ton: 'bg-[#E6F4EA] text-[#1F7A3E]' },
} as const;

/**
 * Back-office des Échanges (messagerie collective des promotions, CDC
 * oct. 2026) : réservé aux comptes dotés d'un niveau — Super Admin
 * (administrateurs), administrateur pédagogique, modérateur (§102-103).
 */
export default async function EchangesAdminLayout({ children }: { children: React.ReactNode }) {
  const a = await acteurBackOffice();
  if (!a) redirect('/admin');
  const prm = await parametres();
  const onglets = ONGLETS.filter((o) => o.requis.length === 0 || o.requis.some((c) => a.capacites.has(c)))
    .map(({ href, label, exact }) => ({ href, label, exact }));
  const mode = LIBELLE_MODE[prm.module_mode];
  return (
    <main className="mx-auto w-full max-w-[96rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-4 flex flex-wrap items-end gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-(--color-ink-muted)">Administration · {LIBELLE_NIVEAU[a.niveau!]}</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">Échanges des promotions</h1>
          <p className="mt-0.5 text-sm text-(--color-ink-soft)">Messagerie collective des candidats et de leurs enseignants : promotions, modération, réactivité, bibliothèque.</p>
        </div>
        <Link href="/echanges" className="ml-auto text-sm font-medium text-(--color-primary) hover:underline">Ouvrir les échanges →</Link>
      </header>
      <p className={`mb-4 rounded-xl px-3 py-2 text-[13px] ${mode.ton}`}>
        {mode.texte}
        {a.capacites.has('parametres') && <> <Link href="/admin/echanges/parametres" className="font-medium underline">Changer le mode</Link></>}
      </p>
      <NavEchanges onglets={onglets} />
      <div className="mt-5">{children}</div>
    </main>
  );
}
