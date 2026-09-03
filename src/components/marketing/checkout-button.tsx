'use client';

/**
 * Bouton de checkout Stripe pour une formule.
 *
 * Champs : Prénom, Nom, Email, Téléphone, Spécialité (MG only pour
 * l'instant), Voie interne / Voie externe (Intensive uniquement),
 * Toggle 1x/3x/4x, Checkbox RGPD obligatoire.
 *
 * Appelle /api/stripe/checkout puis redirige vers Stripe Checkout.
 */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle, ArrowRight, Calendar, Check, CheckCircle2,
  GitFork, Loader2, Lock, LogIn, Mail, Phone, ShieldCheck, Sparkles,
  Stethoscope, User, UserCheck,
} from 'lucide-react';
import type { FormuleId } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/client';
import { ENROLLABLE_SPECIALTY_NAMES, isContentPendingSpecialty } from '@/lib/data/enrollable-colleges';
import { CONTENT_PENDING_NOTICE } from '@/lib/stripe/approfondi';
import { TurnstileWidget } from './turnstile-widget';

type ProfileRow = {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  permission_scope: Record<string, any> | null;
};

/** Le captcha est requis côté UI uniquement si la clé publique est configurée. */
const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type Color = { deep: string; main: string };
const DEFAULT_COLOR: Color = { deep: '#8B0E22', main: '#C0112E' };

type Props = {
  formuleId: FormuleId;
  /** Libellé du bouton final. */
  label?: string;
  /** Couleur principale du bouton (gradient deep → main). */
  color?: Color;
  /** Offre Approfondi choisie (ex. 'mg-plus'). Quand fournie, la spécialité et le
   *  prix viennent de l'offre → on masque le sélecteur de spécialité interne. */
  approfondiVariant?: string;
  /** Spécialité choisie en amont dans le tunnel d'inscription (pop-up →
   *  page spécialité → formule). Présélectionne le champ ; le candidat reste
   *  libre d'en changer ici. Ignorée si le libellé n'est pas inscriptible. */
  initialSpecialty?: string;
  /** Notifie le parent de la spécialité sélectionnée (au montage puis à chaque
   *  changement), pour que le récapitulatif affiché à côté du formulaire décrive
   *  la spécialité réellement achetée et non un libellé figé. */
  onSpecialtyChange?: (specialty: string) => void;
};

// Spécialités inscriptibles = collèges présents sur la plateforme pédagogique.
// Le prix ne change pas selon la spécialité ; le choix débloque le collège
// correspondant (permissions).
const SPECIALTIES = ENROLLABLE_SPECIALTY_NAMES;
const VOIES = [
  { value: 'interne', label: 'Voie interne (QCM)' },
  { value: 'externe', label: 'Voie externe (Questions ouvertes)' },
] as const;

