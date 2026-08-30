'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, ChevronDown, FileSignature, HelpCircle, Info, LockKeyhole,
  MessageCircle, Rocket, Search, Split, Stethoscope,
} from 'lucide-react';
import {
  FAQ_EVC_CATEGORIES, FAQ_EVC_TOTAL,
  type FaqBlock, type FaqEvcCategory, type FaqEvcQA,
} from '@/lib/data/faq-evc-pae';
import {
  BORDER, Eyebrow, INK_MUTED, INK_SOFT, JAKARTA, MANROPE, NAVY, PINK_BG, RED,
  RED_DEEP, RED_GRADIENT, Reveal, SectionTitle,
} from './home-ui';

/* ============================================================
   BLOC 8 — FAQ « Toutes les réponses à vos questions »
   Moteur de recherche (titres + contenu, insensible aux accents),
   accordéons par thématique avec numérotation continue (1 → 43),
   carte contact + carte CTA « Votre préparation commence ici ».
   ============================================================ */

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, "'");

const blockText = (b: FaqBlock) => (b.t === 'ul' ? b.items.join(' ') : b.text);

function qaMatches(qa: FaqEvcQA, needle: string) {
  if (norm(qa.q).includes(needle)) return true;
  return qa.a.some((b) => norm(blockText(b)).includes(needle));
}

