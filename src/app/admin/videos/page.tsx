import { requireContentEditor, requireOnglet } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { VideoLibrary, type LibraryCollege } from '@/components/admin/videos/video-library';
import { TOUS_DROITS, type DroitsVideo } from '@/components/admin/videos/video-manager';
import { lireScopeEquipe, peutContenu } from '@/lib/auth/collaborateurs';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { collegesBibliotheque } from '@/lib/videos/bibliotheque';

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
  // Onglet ouvert seulement si le type « vidéo » fait partie des droits.
  await requireOnglet('videos');
  const { profile, isAdmin, scope: portee } = await requireContentEditor();
  // Droits fins du cahier des charges (§5) : créer / modifier / publier /
  // supprimer, lus depuis le module « Contenus » du scope d'équipe.
  const scope = isAdmin ? null : lireScopeEquipe(profile.permission_scope);
  const droits: DroitsVideo = isAdmin ? TOUS_DROITS : {
    creer: peutContenu(scope, 'creer', 'video'),
    modifier: peutContenu(scope, 'modifier', 'video'),
    publier: peutContenu(scope, 'publier', 'video'),
    supprimer: peutContenu(scope, 'supprimer', 'video'),
  };
  const supabase = await createClient();

  // Collèges de Major ECN seulement : la base est partagée avec Major
  // Odontologie et Major Pharma, dont les collèges (un second « Odontologie »)
  // n'atteignent jamais les élèves de cette plateforme.
  // (Client service : la liste des semestres n'est pas une donnée sensible et
  // ne doit pas dépendre des policies de lecture d'un collaborateur.)
  const { data: semestres } = await createAdminClient()
    .from('semestres')
    .select('id')
    .eq('faculte_id', EDN_FACULTE_ID);
  const { data } = await supabase
    .from('matieres')
    .select('id, nom, parent_matiere_id, order_index')
    .in('semestre_id', ((semestres ?? []) as { id: string }[]).map((x) => x.id))
    .order('order_index', { ascending: true });

  const rows = (data ?? []) as unknown as {
    id: string; nom: string; parent_matiere_id: string | null; order_index: number | null;
  }[];

  // Un collaborateur ne voit que les collèges de son périmètre : proposer un
  // collège hors périmètre menait à « Accès refusé » au moment d'enregistrer.
  // Collèges et sous-collèges par ordre alphabétique (demande du monteur
  // vidéo) ; les items gardent l'ordre du programme (cf. lib/videos/bibliotheque).
  const colleges: LibraryCollege[] = collegesBibliotheque(rows, portee);
  const perimetreRestreint = portee !== null && portee.type !== 'all';

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

      {perimetreRestreint && (
        <p className="mb-4 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-xs text-(--color-ink-soft)">
          Votre accès couvre {colleges.length} spécialité{colleges.length > 1 ? 's' : ''}. Pour en ajouter une,
          un administrateur élargit votre périmètre dans « Équipe &amp; Permissions ».
        </p>
      )}
      <VideoLibrary colleges={colleges} droits={droits} />
    </main>
  );
}
