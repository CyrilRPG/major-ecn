import { ajouterJours, ecartJours, instantParis, jourParis } from '../evc-calendrier/dates';
import type { Parametres } from './parametres';
import type { Famille, StatutEnvoi } from './types';

/**
 * Orchestrateur unique des enquêtes (§26-§30) — module PUR, testé.
 *
 * Pour un candidat, à un instant donné, il décide quels questionnaires créer,
 * lesquels activer, reprogrammer, neutraliser ou expirer. Le serveur se contente
 * d'appliquer ces décisions (et de les journaliser). Rien n'est jamais créé deux
 * fois : chaque questionnaire a une clé unique par candidat (`cle`), et la
 * base porte l'index unique (user_id, cle).
 *
 *   HOT:<learning_event_id>      une seule évaluation par séance, direct ou replay
 *   PROGRESS_<seuil>             bilans intermédiaires (33 %, 66 %)
 *   FINAL:<exam_session_id>      J-3 avant la PREMIÈRE épreuve du candidat
 *   POST_EXAM:<exam_session_id>  J+3 après la DERNIÈRE épreuve du candidat
 *   FOLLOW_UP:<exam_session_id>  six mois après la fin de formation
 */

export type EnvoiExistant = {
  id: string;
  cle: string;
  famille: Famille;
  statut: StatutEnvoi;
  programme_pour: string;
  echeance: string | null;
  created_at: string;
};

export type ParticipationAEvaluer = {
  seanceId: string;
  mode: 'direct' | 'replay';
  /** Fin de la séance en direct, ou instant où le seuil de visionnage du replay a été franchi. */
  disponibleAt: string;
};

export type EntreeOrchestrateur = {
  now: number;
  params: Parametres;
  /** Candidat actif (compte actif, accès non expiré, formule payante). */
  actif: boolean;
  debutFormation: string | null;   // 'AAAA-MM-JJ'
  finFormation: string | null;     // 'AAAA-MM-JJ'
  premiereEpreuve: string | null;  // 'AAAA-MM-JJ'
  derniereEpreuve: string | null;  // 'AAAA-MM-JJ'
  examSessionId: string | null;
  enPause: boolean;
  /** Progression du parcours (0-100), selon la règle `progress.mode` ; null = inconnue. */
  progression: number | null;
  participations: ParticipationAEvaluer[];
  envois: EnvoiExistant[];
};

export type Creation = {
  famille: Famille;
  cle: string;
  statut: Extract<StatutEnvoi, 'programme' | 'envoye' | 'neutralise'>;
  programmePour: string;
  echeance: string | null;
  seanceId?: string;
  mode?: 'direct' | 'replay';
  examSessionId?: string | null;
  seuil?: number;
  motif?: string;
};

export type MiseAJour =
  | { id: string; type: 'activer' }
  | { id: string; type: 'expirer' }
  | { id: string; type: 'neutraliser'; motif: string }
  | { id: string; type: 'reprogrammer'; programmePour: string; echeance: string | null };

export type Decision = { creations: Creation[]; misesAJour: MiseAJour[]; notes: string[] };

const OUVERTS: StatutEnvoi[] = ['envoye', 'affiche', 'commence'];
const JOUR = 86_400_000;

export function ajouterMois(jour: string, n: number): string {
  const [a, m, j] = jour.slice(0, 10).split('-').map(Number);
  const cible = new Date(Date.UTC(a, m - 1 + n, 1));
  const dernier = new Date(Date.UTC(cible.getUTCFullYear(), cible.getUTCMonth() + 1, 0)).getUTCDate();
  const jj = Math.min(j, dernier);
  return `${cible.getUTCFullYear()}-${String(cible.getUTCMonth() + 1).padStart(2, '0')}-${String(jj).padStart(2, '0')}`;
}

/** Dernière ligne droite (§27) : du jour J-N de la première épreuve au jour de la dernière inclus. */
export function enProtectionExamen(now: number, params: Parametres, premiere: string | null, derniere: string | null): boolean {
  if (!premiere || params.hot.jours_protection <= 0) return false;
  const aujourdHui = jourParis(now);
  const debut = ajouterJours(premiere, -params.hot.jours_protection);
  const fin = derniere && derniere >= premiere ? derniere : premiere;
  return aujourdHui >= debut && aujourdHui <= fin;
}

/**
 * Progression du parcours (§5.1) — règle commune et documentée :
 *   - pédagogique : la formule unique de `lib/progress` (questions accessibles
 *     faites × 85 % + couverture fiche/flashcards/vidéo × 15 %). Une question
 *     refaite ou une page reconsultée ne la fait pas monter ;
 *   - calendaire : part écoulée de la période de formation (début → fin) ;
 *   - max (par défaut) : la plus avancée des deux — un candidat qui travaille
 *     vite reçoit son bilan plus tôt, un candidat peu actif le reçoit quand
 *     même au tiers de sa formation.
 */
