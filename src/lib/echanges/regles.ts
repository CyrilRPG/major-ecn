/**
 * Module « Échanges » — règles PURES (aucun accès réseau ni base).
 *
 * Tout ce qui décide d'un droit vit ici, testé dans tests/echanges-regles.test.ts,
 * et appliqué côté serveur par lib/echanges/acces.ts : participation à un
 * groupe (critères, exceptions), effets des sanctions, droits par rôle,
 * fenêtre de modification, quotas anti-abus, statistiques de réactivité.
 * L'interface ne fait que refléter ces décisions (CDC §4, §97 : masquer un
 * bouton n'est jamais une protection).
 */

/* ────────────────────────────── Formules ────────────────────────────── */

export type FormuleCategorie = 'essentielle' | 'intensive' | 'approfondie' | 'approfondie_plus';

export const FORMULES: { id: FormuleCategorie; label: string }[] = [
  { id: 'essentielle', label: 'Essentielle' },
  { id: 'intensive', label: 'Intensive' },
  { id: 'approfondie', label: 'Approfondie' },
  { id: 'approfondie_plus', label: 'Approfondie Plus' },
];

export const LIBELLE_FORMULE: Record<FormuleCategorie, string> = Object.fromEntries(
  FORMULES.map((f) => [f.id, f.label]),
) as Record<FormuleCategorie, string>;

type ScopeBrut = {
  type?: unknown; colleges?: unknown; offer?: unknown; offers?: unknown;
  paid_approfondi_variant?: unknown; paid_specialty?: unknown; paid_voie?: unknown; voie?: unknown;
  espace_decouverte?: unknown; paid_formule?: unknown;
};

function lireScope(raw: unknown): ScopeBrut {
  return raw && typeof raw === 'object' ? (raw as ScopeBrut) : {};
}

const OFFRES_PAYANTES = ['essentiel', 'intensif', 'approfondi'] as const;

/** Offres payantes détenues (union multi-formules, cf. permissions.parseScope). */
export function offresPayantes(raw: unknown): string[] {
  const s = lireScope(raw);
  const liste = Array.isArray(s.offers) && s.offers.length > 0 ? s.offers : [s.offer];
  const out = new Set<string>();
  for (const o of liste) {
    if (o === 'intensif' || o === 'premium') out.add('intensif');
    else if (o === 'essentiel' || o === 'basic') out.add('essentiel');
    else if (o === 'approfondi') out.add('approfondi');
  }
  // Ancien format « accès intégral » sans offre explicite : approfondi.
  if (out.size === 0 && s.type === 'all' && s.offer === undefined) out.add('approfondi');
  return [...out].filter((o) => (OFFRES_PAYANTES as readonly string[]).includes(o));
}

/**
 * Catégories d'inscription au sens du CDC (§173) : Essentielle, Intensive,
 * Approfondie, Approfondie Plus. « Plus » se lit sur la variante achetée
 * (`paid_approfondi_variant` = « mg-plus », « psy-plus »…).
 */
export function categoriesFormule(raw: unknown): FormuleCategorie[] {
  const s = lireScope(raw);
  const out: FormuleCategorie[] = [];
  for (const o of offresPayantes(raw)) {
    if (o === 'essentiel') out.push('essentielle');
    else if (o === 'intensif') out.push('intensive');
    else if (o === 'approfondi') {
      const variante = typeof s.paid_approfondi_variant === 'string' ? s.paid_approfondi_variant : '';
      out.push(variante.endsWith('-plus') ? 'approfondie_plus' : 'approfondie');
    }
  }
  return out;
}

export function voieDuScope(raw: unknown): 'interne' | 'externe' | null {
  const s = lireScope(raw);
  const v = s.paid_voie ?? s.voie;
  if (typeof v !== 'string') return null;
  const n = v.trim().toLowerCase().replace(/^voie\s+/, '');
  return n === 'interne' || n === 'externe' ? n : null;
}

export function normaliserTexte(v: unknown): string {
  return typeof v === 'string'
    ? v.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()
    : '';
}

/* ─────────────────────── Critères d'un groupe (§172-182) ─────────────────────── */

