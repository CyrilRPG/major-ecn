'use client';

import { useState } from 'react';
import {
  ArrowRight, CheckCircle2, Loader2, Mail, MessageSquare, Paperclip, Phone, User,
} from 'lucide-react';

const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const NAVY = '#0F1F4D';
const INK_SOFT = '#52607A';
const INK_MUTED = '#7A8499';
const BORDER = '#E5E9F0';
const GREEN = '#0F8A6A';

const CONTACT_EMAIL = 'contact@major-ecn.fr';

/* Liste alignée sur /specialites — version condensée pour le dropdown. */
const SPECIALITES = [
  'Médecine Générale', 'Cardiologie', 'Pneumologie', 'Gastro-entérologie',
  'Endocrinologie', 'Néphrologie', 'Neurologie', 'Hématologie', 'Rhumatologie',
  'Dermatologie', 'Infectiologie', 'Oncologie', 'Médecine interne',
  'Allergologie', 'Médecine vasculaire', 'Médecine d’urgence',
  'Médecine intensive — Réanimation', 'Gériatrie',
  'Médecine physique & réadaptation', 'Médecine du travail',
  'Médecine légale', 'Psychiatrie', 'Pédiatrie', 'Chirurgie pédiatrique',
  'Chirurgie générale & viscérale', 'Chirurgie orthopédique',
  'Chirurgie cardio-thoracique', 'Chirurgie vasculaire', 'Neurochirurgie',
  'Chirurgie plastique', 'Chirurgie maxillo-faciale', 'Urologie',
  'Gynécologie-obstétrique', 'ORL', 'Ophtalmologie', 'Stomatologie',
  'Radiologie', 'Médecine nucléaire', 'Biologie médicale',
  'Anatomie & cytologie pathologiques', 'Génétique médicale',
  'Pharmacologie clinique', 'Pharmacie hospitalière', 'Pharmacie d’officine',
  'Santé publique', 'Anesthésie & Réanimation', 'Autre / non précisé',
];

const STATUTS = [
  'Médecin diplômé hors UE (PADHUE)',
  'Médecin diplômé UE',
  'Étudiant en médecine',
  'Chirurgien-dentiste',
  'Pharmacien',
  'Sage-femme',
  'Autre profession de santé',
];

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errMsg, setErrMsg] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const firstName = String(fd.get('first_name') ?? '').trim();
    const lastName = String(fd.get('last_name') ?? '').trim();
    const specialite = String(fd.get('specialite') ?? '').trim();
    const statut = String(fd.get('statut') ?? '').trim();
    const payload = {
      name: `${firstName} ${lastName}`.trim(),
      email: String(fd.get('email') ?? '').trim(),
      phone: String(fd.get('phone') ?? '').trim(),
      subject: [specialite, statut].filter(Boolean).join(' · ') || 'Demande de contact',
      message: String(fd.get('message') ?? '').trim(),
      company: String(fd.get('company') ?? ''),
    };
    setStatus('submitting');
    setErrMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !j.ok) {
        setErrMsg(j.error ?? 'Erreur à l’envoi. Réessayez.');
        setStatus('error');
        return;
      }
      setStatus('success');
    } catch {
      setErrMsg(`Connexion impossible. Écrivez-nous à ${CONTACT_EMAIL}.`);
      setStatus('error');
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
        <button type="button" onClick={() => setStatus('idle')}
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
          <label htmlFor="ct-phone" className="block text-[12.5px] font-bold" style={{ color: NAVY }}>
            Téléphone <span className="font-normal" style={{ color: INK_MUTED }}>(facultatif)</span>
          </label>
          <div className="relative mt-1.5">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: INK_MUTED }} />
            <input id="ct-phone" name="phone" type="tel" maxLength={40} placeholder="+33 6 12 34 56 78" className={`${inputCls} pl-9`} style={inputStyle} />
          </div>
        </div>
        <div>
          <label htmlFor="ct-spe" className="block text-[12.5px] font-bold" style={{ color: NAVY }}>Spécialité visée</label>
          <select id="ct-spe" name="specialite" required defaultValue="" className={`mt-1.5 ${inputCls} appearance-none`} style={inputStyle}>
            <option value="" disabled>Sélectionnez une spécialité…</option>
            {SPECIALITES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="ct-statut" className="block text-[12.5px] font-bold" style={{ color: NAVY }}>Votre statut</label>
          <select id="ct-statut" name="statut" required defaultValue="" className={`mt-1.5 ${inputCls} appearance-none`} style={inputStyle}>
            <option value="" disabled>Sélectionnez votre statut…</option>
            {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
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
            {fileName ? `Pièce jointe : ${fileName}` : 'Joindre des pièces jointes (optionnel)'}
            <input id="ct-file" type="file" className="hidden" onChange={(e) => setFileName(e.currentTarget.files?.[0]?.name ?? null)} />
          </label>
          <p className="mt-1.5 text-[11.5px]" style={{ color: INK_MUTED }}>
            CV, diplôme, attestations, etc. (joindre directement à votre email après envoi).
          </p>
        </div>
      </div>

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
