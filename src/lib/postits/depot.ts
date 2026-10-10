/* eslint-disable @typescript-eslint/no-explicit-any -- tables `postit*`, `qcm_series` et `videos`
   absentes de l'instantané curaté de `types/database.ts`. */
/**
 * « Mes Post-it » — accès base. Toutes les fonctions reçoivent le client
 * Supabase de l'élève (RLS propriétaire) et son identifiant, et bornent
 * EN PLUS chaque requête par `user_id` : une erreur de politique ne suffirait
 * pas à exposer la note d'un autre élève.
 *
 * Volontairement sans `server-only` ni import Next : les routes API, les pages
 * serveur, le cron et la recette de bout en bout (tmp/_qa-postits, Node pur)
 * appellent les MÊMES fonctions. Ne jamais l'importer depuis un composant
 * client (les règles partagées sont dans `regles.ts`).
 *
 * Indépendance pédagogique (§48) : aucune lecture ni écriture des tables du
 * moteur (pedago_signals, plan_*, candidate_item_state…).
 */
import { fetchAllRows } from '../supabase/fetch-all-pure';
import {
  DIMENSIONS, JOURS_CORBEILLE, LIBELLE_TYPE, RE_DATE, RE_HEURE,
  contexteDeCle, couleurValide, geometrieStockable,
  type ChoixTachesArchivage, type Couleur, type Emplacement, type Geometrie, type Placement,
  type Destination, type Postit, type PreferencesPostit, type Rappel, type Statut, type Tache, type Taille, type TypeEmplacement,
} from './regles';

export type { Destination, PreferencesPostit, Tache };
import { echeanceCoherente, rappelsValides, versTachesAgenda, type LigneTacheAgenda, type TacheAgenda } from './agenda';

export type Db = { from: (table: string) => any };

export class ErreurPostit extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

const COLS_POSTIT = 'id, titre, contenu, couleur, taille, statut, statut_avant_suppression, origine_cle, origine_type, origine_chemin, origine_matiere_id, origine_matiere_nom, origine_cours_id, origine_cours_titre, origine_ressource_id, origine_ressource_titre, archive_le, supprime_le, created_at, updated_at';
const COLS_PLACEMENT = 'id, postit_id, cle, type, matiere_id, matiere_nom, cours_id, cours_titre, ressource_id, ressource_titre, x, y, w, h, z, reduit';
const COLS_TACHE = 'id, postit_id, texte, fait, fait_le, ordre, echeance_date, echeance_heure, rappels, dans_agenda';
const SELECT_COMPLET = `${COLS_POSTIT}, postit_placements(${COLS_PLACEMENT}), postit_taches(${COLS_TACHE})`;

/* ------------------------------------------------------------------ */
/* Lignes → modèle                                                     */
/* ------------------------------------------------------------------ */

type LignePlacement = {
  id: string; postit_id: string; cle: string; type: string;
  matiere_id: string | null; matiere_nom: string | null; cours_id: string | null; cours_titre: string | null;
  ressource_id: string | null; ressource_titre: string | null;
  x: number; y: number; w: number; h: number; z: number; reduit: boolean;
};
type LigneTache = {
  id: string; postit_id: string; texte: string; fait: boolean; fait_le: string | null; ordre: number;
  echeance_date: string | null; echeance_heure: string | null; rappels: string[] | null; dans_agenda: boolean;
};
type LignePostit = {
  id: string; titre: string; contenu: string; couleur: string; taille: string; statut: Statut;
  statut_avant_suppression: 'actif' | 'archive' | null;
  origine_cle: string; origine_type: string; origine_chemin: string | null;
  origine_matiere_id: string | null; origine_matiere_nom: string | null;
  origine_cours_id: string | null; origine_cours_titre: string | null;
  origine_ressource_id: string | null; origine_ressource_titre: string | null;
  archive_le: string | null; supprime_le: string | null; created_at: string; updated_at: string;
  postit_placements?: LignePlacement[] | null;
  postit_taches?: LigneTache[] | null;
};

const typeSur = (t: string): TypeEmplacement => (t in LIBELLE_TYPE ? t as TypeEmplacement : 'item');

