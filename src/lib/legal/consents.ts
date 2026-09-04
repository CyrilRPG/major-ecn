/**
 * Textes de consentement recueillis à l'inscription payante.
 *
 * Source de vérité unique : la clause est affichée au client (case à cocher du
 * tunnel de paiement) ET figée dans la preuve conservée côté serveur (manifeste
 * de la signature manuscrite). Les deux ne doivent jamais diverger — c'est la
 * raison d'être de ce module, importable depuis un composant client comme
 * depuis une route serveur.
 *
 * STIPULATION CONTRACTUELLE — ne pas reformuler sans validation juridique.
 *
 * L'article visé est celui que citent déjà les CGS (§ 10.1) et les Conditions
 * Particulières : L. 221-28 13° du code de la consommation, qui couvre la
 * fourniture d'un contenu numérique non fourni sur support matériel.
 */
export const RENONCIATION_RETRACTATION =
  'Le Client déclare renoncer expressément à son droit de rétractation en vue d’accéder, '
  + 'sans délai avant la fin dudit délai de rétractation, à la plateforme de la Société et aux '
  + 'services associés dans les conditions des conditions générales de services. En conséquence, '
  + 'en application de l’article L. 221-28 13°, du code de la consommation, le Client ne saurait '
  + 'rétracter son engagement à l’égard de la Société.';

/** Mention affichée au-dessus du pavé de signature manuscrite. */
export const MENTION_SIGNATURE =
  'Je signe ci-dessous, de ma main, pour valider mon inscription et l’ensemble '
  + 'des conditions acceptées ci-dessus.';
