import Link from 'next/link';
import { ArrowLeft, ArrowRight, Info, Mail } from 'lucide-react';

export const metadata = {
  title: 'Paiement annulé — Major ECN',
  description: 'Votre paiement a été annulé. Aucun débit n\'a été effectué.',
  robots: { index: false, follow: true },
};

export default function AnnulePage() {
  return (
    <section className="bg-[#F8FAFC] py-16 sm:py-24" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="rounded-3xl border bg-white p-8 shadow-sm sm:p-12" style={{ borderColor: '#E5E9F0' }}>
          <div className="flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: '#FEF3E2', color: '#B26A00' }}>
              <Info className="h-8 w-8" />
            </span>
            <h1 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl" style={{ color: '#0F1F4D' }}>
              Paiement annulé
            </h1>
            <p className="mt-4 max-w-md text-base sm:text-lg" style={{ color: '#52607A' }}>
              Pas d&rsquo;inquiétude — aucun débit n&rsquo;a été effectué. Vous pouvez
              reprendre votre inscription à tout moment.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/tarifs"
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-[14px] font-extrabold text-white shadow-[0_12px_28px_-12px_rgba(192,17,46,0.55)] transition-transform hover:scale-[1.01]"
              style={{ background: 'linear-gradient(90deg,#8B0E22 0%,#C0112E 100%)' }}
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux formules
            </Link>
            <Link
              href="/espace-decouverte"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border bg-white px-6 py-3.5 text-[14px] font-extrabold transition-colors hover:bg-[#F8FAFC]"
              style={{ borderColor: '#E5E9F0', color: '#0F1F4D' }}
            >
              Espace découverte gratuit
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-2xl border p-5" style={{ borderColor: '#E5E9F0', background: '#FDFDFE' }}>
            <Mail className="h-5 w-5 shrink-0" style={{ color: '#C0112E' }} />
            <p className="text-[13px] leading-relaxed" style={{ color: '#52607A' }}>
              Une question sur votre inscription ? Notre équipe vous répond à{' '}
              <a href="mailto:contact@major-ecn.fr" className="font-semibold" style={{ color: '#C0112E' }}>
                contact@major-ecn.fr
              </a>{' '}
              ou par téléphone au <strong>01 47 34 35 71</strong>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