function versPlacement(l: LignePlacement): Placement {
  return {
    id: l.id, cle: l.cle, type: typeSur(l.type),
    matiereId: l.matiere_id, matiereNom: l.matiere_nom, coursId: l.cours_id, coursTitre: l.cours_titre,
    ressourceId: l.ressource_id, ressourceTitre: l.ressource_titre,
    x: l.x, y: l.y, w: l.w, h: l.h, z: l.z, reduit: l.reduit,
  };
}

function versTache(l: LigneTache): Tache {
  const h = /^(\d{2}):(\d{2})/.exec(l.echeance_heure ?? '');
  return {
    id: l.id, texte: l.texte, fait: l.fait, faitLe: l.fait_le, ordre: l.ordre,
    date: l.echeance_date ? l.echeance_date.slice(0, 10) : null,
    heure: h ? `${h[1]}:${h[2]}` : null,
    rappels: rappelsValides(l.rappels),
    dansAgenda: l.dans_agenda,
  };
}

export function versPostit(l: LignePostit): Postit {
  return {
    id: l.id,
    titre: l.titre,
    contenu: l.contenu,
    couleur: couleurValide(l.couleur) ? l.couleur : 'jaune',
    taille: (['petit', 'moyen', 'grand', 'libre'].includes(l.taille) ? l.taille : 'moyen') as Taille,
    statut: l.statut,
    creeLe: l.created_at,
    modifieLe: l.updated_at,
    archiveLe: l.archive_le,
    supprimeLe: l.supprime_le,
    origine: {
      cle: l.origine_cle, type: typeSur(l.origine_type), chemin: l.origine_chemin,
      matiereId: l.origine_matiere_id, matiereNom: l.origine_matiere_nom,
      coursId: l.origine_cours_id, coursTitre: l.origine_cours_titre,
      ressourceId: l.origine_ressource_id, ressourceTitre: l.origine_ressource_titre,
    },
    placements: (l.postit_placements ?? []).map(versPlacement).sort((a, b) => a.z - b.z),
    taches: (l.postit_taches ?? []).map(versTache).sort((a, b) => a.ordre - b.ordre || a.id.localeCompare(b.id)),
  };
}

function verifier<T>(r: { data: T; error: { message: string } | null }, contexte: string): T {
  if (r.error) throw new ErreurPostit(`${contexte} : ${r.error.message}`, 500);
  return r.data;
}

/* ------------------------------------------------------------------ */
/* Emplacements : libellés résolus côté serveur (§22)                  */
/* ------------------------------------------------------------------ */

/**
 * Résout une clé d'emplacement en identifiants + libellés. La spécialité et
 * l'item sont lus avec le client de l'ÉLÈVE : la RLS des contenus refuse une
 * page à laquelle il n'a pas accès. Les titres de série / vidéo (tables à RLS
 * restrictive) sont lus avec `contenu` (service), et seulement s'ils
 * appartiennent bien à l'item déjà autorisé.
 */
