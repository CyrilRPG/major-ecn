import type { PriveCourseContent } from './prive-courses';

import filtrationGlomerulaire from './prive-content/filtration-glomerulaire';
import clairanceRenale from './prive-content/clairance-renale';
import bilanSodium from './prive-content/bilan-sodium';
import regulationPotassium from './prive-content/regulation-potassium';
import desordresHydroelectrolytiques from './prive-content/desordres-hydroelectrolytiques';
import miction from './prive-content/miction';
import roleReinEquilibreAcidoBasique from './prive-content/role-rein-equilibre-acido-basique';
import irc from './prive-content/irc';
import iraFonctionnelle from './prive-content/ira-fonctionnelle';
import semiologieUrologique from './prive-content/semiologie-urologique';
import andrologie from './prive-content/andrologie';
import appareilGenitalMasculin from './prive-content/appareil-genital-masculin';
import perineeFemme from './prive-content/perinee-femme';
import petitBassin from './prive-content/petit-bassin';
import retroperitoine from './prive-content/retroperitoine';
import pharmacologieUe5 from './prive-content/pharmacologie-ue5';
import medecineNucleaireUe5 from './prive-content/medecine-nucleaire-ue5';
import histologieAppareilGenital from './prive-content/histologie-appareil-genital';
import roleReinBilanEau from './prive-content/role-rein-bilan-eau';
import alexis from './prive-content/alexis';
import autresAnnales from './prive-content/autres-annales';
import toutesAnnales from './prive-content/toutes-annales';

const CONTENT: Record<string, PriveCourseContent> = {
  'filtration-glomerulaire': filtrationGlomerulaire,
  'clairance-renale': clairanceRenale,
  'bilan-sodium': bilanSodium,
  'regulation-potassium': regulationPotassium,
  'desordres-hydroelectrolytiques': desordresHydroelectrolytiques,
  'miction': miction,
  'role-rein-equilibre-acido-basique': roleReinEquilibreAcidoBasique,
  'irc': irc,
  'ira-fonctionnelle': iraFonctionnelle,
  'semiologie-urologique': semiologieUrologique,
  'andrologie': andrologie,
  'appareil-genital-masculin': appareilGenitalMasculin,
  'perinee-femme': perineeFemme,
  'petit-bassin': petitBassin,
  'retroperitoine': retroperitoine,
  'pharmacologie-ue5': pharmacologieUe5,
  'medecine-nucleaire-ue5': medecineNucleaireUe5,
  'histologie-appareil-genital': histologieAppareilGenital,
  'role-rein-bilan-eau': roleReinBilanEau,
  'alexis': alexis,
  'autres-annales': autresAnnales,
  'toutes-annales': toutesAnnales,
};

export function getPriveContent(slug: string): PriveCourseContent | null {
  return CONTENT[slug] ?? null;
}

export { CONTENT as PRIVE_CONTENT };
