'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowRight, GraduationCap } from 'lucide-react';

/* ============================================================
   CTA sticky mobile — implémentation du cahier des charges
   « CTA sticky dynamiques desktop & mobile » + template
   « Sticky mobile & bouton Offerts ».

   Design (spécifications template, pixel-perfect) :
   - hauteur 56 px, marges latérales 12 px, marge basse 12 px (+ safe area)
   - fond #8B1E1E (bordeaux Major ECN), au touch → #A62A2A pendant 150 ms
   - texte blanc semi-bold 15 px, icône toque blanche 24 px, flèche → 20 px
   - bords arrondis 10 px, ombre 0 -2px 8px rgba(0,0,0,0.08)
   - position fixed bottom/left/right 0, z-index 1000
   - apparition/disparition 150-200 ms (ease-in-out), sans rebond, sans CLS

   Comportement :
   - visible uniquement sur mobile (le header desktop porte S'INSCRIRE)
   - apparaît après la sortie du premier écran (hero)
   - le libellé change selon la zone parcourue (matrice du cahier des charges)
   - se masque quand le CTA principal équivalent est visible à l'écran,
     puis réapparaît dès que l'on continue à scroller (règle importante)
   - se masque pendant la saisie d'un champ de formulaire
   - ne valide jamais un formulaire : navigation ou scroll uniquement
   ============================================================ */

type StickyZone = {
  /** Sélecteur (scopé à <main>) marquant le début de la zone. Omis = zone par défaut. */
  start?: string;
  label: string;
  /** Destination : URL, ancre '#id' (scroll dans <main>) ou 'sel:<sélecteur>'. */
  dest: string;
  /** CTA équivalents (scopés à <main>) : visibles à l'écran → sticky masqué. */
  equivalent?: string;
};

type RouteConfig = {
  test: (path: string) => boolean;
  zones: StickyZone[];
};

/** Matrice des CTA sticky (cahier des charges §3). */
const ROUTES: RouteConfig[] = [
  {
    // Homepage — 4 zones (template : A hero, B réassurance, C tarifs, D FAQ)
    test: (p) => p === '/',
    zones: [
      { label: 'Commencer ma préparation', dest: '/specialites' },
      { start: '#temoignages', label: 'S’inscrire', dest: '/inscription', equivalent: 'a[href="/inscription"]' },
      { start: '#formules', label: 'Choisir ma formule', dest: '#formules', equivalent: 'a[href^="/formules"]' },
      { start: '#faq', label: 'S’inscrire', dest: '/inscription', equivalent: 'a[href="/inscription"]' },
    ],
  },
  {
    // Page « Toutes les spécialités »
    test: (p) => p === '/specialites',
    zones: [
      { label: 'Choisir ma spécialité', dest: '#liste', equivalent: '#liste a' },
    ],
  },
  {
    // Page d'une spécialité (ex. /specialites/medecine-generale)
    test: (p) => p.startsWith('/specialites/'),
    zones: [
      { label: 'Voir les formules', dest: 'sel:#programme', equivalent: 'a[href^="/formules"]' },
    ],
  },
  {
    // Page tarifs — zone tarifs
    test: (p) => p === '/tarifs',
    zones: [
      { label: 'Choisir ma formule', dest: 'sel:main section', equivalent: 'a[href^="/formules"]' },
    ],
  },
  {
    // Pages formules — la formule est en cours de choix / choisie
    test: (p) => p.startsWith('/formules/'),
    zones: [
      { label: 'S’inscrire', dest: 'sel:#choisir-formule', equivalent: '#choisir-formule a, #choisir-formule button' },
    ],
  },
  {
    // Parcours d'inscription (espace découverte) — raccourci uniquement,
    // ne valide jamais le formulaire.
    test: (p) => p === '/espace-decouverte',
    zones: [
      { label: 'Finaliser mon inscription', dest: 'sel:form button[type="submit"]', equivalent: 'form button[type="submit"]' },
    ],
  },
  // Paiement / confirmation : aucun sticky (aucune règle ne matche).
];

const BORDEAUX = '#8B1E1E';

function absTop(el: Element, y: number) {
  return el.getBoundingClientRect().top + y;
}

