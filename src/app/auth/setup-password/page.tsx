'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, KeyRound, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { BrandLogo } from '@/components/brand/brand-logo';
import { createClient } from '@/lib/supabase/client';

type Status = 'checking' | 'ready' | 'no-session' | 'submitting' | 'done' | 'error';

export default function SetupPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('checking');
  const [message, setMessage] = useState<string>('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  // La session est désormais posée côté SERVEUR par /auth/confirm (PKCE-safe).
  // On lit simplement la session ici ; on garde quand même un fallback pour
  // les liens implicit-legacy (#access_token=…) en cas de vieux email.
  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    // Affiche l'erreur remontée par /auth/confirm (?error=…) le cas échéant
    const url = new URL(window.location.href);
    const err = url.searchParams.get('error');
    if (err) {
      setMessage(decodeURIComponent(err));
      // on n'arrête pas tout de suite : peut-être que la session est quand
      // même posée via le fallback implicit.
    }

    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setStatus(data.session ? 'ready' : 'no-session');
    };
    const t = setTimeout(check, 150);
    const sub = supabase.auth.onAuthStateChange((_evt, sess) => {
      if (!mounted) return;
      if (sess) setStatus('ready');
    });
    return () => {
      mounted = false;
      clearTimeout(t);
      sub.data.subscription.unsubscribe();
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setMessage('Le mot de passe doit faire au moins 8 caractères.');
      setStatus('error');
      return;
    }
    if (password !== confirm) {
      setMessage('Les deux mots de passe ne correspondent pas.');
      setStatus('error');
      return;
    }
    setStatus('submitting');
    setMessage('');
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(error.message);
      setStatus('error');
      return;
    }
    setStatus('done');
    setTimeout(() => router.push('/accueil'), 1100);
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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-(--color-primary-soft) px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-(--color-primary)">
            <ShieldCheck className="h-3.5 w-3.5" /> Activation du compte
          </span>
          <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-(--color-ink) sm:text-3xl">
            {status === 'done' ? 'Bienvenue !' : 'Choisissez votre mot de passe'}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-(--color-ink-soft)">
            {status === 'no-session'
              ? (message
                  ? `Lien invalide : ${message}. Demandez un nouveau lien depuis la page d’inscription.`
                  : 'Lien d’activation invalide ou expiré. Demandez un nouveau lien depuis la page d’inscription.')
              : status === 'done'
              ? 'Votre mot de passe est créé. On vous redirige vers la plateforme…'
              : 'Définissez un mot de passe sécurisé pour accéder à votre espace Major ECN.'}
          </p>

          {status === 'checking' && (
            <div className="mt-6 flex items-center gap-2 text-sm text-(--color-ink-soft)">
              <Loader2 className="h-4 w-4 animate-spin" />
              Vérification du lien…
            </div>
          )}

          {status === 'no-session' && (
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-5 py-3 text-sm font-semibold text-(--color-ink) hover:border-(--color-primary)/40"
              >
                Retour au site
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-5 py-3 text-sm font-bold text-white shadow-sm hover:scale-[1.02] transition-transform"
              >
                Se connecter
              </Link>
            </div>
          )}

          {(status === 'ready' || status === 'submitting' || status === 'error') && (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <Field
                label="Nouveau mot de passe"
                id="password"
                type="password"
                value={password}
                onChange={setPassword}
                autoFocus
                placeholder="8 caractères minimum"
              />
              <Field
                label="Confirmer le mot de passe"
                id="confirm"
                type="password"
                value={confirm}
                onChange={setConfirm}
              />

              {status === 'error' && message && (
                <p className="flex items-start gap-2 rounded-xl border border-(--color-danger)/30 bg-[color-mix(in_srgb,var(--color-danger)_10%,var(--color-surface))] px-3 py-2 text-sm text-(--color-danger)">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-5 py-3 text-sm font-bold text-white shadow-(--shadow-soft) transition-transform hover:scale-[1.01] disabled:opacity-60"
              >
                {status === 'submitting' ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Activer mon compte
              </button>
            </form>
          )}

          {status === 'done' && (
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#2E8B57]/30 bg-[color-mix(in_srgb,#2E8B57_10%,var(--color-surface))] px-3 py-2 text-sm text-[#1F6B43]">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Mot de passe enregistré. Redirection en cours…
            </div>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-(--color-ink-muted)">
          Un souci ? Écrivez-nous à{' '}
          <a className="font-semibold text-(--color-primary)" href="mailto:inscriptionmajorecn@gmail.com">
            inscriptionmajorecn@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}

function Field({
  label, id, type = 'text', value, onChange, autoFocus, placeholder,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-(--color-ink)">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        placeholder={placeholder}
        required
        className="w-full rounded-xl border border-(--color-border) bg-white px-4 py-3 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-primary)"
      />
    </div>
  );
}
