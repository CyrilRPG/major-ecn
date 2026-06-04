import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { ArborescenceClient } from './arborescence-client';

export const metadata = { title: 'Arborescence' };

type Slot = { id: string; label: string; content_type: 'video' | 'fiche' | 'qcm' | 'flashcards'; position: number };
type Item = { id: string; titre: string; order_index: number; slots: Slot[] };
type College = { id: string; nom: string; icon_key: string | null; color_hex: string | null; order_index: number; min_offer: string | null; items: Item[] };

export default async function ArborescencePage() {
  await requireAdmin();
  const supabase = await createClient();

  // 1) Récupère tous les collèges + cours du programme EDN
  const { data: colsRaw } = await supabase
    .from('facultes')
    .select(`
      semestres(matieres(id, nom, icon_key, color_hex, order_index, min_offer,
        cours(id, titre, order_index)))
    `)
    .eq('id', EDN_FACULTE_ID)
    .maybeSingle();

  type Row = { semestres?: { matieres?: Array<{
    id: string; nom: string; icon_key: string | null; color_hex: string | null;
    order_index: number; min_offer: string | null;
    cours?: { id: string; titre: string; order_index: number }[] | null;
  }> }[] };
  const cols = ((colsRaw as unknown as Row | null)?.semestres ?? [])
    .flatMap((s) => s.matieres ?? [])
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  // 2) Récupère tous les slots de contenu pour les cours de ces collèges
  const allCoursIds = cols.flatMap((c) => (c.cours ?? []).map((cc) => cc.id));
  const { data: slotsRaw } = allCoursIds.length > 0
    ? await (supabase as unknown as {
        from: (t: string) => {
          select: (s: string) => {
            in: (c: string, v: string[]) => {
              order: (c: string, o: { ascending: boolean }) => Promise<{ data: Array<{ id: string; cours_id: string; label: string; content_type: 'video'|'fiche'|'qcm'|'flashcards'; position: number }> | null }>;
            };
          };
        };
      })
        .from('cours_content_slots')
        .select('id, cours_id, label, content_type, position')
        .in('cours_id', allCoursIds)
        .order('position', { ascending: true })
    : { data: [] };

  const slotsByCours = new Map<string, Slot[]>();
  for (const s of (slotsRaw ?? [])) {
    const arr = slotsByCours.get(s.cours_id) ?? [];
    arr.push({ id: s.id, label: s.label, content_type: s.content_type, position: s.position });
    slotsByCours.set(s.cours_id, arr);
  }

  const colleges: College[] = cols.map((m) => ({
    id: m.id,
    nom: m.nom,
    icon_key: m.icon_key,
    color_hex: m.color_hex,
    order_index: m.order_index,
    min_offer: m.min_offer,
    items: (m.cours ?? [])
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .map((c) => ({
        id: c.id,
        titre: c.titre,
        order_index: c.order_index,
        slots: slotsByCours.get(c.id) ?? [],
      })),
  }));

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">Arborescence</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          Gérez vos collèges, items et permissions. Chaque nouvel item est livré avec 4 contenus par défaut
          (vidéo, fiche, QCM, flashcards) que vous pouvez personnaliser.
        </p>
      </header>

      <ArborescenceClient colleges={colleges} />
    </main>
  );
}
