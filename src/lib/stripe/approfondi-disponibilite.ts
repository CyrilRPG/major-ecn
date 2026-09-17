import 'server-only';

/**
 * Offres du Programme Approfondi réellement achetables en ligne.
 *
 * POURQUOI. Le prix de chaque offre Approfondi vit dans une variable
 * d'environnement (`STRIPE_PRICE_APPRO_*`). Tant qu'elle n'est pas renseignée,
 * `/api/stripe/checkout` refuse la session — c'est le fail-safe voulu : jamais
 * de facturation erronée. Mais le tunnel, lui, proposait l'offre comme les
 * autres : l'étudiant choisissait sa spécialité, remplissait son identité,
 * cochait les trois consentements, SIGNAIT à la main… et récoltait une erreur
 * interne au moment de payer. C'était le cas de « Radiologie et imagerie
 * médicale », dont le prix Stripe n'a jamais été créé (constaté le 17/09/2026).
 *
 * On lit donc l'environnement côté serveur et on le dit au tunnel, qui affiche
 * l'offre comme « ouverture prochaine » et bascule sur le rappel conseiller.
 *
 * Module serveur (lit des variables non publiques) : il ne doit jamais être
 * importé par un composant client — d'où `server-only`.
 */
import { APPROFONDI_SPECIALTIES } from './approfondi';

/** Identifiants des offres (`tier.id`) dont le prix Stripe n'est pas configuré. */
export function offresApprofondiIndisponibles(): string[] {
  return APPROFONDI_SPECIALTIES.flatMap((s) => s.tiers)
    .filter((t) => !process.env[t.envPriceId])
    .map((t) => t.id);
}
