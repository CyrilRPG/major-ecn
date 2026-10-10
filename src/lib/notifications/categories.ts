/**
 * Centre de notifications — catalogue des catégories (module PUR, partagé
 * avec l'application mobile).
 *
 * Chaque catégorie a deux canaux indépendants : sur l'application (cloche,
 * et notifications de l'appareil) et par e-mail. Pour l'e-mail, l'élève
 * choisit l'envoi immédiat ou le récapitulatif du soir. Les valeurs par défaut
 * reprennent la maquette validée par Major ECN.
 */

export type CategorieNotif =
  | 'chat' | 'teacher' | 'mention' | 'annonces'
  | 'video' | 'support' | 'update' | 'qcm' | 'cases'
  | 'schedule' | 'zoom' | 'live'
  | 'exam' | 'planning';

export type ModeEmail = 'immediat' | 'quotidien';

export type ReglageCategorie = { app: boolean; email: boolean; mode: ModeEmail };

export type SectionNotif = {
  cle: 'echanges' | 'cours' | 'agenda' | 'suivi';
  titre: string;
  categories: { cle: CategorieNotif; label: string; aide: string; defaut: ReglageCategorie }[];
};

export const SECTIONS_NOTIF: SectionNotif[] = [
  {
    cle: 'echanges',
    titre: 'Échanges',
    categories: [
      { cle: 'chat', label: 'Nouveaux messages des candidats', aide: 'Dans les groupes où Major ECN active l’alerte à chaque message.', defaut: { app: false, email: false, mode: 'quotidien' } },
      { cle: 'teacher', label: 'Réponses des enseignants', aide: 'Un enseignant a répondu à votre question.', defaut: { app: true, email: false, mode: 'immediat' } },
      { cle: 'mention', label: 'Mentions personnelles dans le chat', aide: 'Quelqu’un a répondu à l’un de vos messages.', defaut: { app: true, email: false, mode: 'immediat' } },
      { cle: 'annonces', label: 'Annonces Major ECN', aide: 'Nouvelles annonces de votre promotion. Les annonces marquées « Important » vous parviennent toujours.', defaut: { app: true, email: false, mode: 'quotidien' } },
    ],
  },
  {
    cle: 'cours',
    titre: 'Cours et ressources',
    categories: [
      { cle: 'video', label: 'Nouvelles vidéos et replays', aide: 'Une vidéo de vos items vient d’être mise en ligne.', defaut: { app: true, email: false, mode: 'quotidien' } },
      { cle: 'support', label: 'Nouveaux supports de cours', aide: 'Fiches et supports ajoutés à vos items.', defaut: { app: true, email: false, mode: 'quotidien' } },
      { cle: 'update', label: 'Supports et cours modifiés', aide: 'Mises à jour significatives annoncées par l’équipe (jamais les simples corrections).', defaut: { app: true, email: false, mode: 'quotidien' } },
      { cle: 'qcm', label: 'Nouveaux QCM', aide: 'Regroupés : « 40 nouveaux QCM disponibles » plutôt que 40 alertes.', defaut: { app: true, email: false, mode: 'quotidien' } },
      { cle: 'cases', label: 'Nouveaux dossiers et cas cliniques', aide: 'Dossiers progressifs ajoutés à vos items.', defaut: { app: true, email: false, mode: 'quotidien' } },
    ],
  },
  {
    cle: 'agenda',
    titre: 'Agenda et cours en direct',
    categories: [
      { cle: 'schedule', label: 'Modifications de l’agenda', aide: 'Nouvelle séance ou séance déplacée.', defaut: { app: true, email: true, mode: 'immediat' } },
      { cle: 'zoom', label: 'Nouveaux liens Zoom', aide: 'Le lien de connexion d’une séance est disponible.', defaut: { app: true, email: true, mode: 'immediat' } },
      { cle: 'live', label: 'Rappels des séances en direct', aide: 'Un rappel avant chaque séance en direct.', defaut: { app: true, email: false, mode: 'immediat' } },
    ],
  },
  {
    cle: 'suivi',
    titre: 'Suivi pédagogique',
    categories: [
      { cle: 'exam', label: 'Nouveaux concours blancs et évaluations', aide: 'Une épreuve blanche ou une évaluation vous est ouverte.', defaut: { app: true, email: false, mode: 'immediat' } },
      { cle: 'planning', label: 'Alertes du planificateur', aide: 'Révisions ajoutées, items consolidés, reprise de votre programme.', defaut: { app: true, email: false, mode: 'quotidien' } },
    ],
  },
];

