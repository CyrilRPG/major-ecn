import type { EpreuveEvc, ReglagesEvc } from './types';
import { REGLAGES_REPLI } from './repli';

/**
 * Lignes brutes de la base → types du calendrier. Module PUR : partagé par le
 * chargeur serveur (cache public) et l'administration (service-role).
 */

const texte = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);
const entier = (v: unknown): number | null => {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() ? Number(v) : NaN;
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
};
const jour = (v: unknown): string | null => {
  const s = texte(v);
  return s && /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : null;
};
const instant = (v: unknown): string | null => {
  const s = texte(v);
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
};

export function normaliserEpreuve(r: Record<string, unknown>): EpreuveEvc {
  return {
    id: String(r.id ?? ''),
    session: entier(r.session) ?? REGLAGES_REPLI.session_en_cours,
    slug: texte(r.slug) ?? '',
    nom: texte(r.nom) ?? '',
    date_epreuve: jour(r.date_epreuve),
    postes_interne: entier(r.postes_interne),
    postes_externe: entier(r.postes_externe),
    url_page: texte(r.url_page),
    inscription_debut: instant(r.inscription_debut),
    inscription_fin: instant(r.inscription_fin),
    college_id: texte(r.college_id),
    lieu: texte(r.lieu) ?? 'Espace Jean Monnet, Rungis',
    note: texte(r.note),
    ordre: typeof r.ordre === 'number' ? r.ordre : 0,
    actif: r.actif !== false,
  };
}

export function normaliserReglages(r: Record<string, unknown> | null | undefined): ReglagesEvc {
  if (!r) return REGLAGES_REPLI;
  return {
    session_en_cours: entier(r.session_en_cours) ?? REGLAGES_REPLI.session_en_cours,
    libelle: texte(r.libelle) ?? REGLAGES_REPLI.libelle,
    prochaine_inscription_debut: instant(r.prochaine_inscription_debut),
    prochaine_inscription_fin: instant(r.prochaine_inscription_fin),
    prochaine_session_publiee: r.prochaine_session_publiee === true,
    url_deroule: texte(r.url_deroule) ?? REGLAGES_REPLI.url_deroule,
    slug_capture_hero: texte(r.slug_capture_hero) ?? REGLAGES_REPLI.slug_capture_hero,
    postes_total_interne: entier(r.postes_total_interne),
    postes_total_externe: entier(r.postes_total_externe),
    source_postes: texte(r.source_postes),
  };
}

export const COLONNES_EPREUVE =
  'id, session, slug, nom, date_epreuve, postes_interne, postes_externe, url_page, inscription_debut, inscription_fin, college_id, lieu, note, ordre, actif';
export const COLONNES_REGLAGES =
  'session_en_cours, libelle, prochaine_inscription_debut, prochaine_inscription_fin, prochaine_session_publiee, url_deroule, slug_capture_hero, postes_total_interne, postes_total_externe, source_postes';
