'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { AvatarAtelier } from '@/components/avatar/avatar-atelier';
import { avatarsPris, checkPseudo, registerParticipant } from '@/app/(arena)/arena/[slug]/actions';
import { CONSENT_MARKETING, CONSENT_TOURNAMENT } from '@/lib/arena/texts';
import { browserTimezone } from '@/lib/arena/time';
import { avatarAuHasard, avatarDepuisChaine } from '@/lib/avatars/traits';
import { ArenaButton, ARENA, BODY } from './arena-ui';
import { CheckRow, Field, FormError, SelectInput, TextInput, type FieldStatus } from './form-ui';

/**
 * Formulaire d'inscription (§3, maquette « 1. Inscription » + « 2. Modération
 * pseudonyme ») : prénom, nom, email, spécialité, pseudonyme obligatoires ;
 * médaillon composé en quatre étapes ; deux cases de consentement
 * distinctes, jamais
 * pré-cochées. Pas de numéro de téléphone. Le pseudonyme est vérifié en
 * direct (mots interdits, format, disponibilité).
 */
/** Personnage affiché le temps que le navigateur en tire un au hasard. */
const AVATAR_DEPART = avatarDepuisChaine('evc-arena', 'arena');

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
  const [seed, setSeed] = useState('');
  const [dispo, setDispo] = useState<'inconnu' | 'verification' | 'libre' | 'pris'>('inconnu');
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const checkRef = useRef(0);

  // Sélection initiale tirée au sort côté navigateur : un rendu serveur
  // aléatoire ferait diverger l'hydratation.
  useEffect(() => {
    const t = window.setTimeout(() => setSeed(avatarAuHasard(Math.random, 'arena')), 0);
    return () => window.clearTimeout(t);
  }, []);

  /**
   * Médaillons déjà pris, parmi ceux que l'atelier propose à sa dernière
   * étape. La réponse ne porte que sur les codes demandés : elle ne dit rien
   * du nombre d'inscrits (§7 — aucun effectif, nulle part).
   */
  const verifierDisponibilite = useCallback(async (codes: string[]) => {
    const r = await avatarsPris(slug, codes);
    return r.ok ? r.pris : [];
  }, [slug]);

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

  // Avant le tirage côté navigateur, un personnage FIXE : un tirage au rendu
  // ferait diverger l'hydratation et changerait d'avatar à chaque frappe.
  const avatarSeed = seed || AVATAR_DEPART;

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
          try {
            const r = await registerParticipant(slug, {
              firstName, lastName, email, specialty, pseudo, avatarSeed,
              consentTournament: true, consentMarketing: c2,
              timezone: browserTimezone(), source, utm, inviteCode,
            });
            if (!r.ok) {
              setError(r.error);
              return;
            }
            const e = encodeURIComponent(email.trim().toLowerCase());
            if (r.alreadyConfirmed) {
              // L'écran indique comment retrouver l'accès sans promettre un nouvel envoi en cas de délai de renvoi.
              router.push(`/arena/connexion?deja=1&e=${e}`);
              return;
            }
            router.push(`/arena/${slug}/confirmez-votre-email?e=${e}${r.alreadyPending ? '&deja=1' : ''}`);
          } catch {
            setError('La demande a été interrompue. Vérifiez votre messagerie : si votre inscription est enregistrée, vous pouvez aussi retrouver votre accès depuis « Se connecter ».');
          }
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Prénom" htmlFor="r-first" required><TextInput id="r-first" required autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></Field>
        <Field label="Nom" htmlFor="r-last" required><TextInput id="r-last" required autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
        <Field label="Email" htmlFor="r-email" required hint="Un lien de confirmation vous sera envoyé : il authentifie votre compte.">
          <TextInput id="r-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom.nom@exemple.fr" />
        </Field>
        <Field label="Spécialité" htmlFor="r-spe" required>
          <SelectInput id="r-spe" required value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
            {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
          </SelectInput>
        </Field>
      </div>

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
        <p className="mb-2 text-[12px] font-semibold" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Votre personnage pour toute l’Arena</p>
        <p className="mb-4 text-xs leading-relaxed" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Composez votre médaillon en quatre étapes : portrait, fond, cadre, emblème. Vous le conserverez toute l’Arena ; sa couronne Or, Argent, Bronze ou Standard dépendra uniquement de votre classement cumulé actuel. <strong style={{ color: ARENA.textSoft }}>Deux participants ne portent jamais le même médaillon : à la dernière étape, ceux qui sont déjà pris apparaissent grisés.</strong></p>
        <AvatarAtelier
          valeur={avatarSeed}
          onChange={setSeed}
          theme="arena"
          perimetre="arena"
          verifierDisponibilite={verifierDisponibilite}
          onDisponibilite={setDispo}
          legende="Votre médaillon tel qu’il apparaîtra dans le classement."
        />

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
      {/* Le médaillon est vérifié à la dernière étape de l'atelier : on ne
          laisse pas partir une inscription vers un avatar déjà pris. */}
      <ArenaButton type="submit" size="lg" disabled={pending || dispo === 'pris' || dispo === 'verification'} className="w-full">
        {pending ? 'Inscription…' : 'Je m’inscris'}
      </ArenaButton>
      {dispo === 'pris' && (
        <p role="status" className="text-center text-[12px] font-semibold" style={{ color: ARENA.redSoft, fontFamily: BODY }}>
          Choisissez un médaillon disponible à la dernière étape pour poursuivre.
        </p>
      )}
      <p className="text-center text-[13px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
        Déjà inscrit ? <Link href="/arena/connexion" className="font-semibold underline-offset-4 hover:underline" style={{ color: ARENA.redSoft }}>Se connecter</Link>
      </p>
      <p className="text-center text-[11.5px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Aucun numéro de téléphone demandé pour simplifier votre inscription.</p>
    </form>
  );
}
