'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Download, Loader2, Lock, Mail, Phone, User } from 'lucide-react';
import { TurnstileWidget } from '@/components/marketing/turnstile-widget';
import { ChoixSpecialite } from './choix-specialite';
import { useHydrate } from '@/lib/use-hydrate';
import { pousserEvenement, EVENEMENTS } from '@/lib/analytics/evenements';
import { RECUEILS_ANNALES, type RecueilAnnales } from '@/lib/data/annales-evc';
import { INK_MUTED, INK_SOFT, JAKARTA, MANROPE, NAVY, RED, RED_DEEP, RED_GRADIENT } from '@/components/marketing/home/home-ui';

const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const BORDER = '#E6E4DF';
const GREEN = '#15803D';
/** Couvertures montrées tant qu'aucune spécialité n'est choisie. */
const COUVERTURES_DEFAUT = ['medecine-generale', 'pediatrie', 'anesthesie-reanimation'];

type Status = 'idle' | 'submitting' | 'success' | 'error';

const sansAbonnement = () => () => {};
/** Spécialité présélectionnée par l'URL (/annales-evc?specialite=pediatrie) ; vide au rendu serveur. */
function slugDeLUrl(): string {
  const s = new URLSearchParams(window.location.search).get('specialite') ?? '';
  return RECUEILS_ANNALES.some((r) => r.slug === s) ? s : '';
}

function periode(r: RecueilAnnales): string {
  return r.premiere === r.derniere ? `session ${r.premiere}` : `${r.premiere} – ${r.derniere}`;
}

