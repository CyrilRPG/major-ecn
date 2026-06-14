import { CheckCircle2, GraduationCap, KeyRound, Mail, MinusCircle, Phone, Shield, User, UserCircle2, XCircle } from 'lucide-react';
import type { Profile } from '@/lib/auth/get-profile';
import type { NavCollege } from '@/lib/data/navigator';
import { ProfileEditor } from '@/components/profile/profile-editor';
import { PasswordChanger } from '@/components/profile/password-changer';
import { PseudoEditor } from '@/components/student/pseudo-editor';
import {
  CONTENT_TYPES, CONTENT_TYPE_LABEL, PERMISSION_LEVEL_LABEL,
  type ContentType, type PermissionLevel, type ProfessorScope,
} from '@/lib/schemas/professor';

const PERM_THEME: Record<PermissionLevel, { bg: string; fg: string; Icon: typeof CheckCircle2 }> = {
  none:  { bg: '#F2F3F5', fg: '#9AA1AE', Icon: XCircle },
  read:  { bg: '#E5F1FF', fg: '#1E4D8B', Icon: MinusCircle },
  write: { bg: '#FEF3E2', fg: '#B26A00', Icon: CheckCircle2 },
  rw:    { bg: '#E7F6EC', fg: '#16793C', Icon: CheckCircle2 },
};

export function ProfProfile({
  profile, scope, colleges,
}: {
  profile: Profile;
  scope: ProfessorScope | null;
  colleges: NavCollege[];
}) {
  const accessType = scope?.type ?? 'all';
  const totalItems = colleges.reduce((acc, c) => acc + c.cours.length, 0);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* En-tête */}
      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#E4002B_0%,#F97316_100%)] text-white shadow-[0_6px_20px_-8px_rgba(228,0,43,0.6)]">
          <GraduationCap className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-(--color-ink-muted)">
            Espace Professeur
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-(--color-ink)">
            Mon profil
          </h1>
          <p className="text-sm text-(--color-ink-soft)">
            Vos infos personnelles et le détail de vos accès pédagogiques.
          </p>
        </div>
      </header>

      {/* Rôle + portée */}
      <section className="mb-5 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
            <Shield className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">
              Rôle
            </p>
            <p className="mt-0.5 font-display text-lg font-semibold text-(--color-ink)">
              Professeur
            </p>
            <p className="mt-1 text-sm text-(--color-ink-soft)">
              {accessType === 'all'
                ? 'Accès à l\'ensemble des collèges de la plateforme.'
                : `Accès restreint à ${colleges.length} collège${colleges.length > 1 ? 's' : ''} (${totalItems} item${totalItems > 1 ? 's' : ''}).`}
            </p>
          </div>
          <span className="rounded-full bg-(--color-primary-soft) px-2.5 py-1 text-xs font-semibold text-(--color-primary)">
            {accessType === 'all' ? 'Tous collèges' : 'Restreint'}
          </span>
        </div>
      </section>

      {/* Permissions par type de contenu */}
      <section className="mb-5 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          Permissions par type de contenu
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {CONTENT_TYPES.map((t: ContentType) => {
            const level: PermissionLevel = scope?.content_permissions?.[t] ?? 'none';
            const th = PERM_THEME[level];
            return (
              <div
                key={t}
                className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3"
              >
                <p className="text-[11px] font-bold uppercase tracking-wide text-(--color-ink-muted)">
                  {CONTENT_TYPE_LABEL[t]}
                </p>
                <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11.5px] font-semibold" style={{ background: th.bg, color: th.fg }}>
                  <th.Icon className="h-3 w-3" />
                  {PERMISSION_LEVEL_LABEL[level]}
                </p>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] text-(--color-ink-muted)">
          Les permissions définissent ce que vous pouvez consulter ou modifier dans l&rsquo;administration
          et dans la vue étudiant (bouton crayon). Pour modifier, contactez un administrateur.
        </p>
      </section>

      {/* Collèges accessibles */}
      <section className="mb-5 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          Collèges accessibles
        </p>
        {colleges.length === 0 ? (
          <p className="mt-3 rounded-lg bg-(--color-surface-soft) p-3 text-sm italic text-(--color-ink-soft)">
            Aucun collège ne vous est encore assigné.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {colleges.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3 py-2.5 text-sm"
              >
                <span className="truncate font-semibold text-(--color-ink)">{c.nom}</span>
                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-(--color-ink-soft)">
                  {c.cours.length} items
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Infos perso */}
      <section className="mb-5 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          Informations personnelles
        </p>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <Info label="Prénom"    value={profile.first_name ?? '—'} icon={<User className="h-3.5 w-3.5" />} />
          <Info label="Nom"       value={profile.last_name ?? '—'}  icon={<User className="h-3.5 w-3.5" />} />
          <Info label="Email"     value={profile.email ?? '—'}       icon={<Mail className="h-3.5 w-3.5" />} mono />
          <Info label="Téléphone" value={profile.phone ?? 'Non renseigné'} icon={<Phone className="h-3.5 w-3.5" />} />
        </dl>
        <ProfileEditor initial={{ first_name: profile.first_name, last_name: profile.last_name, phone: profile.phone }} />
      </section>

      {/* Pseudo public — affiché sur le forum et la messagerie */}
      <section className="mb-5 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          <UserCircle2 className="h-3 w-3" />
          Pseudo public
        </p>
        <p className="mt-2 text-sm text-(--color-ink-soft)">
          Affiché sur le forum et la messagerie à la place de votre nom complet. Exemples&nbsp;:
          <span className="ml-1 italic">Professeur Cardiologie, Professeur Pédiatrie…</span>
          Votre nom réel reste visible uniquement côté administration.
        </p>
        <div className="mt-4">
          <PseudoEditor initial={profile.pseudo ?? ''} />
        </div>
      </section>

      {/* Sécurité */}
      <section className="mb-5 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          <KeyRound className="h-3 w-3" />
          Sécurité
        </p>
        <p className="mt-2 text-sm text-(--color-ink-soft)">
          Mettez à jour votre mot de passe à tout moment. Minimum 8 caractères.
        </p>
        <PasswordChanger />
      </section>
    </div>
  );
}

function Info({
  label, value, icon, mono = false,
}: {
  label: string; value: string; icon?: React.ReactNode; mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3.5 py-2.5">
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-(--color-ink-muted)">
        {icon}
        {label}
      </p>
      <p className={'mt-0.5 text-sm text-(--color-ink) ' + (mono ? 'font-mono break-all' : '')}>{value}</p>
    </div>
  );
}
