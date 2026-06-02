'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, Loader2, Lock, Mail, MessageSquare } from 'lucide-react';

const NAVY = '#14254E';
const RED = '#A91D2C';
const RED_DEEP = '#7A1320';
const GREEN = '#16A34A';
const PINK_BG = '#FDEEEF';
const MANROPE = "'Manrope', sans-serif";

const CONTACT_EMAIL = 'inscriptionmajorecn@gmail.com';
const SUBJECTS = [
  'Question sur la préparation EVC',
  'Choisir ma formule',
  'Problème technique',
  'Partenariat / presse',
  'Autre',
];

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errMsg, setErrMsg] = useState('');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get('name') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      phone: String(fd.get('phone') ?? '').trim(),
      subject: String(fd.get('subject') ?? '').trim(),
      message: String(fd.get('message') ?? '').trim(),
      company: String(fd.get('company') ?? ''), // honeypot
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
      <div
        className="flex flex-col items-center justify-center rounded-2xl border bg-white p-8 text-center shadow-[0_30px_80px_-30px_rgba(15,27,61,0.25)] sm:p-10"
        style={{ borderColor: '#EEE2E3', minHeight: 420 }}
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: '#E7F6EC', color: GREEN }}>
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h3 className="mt-5 text-2xl font-extrabold" style={{ color: NAVY }}>Message envoyé !</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#6B7280]" style={{ fontFamily: MANROPE }}>
          Merci, votre message a bien été transmis à l’équipe Major ECN.
          Nous vous répondons sous 24 h ouvrées.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 text-sm font-bold hover:underline"
          style={{ color: RED }}
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  const inputCls =
    'w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3.5 text-[15px] text-[#1F2937] outline-none transition-colors placeholder:text-[#9AA1AE] focus:border-[#A91D2C] focus:ring-2 focus:ring-[#A91D2C]/15';

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border bg-white p-6 shadow-[0_30px_80px_-30px_rgba(15,27,61,0.25)] sm:p-8"
      style={{ borderColor: '#EEE2E3' }}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: PINK_BG, color: RED }}>
          <MessageSquare className="h-6 w-6" />
        </span>
        <div>
          <p className="text-xl font-extrabold leading-tight" style={{ color: NAVY }}>Écrivez-nous</p>
          <p className="mt-0.5 text-sm text-[#6B7280]" style={{ fontFamily: MANROPE }}>
            Réponse sous 24 h ouvrées, par un membre de l’équipe.
          </p>
        </div>
      </div>

      {/* Honeypot anti-spam (caché) */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="ct-name" className="block text-sm font-bold" style={{ color: NAVY }}>Nom complet</label>
          <input id="ct-name" name="name" required maxLength={120} placeholder="Dr. Prénom Nom" className={`mt-2 ${inputCls}`} style={{ fontFamily: MANROPE }} />
        </div>
        <div>
          <label htmlFor="ct-email" className="block text-sm font-bold" style={{ color: NAVY }}>Email</label>
          <div className="relative mt-2">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9AA1AE]" />
            <input id="ct-email" name="email" type="email" required placeholder="exemple@email.com" className={`${inputCls} pl-12`} style={{ fontFamily: MANROPE }} />
          </div>
        </div>
        <div>
          <label htmlFor="ct-phone" className="block text-sm font-bold" style={{ color: NAVY }}>
            Téléphone <span className="font-normal text-[#9AA1AE]">(facultatif)</span>
          </label>
          <input id="ct-phone" name="phone" type="tel" maxLength={40} placeholder="+33 6 12 34 56 78" className={`mt-2 ${inputCls}`} style={{ fontFamily: MANROPE }} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="ct-subject" className="block text-sm font-bold" style={{ color: NAVY }}>Sujet</label>
          <select id="ct-subject" name="subject" required defaultValue={SUBJECTS[0]} className={`mt-2 ${inputCls} appearance-none`} style={{ fontFamily: MANROPE }}>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="ct-message" className="block text-sm font-bold" style={{ color: NAVY }}>Votre message</label>
          <textarea id="ct-message" name="message" required minLength={10} maxLength={4000} rows={5} placeholder="Décrivez votre demande…" className={`mt-2 ${inputCls} resize-y`} style={{ fontFamily: MANROPE }} />
        </div>
      </div>

      {status === 'error' && (
        <p className="mt-4 rounded-xl border border-[#F3C9CD] bg-[#FDEEEF] px-4 py-3 text-sm" style={{ color: RED_DEEP, fontFamily: MANROPE }}>
          {errMsg}{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-bold underline">{CONTACT_EMAIL}</a>
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-xl py-4 text-base font-extrabold text-white shadow-[0_12px_30px_-10px_rgba(122,19,32,0.6)] transition-transform hover:scale-[1.01] disabled:opacity-60"
        style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)` }}
      >
        {status === 'submitting' ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
        {status === 'submitting' ? 'Envoi…' : 'Envoyer le message'}
        {status !== 'submitting' && <ArrowRight className="h-5 w-5" />}
      </button>

      <p className="mt-4 flex items-center gap-2 text-[13px] text-[#9AA1AE]" style={{ fontFamily: MANROPE }}>
        <Lock className="h-4 w-4 shrink-0" />
        Vos données ne sont utilisées que pour répondre à votre demande.
      </p>
    </form>
  );
}
