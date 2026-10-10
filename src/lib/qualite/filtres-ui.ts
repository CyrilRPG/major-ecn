import { FAMILLE_LABEL, FAMILLES, GRAVITES, GRAVITE_LABEL, SENTIMENTS, SENTIMENT_LABEL, CATEGORIES, TYPES_SEANCE, TYPE_SEANCE_LABEL } from './types';
import { THEMES } from './analyse-regles';

/** Définitions des filtres affichés (données simples, transmissibles au client). */
export type DefFiltre = { cle: string; label: string; options?: { v: string; l: string }[]; type?: 'date' | 'texte' };
type Opts = { colleges: { v: string; l: string }[]; promotions: { v: string; l: string }[]; enseignants: { v: string; l: string }[]; sessions: { v: string; l: string }[] };

export function defsFiltres(o: Opts, cles: string[]): DefFiltre[] {
  const tous: Record<string, DefFiltre> = {
    du: { cle: 'du', label: 'Du', type: 'date' },
    au: { cle: 'au', label: 'Au', type: 'date' },
    famille: { cle: 'famille', label: 'Questionnaire', options: FAMILLES.map((f) => ({ v: f, l: FAMILLE_LABEL[f] })) },
    college: { cle: 'college', label: 'Spécialité', options: o.colleges },
    voie: { cle: 'voie', label: 'Voie', options: [{ v: 'interne', l: 'Interne' }, { v: 'externe', l: 'Externe' }] },
    formule: { cle: 'formule', label: 'Formule', options: [{ v: 'essentiel', l: 'Essentiel' }, { v: 'intensif', l: 'Intensif' }, { v: 'approfondi', l: 'Approfondi' }] },
    promotion: { cle: 'promotion', label: 'Promotion', options: o.promotions },
    session: { cle: 'session', label: "Session d'examen", options: o.sessions },
    enseignant: { cle: 'enseignant', label: 'Enseignant', options: o.enseignants },
    typeSeance: { cle: 'typeSeance', label: 'Type de cours', options: TYPES_SEANCE.map((t) => ({ v: t, l: TYPE_SEANCE_LABEL[t] })) },
    categorie: { cle: 'categorie', label: 'Catégorie', options: CATEGORIES.map((c) => ({ v: c.cle, l: c.label })) },
    theme: { cle: 'theme', label: 'Thème', options: THEMES.map((t) => ({ v: t.cle, l: t.libelle })) },
    sentiment: { cle: 'sentiment', label: 'Sentiment', options: SENTIMENTS.map((s) => ({ v: s, l: SENTIMENT_LABEL[s] })) },
    gravite: { cle: 'gravite', label: 'Gravité', options: GRAVITES.map((g) => ({ v: g, l: GRAVITE_LABEL[g] })) },
    q: { cle: 'q', label: 'Recherche', type: 'texte' },
  };
  return cles.map((c) => tous[c]).filter(Boolean);
}
