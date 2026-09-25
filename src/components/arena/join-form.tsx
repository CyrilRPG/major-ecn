'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { checkPseudo, joinTournament, logoutArena } from '@/app/(arena)/arena/[slug]/actions';
import { CONSENT_MARKETING, CONSENT_TOURNAMENT } from '@/lib/arena/texts';
import { browserTimezone } from '@/lib/arena/time';
import { ArrowRight } from 'lucide-react';
import { ArenaAvatar } from './arena-avatar';
import { CheckRow, Field, FormError, TextInput, type FieldStatus } from './form-ui';

/**
 * Inscription en un clic (bug « Interniste », 25/09/2026) : la personne est
 * déjà connectée à EVC Arena par un autre tournoi. Son identité est reprise ;
 * seul le pseudonyme est proposé (modifiable). Le consentement au tournoi est
 * une case explicite, la prospection n'est jamais pré-cochée.
 *
 * Mise en forme : charte du 24/09/2026 (arena-refonte.css, classes `ev-join`).
 */
export function JoinForm({
  slug, pseudo: initialPseudo, avatarSeed, firstName, maskedEmail, cta, inviteCode, source, utm, next,
}: {
  slug: string;
  pseudo: string;
  avatarSeed: string;
  firstName: string;
  maskedEmail: string;
  cta: string;
  inviteCode: string | null;
  source: string | null;
  utm: Record<string, string> | null;
  next: string | null;
}) {
  const router = useRouter();
  const [pseudo, setPseudo] = useState(initialPseudo);
  const [pseudoStatus, setPseudoStatus] = useState<FieldStatus>(null);
  const [pseudoMsg, setPseudoMsg] = useState<string | null>(null);
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const checkRef = useRef(0);

  useEffect(() => {
    const value = pseudo.trim();
    const id = ++checkRef.current;
    if (value.length < 3) {
      const t = window.setTimeout(() => { setPseudoStatus(null); setPseudoMsg(null); }, 0);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(async () => {
      const r = await checkPseudo(slug, value);
      if (id !== checkRef.current) return;
      setPseudoStatus(r.status === 'ok' ? 'ok' : 'error');
      setPseudoMsg(r.message);
    }, 300);
    return () => window.clearTimeout(t);
  }, [pseudo, slug]);

  return (
    <form
      className="ev-join"
      data-arena-join
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        if (!c1) { setError('Le consentement au traitement des données est obligatoire pour participer.'); return; }
        start(async () => {
          try {
            const r = await joinTournament(slug, {
              pseudo, consentTournament: true, consentMarketing: c2,
              timezone: browserTimezone(), source, utm, inviteCode, next,
            });
            if (!r.ok) { setError(r.error); return; }
            router.push(r.href);
            router.refresh();
          } catch {
            setError('La demande a été interrompue. Rechargez la page : si votre inscription est enregistrée, votre espace s’ouvrira directement.');
          }
        });
      }}
    >
      <div className="ev-join-id">
        <ArenaAvatar seed={avatarSeed} size={64} />
        <div className="min-w-0">
          <p className="ev-join-hello">Bonjour <span>{firstName}</span>, vous êtes connecté à EVC Arena.</p>
          <p>Adresse : {maskedEmail}. Vos informations sont reprises : il ne reste qu’à confirmer votre participation.</p>
        </div>
      </div>

      <Field
        label="Pseudonyme dans ce tournoi" htmlFor="j-pseudo" required
        hint="Seul élément d’identité affiché publiquement. 3 à 24 caractères."
        ok={pseudoStatus === 'ok' ? pseudoMsg : null}
        error={pseudoStatus === 'error' ? pseudoMsg : null}
      >
        <TextInput id="j-pseudo" required minLength={3} maxLength={24} value={pseudo} onChange={(e) => setPseudo(e.target.value)} status={pseudoStatus} autoComplete="off" />
      </Field>

      <div className="space-y-3">
        <CheckRow checked={c1} onChange={setC1}>
          {CONSENT_TOURNAMENT}{' '}
          <a href="/confidentialite" target="_blank" rel="noreferrer" className="underline underline-offset-4">(lien vers la politique de confidentialité)</a>
          <span className="ev-join-tag ev-join-tag--req">Obligatoire</span>
        </CheckRow>
        <CheckRow checked={c2} onChange={setC2}>
          {CONSENT_MARKETING}
          <span className="ev-join-tag ev-join-tag--opt">Facultatif</span>
        </CheckRow>
      </div>

      <FormError>{error}</FormError>
      <button type="submit" className="ev-btn ev-btn--red" disabled={pending || pseudoStatus === 'error'}>
        {pending ? 'Inscription…' : cta} <ArrowRight aria-hidden />
      </button>
      <p className="ev-join-switch">
        Ce n’est pas vous ?{' '}
        <button
          type="button"
          onClick={() => start(async () => { await logoutArena(); router.refresh(); })}
        >
          Changer de compte
        </button>
      </p>
    </form>
  );
}