export function CheckoutButton({
  formuleId,
  label = 'Procéder au paiement sécurisé',
  color = DEFAULT_COLOR,
  approfondiVariant,
  initialSpecialty,
  onSpecialtyChange,
}: Props) {
  // Parcours Approfondi : la spécialité est portée par l'offre choisie en amont
  // (catalogue Approfondi) → on masque le sélecteur de spécialité interne.
  const isApprofondiFlow = !!approfondiVariant;
  // Voie de concours (interne / externe) demandée pour toutes les formules
  // payantes : elle détermine l'accès aux séries de Médecine générale
  // (interne → pas de QROC ; externe → pas de QCM/DP hors « Révisions »).
  const needsVoie = formuleId === 'intensive' || formuleId === 'essentielle' || formuleId === 'programme-approfondi';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState<string>(
    initialSpecialty && SPECIALTIES.includes(initialSpecialty) ? initialSpecialty : SPECIALTIES[0],
  );
  const [voie, setVoie] = useState<string>('');
  const [installments, setInstallments] = useState<1 | 3 | 4>(1);
  // Deux cases, toutes deux obligatoires (demande de Cyril, 03/09/2026) :
  //  - CGU + CGS ;
  //  - Conditions Particulières.
  // Les documents intègrent en clair le consentement à l'exécution immédiate
  // et la renonciation au délai de rétractation (art. L. 221-28, 1° CC) — voir
  // notamment CGS §10.1 et Conditions Particulières §Observations. Les deux
  // cases cochées valent acceptation de ces stipulations contractuelles.
  const [acceptCguCgs, setAcceptCguCgs] = useState(false);
  const [acceptCp, setAcceptCp] = useState(false);
  const acceptTerms = acceptCguCgs && acceptCp;
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Remonte la spécialité sélectionnée au parent (récapitulatif « Ce qui est
  // inclus »). Passage par une ref : le parent peut passer une lambda inline
  // sans que l'effet se redéclenche à chaque rendu.
  const notifySpecialty = useRef(onSpecialtyChange);
  useEffect(() => {
    notifySpecialty.current = onSpecialtyChange;
  });
  useEffect(() => {
    if (isApprofondiFlow) return;
    notifySpecialty.current?.(specialty);
  }, [specialty, isApprofondiFlow]);

  // ── Mise à niveau Découverte → payant via connexion ──────────────
  // Si l'étudiant est connecté (ou se connecte), on pré-remplit et verrouille
  // ses informations : il ne lui reste qu'à choisir le mode de paiement et
  // accepter les conditions. Aucun nouveau compte, aucune ressaisie.
  const [accountMode, setAccountMode] = useState(false);
  const [accountLabel, setAccountLabel] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  /** Pré-remplit + verrouille le formulaire à partir du profil connecté. */
  async function applyAccount(
    supabase: ReturnType<typeof createClient>,
    user: { id: string; email?: string | null },
  ) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('first_name, last_name, email, phone, permission_scope')
      .eq('id', user.id)
      .maybeSingle<ProfileRow>();
    const ps = (prof?.permission_scope ?? {}) as Record<string, unknown>;
    const signup = (ps.signup ?? {}) as Record<string, unknown>;
    setFirstName(prof?.first_name ?? '');
    setLastName(prof?.last_name ?? '');
    setEmail(prof?.email ?? user.email ?? '');
    setPhone(prof?.phone ?? '');
    const existingVoie = (signup.voie ?? ps.paid_voie ?? '') as string;
    if (existingVoie) setVoie(existingVoie);
    const label =
      `${prof?.first_name ?? ''} ${prof?.last_name ?? ''}`.trim() ||
      (prof?.email ?? user.email ?? '');
    setAccountLabel(label);
    setAccountMode(true);
    setShowLogin(false);
  }

  // Au montage : si une session existe déjà, on bascule en mode « connecté ».
  useEffect(() => {
    let cancelled = false;
    try {
      const supabase = createClient();
      supabase.auth
        .getUser()
        .then(({ data }) => {
          if (cancelled || !data.user) return;
          void applyAccount(supabase, data.user);
        })
        .catch(() => {});
    } catch {
      // Supabase non configuré (env absente) : le formulaire reste en mode invité.
    }
    return () => {
      cancelled = true;
    };
    // applyAccount n'utilise que des setters stables — montage unique.
  }, []);

  /** Connexion inline (encart « Vous avez déjà un compte ? »). */
  async function handleLogin() {
    setLoginError(null);
    if (!loginEmail || !loginPassword) {
      setLoginError('Email et mot de passe requis.');
      return;
    }
    setLoginLoading(true);
    try {
      const supabase = createClient();
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (err || !data.user) {
        setLoginError(
          err?.message === 'Invalid login credentials'
            ? 'Email ou mot de passe incorrect.'
            : err?.message ?? 'Connexion impossible.',
        );
        return;
      }
      await applyAccount(supabase, data.user);
      setLoginEmail('');
      setLoginPassword('');
    } catch {
      setLoginError('Erreur réseau, réessayez.');
    } finally {
      setLoginLoading(false);
    }
  }

  /** Quitte le mode « connecté » sans déconnecter du site : permet de saisir
   *  une autre identité (création d'un nouveau compte). */
  function exitAccountMode() {
    setAccountMode(false);
    setAccountLabel('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setVoie('');
  }

  /** Validation locale du formulaire puis redirection directe vers le paiement. */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      setError('Merci de renseigner prénom, nom et email.');
      return;
    }
    if (!phone.trim()) {
      setError('Le numéro de téléphone est obligatoire pour une offre payante.');
      return;
    }
    if (needsVoie && !voie) {
      setError('Merci de choisir votre voie de concours (interne ou externe).');
      return;
    }
    if (!acceptCguCgs) {
      setError('Vous devez accepter les CGU et les CGS pour continuer.');
      return;
    }
    if (!acceptCp) {
      setError('Vous devez accepter les Conditions Particulières pour continuer.');
      return;
    }
    if (TURNSTILE_ENABLED && !captchaToken) {
      setError('Merci de valider le test anti-robot.');
      return;
    }
    setError(null);
    void handleCheckout();
  }

  /** Crée la session Stripe et redirige vers le paiement. */
  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formule: formuleId,
          approfondiVariant,
          email,
          firstName,
          lastName,
          phone,
          specialty,
          voie: needsVoie ? voie : '',
          installments,
          consents: {
            // Deux cases côté UI (CGU + CGS, puis CP) ; côté serveur un flag
            // par document + renonciation rétractation, cette dernière étant
            // intégrée dans les CGS et Conditions Particulières acceptées
            // (CGS §10.1 et CP).
            cgu: acceptCguCgs,
            cgs: acceptCguCgs,
            cp: acceptCp,
            waiveRetractation: acceptTerms,
            timestamp: new Date().toISOString(),
          },
          turnstileToken: captchaToken,
        }),
      });
      const j = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !j.url) {
        setError(j.error ?? 'Erreur lors de la création de la session de paiement.');
        setCaptchaToken('');
        setCaptchaNonce((n) => n + 1);
        setLoading(false);
        return;
      }
      window.location.href = j.url;
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Erreur réseau');
      setCaptchaToken('');
      setCaptchaNonce((n) => n + 1);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {/* Mise à niveau : connexion pour pré-remplir (compte Découverte → payant) */}
      {accountMode ? (
        <div
          className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5"
          style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}
        >
          <span className="flex items-center gap-2 text-[12.5px] font-semibold" style={{ color: '#15803D' }}>
            <UserCheck className="h-4 w-4 shrink-0" />
            <span className="truncate">Connecté : {accountLabel}</span>
          </span>
          <button
            type="button"
            onClick={exitAccountMode}
            className="shrink-0 text-[11.5px] font-semibold underline"
            style={{ color: '#7A8499' }}
          >
            Ce n&rsquo;est pas vous&nbsp;?
          </button>
        </div>
      ) : (
        <div className="rounded-xl border px-3 py-2.5" style={{ background: '#FAFBFD', borderColor: '#E5E9F0' }}>
          {!showLogin ? (
            <button
              type="button"
              onClick={() => setShowLogin(true)}
              className="flex w-full items-center justify-center gap-2 text-[12.5px] font-semibold"
              style={{ color: color.main }}
            >
              <LogIn className="h-4 w-4" />
              Vous avez déjà un compte&nbsp;? Connectez-vous pour aller plus vite
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-[12px] font-extrabold" style={{ color: '#0F1F4D' }}>
                Connexion à votre compte Major ECN
              </p>
              <Input icon={Mail} type="email" placeholder="Adresse email" value={loginEmail} onChange={setLoginEmail} />
              <Input icon={Lock} type="password" placeholder="Mot de passe" value={loginPassword} onChange={setLoginPassword} />
              {loginError && (
                <p className="text-[11.5px] font-medium" style={{ color: '#C0112E' }}>{loginError}</p>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={loginLoading}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[12.5px] font-extrabold text-white disabled:opacity-60"
                  style={{ background: color.main }}
                >
                  {loginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                  {loginLoading ? 'Connexion…' : 'Se connecter'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowLogin(false); setLoginError(null); }}
                  className="text-[11.5px] font-semibold underline"
                  style={{ color: '#7A8499' }}
                >
                  Annuler
                </button>
              </div>
              <p className="text-[11px]" style={{ color: '#7A8499' }}>
                Pas encore de compte&nbsp;? Remplissez simplement le formulaire ci-dessous.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Section IDENTITÉ */}
      <SectionLabel n={1} title="Vos informations" />
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <Input icon={User} placeholder="Prénom" value={firstName} onChange={setFirstName} required locked={accountMode && !!firstName} />
        <Input icon={User} placeholder="Nom" value={lastName} onChange={setLastName} required locked={accountMode && !!lastName} />
      </div>
      <Input icon={Mail} type="email" placeholder="Adresse email" value={email} onChange={setEmail} required locked={accountMode && !!email} />
      <Input icon={Phone} type="tel" placeholder="Téléphone" value={phone} onChange={setPhone} required locked={accountMode && !!phone} />

      {/* Section PRÉPARATION */}
      <SectionLabel n={2} title="Votre préparation" />
      {/* Spécialité : masquée en parcours Approfondi (portée par l'offre choisie). */}
      {!isApprofondiFlow && (
        <>
          <Select
            icon={Stethoscope}
            value={specialty}
            onChange={setSpecialty}
            options={SPECIALTIES.map((s) => ({ value: s, label: s }))}
          />
          {/* Spécialité dont les contenus ne sont pas encore publiés :
              l'étudiant doit le savoir AVANT de payer. Même texte que dans le
              tunnel Approfondi, et repris sur la page de paiement Stripe. */}
          {isContentPendingSpecialty(specialty) && (
            <div
              className="flex items-start gap-2.5 rounded-xl border px-3.5 py-3"
              style={{ borderColor: '#F5C86B', background: '#FFF8EA' }}
            >
              <AlertTriangle className="mt-px h-4 w-4 shrink-0" style={{ color: '#B26A00' }} />
              <div>
                <p className="text-[13px] font-extrabold" style={{ color: '#8A5200' }}>
                  Contenus en cours de mise en ligne
                </p>
                <p className="mt-0.5 text-[12.5px] leading-snug" style={{ color: '#5B6478' }}>
                  {CONTENT_PENDING_NOTICE}
                </p>
              </div>
            </div>
          )}
        </>
      )}
      {/* Voie interne / externe — Formules Intensive et Essentielle.
          Le parcours pédagogique diffère selon le format de concours
          du candidat. */}
      {needsVoie && (
        <Select
          icon={GitFork}
          value={voie}
          onChange={setVoie}
          disabled={accountMode && !!voie}
          options={[
            { value: '', label: 'Choisissez votre voie de concours' },
            ...VOIES.map((v) => ({ value: v.value, label: v.label })),
          ]}
        />
      )}

      {/* Section PAIEMENT */}
      <SectionLabel n={3} title="Mode de paiement" />
      <fieldset className="rounded-2xl border bg-white p-3" style={{ borderColor: '#E5E9F0' }}>
        <legend className="sr-only">Choisir le nombre de mensualités</legend>
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: 1 as const, l: 'Comptant', sub: '1 paiement' },
            { v: 3 as const, l: '3 fois', sub: 'mensualité' },
            { v: 4 as const, l: '4 fois', sub: 'mensualité' },
          ].map((opt) => {
            const active = installments === opt.v;
            return (
              <button
                key={opt.v}
                type="button"
                onClick={() => setInstallments(opt.v)}
                className="rounded-xl px-2 py-2.5 text-center transition-colors"
                style={{
                  background: active ? color.main : 'white',
                  color: active ? 'white' : '#0F1F4D',
                  border: `1.5px solid ${active ? color.main : '#E5E9F0'}`,
                }}
              >
                <p className="text-[13px] font-extrabold leading-none">{opt.l}</p>
                <p className="mt-1 text-[10.5px] font-medium opacity-80">{opt.sub}</p>
              </button>
            );
          })}
        </div>
        <p className="mt-2.5 flex items-center gap-1.5 text-[11px]" style={{ color: '#7A8499' }}>
          <Calendar className="h-3 w-3" />
          Paiement en plusieurs fois sans frais (cartes Visa / Mastercard éligibles)
        </p>
      </fieldset>

      {/* Consentement — deux cases obligatoires. L'acceptation des CGS et
          des Conditions Particulières emporte consentement à l'exécution
          immédiate (CGS §10.1, CP §Observations). */}
      <SectionLabel n={4} title="Confirmation" />

      <ConsentCheckbox
        checked={acceptCguCgs}
        onChange={setAcceptCguCgs}
        accent={color.main}
        text={
          <>
            J&rsquo;accepte les{' '}
            <Link href="/cgu" target="_blank" rel="noopener" className="font-semibold underline" style={{ color: color.main }}>CGU</Link>
            {' '}et les{' '}
            <Link href="/cgs" target="_blank" rel="noopener" className="font-semibold underline" style={{ color: color.main }}>CGS</Link>
            {' '}de Major ECN.
          </>
        }
      />
      <ConsentCheckbox
        checked={acceptCp}
        onChange={setAcceptCp}
        accent={color.main}
        text={
          <>
            J&rsquo;accepte les{' '}
            <Link href="/conditions-particulieres" target="_blank" rel="noopener" className="font-semibold underline" style={{ color: color.main }}>Conditions Particulières</Link>
            {' '}de Major ECN.
          </>
        }
      />

      {/* Captcha anti-robot (Cloudflare Turnstile) */}
      {TURNSTILE_ENABLED && (
        <div className="flex justify-center">
          <TurnstileWidget key={captchaNonce} onVerify={setCaptchaToken} />
        </div>
      )}

      {/* CTA */}
      <button
        type="submit"
        disabled={loading}
        className="relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-6 py-4 text-[15.5px] font-extrabold text-white shadow-[0_14px_35px_-15px_rgba(192,17,46,0.6)] transition-transform hover:scale-[1.01] disabled:opacity-60"
        style={{ background: `linear-gradient(90deg, ${color.deep} 0%, ${color.main} 100%)` }}
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
        <span>{loading ? 'Redirection vers le paiement…' : label}</span>
        {!loading && <ArrowRight className="h-5 w-5" />}
      </button>

      {error && (
        <p role="alert" className="rounded-xl border bg-[#FEF2F2] px-3 py-2.5 text-[12.5px] font-medium" style={{ color: '#C0112E', borderColor: '#FECACA' }}>
          {error}
        </p>
      )}

      {/* TRUST badges sous le bouton */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { Icon: ShieldCheck, t: 'Paiement sécurisé', s: '256-bit SSL' },
          { Icon: Lock,        t: 'Stripe certifié',   s: 'PCI DSS' },
          { Icon: CheckCircle2, t: 'Données chiffrées', s: 'AES-256' },
        ].map((b) => (
          <div key={b.t} className="flex flex-col items-center rounded-xl border p-2.5 text-center" style={{ borderColor: '#E5E9F0', background: '#FAFBFD' }}>
            <b.Icon className="h-4 w-4" style={{ color: color.main }} />
            <p className="mt-1 text-[10.5px] font-extrabold leading-tight" style={{ color: '#0F1F4D' }}>{b.t}</p>
            <p className="text-[9.5px] leading-tight" style={{ color: '#7A8499' }}>{b.s}</p>
          </div>
        ))}
      </div>

      {/* Stripe powered */}
      <p className="flex items-center justify-center gap-1.5 text-[11px]" style={{ color: '#7A8499' }}>
        <Sparkles className="h-3 w-3" style={{ color: color.main }} />
        Paiement traité par <strong style={{ color: '#635BFF' }}>Stripe</strong> · Aucune carte stockée chez nous
      </p>
    </form>
  );
}

