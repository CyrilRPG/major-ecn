import { StickyNote } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { lireBibliotheque, lirePreferencesPostit, type Db } from '@/lib/postits/depot';
import { HeroStat, StudentHero, StudentPage } from '@/components/student/ui/page-kit';
import { BibliothequePostits } from '@/components/postits/bibliotheque';

export const metadata = { title: 'Mes Post-it' };
export const dynamic = 'force-dynamic';

/**
 * « Tous mes Post-it » (§26-31) : la bibliothèque de l'élève — onglets Tous /
 * Actifs / Archivés / Corbeille, recherche et filtres, ouverture en grand,
 * restauration et re-placement. La corbeille échue est purgée à l'ouverture.
 */
export default async function MesPostitsPage({ searchParams }: { searchParams: Promise<{ postit?: string }> }) {
  const { user } = await requireUser();
  const supabase = await createClient();
  const db = supabase as unknown as Db;
  const [postits, preferences, { postit }] = await Promise.all([
    lireBibliotheque(db, user.id).catch(() => []),
    lirePreferencesPostit(db, user.id),
    searchParams,
  ]);
  const actifs = postits.filter((p) => p.statut === 'actif').length;
  const archives = postits.filter((p) => p.statut === 'archive').length;
  const taches = postits.filter((p) => p.statut === 'actif').flatMap((p) => p.taches).filter((t) => !t.fait).length;

  return (
    <StudentPage>
      <StudentHero
        aide="post-it"
        icon={StickyNote}
        eyebrow="Mon espace"
        title="Tous mes Post-it"
        subtitle="Vos notes posées sur l’accueil et sur vos items, au même endroit. Une tâche datée apparaît aussi dans votre agenda."
        stats={(
          <>
            <HeroStat dot="#FFF475" value={actifs} label={actifs > 1 ? 'actifs' : 'actif'} />
            <HeroStat dot="#DCC0FF" value={archives} label={archives > 1 ? 'archivés' : 'archivé'} />
            <HeroStat dot="#BDF58A" value={taches} label={taches > 1 ? 'tâches à faire' : 'tâche à faire'} />
          </>
        )}
      />
      <BibliothequePostits initiaux={postits} preferences={preferences} ouvrir={postit ?? null} />
    </StudentPage>
  );
}
