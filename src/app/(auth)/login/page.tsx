import { Suspense } from 'react';
import { LoginForm } from './login-form';
import { BrandMark } from '@/components/brand/brand-logo';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = { title: 'Se connecter' };

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-(--color-primary) text-white">
      {/* Ambient editorial backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute -right-40 -top-40 h-[680px] w-[680px] rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-accent), transparent 62%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 lg:px-12">
        <div className="flex items-center gap-2.5">
          <BrandMark className="h-9 w-9 ring-1 ring-white/20" />
          <span className="text-lg font-semibold uppercase tracking-[0.14em]">
            Major<span className="text-(--color-accent)"> ECN</span>
          </span>
        </div>

        <div className="flex flex-1 items-center py-16">
          <div className="grid w-full items-end gap-x-16 gap-y-12 lg:grid-cols-[1.3fr_1fr]">
            {/* Editorial statement */}
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-(--color-accent)">
                Préparation EDN · EVC
              </p>
              <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
                Le rang utile se prépare,{' '}
                <span className="italic text-(--color-accent)">item par item</span>.
              </h1>
              <p className="mt-8 max-w-md text-base leading-relaxed text-white/65">
                Cours, dossiers progressifs, ECOS et Dernier Tour réunis dans une seule console de
                travail. Reprenez exactement là où vous vous êtes arrêté.
              </p>
            </div>

            {/* Integrated auth block */}
            <div className="w-full max-w-sm justify-self-end rounded-2xl border border-white/12 bg-white/[0.06] p-7 backdrop-blur-sm">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/80">
                Accès à la console
              </h2>
              <div className="mt-6 [&_label]:text-white/70 [&_input]:bg-white/10 [&_input]:border-white/15 [&_input]:text-white [&_input]:placeholder:text-white/40">
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

        <p className="text-xs text-white/40">© {new Date().getFullYear()} Major ECN — Préparation EDN &amp; EVC</p>
      </div>
    </main>
  );
}
