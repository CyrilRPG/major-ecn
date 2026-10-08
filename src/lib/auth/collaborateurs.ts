import { CONTENT_TYPES, QCM_KINDS, type ContentType, type PermissionLevel } from '@/lib/schemas/professor';
import type { Offer } from '@/types/domain';
import { parseScope, scopeOffers } from './permissions';

/**
 * Gestion des accès collaborateurs — cahier des charges du 18/09/2026.
 *
 * Trois dimensions, et trois seulement : UTILISATEUR → PERMISSIONS → PÉRIMÈTRE.
 * On ne code jamais « Paul est commercial » ; on code « Paul possède les
 * permissions A + B + C sur le périmètre X ». Les permissions sont CUMULABLES
 * (suivi élèves, contenus/vidéos, blog), chacune découpée en droits fins ; le
 * périmètre borne les spécialités, les formules à l'intérieur de chaque
 * spécialité, et la population d'élèves visible.
 *
 * Stockage : `profiles.permission_scope` d'un compte de rôle base `professor`
 * (= tout membre du personnel qui n'est pas administrateur ; le nom du rôle
 * en base est historique). Les champs historiques `type / colleges / cours /
 * content_permissions` — lus par toute la plateforme (RLS, gardes, éditeur de
 * contenu) — sont DÉRIVÉS des modules et réécrits à chaque enregistrement :
 * l'existant continue de fonctionner sans savoir que ce moteur existe.
 *
 * Module PUR (importable côté client pour les formulaires) : aucune lecture
 * base ici. Les zones sensibles (paiements, facturation, configuration,
 * création d'administrateurs) restent réservées au rôle `admin`, quel que soit
 * le cumul de permissions — cf. cahier §7.
 */

export type Formule = 'essentiel' | 'intensif' | 'approfondi';
export const FORMULES: readonly Formule[] = ['essentiel', 'intensif', 'approfondi'];
export const FORMULE_LABEL: Record<Formule, string> = {
  essentiel: 'Essentielle',
  intensif: 'Intensive',
  approfondi: 'Approfondie',
};

/** Population visible dans le suivi élèves (cahier §2). */
export type PopulationSuivi = 'tous' | 'alertes' | 'affectes';
export const POPULATION_LABEL: Record<PopulationSuivi, string> = {
  tous: 'Tous les élèves du périmètre',
  alertes: 'Uniquement les élèves ayant une alerte',
  affectes: 'Uniquement les élèves qui lui sont affectés',
};

export type ModuleSuivi = {
  actif: boolean;
  /** Renseigner des comptes rendus, statuts et relances. */
  rediger: boolean;
  /** Campagnes, créneaux, alertes, réglages du module de suivi. */
  gerer: boolean;
  population: PopulationSuivi;
};

export type DroitContenu = 'creer' | 'modifier' | 'publier' | 'supprimer';
export type ModuleContenus = {
  actif: boolean;
  creer: boolean;
  modifier: boolean;
  publier: boolean;
  supprimer: boolean;
  /** Types de contenu concernés (vidéos, fiches, QCM…). */
  types: ContentType[];
};

export type DroitBlog = 'creer' | 'modifier_siens' | 'modifier_tous' | 'publier' | 'depublier' | 'supprimer';
export type ModuleBlog = {
  actif: boolean;
  creer: boolean;
  modifier_siens: boolean;
  modifier_tous: boolean;
  publier: boolean;
  depublier: boolean;
  supprimer: boolean;
};

/**
 * Agenda des cours en direct (demande de Cyril, 08/10/2026) : créer, modifier
 * et supprimer les évènements de /admin/agenda, y déposer les liens de visio
 * et les informations pour les élèves. Aucun autre accès.
 */
export type ModuleAgenda = { actif: boolean };

export type Modules = { suivi: ModuleSuivi; contenus: ModuleContenus; blog: ModuleBlog; agenda: ModuleAgenda };

/**
 * Périmètre : spécialités autorisées (identifiants de collèges, ou toutes),
 * et formules autorisées par spécialité — `'*'` porte le défaut, une clé par
 * collège le surcharge.
 */
export type Perimetre = {
  specialites: 'toutes' | string[];
  formules: Record<string, Formule[]>;
  /**
   * Accès limité à certains items (demande de Cyril, 07/10/2026) : une clé =
   * une spécialité retenue dont seuls les items listés sont ouverts (ceux du
   * collège et de ses sous-collèges) ; une spécialité sans clé est ouverte
   * en entier. Absent = périmètre saisi avant cette option (la liste
   * historique `cours` est alors ajustée par `ajusterCoursHerites`).
   * Les gardes ne lisent jamais ce champ : `coursDuPerimetre` en dérive la
   * liste `cours` du scope.
   */
  items?: Record<string, string[]>;
};

export type RoleModele =
  | 'commercial'
  | 'gestionnaire_video'
  | 'redacteur_blog'
  | 'enseignant_relecteur'
  | 'gestionnaire_agenda'
  | 'responsable_complet';

/** Forme complète stockée dans `profiles.permission_scope` pour le personnel. */
export type ScopeEquipe = {
  role: 'professor';
  /* ── champs historiques, DÉRIVÉS des modules (lus par toute la plateforme) ── */
  type: 'all' | 'college';
  colleges: string[];
  cours?: string[];
  content_permissions: Partial<Record<ContentType, PermissionLevel>>;
  /* ── cahier des charges 18/09/2026 ── */
  version: 1;
  fonction: string | null;
  modele: RoleModele | null;
  modules: Modules;
  perimetre: Perimetre;
  mfa_obligatoire: boolean;
  /**
   * Professeur référent de ses spécialités (demande de Cyril, 05/10/2026) :
   * reçoit les questions des élèves et ouvre l'onglet « Vidéos » (dépôt d'une
   * vidéo ou d'un support à l'avance). Coché par défaut — un compte qui n'a
   * jamais porté la clé est référent — et ne vaut que pour un enseignant
   * (`estReferent`).
   */
  referent: boolean;
};

export const MODULE_LABEL: Record<keyof Modules, string> = {
  suivi: 'Suivi élèves / Commercial',
  contenus: 'Vidéos & contenus pédagogiques',
  blog: 'Blog',
  agenda: 'Agenda des cours en direct',
};

export const DROIT_CONTENU_LABEL: Record<DroitContenu, string> = {
  creer: 'Créer (déposer une vidéo, un replay, un support…)',
  modifier: 'Modifier (titre, description, ordre, spécialité, formule…)',
  publier: 'Publier (sans ce droit, le dépôt reste « À valider »)',
  supprimer: 'Supprimer',
};

