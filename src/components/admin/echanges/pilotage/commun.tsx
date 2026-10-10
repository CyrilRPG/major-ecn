import * as React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActionAudit, SourceJournal } from '@/lib/echanges/serveur/base';

/**
 * Éléments partagés des écrans de pilotage du back-office des Échanges
 * (tableau de bord, statistiques, paramètres, journal) : dates à l'heure de
 * Paris, tuiles d'indicateurs, barres simples en CSS, libellés français du
 * journal d'audit. Module sans état : utilisable côté serveur comme client.
 */

export const FUSEAU = 'Europe/Paris';

const FORMAT_HEURE = new Intl.DateTimeFormat('fr-FR', {
  timeZone: FUSEAU, day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});
const FORMAT_JOUR = new Intl.DateTimeFormat('fr-FR', { timeZone: FUSEAU, day: 'numeric', month: 'short', year: 'numeric' });

/**
 * Date lisible à l'heure de Paris, assemblée à partir des parties (et non du
 * `format` global) pour un rendu identique côté serveur et navigateur.
 */
export function dateParis(iso: string | null | undefined, avecHeure = true): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return '—';
  const p = Object.fromEntries((avecHeure ? FORMAT_HEURE : FORMAT_JOUR).formatToParts(d).map((x) => [x.type, x.value]));
  const jour = `${p.day} ${p.month} ${p.year}`;
  return avecHeure ? `${jour} · ${p.hour}:${p.minute}` : jour;
}

/** « il y a 4 min », « il y a 2 h », « il y a 3 j ». */
export function ilYa(iso: string | null | undefined, maintenant: number): string {
  if (!iso) return 'jamais';
  const ms = maintenant - new Date(iso).getTime();
  if (!Number.isFinite(ms)) return '—';
  const min = Math.round(ms / 60_000);
  if (min < 1) return 'à l’instant';
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 48) return `il y a ${h} h`;
  return `il y a ${Math.round(h / 24)} j`;
}

export const nombre = (n: number) => n.toLocaleString('fr-FR');

export function pourcent(t: number | null): string {
  return t === null ? '—' : `${Math.round(t * 100)} %`;
}

/* ─────────────────────────── Tuiles d'indicateurs ─────────────────────────── */

export type TonTuile = 'neutre' | 'alerte' | 'attention' | 'ok';

const TON_VALEUR: Record<TonTuile, string> = {
  neutre: 'text-(--color-ink)',
  alerte: 'text-[#B42318]',
  attention: 'text-[#C2570C]',
  ok: 'text-[#1F7A3E]',
};
const TON_CADRE: Record<TonTuile, string> = {
  neutre: 'border-(--color-border)',
  alerte: 'border-[#F5C2C0] bg-[#FEF6F5]',
  attention: 'border-[#FBD3AE] bg-[#FFFAF4]',
  ok: 'border-(--color-border)',
};

export function Tuile({
  libelle, valeur, aide, href, ton = 'neutre', className,
}: {
  libelle: string;
  valeur: React.ReactNode;
  aide?: string;
  href?: string | null;
  ton?: TonTuile;
  className?: string;
}) {
  const contenu = (
    <>
      <p className="text-[12.5px] font-medium text-(--color-ink-soft)">{libelle}</p>
      <p className={cn('mt-1 text-2xl font-semibold tabular-nums tracking-tight', TON_VALEUR[ton])}>{valeur}</p>
      {aide && <p className="mt-0.5 text-[12px] text-(--color-ink-muted)">{aide}</p>}
      {href && <ArrowRight className="absolute right-3 top-3 h-3.5 w-3.5 text-(--color-ink-muted) transition-colors group-hover:text-(--color-primary)" aria-hidden />}
    </>
  );
  const classe = cn('group relative block min-w-0 rounded-xl border bg-white px-3.5 py-3', TON_CADRE[ton], className);
  if (!href) return <div className={classe}>{contenu}</div>;
  return (
    <Link href={href} className={cn(classe, 'transition-colors hover:border-(--color-primary)/40 hover:bg-(--color-surface-soft) focus-ring')}>
      {contenu}
    </Link>
  );
}

/* ─────────────────────────── Barres (CSS seul) ─────────────────────────── */

/** Barre horizontale proportionnelle (0 à 1). Teinte : bordeaux, vert, orange ou rouge. */
export function Barre({ part, teinte = 'bordeaux', titre, className }: {
  part: number | null;
  teinte?: 'bordeaux' | 'vert' | 'orange' | 'rouge';
  titre?: string;
  className?: string;
}) {
  const p = part === null || !Number.isFinite(part) ? 0 : Math.max(0, Math.min(1, part));
  const couleur = {
    bordeaux: 'bg-(--color-primary)', vert: 'bg-green-600', orange: 'bg-[#E8892F]', rouge: 'bg-[#B42318]',
  }[teinte];
  return (
    <span className={cn('block h-1.5 w-full overflow-hidden rounded-full bg-(--color-surface-sunken)', className)} title={titre} aria-hidden>
      <span className={cn('block h-full rounded-full', couleur)} style={{ width: `${Math.round(p * 1000) / 10}%` }} />
    </span>
  );
}

