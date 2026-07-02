'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Pencil, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { UpdateStudentSchema, type UpdateStudentInput } from '@/lib/schemas/student';
import { parseScope } from '@/lib/auth/permissions';

const MG_COLLEGE_IDS = new Set(['col-medecine-generale']);

// 'decouverte' n'est pas une formule administrable depuis l'admin :
// si le scope DB indique decouverte, on l'aligne par défaut sur essentiel
// (mais on conserve les autres champs paid_* tels quels).
function adminOfferFrom(rawOffer: string): UpdateStudentInput['offer'] {
  if (rawOffer === 'intensif' || rawOffer === 'approfondi' || rawOffer === 'essentiel') return rawOffer;
  return 'essentiel';
}

export type EditStudentTarget = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address?: string | null;
  pseudo?: string | null;
  permission_scope: unknown;
  can_download?: boolean | null;
};

export function EditStudentDialog({
  student,
  colleges,
  coursByCollege,
}: {
  student: EditStudentTarget;
  colleges: { id: string; nom: string }[];
  coursByCollege?: Record<string, { id: string; titre: string }[]>;
}) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const [pending, start] = useTransition();
  // Champs d'identité (sauvegardés via /api/admin/update-profile).
  const [email, setEmail] = useState(student.email ?? '');
  const [address, setAddress] = useState(student.address ?? '');
  const [pseudo, setPseudo] = useState(student.pseudo ?? '');

  const initialScope = parseScope(student.permission_scope);
  // Reprend la liste cours[] si elle existe sur l'ancien scope.
  const initialCours =
    initialScope.type === 'college' && 'cours' in initialScope && Array.isArray(initialScope.cours)
      ? (initialScope.cours as string[])
      : [];

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateStudentInput>({
    resolver: zodResolver(UpdateStudentSchema),
    defaultValues: {
      id: student.id,
      first_name: student.first_name ?? '',
      last_name: student.last_name ?? '',
      phone: student.phone ?? '',
      offer: adminOfferFrom(initialScope.offer),
      permission_type: initialScope.type,
      colleges: initialScope.type === 'college' ? initialScope.colleges : [],
      cours: initialCours,
      can_download: student.can_download ?? false,
    },
  });

  const permissionType = watch('permission_type');
  const selectedColleges = watch('colleges') ?? [];

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
      setValue('cours', filtered, { shouldValidate: false, shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColleges.join(',')]);

  const mgCollegesSelected = selectedColleges.filter((id) => MG_COLLEGE_IDS.has(id));

  const onSubmit = (data: UpdateStudentInput) => {
    setSubmitError(null);
    start(async () => {
      // 1) Identité (nom, prénom, email, téléphone, adresse, pseudo).
      const pRes = await fetch('/api/admin/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          email,
          phone: data.phone ?? '',
          address,
          pseudo,
        }),
      });
      if (!pRes.ok) {
        const j = (await pRes.json().catch(() => ({}))) as { error?: string };
        setSubmitError(j.error ?? "Erreur lors de la mise à jour de l'identité.");
        return;
      }
      // 2) Accès (formule, collèges, cours) + permission de téléchargement.
      const res = await fetch('/api/admin/update-student', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setSubmitError(j.error ?? 'Identité enregistrée, mais erreur sur les accès.');
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
      onOpenChange={(o) => { setOpen(o); if (!o) setSubmitError(null); }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Modifier le profil" title="Modifier le profil">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
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

          <div className="space-y-1.5">
            <Label htmlFor="edit-email">Email</Label>
            <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom.nom@exemple.com" />
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
              <Label htmlFor="edit-pseudo">Pseudo (forum)</Label>
              <Input id="edit-pseudo" value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder="prenom.nom" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-address">Adresse postale</Label>
            <Input id="edit-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="N° rue, code postal, ville" />
          </div>

          <div className="space-y-2">
            <Label>Formule souscrite</Label>
            <Controller
              name="offer"
              control={control}
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange}>
                  <label className="flex items-center gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 cursor-pointer hover:bg-(--color-primary-soft)">
                    <RadioGroupItem value="essentiel" />
                    <span className="text-sm">Formule Essentielle — 495 € · QCM, flashcards, fiches synthétiques, méthode EVC</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 cursor-pointer hover:bg-(--color-primary-soft)">
                    <RadioGroupItem value="intensif" />
                    <span className="text-sm">Formule Intensive — 995 € · Essentielle + cas cliniques, épreuves blanches, suivi</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 cursor-pointer hover:bg-(--color-primary-soft)">
                    <RadioGroupItem value="approfondi" />
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

          <Controller
            control={control}
            name="can_download"
            render={({ field }) => (
              <label className="flex items-start gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 cursor-pointer hover:bg-(--color-primary-soft)">
                <Checkbox checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                <span>
                  <span className="block text-sm font-semibold text-(--color-ink)">Autoriser le téléchargement des fichiers</span>
                  <span className="block text-[12px] text-(--color-ink-soft)">
                    Par défaut désactivé. Si activé, cet élève peut télécharger les PDF (filigranés à son identité).
                  </span>
                </span>
              </label>
            )}
          />

          {submitError && (
            <p className="text-sm text-(--color-danger) bg-red-500/10 border border-(--color-danger)/30 rounded-lg px-3 py-2">
              {submitError}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Annuler</Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Save />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
