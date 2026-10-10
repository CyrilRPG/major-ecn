/**
 * Tâches Post-it ↔ agenda personnel (§36-49). Module PUR.
 *
 * Principe (§40, R13) : la ligne `postit_taches` EST la tâche. L'agenda la lit
 * telle quelle (aucune copie dans `user_agenda_events`) : modifier la date dans
 * le Post-it ou la déplacer depuis l'agenda écrit la même ligne, cocher d'un
 * côté coche de l'autre, et une tâche n'apparaît jamais deux fois.
 *
 * Heures : `echeance_date` / `echeance_heure` sont des dates et heures MURALES
 * de Paris, comme `user_agenda_events`. Seul le calcul des rappels convertit
 * vers un instant UTC.
 */
import {
  LIBELLE_TYPE, PALETTE, RAPPELS, lienPostit, libelleEmplacement,
  type Couleur, type Emplacement, type Rappel, type Statut, type Tache,
} from './regles';

/** Tâche telle qu'affichée dans l'agenda (§39, §43). */
export type TacheAgenda = {
  id: string;
  postitId: string;
  texte: string;
  fait: boolean;
  date: string;
  heure: string | null;
  rappels: Rappel[];
  couleur: Couleur;
  postitTitre: string;
  /** « Cardiologie → Fibrillation atriale » : d'où vient la note. */
  origine: string;
  /** Item d'origine (lien « Ouvrir l'item »), null pour l'accueil. */
  coursId: string | null;
  /** Page d'origine avec le Post-it mis en évidence (§39). */
  lien: string | null;
  /** Note archivée dont les tâches ont été conservées dans l'agenda (§47). */
  postitArchive: boolean;
};

/** Une tâche est dans l'agenda si elle est datée, non retirée, et sa note hors corbeille. */
export function visibleDansAgenda(t: Pick<Tache, 'date' | 'dansAgenda'>, statutPostit: Statut): boolean {
  return t.date != null && t.dansAgenda && statutPostit !== 'supprime';
}

export type LigneTacheAgenda = {
  id: string;
  postit_id: string;
  texte: string;
  fait: boolean;
  echeance_date: string | null;
  echeance_heure: string | null;
  rappels: string[] | null;
  dans_agenda: boolean;
  postits: {
    titre: string; couleur: string; statut: Statut;
    origine_cle: string; origine_type: string;
    origine_matiere_nom: string | null; origine_cours_id: string | null; origine_cours_titre: string | null; origine_ressource_titre: string | null;
  } | null;
};

export function normaliserHeurePostit(h: string | null | undefined): string | null {
  const m = /^(\d{2}):(\d{2})/.exec(h ?? '');
  return m ? `${m[1]}:${m[2]}` : null;
}

export function rappelsValides(r: unknown): Rappel[] {
  return Array.isArray(r) ? RAPPELS.filter((x) => r.includes(x)) : [];
}

/** Lignes jointes (tâche + note) → tâches de l'agenda, triées. Une ligne = une entrée. */
export function versTachesAgenda(lignes: LigneTacheAgenda[]): TacheAgenda[] {
  const vues = new Set<string>();
  const out: TacheAgenda[] = [];
  for (const l of lignes) {
    const p = l.postits;
    if (!p || vues.has(l.id)) continue;
    if (!visibleDansAgenda({ date: l.echeance_date, dansAgenda: l.dans_agenda }, p.statut)) continue;
    vues.add(l.id);
    const type = (p.origine_type in LIBELLE_TYPE ? p.origine_type : 'item') as Emplacement['type'];
    out.push({
      id: l.id,
      postitId: l.postit_id,
      texte: l.texte,
      fait: l.fait,
      date: (l.echeance_date as string).slice(0, 10),
      heure: normaliserHeurePostit(l.echeance_heure),
      rappels: rappelsValides(l.rappels),
      couleur: (p.couleur in PALETTE ? p.couleur : 'jaune') as Couleur,
      postitTitre: p.titre?.trim() || 'Post-it',
      origine: libelleEmplacement({ type, matiereNom: p.origine_matiere_nom, coursTitre: p.origine_cours_titre, ressourceTitre: p.origine_ressource_titre }),
      coursId: p.origine_cours_id,
      lien: lienPostit(p.origine_cle, l.postit_id),
      postitArchive: p.statut === 'archive',
    });
  }
  return out.sort(comparerTaches);
}

/** Date seule d'abord (« tâches du jour »), puis par heure, puis non faites d'abord. */
export function comparerTaches(a: Pick<TacheAgenda, 'date' | 'heure' | 'fait' | 'texte'>, b: Pick<TacheAgenda, 'date' | 'heure' | 'fait' | 'texte'>): number {
  return a.date.localeCompare(b.date)
    || (a.heure ?? '').localeCompare(b.heure ?? '')
    || Number(a.fait) - Number(b.fait)
    || a.texte.localeCompare(b.texte, 'fr');
}

/* ------------------------------------------------------------------ */
/* Report (§42)                                                        */
/* ------------------------------------------------------------------ */

/** Ajoute n jours à une date calendaire (arithmétique UTC, sans fuseau). */
export function decalerDate(iso: string, n: number): string {
  const [a, m, j] = iso.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, j + n)).toISOString().slice(0, 10);
}

