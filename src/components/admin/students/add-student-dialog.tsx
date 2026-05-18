'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, UserPlus } from 'lucide-react';
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
import { AddStudentSchema, type AddStudentInput } from '@/lib/schemas/student';

const PROMOTIONS: AddStudentInput['promotion'][] = ['D2', 'D3', 'D4', 'PAE', 'Autre'];

export function AddStudentDialog({ colleges }: { colleges: { id: string; nom: string }[] }) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const [pending, start] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AddStudentInput>({
    resolver: zodResolver(AddStudentSchema),
    defaultValues: { permission_type: 'all', promotion: 'D2', colleges: [] },
  });

  const permissionType = watch('permission_type');

  const onSubmit = (data: AddStudentInput) => {
    setSubmitError(null);
    start(async () => {
      const res = await fetch('/api/admin/create-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setSubmitError(j.error ?? 'Erreur à la création.');
        return;
      }
      reset();
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="md">
          <Plus />
          Ajouter un élève
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" {...register('phone')} placeholder="06 12 34 56 78" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="promotion">Promotion</Label>
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
            <Label>Permissions</Label>
            <Controller
              name="permission_type"
              control={control}
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange}>
                  <label className="flex items-center gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 cursor-pointer hover:bg-(--color-surface-soft)">
                    <RadioGroupItem value="all" />
                    <span className="text-sm">Toute l’offre (tous les collèges)</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 cursor-pointer hover:bg-(--color-surface-soft)">
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
            <p className="text-sm text-(--color-danger) bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
              {submitError}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Annuler</Button>
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
