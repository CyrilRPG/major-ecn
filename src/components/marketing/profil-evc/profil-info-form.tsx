'use client';

import { useState } from 'react';
import { ArrowRight, User, Mail, Phone, Stethoscope, ShieldCheck, Clock, Lock, BarChart3, CheckCircle2 } from 'lucide-react';
import { SPECIALITES } from '@/lib/diagnostic/specialites';

const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const NAVY = '#0F1F4D';
const INK = '#1F2937';
const INK_SOFT = '#52607A';

export type DiagInfo = {
  fullName: string;
  email: string;
  phone: string;
  specialty: string;
  voie: string;
  sessionEvc: string;
};

const SESSIONS = ['Session 2026', 'Session 2027', 'Session 2028 ou après', 'Je ne sais pas encore'];

const ARGS = [
  { Icon: Clock, title: 'RAPIDE', desc: 'Moins de 3 minutes pour faire le point.' },
  { Icon: Lock, title: 'CONFIDENTIEL', desc: 'Vos réponses restent sécurisées et confidentielles.' },
  { Icon: BarChart3, title: '100% PERSONNALISÉ', desc: 'Selon votre parcours, votre niveau et vos objectifs.' },
  { Icon: CheckCircle2, title: 'UTILE', desc: 'Des recommandations concrètes pour optimiser votre préparation.' },
];

export function ProfilInfoForm({
  initial,
  onSubmit,
}: {
  initial?: Partial<DiagInfo>;
  onSubmit: (info: DiagInfo) => void;
}) {
  const [fullName, setFullName] = useState(initial?.fullName ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [specialty, setSpecialty] = useState(initial?.specialty ?? '');
  const [voie, setVoie] = useState(initial?.voie ?? '');
  const [sessionEvc, setSessionEvc] = useState(initial?.sessionEvc ?? '');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) return setError('Veuillez indiquer votre nom et prénom.');
    if (!email.includes('@') || !email.includes('.')) return setError('Veuillez saisir un e-mail valide.');
    if (phone.replace(/\D/g, '').length < 8) return setError('Veuillez saisir un téléphone valide.');
    if (!specialty) return setError('Veuillez sélectionner votre spécialité.');
    if (!voie) return setError('Veuillez indiquer votre voie de préparation.');
    if (!sessionEvc) return setError('Veuillez indiquer quand vous prévoyez de passer les EVC.');
    if (!consent) return setError('Veuillez accepter d’être recontacté pour recevoir votre diagnostic.');
    onSubmit({ fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), specialty, voie, sessionEvc });
  }

  const field = 'flex items-center gap-2 rounded-xl border px-3 py-2.5';
  const border = { borderColor: '#E7EAF0' };

  return (
    <div className="grid w-full bg-white lg:grid-cols-[1fr_1.15fr]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ===== Panneau gauche argumentaire ===== */}
      <div className="relative overflow-hidden px-6 py-7 text-white sm:px-8" style={{ background: `linear-gradient(160deg, ${NAVY} 0%, #241042 100%)` }}>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em]">
          Votre diagnostic EVC
        </span>
        <h2 className="mt-4 text-[26px] font-black leading-[1.05] sm:text-[30px]">
          Déterminez <span style={{ color: '#FF6B81' }}>votre profil EVC</span>
        </h2>
        <p className="mt-3 text-[13.5px] leading-relaxed text-white/75">
          Avant de commencer, merci de compléter ces quelques informations afin que nous puissions personnaliser votre diagnostic.
        </p>
        <ul className="mt-6 space-y-3">
          {ARGS.map(({ Icon, title, desc }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10" style={{ color: '#FFC107' }}>
                <Icon className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-[12.5px] font-black tracking-wide">{title}</p>
                <p className="text-[12px] leading-snug text-white/70">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ===== Formulaire ===== */}
      <form onSubmit={submit} className="px-6 py-7 sm:px-8">
        <p className="flex items-center gap-2 text-[15px] font-black" style={{ color: NAVY }}>
          <User className="h-4.5 w-4.5" style={{ color: RED }} /> Vos informations
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-[11px] font-bold" style={{ color: INK_SOFT }}>Nom et prénom</label>
            <div className={field} style={border}>
              <User className="h-4 w-4 shrink-0 text-gray-400" />
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Entrez votre nom et prénom" className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-gray-400" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold" style={{ color: INK_SOFT }}>Adresse e-mail</label>
            <div className={field} style={border}>
              <Mail className="h-4 w-4 shrink-0 text-gray-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Entrez votre adresse e-mail" className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-gray-400" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold" style={{ color: INK_SOFT }}>Téléphone</label>
            <div className={field} style={border}>
              <Phone className="h-4 w-4 shrink-0 text-gray-400" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Entrez votre numéro de téléphone" className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-gray-400" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold" style={{ color: INK_SOFT }}>Spécialité</label>
            <div className={field} style={border}>
              <Stethoscope className="h-4 w-4 shrink-0 text-gray-400" />
              <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full bg-transparent text-[13.5px] outline-none">
                <option value="">Sélectionnez votre spécialité</option>
                {SPECIALITES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold" style={{ color: INK_SOFT }}>Voie de préparation</label>
            <div className="grid grid-cols-2 gap-2">
              {['Voie interne', 'Voie externe'].map((v) => {
                const active = voie === v;
                return (
                  <button key={v} type="button" onClick={() => setVoie(v)}
                    className="flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-[13px] font-semibold transition-all"
                    style={{ borderColor: active ? RED : '#E7EAF0', background: active ? '#FDF0F1' : '#fff', color: active ? RED_DEEP : INK }}>
                    <span className="flex h-4 w-4 items-center justify-center rounded-full border-2" style={{ borderColor: active ? RED : '#CBD2DD' }}>
                      {active && <span className="h-2 w-2 rounded-full" style={{ background: RED }} />}
                    </span>
                    {v}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold" style={{ color: INK_SOFT }}>Quand prévoyez-vous de passer les EVC ?</label>
            <div className={field} style={border}>
              <Clock className="h-4 w-4 shrink-0 text-gray-400" />
              <select value={sessionEvc} onChange={(e) => setSessionEvc(e.target.value)} className="w-full bg-transparent text-[13.5px] outline-none">
                <option value="">Sélectionnez une option</option>
                {SESSIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <label className="flex items-start gap-2.5 pt-1">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded" style={{ accentColor: RED }} />
            <span className="text-[11.5px] leading-relaxed" style={{ color: INK_SOFT }}>
              J’accepte d’être contacté(e) afin de recevoir mon diagnostic personnalisé et des conseils de préparation.
            </span>
          </label>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] font-medium text-red-700">{error}</p>}

          <button type="submit" className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[14px] font-extrabold text-white shadow-lg transition-transform hover:scale-[1.01]" style={{ background: `linear-gradient(90deg, ${RED_DEEP}, ${RED})` }}>
            Commencer le diagnostic <ArrowRight className="h-4.5 w-4.5" />
          </button>
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <ShieldCheck className="h-3 w-3" /> Vos données sont sécurisées et ne seront jamais partagées.
          </p>
        </div>
      </form>
    </div>
  );
}