function AnswerBlocks({ blocks }: { blocks: FaqBlock[] }) {
  return (
    <div className="space-y-3" style={{ fontFamily: MANROPE }}>
      {blocks.map((b, i) => {
        if (b.t === 'h') {
          return (
            <p key={i} className="pt-1 text-[13px] font-black tracking-tight" style={{ color: RED_DEEP, fontFamily: JAKARTA }}>
              {b.text}
            </p>
          );
        }
        if (b.t === 'ul') {
          return (
            <ul key={i} className="space-y-1.5 pl-1">
              {b.items.map((it, j) => (
                <li key={j} className="flex items-start gap-2.5 text-[13px] leading-relaxed" style={{ color: INK_SOFT }}>
                  <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: RED }} />
                  {it}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-[13px] leading-relaxed" style={{ color: INK_SOFT }}>
            {b.text}
          </p>
        );
      })}
    </div>
  );
}

export function HomeFaqSection() {
  const [q, setQ] = useState('');
  const [openCat, setOpenCat] = useState<string>('');
  const [openQ, setOpenQ] = useState<number | null>(null);

  const needle = norm(q.trim());
  const searching = needle.length > 1;

  const filtered = useMemo(() => {
    if (!searching) return FAQ_EVC_CATEGORIES.map((cat) => ({ cat, qas: cat.qas }));
    return FAQ_EVC_CATEGORIES
      .map((cat) => {
        const catMatch = norm(cat.title).includes(needle);
        const qas = cat.qas.filter((qa) => qaMatches(qa, needle));
        if (qas.length > 0) return { cat, qas };
        if (catMatch) return { cat, qas: cat.qas };
        return null;
      })
      .filter(Boolean) as { cat: FaqEvcCategory; qas: FaqEvcQA[] }[];
  }, [needle, searching]);

  const totalMatches = filtered.reduce((s, x) => s + x.qas.length, 0);

  return (
    <section id="faq" className="relative overflow-hidden py-16 sm:py-20 lg:py-24" style={{ fontFamily: JAKARTA, background: 'linear-gradient(180deg, #FBFBFD 0%, #FFFFFF 100%)' }}>
      <div aria-hidden className="pointer-events-none absolute -right-52 top-40 -z-10 h-[600px] w-[600px] rounded-full bg-[#B11226]/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Eyebrow icon={<HelpCircle className="h-3.5 w-3.5" />}>FAQ</Eyebrow>
          <div className="mt-5">
            <SectionTitle line1="Toutes les réponses" line2="à vos questions" />
          </div>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed sm:text-base" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
            Trouvez rapidement les réponses à vos questions sur les EVC et notre préparation.
          </p>
        </Reveal>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.55fr_1fr] lg:gap-10">
          {/* ============ Colonne FAQ ============ */}
          <Reveal>
            <div className="overflow-hidden rounded-3xl border bg-white shadow-[0_30px_80px_-40px_rgba(15,27,61,0.3)]" style={{ borderColor: BORDER }}>
              {/* Recherche */}
              <div className="border-b p-4 sm:p-5" style={{ borderColor: BORDER }}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2" style={{ color: INK_MUTED }} />
                    <input
                      type="search"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Quelle question vous posez-vous ?"
                      aria-label="Rechercher dans la FAQ"
                      className="w-full rounded-2xl border bg-white py-3.5 pl-11 pr-10 text-[14px] font-semibold outline-none transition-shadow placeholder:font-medium focus:ring-2 focus:ring-[#C0112E]/25"
                      style={{ borderColor: BORDER, color: NAVY, fontFamily: MANROPE }}
                    />
                    {q && (
                      <button
                        type="button"
                        onClick={() => setQ('')}
                        aria-label="Effacer la recherche"
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[12px] font-bold hover:bg-[#F5F4F0]"
                        style={{ color: INK_MUTED }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <span
                    className="inline-flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-3 text-[12px] font-bold"
                    style={{ borderColor: BORDER, color: INK_SOFT, fontFamily: MANROPE }}
                  >
                    <Info className="h-4 w-4" style={{ color: RED }} />
                    {FAQ_EVC_TOTAL} questions classées par thématiques
                  </span>
                </div>
                <p className="mt-2 text-[11.5px]" style={{ color: INK_MUTED, fontFamily: MANROPE }}>
                  {searching
                    ? `${totalMatches} résultat${totalMatches > 1 ? 's' : ''} dans ${filtered.length} thématique${filtered.length > 1 ? 's' : ''}`
                    : 'Ex. : manque de temps, QCM, voie externe, retard, paiement…'}
                </p>
              </div>

              {/* Thématiques */}
              <ul className="space-y-2.5 p-3 sm:p-4" style={{ background: '#F7F8FB' }}>
                {filtered.length === 0 && (
                  <li className="rounded-2xl bg-white px-5 py-8 text-center text-[13px]" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                    Aucune question ne correspond à votre recherche.
                  </li>
                )}

                {filtered.map(({ cat, qas }, idx) => {
                  const isOpen = searching ? true : openCat === cat.id;
                  return (
                    <li
                      key={cat.id}
                      className="overflow-hidden rounded-2xl border bg-white transition-shadow"
                      style={{ borderColor: BORDER, boxShadow: isOpen ? '0 8px 26px -16px rgba(15,31,77,0.25)' : undefined }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenCat((cur) => (cur === cat.id ? '' : cat.id))}
                        aria-expanded={isOpen}
                        disabled={searching}
                        className="flex w-full items-center gap-3.5 px-4 py-4 text-left transition-colors hover:bg-[#FFF8F9] disabled:cursor-default sm:px-5"
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[13px] font-black tabular-nums"
                          style={{ background: isOpen ? RED : PINK_BG, color: isOpen ? 'white' : RED }}
                        >
                          {idx + 1}
                        </span>
                        <span className="flex-1 text-[14.5px] font-extrabold sm:text-[15px]" style={{ color: isOpen ? RED : NAVY }}>
                          {cat.title}
                        </span>
                        <span className="hidden shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-black sm:inline" style={{ background: '#F5F4F0', color: INK_SOFT }}>
                          {qas.length}
                        </span>
                        {!searching && (
                          <ChevronDown
                            className={'h-4.5 w-4.5 shrink-0 transition-transform duration-300 ' + (isOpen ? 'rotate-180' : '')}
                            style={{ color: isOpen ? RED : INK_MUTED }}
                          />
                        )}
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: 'easeOut' }}
                            className="overflow-hidden"
                          >
                            <div className="border-t px-3 pb-4 pt-3 sm:px-4" style={{ borderColor: BORDER, background: '#FAFBFD' }}>
                              <ul className="space-y-2.5">
                                {qas.map((qa) => {
                                  const isQOpen = openQ === qa.n;
                                  return (
                                    <li key={qa.n} className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: BORDER }}>
                                      <button
                                        type="button"
                                        onClick={() => setOpenQ((cur) => (cur === qa.n ? null : qa.n))}
                                        aria-expanded={isQOpen}
                                        className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#FFF8F9]"
                                      >
                                        <span
                                          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10.5px] font-black tabular-nums"
                                          style={{ background: isQOpen ? RED : PINK_BG, color: isQOpen ? 'white' : RED }}
                                        >
                                          {qa.n}
                                        </span>
                                        <span className="flex-1 text-[13.5px] font-extrabold leading-snug" style={{ color: isQOpen ? RED : NAVY }}>
                                          {qa.q}
                                        </span>
                                        <ChevronDown
                                          className={'mt-0.5 h-4 w-4 shrink-0 transition-transform duration-300 ' + (isQOpen ? 'rotate-180' : '')}
                                          style={{ color: isQOpen ? RED : INK_MUTED }}
                                        />
                                      </button>
                                      <AnimatePresence initial={false}>
                                        {isQOpen && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25, ease: 'easeOut' }}
                                            className="overflow-hidden"
                                          >
                                            <div className="border-t px-4 py-4 sm:px-5" style={{ borderColor: BORDER }}>
                                              <AnswerBlocks blocks={qa.a} />
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>

              {/* Pied de liste */}
              <div className="flex flex-wrap items-center justify-center gap-2 border-t px-5 py-4 text-[13px]" style={{ borderColor: BORDER, fontFamily: MANROPE }}>
                <HelpCircle className="h-4 w-4" style={{ color: INK_MUTED }} />
                <span style={{ color: INK_SOFT }}>Vous ne trouvez pas la réponse à votre question&nbsp;?</span>
                <Link href="/contact" className="inline-flex items-center gap-1.5 font-extrabold transition-opacity hover:opacity-80" style={{ color: RED }}>
                  Contactez notre équipe <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </Reveal>

          {/* ============ Colonne droite ============ */}
          <div className="space-y-5 lg:sticky lg:top-24">
            {/* Carte contact */}
            <Reveal delay={0.08}>
              <div className="rounded-3xl border p-6 sm:p-7" style={{ borderColor: 'rgba(192,17,46,0.14)', background: '#FDF6F7' }}>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md" style={{ background: RED_GRADIENT }}>
                  <MessageCircle className="h-5.5 w-5.5" />
                </span>
                <p className="mt-4 text-[16px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>
                  Vous ne trouvez pas la réponse à votre question&nbsp;?
                </p>
                <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                  Notre équipe pédagogique est disponible pour vous répondre et vous conseiller.
                </p>
                <Link
                  href="/contact"
                  className="group mt-5 inline-flex w-full items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-[13.5px] font-black tracking-tight text-white shadow-[0_16px_40px_-14px_rgba(192,17,46,0.65)] transition-transform hover:scale-[1.02]"
                  style={{ background: RED_GRADIENT }}
                >
                  <MessageCircle className="h-4.5 w-4.5" />
                  Nous contacter
                  <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>

            {/* Carte CTA « Votre préparation commence ici » */}
            <Reveal delay={0.14}>
              <div
                className="relative overflow-hidden rounded-3xl p-7 text-white shadow-[0_30px_80px_-30px_rgba(139,14,34,0.65)] sm:p-8"
                style={{ background: 'linear-gradient(140deg, #C0112E 0%, #8B0E22 48%, #0F1F4D 100%)' }}
              >
                <span aria-hidden className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
                <span aria-hidden className="absolute -bottom-14 -left-12 h-40 w-40 rounded-full bg-white/5 blur-3xl" />

                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur">
                  <Rocket className="h-5.5 w-5.5" />
                </span>
                <p className="mt-4 text-[1.55rem] font-black leading-[1.1] tracking-tight">
                  Votre préparation commence ici.
                </p>
                <p className="mt-3 text-[13.5px] leading-relaxed text-white/85" style={{ fontFamily: MANROPE }}>
                  Choisissez votre spécialité, votre voie et votre niveau d&rsquo;accompagnement.
                </p>

                <div className="mt-6 flex items-start justify-between gap-2 border-y border-white/15 py-5">
                  {[
                    { Icon: Stethoscope, label: '1. Spécialité' },
                    { Icon: Split, label: '2. Voie (interne / externe)' },
                    { Icon: FileSignature, label: "3. Formule d'accompagnement" },
                  ].map((s, i) => (
                    <div key={s.label} className="flex flex-1 items-start gap-2">
                      {i > 0 && <span aria-hidden className="mt-5 hidden h-px w-4 shrink-0 bg-white/25 sm:block" />}
                      <div className="flex flex-1 flex-col items-center gap-2 text-center">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10">
                          <s.Icon className="h-5 w-5" />
                        </span>
                        <span className="text-[10.5px] font-bold leading-tight text-white/90" style={{ fontFamily: MANROPE }}>{s.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/inscription"
                  className="group mt-6 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-white px-5 py-4 text-[13.5px] font-black tracking-tight shadow-lg transition-transform hover:scale-[1.02]"
                  style={{ color: RED }}
                >
                  <FileSignature className="h-4.5 w-4.5" />
                  Commencer ma préparation
                  <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                </Link>

                <div className="mt-5 flex items-center justify-center gap-3 text-[12.5px]" style={{ fontFamily: MANROPE }}>
                  <span className="text-white/80">Besoin d&rsquo;un conseil&nbsp;?</span>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/35 px-4 py-2 text-[11.5px] font-black tracking-tight transition-colors hover:bg-white/10"
                  >
                    Être conseillé <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Bandeau paiement */}
        <Reveal delay={0.1} className="mt-10">
          <div className="flex flex-col items-center justify-between gap-5 rounded-3xl border bg-white px-6 py-5 sm:flex-row sm:px-8" style={{ borderColor: BORDER }}>
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: PINK_BG, color: RED }}>
                <LockKeyhole className="h-5.5 w-5.5" />
              </span>
              <p className="text-[13.5px] leading-snug" style={{ fontFamily: MANROPE, color: INK_SOFT }}>
                <span className="block text-[14px] font-black tracking-tight" style={{ color: NAVY, fontFamily: JAKARTA }}>
                  Paiement 100 % sécurisé
                </span>
                Paiement en plusieurs fois sans frais possible.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {['VISA', 'Mastercard', 'AMEX', 'Apple Pay'].map((b) => (
                <span key={b} className="rounded-lg border bg-white px-3.5 py-2 text-[11.5px] font-black tracking-tight" style={{ borderColor: BORDER, color: NAVY }}>
                  {b}
                </span>
              ))}
              <span className="rounded-lg border px-3.5 py-1.5 text-center text-[10.5px] font-black leading-tight" style={{ borderColor: 'rgba(192,17,46,0.3)', color: RED, background: '#FFF6F7' }}>
                4x<br /><span className="font-bold">sans frais</span>
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
