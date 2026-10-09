/**
 * Import IA de l'agenda — règles PURES (aucune dépendance serveur), testées
 * dans tests/agenda-import-ia.test.ts.
 *
 * L'administrateur colle un texte libre (« Radiologie Dr X — mercredi 4
 * novembre : … ») ; Claude le transforme en séances `platform_events`, pose des
 * questions dès qu'un point n'est pas certain, puis l'admin valide. Le modèle
 * ne fait QUE la lecture du texte : tout ce qui se vérifie par le calcul (jour de
 * la semaine, date passée, horaires, spécialité connue, doublon avec l'agenda)
 * est contrôlé ici, de façon déterministe, avant d'être montré à l'admin.
 */

export const FORMULES_IMPORT = ['essentiel', 'intensif', 'approfondi'] as const;
export const VOIES_IMPORT = ['interne', 'externe'] as const;
export type FormuleImport = (typeof FORMULES_IMPORT)[number];
export type VoieImport = (typeof VOIES_IMPORT)[number];

/** Spécialité proposée au modèle : mêmes choix que le formulaire de l'agenda. */
export type SpecialiteCatalogue = { id: string; nom: string };

/** Séance telle que renvoyée par le modèle. */
export type SeanceIa = {
  ref: string;
  titre: string;
  date: string;
  /** Jour de la semaine ÉCRIT dans le texte (« mercredi »), null s'il n'y en a pas. */
  jour_ecrit: string | null;
  debut: string | null;
  fin: string | null;
  intervenant: string | null;
  toutes_specialites: boolean;
  specialites: string[];
  formules: string[];
  voies: string[];
  notes: string | null;
};

export type QuestionIa = {
  id: string;
  question: string;
  /** Réponses proposées (cliquables) ; vide = réponse libre. */
  choix: string[];
  /** Plusieurs choix cumulables (ex. formules). */
  multiple: boolean;
};

export type ReponseModele = {
  statut: 'questions' | 'proposition';
  resume: string;
  questions: QuestionIa[];
  seances: SeanceIa[];
};

export type Alerte = { niveau: 'bloquant' | 'attention'; message: string };

/** Séance prête à l'affichage et à l'enregistrement (après contrôles). */
export type SeanceVerifiee = {
  ref: string;
  titre: string;
  date: string;
  debut: string | null;
  fin: string | null;
  intervenant: string | null;
  scope_type: 'all' | 'college';
  scope_colleges: string[];
  required_offers: FormuleImport[];
  voies: VoieImport[];
  notes: string | null;
  alertes: Alerte[];
};

/** Évènement déjà dans l'agenda (contrôle des doublons + contexte du modèle). */
export type EvenementExistant = {
  id: string;
  title: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  intervenant: string | null;
  required_offers: string[] | null;
  scope_type: 'all' | 'college';
  scope_colleges: string[] | null;
  voies: string[] | null;
};

/* ─────────── Schéma de sortie (structured outputs) ─────────── */

const texteOuNull = { anyOf: [{ type: 'string' }, { type: 'null' }] };

/** Format JSON imposé au modèle : la réponse est toujours analysable. */
export const SCHEMA_REPONSE = {
  type: 'object',
  additionalProperties: false,
  required: ['statut', 'resume', 'questions', 'seances'],
  properties: {
    statut: { type: 'string', enum: ['questions', 'proposition'] },
    resume: { type: 'string' },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'question', 'choix', 'multiple'],
        properties: {
          id: { type: 'string' },
          question: { type: 'string' },
          choix: { type: 'array', items: { type: 'string' } },
          multiple: { type: 'boolean' },
        },
      },
    },
    seances: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['ref', 'titre', 'date', 'jour_ecrit', 'debut', 'fin', 'intervenant', 'toutes_specialites', 'specialites', 'formules', 'voies', 'notes'],
        properties: {
          ref: { type: 'string' },
          titre: { type: 'string' },
          date: { type: 'string', format: 'date' },
          jour_ecrit: texteOuNull,
          debut: texteOuNull,
          fin: texteOuNull,
          intervenant: texteOuNull,
          toutes_specialites: { type: 'boolean' },
          specialites: { type: 'array', items: { type: 'string' } },
          formules: { type: 'array', items: { type: 'string', enum: [...FORMULES_IMPORT] } },
          voies: { type: 'array', items: { type: 'string', enum: [...VOIES_IMPORT] } },
          notes: texteOuNull,
        },
      },
    },
  },
} as const;

