import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { PopupsManager, type PopupRow, type CoursOption } from '@/components/admin/popups/popups-manager';

export const dynamic = 'force-dynamic';

export default async function AdminPopupsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: coursRaw } = await supabase
    .from('cours')
    .select('id, titre, matieres(nom)')
    .order('titre', { ascending: true });
  const cours: CoursOption[] = ((coursRaw ?? []) as Array<{ id: string; titre: string; matieres?: { nom?: string } | null }>).map((c) => ({
    id: c.id,
    titre: c.titre,
    college: c.matieres?.nom ?? '—',
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: popupsRaw } = await (supabase as any)
    .from('item_popups')
    .select('id, cours_id, title, video_path, active, created_at')
    .order('created_at', { ascending: false });

  const coursById = new Map(cours.map((c) => [c.id, c]));
  const popups: PopupRow[] = ((popupsRaw ?? []) as Array<{
    id: string; cours_id: string; title: string | null; video_path: string; active: boolean; created_at: string;
  }>).map((p) => ({
    id: p.id,
    cours_id: p.cours_id,
    title: p.title,
    active: p.active,
    coursTitre: coursById.get(p.cours_id)?.titre ?? 'Item supprimé',
    college: coursById.get(p.cours_id)?.college ?? '—',
    videoUrl: supabase.storage.from('item-popups').getPublicUrl(p.video_path).data.publicUrl,
  }));

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <h1 className="text-xl font-black tracking-tight text-(--color-ink)">Popups vidéo</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          Créez des popups vidéo (mp4) associées à un item. Elles s’affichent à l’accueil de l’item ;
          l’élève peut les fermer, et une fois vues elles ne réapparaissent plus.
        </p>
      </header>
      <PopupsManager cours={cours} popups={popups} />
    </div>
  );
}
