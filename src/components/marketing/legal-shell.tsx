/**
 * Layout commun pour les pages légales (Politique de confidentialité, CGU,
 * Mentions légales). Sommaire à gauche, contenu à droite.
 */
import Link from 'next/link';
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react';

const NAVY = '#0F1F4D';
const INK = '#1F2937';
const INK_SOFT = '#52607A';
const RED = '#C0112E';
const BORDER = '#E5E9F0';
const SOFT_BG = '#F8FAFC';

export type TocItem = { id: string; label: string };

export function LegalShell({
  title,
  subtitle,
  lastUpdated,
  toc,
  children,
}: {
  title: string;
  subtitle: string;
  lastUpdated: string;
  toc: TocItem[];
  children: React.ReactNode;
}) {
  return (
    <main className="bg-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* HERO compact */}
      <section className="border-b" style={{ borderColor: BORDER, background: SOFT_BG }}>
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[13px] font-bold transition-opacity hover:opacity-80"
            style={{ color: RED }}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&rsquo;accueil
          </Link>
          <div className="mt-5 flex items-start gap-4">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: '#FCEAEC', color: RED }}
            >
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em]" style={{ color: RED }}>
                Information légale
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl" style={{ color: NAVY }}>
                {title}
              </h1>
              <p className="mt-2 max-w-2xl text-[15px]" style={{ color: INK_SOFT }}>
                {subtitle}
              </p>
              <p className="mt-3 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-[11.5px] font-semibold" style={{ borderColor: BORDER, color: INK_SOFT }}>
                <FileText className="h-3.5 w-3.5" />
                Dernière mise à jour : <span style={{ color: NAVY }}>{lastUpdated}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENU */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[260px_1fr] lg:gap-14 lg:px-8">
          {/* TOC sticky desktop */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: INK_SOFT }}>
              Sommaire
            </p>
            <nav className="mt-3">
              <ol className="space-y-2">
                {toc.map((item, i) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="group flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-[13.5px] transition-colors hover:bg-[#FAFBFD]"
                      style={{ color: INK }}
                    >
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold"
                        style={{ background: '#FCEAEC', color: RED }}
                      >
                        {i + 1}
                      </span>
                      <span className="group-hover:font-semibold">{item.label}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          {/* Contenu principal */}
          <article className="prose-major">{children}</article>
        </div>
      </section>

      {/* Footer mini */}
      <section className="border-t bg-[#F8FAFC] py-8" style={{ borderColor: BORDER }}>
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-[12.5px]" style={{ color: INK_SOFT }}>
            Une question sur ce document ? Contactez-nous à{' '}
            <a href="mailto:contact@major-ecn.fr" className="font-semibold" style={{ color: RED }}>
              contact@major-ecn.fr
            </a>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[12.5px]" style={{ color: INK_SOFT }}>
            <Link href="/mentions-legales" className="hover:underline">Mentions légales</Link>
            <span aria-hidden>·</span>
            <Link href="/confidentialite" className="hover:underline">Confidentialité</Link>
            <span aria-hidden>·</span>
            <Link href="/cgu" className="hover:underline">CGU</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ============================================================
   Composants typographiques pour le contenu (utilisés via children).
   ============================================================ */
export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 pb-10">
      <h2 className="text-[22px] font-black sm:text-2xl" style={{ color: NAVY }}>
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[14.5px] leading-relaxed" style={{ color: INK }}>
        {children}
      </div>
    </section>
  );
}

export function LegalSubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6">
      <h3 className="text-[16px] font-extrabold" style={{ color: NAVY }}>{title}</h3>
      <div className="mt-2 space-y-3">{children}</div>
    </div>
  );
}

export function LegalList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mt-2 space-y-2 pl-5" style={{ listStyle: 'disc', color: INK }}>
      {children}
    </ul>
  );
}

export function LegalInfoBox({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="my-5 rounded-2xl border p-5" style={{ background: '#F8FAFC', borderColor: BORDER }}>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: RED }}>
        {title}
      </p>
      <div className="mt-2 text-[13.5px]" style={{ color: INK }}>{children}</div>
    </div>
  );
}
