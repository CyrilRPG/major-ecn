'use client';

import { useState, useTransition } from 'react';
import { requestLoginLinkAny } from '@/app/(arena)/arena/connexion/actions';
import { ArenaButton, ARENA, BODY } from './arena-ui';
import { Field, FormError, TextInput } from './form-ui';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (sent) {
    return (
      <div className="space-y-3">
        <p className="text-[15px] font-bold" style={{ fontFamily: BODY }}>Si cette adresse est inscrite, un lien de connexion vient de lui être envoyé.</p>
        <p className="text-sm" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Le lien est valable une heure. Pensez à vérifier vos courriers indésirables.</p>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const r = await requestLoginLinkAny(email);
          if (r.ok) setSent(true);
          else setError(r.error);
        });
      }}
    >
      <Field label="Adresse email" htmlFor="login-email">
        <TextInput id="login-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.fr" />
      </Field>
      <FormError>{error}</FormError>
      <ArenaButton type="submit" disabled={pending} className="w-full">
        {pending ? 'Envoi…' : 'Recevoir mon lien de connexion'}
      </ArenaButton>
    </form>
  );
}
