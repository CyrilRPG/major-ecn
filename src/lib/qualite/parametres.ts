import { BLOCKING_SCOPES, FAMILLES, type BlockingScope, type Famille } from './types';

/**
 * Paramètres du module (§29) — valeurs par défaut du cahier des charges et
 * normalisation d'une configuration enregistrée (module PUR, testé).
 *
 * Règle de prudence : le module est livré ÉTEINT (`actif: false`). Tant que
 * l'administration ne l'a pas activé dans « Paramètres », aucun questionnaire
 * n'est créé, aucun e-mail ne part et rien n'est bloqué. À l'activation, la
 * date de démarrage est posée : aucune séance antérieure ne déclenche de
 * questionnaire à chaud rétroactif.
 */

export type ParametresFamille = {
  actif: boolean;
  /** Réponse exigée (sinon simple invitation). */
  obligatoire: boolean;
  blocking_scope: BlockingScope;
  /** Plus la valeur est haute, plus le questionnaire passe en premier (§27). */
  priorite: number;
  /** Délai d'expiration après l'envoi, en jours (null = pas d'expiration automatique). */
  expiration_jours: number | null;
  /** Relance e-mail après N jours sans réponse (null = aucune relance). */
  relance_jours: number | null;
};

export type ActionInactivite = 'rappel' | 'relance' | 'signalement' | 'accompagnement';

export const ACTION_INACTIVITE_LABEL: Record<ActionInactivite, string> = {
  rappel: 'Premier rappel pédagogique',
  relance: 'Relance personnalisée',
  signalement: 'Signalement au suivi administratif',
  accompagnement: "Proposition d'accompagnement individuel",
};

export type Parametres = {
  actif: boolean;
  /** Date d'activation (ISO) : rien d'antérieur ne déclenche d'enquête. */
  demarrage: string | null;
  familles: Record<Famille, ParametresFamille>;
  hot: {
    /** Part d'un replay à visionner pour le considérer « suffisamment complet » (§4.1). */
    seuil_replay: number;
    /** Délai après la fin d'une séance en direct avant l'envoi (minutes). */
    delai_apres_seance_min: number;
    /** Protection de la dernière ligne droite (§27). */
    neutraliser_avant_examen: boolean;
    jours_protection: number;
  };
  progress: {
    seuils: number[];
    /** Règle de calcul de la progression du parcours (§5.1, documentée dans la page). */
    mode: 'max' | 'pedagogique' | 'calendaire';
  };
  final: { jours_avant: number };
  post_exam: { jours_apres: number };
  follow_up: { mois_apres: number; validite_lien_jours: number };
  inactivite: {
    actif: boolean;
    paliers: { jours: number; action: ActionInactivite }[];
    /** Plafond d'e-mails par passage du balayage (montée en charge progressive). */
    max_emails_par_passage: number;
  };
  alertes: {
    email_critique: boolean;
    destinataires: string[];
    recap_vigilance: boolean;
    recurrence_seuil: number;
    recurrence_jours: number;
    /** Taux de réponse (%) en dessous duquel une famille est signalée. */
    taux_reponse_min: number;
    /** Nombre minimal de questionnaires attendus avant de juger un taux. */
    taux_reponse_effectif_min: number;
  };
  ia: { actif: boolean };
  candidat: {
    /** Report du blocage que le candidat peut demander lui-même (problème technique), en heures. */
    report_technique_heures: number;
    /** Nombre de reports autorisés par questionnaire. */
    report_max: number;
  };
};

