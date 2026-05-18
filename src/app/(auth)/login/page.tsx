import { Suspense } from 'react';
import { ShieldCheck, Activity } from 'lucide-react';
import { LoginForm } from './login-form';
import { BrandLogo, BrandMark } from '@/components/brand/brand-logo';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = { title: 'Se connecter' };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_1.05fr] bg-(--color-surface)">
      {/* === Form panel (à gauche) === */}
      <section className="flex flex-col justify-center px-8 py-12 lg:px-20 order-2 lg:order-1">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden mb-8 flex items-center gap-2.5">
            <BrandMark />
            <BrandLogo />
          </div>
          <p className="eyebrow">Espace étudiant &amp; encadrant</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-(--color-ink) leading-[1.1] text-balance">
            Reprenez votre <span className="display italic text-(--color-primary)">préparation</span>.
          </h1>
          <p className="mt-2 text-(--color-ink-soft)">Connectez-vous avec votre adresse Major ECN.</p>
          <div className="mt-8">
            <Suspense fallback={<div className="space-y-4"><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-12 w-full" /></div>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </section>

      {/* === Brand panel (à droite) === */}
      <aside className="relative hidden lg:flex flex-col justify-between p-14 overflow-hidden order-1 lg:order-2 bg-(--color-primary) text-white">
        <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 right-[-6rem] h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
               style={{ background: 'radial-gradient(circle, var(--color-accent), transparent 62%)' }} />
          <div className="absolute inset-0 opacity-[0.06]"
               style={{
                 backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                 backgroundSize: '40px 40px',
               }} />
        </div>

        <div className="flex items-center gap-2.5">
          <BrandMark className="h-9 w-9 ring-1 ring-white/20" />
          <span className="flex items-baseline gap-2 font-semibold tracking-tight">
            <span className="text-xl uppercase text-white">Major<span className="text-(--color-accent)"> ECN</span></span>
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/60">Prépa EDN · EVC</span>
          </span>
        </div>

        <div className="max-w-md">
          <p className="eyebrow text-(--color-accent)">La méthode</p>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] text-balance">
            Du cours au <span className="display italic text-(--color-accent)">format concours</span>, sans rupture.
          </h2>
          <p className="mt-5 text-white/70 leading-relaxed text-pretty">
            Cours vidéo, fiches hiérarchisées rang A / rang B, dossiers progressifs, ECOS et
            Dernier Tour : un protocole unique, item par item, aligné sur les recommandations HAS.
          </p>

          <figure className="mt-10 rounded-2xl border border-white/15 bg-white/5 p-6 max-w-md">
            <blockquote className="display text-lg leading-relaxed">
              « Le format des dossiers progressifs et des ECOS était exactement celui du jour J.
              Je me suis concentré sur le fond, plus jamais sur la forme. »
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-(--color-accent) text-(--color-primary) flex items-center justify-center font-semibold text-sm">
                TG
              </div>
              <div>
                <p className="font-medium text-sm text-white">Thomas G.</p>
                <p className="text-xs text-white/60">DFASM2 (D3)</p>
              </div>
            </figcaption>
          </figure>
        </div>

        <div className="flex items-center gap-6 text-xs text-white/70">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-(--color-accent)" />
            Données chiffrées &amp; sécurisées
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-(--color-accent)" />
            Suivi de progression en temps réel
          </span>
        </div>
      </aside>
    </main>
  );
}
