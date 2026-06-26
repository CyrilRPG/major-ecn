'use client';

import { useState, type FormEvent } from 'react';
import { Download, Lock, Loader2 } from 'lucide-react';
import { SPECIALTIES } from '@/lib/data/guide-data';

type Props = {
  onSuccess?: () => void;
  compact?: boolean;
};

export function GuideForm({ onSuccess, compact }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      firstName: fd.get('lastName') as string,
      lastName: fd.get('firstName') as string,
      email: fd.get('email') as string,
      phone: fd.get('phone') as string,
      specialty: fd.get('specialty') as string,
      voie: fd.get('voie') as string,
      abVariant: 'landing',
      ctaVariant: 'page',
    };

    // Enregistrement du lead + email : best-effort, NE DOIT JAMAIS bloquer le
    // téléchargement (le guide est un fichier statique auquel l'utilisateur a
    // droit). On valide d'abord côté formulaire (champs requis), puis on lance
    // la capture du lead sans attendre, et on déclenche le téléchargement.
    try {
      void fetch('/api/guide-download', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {
        /* réseau indisponible : on n'empêche pas le téléchargement pour autant */
      });

      localStorage.setItem('guide-downloaded', '1');

      const link = document.createElement('a');
      link.href = '/guides/guide-methodologie-evc-2026.pdf';
      link.download = 'Guide-Methodologie-EVC-2026-Major-ECN.pdf';
      link.click();

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = '/guide-methodologie-evc-2026/merci';
      }
    } catch {
      // Même en cas d'erreur inattendue, on redirige vers la page « merci » qui
      // propose un bouton de téléchargement direct (fallback fiable).
      window.location.href = '/guide-methodologie-evc-2026/merci';
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className={compact ? '' : 'text-center'}>
        <h2 className={`font-extrabold text-[#0F1F4D] ${compact ? 'text-lg' : 'text-xl sm:text-2xl'}`}>
          Recevez votre guide gratuitement
        </h2>
        <p className="mt-1 text-sm text-[#52607A]">
          Remplissez le formulaire pour le télécharger immédiatement.
        </p>
      </div>

      <div>
        <label htmlFor="gf-lastName" className="mb-1 block text-sm font-semibold text-[#1A2233]">
          Nom <span className="text-[#C0001F]">*</span>
        </label>
        <input
          id="gf-lastName"
          name="lastName"
          type="text"
          required
          placeholder="Votre nom"
          className="w-full rounded-lg border border-[#D1D5DB] px-4 py-2.5 text-sm text-[#1A2233] outline-none transition-colors focus:border-[#C0001F] focus:ring-1 focus:ring-[#C0001F]"
        />
      </div>

      <div>
        <label htmlFor="gf-firstName" className="mb-1 block text-sm font-semibold text-[#1A2233]">
          Prénom <span className="text-[#C0001F]">*</span>
        </label>
        <input
          id="gf-firstName"
          name="firstName"
          type="text"
          required
          placeholder="Votre prénom"
          className="w-full rounded-lg border border-[#D1D5DB] px-4 py-2.5 text-sm text-[#1A2233] outline-none transition-colors focus:border-[#C0001F] focus:ring-1 focus:ring-[#C0001F]"
        />
      </div>

      <div>
        <label htmlFor="gf-email" className="mb-1 block text-sm font-semibold text-[#1A2233]">
          Email <span className="text-[#C0001F]">*</span>
        </label>
        <input
          id="gf-email"
          name="email"
          type="email"
          required
          placeholder="votre@email.com"
          className="w-full rounded-lg border border-[#D1D5DB] px-4 py-2.5 text-sm text-[#1A2233] outline-none transition-colors focus:border-[#C0001F] focus:ring-1 focus:ring-[#C0001F]"
        />
      </div>

      <div>
        <label htmlFor="gf-phone" className="mb-1 block text-sm font-semibold text-[#1A2233]">
          Téléphone <span className="text-[#C0001F]">*</span>
        </label>
        <input
          id="gf-phone"
          name="phone"
          type="tel"
          required
          placeholder="06 12 34 56 78"
          className="w-full rounded-lg border border-[#D1D5DB] px-4 py-2.5 text-sm text-[#1A2233] outline-none transition-colors focus:border-[#C0001F] focus:ring-1 focus:ring-[#C0001F]"
        />
      </div>

      <div>
        <label htmlFor="gf-specialty" className="mb-1 block text-sm font-semibold text-[#1A2233]">
          Spécialité <span className="text-[#C0001F]">*</span>
        </label>
        <select
          id="gf-specialty"
          name="specialty"
          required
          defaultValue=""
          className="w-full rounded-lg border border-[#D1D5DB] px-4 py-2.5 text-sm text-[#1A2233] outline-none transition-colors focus:border-[#C0001F] focus:ring-1 focus:ring-[#C0001F]"
        >
          <option value="" disabled>Sélectionnez votre spécialité</option>
          {SPECIALTIES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#1A2233]">
          Voie préparée <span className="text-[#C0001F]">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'externe', label: 'Voie externe (EVCF / EVCP)' },
            { value: 'interne', label: 'Voie interne (QCM)' },
          ].map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#D1D5DB] px-4 py-3 text-sm text-[#1A2233] transition-colors has-[:checked]:border-[#C0001F] has-[:checked]:bg-[#FFF5F6]"
            >
              <input type="radio" name="voie" value={opt.value} required className="accent-[#C0001F]" />
              <span className="text-[13px] leading-tight">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-[#9AA1AE]">
        <Lock className="h-3.5 w-3.5 shrink-0" />
        Vos données sont sécurisées et ne seront jamais partagées.
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C0001F] px-6 py-3.5 text-[15px] font-extrabold text-white shadow-lg transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Download className="h-5 w-5" />
        )}
        {loading ? 'Envoi en cours...' : 'Télécharger gratuitement le guide méthodologique EVC'}
      </button>
    </form>
  );
}
