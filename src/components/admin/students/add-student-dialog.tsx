'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, UserPlus, Stethoscope } from 'lucide-react';
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

/** Collège « Médecine générale » (parent). Ses sous-matières (col-mg-*) sont
 *  les spécialités que l'on peut accorder individuellement. */
const MG_COLLEGE_ID = 'col-medecine-generale';

type College = { id: string; nom: string; parentId?: string | null };
type OfferOption = { id: 'essentiel' | 'intensif' | 'approfondi'; label: string; unlocks: string[] };

export function AddStudentDialog({
  colleges,
  offers,
}: {
  colleges: College[];
  /** Formules proposées + contenus débloqués (d'après la Config Permissions). */
  offers: OfferOption[];
}) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const [pending, start] = useTransition();

  // Collèges de premier niveau (Découverte, Médecine générale, Cardiologie…) et
  // spécialités de Médecine générale (sous-matières col-mg-*).
  const topColleges = useMemo(() => colleges.filter((c) => !c.parentId), [colleges]);
  const mgSpecialties = useMemo(
    () => colleges.filter((c) => c.parentId === MG_COLLEGE_ID),
    [colleges],
  );
  const allSpecialtyIds = useMemo(() => mgSpecialties.map((s) => s.id), [mgSpecialties]);

  // Sélection Médecine générale : voie + spécialités (état local, fusionné à la
  // soumission). Par défaut : toutes les spécialités, voie interne.
  const [voie, setVoie] = useState<'interne' | 'externe'>('interne');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(allSpecialtyIds);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AddStudentInput>({
    resolver: zodResolver(AddStudentSchema),
    defaultValues: { permission_type: 'all', offer: 'essentiel', colleges: [], cours: [] },
  });

  const permissionType = watch('permission_type');
  const selectedColleges = watch('colleges') ?? [];
  const mgSelected = selectedColleges.includes(MG_COLLEGE_ID);

  const resetAll = () => {
    reset();
    setVoie('interne');
    setSelectedSpecialties(allSpecialtyIds);
    setSubmitError(null);
  };

  const onSubmit = (data: AddStudentInput) => {
    setSubmitError(null);

    // Fusionne les spécialités MG dans la liste des collèges + ajoute la voie,
    // exactement comme le provisioning après paiement Stripe.
    let payload: AddStudentInput = data;
    if (data.permission_type === 'college' && (data.colleges ?? []).includes(MG_COLLEGE_ID)) {
      const others = (data.colleges ?? []).filter((id) => id !== MG_COLLEGE_ID);
      payload = {
        ...data,
        colleges: [MG_COLLEGE_ID, ...selectedSpecialties, ...others],
        voie,
        cours: [],
      };
    }

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

          <div className="space-y-2">
            <Label>Formule souscrite</Label>
            <p className="text-xs text-(--color-ink-soft)">
              Contenus débloqués selon la <strong>Config Permissions</strong>.
            </p>
            <Controller
              name="offer"
              control={control}
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange}>
                  {offers.map((o) => (
                    <label
                      key={o.id}
                      className="flex items-start gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 cursor-pointer hover:bg-(--color-surface-soft) has-[:checked]:border-(--color-primary) has-[:checked]:bg-(--color-primary-soft)/40"
                    >
                      <RadioGroupItem value={o.id} className="mt-0.5" />
                      <span className="text-sm">
                        <span className="font-semibold text-(--color-ink)">{o.label}</span>
                        {o.unlocks.length > 0 && (
                          <span className="mt-0.5 block text-xs text-(--color-ink-soft)">
                            {o.unlocks.join(' · ')}
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
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
                      {topColleges.map((c) => {
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
                                // À la sélection de MG : (ré)initialise voie +
                                // toutes les spécialités par défaut.
                                if (c.id === MG_COLLEGE_ID && v) {
                                  setVoie('interne');
                                  setSelectedSpecialties(allSpecialtyIds);
                                }
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

          {/* Médecine générale : voie de concours + spécialités à accorder. */}
          {permissionType === 'college' && mgSelected && (
            <div className="space-y-3 rounded-xl border-2 border-(--color-primary)/30 bg-(--color-primary-soft)/40 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-(--color-ink)">
                <Stethoscope className="h-4 w-4 text-(--color-primary)" />
                Médecine générale
              </div>

              {/* Voie */}
              <div className="space-y-1.5">
                <Label>Voie de concours</Label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: 'interne', label: 'Voie interne (QCM / DP)' },
                    { value: 'externe', label: 'Voie externe (QROC / Révisions)' },
                  ] as const).map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${voie === opt.value ? 'border-(--color-primary) bg-(--color-primary-soft)' : 'border-(--color-border)'}`}
                    >
                      <input
                        type="radio"
                        name="mg-voie"
                        checked={voie === opt.value}
                        onChange={() => setVoie(opt.value)}
                        className="h-4 w-4 accent-(--color-primary)"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Spécialités */}
              {mgSpecialties.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label>Spécialités accordées</Label>
                    <div className="flex gap-2 text-[11px] font-semibold">
                      <button type="button" className="text-(--color-primary) hover:underline" onClick={() => setSelectedSpecialties(allSpecialtyIds)}>
                        Tout cocher
                      </button>
                      <span className="text-(--color-ink-muted)">·</span>
                      <button type="button" className="text-(--color-ink-soft) hover:underline" onClick={() => setSelectedSpecialties([])}>
                        Tout décocher
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-(--color-ink-soft)">
                    Par défaut, <strong>toutes</strong> les spécialités sont accordées.
                  </p>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {mgSpecialties.map((s) => {
                      const checked = selectedSpecialties.includes(s.id);
                      return (
                        <label key={s.id} className="flex items-center gap-2 text-[13px]">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => {
                              setSelectedSpecialties((prev) => {
                                const set = new Set(prev);
                                if (v) set.add(s.id); else set.delete(s.id);
                                return Array.from(set);
                              });
                            }}
                          />
                          {s.nom}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

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
