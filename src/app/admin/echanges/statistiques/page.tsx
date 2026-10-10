import { redirect } from 'next/navigation';
import { acteurBackOffice, peut } from '@/lib/echanges/serveur/admin';
import { db, FACULTE, parametres } from '@/lib/echanges/serveur/base';
import { agreger, lignesQuestions, type FiltresStats } from '@/lib/echanges/serveur/stats';
import { ajouterJours, instantParis } from '@/lib/evc-calendrier/dates';
import { dateParis } from '@/components/admin/echanges/pilotage/commun';
import { StatistiquesEchanges, type FiltresAffiches, type LigneAffichee } from '@/components/admin/echanges/pilotage/statistiques';

export const metadata = { title: 'Échanges — statistiques' };
export const dynamic = 'force-dynamic';

type Recherche = { groupe?: string; specialite?: string; enseignant?: string; depuis?: string; jusqua?: string; etat?: string };

const JOUR = /^\d{4}-\d{2}-\d{2}$/;
const ETATS = ['tous', 'repondu', 'non_repondu', 'retard'] as const;
const MAX_LIGNES = 200;

/**
 * Statistiques de réactivité des enseignants (§29-30, §129, §132-133) :
 * délai TOUJOURS « première réponse valide − tag » (même calcul que le
 * tableau de bord et les exports). Filtres dans l'adresse, période saisie en
 * jours de Paris. Un niveau restreint à certaines promotions ne voit que
 * celles-ci : la promotion est alors imposée (l'export l'exige aussi).
 */
export default async function StatistiquesPage({ searchParams }: { searchParams: Promise<Recherche> }) {
  const a = await acteurBackOffice();
  if (!a) redirect('/admin');
  if (!peut(a, 'statistiques')) redirect('/admin/echanges');
  const sp = await searchParams;

  const { data } = await db().from('echanges_groupes').select('id, nom, promotion, specialite_id, specialite_nom, statut').eq('faculte_id', FACULTE).order('nom');
  let groupes = (data ?? []) as { id: string; nom: string; promotion: string | null; specialite_id: string | null; specialite_nom: string | null; statut: string }[];
  if (a.staffGroupes) groupes = groupes.filter((g) => a.staffGroupes!.includes(g.id));
  const restreint = !!a.staffGroupes;

  let groupe = sp.groupe && groupes.some((g) => g.id === sp.groupe) ? sp.groupe : '';
  if (restreint && !groupe) groupe = groupes[0]?.id ?? '';
  const specialites = [...new Map(groupes.filter((g) => g.specialite_id).map((g) => [g.specialite_id!, g.specialite_nom ?? g.specialite_id!])).entries()]
    .map(([id, nom]) => ({ id, nom })).sort((x, y) => x.nom.localeCompare(y.nom, 'fr'));
  const specialite = sp.specialite && specialites.some((s) => s.id === sp.specialite) ? sp.specialite : '';
  const depuis = sp.depuis && JOUR.test(sp.depuis) ? sp.depuis : '';
  const jusqua = sp.jusqua && JOUR.test(sp.jusqua) ? sp.jusqua : '';
  const etat = (ETATS as readonly string[]).includes(sp.etat ?? '') ? (sp.etat as (typeof ETATS)[number]) : 'tous';

  // Bornes de la période : du début du premier jour à la fin du dernier, heure de Paris.
  const depuisIso = depuis ? new Date(instantParis(depuis)).toISOString() : null;
  const jusquaIso = jusqua ? new Date(instantParis(ajouterJours(jusqua, 1)) - 1).toISOString() : null;

  const filtres: FiltresStats = { groupeId: groupe || null, specialiteId: specialite || null, depuis: depuisIso, jusqua: jusquaIso, etat };
  const vide = restreint && !groupe;
  const { lignes: toutes, seuilHeures } = vide ? { lignes: [], seuilHeures: (await parametres()).relance_heures } : await lignesQuestions(filtres);
  const perimetre = restreint ? toutes.filter((l) => a.staffGroupes!.includes(l.groupeId)) : toutes;

  const enseignants = [...new Map(perimetre.map((l) => [l.enseignantId, `${l.enseignant} (${l.enseignantPublic})`])).entries()]
    .map(([id, nom]) => ({ id, nom })).sort((x, y) => x.nom.localeCompare(y.nom, 'fr'));
  const enseignant = sp.enseignant && enseignants.some((e) => e.id === sp.enseignant) ? sp.enseignant : '';
  const lignes = enseignant ? perimetre.filter((l) => l.enseignantId === enseignant) : perimetre;
  const agregats = agreger(lignes, seuilHeures);

  const affichees: LigneAffichee[] = lignes.slice(0, MAX_LIGNES).map((l) => ({
    id: l.tagId, groupeId: l.groupeId, promotion: l.promotion ? `${l.groupe} · ${l.promotion}` : l.groupe,
    enseignantId: l.enseignantId, enseignant: l.enseignant, enseignantPublic: l.enseignantPublic,
    tagAt: dateParis(l.tagAt), reponduAt: l.reponduAt ? dateParis(l.reponduAt) : null, delaiSecondes: l.delaiSecondes,
    statut: l.statut, enRetard: l.enRetard, relanceEnvoyee: l.relanceEnvoyee, traiteManuellement: l.traiteManuellement, extrait: l.extrait,
  }));

  const courants: FiltresAffiches = { groupe, specialite, enseignant, depuis, jusqua, etat };
  let exportQs: string | null = null;
  if (peut(a, 'exporter') && !vide) {
    const q = new URLSearchParams({ etat });
    if (groupe) q.set('groupe', groupe);
    if (specialite) q.set('specialite', specialite);
    if (enseignant) q.set('enseignant', enseignant);
    if (depuisIso) q.set('depuis', depuisIso);
    if (jusquaIso) q.set('jusqua', jusquaIso);
    exportQs = q.toString();
  }

  return (
    <StatistiquesEchanges
      filtres={courants}
      options={{ groupes: groupes.map((g) => ({ id: g.id, nom: g.promotion ? `${g.nom} · ${g.promotion}` : g.nom, archive: g.statut === 'archivee' })), specialites, enseignants }}
      restreint={restreint}
      seuilHeures={seuilHeures}
      agregats={agregats}
      ouvertesEnRetard={lignes.filter((l) => l.enRetard && l.statut !== 'traitee').length}
      lignes={affichees}
      totalLignes={lignes.length}
      exportQs={exportQs}
    />
  );
}
