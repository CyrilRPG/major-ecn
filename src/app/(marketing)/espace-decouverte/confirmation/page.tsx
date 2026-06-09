import Link from 'next/link';
import { AlertTriangle, ArrowRight, CheckCircle2, Lock, Mail, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Inscription confirmée — Major ECN',
  description: 'Votre compte Espace Découverte est en cours d\'activation.',
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ email_failed?: string }>;
}) {
  const sp = await searchParams;
  const emailFailed = sp.email_failed === '1';

  return (
    <section className="bg-[#F8FAFC] py-16 sm:py-24" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="rounded-3xl border bg-white p-8 shadow-sm sm:p-12" style={{ borderColor: '#E5E9F0' }}>
          <div className="flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: '#E7F6EC', color: '#16793C' }}>
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <h1 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl" style={{ color: '#0F1F4D' }}>
              C&rsquo;est presque fait !
            </h1>
            <p className="mt-4 max-w-md text-base sm:text-lg" style={{ color: '#52607A' }}>
              Votre compte Espace Découverte vient d&rsquo;être créé.
            </p>
          </div>

          {emailFailed ? (
            /* CAS : email d'activation non délivré → on bascule sur un encart d'alerte */
            <div
              className="mt-8 flex items-start gap-4 rounded-2xl border p-5 sm:p-6"
              style={{ borderColor: '#F5C2C7', background: '#FFF6F7' }}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ background: '#FDE3E5', color: '#C0112E' }}
              >
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[15px] font-extrabold leading-tight" style={{ color: '#7C0F1F' }}>
                  Votre compte est créé, mais l&rsquo;email d&rsquo;activation n&rsquo;a pas pu partir
                </p>
                <p className="mt-2 text-[14px] leading-relaxed" style={{ color: '#5C0E18' }}>
                  Pas d&rsquo;inquiétude : votre compte est bien enregistré. Écrivez-nous
                  rapidement à{' '}
                  <a href="mailto:contact@major-ecn.fr" className="font-semibold underline" style={{ color: '#C0112E' }}>
                    contact@major-ecn.fr
                  </a>{' '}
                  en précisant votre nom et votre email, nous activerons votre accès
                  manuellement (souvent en moins de 24 h).
                </p>
                <p className="mt-3 text-[13px] leading-relaxed" style={{ color: '#7A8499' }}>
                  Vous pouvez également cliquer sur « Mot de passe oublié&nbsp;? » depuis la
                  page de connexion pour vous renvoyer un lien d&rsquo;activation.
                </p>
                <Link
                  href="/login"
                  className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-extrabold underline"
                  style={{ color: '#C0112E' }}
                >
                  Aller à la page de connexion <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            /* CAS NOMINAL : email envoyé */
            <div className="mt-8 flex items-start gap-4 rounded-2xl border p-5 sm:p-6" style={{ borderColor: '#E5E9F0', background: '#FDFDFE' }}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: '#FDEEEF', color: '#C0112E' }}>
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[15px] font-extrabold leading-tight" style={{ color: '#0F1F4D' }}>
                  Vérifiez votre boîte mail
                </p>
                <p className="mt-2 text-[14px] leading-relaxed" style={{ color: '#52607A' }}>
                  Nous venons de vous envoyer un email avec un lien pour <strong>choisir
                  votre mot de passe</strong>. Cliquez sur ce lien pour activer votre compte
                  et accéder à l&rsquo;espace découverte.
                </p>
                <p className="mt-3 text-[13px] leading-relaxed" style={{ color: '#7A8499' }}>
                  Si vous ne recevez rien dans les 5 prochaines minutes, vérifiez vos
                  spams ou écrivez-nous à{' '}
                  <a href="mailto:contact@major-ecn.fr" className="font-semibold" style={{ color: '#C0112E' }}>
                    contact@major-ecn.fr
                  </a>.
                </p>
              </div>
            </div>
          )}

          {/* Ce qui vous attend */}
          <div className="mt-6">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.12em]" style={{ color: '#52607A' }}>
              Ce que vous allez découvrir
            </p>
            <ul className="mt-3 space-y-2.5">
              {[
                { Icon: CheckCircle2, t: 'Un collège dédié « Découverte » avec un cours BPCO (Pneumologie)' },
                { Icon: CheckCircle2, t: 'Un aperçu de QCM, fiches, flashcards et cas cliniques' },
                { Icon: Lock, t: 'Les autres collèges sont verrouillés (cadenas) — passez à une formule pour tout débloquer' },
              ].map((b) => (
                <li key={b.t} className="flex items-start gap-2.5 text-[14px]" style={{ color: '#1F2937' }}>
                  <b.Icon className="mt-0.5 h-4.5 w-4.5 shrink-0" style={{ color: '#16793C' }} />
                  <span>{b.t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/tarifs"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-[14px] font-extrabold text-white shadow-[0_12px_28px_-12px_rgba(192,17,46,0.55)] transition-transform hover:scale-[1.01]"
              style={{ background: 'linear-gradient(90deg,#8B0E22 0%,#C0112E 100%)' }}
            >
              Voir les formules
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border bg-white px-6 py-3.5 text-[14px] font-extrabold transition-colors hover:bg-[#F8FAFC]"
              style={{ borderColor: '#E5E9F0', color: '#0F1F4D' }}
            >
              Retour à l&rsquo;accueil
            </Link>
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-[12px]" style={{ color: '#7A8499' }}>
            <Sparkles className="h-3.5 w-3.5" style={{ color: '#C0112E' }} />
            Merci de votre confiance — l&rsquo;équipe Major ECN
          </p>
        </div>
      </div>
    </section>
  );
}
