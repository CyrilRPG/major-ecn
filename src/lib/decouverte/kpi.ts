/**
 * Statistiques du module (cahier §21). Calculées à partir des MÊMES lignes que
 * la liste et la fiche (statuts du moteur, envois, attribution figée) : les
 * chiffres concordent par construction avec l'historique individuel (§29).
 *
 * Périmètre : les candidats passés en entrée (déjà filtrés par spécialité,
 * voie et période de demande — une cohorte). Les ouvertures ne sont qu'un
 * indicateur (pixel bloqué ou préchargé selon les messageries) : les taux
 * d'activation reposent sur les CONNEXIONS, jamais sur les ouvertures (§24).
 *
 * Module PUR.
 */
import type { LigneEvaluee } from './moteur';
import { TYPES_RELANCE, envoiCompte, type TypeRelance } from './types';

export type KpiModele = {
  envoyes: number;           // partis (module + importés + saisis)
  dontImportes: number;      // historique importé / saisi (non mesurable)
  mesurables: number;        // envoyés par le module (suivi ouverture/clic possible)
  delivres: number;
  ouverts: number;
  clicsCta: number;          // envois avec au moins un clic plateforme
  clicsVideo: number;        // envois avec au moins un clic vidéo
  bounces: number;
  echecs: number;
  connexionsAttribuees: number;
  tauxActivation: number | null;     // connexions attribuées / envoyés
  delaiMoyenSec: number | null;      // relance → première connexion
  delaiMedianSec: number | null;
  desinscriptions: number;
  tauxDesinscription: number | null; // désinscriptions / envoyés
};

export type Kpi = {
  demandes: number;
  jamaisConnectes: number;
  enAttente: number;
  aRelancer: number;
  aRelancerParNiveau: { R1: number; R2: number; R3: number };
  anciensAcces: number;
  actives: number;
  termines: number;
  desinscrits: number;
  erreurs: number;
  connexionsSansRelance: number;     // activés sans relance attribuée (e-mail initial, spontané)
  connexionsAttribueesTotal: number;
  tauxActivationGlobal: number | null; // activés / demandes
  delaiMoyenSec: number | null;
  delaiMedianSec: number | null;
  parModele: Record<TypeRelance, KpiModele>;
};

const ratio = (a: number, b: number) => (b > 0 ? a / b : null);
export function moyenne(xs: number[]): number | null {
  return xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null;
}
export function mediane(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function modeleVide(): KpiModele {
  return {
    envoyes: 0, dontImportes: 0, mesurables: 0, delivres: 0, ouverts: 0, clicsCta: 0, clicsVideo: 0, bounces: 0, echecs: 0,
    connexionsAttribuees: 0, tauxActivation: null, delaiMoyenSec: null, delaiMedianSec: null, desinscriptions: 0, tauxDesinscription: null,
  };
}

export function calculerKpi(lignes: LigneEvaluee[]): Kpi {
  const parModele = Object.fromEntries(TYPES_RELANCE.map((t) => [t, modeleVide()])) as Record<TypeRelance, KpiModele>;
  const delais: Record<TypeRelance, number[]> = { R1: [], R2: [], R3: [], ancien_acces: [] };
  const k: Kpi = {
    demandes: lignes.length, jamaisConnectes: 0, enAttente: 0, aRelancer: 0, aRelancerParNiveau: { R1: 0, R2: 0, R3: 0 },
    anciensAcces: 0, actives: 0, termines: 0, desinscrits: 0, erreurs: 0, connexionsSansRelance: 0, connexionsAttribueesTotal: 0,
    tauxActivationGlobal: null, delaiMoyenSec: null, delaiMedianSec: null, parModele,
  };
  for (const { candidat: c, envois, evaluation: e } of lignes) {
    if (!e.connecteAt) k.jamaisConnectes++;
    if (e.opposition) k.desinscrits++;
    switch (e.statut) {
      case 'ORANGE': k.enAttente++; break;
      case 'ROUGE': k.aRelancer++; if (e.prochainType && e.prochainType !== 'ancien_acces') k.aRelancerParNiveau[e.prochainType]++; break;
      case 'VIOLET': k.anciensAcces++; break;
      case 'VERT': k.actives++; break;
      case 'GRIS': k.termines++; break;
      case 'BLOQUE': k.erreurs++; break;
      default: break;
    }
    for (const env of envois) {
      if (!(TYPES_RELANCE as readonly string[]).includes(env.type)) continue;
      const m = parModele[env.type as TypeRelance];
      if (env.statut === 'echec') { m.echecs++; continue; }
      if (!envoiCompte(env) || env.statut === 'en_cours') continue;
      m.envoyes++;
      if (env.statut === 'historique') m.dontImportes++; else m.mesurables++;
      if (env.delivre_at) m.delivres++;
      if (env.ouvert_at) m.ouverts++;
      if (env.clic_cta_at) m.clicsCta++;
      if (env.clic_video_at) m.clicsVideo++;
      if (env.bounce_at) m.bounces++;
      if (env.desinscrit_at) m.desinscriptions++;
    }
    if (e.connecteAt) {
      const att = c.relance_attribuee ? envois.find((x) => x.id === c.relance_attribuee) : null;
      if (att && (TYPES_RELANCE as readonly string[]).includes(att.type)) {
        const t = att.type as TypeRelance;
        parModele[t].connexionsAttribuees++;
        k.connexionsAttribueesTotal++;
        if (typeof c.delai_connexion_sec === 'number') delais[t].push(c.delai_connexion_sec);
      } else {
        k.connexionsSansRelance++;
      }
    }
  }
  for (const t of TYPES_RELANCE) {
    const m = parModele[t];
    m.tauxActivation = ratio(m.connexionsAttribuees, m.envoyes);
    m.tauxDesinscription = ratio(m.desinscriptions, m.envoyes);
    m.delaiMoyenSec = moyenne(delais[t]);
    m.delaiMedianSec = mediane(delais[t]);
  }
  const tous = TYPES_RELANCE.flatMap((t) => delais[t]);
  k.delaiMoyenSec = moyenne(tous);
  k.delaiMedianSec = mediane(tous);
  k.tauxActivationGlobal = ratio(k.actives, k.demandes);
  return k;
}

export function formatTaux(x: number | null): string {
  return x === null ? '—' : `${(x * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;
}