export async function resoudreEmplacement(db: Db, contenu: Db, cle: string): Promise<Emplacement> {
  const ctx = contexteDeCle(cle);
  if (!ctx) throw new ErreurPostit('Emplacement inconnu.');
  const vide: Emplacement = { cle, type: ctx.type, matiereId: null, matiereNom: null, coursId: null, coursTitre: null, ressourceId: ctx.ressourceId, ressourceTitre: null };
  if (ctx.type === 'accueil') return vide;

  if (ctx.type === 'specialite') {
    const m = verifier(await db.from('matieres').select('id, nom').eq('id', ctx.matiereId).maybeSingle(), 'Spécialité') as { id: string; nom: string } | null;
    if (!m) throw new ErreurPostit('Spécialité introuvable ou inaccessible.', 404);
    return { ...vide, matiereId: m.id, matiereNom: m.nom };
  }

  const c = verifier(
    await db.from('cours').select('id, titre, matiere_id, matieres(id, nom)').eq('id', ctx.coursId).maybeSingle(),
    'Item',
  ) as { id: string; titre: string; matiere_id: string; matieres: { id: string; nom: string } | { id: string; nom: string }[] | null } | null;
  if (!c) throw new ErreurPostit('Item introuvable ou inaccessible.', 404);
  const mat = Array.isArray(c.matieres) ? c.matieres[0] : c.matieres;
  const base: Emplacement = { ...vide, matiereId: c.matiere_id, matiereNom: mat?.nom ?? null, coursId: c.id, coursTitre: c.titre };

  let ressourceTitre: string | null = null;
  if (ctx.type === 'serie' && ctx.ressourceId) {
    const { data: s } = await contenu.from('qcm_series').select('label, vignette, cours_id').eq('id', ctx.ressourceId).maybeSingle();
    if (s && s.cours_id === c.id) ressourceTitre = s.vignette ? `Dossier clinique · ${s.label ?? ''}`.trim() : (s.label ? `QCM · ${s.label}` : null);
  } else if (ctx.type === 'support' && ctx.ressourceId) {
    const { data: v } = await contenu.from('videos').select('titre, cours_id').eq('id', ctx.ressourceId).maybeSingle();
    if (v && v.cours_id === c.id) ressourceTitre = v.titre ? `Support · ${v.titre}` : null;
  } else if (ctx.type === 'annales' && ctx.ressourceId) {
    ressourceTitre = `Annales ${ctx.ressourceId}`;
  }
  return { ...base, ressourceTitre };
}

function colonnesEmplacement(e: Emplacement) {
  return {
    cle: e.cle, type: e.type,
    matiere_id: e.matiereId, matiere_nom: e.matiereNom, cours_id: e.coursId, cours_titre: e.coursTitre,
    ressource_id: e.ressourceId, ressource_titre: e.ressourceTitre,
  };
}

/* ------------------------------------------------------------------ */
/* Lectures                                                            */
/* ------------------------------------------------------------------ */

export async function lirePostit(db: Db, userId: string, id: string): Promise<Postit> {
  const l = verifier(await db.from('postits').select(SELECT_COMPLET).eq('user_id', userId).eq('id', id).maybeSingle(), 'Lecture du Post-it') as LignePostit | null;
  if (!l) throw new ErreurPostit('Post-it introuvable.', 404);
  return versPostit(l);
}

async function lirePlusieurs(db: Db, userId: string, ids: string[]): Promise<Postit[]> {
  const out: Postit[] = [];
  for (let i = 0; i < ids.length; i += 200) {
    const lignes = verifier(await db.from('postits').select(SELECT_COMPLET).eq('user_id', userId).in('id', ids.slice(i, i + 200)), 'Lecture des Post-it') as LignePostit[];
    out.push(...lignes.map(versPostit));
  }
  return out;
}

/** Post-it ACTIFS affichés sur une page (§23 : une requête par page). */
export async function lirePostitsEmplacement(db: Db, userId: string, cle: string): Promise<Postit[]> {
  const pl = verifier(await db.from('postit_placements').select('postit_id').eq('user_id', userId).eq('cle', cle).limit(1000), 'Emplacements') as { postit_id: string }[];
  if (pl.length === 0) return [];
  return (await lirePlusieurs(db, userId, [...new Set(pl.map((p) => p.postit_id))])).filter((p) => p.statut === 'actif');
}

/** Toutes les notes non purgées (bibliothèque, §26). La corbeille échue est purgée d'abord. */
export async function lireBibliotheque(db: Db, userId: string, maintenant = new Date()): Promise<Postit[]> {
  await purgerCorbeille(db, maintenant, userId).catch(() => 0);
  const lignes = await fetchAllRows<LignePostit>((from, to) => db.from('postits').select(SELECT_COMPLET)
    .eq('user_id', userId).order('updated_at', { ascending: false }).order('id').range(from, to));
  return lignes.map(versPostit);
}

