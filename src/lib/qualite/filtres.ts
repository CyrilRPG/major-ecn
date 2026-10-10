/**
 * Filtres combinables des statistiques (§32) — lecture des paramètres d'URL
 * (module PUR : partagé entre pages, exports et barre de filtres).
 */

export type Filtres = {
  du: string | null;
  au: string | null;
  famille: string | null;
  college: string | null;
  voie: 'interne' | 'externe' | null;
  formule: string | null;
  promotion: string | null;
  session: string | null;
  enseignant: string | null;
  seance: string | null;
  typeSeance: string | null;
  contenu: string | null;
  categorie: string | null;
  theme: string | null;
  sentiment: string | null;
  gravite: string | null;
  statut: string | null;
  niveau: string | null;
  q: string | null;
};

export const CLES_FILTRES: (keyof Filtres)[] = [
  'du', 'au', 'famille', 'college', 'voie', 'formule', 'promotion', 'session', 'enseignant', 'seance', 'typeSeance',
  'contenu', 'categorie', 'theme', 'sentiment', 'gravite', 'statut', 'niveau', 'q',
];

type Params = Record<string, string | string[] | undefined>;

const lire = (sp: Params, k: string): string | null => {
  const v = sp[k];
  const s = Array.isArray(v) ? v[0] : v;
  return s && s.trim() ? s.trim().slice(0, 200) : null;
};
const jour = (s: string | null) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null);

export function lireFiltres(sp: Params): Filtres {
  const voie = lire(sp, 'voie');
  return {
    du: jour(lire(sp, 'du')),
    au: jour(lire(sp, 'au')),
    famille: lire(sp, 'famille'),
    college: lire(sp, 'college'),
    voie: voie === 'interne' || voie === 'externe' ? voie : null,
    formule: lire(sp, 'formule'),
    promotion: lire(sp, 'promotion'),
    session: lire(sp, 'session'),
    enseignant: lire(sp, 'enseignant'),
    seance: lire(sp, 'seance'),
    typeSeance: lire(sp, 'typeSeance'),
    contenu: lire(sp, 'contenu'),
    categorie: lire(sp, 'categorie'),
    theme: lire(sp, 'theme'),
    sentiment: lire(sp, 'sentiment'),
    gravite: lire(sp, 'gravite'),
    statut: lire(sp, 'statut'),
    niveau: lire(sp, 'niveau'),
    q: lire(sp, 'q'),
  };
}

export function filtresVersQuery(f: Partial<Filtres>, extra: Record<string, string | null | undefined> = {}): string {
  const u = new URLSearchParams();
  for (const k of CLES_FILTRES) { const v = f[k]; if (v) u.set(k, v); }
  for (const [k, v] of Object.entries(extra)) if (v) u.set(k, v);
  const s = u.toString();
  return s ? `?${s}` : '';
}

/** Bornes ISO d'une période (au inclus, jour de Paris approché à minuit UTC+1). */
export function bornes(f: Filtres): { depuis: string | null; jusqua: string | null } {
  return {
    depuis: f.du ? `${f.du}T00:00:00+01:00` : null,
    jusqua: f.au ? `${f.au}T23:59:59+01:00` : null,
  };
}
