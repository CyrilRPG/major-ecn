'use client';

import { usePathname } from 'next/navigation';
import { Command as CmdIcon, PanelLeft, Search } from 'lucide-react';
import { UserMenu } from '@/components/user-menu';
import type { Profile } from '@/lib/auth/get-profile';

function contextLabel(pathname: string): string {
  if (pathname.startsWith('/cours/')) {
    if (pathname.endsWith('/video')) return 'Cours · Vidéo';
    if (pathname.endsWith('/fiche')) return 'Cours · Fiche';
    if (pathname.includes('/qcm')) return 'Cours · Dossiers progressifs';
    if (pathname.includes('/annales')) return 'Cours · Annales';
    if (pathname.includes('/flashcards')) return 'Cours · Flashcards';
    if (pathname.includes('/resultats')) return 'Cours · Résultats';
    return 'Cours';
  }
  if (pathname.startsWith('/matieres/')) return 'Collège';
  if (pathname.startsWith('/facultes')) return 'Médecine';
  if (pathname.startsWith('/accueil')) return 'Accueil';
  if (pathname.startsWith('/entrainement')) return 'Entraînement ciblé';
  if (pathname.startsWith('/agenda')) return 'Agenda';
  return 'Mon espace';
}

export function TopBar({
  profile,
  onOpenPalette,
  onToggleSidebar,
}: {
  profile: Profile;
  onOpenPalette: () => void;
  onToggleSidebar: () => void;
}) {
  const pathname = usePathname();
  return (
    <header className="flex h-14 items-center gap-3 border-b border-(--color-border) bg-(--color-surface) px-4">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Afficher / masquer le panneau"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-(--color-ink-soft) hover:bg-(--color-sand-100) focus-ring"
      >
        <PanelLeft className="h-4.5 w-4.5" />
      </button>

      <span className="text-sm font-medium text-(--color-ink-soft)">{contextLabel(pathname)}</span>

      <button
        type="button"
        onClick={onOpenPalette}
        className="ml-auto flex h-9 items-center gap-2 rounded-lg border border-(--color-border) bg-(--color-surface-soft) pl-3 pr-2 text-sm text-(--color-ink-muted) hover:border-(--color-border-strong) focus-ring"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Rechercher</span>
        <kbd className="hidden sm:flex items-center gap-0.5 rounded border border-(--color-border) bg-(--color-surface) px-1.5 py-0.5 text-[10px]">
          <CmdIcon className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      <UserMenu profile={profile} />
    </header>
  );
}
