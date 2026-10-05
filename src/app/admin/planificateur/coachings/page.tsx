import { collegeFamily, listColleges, listCoachings, listItems, listPreparations } from '@/lib/plan/db';
import { CoachingsEditor } from '@/components/admin/plan/coachings-editor';

/**
 * Coachings du Parcours du Major (§23-§27) : V1 = Médecine générale ; leur
 * publication n'ajoute jamais d'activité au planning, un coaching sans item
 * reste visible dans la bibliothèque sans être injecté.
 */
export default async function CoachingsPage() {
  const [coachings, preps, colleges] = await Promise.all([listCoachings(), listPreparations(), listColleges()]);
  const specialities = Array.from(new Set(coachings.map((c) => c.speciality_id)));
  const items = (await listItems({ specialites: specialities.flatMap((s) => collegeFamily(s, colleges)), activeOnly: false })).map((i) => ({ id: i.id, name: i.nom_item }));
  const enabled = preps.filter((p) => p.coaching_enabled).map((p) => colleges.find((c) => c.id === p.specialite_id)?.nom ?? p.specialite_id);
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">Coachings du Parcours du Major</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">{coachings.length} coachings · Parcours activé pour : {enabled.join(', ') || 'aucune préparation'} (onglet Structure). Un coaching est une ressource : regarder ou lire ne produit aucun signal ; seule la partie évaluative réalisée peut en produire si vous l’activez.</p>
      </header>
      <CoachingsEditor coachings={coachings} items={items} />
    </main>
  );
}
