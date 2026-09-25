'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, Loader2, Plus, UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CollegeAccessPicker, OfferPicker, type College, type AccessValue, type OfferId } from './college-access-picker';
import { fetchAvecJetonFrais } from '@/lib/auth/fresh-token';

type OfferOption = { id: OfferId; label: string; unlocks: string[] };
type Mode = 'single' | 'bulk';

const IdentitySchema = z.object({
  first_name: z.string().min(1, 'Prénom requis'),
  last_name: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
});
type IdentityInput = z.infer<typeof IdentitySchema>;

type Confirmation =
  | { kind: 'single'; identity: IdentityInput }
  | { kind: 'bulk'; emails: string[] };

/** Nombre d'emails listés en clair dans le récapitulatif d'une invitation en masse. */
const EMAILS_AFFICHES = 8;

/** Libellés lisibles des collèges accordés : un collège parent coché s'affiche
 *  une seule fois avec le compte de ses sous-collèges ; un sous-collège coché
 *  sans son parent s'affiche seul. */
function libellesColleges(colleges: College[], selection: string[]): string[] {
  const sel = new Set(selection);
  const parNom = (a: College, b: College) => a.nom.localeCompare(b.nom, 'fr');
  const out: string[] = [];
  for (const c of colleges.filter((x) => !x.parentId && sel.has(x.id)).sort(parNom)) {
    const enfants = colleges.filter((x) => x.parentId === c.id);
    const coches = enfants.filter((x) => sel.has(x.id)).length;
    out.push(enfants.length > 0 ? `${c.nom} (${coches}/${enfants.length} sous-collèges)` : c.nom);
  }
  for (const c of colleges.filter((x) => x.parentId && sel.has(x.id) && !sel.has(x.parentId)).sort(parNom)) {
    out.push(c.nom);
  }
  return out;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Extrait les emails valides et dédoublonnés d'un texte libre séparé par des
 *  virgules (les points-virgules, espaces et retours à la ligne sont tolérés). */
function parseEmails(text: string): string[] {
  return Array.from(
    new Set(text.split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter((e) => EMAIL_RE.test(e))),
  );
}

export function AddStudentDialog({
  colleges,
  offers,
}: {
  colleges: College[];
  offers: OfferOption[];
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('single');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<string | null>(null);
  const router = useRouter();
  const [pending, start] = useTransition();

  const [offersSel, setOffersSel] = useState<OfferId[]>(['essentiel']);
  // Voie obligatoire pour toute spécialité → défaut 'interne'. Portée par défaut
  // = « Collèges spécifiques » : le défaut « tous les collèges » a ouvert toute
  // la plateforme à une élève MG invitée le 23/09/2026.
  const [access, setAccess] = useState<AccessValue>({ permissionType: 'college', colleges: [], voie: 'interne' });
  const [emailsText, setEmailsText] = useState('');
  // Récapitulatif à valider avant tout envoi d'invitation.
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<IdentityInput>({
    resolver: zodResolver(IdentitySchema),
  });

  const resetAll = () => {
    reset();
    setOffersSel(['essentiel']);
    setAccess({ permissionType: 'college', colleges: [], voie: 'interne' });
    setEmailsText('');
    setSubmitError(null);
    setBulkResult(null);
    setConfirmation(null);
    setMode('single');
  };

  /** Contrôles communs aux deux modes ; renvoie un message d'erreur ou null. */
  const accessError = (): string | null => {
    if (offersSel.length === 0) return 'Sélectionnez au moins une formule.';
    if (access.permissionType === 'college' && access.colleges.length === 0) {
      return 'Cochez au moins un collège (ou choisissez « Toute l’offre »).';
    }
    return null;
  };

  const accessPayload = () => ({
    // `offers` = union des formules ; `offer` (offre de plus haut rang) conservé
    // pour compat des schémas serveur.
    offers: offersSel.length > 0 ? offersSel : ['essentiel'],
    offer: offersSel[0] ?? 'essentiel',
    permission_type: access.permissionType,
    colleges: access.permissionType === 'college' ? access.colleges : [],
    voie: access.voie ?? 'interne',
  });

  // ---- Mode « un élève » ----
  const onSubmitSingle = (identity: IdentityInput) => {
    setSubmitError(null);
    const err = accessError();
    if (err) { setSubmitError(err); return; }
    setConfirmation({ kind: 'single', identity });
  };

  const sendSingle = (identity: IdentityInput) => {
    start(async () => {
      const res = await fetchAvecJetonFrais('/api/admin/create-student', { ...identity, ...accessPayload() });
      const j = (await res.json().catch(() => ({}))) as { error?: string; warning?: string };
      if (!res.ok) { setSubmitError(j.error ?? 'Erreur à la création.'); return; }
      resetAll();
      setOpen(false);
      router.refresh();
    });
  };

  // ---- Mode « invitation en masse » ----
  const onSubmitBulk = () => {
    setSubmitError(null);
    setBulkResult(null);
    const valid = parseEmails(emailsText);
    if (valid.length === 0) { setSubmitError('Ajoutez au moins un email valide (séparés par des virgules).'); return; }
    const err = accessError();
    if (err) { setSubmitError(err); return; }
    setConfirmation({ kind: 'bulk', emails: valid });
  };

  const sendBulk = (valid: string[]) => {
    start(async () => {
      const res = await fetchAvecJetonFrais('/api/admin/create-students-bulk', { emails: valid, ...accessPayload() });
      const j = (await res.json().catch(() => ({}))) as {
        error?: string;
        summary?: { total: number; created: number; emailFailed: number; skipped: number; failed: number };
      };
      if (!res.ok) { setSubmitError(j.error ?? "Erreur lors de l'envoi des invitations."); return; }
      const s = j.summary;
      setBulkResult(
        s ? `${s.created} invitation(s) envoyée(s)`
          + (s.skipped ? ` · ${s.skipped} déjà existant(s)` : '')
          + (s.emailFailed ? ` · ${s.emailFailed} email(s) non envoyé(s)` : '')
          + (s.failed ? ` · ${s.failed} échec(s)` : '')
          : 'Invitations traitées.',
      );
      router.refresh();
    });
  };

  const detectedCount = parseEmails(emailsText).length;

  // Récapitulatif affiché dans la confirmation.
  const toutLOffre = access.permissionType === 'all';
  const formulesChoisies = offersSel.map((id) => offers.find((o) => o.id === id)?.label ?? id);
  const collegesChoisis = toutLOffre ? [] : libellesColleges(colleges, access.colleges);
  const voieLibelle = (access.voie ?? 'interne') === 'interne' ? 'Voie interne (QCM / DP)' : 'Voie externe (QROC / DP-QROC)';

  const confirmer = () => {
    const c = confirmation;
    setConfirmation(null);
    if (!c) return;
    if (c.kind === 'single') sendSingle(c.identity);
    else sendBulk(c.emails);
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
            Créez un élève et envoyez-lui une invitation (bienvenue + choix de mot de passe).
          </DialogDescription>
        </DialogHeader>

        {/* Choix du mode */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => { setMode('single'); setSubmitError(null); setBulkResult(null); }}
            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold ${mode === 'single' ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary)' : 'border-(--color-border) text-(--color-ink-soft)'}`}
          >
            <UserPlus className="h-4 w-4" /> Un élève (nom, prénom, mail)
          </button>
          <button
            type="button"
            onClick={() => { setMode('bulk'); setSubmitError(null); setBulkResult(null); }}
            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold ${mode === 'bulk' ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary)' : 'border-(--color-border) text-(--color-ink-soft)'}`}
          >
            <Users className="h-4 w-4" /> En masse (par email)
          </button>
        </div>

        {mode === 'single' ? (
          <form onSubmit={handleSubmit(onSubmitSingle)} className="space-y-4">
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

            <OfferPicker offers={offers} value={offersSel} onChange={setOffersSel} />
            <CollegeAccessPicker colleges={colleges} value={access} onChange={setAccess} />

            {submitError && (
              <p className="text-sm text-(--color-danger) bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{submitError}</p>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => { setOpen(false); resetAll(); }} disabled={pending}>Annuler</Button>
              <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="animate-spin" /> : <UserPlus />}
                Créer l’élève
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3 py-2.5 text-xs text-(--color-ink-soft)">
              Choisissez le collège / les items, la formule et la voie <strong>communs à tout le groupe</strong>, puis
              collez tous les emails. Chaque élève reçoit une invitation où il renseigne lui-même son nom, prénom et mot
              de passe — avec exactement les accès définis ici. Un email correspondant à un
              <strong> compte Découverte existant</strong> est automatiquement basculé sur la formule choisie ci-dessus.
            </p>

            <OfferPicker offers={offers} value={offersSel} onChange={setOffersSel} />
            <CollegeAccessPicker colleges={colleges} value={access} onChange={setAccess} />

            <div className="space-y-2">
              <Label htmlFor="bulk-emails">Emails des élèves à inviter</Label>
              <Textarea
                id="bulk-emails"
                value={emailsText}
                onChange={(e) => setEmailsText(e.target.value)}
                rows={7}
                placeholder="eleve1@exemple.fr, eleve2@exemple.fr, eleve3@exemple.fr, …"
                className="min-h-[150px] font-mono text-sm"
              />
              <p className="text-xs text-(--color-ink-muted)">
                Séparez les emails par une virgule (les points-virgules, espaces et retours à la ligne sont aussi
                acceptés).
                {detectedCount > 0 && (
                  <span className="font-semibold text-(--color-ink-soft)"> {detectedCount} email{detectedCount > 1 ? 's' : ''} valide{detectedCount > 1 ? 's' : ''} détecté{detectedCount > 1 ? 's' : ''}.</span>
                )}
              </p>
            </div>

            {submitError && (
              <p className="text-sm text-(--color-danger) bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{submitError}</p>
            )}
            {bulkResult && (
              <p className="rounded-lg bg-[color-mix(in_srgb,#16A34A_10%,white)] px-3 py-2 text-sm font-semibold text-[#16793C]">
                {bulkResult}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => { setOpen(false); resetAll(); }} disabled={pending}>Fermer</Button>
              <Button type="button" onClick={onSubmitBulk} disabled={pending}>
                {pending ? <Loader2 className="animate-spin" /> : <Users />}
                Envoyer les invitations
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Confirmation obligatoire avant tout envoi (individuel ou en masse). */}
        <Dialog open={confirmation !== null} onOpenChange={(v) => { if (!v) setConfirmation(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmer l’invitation</DialogTitle>
              <DialogDescription>
                {confirmation?.kind === 'bulk'
                  ? `Vous souhaitez bien inviter ces ${confirmation.emails.length} élève${confirmation.emails.length > 1 ? 's' : ''} avec les accès suivants ?`
                  : 'Vous souhaitez bien inviter cet élève avec les accès suivants ?'}
              </DialogDescription>
            </DialogHeader>

            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">
                  {confirmation?.kind === 'bulk' ? 'Élèves' : 'Élève'}
                </dt>
                <dd className="mt-0.5 text-(--color-ink)">
                  {confirmation?.kind === 'single' && (
                    <>
                      <strong>{confirmation.identity.first_name} {confirmation.identity.last_name}</strong>
                      <span className="text-(--color-ink-soft)"> · {confirmation.identity.email}</span>
                    </>
                  )}
                  {confirmation?.kind === 'bulk' && (
                    <span className="break-all font-mono text-xs">
                      {confirmation.emails.slice(0, EMAILS_AFFICHES).join(', ')}
                      {confirmation.emails.length > EMAILS_AFFICHES && ` … et ${confirmation.emails.length - EMAILS_AFFICHES} autre(s)`}
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">Formule</dt>
                <dd className="mt-0.5 text-(--color-ink)">{formulesChoisies.join(' + ')}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">Voie</dt>
                <dd className="mt-0.5 text-(--color-ink)">{voieLibelle}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">Collèges</dt>
                <dd className="mt-0.5 text-(--color-ink)">
                  {toutLOffre ? (
                    <span className="font-bold text-red-600">TOUS LES COLLÈGES</span>
                  ) : (
                    <ul className="list-disc space-y-0.5 pl-5">
                      {collegesChoisis.map((nom) => <li key={nom}>{nom}</li>)}
                    </ul>
                  )}
                </dd>
              </div>
            </dl>

            {toutLOffre && (
              <div role="alert" className="flex gap-3 rounded-xl border-2 border-red-600 bg-red-50 p-3 text-red-700 dark:bg-red-950/40 dark:text-red-300">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-sm font-bold uppercase leading-snug">
                  Attention : {confirmation?.kind === 'bulk' ? 'ces élèves auront' : 'cet élève aura'} accès à TOUS
                  LES COLLÈGES de la plateforme, sans exception. Vérifiez que c’est bien voulu.
                </p>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setConfirmation(null)}>Modifier</Button>
              <Button type="button" variant={toutLOffre ? 'danger' : 'primary'} onClick={confirmer}>
                {toutLOffre ? 'Oui, inviter sur TOUS les collèges' : 'Confirmer l’invitation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
