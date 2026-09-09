'use client';

import { useEffect, useState, useTransition } from 'react';
import { MailCheck } from 'lucide-react';
import { requestLoginLinkAny } from '@/app/(arena)/arena/connexion/actions';
import { ArenaButton, ARENA, BODY } from './arena-ui';
import { Field, FormError, TextInput } from './form-ui';

export function LoginForm({ defaultEmail = '' }: { defaultEmail?: string }) {
  const [email, setEmail] = useState(defaultEmail);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAt, setRetryAt] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!retryAt) return;
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
      setRemaining(seconds);
      if (!seconds) window.clearInterval(timer);
    };
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [retryAt]);

  function request() {
    if (pending || remaining > 0) return;
    setError(null);
    start(async () => {
      try {
        const result = await requestLoginLinkAny(email);
        if (!result.ok) { setError(result.error); return; }
        setSubmitted(true);
        setRemaining(result.retryAfter);
        setRetryAt(Date.now() + result.retryAfter * 1000);
      } catch {
        setError('La connexion a été interrompue. Vérifiez votre messagerie avant de réessayer.');
      }
    });
  }

  if (submitted) return (
    <div className="space-y-5" style={{ fontFamily: BODY }}>
      <div role="status" className="space-y-3 rounded-xl border p-4 text-[15px] leading-relaxed sm:p-6" style={{ background: 'rgba(46,204,113,0.06)', borderColor: 'rgba(46,204,113,0.3)' }}>
        <div className="flex items-start gap-3 font-semibold" style={{ color: ARENA.text }}>
          <MailCheck className="mt-1 h-5 w-5 shrink-0" style={{ color: ARENA.ok }} />
          <p>Vérifiez votre messagerie</p>
        </div>
        <p className="break-words font-semibold [overflow-wrap:anywhere]" style={{ color: ARENA.text }}>{email.trim().toLowerCase()}</p>
        <p style={{ color: ARENA.textSoft }}>Si cette adresse est inscrite, ouvrez l’email EVC Arena et suivez le lien pour accéder à votre espace.</p>
        <p className="text-sm" style={{ color: ARENA.textSoft }}>Vérifiez aussi les indésirables. Un seul envoi est possible par minute ; vos liens précédents restent valables jusqu’à leur expiration.</p>
      </div>
      <FormError>{error}</FormError>
      <ArenaButton type="button" onClick={request} disabled={pending || remaining > 0} className="w-full">
        {pending ? 'Demande en cours…' : remaining > 0 ? `Renvoyer un lien dans ${remaining} s` : 'Renvoyer un lien'}
      </ArenaButton>
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-sm">
        <button type="button" onClick={() => { setSubmitted(false); setError(null); }} className="underline underline-offset-4" style={{ color: ARENA.textSoft }}>Modifier l’adresse</button>
      </div>
      <p className="text-center text-xs leading-relaxed" style={{ color: ARENA.textMuted }}>Toujours aucun email ? <a href="mailto:contact@major-ecn.fr" className="underline underline-offset-4">Contacter Major ECN</a>.</p>
    </div>
  );

  return (
    <form className="space-y-5" onSubmit={event => { event.preventDefault(); request(); }}>
      <Field label="Adresse email de votre inscription" htmlFor="login-email">
        <TextInput id="login-email" type="email" autoComplete="email" maxLength={160} required value={email} onChange={event => setEmail(event.target.value)} placeholder="vous@exemple.fr" />
      </Field>
      <FormError>{error}</FormError>
      <ArenaButton type="submit" disabled={pending || remaining > 0} className="w-full">
        {pending ? 'Demande en cours…' : remaining > 0 ? `Nouvelle demande dans ${remaining} s` : 'Recevoir mon lien de connexion'}
      </ArenaButton>
    </form>
  );
}
