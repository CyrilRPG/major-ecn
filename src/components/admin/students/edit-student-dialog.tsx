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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseScope, scopeOffers, type ContentAccess } from '@/lib/auth/permissions';
import { CollegeAccessPicker, OfferPicker, type College, type AccessValue, type OfferId } from './college-access-picker';
import { ContentAccessEditor, type FormulaAccessMap } from './content-access-editor';
import type { PermissionScope } from '@/types/domain';
import { fetchAuthentifie, fetchAvecJetonFrais } from '@/lib/auth/fresh-token';

type OfferOption = { id: OfferId; label: string; unlocks: string[]; access: ContentAccess };

// 'decouverte' n'est pas administrable : on l'aligne par défaut sur essentiel.
function adminOfferFrom(rawOffer: string): OfferId {
  if (rawOffer === 'intensif' || rawOffer === 'approfondi' || rawOffer === 'essentiel') return rawOffer;
  return 'essentiel';
}

// Union des formules administrables de l'élève (au moins une). 'decouverte' est
// remplacée par 'essentiel' ; doublons retirés.
function adminOffersFrom(scope: PermissionScope): OfferId[] {
  const list = Array.from(new Set(scopeOffers(scope).map(adminOfferFrom)));
  return list.length > 0 ? list : ['essentiel'];
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
  /** Spécialités où l'impression des fiches est autorisée (si pas de droit global). */
  download_colleges?: string[] | null;
  /** Session EVC de rattachement (fin d'accès par défaut). */
  evc_session_id?: string | null;
  /** Fin d'accès individuelle — prime sur la date de la session. */
  access_end?: string | null;
};

export type EvcSessionOption = { id: string; label: string; default_access_end: string; is_default?: boolean };

