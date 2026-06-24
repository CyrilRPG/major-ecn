'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  AlertTriangle, BookOpen, CalendarCheck, CheckCircle2,
  ChevronDown, CircleCheckBig, FileText, HelpCircle,
  Star, Target, Users,
} from 'lucide-react';
import { GUIDE_FAQ, GUIDE_FEATURES, GUIDE_TESTIMONIALS } from '@/lib/data/guide-data';

const FEATURE_ICONS: Record<string, typeof Target> = {
  target: Target,
  alert: AlertTriangle,
  book: BookOpen,
  pen: FileText,
  calendar: CalendarCheck,
  check: CircleCheckBig,
};

export function GuideLandingContent() {
  return (
    <>
      {/* ─── Ce que vous allez apprendre ─── */}
      <section className="border-t border-[#ECEEF1] bg-[#FAFBFE] py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-[28px] font-black tracking-tight text-[#0F1F4D] sm:text-[32px]">
            Ce que vous allez <span className="text-[#C0001F]">apprendre</span> dans le guide
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {GUIDE_FEATURES.map((f) => {
              const Icon = FEATURE_ICONS[f.icon] ?? Target;
              return (
                <div key={f.title} className="rounded-2xl border border-[#ECEEF1] bg-white p-6 text-center shadow-sm">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF5F6]">
                    <Icon className="h-6 w-6 text-[#C0001F]" />
                  </div>
                  <h3 className="text-[15px] font-extrabold text-[#1A2233]">{f.title}</h3>
                  <div className="mx-auto my-2 h-0.5 w-8 bg-[#C0001F]" />
                  <p className="text-[13px] leading-relaxed text-[#52607A]">{f.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="border-t border-[#ECEEF1] bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-[28px] font-black tracking-tight text-[#0F1F4D] sm:text-[32px]">
            Ils ont <span className="text-[#C0001F]">réussi</span> les EVC avec Major ECN
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {GUIDE_TESTIMONIALS.map((t) => (
              <div key={t.name} className="flex flex-col rounded-2xl border border-[#ECEEF1] bg-white p-5 shadow-sm">
                <p className="flex-1 text-[14px] italic leading-relaxed text-[#3A4556]">{t.quote}</p>
                <div className="mt-4 flex items-center gap-3 border-t border-[#ECEEF1] pt-4">
                  {t.photo ? (
                    <Image
                      src={t.photo}
                      alt={t.name}
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0F1F4D] text-sm font-bold text-white">
                      {t.initials}
                    </div>
                  )}
                  <div>
                    <p className="text-[13px] font-bold text-[#1A2233]">{t.name}</p>
                    <p className="text-[11px] text-[#9AA1AE]">{t.specialty}</p>
                    <p className="text-[11px] text-[#9AA1AE]">{t.year}</p>
                  </div>
                </div>
                <div className="mt-2 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-[#FBBF24] text-[#FBBF24]" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="border-t border-[#ECEEF1] bg-[#FAFBFE] py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-[28px] font-black tracking-tight text-[#0F1F4D] sm:text-[32px]">
            FAQ – Vos questions fréquentes
          </h2>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {GUIDE_FAQ.map((item) => (
              <details key={item.q} className="group rounded-xl border border-[#ECEEF1] bg-white shadow-sm">
                <summary className="flex cursor-pointer items-center gap-3 px-5 py-4 text-[14px] font-bold text-[#1A2233] [&::-webkit-details-marker]:hidden">
                  <HelpCircle className="h-4 w-4 shrink-0 text-[#C0001F]" />
                  <span className="flex-1">{item.q}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-[#9AA1AE] transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-[#ECEEF1] px-5 py-4 text-[13px] leading-relaxed text-[#52607A]">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer bar ─── */}
      <section className="border-t border-[#ECEEF1] bg-white py-10">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <p className="text-sm font-semibold text-[#9AA1AE]">La méthode qui fait la différence aux EVC.</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-[#9AA1AE]">
            <Link href="/mentions-legales" className="hover:text-[#1A2233]">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-[#1A2233]">Confidentialité</Link>
            <Link href="/contact" className="hover:text-[#1A2233]">Contact</Link>
          </div>
        </div>
      </section>
    </>
  );
}
