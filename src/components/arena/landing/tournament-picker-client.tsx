'use client';

import { useEffect, useState, useTransition } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { subscribeArenaNews } from '@/app/(arena)/arena/actions';
import { formatRemaining } from '@/lib/arena/tournament-cards';
import { ARENA, BODY, DISPLAY } from '../tokens';

/** « Ferme dans 1 j 08 h 24 min » / « Ouvre dans 12 h 17 min », mis à jour chaque seconde. */
export function CardCountdown({ kind, at }: { kind: 'closes' | 'opens'; at: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const t0 = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => { window.clearTimeout(t0); window.clearInterval(id); };
  }, [at]);
  const target = new Date(at).getTime();
  const label = kind === 'closes' ? 'Ferme dans' : 'Ouvre dans';
  return (
    <p className="mt-1.5 text-[14px] font-semibold" style={{ color: ARENA.text, fontFamily: BODY }}>
      {label}{' '}
      <span suppressHydrationWarning style={{ color: ARENA.goldSoft, fontVariantNumeric: 'tabular-nums' }}>{now === null ? '…' : formatRemaining(target - now)}</span>
    </p>
  );
}

/** Formulaire « Autres spécialités à venir » : e-mail + consentement explicite. */
export function ArenaNewsForm({ source }: { source: string }) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<{ kind: 'idle' } | { kind: 'ok' } | { kind: 'error'; message: string }>({ kind: 'idle' });
  const [pending, start] = useTransition();

  if (state.kind === 'ok') {
    return (
      <p className="flex items-start gap-2 text-[14px] leading-relaxed" style={{ color: ARENA.text, fontFamily: BODY }}>
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: 'rgba(46,204,113,0.18)', color: ARENA.ok }}><Check className="h-3 w-3" strokeWidth={3} /></span>
        C’est noté : vous serez informé de l’ouverture des prochains tournois EVC Arena.
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await subscribeArenaNews({ email, consent, source });
          setState(r.ok ? { kind: 'ok' } : { kind: 'error', message: r.error });
        });
      }}
    >
      <p className="text-[13.5px]" style={{ color: ARENA.text, fontFamily: BODY }}>Soyez informé de l’ouverture des prochains tournois.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="arena-news-email">Votre adresse e-mail</label>
        <input
          id="arena-news-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre adresse e-mail"
          className="h-12 min-w-0 flex-1 rounded-lg px-4 text-[15px] outline-none"
          style={{ background: '#F5F6F8', color: '#14254E', fontFamily: BODY, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.4)' }}
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2.5 rounded-lg px-6 text-[13.5px] uppercase tracking-[0.14em] text-white transition-[filter] hover:brightness-110 disabled:opacity-60"
          style={{ background: 'linear-gradient(180deg, #A8102F 0%, #7A0A21 100%)', boxShadow: 'inset 0 0 0 1px rgba(212,169,74,0.55)', fontFamily: DISPLAY, fontWeight: 600 }}
        >
          {pending ? 'Envoi…' : 'M’informer'} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <label className="flex items-start gap-3 text-[12px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#E4002B]" />
        <span>
          J’accepte de recevoir les informations relatives aux prochains tournois EVC Arena. Vous pouvez vous désinscrire à tout moment.{' '}
          <a href="/confidentialite" className="underline underline-offset-2" style={{ color: ARENA.goldSoft }}>En savoir plus sur notre politique de confidentialité.</a>
        </span>
      </label>
      {state.kind === 'error' && <p role="alert" className="text-[13px] font-semibold" style={{ color: ARENA.redSoft, fontFamily: BODY }}>{state.message}</p>}
    </form>
  );
}
