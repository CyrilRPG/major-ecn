'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Popup OBLIGATOIRE de complétion de profil. Affiché en superposition bloquante
 * tant que l'élève n'a pas renseigné les informations requises (prénom, nom,
 * téléphone). Impossible à fermer : pas de bouton fermer, pas de fermeture au
 * clic extérieur ni à Échap. À la validation, les données sont écrites sur le
 * profil (donc visibles dans la liste élèves) puis la page est rafraîchie.
 *
 * Le layout (student) ne le rend que lorsque `missing` est non vide, mais on
 * re-vérifie ici pour ne jamais bloquer un profil déjà complet.
 */
export function ProfileCompletionGate({
  initialFirstName,
  initialLastName,
  initialPhone,
}: {
  initialFirstName: string | null;
  initialLastName: string | null;
  initialPhone: string | null;
}) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(initialFirstName ?? '');
  const [lastName, setLastName] = useState(initialLastName ?? '');
  const [phone, setPhone] = useState(initialPhone ?? '');
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const incomplete =
    !(initialFirstName ?? '').trim() ||
    !(initialLastName ?? '').trim() ||
    !(initialPhone ?? '').trim();
  if (!incomplete) return null;

  const canSubmit = firstName.trim() && lastName.trim() && phone.replace(/\D/g, '').length >= 6;

  const submit = () => {
    if (!canSubmit) {
      setError('Merci de renseigner votre prénom, votre nom et un téléphone valide.');
      return;
    }
    setError(null);
    start(async () => {
      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone,
          require_phone: true,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? 'Une erreur est survenue. Réessayez.');
        return;
      }
      router.refresh();
    });
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-(--color-ink)/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-gate-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-lifted)">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-(--color-primary-soft) text-(--color-primary)">
          <UserRound className="h-6 w-6" />
        </span>
        <h1 id="profile-gate-title" className="mt-4 text-center font-display text-xl font-bold text-(--color-ink)">
          Complétez votre profil
        </h1>
        <p className="mt-2 text-center text-sm text-(--color-ink-soft)">
          Ces informations sont obligatoires pour accéder à la plateforme et
          figurer correctement dans le suivi pédagogique.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wide text-(--color-ink-muted)">Prénom *</span>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1" autoFocus />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wide text-(--color-ink-muted)">Nom *</span>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1" />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-(--color-ink-muted)">Téléphone *</span>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+33 6 12 34 56 78"
              inputMode="tel"
              className="mt-1"
            />
          </label>
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-(--color-danger)/30 bg-red-50 px-3 py-2 text-sm text-(--color-danger)">
            {error}
          </p>
        )}

        <Button type="button" variant="primary" className="mt-5 w-full" onClick={submit} disabled={pending || !canSubmit}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Enregistrer et continuer
        </Button>
        <p className="mt-3 text-center text-[11px] text-(--color-ink-muted)">
          Une erreur dans ces informations ? Écrivez à{' '}
          <a className="font-semibold text-(--color-primary)" href="mailto:contact@major-ecn.fr">contact@major-ecn.fr</a>.
        </p>
      </div>
    </div>
  );
}
