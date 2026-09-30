import type { CalendrierEvc, EpreuveEvc, ReglagesEvc } from './types';

/**
 * REPLI — valeurs figées de la session 2026, identiques aux données initiales
 * de la migration 20260930190000_evc_calendrier.sql.
 *
 * Elles ne servent QUE si la base est injoignable (panne, clé absente en
 * développement) : le site ne doit jamais casser pour un calendrier. La source
 * de vérité est la table `evc_calendrier`, éditable dans /admin/calendrier-evc ;
 * modifier ce fichier ne change RIEN à ce qu'affiche le site en temps normal.
 */

const INSCRIPTION_DEBUT = '2026-06-17T12:00:00.000Z'; // 17 juin 2026, 14 h (Paris)
const INSCRIPTION_FIN = '2026-07-16T15:00:00.000Z'; // 16 juillet 2026, 17 h (Paris)

type Brut = [slug: string, nom: string, date: string, externe: number | null, interne: number | null, url: string, college: string, note: string | null];

const LIGNES: Brut[] = [
  ['medecine-du-travail', 'Médecine et santé au travail', '2026-11-10', 61, null, '/specialites#medecine-du-travail', 'col-medecine-du-travail', null],
  ['anesthesie-reanimation', 'Anesthésie-réanimation', '2026-11-13', 64, 201, '/specialites/anesthesie-reanimation', 'col-anesthesie-reanimation', null],
  ['medecine-d-urgence', 'Médecine d’urgence', '2026-11-19', 72, 270, '/specialites/medecine-d-urgence', 'col-mir', null],
  ['oncologie', 'Oncologie', '2026-11-20', 29, null, '/specialites#oncologie', 'col-oncologie', null],
  ['medecine-physique-et-de-readaptation', 'Médecine physique et de réadaptation', '2026-12-01', 37, null, '/specialites#medecine-physique-et-de-readaptation', 'col-medecine-physique-readaptation', null],
  ['pneumologie', 'Pneumologie', '2026-12-02', 17, 40, '/specialites#pneumologie', 'col-pneumologie', null],
  ['cardiologie-et-maladies-vasculaires', 'Médecine cardiovasculaire', '2026-12-03', 20, 146, '/specialites/cardiologie-et-maladies-vasculaires', 'col-cardiologie', null],
  ['radiodiagnostic-et-imagerie-medicale', 'Radiologie et imagerie médicale', '2026-12-08', 72, 116, '/specialites/radiologie-et-imagerie-medicale', 'col-imagerie-medicale', null],
  ['pediatrie', 'Pédiatrie', '2026-12-09', 75, 91, '/specialites/pediatrie', 'col-pediatrie', null],
  ['psychiatrie', 'Psychiatrie', '2026-12-10', 198, 450, '/specialites/psychiatrie', 'col-psychiatrie', 'Nouvelle spécialité 2026'],
  ['chirurgie-orthopedique-et-traumatologie', 'Chirurgie orthopédique et traumatologique', '2027-01-08', null, 101, '/specialites/chirurgie-orthopedique-et-traumatologie', 'col-orthopedie', null],
  ['geriatrie', 'Gériatrie', '2027-01-12', 110, 236, '/specialites#geriatrie', 'col-geriatrie', null],
  ['medecine-interne', 'Médecine interne polyvalente et immunologie clinique', '2027-01-13', 213, 564, '/specialites#medecine-interne', 'col-medecine-interne', 'MIPIC — nouvelle spécialité 2026'],
  ['medecine-generale', 'Médecine générale', '2027-01-15', 35, 89, '/specialites/medecine-generale', 'col-medecine-generale', null],
];

export const REGLAGES_REPLI: ReglagesEvc = {
  session_en_cours: 2026,
  libelle: 'EVC — Session 2026',
  prochaine_inscription_debut: null,
  prochaine_inscription_fin: null,
  prochaine_session_publiee: false,
  url_deroule: '/blog/calendrier-evc-2026-dates-epreuves-specialites',
  slug_capture_hero: 'medecine-generale',
  postes_total_interne: 2896,
  postes_total_externe: 1003,
  source_postes: 'Arrêté du 12 juin 2026',
};

export const EPREUVES_REPLI: EpreuveEvc[] = LIGNES.map(([slug, nom, date, externe, interne, url, college, note], i) => ({
  id: `repli-${slug}`,
  session: 2026,
  slug,
  nom,
  date_epreuve: date,
  postes_externe: externe,
  postes_interne: interne,
  url_page: url,
  inscription_debut: INSCRIPTION_DEBUT,
  inscription_fin: INSCRIPTION_FIN,
  college_id: college,
  lieu: 'Espace Jean Monnet, Rungis',
  note,
  ordre: (i + 1) * 10,
  actif: true,
}));

export const CALENDRIER_REPLI: CalendrierEvc = { epreuves: EPREUVES_REPLI, reglages: REGLAGES_REPLI, source: 'repli' };
