import 'server-only';
import { analyserRequete, extraitSurligne } from '../recherche-texte';
import { rangRecherche, type ModeAffichageEleve } from '../regles';
import type { BibliothequeDTO, ResultatRechercheDTO, TypeAuteur } from '../types';
import { groupesAccessibles, type Acteur } from './acces';
import { db, FACULTE, parametres } from './base';
import { resoudreAuteurs } from './identites';

/**
 * Recherche dans les Échanges (CDC §36-38, §123-126) — uniquement dans les
 * groupes accessibles à la personne (R31, R34). L'équipe peut y inclure les
 * promotions archivées (R33). Index GIN plein texte (pas de parcours naïf,
 * §91). Classement : bibliothèque, épinglés, réponses enseignants, autres.
 */

export type FiltresRecherche = {
  q: string;
  groupeId?: string | null;
  type?: 'tous' | 'enseignants' | 'importants' | 'pieces';
  auteur?: 'tous' | 'moi' | 'candidats' | 'enseignants' | 'equipe';
  specialiteId?: string | null;
  item?: number | null;
  depuis?: string | null;
  jusqua?: string | null;
  archives?: boolean;
  bibliotheque?: boolean;
};

export async function rechercher(acteur: Acteur, f: FiltresRecherche): Promise<{ resultats: ResultatRechercheDTO[]; total: number }> {
  const prm = await parametres();
  const req = analyserRequete(f.q);
  const item = f.item ?? req.item;
  if (!req.tsquery && !item && f.type !== 'importants' && f.type !== 'pieces') return { resultats: [], total: 0 };

  const acces = (await groupesAccessibles(acteur, { inclureArchives: !!f.archives && acteur.niveau !== null })).filter((a) => a.droits.lire);
  const groupes = f.groupeId ? acces.filter((a) => a.groupe.id === f.groupeId) : acces;
  const resultats: (ResultatRechercheDTO & { rang: number })[] = [];

  if (groupes.length > 0) {
    let q = db().from('echanges_messages')
      .select('id, groupe_id, canal, auteur_id, auteur_type, contenu, created_at, epingle_at, nb_pieces_jointes, item_numero, contexte')
      .in('groupe_id', groupes.map((a) => a.groupe.id))
      .eq('statut', 'publie').is('supprime_at', null)
      .order('created_at', { ascending: false }).limit(150);
    if (req.tsquery) q = q.textSearch('recherche', req.tsquery, { config: 'french' });
    if (item) q = q.eq('item_numero', item);
    if (f.type === 'enseignants') q = q.in('auteur_type', ['enseignant', 'equipe']);
    if (f.type === 'importants') q = q.not('epingle_at', 'is', null);
    if (f.type === 'pieces') q = q.gt('nb_pieces_jointes', 0);
    if (f.auteur === 'moi') q = q.eq('auteur_id', acteur.id);
    if (f.auteur === 'candidats') q = q.eq('auteur_type', 'candidat');
    if (f.auteur === 'enseignants') q = q.eq('auteur_type', 'enseignant');
    if (f.auteur === 'equipe') q = q.eq('auteur_type', 'equipe');
    if (f.specialiteId) q = q.eq('specialite_id', f.specialiteId);
    if (f.depuis) q = q.gte('created_at', f.depuis);
    if (f.jusqua) q = q.lte('created_at', f.jusqua);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    type R = { id: string; groupe_id: string; canal: 'discussion' | 'annonces'; auteur_id: string | null; auteur_type: TypeAuteur; contenu: string | null; created_at: string; epingle_at: string | null; nb_pieces_jointes: number; item_numero: number | null; contexte: { titre?: string } | null };
    const rows = (data ?? []) as R[];
    const parGroupe = new Map<string, R[]>();
    for (const r of rows) parGroupe.set(r.groupe_id, [...(parGroupe.get(r.groupe_id) ?? []), r]);
    for (const [gid, lot] of parGroupe) {
      const a = groupes.find((x) => x.groupe.id === gid)!;
      const auteurs = await resoudreAuteurs({ topic: a.groupe.topic, groupeId: gid, acteurId: acteur.id, auteurs: lot.map((r) => ({ id: r.auteur_id, type: r.auteur_type })), mode: prm.affichage_eleves as ModeAffichageEleve });
      for (const r of lot) {
        const au = auteurs.get(`${r.auteur_type}:${r.auteur_id ?? ''}`);
        resultats.push({
          source: 'message', id: r.id, groupeId: gid, groupeNom: a.groupe.nom, canal: r.canal,
          auteur: au ? (au.qualite ? `${au.nom} · ${au.qualite}` : au.nom) : '',
          auteurType: r.auteur_type, at: r.created_at,
          extrait: extraitSurligne(r.contenu ?? '', req.termes),
          epingle: !!r.epingle_at, pieces: r.nb_pieces_jointes, itemNumero: r.item_numero, titre: r.contexte?.titre ?? null,
          rang: rangRecherche({ source: 'message', epingle: !!r.epingle_at, auteurType: r.auteur_type }),
        });
      }
    }
  }

  // Bibliothèque pédagogique (§34-35, §123) : en tête des résultats.
  if (f.bibliotheque !== false && f.type !== 'pieces' && f.auteur !== 'moi' && f.auteur !== 'candidats') {
    const biblio = await rechercherBibliotheque(acteur, { q: f.q, item, specialiteId: f.specialiteId ?? null, limite: 20 });
    for (const b of biblio) {
      resultats.push({
        source: 'bibliotheque', id: b.id, groupeId: null, groupeNom: 'Réponses des enseignants', canal: null,
        auteur: b.enseignant ?? 'Enseignant Major ECN', auteurType: 'enseignant', at: b.misAJourAt,
        extrait: extraitSurligne(`${b.question ? `${b.question} — ` : ''}${b.reponse}`, req.termes),
        epingle: true, pieces: 0, itemNumero: b.itemNumero, titre: b.titre, rang: 0,
      });
    }
  }

  resultats.sort((a, b) => a.rang - b.rang || (a.at < b.at ? 1 : -1));
  return { resultats: resultats.slice(0, 80).map((x) => { const { rang, ...y } = x; void rang; return y; }), total: resultats.length };
}

