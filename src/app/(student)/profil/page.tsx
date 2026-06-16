import { CalendarCheck, CalendarClock, GraduationCap, KeyRound, Mail, Phone, Sparkles, User } from 'lucide-react';
import { requireUser, getProfessorScope } from '@/lib/auth/require-role';
import { parseScope, offerLabel } from '@/lib/auth/permissions';
import { isSubscriber, isTrialExpired, trialDaysLeft } from '@/lib/auth/trial';
import { generatePseudo } from '@/lib/auth/pseudo';
import { PseudoEditor } from '@/components/student/pseudo-editor';
import { AvatarPicker } from '@/components/student/avatar-picker';
import { effectiveSeed } from '@/lib/avatar';
import { UpgradeBanner } from '@/components/student/upgrade-banner';
import { ProfProfile } from '@/components/professor/prof-profile';
import { ProfileEditor } from '@/components/profile/profile-editor';
import { PasswordChanger } from '@/components/profile/password-changer';
import { DeleteAccountButton } from '@/components/profile/delete-account-button';
import { getNavigatorTree } from '@/lib/data/navigator';

export const metadata = { title: 'Mon profil' };

export default async function ProfilPage() {
  const { profile } = await requireUser();

  // Profil dédié professeur : pas de formule/abonnement, mais accès
  // pédagogiques (collèges, permissions par type de contenu).
  if (profile.role === 'professor') {
    const profScope = getProfessorScope(profile.permission_scope);
    const tree = await getNavigatorTree(profile);
    return <ProfProfile profile={profile} scope={profScope} colleges={tree} />;
  }

  const scope = parseScope(profile.permission_scope);
  const pseudo =
    profile.pseudo ??
    generatePseudo(profile.first_name ?? '', profile.last_name ?? '', profile.promotion ?? 'X');

  const subscriber = isSubscriber(profile);
  const expired = isTrialExpired(profile);
  const days = trialDaysLeft(profile);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
          <User className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-(--color-ink)">
            Mon profil
          </h1>
          <p className="text-sm text-(--color-ink-soft)">
            Vos infos personnelles, votre pseudo public et votre formule.
          </p>
        </div>
      </header>

      {/* STATUT — affiche un label dépendant du rôle + flag espace_decouverte
          + paid_formule, plutôt que d'écrire « Essentiel » à tout le monde. */}
      {(() => {
        const raw = (profile.permission_scope ?? {}) as {
          espace_decouverte?: boolean;
          paid_formule?: string;
        };
        let statusLabel: string = offerLabel(scope.offer);
        let statusDescription: React.ReactNode = (
          subscriber
            ? 'Abonné — accès complet, sans limite de temps.'
            : expired
            ? 'Essai gratuit expiré. Passez à l’abonnement pour continuer sans limite.'
            : <>Essai gratuit actif — il vous reste <span className="font-semibold text-(--color-primary)">{days} jour{days > 1 ? 's' : ''}</span>.</>
        );
        let badgeText: string = subscriber ? 'Abonné' : expired ? 'Expiré' : `${days} j`;
        let badgeTone: 'success' | 'danger' | 'primary' = subscriber ? 'success' : expired ? 'danger' : 'primary';
        if (profile.role === 'admin') {
          statusLabel = 'Administrateur';
          statusDescription = 'Accès complet à l’administration de la plateforme.';
          badgeText = 'Admin';
          badgeTone = 'primary';
        } else if (raw.espace_decouverte === true && !raw.paid_formule) {
          statusLabel = 'Espace Découverte';
          statusDescription = 'Aperçu gratuit de la plateforme — passez à une formule pour débloquer l’ensemble des contenus.';
          badgeText = 'Découverte';
          badgeTone = 'primary';
        } else if (!raw.paid_formule && scope.offer === 'decouverte') {
          statusLabel = 'Espace Découverte';
          statusDescription = 'Aperçu gratuit de la plateforme.';
          badgeText = 'Découverte';
          badgeTone = 'primary';
        }
        const badgeClass =
          badgeTone === 'success'
            ? 'bg-[color-mix(in_srgb,#2E8B57_12%,var(--color-surface))] text-[#1F6B43]'
            : badgeTone === 'danger'
            ? 'bg-[color-mix(in_srgb,var(--color-danger)_12%,var(--color-surface))] text-(--color-danger)'
            : 'bg-(--color-primary-soft) text-(--color-primary)';
        return (
          <section className="mb-5 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
                <Sparkles className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">Statut</p>
                <p className="mt-0.5 font-display text-lg font-semibold text-(--color-ink)">{statusLabel}</p>
                <p className="mt-1 text-sm text-(--color-ink-soft)">{statusDescription}</p>
              </div>
              <span className={'rounded-full px-2.5 py-1 text-xs font-semibold ' + badgeClass}>{badgeText}</span>
            </div>
          </section>
        );
      })()}

      {/* INFOS PERSO */}
      <section className="mb-5 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          Informations personnelles
        </p>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <Info label="Prénom" value={profile.first_name ?? '—'} icon={<User className="h-3.5 w-3.5" />} />
          <Info label="Nom" value={profile.last_name ?? '—'} icon={<User className="h-3.5 w-3.5" />} />
          <Info label="Email" value={profile.email ?? '—'} icon={<Mail className="h-3.5 w-3.5" />} mono />
          <Info label="Téléphone" value={profile.phone ?? 'Non renseigné'} icon={<Phone className="h-3.5 w-3.5" />} />
          <Info label="Promotion" value={profile.promotion ?? '—'} icon={<GraduationCap className="h-3.5 w-3.5" />} />
          {profile.trial_until && (
            <Info
              label="Fin de l’essai"
              value={new Date(profile.trial_until).toLocaleDateString('fr-FR', {
                day: '2-digit', month: 'long', year: 'numeric',
              })}
              icon={<CalendarClock className="h-3.5 w-3.5" />}
            />
          )}
        </dl>
        <ProfileEditor initial={{ first_name: profile.first_name, last_name: profile.last_name, phone: profile.phone }} />
      </section>

      {/* SÉCURITÉ */}
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

      {/* PRÉSENCES */}
      <section className="mb-5 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          Présences
        </p>
        <p className="mt-2 mb-4 text-sm text-(--color-ink-soft)">
          Retrouvez l’historique de vos émargements aux sessions Zoom (date, heure, intervenant).
        </p>
        <a
          href="/presences"
          className="inline-flex items-center gap-2 rounded-xl bg-(--color-primary) px-4 py-2.5 text-sm font-bold text-white hover:opacity-90"
        >
          <CalendarCheck className="h-4 w-4" /> Voir mes présences
        </a>
      </section>

      {/* AVATAR */}
      <section className="mb-5 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          Votre avatar
        </p>
        <p className="mt-2 mb-4 text-sm text-(--color-ink-soft)">
          Un avatar dessiné vous a été attribué au hasard. Choisissez celui qui vous ressemble — ou
          régénérez-en de nouveaux.
        </p>
        <AvatarPicker initialSeed={effectiveSeed(profile.id, profile.avatar_seed)} />
      </section>

      {/* PSEUDO */}
      <section className="mb-5 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">
          Pseudo public (forum)
        </p>
        <p className="mt-2 text-sm text-(--color-ink-soft)">
          Affiché uniquement sur le forum des questions/réponses. Sur le reste de la plateforme,
          on garde <span className="font-semibold text-(--color-ink)">Salut {profile.first_name ?? 'étudiant'}</span>.
        </p>
        <div className="mt-4">
          <PseudoEditor initial={pseudo} />
        </div>
      </section>

      {/* CTA upgrade if applicable */}
      <UpgradeBanner context="default" profile={profile} />

      {/* SUPPRESSION DU COMPTE — bloc danger explicite */}
      <section className="mt-6 rounded-2xl border border-(--color-danger)/30 bg-[color-mix(in_srgb,var(--color-danger)_4%,var(--color-surface))] p-5 sm:p-6">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-(--color-danger)">
          Zone dangereuse
        </p>
        <p className="mt-2 text-sm text-(--color-ink-soft)">
          Vous pouvez supprimer définitivement votre compte et l’ensemble de vos données. Cette
          action est irréversible.
          {profile.role === 'admin' && (
            <>
              <br /><span className="font-semibold text-(--color-danger)">Les administrateurs ne
              peuvent pas se supprimer eux-mêmes depuis cet écran.</span>
            </>
          )}
        </p>
        <div className="mt-3">
          <DeleteAccountButton disabled={profile.role === 'admin'} />
        </div>
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
