import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LecteurVisiteGuidee } from '@/components/marketing/visite-guidee/lecteur-visite-guidee';
import { libelleDureeLong } from '@/lib/marketing/visite-guidee';
import { urlEmbedVisiteGuidee } from '@/lib/marketing/visite-guidee-serveur';
import { chargerCalendrierEvc, instantDuRendu } from '@/lib/evc-calendrier/server';
import { CapturePlateforme } from '@/components/marketing/home/capture-plateforme';

/**
 * /visite-guidee — la vidéo de présentation de la plateforme, en grand.
 *
 * Page publique (hors des préfixes protégés du middleware). Pas d'autoplay au
 * chargement : un grand bouton play lance la lecture AVEC le son (voix off),
 * bouton son visible. Sous la vidéo, un seul CTA :
 *  - lien d'e-mail de relance de l'Offre Découverte (`?acces=<jeton>`) :
 *    « Accéder à mon espace découverte → » vers /d/a/<jeton> (route du module
 *    Relances Offre Découverte) ;
 *  - sinon « Accéder à l'espace découverte gratuit → » vers /espace-decouverte.
 * Un jeton hors format (^[A-Za-z0-9_-]{20,128}$) est ignoré.
 */

export const metadata = {
  alternates: { canonical: '/visite-guidee' },
  title: 'Visite guidée de la plateforme',
  description:
    'Découvrez en vidéo la plateforme Major ECN de préparation aux EVC : tableau de bord, cours, QCM et QROC corrigés, cas cliniques, annales et suivi de progression.',
  openGraph: {
    title: 'Visite guidée de la plateforme — Major ECN',
    description: 'La plateforme de préparation aux EVC, en vidéo commentée : cours, entraînements, annales et suivi de progression.',
    url: '/visite-guidee',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Major ECN',
  },
};

const JETON_RE = /^[A-Za-z0-9_-]{20,128}$/;

export default async function VisiteGuideePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [sp, calendrier] = await Promise.all([searchParams, chargerCalendrierEvc()]);
  const brut = typeof sp.acces === 'string' ? sp.acces : null;
  const jeton = brut && JETON_RE.test(brut) ? brut : null;
  const cta = jeton
    ? { href: `/d/a/${jeton}`, label: 'Accéder à mon espace découverte' }
    : { href: '/espace-decouverte', label: 'Accéder à l’espace découverte gratuit' };

  return (
    <section
      className="py-12 sm:py-16 lg:py-20"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: 'linear-gradient(180deg, #FFFFFF 0%, #FBFBFD 100%)' }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-[11.5px] font-black uppercase tracking-[0.16em]" style={{ color: '#C0112E' }}>
            Visite guidée · {libelleDureeLong()}
          </p>
          <h1 className="mt-3 text-[1.9rem] font-black leading-tight tracking-tight sm:text-[2.5rem]" style={{ color: '#14254E', letterSpacing: '-0.02em' }}>
            La plateforme Major ECN, en vidéo
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed" style={{ color: '#4B5563', fontFamily: "'Manrope', sans-serif" }}>
            Cours, entraînements QCM et QROC, cas cliniques, annales corrigées et suivi de progression&nbsp;: tout ce
            qui vous attend dans votre espace, commenté pas à pas. Pensez à activer le son.
          </p>
        </div>

        <div
          className="relative mx-auto mt-8 w-full max-w-[1280px] overflow-hidden rounded-2xl bg-black shadow-[0_40px_100px_-40px_rgba(15,23,51,0.6)] sm:mt-10"
          style={{ aspectRatio: '16 / 9' }}
        >
          <LecteurVisiteGuidee
            embedUrl={urlEmbedVisiteGuidee()}
            source={jeton ? 'page_email' : 'page'}
            ctaFin={cta}
            demarrerAuMontage={false}
            affiche={<CapturePlateforme calendrier={calendrier} rendu={instantDuRendu()} className="h-full max-w-full" />}
          />
        </div>

        <div className="mt-8 flex justify-center sm:mt-10">
          <Link
            href={cta.href}
            className="group inline-flex items-center justify-center gap-3 rounded-xl px-7 py-4 text-[15px] font-black tracking-tight text-white shadow-[0_16px_40px_-14px_rgba(192,17,46,0.65)] transition-transform hover:scale-[1.02]"
            style={{ background: 'linear-gradient(90deg, #8B0E22 0%, #C0112E 100%)' }}
          >
            {cta.label}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