/** En-tête sombre de la carte : la couverture réelle du recueil choisi. */
function EnteteRecueil({ recueil }: { recueil?: RecueilAnnales }) {
  return (
    <div
      className="relative overflow-hidden px-6 pb-6 pt-6 text-white sm:px-7"
      style={{ background: 'radial-gradient(120% 140% at 100% 0%, rgba(192,17,46,0.55) 0%, rgba(192,17,46,0) 55%), linear-gradient(150deg, #1B2D5E 0%, #14254E 55%, #0C1733 100%)' }}
    >
      <div className="relative z-10 max-w-[58%]">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FFC107]" style={{ fontFamily: MANROPE }}>Recueil offert</p>
        <p className="mt-2 text-[21px] font-black leading-[1.15] tracking-tight sm:text-[23px]" style={{ fontFamily: JAKARTA }}>
          {recueil ? recueil.nom : 'Vos annales EVC, par e-mail'}
        </p>
        <p className="mt-2 text-[12.5px] leading-snug text-white/75" style={{ fontFamily: MANROPE }}>
          {recueil
            ? `${recueil.sujets} sujets officiels · ${periode(recueil)} · ${recueil.pages} pages`
            : 'Choisissez votre spécialité, le PDF vous est envoyé immédiatement.'}
        </p>
      </div>

      {/* Couverture(s) réelle(s), inclinée(s) sur la droite */}
      <div aria-hidden className="pointer-events-none absolute -bottom-6 right-4 h-[150px] w-[150px] sm:right-6">
        {recueil ? (
          <div className="absolute bottom-0 right-2 w-[104px] rotate-[7deg] overflow-hidden rounded-md shadow-[0_22px_40px_-12px_rgba(0,0,0,0.65)] ring-1 ring-white/20">
            <Image src={`/annales-evc/couvertures/${recueil.slug}.webp`} alt="" width={420} height={594} className="h-auto w-full" />
          </div>
        ) : (
          COUVERTURES_DEFAUT.map((s, i) => (
            <div
              key={s}
              className="absolute bottom-0 w-[88px] overflow-hidden rounded-md shadow-[0_18px_34px_-10px_rgba(0,0,0,0.6)] ring-1 ring-white/15"
              style={{ right: `${i * 26}px`, transform: `rotate(${(1 - i) * 8}deg)`, zIndex: 3 - i }}
            >
              <Image src={`/annales-evc/couvertures/${s}.webp`} alt="" width={420} height={594} className="h-auto w-full" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/** Formulaire de demande d'un recueil d'annales EVC : spécialité, coordonnées, envoi par e-mail. */
export function AnnalesForm({ defaut = '' }: { /** Spécialité présélectionnée (pages /annales-evc/[spécialité]). */ defaut?: string } = {}) {
  const hydrate = useHydrate();
  const slugUrl = useSyncExternalStore(sansAbonnement, slugDeLUrl, () => '');
  const [choix, setSlug] = useState<string | null>(null);
  const slug = choix ?? (slugUrl || defaut);
  const [status, setStatus] = useState<Status>('idle');
  const [erreur, setErreur] = useState('');
  const [lien, setLien] = useState('');
  const [email, setEmail] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const affichage = useRef(0);
  const recueil = useMemo(() => RECUEILS_ANNALES.find((r) => r.slug === slug), [slug]);

  // Heure d'affichage (piège à robots) et clic sur une spécialité de la page : présélection
  useEffect(() => {
    affichage.current = Date.now();
    const choisir = (e: Event) => {
      const s = (e as CustomEvent<string>).detail;
      if (RECUEILS_ANNALES.some((r) => r.slug === s)) setSlug(s);
    };
    window.addEventListener('annales-choisir', choisir);
    return () => window.removeEventListener('annales-choisir', choisir);
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!slug) {
      setErreur('Choisissez votre spécialité.');
      setStatus('error');
      return;
    }
    if (TURNSTILE_ENABLED && !captchaToken) {
      setErreur('Merci de valider le test anti-robot.');
      setStatus('error');
      return;
    }
    const mail = String(fd.get('email') ?? '').trim();
    const utm: Record<string, string> = {};
    new URLSearchParams(window.location.search).forEach((v, k) => {
      if (/^(utm_|gclid|fbclid|ref)/.test(k)) utm[k] = v.slice(0, 200);
    });
    setStatus('submitting');
    setErreur('');
    try {
      const res = await fetch('/api/annales-evc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prenom: String(fd.get('prenom') ?? '').trim(),
          nom: String(fd.get('nom') ?? '').trim(),
          email: mail,
          telephone: String(fd.get('telephone') ?? '').trim(),
          specialite: slug,
          consentement: fd.get('consentement') === 'on',
          hp: String(fd.get('company') ?? ''),
          elapsedMs: Date.now() - affichage.current,
          turnstileToken: captchaToken,
          utm,
        }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; lien?: string };
      if (!res.ok || !j.ok) {
        setErreur(j.error ?? 'L’envoi n’a pas abouti. Réessayez dans un instant.');
        setStatus('error');
        setCaptchaToken('');
        setCaptchaNonce((n) => n + 1);
        return;
      }
      pousserEvenement(EVENEMENTS.annalesDownload, { specialite: slug, page_path: window.location.pathname });
      setEmail(mail);
      setLien(j.lien ?? '');
      setStatus('success');
    } catch {
      setErreur('Connexion impossible. Vérifiez votre réseau et réessayez.');
      setStatus('error');
      setCaptchaToken('');
      setCaptchaNonce((n) => n + 1);
    }
  };

  const carte = 'overflow-hidden rounded-3xl border bg-white shadow-[0_40px_100px_-40px_rgba(15,27,61,0.45)]';

  if (status === 'success' && recueil) {
    return (
      <div id="formulaire-annales" className={carte} style={{ borderColor: BORDER, fontFamily: JAKARTA }}>
        <EnteteRecueil recueil={recueil} />
        <div className="p-6 sm:p-7">
          <p className="flex items-center gap-2 text-[17px] font-black tracking-tight" style={{ color: NAVY }}>
            <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: GREEN }} />
            Votre recueil est envoyé
          </p>
          <p className="mt-2 text-[14px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
            Il arrive à <strong style={{ color: NAVY }}>{email}</strong>. S’il n’apparaît pas d’ici quelques minutes, regardez
            dans les courriers indésirables.
          </p>
          {lien && (
            <a
              href={lien}
              className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-xl px-6 py-4 text-[15px] font-black tracking-tight text-white shadow-[0_16px_40px_-14px_rgba(192,17,46,0.65)] transition-transform hover:scale-[1.01]"
              style={{ background: RED_GRADIENT }}
            >
              <Download className="h-5 w-5" /> Télécharger le PDF maintenant
            </a>
          )}

          <div className="mt-6 rounded-2xl px-5 py-4" style={{ background: '#FDF1F3' }}>
            <p className="text-[14px] font-black leading-snug tracking-tight" style={{ color: RED_DEEP }}>
              {recueil.corriges ? 'Les corrigés de ces annales sont sur Major ECN.' : 'Les sujets sont posés. Reste à s’y préparer.'}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
              {recueil.corriges
                ? `Les annales de ${recueil.nom} y sont corrigées question par question, avec la réponse attendue et la méthode pour la construire.`
                : 'Cours structurés pour l’EVC, QCM ou QROC selon votre voie, cas cliniques et concours blancs, avec des enseignants qui exercent en France.'}
            </p>
            <Link href="/espace-decouverte" className="group mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-black" style={{ color: RED }}>
              Accéder à l’espace découverte gratuit
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inputCls =
    'h-12 w-full rounded-xl border bg-white px-3.5 text-[14px] font-semibold outline-none transition-colors placeholder:font-medium placeholder:text-[#9AA1B2] focus:border-[#C0112E] focus:ring-2 focus:ring-[#C0112E]/15';
  const inputStyle = { borderColor: BORDER, color: NAVY, fontFamily: MANROPE } as const;
  const labelCls = 'block text-[12.5px] font-black tracking-tight';

  return (
    // Soumission native avant hydratation : en POST, jamais de coordonnées dans l'URL
    // (le middleware renvoie la page en GET, cf. lib/formulaires-publics.ts).
    <form id="formulaire-annales" method="post" onSubmit={onSubmit} className={`relative scroll-mt-28 ${carte}`} style={{ borderColor: BORDER, fontFamily: JAKARTA }}>
      <EnteteRecueil recueil={recueil} />

      <div className="p-6 sm:p-7">
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0 opacity-0" />

        <label htmlFor="an-spe" className={labelCls} style={{ color: NAVY }}>Votre spécialité</label>
        <ChoixSpecialite value={slug} onChange={setSlug} />

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="an-prenom" className={labelCls} style={{ color: NAVY }}>Prénom</label>
            <div className="relative mt-1.5">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: INK_MUTED }} />
              <input id="an-prenom" name="prenom" required maxLength={80} autoComplete="given-name" placeholder="Prénom" className={`${inputCls} pl-10`} style={inputStyle} />
            </div>
          </div>
          <div>
            <label htmlFor="an-nom" className={labelCls} style={{ color: NAVY }}>Nom</label>
            <div className="relative mt-1.5">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: INK_MUTED }} />
              <input id="an-nom" name="nom" required maxLength={80} autoComplete="family-name" placeholder="Nom" className={`${inputCls} pl-10`} style={inputStyle} />
            </div>
          </div>
        </div>
        <label htmlFor="an-email" className={`mt-4 ${labelCls}`} style={{ color: NAVY }}>E-mail</label>
        <div className="relative mt-1.5">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: INK_MUTED }} />
          <input id="an-email" name="email" type="email" required maxLength={160} autoComplete="email" placeholder="vous@exemple.com" className={`${inputCls} pl-10`} style={inputStyle} />
        </div>
        <label htmlFor="an-tel" className={`mt-4 ${labelCls}`} style={{ color: NAVY }}>Téléphone</label>
        <div className="relative mt-1.5">
          <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: INK_MUTED }} />
          <input id="an-tel" name="telephone" type="tel" required maxLength={40} autoComplete="tel" placeholder="+33 6 12 34 56 78" className={`${inputCls} pl-10`} style={inputStyle} />
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[12px] leading-snug" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
          <input type="checkbox" name="consentement" required className="mt-0.5 h-4 w-4 shrink-0 accent-[#C0112E]" />
          <span>
            J’accepte que Major ECN utilise mes coordonnées pour m’envoyer ces annales et des informations liées à ma
            préparation. <Link href="/confidentialite" className="underline">Confidentialité</Link>
          </span>
        </label>

        {TURNSTILE_ENABLED && (
          <div className="mt-4">
            <TurnstileWidget key={captchaNonce} onVerify={setCaptchaToken} />
          </div>
        )}

        {status === 'error' && erreur && (
          <p role="alert" className="mt-4 rounded-xl px-3.5 py-2.5 text-[13px] font-bold" style={{ background: '#FCEAEC', color: RED_DEEP, fontFamily: MANROPE }}>{erreur}</p>
        )}

        <button
          type="submit"
          disabled={!hydrate || status === 'submitting'}
          className="group mt-5 flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 text-[15px] font-black tracking-tight text-white shadow-[0_16px_40px_-14px_rgba(192,17,46,0.65)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
          style={{ background: RED_GRADIENT }}
        >
          {status === 'submitting' ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
          {status === 'submitting' ? 'Envoi en cours…' : 'Recevoir mon recueil'}
          {status !== 'submitting' && <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
        </button>
        <noscript>
          <p className="mt-3 text-[12.5px]" style={{ color: INK_SOFT }}>Activez JavaScript pour recevoir vos annales, ou écrivez-nous à contact@major-ecn.fr.</p>
        </noscript>
        <p className="mt-3.5 flex items-center justify-center gap-1.5 text-[11.5px] font-semibold" style={{ color: INK_MUTED, fontFamily: MANROPE }}>
          <Lock className="h-3.5 w-3.5" /> Gratuit · PDF envoyé immédiatement · Lien valable deux ans
        </p>
      </div>
    </form>
  );
}
