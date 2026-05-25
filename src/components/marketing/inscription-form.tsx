'use client';

import { useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, MailCheck, PhoneCall } from 'lucide-react';
import type { PublicSignupInput } from '@/lib/schemas/public-signup';

type Status = 'idle' | 'submitting' | 'success' | 'error';
type FlowResult = 'invite_sent' | 'callback' | undefined;

const PROMOTIONS: PublicSignupInput['promotion'][] = ['D2', 'D3', 'D4', 'PAE', 'Autre'];

export function InscriptionForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [flow, setFlow] = useState<FlowResult>(undefined);
  const [serverMsg, setServerMsg] = useState('');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      first_name: String(fd.get('first_name') ?? '').trim(),
      last_name: String(fd.get('last_name') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      phone: String(fd.get('phone') ?? '').trim(),
      promotion: String(fd.get('promotion') ?? 'D2'),
      offer: String(fd.get('offer') ?? 'essentiel'),
      colleges_wish: String(fd.get('colleges_wish') ?? '').trim(),
    };
    setStatus('submitting');
    setServerMsg('');
    setFlow(undefined);
    try {
      const res = await fetch('/api/public-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = (await res.json().catch(() => ({}))) as {
        ok?: boolean; error?: string; message?: string; flow?: FlowResult;
      };
      if (!res.ok || !j.ok) {
        setServerMsg(j.error ?? 'Erreur à l’envoi. Réessayez.');
        setStatus('error');
        return;
      }
      setServerMsg(j.message ?? 'Demande envoyée.');
      setFlow(j.flow);
      setStatus('success');
    } catch {
      setServerMsg('Connexion impossible. Vérifiez votre internet et réessayez.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    const isCallback = flow === 'callback';
    return (
      <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-(--color-primary)/30 bg-(--color-primary-soft) p-7 text-left sm:p-9">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--color-primary) text-white">
          {isCallback ? <PhoneCall className="h-6 w-6" /> : <MailCheck className="h-6 w-6" />}
        </span>
        <h3 className="mt-5 font-display text-xl font-extrabold tracking-tight text-(--color-ink) sm:text-2xl">
          {isCallback ? 'Demande envoyée — un conseiller va vous rappeler' : 'Bienvenue chez Major ECN'}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-(--color-ink-soft)">{serverMsg}</p>
        {!isCallback && (
          <p className="mt-3 text-xs text-(--color-ink-muted)">
            Vérifiez votre boîte mail (et le dossier indésirables). Le lien d’activation expire après 24 h.
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-2"
    >
      <Field label="Prénom" name="first_name" />
      <Field label="Nom" name="last_name" />
      <Field label="Email" name="email" type="email" className="sm:col-span-2" />
      <Field label="Téléphone" name="phone" type="tel" required={false} />
      <div className="space-y-1.5">
        <label htmlFor="promotion" className="text-xs font-semibold text-(--color-ink)">Promotion</label>
        <select
          id="promotion"
          name="promotion"
          defaultValue="D2"
          required
          className="w-full rounded-xl border border-(--color-border) bg-white px-4 py-3 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-primary)"
        >
          {PROMOTIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <label htmlFor="offer" className="text-xs font-semibold text-(--color-ink)">Formule souhaitée</label>
        <select
          id="offer"
          name="offer"
          required
          defaultValue="essentiel"
          className="w-full rounded-xl border border-(--color-border) bg-white px-4 py-3 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-primary)"
        >
          <option value="essentiel">Essentiel — 49 €/mois · accès immédiat en ligne</option>
          <option value="premium">Premium — 89 €/mois · accès immédiat en ligne</option>
          <option value="intensif">Intensif — 149 €/mois · rappel par un conseiller</option>
        </select>
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <label htmlFor="colleges_wish" className="text-xs font-semibold text-(--color-ink)">
          Collèges visés <span className="font-normal text-(--color-ink-muted)">(laisser vide si tous)</span>
        </label>
        <input
          id="colleges_wish"
          name="colleges_wish"
          placeholder="ex. Cardiologie, Pédiatrie — ou laisser vide pour tous"
          className="w-full rounded-xl border border-(--color-border) bg-white px-4 py-3 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-primary)"
        />
      </div>

      {status === 'error' && (
        <p className="sm:col-span-2 flex items-start gap-2 rounded-xl border border-(--color-danger)/30 bg-[color-mix(in_srgb,var(--color-danger)_8%,var(--color-surface))] px-3 py-2 text-sm text-(--color-danger)">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {serverMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="sm:col-span-2 mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-(--color-primary)/25 transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {status === 'submitting' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        S’inscrire à Major ECN
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}

function Field({
  label, name, type = 'text', className = '', required = true,
}: {
  label: string; name: string; type?: string; className?: string; required?: boolean;
}) {
  return (
    <div className={'space-y-1.5 ' + className}>
      <label htmlFor={name} className="text-xs font-semibold text-(--color-ink)">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full rounded-xl border border-(--color-border) bg-white px-4 py-3 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-primary)"
      />
    </div>
  );
}
