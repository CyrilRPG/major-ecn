import Link from 'next/link';
import { ArrowRight, CheckCircle2, Mail, PartyPopper, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Merci pour votre inscription — Major ECN',
  description: 'Votre paiement a été enregistré. Activez votre compte étudiant pour commencer.',
};

export default function MerciPage() {
  return (
    <section className="bg-[#F8FAFC] py-16 sm:py-24" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="rounded-3xl border bg-white p-8 shadow-sm sm:p-12" style={{ borderColor: '#E5E9F0' }}>
          <div className="flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: '#E7F6EC', color: '#16793C' }}>
              <PartyPopper className="h-8 w-8" />
            </span>
            <h1 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl" style={{ color: '#0F1F4D' }}>
              Bienvenue chez Major ECN !
            </h1>
            <p className="mt-4 max-w-md text-base sm:text-lg" style={{ color: '#52607A' }}>
              Votre paiement a bien été enregistré et votre compte étudiant a été créé automatiquement.
            </p>
          </div>

          {/* Card "Vérifiez votre email" */}
          <div className="mt-8 flex items-start gap-4 rounded-2xl border bg-white p-5 sm:p-6" style={{ borderColor: '#E5E9F0', background: '#FDFDFE' }}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: '#FDEEEF', color: '#C0112E' }}>
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[15px] font-extrabold leading-tight" style={{ color: '#0F1F4D' }}>
                Vérifiez votre boîte mail
              </p>
              <p className="mt-2 text-[14px] leading-relaxed" style={{ color: '#52607A' }}>
                Nous venons de vous envoyer un email avec votre récapitulatif de paiement
                et un lien pour <strong>choisir votre mot de passe</strong>. Cliquez sur ce
                lien pour activer votre compte et accéder à la plateforme.
              </p>
              <p className="mt-3 text-[13px] leading-relaxed" style={{ color: '#7A8499' }}>
                Si vous ne le recevez pas dans les 5 prochaines minutes, vérifiez vos spams
                ou contactez-nous à{' '}
                <a href="mailto:contact@major-ecn.fr" className="font-semibold" style={{ color: '#C0112E' }}>
                  contact@major-ecn.fr
                </a>.
              </p>
            </div>
          </div>

          {/* 3 bullets */}
          <ul className="mt-6 space-y-3">
            {[
              'Accès complet à la Médecine Générale (Voie interne + Voie externe)',
              'QCM, fiches, flashcards et méthodologie EVC',
              'Suivi personnalisé de votre progression',
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[14px]" style={{ color: '#1F2937' }}>
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: '#16793C' }} />
                <span>{t}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link
            href="/"
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-[14px] font-extrabold transition-colors hover:bg-[#F8FAFC]"
            style={{ border: '1px solid #E5E9F0', color: '#0F1F4D' }}
          >
            Retour à l&rsquo;accueil
            <ArrowRight className="h-4 w-4" />
          </Link>

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-[12px]" style={{ color: '#7A8499' }}>
            <Sparkles className="h-3.5 w-3.5" style={{ color: '#C0112E' }} />
            Merci de votre confiance — l&rsquo;équipe Major ECN
          </p>
        </div>
      </div>
    </section>
  );
}
