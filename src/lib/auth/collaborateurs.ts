import { CONTENT_TYPES, QCM_KINDS, type ContentType, type PermissionLevel } from '@/lib/schemas/professor';
import type { Offer } from '@/types/domain';

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

export type Modules = { suivi: ModuleSuivi; contenus: ModuleContenus; blog: ModuleBlog };

/**
 * Périmètre : spécialités autorisées (identifiants de collèges, ou toutes),
 * et formules autorisées par spécialité — `'*'` porte le défaut, une clé par
 * collège le surcharge.
 */
export type Perimetre = {
  specialites: 'toutes' | string[];
  formules: Record<string, Formule[]>;
};

export type RoleModele =
  | 'commercial'
  | 'gestionnaire_video'
  | 'redacteur_blog'
  | 'enseignant_relecteur'
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
};

export const MODULE_LABEL: Record<keyof Modules, string> = {
  suivi: 'Suivi élèves / Commercial',
  contenus: 'Vidéos & contenus pédagogiques',
  blog: 'Blog',
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
  };
}

export function perimetreComplet(): Perimetre {
  return { specialites: 'toutes', formules: { '*': [...FORMULES] } };
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
  responsable_complet: {
    label: 'Responsable complet',
    description: 'Les trois modules avec tous leurs droits, sur tout le périmètre — sans jamais devenir administrateur (paiements, facturation, configuration, comptes restent fermés).',
    modules: {
      suivi: { actif: true, rediger: true, gerer: true, population: 'tous' },
      contenus: { actif: true, creer: true, modifier: true, publier: true, supprimer: true, types: [...CONTENT_TYPES] },
      blog: { actif: true, creer: true, modifier_siens: true, modifier_tous: true, publier: true, depublier: true, supprimer: true },
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
  };
  // Un module inactif n'a aucun droit ; un droit sans module n'existe pas.
  if (!modules.suivi.actif) modules.suivi = { ...modules.suivi, rediger: false, gerer: false };
  if (!modules.contenus.actif) modules.contenus = { ...modules.contenus, creer: false, modifier: false, publier: false, supprimer: false, types: [] };
  if (!modules.blog.actif) modules.blog = { ...modulesVides().blog };
  return modules;
}

export function normaliserPerimetre(raw: unknown): Perimetre {
  const complet = perimetreComplet();
  if (!raw || typeof raw !== 'object') return complet;
  const r = raw as { specialites?: unknown; formules?: unknown };
  const specialites: 'toutes' | string[] = Array.isArray(r.specialites)
    ? Array.from(new Set(r.specialites.filter((x): x is string => typeof x === 'string' && x.length > 0)))
    : 'toutes';
  const out: Record<string, Formule[]> = {};
  if (r.formules && typeof r.formules === 'object') {
    for (const [k, v] of Object.entries(r.formules as Record<string, unknown>)) {
      const f = formules(v);
      if (k === '*' || specialites === 'toutes' || specialites.includes(k)) out[k] = f;
    }
  }
  if (!out['*']) out['*'] = [...FORMULES];
  return { specialites, formules: out };
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
      specialites: s.type === 'college' ? (Array.isArray(s.colleges) ? s.colleges.filter((x): x is string => typeof x === 'string') : []) : 'toutes',
      formules: { '*': [...FORMULES] },
    };
  }

  return composerScope({ fonction, modele, modules, perimetre, cours, mfa_obligatoire: mfa });
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
  };
}

/* ─────────────────────────────── droits ─────────────────────────────── */

export function peutContenu(scope: ScopeEquipe | null, droit: DroitContenu, type?: ContentType): boolean {
  if (!scope) return false;
  const m = scope.modules.contenus;
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
  return !!scope && (scope.modules.suivi.actif || scope.modules.contenus.actif || scope.modules.blog.actif);
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

/* ─────────────────────────────── navigation ─────────────────────────────── */

export type PageEquipe = { href: string; label: string; module: keyof Modules | 'commun' };

/** Pages d'administration ouvertes par ce scope, dans l'ordre de présentation. */
export function pagesDuScope(scope: ScopeEquipe | null): PageEquipe[] {
  if (!scope) return [];
  const pages: PageEquipe[] = [];
  if (scope.modules.suivi.actif) {
    pages.push({ href: '/admin/suivi/eleves', label: 'Suivi élèves — tableau de travail', module: 'suivi' });
    pages.push({ href: '/admin/suivi', label: 'Suivi individuel (agenda, campagnes, candidats)', module: 'suivi' });
  }
  if (scope.modules.contenus.actif) {
    pages.push({ href: '/admin/contenu', label: 'Contenu pédagogique', module: 'contenus' });
    if (scope.modules.contenus.types.includes('video')) pages.push({ href: '/admin/videos', label: 'Vidéos', module: 'contenus' });
  }
  if (scope.modules.blog.actif) pages.push({ href: '/admin/blog', label: 'Blog', module: 'blog' });
  pages.push({ href: '/admin/qa', label: 'Questions / Réponses', module: 'commun' });
  pages.push({ href: '/admin/securite', label: 'Sécurité du compte (2FA)', module: 'commun' });
  return pages;
}

/** Première page à ouvrir pour ce compte (atterrissage après connexion). */
export function premierePage(scope: ScopeEquipe | null): string {
  return pagesDuScope(scope)[0]?.href ?? '/admin/qa';
}

/* ─────────────────────────────── résumé ─────────────────────────────── */

export function resumeModules(scope: ScopeEquipe): string[] {
  const out: string[] = [];
  const { suivi, contenus, blog } = scope.modules;
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
  if (out.length === 0) out.push('Aucun module — accès limité aux Questions / Réponses.');
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
    for (const c of perimetre.specialites) out.push(`${nomCollege(c)} — ${libelleFormules(formulesPour(perimetre, c))}`);
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
  return { specialites, formules };
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
  return { specialites, formules };
}

/** Zones toujours interdites au personnel non administrateur (cahier §7). */
export const ZONES_RESERVEES_ADMIN = [
  'Paiements, facturation et codes de réduction',
  'Configuration du site et des permissions de formule',
  'Création d’administrateurs et gestion des comptes de l’équipe',
  'Données sensibles des élèves (documents, contrats, attestations)',
] as const;
