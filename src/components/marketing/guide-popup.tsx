'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, BookOpen, Check, CheckCircle2, ChevronRight,
  Download, Loader2, Mail, Phone, Shield, Stethoscope, User, X,
} from 'lucide-react';

const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const NAVY = '#0F1F4D';
const INK = '#1F2937';
const INK_SOFT = '#52607A';
const BORDER = '#E5E9F0';

const LS_KEY_DISMISSED = 'guide-popup-dismissed';
const LS_KEY_DOWNLOADED = 'guide-popup-downloaded';
const LS_KEY_AB_FORM = 'guide-popup-ab-form';
const LS_KEY_AB_CTA = 'guide-popup-ab-cta';

const DISMISS_COOLDOWN_DAYS = 7;
const MIN_DELAY_MS = 15_000;
const TIME_TRIGGER_MS = 45_000;
const SCROLL_TRIGGER_PERCENT = 0.5;

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
  'Médecine interne polyvalente',
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

const BULLET_POINTS = [
  'Les 4 familles de questions et comment y répondre',
  'Les pièges à éviter en voie interne (QCM) et externe (EVC / ECC)',
  'Les erreurs qui font perdre le plus de points',
  'Le planning de préparation',
  'Des exemples concrets issus des EVC',
];

function trackEvent(name: string, data?: Record<string, string>) {
  try {
    if (typeof window !== 'undefined' && 'dataLayer' in window) {
      (window as any).dataLayer?.push({ event: name, ...data });
    }
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', name, data);
    }
    if (typeof window !== 'undefined' && 'fbq' in window) {
      (window as any).fbq('trackCustom', name, data);
    }
  } catch {}
}

function getOrSetABVariant(key: string, variants: string[]): string {
  try {
    const stored = localStorage.getItem(key);
    if (stored && variants.includes(stored)) return stored;
    const chosen = variants[Math.floor(Math.random() * variants.length)];
    localStorage.setItem(key, chosen);
    return chosen;
  } catch {
    return variants[0];
  }
}

function isEligible(): boolean {
  try {
    if (localStorage.getItem(LS_KEY_DOWNLOADED)) return false;
    const dismissed = localStorage.getItem(LS_KEY_DISMISSED);
    if (dismissed) {
      const ts = parseInt(dismissed, 10);
      if (Date.now() - ts < DISMISS_COOLDOWN_DAYS * 24 * 60 * 60 * 1000) return false;
    }
    return true;
  } catch {
    return false;
  }
}

function markDismissed() {
  try { localStorage.setItem(LS_KEY_DISMISSED, String(Date.now())); } catch {}
}

function markDownloaded() {
  try {
    localStorage.setItem(LS_KEY_DOWNLOADED, '1');
    localStorage.removeItem(LS_KEY_DISMISSED);
  } catch {}
}

/** Déclenche le téléchargement du PDF du guide. Doit être appelé DANS le geste
 *  utilisateur (clic « Télécharger ») pour être fiable sur tous les navigateurs,
 *  y compris mobile. Le guide est un fichier statique : ce téléchargement ne
 *  dépend ni de l'enregistrement du lead ni de l'envoi d'email. */
