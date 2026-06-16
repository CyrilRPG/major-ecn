'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Check, Mail, Users } from 'lucide-react';

const NAVY = '#0F1F4D';
const INK_SOFT = '#5B6478';
const RED = '#C0112E';
const PURPLE = '#7C3AED';

export function ConfirmationContent() {
  const sp = useSearchParams();
  const email = (sp.get('email') ?? '').trim();

  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function resend() {
    if (!email || state === 'sending') return;
    setState('sending');
    try {
      const r = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setState(r.ok ? 'sent' : 'error');
    } catch {
      setState('error');
    }
  }

  return (
    <section
      className="relative isolate overflow-hidden py-16 sm:py-20 lg:py-24"
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background:
          'radial-gradient(60% 50% at 50% 8%, rgba(192,17,46,0.05) 0%, rgba(255,255,255,0) 70%), radial-gradient(45% 45% at 12% 92%, rgba(124,58,237,0.07) 0%, rgba(255,255,255,0) 70%), radial-gradient(45% 45% at 88% 30%, rgba(59,130,246,0.05) 0%, rgba(255,255,255,0) 70%), #FFFFFF',
      }}
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* ===== Pastille check + confettis ===== */}
        <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
          {/* confettis décoratifs */}
          <span aria-hidden className="absolute left-1 top-3 h-4 w-[3px] -rotate-45 rounded-full" style={{ background: PURPLE, opacity: 0.7 }} />
          <Plus className="absolute -left-2 bottom-7" color={PURPLE} />
          <span aria-hidden className="absolute right-3 top-1 h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: '#7AA2F7' }} />
          <span aria-hidden className="absolute -right-1 top-1/2 h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: RED }} />
          <Plus className="absolute -right-2 bottom-6" color={RED} />

          {/* halo + disque vert */}
          <span aria-hidden className="absolute inset-0 rounded-full" style={{ background: 'rgba(34,197,94,0.10)' }} />
          <span className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full" style={{ background: '#E7F6EC' }}>
            <Check className="h-10 w-10" strokeWidth={3} style={{ color: '#16A34A' }} />
          </span>
        </div>

        {/* ===== Titre ===== */}
        <h1 className="mt-7 text-center text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl">
          <span style={{ color: NAVY }}>Merci ! Votre demande</span>
          <br />
          <span style={{ color: NAVY }}>a </span>
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(90deg, ${PURPLE} 0%, #BE185D 52%, ${RED} 100%)` }}
          >
            bien été enregistrée.
          </span>
        </h1>

        {/* ===== Sous-titre ===== */}
        <p className="mx-auto mt-5 max-w-xl text-center text-lg leading-relaxed" style={{ color: INK_SOFT }}>
          Nous venons de vous envoyer un email avec
          <br />
          le lien pour accéder gratuitement à la plateforme.
        </p>

        {/* ===== Carte « Vérifiez votre boîte email » ===== */}
        <div
          className="mx-auto mt-10 max-w-2xl rounded-3xl bg-white p-6 shadow-[0_30px_70px_-30px_rgba(15,31,77,0.18)] sm:p-8"
          style={{ border: '1px solid #EEF0F4' }}
        >
          <div className="flex items-start gap-5">
            {/* icône mail + badge */}
            <div className="relative shrink-0">
              <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full" style={{ background: '#F1ECFD' }}>
                <Mail className="h-8 w-8" style={{ color: PURPLE }} />
              </span>
              <span
                className="absolute -right-0.5 -top-0.5 flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-extrabold text-white shadow-sm"
                style={{ background: RED }}
              >
                1
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-xl font-extrabold leading-tight sm:text-2xl" style={{ color: NAVY }}>
                Vérifiez votre boîte email
              </p>
              <p className="mt-2 text-[15px] leading-relaxed" style={{ color: INK_SOFT }}>
                Ouvrez l&rsquo;email que nous venons de vous envoyer et cliquez sur le lien
                pour accéder à votre espace découverte.
              </p>
              <p className="mt-3 text-[15px] font-semibold leading-relaxed" style={{ color: RED }}>
                Pensez à vérifier vos spams si vous ne le trouvez pas.
              </p>
            </div>
          </div>
        </div>

        {/* ===== Séparateur OU ===== */}
        <div className="mx-auto mt-10 flex max-w-md items-center gap-4">
          <span className="h-px flex-1" style={{ background: '#E5E9F0' }} />
          <span className="text-[13px] font-bold tracking-wide" style={{ color: '#9AA1AE' }}>OU</span>
          <span className="h-px flex-1" style={{ background: '#E5E9F0' }} />
        </div>

        {/* ===== Renvoyer l'email ===== */}
        <p className="mt-6 text-center text-[15px]" style={{ color: INK_SOFT }}>
          Vous n&rsquo;avez pas reçu l&rsquo;email&nbsp;?{' '}
          {email ? (
            <button
              type="button"
              onClick={resend}
              disabled={state === 'sending'}
              className="font-extrabold underline underline-offset-2 disabled:opacity-60"
              style={{ color: RED }}
            >
              {state === 'sending' ? 'Envoi…' : 'Renvoyer l’email'}
            </button>
          ) : (
            <Link href="/espace-decouverte" className="font-extrabold underline underline-offset-2" style={{ color: RED }}>
              Renvoyer l&rsquo;email
            </Link>
          )}
        </p>
        {state === 'sent' && (
          <p className="mt-2 text-center text-[13px] font-semibold" style={{ color: '#16A34A' }}>
            Email renvoyé&nbsp;! Pensez à vérifier vos spams.
          </p>
        )}
        {state === 'error' && (
          <p className="mt-2 text-center text-[13px] font-semibold" style={{ color: RED }}>
            L&rsquo;envoi a échoué. Réessayez ou écrivez-nous à contact@major-ecn.fr.
          </p>
        )}

        {/* ===== Encart communauté ===== */}
        <div className="mx-auto mt-10 flex max-w-2xl items-center gap-4 rounded-2xl px-5 py-4 sm:px-6" style={{ background: '#F3F1FC' }}>
          <Users className="h-7 w-7 shrink-0" style={{ color: PURPLE }} />
          <p className="text-[14px] leading-relaxed sm:text-[15px]" style={{ color: '#33406B' }}>
            Des milliers de médecins se préparent déjà avec Major ECN.
            <br />
            Rejoignez une communauté de plus de{' '}
            <strong style={{ color: NAVY }}>9 000 médecins accompagnés</strong> depuis 2011.
          </p>
        </div>
      </div>
    </section>
  );
}

/** Petit « + » décoratif (confetti). */
function Plus({ className, color }: { className?: string; color: string }) {
  return (
    <span aria-hidden className={`relative inline-block h-3 w-3 ${className ?? ''}`}>
      <span className="absolute left-1/2 top-0 h-3 w-[3px] -translate-x-1/2 rounded-full" style={{ background: color, opacity: 0.8 }} />
      <span className="absolute left-0 top-1/2 h-[3px] w-3 -translate-y-1/2 rounded-full" style={{ background: color, opacity: 0.8 }} />
    </span>
  );
}
