'use client';

import Image from 'next/image';
import { ArrowRight, CheckCircle2, Download, FileText, Users } from 'lucide-react';

export function GuideHero() {
  function openPopup() {
    window.dispatchEvent(new CustomEvent('open-guide-popup'));
  }

  return (
    <section className="bg-white py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF5F6] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#C0001F]">
            <FileText className="h-3.5 w-3.5" /> Ressource gratuite
          </span>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          {/* Left column */}
          <div>
            <h1 className="text-[32px] font-black leading-[1.1] tracking-tight text-[#0F1F4D] sm:text-[40px] lg:text-[46px]">
              Téléchargez gratuitement le Guide Méthodologie EVC&nbsp;2026{' '}
              <span className="text-[#C0001F]">(36&nbsp;pages)</span>
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-[#52607A]">
              La méthode complète pour gagner des points en voie externe et en voie interne.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                'Les 4 familles de questions et comment y répondre',
                'Les pièges à éviter en voie interne (QCM) et externe (EVCF / EVCP)',
                'Les 6 erreurs qui font perdre le plus de points',
                'Le planning de préparation',
                'Des exemples concrets issus des EVC',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[15px] text-[#1A2233]">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#16A34A]" />
                  {item}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={openPopup}
              className="mt-8 inline-flex items-center gap-2.5 rounded-xl px-8 py-4 text-[16px] font-extrabold text-white shadow-[0_14px_36px_-12px_rgba(192,17,46,0.5)] transition-transform hover:scale-[1.02] cursor-pointer"
              style={{ background: 'linear-gradient(90deg, #8B0E22 0%, #C0112E 100%)' }}
            >
              <Download className="h-5 w-5" />
              Télécharger gratuitement le guide
              <ArrowRight className="h-5 w-5" />
            </button>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#F8F9FC] px-4 py-3">
              <Users className="h-5 w-5 shrink-0 text-[#0F1F4D]" />
              <p className="text-[13px] text-[#52607A]">
                Ce guide est utilisé par plus de <strong className="text-[#0F1F4D]">9 000 médecins</strong> pour réussir les EVC depuis 2011.
              </p>
            </div>
          </div>

          {/* Right column — Book cover */}
          <div className="flex flex-col items-center">
            <Image
              src="/guides/guide-cover.png"
              alt="Guide Méthodologie EVC 2026 — Major ECN"
              width={520}
              height={700}
              className="h-auto w-full max-w-[380px] drop-shadow-xl"
              priority
            />
            <p className="mt-3 text-center text-[14px] italic text-[#9AA1AE]">
              <span className="font-semibold text-[#C0001F]">36 pages</span> de conseils et de méthodes concrètes
            </p>
          </div>
        </div>

        {/* Social proof bar */}
        <div className="mt-8 flex items-center justify-center gap-2 text-[14px] text-[#9AA1AE]">
          <Users className="h-4 w-4" />
          Déjà téléchargé par des centaines de médecins préparant les EVC.
        </div>
      </div>
    </section>
  );
}
