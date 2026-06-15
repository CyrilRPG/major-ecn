'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound, Loader2, Mail } from 'lucide-react';
import { BrandLogo } from '@/components/brand/brand-logo';

type Status = 'idle' | 'submitting' | 'sent' | 'error';

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [email, setEmail] = useState('');
  const [errMsg, setErrMsg] = useState('');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrMsg('');
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setErrMsg(j.error ?? 'Erreur à l’envoi. Réessayez.');
        setStatus('error');
        return;
      }
      setStatus('sent');
    } catch {
      setErrMsg('Connexion impossible. Réessayez dans un instant.');
      setStatus('error');
    }
  };

  return (
    <div className="theme-manus relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-(--color-surface-soft) px-4 py-10 font-sans text-(--color-ink)">
      <div aria-hidden className="absolute -top-32 left-1/2 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-(--color-primary)/12 blur-[120px]" />
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[480px] bg-gradient-to-b from-(--color-surface-soft) via-white to-transparent" />

      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center rounded-xl bg-(--color-sidebar) px-3 py-1.5 shadow-sm">
            <BrandLogo className="h-9 w-auto [filter:brightness(0)_invert(1)]" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-(--color-ink)">
            Major <span className="text-(--color-primary)">ECN</span>
          </span>
        </Link>

        <div className="rounded-3xl border border-(--color-border) bg-white p-7 shadow-(--shadow-lifted) sm:p-9">
          {status === 'sent' ? (
            <>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E7F6EC] text-[#0F8A6A]">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-(--color-ink) sm:text-3xl">
                Email envoyé !
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-(--color-ink-soft)">
                Si l&rsquo;adresse <strong className="text-(--color-ink)">{email}</strong> correspond à un
                compte Major ECN, vous allez recevoir un email avec un lien pour
                choisir un nouveau mot de passe. Ce lien est valable&nbsp;<strong>1&nbsp;heure</strong>.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-(--color-ink-muted)">
                Pensez à vérifier vos spams. Vous n&rsquo;avez rien reçu après 5&nbsp;min&nbsp;?{' '}
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="font-bold text-(--color-primary) hover:underline"
                >
                  Renvoyer un lien
                </button>.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-(--color-primary) hover:underline"
              >
                <ArrowLeft className="h-4 w-4" /> Retour à la connexion
              </Link>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-(--color-primary-soft) px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-(--color-primary)">
                <KeyRound className="h-3.5 w-3.5" /> Mot de passe oublié
              </span>
              <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-(--color-ink) sm:text-3xl">
                Réinitialiser mon mot de passe
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-(--color-ink-soft)">
                Indiquez l&rsquo;adresse email de votre compte. Vous recevrez un lien
                sécurisé pour en choisir un nouveau, valable 1&nbsp;heure.
              </p>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="block text-[12.5px] font-bold text-(--color-ink)">
                    Adresse email
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={160}
                      placeholder="exemple@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-(--color-border) bg-white py-3 pl-10 pr-4 text-[14px] text-(--color-ink) outline-none transition-shadow focus:ring-2 focus:ring-(--color-primary)/30"
                    />
                  </div>
                </div>

                {status === 'error' && errMsg && (
                  <div className="flex items-start gap-2 rounded-xl border border-(--color-danger)/30 bg-red-50 px-3 py-2 text-sm text-(--color-danger)">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{errMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-4 py-3 text-[14px] font-extrabold text-white shadow-(--shadow-soft) transition-transform hover:scale-[1.01] disabled:opacity-60"
                >
                  {status === 'submitting' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {status === 'submitting' ? 'Envoi…' : 'Recevoir le lien de réinitialisation'}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-(--color-ink-soft)">
                <Link href="/login" className="inline-flex items-center gap-1 font-bold hover:underline">
                  <ArrowLeft className="h-3 w-3" /> Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