/** Post-it d'un item, archivés compris (§32). */
export async function lirePostitsCours(db: Db, userId: string, coursId: string): Promise<Postit[]> {
  const [origine, pl] = await Promise.all([
    db.from('postits').select('id').eq('user_id', userId).eq('origine_cours_id', coursId).neq('statut', 'supprime').limit(1000),
    db.from('postit_placements').select('postit_id').eq('user_id', userId).eq('cours_id', coursId).limit(1000),
  ]);
  const ids = new Set<string>([
    ...((verifier(origine, 'Post-it de l’item') ?? []) as { id: string }[]).map((r) => r.id),
    ...((verifier(pl, 'Post-it de l’item') ?? []) as { postit_id: string }[]).map((r) => r.postit_id),
  ]);
  if (ids.size === 0) return [];
  return (await lirePlusieurs(db, userId, [...ids])).filter((p) => p.statut !== 'supprime');
}

/* ------------------------------------------------------------------ */
/* Écritures : la note                                                 */
/* ------------------------------------------------------------------ */

async function toucher(db: Db, userId: string, id: string, champs: Record<string, unknown> = {}) {
  verifier(await db.from('postits').update({ ...champs, updated_at: new Date().toISOString() }).eq('user_id', userId).eq('id', id), 'Mise à jour du Post-it');
}

async function exiger(db: Db, userId: string, id: string): Promise<{ id: string; statut: Statut; origine_cle: string }> {
  const r = verifier(await db.from('postits').select('id, statut, origine_cle').eq('user_id', userId).eq('id', id).maybeSingle(), 'Post-it') as { id: string; statut: Statut; origine_cle: string } | null;
  if (!r) throw new ErreurPostit('Post-it introuvable.', 404);
  return r;
}

export type NouveauPostit = {
  cle: string;
  chemin?: string | null;
  titre?: string;
  contenu?: string;
  couleur?: Couleur;
  taille?: Taille;
  geometrie?: Partial<Geometrie>;
  taches?: { texte: string; date?: string | null; heure?: string | null; rappels?: Rappel[] }[];
};

/** Création sur une page : l'origine est figée, la note y est placée (§22, §25). */
export async function creerPostit(db: Db, contenu: Db, userId: string, n: NouveauPostit): Promise<Postit> {
  const e = await resoudreEmplacement(db, contenu, n.cle);
  const taille = n.taille ?? 'moyen';
  const dims = taille === 'libre' ? DIMENSIONS.moyen : DIMENSIONS[taille];
  const g = geometrieStockable({ x: 40, y: 120, ...dims, ...(n.geometrie ?? {}) });
  const p = verifier(await db.from('postits').insert({
    user_id: userId,
    titre: (n.titre ?? '').slice(0, 200),
    contenu: (n.contenu ?? '').slice(0, 20000),
    couleur: n.couleur ?? 'jaune',
    taille,
    origine_cle: e.cle,
    origine_type: e.type,
    origine_chemin: n.chemin?.slice(0, 500) ?? null,
    origine_matiere_id: e.matiereId,
    origine_matiere_nom: e.matiereNom,
    origine_cours_id: e.coursId,
    origine_cours_titre: e.coursTitre,
    origine_ressource_id: e.ressourceId,
    origine_ressource_titre: e.ressourceTitre,
  }).select('id').single(), 'Création du Post-it') as { id: string };
  verifier(await db.from('postit_placements').insert({ postit_id: p.id, user_id: userId, ...colonnesEmplacement(e), ...g, z: Date.now() % 1_000_000 }), 'Placement du Post-it');
  for (const [i, t] of (n.taches ?? []).entries()) {
    await ajouterTache(db, userId, p.id, { ...t, ordre: i }, { sansToucher: true });
  }
  return lirePostit(db, userId, p.id);
}

export type PatchPostit = { titre?: string; contenu?: string; couleur?: Couleur; taille?: Taille };

export async function modifierPostit(db: Db, userId: string, id: string, patch: PatchPostit): Promise<Postit> {
  await exiger(db, userId, id);
  const champs: Record<string, unknown> = {};
  if (patch.titre != null) champs.titre = patch.titre.slice(0, 200);
  if (patch.contenu != null) champs.contenu = patch.contenu.slice(0, 20000);
  if (patch.couleur != null) champs.couleur = patch.couleur;
  if (patch.taille != null) champs.taille = patch.taille;
  await toucher(db, userId, id, champs);
  return lirePostit(db, userId, id);
}

