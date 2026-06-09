'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Check, GraduationCap, Info, Mail, Phone, Rocket, Shield,
  Sparkles, Tag, User,
} from 'lucide-react';
import { MeshGradient, NoiseTexture } from './premium-ui';

const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const NAVY = '#0F1F4D';
const NAVY_DEEP = '#091135';
const INK = '#1F2937';
const INK_SOFT = '#52607A';
const PURPLE = '#7C3AED';
const PURPLE_BG = '#F1E8FD';
const GREEN = '#16793C';
const GOLD = '#F5C84B';
const BORDER = '#E5E9F0';

const SPECIALTIES = [
  'Médecine générale',
  'Cardiologie',
  'Pneumologie',
  'Gastro-entérologie',
  'Endocrinologie',
  'Néphrologie',
  'Neurologie',
  'Rhumatologie',
  'Hématologie',
  'Médecine interne',
  'Maladies infectieuses',
  'Oncologie',
  'Anesthésie-Réanimation',
  'Médecine d’Urgence',
  'Pédiatrie',
  'Gériatrie',
  'Psychiatrie',
  'Radiologie',
  'Médecine physique et réadaptation',
  'Dermatologie',
  'Ophtalmologie',
  'ORL',
  'Chirurgie viscérale & digestive',
  'Chirurgie orthopédique',
  'Chirurgie thoracique',
  'Chirurgie urologique',
  'Chirurgie vasculaire',
  'Chirurgie plastique',
  'Chirurgie pédiatrique',
  'Neurochirurgie',
  'Gynécologie-Obstétrique',
  'Odontologie',
  'Maïeutique (Sage-femme)',
  'Pharmacie',
  'Autre',
];

