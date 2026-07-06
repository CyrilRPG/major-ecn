'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { parseScope } from '@/lib/auth/permissions';
import { CollegeAccessPicker, OfferPicker, type College, type AccessValue } from './college-access-picker';

type OfferOption = { id: 'essentiel' | 'intensif' | 'approfondi'; label: string; unlocks: string[] };

// 'decouverte' n'est pas administrable : on l'aligne par défaut sur essentiel.
function adminOfferFrom(rawOffer: string): OfferOption['id'] {
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
  offers,
}: {
  student: EditStudentTarget;
  colleges: College[];
  offers: OfferOption[];
}) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const [pending, start] = useTransition();

  const initialScope = parseScope(student.permission_scope);
  const initialAccess: AccessValue = {
    permissionType: initialScope.type,
    colleges: initialScope.type === 'college' ? initialScope.colleges : [],
    // Voie obligatoire pour toutes les spécialités → défaut 'interne' si absente.
    voie: initialScope.voie ?? 'interne',
  };

  const [firstName, setFirstName] = useState(student.first_name ?? '');
  const [lastName, setLastName] = useState(student.last_name ?? '');
  const [email, setEmail] = useState(student.email ?? '');
  const [phone, setPhone] = useState(student.phone ?? '');
  const [address, setAddress] = useState(student.address ?? '');
  const [pseudo, setPseudo] = useState(student.pseudo ?? '');
  const [canDownload, setCanDownload] = useState(student.can_download ?? false);
  const [offer, setOffer] = useState<OfferOption['id']>(adminOfferFrom(initialScope.offer));
  const [access, setAccess] = useState<AccessValue>(initialAccess);

  // Resynchronise tous les champs depuis le scope actuel de l'élève (appelé à
  // l'ouverture du dialog — les hooks d'état persistent entre ouvertures).
  const syncFromStudent = () => {
    const sc = parseScope(student.permission_scope);
    setFirstName(student.first_name ?? '');
    setLastName(student.last_name ?? '');
    setEmail(student.email ?? '');
    setPhone(student.phone ?? '');
    setAddress(student.address ?? '');
    setPseudo(student.pseudo ?? '');
    setCanDownload(student.can_download ?? false);
    setOffer(adminOfferFrom(sc.offer));
    setAccess({
      permissionType: sc.type,
      colleges: sc.type === 'college' ? sc.colleges : [],
      voie: sc.voie ?? 'interne',
    });
    setSubmitError(null);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!firstName.trim() || !lastName.trim()) { setSubmitError('Prénom et nom requis.'); return; }
    start(async () => {
      // 1) Identité
      const pRes = await fetch('/api/admin/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: student.id, first_name: firstName, last_name: lastName, email, phone, address, pseudo }),
      });
      if (!pRes.ok) {
        const j = (await pRes.json().catch(() => ({}))) as { error?: string };
        setSubmitError(j.error ?? "Erreur lors de la mise à jour de l'identité.");
        return;
      }
      // 2) Accès (formule, collèges, voie) + téléchargement
      const res = await fetch('/api/admin/update-student', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: student.id,
          first_name: firstName,
          last_name: lastName,
          phone,
          offer,
          permission_type: access.permissionType,
          colleges: access.permissionType === 'college' ? access.colleges : [],
          // Voie obligatoire pour toutes les spécialités (plus seulement MG).
          voie: access.voie ?? 'interne',
          can_download: canDownload,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setSubmitError(j.error ?? 'Identité enregistrée, mais erreur sur les accès.');
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) syncFromStudent(); else setSubmitError(null); }}>
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

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-email">Email</Label>
            <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom.nom@exemple.com" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-first_name">Prénom</Label>
              <Input id="edit-first_name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-last_name">Nom</Label>
              <Input id="edit-last_name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-phone">Téléphone</Label>
              <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06 12 34 56 78" />
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

          <OfferPicker offers={offers} value={offer} onChange={setOffer} />

          <CollegeAccessPicker colleges={colleges} value={access} onChange={setAccess} />

          <label className="flex items-start gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 cursor-pointer hover:bg-(--color-primary-soft)">
            <Checkbox checked={canDownload} onCheckedChange={(v) => setCanDownload(!!v)} />
            <span>
              <span className="block text-sm font-semibold text-(--color-ink)">Autoriser le téléchargement des fichiers</span>
              <span className="block text-[12px] text-(--color-ink-soft)">
                Par défaut désactivé. Si activé, cet élève peut télécharger les PDF (filigranés à son identité).
              </span>
            </span>
          </label>

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
