'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarCheck, CalendarDays, ChevronDown, Clock, FileText, Flag, GraduationCap, Layers, Target,
  TrendingUp, type LucideIcon,
} from 'lucide-react';
import {
  PERIODES, bilanSemaine, dateCourte, dateLongue, duree, dureeMesuree, echelleY, estJourActif,
  indicesReperes, lignesInfobulle, type JourActivite, type LigneInfobulle, type Periode,
} from '@/lib/student/activite';

/**
 * Accueil — « Votre activité sur les 30 derniers jours ».
 *
 * Un point par journée civile : hauteur = temps de travail mesuré sur Major
 * ECN, avec ou sans planificateur. Infobulle au survol, au toucher ou au
 * clavier (flèches). Le bandeau inférieur est calculé sur les données réelles
 * de la semaine (cf. `bilanSemaine`).
 *
 * Trois gabarits selon la largeur de la carte (requêtes de conteneur) : la
 * carte du tableau de bord (≈ 340-500 px utiles) garde la hauteur de sa
 * rangée ; à partir de 44rem (tablette, carte pleine largeur) le rendu reprend
 * exactement les mesures de la maquette. SVG tracé à la taille réelle de la
 * zone (ResizeObserver) : textes nets, repères de dates selon la largeur.
 */

const ROUGE = '#A50F1E';
const AUCUN_JOUR: JourActivite[] = [];
const ICONES: Record<LigneInfobulle['type'], LucideIcon> = {
  qcm: Target,
  cas: FileText,
  fc: Layers,
  transv: Clock,
  epreuves: GraduationCap,
  parcours: Flag,
  plan: CalendarCheck,
};

/* Géométrie du tracé (px). */
const BAS = 26;
const DROITE = 5;
const ECART_LIBELLE = 16;
/** Marge haute : serrée dans la carte du tableau de bord, large (comme la maquette) quand la zone est haute. */
const margeHaute = (h: number) => Math.min(65, Math.max(8, 8 + (h - 150) * 0.48));

