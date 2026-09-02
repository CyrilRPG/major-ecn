/**
 * Palette des trois formules — source unique pour tout le site.
 *
 * Essentielle en vert, Intensive en rouge, Approfondie en bleu foncé.
 * Cette convention était déjà celle de l'espace élève (upgrade-banner) et du
 * popup d'information ; les pages vitrine avaient dérivé chacune de leur côté,
 * avec trois jeux de valeurs différents. Toute surface qui colore une formule
 * doit importer d'ici plutôt que redéfinir ses teintes.
 *
 * `main` sert aux titres et aux accents, `deep` aux prix et aux textes forts,
 * `soft` aux fonds d'encadré, `line` aux bordures, `grad` aux filets de tête,
 * badges et boutons, `ombre` à la couleur de l'ombre portée.
 */

export type PaletteFormule = {
  main: string;
  deep: string;
  soft: string;
  line: string;
  grad: string;
  ombre: string;
};

/** Essentielle — vert. Le vert de la charte, déjà utilisé comme accent positif. */
export const FORMULE_ESSENTIELLE: PaletteFormule = {
  main: '#16793C',
  deep: '#115C2E',
  soft: '#ECF6F0',
  line: 'rgba(22,121,60,0.22)',
  grad: 'linear-gradient(90deg, #115C2E 0%, #16793C 100%)',
  ombre: 'rgba(17,92,46,0.45)',
};

/** Intensive — le rouge de la marque. */
export const FORMULE_INTENSIVE: PaletteFormule = {
  main: '#C0112E',
  deep: '#8B0E22',
  soft: '#FDE8EC',
  line: 'rgba(192,17,46,0.22)',
  grad: 'linear-gradient(90deg, #8B0E22 0%, #C0112E 100%)',
  ombre: 'rgba(139,14,34,0.45)',
};

/** Approfondie — le bleu foncé de la charte. */
export const FORMULE_APPROFONDIE: PaletteFormule = {
  main: '#14254E',
  deep: '#0F1B3D',
  soft: '#EEF1F7',
  line: 'rgba(20,37,78,0.26)',
  grad: 'linear-gradient(90deg, #0F1B3D 0%, #14254E 100%)',
  ombre: 'rgba(15,27,61,0.5)',
};