/** Un élément « équivalent » est-il réellement visible dans le viewport ? */
function equivalentVisible(selector: string, vh: number) {
  const els = document.querySelectorAll(`main ${selector}`);
  for (const el of els) {
    if (!(el instanceof HTMLElement) || !el.offsetParent) continue;
    const r = el.getBoundingClientRect();
    if (r.top < vh - 72 && r.bottom > 72 && r.height > 0) return true;
  }
  return false;
}

export function StickyCtaBar() {
  const pathname = usePathname() || '/';
  const cfg = ROUTES.find((r) => r.test(pathname));

  const [shown, setShown] = useState(false);
  const [zone, setZone] = useState<StickyZone | null>(null);
  const zoneRef = useRef<StickyZone | null>(null);

  const update = useCallback(() => {
    if (!cfg) return;
    const y = window.scrollY;
    const vh = window.innerHeight;

    // Zone courante : dernière zone dont le début est dépassé par le marqueur.
    const marker = y + vh * 0.55;
    let current: StickyZone = cfg.zones[0];
    for (const z of cfg.zones) {
      if (!z.start) { if (current === cfg.zones[0]) current = z; continue; }
      const el = document.querySelector<HTMLElement>(`main ${z.start}`);
      if (el && el.offsetParent && absTop(el, y) <= marker) current = z;
    }
    zoneRef.current = current;
    setZone(current);

    // Visibilité : après la sortie du premier écran…
    let visible = y > vh * 0.6;
    // …jamais pendant la saisie d'un champ…
    const ae = document.activeElement;
    if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) visible = false;
    // …et masqué si le CTA principal équivalent est visible à l'écran.
    if (visible && current.equivalent && equivalentVisible(current.equivalent, vh)) visible = false;
    setShown(visible);
  }, [cfg]);

  useEffect(() => {
    if (!cfg) return;
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('focusin', update);
    window.addEventListener('focusout', update);
    // Filet de sécurité pour les environnements sans événement scroll fiable.
    const tick = window.setInterval(update, 500);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('focusin', update);
      window.removeEventListener('focusout', update);
      window.clearInterval(tick);
    };
  }, [cfg, update, pathname]);

  if (!cfg || !zone) return null;

  const isAnchor = zone.dest.startsWith('#');
  const isSelector = zone.dest.startsWith('sel:');
  const href = isSelector ? '#' : zone.dest;

  const track = () => {
    // Analytics légères (cahier des charges §8) : événement custom +
    // dataLayer si présent — aucun script tiers imposé.
    const detail = {
      page_type: pathname,
      sticky_label: zone.label,
      scroll_depth: Math.round((window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight)) * 100),
      device_type: window.innerWidth < 1024 ? 'mobile' : 'desktop',
    };
    window.dispatchEvent(new CustomEvent('sticky-cta-click', { detail }));
    const dl = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
    if (Array.isArray(dl)) dl.push({ event: 'sticky_cta_click', ...detail });
  };

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    track();
    if (isAnchor || isSelector) {
      const sel = isAnchor ? `main ${zone.dest}` : zone.dest.slice(4);
      const el = document.querySelector<HTMLElement>(sel.startsWith('main') ? sel : `main ${sel}`)
        ?? document.querySelector<HTMLElement>(sel);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div
      aria-hidden={!shown}
      className="fixed inset-x-0 bottom-0 lg:hidden"
      style={{
        zIndex: 1000,
        padding: '0 12px calc(12px + env(safe-area-inset-bottom, 0px))',
        transition: 'transform 180ms ease-in-out, opacity 180ms ease-in-out',
        transform: shown ? 'translateY(0)' : 'translateY(110%)',
        opacity: shown ? 1 : 0,
        pointerEvents: shown ? 'auto' : 'none',
      }}
    >
      <a
        href={href}
        onClick={onClick}
        aria-label={zone.label}
        tabIndex={shown ? 0 : -1}
        className="relative flex h-14 w-full items-center justify-center gap-2.5 text-white outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-white/80 active:bg-[#A62A2A]"
        style={{
          background: BORDEAUX,
          borderRadius: 10,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <GraduationCap aria-hidden className="h-6 w-6 shrink-0" strokeWidth={2} />
        <span className="text-[15px] font-semibold uppercase tracking-wide">{zone.label}</span>
        <ArrowRight aria-hidden className="absolute right-4 h-5 w-5" strokeWidth={2.2} />
      </a>
    </div>
  );
}
