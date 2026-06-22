'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

const schema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
});
type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/app';
  const disabled = params.get('disabled') === '1';
  const otherDevice = params.get('reason') === 'autre-appareil';
  const [authError, setAuthError] = useState<string | null>(
    disabled
      ? 'Ce compte a été désactivé par l’administrateur. Contactez-nous pour le réactiver.'
      : otherDevice
        ? 'Vous avez été déconnecté : ce compte vient d’être utilisé sur un autre appareil. Un seul appareil peut être connecté à la fois.'
        : null,
  );
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormData) {
    setAuthError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      setAuthError(error.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect.' : error.message);
      return;
    }
    // Vérifier que le compte n'a pas été désactivé par un admin.
    if (data.user) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('is_active')
        .eq('id', data.user.id)
        .maybeSingle<{ is_active: boolean | null }>();
      if (prof?.is_active === false) {
        await supabase.auth.signOut();
        setAuthError('Ce compte a été désactivé par l’administrateur. Contactez-nous pour le réactiver.');
        return;
      }
    }
    // Session unique : enregistre cet appareil comme seul autorisé (déconnecte
    // les autres). Best-effort — ne bloque jamais la connexion.
    try { await fetch('/api/auth/register-device', { method: 'POST' }); } catch { /* ignore */ }

    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Adresse email</Label>
        <Input id="email" type="email" autoComplete="email" placeholder="exemple@email.com" {...register('email')} />
        {errors.email && <p className="text-xs text-(--color-danger)">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Mot de passe</Label>
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-(--color-primary) hover:underline"
            tabIndex={-1}
          >
            Mot de passe oublié&nbsp;?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            className="pr-10"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            tabIndex={-1}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-(--color-ink-soft) hover:bg-(--color-sand-100) hover:text-(--color-ink) focus-ring"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-(--color-danger)">{errors.password.message}</p>}
      </div>

      {authError && (
        <div className="flex items-start gap-2 rounded-xl border border-(--color-danger)/30 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-(--color-danger)">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="animate-spin" /> : null}
        Se connecter
      </Button>
    </form>
  );
}