export const DROIT_BLOG_LABEL: Record<DroitBlog, string> = {
  creer: 'Créer un article',
  modifier_siens: 'Modifier ses propres articles',
  modifier_tous: 'Modifier tous les articles',
  publier: 'Publier',
  depublier: 'Dépublier',
  supprimer: 'Supprimer',
};

export function modulesVides(): Modules {
  return {
    suivi: { actif: false, rediger: false, gerer: false, population: 'tous' },
    contenus: { actif: false, creer: false, modifier: false, publier: false, supprimer: false, types: [] },
    blog: { actif: false, creer: false, modifier_siens: false, modifier_tous: false, publier: false, depublier: false, supprimer: false },
    agenda: { actif: false },
  };
}

export function perimetreComplet(): Perimetre {
  return { specialites: 'toutes', formules: { '*': [...FORMULES] } };
}

/**
 * Périmètre VIDE (aucune spécialité) : point de départ d'un nouveau
 * collaborateur et repli d'un périmètre absent ou illisible. « Toutes les
 * spécialités » doit toujours être un choix explicite de l'administrateur —
 * le monteur vidéo créé le 24/09/2026 avait hérité de ce défaut et voyait
 * tous les collèges.
 */
export function perimetreVide(): Perimetre {
  return { specialites: [], formules: { '*': [...FORMULES] } };
}

/**
 * Rôles modèles (cahier §8) : on part d'un modèle, puis on personnalise
 * exceptionnellement les droits d'une personne. Le modèle ne fige rien.
 */
export const ROLES_MODELES: Record<RoleModele, { label: string; description: string; modules: Modules }> = {
  commercial: {
    label: 'Commercial',
    description: 'Suivi des élèves de son périmètre : tableau de travail, comptes rendus d’appel, relances. Aucun accès aux contenus ni au blog.',
    modules: {
      ...modulesVides(),
      suivi: { actif: true, rediger: true, gerer: false, population: 'tous' },
    },
  },
  gestionnaire_video: {
    label: 'Gestionnaire vidéo',
    description: 'Dépose vidéos, replays et supports, les range et les décrit. Ne publie pas et ne supprime pas : ses dépôts passent « À valider ».',
    modules: {
      ...modulesVides(),
      contenus: { actif: true, creer: true, modifier: true, publier: false, supprimer: false, types: ['video'] },
    },
  },
  redacteur_blog: {
    label: 'Rédacteur blog',
    description: 'Crée et modifie ses propres brouillons, les remet en file « En attente de validation ». Ne publie pas, ne supprime pas.',
    modules: {
      ...modulesVides(),
      blog: { actif: true, creer: true, modifier_siens: true, modifier_tous: false, publier: false, depublier: false, supprimer: false },
    },
  },
  enseignant_relecteur: {
    label: 'Enseignant / relecteur',
    description: 'Accès à sa spécialité et aux contenus qui lui sont attribués : dépose et modifie fiches, QCM, flashcards et vidéos, relit et répond aux remarques pédagogiques. Aucune donnée commerciale.',
    modules: {
      ...modulesVides(),
      contenus: { actif: true, creer: true, modifier: true, publier: true, supprimer: false, types: [...CONTENT_TYPES] },
    },
  },
  gestionnaire_agenda: {
    label: 'Gestionnaire de l’agenda',
    description: 'Tient l’agenda des cours en direct : crée et modifie les séances, ajoute les liens de visio et les informations pour les élèves, choisit formules, voies et spécialités. Aucun autre accès.',
    modules: { ...modulesVides(), agenda: { actif: true } },
  },
  responsable_complet: {
    label: 'Responsable complet',
    description: 'Tous les modules avec tous leurs droits, sur tout le périmètre — sans jamais devenir administrateur (paiements, facturation, configuration, comptes restent fermés).',
    modules: {
      suivi: { actif: true, rediger: true, gerer: true, population: 'tous' },
      contenus: { actif: true, creer: true, modifier: true, publier: true, supprimer: true, types: [...CONTENT_TYPES] },
      blog: { actif: true, creer: true, modifier_siens: true, modifier_tous: true, publier: true, depublier: true, supprimer: true },
      agenda: { actif: true },
    },
  },
};

/* ────────────────────────────── normalisation ────────────────────────────── */

const bool = (v: unknown, defaut = false): boolean => (typeof v === 'boolean' ? v : defaut);
const CONTENT_SET = new Set<string>(CONTENT_TYPES);
const FORMULE_SET = new Set<string>(FORMULES);

function typesContenu(v: unknown): ContentType[] {
  if (!Array.isArray(v)) return [];
  return Array.from(new Set(v.filter((t): t is ContentType => typeof t === 'string' && CONTENT_SET.has(t))));
}

function formules(v: unknown): Formule[] {
  if (!Array.isArray(v)) return [];
  return Array.from(new Set(v.filter((f): f is Formule => typeof f === 'string' && FORMULE_SET.has(f))));
}

export function normaliserModules(raw: unknown): Modules {
  const base = modulesVides();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<Record<keyof Modules, Record<string, unknown>>>;
  const s = r.suivi ?? {};
  const c = r.contenus ?? {};
  const b = r.blog ?? {};
  const ag = r.agenda ?? {};
  const population = s.population === 'alertes' || s.population === 'affectes' ? s.population : 'tous';
  const modules: Modules = {
    suivi: { actif: bool(s.actif), rediger: bool(s.rediger), gerer: bool(s.gerer), population },
    contenus: {
      actif: bool(c.actif), creer: bool(c.creer), modifier: bool(c.modifier), publier: bool(c.publier), supprimer: bool(c.supprimer),
      types: typesContenu(c.types),
    },
    blog: {
      actif: bool(b.actif), creer: bool(b.creer), modifier_siens: bool(b.modifier_siens), modifier_tous: bool(b.modifier_tous),
      publier: bool(b.publier), depublier: bool(b.depublier), supprimer: bool(b.supprimer),
    },
    agenda: { actif: bool(ag.actif) },
  };
  // Un module inactif n'a aucun droit ; un droit sans module n'existe pas.
  if (!modules.suivi.actif) modules.suivi = { ...modules.suivi, rediger: false, gerer: false };
  if (!modules.contenus.actif) modules.contenus = { ...modules.contenus, creer: false, modifier: false, publier: false, supprimer: false, types: [] };
  if (!modules.blog.actif) modules.blog = { ...modulesVides().blog };
  return modules;
}

