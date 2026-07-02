'use client';

import Link from 'next/link';
import {
  ArrowRight, Download, AlertTriangle, CheckCircle2, Target,
  Sparkles, CalendarClock, FileText, Star,
} from 'lucide-react';
import { DiagIcon } from './icons';
import { PROFILES, type ProfileKey } from '@/lib/diagnostic/scoring';
import { PROFILES_CONTENT, TRUST_BADGES } from '@/lib/diagnostic/profiles-content';

const NAVY = '#0F1F4D';
const INK = '#1F2937';
const INK_SOFT = '#52607A';

function triggerGuideDownload() {
  if (typeof document === 'undefined') return;
  const a = document.createElement('a');
  a.href = '/guides/guide-methodologie-evc-2026.pdf';
  a.download = 'Guide_Methodologie_EVC_2026_Major_ECN.pdf';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function ProfilResult({
  profileKey,
}: {
  profileKey: ProfileKey;
}) {
  const meta = PROFILES.find((p) => p.key === profileKey)!;
  const content = PROFILES_CONTENT[profileKey];
  const color = meta.color;
  const soft = meta.colorSoft;

  return (
    <div className="w-full" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: INK }}>
      {/* ============ HERO ============ */}
      <section
        className="relative overflow-hidden px-5 py-8 sm:px-10 sm:py-12"
        style={{ background: `linear-gradient(160deg, ${soft} 0%, #FFFFFF 70%)` }}
      >
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-start">
          {/* Left : badge + headline + intro */}
          <div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white"
              style={{ background: color }}
            >
              <Sparkles className="h-3 w-3" /> {content.badge}
            </span>

            <h1 className="mt-4 text-[30px] font-black leading-[1.05] tracking-tight sm:text-[42px]" style={{ color: NAVY }}>
              {content.headline.map((seg, i) => (
                <span key={i} style={seg.accent ? { color } : undefined}>{seg.text}</span>
              ))}
            </h1>

            {/* Profil (sans score chiffré — on conserve les couleurs) */}
            <div className="mt-5">
              <span className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-[15px] font-extrabold shadow-sm" style={{ background: soft, color }}>
                {meta.emoji} {meta.label}
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {content.intro.map((p, i) => (
                <p key={i} className={`text-[15px] leading-relaxed ${i === 0 ? 'font-semibold' : ''}`} style={{ color: i === 0 ? NAVY : INK_SOFT }}>
                  {p}
                </p>
              ))}
            </div>
          </div>

          {/* Right : illustration + VOS POINTS FORTS */}
          <div className="space-y-5">
            <div className="relative flex items-center justify-center py-2">
              <span
                className="flex h-28 w-28 items-center justify-center rounded-full"
                style={{ background: `radial-gradient(circle at 50% 45%, ${color}22 0%, ${color}10 55%, transparent 75%)` }}
              >
                <span className="flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-xl" style={{ background: `linear-gradient(150deg, ${NAVY}, ${color})` }}>
                  <DiagIcon name={content.heroIcon} className="h-10 w-10" strokeWidth={2} />
                </span>
              </span>
              <Sparkles className="absolute right-8 top-0 h-5 w-5" style={{ color }} />
            </div>

            <div className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_20px_50px_-30px_rgba(15,31,77,0.5)]">
              <div className="flex items-center gap-2 px-4 py-3 text-white" style={{ background: NAVY }}>
                <Star className="h-4 w-4" style={{ color: '#FFC107' }} fill="#FFC107" />
                <span className="text-[13px] font-black uppercase tracking-wider">Vos points forts</span>
              </div>
              <ul className="divide-y divide-black/6">
                {content.strengths.map((s) => (
                  <li key={s.title} className="flex items-start gap-3 px-4 py-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: soft, color }}>
                      <DiagIcon name={s.icon} className="h-4.5 w-4.5" strokeWidth={2.2} />
                    </span>
                    <div>
                      <p className="text-[13.5px] font-bold" style={{ color: NAVY }}>{s.title}</p>
                      <p className="text-[12.5px] leading-snug" style={{ color: INK_SOFT }}>{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WARNING + POURQUOI MAJOR ECN ============ */}
      <section className="px-5 py-8 sm:px-10">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          {/* Warning */}
          <div className="rounded-2xl border p-5" style={{ borderColor: '#F5C2C7', background: '#FDF0F1' }}>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: '#C0112E' }}>
                <AlertTriangle className="h-5 w-5" />
              </span>
              <h3 className="text-[15px] font-black leading-snug" style={{ color: '#8B0E22' }}>{content.warning.title}</h3>
            </div>
            {content.warning.lead && (
              <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: INK }}>{content.warning.lead}</p>
            )}
            <ul className="mt-3 space-y-2">
              {content.warning.reasons.map((r) => (
                <li key={r} className="flex items-start gap-2 text-[13px]" style={{ color: INK }}>
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: '#C0112E' }} />
                  {r}
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-xl bg-white/70 px-3 py-2.5 text-[12.5px] font-medium leading-relaxed" style={{ color: '#8B0E22' }}>
              {content.warning.note}
            </p>
          </div>

          {/* Pourquoi Major ECN */}
          <div className="rounded-2xl border border-black/8 bg-white p-5 shadow-[0_20px_50px_-35px_rgba(15,31,77,0.5)]">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: `linear-gradient(150deg, ${NAVY}, ${color})` }}>
                <Target className="h-5 w-5" />
              </span>
              <h3 className="text-[15px] font-black leading-snug" style={{ color: NAVY }}>{content.why.title}</h3>
            </div>
            <ul className="mt-4 space-y-2.5">
              {content.why.checklist.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-[13.5px] leading-snug" style={{ color: INK }}>
                  <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0" style={{ color: meta.color }} />
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-xl px-3 py-2.5 text-[12.5px] font-medium leading-relaxed" style={{ background: soft, color: NAVY }}>
              {content.why.aside}
            </p>
          </div>
        </div>
      </section>

      {/* ============ PRIORITÉ / OBJECTIF (bandeau navy) ============ */}
      <section className="px-5 sm:px-10">
        <div
          className="mx-auto grid max-w-6xl gap-6 overflow-hidden rounded-3xl px-6 py-7 sm:grid-cols-2 sm:px-9"
          style={{ background: `linear-gradient(120deg, #0B1533 0%, ${NAVY} 55%, #241042 100%)` }}
        >
          <div className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.1)', color: '#FFC107' }}>
              <Target className="h-5.5 w-5.5" />
            </span>
            <div>
              <p className="text-[12px] font-black uppercase tracking-wider text-white/60">{content.priority.title}</p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-white">{content.priority.text}</p>
            </div>
          </div>
          <div className="flex gap-3 sm:border-l sm:border-white/10 sm:pl-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.1)', color: '#FFC107' }}>
              <Sparkles className="h-5.5 w-5.5" />
            </span>
            <div>
              <p className="text-[12px] font-black uppercase tracking-wider text-white/60">{content.objective.title}</p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-white">{content.objective.text}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 2 CTA CARDS ============ */}
      <section className="px-5 py-8 sm:px-10">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          {/* Guide */}
          <div className="flex flex-col rounded-2xl border border-black/8 bg-white p-6 shadow-[0_20px_50px_-35px_rgba(15,31,77,0.5)]">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: soft, color }}>
              <FileText className="h-5.5 w-5.5" />
            </span>
            <h3 className="mt-4 text-[17px] font-black leading-snug" style={{ color: NAVY }}>
              Recevez votre feuille de route personnalisée
            </h3>
            <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT }}>
              Téléchargez gratuitement votre Guide méthodologique EVC (39 pages) : méthode, pièges à éviter et priorités concrètes pour votre préparation.
            </p>
            <button
              type="button"
              onClick={triggerGuideDownload}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[14px] font-extrabold text-white shadow-lg transition-transform hover:scale-[1.02]"
              style={{ background: `linear-gradient(90deg, #8B0E22, #C0112E)` }}
            >
              <Download className="h-4.5 w-4.5" /> Télécharger le guide gratuit
            </button>
            <p className="mt-2 text-center text-[11px] text-black/40">100 % gratuit · sans engagement</p>
          </div>

          {/* RDV */}
          <div
            className="flex flex-col rounded-2xl border p-6 text-white shadow-xl"
            style={{ background: `linear-gradient(150deg, ${NAVY} 0%, #241042 100%)`, borderColor: 'transparent' }}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.12)', color: '#FFC107' }}>
              <CalendarClock className="h-5.5 w-5.5" />
            </span>
            <h3 className="mt-4 text-[17px] font-black leading-snug">
              Échangez avec un conseiller Major ECN
            </h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-white/75">
              Lors d’un échange personnalisé, nous analysons votre niveau actuel, votre rythme de travail et vos objectifs pour définir une stratégie adaptée.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[14px] font-extrabold text-white shadow-lg transition-transform hover:scale-[1.02]"
              style={{ background: `linear-gradient(90deg, #E4002B, #F97316)` }}
            >
              Prendre rendez-vous gratuit <ArrowRight className="h-4.5 w-4.5" />
            </Link>
            <p className="mt-2 text-center text-[11px] text-white/50">15 minutes · sans engagement</p>
          </div>
        </div>
      </section>

      {/* ============ TRUST BADGES ============ */}
      <section className="px-5 pb-4 sm:px-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 sm:grid-cols-4">
          {TRUST_BADGES.map((b) => (
            <div key={b.title} className="rounded-2xl border border-black/8 bg-white px-4 py-4 text-center">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: soft, color }}>
                <DiagIcon name={b.icon} className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <p className="mt-2 text-[12.5px] font-black leading-tight" style={{ color: NAVY }}>{b.title}</p>
              <p className="mt-1 text-[11px] leading-snug" style={{ color: INK_SOFT }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CLOSING ============ */}
      <section className="px-5 py-8 text-center sm:px-10">
        <p className="mx-auto max-w-3xl text-[15px] font-semibold leading-relaxed" style={{ color: NAVY }}>
          {content.closing}
        </p>
      </section>
    </div>
  );
}
