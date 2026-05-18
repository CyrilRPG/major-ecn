import Link from 'next/link';
import {
  ArrowRight, BookOpen, CheckCircle2, ClipboardList, FileText,
  GraduationCap, Layers3, PlayCircle, Sparkles, Stethoscope,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HermioneLogo, HermioneMark } from '@/components/brand/hermione-logo';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Ambient halos */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-40 -left-32 h-[460px] w-[460px] rounded-full opacity-50 blur-3xl"
          style={{ background: 'radial-gradient(circle, #B591D9, transparent 60%)' }}
        />
        <div
          className="absolute top-1/3 -right-32 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, #F4AB34, transparent 60%)' }}
        />
      </div>

      <Nav />

      {/* === Hero === */}
      <section className="px-6 lg:px-10 pt-20 md:pt-28 pb-24 mx-auto max-w-5xl">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-(--color-border) bg-(--color-primary-soft) px-4 py-1.5 text-xs font-medium text-(--color-ink)">
            <Stethoscope className="h-3.5 w-3.5 text-(--color-accent)" />
            Prépa PASS, LAS et redoublants
          </span>

          <h1 className="mt-8 font-semibold tracking-tight text-(--color-ink) leading-[0.95] text-balance text-5xl sm:text-6xl md:text-[5.5rem]">
            La méthode qui sort ton concours du <em className="display italic text-(--color-primary)">chaos</em>.
          </h1>

          <p className="mt-8 max-w-2xl text-lg md:text-xl text-(--color-ink-soft) leading-relaxed text-pretty">
            On a passé des années en médecine, on sait à quel point l’année est dure quand tes cours sont
            éparpillés entre les polys, les vidéos YouTube et les groupes WhatsApp. Hermione remet de l’ordre :
            un seul parcours, du cours filmé jusqu’aux entraînements.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Button asChild size="xl">
              <Link href="/login">
                Commencer maintenant
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="#parcours">
                Voir comment ça marche
              </Link>
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-(--color-ink-muted)">
            <Stat value="1 240" label="étudiants suivis" />
            <Divider />
            <Stat value="3 ans" label="d’archives d’annales" />
            <Divider />
            <Stat value="< 2 min" label="pour démarrer une série" />
          </div>
        </div>
      </section>

      {/* === Problème === */}
      <section className="px-6 lg:px-10 py-20 mx-auto max-w-6xl">
        <header className="mb-12 max-w-2xl">
          <p className="eyebrow">On t’a déjà vu galérer là-dessus</p>
          <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-balance leading-[1.05]">
            Pas le niveau qui manque. <em className="display italic text-(--color-primary)">L’organisation</em>.
          </h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Pain
            title="Tu jongles entre 7 supports"
            description="Le poly de fac, les fiches de l’an dernier, la chaîne YouTube du tuteur, les screens dans la galerie photos… Tu perds plus de temps à chercher qu’à apprendre."
          />
          <Pain
            title="Tu ne sais pas où tu en es"
            description="Tu fais des QCM, mais sans savoir si tu progresses, sur quelles notions tu coinces, ou ce que ton voisin de promo a déjà couvert."
          />
          <Pain
            title="La motivation s’épuise"
            description="Quand chaque journée commence par un mur de PDF, tu finis par procrastiner. Le concours, c’est un marathon, pas un crunch."
          />
        </div>
      </section>

      {/* === Parcours === */}
      <section id="parcours" className="px-6 lg:px-10 py-20 mx-auto max-w-6xl">
        <header className="mb-14 max-w-2xl">
          <p className="eyebrow">Le parcours Hermione</p>
          <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-balance leading-[1.05]">
            Un cours, <em className="display italic text-(--color-primary)">une seule route</em>.
          </h2>
          <p className="mt-4 text-(--color-ink-soft) leading-relaxed text-pretty">
            Pour chaque cours, tu suis quatre étapes dans le bon ordre. Pas d’hésitation, pas de support oublié.
            Tu sais à chaque instant ce qui te reste à faire.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Step index="01" Icon={PlayCircle} title="Vidéo du cours" description="Le cours filmé par un référent. Tu poses les bases, à ton rythme, avec la vitesse de lecture qui te convient." />
          <Step index="02" Icon={FileText}   title="Fiche de cours"     description="Le résumé synthétique du cours, soigné, prêt à imprimer. Tu marques les points clés et tu retiens." />
          <Step index="03" Icon={ClipboardList} title="Entraînement"      description="Tu valides ce que tu as compris. La correction t’explique pourquoi chaque proposition est vraie ou fausse." />
          <Step index="04" Icon={Layers3}    title="Flashcards"          description="Pour fixer la mémoire. L’ordre s’adapte à toi : ce qui te résiste revient plus souvent." />
        </div>
      </section>

      {/* === Bénéfices === */}
      <section className="px-6 lg:px-10 py-20 mx-auto max-w-6xl">
        <header className="mb-12 max-w-2xl">
          <p className="eyebrow">Pourquoi Hermione</p>
          <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-balance leading-[1.05]">
            Pensé pour que tu <em className="display italic text-(--color-primary)">progresses</em>, pas pour s’afficher en photo.
          </h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Benefit
            Icon={GraduationCap}
            title="Une pédagogie, pas un catalogue"
            description="Chaque contenu est validé par notre équipe d’étudiants en 2e et 3e année. Pas de polys obscurs, pas de mauvais cours."
          />
          <Benefit
            Icon={CheckCircle2}
            title="La correction qui t’apprend vraiment"
            description="Sur chaque item, une justification pédagogique. Tu comprends le “pourquoi”, tu ne mémorises pas bêtement le “quoi”."
          />
          <Benefit
            Icon={BookOpen}
            title="Suivi de promo, sans le stress"
            description="Tu vois ta progression matière par matière. Ton tuteur la voit aussi, pour t’aider à corriger ce qui doit l’être."
          />
        </div>
      </section>

      {/* === Témoignages === */}
      <section className="px-6 lg:px-10 py-20 mx-auto max-w-6xl">
        <header className="mb-12 max-w-2xl">
          <p className="eyebrow">Ils sont passés par là</p>
          <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-balance leading-[1.05]">
            La méthode qui <em className="display italic text-(--color-primary)">a tenu</em> jusqu’en juin.
          </h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Quote
            text="J’avais 2 années de PASS derrière moi. Quand j’ai redoublé en LAS, j’ai bossé deux fois moins d’heures avec Hermione, et j’ai validé."
            name="Léa B."
            role="LAS1 validée · Sorbonne Paris Nord"
          />
          <Quote
            text="Le plus dur, c’est de garder le rythme tout au long de l’année. Le fait de voir où j’en étais sur chaque cours m’a évité de zapper des matières entières."
            name="Maxime D."
            role="PASS · Sorbonne Paris Nord"
          />
          <Quote
            text="C’est honnêtement le seul outil que j’ai gardé du début à la fin. Tout le reste, je l’ai désinstallé en novembre."
            name="Camille L."
            role="LAS1 · Sorbonne Paris Nord"
          />
        </div>
      </section>

      {/* === CTA final === */}
      <section className="px-6 lg:px-10 py-24 mx-auto max-w-4xl text-center">
        <h2 className="font-semibold tracking-tight text-(--color-ink) leading-[0.95] text-balance text-4xl md:text-6xl">
          On t’a pris une place pour <em className="display italic text-(--color-primary)">l’année prochaine</em>.
        </h2>
        <p className="mt-6 max-w-xl mx-auto text-(--color-ink-soft) text-pretty">
          Connecte-toi avec ton adresse Hermione et lance ton premier cours. Tu peux ressortir quand tu veux,
          ta progression t’attend à la prochaine session.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="xl">
            <Link href="/login">
              Accéder à mon espace
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="xl" variant="outline">
            <Link href="mailto:hello@hermione-medecine.co">
              Discuter avec l’équipe
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-30 surface-glass">
      <div className="mx-auto max-w-6xl px-6 lg:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <HermioneMark />
          <HermioneLogo />
        </div>
        <div className="hidden md:flex items-center gap-7 text-sm text-(--color-ink-soft)">
          <a href="#parcours" className="hover:text-(--color-ink) transition">Parcours</a>
          <a href="#" className="hover:text-(--color-ink) transition">Tarifs</a>
          <a href="#" className="hover:text-(--color-ink) transition">Contact</a>
        </div>
        <Button asChild size="md">
          <Link href="/login">
            Se connecter
          </Link>
        </Button>
      </div>
      <div className="hairline" aria-hidden />
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-(--color-border) mt-20">
      <div className="mx-auto max-w-6xl px-6 lg:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-(--color-ink-muted)">
        <div className="flex items-center gap-2.5">
          <HermioneMark className="h-6 w-6" />
          <span>Hermione Médecine, Sorbonne Paris Nord</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="#" className="hover:text-(--color-ink) transition">Mentions légales</a>
          <a href="#" className="hover:text-(--color-ink) transition">Confidentialité</a>
          <a href="mailto:hello@hermione-medecine.co" className="hover:text-(--color-ink) transition">hello@hermione-medecine.co</a>
        </div>
      </div>
    </footer>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-(--color-ink-soft) text-sm">
      <span className="font-semibold text-(--color-ink) tabular-nums">{value}</span>{' '}
      <span className="text-(--color-ink-muted)">{label}</span>
    </div>
  );
}