function triggerGuideDownload() {
  if (typeof document === 'undefined') return;
  const a = document.createElement('a');
  a.href = '/guides/guide-methodologie-evc-2026.pdf';
  a.download = 'Guide_Methodologie_EVC_2026_Major_ECN.pdf';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function GuidePopup({ autoOpen = false }: { autoOpen?: boolean } = {}) {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const shownRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const [abForm, setAbForm] = useState<'A' | 'B'>('A');
  const [abCta, setAbCta] = useState<string>('Télécharger gratuitement le guide méthodologique EVC');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [voie, setVoie] = useState('');
  const [rgpd, setRgpd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPopup = useCallback(() => {
    if (shownRef.current) return;
    shownRef.current = true;
    previousFocusRef.current = document.activeElement as HTMLElement;
    setOpen(true);
    trackEvent('guide_popup_shown');
  }, []);

  const closePopup = useCallback(() => {
    setOpen(false);
    setShowForm(false);
    markDismissed();
    trackEvent('guide_popup_closed');
    previousFocusRef.current?.focus();
  }, []);

  // Init A/B variants
  useEffect(() => {
    setAbForm(getOrSetABVariant(LS_KEY_AB_FORM, ['A', 'B']) as 'A' | 'B');
    setAbCta(getOrSetABVariant(LS_KEY_AB_CTA, [
      'Télécharger gratuitement le guide méthodologique EVC',
      'Obtenir mon guide méthodologique gratuit',
    ]));
  }, []);

  // Manual open via hero button
  useEffect(() => {
    function handleManualOpen() {
      shownRef.current = false;
      openPopup();
    }
    window.addEventListener('open-guide-popup', handleManualOpen);
    return () => window.removeEventListener('open-guide-popup', handleManualOpen);
  }, [openPopup]);

  // Automatic trigger logic — désactivé par défaut (ouverture manuelle via le
  // bouton « Télécharger » / l'événement open-guide-popup). N'auto-affiche le
  // popup que si autoOpen est explicitement activé.
  useEffect(() => {
    if (!autoOpen) return;
    if (!isEligible()) return;

    const startTime = Date.now();
    let triggered = false;
    let minDelayPassed = false;

    const tryTrigger = () => {
      if (triggered || shownRef.current) return;
      if (!minDelayPassed) return;
      triggered = true;
      openPopup();
    };

    const minDelayTimer = setTimeout(() => {
      minDelayPassed = true;
      if (Date.now() - startTime >= TIME_TRIGGER_MS) tryTrigger();
    }, MIN_DELAY_MS);

    const timeTimer = setTimeout(() => {
      if (minDelayPassed) tryTrigger();
      else {
        const waitMore = setTimeout(tryTrigger, MIN_DELAY_MS - (Date.now() - startTime));
        return () => clearTimeout(waitMore);
      }
    }, TIME_TRIGGER_MS);

    const onScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0 && window.scrollY / scrollHeight >= SCROLL_TRIGGER_PERCENT) {
        tryTrigger();
      }
    };

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5 && window.innerWidth > 768) {
        tryTrigger();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('mouseout', onMouseLeave);

    return () => {
      clearTimeout(minDelayTimer);
      clearTimeout(timeTimer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mouseout', onMouseLeave);
    };
  }, [openPopup, autoOpen]);

  // Focus trap + Escape key
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePopup();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKey);
    setTimeout(() => dialogRef.current?.querySelector<HTMLElement>('button, [href], input')?.focus(), 50);

    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, closePopup]);

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Veuillez saisir une adresse e-mail valide.');
      return;
    }
    if (!phone || phone.replace(/\D/g, '').length < 8) {
      setError('Veuillez saisir un numéro de téléphone valide.');
      return;
    }
    if (!rgpd) {
      setError('Veuillez accepter la politique de confidentialité.');
      return;
    }

    if (abForm === 'A') {
      if (!firstName || !lastName || !specialty || !voie) {
        setError('Veuillez remplir tous les champs obligatoires.');
        return;
      }
    } else {
      if (!firstName) {
        setError('Veuillez saisir votre nom.');
        return;
      }
    }

    setSubmitting(true);
    trackEvent('guide_form_submitted', { ab_form: abForm, ab_cta: abCta });

    // 1) Téléchargement immédiat, DANS le geste utilisateur (fiable partout, y
    //    compris mobile). Le guide est un fichier statique : il ne doit jamais
    //    dépendre de l'enregistrement du lead ni de l'envoi d'email.
    triggerGuideDownload();

    // 2) Capture du lead — best effort, n'empêche JAMAIS le téléchargement.
    fetch('/api/guide-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName, lastName, email, phone, specialty, voie,
        abVariant: abForm, ctaVariant: abCta,
      }),
    }).catch(() => { /* réseau indisponible : le téléchargement est déjà lancé */ });

    markDownloaded();
    trackEvent('guide_downloaded');
    // 3) État succès (avec lien de secours « cliquez ici »). On NE navigue PAS :
    //    changer d'URL ici annulerait le téléchargement qui vient de démarrer.
    setSubmitted(true);
    setSubmitting(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6"
      style={{ background: 'rgba(15, 31, 77, 0.55)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-popup-title"
      onClick={(e) => { if (e.target === e.currentTarget) closePopup(); }}
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-w-xl"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={closePopup}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-500 shadow-sm backdrop-blur transition-colors hover:bg-gray-100 hover:text-gray-800"
          aria-label="Fermer"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          /* ========== SUCCESS STATE ========== */
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center sm:px-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: '#DCFCE7' }}>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold" style={{ color: NAVY }}>
              Votre guide est en cours de téléchargement !
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: INK_SOFT }}>
              Si le téléchargement ne démarre pas automatiquement,{' '}
              <a
                href="/guides/guide-methodologie-evc-2026.pdf"
                download="Guide_Methodologie_EVC_2026_Major_ECN.pdf"
                className="font-semibold underline"
                style={{ color: RED }}
              >
                cliquez ici
              </a>.
            </p>
            <button
              type="button"
              onClick={closePopup}
              className="mt-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
              style={{ background: `linear-gradient(90deg, ${RED_DEEP}, ${RED})` }}
            >
              Fermer
            </button>
          </div>
        ) : showForm ? (
          /* ========== FORM STATE ========== */
          <div className="px-6 py-6 sm:px-8">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="mb-4 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              ← Retour
            </button>

            <h3 id="guide-popup-title" className="text-lg font-bold sm:text-xl" style={{ color: NAVY }}>
              📘 Guide Méthodologie EVC 2026 — Offert
            </h3>
            <p className="mt-1 text-sm" style={{ color: INK_SOFT }}>
              39 pages de méthodologie, de pièges à éviter et de conseils pratiques pour optimiser votre préparation aux EVC.
            </p>

            <form onSubmit={handleFormSubmit} className="mt-5 space-y-3.5">
              {/* Nom */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Nom {abForm === 'A' && <span className="text-red-500">*</span>}
                </label>
                <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5" style={{ borderColor: BORDER }}>
                  <User className="h-4 w-4 shrink-0 text-gray-400" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Votre nom"
                    required={abForm === 'A'}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Prénom — only required in variant A */}
              {(abForm === 'A') && (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5" style={{ borderColor: BORDER }}>
                    <User className="h-4 w-4 shrink-0 text-gray-400" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Votre prénom"
                      required
                      className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>
              )}

              {/* E-mail */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5" style={{ borderColor: BORDER }}>
                  <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5" style={{ borderColor: BORDER }}>
                  <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    required
                    className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Spécialité */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Spécialité {abForm === 'A' ? <span className="text-red-500">*</span> : <span className="text-gray-400">(facultatif)</span>}
                </label>
                <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5" style={{ borderColor: BORDER }}>
                  <Stethoscope className="h-4 w-4 shrink-0 text-gray-400" />
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    required={abForm === 'A'}
                    className="w-full bg-transparent text-sm outline-none"
                  >
                    <option value="">Sélectionner votre spécialité</option>
                    {SPECIALITES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Voie */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Voie {abForm === 'A' ? <span className="text-red-500">*</span> : <span className="text-gray-400">(facultatif)</span>}
                </label>
                <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5" style={{ borderColor: BORDER }}>
                  <BookOpen className="h-4 w-4 shrink-0 text-gray-400" />
                  <select
                    value={voie}
                    onChange={(e) => setVoie(e.target.value)}
                    required={abForm === 'A'}
                    className="w-full bg-transparent text-sm outline-none"
                  >
                    <option value="">Sélectionner votre voie</option>
                    {VOIES.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* RGPD */}
              <label className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  checked={rgpd}
                  onChange={(e) => setRgpd(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-[#C0112E]"
                />
                <span className="text-xs leading-relaxed text-gray-500">
                  J'accepte que Major ECN utilise mes coordonnées pour m'envoyer le guide et des informations
                  liées à ma préparation.{' '}
                  <Link href="/confidentialite" className="underline" style={{ color: RED }} target="_blank">
                    Politique de confidentialité
                  </Link>
                </span>
              </label>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.01] disabled:opacity-60"
                style={{ background: `linear-gradient(90deg, ${RED_DEEP}, ${RED})` }}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {submitting ? 'Envoi en cours...' : abCta}
              </button>

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                <Shield className="h-3 w-3" />
                Vos données sont sécurisées et ne seront jamais partagées.
              </p>
            </form>
          </div>
        ) : (
          /* ========== INITIAL VIEW — Popup teaser ========== */
          <div className="flex flex-col sm:flex-row">
            {/* Left side — text */}
            <div className="flex flex-col justify-between px-6 py-6 sm:w-[58%] sm:px-7 sm:py-7">
              <div>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white"
                  style={{ background: RED }}
                >
                  <BookOpen className="h-3 w-3" />
                  Ressource gratuite
                </span>

                <h3 id="guide-popup-title" className="mt-4 text-lg font-bold leading-snug sm:text-xl" style={{ color: NAVY }}>
                  Votre guide Méthodologie EVC 2026 (39 pages)
                </h3>

                <p className="mt-2 text-sm leading-relaxed" style={{ color: INK_SOFT }}>
                  La méthode complète pour gagner des points en voie externe et en voie interne.
                </p>

                <ul className="mt-4 space-y-2.5">
                  {BULLET_POINTS.map((text) => (
                    <li key={text} className="flex items-start gap-2 text-[13px] leading-snug" style={{ color: INK }}>
                      <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: RED }} />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(true);
                    trackEvent('guide_cta_clicked', { ab_cta: abCta });
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
                  style={{ background: `linear-gradient(90deg, ${RED_DEEP}, ${RED})` }}
                >
                  <Download className="h-4 w-4" />
                  Télécharger gratuitement le guide méthodologique EVC
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                  <Shield className="h-3 w-3" />
                  Vos données sont sécurisées et ne seront jamais partagées.
                </p>
              </div>
            </div>

            {/* Right side — book cover */}
            <div
              className="relative hidden items-center justify-center sm:flex sm:w-[42%]"
              style={{ background: 'linear-gradient(135deg, #1B0A2E 0%, #2D1045 50%, #1B0A2E 100%)' }}
            >
              <div className="relative h-[280px] w-[200px]">
                <Image
                  src="/guides/guide-cover.png"
                  alt="Guide Méthodologie EVC 2026 — Major ECN"
                  fill
                  className="object-contain drop-shadow-2xl"
                  sizes="200px"
                />
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-center gap-2 text-[10px] text-white/60">
                <span className="flex items-center gap-1">+9 000 médecins</span>
                <span>•</span>
                <span>Toutes spécialités</span>
                <span>•</span>
                <span>15 ans d'expertise</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
