'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';

/**
 * « Les 12 règles détaillées » — maquette client du 24/09/2026 (15_18_15) :
 * panneau à liseré doré, deux colonnes de règles numérotées, « Tout replier /
 * Tout déplier ». Le bouton rouge « Voir les 12 règles détaillées » (au-dessus)
 * déplie tout et fait défiler jusqu'au panneau. Les textes sont ceux de
 * `publicRules` (§19), les titres courts viennent de la maquette. Sans
 * JavaScript, tout reste déplié (attribut `open` rendu côté serveur).
 */
export function RulesAccordion({ rules }: { rules: { title: string; text: string }[] }) {
  const panel = useRef<HTMLElement>(null);
  const [allOpen, setAllOpen] = useState(true);
  const setAll = useCallback((open: boolean) => {
    panel.current?.querySelectorAll('details').forEach((d) => { d.open = open; });
    setAllOpen(open);
  }, []);
  // Une ancre #regle-07 ouvre la règle visée (liens « Comment est calculé le classement ? », etc.).
  useEffect(() => {
    const reveal = () => {
      const target = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
      if (target instanceof HTMLDetailsElement) target.open = true;
    };
    reveal();
    window.addEventListener('hashchange', reveal);
    return () => window.removeEventListener('hashchange', reveal);
  }, []);
  const half = Math.ceil(rules.length / 2);
  const column = (items: typeof rules, offset: number) => (
    <ol className="ev-rules-col" start={offset + 1}>
      {items.map((r, i) => {
        const n = String(offset + i + 1).padStart(2, '0');
        return (
          <li key={n}>
            <details id={`regle-${n}`} open>
              <summary><span className="ev-rules-num" aria-hidden>{n}</span><strong>{r.title}</strong></summary>
              <p>{r.text}</p>
            </details>
          </li>
        );
      })}
    </ol>
  );
  return (
    <>
      <div className="ev-rules-toggle">
        <button type="button" className="ev-btn ev-btn--red" onClick={() => { setAll(true); panel.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }} aria-controls="regles-detaillees">
          Voir les {rules.length} règles détaillées <ChevronDown aria-hidden />
        </button>
      </div>
      <section ref={panel} id="regles-detaillees" className="ev-rules-panel" aria-labelledby="ev-rules-panel-title">
        <header>
          <FileText aria-hidden strokeWidth={1.5} />
          <h2 id="ev-rules-panel-title">Les {rules.length} règles <em>détaillées</em></h2>
          <span aria-hidden className="ev-rules-panel-rule" />
          <button type="button" onClick={() => setAll(!allOpen)} aria-controls="regles-detaillees">
            {allOpen ? <>Tout replier <ChevronUp aria-hidden /></> : <>Tout déplier <ChevronDown aria-hidden /></>}
          </button>
        </header>
        <div className="ev-rules-cols">
          {column(rules.slice(0, half), 0)}
          {column(rules.slice(half), half)}
        </div>
      </section>
    </>
  );
}
