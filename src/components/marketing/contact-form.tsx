'use client';

import { useState } from 'react';
import {
  ArrowRight, Baby, BriefcaseMedical, CheckCircle2, ChevronDown, GraduationCap, Info,
  Loader2, Mail, MessageSquare, Paperclip, Phone, Pill, Stethoscope, User,
} from 'lucide-react';
import { TurnstileWidget } from './turnstile-widget';

/** Le captcha est requis côté UI uniquement si la clé publique est configurée. */
const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const NAVY = '#0F1F4D';
const INK_SOFT = '#52607A';
const INK_MUTED = '#7A8499';
const BORDER = '#E5E9F0';
const GREEN = '#0F8A6A';
const PURPLE = '#7C3AED';
const PURPLE_SOFT = '#EDE9FE';

const CONTACT_EMAIL = 'contact@major-ecn.fr';

/** Taille maximale cumulée des pièces jointes (limite requête serverless). */
const MAX_ATTACH_BYTES = 4 * 1024 * 1024;

/* Liste OFFICIELLE des spécialités EVC (PAE) — alignée pixel-perfect sur
 * /specialites (cf. specialites-page.tsx). Tri alphabétique pour le
 * dropdown. Toute modification doit être faite EN PARALLÈLE sur les
 * deux fichiers pour rester cohérent. */
const SPECIALITES = [
  'Anatomie et cytologie pathologiques',
  'Anesthésie-réanimation',
  'Biologie médicale (médecin)',
  'Biologie médicale (pharmacien)',
  'Cardiologie et maladies vasculaires',
  'Chirurgie générale',
  'Chirurgie infantile',
  'Chirurgie maxillo-faciale et stomatologie',
  'Chirurgie orale',
  'Chirurgie orthopédique et traumatologie',
  'Chirurgie plastique, reconstructrice et esthétique',
  'Chirurgie thoracique et cardio-vasculaire',
  'Chirurgie urologique',
  'Chirurgie vasculaire',
  'Chirurgie viscérale et digestive',
  'Dermatologie et vénéréologie',
  'Endocrinologie et métabolisme',
  'Gastro-entérologie et hépatologie',
  'Génétique médicale',
  'Gériatrie',
  'Gynécologie médicale',
  'Gynécologie obstétrique',
  'Hématologie',
  'Médecine du travail',
  'Médecine générale',
  'Médecine interne',
  'Médecine nucléaire',
  'Médecine physique et de réadaptation',
  'Néphrologie',
  'Neurochirurgie',
  'Neurologie',
  'Odontologie',
  'Oncologie',
  'Ophtalmologie',
  'ORL et chirurgie cervico-faciale',
  'Orthopédie dento-faciale',
  'Pédiatrie',
  'Pharmacie polyvalente',
  'Pneumologie',
  'Psychiatrie',
  'Radiodiagnostic et imagerie médicale',
  'Réanimation médicale',
  'Rhumatologie',
  'Sage-femme',
  'Santé publique et médecine sociale',
  'Autre / non précisé',
];

/** Icône dent (aucune équivalence dans lucide) — tracé mdiTooth en outline. */
function ToothIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" className={className} aria-hidden>
      <path d="M7,2C4,2 2,5 2,8C2,10.11 2.66,13.5 3.5,17C4.22,20 5.08,22.5 6.5,22.5C7.55,22.5 8,21 8.5,19C9,17 9.5,15 11,15H13C14.5,15 15,17 15.5,19C16,21 16.45,22.5 17.5,22.5C18.92,22.5 19.78,20 20.5,17C21.34,13.5 22,10.11 22,8C22,5 20,2 17,2C14,2 13,3 12,3C11,3 10,2 7,2Z" />
    </svg>
  );
}

