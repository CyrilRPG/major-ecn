'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Pencil, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { UpdateStudentSchema, type UpdateStudentInput } from '@/lib/schemas/student';
import { parseScope } from '@/lib/auth/permissions';

const PROMOTIONS: UpdateStudentInput['promotion'][] = ['D2', 'D3', 'D4', 'PAE', 'Autre'];

export type EditStudentTarget = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  promotion: string | null;
  permission_scope: unknown;
};

export function EditStudentDialog({
  student,
  colleges,
}: {
  student: EditStudentTarget;
  colleges: { id: string; nom: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const [pending, start] = useTransition();

  const initialScope = parseScope(student.permission_scope);
  const defaultPromotion = (PROMOTIONS as string[]).includes(student.promotion ?? '')
    ? (student.promotion as UpdateStudentInput['promotion'])
    : 'D2';

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateStudentInput>({
    resolver: zodResolver(UpdateStudentSchema),
    defaultValues: {
      id: student.id,
      first_name: student.first_name ?? '',
      last_name: student.last_name ?? '',
      phone: student.phone ?? '',
      promotion: defaultPromotion,
      offer: initialScope.offer,
      permission_type: initialScope.type,
      colleges: initialScope.type === 'college' ? initialScope.colleges : [],
    },
  });

  const permissionType = watch('permission_type');

  const onSubmit = (data: UpdateStudentInput) => {
    setSubmitError(null);
    start(async () => {
      const res = await fetch('/api/admin/update-student', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setSubmitError(j.error ?? 'Erreur lors de la mise à jour.');
        return;
      }
      setOpen(false);
      reset(data);
      router.refresh();
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setSubmitError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Modifier le profil" title="Modifier le profil">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-(--color-accent)" />
            Modifier le profil
          </DialogTitle>
          <DialogDescription>
            Mets à jour les coordonnées et les permissions de cet élève. Les changements sont visibles immédiatement.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('id')} />

          <div className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3 py-2.5 text-xs text-(--color-ink-soft)">
            Email <span className="font-mono text-(--color-ink)">{student.email}</span>{' '}
            <span className="opacity-70">(non modifiable depuis cet écran)</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-first_name">Prénom</Label>
              <Input id="edit-first_name" {...register('first_name')} />
              {errors.first_name && <p className="text-xs text-(--color-danger)">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-last_name">Nom</Label>
              <Input id="edit-last_name" {...register('last_name')} />
              {errors.last_name && <p className="text-xs text-(--color-danger)">{errors.last_name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-phone">Téléphone</Label>
              <Input id="edit-phone" {...register('phone')} placeholder="06 12 34 56 78" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-promotion">Promotion</Label>
              <Controller
                name="promotion"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROMOTIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Formule souscrite</Label>
            <p className="text-xs text-(--color-ink-soft)">
              Quel type d’offre l’élève a-t-il souscrit&nbsp;?
            </p>
            <Controller
              name="offer"
              control={control}
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange}>
                  <label className="flex items-center gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 cursor-pointer hover:bg-(--color-primary-soft)">
                    <RadioGroupItem value="essentiel" />
                    <span className="text-sm">Essentiel — 49 €/mois · accès aux QCM, flashcards et suivi de base</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 cursor-pointer hover:bg-(--color-primary-soft)">
                    <RadioGroupItem value="premium" />
                    <span className="text-sm">Premium — 89 €/mois · IA pédagogique, examens blancs, tuteur dédié</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 cursor-pointer hover:bg-(--color-primary-soft)">
                    <RadioGroupItem value="intensif" />
                    <span className="text-sm">Intensif — 149 €/mois · sessions 1:1, plan sur-mesure, garantie</span>
                  </label>
                </RadioGroup>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Accès aux collèges</Label>
            <Controller
              name="permission_type"
              control={control}
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange}>
                  <label className="flex items-center gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 cursor-pointer hover:bg-(--color-primary-soft)">
                    <RadioGroupItem value="all" />
                    <span className="text-sm">Toute l’offre (tous les collèges)</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 cursor-pointer hover:bg-(--color-primary-soft)">
                    <RadioGroupItem value="college" />
                    <span className="text-sm">Collèges spécifiques</span>
                  </label>
                </RadioGroup>
              )}
            />
            {permissionType === 'college' && (
              <div className="ml-1 mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Controller
                  name="colleges"
                  control={control}
                  render={({ field }) => (
                    <>
                      {colleges.map((c) => {
                        const checked = field.value?.includes(c.id) ?? false;
                        return (
                          <label key={c.id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => {
                                const set = new Set(field.value ?? []);
                                if (v) set.add(c.id);
                                else set.delete(c.id);
                                field.onChange(Array.from(set));
                              }}
                            />
                            {c.nom}
                          </label>
                        );
                      })}
                    </>
                  )}
                />
              </div>
            )}
          </div>

          {submitError && (
            <p className="text-sm text-(--color-danger) bg-red-500/10 border border-(--color-danger)/30 rounded-lg px-3 py-2">
              {submitError}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Annuler</Button>
            <Button type="submit" disabled={pending || !isDirty}>
              {pending ? <Loader2 className="animate-spin" /> : <Save />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