/* ─────────── Dates ─────────── */

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const sansAccent = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** « AAAA-MM-JJ » valide (calendrier réel, pas de 31 avril). */
export function dateValide(d: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) return false;
  const t = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return t.getUTCFullYear() === Number(m[1]) && t.getUTCMonth() === Number(m[2]) - 1 && t.getUTCDate() === Number(m[3]);
}

/** Jour de la semaine d'une date calendaire (« mercredi »), sans fuseau. */
export function jourDeLaSemaine(d: string): string {
  const [a, m, j] = d.split('-').map(Number);
  return JOURS[new Date(Date.UTC(a, m - 1, j)).getUTCDay()];
}

/** « 4 novembre 2026 » */
export function dateLisible(d: string): string {
  const [a, m, j] = d.split('-').map(Number);
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(a, m - 1, j)));
}

/** « 20h », « 20h30 », « 20:30 », « 9 h 15 » → « HH:MM » ; illisible → null. */
export function heureNormalisee(h: string | null | undefined): string | null {
  const m = /^(\d{1,2})\s*(?:h|:)\s*(\d{2})?$/i.exec((h ?? '').trim());
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2] ?? '0');
  if (hh > 23 || mm > 59) return null;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

const enMinutes = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));

/* ─────────── Contrôles ─────────── */

const DUREE_DEFAUT_MIN = 120;

function chevauche(a: { debut: string | null; fin: string | null }, b: { debut: string | null; fin: string | null }): boolean {
  // Une séance sans horaire occupe la journée : même jour = conflit possible.
  if (!a.debut || !b.debut) return true;
  const ad = enMinutes(a.debut);
  const bd = enMinutes(b.debut);
  const af = a.fin ? enMinutes(a.fin) : ad + DUREE_DEFAUT_MIN;
  const bf = b.fin ? enMinutes(b.fin) : bd + DUREE_DEFAUT_MIN;
  return ad < bf && bd < af;
}

const memesSpecialites = (a: { scope_type: string; scope_colleges: string[] }, b: { scope_type: string; scope_colleges: string[] | null }) =>
  a.scope_type !== 'college' || b.scope_type !== 'college' || a.scope_colleges.some((id) => (b.scope_colleges ?? []).includes(id));

/**
 * Transforme les séances du modèle en séances vérifiées : valeurs nettoyées,
 * spécialités limitées au catalogue, et alertes calculées. Une alerte
 * « bloquant » empêche la validation tant qu'elle n'est pas levée.
 */
