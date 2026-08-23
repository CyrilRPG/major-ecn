'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { cloisonnerParFaculte } from './faculte-scope';

/** Client navigateur. Comme côté serveur, les tables transverses partagées avec
 *  Major Odontologie sont bornées à la faculté EDN (`faculte-scope.ts`). */
export function createClient() {
  return cloisonnerParFaculte(
    createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    ),
  );
}