export const PARAMETRES_DEFAUT: Parametres = {
  actif: false,
  demarrage: null,
  familles: {
    HOT: { actif: true, obligatoire: true, blocking_scope: 'activites', priorite: 30, expiration_jours: 14, relance_jours: null },
    PROGRESS: { actif: true, obligatoire: true, blocking_scope: 'activites', priorite: 60, expiration_jours: 30, relance_jours: 5 },
    FINAL: { actif: true, obligatoire: true, blocking_scope: 'activites', priorite: 100, expiration_jours: null, relance_jours: 1 },
    POST_EXAM: { actif: true, obligatoire: false, blocking_scope: 'aucun', priorite: 50, expiration_jours: 30, relance_jours: 7 },
    FOLLOW_UP: { actif: true, obligatoire: false, blocking_scope: 'aucun', priorite: 40, expiration_jours: 60, relance_jours: 14 },
    FUNDER_SURVEY: { actif: false, obligatoire: false, blocking_scope: 'aucun', priorite: 20, expiration_jours: 30, relance_jours: 7 },
  },
  hot: { seuil_replay: 0.8, delai_apres_seance_min: 10, neutraliser_avant_examen: true, jours_protection: 7 },
  progress: { seuils: [33, 66], mode: 'max' },
  final: { jours_avant: 3 },
  post_exam: { jours_apres: 3 },
  follow_up: { mois_apres: 6, validite_lien_jours: 60 },
  inactivite: {
    actif: true,
    paliers: [
      { jours: 7, action: 'rappel' },
      { jours: 10, action: 'relance' },
      { jours: 15, action: 'signalement' },
      { jours: 21, action: 'accompagnement' },
    ],
    max_emails_par_passage: 80,
  },
  alertes: {
    email_critique: true,
    destinataires: [],
    recap_vigilance: true,
    recurrence_seuil: 3,
    recurrence_jours: 30,
    taux_reponse_min: 60,
    taux_reponse_effectif_min: 10,
  },
  ia: { actif: true },
  candidat: { report_technique_heures: 24, report_max: 1 },
};

const borne = (v: unknown, min: number, max: number, defaut: number): number => {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
  if (!Number.isFinite(n)) return defaut;
  return Math.min(max, Math.max(min, n));
};
const bool = (v: unknown, defaut: boolean): boolean => (typeof v === 'boolean' ? v : defaut);
const nulBorne = (v: unknown, min: number, max: number, defaut: number | null): number | null =>
  v === null ? null : v === undefined ? defaut : borne(v, min, max, defaut ?? min);