/** Position, dimensions, premier plan, état réduit d'un placement (§23). */
export async function placer(
  db: Db, userId: string, placementId: string,
  g: Partial<Geometrie> & { z?: number; reduit?: boolean; taille?: Taille },
): Promise<void> {
  const champs: Record<string, unknown> = { ...geometrieStockable(g) };
  if (g.z != null) champs.z = Math.round(g.z) % 2_000_000_000;
  if (g.reduit != null) champs.reduit = g.reduit;
  const r = verifier(await db.from('postit_placements').update(champs).eq('user_id', userId).eq('id', placementId).select('postit_id'), 'Placement') as { postit_id: string }[];
  if (r.length === 0) throw new ErreurPostit('Placement introuvable.', 404);
  if (g.taille) verifier(await db.from('postits').update({ taille: g.taille }).eq('user_id', userId).eq('id', r[0].postit_id), 'Taille');
}

async function placementsDe(db: Db, userId: string, postitId: string): Promise<LignePlacement[]> {
  return verifier(await db.from('postit_placements').select(COLS_PLACEMENT).eq('user_id', userId).eq('postit_id', postitId), 'Emplacements') as LignePlacement[];
}

/**
 * « Déplacer vers l'accueil / vers une autre page » (§24) : le placement
 * quitte `depuis` pour `vers` en gardant sa position et sa taille. Sans
 * `depuis` (note rangée), la note est simplement posée sur `vers`.
 */
export async function deplacer(db: Db, contenu: Db, userId: string, postitId: string, depuis: string | null, vers: string): Promise<Postit> {
  await exiger(db, userId, postitId);
  if (depuis === vers) return lirePostit(db, userId, postitId);
  const e = await resoudreEmplacement(db, contenu, vers);
  const actuels = await placementsDe(db, userId, postitId);
  const source = depuis ? actuels.find((p) => p.cle === depuis) : undefined;
  const dejaLa = actuels.find((p) => p.cle === vers);
  if (dejaLa) {
    if (source) verifier(await db.from('postit_placements').delete().eq('user_id', userId).eq('id', source.id), 'Déplacement');
  } else if (source) {
    verifier(await db.from('postit_placements').update(colonnesEmplacement(e)).eq('user_id', userId).eq('id', source.id), 'Déplacement');
  } else {
    await inserePlacement(db, userId, postitId, e, actuels[0]);
  }
  await toucher(db, userId, postitId);
  return lirePostit(db, userId, postitId);
}

async function inserePlacement(db: Db, userId: string, postitId: string, e: Emplacement, modele?: LignePlacement) {
  const g = modele ? { x: modele.x, y: modele.y, w: modele.w, h: modele.h } : { x: 48, y: 128, ...DIMENSIONS.moyen };
  verifier(await db.from('postit_placements').upsert(
    { postit_id: postitId, user_id: userId, ...colonnesEmplacement(e), ...geometrieStockable(g), z: Date.now() % 1_000_000 },
    { onConflict: 'postit_id,cle', ignoreDuplicates: true },
  ), 'Placement');
}

/** « Afficher aussi sur l'accueil » (§24) : un placement de plus, aucune copie de la note. */
export async function ajouterPlacement(db: Db, contenu: Db, userId: string, postitId: string, vers: string): Promise<Postit> {
  await exiger(db, userId, postitId);
  const e = await resoudreEmplacement(db, contenu, vers);
  const actuels = await placementsDe(db, userId, postitId);
  if (!actuels.some((p) => p.cle === vers)) await inserePlacement(db, userId, postitId, e, actuels[0]);
  return lirePostit(db, userId, postitId);
}

/** Retire la note d'UNE page ; refusé pour son dernier emplacement (l'archiver plutôt). */
export async function retirerPlacement(db: Db, userId: string, postitId: string, cle: string): Promise<Postit> {
  const actuels = await placementsDe(db, userId, postitId);
  const cible = actuels.find((p) => p.cle === cle);
  if (!cible) throw new ErreurPostit('Ce Post-it n’est pas affiché sur cette page.', 404);
  if (actuels.length <= 1) throw new ErreurPostit('C’est son seul emplacement : archivez le Post-it pour le retirer.');
  verifier(await db.from('postit_placements').delete().eq('user_id', userId).eq('id', cible.id), 'Retrait');
  return lirePostit(db, userId, postitId);
}

