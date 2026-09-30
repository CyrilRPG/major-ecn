/**
 * Filtres, recherche et tris de la liste des candidats (cahier §9, §6).
 * PARTAGÉS par l'écran et les exports : un export reflète EXACTEMENT les
 * filtres sélectionnés (§29), puisqu'il applique la même fonction aux mêmes
 * paramètres (sérialisés dans l'URL de téléchargement).
 *
 * Module PUR.
 */
import { jourParis } from './dates';
import type { LigneEvaluee } from './moteur';
import type { Statut } from './types';

export type Vue =
  | 'tous' | 'a_relancer' | 'R1' | 'R2' | 'R3' | 'anciens' | 'en_attente' | 'actives' | 'jamais_connectes'
  | 'termines' | 'desinscrits' | 'erreurs';

export const VUE_LABEL: Record<Vue, string> = {
  tous: 'Tous',
  a_relancer: 'À relancer',
  R1: 'R1 à envoyer',
  R2: 'R2 à envoyer',
  R3: 'R3 à envoyer',
  anciens: 'Anciens accès',
  en_attente: 'En attente',
  actives: 'Connectés (activés)',
  jamais_connectes: 'Jamais connectés',
  termines: 'Terminés',
  desinscrits: 'Désinscrits',
  erreurs: 'Adresses en erreur',
};

export type Anciennete = '' | '30' | '60' | '90' | '180' | 'perso';
export const ANCIENNETE_LABEL: Record<Exclude<Anciennete, ''>, string> = {
  '30': 'Plus de 30 jours', '60': 'Plus de 60 jours', '90': 'Plus de 90 jours', '180': 'Plus de 6 mois', perso: 'Personnalisée',
};

export type ColonneTri = 'candidat' | 'specialite' | 'voie' | 'demande' | 'connexion' | 'derniere_relance' | 'prochaine' | 'echeance' | 'statut' | 'anciennete';

export type Filtres = {
  vue: Vue;
  specialite: string;        // '' = toutes
  voie: string;              // '' = toutes
  anciennete: Anciennete;
  ancienneteMin: number | null;  // personnalisée (jours depuis J0)
  ancienneteMax: number | null;
  demandeDu: string;         // AAAA-MM-JJ (Paris), '' = sans borne
  demandeAu: string;
  recherche: string;
  tri: ColonneTri;
  sens: 'asc' | 'desc';
};

export const FILTRES_DEFAUT: Filtres = {
  vue: 'tous', specialite: '', voie: '', anciennete: '', ancienneteMin: null, ancienneteMax: null,
  demandeDu: '', demandeAu: '', recherche: '', tri: 'echeance', sens: 'asc',
};

const ORDRE_STATUT: Record<Statut, number> = { ROUGE: 0, VIOLET: 1, BLOQUE: 2, ORANGE: 3, VERT: 4, GRIS: 5, DESINSCRIT: 6 };

export function sansAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Le candidat relève-t-il de la vue (compteurs cliquables du §8) ? */
export function dansVue(l: LigneEvaluee, vue: Vue): boolean {
  const e = l.evaluation;
  switch (vue) {
    case 'tous': return true;
    case 'a_relancer': return e.statut === 'ROUGE';
    case 'R1': case 'R2': case 'R3': return e.statut === 'ROUGE' && e.prochainType === vue;
    case 'anciens': return e.statut === 'VIOLET';
    case 'en_attente': return e.statut === 'ORANGE';
    case 'actives': return e.statut === 'VERT';
    case 'jamais_connectes': return !e.connecteAt;
    case 'termines': return e.statut === 'GRIS';
    case 'desinscrits': return !!e.opposition;
    case 'erreurs': return e.statut === 'BLOQUE';
  }
}