/** Teinte d'un taux de réponse sous le seuil : vert ≥ 80 %, orange ≥ 50 %, rouge sinon. */
export function teinteTaux(t: number | null): 'vert' | 'orange' | 'rouge' {
  if (t === null) return 'orange';
  return t >= 0.8 ? 'vert' : t >= 0.5 ? 'orange' : 'rouge';
}

/* ─────────────────────────── Journal d'audit ─────────────────────────── */

export const LIBELLE_ACTION: Record<ActionAudit, string> = {
  groupe_creation: 'Création d’une promotion',
  groupe_modification: 'Modification d’une promotion',
  groupe_activation: 'Activation d’une promotion',
  groupe_desactivation: 'Désactivation d’une promotion',
  groupe_cloture: 'Clôture d’une promotion',
  groupe_archivage: 'Archivage d’une promotion',
  groupe_reouverture: 'Réouverture d’une promotion',
  groupe_duplication: 'Duplication d’une promotion',
  criteres_modification: 'Modification des critères',
  participant_ajout: 'Ajout de participants',
  participant_retrait: 'Retrait de participants',
  participant_exclusion_forcee: 'Exclusion forcée',
  participants_synchronisation: 'Synchronisation des participants',
  enseignant_ajout: 'Affectation d’un enseignant',
  enseignant_retrait: 'Retrait d’un enseignant',
  enseignant_modification: 'Modification d’un enseignant',
  identite_modification: 'Identité publique modifiée',
  suppression_moderation: 'Suppression par la modération',
  suppression_auteur: 'Suppression par l’auteur',
  restauration: 'Restauration de messages',
  validation_message: 'Validation de messages',
  refus_message: 'Refus de messages',
  epinglage: 'Épinglage',
  desepinglage: 'Désépinglage',
  bibliotheque_ajout: 'Ajout à la bibliothèque',
  bibliotheque_modification: 'Modification de la bibliothèque',
  bibliotheque_retrait: 'Retrait de la bibliothèque',
  sanction: 'Sanction',
  levee_sanction: 'Levée de sanction',
  reintegration: 'Réintégration',
  signalement_traitement: 'Traitement d’un signalement',
  blocage_liberation: 'Libération d’un contenu retenu',
  tag_reaffectation: 'Réaffectation d’une question',
  tag_traite_manuellement: 'Question marquée traitée',
  parametres_modification: 'Paramètres modifiés',
  staff_modification: 'Équipe de modération modifiée',
  rgpd_export: 'Export RGPD',
  rgpd_effacement: 'Effacement RGPD',
  export_donnees: 'Export de données',
  purge: 'Purge automatique',
  annonce_importante: 'Annonce importante',
};

export const ACTIONS_AUDIT = Object.keys(LIBELLE_ACTION) as ActionAudit[];

export const LIBELLE_SOURCE: Record<SourceJournal, string> = {
  email: 'E-mails',
  relance: 'Relances',
  publication: 'Publication',
  fichier: 'Pièces jointes',
  permission: 'Permissions',
  temps_reel: 'Temps réel',
  cron: 'Tâches planifiées',
  purge: 'Purge',
  synchro: 'Synchronisation',
  notification: 'Notifications',
  moderation: 'Modération',
};

export const SOURCES_JOURNAL = Object.keys(LIBELLE_SOURCE) as SourceJournal[];

/** Périodes proposées pour filtrer le journal d'audit (jours glissants). */
export const PERIODES: { v: string; l: string }[] = [
  { v: '1', l: '24 dernières heures' },
  { v: '7', l: '7 derniers jours' },
  { v: '30', l: '30 derniers jours' },
  { v: '90', l: '3 derniers mois' },
  { v: '365', l: '12 derniers mois' },
  { v: 'tout', l: 'Tout l’historique' },
];

export const LIBELLE_ROLE: Record<string, string> = {
  admin: 'Administrateur', professor: 'Équipe', student: 'Candidat', systeme: 'Système',
};

/* ─────────────────────────── Tâches planifiées ─────────────────────────── */

export const LIBELLE_CRON: Record<string, string> = {
  echanges: 'Balayage des échanges (relances, escalades, e-mails, purge)',
  notifications: 'Centre de notifications',
};

/** Tâches toutes les 5 min : en retard au-delà de 30 min sans passage. */
export const CRON_ATTENDUS = ['echanges', 'notifications'];
export const CRON_RETARD_MS = 30 * 60_000;

export type CronAffiche = { nom: string; libelle: string; dernier: string; ilYa: string; dureeMs: number | null; enRetard: boolean };

export function cronsAffiches(crons: { nom: string; dernier: string | null; dureeMs: number | null }[], maintenant: number): CronAffiche[] {
  const tous = [...crons];
  for (const nom of CRON_ATTENDUS) if (!tous.some((c) => c.nom === nom)) tous.push({ nom, dernier: null, dureeMs: null });
  return tous
    .sort((a, b) => a.nom.localeCompare(b.nom))
    .map((c) => ({
      nom: c.nom,
      libelle: LIBELLE_CRON[c.nom] ?? c.nom,
      dernier: dateParis(c.dernier),
      ilYa: ilYa(c.dernier, maintenant),
      dureeMs: c.dureeMs,
      enRetard: !c.dernier || maintenant - new Date(c.dernier).getTime() > CRON_RETARD_MS,
    }));
}

export function duree(ms: number | null): string {
  if (ms === null) return '—';
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} s`;
}
