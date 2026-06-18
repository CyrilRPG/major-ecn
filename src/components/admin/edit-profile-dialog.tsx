'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, FileText, IdCard, Loader2, Pencil, ShieldCheck, UserCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CONTENT_TYPES, CONTENT_TYPE_LABEL,
  PERMISSION_LEVELS, PERMISSION_LEVEL_LABEL,
  type ContentType, type PermissionLevel,
} from '@/lib/schemas/professor';
import { ProfDocumentUpload } from '@/components/professor/prof-document-upload';

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
  can_download?: boolean | null;
  created_at?: string;
};

type Role = 'professor' | 'student';

type ProfessorScopeProps = {
  permission_scope: unknown;
  colleges: { id: string; nom: string }[];
  coursByCollege: Record<string, { id: string; titre: string }[]>;
};

type ScopeShape = {
  type?: 'all' | 'college';
  colleges?: string[];
  cours?: string[];
  content_permissions?: Partial<Record<ContentType, PermissionLevel>>;
  content_types?: ContentType[];
};

function initialScope(raw: unknown): {
  permission_type: 'all' | 'college';
  colleges: string[];
  cours: string[];
  perms: Partial<Record<ContentType, PermissionLevel>>;
} {
  const s = (raw ?? {}) as ScopeShape;
  const fromOld: Partial<Record<ContentType, PermissionLevel>> = {};
  if (!s.content_permissions && Array.isArray(s.content_types)) {
    for (const t of s.content_types) fromOld[t] = 'rw';
  }
  return {
    permission_type: s.type === 'college' ? 'college' : 'all',
    colleges: Array.isArray(s.colleges) ? s.colleges : [],
    cours: Array.isArray(s.cours) ? s.cours : [],
    perms: s.content_permissions ?? fromOld,
  };
}

