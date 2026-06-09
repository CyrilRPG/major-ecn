'use client';

/**
 * Formulaire "Demander à être rappelé" pour le Programme Approfondi.
 * Pas de paiement Stripe — un conseiller rappelle pour cadrer le programme.
 * Envoie la demande à /api/callback-request qui notifie l'équipe par email.
 */
import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle2, GraduationCap, Loader2, Mail, MessageCircle,
  Phone, PhoneCall, Stethoscope, User,
} from 'lucide-react';

const RED = '#C0112E';
const NAVY = '#0F1F4D';
const INK = '#1F2937';
const INK_SOFT = '#52607A';
const BORDER = '#E5E9F0';

const SPECIALTIES = ['Médecine générale'] as const;
const PROMOTIONS = ['D2', 'D3', 'D4', 'PAE', 'Autre'] as const;

type Props = {
  /** Couleur principale du bouton CTA. */
  color?: { deep: string; main: string };
};

export function CallbackRequestForm({
  color = { deep: '#1E3A8A', main: '#1E40AF' },
}: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState<string>(SPECIALTIES[0]);
  const [promotion, setPromotion] = useState<string>('');
  const [message, setMessage] = useState('');
  const [rgpd, setRgpd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone) {
      setError('Merci de renseigner prénom, nom, email et téléphone.');
      return;
    }
    if (!rgpd) {
      setError("Vous devez accepter la politique de confidentialité pour continuer.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/callback-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName, lastName, email, phone, specialty, promotion, message,
          source: 'programme-approfondi',
        }),
      });
      const j = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !j.ok) {
        setError(j.error ?? 'Erreur lors de l’envoi. Réessayez ou écrivez-nous à contact@major-ecn.fr.');
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      setSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur réseau');
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border bg-[#F0FDF4] p-6 text-center" style={{ borderColor: '#BBF7D0' }}>
        <span
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: '#E7F6EC', color: '#16793C' }}
        >
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="mt-4 text-xl font-extrabold" style={{ color: '#16793C' }}>
          Demande envoyée !
        </h3>
        <p className="mt-2 text-[14px]" style={{ color: INK }}>
          Un conseiller vous rappelle sous <strong>24 h ouvrées</strong> au numéro indiqué.
        </p>
        <p className="mt-3 text-[12px]" style={{ color: INK_SOFT }}>
          Une question urgente ? Écrivez-nous à{' '}
          <a href="mailto:contact@major-ecn.fr" className="font-semibold" style={{ color: RED }}>
            contact@major-ecn.fr
          </a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input icon={User} placeholder="Prénom" value={firstName} onChange={setFirstName} required />
        <Input icon={User} placeholder="Nom"    value={lastName}  onChange={setLastName}  required />
      </div>
      <Input icon={Mail}  type="email" placeholder="Adresse email" value={email} onChange={setEmail} required />
      <Input icon={Phone} type="tel"   placeholder="Téléphone (sera rappelé)" value={phone} onChange={setPhone} required />

      {/* Spécialité */}
      <Select
        icon={Stethoscope}
        value={specialty}
        onChange={setSpecialty}
        options={SPECIALTIES.map((s) => ({ value: s, label: s }))}
      />

      {/* Promotion */}
      <Select
        icon={GraduationCap}
        value={promotion}
        onChange={setPromotion}
        options={[
          { value: '', label: 'Promotion (D2 / D3 / D4 / PAE)' },
          ...PROMOTIONS.map((p) => ({ value: p, label: p })),
        ]}
      />

      {/* Message */}
      <div className="relative">
        <MessageCircle className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4" style={{ color: '#7A8499' }} />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Votre situation, objectifs, calendrier… (facultatif)"
          rows={3}
          className="w-full resize-none rounded-xl border bg-white py-3 pl-10 pr-3 text-[13.5px] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2"
          style={{
            borderColor: BORDER,
            color: INK,
            // @ts-expect-error custom CSS prop
            '--tw-ring-color': RED,
          }}
        />
      </div>

      {/* RGPD */}
      <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border bg-[#FCFCFD] p-3.5"
        style={{ borderColor: rgpd ? color.main : '#E5E9F0' }}>
        <input
          type="checkbox"
          checked={rgpd}
          onChange={(e) => setRgpd(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded"
          style={{ accentColor: color.main }}
        />
        <span className="text-[12px] leading-relaxed" style={{ color: INK }}>
          J&rsquo;accepte que mes données personnelles soient collectées pour traiter ma
          demande, conformément à la{' '}
          <Link href="/confidentialite" target="_blank" rel="noopener" className="font-semibold underline" style={{ color: color.main }}>
            politique de confidentialité
          </Link>{' '}
          de Major ECN. <span className="text-[11px]" style={{ color: '#7A8499' }}>(obligatoire)</span>
        </span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-[15px] font-extrabold text-white shadow-[0_14px_35px_-15px_rgba(30,64,175,0.55)] transition-transform hover:scale-[1.01] disabled:opacity-60"
        style={{ background: `linear-gradient(90deg, ${color.deep} 0%, ${color.main} 100%)` }}
      >
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <PhoneCall className="h-5 w-5" />}
        {submitting ? 'Envoi en cours…' : 'Demander à être rappelé'}
        {!submitting && <ArrowRight className="h-5 w-5" />}
      </button>

      {error && (
        <p role="alert" className="rounded-xl border bg-[#FEF2F2] px-3 py-2 text-[12.5px] font-medium" style={{ color: RED, borderColor: '#FECACA' }}>
          {error}
        </p>
      )}

      <p className="text-center text-[11px]" style={{ color: '#7A8499' }}>
        Un conseiller vous rappelle sous 24 h ouvrées · Aucun paiement à ce stade
      </p>
    </form>
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
          borderColor: BORDER,
          color: value ? INK : '#94A3B8',
          // @ts-expect-error custom CSS prop
          '--tw-ring-color': RED,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
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
          borderColor: BORDER,
          color: INK,
          // @ts-expect-error custom CSS prop
          '--tw-ring-color': RED,
        }}
      />
    </div>
  );
}
