'use client';

import { ArrowRight, Clock, ShieldCheck, Lock, BarChart3, Users, GraduationCap, MonitorSmartphone, Headset, User, TrendingUp, Target } from 'lucide-react';
import { BrandLogo } from '@/components/brand/brand-logo';

const RED = '#C0112E';
const NAVY = '#0F1F4D';
const INK_SOFT = '#52607A';

const BADGES = [
  { Icon: Clock, title: 'RAPIDE', desc: 'Moins de 3 minutes pour faire le point.' },
  { Icon: BarChart3, title: '100% PERSONNALISÉ', desc: 'En fonction de votre parcours, de votre niveau et de vos objectifs.' },
  { Icon: Lock, title: 'CONFIDENTIEL', desc: 'Vos réponses restent sécurisées et confidentielles.' },
  { Icon: ShieldCheck, title: 'UTILE', desc: 'Des recommandations concrètes pour optimiser votre préparation.' },
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
    <div
      className="w-full overflow-hidden px-6 py-7 sm:px-9 sm:py-8"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: 'linear-gradient(150deg,#FFFFFF 0%,#FCEEF0 60%,#F7F0FA 100%)' }}
    >
      {/* ===== Haut : texte (gauche) + illustration (droite) ===== */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <BrandLogo className="h-10 w-auto sm:h-11" />
          <h2 className="mt-4 text-[30px] font-black uppercase leading-[0.98] tracking-tight sm:text-[40px]" style={{ color: NAVY }}>
            Découvrez<br /><span style={{ color: RED }}>votre profil EVC</span>
          </h2>
          <p className="mt-4 max-w-lg text-[13.5px] leading-relaxed sm:text-[14.5px]" style={{ color: INK_SOFT }}>
            Répondez à <strong style={{ color: NAVY }}>6 questions</strong> en moins de <strong style={{ color: NAVY }}>3 minutes</strong> et
            obtenez gratuitement une analyse personnalisée de votre préparation ainsi que des recommandations{' '}
            <strong style={{ color: NAVY }}>Major ECN</strong> adaptées à votre situation.
          </p>
        </div>

        {/* Illustration : presse-papier vierge + texte overlay */}
        <div className="relative mx-auto hidden w-full max-w-[400px] lg:block">
          <img
            src="/diagnostic%20templates/clipboard-blank.png"
            alt="Votre profil EVC"
            className="w-full select-none"
            draggable={false}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
          />
          <div className="absolute left-[8%] top-[14%] flex w-[40%] flex-col gap-[6%]">
            {CLIPBOARD_ITEMS.map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-1.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white" style={{ background: NAVY }}>
                  <Icon className="h-3 w-3" />
                </span>
                <div>
                  <p className="text-[9px] font-black leading-tight" style={{ color: NAVY }}>{title}</p>
                  <p className="mt-0.5 text-[7.5px] leading-tight" style={{ color: INK_SOFT }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Rangée de 4 badges ===== */}
      <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4">
        {BADGES.map(({ Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: `linear-gradient(150deg,${NAVY},${RED})` }}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11.5px] font-black leading-tight" style={{ color: NAVY }}>{title}</p>
              <p className="mt-0.5 text-[11px] leading-snug" style={{ color: INK_SOFT }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ===== CTA pleine largeur ===== */}
      <button
        type="button"
        onClick={onStart}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-[14px] font-extrabold uppercase tracking-wide text-white shadow-[0_16px_38px_-14px_rgba(139,14,34,0.65)] transition-transform hover:scale-[1.01] sm:text-[15px]"
        style={{ background: 'linear-gradient(90deg,#5B1020 0%,#8B0E22 55%,#6B1030 100%)' }}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
          <ArrowRight className="h-4.5 w-4.5" strokeWidth={2.4} />
        </span>
        Découvrir mon profil gratuitement
      </button>

      {/* ===== Rangée de 4 preuves ===== */}
      <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-3 border-t border-black/8 pt-5 sm:grid-cols-4">
        {TRUST.map(({ Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-2">
            <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: RED }} />
            <div>
              <p className="text-[10px] font-black leading-tight" style={{ color: NAVY }}>{title}</p>
              <p className="mt-0.5 text-[9.5px] leading-snug" style={{ color: INK_SOFT }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
