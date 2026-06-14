'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Adresse email invalide.');
      return;
    }
    setPending(true);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/confirm?next=/auth/setup-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, { redirectTo });
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-xl border border-[#2E8B57]/30 bg-[color-mix(in_srgb,#2E8B57_10%,var(--color-surface))] px-3 py-2.5 text-sm text-[#1F6B43]">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Si un compte existe pour <span className="font-semibold">{email}</span>, un email contenant
            un lien de réinitialisation vient d&rsquo;être envoyé. Le lien expire après 1 heure.
          </span>
        </div>
        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-5 py-3 text-sm font-semibold text-(--color-ink) hover:border-(--color-primary)/40"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Adresse email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            className="pl-9"
            required
          />
        </div>
      </div>
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-(--color-danger)/30 bg-red-50 px-3 py-2 text-sm text-(--color-danger)">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Envoyer le lien de réinitialisation
      </Button>
      <p className="text-center text-xs text-(--color-ink-muted)">
        <Link href="/login" className="font-semibold text-(--color-primary) hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