export function normaliserPerimetre(raw: unknown): Perimetre {
  // Fermé par défaut : un périmètre absent ou mal formé n'ouvre AUCUNE
  // spécialité. Seul `specialites: 'toutes'` écrit en toutes lettres ouvre tout.
  if (!raw || typeof raw !== 'object') return perimetreVide();
  const r = raw as { specialites?: unknown; formules?: unknown; items?: unknown };
  const specialites: 'toutes' | string[] = r.specialites === 'toutes'
    ? 'toutes'
    : Array.isArray(r.specialites)
      ? Array.from(new Set(r.specialites.filter((x): x is string => typeof x === 'string' && x.length > 0)))
      : [];
  const out: Record<string, Formule[]> = {};
  if (r.formules && typeof r.formules === 'object') {
    for (const [k, v] of Object.entries(r.formules as Record<string, unknown>)) {
      const f = formules(v);
      if (k === '*' || specialites === 'toutes' || specialites.includes(k)) out[k] = f;
    }
  }
  if (!out['*']) out['*'] = [...FORMULES];
  if (!r.items || typeof r.items !== 'object' || specialites === 'toutes') return { specialites, formules: out };
  const items: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(r.items as Record<string, unknown>)) {
    if (!specialites.includes(k) || !Array.isArray(v)) continue;
    items[k] = Array.from(new Set(v.filter((x): x is string => typeof x === 'string' && x.length > 0)));
  }
  return { specialites, formules: out, items };
}

/* ─────────────────────────────── lecture ─────────────────────────────── */

type ScopeBrut = Partial<ScopeEquipe> & {
  content_types?: ContentType[];
  role?: string;
  version?: number;
};

/**
 * Lit le scope d'un membre du personnel, y compris un compte historique créé
 * avant le cahier des charges (professeur avec de simples `content_permissions`) :
 * ses droits sont alors traduits en modules équivalents, sans perte.
 *
 * `suiviHerite` : rôle historique du module de suivi (`suivi_staff_roles`),
 * résolu côté serveur, pour les comptes qui n'ont pas encore de modules.
 */
export function lireScopeEquipe(
  raw: unknown,
  suiviHerite: 'responsable' | 'intervenant' | 'lecture' | null = null,
): ScopeEquipe | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as ScopeBrut;
  if (s.role !== 'professor') return null;

  const cours = Array.isArray(s.cours) ? s.cours.filter((x): x is string => typeof x === 'string') : undefined;
  const fonction = typeof s.fonction === 'string' && s.fonction.trim() ? s.fonction.trim() : null;
  const modele = estRoleModele(s.modele) ? s.modele : null;
  const mfa = bool(s.mfa_obligatoire);
  const referent = bool(s.referent, true);

  let modules: Modules;
  let perimetre: Perimetre;

  if (s.modules && typeof s.modules === 'object') {
    modules = normaliserModules(s.modules);
    perimetre = normaliserPerimetre(s.perimetre);
  } else {
    // Compte historique : content_permissions (ou content_types) → module Contenus.
    let cp: Partial<Record<ContentType, PermissionLevel>> = s.content_permissions ?? {};
    if (!s.content_permissions && Array.isArray(s.content_types)) {
      cp = Object.fromEntries(s.content_types.map((t) => [t, 'rw' as const]));
    }
    const lisibles = CONTENT_TYPES.filter((t) => { const l = cp[t]; return l && l !== 'none'; });
    const ecrit = CONTENT_TYPES.some((t) => cp[t] === 'write' || cp[t] === 'rw');
    modules = modulesVides();
    if (lisibles.length > 0) {
      modules.contenus = { actif: true, creer: ecrit, modifier: ecrit, publier: ecrit, supprimer: ecrit, types: [...lisibles] };
    }
    if (suiviHerite) {
      modules.suivi = {
        actif: true,
        rediger: suiviHerite !== 'lecture',
        gerer: suiviHerite === 'responsable',
        population: 'tous',
      };
    }
    perimetre = {
      // `type: 'all'` explicite seulement ; tout autre cas (college, absent)
      // se lit comme la liste des collèges, vide au besoin — fermé par défaut.
      specialites: s.type === 'all' ? 'toutes' : (Array.isArray(s.colleges) ? s.colleges.filter((x): x is string => typeof x === 'string') : []),
      formules: { '*': [...FORMULES] },
    };
  }

  return composerScope({ fonction, modele, modules, perimetre, cours, mfa_obligatoire: mfa, referent });
}

export function estRoleModele(v: unknown): v is RoleModele {
  return typeof v === 'string' && v in ROLES_MODELES;
}

/* ─────────────────────────────── écriture ─────────────────────────────── */

export type EntreeScope = {
  fonction?: string | null;
  modele?: RoleModele | null;
  modules: Modules;
  perimetre: Perimetre;
  /** Restriction historique à certains items (conservée, jamais saisie ici). */
  cours?: string[];
  mfa_obligatoire?: boolean;
  /** Professeur référent ; absent = oui (défaut de tout enseignant). */
  referent?: boolean;
};

/** Niveau historique d'un type de contenu, dérivé du module Contenus. */
export function niveauContenu(m: ModuleContenus, type: ContentType): PermissionLevel {
  if (!m.actif || !m.types.includes(type)) return 'none';
  return m.creer || m.modifier ? 'rw' : 'read';
}

/**
 * Compose le scope complet à partir des modules et du périmètre : les champs
 * historiques sont recalculés ici, et nulle part ailleurs.
 */
export function composerScope(entree: EntreeScope): ScopeEquipe {
  const modules = normaliserModules(entree.modules);
  const perimetre = normaliserPerimetre(entree.perimetre);
  const content_permissions: Partial<Record<ContentType, PermissionLevel>> = {};
  for (const t of CONTENT_TYPES) {
    const lvl = niveauContenu(modules.contenus, t);
    if (lvl !== 'none') content_permissions[t] = lvl;
  }
  // Les sous-types QCM sont toujours écrits, y compris à 'none' : une
  // révocation explicite ne doit jamais être réhéritée depuis « qcm ».
  for (const t of QCM_KINDS) if (content_permissions[t] === undefined) content_permissions[t] = 'none';
  const cours = (entree.cours ?? []).filter((x) => typeof x === 'string');
  return {
    role: 'professor',
    type: perimetre.specialites === 'toutes' ? 'all' : 'college',
    colleges: perimetre.specialites === 'toutes' ? [] : [...perimetre.specialites],
    ...(cours.length > 0 && perimetre.specialites !== 'toutes' ? { cours } : {}),
    content_permissions,
    version: 1,
    fonction: entree.fonction?.trim() || null,
    modele: estRoleModele(entree.modele) ? entree.modele : null,
    modules,
    perimetre,
    mfa_obligatoire: bool(entree.mfa_obligatoire),
    referent: bool(entree.referent, true),
  };
}