export type Criteres = {
  /** Catégories d'inscription admises (vide = toutes les formules payantes). */
  formules?: FormuleCategorie[];
  /** Voies admises (vide = toutes ; un élève sans voie renseignée passe). */
  voies?: ('interne' | 'externe')[];
  /** Spécialités (collèges de premier niveau) ; vide = toutes. */
  specialites?: string[];
  /** Exiger une inscription active (compte actif, accès non expiré). Par défaut oui. */
  inscritsActifs?: boolean;
};

export type ContexteCriteres = {
  /** Sous-collège → collège parent (médecine générale…). */
  parentDe: Record<string, string>;
  /** Nom de chaque spécialité (pour les comptes en accès intégral qui portent `paid_specialty`). */
  nomDe: Record<string, string>;
};

export type EleveCriteres = {
  permission_scope: unknown;
  is_active: boolean | null;
  /** Accès expiré (fin de session EVC dépassée). */
  expire: boolean;
  role?: string | null;
};

export function lireCriteres(raw: unknown): Criteres {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const liste = <T extends string>(v: unknown, admis?: readonly string[]) =>
    (Array.isArray(v) ? v.filter((x): x is T => typeof x === 'string' && (!admis || admis.includes(x))) : []);
  return {
    formules: liste<FormuleCategorie>(o.formules, FORMULES.map((f) => f.id)),
    voies: liste<'interne' | 'externe'>(o.voies, ['interne', 'externe']),
    specialites: liste<string>(o.specialites),
    inscritsActifs: o.inscritsActifs !== false,
  };
}

/** Spécialités couvertes par l'inscription de l'élève (collèges ramenés à leur parent). */
export function specialitesDeLEleve(raw: unknown, ctx: ContexteCriteres): Set<string> {
  const s = lireScope(raw);
  const out = new Set<string>();
  if (s.type === 'college' && Array.isArray(s.colleges)) {
    for (const c of s.colleges) {
      if (typeof c !== 'string' || c === 'col-decouverte') continue;
      out.add(ctx.parentDe[c] ?? c);
    }
  }
  // Accès intégral : la spécialité achetée fait foi (sinon aucune spécialité
  // déduite — l'élève peut être ajouté nominativement).
  if (s.type !== 'college') {
    const achat = normaliserTexte(s.paid_specialty);
    if (achat) {
      for (const [id, nom] of Object.entries(ctx.nomDe)) {
        if (normaliserTexte(nom) === achat) out.add(id);
      }
    }
  }
  return out;
}

/**
 * Un élève correspond-il aux critères automatiques d'un groupe ? (R44, R45, R47)
 * Découverte et comptes non élèves : jamais.
 */
export function correspondAuxCriteres(e: EleveCriteres, criteres: Criteres, ctx: ContexteCriteres): boolean {
  if (e.role && e.role !== 'student') return false;
  if ((criteres.inscritsActifs ?? true) && (e.is_active === false || e.expire)) return false;
  const cats = categoriesFormule(e.permission_scope);
  if (cats.length === 0) return false;
  const formules = criteres.formules ?? [];
  if (formules.length > 0 && !cats.some((c) => formules.includes(c))) return false;
  const voies = criteres.voies ?? [];
  if (voies.length > 0) {
    const v = voieDuScope(e.permission_scope);
    if (v && !voies.includes(v)) return false;
  }
  const specs = criteres.specialites ?? [];
  if (specs.length > 0) {
    const siennes = specialitesDeLEleve(e.permission_scope, ctx);
    if (!specs.some((sp) => siennes.has(sp))) return false;
  }
  return true;
}

export type ModeParticipants = 'criteres' | 'manuel' | 'mixte';

export type Adhesion = {
  source: 'auto' | 'manuel';
  statut: 'actif' | 'retire';
  exclusion_forcee: boolean;
} | null;

/**
 * Participation effective d'un élève (§176-179, R46) :
 *  · une exclusion administrative explicite prime toujours ;
 *  · un ajout manuel actif donne l'accès (si le compte est actif) ;
 *  · un RETRAIT manuel est une exception durable : l'élève n'y est plus,
 *    même s'il correspond aux critères, jusqu'à ce qu'on le rétablisse ;
 *  · sinon, mode « critères » ou « mixte » : l'élève qui correspond y est.
 */
