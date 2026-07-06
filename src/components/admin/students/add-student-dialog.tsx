'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Trash2, UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CollegeAccessPicker, OfferPicker, type College, type AccessValue } from './college-access-picker';

type OfferOption = { id: 'essentiel' | 'intensif' | 'approfondi'; label: string; unlocks: string[] };
type Mode = 'single' | 'bulk';

const IdentitySchema = z.object({
  first_name: z.string().min(1, 'Prénom requis'),
  last_name: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
});
type IdentityInput = z.infer<typeof IdentitySchema>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AddStudentDialog({
  colleges,
  offers,
}: {
  colleges: College[];
  offers: OfferOption[];
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('single');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<string | null>(null);
  const router = useRouter();
  const [pending, start] = useTransition();

  const [offer, setOffer] = useState<OfferOption['id']>('essentiel');
  // Voie obligatoire pour toute spécialité → défaut 'interne'.
  const [access, setAccess] = useState<AccessValue>({ permissionType: 'all', colleges: [], voie: 'interne' });
  const [emails, setEmails] = useState<string[]>(['']);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<IdentityInput>({
    resolver: zodResolver(IdentitySchema),
  });

  const resetAll = () => {
    reset();
    setOffer('essentiel');
    setAccess({ permissionType: 'all', colleges: [], voie: 'interne' });
    setEmails(['']);
    setSubmitError(null);
    setBulkResult(null);
    setMode('single');
  };

  const accessPayload = () => ({
    offer,
    permission_type: access.permissionType,
    colleges: access.permissionType === 'college' ? access.colleges : [],
    voie: access.voie ?? 'interne',
  });

  // ---- Mode « un élève » ----
  const onSubmitSingle = (identity: IdentityInput) => {
    setSubmitError(null);
    start(async () => {
      const res = await fetch('/api/admin/create-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...identity, ...accessPayload() }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string; warning?: string };
      if (!res.ok) { setSubmitError(j.error ?? 'Erreur à la création.'); return; }
      resetAll();
      setOpen(false);
      router.refresh();
    });
  };

  // ---- Mode « invitation en masse » ----
  const onSubmitBulk = () => {
    setSubmitError(null);
    setBulkResult(null);
    const valid = Array.from(new Set(emails.map((e) => e.trim().toLowerCase()).filter((e) => EMAIL_RE.test(e))));
    if (valid.length === 0) { setSubmitError('Ajoutez au moins un email valide.'); return; }
    start(async () => {
      const res = await fetch('/api/admin/create-students-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: valid, ...accessPayload() }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        error?: string;
        summary?: { total: number; created: number; emailFailed: number; skipped: number; failed: number };
      };
      if (!res.ok) { setSubmitError(j.error ?? "Erreur lors de l'envoi des invitations."); return; }
      const s = j.summary;
      setBulkResult(
        s ? `${s.created} invitation(s) envoyée(s)`
          + (s.skipped ? ` · ${s.skipped} déjà existant(s)` : '')
          + (s.emailFailed ? ` · ${s.emailFailed} email(s) non envoyé(s)` : '')
          + (s.failed ? ` · ${s.failed} échec(s)` : '')
          : 'Invitations traitées.',
      );
      router.refresh();
    });
  };

  const updateEmail = (i: number, v: string) => setEmails((e) => e.map((x, k) => (k === i ? v : x)));
  const addEmail = () => setEmails((e) => [...e, '']);
  const removeEmail = (i: number) => setEmails((e) => (e.length <= 1 ? [''] : e.filter((_, k) => k !== i)));

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetAll(); }}>
      <DialogTrigger asChild>
        <Button size="md">
          <Plus />
          Ajouter un élève
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-(--color-primary)" />
            Nouvel élève
          </DialogTitle>
          <DialogDescription>
            Créez un élève et envoyez-lui une invitation (bienvenue + choix de mot de passe).
          </DialogDescription>
        </DialogHeader>

        {/* Choix du mode */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => { setMode('single'); setSubmitError(null); setBulkResult(null); }}
            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold ${mode === 'single' ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary)' : 'border-(--color-border) text-(--color-ink-soft)'}`}
          >
            <UserPlus className="h-4 w-4" /> Un élève (nom, prénom, mail)
          </button>
          <button
            type="button"
            onClick={() => { setMode('bulk'); setSubmitError(null); setBulkResult(null); }}
            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold ${mode === 'bulk' ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary)' : 'border-(--color-border) text-(--color-ink-soft)'}`}
          >
            <Users className="h-4 w-4" /> En masse (par email)
          </button>
        </div>

        {mode === 'single' ? (
          <form onSubmit={handleSubmit(onSubmitSingle)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="first_name">Prénom</Label>
                <Input id="first_name" {...register('first_name')} />
                {errors.first_name && <p className="text-xs text-(--color-danger)">{errors.first_name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last_name">Nom</Label>
                <Input id="last_name" {...register('last_name')} />
                {errors.last_name && <p className="text-xs text-(--color-danger)">{errors.last_name.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} placeholder="prenom@exemple.fr" />
              {errors.email && <p className="text-xs text-(--color-danger)">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" {...register('phone')} placeholder="06 12 34 56 78" />
            </div>

            <OfferPicker offers={offers} value={offer} onChange={setOffer} />
            <CollegeAccessPicker colleges={colleges} value={access} onChange={setAccess} />

            {submitError && (
              <p className="text-sm text-(--color-danger) bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{submitError}</p>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => { setOpen(false); resetAll(); }} disabled={pending}>Annuler</Button>
              <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="animate-spin" /> : <UserPlus />}
                Créer l’élève
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3 py-2.5 text-xs text-(--color-ink-soft)">
              Choisissez le collège / les items, la formule et la voie <strong>communs à tout le groupe</strong>, puis
              ajoutez les emails. Chaque élève reçoit une invitation où il renseigne lui-même son nom, prénom et mot de
              passe — avec exactement les accès définis ici.
            </p>

            <OfferPicker offers={offers} value={offer} onChange={setOffer} />
            <CollegeAccessPicker colleges={colleges} value={access} onChange={setAccess} />

            <div className="space-y-2">
              <Label>Emails des élèves à inviter</Label>
              <div className="space-y-2">
                {emails.map((em, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      type="email"
                      value={em}
                      onChange={(e) => updateEmail(i, e.target.value)}
                      placeholder={`eleve${i + 1}@exemple.fr`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEmail(i)}
                      aria-label="Retirer cet email"
                      disabled={emails.length <= 1 && !emails[0]}
                    >
                      <Trash2 className="h-4 w-4 text-(--color-ink-soft)" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={addEmail} className="gap-1.5">
                <Plus className="h-4 w-4" /> Ajouter un email
              </Button>
            </div>

            {submitError && (
              <p className="text-sm text-(--color-danger) bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{submitError}</p>
            )}
            {bulkResult && (
              <p className="rounded-lg bg-[color-mix(in_srgb,#16A34A_10%,white)] px-3 py-2 text-sm font-semibold text-[#16793C]">
                {bulkResult}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => { setOpen(false); resetAll(); }} disabled={pending}>Fermer</Button>
              <Button type="button" onClick={onSubmitBulk} disabled={pending}>
                {pending ? <Loader2 className="animate-spin" /> : <Users />}
                Envoyer les invitations
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
