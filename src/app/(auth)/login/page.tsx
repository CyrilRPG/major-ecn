import { Suspense } from 'react';
import { Quote, ShieldCheck, Sparkles } from 'lucide-react';
import { LoginForm } from './login-form';
import { HermioneLogo, HermioneMark } from '@/components/brand/hermione-logo';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = { title: 'Se connecter' };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr] bg-(--color-surface)">
      {/* === Brand panel === */}
      <aside className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-(--color-surface-soft)">
        <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 -left-24 h-[480px] w-[480px] rounded-full opacity-40 blur-3xl"
               style={{ background: 'radial-gradient(circle, var(--color-violet-300), transparent 60%)' }} />
          <div className="absolute bottom-0 -right-20 h-[420px] w-[420px] rounded-full opacity-35 blur-3xl"
               style={{ background: 'radial-gradient(circle, var(--color-orange-200), transparent 60%)' }} />
          <div className="absolute inset-0"
               style={{
                 backgroundImage: 'radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--color-ink-muted) 18%, transparent) 1px, transparent 0)',
                 backgroundSize: '24px 24px',
                 maskImage: 'radial-gradient(ellipse 80% 70% at 30% 50%, black, transparent 80%)',
                 WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 30% 50%, black, transparent 80%)',
               }} />
        </div>

        <div className="flex items-center gap-2.5">
          <HermioneMark className="h-9 w-9" />
          <HermioneLogo />
        </div>

        <div className="max-w-md">
          <p className="eyebrow">Le parcours</p>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-(--color-ink) leading-[1.05] text-balance">
            Une seule route, du <span className="display italic text-(--color-primary)">premier cours</span> au concours.
          </h2>
          <p className="mt-5 text-(--color-ink-soft) leading-relaxed text-pretty">
            La vidéo du cours, la fiche, puis l’entraînement. Tu suis les étapes dans le bon ordre, et tu sais
            à chaque instant ce qui te reste à faire.
          </p>

          <figure className="mt-10 surface-card-bare p-6 grad-border max-w-md">
            <Quote className="h-5 w-5 text-(--color-accent)" />
            <blockquote className="mt-3 text-(--color-ink) leading-relaxed">
              « Avant Hermione, je passais mes journées à chercher mes ressources entre mes polys, les vidéos
              YouTube et les fiches des anciens. Là, tout est dans le même endroit, dans le même ordre. Je sais
              où j’en suis sans y penser. »
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-(--color-primary) text-(--color-accent) flex items-center justify-center font-semibold text-sm">
                CL
              </div>
              <div>
                <p className="font-medium text-sm text-(--color-ink)">Camille L.</p>
                <p className="text-xs text-(--color-ink-soft)">LAS1, Sorbonne Paris Nord</p>
              </div>
            </figcaption>
          </figure>
        </div>

        <div className="flex items-center gap-6 text-xs text-(--color-ink-soft)">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-(--color-success)" />
            RLS Postgres
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-(--color-primary)" />
            ~1 240 étudiants suivis
          </span>
        </div>
      </aside>

      {/* === Form panel === */}
      <section className="flex flex-col justify-center px-8 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden mb-8 flex items-center gap-2.5">
            <HermioneMark />
            <HermioneLogo />
          </div>
          <p className="eyebrow">Espace étudiant & admin</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-(--color-ink) leading-[1.1] text-balance">
            Bon retour parmi <span className="display italic text-(--color-primary)">nous</span>.
          </h1>
          <p className="mt-2 text-(--color-ink-soft)">Connecte-toi avec ton email Hermione.</p>
          <div className="mt-8">
            <Suspense fallback={<div className="space-y-4"><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-12 w-full" /></div>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}
