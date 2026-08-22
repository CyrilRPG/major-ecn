'use client';

import { usePathname } from 'next/navigation';
import { Command as CmdIcon, Lightbulb, Menu, PanelLeft, Search } from 'lucide-react';
import { UserMenu } from '@/components/user-menu';
import { PlatformTimer } from '@/components/student/platform-timer';
import type { Profile } from '@/lib/auth/get-profile';

function contextLabel(pathname: string): string {
  if (pathname.startsWith('/cours/')) {
    if (pathname.endsWith('/video')) return 'Cours · Vidéo';
    if (pathname.endsWith('/fiche')) return 'Cours · Fiche';
    if (pathname.includes('/qcm')) return 'Cours · Dossiers progressifs';
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
    <header className="flex h-16 items-center gap-2 border-b border-(--color-border) bg-(--color-surface) px-3 sm:gap-3 sm:px-4">
      {/* Menu.
          Sur téléphone, l'icône « panneau » ne se lisait pas comme un menu et
          n'avait aucun libellé : le menu paraissait absent. On affiche donc un
          hamburger explicite, encadré et légendé « Menu », et on garde l'icône
          de panneau sur grand écran où le geste est un repli de colonne. */}
      <button
        type="button"
        data-tour="menu-button"
        onClick={onToggleSidebar}
        aria-label="Ouvrir le menu de navigation"
        className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-(--color-border) px-2.5 text-(--color-ink) hover:bg-(--color-sand-100) focus-ring lg:h-9 lg:w-9 lg:justify-center lg:border-0 lg:px-0 lg:text-(--color-ink-soft)"
      >
        <Menu className="h-5 w-5 lg:hidden" />
        <PanelLeft className="hidden h-4.5 w-4.5 lg:block" />
        <span className="text-[13px] font-semibold lg:hidden">Menu</span>
      </button>

      <span className="hidden truncate text-sm font-medium text-(--color-ink-soft) sm:inline">
        {contextLabel(pathname)}
      </span>

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

      {profile.role === 'student' && <PlatformTimer />}

      {profile.role === 'student' && (
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event('conseils:open'))}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-[13px] font-bold text-[#E4002B] transition-transform hover:scale-[1.02] focus-ring"
          style={{
            backgroundImage:
              'linear-gradient(#FFFFFF,#FFFFFF), linear-gradient(90deg,#E4002B 0%,#F97316 100%)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            border: '1.5px solid transparent',
          }}
        >
          <Lightbulb className="h-4 w-4" />
          <span className="hidden bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] bg-clip-text text-transparent sm:inline">
            Conseils de préparation
          </span>
        </button>
      )}

      <UserMenu profile={profile} />
    </header>
  );
}