export function participe(
  adhesion: Adhesion,
  mode: ModeParticipants,
  correspond: boolean,
  compteOuvert: boolean,
): boolean {
  if (!compteOuvert) return false;
  if (adhesion?.exclusion_forcee) return false;
  if (adhesion?.source === 'manuel' && adhesion.statut === 'actif') return true;
  if (adhesion?.source === 'manuel' && adhesion.statut === 'retire') return false;
  if (mode === 'manuel') return false;
  return correspond;
}

/**
 * Aperçu d'une modification de critères (§181, R50) : qui entre, qui sort,
 * quelles exceptions sont conservées.
 */
export function apercuChangementCriteres<T extends { id: string }>(args: {
  eleves: (T & EleveCriteres)[];
  adhesions: Map<string, NonNullable<Adhesion>>;
  ancien: { mode: ModeParticipants; criteres: Criteres };
  nouveau: { mode: ModeParticipants; criteres: Criteres };
  ctx: ContexteCriteres;
}): { ajoutes: T[]; retires: T[]; exceptionsInclusion: T[]; exceptionsExclusion: T[] } {
  const ajoutes: T[] = [];
  const retires: T[] = [];
  const exceptionsInclusion: T[] = [];
  const exceptionsExclusion: T[] = [];
  for (const e of args.eleves) {
    const a = args.adhesions.get(e.id) ?? null;
    const ouvert = e.is_active !== false && !e.expire;
    const avant = participe(a, args.ancien.mode, correspondAuxCriteres(e, args.ancien.criteres, args.ctx), ouvert);
    const apres = participe(a, args.nouveau.mode, correspondAuxCriteres(e, args.nouveau.criteres, args.ctx), ouvert);
    if (!avant && apres) ajoutes.push(e);
    if (avant && !apres) retires.push(e);
    if (a?.source === 'manuel' && a.statut === 'actif' && !a.exclusion_forcee) exceptionsInclusion.push(e);
    if (a?.exclusion_forcee) exceptionsExclusion.push(e);
  }
  return { ajoutes, retires, exceptionsInclusion, exceptionsExclusion };
}

/* ─────────────────────────── Statut d'un groupe ─────────────────────────── */

export type StatutGroupe = 'brouillon' | 'active' | 'cloturee' | 'archivee';

export const LIBELLE_STATUT: Record<StatutGroupe, string> = {
  brouillon: 'Brouillon',
  active: 'Active',
  cloturee: 'Clôturée',
  archivee: 'Archivée',
};

/** Un élève voit-il ce groupe (hors sanctions) ? Brouillon et archivé : non (§104, §11). */
export function groupeVisibleEleve(g: { statut: StatutGroupe; visible: boolean; date_ouverture?: string | null }, now = Date.now()): boolean {
  if (!g.visible) return false;
  if (g.statut !== 'active' && g.statut !== 'cloturee') return false;
  if (g.statut === 'active' && g.date_ouverture && new Date(g.date_ouverture).getTime() > now) return false;
  return true;
}

/** Peut-on publier dans ce groupe ? Clôturé : plus rien, sauf l'équipe en annonces (§10). */
export function groupeOuvertAPublication(statut: StatutGroupe, auteur: 'candidat' | 'enseignant' | 'equipe', canal: 'discussion' | 'annonces'): boolean {
  if (statut === 'active') return true;
  if (statut === 'cloturee') return auteur === 'equipe' && canal === 'annonces';
  return false;
}

/* ─────────────────────────────── Sanctions ─────────────────────────────── */

export type TypeSanction = 'avertissement' | 'lecture_seule' | 'suspension' | 'exclusion' | 'restriction_tag';

export type Sanction = {
  id?: string;
  type: TypeSanction;
  groupe_id: string | null;
  debut_at: string;
  fin_at: string | null;
  levee_at: string | null;
};

export type EtatSanctions = {
  exclu: boolean;
  suspenduJusqua: string | null;
  suspendu: boolean;
  lectureSeule: boolean;
  lectureSeuleJusqua: string | null;
  tagRestreint: boolean;
};

/** Sanction en vigueur maintenant ? L'échéance rétablit les droits sans intervention (§51, R26). */
export function sanctionActive(s: Sanction, now = Date.now()): boolean {
  if (s.levee_at) return false;
  if (new Date(s.debut_at).getTime() > now) return false;
  if (s.fin_at && new Date(s.fin_at).getTime() <= now) return false;
  return true;
}

