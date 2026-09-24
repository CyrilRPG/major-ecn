import 'server-only';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import {
  SECTION_CONCOURS, SECTIONS_HERITEES, TYPES_REMPLACES,
  collegesVises, completerFiche, ficheDepuisAncienBloc, ficheDepuisSection, ficheEstVide, ficheVide, normaliserFiche,
  type AncienBloc, type FicheConcours, type MessageAnnonce,
} from './concours';

/**
 * Lecture des annonces de l'accueil (fiches concours + messages libres),
 * partagée par le widget élève, la page d'une spécialité et l'administration.
 * Le client est passé par l'appelant : client élève (RLS) côté accueil,
 * client service-role côté administration.
 */

export type College = { id: string; nom: string; parent: string | null; order_index: number };

export type DonneesAnnonces = {
  /** Spécialités de premier niveau (hors découverte), dans l'ordre du programme. */
  specialites: College[];
  /** Sous-collège → collège parent. */
  parentDe: Map<string, string | null>;
  /** Fiche effective par spécialité (anciens blocs compris), hors fiches retirées ou vides. */
  fiches: Map<string, FicheConcours>;
  /** Spécialités dont la fiche est encore alimentée par d'anciens blocs. */
  heritees: Set<string>;
  /** Messages libres (info / texte), visibles ou non. */
  messages: (MessageAnnonce & { badge_label: string | null; badge_tone: string | null; icon_key: string | null; order_index: number; visible: boolean })[];
  /** Anciens blocs compte à rebours / calendrier / statistique. */
  anciensBlocs: (AncienBloc & { visible: boolean })[];
  /** Nombre de lignes des anciennes sections génériques encore en base. */
  anciennesSections: number;
};

/**
 * Carte « Médecine générale — EVC 2026 » qui était écrite en dur dans le
 * widget : elle devient la fiche par défaut de la MG, tant qu'aucune fiche
 * n'a été saisie (ou retirée) pour cette spécialité.
 */
const FICHE_MG_PAR_DEFAUT: FicheConcours = {
  ...ficheVide(),
  date_epreuve: '2027-01-15',
  inscription_debut: '2026-06-17T12:00:00.000Z',
  inscription_fin: '2026-07-16T15:00:00.000Z',
  postes_externe: 35,
  postes_interne: 89,
};

type Ligne = { section_key: string; college_id: string; data: Record<string, unknown> | null };
type LigneAnnonce = AncienBloc & {
  badge_label: string | null; badge_tone: string | null; icon_key: string | null;
  order_index: number; visible: boolean; min_offer: string | null; voies: string[] | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function chargerAnnonces(client: any, options: { messagesMasques?: boolean } = {}): Promise<DonneesAnnonces> {
  let annoncesQ = client
    .from('homepage_announcements')
    .select('id, kind, title, badge_label, badge_tone, icon_key, data, order_index, visible, min_offer, target_scope, target_colleges, voies')
    .order('order_index', { ascending: true });
  if (!options.messagesMasques) annoncesQ = annoncesQ.eq('visible', true);

  const [{ data: generiques }, { data: annonces }, { data: matieres }] = await Promise.all([
    client.from('homepage_generic_data').select('section_key, college_id, data'),
    annoncesQ,
    client
      .from('matieres')
      .select('id, nom, parent_matiere_id, order_index, semestres!inner(faculte_id)')
      .eq('semestres.faculte_id', EDN_FACULTE_ID)
      .order('order_index', { ascending: true }),
  ]);

  const parentDe = new Map<string, string | null>();
  const specialites: College[] = [];
  for (const m of (matieres ?? []) as { id: string; nom: string; parent_matiere_id: string | null; order_index: number | null }[]) {
    parentDe.set(m.id, m.parent_matiere_id);
    if (!m.parent_matiere_id && m.id !== 'col-decouverte') {
      specialites.push({ id: m.id, nom: m.nom, parent: null, order_index: m.order_index ?? 0 });
    }
  }
  const top = (id: string) => parentDe.get(id) ?? id;

  // 1. Fiches saisies (nouveau système) — elles priment.
  const saisies = new Map<string, FicheConcours>();
  const heriteesBrutes = new Map<string, Partial<FicheConcours>[]>();
  let anciennesSections = 0;
  for (const l of (generiques ?? []) as Ligne[]) {
    if (l.section_key === SECTION_CONCOURS) {
      saisies.set(top(l.college_id), normaliserFiche(l.data));
    } else if ((SECTIONS_HERITEES as readonly string[]).includes(l.section_key)) {
      anciennesSections += 1;
      const k = top(l.college_id);
      heriteesBrutes.set(k, [...(heriteesBrutes.get(k) ?? []), ficheDepuisSection(l.section_key, l.data ?? {})]);
    }
  }

  // 2. Anciens blocs ciblés sur des spécialités précises → repli de leur fiche.
  const lignes = (annonces ?? []) as LigneAnnonce[];
  const anciensBlocs = lignes.filter((b) => TYPES_REMPLACES.has(b.kind));
  for (const b of anciensBlocs) {
    if (!b.visible) continue;
    for (const c of new Set(collegesVises(b).map(top))) {
      heriteesBrutes.set(c, [...(heriteesBrutes.get(c) ?? []), ficheDepuisAncienBloc(b)]);
    }
  }

  // 3. Fusion.
  const fiches = new Map<string, FicheConcours>();
  const heritees = new Set<string>();
  const ids = new Set([...saisies.keys(), ...heriteesBrutes.keys()]);
  if (!saisies.has('col-medecine-generale')) ids.add('col-medecine-generale');
  for (const id of ids) {
    const saisie = saisies.get(id);
    if (saisie?.retiree) continue;
    // Une fiche enregistrée depuis le nouvel écran fait foi à elle seule : elle a
    // été pré-remplie avec les anciens blocs, qui ne doivent plus la compléter
    // (un champ vidé exprès ne doit pas « revenir »).
    let fiche = saisie ?? ficheVide();
    if (!saisie) {
      for (const r of heriteesBrutes.get(id) ?? []) fiche = completerFiche(fiche, r);
      if (id === 'col-medecine-generale') fiche = completerFiche(fiche, FICHE_MG_PAR_DEFAUT);
    }
    if (ficheEstVide(fiche)) continue;
    fiches.set(id, fiche);
    if (!saisie) heritees.add(id);
  }

  const messages = lignes
    .filter((b) => !TYPES_REMPLACES.has(b.kind))
    .map((b) => ({ ...b, data: b.data ?? {} }));

  return { specialites, parentDe, fiches, heritees, messages, anciensBlocs, anciennesSections };
}
