/**
 * Alertes automatiques du suivi élèves (cahier des charges 18/09/2026, §3) :
 * absence de connexion, progression insuffisante, aucun QCM / cas réalisé,
 * cours ou replays non consultés, retard important, échéance de concours
 * proche, plusieurs alertes simultanées.
 *
 * Module PUR : calculé à la volée depuis les signaux d'un élève, sans table
 * ni cron — ce que voit le collaborateur est toujours l'état du moment.
 */

export type TypeAlerte =
  | 'inactivite'
  | 'progression_faible'
  | 'aucun_qcm'
  | 'cours_non_consultes'
  | 'retard_important'
  | 'echeance_proche'
  | 'cumul';

export const ALERTE_LABEL: Record<TypeAlerte, string> = {
  inactivite: 'Absence de connexion',
  progression_faible: 'Progression insuffisante',
  aucun_qcm: 'Aucun QCM / cas réalisé',
  cours_non_consultes: 'Cours / replays non consultés',
  retard_important: 'Retard important',
  echeance_proche: 'Échéance de concours proche',
  cumul: 'Plusieurs alertes simultanées',
};

export type SeuilsAlertes = {
  /** Jours sans connexion avant l'alerte « absence de connexion ». */
  joursInactivite: number;
  /** Jours sans la moindre activité avant « retard important ». */
  joursRetard: number;
  /** Progression (%) en dessous de laquelle on alerte, après `joursAvantProgression` jours d'inscription. */
  progressionMinimale: number;
  joursAvantProgression: number;
  /** Ancienneté minimale (jours) avant d'alerter sur l'absence de QCM ou de cours. */
  joursAvantContenu: number;
  /** Fenêtre (jours) avant le concours qui rend l'échéance « proche ». */
  joursAvantEcheance: number;
};

export const SEUILS_PAR_DEFAUT: SeuilsAlertes = {
  joursInactivite: 10,
  joursRetard: 21,
  progressionMinimale: 20,
  joursAvantProgression: 30,
  joursAvantContenu: 7,
  joursAvantEcheance: 30,
};

export type SignauxEleve = {
  inscritLe: string;
  derniereConnexion: string | null;
  derniereActivite: string | null;
  /** 0-100, ou null si inconnue. */
  progression: number | null;
  qcmFaits: number;
  videosVues: number;
  fichesLues: number;
  dateConcours: string | null;
};

export type AlerteCalculee = { type: TypeAlerte; detail: string; gravite: 1 | 2 | 3 };

const JOUR = 86_400_000;
const joursDepuis = (iso: string | null, now: number): number | null => {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? Math.floor((now - t) / JOUR) : null;
};

export function calculerAlertes(s: SignauxEleve, seuils: SeuilsAlertes = SEUILS_PAR_DEFAUT, now = Date.now()): AlerteCalculee[] {
  const out: AlerteCalculee[] = [];
  const anciennete = joursDepuis(s.inscritLe, now) ?? 0;
  const sansConnexion = s.derniereConnexion ? joursDepuis(s.derniereConnexion, now) : anciennete;
  const sansActivite = s.derniereActivite ? joursDepuis(s.derniereActivite, now) : anciennete;

  if (sansActivite !== null && sansActivite >= seuils.joursRetard && anciennete >= seuils.joursRetard) {
    out.push({ type: 'retard_important', detail: `Aucune activité depuis ${sansActivite} jours`, gravite: 3 });
  } else if (sansConnexion !== null && sansConnexion >= seuils.joursInactivite && anciennete >= seuils.joursInactivite) {
    out.push({ type: 'inactivite', detail: s.derniereConnexion ? `Dernière connexion il y a ${sansConnexion} jours` : `Jamais connecté depuis ${anciennete} jours`, gravite: 2 });
  }
  if (anciennete >= seuils.joursAvantContenu) {
    if (s.qcmFaits === 0) out.push({ type: 'aucun_qcm', detail: 'Aucun QCM ni dossier réalisé', gravite: 2 });
    if (s.videosVues === 0 && s.fichesLues === 0) out.push({ type: 'cours_non_consultes', detail: 'Ni cours ni replay consulté', gravite: 1 });
  }
  if (s.progression !== null && anciennete >= seuils.joursAvantProgression && s.progression < seuils.progressionMinimale) {
    out.push({ type: 'progression_faible', detail: `${Math.round(s.progression)} % du programme abordé après ${anciennete} jours`, gravite: 2 });
  }
  const versConcours = s.dateConcours ? -(joursDepuis(s.dateConcours, now) ?? 0) : null;
  if (versConcours !== null && versConcours >= 0 && versConcours <= seuils.joursAvantEcheance && (out.length > 0 || (s.progression !== null && s.progression < 50))) {
    out.push({ type: 'echeance_proche', detail: `Concours dans ${versConcours} jour${versConcours > 1 ? 's' : ''}`, gravite: 3 });
  }
  if (out.length >= 2) out.push({ type: 'cumul', detail: `${out.length} alertes en même temps`, gravite: 3 });
  return out.sort((a, b) => b.gravite - a.gravite);
}

/** Niveau d'activité lisible (colonne du tableau de travail). */
export function niveauActivite(s: Pick<SignauxEleve, 'derniereActivite' | 'qcmFaits' | 'videosVues' | 'fichesLues'>, now = Date.now()): 'fort' | 'moyen' | 'faible' | 'nul' {
  const total = s.qcmFaits + s.videosVues + s.fichesLues;
  const recent = joursDepuis(s.derniereActivite, now);
  if (total === 0 || recent === null) return 'nul';
  if (recent <= 7 && total >= 20) return 'fort';
  if (recent <= 21 && total >= 5) return 'moyen';
  return 'faible';
}