export function EditProfileDialog({
  profile,
  role,
  professorScope,
}: {
  profile: EditProfileFields;
  role: Role;
  professorScope?: ProfessorScopeProps;
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
  const [canDownload, setCanDownload] = useState<boolean>(!!profile.can_download);

  // Spécialités & accès (professeurs uniquement)
  const showScope = role === 'professor' && !!professorScope;
  const allColleges = professorScope?.colleges ?? [];
  const coursByCollege = professorScope?.coursByCollege ?? {};
  const singleCollegeMode = allColleges.length === 1;
  const init = initialScope(professorScope?.permission_scope);
  const [permType, setPermType] = useState<'all' | 'college'>(
    singleCollegeMode ? 'college' : init.permission_type,
  );
  const [scopeColleges, setScopeColleges] = useState<string[]>(
    singleCollegeMode ? [allColleges[0].id] : init.colleges,
  );
  const [scopeCours, setScopeCours] = useState<string[]>(init.cours);
  const [perms, setPerms] = useState<Partial<Record<ContentType, PermissionLevel>>>(init.perms);

  // Réinitialise les champs d'accès quand on rouvre (pour refléter d'éventuels
  // changements en base via une autre session admin).
  useEffect(() => {
    if (!open || !showScope) return;
    const fresh = initialScope(professorScope?.permission_scope);
    setPermType(singleCollegeMode ? 'college' : fresh.permission_type);
    setScopeColleges(singleCollegeMode ? [allColleges[0].id] : fresh.colleges);
    setScopeCours(fresh.cours);
    setPerms(fresh.perms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const displayName = `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || profile.email || (role === 'professor' ? 'professeur' : 'élève');
  const dossierComplet = role === 'professor'
    ? Boolean(firstName && lastName && email && phone && address
        && (profile.cv_url || profile.certificat_scolarite_url || profile.carte_pro_url))
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
          can_download: canDownload,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? 'Erreur lors de la mise à jour.');
        return;
      }

      // Sauvegarde des accès professeur (collèges, cours, permissions par
      // type de contenu). Réplique immédiate sur les guards SSR via
      // profiles.permission_scope.
      if (showScope) {
        const scopeRes = await fetch('/api/admin/update-professor-scope', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: profile.id,
            permission_type: permType,
            colleges: permType === 'college' ? scopeColleges : [],
            cours: permType === 'college' ? scopeCours : [],
            content_permissions: perms,
          }),
        });
        if (!scopeRes.ok) {
          const j = (await scopeRes.json().catch(() => ({}))) as { error?: string };
          setError(j.error ?? 'Identité enregistrée, mais erreur sur les accès.');
          return;
        }
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
            <label className="mt-3 flex items-start gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 cursor-pointer hover:bg-(--color-primary-soft)">
              <Checkbox checked={canDownload} onCheckedChange={(v) => setCanDownload(!!v)} />
              <span>
                <span className="block text-sm font-semibold text-(--color-ink)">Autoriser le téléchargement des fichiers</span>
                <span className="block text-[12px] text-(--color-ink-soft)">
                  Désactivé par défaut. Si activé, {role === 'professor' ? 'ce professeur' : 'cet utilisateur'} peut télécharger les PDF (filigranés à son identité). L’admin télécharge toujours.
                </span>
              </span>
            </label>
          </Section>

          {role === 'professor' && (
            <Section title="Documents" icon={<FileText className="h-4 w-4" />}>
              <p className="text-xs text-(--color-ink-soft)">
                Téléversez directement les documents (PDF ou image). Stockage privé, accessible à
                l&rsquo;admin et au professeur concerné.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <ProfDocumentUpload kind="cv" label="CV" targetUserId={profile.id} currentValue={profile.cv_url} />
                </div>
                <ProfDocumentUpload kind="certificat" label="Certificat de scolarité (internes)" targetUserId={profile.id} currentValue={profile.certificat_scolarite_url} />
                <ProfDocumentUpload kind="carte_pro" label="Carte pro / justificatif" targetUserId={profile.id} currentValue={profile.carte_pro_url} />
              </div>
            </Section>
          )}

          {showScope && (
            <Section title="Spécialités & accès" icon={<ShieldCheck className="h-4 w-4" />}>
              <p className="text-xs text-(--color-ink-soft)">
                Choisissez les collèges, items et niveaux d’accès par type de contenu. Les
                modifications prennent effet immédiatement sur les pages admin de ce professeur.
              </p>

              {/* Collèges */}
              {allColleges.length > 1 ? (
                <div className="mt-3 space-y-2">
                  <Label>Collèges accessibles</Label>
                  <RadioGroup value={permType} onValueChange={(v) => setPermType(v as 'all' | 'college')}>
                    <label className="flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2.5 cursor-pointer hover:border-(--color-primary)/40">
                      <RadioGroupItem value="all" />
                      <span className="text-sm">Toute l’offre (tous les collèges)</span>
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2.5 cursor-pointer hover:border-(--color-primary)/40">
                      <RadioGroupItem value="college" />
                      <span className="text-sm">Collèges spécifiques</span>
                    </label>
                  </RadioGroup>
                  {permType === 'college' && (
                    <div className="ml-1 mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {allColleges.map((c) => {
                        const checked = scopeColleges.includes(c.id);
                        return (
                          <label key={c.id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => {
                                const set = new Set(scopeColleges);
                                if (v) set.add(c.id); else set.delete(c.id);
                                setScopeColleges(Array.from(set));
                              }}
                            />
                            {c.nom}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : allColleges.length === 1 ? (
                <div className="mt-3 rounded-xl border border-(--color-border) bg-(--color-surface) p-3 text-sm">
                  <span className="font-semibold text-(--color-ink)">Collège :</span>{' '}
                  <span className="text-(--color-ink-soft)">{allColleges[0].nom}</span>
                </div>
              ) : null}

              {/* Items */}
              {permType === 'college' && scopeColleges.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label>Items accessibles</Label>
                  <p className="text-xs text-(--color-ink-muted)">
                    Cochez les items à autoriser. Tout décocher = aucun item ; tout cocher = tous
                    les items du collège.
                  </p>
                  <div className="space-y-3">
                    {scopeColleges.map((collegeId) => {
                      const college = allColleges.find((c) => c.id === collegeId);
                      const courses = coursByCollege[collegeId] ?? [];
                      if (!college) return null;
                      const collegeCoursIds = courses.map((c) => c.id);
                      const allChecked = courses.length > 0 && collegeCoursIds.every((id) => scopeCours.includes(id));
                      return (
                        <div key={collegeId} className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-(--color-ink)">{college.nom}</p>
                            <button
                              type="button"
                              onClick={() => {
                                const set = new Set(scopeCours);
                                if (allChecked) collegeCoursIds.forEach((id) => set.delete(id));
                                else collegeCoursIds.forEach((id) => set.add(id));
                                setScopeCours(Array.from(set));
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
                                const checked = scopeCours.includes(c.id);
                                return (
                                  <label key={c.id} className="flex items-center gap-2 text-xs">
                                    <Checkbox
                                      checked={checked}
                                      onCheckedChange={(v) => {
                                        const set = new Set(scopeCours);
                                        if (v) set.add(c.id); else set.delete(c.id);
                                        setScopeCours(Array.from(set));
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
                </div>
              )}

              {/* Permissions par type de contenu */}
              <div className="mt-4 space-y-2">
                <Label>Permissions par type de contenu</Label>
                <div className="overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface)">
                  {CONTENT_TYPES.map((t, i) => (
                    <div
                      key={t}
                      className={`flex items-center justify-between gap-3 px-3 py-2.5 ${i > 0 ? 'border-t border-(--color-border)' : ''}`}
                    >
                      <span className="text-sm font-medium text-(--color-ink)">{CONTENT_TYPE_LABEL[t]}</span>
                      <select
                        value={perms[t] ?? 'none'}
                        onChange={(e) => setPerms({ ...perms, [t]: e.target.value as PermissionLevel })}
                        className="rounded-md border border-(--color-border) bg-(--color-surface) px-2 py-1 text-xs"
                      >
                        {PERMISSION_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>{PERMISSION_LEVEL_LABEL[lvl]}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
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
