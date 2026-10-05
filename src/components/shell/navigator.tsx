import { CHECKUP_STUDENT_ENABLED, PEDAGO_ENGINE_STUDENT_ENABLED, SUIVI_STUDENT_ENABLED } from '@/lib/modules-flags';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, ChevronRight, Home, Lock, Star, Trophy } from 'lucide-react';
import { iconFromKey } from '@/lib/icons';
import { cn } from '@/lib/utils';
import type { NavCollege } from '@/lib/data/navigator';
import { Link2 } from 'lucide-react';
import { LIENS_COLLEGES } from '@/lib/data/liens-colleges';
import { LockedContentModal } from '@/components/espace-decouverte/locked-content-modal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FAMILLES, ORDRE_MENU, RUBRIQUES, rubriqueDe, type RubriqueCle } from '@/lib/student/rubriques';
import { noterRubriqueVueAction } from '@/lib/student/guide-actions';

/** Active pill : dégradé rouge → orange identique sur tous les items
 *  (top-level et sub-items). Reflète la maquette du client. */
const ACTIVE_GRADIENT =
  'bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] text-white shadow-[0_6px_20px_-8px_rgba(228,0,43,0.6)]';

/** Identifiant du collège « Découverte » (mode Espace découverte). */
const DECOUVERTE_COLLEGE_ID = 'col-decouverte';
/** Rubriques signalées « NEW » dans le menu, avec la clé localStorage qui
 *  mémorise (par navigateur) que l'élève les a déjà ouvertes : la pastille
 *  s'apaise alors. */
const NOUVEAUTES = {
  planning: 'mecn_planning_new_vu_v1',
  priorites: 'mecn_priorites_new_vu_v1',
  checkup: 'mecn_checkup_new_vu_v1',
  evaluations: 'mecn_evaluations_new_vu_v1',
} as const;
type Nouveaute = keyof typeof NOUVEAUTES;

/** Pastille « NEW » à droite d'une entrée du menu. Dorée tant que l'élève n'a
 *  pas ouvert la rubrique, puis discrète (blanc translucide) : elle reste
 *  lisible sans attirer l'œil. Sur l'entrée active (dégradé rouge), elle
 *  passe en blanc pour ne pas se fondre dans le fond. */
function NewBadge({ vu, active }: { vu: boolean; active: boolean }) {
  return (
    <span
      className={cn(
        'ml-auto inline-flex h-[18px] shrink-0 items-center rounded-full px-1.5 text-[9.5px] font-extrabold leading-none tracking-[0.08em] transition-colors duration-300',
        active
          ? 'bg-white text-[#E4002B]'
          : vu
            ? 'bg-white/10 text-white/60 ring-1 ring-inset ring-white/15'
            : 'bg-[linear-gradient(90deg,#F5C84B_0%,#F59E0B_100%)] text-[#3B1D00] shadow-[0_2px_10px_-2px_rgba(245,158,11,0.65)]',
      )}
      aria-label="Nouveau"
    >
      NEW
    </span>
  );
}

function ProgressDot({ value, active }: { value: number; active?: boolean }) {
  const v = Math.min(100, Math.max(0, value));
  const fill = active ? '#FFFFFF' : '#E4002B';
  const track = active ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.18)';
  return (
    <span className="flex shrink-0 items-center gap-1.5">
      <span
        className={
          active
            ? 'w-7 text-right text-[11px] font-semibold tabular-nums text-white'
            : 'w-7 text-right text-[11px] font-medium tabular-nums text-white/55'
        }
      >
        {v}%
      </span>
      <span
        className="h-4 w-4 shrink-0 rounded-full ring-1 ring-white/25"
        style={{ background: `conic-gradient(${fill} ${v * 3.6}deg, ${track} 0)` }}
        aria-hidden
      />
    </span>
  );
}

/** Étoiles d'importance (0–5) réglées par l'admin — affichées juste après le
 *  nom du cours dans le menu. On n'affiche que les étoiles pleines (or) ; rien
 *  si l'importance vaut 0 (« non prioritaire »). Le composant est `inline`
 *  pour suivre le texte du nom même lorsqu'il passe à la ligne. */
