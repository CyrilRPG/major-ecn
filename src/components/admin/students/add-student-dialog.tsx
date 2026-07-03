'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CollegeAccessPicker, OfferPicker, MG_COLLEGE_ID, type College, type AccessValue } from './college-access-picker';

type OfferOption = { id: 'essentiel' | 'intensif' | 'approfondi'; label: string; unlocks: string[] };

// Sous-schéma d'identité uniquement (les accès sont gérés par le picker).
const IdentitySchema = z.object({
  first_name: z.string().min(1, 'Prénom requis'),
  last_name: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
});
type IdentityInput = z.infer<typeof IdentitySchema>;

export function AddStudentDialog({
  colleges,
  offers,
}: {
  colleges: College[];
  offers: OfferOption[];
}) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const [pending, start] = useTransition();

  const [offer, setOffer] = useState<OfferOption['id']>('essentiel');
  const [access, setAccess] = useState<AccessValue>({ permissionType: 'all', colleges: [], voie: null });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IdentityInput>({ resolver: zodResolver(IdentitySchema) });

  const resetAll = () => {
    reset();
    setOffer('essentiel');
    setAccess({ permissionType: 'all', colleges: [], voie: null });
    setSubmitError(null);
  };

  const onSubmit = (identity: IdentityInput) => {
    setSubmitError(null);
    const mgSelected = access.permissionType === 'college' && access.colleges.includes(MG_COLLEGE_ID);
    const payload = {
      ...identity,
      offer,
      permission_type: access.permissionType,
      colleges: access.permissionType === 'college' ? access.colleges : [],
      voie: mgSelected ? access.voie : null,
    };
    start(async () => {
      const res = await fetch('/api/admin/create-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setSubmitError(j.error ?? 'Erreur à la création.');
        return;
      }
      resetAll();
      setOpen(false);
      router.refresh();
    });
  };

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
            Un compte est créé et une invitation est envoyée par email à l’élève.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <p className="text-sm text-(--color-danger) bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
              {submitError}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => { setOpen(false); resetAll(); }} disabled={pending}>Annuler</Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <UserPlus />}
              Créer l’élève
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
