'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Calendar, Check, ClipboardCheck, GraduationCap, Info, Mail, MapPin,
  Phone, Rocket, Route, Shield, Sparkles, Stethoscope, Tag, User,
} from 'lucide-react';
import { MeshGradient, NoiseTexture } from './premium-ui';
import { TurnstileWidget } from './turnstile-widget';

const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const NAVY = '#0F1F4D';
const NAVY_DEEP = '#091135';
const INK = '#1F2937';
const INK_SOFT = '#52607A';
const PURPLE = '#7C3AED';
const PURPLE_BG = '#F1E8FD';
const GREEN = '#16793C';
const GOLD = '#F5C84B';
const BORDER = '#E5E9F0';

/** Le captcha est requis côté UI uniquement si la clé publique est configurée. */
const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/** Spécialité « Médecine générale » — déclenche le champ Voie interne/externe. */
const MG_NAME = 'Médecine générale';

/* Liste EXACTE des spécialités de /specialites (specialites-page.tsx),
 * dans le même ordre (par famille). À garder synchronisée. */
const SPECIALITES = [
  'Médecine générale',
  'Cardiologie et maladies vasculaires',
  'Pneumologie',
  'Gastro-entérologie et hépatologie',
  'Endocrinologie et métabolisme',
  'Néphrologie',
  'Neurologie',
  'Hématologie',
  'Rhumatologie',
  'Dermatologie et vénéréologie',
  'Oncologie',
  'Médecine interne',
  'Réanimation médicale',
  'Gériatrie',
  'Médecine physique et de réadaptation',
  'Médecine du travail',
  'Psychiatrie',
  'Anesthésie-réanimation',
  'Gynécologie médicale',
  'Santé publique et médecine sociale',
  'Chirurgie générale',
  'Chirurgie viscérale et digestive',
  'Chirurgie orthopédique et traumatologie',
  'Chirurgie thoracique et cardio-vasculaire',
  'Chirurgie vasculaire',
  'Chirurgie urologique',
  'Neurochirurgie',
  'Chirurgie plastique, reconstructrice et esthétique',
  'Chirurgie maxillo-faciale et stomatologie',
  'Chirurgie infantile',
  'Chirurgie orale',
  'Gynécologie obstétrique',
  'ORL et chirurgie cervico-faciale',
  'Ophtalmologie',
  'Pédiatrie',
  'Radiodiagnostic et imagerie médicale',
  'Médecine nucléaire',
  'Biologie médicale (médecin)',
  'Biologie médicale (pharmacien)',
  'Anatomie et cytologie pathologiques',
  'Génétique médicale',
  'Pharmacie polyvalente',
  'Odontologie',
  'Orthopédie dento-faciale',
  'Sage-femme',
];

const VOIES = ['Voie interne', 'Voie externe'];
const SESSIONS = ['2026', '2027', '2028', '2029', '2030', '2031', '2032'];
const EVC_OPTIONS = ['Oui', 'Non'];
const COUNTRIES = [
  'France', 'Algérie', 'Maroc', 'Tunisie', 'Liban', 'Syrie', 'Égypte', 'Irak',
  'Jordanie', 'Libye', 'Mauritanie', 'Sénégal', 'Cameroun', "Côte d'Ivoire",
  'Mali', 'Congo (RDC)', 'Congo (Brazzaville)', 'Gabon', 'Madagascar', 'Bénin',
  'Burkina Faso', 'Tchad', 'Niger', 'Togo', 'Guinée', 'Djibouti', 'Comores',
  'Haïti', 'Roumanie', 'Moldavie', 'Ukraine', 'Russie', 'Géorgie', 'Arménie',
  'Brésil', 'Colombie', 'Venezuela', 'Chili', 'Argentine', 'Mexique',
  'Iran', 'Afghanistan', 'Pakistan', 'Inde', 'Bangladesh', 'Sri Lanka',
  'Turquie', 'Albanie', 'Kosovo', 'Serbie', 'Bosnie-Herzégovine',
  'Chine', 'Vietnam', 'Cambodge', 'Philippines', 'Autre',
];

