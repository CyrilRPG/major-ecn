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
import { AddStudentSchema, type AddStudentInput } from '@/lib/schemas/student';

// IDs des collèges de médecine générale (cf. base de données). Quand l'admin
// sélectionne l'un de ces collèges en accès « spécifique », on lui propose de
// restreindre l'accès à certaines matières (cours) au sein du collège.
const MG_COLLEGE_IDS = new Set(['col-medecine-generale', 'col-medecine-generale-voie-externe']);

export function AddStudentDialog({
  colleges,
  coursByCollege,
}: {
  colleges: { id: string; nom: string }[];
  /** Liste des cours (matières) par collège. Utilisée pour les MG. */
  coursByCollege?: Record<string, { id: string; titre: string }[]>;
}) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const [pending, start] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddStudentInput>({
    resolver: zodResolver(AddStudentSchema),
    defaultValues: { permission_type: 'all', offer: 'essentiel', colleges: [], cours: [] },
  });

  const permissionType = watch('permission_type');
  const selectedColleges = watch('colleges') ?? [];

  // Si on retire un collège MG de la sélection, on retire automatiquement les
  // cours associés pour éviter des incohérences.
  useEffect(() => {
    if (!coursByCollege) return;
    const current = (watch('cours') ?? []) as string[];
    const allowedCoursIds = new Set(
      selectedColleges
        .filter((c) => MG_COLLEGE_IDS.has(c))
        .flatMap((c) => (coursByCollege[c] ?? []).map((x) => x.id)),
    );
    const filtered = current.filter((id) => allowedCoursIds.has(id));
    if (filtered.length !== current.length) {
      setValue('cours', filtered, { shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColleges.join(',')]);

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

  const mgCollegesSelected = selectedColleges.filter((id) => MG_COLLEGE_IDS.has(id));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

          <div className="space-y-2">
            <Label>Formule souscrite</Label>
            <p className="text-xs text-(--color-ink-soft)">
              Quelle formule l’élève a-t-il souscrite&nbsp;?
            </p>
            <Controller
              name="offer"
              control={control}
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange}>
                  <label className="flex items-center gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 cursor-pointer hover:bg-(--color-surface-soft)">
                    <RadioGroupItem value="essentiel" />
                    <span className="text-sm">Formule Essentielle — 495 € · QCM, flashcards, fiches synthétiques, méthode EVC</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 cursor-pointer hover:bg-(--color-surface-soft)">
                    <RadioGroupItem value="premium" />
                    <span className="text-sm">Formule Intensive — 995 € · Essentielle + cas cliniques, épreuves blanches, suivi</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 cursor-pointer hover:bg-(--color-surface-soft)">
                    <RadioGroupItem value="intensif" />
                    <span className="text-sm">Programme Approfondi — 2 395 € · Plateforme + accompagnement individuel + sessions live</span>
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

          {/* Restriction par matières : uniquement si un collège MG (voie
              interne ou externe) est sélectionné en mode « spécifique ». */}
          {permissionType === 'college' && mgCollegesSelected.length > 0 && coursByCollege && (
            <div className="space-y-2 rounded-xl border-2 border-dashed border-(--color-border) bg-(--color-surface-soft) p-3">
              <Label>Matières au sein de Médecine Générale</Label>
              <p className="text-xs text-(--color-ink-soft)">
                Sans sélection : accès à <strong>toutes</strong> les matières du/des collège(s) MG choisi(s).
                Cochez pour restreindre à certaines matières précises.
              </p>
              <Controller
                name="cours"
                control={control}
                render={({ field }) => (
                  <div className="space-y-3">
                    {mgCollegesSelected.map((collegeId) => {
                      const cours = coursByCollege[collegeId] ?? [];
                      if (cours.length === 0) return null;
                      const collegeNom = colleges.find((c) => c.id === collegeId)?.nom ?? collegeId;
                      return (
                        <div key={collegeId}>
                          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-(--color-ink-muted)">
                            {collegeNom}
                          </p>
                          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                            {cours.map((c) => {
                              const checked = field.value?.includes(c.id) ?? false;
                              return (
                                <label key={c.id} className="flex items-center gap-2 text-[13px]">
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(v) => {
                                      const set = new Set(field.value ?? []);
                                      if (v) set.add(c.id);
                                      else set.delete(c.id);
                                      field.onChange(Array.from(set));
                                    }}
                                  />
                                  {c.titre}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              />
            </div>
          )}

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
