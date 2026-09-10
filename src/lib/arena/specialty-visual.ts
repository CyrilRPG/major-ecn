/**
 * EVC Arena — visuel par défaut d'un tournoi (carte « Choisissez votre
 * tournoi »). Module pur, importable côté client et serveur.
 *
 * Un tournoi peut porter son propre visuel (`arena_tournaments.cover_image_path`,
 * bucket public `arena-public`, déposé dans l'administration). À défaut, la
 * spécialité choisit l'un des visuels tirés de la maquette client du
 * 10/09/2026 (`public/arena/specialites/*.png`, fond sombre fondu).
 */
export type SpecialtyVisual = { src: string; alt: string };

const VISUALS = {
  stethoscope: { src: '/arena/specialites/stethoscope.png', alt: 'Stéthoscope' },
  poumons: { src: '/arena/specialites/poumons.png', alt: 'Poumons' },
  rein: { src: '/arena/specialites/rein.png', alt: 'Rein' },
  cerveau: { src: '/arena/specialites/cerveau.png', alt: 'Cerveau' },
  coeur: { src: '/arena/specialites/coeur.png', alt: 'Cœur' },
  intestin: { src: '/arena/specialites/intestin.png', alt: 'Intestin' },
} as const satisfies Record<string, SpecialtyVisual>;

export type SpecialtyVisualKey = keyof typeof VISUALS;

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Mots-clés (libellé ou identifiant de collège) → visuel. Premier trouvé gagne. */
const RULES: [RegExp, SpecialtyVisualKey][] = [
  [/cardio|coeur|cœur/, 'coeur'],
  [/pneumo|poumon|respir/, 'poumons'],
  [/nephro|rein|urolog/, 'rein'],
  [/psy|neuro|cerveau/, 'cerveau'],
  [/hepato|gastro|digest|intestin/, 'intestin'],
];

/** Visuel par défaut d'une spécialité (libellé public et/ou identifiant de collège). */
export function specialtyVisual(specialty: string, specialtyId?: string | null): SpecialtyVisual {
  const hay = norm(`${specialty} ${specialtyId ?? ''}`);
  for (const [re, key] of RULES) if (re.test(hay)) return VISUALS[key];
  return VISUALS.stethoscope;
}

/** URL publique du visuel déposé par l'administration, ou null. */
export function coverImageUrl(supabaseUrl: string | undefined, path: string | null | undefined): string | null {
  if (!path || !supabaseUrl) return null;
  return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/arena-public/${path.split('/').map(encodeURIComponent).join('/')}`;
}

/** Visuel effectif d'un tournoi : celui déposé, sinon celui de la spécialité. */
export function tournamentVisual(t: { specialty: string; specialty_id?: string | null; cover_image_path?: string | null; title?: string }, supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL): SpecialtyVisual {
  const custom = coverImageUrl(supabaseUrl, t.cover_image_path);
  return custom ? { src: custom, alt: t.title ?? t.specialty } : specialtyVisual(t.specialty, t.specialty_id);
}
