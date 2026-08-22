'use client';

import { GraduationCap, LogOut, Shield, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';
import { DrawnAvatar } from '@/components/avatar/drawn-avatar';
import { effectiveSeed } from '@/lib/avatar';
import { createClient } from '@/lib/supabase/client';
import { resetOnboarding } from '@/lib/student/onboarding';
import type { Profile } from '@/lib/auth/get-profile';

export function UserMenu({ profile }: { profile: Profile }) {
  const router = useRouter();
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };
  /** Rejoue tout le parcours d'accueil : popup pas à pas + flèches sur le menu,
   *  l'aperçu d'un item et l'assistant. Rechargement complet (et non
   *  `router.push`) pour que chaque composant se remonte et relise un stockage
   *  vidé — sinon ceux déjà rendus resteraient sur leur décision de départ. */
  const handleReplayTutorial = () => {
    resetOnboarding();
    window.location.assign('/accueil?tutoriel=1');
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus-ring rounded-full">
        <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-(--color-primary-soft) transition">
          <DrawnAvatar seed={effectiveSeed(profile.id, profile.avatar_seed)} size={36} />
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5 px-0 normal-case tracking-normal text-(--color-ink)">
            <span className="font-semibold text-sm">{profile.first_name} {profile.last_name}</span>
            <span className="text-xs text-(--color-ink-soft) lowercase font-normal">{profile.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(profile.role === 'admin' || profile.role === 'professor') && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <Shield />
              {profile.role === 'professor' ? 'Espace professeur' : 'Panneau admin'}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href={profile.role === 'admin' || profile.role === 'professor' ? '/accueil' : '/app'}>
            <UserRound />
            {profile.role === 'admin' || profile.role === 'professor' ? 'Vue étudiant' : 'Mon espace'}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profil">
            <UserRound />
            Mon profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleReplayTutorial}>
          <GraduationCap />
          Revoir le tutoriel
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-(--color-danger) data-[highlighted]:bg-red-50 dark:data-[highlighted]:bg-red-900/20 data-[highlighted]:text-(--color-danger)">
          <LogOut />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