/** ISO → 'YYYY-MM-DD' pour un input date (heure locale). */
function isoToDateInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function EditStudentDialog({
  student,
  colleges,
  offers,
  sessions = [],
}: {
  student: EditStudentTarget;
  colleges: College[];
  offers: OfferOption[];
  sessions?: EvcSessionOption[];
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
  const [downloadColleges, setDownloadColleges] = useState<Set<string>>(new Set(student.download_colleges ?? []));
  const [offersSel, setOffersSel] = useState<OfferId[]>(adminOffersFrom(initialScope));
  const [access, setAccess] = useState<AccessValue>(initialAccess);
  const [contentOverrides, setContentOverrides] = useState<Record<string, boolean> | null>(
    initialScope.content_overrides && Object.keys(initialScope.content_overrides).length > 0
      ? initialScope.content_overrides : null,
  );
  const [evcSessionId, setEvcSessionId] = useState<string>(student.evc_session_id ?? 'none');
  const [accessEndDate, setAccessEndDate] = useState<string>(isoToDateInput(student.access_end));

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
    setDownloadColleges(new Set(student.download_colleges ?? []));
    setOffersSel(adminOffersFrom(sc));
    setAccess({
      permissionType: sc.type,
      colleges: sc.type === 'college' ? sc.colleges : [],
      voie: sc.voie ?? 'interne',
    });
    setContentOverrides(
      sc.content_overrides && Object.keys(sc.content_overrides).length > 0
        ? sc.content_overrides : null,
    );
    setEvcSessionId(student.evc_session_id ?? 'none');
    setAccessEndDate(isoToDateInput(student.access_end));
    setSubmitError(null);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!firstName.trim() || !lastName.trim()) { setSubmitError('Prénom et nom requis.'); return; }
    if (offersSel.length === 0) { setSubmitError('Sélectionnez au moins une formule.'); return; }
    start(async () => {
      // 1) Identité
      const pRes = await fetchAvecJetonFrais('/api/admin/update-profile', { userId: student.id, first_name: firstName, last_name: lastName, email, phone, address, pseudo });
      if (!pRes.ok) {
        const j = (await pRes.json().catch(() => ({}))) as { error?: string };
        setSubmitError(j.error ?? "Erreur lors de la mise à jour de l'identité.");
        return;
      }
      // 2) Accès (formule, collèges, voie) + téléchargement
      const res = await fetchAuthentifie('/api/admin/update-student', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: student.id,
          first_name: firstName,
          last_name: lastName,
          phone,
          offers: offersSel,
          offer: offersSel[0] ?? 'essentiel',
          permission_type: access.permissionType,
          colleges: access.permissionType === 'college' ? access.colleges : [],
          // Voie obligatoire pour toutes les spécialités (plus seulement MG).
          voie: access.voie ?? 'interne',
          can_download: canDownload,
          // Droit global → la liste par spécialité devient inutile, on la vide.
          download_colleges: canDownload ? [] : Array.from(downloadColleges),
          // Surcharges individuelles de contenu.
          content_overrides: contentOverrides,
          // Période d'accès : session de rattachement + éventuelle date individuelle.
          evc_session_id: evcSessionId === 'none' ? null : evcSessionId,
          access_end: accessEndDate ? new Date(`${accessEndDate}T23:59:59`).toISOString() : null,
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

          <OfferPicker offers={offers} value={offersSel} onChange={setOffersSel} />

          <ContentAccessEditor
            formulaPermissions={Object.fromEntries(offers.map((o) => [o.id, o.access])) as FormulaAccessMap}
            selectedOffers={offersSel}
            overrides={contentOverrides}
            onChange={setContentOverrides}
          />

          <CollegeAccessPicker colleges={colleges} value={access} onChange={setAccess} />

          <div className="rounded-xl border border-(--color-border) px-3 py-2.5 space-y-2.5">
            <p className="text-sm font-semibold text-(--color-ink)">Période d&apos;accès</p>
            <div className="space-y-1.5">
              <Label>Session EVC</Label>
              <Select value={evcSessionId} onValueChange={setEvcSessionId}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Session" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune session (pas d&apos;expiration)</SelectItem>
                  {sessions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label} — fin {new Date(s.default_access_end).toLocaleDateString('fr-FR')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-access-end">Fin d&apos;accès individuelle (facultative)</Label>
              <Input
                id="edit-access-end"
                type="date"
                value={accessEndDate}
                onChange={(e) => setAccessEndDate(e.target.value)}
              />
              <p className="text-[12px] text-(--color-ink-soft)">
                Prime sur la date de la session. Vide = la date de la session s&apos;applique
                (ou aucune expiration si l&apos;élève n&apos;a pas de session).
              </p>
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 cursor-pointer hover:bg-(--color-primary-soft)">
            <Checkbox checked={canDownload} onCheckedChange={(v) => setCanDownload(!!v)} />
            <span>
              <span className="block text-sm font-semibold text-(--color-ink)">Autoriser l’impression des fiches — toutes les spécialités</span>
              <span className="block text-[12px] text-(--color-ink-soft)">
                Si activé, cet élève peut télécharger les PDF de toutes ses spécialités (filigranés à son identité).
                Laissez décoché pour n’autoriser que certaines spécialités ci-dessous.
              </span>
            </span>
          </label>

          {!canDownload && (
            <div className="rounded-xl border border-(--color-border) px-3 py-2.5">
              <p className="text-sm font-semibold text-(--color-ink)">Impression autorisée par spécialité</p>
              <p className="mb-2 text-[12px] text-(--color-ink-soft)">
                Cochez les spécialités dont cet élève peut imprimer les fiches. Vide = aucune impression.
                {downloadColleges.size > 0 && (
                  <span className="font-semibold text-(--color-ink-soft)"> {downloadColleges.size} sélectionnée{downloadColleges.size > 1 ? 's' : ''}.</span>
                )}
              </p>
              <div className="grid max-h-44 grid-cols-1 gap-1 overflow-y-auto rounded-lg border border-(--color-border) p-2 sm:grid-cols-2">
                {colleges.map((col) => (
                  <label key={col.id} className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-[13px] hover:bg-(--color-sand-100)">
                    <Checkbox
                      checked={downloadColleges.has(col.id)}
                      onCheckedChange={() =>
                        setDownloadColleges((prev) => {
                          const n = new Set(prev);
                          if (n.has(col.id)) n.delete(col.id); else n.add(col.id);
                          return n;
                        })
                      }
                    />
                    <span className="truncate">
                      {col.nom}
                      {col.parentId ? <span className="text-(--color-ink-muted)"> · MG</span> : null}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

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
