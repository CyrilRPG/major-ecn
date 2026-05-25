'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AddProfessorSchema, type AddProfessorInput,
  CONTENT_TYPES, CONTENT_TYPE_LABEL, type ContentType,
} from '@/lib/schemas/professor';

export function AddProfessorDialog({ colleges }: { colleges: { id: string; nom: string }[] }) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const [pending, start] = useTransition();

  const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm<AddProfessorInput>({
    resolver: zodResolver(AddProfessorSchema),
    defaultValues: {
      permission_type: 'all',
      colleges: [],
      content_scope: 'all',
      content_types: [],
    },
  });

  const permissionType = watch('permission_type');
  const contentScope = watch('content_scope');

  const onSubmit = (data: AddProfessorInput) => {
    setSubmitError(null);
    start(async () => {
      const res = await fetch('/api/admin/create-professor', {
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
          Ajouter un professeur
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-(--color-primary)" />
            Nouveau professeur
          </DialogTitle>
          <DialogDescription>
            Un compte est créé et une invitation par email est envoyée au professeur pour choisir
            son mot de passe.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prof_first_name">Prénom</Label>
              <Input id="prof_first_name" {...register('first_name')} />
              {errors.first_name && <p className="text-xs text-(--color-danger)">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prof_last_name">Nom</Label>
              <Input id="prof_last_name" {...register('last_name')} />
              {errors.last_name && <p className="text-xs text-(--color-danger)">{errors.last_name.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prof_email">Email</Label>
            <Input id="prof_email" type="email" {...register('email')} placeholder="prenom@exemple.fr" />
            {errors.email && <p className="text-xs text-(--color-danger)">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prof_phone">Téléphone (optionnel)</Label>
            <Input id="prof_phone" {...register('phone')} placeholder="06 12 34 56 78" />
          </div>

          {/* Collèges */}
          <div className="space-y-2">
            <Label>Accès aux collèges</Label>
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
                                if (v) set.add(c.id); else set.delete(c.id);
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

          {/* Types de contenu */}
          <div className="space-y-2">
            <Label>Types de contenu accessibles</Label>
            <p className="text-xs text-(--color-ink-soft)">
              Les professeurs sont des prestataires externes : limitez leur accès au minimum nécessaire.
            </p>
            <Controller
              name="content_scope"
              control={control}
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange}>
                  <label className="flex items-center gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 cursor-pointer hover:bg-(--color-surface-soft)">
                    <RadioGroupItem value="all" />
                    <span className="text-sm">Tous les contenus (QCM, fiches, vidéos, annales, flashcards)</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 cursor-pointer hover:bg-(--color-surface-soft)">
                    <RadioGroupItem value="specific" />
                    <span className="text-sm">Types de contenus spécifiques</span>
                  </label>
                </RadioGroup>
              )}
            />
            {contentScope === 'specific' && (
              <div className="ml-1 mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Controller
                  name="content_types"
                  control={control}
                  render={({ field }) => (
                    <>
                      {CONTENT_TYPES.map((t) => {
                        const checked = (field.value as ContentType[] | undefined)?.includes(t) ?? false;
                        return (
                          <label key={t} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => {
                                const set = new Set(field.value ?? []);
                                if (v) set.add(t); else set.delete(t);
                                field.onChange(Array.from(set));
                              }}
                            />
                            {CONTENT_TYPE_LABEL[t]}
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
              Créer le professeur
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
