'use client';

import { ArrowRight, Clock, BarChart3, Lock, CheckCircle2, Users, GraduationCap, MonitorSmartphone, Headset, User, TrendingUp, Target } from 'lucide-react';
import { BrandLogo } from '@/components/brand/brand-logo';

const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const NAVY = '#0F1F4D';
const INK_SOFT = '#52607A';

const BADGES = [
  { Icon: Clock, title: 'RAPIDE', desc: 'Moins de 3 minutes pour faire le point.' },
  { Icon: BarChart3, title: '100% PERSONNALISÉ', desc: 'Selon votre parcours, votre niveau et vos objectifs.' },
  { Icon: Lock, title: 'CONFIDENTIEL', desc: 'Vos réponses restent sécurisées et confidentielles.' },
  { Icon: CheckCircle2, title: 'UTILE', desc: 'Des recommandations concrètes pour votre préparation.' },
];

const CLIPBOARD_ITEMS = [
  { Icon: User, title: 'VOS POINTS FORTS', desc: 'Identifiez ce sur quoi vous pouvez vous appuyer.' },
  { Icon: TrendingUp, title: 'VOS AXES DE PROGRESSION', desc: 'Repérez les points à renforcer pour avancer efficacement.' },
  { Icon: Target, title: 'VOS RECOMMANDATIONS', desc: 'Recevez un plan de préparation personnalisé et des conseils concrets.' },
];

const TRUST = [
  { Icon: Users, title: 'LA RÉFÉRENCE EVC', desc: 'Des milliers de candidats accompagnés chaque année.' },
  { Icon: GraduationCap, title: 'EXPERTS EVC', desc: 'Plus de 15 ans d’expérience au service de votre réussite.' },
  { Icon: MonitorSmartphone, title: 'PLATEFORME INTELLIGENTE', desc: 'Entraînements, QCM, dossiers progressifs et suivi personnalisé.' },
  { Icon: Headset, title: 'ACCOMPAGNEMENT PREMIUM', desc: 'Coaching, méthodologie et suivi pédagogique.' },
];

export function ProfilIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="w-full overflow-hidden bg-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
        {/* ===== Gauche ===== */}
        <div className="px-6 py-7 sm:px-9 sm:py-9" style={{ background: 'linear-gradient(160deg,#FFF 0%,#FDF0F2 100%)' }}>
          <BrandLogo className="h-11 w-auto" />
          <h2 className="mt-5 text-[30px] font-black leading-[1.02] tracking-tight sm:text-[38px]" style={{ color: NAVY }}>
            DÉCOUVREZ<br /><span style={{ color: RED }}>VOTRE PROFIL EVC</span>
          </h2>
          <p className="mt-4 max-w-md text-[13.5px] leading-relaxed" style={{ color: INK_SOFT }}>
            Répondez à quelques questions en moins de <strong style={{ color: NAVY }}>3 minutes</strong> et obtenez
            gratuitement une analyse personnalisée de votre préparation ainsi que des recommandations{' '}
            <strong style={{ color: NAVY }}>Major ECN</strong> adaptées à votre situation.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {BADGES.map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: `linear-gradient(150deg,${NAVY},${RED})` }}>
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-[11.5px] font-black" style={{ color: NAVY }}>{title}</p>
                  <p className="text-[11px] leading-snug" style={{ color: INK_SOFT }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onStart}
            className="mt-7 inline-flex w-full items-center justify-center gap-2.5 rounded-2xl px-6 py-4 text-[15px] font-extrabold text-white shadow-[0_16px_38px_-14px_rgba(192,17,46,0.6)] transition-transform hover:scale-[1.02]"
            style={{ background: `linear-gradient(90deg,${RED_DEEP},${RED})` }}
          >
            <ArrowRight className="h-5 w-5" /> Découvrir mon profil gratuitement
          </button>

          <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-black/8 pt-5">
            {TRUST.map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-2">
                <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: RED }} />
                <div>
                  <p className="text-[10.5px] font-black" style={{ color: NAVY }}>{title}</p>
                  <p className="text-[10px] leading-snug" style={{ color: INK_SOFT }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Droite : presse-papier vierge + texte overlay ===== */}
        <div className="relative hidden min-h-[420px] items-center justify-center p-6 lg:flex" style={{ background: 'linear-gradient(160deg,#F6F7FB 0%,#FDF0F2 100%)' }}>
          <div className="relative w-full max-w-[420px]">
            {/* Illustration fournie (presse-papier vierge + carnet + cible) */}
            <img
              src="/diagnostic%20templates/clipboard-blank.png"
              alt="Votre profil EVC"
              className="w-full select-none"
              draggable={false}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
            />
            {/* Texte « écrit » sur le tableau blanc du presse-papier */}
            <div className="absolute left-[6%] top-[15%] flex w-[42%] flex-col gap-[7%]">
              {CLIPBOARD_ITEMS.map(({ Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white" style={{ background: NAVY }}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-black leading-tight" style={{ color: NAVY }}>{title}</p>
                    <p className="mt-0.5 text-[8.5px] leading-tight" style={{ color: INK_SOFT }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