/* ------------------------------------------------------------------ */
/* Cycle de vie (§29, §30, §47)                                        */
/* ------------------------------------------------------------------ */

export async function archiver(db: Db, userId: string, id: string, choix: ChoixTachesArchivage): Promise<Postit> {
  const p = await exiger(db, userId, id);
  if (p.statut === 'supprime') throw new ErreurPostit('Restaurez d’abord ce Post-it depuis la corbeille.');
  const maintenant = new Date().toISOString();
  await toucher(db, userId, id, { statut: 'archive', archive_le: maintenant });
  // « Archiver également les tâches » : elles quittent l'agenda (cf. tachesApresArchivage).
  if (choix === 'archiver') {
    verifier(await db.from('postit_taches').update({ dans_agenda: false, updated_at: maintenant }).eq('user_id', userId).eq('postit_id', id), 'Tâches archivées');
  }
  return lirePostit(db, userId, id);
}

/**
 * Restauration (§30) : depuis les archives → actif (tâches rendues à
 * l'agenda) ; depuis la corbeille → l'état d'avant suppression. `vers` :
 * re-placer la note sur l'accueil ou une page. Une note active sans aucun
 * emplacement est reposée sur sa page d'origine (à défaut : l'accueil).
 */
export async function restaurer(db: Db, contenu: Db, userId: string, id: string, vers?: string | null): Promise<Postit> {
  const l = verifier(await db.from('postits').select('id, statut, statut_avant_suppression, origine_cle').eq('user_id', userId).eq('id', id).maybeSingle(), 'Post-it') as
    { id: string; statut: Statut; statut_avant_suppression: 'actif' | 'archive' | null; origine_cle: string } | null;
  if (!l) throw new ErreurPostit('Post-it introuvable.', 404);
  const maintenant = new Date().toISOString();
  let statut: Statut = 'actif';
  if (l.statut === 'supprime') {
    statut = vers ? 'actif' : (l.statut_avant_suppression ?? 'actif');
    await toucher(db, userId, id, { statut, supprime_le: null, statut_avant_suppression: null, ...(statut === 'actif' ? { archive_le: null } : {}) });
  } else {
    await toucher(db, userId, id, { statut: 'actif', archive_le: null });
  }
  if (statut === 'actif') {
    verifier(await db.from('postit_taches').update({ dans_agenda: true, updated_at: maintenant }).eq('user_id', userId).eq('postit_id', id).eq('dans_agenda', false), 'Tâches restaurées');
    const actuels = await placementsDe(db, userId, id);
    const cible = vers ?? (actuels.length === 0 ? l.origine_cle : null);
    if (cible && !actuels.some((p) => p.cle === cible)) {
      const e = await resoudreEmplacement(db, contenu, cible).catch(() => resoudreEmplacement(db, contenu, 'accueil'));
      await inserePlacement(db, userId, id, e, actuels[0]);
    }
  }
  return lirePostit(db, userId, id);
}

/** Mise à la corbeille (§30) : restaurable 30 jours, tâches hors de l'agenda. */
export async function supprimer(db: Db, userId: string, id: string): Promise<Postit> {
  const p = await exiger(db, userId, id);
  if (p.statut !== 'supprime') {
    await toucher(db, userId, id, { statut: 'supprime', statut_avant_suppression: p.statut, supprime_le: new Date().toISOString() });
  }
  return lirePostit(db, userId, id);
}

/**
 * Purge définitive des notes supprimées depuis plus de 30 jours (cascade :
 * placements, tâches, marqueurs de rappels). Appelée par le cron
 * /api/cron/postits (tous les élèves, client service) et, par opportunisme,
 * à l'ouverture de la bibliothèque (l'élève seul).
 */
