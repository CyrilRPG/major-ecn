/**
 * Historique des évaluations — module PUR (aucun accès réseau) : libellés,
 * normalisation des lignes de la vue `evaluations_historique`, statut lisible,
 * évolution d'une évaluation à l'autre, points de la courbe, filtres et
 * tables d'export. Partagé par l'espace élève, l'administration et les
 * exports (CSV, Excel, PDF) : une seule règle, un seul résultat.
 *
 * Les notes restent dans leurs tables d'origine ; la vue les rassemble, une
 * ligne par tentative (y compris les tentatives archivées), sans doublon.
 */

export type EvalSource = 'checkup' | 'epreuve' | 'interrogation_cours' | 'parcours_major' | 'transversale';
export type EvalType = 'diagnostic' | 'concours_blanc' | 'interrogation' | 'suivi' | 'methodologie' | 'entrainement';
export type EvalStatut = 'commence' | 'termine' | 'non_termine';
export type ArchiveRaison = 'nouvelle_tentative' | 'suppression' | 'reinitialisation';

/** Une tentative, telle que la renvoie la vue (nombres normalisés). */
export type Evaluation = {
  cle: string;
  source: EvalSource;
  sourceId: string;
  archiveId: string | null;
  userId: string;
  type: EvalType;
  intitule: string;
  specialiteId: string | null;
  specialite: string | null;
  voie: string | null;
  examId: string | null;
  coursId: string | null;
  numero: number | null;
  debut: string | null;
  fin: string | null;
  date: string;
  statut: EvalStatut;
  etat: string;
  score: number | null;
  scoreMax: number | null;
  pourcentage: number | null;
  dureeSecondes: number | null;
  nbQuestions: number | null;
  resultatsVisibles: boolean;
  detail: Record<string, unknown>;
  archive: boolean;
  archiveRaison: ArchiveRaison | null;
  archiveLe: string | null;
  archiveMotif: string | null;
  archiveAuteur: string | null;
  prenom: string | null;
  nom: string | null;
  email: string | null;
  promotion: string | null;
};

/** Colonnes lues dans la vue (une seule liste pour toutes les lectures). */
export const COLONNES_VUE =
  'cle, source, source_id, archive_id, user_id, type, intitule, specialite_id, specialite_nom, voie_candidat, exam_id, cours_id, numero, debut, fin, date_evaluation, statut, etat, score, score_max, pourcentage, duree_secondes, nb_questions, resultats_visibles, detail, archive, archive_raison, archive_le, archive_motif, archive_auteur, first_name, last_name, email, promotion';

const nombre = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const texte = (v: unknown): string | null => (typeof v === 'string' && v !== '' ? v : null);

/** Ligne brute de la vue → Evaluation. */
export function normaliser(r: Record<string, unknown>): Evaluation {
  return {
    cle: String(r.cle),
    source: r.source as EvalSource,
    sourceId: String(r.source_id),
    archiveId: texte(r.archive_id),
    userId: String(r.user_id),
    type: r.type as EvalType,
    intitule: texte(r.intitule) ?? 'Évaluation',
    specialiteId: texte(r.specialite_id),
    specialite: texte(r.specialite_nom),
    voie: texte(r.voie_candidat),
    examId: texte(r.exam_id),
    coursId: texte(r.cours_id),
    numero: nombre(r.numero),
    debut: texte(r.debut),
    fin: texte(r.fin),
    date: String(r.date_evaluation ?? r.fin ?? r.debut ?? ''),
    statut: r.statut as EvalStatut,
    etat: texte(r.etat) ?? '',
    score: nombre(r.score),
    scoreMax: nombre(r.score_max),
    pourcentage: nombre(r.pourcentage),
    dureeSecondes: nombre(r.duree_secondes),
    nbQuestions: nombre(r.nb_questions),
    resultatsVisibles: r.resultats_visibles !== false,
    detail: r.detail && typeof r.detail === 'object' ? (r.detail as Record<string, unknown>) : {},
    archive: r.archive === true,
    archiveRaison: (texte(r.archive_raison) as ArchiveRaison | null),
    archiveLe: texte(r.archive_le),
    archiveMotif: texte(r.archive_motif),
    archiveAuteur: texte(r.archive_auteur),
    prenom: texte(r.first_name),
    nom: texte(r.last_name),
    email: texte(r.email),
    promotion: texte(r.promotion),
  };
}