export function EspaceDecouverteForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName || !lastName || !email) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/espace-decouverte/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone, specialty }),
      });
      const j = (await res.json()) as {
        ok?: boolean;
        error?: string;
        redirectTo?: string;
      };
      if (!res.ok || !j.ok) {
        setError(j.error ?? "Erreur lors de l'inscription. Réessayez.");
        setSubmitting(false);
        return;
      }
      router.push(j.redirectTo ?? '/espace-decouverte/confirmation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur réseau');
      setSubmitting(false);
    }
  }

  return (
    <section
      className="relative overflow-hidden py-16 sm:py-24 lg:py-28"
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background:
          `radial-gradient(ellipse 65% 45% at 50% 0%, rgba(192,17,46,0.10) 0%, transparent 60%),` +
          `radial-gradient(ellipse 80% 55% at 50% 100%, rgba(15,31,77,0.08) 0%, transparent 65%),` +
          `linear-gradient(180deg, #FFFFFF 0%, #FBFCFF 40%, #FFFFFF 100%)`,
      }}
    >
      {/* ============ Décor d'arrière-plan premium ============ */}
      <MeshGradient
        colors={[
          'rgba(192,17,46,0.16)',  // bordeaux/red
          'rgba(15,31,77,0.13)',   // navy
          'rgba(124,58,237,0.12)', // violet (cohérence box info)
          'rgba(245,200,75,0.10)', // gold
        ]}
      />
      <NoiseTexture opacity={0.022} />

      {/* Grille subtile en filigrane */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,31,77,1) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(15,31,77,1) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          maskImage:
            'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 75%)',
        }}
      />

      {/* Halos colorés flottants */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full blur-3xl"
        style={{ background: 'rgba(192,17,46,0.18)', animation: 'edcvr-float 14s ease-in-out infinite' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-20 h-96 w-96 rounded-full blur-3xl"
        style={{ background: 'rgba(124,58,237,0.16)', animation: 'edcvr-float 16s ease-in-out infinite reverse' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[30%] top-0 h-64 w-64 rounded-full blur-3xl"
        style={{ background: 'rgba(245,200,75,0.18)', animation: 'edcvr-float 18s ease-in-out infinite' }}
      />

      {/* ============ HEADER section — gros titre dégradé hors carte ============ */}
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <span
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[11.5px] font-extrabold uppercase tracking-[0.18em] text-white shadow-[0_15px_40px_-12px_rgba(192,17,46,0.55)]"
          style={{
            background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 50%, #E6533F 100%)`,
          }}
        >
          <Rocket className="h-3.5 w-3.5" />
          Espace découverte gratuit
        </span>

        <h1 className="mt-7 text-balance text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]">
          <span
            className="block bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(120deg, ${NAVY_DEEP} 0%, ${NAVY} 40%, ${RED_DEEP} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              paddingBottom: '0.12em',
            }}
          >
            Découvrez <span style={{ color: RED }}>Major ECN</span>
          </span>
          <span
            className="block bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 50%, #E6533F 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              paddingBottom: '0.12em',
            }}
          >
            en quelques minutes
          </span>
        </h1>
        <p
          className="mx-auto mt-5 max-w-md text-base sm:text-[17px] leading-relaxed"
          style={{ color: INK_SOFT }}
        >
          Explorez concrètement notre plateforme et notre méthode de préparation aux EVC.
        </p>
      </div>

      {/* ============ CARTE FORMULAIRE — bordure dégradée premium ============ */}
      <div className="relative mx-auto mt-12 max-w-2xl px-4 sm:px-6">
        <div
          className="relative rounded-[28px] p-[1.5px] shadow-[0_30px_80px_-30px_rgba(15,31,77,0.35)]"
          style={{
            background:
              `linear-gradient(135deg, ${RED} 0%, ${RED_DEEP} 25%, ${NAVY} 60%, ${PURPLE} 100%)`,
          }}
        >
          <div
            className="relative overflow-hidden rounded-[26px] bg-white p-6 sm:p-10"
          >
            {/* Halo subtil interne */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl"
              style={{ background: 'rgba(192,17,46,0.07)' }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-20 -bottom-20 h-56 w-56 rounded-full blur-3xl"
              style={{ background: 'rgba(15,31,77,0.06)' }}
            />

            {/* Eyebrow + intro form */}
            <div className="relative flex items-center gap-2.5">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${RED} 0%, ${RED_DEEP} 100%)`,
                  color: '#FFF',
                  boxShadow: '0 10px 24px -10px rgba(192,17,46,0.55)',
                }}
              >
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p
                  className="text-[10.5px] font-extrabold uppercase tracking-[0.14em]"
                  style={{ color: INK_SOFT }}
                >
                  Création de compte
                </p>
                <p className="text-[15px] font-black" style={{ color: NAVY }}>
                  Démarrez en moins de 2 minutes
                </p>
              </div>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="relative mt-6 space-y-3">
              <Field icon={User} placeholder="Prénom" value={firstName} onChange={setFirstName} type="text" required />
              <Field icon={User} placeholder="Nom" value={lastName} onChange={setLastName} type="text" required />
              <Field icon={Mail} placeholder="Adresse email" value={email} onChange={setEmail} type="email" required />
              <Field icon={Phone} placeholder="Téléphone" value={phone} onChange={setPhone} type="tel" />
              {/* Select Spécialité */}
              <div className="relative">
                <GraduationCap className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: INK_SOFT }} />
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full appearance-none rounded-xl border bg-white py-4 pl-12 pr-10 text-[15px] focus:outline-none focus:ring-2"
                  style={{
                    borderColor: BORDER,
                    color: specialty ? INK : INK_SOFT,
                    // @ts-expect-error custom CSS prop
                    '--tw-ring-color': RED,
                  }}
                >
                  <option value="">Spécialité préparée</option>
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ArrowRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90" style={{ color: INK_SOFT }} />
              </div>

              {/* CTA premium */}
              <button
                type="submit"
                disabled={submitting}
                className="group relative mt-2 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl px-6 py-4 text-base font-extrabold uppercase tracking-wide text-white shadow-[0_18px_45px_-12px_rgba(192,17,46,0.6)] transition-all hover:scale-[1.01] hover:shadow-[0_22px_55px_-12px_rgba(192,17,46,0.7)] disabled:opacity-60"
                style={{
                  background:
                    `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 50%, #E6533F 100%)`,
                }}
              >
                {/* Reflet animé */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
                />
                <span className="relative">
                  {submitting ? 'Création de votre compte…' : 'Accéder à l’espace découverte'}
                </span>
                {!submitting && <ArrowRight className="relative h-5 w-5 transition-transform group-hover:translate-x-0.5" />}
              </button>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border bg-[#FEF2F2] px-3 py-2 text-[13px] font-medium"
                  style={{ color: RED, borderColor: '#FECACA' }}
                >
                  {error}
                </p>
              )}
            </form>

            {/* 4 trust checks — pastilles premium */}
            <ul className="relative mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                'Accès immédiat',
                'Sans carte bancaire',
                'Sans engagement',
                'Données sécurisées',
              ].map((t) => (
                <li key={t} className="flex flex-col items-center text-center">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full ring-2"
                    style={{
                      background: '#E7F6EC',
                      color: GREEN,
                      // @ts-expect-error custom CSS prop
                      '--tw-ring-color': '#C6EBD2',
                    }}
                  >
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                  <p className="mt-2 text-[12.5px] font-bold leading-tight" style={{ color: NAVY }}>{t}</p>
                </li>
              ))}
            </ul>

            {/* Box Information importante — refonte premium */}
            <div
              className="relative mt-8 overflow-hidden rounded-2xl border p-5 sm:p-6"
              style={{
                background:
                  `linear-gradient(135deg, ${PURPLE_BG} 0%, #F8F2FE 100%)`,
                borderColor: 'rgba(124,58,237,0.25)',
              }}
            >
              {/* Halo violet */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl"
                style={{ background: 'rgba(124,58,237,0.18)' }}
              />
              <div className="relative flex items-start gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${PURPLE} 0%, #9F69F9 100%)`,
                    color: '#FFF',
                  }}
                >
                  <Info className="h-5 w-5" strokeWidth={2.4} />
                </span>
                <div>
                  <h3 className="text-[15px] font-extrabold" style={{ color: PURPLE }}>
                    Information importante
                  </h3>
                  <ul className="mt-3 space-y-2 text-[13px] leading-relaxed" style={{ color: INK }}>
                    {[
                      <>L&rsquo;espace découverte est actuellement présenté à travers des contenus de <strong>Médecine Générale</strong>.</>,
                      <>Major ECN accompagne les candidats aux EVC dans <strong>45 spécialités</strong>.</>,
                      <>La plateforme <strong>s&rsquo;enrichit progressivement</strong> de nouveaux contenus et fonctionnalités.</>,
                      <>Si votre spécialité n&rsquo;est pas encore disponible dans l&rsquo;environnement de démonstration, vous bénéficiez néanmoins de l&rsquo;ensemble des <strong>ressources pédagogiques</strong> prévues dans votre préparation.</>,
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: PURPLE }} strokeWidth={3} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Lien voir les formules */}
            <div className="relative mt-7 flex flex-col items-center gap-2 border-t pt-6" style={{ borderColor: BORDER }}>
              <p className="flex items-center gap-2 text-sm" style={{ color: INK_SOFT }}>
                <Tag className="h-4 w-4" style={{ color: PURPLE }} />
                Vous souhaitez consulter nos offres ?
              </p>
              <Link
                href="/tarifs"
                className="group inline-flex items-center gap-2 text-[15px] font-extrabold transition-colors hover:opacity-80"
                style={{ color: RED }}
              >
                Voir les formules
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Footer données sécurisées */}
            <div className="relative mt-6 flex items-center justify-center gap-2 border-t pt-5 text-[12px]" style={{ color: INK_SOFT, borderColor: BORDER }}>
              <Shield className="h-4 w-4" />
              Vos données sont sécurisées et ne seront jamais partagées.
            </div>
          </div>
        </div>

        {/* ============ Badges flottants premium hors carte ============ */}
        <div className="pointer-events-none mt-8 flex flex-wrap items-center justify-center gap-3 text-[11.5px] font-bold uppercase tracking-[0.12em]" style={{ color: INK_SOFT }}>
          {[
            { Icon: Shield, t: 'Données chiffrées' },
            { Icon: Sparkles, t: 'Activation instantanée' },
            { Icon: GraduationCap, t: '15 ans d’expertise' },
          ].map((b) => (
            <span
              key={b.t}
              className="inline-flex items-center gap-1.5 rounded-full border bg-white/80 px-3.5 py-1.5 backdrop-blur-sm"
              style={{ borderColor: BORDER }}
            >
              <b.Icon className="h-3.5 w-3.5" style={{ color: RED }} />
              {b.t}
            </span>
          ))}
        </div>
      </div>

      {/* Animations locales */}
      <style jsx>{`
        @keyframes edcvr-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(2%, -3%) scale(1.05); }
        }
      `}</style>
    </section>
  );
}

/* ---------- Sub-components ---------- */

type FieldProps = {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  required?: boolean;
};

function Field({ icon: Icon, placeholder, value, onChange, type, required }: FieldProps) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: INK_SOFT }} />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl border bg-white py-4 pl-12 pr-4 text-[15px] placeholder:font-medium placeholder:text-[#94A3B8] focus:outline-none focus:ring-2"
        style={{
          borderColor: BORDER,
          color: INK,
          // @ts-expect-error custom CSS prop
          '--tw-ring-color': RED,
        }}
      />
    </div>
  );
}
