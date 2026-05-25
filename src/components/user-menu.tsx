'use client';

import { LogOut, Shield, UserRound } from 'lucide-react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import { initials } from '@/lib/utils';
import type { Profile } from '@/lib/auth/get-profile';

export function UserMenu({ profile }: { profile: Profile }) {
  const router = useRouter();
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus-ring rounded-full">
        <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-(--color-primary-soft) transition">
          <AvatarFallback>{initials(profile.first_name, profile.last_name)}</AvatarFallback>
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
        {profile.role === 'admin' && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <Shield />
              Panneau admin
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/app">
            <UserRound />
            Mon espace
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profil">
            <UserRound />
            Mon profil
          </Link>
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