/* ─── Libellés ─── */

/** Nature de l'évaluation (exports, administration). */
export const TYPE_LABEL: Record<EvalType, string> = {
  diagnostic: 'Évaluation diagnostique (EVC Check-up)',
  concours_blanc: 'Épreuve blanche',
  interrogation: 'Interrogation',
  suivi: 'Évaluation de suivi',
  methodologie: 'Parcours du Major',
  entrainement: 'Entraînement (révision transversale)',
};

/** Libellé court (badges, filtres). */
export const TYPE_COURT: Record<EvalType, string> = {
  diagnostic: 'Check-up',
  concours_blanc: 'Épreuve blanche',
  interrogation: 'Interrogation',
  suivi: 'Suivi',
  methodologie: 'Parcours du Major',
  entrainement: 'Entraînement',
};

/** Ordre d'affichage des natures (filtres, légendes). */
export const TYPES_ORDRE: EvalType[] = ['diagnostic', 'concours_blanc', 'interrogation', 'suivi', 'methodologie', 'entrainement'];

/** Couleur de chaque nature (courbe, badges) — jamais emerald/teal (rendus rouges par le thème). */
export const TYPE_COULEUR: Record<EvalType, string> = {
  diagnostic: '#E4002B',
  concours_blanc: '#14254E',
  interrogation: '#7C3AED',
  suivi: '#D97706',
  methodologie: '#16A34A',
  entrainement: '#64748B',
};

export const STATUT_LABEL: Record<EvalStatut, string> = {
  commence: 'Commencé',
  termine: 'Terminé',
  non_termine: 'Non terminé',
};

export const ARCHIVE_LABEL: Record<ArchiveRaison, string> = {
  nouvelle_tentative: 'Tentative précédente (remplacée par une reprise)',
  suppression: 'Supprimée — conservée dans l’historique',
  reinitialisation: 'Réinitialisée — conservée dans l’historique',
};

const ETAT_LABEL: Record<string, string> = {
  pending_self_review: 'Auto-correction des questions rédactionnelles en attente',
  expired: 'Temps écoulé',
  abandoned: 'Abandonné',
  cancelled_technical: 'Neutralisé (incident technique)',
  submitted: 'Correction en cours',
  absent: 'Absent',
  in_progress: 'En cours',
  active: 'En cours',
  maitrise: 'Maîtrisé',
  en_bonne_voie: 'En bonne voie',
  a_retravailler: 'À retravailler',
};

/** Précision sur l'état (sous le statut) : « Temps écoulé », « Neutralisé »… */
export function precisionEtat(e: Pick<Evaluation, 'etat' | 'archiveRaison'>): string | null {
  if (e.archiveRaison) return ARCHIVE_LABEL[e.archiveRaison];
  return ETAT_LABEL[e.etat] ?? null;
}

/* ─── Formats ─── */

const nf = (n: number, max = 2) => n.toLocaleString('fr-FR', { maximumFractionDigits: max }).replace(/ /g, ' ');

/** La note est-elle montrée ? (élève : jamais avant la publication des résultats). */
export function noteVisible(e: Evaluation, pourEleve: boolean): boolean {
  if (pourEleve && !e.resultatsVisibles) return false;
  return e.statut === 'termine' && e.pourcentage !== null;
}

/** « 27,6 / 40 pts », « 7,5 / 10 », « 8 / 10 QCM »… ; null si pas de note. */
export function formatNote(e: Evaluation): string | null {
  if (e.score === null) return null;
  const max = e.scoreMax !== null ? ` / ${nf(e.scoreMax)}` : '';
  if (e.source === 'checkup') return `${nf(e.score)}${max} pts`;
  if (e.source === 'transversale') return `${nf(e.score, 0)}${max} bonnes réponses`;
  return `${nf(e.score)}${max}`;
}

