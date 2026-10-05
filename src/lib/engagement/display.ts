/**
 * Affichage candidat des alertes (§10 à §14, §42 à §47, §55, §56) — module PUR.
 *
 *  - niveau 1 (J+7) : encart du tableau de bord, sans pop-up ;
 *  - niveau 2 (J+14) : encart orange + pop-up UNIQUE au passage au niveau ;
 *  - niveau 3 (J+30) : pop-up UNIQUE + bandeau persistant ;
 *  - vigilance (avant J+7) : encart léger ;
 *  - reprise détectée : message positif discret ; reprise confirmée :
 *    « Vous avez repris votre préparation. Continuez ainsi. » ;
 *  - une alerte acquittée reste présente mais en version compacte (on
 *    n'affiche pas le même message rouge en grand à chaque connexion) ;
 *  - CTA intelligent : il propose TOUJOURS une solution et ouvre l'activité
 *    cible (planificateur, révision, activité commencée, entraînement
 *    prioritaire, reprise générale).
 */
import { TEXTS } from './types';

export type CtaTarget = { label: string; href: string };

export type CtaContext = {
  /** Prochaine activité prévue par le planificateur aujourd'hui. */
  plannerNext?: CtaTarget | null;
  /** Révision transversale à faire (réactivation due, révision du jour). */
  transversal?: CtaTarget | null;
  /** Activité commencée (Check-up, révision interrompue…). */
  inProgress?: CtaTarget | null;
  /** Entraînement prioritaire (besoin le plus prioritaire). */
  topNeed?: CtaTarget | null;
  /** Reprise générale : la page d'accueil des items. */
  general: CtaTarget;
};

/** Ordre indicatif (§13) : planificateur → révision transversale → activité commencée → entraînement prioritaire → reprise générale. */
export function smartTarget(ctx: CtaContext): CtaTarget & { kind: 'planificateur' | 'revision' | 'en_cours' | 'priorite' | 'general' } {
  if (ctx.plannerNext) return { ...ctx.plannerNext, kind: 'planificateur' };
  if (ctx.transversal) return { ...ctx.transversal, kind: 'revision' };
  if (ctx.inProgress) return { ...ctx.inProgress, kind: 'en_cours' };
  if (ctx.topNeed) return { ...ctx.topNeed, kind: 'priorite' };
  return { ...ctx.general, kind: 'general' };
}

export type AlertFacts = {
  lastActivityLabel: string | null;
  transversal: { assigned: number; completed: number };
  activeDays7: number;
  activeDays14: number;
};

export type AlertEpisodeView = {
  id: string;
  alert_level: number;
  alert_trigger: string;
  status: 'open' | 'recovering' | 'resolved';
  popup_levels: number[];
  alert_acknowledged_at: string | null;
};

export type AlertView = {
  episodeId: string;
  level: number;
  /** Ton et intensité proportionnés (§1, §46). */
  tone: 'vigilance' | 'attention' | 'orange' | 'important' | 'reprise';
  /** Libellé explicite : jamais la seule couleur (§56). */
  levelLabel: string;
  title: string;
  body: string;
  facts: string[];
  cta: CtaTarget;
  secondary: CtaTarget | null;
  /** Pop-up à afficher maintenant (une seule fois par niveau). */
  popup: boolean;
  /** Bandeau persistant tant que la situation n'est pas résolue (niveau 3). */
  persistent: boolean;
  /** Acquittée : version compacte (non-harcèlement). */
  compact: boolean;
};

export function factsLines(f: AlertFacts): string[] {
  const out: string[] = [];
  if (f.lastActivityLabel) out.push(`Dernière activité significative : ${f.lastActivityLabel}`);
  if (f.transversal.assigned > 0) out.push(`Révisions transversales : ${f.transversal.completed} réalisée${f.transversal.completed > 1 ? 's' : ''} sur ${f.transversal.assigned} proposée${f.transversal.assigned > 1 ? 's' : ''} (14 derniers jours)`);
  out.push(`Jours actifs : ${f.activeDays7} sur les 7 derniers jours, ${f.activeDays14} sur 14`);
  return out;
}

export function alertView(ep: AlertEpisodeView | null, facts: AlertFacts, ctx: CtaContext): AlertView | null {
  if (!ep || ep.status === 'resolved') return null;
  const target = smartTarget(ctx);
  const compact = !!ep.alert_acknowledged_at;
  const lines = factsLines(facts);
  const priorites: CtaTarget = { label: TEXTS.j30.secondary, href: '/mes-priorites' };
  if (ep.status === 'recovering') {
    return {
      episodeId: ep.id, level: ep.alert_level, tone: 'reprise', levelLabel: 'Reprise détectée', title: 'Reprise détectée',
      body: TEXTS.recovery.detected, facts: lines.slice(0, 2), cta: { label: 'Continuer', href: target.href }, secondary: null,
      popup: false, persistent: false, compact,
    };
  }
  switch (ep.alert_level) {
    case 0: {
      const isTransversal = ep.alert_trigger === 'revisions_transversales';
      const title = isTransversal ? TEXTS.vigilance.transversalTitle : ep.alert_trigger === 'baisse_rythme' ? TEXTS.vigilance.rhythmTitle : TEXTS.vigilance.lowTitle;
      const body = isTransversal ? TEXTS.vigilance.transversalBody : ep.alert_trigger === 'baisse_rythme' ? TEXTS.vigilance.rhythmBody : TEXTS.vigilance.lowBody;
      const cta = isTransversal && ctx.transversal ? { label: TEXTS.vigilance.ctaRevisions, href: ctx.transversal.href } : { label: TEXTS.j7.ctaPreparation, href: target.href };
      return { episodeId: ep.id, level: 0, tone: 'vigilance', levelLabel: 'Vigilance', title, body, facts: lines, cta, secondary: null, popup: false, persistent: false, compact };
    }
    case 1: {
      const cta = ctx.transversal ? { label: TEXTS.j7.ctaRevisions, href: ctx.transversal.href } : { label: TEXTS.j7.ctaPreparation, href: target.href };
      return { episodeId: ep.id, level: 1, tone: 'attention', levelLabel: 'Vigilance', title: TEXTS.j7.title, body: TEXTS.j7.body, facts: lines, cta, secondary: null, popup: false, persistent: false, compact };
    }
    case 2:
      return {
        episodeId: ep.id, level: 2, tone: 'orange', levelLabel: 'Activité insuffisante', title: TEXTS.j14.title, body: TEXTS.j14.body, facts: lines,
        cta: { label: TEXTS.j14.cta, href: target.href }, secondary: null, popup: !ep.popup_levels.includes(2), persistent: false, compact,
      };
    default:
      return {
        episodeId: ep.id, level: 3, tone: 'important', levelLabel: 'Décrochage', title: TEXTS.j30.title, body: TEXTS.j30.body, facts: lines,
        cta: { label: TEXTS.j30.cta, href: target.href }, secondary: priorites, popup: !ep.popup_levels.includes(3), persistent: true, compact,
      };
  }
}
