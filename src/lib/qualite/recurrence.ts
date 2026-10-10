import { themeParCle } from './analyse-regles';

/**
 * Détection des problèmes récurrents (§16) — module PUR, testé.
 *
 * Des commentaires portant le même thème (vocabulaire fermé, attribué par les
 * règles, l'IA ou l'administration) sont regroupés, globalement et par
 * enseignant / contenu. Un groupe devient une alerte de récurrence quand le
 * nombre de candidats DISTINCTS atteint le seuil dans la fenêtre (par défaut :
 * trois candidats en 30 jours).
 */

export type CommentaireRecurrence = {
  id: string;
  user_id: string | null;
  theme_cle: string | null;
  sentiment: string | null;
  created_at: string;
  enseignant_cle: string | null;
  enseignant_nom: string | null;
  contenu_id: string | null;
  contenu_label: string | null;
  seance_id: string | null;
};

export type GroupeRecurrence = {
  /** Clé stable du groupe : `theme|portee|cible`. */
  cle: string;
  themeCle: string;
  themeLibelle: string;
  portee: 'global' | 'enseignant' | 'contenu';
  cible: string | null;
  cibleLabel: string | null;
  candidats: number;
  commentaires: string[];
  seances: string[];
  premier: string;
  dernier: string;
  /** Nombre de commentaires par semaine ISO approximative (lundi), du plus ancien au plus récent. */
  evolution: { semaine: string; n: number }[];
  /** Candidats distincts dans la fenêtre de détection. */
  candidatsFenetre: number;
  depasseSeuil: boolean;
};

function lundi(iso: string): string {
  const d = new Date(iso);
  const jour = (d.getUTCDay() + 6) % 7;
  const l = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - jour));
  return l.toISOString().slice(0, 10);
}

export function regrouper(
  commentaires: CommentaireRecurrence[],
  opts: { now: number; seuil: number; fenetreJours: number },
): GroupeRecurrence[] {
  const debutFenetre = opts.now - opts.fenetreJours * 86_400_000;
  const groupes = new Map<string, { base: Omit<GroupeRecurrence, 'candidats' | 'commentaires' | 'seances' | 'premier' | 'dernier' | 'evolution' | 'candidatsFenetre' | 'depasseSeuil'>; items: CommentaireRecurrence[] }>();
  const ajouter = (cle: string, base: { themeCle: string; themeLibelle: string; portee: GroupeRecurrence['portee']; cible: string | null; cibleLabel: string | null }, c: CommentaireRecurrence) => {
    const g = groupes.get(cle) ?? { base: { cle, ...base }, items: [] };
    g.items.push(c);
    groupes.set(cle, g);
  };
  for (const c of commentaires) {
    if (!c.theme_cle || (c.sentiment !== 'negatif' && c.sentiment !== 'mixte')) continue;
    const th = themeParCle(c.theme_cle);
    const themeLibelle = th?.libelle ?? c.theme_cle;
    ajouter(`${c.theme_cle}|global|`, { themeCle: c.theme_cle, themeLibelle, portee: 'global', cible: null, cibleLabel: null }, c);
    if (c.enseignant_cle) {
      ajouter(`${c.theme_cle}|enseignant|${c.enseignant_cle}`, { themeCle: c.theme_cle, themeLibelle, portee: 'enseignant', cible: c.enseignant_cle, cibleLabel: c.enseignant_nom ?? c.enseignant_cle }, c);
    }
    if (c.contenu_id) {
      ajouter(`${c.theme_cle}|contenu|${c.contenu_id}`, { themeCle: c.theme_cle, themeLibelle, portee: 'contenu', cible: c.contenu_id, cibleLabel: c.contenu_label ?? c.contenu_id }, c);
    }
  }
  const out: GroupeRecurrence[] = [];
  for (const { base, items } of groupes.values()) {
    items.sort((a, b) => a.created_at.localeCompare(b.created_at));
    const users = new Set(items.map((i) => i.user_id ?? `anonyme:${i.id}`));
    const fenetre = new Set(items.filter((i) => Date.parse(i.created_at) >= debutFenetre).map((i) => i.user_id ?? `anonyme:${i.id}`));
    const parSemaine = new Map<string, number>();
    for (const i of items) parSemaine.set(lundi(i.created_at), (parSemaine.get(lundi(i.created_at)) ?? 0) + 1);
    out.push({
      ...base,
      candidats: users.size,
      commentaires: items.map((i) => i.id),
      seances: Array.from(new Set(items.map((i) => i.seance_id).filter((s): s is string => !!s))),
      premier: items[0].created_at,
      dernier: items[items.length - 1].created_at,
      evolution: Array.from(parSemaine.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([semaine, n]) => ({ semaine, n })),
      candidatsFenetre: fenetre.size,
      depasseSeuil: fenetre.size >= opts.seuil,
    });
  }
  return out.sort((a, b) => b.candidatsFenetre - a.candidatsFenetre || b.candidats - a.candidats);
}
