import * as React from 'react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { LIBELLE_STATUT, type Criteres, type ModeParticipants, type StatutGroupe } from '@/lib/echanges/regles';
import { Etiquette } from '@/components/admin/cockpit/ui';

/**
 * Éléments partagés des écrans « Promotions » du back-office des Échanges :
 * dates affichées et saisies en heure de Paris, pastilles de statut, types
 * des données sérialisées passées des pages serveur aux composants client.
 * Module sans état : utilisable côté serveur comme côté client.
 */

export const FUSEAU = 'Europe/Paris';

/* ─────────────────────────── Dates (Europe/Paris) ─────────────────────────── */

export function dateParis(iso: string | null | undefined, avecHeure = false): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return '—';
  return d.toLocaleString('fr-FR', avecHeure
    ? { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: FUSEAU }
    : { day: 'numeric', month: 'short', year: 'numeric', timeZone: FUSEAU });
}

/** « il y a 3 h », « il y a 2 j » — repli sur la date au-delà d'un mois. */
export function depuis(iso: string | null | undefined, maintenant = Date.now()): string {
  if (!iso) return 'Aucune activité';
  const ms = maintenant - new Date(iso).getTime();
  if (!Number.isFinite(ms)) return '—';
  const min = Math.round(ms / 60_000);
  if (min < 1) return 'à l’instant';
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.round(h / 24);
  if (j <= 30) return `il y a ${j} j`;
  return dateParis(iso);
}

function partiesParis(d: Date) {
  const p = new Intl.DateTimeFormat('en-US', {
    timeZone: FUSEAU, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(d);
  const v = (t: string) => Number(p.find((x) => x.type === t)?.value ?? 0);
  return { a: v('year'), m: v('month'), j: v('day'), h: v('hour'), mi: v('minute'), s: v('second') };
}

/** Décalage (minutes) de Paris par rapport à UTC à un instant donné. */
function decalageParis(d: Date): number {
  const x = partiesParis(d);
  return (Date.UTC(x.a, x.m - 1, x.j, x.h, x.mi, x.s) - d.getTime()) / 60_000;
}

/** Valeur d'un champ `datetime-local` (heure de Paris) → ISO UTC. */
export function parisVersIso(local: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(local.trim());
  if (!m) return null;
  const naif = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4] ?? 0), Number(m[5] ?? 0));
  let ts = naif - decalageParis(new Date(naif)) * 60_000;
  // Second passage : le décalage peut changer autour du passage à l'heure d'été.
  ts = naif - decalageParis(new Date(ts)) * 60_000;
  return new Date(ts).toISOString();
}

/** ISO UTC → valeur d'un champ `datetime-local` en heure de Paris. */
export function isoVersParis(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return '';
  const x = partiesParis(d);
  const z = (n: number) => String(n).padStart(2, '0');
  return `${x.a}-${z(x.m)}-${z(x.j)}T${z(x.h)}:${z(x.mi)}`;
}

/* ─────────────────────────── Libellés ─────────────────────────── */

export const LIBELLE_MODE: Record<ModeParticipants, { titre: string; aide: string }> = {
  criteres: { titre: 'Selon les critères', aide: 'Les candidats qui correspondent aux critères sont ajoutés et retirés automatiquement.' },
  manuel: { titre: 'Liste manuelle', aide: 'Seuls les candidats ajoutés nominativement participent.' },
  mixte: { titre: 'Critères + ajouts manuels', aide: 'Les critères s’appliquent, et des candidats peuvent être ajoutés ou exclus à titre d’exception.' },
};

const TON_STATUT: Record<StatutGroupe, 'gris' | 'vert' | 'orange' | 'violet'> = {
  brouillon: 'gris', active: 'vert', cloturee: 'orange', archivee: 'violet',
};

export function PastilleStatutGroupe({ statut, className }: { statut: StatutGroupe; className?: string }) {
  return <Etiquette ton={TON_STATUT[statut]} className={className}>{LIBELLE_STATUT[statut]}</Etiquette>;
}

export function PastilleVisibilite({ visible }: { visible: boolean }) {
  return visible
    ? <span className="inline-flex items-center gap-1 text-[12px] text-(--color-ink-soft)"><Eye className="h-3.5 w-3.5" /> Visible</span>
    : <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#C2570C]"><EyeOff className="h-3.5 w-3.5" /> Masquée</span>;
}

export function PastilleConservation() {
  return (
    <Etiquette ton="bordeaux" className="gap-1">
      <ShieldCheck className="h-3.5 w-3.5" /> Conservation légale
    </Etiquette>
  );
}

/* ─────────────────────────── Données sérialisées ─────────────────────────── */

/** Onglets de la fiche d'une promotion (?onglet=…). */
export const ONGLETS_FICHE = ['synthese', 'parametres', 'criteres', 'participants', 'enseignants', 'questions'] as const;
export type OngletFiche = (typeof ONGLETS_FICHE)[number];

export type Specialite = { id: string; nom: string };

/** Valeurs d'un formulaire de promotion (dates en heure de Paris, format `datetime-local`). */
export type ValeursPromotion = {
  nom: string;
  annee: string;
  promotion: string;
  specialiteId: string;
  description: string;
  modeParticipants: ModeParticipants;
  criteres: Criteres;
  moderationPrealable: boolean;
  notifierChaqueMessage: boolean;
  bibliothequeAcces: boolean;
  messageAccueil: string;
  dateOuverture: string;
  dateCloturePrevue: string;
  dateArchivagePrevue: string;
  alerteArchivageJours: string;
};

export const VALEURS_VIDES: ValeursPromotion = {
  nom: '', annee: String(new Date().getFullYear()), promotion: '', specialiteId: '', description: '',
  modeParticipants: 'criteres', criteres: { formules: [], voies: [], specialites: [], inscritsActifs: true },
  moderationPrealable: false, notifierChaqueMessage: false, bibliothequeAcces: true, messageAccueil: '',
  dateOuverture: '', dateCloturePrevue: '', dateArchivagePrevue: '', alerteArchivageJours: '7',
};

/** Ligne de la liste des promotions (page serveur → composant client). */
export type LignePromotion = {
  id: string; nom: string; annee: number | null; promotion: string | null; specialite: string | null; statut: StatutGroupe;
  visible: boolean; candidats: number; enseignants: number; messages7j: number; questionsEnAttente: number; dernierMessage: string | null;
  conservationLegale: boolean; archiveeAt: string | null;
};

export function pluriel(n: number, un: string, plusieurs = `${un}s`): string {
  return `${n.toLocaleString('fr-FR')} ${n > 1 ? plusieurs : un}`;
}

export function Compteur({ valeur, libelle, alerte }: { valeur: number; libelle: string; alerte?: boolean }) {
  return (
    <div className="rounded-xl border border-(--color-border) bg-white px-3 py-2.5">
      <p className={`text-xl font-semibold tabular-nums ${alerte && valeur > 0 ? 'text-[#C2570C]' : 'text-(--color-ink)'}`}>{valeur.toLocaleString('fr-FR')}</p>
      <p className="text-[12px] text-(--color-ink-soft)">{libelle}</p>
    </div>
  );
}
