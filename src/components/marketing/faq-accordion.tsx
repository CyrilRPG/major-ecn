'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { FAQ_CATEGORIES, type FaqCategory, type FaqQA } from '@/lib/data/faq-categories';

const RED = '#C0112E';
const NAVY = '#0F1F4D';
const INK_SOFT = '#52607A';
const INK_MUTED = '#7A8499';
const BORDER = '#E5E9F0';

type Props = {
  /** Catégories affichées (par défaut : la liste complète). */
  categories?: FaqCategory[];
  /** Permet de masquer l'en-tête de la carte (titre + bandeau rouge). */
  showHeader?: boolean;
};

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function FaqAccordion({ categories = FAQ_CATEGORIES, showHeader = true }: Props) {
  const [q, setQ] = useState('');
  const [openCat, setOpenCat] = useState<string>('');
  const [openQ, setOpenQ] = useState<string>('');

  const needle = norm(q.trim());
  const searching = needle.length > 0;

  // Filtre par recherche : on garde une catégorie si son titre matche ou si
  // au moins une question/réponse matche. Les questions affichées dans une
  // catégorie sont elles aussi filtrées.
  const filtered = useMemo(() => {
    if (!searching) return categories.map((c) => ({ cat: c, matched: c.qas }));
    return categories
      .map((c) => {
        const catMatch = norm(c.title).includes(needle);
        const matched = c.qas.filter(
          (qa) => norm(qa.q).includes(needle) || norm(qa.a).includes(needle),
        );
        if (catMatch) return { cat: c, matched: matched.length > 0 ? matched : c.qas };
        if (matched.length > 0) return { cat: c, matched };
        return null;
      })
      .filter(Boolean) as { cat: FaqCategory; matched: FaqQA[] }[];
  }, [categories, needle, searching]);

  const totalMatches = filtered.reduce((s, x) => s + x.matched.length, 0);

  return (
    <div className="overflow-hidden rounded-3xl border bg-white shadow-[0_30px_80px_-30px_rgba(15,31,77,0.20)]"
      style={{ borderColor: BORDER }}>
      {showHeader && (
        <div className="border-b px-5 py-4 sm:px-6 sm:py-5" style={{ borderColor: BORDER }}>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: RED }}>
            Sommaire complet
          </p>
          <p className="text-lg font-extrabold sm:text-xl" style={{ color: NAVY }}>
            Toutes les réponses à vos questions
          </p>
        </div>
      )}

      {/* Recherche */}
      <div className="border-b px-5 py-4 sm:px-6" style={{ borderColor: BORDER }}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: INK_MUTED }} />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher une question, un mot-clé…"
            className="w-full rounded-xl border bg-white py-2.5 pl-10 pr-9 text-[13.5px] font-medium outline-none transition-shadow placeholder:font-normal focus:ring-2"
            style={{ borderColor: BORDER, color: NAVY }}
            aria-label="Rechercher dans la FAQ"
          />
          {q && (
            <button type="button"
              onClick={() => setQ('')}
              aria-label="Effacer la recherche"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[11px] font-bold text-(--color-ink-muted) hover:bg-(--color-sand-100)"
              style={{ color: INK_MUTED }}>
              ✕
            </button>
          )}
        </div>
        {searching && (
          <p className="mt-2 text-[11.5px] font-semibold" style={{ color: INK_MUTED }}>
            {totalMatches} résultat{totalMatches > 1 ? 's' : ''} dans {filtered.length} catégorie{filtered.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Catégories */}
      <ul className="divide-y" style={{ borderColor: BORDER }}>
        {filtered.length === 0 && (
          <li className="px-5 py-8 text-center text-[13px] sm:px-6" style={{ color: INK_SOFT }}>
            Aucune question ne correspond à votre recherche.
          </li>
        )}

        {filtered.map(({ cat, matched }, idx) => {
          // En recherche, on ouvre automatiquement la catégorie pour voir les
          // résultats ; hors recherche, on respecte l'état (collapsed par défaut).
          const isOpen = searching ? true : openCat === cat.id;
          return (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => setOpenCat((cur) => (cur === cat.id ? '' : cat.id))}
                aria-expanded={isOpen}
                disabled={searching}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[#FFF8F9] sm:px-6 disabled:cursor-default"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[12.5px] font-black tabular-nums"
                  style={{ background: isOpen ? RED : '#FCEAEC', color: isOpen ? 'white' : RED }}>
                  {idx + 1}
                </span>
                <span className="flex-1 text-[14px] font-extrabold sm:text-[15px]"
                  style={{ color: isOpen ? RED : NAVY }}>
                  {cat.title}
                </span>
                {!searching && (
                  <ChevronDown className={'h-4 w-4 shrink-0 transition-transform ' + (isOpen ? 'rotate-180' : '')}
                    style={{ color: isOpen ? RED : INK_MUTED }} />
                )}
              </button>

              {isOpen && (
                <div className="border-t bg-[#FFFCFD] px-3 pb-4 pt-3 sm:px-4" style={{ borderColor: BORDER }}>
                  <ul className="space-y-2.5">
                    {matched.map((qa) => {
                      const qid = `${cat.id}::${qa.q}`;
                      const isQOpen = openQ === qid;
                      return (
                        <li key={qid} className="overflow-hidden rounded-2xl border bg-white"
                          style={{ borderColor: BORDER }}>
                          <button
                            type="button"
                            onClick={() => setOpenQ((cur) => (cur === qid ? '' : qid))}
                            aria-expanded={isQOpen}
                            className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#FFF8F9]"
                          >
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                              style={{ background: isQOpen ? RED : '#FCEAEC' }}>
                              <ChevronDown className={'h-3 w-3 transition-transform ' + (isQOpen ? 'rotate-180' : '-rotate-90')}
                                style={{ color: isQOpen ? 'white' : RED }} />
                            </span>
                            <span className="flex-1 text-[13.5px] font-extrabold leading-snug"
                              style={{ color: isQOpen ? RED : NAVY }}>
                              <Highlighted text={qa.q} needle={needle} />
                            </span>
                          </button>
                          {isQOpen && (
                            <div className="border-t px-4 py-3" style={{ borderColor: BORDER }}>
                              <p className="text-[13px] leading-relaxed" style={{ color: INK_SOFT }}>
                                <Highlighted text={qa.a} needle={needle} />
                              </p>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ============================================================
   Surligne les passages qui matchent la recherche.
   ============================================================ */
function Highlighted({ text, needle }: { text: string; needle: string }) {
  if (!needle) return <>{text}</>;
  const lower = norm(text);
  const idx = lower.indexOf(needle);
  if (idx < 0) return <>{text}</>;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + needle.length);
  const after = text.slice(idx + needle.length);
  return (
    <>
      {before}
      <mark className="rounded px-0.5" style={{ background: '#FFE9AD', color: '#5A3A00' }}>
        {match}
      </mark>
      {after}
    </>
  );
}
