import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { PopupsManager, type PopupRow, type CoursOption } from '@/components/admin/popups/popups-manager';
import {
  WelcomePopupManager, type WelcomeConfigRow, type CollegeOption,
} from '@/components/admin/popups/welcome-popup-manager';

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

  // Popup d'accueil « Bienvenue sur Major ECN » : configurations par spécialité.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: welcomeRaw } = await (supabase as any)
    .from('welcome_popups')
    .select('id, college_id, active, titre, accroche, intro, demarrage_actif, demarrage_intro, demarrage_colleges');
  const welcomeConfigs: WelcomeConfigRow[] = ((welcomeRaw ?? []) as Array<{
    id: string; college_id: string | null; active: boolean; titre: string; accroche: string;
    intro: string; demarrage_actif: boolean; demarrage_intro: string; demarrage_colleges: string[] | null;
  }>)
    .map((w) => ({
      id: w.id,
      collegeId: w.college_id,
      active: w.active,
      titre: w.titre,
      accroche: w.accroche,
      intro: w.intro,
      demarrageActif: w.demarrage_actif,
      demarrageIntro: w.demarrage_intro,
      demarrageColleges: w.demarrage_colleges ?? [],
    }))
    // Configuration par défaut en tête, puis les spécialités par nom.
    .sort((a, b) => (a.collegeId === null ? -1 : b.collegeId === null ? 1 : a.collegeId.localeCompare(b.collegeId)));

  const { data: collegesRaw } = await supabase
    .from('matieres')
    .select('id, nom, parent_matiere_id')
    .order('order_index', { ascending: true });
  const colleges: CollegeOption[] = ((collegesRaw ?? []) as Array<{
    id: string; nom: string; parent_matiere_id: string | null;
  }>).map((m) => ({
    id: m.id,
    nom: m.parent_matiere_id ? `Médecine générale · ${m.nom}` : m.nom,
  }));

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <h1 className="text-xl font-black tracking-tight text-(--color-ink)">Popups</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          Le popup d’accueil de la plateforme, et les popups vidéo attachées à un item.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="text-base font-black tracking-tight text-(--color-ink)">Popup d’accueil</h2>
        <p className="mb-4 mt-1 text-sm text-(--color-ink-soft)">
          Le message « Bienvenue sur Major ECN » affiché à la première connexion. Personnalisez-le
          par spécialité — ou décochez « Afficher le popup » pour le retirer.
        </p>
        <WelcomePopupManager configs={welcomeConfigs} colleges={colleges} />
      </section>

      <section>
        <h2 className="text-base font-black tracking-tight text-(--color-ink)">Popups vidéo</h2>
        <p className="mb-4 mt-1 text-sm text-(--color-ink-soft)">
          Créez des popups vidéo (mp4) associées à un item. Elles s’affichent à l’accueil de l’item ;
          l’élève peut les fermer, et une fois vues elles ne réapparaissent plus.
        </p>
        <PopupsManager cours={cours} popups={popups} />
      </section>
    </div>
  );
}
