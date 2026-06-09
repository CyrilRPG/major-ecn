'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, CheckCircle2, GraduationCap, Loader2, Mail, MailCheck, PhoneCall, Sparkles, User } from 'lucide-react';
import type { PublicSignupInput } from '@/lib/schemas/public-signup';

type Status = 'idle' | 'submitting' | 'success' | 'error';
type FlowResult = 'invite_sent' | 'callback' | undefined;

const PROMOTIONS: PublicSignupInput['promotion'][] = ['D2', 'D3', 'D4', 'PAE', 'Autre'];
const JAKARTA = "'Plus Jakarta Sans', sans-serif";
const MANROPE = "'Manrope', sans-serif";

export function InscriptionForm({ colleges = [] }: { colleges?: { id: string; nom: string }[] }) {
  const [status, setStatus] = useState<Status>('idle');
  const [flow, setFlow] = useState<FlowResult>(undefined);
  const [serverMsg, setServerMsg] = useState('');
  const [pickedColleges, setPickedColleges] = useState<Set<string>>(new Set());
  const [allColleges, setAllColleges] = useState(true);

  const toggleCollege = (nom: string) =>
    setPickedColleges((prev) => {
      const n = new Set(prev);
      if (n.has(nom)) n.delete(nom);
      else n.add(nom);
      return n;
    });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const collegesValue = allColleges || pickedColleges.size === 0
      ? ''
      : Array.from(pickedColleges).join(', ');
    const payload = {
      first_name: String(fd.get('first_name') ?? '').trim(),
      last_name: String(fd.get('last_name') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      phone: String(fd.get('phone') ?? '').trim(),
      promotion: String(fd.get('promotion') ?? 'D2'),
      offer: String(fd.get('offer') ?? 'essentiel'),
      colleges_wish: collegesValue,
    };
    setStatus('submitting');
    setServerMsg('');
    setFlow(undefined);
    try {
      const res = await fetch('/api/public-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = (await res.json().catch(() => ({}))) as {
        ok?: boolean; error?: string; message?: string; flow?: FlowResult;
      };
      if (!res.ok || !j.ok) {
        setServerMsg(j.error ?? 'Erreur à l’envoi. Réessayez.');
        setStatus('error');
        return;
      }
      setServerMsg(j.message ?? 'Demande envoyée.');
      setFlow(j.flow);
      setStatus('success');
    } catch {
      setServerMsg('Connexion impossible. Vérifiez votre internet et réessayez.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    const isCallback = flow === 'callback';
    return (
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative mx-auto mt-8 max-w-4xl overflow-hidden rounded-3xl border-2 border-[#14B8A6]/30 bg-gradient-to-br from-white via-[#F0FBF7]/60 to-[#F0F9FB]/40 p-8 text-left shadow-[0_20px_70px_-20px_rgba(20,184,166,0.35)] sm:p-10 lg:p-12"
      >
        <div aria-hidden className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#14B8A6]/20 blur-3xl" />
        <div aria-hidden className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-[#3B82F6]/15 blur-3xl" />

        <motion.span
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
          className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#14B8A6] to-[#0F766E] text-white shadow-lg"
        >
          {isCallback ? <PhoneCall className="h-7 w-7" /> : <MailCheck className="h-7 w-7" />}
        </motion.span>
        <h3
          className="relative mt-5 text-2xl font-black leading-tight sm:text-3xl"
          style={{ fontFamily: JAKARTA, letterSpacing: '-0.02em' }}
        >
          <span className="block text-[#2D2D2D]">
            {isCallback ? 'Demande envoyée' : 'Bienvenue chez Major ECN'}
          </span>
          <span className="block bg-gradient-to-r from-[#14B8A6] via-[#22D3EE] to-[#3B82F6] bg-clip-text text-transparent">
            {isCallback ? 'On vous rappelle sous 24 h' : 'Vérifiez votre boîte mail'}
          </span>
        </h3>
        <p className="relative mt-3 text-sm leading-relaxed text-[#4A5568] sm:text-base" style={{ fontFamily: MANROPE }}>
          {serverMsg}
        </p>
        {!isCallback && (
          <p className="relative mt-3 text-xs text-[#7A7A7A]" style={{ fontFamily: MANROPE }}>
            Pensez à regarder vos spams. Le lien d’activation expire dans 24 h.
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8 }}
      className="relative mx-auto mt-6 w-full max-w-6xl overflow-hidden rounded-2xl border-2 border-[#E8E7E3] bg-white p-3 text-left shadow-[0_25px_70px_-25px_rgba(107,26,42,0.25)] sm:mt-8 sm:rounded-3xl sm:p-8 lg:p-10"
    >
      {/* Halos décoratifs */}
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#6B1A2A]/12 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-[#3B82F6]/10 blur-3xl" />

      {/* Header form */}
      <div className="relative mb-6">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6B1A2A] via-[#3B82F6] to-[#14B8A6] px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white"
          style={{ fontFamily: MANROPE }}
        >
          <Sparkles className="h-3 w-3" />
          2 jours gratuits · sans carte
        </motion.span>
        <h3
          className="mt-4 text-2xl font-black leading-tight sm:text-3xl"
          style={{ fontFamily: JAKARTA, letterSpacing: '-0.025em' }}
        >
          <span className="block text-[#2D2D2D]">Créez votre compte</span>
          <span className="block bg-gradient-to-r from-[#6B1A2A] via-[#3B82F6] to-[#14B8A6] bg-clip-text text-transparent">
            en 30 secondes.
          </span>
        </h3>
      </div>

      {/* Champs */}
      <div className="relative grid gap-3 sm:grid-cols-2">
        <Field label="Prénom" name="first_name" icon={<User className="h-3.5 w-3.5" />} />
        <Field label="Nom" name="last_name" icon={<User className="h-3.5 w-3.5" />} />
        <Field label="Email" name="email" type="email" icon={<Mail className="h-3.5 w-3.5" />} className="sm:col-span-2" />
        <Field label="Téléphone" name="phone" type="tel" icon={<PhoneCall className="h-3.5 w-3.5" />} required={false} />
        <div className="relative space-y-1.5">
          <label htmlFor="promotion" className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-[#6B1A2A]" style={{ fontFamily: MANROPE }}>
            <GraduationCap className="h-3.5 w-3.5" />
            Promotion
          </label>
          <select
            id="promotion"
            name="promotion"
            defaultValue="D2"
            required
            className="w-full rounded-xl border-2 border-[#E8E7E3] bg-white px-4 py-3 text-sm font-medium text-[#2D2D2D] outline-none transition-all duration-200 focus:border-[#6B1A2A] focus:shadow-[0_0_0_4px_rgba(107,26,42,0.1)]"
            style={{ fontFamily: MANROPE }}
          >
            {PROMOTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="relative space-y-1.5 sm:col-span-2">
          <label htmlFor="offer" className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-[#6B1A2A]" style={{ fontFamily: MANROPE }}>
            <Sparkles className="h-3.5 w-3.5" />
            Formule souhaitée
          </label>
          <select
            id="offer"
            name="offer"
            required
            defaultValue="essentiel"
            className="w-full rounded-xl border-2 border-[#E8E7E3] bg-white px-4 py-3 text-sm font-medium text-[#2D2D2D] outline-none transition-all duration-200 focus:border-[#6B1A2A] focus:shadow-[0_0_0_4px_rgba(107,26,42,0.1)]"
            style={{ fontFamily: MANROPE }}
          >
            <option value="essentiel">Essentiel — 49 €/mois · accès immédiat</option>
            <option value="premium">Premium — 89 €/mois · accès immédiat</option>
            <option value="intensif">Intensif — 149 €/mois · rappel par un conseiller</option>
          </select>
        </div>
        <div className="relative space-y-2 sm:col-span-2">
          <label className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-[#6B1A2A]" style={{ fontFamily: MANROPE }}>
            <CheckCircle2 className="h-3.5 w-3.5" />
            Collèges qui vous intéressent
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-[#E8E7E3] bg-white px-4 py-2.5 has-[:checked]:border-[#6B1A2A] has-[:checked]:bg-[#F9F0F2]/60">
            <input
              type="checkbox"
              checked={allColleges}
              onChange={(e) => setAllColleges(e.target.checked)}
              className="peer sr-only"
            />
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-[#E8E7E3] peer-checked:border-[#6B1A2A] peer-checked:bg-[#6B1A2A]">
              {allColleges && (
                <svg viewBox="0 0 16 16" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8.5l3.5 3.5L13 4.5" />
                </svg>
              )}
            </span>
            <span className="text-sm font-bold text-[#2D2D2D]" style={{ fontFamily: JAKARTA }}>
              Toute l’offre — tous les collèges EVC
            </span>
          </label>
          {!allColleges && colleges.length > 0 && (
            <div className="grid grid-cols-2 gap-2 rounded-xl border-2 border-dashed border-[#E8E7E3] bg-[#FAFAF8] p-3 sm:grid-cols-3">
              {colleges.map((c) => {
                const checked = pickedColleges.has(c.nom);
                return (
                  <label key={c.id} className="flex cursor-pointer items-center gap-2 text-xs has-[:checked]:font-bold has-[:checked]:text-[#6B1A2A]">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCollege(c.nom)}
                      className="h-4 w-4 rounded border-[#E8E7E3] text-[#6B1A2A] focus:ring-[#6B1A2A]"
                    />
                    <span className="truncate" style={{ fontFamily: MANROPE }}>{c.nom}</span>
                  </label>
                );
              })}
            </div>
          )}
          {!allColleges && colleges.length === 0 && (
            <input
              name="colleges_wish_fallback"
              placeholder="ex. Cardiologie, Pédiatrie"
              className="w-full rounded-xl border-2 border-[#E8E7E3] bg-white px-4 py-3 text-sm text-[#2D2D2D] outline-none focus:border-[#6B1A2A]"
              style={{ fontFamily: MANROPE }}
            />
          )}
        </div>
      </div>

      {status === 'error' && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mt-4 flex items-start gap-2 rounded-xl border-2 border-[#C84A5A]/30 bg-[#FBF1F3] px-3.5 py-2.5 text-sm font-medium text-[#6B1A2A]"
          style={{ fontFamily: MANROPE }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {serverMsg}
        </motion.p>
      )}

      <motion.button
        type="submit"
        whileHover={{ scale: status === 'submitting' ? 1 : 1.02, y: status === 'submitting' ? 0 : -2 }}
        whileTap={{ scale: 0.98 }}
        disabled={status === 'submitting'}
        className="relative mt-6 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#6B1A2A] via-[#8B2A3A] to-[#C84A5A] px-6 py-4 text-sm font-black text-white shadow-[0_15px_40px_-10px_rgba(107,26,42,0.6)] transition-shadow disabled:opacity-60 sm:text-base"
        style={{ fontFamily: JAKARTA }}
      >
        {status === 'submitting' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
        {status === 'submitting' ? 'Création de votre compte…' : 'Accéder à l\'espace découverte'}
        {status !== 'submitting' && <ArrowRight className="h-5 w-5" />}
      </motion.button>

      <p className="relative mt-3 text-center text-[11px] text-[#7A7A7A]" style={{ fontFamily: MANROPE }}>
        ✓ Aucune carte bancaire · ✓ Sans engagement · ✓ Annulation instantanée
      </p>
    </motion.form>
  );
}

function Field({
  label, name, type = 'text', className = '', required = true, icon,
}: {
  label: string; name: string; type?: string; className?: string; required?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className={'relative space-y-1.5 ' + className}>
      <label
        htmlFor={name}
        className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-[#6B1A2A]"
        style={{ fontFamily: MANROPE }}
      >
        {icon}
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full rounded-xl border-2 border-[#E8E7E3] bg-white px-4 py-3 text-sm font-medium text-[#2D2D2D] outline-none transition-all duration-200 focus:border-[#6B1A2A] focus:shadow-[0_0_0_4px_rgba(107,26,42,0.1)]"
        style={{ fontFamily: MANROPE }}
      />
    </div>
  );
}