export function verifierSeances(
  seances: SeanceIa[],
  ctx: { aujourdHui: string; catalogue: SpecialiteCatalogue[]; existants: EvenementExistant[] },
): SeanceVerifiee[] {
  const connus = new Map(ctx.catalogue.map((s) => [s.id, s.nom]));
  const sortie: SeanceVerifiee[] = [];

  seances.forEach((s, i) => {
    const alertes: Alerte[] = [];
    const titre = (s.titre ?? '').trim().slice(0, 180);
    if (!titre) alertes.push({ niveau: 'bloquant', message: 'Titre manquant.' });

    const date = (s.date ?? '').trim();
    const dateOk = dateValide(date);
    if (!dateOk) alertes.push({ niveau: 'bloquant', message: `Date illisible (« ${date || '—'} »).` });
    else {
      const ecrit = s.jour_ecrit ? sansAccent(s.jour_ecrit) : '';
      const reel = jourDeLaSemaine(date);
      if (ecrit && JOURS.includes(ecrit) && ecrit !== reel) {
        alertes.push({ niveau: 'bloquant', message: `Le texte dit « ${s.jour_ecrit} », mais le ${dateLisible(date)} est un ${reel}.` });
      }
      if (date < ctx.aujourdHui) alertes.push({ niveau: 'attention', message: `Date passée (${dateLisible(date)}).` });
    }

    const debut = heureNormalisee(s.debut);
    const fin = heureNormalisee(s.fin);
    if (s.debut && !debut) alertes.push({ niveau: 'bloquant', message: `Heure de début illisible (« ${s.debut} »).` });
    if (s.fin && !fin) alertes.push({ niveau: 'bloquant', message: `Heure de fin illisible (« ${s.fin} »).` });
    if (!debut) alertes.push({ niveau: 'attention', message: 'Sans horaire : la séance occupera la journée.' });
    if (debut && fin && fin <= debut) alertes.push({ niveau: 'bloquant', message: 'L’heure de fin doit être après l’heure de début.' });

    const inconnues = (s.specialites ?? []).filter((id) => !connus.has(id));
    const specialites = [...new Set((s.specialites ?? []).filter((id) => connus.has(id)))];
    if (inconnues.length) alertes.push({ niveau: 'bloquant', message: `Spécialité inconnue écartée : ${inconnues.join(', ')}.` });
    const toutes = !!s.toutes_specialites;
    if (!toutes && specialites.length === 0) alertes.push({ niveau: 'bloquant', message: 'Aucune spécialité ciblée.' });

    const formules = FORMULES_IMPORT.filter((f) => (s.formules ?? []).includes(f));
    if (formules.length === 0) alertes.push({ niveau: 'bloquant', message: 'Aucune formule choisie.' });
    const voies = VOIES_IMPORT.filter((v) => (s.voies ?? []).includes(v));
    if (voies.length === 0) alertes.push({ niveau: 'bloquant', message: 'Aucune voie choisie.' });

    const seance: SeanceVerifiee = {
      ref: (s.ref ?? '').trim() || `s${i + 1}`,
      titre,
      date,
      debut,
      fin: debut ? fin : null,
      intervenant: (s.intervenant ?? '').trim().slice(0, 180) || null,
      scope_type: toutes ? 'all' : 'college',
      scope_colleges: toutes ? [] : specialites,
      required_offers: formules,
      voies,
      notes: (s.notes ?? '').trim().slice(0, 2000) || null,
      alertes,
    };

    if (dateOk) {
      const proche = (e: { date: string; start_time: string | null; end_time: string | null; scope_type: string; scope_colleges: string[] | null }) =>
        e.date === date
        && chevauche({ debut, fin }, { debut: e.start_time?.slice(0, 5) ?? null, fin: e.end_time?.slice(0, 5) ?? null })
        && memesSpecialites(seance, e);
      const doublon = ctx.existants.find(proche);
      if (doublon) {
        alertes.push({
          niveau: 'attention',
          message: `Déjà dans l’agenda ce jour-là, à la même heure : « ${doublon.title.trim()} »${doublon.start_time ? ` (${doublon.start_time.slice(0, 5)})` : ''}.`,
        });
      }
      const jumelle = sortie.find((o) => o.date === date && chevauche({ debut, fin }, o) && memesSpecialites(seance, { scope_type: o.scope_type, scope_colleges: o.scope_colleges }));
      if (jumelle) alertes.push({ niveau: 'attention', message: `Même créneau que « ${jumelle.titre} » dans cet import.` });
    }

    sortie.push(seance);
  });

  return sortie.sort((a, b) => a.date.localeCompare(b.date) || (a.debut ?? '').localeCompare(b.debut ?? ''));
}

export const estBloquee = (s: SeanceVerifiee) => s.alertes.some((a) => a.niveau === 'bloquant');

/* ─────────── Facturation ─────────── */

/** Coefficient appliqué au coût fournisseur pour la facturation IA. */
const COEFFICIENT_FACTURATION = 2;

/** Montant facturé (€) pour un appel dont le coût fournisseur est `coutUsd`. */
export function montantFactureEur(coutUsd: number): number {
  if (!Number.isFinite(coutUsd) || coutUsd <= 0) return 0;
  return Math.round(coutUsd * COEFFICIENT_FACTURATION * 10_000) / 10_000;
}