/* ─────────────────────── Bibliothèque pédagogique (§35) ─────────────────────── */

/** Spécialités dont la bibliothèque est ouverte à la personne (via ses groupes). */
async function specialitesBibliotheque(acteur: Acteur): Promise<{ toutes: boolean; ids: string[] }> {
  if (acteur.niveau !== null) return { toutes: true, ids: [] };
  const acces = (await groupesAccessibles(acteur)).filter((a) => a.droits.lire && a.groupe.bibliotheque_acces);
  if (acces.length === 0) return { toutes: false, ids: [] };
  const ids = new Set<string>();
  for (const a of acces) {
    if (a.groupe.specialite_id) ids.add(a.groupe.specialite_id);
    const c = a.groupe.criteres as { specialites?: string[] } | null;
    for (const s of c?.specialites ?? []) ids.add(s);
  }
  return { toutes: false, ids: [...ids] };
}

export async function rechercherBibliotheque(acteur: Acteur, f: { q?: string; item?: number | null; specialiteId?: string | null; limite?: number }): Promise<BibliothequeDTO[]> {
  const portee = await specialitesBibliotheque(acteur);
  if (!portee.toutes && portee.ids.length === 0) return [];
  const req = analyserRequete(f.q ?? '');
  let q = db().from('echanges_bibliotheque')
    .select('id, titre, question, question_auteur, reponse, enseignant_label, specialite_id, specialite_nom, item_numero, item_titre, valide_label, valide_at, updated_at')
    .eq('faculte_id', FACULTE).eq('publie', true).order('updated_at', { ascending: false }).limit(f.limite ?? 100);
  if (req.tsquery) q = q.textSearch('recherche', req.tsquery, { config: 'french' });
  const item = f.item ?? req.item;
  if (item) q = q.eq('item_numero', item);
  if (f.specialiteId) q = q.eq('specialite_id', f.specialiteId);
  // Ressources transversales (sans spécialité) + celles des spécialités de la personne.
  if (!portee.toutes) q = q.or(`specialite_id.is.null,specialite_id.in.(${portee.ids.map((x) => `"${x}"`).join(',')})`);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return ((data ?? []) as {
    id: string; titre: string; question: string | null; question_auteur: string; reponse: string; enseignant_label: string | null;
    specialite_nom: string | null; item_numero: number | null; item_titre: string | null; valide_label: string; valide_at: string; updated_at: string;
  }[]).map((b) => ({
    id: b.id, titre: b.titre, question: b.question, questionAuteur: b.question_auteur, reponse: b.reponse,
    enseignant: b.enseignant_label, specialiteNom: b.specialite_nom, itemNumero: b.item_numero, itemTitre: b.item_titre,
    valideLabel: b.valide_label, valideAt: b.valide_at, misAJourAt: b.updated_at,
  }));
}

/* ─────────────────────── Réponses importantes d'un groupe (§33) ─────────────────────── */

export type FiltresEpingles = { groupeId: string; q?: string; enseignant?: string | null; specialiteId?: string | null; item?: number | null; depuis?: string | null; jusqua?: string | null };