function Divider() {
  return <span aria-hidden className="h-3 w-px bg-(--color-border-strong)" />;
}

function Pain({ title, description }: { title: string; description: string }) {
  return (
    <article className="surface-card">
      <Sparkles className="h-5 w-5 text-(--color-accent)" />
      <h3 className="mt-4 font-semibold text-(--color-ink) text-lg leading-snug">{title}</h3>
      <p className="mt-2 text-sm text-(--color-ink-soft) leading-relaxed text-pretty">{description}</p>
    </article>
  );
}

function Step({ index, Icon, title, description }: { index: string; Icon: typeof PlayCircle; title: string; description: string }) {
  return (
    <article className="surface-card group hover:-translate-y-1 transition">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-(--color-ink-muted)">{index}</span>
        <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-(--color-primary-soft) text-(--color-accent)">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <h3 className="mt-5 font-semibold text-(--color-ink) text-lg leading-snug">{title}</h3>
      <p className="mt-2 text-sm text-(--color-ink-soft) leading-relaxed text-pretty">{description}</p>
    </article>
  );
}

function Benefit({ Icon, title, description }: { Icon: typeof GraduationCap; title: string; description: string }) {
  return (
    <article className="surface-card grad-border">
      <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-(--color-primary-soft) text-(--color-accent)">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 font-semibold text-(--color-ink) text-lg leading-snug">{title}</h3>
      <p className="mt-2 text-sm text-(--color-ink-soft) leading-relaxed text-pretty">{description}</p>
    </article>
  );
}

function Quote({ text, name, role }: { text: string; name: string; role: string }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  return (
    <figure className="surface-card flex flex-col h-full">
      <Sparkles className="h-5 w-5 text-(--color-accent)" />
      <blockquote className="mt-4 text-(--color-ink) leading-relaxed flex-1">
        « {text} »
      </blockquote>
      <figcaption className="mt-5 pt-5 border-t border-(--color-border) flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-(--color-primary) text-(--color-accent) flex items-center justify-center font-semibold text-sm">
          {initials}
        </div>
        <div>
          <p className="font-medium text-sm text-(--color-ink)">{name}</p>
          <p className="text-xs text-(--color-ink-muted)">{role}</p>
        </div>
      </figcaption>
    </figure>
  );
}