/* ─────────────────────────────── droits ─────────────────────────────── */

export function peutContenu(scope: ScopeEquipe | null, droit: DroitContenu, type?: ContentType): boolean {
  if (!scope) return false;
  const m = scope.modules.contenus;
  if (type === 'video' && estEnseignant(scope)) {
    // Les vidéos d'un enseignant tiennent à la case « Professeur référent » :
    // référent, il dépose une vidéo ou un support dans ses spécialités même
    // sans le type « vidéo » coché (publier et supprimer suivent ses droits) ;
    // non référent, il n'y touche plus, type coché ou non.
    if (!scope.referent) return false;
    return droit === 'creer' || droit === 'modifier' || m[droit];
  }
  if (!m.actif || !m[droit]) return false;
  return type ? m.types.includes(type) : true;
}

/** Droits blog ; `modifier` tient compte de l'auteur de l'article. */
export function peutBlog(
  scope: ScopeEquipe | null,
  droit: DroitBlog | 'modifier' | 'voir',
  contexte?: { authorId?: string | null; userId?: string | null },
): boolean {
  if (!scope) return false;
  const b = scope.modules.blog;
  if (!b.actif) return false;
  if (droit === 'voir') return true;
  if (droit === 'modifier') {
    if (b.modifier_tous) return true;
    if (b.modifier_siens && contexte?.authorId && contexte.userId && contexte.authorId === contexte.userId) return true;
    return false;
  }
  return b[droit];
}

/** Rôle du module de suivi équivalent (§18 du module) : responsable > intervenant > lecture. */
export function roleSuiviDeScope(scope: ScopeEquipe | null): 'responsable' | 'intervenant' | 'lecture' | null {
  if (!scope || !scope.modules.suivi.actif) return null;
  if (scope.modules.suivi.gerer) return 'responsable';
  if (scope.modules.suivi.rediger) return 'intervenant';
  return 'lecture';
}

export function aAuMoinsUnModule(scope: ScopeEquipe | null): boolean {
  return !!scope && (scope.modules.suivi.actif || scope.modules.contenus.actif || scope.modules.blog.actif || scope.modules.agenda.actif);
}

/* ─────────────────────────────── périmètre ─────────────────────────────── */

/** Formules autorisées pour un collège donné (sa surcharge, sinon le défaut). */
export function formulesPour(perimetre: Perimetre, collegeId: string): Formule[] {
  return perimetre.formules[collegeId] ?? perimetre.formules['*'] ?? [...FORMULES];
}

/** Ce collège est-il dans le périmètre ? */
export function specialiteAutorisee(perimetre: Perimetre, collegeId: string): boolean {
  return perimetre.specialites === 'toutes' || perimetre.specialites.includes(collegeId);
}

/**
 * Un élève est-il dans le périmètre ? Il faut qu'au moins UN de ses collèges
 * soit autorisé, et que l'une de ses formules soit autorisée pour ce collège.
 * Un élève « accès intégral » (type all) est dans toutes les spécialités.
 */
export function eleveDansPerimetre(
  perimetre: Perimetre,
  eleve: { colleges: string[] | 'all'; offers: readonly Offer[] },
): boolean {
  const offres = eleve.offers.filter((o): o is Formule => FORMULE_SET.has(o));
  if (offres.length === 0) return false;
  if (eleve.colleges === 'all') {
    if (perimetre.specialites === 'toutes') return offres.some((o) => (perimetre.formules['*'] ?? []).includes(o));
    return perimetre.specialites.some((c) => offres.some((o) => formulesPour(perimetre, c).includes(o)));
  }
  return eleve.colleges.some((c) => specialiteAutorisee(perimetre, c) && offres.some((o) => formulesPour(perimetre, c).includes(o)));
}

/**
 * Un élève (son `permission_scope` brut) est-il visible de ce collaborateur ?
 * `null` = pas de scope d'équipe lisible → rien de visible (l'administrateur
 * ne passe pas par ici). Même lecture que le tableau de travail du suivi :
 * le collège « Découverte » ne compte pas, un accès intégral couvre tout.
 */
export function eleveVisiblePourScope(scope: ScopeEquipe | null, eleveScope: unknown): boolean {
  if (!scope) return false;
  const ps = parseScope(eleveScope);
  const colleges: string[] | 'all' = ps.type === 'all' ? 'all' : ps.colleges.filter((c) => c !== 'col-decouverte');
  return eleveDansPerimetre(scope.perimetre, { colleges, offers: scopeOffers(ps) });
}

/* ─────────────────────────────── expiration ─────────────────────────────── */

/**
 * Accès expiré pour un membre du personnel (cahier §8 : « pour un prestataire
 * qui travaille trois mois, on met une date de fin »). Les administrateurs
 * n'expirent jamais ; un élève relève de `getAccessInfo` (session EVC).
 */
export function accesEquipeExpire(profile: { role?: string | null; access_end?: string | null }, now = Date.now()): boolean {
  if (profile.role !== 'professor') return false;
  if (!profile.access_end) return false;
  const t = new Date(profile.access_end).getTime();
  return Number.isFinite(t) && t < now;
}

/* ─────────────────────────────── onglets ─────────────────────────────── */

/**
 * Types « pédagogiques » : tout sauf la vidéo (fiches, QCM / DP / QROC,
 * annales, flashcards). C'est ce qui fait d'une personne un enseignant : elle
 * édite le fond et répond aux questions des élèves. Un monteur vidéo, lui,
 * n'a que le type `video`.
 */
export const TYPES_PEDAGOGIQUES: readonly ContentType[] = CONTENT_TYPES.filter((t) => t !== 'video');
/** Types relus dans « Entraînements d'élèves » (flashcards et QCM proposés par les élèves). */
const TYPES_ENTRAINEMENT: readonly ContentType[] = ['qcm', 'dp', 'qroc', 'flashcards'];

