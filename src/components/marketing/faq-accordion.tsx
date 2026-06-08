'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Calendar, ChevronDown, GraduationCap, Layers3, MessageCircle, Search,
  Sparkles, Stethoscope, TrendingUp,
} from 'lucide-react';
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

      {/* Catégories — chaque entrée est un bloc gris séparé */}
      <ul className="space-y-2.5 p-3 sm:p-4" style={{ background: '#F7F8FB' }}>
        {filtered.length === 0 && (
          <li className="rounded-xl bg-white px-5 py-8 text-center text-[13px]" style={{ color: INK_SOFT }}>
            Aucune question ne correspond à votre recherche.
          </li>
        )}

        {filtered.map(({ cat, matched }, idx) => {
          // En recherche, on ouvre automatiquement la catégorie pour voir les
          // résultats ; hors recherche, on respecte l'état (collapsed par défaut).
          const isOpen = searching ? true : openCat === cat.id;
          return (
            <li
              key={cat.id}
              className="overflow-hidden rounded-xl border bg-white transition-shadow"
              style={{ borderColor: BORDER, boxShadow: isOpen ? '0 6px 22px -14px rgba(15,31,77,0.18)' : undefined }}
            >
              <button
                type="button"
                onClick={() => setOpenCat((cur) => (cur === cat.id ? '' : cat.id))}
                aria-expanded={isOpen}
                disabled={searching}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#FFF8F9] sm:px-5 disabled:cursor-default"
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
                <div className="border-t px-3 pb-4 pt-3 sm:px-4" style={{ borderColor: BORDER, background: '#FAFBFD' }}>
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
   Sidebar partage entre /faq et le bloc FAQ de la page d'accueil :
   3 cartes (contact, pourquoi Major ECN, essai 2 jours).
   ============================================================ */
const RED_DEEP = '#8B0E22';

export function FaqSidebar() {
  return (
    <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      {/* Carte 1 — pas trouve ? */}
      <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6" style={{ borderColor: BORDER }}>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{ background: '#FCEAEC', color: RED }}>
          <MessageCircle className="h-5 w-5" />
        </span>
        <p className="mt-3 text-base font-extrabold" style={{ color: NAVY }}>
          Vous ne trouvez pas la réponse à votre question&nbsp;?
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: INK_SOFT }}>
          Notre équipe répond personnellement sous 24&nbsp;h ouvrées.
        </p>
        <Link href="/contact"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_12px_30px_-12px_rgba(192,17,46,0.55)] transition-transform hover:scale-[1.02]"
          style={{ background: `linear-gradient(135deg, ${RED} 0%, ${RED_DEEP} 100%)` }}>
          Nous contacter <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Carte 2 — Pourquoi Major ECN ? */}
      <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6" style={{ borderColor: BORDER }}>
        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em]"
          style={{ background: '#FCEAEC', borderColor: 'rgba(192,17,46,0.22)', color: RED }}>
          <Sparkles className="h-3 w-3" /> Pourquoi Major ECN
        </span>
        <p className="mt-3 text-base font-extrabold" style={{ color: NAVY }}>Pourquoi choisir Major ECN&nbsp;?</p>
        <ul className="mt-3 space-y-2.5">
          {[
            { Icon: Calendar,      t: 'Depuis 2011, +15 ans d’expérience' },
            { Icon: GraduationCap, t: '+45 spécialités préparées' },
            { Icon: Stethoscope,   t: 'Correcteurs spécialistes en activité' },
            { Icon: Layers3,       t: 'Révisions transversales & flashcards' },
            { Icon: TrendingUp,    t: 'Concours blancs corrigés EVC' },
          ].map((it, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: '#FCEAEC', color: RED }}>
                <it.Icon className="h-3.5 w-3.5" />
              </span>
              <span className="text-[13px] leading-snug" style={{ color: NAVY }}>{it.t}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Carte 3 — Tester 2 jours */}
      <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-[#C0112E] via-[#8B0E22] to-[#0F1F4D] p-5 text-white shadow-[0_24px_60px_-24px_rgba(192,17,46,0.55)] sm:p-6"
        style={{ borderColor: 'rgba(255,255,255,0.18)' }}>
        <span aria-hidden className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-3xl" />
        <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.22em] backdrop-blur">
          <Sparkles className="h-3 w-3" /> Essai gratuit
        </span>
        <p className="mt-3 text-base font-extrabold leading-tight">
          Tester Major ECN pendant 2&nbsp;jours
        </p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/85">
          Accès complet à la plateforme, sans carte bancaire.
        </p>
        <Link href="/inscription"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13px] font-bold shadow-md transition-transform hover:scale-[1.02]"
          style={{ color: RED }}>
          Démarrer l’essai <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
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