/** `jours === null` : la lecture a échoué — on le dit, sans afficher une fausse semaine vide. */
export function ActiviteChart({ jours: donnees }: { jours: JourActivite[] | null }) {
  const indisponible = donnees === null;
  const jours = donnees ?? AUCUN_JOUR;
  const [periode, setPeriode] = useState<Periode>(30);
  const [actif, setActif] = useState<number | null>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const bulleRef = useRef<HTMLDivElement>(null);
  const [taille, setTaille] = useState({ l: 0, h: 0 });
  const [position, setPosition] = useState<{ gauche: number; haut: number; pointe: number; dessous: boolean } | null>(null);

  const visibles = useMemo(() => jours.slice(-periode), [jours, periode]);
  const bilan = useMemo(() => bilanSemaine(jours), [jours]);
  const n = visibles.length;

  useEffect(() => {
    const el = zoneRef.current;
    if (!el) return;
    const mesurer = () => setTaille({ l: el.clientWidth, h: el.clientHeight });
    mesurer();
    const ro = new ResizeObserver(mesurer);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ---- Échelles ---- */
  const maxS = visibles.reduce((m, j) => Math.max(m, j.s), 0);
  const echelle = echelleY(maxS);
  const haut = margeHaute(taille.h);
  const largeurLibelle = Math.max(...echelle.reperes.map((r) => largeurTexte(r.libelle)));
  const axeX = Math.round((largeurLibelle + ECART_LIBELLE) * 2) / 2;
  const base = Math.max(haut + 20, taille.h - BAS);
  const xDe = (i: number) => axeX + (n > 1 ? (i * (taille.l - DROITE - axeX)) / (n - 1) : 0);
  const yDe = (s: number) => base - (Math.min(s, echelle.max) / echelle.max) * (base - haut);
  const points = visibles.map((j, i) => ({ x: xDe(i), y: yDe(j.s) }));
  const reperesX = indicesReperes(n, taille.l - axeX - DROITE);
  const rayon = periode === 7 ? 3.25 : periode === 30 ? 2.75 : 1.5;
  const ligne = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const aire = n > 0
    ? `M${points[0].x.toFixed(1)},${base} L${ligne.replaceAll(' ', ' L')} L${points[n - 1].x.toFixed(1)},${base} Z`
    : '';
  const aucuneActivite = !visibles.some(estJourActif);

  const jourActif = actif !== null ? visibles[actif] : null;
  const pointActif = actif !== null ? points[actif] : null;
  const lignes = jourActif ? lignesInfobulle(jourActif) : [];

  /* ---- Infobulle : au-dessus du point, pointe au quart gauche (comme la maquette),
     quitte à déborder sur l'en-tête ; sous le point seulement si elle sortirait
     de l'écran. Jamais hors de la largeur de la carte. ---- */
  useLayoutEffect(() => {
    const bulle = bulleRef.current;
    const zone = zoneRef.current;
    if (!bulle || !zone || !pointActif) { setPosition(null); return; }
    const l = bulle.offsetWidth;
    const h = bulle.offsetHeight;
    const gauche = Math.min(Math.max(pointActif.x - l * 0.25, -4), taille.l - l + 4);
    const dessous = zone.getBoundingClientRect().top + pointActif.y - 15 - h < 8;
    setPosition({
      gauche,
      haut: dessous ? pointActif.y + 15 : pointActif.y - 15 - h,
      pointe: Math.min(Math.max(pointActif.x - gauche, 14), l - 14),
      dessous,
    });
  }, [pointActif?.x, pointActif?.y, actif, periode, taille.l]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- Interactions ---- */
  const indiceDe = (clientX: number) => {
    const zone = zoneRef.current;
    if (!zone || n === 0) return null;
    const x = clientX - zone.getBoundingClientRect().left;
    const pas = n > 1 ? (taille.l - DROITE - axeX) / (n - 1) : 1;
    return Math.min(n - 1, Math.max(0, Math.round((x - axeX) / pas)));
  };

  useEffect(() => {
    if (actif === null) return;
    // Toucher hors du graphique : l'infobulle se ferme.
    // composedPath : le point touché peut avoir quitté le DOM entre-temps.
    const fermer = (e: PointerEvent) => {
      if (zoneRef.current && !e.composedPath().includes(zoneRef.current)) setActif(null);
    };
    document.addEventListener('pointerdown', fermer);
    return () => document.removeEventListener('pointerdown', fermer);
  }, [actif]);

  const surClavier = (e: React.KeyboardEvent) => {
    if (n === 0) return;
    const i = actif ?? n - 1;
    const suivant =
      e.key === 'ArrowLeft' ? Math.max(0, i - 1)
      : e.key === 'ArrowRight' ? Math.min(n - 1, i + 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? n - 1
      : e.key === 'Escape' ? null
      : undefined;
    if (suivant === undefined) return;
    e.preventDefault();
    setActif(suivant);
  };

  const totalPeriode = visibles.reduce((s, j) => s + j.s, 0);
  const joursActifsPeriode = visibles.filter(estJourActif).length;
  const IconeBandeau = bilan.tendance === 'hausse' || bilan.tendance === 'stable' ? TrendingUp : CalendarDays;
  const [conseil1, ...conseilSuite] = bilan.conseil.split('. ');

  return (
    <div className="@container/activite relative flex min-h-0 flex-1 flex-col">
      {/* ---- En-tête ----
          Carte étroite : le sous-titre passe aussi sous le sélecteur (une ligne).
          Carte large : disposition de la maquette, sélecteur centré à droite. */}
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 @[44rem]/activite:ml-1.5 @[44rem]/activite:mr-1 @[44rem]/activite:gap-x-[18px]">
        <span
          aria-hidden
          className="col-start-1 row-span-2 row-start-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FCE7E7] @[30rem]/activite:h-10 @[30rem]/activite:w-10 @[44rem]/activite:h-[45px] @[44rem]/activite:w-[45px] dark:bg-[color-mix(in_srgb,#A50F1E_22%,var(--color-surface))]"
          style={{ color: ROUGE }}
        >
          <IconeBarres className="h-6 w-6 @[30rem]/activite:h-[26px] @[30rem]/activite:w-[26px] @[44rem]/activite:h-[30px] @[44rem]/activite:w-[30px] dark:text-[#F89BA3]" />
        </span>
        <h2 className="col-start-2 row-start-1 text-[14px] font-extrabold leading-[1.2] tracking-[-0.01em] text-[#101733] @[30rem]/activite:text-[15px] @[44rem]/activite:translate-y-0.5 @[44rem]/activite:self-end @[44rem]/activite:text-[18px] @[44rem]/activite:tracking-normal dark:text-(--color-ink)">
          Votre activité sur les {periode} derniers jours
        </h2>
        <label className="relative col-start-3 row-start-1 shrink-0 self-center @[44rem]/activite:row-span-2">
          <span className="sr-only">Période affichée</span>
          <select
            value={periode}
            onChange={(e) => { setPeriode(Number(e.target.value) as Periode); setActif(null); }}
            className="h-7 cursor-pointer appearance-none rounded-[9px] border border-[#E6E7EA] bg-(--color-surface) pl-2.5 pr-7 text-[12px] text-[#4D515C] outline-none transition-colors hover:border-[#D5D7DC] focus-visible:ring-2 focus-visible:ring-[#A50F1E]/30 @[30rem]/activite:h-[30px] @[30rem]/activite:pl-3 @[30rem]/activite:pr-8 @[30rem]/activite:text-[12.5px] @[44rem]/activite:h-[33.5px] @[44rem]/activite:w-[95.5px] @[44rem]/activite:rounded-[10px] @[44rem]/activite:text-[13.5px] dark:border-(--color-border) dark:text-(--color-ink-soft)"
          >
            {PERIODES.map((p) => <option key={p} value={p}>{p} jours</option>)}
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5F636D] @[30rem]/activite:right-2.5 @[44rem]/activite:right-[11px] @[44rem]/activite:h-4 @[44rem]/activite:w-4" strokeWidth={2.25} />
        </label>
        <p className="col-span-2 col-start-2 row-start-2 mt-0.5 text-[11px] leading-snug text-[#6B6F78] @[30rem]/activite:text-[11.5px] @[44rem]/activite:col-span-1 @[44rem]/activite:mt-[5px] @[44rem]/activite:translate-y-0.5 @[44rem]/activite:self-start @[44rem]/activite:text-[12px] dark:text-(--color-ink-soft)">
          Votre travail réalisé sur Major ECN, avec ou sans planificateur.
        </p>
      </div>

      {/* ---- Graphique ---- */}
      <div
        ref={zoneRef}
        role="group"
        tabIndex={0}
        aria-label={`Temps d'activité par jour sur les ${periode} derniers jours : ${duree(totalPeriode)} au total, ${joursActifsPeriode} jour${joursActifsPeriode > 1 ? 's' : ''} actif${joursActifsPeriode > 1 ? 's' : ''}. Flèches gauche et droite pour parcourir les jours.`}
        onKeyDown={surClavier}
        onFocus={() => setActif((a) => a ?? (n > 0 ? n - 1 : null))}
        onBlur={() => setActif(null)}
        onPointerMove={(e) => { if (e.pointerType === 'mouse') setActif(indiceDe(e.clientX)); }}
        onPointerLeave={(e) => { if (e.pointerType === 'mouse') setActif(null); }}
        onPointerDown={(e) => { if (e.pointerType !== 'mouse') setActif(indiceDe(e.clientX)); }}
        className="relative mt-3 min-h-[170px] flex-1 cursor-crosshair touch-pan-y rounded-[8px] outline-none focus-visible:ring-2 focus-visible:ring-[#A50F1E]/25 lg:min-h-[120px] @[44rem]/activite:mx-1.5 @[44rem]/activite:min-h-[272px]"
      >
        {taille.l > 0 && (
          <svg width={taille.l} height={taille.h} className="absolute inset-0 overflow-visible" aria-hidden>
            <defs>
              <linearGradient id="activite-aire" gradientUnits="userSpaceOnUse" x1="0" y1={haut} x2="0" y2={base}>
                <stop offset="0%" stopColor={ROUGE} stopOpacity="0.26" />
                <stop offset="100%" stopColor={ROUGE} stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Quadrillage horizontal + graduations de temps */}
            {echelle.reperes.map((r) => {
              const y = yDe(r.valeur);
              return (
                <g key={r.valeur}>
                  {r.valeur > 0 && (
                    <line x1={axeX} x2={taille.l - DROITE} y1={y} y2={y} className="stroke-[#ECEDF0] dark:stroke-(--color-border)" strokeDasharray="4 4" />
                  )}
                  <line x1={axeX - 5} x2={axeX} y1={y} y2={y} className="stroke-[#D5D7DD] dark:stroke-(--color-border)" />
                  <text x={axeX - ECART_LIBELLE + 1.5} y={y - 1.5} textAnchor="end" dominantBaseline="central" className="fill-[#6E727C] text-[10.5px] dark:fill-(--color-ink-soft)">
                    {r.libelle}
                  </text>
                </g>
              );
            })}

            {/* Quadrillage vertical + dates */}
            {reperesX.map((i) => {
              const x = xDe(i);
              return (
                <g key={i}>
                  {i > 0 && (
                    <line x1={x} x2={x} y1={haut} y2={base} className="stroke-[#EEEFF2] dark:stroke-(--color-border)" strokeDasharray="4 4" />
                  )}
                  <line x1={x} x2={x} y1={base} y2={base + 4} className="stroke-[#D5D7DD] dark:stroke-(--color-border)" />
                  <text x={x} y={base + 22.5} textAnchor="middle" className="fill-[#6E727C] text-[10px] tabular-nums dark:fill-(--color-ink-soft)">
                    {dateCourte(visibles[i].d)}
                  </text>
                </g>
              );
            })}

            {/* Axes */}
            <line x1={axeX} x2={axeX} y1={yDe(echelle.max)} y2={base} className="stroke-[#D7D9DE] dark:stroke-(--color-border)" />
            <line x1={axeX} x2={taille.l - DROITE} y1={base} y2={base} className="stroke-[#D7D9DE] dark:stroke-(--color-border)" />

            {/* Courbe */}
            {n > 0 && <path d={aire} fill="url(#activite-aire)" />}
            {n > 1 && (
              <polyline points={ligne} fill="none" stroke={ROUGE} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            )}
            {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={rayon} fill={ROUGE} />)}

            {/* Jour survolé */}
            {pointActif && (
              <g>
                {base - pointActif.y > 8 && (
                  <line x1={pointActif.x} x2={pointActif.x} y1={pointActif.y + 6} y2={base} stroke="#B9BCC4" strokeDasharray="3 3" />
                )}
                <circle cx={pointActif.x} cy={pointActif.y} r={4.4} className="fill-white dark:fill-(--color-surface)" stroke={ROUGE} strokeWidth={2.6} />
              </g>
            )}
          </svg>
        )}

        {aucuneActivite && taille.l > 0 && (
          <p
            className="pointer-events-none absolute text-center text-[12px] text-(--color-ink-muted)"
            style={{ left: axeX, right: DROITE, top: haut + (base - haut) / 2 - 18 }}
          >
            {indisponible
              ? 'Votre activité ne peut pas être affichée pour le moment.'
              : 'Aucune activité enregistrée sur cette période.'}
          </p>
        )}

        {/* Infobulle */}
        {jourActif && (
          <div
            ref={bulleRef}
            role="status"
            aria-live="polite"
            className="pointer-events-none absolute z-30 w-max max-w-[220px] rounded-[7px] border border-[#ECEDF0] bg-white px-[11px] py-[9px] shadow-[0_10px_26px_-12px_rgba(16,24,40,0.30),0_2px_6px_rgba(16,24,40,0.05)] dark:border-(--color-border) dark:bg-(--color-surface)"
            style={{
              left: position?.gauche ?? 0,
              top: position?.haut ?? 0,
              visibility: position ? 'visible' : 'hidden',
            }}
          >
            <p className="text-[10.75px] font-bold leading-[14px] text-[#101733] dark:text-(--color-ink)">{dateLongue(jourActif.d)}</p>
            {dureeMesuree(jourActif) ? (
              <p className="mt-[5px] whitespace-nowrap leading-[18px]" style={{ color: ROUGE }}>
                <span className="text-[14px] font-extrabold">{duree(jourActif.s)}</span>{' '}
                <span className="text-[12.5px] font-medium">d&rsquo;activité</span>
              </p>
            ) : (
              <p className="mt-[5px] text-[12px] font-semibold leading-[18px] text-(--color-ink-soft)">
                {estJourActif(jourActif) ? 'Durée non mesurée' : 'Aucune activité'}
              </p>
            )}
            {lignes.length > 0 && (
              <ul className="mt-px">
                {lignes.map((l) => {
                  const Icone = ICONES[l.type];
                  return (
                    <li
                      key={l.type}
                      className={`flex items-center gap-[5px] text-[10px] leading-[16.5px] text-[#646872] dark:text-(--color-ink-soft) ${l.type === 'plan' ? 'mt-1 border-t border-[#F0F1F3] pt-1 dark:border-(--color-border)' : ''}`}
                    >
                      <Icone aria-hidden className="h-3 w-3 shrink-0 text-[#40454E] dark:text-(--color-ink-soft)" strokeWidth={1.9} />
                      {l.texte}
                    </li>
                  );
                })}
              </ul>
            )}
            <span
              aria-hidden
              className={`absolute h-2.5 w-2.5 rotate-45 bg-white dark:bg-(--color-surface) ${position?.dessous
                ? '-top-[5.5px] border-l border-t border-[#ECEDF0] dark:border-(--color-border)'
                : '-bottom-[5.5px] border-b border-r border-[#ECEDF0] dark:border-(--color-border)'}`}
              style={{ left: (position?.pointe ?? 0) - 5 }}
            />
          </div>
        )}
      </div>

      {/* ---- Bandeau : constat de la semaine ---- */}
      <div hidden={indisponible} className="mt-3 flex items-center gap-3 rounded-2xl bg-[#F5F3FF] px-3 py-2.5 @[30rem]/activite:px-3.5 @[44rem]/activite:mt-[24.5px] @[44rem]/activite:mb-[1.5px] @[44rem]/activite:gap-[19px] @[44rem]/activite:px-[18px] @[44rem]/activite:py-5 dark:bg-[color-mix(in_srgb,#7C3AED_14%,var(--color-surface))]">
        <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAE6FC] text-[#4C1FB0] @[30rem]/activite:h-10 @[30rem]/activite:w-10 @[44rem]/activite:h-[45px] @[44rem]/activite:w-[45px] dark:bg-[color-mix(in_srgb,#7C3AED_26%,var(--color-surface))] dark:text-[#C4B5FD]">
          <IconeBandeau className="h-[17px] w-[17px] @[44rem]/activite:h-[21px] @[44rem]/activite:w-[21px]" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-extrabold leading-snug text-[#101733] @[30rem]/activite:text-[13.5px] @[44rem]/activite:text-[15.5px] @[44rem]/activite:leading-[22px] dark:text-(--color-ink)">{bilan.titre}</p>
          <p className="text-[12px] leading-snug text-[#5E626C] @[30rem]/activite:text-[12.5px] @[44rem]/activite:mt-[3px] @[44rem]/activite:text-[14.25px] @[44rem]/activite:leading-[20px] dark:text-(--color-ink-soft)">{bilan.detail}</p>
        </div>
        <div className="-mr-[18px] hidden w-[271px] shrink-0 items-center self-stretch @[44rem]/activite:flex">
          <span aria-hidden className="-my-[3.5px] h-[52px] w-px bg-[#DEDCE8] dark:bg-(--color-border)" />
          <p className="pl-[25.5px] text-[11.25px] leading-[19px] text-[#6B6F7A] dark:text-(--color-ink-soft)">
            {conseil1}{conseilSuite.length > 0 ? '.' : ''}
            {conseilSuite.length > 0 && <><br />{conseilSuite.join('. ')}</>}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Largeur d'un libellé d'axe (10,5 px, police de la page), mesurée une fois par texte. */
const largeurs = new Map<string, number>();
let contexte: CanvasRenderingContext2D | null | undefined;
function largeurTexte(texte: string): number {
  const connue = largeurs.get(texte);
  if (connue !== undefined) return connue;
  if (contexte === undefined) {
    contexte = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
    if (contexte) contexte.font = `10.5px ${getComputedStyle(document.body).fontFamily}`;
  }
  const l = contexte ? contexte.measureText(texte).width : texte.length * 5.5;
  largeurs.set(texte, l);
  return l;
}

/** Trois barres arrondies, la deuxième la plus haute (pictogramme de la maquette). */
function IconeBarres({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" className={className} aria-hidden>
      <rect x="4.5" y="13.2" width="2.9" height="5.6" rx="0.9" />
      <rect x="11.3" y="5.5" width="2.6" height="13.3" rx="0.9" />
      <rect x="15.8" y="9.2" width="2.9" height="9.6" rx="0.9" />
    </svg>
  );
}
