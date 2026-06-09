'use client';

/**
 * Bouton de checkout Stripe pour une formule.
 *
 * - Champ optionnel : email pré-rempli pour faciliter le checkout
 * - Toggle "Payer en plusieurs fois (3x / 4x)"
 * - Appelle /api/stripe/checkout et redirige vers la session
 */
import { useState } from 'react';
import { ArrowRight, CreditCard, Loader2, Mail, User } from 'lucide-react';
import type { FormuleId } from '@/lib/stripe';

type Props = {
  formuleId: FormuleId;
  label?: string;
  /** Couleur principale du bouton (utilisée pour le dégradé). */
  color?: { deep: string; main: string };
  /** Affiche le bloc complet (champ email + nom + toggle 3x/4x) ou juste un bouton compact. */
  variant?: 'full' | 'compact';
};

const DEFAULT_COLOR = { deep: '#8B0E22', main: '#C0112E' };

export function CheckoutButton({
  formuleId,
  label = 'Choisir cette formule',
  color = DEFAULT_COLOR,
  variant = 'full',
}: Props) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [installments, setInstallments] = useState<1 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formule: formuleId,
          email: email || undefined,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          installments,
        }),
      });
      const j = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !j.url) {
        setError(j.error ?? 'Erreur lors de la création de la session de paiement.');
        setLoading(false);
        return;
      }
      window.location.href = j.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur réseau');
      setLoading(false);
    }
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-[14px] font-extrabold text-white shadow-[0_12px_28px_-12px_rgba(192,17,46,0.55)] transition-transform hover:scale-[1.01] disabled:opacity-60"
        style={{ background: `linear-gradient(90deg, ${color.deep} 0%, ${color.main} 100%)` }}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
        {label}
        <ArrowRight className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Champs facultatifs : pré-remplissage Stripe */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input icon={User} placeholder="Prénom" value={firstName} onChange={setFirstName} />
        <Input icon={User} placeholder="Nom" value={lastName} onChange={setLastName} />
      </div>
      <Input icon={Mail} type="email" placeholder="Adresse email" value={email} onChange={setEmail} />

      {/* Toggle paiement en plusieurs fois */}
      <fieldset className="rounded-2xl border p-3" style={{ borderColor: '#E5E9F0' }}>
        <legend className="px-2 text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ color: '#52607A' }}>
          Mode de paiement
        </legend>
        <div className="mt-1 grid grid-cols-3 gap-2">
          {[
            { v: 1 as const, l: 'Comptant' },
            { v: 3 as const, l: 'En 3 fois' },
            { v: 4 as const, l: 'En 4 fois' },
          ].map((opt) => {
            const active = installments === opt.v;
            return (
              <button
                key={opt.v}
                type="button"
                onClick={() => setInstallments(opt.v)}
                className="rounded-xl px-3 py-2.5 text-[12.5px] font-extrabold transition-colors"
                style={{
                  background: active ? color.main : 'white',
                  color: active ? 'white' : '#0F1F4D',
                  border: `1px solid ${active ? color.main : '#E5E9F0'}`,
                }}
              >
                {opt.l}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px]" style={{ color: '#7A8499' }}>
          Le paiement en plusieurs fois est proposé selon votre carte (Visa / Mastercard éligibles).
        </p>
      </fieldset>

      {/* CTA principal */}
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-[15px] font-extrabold text-white shadow-[0_14px_35px_-15px_rgba(192,17,46,0.6)] transition-transform hover:scale-[1.01] disabled:opacity-60"
        style={{ background: `linear-gradient(90deg, ${color.deep} 0%, ${color.main} 100%)` }}
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
        {loading ? 'Redirection vers le paiement…' : label}
        {!loading && <ArrowRight className="h-5 w-5" />}
      </button>

      {error && (
        <p className="rounded-xl border bg-[#FEF2F2] px-3 py-2 text-[12px] font-medium" style={{ color: '#C0112E', borderColor: '#FECACA' }}>
          {error}
        </p>
      )}

      <p className="text-center text-[11px]" style={{ color: '#7A8499' }}>
        Paiement sécurisé via Stripe · Aucune carte stockée chez nous
      </p>
    </div>
  );
}

/* ============================================================ */
function Input({
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#7A8499' }} />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
