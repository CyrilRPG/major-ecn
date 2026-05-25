import { Suspense } from 'react';
import { LoginForm } from './login-form';
import { Skeleton } from '@/components/ui/skeleton';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';

export const metadata = { title: 'Se connecter' };

export default function LoginPage() {
  return (
    <div className="theme-manus relative isolate flex min-h-screen flex-col bg-(--color-surface) font-sans text-(--color-ink)">
      <MarketingHeader />

      <main className="relative flex-1">
        <div aria-hidden className="absolute -right-32 -top-32 -z-10 h-[420px] w-[420px] rounded-full bg-(--color-primary)/12 blur-[120px]" />
        <div aria-hidden className="absolute -left-24 top-1/3 -z-10 h-[280px] w-[280px] rounded-full bg-[#3B82F6]/10 blur-[100px]" />

        <div className="mx-auto flex max-w-6xl flex-col px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid w-full items-center gap-x-16 gap-y-12 lg:grid-cols-[1.25fr_1fr]">
            {/* Editorial statement */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-(--color-primary)">
                Préparation EVC
              </p>
              <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-balance text-(--color-ink) sm:text-5xl lg:text-6xl">
                Reprenez exactement{' '}
                <span className="bg-gradient-to-r from-[#6B1A2A] via-[#3B82F6] to-[#14B8A6] bg-clip-text text-transparent">
                  là où vous vous êtes arrêté
                </span>
                .
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-(--color-ink-soft)">
                Cours, QCM, flashcards, annales et coaching réunis dans une seule console de
                travail.
              </p>
            </div>

            {/* Auth block */}
            <div className="w-full max-w-sm justify-self-end rounded-2xl border border-(--color-border) bg-(--color-surface) p-7 shadow-(--shadow-soft)">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-(--color-ink-soft)">
                Accès à la plateforme
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
      </main>

      <MarketingFooter />
    </div>
  );
}
