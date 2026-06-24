'use client';

import { useState, type FormEvent } from 'react';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const CODE = 'rattrapagesrelou';
const STORAGE_KEY = 'prive-auth';

export function usePriveAuth() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === CODE;
}

export function CodeGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (code.trim().toLowerCase() === CODE) {
      localStorage.setItem(STORAGE_KEY, CODE);
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0E1626 0%, #161336 40%, #2A1130 75%, #2D0518 100%)' }}
    >
      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl ${shake ? 'animate-shake' : ''}`}
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
          <Lock className="h-7 w-7 text-white/60" />
        </div>

        <h1 className="text-center text-lg font-bold text-white">
          Accès restreint
        </h1>
        <p className="mt-1 text-center text-sm text-white/40">
          Veuillez entrer le code d'accès
        </p>

        <div className="mt-6">
          <input
            type="password"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(false); }}
            placeholder="Code d'accès"
            autoFocus
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/30"
          />
          {error && (
            <p className="mt-2 text-center text-xs font-medium text-red-400">
              Code incorrect
            </p>
          )}
        </div>

        <button
          type="submit"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
          style={{ background: 'linear-gradient(90deg, #8B0E22, #C0112E)' }}
        >
          Accéder
          <ArrowRight className="h-4 w-4" />
        </button>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-white/20">
          <ShieldCheck className="h-3 w-3" />
          Espace confidentiel
        </div>
      </form>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}