export const CATEGORIES: CategorieNotif[] = SECTIONS_NOTIF.flatMap((s) => s.categories.map((c) => c.cle));

export const LIBELLE_CATEGORIE: Record<CategorieNotif, string> = Object.fromEntries(
  SECTIONS_NOTIF.flatMap((s) => s.categories.map((c) => [c.cle, c.label])),
) as Record<CategorieNotif, string>;

export type Preferences = {
  appActif: boolean;
  emailActif: boolean;
  categories: Record<CategorieNotif, ReglageCategorie>;
};

export function preferencesParDefaut(): Preferences {
  const categories = {} as Record<CategorieNotif, ReglageCategorie>;
  for (const s of SECTIONS_NOTIF) for (const c of s.categories) categories[c.cle] = { ...c.defaut };
  return { appActif: true, emailActif: true, categories };
}

/**
 * Lecture tolérante de la ligne stockée. Accepte aussi le format de la
 * maquette (`{ pushEnabled, emailEnabled, preferences: { chat: [app, email] } }`).
 */
export function lirePreferences(row: { app_actif?: boolean | null; email_actif?: boolean | null; prefs?: unknown } | null | undefined): Preferences {
  const p = preferencesParDefaut();
  if (!row) return p;
  if (typeof row.app_actif === 'boolean') p.appActif = row.app_actif;
  if (typeof row.email_actif === 'boolean') p.emailActif = row.email_actif;
  const brut = row.prefs && typeof row.prefs === 'object' ? (row.prefs as Record<string, unknown>) : {};
  for (const cle of CATEGORIES) {
    const v = brut[cle];
    if (Array.isArray(v)) {
      if (typeof v[0] === 'boolean') p.categories[cle].app = v[0];
      if (typeof v[1] === 'boolean') p.categories[cle].email = v[1];
    } else if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>;
      if (typeof o.app === 'boolean') p.categories[cle].app = o.app;
      if (typeof o.email === 'boolean') p.categories[cle].email = o.email;
      if (o.mode === 'immediat' || o.mode === 'quotidien') p.categories[cle].mode = o.mode;
    }
  }
  return p;
}

export function serialiserPreferences(p: Preferences): { app_actif: boolean; email_actif: boolean; prefs: Record<string, ReglageCategorie> } {
  return { app_actif: p.appActif, email_actif: p.emailActif, prefs: { ...p.categories } };
}

/** Canaux effectifs pour une notification (règle unique, testée). */
export function canauxPour(
  p: Preferences,
  categorie: CategorieNotif,
  opts: { prioritaire?: boolean } = {},
): { app: boolean; email: boolean; mode: ModeEmail } {
  const c = p.categories[categorie];
  if (opts.prioritaire) {
    // Annonce « Important » : toujours dans l'application ; par e-mail sauf si
    // l'élève a coupé TOUS les e-mails (préférence générale).
    return { app: true, email: p.emailActif, mode: 'immediat' };
  }
  return { app: p.appActif && c.app, email: p.emailActif && c.email, mode: c.mode };
}

/** Catégorie d'une notification existante de la cloche (moteur, agenda…). */
export function categorieDuKind(kind: string): CategorieNotif | null {
  if (kind === 'agenda_seance') return 'schedule';
  if (kind === 'agenda_lien') return 'zoom';
  if (kind === 'agenda_rappel') return 'live';
  if (kind.startsWith('echanges_')) {
    const c = kind.slice('echanges_'.length);
    if (c === 'reponse_enseignant') return 'teacher';
    if (c === 'mention') return 'mention';
    if (c === 'messages') return 'chat';
    if (c === 'annonce') return 'annonces';
    return null; // avertissements, annonces importantes : toujours affichés
  }
  if (kind.startsWith('contenu_')) {
    const c = kind.slice('contenu_'.length) as CategorieNotif;
    return CATEGORIES.includes(c) ? c : null;
  }
  if (['reprise_confirmee', 'items_ajoutes_revisions', 'items_consolides', 'plan_alerte'].includes(kind) || kind.startsWith('plan_') || kind.startsWith('moteur_')) return 'planning';
  return null;
}