export async function purgerCorbeille(db: Db, maintenant = new Date(), userId?: string): Promise<number> {
  const limite = new Date(maintenant.getTime() - JOURS_CORBEILLE * 86_400_000).toISOString();
  let q = db.from('postits').delete().eq('statut', 'supprime').lt('supprime_le', limite);
  if (userId) q = q.eq('user_id', userId);
  const r = verifier(await q.select('id'), 'Purge de la corbeille') as { id: string }[] | null;
  return r?.length ?? 0;
}

/* ------------------------------------------------------------------ */
/* Tâches (§23, §37-42)                                                */
/* ------------------------------------------------------------------ */

export type NouvelleTache = { texte: string; date?: string | null; heure?: string | null; rappels?: Rappel[]; ordre?: number };

function validerEcheance(date: string | null | undefined, heure: string | null | undefined) {
  if (date != null && !RE_DATE.test(date)) throw new ErreurPostit('Date invalide.');
  if (heure != null && !RE_HEURE.test(heure)) throw new ErreurPostit('Heure invalide.');
  return echeanceCoherente(date ?? null, heure ?? null);
}

export async function ajouterTache(db: Db, userId: string, postitId: string, t: NouvelleTache, opts: { sansToucher?: boolean } = {}): Promise<Tache> {
  await exiger(db, userId, postitId);
  const texte = t.texte.trim().slice(0, 500);
  if (!texte) throw new ErreurPostit('La tâche est vide.');
  const { date, heure } = validerEcheance(t.date, t.heure);
  let ordre = t.ordre;
  if (ordre == null) {
    const { data } = await db.from('postit_taches').select('ordre').eq('user_id', userId).eq('postit_id', postitId).order('ordre', { ascending: false }).limit(1);
    ordre = ((data?.[0]?.ordre as number | undefined) ?? -1) + 1;
  }
  const l = verifier(await db.from('postit_taches').insert({
    postit_id: postitId, user_id: userId, texte, ordre,
    echeance_date: date, echeance_heure: heure, rappels: rappelsValides(t.rappels ?? []),
  }).select(COLS_TACHE).single(), 'Ajout de la tâche') as LigneTache;
  if (!opts.sansToucher) await toucher(db, userId, postitId);
  return versTache(l);
}

export type PatchTache = { texte?: string; fait?: boolean; date?: string | null; heure?: string | null; rappels?: Rappel[]; ordre?: number };

/**
 * Modification d'une tâche — depuis le Post-it OU depuis l'agenda : c'est la
 * même ligne (§40). Cocher la marque « Terminée » partout (§41) ; changer la
 * date ou l'heure la déplace dans l'agenda et réarme ses rappels (§42, §45).
 */
export async function modifierTache(db: Db, userId: string, tacheId: string, patch: PatchTache): Promise<Tache> {
  const avant = verifier(await db.from('postit_taches').select(COLS_TACHE).eq('user_id', userId).eq('id', tacheId).maybeSingle(), 'Tâche') as LigneTache | null;
  if (!avant) throw new ErreurPostit('Tâche introuvable.', 404);
  const maintenant = new Date().toISOString();
  const champs: Record<string, unknown> = { updated_at: maintenant };
  if (patch.texte != null) {
    const texte = patch.texte.trim().slice(0, 500);
    if (!texte) throw new ErreurPostit('La tâche est vide.');
    champs.texte = texte;
  }
  if (patch.fait != null && patch.fait !== avant.fait) {
    champs.fait = patch.fait;
    champs.fait_le = patch.fait ? maintenant : null;
  }
  if (patch.ordre != null) champs.ordre = Math.round(patch.ordre);
  if (patch.date !== undefined || patch.heure !== undefined) {
    const ancienneHeure = avant.echeance_heure ? avant.echeance_heure.slice(0, 5) : null;
    const { date, heure } = validerEcheance(
      patch.date !== undefined ? patch.date : avant.echeance_date,
      patch.heure !== undefined ? patch.heure : ancienneHeure,
    );
    champs.echeance_date = date;
    champs.echeance_heure = heure;
    champs.echeance_modifiee_le = maintenant;
  }
  if (patch.rappels != null) {
    champs.rappels = rappelsValides(patch.rappels);
    champs.echeance_modifiee_le = maintenant;
  }
  const l = verifier(await db.from('postit_taches').update(champs).eq('user_id', userId).eq('id', tacheId).select(COLS_TACHE).single(), 'Modification de la tâche') as LigneTache;
  await toucher(db, userId, avant.postit_id);
  return versTache(l);
}

