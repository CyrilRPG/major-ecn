'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { DrawnAvatar } from '@/components/avatar/drawn-avatar';
import { registerParticipant } from '@/app/(arena)/arena/[slug]/actions';
import { CONSENT_MARKETING, CONSENT_TOURNAMENT } from '@/lib/arena/texts';
import { browserTimezone } from '@/lib/arena/time';
import { randomAvatarSeed } from '@/lib/arena/types';
import { ArenaButton, ARENA, BODY, DISPLAY } from './arena-ui';
import { CheckRow, Field, FormError, SelectInput, TextInput } from './form-ui';

/**
 * Formulaire d'inscription (§3) : prénom, nom, email, spécialité, pseudonyme
 * obligatoires ; avatar facultatif ; deux cases de consentement distinctes,
 * jamais pré-cochées. Pas de numéro de téléphone.
 */
export function RegisterForm({
  slug, specialties, defaultSpecialty, inviteCode, source, utm,
}: {
  slug: string;
  specialties: string[];
  defaultSpecialty: string;
  inviteCode: string | null;
  source: string | null;
  utm: Record<string, string> | null;
}) {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState(defaultSpecialty);
  const [pseudo, setPseudo] = useState('');
  const [seed, setSeed] = useState('');
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    const t = window.setTimeout(() => setSeed(randomAvatarSeed()), 0);
    return () => window.clearTimeout(t);
  }, []);

  const avatarSeed = seed || 'arena';

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        if (!c1) {
          setError('Le consentement au traitement des données est obligatoire pour participer.');
          return;
        }
        start(async () => {
          const r = await registerParticipant(slug, {
            firstName, lastName, email, specialty, pseudo, avatarSeed,
            consentTournament: true, consentMarketing: c2,
            timezone: browserTimezone(), source, utm, inviteCode,
          });
          if (!r.ok) {
            setError(r.error);
            return;
          }
          if (r.alreadyConfirmed) {
            router.push('/arena/connexion');
            return;
          }
          router.push(`/arena/${slug}/confirmez-votre-email?e=${encodeURIComponent(email.trim().toLowerCase())}`);
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Prénom" htmlFor="r-first"><TextInput id="r-first" required autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></Field>
        <Field label="Nom" htmlFor="r-last"><TextInput id="r-last" required autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} /></Field>
      </div>
      <Field label="Adresse email" htmlFor="r-email" hint="Un lien de confirmation vous sera envoyé. Il authentifie votre compte.">
        <TextInput id="r-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Spécialité" htmlFor="r-spe">
        <SelectInput id="r-spe" required value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
          {specialties.map((s) => <option key={s} value={s} style={{ color: '#111' }}>{s}</option>)}
        </SelectInput>
      </Field>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <Field label="Pseudonyme" htmlFor="r-pseudo" hint="Seul élément d’identité affiché publiquement. 3 à 24 caractères.">
          <TextInput id="r-pseudo" required minLength={3} maxLength={24} value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder="ex. Interniste75" />
        </Field>
        <div className="flex items-center gap-3 sm:pb-6">
          <span className="rounded-full" style={{ boxShadow: `0 0 0 2px ${ARENA.lineStrong}` }}><DrawnAvatar seed={avatarSeed} size={56} title="Votre avatar" /></span>
          <button type="button" onClick={() => setSeed(randomAvatarSeed())} className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
            <RefreshCw className="h-3.5 w-3.5" /> Autre avatar
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Vos consentements</p>
        <CheckRow checked={c1} onChange={setC1}>
          {CONSENT_TOURNAMENT}{' '}
          <a href="/confidentialite" target="_blank" rel="noreferrer" className="underline underline-offset-4" style={{ color: ARENA.text }}>(lien vers la politique de confidentialité)</a>
          <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: ARENA.redSoft }}>Obligatoire</span>
        </CheckRow>
        <CheckRow checked={c2} onChange={setC2}>
          {CONSENT_MARKETING}
          <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: ARENA.textMuted }}>Facultatif</span>
        </CheckRow>
      </div>

      <FormError>{error}</FormError>
      <ArenaButton type="submit" disabled={pending} className="w-full">
        {pending ? 'Inscription…' : 'Créer mon inscription'}
      </ArenaButton>
      <p className="text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
        Déjà inscrit(e) ? <Link href="/arena/connexion" className="font-bold underline-offset-4 hover:underline" style={{ color: ARENA.textSoft, fontFamily: DISPLAY }}>Recevoir un lien de connexion</Link>
      </p>
    </form>
  );
}
