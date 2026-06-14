'use client';

/**
 * Bouton de checkout Stripe pour une formule.
 *
 * Champs : Prénom, Nom, Email, Téléphone, Spécialité (MG only pour
 * l'instant), Voie interne / Voie externe (Intensive uniquement),
 * Toggle 1x/3x/4x, Checkbox RGPD obligatoire.
 *
 * Appelle /api/stripe/checkout puis redirige vers Stripe Checkout.
 */
import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Calendar, Check, CheckCircle2,
  GitFork, Loader2, Lock, Mail, Phone, ShieldCheck, Sparkles,
  Stethoscope, User,
} from 'lucide-react';
import type { FormuleId } from '@/lib/stripe';
import { InfoImportantePopup, FORMULE_COLORS } from './info-importante-popup';

type Color = { deep: string; main: string };
const DEFAULT_COLOR: Color = { deep: '#8B0E22', main: '#C0112E' };

type Props = {
  formuleId: FormuleId;
  /** Libellé du bouton final. */
  label?: string;
  /** Couleur principale du bouton (gradient deep → main). */
  color?: Color;
};

const SPECIALTIES = ['Médecine générale'] as const;
const VOIES = [
  { value: 'interne', label: 'Voie interne (QCM)' },
  { value: 'externe', label: 'Voie externe (Questions ouvertes)' },
] as const;

export function CheckoutButton({
  formuleId,
  label = 'Procéder au paiement sécurisé',
  color = DEFAULT_COLOR,
}: Props) {
  const isIntensive = formuleId === 'intensive';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState<string>(SPECIALTIES[0]);
  const [voie, setVoie] = useState<string>('');
  const [installments, setInstallments] = useState<1 | 3 | 4>(1);
  // Case unique : acceptation groupée des CGU + CGS + Conditions Particulières.
  // Les 3 documents intègrent en clair le consentement à l'exécution immédiate
  // et la renonciation au délai de rétractation (art. L. 221-28, 1° CC) — voir
  // notamment CGS §10.1 et Conditions Particulières §Observations. Cocher la
  // case vaut donc acceptation simultanée de ces stipulations contractuelles.
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  /** Étape 1 : validation locale du formulaire. Ouvre la popup info. */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      setError('Merci de renseigner prénom, nom et email.');
      return;
    }
    if (isIntensive && !voie) {
      setError('Merci de choisir votre voie de concours (interne ou externe).');
      return;
    }
    if (!acceptTerms) {
      setError('Vous devez accepter les CGU, les CGS et les Conditions Particulières pour continuer.');
      return;
    }
    setError(null);
    setShowInfoPopup(true);
  }

  /** Étape 2 : déclenché après confirmation de la popup info. */
  async function handleCheckout() {
    setShowInfoPopup(false);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formule: formuleId,
          email,
          firstName,
          lastName,
          phone,
          specialty,
          voie: isIntensive ? voie : '',
          installments,
          consents: {
            // Une seule case côté UI ; côté serveur on stocke un flag par
            // document (CGU/CGS/CP) + renonciation rétractation, tous sur
            // la même valeur. La renonciation est intégrée dans les CGS et
            // Conditions Particulières acceptées (CGS §10.1 et CP).
            cgu: acceptTerms,
            cgs: acceptTerms,
            cp: acceptTerms,
            waiveRetractation: acceptTerms,
            timestamp: new Date().toISOString(),
          },
        }),
      });
      const j = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !j.url) {
        setError(j.error ?? 'Erreur lors de la création de la session de paiement.');
        setLoading(false);
        return;
      }
      window.location.href = j.url;
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Erreur réseau');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {/* Section IDENTITÉ */}
      <SectionLabel n={1} title="Vos informations" />
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <Input icon={User} placeholder="Prénom" value={firstName} onChange={setFirstName} required />
        <Input icon={User} placeholder="Nom" value={lastName} onChange={setLastName} required />
      </div>
      <Input icon={Mail} type="email" placeholder="Adresse email" value={email} onChange={setEmail} required />
      <Input icon={Phone} type="tel" placeholder="Téléphone (optionnel)" value={phone} onChange={setPhone} />

      {/* Section PRÉPARATION */}
      <SectionLabel n={2} title="Votre préparation" />
      <Select
        icon={Stethoscope}
        value={specialty}
        onChange={setSpecialty}
        options={SPECIALTIES.map((s) => ({ value: s, label: s }))}
      />
      {/* Voie interne / externe — Intensive uniquement.
          Le parcours pédagogique diffère selon le format de concours
          du candidat. */}
      {isIntensive && (
        <Select
          icon={GitFork}
          value={voie}
          onChange={setVoie}
          options={[
            { value: '', label: 'Choisissez votre voie de concours' },
            ...VOIES.map((v) => ({ value: v.value, label: v.label })),
          ]}
        />
      )}

      {/* Section PAIEMENT */}
      <SectionLabel n={3} title="Mode de paiement" />
      <fieldset className="rounded-2xl border bg-white p-3" style={{ borderColor: '#E5E9F0' }}>
        <legend className="sr-only">Choisir le nombre de mensualités</legend>
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: 1 as const, l: 'Comptant', sub: '1 paiement' },
            { v: 3 as const, l: '3 fois', sub: 'mensualité' },
            { v: 4 as const, l: '4 fois', sub: 'mensualité' },
          ].map((opt) => {
            const active = installments === opt.v;
            return (
              <button
                key={opt.v}
                type="button"
                onClick={() => setInstallments(opt.v)}
                className="rounded-xl px-2 py-2.5 text-center transition-colors"
                style={{
                  background: active ? color.main : 'white',
                  color: active ? 'white' : '#0F1F4D',
                  border: `1.5px solid ${active ? color.main : '#E5E9F0'}`,
                }}
              >
                <p className="text-[13px] font-extrabold leading-none">{opt.l}</p>
                <p className="mt-1 text-[10.5px] font-medium opacity-80">{opt.sub}</p>
              </button>
            );
          })}
        </div>
        <p className="mt-2.5 flex items-center gap-1.5 text-[11px]" style={{ color: '#7A8499' }}>
          <Calendar className="h-3 w-3" />
          Paiement en plusieurs fois sans frais (cartes Visa / Mastercard éligibles)
        </p>
      </fieldset>

      {/* Consentement — case unique. L'acceptation des CGS et des
          Conditions Particulières emporte consentement à l'exécution
          immédiate (CGS §10.1, CP §Observations). */}
      <SectionLabel n={4} title="Confirmation" />

      <ConsentCheckbox
        checked={acceptTerms}
        onChange={setAcceptTerms}
        accent={color.main}
        text={
          <>
            J&rsquo;accepte les{' '}
            <Link href="/cgu" target="_blank" rel="noopener" className="font-semibold underline" style={{ color: color.main }}>CGU</Link>,
            les{' '}
            <Link href="/cgs" target="_blank" rel="noopener" className="font-semibold underline" style={{ color: color.main }}>CGS</Link>
            {' '}et les{' '}
            <Link href="/conditions-particulieres" target="_blank" rel="noopener" className="font-semibold underline" style={{ color: color.main }}>Conditions Particulières</Link>
            {' '}de Major ECN.
          </>
        }
      />

      {/* CTA */}
      <button
        type="submit"
        disabled={loading}
        className="relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-6 py-4 text-[15.5px] font-extrabold text-white shadow-[0_14px_35px_-15px_rgba(192,17,46,0.6)] transition-transform hover:scale-[1.01] disabled:opacity-60"
        style={{ background: `linear-gradient(90deg, ${color.deep} 0%, ${color.main} 100%)` }}
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
        <span>{loading ? 'Redirection vers le paiement…' : label}</span>
        {!loading && <ArrowRight className="h-5 w-5" />}
      </button>

      {error && (
        <p role="alert" className="rounded-xl border bg-[#FEF2F2] px-3 py-2.5 text-[12.5px] font-medium" style={{ color: '#C0112E', borderColor: '#FECACA' }}>
          {error}
        </p>
      )}

      {/* TRUST badges sous le bouton */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { Icon: ShieldCheck, t: 'Paiement sécurisé', s: '256-bit SSL' },
          { Icon: Lock,        t: 'Stripe certifié',   s: 'PCI DSS' },
          { Icon: CheckCircle2, t: 'Données chiffrées', s: 'AES-256' },
        ].map((b) => (
          <div key={b.t} className="flex flex-col items-center rounded-xl border p-2.5 text-center" style={{ borderColor: '#E5E9F0', background: '#FAFBFD' }}>
            <b.Icon className="h-4 w-4" style={{ color: color.main }} />
            <p className="mt-1 text-[10.5px] font-extrabold leading-tight" style={{ color: '#0F1F4D' }}>{b.t}</p>
            <p className="text-[9.5px] leading-tight" style={{ color: '#7A8499' }}>{b.s}</p>
          </div>
        ))}
      </div>

      {/* Stripe powered */}
      <p className="flex items-center justify-center gap-1.5 text-[11px]" style={{ color: '#7A8499' }}>
        <Sparkles className="h-3 w-3" style={{ color: color.main }} />
        Paiement traité par <strong style={{ color: '#635BFF' }}>Stripe</strong> · Aucune carte stockée chez nous
      </p>

      {/* Popup "Information importante avant votre inscription" — affichée
          systématiquement avant la redirection Stripe, dans la couleur
          correspondant à la formule choisie. */}
      <InfoImportantePopup
        open={showInfoPopup}
        onClose={() => setShowInfoPopup(false)}
        onContinue={handleCheckout}
        color={FORMULE_COLORS[formuleId]}
      />
    </form>
  );
}

