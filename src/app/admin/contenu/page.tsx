import { profCanAccessCours, requireContentEditor } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import {
  ContenuExplorer, type CollegeAffiche, type ItemAvecCompteurs,
} from '@/components/admin/content/contenu-explorer';

export const metadata = { title: 'Contenu' };

type College = {
  id: string;
  nom: string;
  icon_key: string | null;
  color_hex: string | null;
  order_index: number | null;
  parent_matiere_id: string | null;
  cours: { id: string; titre: string }[] | null;
};

type CountRow = {
  cours_id: string;
  has_video: boolean;
  has_fiche: boolean;
  qcm_count: number;
  annale_count: number;
  flashcard_count: number;
  importance: number | null;
};

const SANS_COMPTEURS = {
  has_video: false, has_fiche: false, qcm_count: 0, annale_count: 0, flashcard_count: 0, importance: 0,
};

export default async function AdminContenuPage() {
  const { scope, isAdmin } = await requireContentEditor();
  const supabase = await createClient();

  // Requête « cœur » volontairement légère (id + titre uniquement). Les compteurs
  // (vidéo/fiche/QCM/flashcards/importance) sont récupérés à part via une RPC
  // agrégée : l'ancien embed profond (matieres→cours→qcm_series+flashcards, ~40k
  // lignes évaluées par les policies RLS) dépassait le statement_timeout et
  // renvoyait une page vide.
  //
  // Les deux lectures sont INDÉPENDANTES : elles partent ensemble au lieu de
  // s'enchaîner. La RPC coûtait 1 374 ms à elle seule avant d'être réécrite en
  // agrégats ; l'attendre après l'arbre doublait le délai d'affichage.
  const [{ data }, { data: counts }] = await Promise.all([
    supabase
      .from('facultes')
      .select(`
        semestres(matieres(id, nom, icon_key, color_hex, order_index, parent_matiere_id,
          cours(id, titre)))
      `)
      .eq('id', EDN_FACULTE_ID)
      .maybeSingle(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).rpc('admin_content_counts', { p_faculte_id: EDN_FACULTE_ID }),
  ]);

  // Compteurs agrégés — tolérant : si la RPC échoue, la grille s'affiche quand
  // même avec des compteurs à zéro.
  const compteurs = new Map<string, Omit<CountRow, 'cours_id'>>();
  for (const r of ((counts ?? []) as CountRow[])) {
    const { cours_id, ...reste } = r;
    compteurs.set(cours_id, reste);
  }

  const avecCompteurs = (c: { id: string; titre: string }): ItemAvecCompteurs => {
    const k = compteurs.get(c.id) ?? SANS_COMPTEURS;
    return {
      id: c.id,
      titre: c.titre,
      has_video: k.has_video,
      has_fiche: k.has_fiche,
      qcm_count: k.qcm_count,
      annale_count: k.annale_count,
      flashcard_count: k.flashcard_count,
      importance: k.importance ?? 0,
    };
  };

  const toutes = (
    ((data as unknown as { semestres?: { matieres?: College[] }[] } | null)?.semestres ?? [])
  )
    .flatMap((s) => s.matieres ?? [])
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    // Restreint la liste des cours selon les permissions du professeur (admin = tout)
    .map((m) => ({
      ...m,
      cours: (m.cours ?? []).filter((c) => profCanAccessCours(scope, m.id, c.id)),
    }));

  // Les sous-collèges de médecine générale apparaissaient comme des collèges
  // indépendants, et « Médecine générale » — qui ne porte aucun item en propre —
  // s'affichait vide. On rétablit la hiérarchie : un collège parent regroupe
  // ses sous-collèges, et ses items éventuels.
  const enfantsDe = (id: string) => toutes.filter((m) => m.parent_matiere_id === id);
  const colleges: CollegeAffiche[] = toutes
    .filter((m) => !m.parent_matiere_id)
    .map((m) => ({ parent: m, enfants: enfantsDe(m.id) }))
    // Cache les collèges qui n'ont plus aucun cours accessible — sauf pour
    // l'administrateur, qui doit pouvoir créer le premier item d'un collège vide.
    .filter(({ parent, enfants }) =>
      isAdmin
      || (parent.cours ?? []).length > 0
      || enfants.some((e) => (e.cours ?? []).length > 0))
    .map(({ parent, enfants }) => ({
      id: parent.id,
      nom: parent.nom,
      iconKey: parent.icon_key,
      colorHex: parent.color_hex,
      cours: (parent.cours ?? []).map(avecCompteurs),
      enfants: enfants.map((e) => ({
        id: e.id,
        nom: e.nom,
        colorHex: e.color_hex,
        cours: (e.cours ?? []).map(avecCompteurs),
      })),
    }));

  const nbItems = colleges.reduce(
    (n, c) => n + c.cours.length + c.enfants.reduce((m, e) => m + e.cours.length, 0),
    0,
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">Contenu pédagogique</h1>
        <p className="mt-0.5 text-sm text-(--color-ink-soft)">
          {colleges.length} collèges · {nbItems} items. Ouvrez un collège, ou cherchez directement un item.
        </p>
      </header>

      <ContenuExplorer colleges={colleges} isAdmin={isAdmin} />
    </main>
  );
}
