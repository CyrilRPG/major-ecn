/**
 * Recherche plein texte — outils PURS (testés) : requête PostgreSQL et
 * extrait avec mise en évidence des termes (CDC §36, §124, §126).
 */
import { normaliserTexte } from './regles';

const MOTS_VIDES = new Set(['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'a', 'au', 'aux', 'en', 'pour', 'par', 'sur', 'dans', 'est', 'que', 'qui', 'quoi', 'ce', 'cette', 'il', 'elle', 'on', 'je', 'tu', 'nous', 'vous']);

export type RequeteAnalysee = {
  termes: string[];
  /** Requête to_tsquery (préfixes, tous les termes requis) ; null si aucun terme utile. */
  tsquery: string | null;
  /** « Item 231 » ou « item231 » : filtre sur le numéro d'item (§126). */
  item: number | null;
};

export function analyserRequete(q: string): RequeteAnalysee {
  const brut = normaliserTexte(q ?? '').slice(0, 200);
  let item: number | null = null;
  const mItem = /\bitem\s*0*(\d{1,4})\b/.exec(brut);
  let reste = brut;
  if (mItem) {
    item = Number(mItem[1]);
    reste = brut.replace(mItem[0], ' ');
  }
  const termes = [...new Set(reste.split(/[^a-z0-9]+/).filter((t) => t.length >= 2 && !MOTS_VIDES.has(t)))].slice(0, 8);
  return { termes, tsquery: termes.length ? termes.map((t) => `${t}:*`).join(' & ') : null, item };
}

/** Racine approximative d'un terme (pour la mise en évidence des mots fléchis). */
function racine(t: string): string {
  if (t.length <= 4) return t;
  return t.slice(0, Math.max(4, t.length - 2));
}

/**
 * Extrait centré sur la première occurrence, segmenté en parties normales et
 * parties mises en évidence. Aucun HTML : l'interface affiche des segments.
 */
export function extraitSurligne(texte: string, termes: string[], longueur = 220): { t: string; fort: boolean }[] {
  const s = (texte ?? '').replace(/\s+/g, ' ').trim();
  if (!s) return [];
  const racines = termes.map(racine).filter(Boolean);
  const mots = s.split(/(\s+)/);
  const estFort = (mot: string) => {
    const n = normaliserTexte(mot).replace(/[^a-z0-9]/g, '');
    return n.length > 0 && racines.some((r) => n.startsWith(r));
  };
  let debutCar = 0;
  const premier = mots.findIndex((m) => estFort(m));
  if (premier > 0) {
    const avant = mots.slice(0, premier).join('');
    debutCar = Math.max(0, avant.length - Math.floor(longueur / 3));
  }
  let fen = s.slice(debutCar, debutCar + longueur);
  if (debutCar > 0) fen = `…${fen.replace(/^\S*\s/, '')}`;
  if (debutCar + longueur < s.length) fen = `${fen.replace(/\s\S*$/, '')}…`;
  const segs: { t: string; fort: boolean }[] = [];
  for (const m of fen.split(/(\s+)/)) {
    const fort = !/^\s+$/.test(m) && estFort(m);
    const last = segs.at(-1);
    if (last && last.fort === fort) last.t += m;
    else segs.push({ t: m, fort });
  }
  return segs;
}