/* ============================================================ */
function ConsentCheckbox({
  checked,
  onChange,
  accent,
  text,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  accent: string;
  text: React.ReactNode;
}) {
  return (
    <label
      className="flex cursor-pointer items-start gap-2.5 rounded-xl border bg-white p-3"
      style={{ borderColor: checked ? accent : '#E5E9F0' }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded"
        style={{ accentColor: accent }}
      />
      <span className="text-[12px] leading-relaxed" style={{ color: '#1F2937' }}>{text}</span>
    </label>
  );
}

function SectionLabel({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0F1F4D] text-[10px] font-extrabold text-white">{n}</span>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ color: '#0F1F4D' }}>{title}</p>
      <span className="h-px flex-1 bg-[#E5E9F0]" />
    </div>
  );
}

function Input({
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  required,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#7A8499' }} />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-[13.5px] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2"
        style={{
          borderColor: '#E5E9F0',
          color: '#1F2937',
          // @ts-expect-error custom CSS prop
          '--tw-ring-color': '#C0112E',
        }}
      />
    </div>
  );
}

function Select({
  icon: Icon,
  value,
  onChange,
  options,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#7A8499' }} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border bg-white py-3 pl-10 pr-9 text-[13.5px] focus:outline-none focus:ring-2"
        style={{
          borderColor: '#E5E9F0',
          color: value ? '#1F2937' : '#94A3B8',
          // @ts-expect-error custom CSS prop
          '--tw-ring-color': '#C0112E',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <Check className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 opacity-50" />
    </div>
  );
}
