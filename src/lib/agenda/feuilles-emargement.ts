/**
 * Feuilles d'émargement d'un élève — logique PURE partagée par la page web
 * « Mes présences », la route /api/mobile/presences et l'app mobile (copie
 * octet-identique, cf. application/scripts/check-shared-sync.mjs).
 *
 * Trois sources, comme la vue admin (/api/admin/emargements/[userId]) :
 *   - `course_attendances`  → vidéo du cours ou séance approfondie vue sur la
 *     plateforme (signature manuscrite) ;
 *   - `parcours_completions` → interrogation de fin de parcours (PDF signé) ;
 *   - `session_presences`   → sessions Zoom en direct.
 * La page ne lisait que les sessions Zoom : un élève qui avait signé des
 * dizaines de feuilles vidéo voyait « Aucune présence émargée ».
 */

export type OrigineFeuille = 'video' | 'seance' | 'interrogation' | 'zoom';

export type Feuille = {
  id: string;
  origine: OrigineFeuille;
  titre: string;
  college: string | null;
  /** Jour de la séance Zoom (AAAA-MM-JJ). */
  jour: string | null;
  debut: string | null;
  fin: string | null;
  intervenant: string | null;
  /** Signature (plateforme) ou émargement (Zoom). */
  signeLe: string | null;
  /** Obligation née (plateforme) : sert au tri d'une feuille non signée. */
  requiseLe: string | null;
  coursId: string | null;
  signature: string | null;
  /** Interrogation : note sur 20. */
  note?: string | null;
};

export const LIBELLE_FEUILLE: Record<OrigineFeuille, string> = {
  video: 'Vidéo du cours',
  seance: 'Séance approfondie',
  interrogation: 'Interrogation de fin de parcours',
  zoom: 'Session Zoom',
};

export type LigneAttendance = {
  id: string; cours_id: string; cours_titre: string | null; matiere_id: string | null; kind: string;
  required_at: string; signed_at: string | null; signature_png: string | null;
};

export type LigneCompletion = {
  cours_id: string; certificate_signed_at: string; signature_data_url: string | null;
  qcm_test_score: number | null; qcm_test_total: number | null;
  cours: { titre: string | null; matiere_id: string | null } | null;
};

export type LignePresence = {
  id: string; event_title: string | null; event_date: string | null; start_time: string | null;
  end_time: string | null; college: string | null; intervenant: string | null; marked_at: string;
  signature_png: string | null;
};

/** Toutes les feuilles, de la plus récente à la plus ancienne. */
export function construireFeuilles(sources: {
  attendances: readonly LigneAttendance[];
  completions: readonly LigneCompletion[];
  presences: readonly LignePresence[];
  matieres: readonly { id: string; nom: string }[];
}): Feuille[] {
  const nomCollege = new Map<string, string>(sources.matieres.map((m) => [m.id, m.nom]));
  return [
    ...sources.attendances.map((r): Feuille => ({
      id: r.id,
      origine: r.kind === 'seance' ? 'seance' : 'video',
      titre: r.cours_titre ?? 'Cours',
      college: r.matiere_id ? (nomCollege.get(r.matiere_id) ?? null) : null,
      jour: null, debut: null, fin: null, intervenant: null,
      signeLe: r.signed_at,
      requiseLe: r.required_at,
      coursId: r.cours_id,
      signature: r.signature_png,
    })),
    ...sources.completions.map((r): Feuille => ({
      id: `interrogation-${r.cours_id}`,
      origine: 'interrogation',
      titre: r.cours?.titre ?? 'Cours',
      college: r.cours?.matiere_id ? (nomCollege.get(r.cours.matiere_id) ?? null) : null,
      jour: null, debut: null, fin: null, intervenant: null,
      signeLe: r.certificate_signed_at,
      requiseLe: r.certificate_signed_at,
      coursId: r.cours_id,
      signature: r.signature_data_url,
      note: r.qcm_test_score != null && r.qcm_test_total
        ? `${((r.qcm_test_score / r.qcm_test_total) * 20).toFixed(1).replace('.', ',')} / 20`
        : null,
    })),
    ...sources.presences.map((r): Feuille => ({
      id: r.id,
      origine: 'zoom',
      titre: r.event_title ?? 'Session',
      college: r.college,
      jour: r.event_date, debut: r.start_time, fin: r.end_time, intervenant: r.intervenant,
      signeLe: r.marked_at,
      requiseLe: r.marked_at,
      coursId: null,
      signature: r.signature_png,
    })),
  ].sort((a, b) => (b.signeLe ?? b.requiseLe ?? '').localeCompare(a.signeLe ?? a.requiseLe ?? ''));
}

/** Feuille de plateforme (vidéo, séance, interrogation) pas encore signée. */
export function feuilleASigner(f: Feuille): boolean {
  return f.origine !== 'zoom' && !f.signeLe;
}

/** « À signer » d'abord (affichées en tête), puis les signées, et le résumé par type. */
export function repartirFeuilles(feuilles: readonly Feuille[]): {
  aSigner: Feuille[];
  signees: Feuille[];
  resume: string;
} {
  const aSigner = feuilles.filter(feuilleASigner);
  const signees = feuilles.filter((f) => !feuilleASigner(f));
  const n = { video: 0, seance: 0, interrogation: 0, zoom: 0 };
  for (const f of signees) n[f.origine]++;
  const resume = [
    n.video && `${n.video} vidéo${n.video > 1 ? 's' : ''} de cours`,
    n.seance && `${n.seance} séance${n.seance > 1 ? 's' : ''} approfondie${n.seance > 1 ? 's' : ''}`,
    n.interrogation && `${n.interrogation} interrogation${n.interrogation > 1 ? 's' : ''}`,
    n.zoom && `${n.zoom} session${n.zoom > 1 ? 's' : ''} Zoom`,
  ].filter(Boolean).join(' · ');
  return { aSigner, signees, resume };
}

/** Lien vers l'écran où la feuille se signe / se consulte (mêmes chemins web et app). */
export function lienFeuille(f: Feuille): string | null {
  if (!f.coursId) return null;
  if (f.origine === 'interrogation') return `/cours/${f.coursId}`;
  return `/cours/${f.coursId}/${f.origine === 'seance' ? 'seance-approfondie' : 'video'}`;
}