/**
 * Onglets d'administration ouverts à un membre du personnel. SOURCE UNIQUE
 * pour la barre latérale, les gardes de page et l'atterrissage : on n'ouvre
 * jamais une page « parce que c'est du staff ».
 */
export type AccesOnglets = {
  /** « Contenu » (fiches, QCM, flashcards…) : au moins un type pédagogique. */
  contenu: boolean;
  /** « Vidéos » : enseignant référent, ou type vidéo pour qui n'enseigne pas (monteur). */
  videos: boolean;
  /** « Questions / Réponses » : réservé aux enseignants référents. */
  qa: boolean;
  /** « Entraînements d'élèves » : QCM / DP / QROC ou flashcards. */
  entrainements: boolean;
  /** « Suivi individuel » / suivi élèves. */
  suivi: boolean;
  blog: boolean;
  /** « Agenda » : séances en direct, liens de visio. */
  agenda: boolean;
};

/** Un administrateur voit tout. */
export const ACCES_ADMIN: Readonly<AccesOnglets> = {
  contenu: true, videos: true, qa: true, entrainements: true, suivi: true, blog: true, agenda: true,
};

/**
 * Onglets ouverts par ce scope. Un compte historique passe d'abord par
 * `lireScopeEquipe` (content_permissions → module Contenus, rôle de suivi
 * hérité → module Suivi) : la règle est la même pour tous.
 */
export function accesOnglets(scope: ScopeEquipe | null): AccesOnglets {
  const types = scope && scope.modules.contenus.actif ? scope.modules.contenus.types : [];
  const pedagogique = types.some((t) => TYPES_PEDAGOGIQUES.includes(t));
  const referent = estReferent(scope);
  return {
    contenu: pedagogique,
    // Un enseignant n'a les vidéos que référent (case du crayon) ; un monteur
    // vidéo, qui n'enseigne pas, les garde par son type « vidéo ».
    videos: pedagogique ? referent : types.includes('video'),
    qa: referent,
    entrainements: types.some((t) => TYPES_ENTRAINEMENT.includes(t)),
    suivi: !!scope?.modules.suivi.actif,
    blog: !!scope?.modules.blog.actif,
    agenda: !!scope?.modules.agenda.actif,
  };
}

/* ─────────────────────────── professeur référent ─────────────────────────── */

/**
 * Enseignant : au moins un type pédagogique (fiches, QCM, DP, QROC, annales,
 * flashcards) dans le module Contenus. Jamais un monteur vidéo, un commercial
 * ni un rédacteur blog.
 */
export function estEnseignant(scope: ScopeEquipe | null): boolean {
  return !!scope && scope.modules.contenus.actif && scope.modules.contenus.types.some((t) => TYPES_PEDAGOGIQUES.includes(t));
}

/**
 * Professeur référent de ses spécialités (demande de Cyril, 05/10/2026) :
 * tout enseignant l'est par défaut, l'administrateur peut décocher la case
 * dans le crayon d'« Équipe & Permissions ». Le référent — et lui seul —
 * reçoit les questions des élèves (mail + page Questions / Réponses) et ouvre
 * l'onglet « Vidéos ». Plusieurs référents peuvent couvrir le même collège.
 */
export function estReferent(scope: ScopeEquipe | null): boolean {
  return !!scope && scope.referent && estEnseignant(scope);
}

/** Collège (matiere_id) de chaque item, lu en base par l'appelant. */
export type CollegeDeItem = Readonly<Record<string, string>>;

/**
 * Spécialités dont ce collaborateur est référent : `'toutes'`, ou la liste
 * des collèges dont il reçoit les questions — vide s'il n'est pas référent.
 *
 * Un compte à restriction d'items (`cours[]`, format historique « 21 collèges
 * de médecine générale + les 13 items d'hématologie ») n'est référent que des
 * collèges qui contiennent l'un de ses items : avant le 05/10/2026, ses
 * 21 collèges lui faisaient recevoir les questions de toute la médecine
 * générale. `collegeDeItem` porte le collège de chacun de ses items.
 */
export function specialitesReferent(scope: ScopeEquipe | null, collegeDeItem: CollegeDeItem): 'toutes' | string[] {
  if (!scope || !estReferent(scope)) return [];
  const specialites = scope.perimetre.specialites;
  if (specialites === 'toutes') return 'toutes';
  const items = scope.cours ?? [];
  if (items.length === 0) return [...specialites];
  const avecItems = new Set(items.map((id) => collegeDeItem[id]).filter((c): c is string => !!c));
  return specialites.filter((c) => avecItems.has(c));
}

/**
 * Une question relève-t-elle de ces spécialités (`specialitesReferent`) ?
 * Une question rattachée à un collège revient aux référents de CE collège —
 * en médecine générale, l'élève choisit le sous-collège : seuls ses référents
 * la reçoivent. Une question hors collège (anciennes questions, « question
 * générale » de l'app, assistant IA sans item) suit la SPÉCIALITÉ de l'élève :
 * ses collèges hors Découverte, chaque sous-collège remplacé par son collège
 * parent (`parentDe`) — une question générale d'un élève de médecine générale
 * va aux référents de toute la médecine générale, pas à ceux de chaque
 * sous-collège. Élève inconnu ou en accès intégral : « toutes » seulement.
 */
export function questionDansPortee(
  portee: 'toutes' | readonly string[],
  matiereId: string | null | undefined,
  eleveScope?: unknown,
  parentDe: ParentDe = {},
): boolean {
  if (portee === 'toutes') return true;
  if (portee.length === 0) return false;
  if (matiereId) return portee.includes(matiereId);
  return collegesDeLEleve(eleveScope, parentDe).some((c) => portee.includes(c));
}

/**
 * Spécialités d'un élève pour le routage d'une question hors collège ([] si
 * accès intégral ou inconnu) : ses collèges hors Découverte, un sous-collège
 * remonté à son collège parent.
 */
export function collegesDeLEleve(eleveScope: unknown, parentDe: ParentDe = {}): string[] {
  if (!eleveScope || typeof eleveScope !== 'object') return [];
  const ps = parseScope(eleveScope);
  if (ps.type !== 'college') return [];
  return Array.from(new Set(ps.colleges.filter((c) => c !== 'col-decouverte').map((c) => parentDe[c] ?? c)));
}

