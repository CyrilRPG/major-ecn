'use client';

import { useEffect, useState, useTransition } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { subscribeArenaNews } from '@/app/(arena)/arena/actions';
import { formatRemaining } from '@/lib/arena/tournament-cards';
import { ARENA, BODY } from '../tokens';

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
    <p className="ev-countdown">
      {label}{' '}
      <span suppressHydrationWarning>{now === null ? '…' : formatRemaining(target - now)}</span>
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
      className="ev-news-form"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await subscribeArenaNews({ email, consent, source });
          setState(r.ok ? { kind: 'ok' } : { kind: 'error', message: r.error });
        });
      }}
    >
      <p className="ev-news-lead">Soyez informé de l’ouverture des prochains tournois.</p>
      <div className="ev-news-row">
        <label className="sr-only" htmlFor={`arena-news-email-${source}`}>Votre adresse e-mail</label>
        <input
          id={`arena-news-email-${source}`}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre adresse e-mail"
        />
        <button type="submit" disabled={pending} className="ev-btn ev-btn--red ev-btn--sm">
          {pending ? 'Envoi…' : 'M’informer'} <ArrowRight aria-hidden />
        </button>
      </div>
      <label className="ev-news-consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>
          J’accepte de recevoir les informations relatives aux prochains tournois EVC Arena. Vous pouvez vous désinscrire à tout moment.{' '}
          <a href="/confidentialite">En savoir plus sur notre politique de confidentialité.</a>
        </span>
      </label>
      {state.kind === 'error' && <p role="alert" className="ev-news-error">{state.message}</p>}
    </form>
  );
}
