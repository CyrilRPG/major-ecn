'use client';

import { useEffect, useState, useTransition } from 'react';
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

  const singleCollegeMode = colleges.length === 1;

  const { register, control, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<AddProfessorInput>({
    resolver: zodResolver(AddProfessorSchema),
    defaultValues: {
      permission_type: singleCollegeMode ? 'college' : 'all',
      colleges: singleCollegeMode ? [colleges[0].id] : [],
      content_permissions: Object.fromEntries(
        CONTENT_TYPES.map((t) => [t, 'rw' as PermissionLevel]),
      ),
    },
  });

  const permissionType = watch('permission_type');
  const selectedColleges = watch('colleges') ?? [];

  // Quand on n'a qu'un seul collège (Médecine générale aujourd'hui),
  // on force le mode 'college' et on pré-sélectionne ce collège.
  useEffect(() => {
    if (!singleCollegeMode) return;
    setValue('permission_type', 'college');
    setValue('colleges', [colleges[0].id]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleCollegeMode]);

  const onSubmit = (data: AddProfessorInput) => {
    setSubmitError(null);
    start(async () => {
      const res = await fetch('/api/admin/create-professor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string; warning?: string };
      if (!res.ok) {
        setSubmitError(j.error ?? 'Erreur à la création.');
        return;
      }
      // Profil créé mais avec un avertissement (typiquement : email Resend en échec).
      // On ferme quand même la dialog mais on remonte le warning via alert pour que
      // l'admin sache que l'email d'activation n'est pas parti.
      if (j.warning) alert(`Professeur créé.\n\n⚠ ${j.warning}`);
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
          {colleges.length > 1 ? (
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
          ) : colleges.length === 1 ? (
            /* Cas spécifique : un seul collège (Médecine générale aujourd'hui).
               Mode 'college' forcé + collège pré-sélectionné via useEffect ;
               on enchaîne directement sur le sélecteur d'items ci-dessous. */
            <div className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3 text-sm">
              <span className="font-semibold text-(--color-ink)">Collège :</span>{' '}
              <span className="text-(--color-ink-soft)">{colleges[0].nom}</span>
              <p className="mt-1 text-xs text-(--color-ink-muted)">
                Sélectionnez ci-dessous les items que ce professeur peut consulter et modifier.
              </p>
            </div>
          ) : (
            <p className="text-xs text-(--color-ink-muted)">
              Aucun collège disponible. Créez d’abord du contenu pédagogique.
            </p>
          )}

          {/* Items du / des collège(s) — toujours affiché si on est en mode 'college' */}
          {permissionType === 'college' && selectedColleges.length > 0 && (
            <div className="space-y-2">
              <Label>Items accessibles {colleges.length === 1 ? `dans ${colleges[0].nom}` : 'dans ce collège'}</Label>
              <p className="text-xs text-(--color-ink-soft)">
                Cochez les items à autoriser. Tout décocher = aucun item (le professeur n’aura
                aucun accès). Tout coché ou rien coché ⇒ tous les items du collège accessibles.
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
