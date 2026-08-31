import Link from 'next/link';
import type { Metadata } from 'next';

/**
 * Page 404 du site.
 *
 * Sans elle, une URL morte affichait la page par défaut de Next : un cul-de-sac,
 * alors que la Search Console recense plusieurs dizaines d'anciennes adresses
 * encore explorées et suivies depuis l'extérieur. Cette page renvoie vers les
 * points d'entrée réels du site (guide EVC, blog, préparation, contact).
 */

export const metadata: Metadata = {
  title: 'Page introuvable',
  description: "Cette adresse n'existe plus. Retrouvez le guide complet des EVC, le blog et la préparation Major ECN.",
  robots: { index: false, follow: true },
};

const LINKS = [
  {
    href: '/guide-evc',
    title: 'Guide complet des EVC',
    text: 'Tout le parcours du concours, étape par étape, avec l’ensemble de nos articles.',
  },
  {
    href: '/blog',
    title: 'Le blog Major ECN',
    text: 'Épreuves, inscription au CNG, méthodologie, spécialités et carrière.',
  },
  {
    href: '/plateforme',
    title: 'La préparation Major ECN',
    text: 'QCM et QROC corrigés, dossiers cliniques, épreuves blanches et suivi pédagogique.',
  },
  {
    href: '/contact',
    title: 'Nous contacter',
    text: 'Une question sur votre candidature ou votre préparation ? Écrivez-nous.',
  },
];

export default function NotFound() {
  return (
    <main
      className="flex min-h-[70vh] items-center bg-[#FAFBFE] py-14"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#C0112E]">
          Erreur 404
        </p>
        <h1 className="mt-2 text-[30px] font-black leading-tight tracking-tight text-[#1A2233] sm:text-[38px]">
          Cette page n’existe pas, ou n’existe plus
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#52607A]">
          L’adresse a peut-être changé, ou le lien que vous avez suivi est ancien. Voici les pages
          les plus utiles pour reprendre votre lecture.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {LINKS.map(({ href, title, text }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-2xl border border-[#ECEEF1] bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-24px_rgba(15,31,77,0.5)]"
            >
              <span className="block text-[14.5px] font-extrabold text-[#1A2233] group-hover:text-[#C0112E]">
                {title}
              </span>
              <span className="mt-1 block text-[13px] leading-relaxed text-[#52607A]">{text}</span>
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="mt-6 inline-flex items-center rounded-xl bg-[#C0112E] px-5 py-3 text-[14px] font-extrabold text-white shadow-sm transition-transform hover:scale-[1.02]"
        >
          Revenir à l’accueil
        </Link>
      </div>
    </main>
  );
}