/** Profil lu en base pour décider des destinataires d'une question d'élève. */
export type ProfilDestinataireQuestion = {
  role?: string | null;
  email?: string | null;
  is_active?: boolean | null;
  access_end?: string | null;
  permission_scope?: unknown;
};

/** Hiérarchie des collèges et collège des items, résolus côté serveur. */
export type ContexteRoutage = { parentDe?: ParentDe; collegeDeItem?: CollegeDeItem };

/**
 * Ce membre du personnel doit-il RECEVOIR le mail « Nouvelle question
 * d'élève » ? SOURCE UNIQUE du routage des questions (mail, page Q&R, forum
 * côté équipe) : un compte actif, non expiré, enseignant RÉFÉRENT (jamais un
 * monteur vidéo, un commercial, un rédacteur blog ni un enseignant dont la
 * case « référent » est décochée) dont les spécialités couvrent la question
 * (`questionDansPortee`). `eleveScope` = le `permission_scope` de l'élève.
 */
export function recoitQuestionEleve(
  p: ProfilDestinataireQuestion,
  matiereId: string | null | undefined,
  eleveScope?: unknown,
  ctx: ContexteRoutage = {},
  now = Date.now(),
): boolean {
  if (p.role !== 'professor') return false;
  if (!p.email) return false;
  if (p.is_active === false) return false;
  if (accesEquipeExpire(p, now)) return false;
  const portee = specialitesReferent(lireScopeEquipe(p.permission_scope), ctx.collegeDeItem ?? {});
  return questionDansPortee(portee, matiereId, eleveScope, ctx.parentDe);
}

/* ─────────────────────────────── navigation ─────────────────────────────── */

export type PageEquipe = { href: string; label: string; module: keyof Modules | 'commun' };

/** Page de sécurité du compte : ouverte à tout le personnel (2FA). */
export const PAGE_SECURITE = '/admin/securite';

/** Pages d'administration ouvertes par ce scope, dans l'ordre de présentation. */
export function pagesDuScope(scope: ScopeEquipe | null): PageEquipe[] {
  if (!scope) return [];
  const acces = accesOnglets(scope);
  const pages: PageEquipe[] = [];
  if (acces.suivi) {
    pages.push({ href: '/admin/suivi/eleves', label: 'Suivi élèves — tableau de travail', module: 'suivi' });
    pages.push({ href: '/admin/suivi', label: 'Suivi individuel (agenda, campagnes, candidats)', module: 'suivi' });
  }
  if (acces.contenu) pages.push({ href: '/admin/contenu', label: 'Contenu pédagogique', module: 'contenus' });
  if (acces.videos) pages.push({ href: '/admin/videos', label: 'Vidéos, replays et supports', module: 'contenus' });
  if (acces.entrainements) pages.push({ href: '/admin/entrainements-eleves', label: 'Entraînements d’élèves', module: 'contenus' });
  if (acces.qa) pages.push({ href: '/admin/qa', label: 'Questions / Réponses des élèves', module: 'contenus' });
  if (acces.blog) pages.push({ href: '/admin/blog', label: 'Blog', module: 'blog' });
  if (acces.agenda) pages.push({ href: '/admin/agenda', label: 'Agenda des cours en direct', module: 'agenda' });
  pages.push({ href: PAGE_SECURITE, label: 'Sécurité du compte (2FA)', module: 'commun' });
  return pages;
}

/** Première page à ouvrir pour ce compte (atterrissage après connexion). */
export function premierePage(scope: ScopeEquipe | null): string {
  return pagesDuScope(scope)[0]?.href ?? PAGE_SECURITE;
}

/* ─────────────────────────────── poste ─────────────────────────────── */

/** Poste d'une personne de l'équipe : son rôle modèle, ou « personnalisé ». */
export type PosteEquipe = RoleModele | 'personnalise';

export const POSTE_LABEL: Record<PosteEquipe, string> = {
  commercial: ROLES_MODELES.commercial.label,
  gestionnaire_video: ROLES_MODELES.gestionnaire_video.label,
  redacteur_blog: ROLES_MODELES.redacteur_blog.label,
  enseignant_relecteur: ROLES_MODELES.enseignant_relecteur.label,
  gestionnaire_agenda: ROLES_MODELES.gestionnaire_agenda.label,
  responsable_complet: ROLES_MODELES.responsable_complet.label,
  personnalise: 'Personnalisé',
};

/**
 * Poste d'un collaborateur : le rôle modèle choisi à la création, sinon
 * déduit de ses modules (suivi seul → commercial, vidéo seule → gestionnaire
 * vidéo, blog seul → rédacteur, contenus pédagogiques → enseignant, les trois
 * → responsable). Toute autre combinaison est « personnalisée ».
 */
export function posteDuScope(scope: ScopeEquipe | null): PosteEquipe {
  if (!scope) return 'personnalise';
  if (scope.modele) return scope.modele;
  const { suivi, contenus, blog, agenda } = scope.modules;
  const acces = accesOnglets(scope);
  if (suivi.actif && contenus.actif && blog.actif) return 'responsable_complet';
  if (agenda.actif && !suivi.actif && !contenus.actif && !blog.actif) return 'gestionnaire_agenda';
  if (suivi.actif && !contenus.actif && !blog.actif) return 'commercial';
  if (blog.actif && !contenus.actif && !suivi.actif) return 'redacteur_blog';
  if (contenus.actif && !suivi.actif && !blog.actif) {
    if (acces.contenu) return 'enseignant_relecteur';
    if (acces.videos) return 'gestionnaire_video';
  }
  return 'personnalise';
}

/**
 * Présentation d'un collaborateur dans son invitation : l'intitulé de son
 * poste (sa fonction saisie, sinon son rôle), une phrase de mission, et la
 * liste de ce à quoi il aura accès (hors page de sécurité, commune à tous).
 */