/* ============================================================ */
function ConsentCheckbox({
  checked,
  onChange,
  accent,
  text,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  accent: string;
  text: React.ReactNode;
}) {
  return (
    <label
      className="flex cursor-pointer items-start gap-2.5 rounded-xl border bg-white p-3"
      style={{ borderColor: checked ? accent : '#E5E9F0' }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded"
        style={{ accentColor: accent }}
      />
      <span className="text-[12px] leading-relaxed" style={{ color: '#1F2937' }}>{text}</span>
    </label>
  );
}

function SectionLabel({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0F1F4D] text-[10px] font-extrabold text-white">{n}</span>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ color: '#0F1F4D' }}>{title}</p>
      <span className="h-px flex-1 bg-[#E5E9F0]" />
    </div>
  );
}

function Input({
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  required,
  locked,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  /** Champ pré-rempli depuis le compte connecté : lecture seule. */
  locked?: boolean;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#7A8499' }} />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        readOnly={locked}
        aria-readonly={locked}
        tabIndex={locked ? -1 : undefined}
        className={`w-full rounded-xl border py-3 pl-10 text-[13.5px] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 ${locked ? 'cursor-not-allowed pr-9' : 'pr-3'}`}
        style={{
          borderColor: '#E5E9F0',
          background: locked ? '#F1F5F9' : 'white',
          color: locked ? '#475569' : '#1F2937',
          // @ts-expect-error custom CSS prop
          '--tw-ring-color': '#C0112E',
        }}
      />
      {locked && (
        <Lock className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: '#94A3B8' }} />
      )}
    </div>
  );
}

function Select({
  icon: Icon,
  value,
  onChange,
  options,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  /** Pré-rempli depuis le compte connecté : non modifiable. */
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#7A8499' }} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full appearance-none rounded-xl border py-3 pl-10 pr-9 text-[13.5px] focus:outline-none focus:ring-2 ${disabled ? 'cursor-not-allowed' : ''}`}
        style={{
          borderColor: '#E5E9F0',
          background: disabled ? '#F1F5F9' : 'white',
          color: value ? (disabled ? '#475569' : '#1F2937') : '#94A3B8',
          // @ts-expect-error custom CSS prop
          '--tw-ring-color': '#C0112E',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {disabled ? (
        <Lock className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: '#94A3B8' }} />
      ) : (
        <Check className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 opacity-50" />
      )}
    </div>
  );
}