function obj(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

/**
 * Configuration enregistrée (éventuellement partielle, ancienne ou corrompue)
 * → configuration complète et bornée. Une clé absente prend la valeur par
 * défaut du code : de nouveaux réglages s'appliquent sans migration.
 */
export function normaliserParametres(brut: unknown): Parametres {
  const r = obj(brut);
  const d = PARAMETRES_DEFAUT;
  const familles = {} as Record<Famille, ParametresFamille>;
  const rf = obj(r.familles);
  for (const f of FAMILLES) {
    const x = obj(rf[f]);
    const df = d.familles[f];
    const scope = typeof x.blocking_scope === 'string' && (BLOCKING_SCOPES as readonly string[]).includes(x.blocking_scope)
      ? (x.blocking_scope as BlockingScope) : df.blocking_scope;
    const obligatoire = bool(x.obligatoire, df.obligatoire);
    familles[f] = {
      actif: bool(x.actif, df.actif),
      obligatoire,
      // Un questionnaire facultatif ne peut rien bloquer.
      blocking_scope: obligatoire ? scope : 'aucun',
      priorite: Math.round(borne(x.priorite, 0, 1000, df.priorite)),
      expiration_jours: nulBorne(x.expiration_jours, 1, 365, df.expiration_jours),
      relance_jours: nulBorne(x.relance_jours, 1, 90, df.relance_jours),
    };
  }
  const hot = obj(r.hot);
  const progress = obj(r.progress);
  const seuilsBruts = Array.isArray(progress.seuils) ? progress.seuils : d.progress.seuils;
  const seuils = Array.from(new Set(seuilsBruts.map((s) => Math.round(borne(s, 1, 99, NaN))).filter((s) => Number.isFinite(s)))).sort((a, b) => a - b);
  const mode = progress.mode === 'pedagogique' || progress.mode === 'calendaire' || progress.mode === 'max' ? progress.mode : d.progress.mode;
  const inact = obj(r.inactivite);
  const paliersBruts = Array.isArray(inact.paliers) ? inact.paliers : d.inactivite.paliers;
  const actions: ActionInactivite[] = ['rappel', 'relance', 'signalement', 'accompagnement'];
  const paliers = paliersBruts
    .map((p) => obj(p))
    .filter((p) => typeof p.action === 'string' && (actions as string[]).includes(p.action as string))
    .map((p) => ({ jours: Math.round(borne(p.jours, 1, 365, 7)), action: p.action as ActionInactivite }))
    .sort((a, b) => a.jours - b.jours);
  const al = obj(r.alertes);
  const destinataires = (Array.isArray(al.destinataires) ? al.destinataires : [])
    .filter((x): x is string => typeof x === 'string')
    .map((x) => x.trim().toLowerCase())
    .filter((x) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x));
  const fu = obj(r.follow_up);
  const cand = obj(r.candidat);
  return {
    actif: bool(r.actif, d.actif),
    demarrage: typeof r.demarrage === 'string' && !Number.isNaN(Date.parse(r.demarrage)) ? r.demarrage : null,
    familles,
    hot: {
      seuil_replay: borne(hot.seuil_replay, 0.3, 1, d.hot.seuil_replay),
      delai_apres_seance_min: Math.round(borne(hot.delai_apres_seance_min, 0, 24 * 60, d.hot.delai_apres_seance_min)),
      neutraliser_avant_examen: bool(hot.neutraliser_avant_examen, d.hot.neutraliser_avant_examen),
      jours_protection: Math.round(borne(hot.jours_protection, 0, 30, d.hot.jours_protection)),
    },
    progress: { seuils: seuils.length ? seuils : d.progress.seuils, mode },
    final: { jours_avant: Math.round(borne(obj(r.final).jours_avant, 1, 30, d.final.jours_avant)) },
    post_exam: { jours_apres: Math.round(borne(obj(r.post_exam).jours_apres, 1, 60, d.post_exam.jours_apres)) },
    follow_up: {
      mois_apres: Math.round(borne(fu.mois_apres, 1, 36, d.follow_up.mois_apres)),
      validite_lien_jours: Math.round(borne(fu.validite_lien_jours, 7, 365, d.follow_up.validite_lien_jours)),
    },
    inactivite: {
      actif: bool(inact.actif, d.inactivite.actif),
      paliers: paliers.length ? paliers : d.inactivite.paliers,
      max_emails_par_passage: Math.round(borne(inact.max_emails_par_passage, 0, 1000, d.inactivite.max_emails_par_passage)),
    },
    alertes: {
      email_critique: bool(al.email_critique, d.alertes.email_critique),
      destinataires,
      recap_vigilance: bool(al.recap_vigilance, d.alertes.recap_vigilance),
      recurrence_seuil: Math.round(borne(al.recurrence_seuil, 2, 50, d.alertes.recurrence_seuil)),
      recurrence_jours: Math.round(borne(al.recurrence_jours, 1, 365, d.alertes.recurrence_jours)),
      taux_reponse_min: Math.round(borne(al.taux_reponse_min, 0, 100, d.alertes.taux_reponse_min)),
      taux_reponse_effectif_min: Math.round(borne(al.taux_reponse_effectif_min, 1, 1000, d.alertes.taux_reponse_effectif_min)),
    },
    ia: { actif: bool(obj(r.ia).actif, d.ia.actif) },
    candidat: {
      report_technique_heures: Math.round(borne(cand.report_technique_heures, 1, 168, d.candidat.report_technique_heures)),
      report_max: Math.round(borne(cand.report_max, 0, 10, d.candidat.report_max)),
    },
  };
}

/** Différences lisibles entre deux configurations (historique §29). */
export function differencesParametres(avant: Parametres, apres: Parametres): string[] {
  const out: string[] = [];
  const parcourir = (a: unknown, b: unknown, chemin: string) => {
    if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
      const cles = new Set([...Object.keys(a as object), ...Object.keys(b as object)]);
      for (const k of cles) parcourir((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], chemin ? `${chemin}.${k}` : k);
      return;
    }
    if (JSON.stringify(a) !== JSON.stringify(b)) out.push(`${chemin} : ${JSON.stringify(a)} → ${JSON.stringify(b)}`);
  };
  parcourir(avant, apres, '');
  return out;
}