export function etatSanctions(sanctions: Sanction[], groupeId: string, now = Date.now()): EtatSanctions {
  const actives = sanctions.filter((s) => (s.groupe_id === null || s.groupe_id === groupeId) && sanctionActive(s, now));
  const fin = (type: TypeSanction) => {
    const l = actives.filter((s) => s.type === type);
    if (l.length === 0) return { actif: false, jusqua: null as string | null };
    if (l.some((s) => !s.fin_at)) return { actif: true, jusqua: null };
    return { actif: true, jusqua: l.map((s) => s.fin_at as string).sort().at(-1) ?? null };
  };
  const susp = fin('suspension');
  const ls = fin('lecture_seule');
  return {
    exclu: actives.some((s) => s.type === 'exclusion'),
    suspendu: susp.actif,
    suspenduJusqua: susp.jusqua,
    lectureSeule: ls.actif,
    lectureSeuleJusqua: ls.jusqua,
    tagRestreint: actives.some((s) => s.type === 'restriction_tag'),
  };
}

/* ─────────────────────────────── Droits ─────────────────────────────── */

export type RoleEchanges = 'candidat' | 'enseignant' | 'equipe';

export type Droits = {
  lire: boolean;
  publier: boolean;
  repondre: boolean;
  taguer: boolean;
  joindre: boolean;
  reagir: boolean;
  publierAnnonce: boolean;
  epingler: boolean;
  moderer: boolean;
  /** Motif lisible quand la publication est impossible (affiché à l'élève). */
  motif: string | null;
};

const AUCUN: Droits = {
  lire: false, publier: false, repondre: false, taguer: false, joindre: false, reagir: false,
  publierAnnonce: false, epingler: false, moderer: false, motif: null,
};

