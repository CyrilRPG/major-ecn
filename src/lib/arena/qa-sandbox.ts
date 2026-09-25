/**
 * EVC Arena — bac à sable de recette LOCALE (harnais `tmp/_arena-sim`).
 *
 * La base locale est la base de PRODUCTION. Un tournoi de simulation doit donc
 * rester invisible et inerte pour la production : il est stocké en
 * « Brouillon » (le cron de production l'ignore, les pages publiques de
 * production répondent 404). Hors production uniquement, un tournoi dont le
 * slug commence par `qa-sim-` se comporte comme un tournoi aux inscriptions
 * ouvertes, piloté par ses dates, et ses emails « à blanc » sont journalisés
 * (table `arena_emails` + copie locale du contenu pour vérifier les liens).
 *
 * Aucun effet en production : NODE_ENV y vaut toujours 'production'.
 */
export const QA_SANDBOX_PREFIX = 'qa-sim-';

export function isQaSandboxSlug(slug: string | null | undefined, env: string | undefined = process.env.NODE_ENV): boolean {
  return env !== 'production' && typeof slug === 'string' && slug.startsWith(QA_SANDBOX_PREFIX);
}

/** Statut vu par l'application : un brouillon de simulation joue le rôle d'un tournoi ouvert (hors production). */
export function sandboxStatus<S extends string>(slug: string | null | undefined, stored: S, env?: string): S | 'registration_open' {
  return isQaSandboxSlug(slug, env) && stored === 'draft' ? 'registration_open' : stored;
}
