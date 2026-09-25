/**
 * Bibliothèque vidéo de l'administration (/admin/videos) — règles PURES,
 * partagées par la page serveur et testables hors Next :
 *
 *  - ordre des collèges et sous-collèges : ALPHABÉTIQUE (demande du monteur
 *    vidéo, 25/09/2026). Accents et casse ignorés : « Échographie » se range
 *    avec les « E », pas après « Z ». Les ITEMS, eux, gardent l'ordre du
 *    programme (`order_index` : « Replays - Révisions » en tête, puis la
 *    numérotation « Item 01, Item 02… ») — c'est l'ordre que voient les élèves.
 *  - périmètre : un collaborateur ne voit que les collèges de son
 *    `permission_scope` ; l'administrateur (portée null) voit tout.
 *  - aperçu Bunny : lecture de la durée ISO 8601 de la page d'embed.
 */

/** Comparaison alphabétique française, accents et casse ignorés. */
export function comparerNomsFr(a: string, b: string): number {
  return a.localeCompare(b, 'fr', { sensitivity: 'base', numeric: true });
}

/** Copie triée par nom (ordre alphabétique français), départage stable par id. */
export function trierParNom<T extends { nom: string; id: string }>(liste: readonly T[]): T[] {
  return liste.slice().sort((x, y) => comparerNomsFr(x.nom, y.nom) || (x.id < y.id ? -1 : x.id > y.id ? 1 : 0));
}

export type LibraryCollege = {
  id: string;
  nom: string;
  /** Sous-collèges (Médecine générale, Odontologie, Imagerie médicale). Vide pour les spécialités simples. */
  enfants: { id: string; nom: string }[];
  /**
   * Le collège lui-même est dans le périmètre (ses items « du collège » sont
   * accessibles). Faux quand seul un de ses sous-collèges l'est : le collège
   * n'apparaît alors que comme porte d'entrée vers ce sous-collège.
   */
  accesDirect: boolean;
};

/** Portée d'un collaborateur (null = administrateur, tout est visible). */
export type PorteeBibliotheque = { type: 'all' | 'college'; colleges: string[] } | null;

export type MatiereLigne = { id: string; nom: string; parent_matiere_id: string | null };

/** Le collège (ou sous-collège) `id` est-il dans la portée ? */
export function dansPerimetre(portee: PorteeBibliotheque, id: string): boolean {
  return portee === null || portee.type === 'all' || portee.colleges.includes(id);
}

/**
 * Collèges proposés dans le sélecteur de la bibliothèque : ceux du périmètre
 * (ou dont au moins un sous-collège est dans le périmètre), triés par ordre
 * alphabétique, sous-collèges compris.
 */
export function collegesBibliotheque(rows: readonly MatiereLigne[], portee: PorteeBibliotheque): LibraryCollege[] {
  const racines = rows.filter((m) => !m.parent_matiere_id);
  const colleges = racines
    .map((m) => ({
      id: m.id,
      nom: m.nom,
      accesDirect: dansPerimetre(portee, m.id),
      enfants: trierParNom(
        rows
          .filter((e) => e.parent_matiere_id === m.id && dansPerimetre(portee, e.id))
          .map((e) => ({ id: e.id, nom: e.nom })),
      ),
    }))
    .filter((c) => c.accesDirect || c.enfants.length > 0);
  return trierParNom(colleges);
}

/**
 * Durée ISO 8601 (« PT2H49M2S ») → secondes. Null si illisible ou nulle
 * (vidéo encore en cours d'encodage chez Bunny).
 */
export function dureeIsoEnSecondes(iso: string | null | undefined): number | null {
  const m = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/i.exec((iso ?? '').trim());
  if (!m) return null;
  const [, j, h, mi, s] = m;
  const total = Number(j ?? 0) * 86400 + Number(h ?? 0) * 3600 + Number(mi ?? 0) * 60 + Math.round(Number(s ?? 0));
  return total > 0 ? total : null;
}

/** Secondes → « 2 h 49 min », « 12 min 05 s », « 45 s ». */
export function formaterDuree(secondes: number): string {
  const h = Math.floor(secondes / 3600);
  const m = Math.floor((secondes % 3600) / 60);
  const s = secondes % 60;
  if (h > 0) return `${h} h ${String(m).padStart(2, '0')} min`;
  if (m > 0) return `${m} min ${String(s).padStart(2, '0')} s`;
  return `${s} s`;
}
