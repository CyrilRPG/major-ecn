'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, RefreshCw } from 'lucide-react';
import { DrawnAvatar } from '@/components/avatar/drawn-avatar';
import { checkPseudo, registerParticipant } from '@/app/(arena)/arena/[slug]/actions';
import { CONSENT_MARKETING, CONSENT_TOURNAMENT } from '@/lib/arena/texts';
import { browserTimezone } from '@/lib/arena/time';
import { randomAvatarSeed } from '@/lib/arena/types';
import { ArenaButton, ARENA, BODY } from './arena-ui';
import { CheckRow, Field, FormError, SelectInput, TextInput, type FieldStatus } from './form-ui';

/**
 * Formulaire d'inscription (§3, maquette « 1. Inscription » + « 2. Modération
 * pseudonyme ») : prénom, nom, email, spécialité, pseudonyme obligatoires ;
 * avatar au choix parmi six ; deux cases de consentement distinctes, jamais
 * pré-cochées. Pas de numéro de téléphone. Le pseudonyme est vérifié en
 * direct (mots interdits, format, disponibilité).
 */
const PSEUDO_RULES = [
  'Pas de mots interdits',
  'Pas de marques ou structures concurrentes',
  'Respect et bienveillance',
  'Un pseudonyme modifiable à tout moment par l’administrateur en cas de besoin',
];

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
  const [pseudoStatus, setPseudoStatus] = useState<FieldStatus>(null);
  const [pseudoMsg, setPseudoMsg] = useState<string | null>(null);
  const [seeds, setSeeds] = useState<string[]>([]);
  const [seed, setSeed] = useState('');
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const checkRef = useRef(0);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const s = Array.from({ length: 6 }, () => randomAvatarSeed());
      setSeeds(s);
      setSeed(s[0]);
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  // Vérification du pseudonyme en direct (débordement 400 ms, dernière réponse gagnante).
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
    }, 400);
    return () => window.clearTimeout(t);
  }, [pseudo, slug]);

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
        <Field label="Prénom" htmlFor="r-first" required><TextInput id="r-first" required autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></Field>
        <Field label="Nom" htmlFor="r-last" required><TextInput id="r-last" required autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} /></Field>
      </div>
      <Field label="Email" htmlFor="r-email" required hint="Un lien de confirmation vous sera envoyé : il authentifie votre compte.">
        <TextInput id="r-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom.nom@exemple.fr" />
      </Field>
      <Field label="Spécialité" htmlFor="r-spe" required>
        <SelectInput id="r-spe" required value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
          {specialties.map((s) => <option key={s} value={s} style={{ color: '#111' }}>{s}</option>)}
        </SelectInput>
      </Field>

      <div>
        <Field
          label="Pseudonyme" htmlFor="r-pseudo" required
          hint="Seul élément d’identité affiché publiquement. 3 à 24 caractères."
          ok={pseudoStatus === 'ok' ? pseudoMsg : null}
          error={pseudoStatus === 'error' ? pseudoMsg : null}
        >
          <TextInput id="r-pseudo" required minLength={3} maxLength={24} value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder="ex. Interniste75" status={pseudoStatus} autoComplete="off" />
        </Field>
        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {PSEUDO_RULES.map((r) => (
            <li key={r} className="flex items-start gap-2 text-[12px] leading-snug" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: ARENA.ok }} strokeWidth={3} /> {r}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-[12px] font-semibold" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Avatar <span style={{ color: ARENA.textMuted }}>(facultatif)</span></p>
        <div className="flex flex-wrap items-center gap-2.5">
          {seeds.map((s) => {
            const on = s === seed;
            return (
              <button key={s} type="button" onClick={() => setSeed(s)} aria-pressed={on} aria-label="Choisir cet avatar" className="rounded-full p-0.5 transition-transform hover:scale-105" style={{ boxShadow: on ? `0 0 0 2.5px ${ARENA.red}, 0 0 20px rgba(228,0,43,0.5)` : `0 0 0 1.5px ${ARENA.lineStrong}` }}>
                <DrawnAvatar seed={s} size={44} />
              </button>
            );
          })}
          <button type="button" onClick={() => { const s = Array.from({ length: 6 }, () => randomAvatarSeed()); setSeeds(s); setSeed(s[0]); }} className="ml-1 inline-flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
            <RefreshCw className="h-3.5 w-3.5" /> Autres avatars
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[12px] font-semibold" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Vos consentements</p>
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
      <ArenaButton type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? 'Inscription…' : 'Je m’inscris'}
      </ArenaButton>
      <p className="text-center text-[13px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
        Déjà inscrit ? <Link href="/arena/connexion" className="font-semibold underline-offset-4 hover:underline" style={{ color: ARENA.redSoft }}>Se connecter</Link>
      </p>
      <p className="text-center text-[11.5px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Aucun numéro de téléphone demandé pour simplifier votre inscription.</p>
    </form>
  );
}
