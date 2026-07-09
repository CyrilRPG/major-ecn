'use client';

import { useState, type FormEvent } from 'react';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const STORAGE_KEY = 'prive-auth';

// Niveaux d'accès selon le code saisi :
// - 'full'   → accès à tous les cours
// - 'alexis' → accès au seul cours « Alexis » (banque d'annales)
export type PriveAccess = 'full' | 'alexis';

const CODES: Record<string, PriveAccess> = {
  rattrapagesrelou: 'full',
  vinciane123: 'alexis',
};

// Slugs autorisés pour un accès restreint.
const ALEXIS_SLUGS = ['alexis'];

/** Renvoie le niveau d'accès courant, ou null si non authentifié. */
export function getPriveAccess(): PriveAccess | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored && CODES[stored] ? CODES[stored] : null;
}

export function usePriveAuth() {
  return getPriveAccess() !== null;
}

/** Un cours est-il accessible pour ce niveau d'accès ? */
export function canAccessCours(access: PriveAccess | null, slug: string): boolean {
  if (access === 'full') return true;
  if (access === 'alexis') return ALEXIS_SLUGS.includes(slug);
  return false;
}

/** Filtre la liste des matières/cours selon le niveau d'accès. */
export function filterMatieresForAccess<
  M extends { cours: { slug: string }[] }
>(matieres: M[], access: PriveAccess | null): M[] {
  if (access === 'full') return matieres;
  if (access === 'alexis') {
    return matieres
      .map((m) => ({ ...m, cours: m.cours.filter((c) => ALEXIS_SLUGS.includes(c.slug)) }))
      .filter((m) => m.cours.length > 0);
  }
  return [];
}

export function CodeGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const entered = code.trim().toLowerCase();
    if (CODES[entered]) {
      localStorage.setItem(STORAGE_KEY, entered);
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFBFE] px-4">
      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-lg ${shake ? 'animate-shake' : ''}`}
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <Lock className="h-7 w-7 text-[#C0112E]" />
        </div>

        <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-[#C0112E]">
          Major ECN
        </p>

        <h1 className="mt-2 text-center text-xl font-extrabold tracking-tight text-[#0F1F4D]">
          Espace Nephrologie
        </h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          Veuillez entrer le code d&apos;acces
        </p>

        <div className="mt-6">
          <input
            type="password"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(false); }}
            placeholder="Code d'acces"
            autoFocus
            className="w-full rounded-xl border border-gray-200 bg-[#FAFBFE] px-4 py-3 text-center text-sm text-[#0F1F4D] placeholder:text-gray-400 outline-none transition-colors focus:border-[#C0112E] focus:ring-2 focus:ring-[#C0112E]/20"
          />
          {error && (
            <p className="mt-2 text-center text-xs font-medium text-[#C0112E]">
              Code incorrect
            </p>
          )}
        </div>

        <button
          type="submit"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#C0112E] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#a00f27] hover:shadow-md"
        >
          Acceder
          <ArrowRight className="h-4 w-4" />
        </button>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
          <ShieldCheck className="h-3 w-3" />
          Espace confidentiel
        </div>
      </form>
    </div>
  );
}
