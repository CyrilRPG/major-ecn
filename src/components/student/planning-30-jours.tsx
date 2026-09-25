import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { chargerPlanning } from '@/lib/agenda/planning-server';
import type { PermissionScope } from '@/types/domain';
import { Planning30JoursClient } from './planning-30-jours-client';

/**
 * « Mes 30 prochains jours » — haut de la colonne droite de l'accueil élève
 * (maquette du 24/09/2026). Chargé dans son propre <Suspense> : il ne retarde
 * ni le tableau de bord ni les annonces.
 */
export async function Planning30Jours({ userId, scope }: { userId: string; scope: PermissionScope }) {
  const donnees = await chargerPlanning(await createClient(), userId, scope);
  return <Planning30JoursClient evenements={donnees.evenements} present={donnees.present} fin={donnees.fin} />;
}

/** Squelette aux dimensions de la carte pendant le streaming. */
export function Planning30JoursSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6" aria-hidden>
      <div className="flex items-center gap-3.5">
        <div className="h-11 w-11 shrink-0 rounded-2xl bg-(--color-sand-100)" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-(--color-sand-100)" />
          <div className="h-3 w-2/3 rounded bg-(--color-sand-100)" />
        </div>
      </div>
      <div className="mt-4 h-[272px] rounded-2xl border border-(--color-border)" />
      <div className="mt-4 h-40 rounded-2xl bg-(--color-sand-100)" />
    </div>
  );
}