type IconCmp = React.ComponentType<{ className?: string }>;
const PROFESSIONS: { value: string; Icon: IconCmp }[] = [
  { value: 'Médecin', Icon: Stethoscope },
  { value: 'Chirurgien-dentiste', Icon: ToothIcon },
  { value: 'Pharmacien', Icon: Pill },
  { value: 'Sage-femme', Icon: Baby },
  { value: 'Étudiant en médecine', Icon: GraduationCap },
  { value: 'Autre professionnel de santé', Icon: BriefcaseMedical },
];

type Status = 'idle' | 'submitting' | 'success' | 'error';

/** Lit un fichier et renvoie son contenu encodé en base64 (sans préfixe data URI). */
function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errMsg, setErrMsg] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [profession, setProfession] = useState('');
  const [profOpen, setProfOpen] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaNonce, setCaptchaNonce] = useState(0);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const firstName = String(fd.get('first_name') ?? '').trim();
    const lastName = String(fd.get('last_name') ?? '').trim();
    const specialite = String(fd.get('specialite') ?? '').trim();

    if (!profession) {
      setErrMsg('Veuillez sélectionner votre profession.');
      setStatus('error');
      return;
    }

    if (TURNSTILE_ENABLED && !captchaToken) {
      setErrMsg('Merci de valider le test anti-robot.');
      setStatus('error');
      return;
    }

    const totalBytes = files.reduce((s, f) => s + f.size, 0);
    if (totalBytes > MAX_ATTACH_BYTES) {
      setErrMsg('Pièces jointes trop volumineuses (4 Mo maximum au total).');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrMsg('');
    try {
      const attachments = await Promise.all(
        files.map(async (f) => ({ filename: f.name, content: await toBase64(f) })),
      );
      const payload = {
        name: `${firstName} ${lastName}`.trim(),
        email: String(fd.get('email') ?? '').trim(),
        phone: String(fd.get('phone') ?? '').trim(),
        subject: [specialite, profession].filter(Boolean).join(' · ') || 'Demande de contact',
        message: String(fd.get('message') ?? '').trim(),
        company: String(fd.get('company') ?? ''),
        turnstileToken: captchaToken,
        ...(attachments.length > 0 ? { attachments } : {}),
      };
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !j.ok) {
        setErrMsg(j.error ?? 'Erreur à l’envoi. Réessayez.');
        setStatus('error');
        setCaptchaToken('');
        setCaptchaNonce((n) => n + 1);
        return;
      }
      setStatus('success');
    } catch {
      setErrMsg(`Connexion impossible. Écrivez-nous à ${CONTACT_EMAIL}.`);
      setStatus('error');
      setCaptchaToken('');
      setCaptchaNonce((n) => n + 1);
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border bg-white p-8 text-center shadow-[0_30px_80px_-30px_rgba(15,27,61,0.25)] sm:p-10"
        style={{ borderColor: BORDER, minHeight: 540 }}>
        <span className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: '#E7F6EC', color: GREEN }}>
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h3 className="mt-5 text-2xl font-extrabold" style={{ color: NAVY }}>Message envoyé !</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed" style={{ color: INK_SOFT }}>
          Merci, votre demande a bien été transmise à l’équipe Major ECN.
          Nous vous répondons sous 24&nbsp;h ouvrées.
        </p>
        <button type="button" onClick={() => { setStatus('idle'); setFiles([]); setProfession(''); }}
          className="mt-6 text-sm font-bold hover:underline" style={{ color: RED }}>
          Envoyer un autre message
        </button>
      </div>
    );
  }

  const inputCls =
    'w-full rounded-xl border bg-white px-3.5 py-3 text-[14px] outline-none transition-colors placeholder:font-normal focus:ring-2';
  const inputStyle = { borderColor: BORDER, color: NAVY } as const;

  return (
    <form onSubmit={onSubmit}
      className="rounded-3xl border bg-white p-6 shadow-[0_30px_80px_-30px_rgba(15,27,61,0.25)] sm:p-7"
      style={{ borderColor: BORDER }}>
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: '#FCEAEC', color: RED }}>
          <MessageSquare className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: RED }}>Formulaire de contact</p>
          <p className="text-lg font-extrabold leading-tight sm:text-xl" style={{ color: NAVY }}>
            Demandez des informations sur votre préparation EVC
          </p>
          <p className="mt-1 text-[12.5px]" style={{ color: INK_SOFT }}>
            Réponse personnalisée sous 24&nbsp;h ouvrées par un membre de l’équipe.
          </p>
        </div>
      </div>

      {/* Honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="ct-first" className="block text-[12.5px] font-bold" style={{ color: NAVY }}>Prénom</label>
          <div className="relative mt-1.5">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: INK_MUTED }} />
            <input id="ct-first" name="first_name" required maxLength={80} placeholder="Prénom" className={`${inputCls} pl-9`} style={inputStyle} />
          </div>
        </div>
        <div>
          <label htmlFor="ct-last" className="block text-[12.5px] font-bold" style={{ color: NAVY }}>Nom</label>
          <div className="relative mt-1.5">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: INK_MUTED }} />
            <input id="ct-last" name="last_name" required maxLength={80} placeholder="Nom" className={`${inputCls} pl-9`} style={inputStyle} />
          </div>
        </div>
        <div>
          <label htmlFor="ct-email" className="block text-[12.5px] font-bold" style={{ color: NAVY }}>Email</label>
          <div className="relative mt-1.5">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: INK_MUTED }} />
            <input id="ct-email" name="email" type="email" required placeholder="exemple@email.com" className={`${inputCls} pl-9`} style={inputStyle} />
          </div>
        </div>
        <div>
          <label htmlFor="ct-phone" className="block text-[12.5px] font-bold" style={{ color: NAVY }}>Téléphone</label>
          <div className="relative mt-1.5">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: INK_MUTED }} />
            <input id="ct-phone" name="phone" type="tel" required maxLength={40} placeholder="+33 6 12 34 56 78" className={`${inputCls} pl-9`} style={inputStyle} />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="ct-spe" className="block text-[12.5px] font-bold" style={{ color: NAVY }}>Spécialité visée</label>
          <select id="ct-spe" name="specialite" required defaultValue="" className={`mt-1.5 ${inputCls} appearance-none`} style={inputStyle}>
            <option value="" disabled>Sélectionnez une spécialité…</option>
            {SPECIALITES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Votre profession — menu déroulant custom (pixel-perfect maquette) */}
        <div className="sm:col-span-2">
          <label className="block text-[12.5px] font-bold" style={{ color: NAVY }}>Votre profession</label>
          <div className="relative mt-1.5">
            <button
              type="button"
              onClick={() => setProfOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={profOpen}
              className="flex w-full items-center justify-between rounded-xl border-2 bg-white px-3.5 py-3 text-left text-[15px] transition-colors"
              style={{ borderColor: PURPLE }}
            >
              <span className="flex items-center gap-2.5 truncate" style={{ color: profession ? NAVY : INK_MUTED }}>
                <User className="h-5 w-5 shrink-0" style={{ color: PURPLE }} />
                {profession || 'Sélectionnez votre profession…'}
              </span>
              <ChevronDown className="h-5 w-5 shrink-0 transition-transform" style={{ color: PURPLE, transform: profOpen ? 'rotate(180deg)' : 'none' }} />
            </button>

            {profOpen && (
              <>
                <div className="fixed inset-0 z-10" aria-hidden onClick={() => setProfOpen(false)} />
                <ul
                  role="listbox"
                  className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-2xl border bg-white py-2 shadow-[0_24px_60px_-18px_rgba(15,27,61,0.30)]"
                  style={{ borderColor: BORDER }}
                >
                  {PROFESSIONS.map((p) => (
                    <li key={p.value} role="option" aria-selected={profession === p.value}>
                      <button
                        type="button"
                        onClick={() => { setProfession(p.value); setProfOpen(false); }}
                        className="flex w-full items-center gap-3.5 px-4 py-2.5 text-left transition-colors hover:bg-[#F6F4FE]"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: PURPLE_SOFT, color: PURPLE }}>
                          <p.Icon className="h-5 w-5" />
                        </span>
                        <span className="text-[15px] font-bold" style={{ color: NAVY }}>{p.value}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Bandeau d'information */}
          <div className="mt-3 flex items-start gap-3 rounded-2xl px-4 py-3.5" style={{ background: '#F3F1FE' }}>
            <Info className="mt-0.5 h-5 w-5 shrink-0" style={{ color: PURPLE }} />
            <p className="text-[13.5px] leading-relaxed" style={{ color: NAVY }}>
              Cette plateforme est destinée aux professionnels de santé{' '}
              <strong style={{ color: PURPLE }}>diplômés hors Union européenne</strong> préparant les EVC dans le cadre de la PAE.
            </p>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="ct-message" className="block text-[12.5px] font-bold" style={{ color: NAVY }}>Votre message</label>
          <textarea id="ct-message" name="message" required minLength={10} maxLength={4000} rows={5}
            placeholder="Présentez-nous votre situation, votre date d’EVC visée, vos besoins…"
            className={`mt-1.5 ${inputCls} resize-y`} style={inputStyle} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="ct-file" className="inline-flex cursor-pointer items-center gap-2 rounded-xl border bg-white px-3.5 py-2 text-[12.5px] font-bold transition-colors hover:bg-[#FFF8F9]"
            style={{ borderColor: BORDER, color: NAVY }}>
            <Paperclip className="h-4 w-4" style={{ color: RED }} />
            {files.length > 0
              ? `${files.length} pièce${files.length > 1 ? 's' : ''} jointe${files.length > 1 ? 's' : ''}`
              : 'Joindre des pièces jointes (optionnel)'}
            <input id="ct-file" type="file" multiple className="hidden"
              onChange={(e) => setFiles(Array.from(e.currentTarget.files ?? []))} />
          </label>
          {files.length > 0 && (
            <p className="mt-1.5 truncate text-[11.5px]" style={{ color: INK_SOFT }}>
              {files.map((f) => f.name).join(', ')}
            </p>
          )}
          <p className="mt-1.5 text-[11.5px]" style={{ color: INK_MUTED }}>
            CV, diplôme, attestations, etc. — jusqu’à 4&nbsp;Mo au total, envoyés avec votre message.
          </p>
        </div>
      </div>

      {/* Captcha anti-robot (Cloudflare Turnstile) */}
      {TURNSTILE_ENABLED && (
        <div className="mt-5 flex justify-center">
          <TurnstileWidget key={captchaNonce} onVerify={setCaptchaToken} />
        </div>
      )}

      {status === 'error' && (
        <p className="mt-4 rounded-xl border bg-[#FCEAEC] px-4 py-3 text-[13px]" style={{ borderColor: 'rgba(192,17,46,0.22)', color: RED_DEEP }}>
          {errMsg}{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-bold underline">{CONTACT_EMAIL}</a>
        </p>
      )}

      <button type="submit" disabled={status === 'submitting'}
        className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl py-3.5 text-[15px] font-extrabold text-white shadow-[0_18px_40px_-18px_rgba(192,17,46,0.55)] transition-transform hover:scale-[1.01] disabled:opacity-60"
        style={{ background: `linear-gradient(135deg, ${RED} 0%, ${RED_DEEP} 100%)` }}>
        {status === 'submitting' ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
        {status === 'submitting' ? 'Envoi…' : 'Envoyer le message'}
        {status !== 'submitting' && <ArrowRight className="h-5 w-5" />}
      </button>

      <p className="mt-3 text-center text-[11.5px]" style={{ color: INK_MUTED }}>
        En envoyant ce formulaire, vous acceptez d’être recontacté par l’équipe
        Major ECN. Vos données ne sont utilisées que pour répondre à votre demande.
      </p>
    </form>
  );
}
