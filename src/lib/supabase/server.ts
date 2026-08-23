import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { cloisonnerParFaculte } from './faculte-scope';

/** Client serveur de l'utilisateur connecté. Les tables transverses partagées
 *  avec Major Odontologie y sont bornées à la faculté EDN (`faculte-scope.ts`). */
export async function createClient() {
  const cookieStore = await cookies();
  return cloisonnerParFaculte(
    createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(toSet) {
            try {
              toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
            } catch {
              // Server Component called from a non-mutable context: ignored.
            }
          },
        },
      },
    ),
  );
}