/**
 * Report d'une tâche : nouvelle date, heure conservée. Ne touche QUE la tâche
 * (jamais le planificateur, §42/§48).
 */
export function reporter(t: { date: string | null; heure: string | null }, jours: number, aujourdHui: string): { date: string; heure: string | null } {
  const depart = t.date && t.date >= aujourdHui ? t.date : aujourdHui;
  return { date: decalerDate(depart, jours), heure: t.heure };
}

/** Modification d'échéance : l'heure n'a pas de sens sans date (§37). */
export function echeanceCoherente(date: string | null, heure: string | null): { date: string | null; heure: string | null } {
  return date ? { date, heure } : { date: null, heure: null };
}

/* ------------------------------------------------------------------ */
/* Rappels (§45)                                                       */
/* ------------------------------------------------------------------ */

/** Heure du rappel « la veille ». */
export const HEURE_RAPPEL_VEILLE = '18:00';
/** Un rappel en retard de plus de 2 h (cron arrêté) n'est plus envoyé. */
export const RETARD_MAX_RAPPEL_MS = 2 * 3_600_000;

/** Décalage (ms) de l'heure de Paris par rapport à UTC à un instant donné. */
function decalageParis(instant: number): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(instant));
  const v = (t: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const commeUtc = Date.UTC(v('year'), v('month') - 1, v('day'), v('hour'), v('minute'), v('second'));
  return commeUtc - Math.floor(instant / 1000) * 1000;
}

/** Heure murale de Paris → instant UTC (gère heure d'été / d'hiver). */
export function parisVersUtc(date: string, heure: string): Date {
  const [a, m, j] = date.split('-').map(Number);
  const [hh, mm] = heure.split(':').map(Number);
  const naif = Date.UTC(a, m - 1, j, hh, mm);
  let instant = naif - decalageParis(naif);
  instant = naif - decalageParis(instant);
  return new Date(instant);
}

/** Instant d'un rappel pour une tâche datée ET horodatée ; null sinon. */
export function instantRappel(date: string | null, heure: string | null, rappel: Rappel): Date | null {
  if (!date || !heure) return null;
  switch (rappel) {
    case 'heure': return parisVersUtc(date, heure);
    case '15min': return new Date(parisVersUtc(date, heure).getTime() - 15 * 60_000);
    case '1h': return new Date(parisVersUtc(date, heure).getTime() - 60 * 60_000);
    case 'veille': return parisVersUtc(decalerDate(date, -1), HEURE_RAPPEL_VEILLE);
  }
}

/** Clé d'idempotence : un report réarme les rappels de la nouvelle échéance. */
export function cleEcheance(date: string, heure: string): string {
  return `${date}T${heure}`;
}

export type TacheARappeler = {
  id: string;
  fait: boolean;
  date: string | null;
  heure: string | null;
  rappels: Rappel[];
  dansAgenda: boolean;
  statutPostit: Statut;
  /** Dernière modification de l'échéance / des rappels (ISO). */
  echeanceModifieeLe: string;
};

export type RappelDu = { tacheId: string; rappel: Rappel; echeance: string; instant: Date };

/**
 * Rappels à envoyer MAINTENANT : instant atteint, pas plus de 2 h de retard,
 * postérieur au réglage de l'échéance, tâche non faite et toujours dans
 * l'agenda, rappel pas déjà envoyé pour cette échéance (`deja` :
 * « tacheId|rappel|échéance »).
 */
export function rappelsDus(taches: TacheARappeler[], maintenant: Date, deja: Set<string>): RappelDu[] {
  const out: RappelDu[] = [];
  const now = maintenant.getTime();
  for (const t of taches) {
    if (t.fait || !t.date || !t.heure || !visibleDansAgenda(t, t.statutPostit)) continue;
    const echeance = cleEcheance(t.date, t.heure);
    const regle = new Date(t.echeanceModifieeLe).getTime();
    for (const r of t.rappels) {
      const instant = instantRappel(t.date, t.heure, r);
      if (!instant) continue;
      const i = instant.getTime();
      if (i > now || now - i > RETARD_MAX_RAPPEL_MS || i < regle - 60_000) continue;
      if (deja.has(`${t.id}|${r}|${echeance}`)) continue;
      out.push({ tacheId: t.id, rappel: r, echeance, instant });
    }
  }
  return out;
}

/** « Jeudi 9 octobre · 14h30 » (libellé d'échéance, sans fuseau). */
export function libelleEcheance(date: string | null, heure: string | null, opts: { court?: boolean } = {}): string | null {
  if (!date) return null;
  const [a, m, j] = date.split('-').map(Number);
  const d = new Date(Date.UTC(a, m - 1, j, 12));
  const jour = new Intl.DateTimeFormat('fr-FR', opts.court
    ? { day: 'numeric', month: 'short', timeZone: 'UTC' }
    : { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(d);
  const txt = jour.charAt(0).toLocaleUpperCase('fr-FR') + jour.slice(1);
  return heure ? `${txt} · ${heure.replace(':', 'h')}` : txt;
}

/** Échéance dépassée (tâche non faite) — heure de Paris fournie par l'appelant. */
export function estEnRetard(t: { fait: boolean; date: string | null; heure: string | null }, present: { date: string; heure: string }): boolean {
  if (t.fait || !t.date) return false;
  if (t.date !== present.date) return t.date < present.date;
  return !!t.heure && t.heure < present.heure;
}

