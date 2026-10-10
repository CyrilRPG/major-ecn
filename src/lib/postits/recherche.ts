/**
 * « Tous mes Post-it » — recherche et filtres (§26, §27). Module PUR.
 *
 * Une seule zone de recherche couvre les mots-clés, le titre, le contenu, les
 * tâches, la spécialité, l'item, la ressource, l'emplacement actuel, l'origine
 * et le statut. Les filtres dédiés (onglet, spécialité, emplacement, période)
 * s'y ajoutent. Les notes purgées n'existent plus en base : elles ne peuvent
 * donc jamais ressortir (§31).
 */
import { LIBELLE_TYPE, libelleEmplacement, type Postit } from './regles';

export type Onglet = 'tous' | 'actifs' | 'archives' | 'corbeille';

export type Periode =
  | { genre: 'tout' }
  | { genre: 'jour'; date: string }
  | { genre: 'mois'; mois: string }   // AAAA-MM
  | { genre: 'annee'; annee: string } // AAAA
  | { genre: 'perso'; du?: string | null; au?: string | null };

export type Filtres = {
  texte?: string;
  onglet?: Onglet;
  /** Spécialité (origine OU un des emplacements actuels). */
  matiereId?: string | null;
  /** Item (origine OU un des emplacements actuels). */
  coursId?: string | null;
  /** Emplacement actuel : clé exacte ('accueil'…), 'genre:item', 'genre:specialite' ou 'aucun'. */
  emplacement?: string | null;
  periode?: Periode;
};

/** Minuscules sans accents ni ponctuation superflue. */
export function normaliser(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’'`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const LIBELLE_STATUT = { actif: 'actif active actifs', archive: 'archive archivé archivée archives', supprime: 'supprimé corbeille' } as const;

/** Date calendaire de Paris d'un horodatage ISO. */
export function dateParis(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' });
}

/** Texte indexé d'une note (tout ce qui est cherchable). */
export function texteIndexe(p: Postit): string {
  const morceaux = [
    p.titre,
    p.contenu,
    ...p.taches.map((t) => t.texte),
    'origine', libelleEmplacement(p.origine), LIBELLE_TYPE[p.origine.type],
    p.origine.matiereNom ?? '', p.origine.coursTitre ?? '', p.origine.ressourceTitre ?? '',
    ...p.placements.flatMap((pl) => [libelleEmplacement(pl), LIBELLE_TYPE[pl.type]]),
    LIBELLE_STATUT[p.statut],
  ];
  return normaliser(morceaux.join(' \n '));
}

function dansOnglet(p: Postit, onglet: Onglet): boolean {
  if (onglet === 'corbeille') return p.statut === 'supprime';
  if (onglet === 'actifs') return p.statut === 'actif';
  if (onglet === 'archives') return p.statut === 'archive';
  return p.statut !== 'supprime';
}

export function dansPeriode(creeLe: string, periode: Periode | undefined): boolean {
  if (!periode || periode.genre === 'tout') return true;
  const d = dateParis(creeLe);
  switch (periode.genre) {
    case 'jour': return d === periode.date;
    case 'mois': return d.slice(0, 7) === periode.mois;
    case 'annee': return d.slice(0, 4) === periode.annee;
    case 'perso':
      if (periode.du && d < periode.du) return false;
      if (periode.au && d > periode.au) return false;
      return true;
  }
}

/** Applique recherche et filtres ; tri : dernières modifiées d'abord. */
export function filtrerPostits(postits: Postit[], f: Filtres): Postit[] {
  const mots = normaliser(f.texte ?? '').split(' ').filter(Boolean);
  return postits
    .filter((p) => dansOnglet(p, f.onglet ?? 'tous'))
    .filter((p) => !f.matiereId || p.origine.matiereId === f.matiereId || p.placements.some((pl) => pl.matiereId === f.matiereId))
    .filter((p) => !f.coursId || p.origine.coursId === f.coursId || p.placements.some((pl) => pl.coursId === f.coursId))
    .filter((p) => {
      if (!f.emplacement) return true;
      if (f.emplacement === 'aucun') return p.placements.length === 0;
      if (f.emplacement === 'genre:item') return p.placements.some((pl) => pl.coursId != null);
      if (f.emplacement === 'genre:specialite') return p.placements.some((pl) => pl.type === 'specialite');
      return p.placements.some((pl) => pl.cle === f.emplacement);
    })
    .filter((p) => dansPeriode(p.creeLe, f.periode))
    .filter((p) => {
      if (mots.length === 0) return true;
      const t = texteIndexe(p);
      return mots.every((m) => t.includes(m));
    })
    .sort((a, b) => b.modifieLe.localeCompare(a.modifieLe));
}

/** Post-it d'un item (§32) : origine ou emplacement dans l'item, archivés compris. */
export function postitsDeLItem(postits: Postit[], coursId: string): Postit[] {
  return postits
    .filter((p) => p.statut !== 'supprime')
    .filter((p) => p.origine.coursId === coursId || p.placements.some((pl) => pl.coursId === coursId))
    .sort((a, b) => (a.statut === b.statut ? b.modifieLe.localeCompare(a.modifieLe) : a.statut === 'actif' ? -1 : 1));
}

/** Spécialités présentes dans les notes (liste du filtre). */
export function specialitesPresentes(postits: Postit[]): { id: string; nom: string }[] {
  const m = new Map<string, string>();
  for (const p of postits) {
    if (p.origine.matiereId) m.set(p.origine.matiereId, p.origine.matiereNom ?? p.origine.matiereId);
    for (const pl of p.placements) if (pl.matiereId) m.set(pl.matiereId, pl.matiereNom ?? pl.matiereId);
  }
  return [...m.entries()].map(([id, nom]) => ({ id, nom })).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
}

/** Années de création présentes (filtre « année »). */
export function anneesPresentes(postits: Postit[]): string[] {
  return [...new Set(postits.map((p) => dateParis(p.creeLe).slice(0, 4)))].sort().reverse();
}