export async function supprimerTache(db: Db, userId: string, tacheId: string): Promise<void> {
  const r = verifier(await db.from('postit_taches').delete().eq('user_id', userId).eq('id', tacheId).select('postit_id'), 'Suppression de la tâche') as { postit_id: string }[];
  if (r.length === 0) throw new ErreurPostit('Tâche introuvable.', 404);
  await toucher(db, userId, r[0].postit_id);
}

/* ------------------------------------------------------------------ */
/* Agenda (§38-44)                                                     */
/* ------------------------------------------------------------------ */

/** Tâches datées de l'élève sur une fenêtre (bornes incluses, AAAA-MM-JJ). */
export async function tachesAgenda(db: Db, userId: string, debut: string, fin: string): Promise<TacheAgenda[]> {
  const lignes = await fetchAllRows<LigneTacheAgenda>((from, to) => db.from('postit_taches')
    .select('id, postit_id, texte, fait, echeance_date, echeance_heure, rappels, dans_agenda, postits!inner(titre, couleur, statut, origine_cle, origine_type, origine_matiere_nom, origine_cours_id, origine_cours_titre, origine_ressource_titre)')
    .eq('user_id', userId)
    .eq('dans_agenda', true)
    .neq('postits.statut', 'supprime')
    .gte('echeance_date', debut).lte('echeance_date', fin)
    .order('echeance_date').order('id')
    .range(from, to));
  return versTachesAgenda(lignes);
}

/* ------------------------------------------------------------------ */
/* Préférences (§45)                                                   */
/* ------------------------------------------------------------------ */

export async function lirePreferencesPostit(db: Db, userId: string): Promise<PreferencesPostit> {
  const { data } = await db.from('postit_preferences').select('rappels_actifs').eq('user_id', userId).maybeSingle();
  return { rappelsActifs: data?.rappels_actifs !== false };
}

export async function ecrirePreferencesPostit(db: Db, userId: string, p: PreferencesPostit): Promise<PreferencesPostit> {
  verifier(await db.from('postit_preferences').upsert({ user_id: userId, rappels_actifs: p.rappelsActifs, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }), 'Préférences');
  return p;
}

/* ------------------------------------------------------------------ */
/* Destinations (« Déplacer vers une autre page », §24)                */
/* ------------------------------------------------------------------ */

/** Spécialités et items accessibles à l'élève (RLS des contenus), plateforme Major ECN. */
export async function destinations(db: Db, faculteId: string): Promise<Destination[]> {
  const mats = await fetchAllRows<{ id: string; nom: string; order_index: number; semestres: { faculte_id: string } | null }>((from, to) => db.from('matieres')
    .select('id, nom, order_index, semestres!inner(faculte_id)').eq('semestres.faculte_id', faculteId)
    .order('order_index').order('id').range(from, to));
  const ids = mats.map((m) => m.id);
  if (ids.length === 0) return [];
  const cours: { id: string; titre: string; matiere_id: string; order_index: number }[] = [];
  for (let i = 0; i < ids.length; i += 100) {
    const tranche = ids.slice(i, i + 100);
    cours.push(...await fetchAllRows<{ id: string; titre: string; matiere_id: string; order_index: number }>((from, to) => db.from('cours')
      .select('id, titre, matiere_id, order_index').in('matiere_id', tranche).order('order_index').order('id').range(from, to)));
  }
  const parMatiere = new Map<string, { id: string; titre: string }[]>();
  for (const c of cours) {
    const l = parMatiere.get(c.matiere_id) ?? [];
    l.push({ id: c.id, titre: c.titre });
    parMatiere.set(c.matiere_id, l);
  }
  return mats.map((m) => ({ id: m.id, nom: m.nom, items: parMatiere.get(m.id) ?? [] }));
}