export function formatPourcentage(p: number | null): string {
  return p === null ? '—' : `${nf(p, 1)} %`;
}

/** Durée lisible : « 16 min », « 1 h 05 », « 45 s ». */
export function formatDuree(sec: number | null): string {
  if (sec === null || sec < 0) return '—';
  if (sec < 60) return `${Math.round(sec)} s`;
  const m = Math.round(sec / 60);
  return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : `${m} min`;
}

const PARIS = 'Europe/Paris';
/** « 05/10/2026 » (heure de Paris). */
export function formatJour(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { timeZone: PARIS, day: '2-digit', month: '2-digit', year: 'numeric' });
}
/** « 22:35 » (heure de Paris). */
export function formatHeure(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('fr-FR', { timeZone: PARIS, hour: '2-digit', minute: '2-digit' });
}
/** Jour civil de Paris « AAAA-MM-JJ » d'un instant (jamais toISOString : décalage de fuseau). */
export function jourParis(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: PARIS });
}

/* ─── Évolution et courbe ─── */

/**
 * Évolution de chaque évaluation notée par rapport à la PRÉCÉDENTE de même
 * nature (Check-up après Check-up, épreuve après épreuve…), en points de
 * pourcentage. Comparer un Check-up à un niveau du Parcours n'aurait pas de
 * sens. `pourEleve` : les notes non publiées ne comptent pas.
 */
export function evolutions(liste: Evaluation[], pourEleve = false): Map<string, number | null> {
  const res = new Map<string, number | null>();
  const notees = liste.filter((e) => noteVisible(e, pourEleve)).sort((a, b) => a.date.localeCompare(b.date) || a.cle.localeCompare(b.cle));
  const precedente = new Map<EvalType, number>();
  for (const e of notees) {
    const p = precedente.get(e.type);
    res.set(e.cle, p === undefined ? null : Math.round((e.pourcentage! - p) * 10) / 10);
    precedente.set(e.type, e.pourcentage!);
  }
  return res;
}

export function formatEvolution(d: number | null | undefined): string {
  if (d === null || d === undefined) return '—';
  if (d === 0) return '=';
  return `${d > 0 ? '+' : '−'}${nf(Math.abs(d), 1)} pt${Math.abs(d) >= 2 ? 's' : ''}`;
}

export type PointCourbe = { cle: string; t: number; date: string; pourcentage: number; type: EvalType; intitule: string; note: string | null };

/** Points de la courbe : évaluations terminées et notées, dans l'ordre chronologique. */
export function pointsCourbe(liste: Evaluation[], pourEleve = false): PointCourbe[] {
  return liste
    .filter((e) => noteVisible(e, pourEleve))
    .map((e) => ({ cle: e.cle, t: Date.parse(e.date), date: e.date, pourcentage: e.pourcentage!, type: e.type, intitule: e.intitule, note: formatNote(e) }))
    .filter((p) => Number.isFinite(p.t))
    .sort((a, b) => a.t - b.t || a.cle.localeCompare(b.cle));
}

/* ─── Détail ─── */

/**
 * Page où s'ouvre le détail d'une tentative (correction, analyse), ou null :
 * le détail s'affiche alors sur place (tentative archivée, révision
 * transversale, niveau du Parcours vu par l'administration).
 */
export function lienDetail(e: Evaluation, mode: 'eleve' | 'admin'): string | null {
  if (e.archive) return null;
  if (mode === 'admin') {
    if (e.source === 'checkup' && e.statut !== 'commence') return `/admin/resultats/checkup/${e.sourceId}`;
    if (e.source === 'epreuve' && e.examId) return `/admin/epreuves-blanches/${e.examId}/resultats`;
    return null;
  }
  switch (e.source) {
    case 'checkup':
      return e.etat === 'active' ? `/checkup/${e.sourceId}` : e.etat === 'pending_self_review' ? `/checkup/${e.sourceId}/correction` : `/checkup/${e.sourceId}/resultat`;
    case 'epreuve':
      if (e.coursId) return `/cours/${e.coursId}/interrogation`;
      if (e.type === 'interrogation' && e.specialiteId) return `/matieres/${e.specialiteId}/evaluation`;
      return e.examId ? `/epreuves-blanches/${e.examId}` : null;
    case 'interrogation_cours':
      return e.coursId ? `/cours/${e.coursId}/interrogation` : null;
    case 'parcours_major':
      return e.numero !== null ? `/parcours/${e.numero}` : null;
    default:
      return null;
  }
}

