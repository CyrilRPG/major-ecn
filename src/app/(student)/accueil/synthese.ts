import 'server-only';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { parseScope, canAccessCollege, canAccessCours } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { getFaculteContentTotals } from '@/lib/data/faculte-totals';
import { chargerProgressionCours } from '@/lib/progress/course-progress-data';

/**
 * Progression de l'élève sur le programme (sections « Où j'en suis ? » et
 * « Mes statistiques » de l'accueil) : LA formule commune par item
 * (lib/progress, même chiffre que le navigateur et la bague de l'item),
 * calculée une fois par affichage.
 */

type CollegeRow = {
  id: string;
  nom: string;
  order_index: number | null;
  cours?: { id: string; titre: string; order_index: number | null; course_progress: { video_watched: boolean | null; fiche_read: boolean | null }[] | null }[] | null;
};

export type Synthese = {
  /** Questions accessibles faites / questions accessibles (%). */
  progressionGlobale: number;
  /** Items commencés / items accessibles. */
  itemsParcourus: number;
  itemsTotal: number;
  /** Items à 75 % ou plus de la formule commune (repli quand le moteur central n'est pas ouvert). */
  itemsMaitrises: number;
  /** Progression moyenne des items de chaque spécialité, les plus avancées d'abord. */
  parSpecialite: { id: string; nom: string; pct: number }[];
  /** Dénominateur du « Total étudié » : questions et cartes mémoire accessibles. */
  contenuTotal: number;
  /** Item à travailler en premier (le plus faible parmi les items commencés). */
  prochainCours: string | null;
};

export const syntheseProgression = cache(async (userId: string, permissionScope: unknown): Promise<Synthese> => {
  const scope = parseScope(permissionScope);
  const supabase = await createClient();
  const [ednRes, totaux] = await Promise.all([
    supabase.from('facultes')
      .select('semestres(matieres(id, nom, order_index, cours(id, titre, order_index, course_progress(video_watched, fiche_read))))')
      .eq('id', EDN_FACULTE_ID).maybeSingle(),
    getFaculteContentTotals(EDN_FACULTE_ID),
  ]);
  const colleges = (((ednRes.data as unknown as { semestres?: { matieres?: CollegeRow[] }[] } | null)?.semestres ?? []))
    .flatMap((s) => s.matieres ?? [])
    .filter((m) => canAccessCollege(scope, m.id))
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  const progression = await chargerProgressionCours({ userId, faculteId: EDN_FACULTE_ID, scope, cours: colleges.flatMap((m) => m.cours ?? []) });

  let faites = 0; let accessibles = 0; let parcourus = 0; let maitrises = 0; let total = 0;
  let prochain: { id: string; v: number } | null = null;
  const parSpecialite: Synthese['parSpecialite'] = [];
  const coursAccessibles: string[] = [];
  for (const m of colleges) {
    const cours = (m.cours ?? []).filter((c) => canAccessCours(scope, m.id, c.id));
    if (cours.length === 0) continue;
    let somme = 0;
    for (const c of cours) {
      const p = progression.get(c.id);
      const v = p?.progression ?? 0;
      coursAccessibles.push(c.id);
      total++;
      somme += v;
      faites += p?.input.questionsFaites ?? 0;
      accessibles += p?.input.questionsAccessibles ?? 0;
      if (v > 0) {
        parcourus++;
        if (!prochain || v < prochain.v) prochain = { id: c.id, v };
      }
      if (v >= 75) maitrises++;
    }
    parSpecialite.push({ id: m.id, nom: m.nom, pct: Math.round(somme / cours.length) });
  }
  const fc = new Map(totaux.fc_counts.map((f) => [f.cours_id, f.n]));
  const cartes = totaux.fc_counts.length > 0 ? coursAccessibles.reduce((s, id) => s + (fc.get(id) ?? 0), 0) : totaux.flashcards_total;
  return {
    progressionGlobale: accessibles > 0 ? Math.round((faites / accessibles) * 100) : 0,
    itemsParcourus: parcourus,
    itemsTotal: total,
    itemsMaitrises: maitrises,
    parSpecialite: parSpecialite.sort((a, b) => b.pct - a.pct || a.nom.localeCompare(b.nom, 'fr')),
    contenuTotal: accessibles + cartes,
    prochainCours: prochain?.id ?? coursAccessibles[0] ?? null,
  };
});
