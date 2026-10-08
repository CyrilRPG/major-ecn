/**
 * Agenda d'administration — couleurs par spécialité et disposition des
 * séances simultanées (module PUR, testé : tests/agenda-admin-vue.test.ts).
 */

export type Teinte = {
  /** Fond de carte. */
  fond: string;
  /** Texte et accents. */
  encre: string;
  /** Bande / pastille (couleur franche). */
  vive: string;
  /** Bordure discrète. */
  bord: string;
};

/** Évènement ouvert à toutes les spécialités : bleu nuit de la charte. */
export const TEINTE_TOUTES: Teinte = { fond: '#E8ECF3', encre: '#1C2E49', vive: '#1C2E49', bord: '#C5CEDC' };

/**
 * Couleur d'une spécialité d'après son rang dans la liste des collèges
 * (ordre de la plateforme : stable d'une visite à l'autre). L'angle d'or
 * éloigne les teintes voisines, même avec une quarantaine de collèges ; la
 * luminosité alterne pour départager deux teintes proches.
 */
export function teinteDeRang(rang: number): Teinte {
  const h = Math.round((rang * 137.508 + 8) % 360);
  const sombre = rang % 2 === 1;
  return {
    fond: `hsl(${h} 85% ${sombre ? 93 : 95}%)`,
    encre: `hsl(${h} 70% ${sombre ? 24 : 28}%)`,
    vive: `hsl(${h} 72% ${sombre ? 42 : 48}%)`,
    bord: `hsl(${h} 60% 82%)`,
  };
}

export function palettesSpecialites(ids: readonly string[]): Map<string, Teinte> {
  return new Map(ids.map((id, i) => [id, teinteDeRang(i)]));
}

/** "HH:MM[:SS]" → minutes depuis minuit. */
export function minutes(h: string): number {
  const [hh, mm] = h.split(':').map(Number);
  return hh * 60 + (mm || 0);
}

export type Creneau = { id: string; debut: number; fin: number };
export type Place = { voie: number; voies: number; simultanes: number };

/**
 * Disposition des séances d'une journée : deux séances qui se chevauchent
 * sont posées côte à côte (une « voie » chacune) ; `voies` = largeur du
 * groupe de chevauchement, `simultanes` = nombre de séances qui se
 * recouvrent réellement avec celle-ci (elle comprise).
 */
export function disposer(creneaux: readonly Creneau[]): Map<string, Place> {
  const tries = [...creneaux].sort((a, b) => a.debut - b.debut || b.fin - a.fin || a.id.localeCompare(b.id));
  const out = new Map<string, Place>();
  let groupe: { c: Creneau; voie: number }[] = [];
  let finGroupe = -1;
  const clore = () => {
    const voies = groupe.reduce((m, g) => Math.max(m, g.voie + 1), 0);
    for (const g of groupe) {
      const simultanes = groupe.filter((o) => o.c.debut < g.c.fin && g.c.debut < o.c.fin).length;
      out.set(g.c.id, { voie: g.voie, voies, simultanes });
    }
    groupe = [];
  };
  for (const c of tries) {
    if (groupe.length > 0 && c.debut >= finGroupe) clore();
    // Première voie libérée avant le début de ce créneau.
    const occupees = new Set(groupe.filter((g) => g.c.fin > c.debut).map((g) => g.voie));
    let voie = 0;
    while (occupees.has(voie)) voie++;
    groupe.push({ c, voie });
    finGroupe = Math.max(finGroupe, c.fin);
  }
  if (groupe.length > 0) clore();
  return out;
}

/** Durée retenue pour une séance sans heure de fin (affichage). */
export const DUREE_PAR_DEFAUT = 60;