/** Version élève d'une ligne : rien de ce qui n'est pas publié ne quitte le serveur. */
export function pourEleve(e: Evaluation): Evaluation {
  const masque = !e.resultatsVisibles;
  return {
    ...e,
    score: masque ? null : e.score,
    scoreMax: masque ? null : e.scoreMax,
    pourcentage: masque ? null : e.pourcentage,
    detail: masque ? {} : e.detail,
    archiveAuteur: null,
    prenom: null, nom: null, email: null, promotion: null,
  };
}

/* ─── Filtres ─── */

export type Filtres = {
  du?: string | null;   // AAAA-MM-JJ inclus (heure de Paris)
  au?: string | null;   // AAAA-MM-JJ inclus
  types?: EvalType[];   // vide = toutes les évaluations (hors entraînement, sauf `entrainement`)
  entrainement?: boolean;
  specialite?: string | null;
  statut?: EvalStatut | null;
};

/** Le filtre appliqué à l'écran ET aux exports : une sélection, un résultat. */
export function filtrer(liste: Evaluation[], f: Filtres): Evaluation[] {
  return liste.filter((e) => {
    if (f.types && f.types.length > 0) {
      if (!f.types.includes(e.type)) return false;
    } else if (!f.entrainement && e.type === 'entrainement') return false;
    if (f.specialite && e.specialiteId !== f.specialite) return false;
    if (f.statut && e.statut !== f.statut) return false;
    if (f.du || f.au) {
      if (!e.date) return false;
      const j = jourParis(e.date);
      if (f.du && j < f.du) return false;
      if (f.au && j > f.au) return false;
    }
    return true;
  });
}

const JOUR = /^\d{4}-\d{2}-\d{2}$/;
/** Filtres depuis l'URL (écrans et route d'export). */
export function filtresDepuisQuery(q: URLSearchParams | Record<string, string | string[] | undefined>): Filtres {
  const get = (k: string): string | null => {
    const v = q instanceof URLSearchParams ? q.get(k) : q[k];
    const s = Array.isArray(v) ? v[0] : v;
    return s && s.trim() ? s.trim() : null;
  };
  const types = (get('type') ?? '').split(',').filter((t): t is EvalType => (TYPES_ORDRE as string[]).includes(t));
  const statut = get('statut');
  const du = get('du'), au = get('au');
  return {
    du: du && JOUR.test(du) ? du : null,
    au: au && JOUR.test(au) ? au : null,
    types,
    entrainement: get('entrainement') === '1',
    specialite: get('specialite'),
    statut: statut === 'commence' || statut === 'termine' || statut === 'non_termine' ? statut : null,
  };
}

/** « du 01/09/2026 au 06/10/2026 », « depuis le … », « toute la période ». */
export function libellePeriode(f: Pick<Filtres, 'du' | 'au'>): string {
  const j = (s: string) => s.split('-').reverse().join('/');
  if (f.du && f.au) return `du ${j(f.du)} au ${j(f.au)}`;
  if (f.du) return `depuis le ${j(f.du)}`;
  if (f.au) return `jusqu’au ${j(f.au)}`;
  return 'toute la période';
}

/* ─── Exports ─── */

export type TableExport = { nom: string; entetes: string[]; lignes: (string | number | null)[][] };