export function presentationPoste(scope: ScopeEquipe | null): {
  poste: PosteEquipe; intitule: string; enseignant: boolean; mission: string; acces: string[];
} {
  const poste = posteDuScope(scope);
  const intitule = scope?.fonction ?? (poste === 'personnalise' ? 'Collaborateur' : POSTE_LABEL[poste]);
  const c = scope?.modules.contenus;
  const b = scope?.modules.blog;
  let mission: string;
  switch (poste) {
    case 'commercial':
      mission = 'suivre les élèves de votre périmètre : tableau de travail, comptes rendus d’appel et relances.';
      break;
    case 'gestionnaire_video':
      mission = c?.publier
        ? 'déposer, ranger et publier les vidéos, replays et supports de cours.'
        : 'déposer et ranger les vidéos, replays et supports — vos dépôts passent « À valider » avant publication.';
      break;
    case 'redacteur_blog':
      mission = b?.publier
        ? 'rédiger et publier les articles du blog Major ECN.'
        : 'rédiger les articles du blog — vos brouillons passent « En attente de validation » avant publication.';
      break;
    case 'enseignant_relecteur':
      mission = estReferent(scope)
        ? 'enrichir et relire les contenus pédagogiques de votre spécialité (fiches, QCM, flashcards…), répondre aux questions des élèves en tant que professeur référent et déposer vidéos et supports de cours.'
        : 'enrichir et relire les contenus pédagogiques de votre spécialité (fiches, QCM, flashcards…).';
      break;
    case 'gestionnaire_agenda':
      mission = 'tenir l’agenda des cours en direct : créer et modifier les séances, y ajouter les liens de visio et les informations pour les élèves.';
      break;
    case 'responsable_complet':
      mission = 'piloter le suivi des élèves, les contenus pédagogiques, le blog et l’agenda, sur tout votre périmètre.';
      break;
    default:
      mission = 'utiliser les outils d’administration qui vous ont été ouverts.';
  }
  return {
    poste,
    intitule,
    enseignant: poste === 'enseignant_relecteur',
    mission,
    acces: pagesDuScope(scope).filter((p) => p.href !== PAGE_SECURITE).map((p) => p.label),
  };
}

/* ─────────────────────────────── résumé ─────────────────────────────── */

export function resumeModules(scope: ScopeEquipe): string[] {
  const out: string[] = [];
  const { suivi, contenus, blog, agenda } = scope.modules;
  if (suivi.actif) {
    const droits = [suivi.rediger ? 'rédiger' : 'consulter', suivi.gerer ? 'gérer' : null].filter(Boolean).join(' + ');
    out.push(`Suivi élèves : ${droits} — ${POPULATION_LABEL[suivi.population].toLowerCase()}`);
  }
  if (contenus.actif) {
    const droits = (['creer', 'modifier', 'publier', 'supprimer'] as const).filter((d) => contenus[d]);
    out.push(`Contenus (${contenus.types.join(', ') || 'aucun type'}) : ${droits.join(' / ') || 'consultation seule'}`);
  }
  if (blog.actif) {
    const droits = (['creer', 'modifier_siens', 'modifier_tous', 'publier', 'depublier', 'supprimer'] as const)
      .filter((d) => blog[d]).map((d) => DROIT_BLOG_LABEL[d].toLowerCase());
    out.push(`Blog : ${droits.join(' / ') || 'consultation seule'}`);
  }
  if (agenda.actif) out.push('Agenda : créer, modifier et supprimer les séances, liens de visio');
  if (estEnseignant(scope)) {
    out.push(scope.referent
      ? 'Professeur référent : questions des élèves et vidéos de ses spécialités'
      : 'Non référent : ni questions des élèves ni vidéos');
  }
  if (out.length === 0) out.push('Aucun module — accès limité à la sécurité du compte.');
  return out;
}

export function resumePerimetre(perimetre: Perimetre, nomCollege: (id: string) => string = (id) => id): string[] {
  const out: string[] = [];
  const defaut = perimetre.formules['*'] ?? [];
  const libelleFormules = (f: Formule[]) => (f.length === FORMULES.length ? 'toutes formules' : f.length === 0 ? 'aucune formule' : f.map((x) => FORMULE_LABEL[x]).join(' + '));
  if (perimetre.specialites === 'toutes') {
    out.push(`Toutes les spécialités — ${libelleFormules(defaut)}`);
  } else if (perimetre.specialites.length === 0) {
    out.push('Aucune spécialité (périmètre vide)');
  } else {
    for (const c of perimetre.specialites) {
      const items = perimetre.items?.[c];
      const portee = items ? ` (${items.length} item${items.length > 1 ? 's' : ''} choisi${items.length > 1 ? 's' : ''})` : '';
      out.push(`${nomCollege(c)}${portee} — ${libelleFormules(formulesPour(perimetre, c))}`);
    }
  }
  return out;
}

/* ─────────────── Hiérarchie des collèges (parent → sous-collèges) ─────────────── */

/** Identifiant d'un sous-collège → identifiant de son collège parent. */
export type ParentDe = Readonly<Record<string, string>>;
/** Identifiant d'un collège → identifiants de ses sous-collèges. */
export type EnfantsDe = Readonly<Record<string, readonly string[]>>;

/**
 * Développe un périmètre avant enregistrement : un collège parent choisi
 * entraîne tous ses sous-collèges, avec les mêmes formules. Les gardes
 * historiques (`canAccessCollege`) exigent chaque identifiant explicitement.
 */
export function deployerPerimetre(perimetre: Perimetre, enfantsDe: EnfantsDe): Perimetre {
  if (perimetre.specialites === 'toutes') return perimetre;
  const specialites = [...perimetre.specialites];
  const formules: Perimetre['formules'] = { ...perimetre.formules };
  for (const parent of perimetre.specialites) {
    for (const enfant of enfantsDe[parent] ?? []) {
      if (!specialites.includes(enfant)) specialites.push(enfant);
      if (formules[parent]) formules[enfant] = [...formules[parent]];
      else delete formules[enfant];
    }
  }
  return { specialites, formules, ...(perimetre.items ? { items: perimetre.items } : {}) };
}

/**
 * Restriction historique à certains items (`scope.cours`) face au périmètre
 * qu'on vient d'enregistrer. Le dialogue ne montre ni ne saisit cette liste :
 * la recopier telle quelle ferme silencieusement tout ce que l'administrateur
 * croit ouvrir, car dès qu'elle existe elle l'emporte sur les collèges
 * (`profCanAccessCours`, RLS `accessible_cours_ids`). Incident du 30/09/2026 :
 * un enseignant passé en « Endocrinologie » gardait 37 items d'autres
 * spécialités et ne voyait plus rien.
 *
 *  - items hors du nouveau périmètre (ou supprimés) → retirés ;
 *  - plus aucun item retenu → plus de restriction (spécialités entières) ;
 *  - restriction conservée → chaque collège AJOUTÉ y entre avec tous ses items,
 *    sans quoi il resterait vide.
 */
