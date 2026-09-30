/**
 * Suivi de la vidéo de présentation (« visite guidée ») — vocabulaire commun à
 * la route d'ingestion, au lecteur et au tableau de bord admin, et calcul des
 * trois indicateurs demandés par le client :
 *   1. clics sur Play, par source ;
 *   2. taux de visionnage complet = visiteurs « complete » / visiteurs « play » ;
 *   3. taux d'inscription après visionnage = visiteurs « signup » (postérieur à
 *      leur premier « play ») / visiteurs « play ».
 * Les taux se comptent en VISITEURS DISTINCTS (visitor_id aléatoire, aucune
 * donnée personnelle), pas en événements : revoir trois fois la vidéo ne fait
 * pas trois visionnages complets.
 *
 * Module PUR (importable côté client, testé par tests/video-indicateurs.test.ts).
 */

export const EVENEMENTS_VIDEO = ['play_click', 'play', 'progress_25', 'progress_50', 'progress_75', 'complete', 'end_cta_click', 'signup'] as const;
export type EvenementVideo = (typeof EVENEMENTS_VIDEO)[number];

export const SOURCES_VIDEO = ['hero_image', 'hero_button', 'page', 'page_email'] as const;
export type SourceVideo = (typeof SOURCES_VIDEO)[number];

export const LIBELLES_SOURCES: Record<SourceVideo, string> = {
  hero_image: 'Accueil — image',
  hero_button: 'Accueil — lien « Découvrir la plateforme »',
  page: 'Page /visite-guidee',
  page_email: 'Page /visite-guidee (lien d’e-mail)',
};

/** Identifiant de visiteur : UUID (ou jeton équivalent) tiré par le navigateur. */
export const VISITEUR_RE = /^[A-Za-z0-9-]{8,64}$/;

export type LigneEvenementVideo = { visitor_id: string; event: string; source: string | null; created_at: string };

export type IndicateursVideo = {
  clicsPlay: number;
  clicsParSource: { source: SourceVideo; clics: number }[];
  lectures: number;
  visiteursPlay: number;
  visiteursComplet: number;
  /** null quand personne n'a lancé la vidéo (pas de division par zéro). */
  tauxComplet: number | null;
  visiteursInscrits: number;
  tauxInscription: number | null;
  paliers: { p25: number; p50: number; p75: number };
  clicsFin: number;
  /** Série quotidienne (jour de Paris) : clics, lectures, complets, inscriptions. */
  parJour: { jour: string; clics: number; lectures: number; complets: number; inscriptions: number }[];
};

const JOUR_PARIS = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' });
function jourDe(iso: string): string {
  const p: Record<string, string> = {};
  for (const x of JOUR_PARIS.formatToParts(new Date(iso))) p[x.type] = x.value;
  return `${p.year}-${p.month}-${p.day}`;
}

export function calculerIndicateursVideo(lignes: LigneEvenementVideo[]): IndicateursVideo {
  const premierPlay = new Map<string, string>();
  const complets = new Set<string>();
  const paliers = { p25: new Set<string>(), p50: new Set<string>(), p75: new Set<string>() };
  const parSource = new Map<SourceVideo, number>();
  let clicsPlay = 0;
  let lectures = 0;
  let clicsFin = 0;
  const jours = new Map<string, { clics: number; lectures: number; complets: number; inscriptions: number }>();
  const jour = (iso: string) => {
    const k = jourDe(iso);
    let j = jours.get(k);
    if (!j) { j = { clics: 0, lectures: 0, complets: 0, inscriptions: 0 }; jours.set(k, j); }
    return j;
  };

  const tries = [...lignes].sort((a, b) => a.created_at.localeCompare(b.created_at));
  for (const l of tries) {
    switch (l.event) {
      case 'play_click': {
        clicsPlay += 1;
        jour(l.created_at).clics += 1;
        if ((SOURCES_VIDEO as readonly string[]).includes(l.source ?? '')) {
          const s = l.source as SourceVideo;
          parSource.set(s, (parSource.get(s) ?? 0) + 1);
        }
        break;
      }
      case 'play':
        lectures += 1;
        jour(l.created_at).lectures += 1;
        if (!premierPlay.has(l.visitor_id)) premierPlay.set(l.visitor_id, l.created_at);
        break;
      case 'complete':
        if (!complets.has(l.visitor_id)) jour(l.created_at).complets += 1;
        complets.add(l.visitor_id);
        break;
      case 'progress_25': paliers.p25.add(l.visitor_id); break;
      case 'progress_50': paliers.p50.add(l.visitor_id); break;
      case 'progress_75': paliers.p75.add(l.visitor_id); break;
      case 'end_cta_click': clicsFin += 1; break;
      default: break;
    }
  }

  // Inscription APRÈS visionnage : un « signup » postérieur au premier « play » du même visiteur.
  const inscrits = new Set<string>();
  for (const l of tries) {
    if (l.event !== 'signup' || inscrits.has(l.visitor_id)) continue;
    const debut = premierPlay.get(l.visitor_id);
    if (debut && l.created_at >= debut) {
      inscrits.add(l.visitor_id);
      jour(l.created_at).inscriptions += 1;
    }
  }

  const visiteursPlay = premierPlay.size;
  const visiteursComplet = [...complets].filter((v) => premierPlay.has(v)).length;
  const taux = (n: number) => (visiteursPlay > 0 ? n / visiteursPlay : null);

  return {
    clicsPlay,
    clicsParSource: SOURCES_VIDEO.map((source) => ({ source, clics: parSource.get(source) ?? 0 })),
    lectures,
    visiteursPlay,
    visiteursComplet,
    tauxComplet: taux(visiteursComplet),
    visiteursInscrits: inscrits.size,
    tauxInscription: taux(inscrits.size),
    paliers: { p25: paliers.p25.size, p50: paliers.p50.size, p75: paliers.p75.size },
    clicsFin,
    parJour: [...jours.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([j, v]) => ({ jour: j, ...v })),
  };
}

/** Paliers de progression franchis entre deux ratios de lecture (0 → 1). */
export function paliersFranchis(ratio: number, dejaEmis: ReadonlySet<EvenementVideo>): EvenementVideo[] {
  const out: EvenementVideo[] = [];
  for (const [seuil, ev] of [[0.25, 'progress_25'], [0.5, 'progress_50'], [0.75, 'progress_75']] as const) {
    if (ratio >= seuil && !dejaEmis.has(ev)) out.push(ev);
  }
  return out;
}