/** Résultat lisible d'une ligne (note, pourcentage, ou raison de l'absence de note). */
export function resultatLisible(e: Evaluation, pourEleve = false): string {
  if (pourEleve && !e.resultatsVisibles && e.statut === 'termine') return 'Résultats non encore publiés';
  if (e.statut === 'termine' && e.pourcentage !== null) return `${formatNote(e) ?? ''} (${formatPourcentage(e.pourcentage)})`.trim();
  if (e.statut === 'termine') return precisionEtat(e) ?? 'En attente';
  return '—';
}

/**
 * Table chronologique (de la plus ancienne à la plus récente) : identité,
 * date, nature, intitulé, spécialité, statut, résultat, durée. `identite` :
 * colonnes candidat (exports collectifs).
 */
export function tableEvaluations(liste: Evaluation[], opts: { identite: boolean }): TableExport {
  const evo = evolutions(liste);
  const tri = [...liste].sort((a, b) =>
    (opts.identite ? `${a.nom ?? ''} ${a.prenom ?? ''} ${a.email ?? ''}`.localeCompare(`${b.nom ?? ''} ${b.prenom ?? ''} ${b.email ?? ''}`, 'fr') : 0)
    || a.date.localeCompare(b.date) || a.cle.localeCompare(b.cle));
  const entetes = [
    ...(opts.identite ? ['Nom', 'Prénom', 'E-mail', 'Promotion'] : []),
    'Date', 'Début', 'Fin', 'Nature', 'Intitulé', 'Spécialité', 'Voie', 'Statut', 'Note', 'Note max', 'Résultat (%)', 'Évolution', 'Durée', 'Questions', 'Observation',
  ];
  const lignes = tri.map((e) => [
    ...(opts.identite ? [e.nom ?? '', e.prenom ?? '', e.email ?? '', e.promotion ?? ''] : []),
    formatJour(e.date),
    e.debut ? formatHeure(e.debut) : '—',
    e.fin ? formatHeure(e.fin) : '—',
    TYPE_LABEL[e.type],
    e.intitule,
    e.specialite ?? '—',
    e.voie ?? '—',
    STATUT_LABEL[e.statut],
    e.statut === 'termine' ? e.score : null,
    e.statut === 'termine' ? e.scoreMax : null,
    e.statut === 'termine' ? e.pourcentage : null,
    formatEvolution(evo.get(e.cle)),
    formatDuree(e.dureeSecondes),
    e.nbQuestions,
    [precisionEtat(e), e.archiveMotif ? `Motif : ${e.archiveMotif}` : null].filter(Boolean).join(' · '),
  ]);
  return { nom: 'Évaluations', entetes, lignes };
}

/* ─── Journal de traçabilité ─── */

/** Champ modifié, en clair. */
export const CHAMP_LABEL: Record<string, string> = {
  statut: 'Statut',
  score_percent: 'Résultat (%)',
  points_obtained: 'Points obtenus',
  points_possible: 'Points possibles',
  score: 'Note',
  max_score: 'Note maximale',
  percentage: 'Résultat (%)',
  band: 'Niveau',
  score_correct: 'Bonnes réponses',
  qcm_count: 'Nombre de questions',
  qcm_test_score: 'Note',
  qcm_test_total: 'Note maximale',
};

/** Valeur journalisée (JSON) en clair : statuts traduits, nombres à la française. */
export function valeurLisible(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'number') return nf(v);
  if (typeof v === 'string') {
    const n = Number(v);
    if (v.trim() !== '' && Number.isFinite(n)) return nf(n);
    return ETAT_LABEL[v] ?? ({ completed: 'Terminé', graded: 'Corrigé' } as Record<string, string>)[v] ?? v;
  }
  return JSON.stringify(v);
}

export const RAISON_ARCHIVE: Record<string, string> = {
  nouvelle_tentative: 'Remplacée par une nouvelle tentative',
  suppression: 'Suppression',
  reinitialisation: 'Réinitialisation',
};

/** Mention portée par chaque export (ce n'est PAS une preuve de conformité). */
export const MENTION_TRACABILITE =
  'Document de traçabilité pédagogique généré par la plateforme Major ECN à partir des résultats enregistrés. Il constitue un élément parmi les pièces du dossier de formation et ne vaut pas, à lui seul, preuve de conformité.';