export function ajusterCoursHerites(p: {
  cours: string[] | undefined;
  /** Collège (matiere_id) de chaque item hérité encore existant. */
  collegeDe: Record<string, string>;
  anciensColleges: string[];
  /** Périmètre DÉPLOYÉ (sous-collèges compris). */
  nouveauxColleges: string[] | 'toutes';
  /** Items de chaque collège ajouté. */
  itemsDe: Record<string, string[]>;
}): string[] | undefined {
  if (!p.cours?.length || p.nouveauxColleges === 'toutes') return undefined;
  const nouveaux = new Set(p.nouveauxColleges);
  const retenus = p.cours.filter((id) => { const c = p.collegeDe[id]; return !!c && nouveaux.has(c); });
  if (retenus.length === 0) return undefined;
  const anciens = new Set(p.anciensColleges);
  for (const c of p.nouveauxColleges) {
    if (!anciens.has(c)) retenus.push(...(p.itemsDe[c] ?? []));
  }
  return Array.from(new Set(retenus));
}

/**
 * Replie un périmètre pour l'affichage et l'édition : les sous-collèges d'un
 * parent présent sont implicites et disparaissent de la liste.
 */
export function replierPerimetre(perimetre: Perimetre, parentDe: ParentDe): Perimetre {
  if (perimetre.specialites === 'toutes') return perimetre;
  const presents = new Set(perimetre.specialites);
  const specialites = perimetre.specialites.filter((c) => { const p = parentDe[c]; return !(p && presents.has(p)); });
  const formules: Perimetre['formules'] = {};
  for (const [k, v] of Object.entries(perimetre.formules)) if (k === '*' || specialites.includes(k)) formules[k] = v;
  if (!perimetre.items) return { specialites, formules };
  const items: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(perimetre.items)) if (specialites.includes(k)) items[k] = v;
  return { specialites, formules, items };
}

/**
 * Liste `cours` d'un périmètre DÉPLOYÉ qui limite des spécialités à certains
 * items. La RLS (`accessible_cours_ids`) et les gardes n'ont qu'une liste
 * d'items, valable pour TOUS les collèges dès qu'elle existe : elle porte donc
 * les items choisis ET tous les items des spécialités ouvertes en entier.
 *
 *  - `collegeDe` : collège de chaque item choisi (items supprimés absents) ;
 *  - `itemsDe` : items de chaque collège ouvert en entier.
 *
 * Renvoie le périmètre à enregistrer (une spécialité limitée à zéro item n'est
 * plus ouverte du tout : une liste vide ouvrirait tout) et la liste, ou
 * `undefined` quand aucune spécialité n'est limitée.
 */
export function coursDuPerimetre(p: {
  perimetre: Perimetre;
  enfantsDe: EnfantsDe;
  collegeDe: Record<string, string>;
  itemsDe: Record<string, string[]>;
}): { perimetre: Perimetre; cours: string[] | undefined } {
  const { perimetre } = p;
  if (perimetre.specialites === 'toutes' || !perimetre.items) return { perimetre, cours: undefined };
  const limites = collegesLimites(perimetre, p.enfantsDe);
  const retenus = new Set<string>();
  const items: Record<string, string[]> = {};
  for (const [cle, ids] of Object.entries(perimetre.items)) {
    const couverts = new Set([cle, ...(p.enfantsDe[cle] ?? [])]);
    const valides = ids.filter((id) => couverts.has(p.collegeDe[id] ?? ''));
    if (valides.length === 0) continue;
    items[cle] = valides;
    for (const id of valides) retenus.add(id);
  }
  // Une spécialité limitée sans item valide sort du périmètre (avec ses
  // sous-collèges) : une liste vide n'ouvrirait rien… ou tout.
  const fermes = new Set<string>();
  for (const cle of Object.keys(perimetre.items)) {
    if (items[cle]) continue;
    fermes.add(cle);
    for (const e of p.enfantsDe[cle] ?? []) fermes.add(e);
  }
  const specialites = perimetre.specialites.filter((c) => !fermes.has(c));
  const formules: Perimetre['formules'] = {};
  for (const [k, v] of Object.entries(perimetre.formules)) if (k === '*' || specialites.includes(k)) formules[k] = v;
  const enregistre: Perimetre = { specialites, formules, items };
  if (retenus.size === 0) return { perimetre: enregistre, cours: undefined };
  for (const c of specialites) {
    if (limites.has(c)) continue;
    for (const id of p.itemsDe[c] ?? []) retenus.add(id);
  }
  return { perimetre: enregistre, cours: Array.from(retenus) };
}

/** Collèges (sous-collèges compris) dont l'accès est limité à certains items. */
export function collegesLimites(perimetre: Perimetre, enfantsDe: EnfantsDe): Set<string> {
  const out = new Set<string>();
  for (const cle of Object.keys(perimetre.items ?? {})) {
    out.add(cle);
    for (const e of enfantsDe[cle] ?? []) out.add(e);
  }
  return out;
}

/**
 * Lecture d'un compte dont la liste `cours` précède l'option « items
 * choisis » : les items sont rangés sous la spécialité affichée (repliée) qui
 * les contient. Une spécialité sans aucun item de la liste est aujourd'hui
 * fermée en pratique (la liste l'emporte) : elle apparaît limitée à zéro item,
 * pour que l'administrateur le voie et tranche.
 */
export function itemsDepuisCours(p: {
  perimetre: Perimetre;
  cours: string[] | undefined;
  collegeDe: Record<string, string>;
  parentDe: ParentDe;
}): Perimetre {
  const { perimetre } = p;
  if (perimetre.items || perimetre.specialites === 'toutes' || !p.cours?.length) return perimetre;
  // Clés = spécialités telles que le dialogue les affiche (un parent coché
  // couvre ses sous-collèges).
  const items: Record<string, string[]> = {};
  for (const c of replierPerimetre(perimetre, p.parentDe).specialites as string[]) items[c] = [];
  for (const id of p.cours) {
    const college = p.collegeDe[id];
    if (!college) continue;
    if (items[college]) items[college].push(id);
    else if (p.parentDe[college] && items[p.parentDe[college]]) items[p.parentDe[college]].push(id);
  }
  return { ...perimetre, items };
}

/** Zones toujours interdites au personnel non administrateur (cahier §7). */
export const ZONES_RESERVEES_ADMIN = [
  'Paiements, facturation et codes de réduction',
  'Configuration du site et des permissions de formule',
  'Création d’administrateurs et gestion des comptes de l’équipe',
  'Données sensibles des élèves (documents, contrats, attestations)',
] as const;