export function filtrer(lignes: LigneEvaluee[], f: Filtres): LigneEvaluee[] {
  const q = sansAccents(f.recherche.trim());
  const qTel = f.recherche.replace(/[^\d+]/g, '');
  let min: number | null = null, max: number | null = null;
  if (f.anciennete === 'perso') { min = f.ancienneteMin; max = f.ancienneteMax; }
  else if (f.anciennete) min = Number(f.anciennete);
  return lignes.filter((l) => {
    const c = l.candidat, e = l.evaluation;
    if (!dansVue(l, f.vue)) return false;
    if (f.specialite && (c.specialite ?? '') !== f.specialite) return false;
    if (f.voie && (c.voie ?? '') !== f.voie) return false;
    if (min !== null && e.ancienneteJours <= min - (f.anciennete === 'perso' ? 1 : 0)) return false;
    if (max !== null && e.ancienneteJours > max) return false;
    const jd = jourParis(c.demande_at);
    if (f.demandeDu && jd < f.demandeDu) return false;
    if (f.demandeAu && jd > f.demandeAu) return false;
    if (q) {
      const texte = sansAccents([c.prenom, c.nom, c.prenom && c.nom ? `${c.nom} ${c.prenom}` : '', c.email_actuel, c.auth_email, c.telephone].filter(Boolean).join(' '));
      const tel = (c.telephone ?? '').replace(/[^\d+]/g, '');
      if (!texte.includes(q) && !(qTel.length >= 4 && tel.includes(qTel))) return false;
    }
    return true;
  });
}

function cle(l: LigneEvaluee, col: ColonneTri): string | number {
  const c = l.candidat, e = l.evaluation;
  switch (col) {
    case 'candidat': return sansAccents(`${c.nom ?? ''} ${c.prenom ?? ''} ${c.email_actuel}`);
    case 'specialite': return sansAccents(c.specialite ?? '');
    case 'voie': return sansAccents(c.voie ?? '');
    case 'demande': return c.demande_at;
    case 'connexion': return e.connecteAt ?? '';
    case 'derniere_relance': return e.derniereRelanceAt ?? '';
    case 'prochaine': return e.prochainType ?? 'zz';
    case 'echeance': return e.echeance ?? '9999-99-99';
    case 'statut': return ORDRE_STATUT[e.statut];
    case 'anciennete': return e.ancienneteJours;
  }
}

export function trier(lignes: LigneEvaluee[], col: ColonneTri, sens: 'asc' | 'desc'): LigneEvaluee[] {
  const k = sens === 'asc' ? 1 : -1;
  return [...lignes].sort((a, b) => {
    const va = cle(a, col), vb = cle(b, col);
    const r = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'fr');
    if (r !== 0) return r * k;
    // Tri stable secondaire : statut puis identifiant.
    return ORDRE_STATUT[a.evaluation.statut] - ORDRE_STATUT[b.evaluation.statut] || a.candidat.id.localeCompare(b.candidat.id);
  });
}

export function appliquer(lignes: LigneEvaluee[], f: Filtres): LigneEvaluee[] {
  return trier(filtrer(lignes, f), f.tri, f.sens);
}

/** Sérialisation dans l'URL (export, lien de la bannière). */
export function filtresVersQuery(f: Partial<Filtres>): string {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) {
    if (v === null || v === undefined || v === '') continue;
    if ((FILTRES_DEFAUT as Record<string, unknown>)[k] === v) continue;
    u.set(k, String(v));
  }
  return u.toString();
}

const VUES = new Set<Vue>(Object.keys(VUE_LABEL) as Vue[]);
const TRIS = new Set<ColonneTri>(['candidat', 'specialite', 'voie', 'demande', 'connexion', 'derniere_relance', 'prochaine', 'echeance', 'statut', 'anciennete']);
const JOUR = /^\d{4}-\d{2}-\d{2}$/;

export function filtresDepuisQuery(q: URLSearchParams | Record<string, string | undefined>): Filtres {
  const get = (k: string) => (q instanceof URLSearchParams ? q.get(k) : q[k]) ?? '';
  const num = (k: string) => { const v = get(k); const n = Number(v); return v !== '' && Number.isFinite(n) && n >= 0 ? Math.round(n) : null; };
  const vue = get('vue') as Vue;
  const anc = get('anciennete') as Anciennete;
  const tri = get('tri') as ColonneTri;
  return {
    vue: VUES.has(vue) ? vue : FILTRES_DEFAUT.vue,
    specialite: get('specialite').slice(0, 120),
    voie: get('voie').slice(0, 40),
    anciennete: (['30', '60', '90', '180', 'perso'] as string[]).includes(anc) ? anc : '',
    ancienneteMin: num('ancienneteMin'),
    ancienneteMax: num('ancienneteMax'),
    demandeDu: JOUR.test(get('demandeDu')) ? get('demandeDu') : '',
    demandeAu: JOUR.test(get('demandeAu')) ? get('demandeAu') : '',
    recherche: get('recherche').slice(0, 120),
    tri: TRIS.has(tri) ? tri : FILTRES_DEFAUT.tri,
    sens: get('sens') === 'desc' ? 'desc' : 'asc',
  };
}