function dateCourte(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', { timeZone: 'Europe/Paris', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}

/** Droits d'un candidat dans un groupe auquel il participe (§5, §50-52). */
export function droitsCandidat(args: {
  statut: StatutGroupe;
  sanctions: EtatSanctions;
  reactionsLectureSeule: boolean;
}): Droits {
  const { sanctions } = args;
  if (sanctions.exclu) return { ...AUCUN, motif: 'Votre accès aux échanges a été retiré par Major ECN.' };
  if (sanctions.suspendu) {
    return {
      ...AUCUN,
      motif: sanctions.suspenduJusqua
        ? `Votre accès aux échanges est suspendu jusqu’au ${dateCourte(sanctions.suspenduJusqua)}.`
        : 'Votre accès aux échanges est suspendu.',
    };
  }
  const ouvert = args.statut === 'active';
  if (sanctions.lectureSeule) {
    return {
      ...AUCUN,
      lire: true,
      reagir: ouvert && args.reactionsLectureSeule,
      motif: sanctions.lectureSeuleJusqua
        ? `Vous êtes en lecture seule jusqu’au ${dateCourte(sanctions.lectureSeuleJusqua)}.`
        : 'Vous êtes en lecture seule : vous pouvez lire et rechercher, mais plus publier.',
    };
  }
  return {
    ...AUCUN,
    lire: true,
    publier: ouvert,
    repondre: ouvert,
    taguer: ouvert && !sanctions.tagRestreint,
    joindre: ouvert,
    reagir: ouvert,
    motif: ouvert ? (sanctions.tagRestreint ? 'Le tag des enseignants vous est temporairement retiré.' : null) : 'Cette promotion est clôturée : elle reste consultable, sans nouveaux messages.',
  };
}

export function droitsEnseignant(args: { statut: StatutGroupe; peutPublier: boolean; peutEpingler: boolean }): Droits {
  const ouvert = args.statut === 'active';
  return {
    ...AUCUN,
    lire: true,
    publier: ouvert && args.peutPublier,
    repondre: ouvert && args.peutPublier,
    joindre: ouvert && args.peutPublier,
    reagir: ouvert,
    epingler: args.peutEpingler && args.statut !== 'archivee',
    motif: ouvert ? null : 'Cette promotion est clôturée.',
  };
}

export function droitsEquipe(args: { statut: StatutGroupe; capacites: Set<Capacite> }): Droits {
  const actif = args.statut === 'active';
  const ecrire = args.capacites.has('publier');
  return {
    lire: true,
    publier: actif && ecrire,
    repondre: actif && ecrire,
    taguer: false,
    joindre: (actif || args.statut === 'cloturee') && ecrire,
    reagir: actif,
    publierAnnonce: (actif || args.statut === 'cloturee') && ecrire,
    epingler: args.capacites.has('epingler') && args.statut !== 'archivee',
    moderer: args.capacites.has('moderer'),
    motif: null,
  };
}

/* ───────────────────────── Niveaux administratifs (§102-103) ───────────────────────── */

export type Capacite =
  | 'lire_tout' | 'publier' | 'epingler' | 'moderer' | 'sanctionner' | 'suspendre' | 'signalements'
  | 'messages_supprimes' | 'gerer_groupes' | 'statistiques' | 'bibliotheque' | 'audit' | 'parametres'
  | 'restaurer' | 'rgpd' | 'exporter';

export const TOUTES_CAPACITES: Capacite[] = [
  'lire_tout', 'publier', 'epingler', 'moderer', 'sanctionner', 'suspendre', 'signalements', 'messages_supprimes',
  'gerer_groupes', 'statistiques', 'bibliotheque', 'audit', 'parametres', 'restaurer', 'rgpd', 'exporter',
];

export type NiveauStaff = 'super_admin' | 'admin_pedagogique' | 'moderateur';

export const LIBELLE_NIVEAU: Record<NiveauStaff, string> = {
  super_admin: 'Super Admin',
  admin_pedagogique: 'Administrateur pédagogique',
  moderateur: 'Modérateur',
};

/**
 * Capacités par niveau. Le rôle `admin` du compte = Super Admin. Le modérateur
 * consulte, supprime, traite les signalements et avertit ; il ne suspend que si
 * Major ECN le lui accorde, et ne touche ni aux promotions ni aux paramètres.
 */
export function capacitesDuNiveau(niveau: NiveauStaff | null, opts: { peutSuspendre?: boolean } = {}): Set<Capacite> {
  if (niveau === 'super_admin') return new Set(TOUTES_CAPACITES);
  if (niveau === 'admin_pedagogique') {
    return new Set<Capacite>([
      'lire_tout', 'publier', 'epingler', 'moderer', 'sanctionner', 'suspendre', 'signalements',
      'messages_supprimes', 'gerer_groupes', 'statistiques', 'bibliotheque', 'exporter',
    ]);
  }
  if (niveau === 'moderateur') {
    const c = new Set<Capacite>(['lire_tout', 'moderer', 'signalements', 'messages_supprimes', 'sanctionner']);
    if (opts.peutSuspendre) c.add('suspendre');
    return c;
  }
  return new Set();
}

/** Types de sanction permis selon les capacités (un modérateur sans « suspendre » ne fait qu'avertir et mettre en lecture seule). */
export function sanctionPermise(type: TypeSanction, capacites: Set<Capacite>): boolean {
  if (!capacites.has('sanctionner')) return false;
  if (type === 'suspension' || type === 'exclusion') return capacites.has('suspendre');
  return true;
}

/* ─────────────────────── Messages : suppression et modification ─────────────────────── */

/** Un candidat ne supprime que SES messages (§39-41, R17). L'équipe qui modère supprime tout. */
export function peutSupprimer(
  message: { auteur_id: string | null; auteur_type: string },
  acteur: { id: string; role: RoleEchanges; moderer: boolean },
): boolean {
  if (acteur.moderer) return true;
  return message.auteur_id === acteur.id;
}

/** Modification de son propre message pendant la fenêtre paramétrée (§73). */
export function peutModifier(
  message: { auteur_id: string | null; created_at: string; supprime_at: string | null },
  acteurId: string,
  editionMinutes: number,
  now = Date.now(),
): boolean {
  if (message.supprime_at) return false;
  if (message.auteur_id !== acteurId) return false;
  if (editionMinutes <= 0) return false;
  return now - new Date(message.created_at).getTime() <= editionMinutes * 60_000;
}

/* ─────────────────────────────── Quotas (§71-72) ─────────────────────────────── */

export type Quotas = {
  limite_messages_minute: number;
  limite_messages_heure: number;
  limite_tags_heure: number;
  limite_tags_enseignant_jour: number;
  limite_pj_heure: number;
  doublon_secondes: number;
};

export type Activite = {
  /** Horodatage des derniers messages de l'auteur (1 h glissante). */
  messages: { created_at: string; contenu: string | null }[];
  /** Tags créés par l'auteur (24 h glissantes). */
  tags: { tag_at: string; enseignant_id: string }[];
  /** Pièces jointes téléversées (1 h glissante). */
  piecesJointes: number;
};

export type VerdictQuota = { ok: true } | { ok: false; type: 'spam' | 'doublon' | 'tag_abusif' | 'piece_jointe'; message: string };

/** Contrôle des seuils avant publication. L'équipe et les enseignants n'y sont pas soumis. */
export function verifierQuotas(args: {
  quotas: Quotas;
  activite: Activite;
  contenu: string;
  nouveauxTags: string[];
  nouvellesPj: number;
  now?: number;
}): VerdictQuota {
  const now = args.now ?? Date.now();
  const q = args.quotas;
  const recents = args.activite.messages;
  const minute = recents.filter((m) => now - new Date(m.created_at).getTime() < 60_000).length;
  if (minute >= q.limite_messages_minute) {
    return { ok: false, type: 'spam', message: 'Vous envoyez beaucoup de messages : patientez une minute avant de publier à nouveau.' };
  }
  const heure = recents.filter((m) => now - new Date(m.created_at).getTime() < 3_600_000).length;
  if (heure >= q.limite_messages_heure) {
    return { ok: false, type: 'spam', message: 'Limite de messages atteinte pour l’heure en cours. Réessayez un peu plus tard.' };
  }
  const texte = normaliserTexte(args.contenu).replace(/\s+/g, ' ');
  if (texte.length > 0 && recents.some((m) => now - new Date(m.created_at).getTime() < q.doublon_secondes * 1000
    && normaliserTexte(m.contenu ?? '').replace(/\s+/g, ' ') === texte)) {
    return { ok: false, type: 'doublon', message: 'Ce message vient déjà d’être publié.' };
  }
  if (args.nouveauxTags.length > 0) {
    const tagsHeure = args.activite.tags.filter((t) => now - new Date(t.tag_at).getTime() < 3_600_000).length;
    if (tagsHeure + 1 > q.limite_tags_heure) {
      return { ok: false, type: 'tag_abusif', message: 'Vous avez déjà sollicité vos enseignants plusieurs fois cette heure-ci. Votre question peut être publiée sans tag, ou patientez un peu.' };
    }
    for (const ens of args.nouveauxTags) {
      const jour = args.activite.tags.filter((t) => t.enseignant_id === ens && now - new Date(t.tag_at).getTime() < 86_400_000).length;
      if (jour >= q.limite_tags_enseignant_jour) {
        return { ok: false, type: 'tag_abusif', message: 'Vous avez déjà adressé plusieurs questions à cet enseignant aujourd’hui. Il vous répondra dès que possible.' };
      }
    }
  }
  if (args.nouvellesPj > 0 && args.activite.piecesJointes + args.nouvellesPj > q.limite_pj_heure) {
    return { ok: false, type: 'piece_jointe', message: 'Trop de pièces jointes envoyées cette heure-ci.' };
  }
  return { ok: true };
}

/* ─────────────────────────────── Tags (§20-27) ─────────────────────────────── */

/**
 * Mentions retenues : seulement des enseignants actifs du groupe ET dont le
 * « @Prénom » figure bien dans le texte (un tag est toujours visible, jamais
 * caché). Dédoublonnées : un enseignant tagué deux fois = un seul tag (R38).
 */
export function mentionsValides(
  contenu: string,
  demandees: string[],
  enseignants: { id: string; prenom: string; actif: boolean }[],
): string[] {
  const texte = normaliserTexte(contenu);
  const out: string[] = [];
  for (const id of new Set(demandees)) {
    const e = enseignants.find((x) => x.id === id && x.actif);
    if (!e) continue;
    if (!texte.includes(`@${normaliserTexte(e.prenom)}`)) continue;
    out.push(id);
  }
  return out;
}

/** Échéance de la relance : tag + délai paramétré (12 h en production, §86). */
export function echeanceRelance(tagAt: string | Date, heures: number): Date {
  return new Date(new Date(tagAt).getTime() + heures * 3_600_000);
}

/* ─────────────────── Statistiques de réactivité (§30, §132) ─────────────────── */

export type TagStat = {
  statut: 'en_attente' | 'traitee' | 'annulee' | 'a_reaffecter';
  tag_at: string;
  repondu_at: string | null;
  relance_due_at?: string | null;
};

export type StatsReactivite = {
  tags: number;
  traitees: number;
  nonTraitees: number;
  delaiMoyenSecondes: number | null;
  delaiMedianSecondes: number | null;
  tauxReponse: number | null;
  tauxAvantSeuil: number | null;
  plusDeSeuil: number;
};

/**
 * Délai = première réponse valide − tag (§132), identique partout (tableau de
 * bord, statistiques, exports). Les tags annulés (question supprimée) sont
 * exclus du calcul.
 */
export function statsReactivite(tags: TagStat[], seuilHeures: number, now = Date.now()): StatsReactivite {
  const utiles = tags.filter((t) => t.statut !== 'annulee');
  const traitees = utiles.filter((t) => t.statut === 'traitee' && t.repondu_at);
  const delais = traitees
    .map((t) => (new Date(t.repondu_at as string).getTime() - new Date(t.tag_at).getTime()) / 1000)
    .filter((d) => d >= 0)
    .sort((a, b) => a - b);
  const seuil = seuilHeures * 3600;
  const median = delais.length === 0
    ? null
    : delais.length % 2 === 1
      ? delais[(delais.length - 1) / 2]
      : (delais[delais.length / 2 - 1] + delais[delais.length / 2]) / 2;
  const enRetardOuvertes = utiles.filter((t) => t.statut !== 'traitee' && now - new Date(t.tag_at).getTime() > seuil * 1000).length;
  const enRetardTraitees = delais.filter((d) => d > seuil).length;
  return {
    tags: utiles.length,
    traitees: traitees.length,
    nonTraitees: utiles.length - traitees.length,
    delaiMoyenSecondes: delais.length ? Math.round(delais.reduce((s, d) => s + d, 0) / delais.length) : null,
    delaiMedianSecondes: median === null ? null : Math.round(median),
    tauxReponse: utiles.length ? traitees.length / utiles.length : null,
    tauxAvantSeuil: utiles.length ? delais.filter((d) => d <= seuil).length / utiles.length : null,
    plusDeSeuil: enRetardOuvertes + enRetardTraitees,
  };
}

export function formaterDuree(secondes: number | null): string {
  if (secondes === null || !Number.isFinite(secondes)) return '—';
  const s = Math.max(0, Math.round(secondes));
  const j = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (j > 0) return `${j} j ${h} h`;
  if (h > 0) return `${h} h ${String(m).padStart(2, '0')}`;
  return `${m} min`;
}

/* ─────────────────────────── Identités affichées ─────────────────────────── */

export type ModeAffichageEleve = 'pseudo' | 'prenom' | 'prenom_initiale';

/** Nom d'un candidat dans le flux. Jamais d'e-mail ni d'identifiant (§117). */
export function nomEleve(
  p: { first_name: string | null; last_name: string | null; pseudo: string | null },
  mode: ModeAffichageEleve,
): string {
  const prenom = (p.first_name ?? '').trim().split(/\s+/)[0] ?? '';
  const initiale = (p.last_name ?? '').trim().charAt(0).toUpperCase();
  const pseudo = (p.pseudo ?? '').trim();
  if (mode === 'pseudo') return pseudo || (prenom ? `${prenom}${initiale ? ` ${initiale}.` : ''}` : 'Candidat');
  if (mode === 'prenom') return prenom || pseudo || 'Candidat';
  return prenom ? `${prenom}${initiale ? ` ${initiale}.` : ''}` : pseudo || 'Candidat';
}

/** « Thomas · Enseignant Cardiologie » — seule identité d'enseignant exposée (§14-16). */
export function libelleEnseignant(prenomPublic: string, qualite: string | null | undefined): string {
  const q = (qualite ?? '').trim() || 'Enseignant Major ECN';
  return `${prenomPublic.trim()} · ${q}`;
}

/** Hiérarchie de priorité des résultats de recherche (§123). */
export function rangRecherche(r: { source: 'bibliotheque' | 'message'; epingle?: boolean; auteurType?: string }): number {
  if (r.source === 'bibliotheque') return 0;
  if (r.epingle) return 1;
  if (r.auteurType === 'enseignant' || r.auteurType === 'equipe') return 2;
  return 3;
}
