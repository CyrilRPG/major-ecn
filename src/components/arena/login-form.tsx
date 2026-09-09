'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { MailCheck } from 'lucide-react';
import { requestLoginLinkAny } from '@/app/(arena)/arena/connexion/actions';
import { ArenaButton, ARENA, BODY } from './arena-ui';
import { Field, FormError, TextInput } from './form-ui';

/**
 * Demande de lien de connexion (sans mot de passe). Après envoi : consignes
 * (indésirables, délai, renvoi possible après une minute), sans révéler si
 * l'adresse est inscrite.
 */
export function LoginForm({ defaultEmail = '' }: { defaultEmail?: string }) {
  const [email, setEmail] = useState(defaultEmail);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (sent) {
    return (
      <div className="space-y-3 rounded-xl px-4 py-4" style={{ background: 'rgba(46,204,113,0.08)', boxShadow: 'inset 0 0 0 1px rgba(46,204,113,0.35)' }}>
        <p className="flex items-start gap-2 text-[14.5px] font-semibold" style={{ fontFamily: BODY, color: ARENA.text }}>
          <MailCheck className="mt-0.5 h-4 w-4 shrink-0" style={{ color: ARENA.ok }} />
          Si <span className="mx-1 break-all">{email.trim().toLowerCase()}</span> est inscrite, un lien vient de lui être envoyé.
        </p>
        <ul className="space-y-1 text-[13px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
          <li>Le lien est valable deux heures et s’ouvre d’un clic sur « Ouvrir mon espace ».</li>
          <li>Rien reçu après deux minutes ? Vérifiez les courriers indésirables, puis redemandez un lien (un envoi par minute).</li>
          <li>Adresse non inscrite ? <Link href="/arena" className="font-semibold underline-offset-4 hover:underline" style={{ color: ARENA.redSoft }}>Inscrivez-vous au tournoi</Link>.</li>
        </ul>
        <button type="button" onClick={() => setSent(false)} className="text-[12px] font-semibold underline-offset-4 hover:underline" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Utiliser une autre adresse</button>
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
      <Field label="Adresse email de votre inscription" htmlFor="login-email">
        <TextInput id="login-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.fr" />
      </Field>
      <FormError>{error}</FormError>
      <ArenaButton type="submit" disabled={pending} className="w-full">
        {pending ? 'Envoi…' : 'Recevoir mon lien de connexion'}
      </ArenaButton>
    </form>
  );
}
