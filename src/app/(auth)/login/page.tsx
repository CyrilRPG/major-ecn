import { Suspense } from 'react';
import { LoginForm } from './login-form';
import { BrandLogo } from '@/components/brand/brand-logo';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = { title: 'Se connecter' };

export default function LoginPage() {
  return (
    <main className="relative min-h-screen bg-(--color-surface-soft) text-(--color-ink)">
      {/* Sober editorial accent: a single thin red rule */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-(--color-primary)" />

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 lg:px-12">
        <div className="inline-flex w-fit items-center rounded-xl bg-(--color-sidebar) px-3.5 py-2.5">
          <BrandLogo className="h-14 w-auto" />
        </div>

        <div className="flex flex-1 items-center py-16">
          <div className="grid w-full items-center gap-x-16 gap-y-12 lg:grid-cols-[1.25fr_1fr]">
            {/* Editorial statement */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-ink-muted)">
                Préparation EVC
              </p>
              <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
                Le rang utile se prépare,{' '}
                <span className="italic text-(--color-primary)">item par item</span>.
              </h1>
              <p className="mt-8 max-w-md text-base leading-relaxed text-(--color-ink-soft)">
                Cours, dossiers progressifs, ECOS et Dernier Tour réunis dans une seule console de
                travail. Reprenez exactement là où vous vous êtes arrêté.
              </p>
            </div>

            {/* Auth block */}
            <div className="w-full max-w-sm justify-self-end rounded-2xl border border-(--color-border) bg-(--color-surface) p-7 shadow-(--shadow-soft)">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-(--color-ink-soft)">
                Accès à la console
              </h2>
              <div className="mt-6">
                <Suspense
                  fallback={
                    <div className="space-y-4">
                      <Skeleton className="h-11 w-full" />
                      <Skeleton className="h-11 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  }
                >
                  <LoginForm />
                </Suspense>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-(--color-ink-muted)">
          © {new Date().getFullYear()} Major ECN — Préparation EDN &amp; EVC
        </p>
      </div>
    </main>
  );
}
