'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Check, GraduationCap, Info, Lock, Mail, Phone, Rocket, Shield,
  Tag, User,
} from 'lucide-react';

const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const NAVY = '#0F1F4D';
const INK = '#1F2937';
const INK_SOFT = '#52607A';
const PURPLE = '#7C3AED';
const PURPLE_BG = '#F1E8FD';
const GREEN = '#16793C';
const BORDER = '#E5E9F0';
const SOFT_BG = '#F7F9FC';

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName || !lastName || !email) return;
    setSubmitting(true);
    // Stocker localement les infos puis rediriger vers l'espace découverte
    try {
      sessionStorage.setItem('major-ecn-espace-decouverte', JSON.stringify({
        firstName, lastName, email, phone, specialty,
        createdAt: new Date().toISOString(),
      }));
    } catch {
      // localStorage non disponible — on continue quand même
    }
    router.push('/espace-decouverte/dashboard');
  }

  return (
    <section className="bg-[#F8FAFC] py-12 sm:py-16" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="rounded-3xl border bg-white p-6 sm:p-10 shadow-sm" style={{ borderColor: BORDER }}>
          {/* Badge top */}
          <div className="text-center">
            <span
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-[12px] font-extrabold uppercase tracking-[0.16em] text-white"
              style={{ background: RED }}
            >
              <Rocket className="h-4 w-4" />
              Espace découverte gratuit
            </span>
          </div>

          {/* Titre + subtitle */}
          <h1 className="mt-6 text-center text-3xl font-black leading-[1.08] tracking-tight sm:text-[2.5rem]">
            <span style={{ color: NAVY }}>Découvrez </span>
            <span style={{ color: RED }}>Major ECN</span>
            <br />
            <span style={{ color: NAVY }}>en quelques minutes</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-center text-base sm:text-[17px]" style={{ color: INK_SOFT }}>
            Explorez concrètement notre plateforme et notre méthode de préparation aux EVC.
          </p>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="mt-7 space-y-3">
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

            {/* CTA */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-base font-extrabold uppercase tracking-wide text-white shadow-[0_10px_30px_-10px_rgba(192,17,46,0.55)] transition-transform hover:scale-[1.01] disabled:opacity-60"
              style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)` }}
            >
              Accéder à l’espace découverte
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          {/* 4 trust checks */}
          <ul className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              'Accès immédiat',
              'Sans carte bancaire',
              'Sans engagement',
              'Données sécurisées',
            ].map((t) => (
              <li key={t} className="flex flex-col items-center text-center">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ background: '#E7F6EC', color: GREEN }}
                >
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
                <p className="mt-2 text-[13px] font-bold leading-tight" style={{ color: NAVY }}>{t}</p>
              </li>
            ))}
          </ul>

          {/* Box Information importante */}
          <div className="mt-7 rounded-2xl border p-5 sm:p-6" style={{ background: PURPLE_BG, borderColor: 'rgba(124,58,237,0.25)' }}>
            <div className="flex items-start gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ background: 'white', color: PURPLE }}
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
          <div className="mt-6 flex flex-col items-center gap-2 border-t pt-6" style={{ borderColor: BORDER }}>
            <p className="flex items-center gap-2 text-sm" style={{ color: INK_SOFT }}>
              <Tag className="h-4 w-4" style={{ color: PURPLE }} />
              Vous souhaitez consulter nos offres ?
            </p>
            <Link
              href="/tarifs"
              className="inline-flex items-center gap-2 text-[15px] font-extrabold"
              style={{ color: RED }}
            >
              Voir les formules
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Footer données sécurisées */}
          <div className="mt-6 flex items-center justify-center gap-2 border-t pt-5 text-[12px]" style={{ color: INK_SOFT, borderColor: BORDER }}>
            <Shield className="h-4 w-4" />
            Vos données sont sécurisées et ne seront jamais partagées.
          </div>
        </div>
      </div>
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