function ImportanceStars({ value }: { value: number }) {
  const v = Math.min(5, Math.max(0, Math.round(value || 0)));
  if (v === 0) return null;
  return (
    <span
      className="ml-1 inline-flex shrink-0 items-center gap-px align-middle"
      title={`Importance ${v}/5`}
      aria-label={`Importance ${v} sur 5`}
    >
      {Array.from({ length: v }).map((_, i) => (
        <Star key={i} className="h-3 w-3" style={{ fill: '#F5C84B', color: '#F5C84B' }} />
      ))}
    </span>
  );
}

/** Encadré Découverte compact pour la sidebar — dégradé doré + CTA blanc
 *  vers /tarifs. Affiché au-dessus d'Accueil quand le profil est en mode
 *  Découverte. */
function DiscoverySidebarCta() {
  return (
    <Link
      href="/tarifs"
      className="group mb-2 flex items-center gap-2.5 rounded-xl border px-2.5 py-2.5 transition-all hover:scale-[1.01]"
      style={{
        background: 'linear-gradient(135deg, rgba(245,200,75,0.18) 0%, rgba(192,17,46,0.22) 100%)',
        borderColor: 'rgba(245,200,75,0.32)',
      }}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: 'linear-gradient(135deg, #F5C84B 0%, #E8742C 100%)',
          color: '#1F2937',
        }}
      >
        <Trophy className="h-4 w-4" strokeWidth={2.5} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-extrabold leading-tight text-white">
          Espace découverte
        </p>
        <p className="text-[10.5px] leading-tight text-white/70">
          Voir les formules
        </p>
      </div>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-white/70 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function Navigator({
  tree,
  role = 'student',
  isDecouverte = false,
  canAccessParcoursMajor = false,
  canAccessPlan = false,
}: {
  tree: NavCollege[];
  role?: 'student' | 'admin' | 'professor';
  /** Mode Découverte : Entraînement / Révisions / Agenda / Annales EVC
   *  deviennent des boutons cadenas qui ouvrent LockedContentModal. */
  isDecouverte?: boolean;
  canAccessParcoursMajor?: boolean;
  /** Planificateur EVC ouvert à cet utilisateur (programme de sa spécialité paramétré). */
  canAccessPlan?: boolean;
}) {
  // Pour les profs : seulement les collèges/cours, pas Accueil/Agenda/etc.
  const isProf = role === 'professor';
  const pathname = usePathname();
  const activeCoursId = pathname.startsWith('/cours/') ? pathname.split('/')[2] : null;
  const activeCollegeId = pathname.startsWith('/matieres/') ? pathname.split('/')[2] : null;
  const expanded = useMemo(() => {
    const set = new Set<string>();
    for (const col of tree) {
      if (
        col.id === activeCollegeId ||
        col.cours.some((c) => c.id === activeCoursId)
      ) {
        set.add(col.id);
      }
      for (const sub of col.children ?? []) {
        if (sub.cours.some((c) => c.id === activeCoursId)) {
          set.add(col.id);
          set.add(sub.id);
        }
      }
    }
    return set;
  }, [tree, activeCollegeId, activeCoursId]);

  /**
   * Choix explicites de l'utilisateur : `true` = déplié, `false` = replié.
   *
   * `expanded` ne donne plus que l'état PAR DÉFAUT — le collège de l'item
   * ouvert se déplie tout seul. Auparavant il forçait l'ouverture (`open.has(id)
   * || expanded.has(id)`) : tant qu'on lisait un item de cardiologie, son
   * collège restait dépliable mais impossible à replier, le clic sur le chevron
   * n'ayant aucun effet visible. Un choix explicite prime désormais sur le
   * défaut, et une entrée absente laisse l'ouverture automatique opérer.
   */
  const [choix, setChoix] = useState<Map<string, boolean>>(new Map());
  const isOpen = (id: string) => choix.get(id) ?? expanded.has(id);
  const toggle = (id: string) =>
    setChoix((prev) => {
      const n = new Map(prev);
      n.set(id, !(prev.get(id) ?? expanded.has(id)));
      return n;
    });

  /** State du popup "Ce contenu est réservé" en mode Découverte. */
  const [lockedOpen, setLockedOpen] = useState(false);

  /** Collège « Découverte » à mettre en avant (coachmark). */
  const decouverteColId = useMemo(() => {
    const c = tree.find(
      (col) => col.id === DECOUVERTE_COLLEGE_ID || /d[ée]couverte/i.test(col.nom),
    );
    return c?.id ?? null;
  }, [tree]);

  const active = (cle: RubriqueCle) => {
    const href = RUBRIQUES[cle].href;
    return cle === 'accueil' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  };
  const planActive = active('planning');
  const prioritesActive = active('priorites');
  const checkupActive = active('checkup');
  const evaluationsActive = active('evaluations');

  /** Pastilles « NEW » (Mon planning, Mes priorités, EVC Check-up, Mes évaluations) : apaisées
   *  dès la première ouverture (clic ou arrivée directe), mémorisées par navigateur. */
  const [vues, setVues] = useState<Record<Nouveaute, boolean>>({ planning: false, priorites: false, checkup: false, evaluations: false });
  const marquerVu = useCallback((k: Nouveaute) => {
    setVues((v) => (v[k] ? v : { ...v, [k]: true }));
    try {
      window.localStorage.setItem(NOUVEAUTES[k], '1');
    } catch {
      /* localStorage indisponible (mode privé) : l'état reste en mémoire. */
    }
  }, []);
  useEffect(() => {
    const ouvertes: Record<Nouveaute, boolean> = { planning: planActive, priorites: prioritesActive, checkup: checkupActive, evaluations: evaluationsActive };
    const aMarquer: Nouveaute[] = [];
    const dejaVues: Nouveaute[] = [];
    for (const k of Object.keys(NOUVEAUTES) as Nouveaute[]) {
      if (ouvertes[k]) {
        aMarquer.push(k);
        continue;
      }
      try {
        if (window.localStorage.getItem(NOUVEAUTES[k]) === '1') dejaVues.push(k);
      } catch {
        /* noop */
      }
    }
    if (aMarquer.length === 0 && dejaVues.length === 0) return;
    // rAF : pas de setState synchrone dans l'effet (ni d'écart d'hydratation).
    const raf = requestAnimationFrame(() => {
      aMarquer.forEach(marquerVu);
      if (dejaVues.length > 0) setVues((v) => (dejaVues.every((k) => v[k]) ? v : { ...v, ...Object.fromEntries(dejaVues.map((k) => [k, true])) }));
    });
    return () => cancelAnimationFrame(raf);
  }, [planActive, prioritesActive, checkupActive, evaluationsActive, marquerVu]);

  /** Repère du guide élève : première ouverture de chaque rubrique (une fois par
   *  appareil), pour la carte « Bien démarrer » de l'accueil et la mesure d'usage. */
  useEffect(() => {
    if (role !== 'student') return;
    const cle = rubriqueDe(pathname);
    if (!cle) return;
    const cleLocale = `mecn_repere_vu:${cle}`;
    try {
      if (window.localStorage.getItem(cleLocale) === '1') return;
    } catch {
      /* mode privé : on enregistre quand même (upsert idempotent) */
    }
    void noterRubriqueVueAction(cle).then((r) => {
      if (!r.ok) return;
      try {
        window.localStorage.setItem(cleLocale, '1');
      } catch {
        /* noop */
      }
    });
  }, [pathname, role]);

  const topLevelClass = (on: boolean) =>
    cn(
      'mb-1 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left font-medium transition-colors',
      on ? ACTIVE_GRADIENT : 'text-white/85 hover:bg-white/10 hover:text-white',
    );

  /** Rubriques affichées (registre lib/student/rubriques). */
  const visible = (cle: RubriqueCle): boolean => {
    switch (cle) {
      case 'planning': return isDecouverte ? canAccessPlan || role !== 'student' : canAccessPlan;
      case 'priorites': return PEDAGO_ENGINE_STUDENT_ENABLED;
      case 'checkup': return CHECKUP_STUDENT_ENABLED;
      case 'parcours': return role === 'admin' || canAccessParcoursMajor;
      case 'rendez-vous': return SUIVI_STUDENT_ENABLED && !isDecouverte;
      default: return true;
    }
  };
  /** En Découverte, tout est verrouillé sauf l'accueil, le Parcours du Major, les évaluations (ses notes du Parcours) et le mode d'emploi. */
  const verrouillee = (cle: RubriqueCle) => isDecouverte && cle !== 'accueil' && cle !== 'parcours' && cle !== 'evaluations' && cle !== 'mode-emploi';
  const nouveaute = (cle: RubriqueCle): cle is Nouveaute => cle === 'planning' || cle === 'priorites' || cle === 'checkup' || cle === 'evaluations';

  /** Une entrée du menu, avec son rôle en infobulle (« à quoi ça sert »). */
  const renderItem = (cle: RubriqueCle) => {
    const r = RUBRIQUES[cle];
    const on = active(cle);
    const entree = verrouillee(cle) ? (
      <button
        type="button"
        onClick={() => setLockedOpen(true)}
        className="mb-1 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left font-medium text-white/55 transition-colors hover:bg-white/10 hover:text-white/80"
      >
        <r.Icon className="h-[18px] w-[18px] shrink-0" />
        <span className="flex-1 truncate">{r.label}</span>
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: 'rgba(192,17,46,0.20)', color: '#FCA5A5' }}>
          <Lock className="h-3 w-3" />
        </span>
      </button>
    ) : (
      <Link
        href={r.href}
        onClick={nouveaute(cle) ? () => marquerVu(cle) : undefined}
        aria-current={on ? 'page' : undefined}
        className={topLevelClass(on)}
      >
        <r.Icon className="h-[18px] w-[18px] shrink-0" />
        {r.label}
        {nouveaute(cle) && <NewBadge vu={vues[cle]} active={on} />}
      </Link>
    );
    return (
      <Tooltip key={cle} delayDuration={450}>
        <TooltipTrigger asChild>{entree}</TooltipTrigger>
        <TooltipContent side="right" align="start" sideOffset={10} className="hidden max-w-[270px] rounded-xl bg-white px-3.5 py-2.5 text-[12.5px] leading-snug text-[#4B5563] shadow-[0_18px_40px_-12px_rgba(14,22,38,0.45)] ring-1 ring-black/5 lg:block">
          <span className="block text-[13px] font-bold text-[#14254E]">{r.label}</span>
          <span className="mt-0.5 block">{r.role}</span>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    // Fournisseur propre au menu (infobulles « à quoi ça sert ») : ne dépend pas
    // du fournisseur global du layout racine, absent du rendu serveur du menu.
    <TooltipProvider delayDuration={450} skipDelayDuration={200}>
    <nav aria-label="Navigation" className="space-y-0.5 px-2 pb-8 text-[15px]">
      {/* Encadré Espace découverte — juste au-dessus de Accueil. */}
      {isDecouverte && !isProf && <DiscoverySidebarCta />}

      {isProf ? (
        <>
          {/* Accueil : redirige vers la page d'accueil enseignant (ProfWelcome). */}
          <Link href="/accueil" className={topLevelClass(active('accueil'))}>
            <Home className="h-[18px] w-[18px] shrink-0" />
            Accueil
          </Link>
          {canAccessParcoursMajor && (
            <Link href="/parcours" className={topLevelClass(active('parcours'))}>
              <Trophy className="h-[18px] w-[18px] shrink-0" />
              Parcours du Major
            </Link>
          )}
        </>
      ) : (
        /* Menu élève en trois familles : la méthode se lit dans le menu. */
        FAMILLES.map((f, i) => (
          <div key={f.cle} role="group" aria-labelledby={`menu-${f.cle}`}>
            <p id={`menu-${f.cle}`} className={cn('px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40', i === 0 ? 'pt-1' : 'pt-3')}>
              {f.titre}
            </p>
            {ORDRE_MENU[f.cle].filter(visible).map(renderItem)}
          </div>
        ))
      )}

      <p className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
        {isProf ? 'Mes collèges' : 'Médecine'}
      </p>
      {tree.length === 0 && (
        <p className="px-3 py-6 text-sm text-white/50">Aucun contenu accessible.</p>
      )}
      {tree.map((col) => {
        const Icon = iconFromKey(col.iconKey ?? undefined);
        const o = isOpen(col.id);
        const isDecouverteCol = col.id === decouverteColId;
        // Compteur : items directs + items de tous les sous-collèges (sinon un
        // collège dont tout le contenu est réparti en sous-matières affiche 0).
        const colTotal = col.cours.length + (col.children?.reduce((n, s) => n + s.cours.length, 0) ?? 0);
        return (
          <div key={col.id} className={isDecouverteCol ? 'relative' : undefined}>
            <button
              type="button"
              data-tour="matiere"
              onClick={() => toggle(col.id)}
              className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ChevronRight
                className={cn(
                  'h-4 w-4 shrink-0 text-white/45 transition-transform',
                  o && 'rotate-90',
                )}
              />
              <Icon className="h-[18px] w-[18px] shrink-0 text-white" />
              <span className="min-w-0 flex-1 break-words leading-snug">{col.nom}</span>
              <span className="shrink-0 rounded-full bg-white/10 px-1.5 py-px text-[11px] font-semibold tabular-nums text-white/70">
                {colTotal}
              </span>
            </button>

            {o && (
              <>
                {/* Liens externes du collège (ex. Recommandations ESC en
                    Cardiologie) : avant le premier item, teinte distincte,
                    nouvel onglet — ce ne sont pas des items (lib/data/liens-colleges). */}
                {(LIENS_COLLEGES[col.id] ?? []).map((l) => (
                  <a
                    key={l.id}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={l.sousTitre}
                    className="mx-1 flex items-center gap-2 rounded-lg bg-teal-400/10 py-2 pl-9 pr-2.5 font-medium text-teal-200 transition-colors hover:bg-teal-400/20 hover:text-white"
                  >
                    <span className="min-w-0 flex-1 break-words leading-snug">{l.titre}</span>
                    <Link2 className="h-4 w-4 shrink-0" />
                  </a>
                ))}
                {col.cours.map((c) => (
                  <Link
                    key={c.id}
                    href={`/cours/${c.id}`}
                    data-tour="cours-item"
                    className={cn(
                      'flex items-start gap-2 rounded-lg py-2 pl-10 pr-2.5 transition-colors',
                      c.id === activeCoursId
                        ? `${ACTIVE_GRADIENT} font-medium`
                        : 'text-white/70 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    <span className="min-w-0 flex-1 break-words leading-snug">
                      {c.titre}
                      <ImportanceStars value={c.importance} />
                    </span>
                    <ProgressDot value={c.progress} active={c.id === activeCoursId} />
                  </Link>
                ))}

                {col.children?.map((sub) => {
                  const SubIcon = iconFromKey(sub.iconKey ?? undefined);
                  const so = isOpen(sub.id);
                  return (
                    <div key={sub.id}>
                      <button
                        type="button"
                        onClick={() => toggle(sub.id)}
                        className="group flex w-full items-center gap-2 rounded-lg py-2 pl-10 pr-2.5 text-left text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <ChevronRight
                          className={cn(
                            'h-3.5 w-3.5 shrink-0 text-white/40 transition-transform',
                            so && 'rotate-90',
                          )}
                        />
                        <SubIcon className="h-4 w-4 shrink-0 text-white/80" />
                        <span className="min-w-0 flex-1 break-words text-[14px] font-medium leading-snug">{sub.nom}</span>
                        <span className="shrink-0 rounded-full bg-white/10 px-1.5 py-px text-[10px] font-semibold tabular-nums text-white/60">
                          {sub.cours.length}
                        </span>
                      </button>
                      {so &&
                        sub.cours.map((sc) => (
                          <Link
                            key={sc.id}
                            href={`/cours/${sc.id}`}
                            className={cn(
                              'flex items-start gap-2 rounded-lg py-1.5 pl-[3.75rem] pr-2.5 transition-colors',
                              sc.id === activeCoursId
                                ? `${ACTIVE_GRADIENT} font-medium`
                                : 'text-white/65 hover:bg-white/10 hover:text-white',
                            )}
                          >
                            <span className="min-w-0 flex-1 break-words text-[13px] leading-snug">
                              {sc.titre}
                              <ImportanceStars value={sc.importance} />
                            </span>
                            <ProgressDot value={sc.progress} active={sc.id === activeCoursId} />
                          </Link>
                        ))}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        );
      })}

      {/* Popup "Ce contenu est réservé" (LockedContentModal) — affichée
          quand l'utilisateur Découverte clique sur Entraînement/Révisions/
          Agenda/Annales EVC dans le menu. */}
      <LockedContentModal open={lockedOpen} onClose={() => setLockedOpen(false)} />
    </nav>
    </TooltipProvider>
  );
}
