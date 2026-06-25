'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Download, Lightbulb } from 'lucide-react';

export function GuideSuccessBlock() {
  function handleDownload() {
    const link = document.createElement('a');
    link.href = '/guides/guide-methodologie-evc-2026.pdf';
    link.download = 'Guide-Methodologie-EVC-2026-Major-ECN.pdf';
    link.click();
  }

  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-start gap-8 lg:grid-cols-2">
          {/* Left — Parfait! block */}
          <div className="rounded-2xl border border-[#ECEEF1] bg-white p-6 shadow-sm sm:p-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#16A34A] bg-[#F0FDF4]">
              <CheckCircle2 className="h-8 w-8 text-[#16A34A]" />
            </div>

            <h1 className="text-[28px] font-black tracking-tight text-[#C0001F] sm:text-[34px]">
              Parfait !
            </h1>
            <h2 className="mt-2 text-[18px] font-extrabold text-[#0F1F4D] sm:text-[22px]">
              Votre demande a bien été prise en compte.
            </h2>
            <p className="mt-2 text-[15px] font-bold text-[#C0001F]">
              Votre Guide Méthodologie EVC 2026 est prêt à être téléchargé.
            </p>

            <div className="mx-auto mt-4 h-px w-16 bg-[#ECEEF1]" />

            <p className="mt-4 text-[14px] leading-relaxed text-[#52607A]">
              Nous vous remercions pour votre confiance.<br />
              Vous pouvez le télécharger immédiatement en cliquant sur le bouton ci-dessous.
            </p>

            <button
              type="button"
              onClick={handleDownload}
              className="mx-auto mt-6 flex items-center justify-center gap-2.5 rounded-2xl px-8 py-4 text-[16px] font-extrabold text-white shadow-[0_14px_36px_-12px_rgba(192,17,46,0.5)] transition-transform hover:scale-[1.02] cursor-pointer"
              style={{ background: 'linear-gradient(90deg, #8B0E22 0%, #C0112E 100%)' }}
            >
              <Download className="h-5 w-5" />
              Télécharger gratuitement le guide méthodologique EVC
            </button>

            <p className="mt-3 text-[13px] text-[#9AA1AE]">
              PDF • 39 pages • Téléchargement immédiat
            </p>

            <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-[#9AA1AE]">
              <Lightbulb className="h-3.5 w-3.5 shrink-0" />
              <span>Conseil : enregistrez ce guide pour le consulter tout au long de votre préparation.</span>
            </div>
          </div>

          {/* Right — Poursuivez votre préparation */}
          <div className="rounded-2xl border border-[#ECEEF1] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-center sm:justify-start">
              <Image
                src="/plateforme/laptop-phone-dashboard.png"
                alt="Aperçu de la plateforme Major ECN"
                width={400}
                height={300}
                className="h-auto w-full max-w-[240px] rounded-lg"
              />
            </div>
            <h3 className="mt-5 flex items-center gap-2 text-[18px] font-extrabold text-[#0F1F4D]">
              🚀 Poursuivez votre préparation
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-[#52607A]">
              Ce guide vous apporte une méthode de travail solide. Pour aller plus loin, Major ECN met à votre disposition une plateforme complète avec :
            </p>
            <ul className="mt-3 space-y-2">
              {[
                'Des QCM et cas cliniques d\'entraînement',
                'Des cours animés par des praticiens hospitaliers (PH), chefs de clinique-assistants (CCA) et médecins spécialistes',
                'Des fiches de révision et des entraînements ciblés',
                'Un suivi pédagogique et des ressources adaptées aux exigences des EVC',
              ].map((b) => (
                <li key={b} className="flex items-start gap-2 text-[13px] text-[#3A4556]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C0001F]" />
                  {b}
                </li>
              ))}
            </ul>
            <Link
              href="/inscription"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border-2 border-[#0F1F4D] px-5 py-2.5 text-[14px] font-bold text-[#0F1F4D] transition-colors hover:bg-[#0F1F4D] hover:text-white"
            >
              Découvrir la plateforme <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
