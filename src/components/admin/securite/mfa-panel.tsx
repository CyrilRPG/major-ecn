'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Loader2, ShieldCheck, ShieldOff, Smartphone } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

type Facteur = { id: string; nom: string | null; cree: string };

/**
 * Activation / vérification / retrait de la double authentification (TOTP)
 * avec Supabase Auth, entièrement côté navigateur : le secret et le QR code
 * ne transitent que vers l'application d'authentification de la personne.
 *
 * Enrôlement en deux temps (`enroll` → QR → `challenge` + `verify`) : un
 * facteur non vérifié n'existe pas pour la plateforme, il est retiré si la
 * personne abandonne.
 */
export function MfaPanel({ facteurs, niveau, obligatoire }: { facteurs: Facteur[]; niveau: 'aal1' | 'aal2' | null; obligatoire: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [enrolement, setEnrolement] = useState<{ factorId: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState('');
  const [ok, setOk] = useState<string | null>(null);

  const supabase = createClient();

  const demarrer = () => {
    setError(null); setOk(null);
    start(async () => {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Application d’authentification' });
      if (error || !data) { setError(error?.message ?? 'Activation impossible.'); return; }
      setEnrolement({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
      setCode('');
    });
  };

  const confirmer = () => {
    if (!enrolement) return;
    setError(null);
    start(async () => {
      const { data: ch, error: e1 } = await supabase.auth.mfa.challenge({ factorId: enrolement.factorId });
      if (e1 || !ch) { setError(e1?.message ?? 'Vérification impossible.'); return; }
      const { error: e2 } = await supabase.auth.mfa.verify({ factorId: enrolement.factorId, challengeId: ch.id, code: code.trim() });
      if (e2) { setError('Code refusé : vérifiez l’heure de votre téléphone et réessayez.'); return; }
      setEnrolement(null);
      setOk('Double authentification activée. Un code vous sera demandé à chaque nouvelle session.');
      router.refresh();
    });
  };

  const abandonner = () => {
    if (!enrolement) return;
    start(async () => {
      await supabase.auth.mfa.unenroll({ factorId: enrolement.factorId });
      setEnrolement(null);
    });
  };

  const retirer = (factorId: string) => {
    if (obligatoire) { setError('La double authentification est obligatoire pour votre compte : elle ne peut pas être retirée.'); return; }
    if (!confirm('Retirer la double authentification de votre compte ?')) return;
    setError(null); setOk(null);
    start(async () => {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) { setError(error.message); return; }
      setOk('Double authentification retirée.');
      router.refresh();
    });
  };

  return (
    <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-(--color-ink)">
            <Smartphone className="h-4 w-4 text-(--color-ink-soft)" /> Double authentification (2FA)
          </h2>
          <p className="mt-1 text-sm text-(--color-ink-soft)">
            Un code à six chiffres, généré par une application (Google Authenticator, Authy, 1Password…), en plus du mot de passe.
            {obligatoire && <strong className="text-[#A91D2C]"> Obligatoire pour votre compte.</strong>}
          </p>
        </div>
        {facteurs.length > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F6EC] px-2.5 py-1 text-xs font-bold text-[#16793C]">
            <ShieldCheck className="h-3.5 w-3.5" /> Activée{niveau === 'aal2' ? ' · session vérifiée' : ''}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-(--color-sand-100) px-2.5 py-1 text-xs font-bold text-(--color-ink-soft)">
            <ShieldOff className="h-3.5 w-3.5" /> Non activée
          </span>
        )}
      </div>

      {facteurs.length > 0 && !enrolement && (
        <ul className="mt-4 space-y-2">
          {facteurs.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-3 rounded-xl border border-(--color-border) px-3 py-2 text-sm">
              <span>
                <span className="font-semibold text-(--color-ink)">{f.nom ?? 'Application d’authentification'}</span>
                <span className="ml-2 text-xs text-(--color-ink-muted)">activée le {new Date(f.cree).toLocaleDateString('fr-FR')}</span>
              </span>
              <Button size="sm" variant="outline" disabled={pending || obligatoire} onClick={() => retirer(f.id)}>Retirer</Button>
            </li>
          ))}
        </ul>
      )}

      {facteurs.length === 0 && !enrolement && (
        <div className="mt-4">
          <Button onClick={demarrer} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <KeyRound />} Activer la double authentification
          </Button>
        </div>
      )}

      {enrolement && (
        <div className="mt-4 grid gap-4 rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-4 sm:grid-cols-[180px_1fr]">
          {/* Le QR code est un SVG data-URI généré par Supabase Auth. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enrolement.qr} alt="QR code à scanner avec votre application d’authentification" className="h-44 w-44 rounded-lg bg-white p-2" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-(--color-ink)">1. Scannez ce QR code avec votre application.</p>
            <p className="mt-1 break-all text-xs text-(--color-ink-muted)">
              Saisie manuelle : <code className="rounded bg-white px-1 py-0.5">{enrolement.secret}</code>
            </p>
            <p className="mt-3 text-sm font-semibold text-(--color-ink)">2. Saisissez le code affiché.</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                className="h-10 w-32 rounded-lg border border-(--color-border) bg-white px-3 font-mono text-lg tracking-[0.3em] text-(--color-ink)"
              />
              <Button onClick={confirmer} disabled={pending || code.length !== 6}>
                {pending ? <Loader2 className="animate-spin" /> : <ShieldCheck />} Confirmer
              </Button>
              <Button variant="ghost" onClick={abandonner} disabled={pending}>Annuler</Button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-sm font-medium text-[#A91D2C]">{error}</p>}
      {ok && <p className="mt-3 text-sm font-medium text-[#16793C]">{ok}</p>}
    </section>
  );
}