export function EspaceDecouverteForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [voie, setVoie] = useState('');
  const [session, setSession] = useState('');
  const [country, setCountry] = useState('');
  const [passedEvc, setPassedEvc] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaNonce, setCaptchaNonce] = useState(0);
  // Anti-spam : honeypot (champ caché rempli uniquement par les bots) +
  // horodatage d'affichage (piège temporel).
  const [hp, setHp] = useState('');
  const [renderedAt] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingAccount, setExistingAccount] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;
    if (!phone.trim()) { setError('Le numéro de téléphone est obligatoire.'); return; }
    if (!specialty) { setError('Veuillez sélectionner votre spécialité visée.'); return; }
    if (specialty === MG_NAME && !voie) { setError('Pour la médecine générale, précisez la voie (interne ou externe).'); return; }
    if (!session) { setError('Veuillez sélectionner la session visée.'); return; }
    if (!country) { setError('Veuillez indiquer votre pays de résidence.'); return; }
    if (!passedEvc) { setError('Indiquez si vous avez déjà passé les EVC.'); return; }
    if (!acceptTerms) { setError('Vous devez accepter les CGU et les CGS pour créer votre compte.'); return; }
    if (TURNSTILE_ENABLED && !captchaToken) { setError('Merci de valider le test anti-robot.'); return; }
    setSubmitting(true);
    setError(null);
    setExistingAccount(false);
    try {
      const res = await fetch('/api/espace-decouverte/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName, lastName, email, phone,
          specialty,
          voie: specialty === MG_NAME ? voie : '',
          session, country, passedEvc,
          consents: { cgu: acceptTerms, cgs: acceptTerms, timestamp: new Date().toISOString() },
          turnstileToken: captchaToken,
          hp,
          elapsedMs: Date.now() - renderedAt,
        }),
      });
      const j = (await res.json()) as {
        ok?: boolean;
        error?: string;
        existingAccount?: boolean;
        redirectTo?: string;
      };
      if (!res.ok || !j.ok) {
        if (j.existingAccount) setExistingAccount(true);
        setError(j.error ?? "Erreur lors de l'inscription. Réessayez.");
        setCaptchaToken('');
        setCaptchaNonce((n) => n + 1);
        setSubmitting(false);
        return;
      }
      {
        const base = j.redirectTo ?? '/espace-decouverte/confirmation';
        const sep = base.includes('?') ? '&' : '?';
        router.push(`${base}${sep}email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur réseau');
      setCaptchaToken('');
      setCaptchaNonce((n) => n + 1);
      setSubmitting(false);
    }
  }

  return (
    <section
      className="relative overflow-hidden py-16 sm:py-24 lg:py-28"
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background:
          `radial-gradient(ellipse 65% 45% at 50% 0%, rgba(192,17,46,0.10) 0%, transparent 60%),` +
          `radial-gradient(ellipse 80% 55% at 50% 100%, rgba(15,31,77,0.08) 0%, transparent 65%),` +
          `linear-gradient(180deg, #FFFFFF 0%, #FBFCFF 40%, #FFFFFF 100%)`,
      }}
    >
      {/* ============ Décor d'arrière-plan premium ============ */}
      <MeshGradient
        colors={[
          'rgba(192,17,46,0.16)',  // bordeaux/red
          'rgba(15,31,77,0.13)',   // navy
          'rgba(124,58,237,0.12)', // violet (cohérence box info)
          'rgba(245,200,75,0.10)', // gold
        ]}
      />
      <NoiseTexture opacity={0.022} />

      {/* Grille subtile en filigrane */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,31,77,1) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(15,31,77,1) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          maskImage:
            'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 75%)',
        }}
      />

      {/* Halos colorés flottants */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full blur-3xl"
        style={{ background: 'rgba(192,17,46,0.18)', animation: 'edcvr-float 14s ease-in-out infinite' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-20 h-96 w-96 rounded-full blur-3xl"
        style={{ background: 'rgba(124,58,237,0.16)', animation: 'edcvr-float 16s ease-in-out infinite reverse' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[30%] top-0 h-64 w-64 rounded-full blur-3xl"
        style={{ background: 'rgba(245,200,75,0.18)', animation: 'edcvr-float 18s ease-in-out infinite' }}
      />

      {/* ============ HEADER section — gros titre dégradé hors carte ============ */}
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <span
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[11.5px] font-extrabold uppercase tracking-[0.18em] text-white shadow-[0_15px_40px_-12px_rgba(192,17,46,0.55)]"
          style={{
            background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 50%, #E6533F 100%)`,
          }}
        >
          <Rocket className="h-3.5 w-3.5" />
          Espace découverte gratuit
        </span>

        <h1 className="mt-7 text-balance text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]">
          <span
            className="block bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(120deg, ${NAVY_DEEP} 0%, ${NAVY} 40%, ${RED_DEEP} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              paddingBottom: '0.12em',
            }}
          >
            Découvrez <span style={{ color: RED }}>Major ECN</span>
          </span>
          <span
            className="block bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 50%, #E6533F 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              paddingBottom: '0.12em',
            }}
          >
            en quelques minutes
          </span>
        </h1>
        <p
          className="mx-auto mt-5 max-w-md text-base sm:text-[17px] leading-relaxed"
          style={{ color: INK_SOFT }}
        >
          Explorez concrètement notre plateforme et notre méthode de préparation aux EVC.
        </p>
      </div>

      {/* ============ CARTE FORMULAIRE — bordure dégradée premium ============
          Largeur : ~2/3 de la page sur desktop (max-w-4xl) au lieu d'un
          formulaire serré. */}
      <div className="relative mx-auto mt-12 w-full max-w-4xl px-4 sm:px-6">
        <div
          className="relative rounded-[28px] p-[1.5px] shadow-[0_30px_80px_-30px_rgba(15,31,77,0.35)]"
          style={{
            background:
              `linear-gradient(135deg, ${RED} 0%, ${RED_DEEP} 25%, ${NAVY} 60%, ${PURPLE} 100%)`,
          }}
        >
          <div
            className="relative overflow-hidden rounded-[26px] bg-white p-6 sm:p-10"
          >
            {/* Halo subtil interne */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl"
              style={{ background: 'rgba(192,17,46,0.07)' }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-20 -bottom-20 h-56 w-56 rounded-full blur-3xl"
              style={{ background: 'rgba(15,31,77,0.06)' }}
            />

            {/* Eyebrow + intro form */}
            <div className="relative flex items-center gap-2.5">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${RED} 0%, ${RED_DEEP} 100%)`,
                  color: '#FFF',
                  boxShadow: '0 10px 24px -10px rgba(192,17,46,0.55)',
                }}
              >
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p
                  className="text-[10.5px] font-extrabold uppercase tracking-[0.14em]"
                  style={{ color: INK_SOFT }}
                >
                  Création de compte
                </p>
                <p className="text-[15px] font-black" style={{ color: NAVY }}>
                  Démarrez en moins de 2 minutes
                </p>
              </div>
            </div>

            {/* Formulaire — grille 2 colonnes sur desktop pour tirer parti
                de la largeur 2/3 page (max-w-4xl). */}
            <form onSubmit={handleSubmit} className="relative mt-6 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field icon={User} placeholder="Prénom" value={firstName} onChange={setFirstName} type="text" required />
                <Field icon={User} placeholder="Nom" value={lastName} onChange={setLastName} type="text" required />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field icon={Mail} placeholder="Adresse email" value={email} onChange={setEmail} type="email" required />
                <Field icon={Phone} placeholder="Téléphone" value={phone} onChange={setPhone} type="tel" required />
              </div>

              {/* Spécialité visée */}
              <SelectField
                icon={Stethoscope}
                placeholder="Spécialité visée"
                value={specialty}
                onChange={(v) => { setSpecialty(v); if (v !== MG_NAME) setVoie(''); }}
                options={SPECIALITES}
                required
              />

              {/* Voie — uniquement si Médecine générale */}
              {specialty === MG_NAME && (
                <SelectField
                  icon={Route}
                  placeholder="Voie (interne ou externe)"
                  value={voie}
                  onChange={setVoie}
                  options={VOIES}
                  required
                />
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SelectField icon={Calendar} placeholder="Session visée" value={session} onChange={setSession} options={SESSIONS} required />
                <SelectField icon={MapPin} placeholder="Pays de résidence" value={country} onChange={setCountry} options={COUNTRIES} required />
              </div>

              <SelectField
                icon={ClipboardCheck}
                placeholder="Avez-vous déjà passé les EVC ?"
                value={passedEvc}
                onChange={setPassedEvc}
                options={EVC_OPTIONS}
                required
              />

              {/* Acceptation CGU + CGS (obligatoire) */}
              <label
                className="flex cursor-pointer items-start gap-2.5 rounded-xl border bg-white p-3.5"
                style={{ borderColor: acceptTerms ? RED : BORDER }}
              >
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded"
                  style={{ accentColor: RED }}
                />
                <span className="text-[12.5px] leading-relaxed" style={{ color: INK }}>
                  J&rsquo;accepte les{' '}
                  <Link href="/cgu" target="_blank" rel="noopener" className="font-semibold underline" style={{ color: RED }}>CGU</Link>
                  {' '}et les{' '}
                  <Link href="/cgs" target="_blank" rel="noopener" className="font-semibold underline" style={{ color: RED }}>CGS</Link>
                  {' '}de Major ECN. <span className="text-[11px]" style={{ color: INK_SOFT }}>(obligatoire)</span>
                </span>
              </label>

              {/* Honeypot anti-spam : invisible pour les humains, rempli par les bots. */}
              <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
                <label>
                  Ne pas remplir
                  <input
                    type="text"
                    name="company"
                    tabIndex={-1}
                    autoComplete="off"
                    value={hp}
                    onChange={(e) => setHp(e.target.value)}
                  />
                </label>
              </div>

              {/* Captcha anti-robot (Cloudflare Turnstile) */}
              {TURNSTILE_ENABLED && (
                <div className="flex justify-center pt-1">
                  <TurnstileWidget key={captchaNonce} onVerify={setCaptchaToken} />
                </div>
              )}

              {/* CTA premium */}
              <button
                type="submit"
                disabled={submitting}
                className="group relative mt-2 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl px-6 py-4 text-base font-extrabold uppercase tracking-wide text-white shadow-[0_18px_45px_-12px_rgba(192,17,46,0.6)] transition-all hover:scale-[1.01] hover:shadow-[0_22px_55px_-12px_rgba(192,17,46,0.7)] disabled:opacity-60"
                style={{
                  background:
                    `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 50%, #E6533F 100%)`,
                }}
              >
                {/* Reflet animé */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
                />
                <span className="relative">
                  {submitting ? 'Création de votre compte…' : 'Accéder à l’espace découverte'}
                </span>
                {!submitting && <ArrowRight className="relative h-5 w-5 transition-transform group-hover:translate-x-0.5" />}
              </button>

              {error && !existingAccount && (
                <p
                  role="alert"
                  className="rounded-xl border bg-[#FEF2F2] px-3 py-2 text-[13px] font-medium"
                  style={{ color: RED, borderColor: '#FECACA' }}
                >
                  {error}
                </p>
              )}

              {existingAccount && (
                <div
                  role="alert"
                  className="flex flex-col gap-3 rounded-xl border-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  style={{ borderColor: '#FECACA', background: '#FFF1F2' }}
                >
                  <p className="text-[13.5px] font-semibold leading-snug" style={{ color: RED_DEEP }}>
                    Un compte existe déjà avec <span className="font-mono">{email}</span>.
                    <br className="hidden sm:block" />
                    <span className="font-normal">Connectez-vous directement pour accéder à votre espace.</span>
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2 text-[13px] font-bold transition-colors hover:bg-[#FFF5F5]"
                    style={{ color: RED, border: `1.5px solid ${RED}` }}
                  >
                    Se connecter
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </form>

            {/* 4 trust checks — pastilles premium */}
            <ul className="relative mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                'Accès immédiat',
                'Sans carte bancaire',
                'Sans engagement',
                'Données sécurisées',
              ].map((t) => (
                <li key={t} className="flex flex-col items-center text-center">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full ring-2"
                    style={{
                      background: '#E7F6EC',
                      color: GREEN,
                      // @ts-expect-error custom CSS prop
                      '--tw-ring-color': '#C6EBD2',
                    }}
                  >
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                  <p className="mt-2 text-[12.5px] font-bold leading-tight" style={{ color: NAVY }}>{t}</p>
                </li>
              ))}
            </ul>

            {/* Box Information importante — refonte premium */}
            <div
              className="relative mt-8 overflow-hidden rounded-2xl border p-5 sm:p-6"
              style={{
                background:
                  `linear-gradient(135deg, ${PURPLE_BG} 0%, #F8F2FE 100%)`,
                borderColor: 'rgba(124,58,237,0.25)',
              }}
            >
              {/* Halo violet */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl"
                style={{ background: 'rgba(124,58,237,0.18)' }}
              />
              <div className="relative flex items-start gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${PURPLE} 0%, #9F69F9 100%)`,
                    color: '#FFF',
                  }}
                >
                  <Info className="h-5 w-5" strokeWidth={2.4} />
                </span>
                <div>
                  <h3 className="text-[15px] font-extrabold" style={{ color: PURPLE }}>
                    Information importante
                  </h3>
                  <ul className="mt-3 space-y-2 text-[13px] leading-relaxed" style={{ color: INK }}>
                    {[
                      <>L&rsquo;espace découverte est actuellement présenté à travers des contenus de <strong>Médecine Générale</strong>.</>,
                      <>Major ECN accompagne les candidats aux EVC dans <strong>toutes les spécialités</strong>.</>,
                      <>La plateforme <strong>s&rsquo;enrichit progressivement</strong> de nouveaux contenus et fonctionnalités.</>,
                      <>Si votre spécialité n&rsquo;est pas encore disponible dans l&rsquo;environnement de démonstration, vous bénéficiez néanmoins de l&rsquo;ensemble des <strong>ressources pédagogiques</strong> prévues dans votre préparation.</>,
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: PURPLE }} strokeWidth={3} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Lien voir les formules */}
            <div className="relative mt-7 flex flex-col items-center gap-2 border-t pt-6" style={{ borderColor: BORDER }}>
              <p className="flex items-center gap-2 text-sm" style={{ color: INK_SOFT }}>
                <Tag className="h-4 w-4" style={{ color: PURPLE }} />
                Vous souhaitez consulter nos offres ?
              </p>
              <Link
                href="/tarifs"
                className="group inline-flex items-center gap-2 text-[15px] font-extrabold transition-colors hover:opacity-80"
                style={{ color: RED }}
              >
                Voir les formules
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Footer données sécurisées */}
            <div className="relative mt-6 flex items-center justify-center gap-2 border-t pt-5 text-[12px]" style={{ color: INK_SOFT, borderColor: BORDER }}>
              <Shield className="h-4 w-4" />
              Vos données sont sécurisées et ne seront jamais partagées.
            </div>
          </div>
        </div>

        {/* ============ Badges flottants premium hors carte ============ */}
        <div className="pointer-events-none mt-8 flex flex-wrap items-center justify-center gap-3 text-[11.5px] font-bold uppercase tracking-[0.12em]" style={{ color: INK_SOFT }}>
          {[
            { Icon: Shield, t: 'Données chiffrées' },
            { Icon: Sparkles, t: 'Activation instantanée' },
            { Icon: GraduationCap, t: '15 ans d’expertise' },
          ].map((b) => (
            <span
              key={b.t}
              className="inline-flex items-center gap-1.5 rounded-full border bg-white/80 px-3.5 py-1.5 backdrop-blur-sm"
              style={{ borderColor: BORDER }}
            >
              <b.Icon className="h-3.5 w-3.5" style={{ color: RED }} />
              {b.t}
            </span>
          ))}
        </div>
      </div>

      {/* Animations locales */}
      <style jsx>{`
        @keyframes edcvr-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(2%, -3%) scale(1.05); }
        }
      `}</style>
    </section>
  );
}

/* ---------- Sub-components ---------- */

type FieldProps = {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  required?: boolean;
};

function Field({ icon: Icon, placeholder, value, onChange, type, required }: FieldProps) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: INK_SOFT }} />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl border bg-white py-4 pl-12 pr-4 text-[15px] placeholder:font-medium placeholder:text-[#94A3B8] focus:outline-none focus:ring-2"
        style={{
          borderColor: BORDER,
          color: INK,
          // @ts-expect-error custom CSS prop
          '--tw-ring-color': RED,
        }}
      />
    </div>
  );
}

type SelectFieldProps = {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
  required?: boolean;
};

function SelectField({ icon: Icon, value, onChange, placeholder, options, required }: SelectFieldProps) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: INK_SOFT }} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full appearance-none rounded-xl border bg-white py-4 pl-12 pr-10 text-[15px] focus:outline-none focus:ring-2"
        style={{
          borderColor: BORDER,
          color: value ? INK : '#94A3B8',
          // @ts-expect-error custom CSS prop
          '--tw-ring-color': RED,
        }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o} style={{ color: INK }}>{o}</option>
        ))}
      </select>
      <svg
        aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: INK_SOFT }}
      >
        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