export function progressionParcours(
  mode: Parametres['progress']['mode'],
  pedagogique: number | null,
  debut: string | null,
  fin: string | null,
  now: number,
): number | null {
  let calendaire: number | null = null;
  if (debut && fin && fin > debut) {
    const total = ecartJours(debut, fin);
    const ecoule = ecartJours(debut, jourParis(now));
    calendaire = Math.max(0, Math.min(100, (ecoule / total) * 100));
  }
  if (mode === 'pedagogique') return pedagogique;
  if (mode === 'calendaire') return calendaire;
  if (pedagogique === null) return calendaire;
  if (calendaire === null) return pedagogique;
  return Math.max(pedagogique, calendaire);
}

function iso(ms: number): string { return new Date(ms).toISOString(); }

export function planifier(e: EntreeOrchestrateur): Decision {
  const { now, params } = e;
  const creations: Creation[] = [];
  const misesAJour: MiseAJour[] = [];
  const notes: string[] = [];
  if (!params.actif) return { creations, misesAJour, notes: ['module inactif'] };

  const parCle = new Map(e.envois.map((x) => [x.cle, x]));
  const demarrage = params.demarrage ? Date.parse(params.demarrage) : null;
  const protection = enProtectionExamen(now, params, e.premiereEpreuve, e.derniereEpreuve);
  const fam = params.familles;
  const finalDu = (() => {
    if (!e.premiereEpreuve) return null;
    return instantParis(ajouterJours(e.premiereEpreuve, -params.final.jours_avant), '07:00');
  })();
  const finalExigible = finalDu !== null && now >= finalDu;

  /* ── 1. Expirations, activations, neutralisations des envois existants ── */
  for (const x of e.envois) {
    const ouvert = OUVERTS.includes(x.statut);
    if (ouvert && x.echeance && Date.parse(x.echeance) <= now) {
      misesAJour.push({ id: x.id, type: 'expirer' });
      continue;
    }
    if (x.statut === 'programme' && !fam[x.famille].actif) {
      misesAJour.push({ id: x.id, type: 'neutraliser', motif: 'famille_desactivee' });
      continue;
    }
    if (x.statut === 'programme' && Date.parse(x.programme_pour) <= now) {
      if (x.echeance && Date.parse(x.echeance) <= now) misesAJour.push({ id: x.id, type: 'expirer' });
      else misesAJour.push({ id: x.id, type: 'activer' });
      continue;
    }
    // Dernière ligne droite : les questionnaires à chaud ne perturbent pas les révisions finales.
    if (ouvert && x.famille === 'HOT' && protection && params.hot.neutraliser_avant_examen) {
      misesAJour.push({ id: x.id, type: 'neutraliser', motif: 'protection_avant_examen' });
      continue;
    }
    // L'enquête finale prime : un bilan intermédiaire encore ouvert n'a plus de sens.
    if (ouvert && x.famille === 'PROGRESS' && finalExigible && fam.FINAL.actif) {
      misesAJour.push({ id: x.id, type: 'neutraliser', motif: 'remplace_par_bilan_final' });
    }
  }

  if (!e.actif) {
    notes.push('candidat inactif : aucune création');
    return { creations, misesAJour, notes };
  }

  /* ── 2. Questionnaires à chaud ── */
  if (fam.HOT.actif) {
    const vus = new Set<string>();
    for (const p of e.participations) {
      const cle = `HOT:${p.seanceId}`;
      if (vus.has(cle) || parCle.has(cle)) continue;
      vus.add(cle);
      const dispo = Date.parse(p.disponibleAt);
      if (!Number.isFinite(dispo)) continue;
      if (demarrage !== null && dispo < demarrage) continue; // jamais de rétroactif
      const programme = p.mode === 'direct' ? dispo + params.hot.delai_apres_seance_min * 60_000 : dispo;
      if (programme > now) continue; // la séance n'est pas terminée : on repassera
      const exp = fam.HOT.expiration_jours;
      const echeance = exp ? programme + exp * JOUR : null;
      if (echeance !== null && echeance <= now) continue; // trop ancienne
      const neutre = protection && params.hot.neutraliser_avant_examen;
      creations.push({
        famille: 'HOT', cle, seanceId: p.seanceId, mode: p.mode,
        statut: neutre ? 'neutralise' : 'envoye',
        programmePour: iso(programme),
        echeance: echeance !== null ? iso(echeance) : null,
        motif: neutre ? 'protection_avant_examen' : undefined,
      });
    }
  }

  /* ── 3. Bilans intermédiaires ── */
  const avantPremiere = !e.premiereEpreuve || jourParis(now) < ajouterJours(e.premiereEpreuve, -params.final.jours_avant);
  if (fam.PROGRESS.actif && e.progression !== null && !e.enPause && avantPremiere && !protection) {
    const franchis = params.progress.seuils.filter((s) => (e.progression as number) >= s);
    const manquants = franchis.filter((s) => !parCle.has(`PROGRESS_${s}`));
    if (manquants.length > 0) {
      // Plusieurs seuils franchis d'un coup (activation en cours de formation) :
      // seul le plus avancé est envoyé, les autres n'ont plus de sens.
      const s = Math.max(...manquants);
      const exp = fam.PROGRESS.expiration_jours;
      creations.push({
        famille: 'PROGRESS', cle: `PROGRESS_${s}`, seuil: s, statut: 'envoye',
        programmePour: iso(now), echeance: exp ? iso(now + exp * JOUR) : null,
      });
      if (manquants.length > 1) notes.push(`seuils ${manquants.filter((x) => x !== s).join(', ')} % franchis en même temps : seul ${s} % est envoyé`);
    }
  }

  /* ── 4. Bilan final (J-3 avant la première épreuve) ── */
  const session = e.examSessionId;
  if (fam.FINAL.actif && e.premiereEpreuve && session && finalDu !== null) {
    const cle = `FINAL:${session}`;
    // Le bilan final expire à la fin du jour de la première épreuve.
    const echeance = instantParis(ajouterJours(e.premiereEpreuve, 1), '00:00');
    const exist = parCle.get(cle);
    if (!exist) {
      if (now < echeance && (demarrage === null || echeance > demarrage)) {
        creations.push({
          famille: 'FINAL', cle, examSessionId: session, statut: now >= finalDu ? 'envoye' : 'programme',
          programmePour: iso(finalDu), echeance: iso(echeance),
        });
      }
    } else if (exist.statut === 'programme' && (Date.parse(exist.programme_pour) !== finalDu || exist.echeance !== iso(echeance))) {
      // Changement officiel de calendrier (§30) : on recalcule, sans doublon.
      misesAJour.push({ id: exist.id, type: 'reprogrammer', programmePour: iso(finalDu), echeance: iso(echeance) });
    }
  }

  /* ── 5. Bilan post-EVC (J+3 après la dernière épreuve) ── */
  if (fam.POST_EXAM.actif && e.derniereEpreuve && session) {
    const cle = `POST_EXAM:${session}`;
    const du = instantParis(ajouterJours(e.derniereEpreuve, params.post_exam.jours_apres), '09:00');
    const exp = fam.POST_EXAM.expiration_jours;
    const echeance = exp ? du + exp * JOUR : null;
    const exist = parCle.get(cle);
    if (!exist) {
      if ((echeance === null || now < echeance) && (demarrage === null || du >= demarrage)) {
        creations.push({
          famille: 'POST_EXAM', cle, examSessionId: session, statut: now >= du ? 'envoye' : 'programme',
          programmePour: iso(du), echeance: echeance !== null ? iso(echeance) : null,
        });
      }
    } else if (exist.statut === 'programme' && Date.parse(exist.programme_pour) !== du) {
      misesAJour.push({ id: exist.id, type: 'reprogrammer', programmePour: iso(du), echeance: echeance !== null ? iso(echeance) : null });
    }
  }

  /* ── 6. Suivi différé (six mois après la fin de formation) ── */
  if (fam.FOLLOW_UP.actif && e.finFormation) {
    const cle = `FOLLOW_UP:${session ?? 'formation'}`;
    const du = instantParis(ajouterMois(e.finFormation, params.follow_up.mois_apres), '09:00');
    const exp = fam.FOLLOW_UP.expiration_jours;
    const echeance = exp ? du + exp * JOUR : null;
    const exist = parCle.get(cle);
    if (!exist) {
      if ((echeance === null || now < echeance) && (demarrage === null || du >= demarrage)) {
        creations.push({
          famille: 'FOLLOW_UP', cle, examSessionId: session, statut: now >= du ? 'envoye' : 'programme',
          programmePour: iso(du), echeance: echeance !== null ? iso(echeance) : null,
        });
      }
    } else if (exist.statut === 'programme' && Date.parse(exist.programme_pour) !== du) {
      misesAJour.push({ id: exist.id, type: 'reprogrammer', programmePour: iso(du), echeance: echeance !== null ? iso(echeance) : null });
    }
  }

  return { creations, misesAJour, notes };
}
