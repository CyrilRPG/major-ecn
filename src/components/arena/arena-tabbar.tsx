'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Home, ListOrdered, UserRound } from 'lucide-react';
import { ARENA, BODY } from './arena-ui';

/**
 * Barre d'onglets mobile des maquettes (Accueil · Classement · Profil · Aide),
 * affichée aux participants connectés sous 640 px. Liens uniquement.
 */
export function ArenaTabBar({ base, leaderboard }: { base: string; leaderboard: boolean }) {
  const path = usePathname() ?? '';
  const tabs = [
    { href: `${base}/espace`, label: 'Accueil', icon: Home, active: path === `${base}/espace` || path.startsWith(`${base}/manche`) },
    ...(leaderboard ? [{ href: `${base}/classement`, label: 'Classement', icon: ListOrdered, active: path.startsWith(`${base}/classement`) }] : []),
    { href: `${base}/espace#compte`, label: 'Profil', icon: UserRound, active: false },
    { href: `${base}/regles`, label: 'Aide', icon: BookOpen, active: path.startsWith(`${base}/regles`) },
  ];
  return (
    <nav
      aria-label="Navigation de l’arène"
      className="fixed inset-x-0 bottom-0 z-30 grid sm:hidden"
      style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)`, background: 'rgba(11,15,20,0.92)', backdropFilter: 'blur(14px)', borderTop: `1px solid ${ARENA.lineStrong}`, paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map((t) => (
        <Link key={t.label} href={t.href} className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: t.active ? ARENA.redSoft : ARENA.textMuted, fontFamily: BODY }}>
          <t.icon className="h-5 w-5" strokeWidth={t.active ? 2.4 : 1.8} />
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
