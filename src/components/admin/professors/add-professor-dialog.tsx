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
  CONTENT_TYPES, CONTENT_TYPE_LABEL,
  PERMISSION_LEVELS, PERMISSION_LEVEL_LABEL, type PermissionLevel,
} from '@/lib/schemas/professor';

export function AddProfessorDialog({
  colleges,
  coursByCollege,
}: {
  colleges: { id: string; nom: string }[];
  coursByCollege: Record<string, { id: string; titre: string }[]>;
}) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const [pending, start] = useTransition();

  const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm<AddProfessorInput>({
    resolver: zodResolver(AddProfessorSchema),
    defaultValues: {
      permission_type: 'all',
      colleges: [],
      content_permissions: Object.fromEntries(
        CONTENT_TYPES.map((t) => [t, 'rw' as PermissionLevel]),
      ),
    },
  });

  const permissionType = watch('permission_type');
  const selectedColleges = watch('colleges') ?? [];

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

          {/* Cours spécifiques au sein du / des collège(s) sélectionné(s) */}
          {permissionType === 'college' && selectedColleges.length > 0 && (
            <div className="space-y-2">
              <Label>Cours accessibles dans ce collège</Label>
              <p className="text-xs text-(--color-ink-soft)">
                Laissez tout coché pour donner accès à tous les cours du collège, ou sélectionnez
                uniquement les items que ce professeur doit pouvoir consulter / modifier.
              </p>
              <Controller
                name="cours"
                control={control}
                render={({ field }) => {
                  const value = field.value ?? [];
                  return (
                    <div className="space-y-3">
                      {selectedColleges.map((collegeId) => {
                        const college = colleges.find((c) => c.id === collegeId);
                        const courses = coursByCollege[collegeId] ?? [];
                        if (!college) return null;
                        const collegeCoursIds = courses.map((c) => c.id);
                        const allChecked = courses.length > 0 && collegeCoursIds.every((id) => value.includes(id));
                        return (
                          <div key={collegeId} className="rounded-xl border border-(--color-border) p-3">
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-(--color-ink)">{college.nom}</p>
                              <button
                                type="button"
                                onClick={() => {
                                  const set = new Set(value);
                                  if (allChecked) collegeCoursIds.forEach((id) => set.delete(id));
                                  else collegeCoursIds.forEach((id) => set.add(id));
                                  field.onChange(Array.from(set));
                                }}
                                className="text-xs font-medium text-(--color-primary) hover:underline"
                              >
                                {allChecked ? 'Tout décocher' : 'Tout cocher'}
                              </button>
                            </div>
                            {courses.length === 0 ? (
                              <p className="text-xs text-(--color-ink-muted)">Aucun cours dans ce collège.</p>
                            ) : (
                              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                                {courses.map((c) => {
                                  const checked = value.includes(c.id);
                                  return (
                                    <label key={c.id} className="flex items-center gap-2 text-xs">
                                      <Checkbox
                                        checked={checked}
                                        onCheckedChange={(v) => {
                                          const set = new Set(value);
                                          if (v) set.add(c.id); else set.delete(c.id);
                                          field.onChange(Array.from(set));
                                        }}
                                      />
                                      <span className="truncate">{c.titre}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                }}
              />
            </div>
          )}

          {/* Permissions par type de contenu */}
          <div className="space-y-2">
            <Label>Permissions par type de contenu</Label>
            <p className="text-xs text-(--color-ink-soft)">
              Choisissez précisément ce que le professeur peut consulter ou modifier.
            </p>
            <Controller
              name="content_permissions"
              control={control}
              render={({ field }) => {
                const value = (field.value ?? {}) as Partial<Record<typeof CONTENT_TYPES[number], PermissionLevel>>;
                return (
                  <div className="overflow-hidden rounded-xl border border-(--color-border)">
                    {CONTENT_TYPES.map((t, i) => (
                      <div
                        key={t}
                        className={`flex items-center justify-between gap-3 px-3 py-2.5 ${i > 0 ? 'border-t border-(--color-border)' : ''}`}
                      >
                        <span className="text-sm font-medium text-(--color-ink)">{CONTENT_TYPE_LABEL[t]}</span>
                        <select
                          value={value[t] ?? 'none'}
                          onChange={(e) => field.onChange({ ...value, [t]: e.target.value as PermissionLevel })}
                          className="rounded-md border border-(--color-border) bg-(--color-surface) px-2 py-1 text-xs"
                        >
                          {PERMISSION_LEVELS.map((lvl) => (
                            <option key={lvl} value={lvl}>{PERMISSION_LEVEL_LABEL[lvl]}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
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
