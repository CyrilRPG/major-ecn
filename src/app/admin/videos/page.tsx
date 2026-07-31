import { requireContentEditor } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { VideoLibrary, type LibraryCollege } from '@/components/admin/videos/video-library';

export const metadata = { title: 'Vidéos' };

/**
 * Bibliothèque vidéo : le seul endroit où l'on gère les vidéos de la
 * plateforme — les vidéos déjà en ligne comme les nouvelles.
 *
 * Navigation : collège → sous-collège (Médecine générale) → item → catégorie
 * (Cours vidéo / Séances approfondies). La catégorie détermine le public :
 * Cours vidéo → Formule Intensive, Séance approfondie → Programme Approfondi.
 */
export default async function AdminVideosPage() {
  await requireContentEditor();
  const supabase = await createClient();

  const { data } = await supabase
    .from('matieres')
    .select('id, nom, parent_matiere_id, order_index')
    .order('order_index', { ascending: true });

  const rows = (data ?? []) as unknown as {
    id: string; nom: string; parent_matiere_id: string | null; order_index: number | null;
  }[];

  const colleges: LibraryCollege[] = rows
    .filter((m) => !m.parent_matiere_id)
    .map((m) => ({
      id: m.id,
      nom: m.nom,
      enfants: rows
        .filter((e) => e.parent_matiere_id === m.id)
        .map((e) => ({ id: e.id, nom: e.nom })),
    }));

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-8 border-b border-(--color-border) pb-5">
        <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">Vidéos</h1>
        <p className="mt-0.5 text-sm text-(--color-ink-soft)">
          Déposez la vidéo sur bunny.net (Stream), copiez son lien, puis choisissez ci-dessous où
          la placer. Ordre, nom et lien se modifient à tout moment.
        </p>
      </header>

      <VideoLibrary colleges={colleges} />
    </main>
  );
}
