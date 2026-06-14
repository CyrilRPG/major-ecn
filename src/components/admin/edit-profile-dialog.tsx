'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, FileText, IdCard, Loader2, Pencil, ShieldCheck, UserCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type EditProfileFields = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  pseudo: string | null;
  cv_url: string | null;
  certificat_scolarite_url: string | null;
  carte_pro_url: string | null;
  created_at?: string;
};

type Role = 'professor' | 'student';

export function EditProfileDialog({
  profile,
  role,
}: {
  profile: EditProfileFields;
  role: Role;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [firstName, setFirstName] = useState(profile.first_name ?? '');
  const [lastName, setLastName] = useState(profile.last_name ?? '');
  const [email, setEmail] = useState(profile.email ?? '');
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [address, setAddress] = useState(profile.address ?? '');
  const [pseudo, setPseudo] = useState(profile.pseudo ?? '');
  const [cvUrl, setCvUrl] = useState(profile.cv_url ?? '');
  const [certifUrl, setCertifUrl] = useState(profile.certificat_scolarite_url ?? '');
  const [carteProUrl, setCarteProUrl] = useState(profile.carte_pro_url ?? '');

  const displayName = `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || profile.email || (role === 'professor' ? 'professeur' : 'élève');
  const dossierComplet = role === 'professor'
    ? Boolean(firstName && lastName && email && phone && address && (cvUrl || certifUrl || carteProUrl))
    : Boolean(firstName && lastName && email);

  const submit = () => {
    setError(null);
    setSuccess(false);
    start(async () => {
      const res = await fetch('/api/admin/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.id,
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          address,
          pseudo,
          cv_url: cvUrl,
          certificat_scolarite_url: certifUrl,
          carte_pro_url: carteProUrl,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? 'Erreur lors de la mise à jour.');
        return;
      }
      setSuccess(true);
      router.refresh();
      setTimeout(() => { setSuccess(false); setOpen(false); }, 900);
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setError(null); }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Ouvrir la fiche complète" aria-label="Ouvrir la fiche complète">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Fiche {role === 'professor' ? 'enseignant' : 'élève'} — {displayName}</DialogTitle>
          <DialogDescription>
            Consultez et corrigez l&rsquo;ensemble des informations. La modification de l&rsquo;email est
            répercutée sur le compte d&rsquo;authentification.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Identité */}
          <Section title="Identité" icon={<UserCircle2 className="h-4 w-4" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Prénom"><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></Field>
              <Field label="Nom"><Input value={lastName} onChange={(e) => setLastName(e.target.value)} /></Field>
              <Field label="Email" full><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
              <Field label="Téléphone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+33 …" /></Field>
              <Field label="Pseudo public (forum)">
                <Input value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder={role === 'professor' ? 'Professeur Cardiologie' : 'prenom.nom'} />
              </Field>
              <Field label="Adresse postale" full><Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="N° rue, code postal, ville" /></Field>
            </div>
          </Section>

          {role === 'professor' && (
            <Section title="Documents" icon={<FileText className="h-4 w-4" />}>
              <p className="text-xs text-(--color-ink-soft)">
                Collez l&rsquo;URL du document (PDF) hébergé sur le bucket admin. Le téléversement direct
                arrive prochainement.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="CV (PDF)" full><Input value={cvUrl} onChange={(e) => setCvUrl(e.target.value)} placeholder="https://…/cv.pdf" /></Field>
                <Field label="Certificat de scolarité (internes)"><Input value={certifUrl} onChange={(e) => setCertifUrl(e.target.value)} placeholder="https://…/certif.pdf" /></Field>
                <Field label="Carte pro / justificatif d'exercice"><Input value={carteProUrl} onChange={(e) => setCarteProUrl(e.target.value)} placeholder="https://…/carte.pdf" /></Field>
              </div>
            </Section>
          )}

          <Section title="Administratif" icon={<IdCard className="h-4 w-4" />}>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <Info label="Date de création" value={profile.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR') : '—'} />
              <Info
                label="Statut du dossier"
                value={dossierComplet ? 'Complet' : 'Incomplet'}
                tone={dossierComplet ? 'success' : 'warning'}
              />
            </div>
          </Section>
        </div>

        {error && (
          <p className="rounded-lg border border-(--color-danger)/30 bg-red-50 px-3 py-2 text-sm text-(--color-danger)">{error}</p>
        )}
        {success && (
          <p className="inline-flex items-center gap-1.5 text-sm text-(--color-success)">
            <CheckCircle2 className="h-4 w-4" /> Modifications enregistrées
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Annuler</Button>
          <Button type="button" variant="primary" onClick={submit} disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-4">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
        {icon}
        {title}
      </p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${full ? 'sm:col-span-2' : ''}`}>
      <span className="text-[11px] font-medium uppercase tracking-wide text-(--color-ink-muted)">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Info({ label, value, tone }: { label: string; value: string; tone?: 'success' | 'warning' }) {
  const bg = tone === 'success' ? 'text-(--color-success)' : tone === 'warning' ? 'text-(--color-warning)' : 'text-(--color-ink)';
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'warning' ? ShieldCheck : XCircle;
  return (
    <div className="rounded-lg bg-(--color-surface) px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-(--color-ink-muted)">{label}</p>
      <p className={`mt-0.5 inline-flex items-center gap-1.5 text-sm font-semibold ${bg}`}>
        {tone && <Icon className="h-3.5 w-3.5" />}
        {value}
      </p>
    </div>
  );
}
