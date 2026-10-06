'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Download, FileText, Loader2, Lock, Mail, Phone, User } from 'lucide-react';
import { TurnstileWidget } from '@/components/marketing/turnstile-widget';
import { useHydrate } from '@/lib/use-hydrate';
import { pousserEvenement, EVENEMENTS } from '@/lib/analytics/evenements';
import { RECUEILS_ANNALES, type RecueilAnnales } from '@/lib/data/annales-evc';

const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const NAVY = '#0F1F4D';
const INK_SOFT = '#52607A';
const INK_MUTED = '#7A8499';
const BORDER = '#E5E9F0';
const GREEN = '#0F8A6A';

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

/** Formulaire de demande d'un recueil d'annales EVC : spécialité, coordonnées, envoi par e-mail. */
export function AnnalesForm() {
  const hydrate = useHydrate();
  const slugUrl = useSyncExternalStore(sansAbonnement, slugDeLUrl, () => '');
  const [choix, setSlug] = useState<string | null>(null);
  const slug = choix ?? slugUrl;
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

  if (status === 'success' && recueil) {
    return (
      <div className="rounded-3xl border bg-white p-7 text-center shadow-[0_30px_80px_-30px_rgba(15,27,61,0.28)] sm:p-9" style={{ borderColor: BORDER }}>
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ background: '#E7F6EC', color: GREEN }}>
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h2 className="mt-5 text-2xl font-extrabold" style={{ color: NAVY }}>Vos annales sont en route</h2>
        <p className="mx-auto mt-2 max-w-sm text-[14.5px] leading-relaxed" style={{ color: INK_SOFT }}>
          Le recueil <strong style={{ color: NAVY }}>{recueil.nom}</strong> vient d’être envoyé à <strong style={{ color: NAVY }}>{email}</strong>.
          Pensez à regarder dans les courriers indésirables.
        </p>
        {lien && (
          <a
            href={lien}
            className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-extrabold text-white shadow-[0_14px_36px_-12px_rgba(192,17,46,0.5)] transition-transform hover:scale-[1.02]"
            style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)` }}
          >
            <Download className="h-5 w-5" /> Télécharger maintenant
          </a>
        )}
        <div className="mt-7 rounded-2xl p-5 text-left" style={{ background: '#F6F7FB' }}>
          <p className="text-[12px] font-extrabold uppercase tracking-[0.16em]" style={{ color: RED }}>{recueil.corriges ? 'Les corrigés' : 'Aller plus loin'}</p>
          <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: NAVY }}>
            {recueil.corriges
              ? `Les annales de ${recueil.nom} sont corrigées question par question sur la plateforme Major ECN.`
              : 'Cours, QCM ou QROC selon votre voie, cas cliniques et concours blancs : la préparation complète à l’EVC.'}
          </p>
          <Link href="/espace-decouverte" className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-bold hover:underline" style={{ color: RED }}>
            Essayer l’espace découverte gratuit <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const inputCls = 'w-full rounded-xl border bg-white px-3.5 py-3 text-[14px] outline-none transition-colors placeholder:font-normal focus:border-[#C0112E] focus:ring-2 focus:ring-[#C0112E]/15';
  const inputStyle = { borderColor: BORDER, color: NAVY } as const;

  return (
    // Soumission native avant hydratation : en POST, jamais de coordonnées dans l'URL
    // (le middleware renvoie la page en GET, cf. lib/formulaires-publics.ts).
    <form
      id="formulaire-annales"
      method="post"
      onSubmit={onSubmit}
      className="relative rounded-3xl border bg-white p-6 shadow-[0_30px_80px_-30px_rgba(15,27,61,0.28)] sm:p-7"
      style={{ borderColor: BORDER }}
    >
      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: RED }}>Recevoir mes annales</p>
      <p className="mt-1 text-[19px] font-extrabold leading-tight" style={{ color: NAVY }}>Votre spécialité, votre recueil</p>

      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      <label htmlFor="an-spe" className="mt-5 block text-[12.5px] font-bold" style={{ color: NAVY }}>Spécialité</label>
      <select
        id="an-spe"
        name="specialite"
        required
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className={`${inputCls} mt-1.5 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%230F1F4D%22 stroke-width=%222.5%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:14px] bg-[right_14px_center] bg-no-repeat pr-10 font-semibold`}
        style={inputStyle}
      >
        <option value="" disabled>Choisissez votre spécialité</option>
        {RECUEILS_ANNALES.map((r) => (
          <option key={r.slug} value={r.slug}>{r.nom}</option>
        ))}
      </select>

      {recueil && (
        <div className="mt-3 flex items-center gap-3.5 rounded-2xl p-3" style={{ background: '#F6F7FB' }}>
          <Image src={`/annales-evc/couvertures/${recueil.slug}.webp`} alt="" width={70} height={99} className="h-[86px] w-auto rounded-md shadow-md" />
          <div className="min-w-0 text-[13px] leading-snug" style={{ color: INK_SOFT }}>
            <p className="font-extrabold" style={{ color: NAVY }}>{recueil.sujets} sujets officiels</p>
            <p>{recueil.sessions} session{recueil.sessions > 1 ? 's' : ''} · {periode(recueil)}</p>
            <p>{recueil.pages} pages · PDF</p>
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="an-prenom" className="block text-[12.5px] font-bold" style={{ color: NAVY }}>Prénom</label>
          <div className="relative mt-1.5">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: INK_MUTED }} />
            <input id="an-prenom" name="prenom" required maxLength={80} autoComplete="given-name" placeholder="Prénom" className={`${inputCls} pl-9`} style={inputStyle} />
          </div>
        </div>
        <div>
          <label htmlFor="an-nom" className="block text-[12.5px] font-bold" style={{ color: NAVY }}>Nom</label>
          <div className="relative mt-1.5">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: INK_MUTED }} />
            <input id="an-nom" name="nom" required maxLength={80} autoComplete="family-name" placeholder="Nom" className={`${inputCls} pl-9`} style={inputStyle} />
          </div>
        </div>
      </div>
      <label htmlFor="an-email" className="mt-3 block text-[12.5px] font-bold" style={{ color: NAVY }}>E-mail</label>
      <div className="relative mt-1.5">
        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: INK_MUTED }} />
        <input id="an-email" name="email" type="email" required maxLength={160} autoComplete="email" placeholder="vous@exemple.com" className={`${inputCls} pl-9`} style={inputStyle} />
      </div>
      <label htmlFor="an-tel" className="mt-3 block text-[12.5px] font-bold" style={{ color: NAVY }}>Téléphone</label>
      <div className="relative mt-1.5">
        <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: INK_MUTED }} />
        <input id="an-tel" name="telephone" type="tel" required maxLength={40} autoComplete="tel" placeholder="+33 6 12 34 56 78" className={`${inputCls} pl-9`} style={inputStyle} />
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[12.5px] leading-snug" style={{ color: INK_SOFT }}>
        <input type="checkbox" name="consentement" required className="mt-0.5 h-4 w-4 shrink-0 accent-[#C0112E]" />
        <span>
          J’accepte que Major ECN utilise mes coordonnées pour m’envoyer ces annales et des informations liées à ma préparation.{' '}
          <Link href="/confidentialite" className="underline">Confidentialité</Link>
        </span>
      </label>

      {TURNSTILE_ENABLED && (
        <div className="mt-4">
          <TurnstileWidget key={captchaNonce} onVerify={setCaptchaToken} />
        </div>
      )}

      {status === 'error' && erreur && (
        <p role="alert" className="mt-4 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold" style={{ background: '#FCEAEC', color: RED_DEEP }}>{erreur}</p>
      )}

      <button
        type="submit"
        disabled={!hydrate || status === 'submitting'}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-[15.5px] font-extrabold text-white shadow-[0_14px_36px_-12px_rgba(192,17,46,0.55)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
        style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)` }}
      >
        {status === 'submitting' ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
        {status === 'submitting' ? 'Envoi en cours…' : 'Recevoir mes annales par e-mail'}
      </button>
      <noscript>
        <p className="mt-3 text-[12.5px]" style={{ color: INK_SOFT }}>Activez JavaScript pour recevoir vos annales, ou écrivez-nous à contact@major-ecn.fr.</p>
      </noscript>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-[11.5px]" style={{ color: INK_MUTED }}>
        <Lock className="h-3.5 w-3.5" /> Gratuit · Envoi immédiat par e-mail
      </p>
    </form>
  );
}
