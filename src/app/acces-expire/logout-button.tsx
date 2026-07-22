'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await createClient().auth.signOut();
        router.push('/login');
        router.refresh();
      }}
      className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold text-(--color-ink-soft) hover:text-(--color-ink)"
    >
      Se déconnecter
    </button>
  );
}
