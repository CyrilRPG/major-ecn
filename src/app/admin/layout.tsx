import { cookies, headers } from 'next/headers';
import { enImpersonation } from '@/lib/auth/impersonation-marqueur';
import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/auth/require-role';
import { exigenceMfa } from '@/lib/auth/mfa';
import { ongletsDe } from '@/lib/auth/onglets-equipe';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { UserMenu } from '@/components/user-menu';
import { ImpersonationBanner } from '@/components/impersonation-banner';
import { BanniereRelancesDecouverte } from '@/components/admin/relances-decouverte/banniere';
import { ActionsCockpit } from '@/components/admin/cockpit/actions-globales';
import { EnteteAdmin } from '@/components/admin/cockpit/entete-admin';
import { contexteCockpit, membresEquipe } from '@/lib/cockpit/server/base';
import { pastillesMenu } from '@/lib/cockpit/server/donnees';
import { nomComplet } from '@/lib/cockpit/regles';

export const metadata = { title: 'Administration' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireStaff();

  // Double authentification (cahier des charges 18/09/2026, §8) : une session
  // dont le facteur est enrôlé mais pas vérifié va saisir son code ; un compte
  // pour lequel la 2FA est obligatoire mais pas encore activée va l'activer.
  const h = await headers();
  const pathname = h.get('x-pathname') ?? '';
  const exigence = await exigenceMfa(profile, pathname);
  if (exigence === 'verifier') redirect(`/admin/securite/verifier?next=${encodeURIComponent(pathname || '/admin')}`);
  if (exigence === 'activer') redirect('/admin/securite?obligatoire=1');

  // Onglets ouverts (cf. `accesOnglets`) : résolus côté serveur, y compris le
  // rôle de suivi hérité d'un compte historique (suivi_staff_roles).
  const onglets = await ongletsDe(profile);

  // « Se connecter en tant que » un membre de l'équipe : le bandeau de retour
  // doit exister aussi dans l'administration, pas seulement en vue élève.
  const cookieStore = await cookies();
  const impersonating = await enImpersonation(cookieStore, profile.id);
  const impersonatedName = cookieStore.get('impersonator_target_name')?.value;

  // Cockpit (CDC 08/10/2026) : pastilles du menu, membres de l'équipe pour
  // « + Nouvelle action » (affectations). Une panne ici ne doit jamais
  // fermer l'administration : valeurs neutres en repli.
  const { moi, db } = await contexteCockpit();
  const [pastilles, membres] = await Promise.all([
    pastillesMenu(db, moi).catch(() => ({ taches: 0, messages: 0, reclamations: 0, demandes: 0, notifications: 0 })),
    membresEquipe(db).then((l) => l.map((m) => ({ id: m.id, nom: nomComplet(m) || m.email || 'Membre' }))).catch(() => []),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      {impersonating && <ImpersonationBanner targetName={impersonatedName} />}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <AdminSidebar profile={profile} onglets={onglets} pastilles={pastilles} />
        <ActionsCockpit membres={membres} estAdmin={moi.estAdmin}>
          <div className="flex min-w-0 flex-1 flex-col bg-(--color-surface-soft)">
            <EnteteAdmin estAdmin={moi.estAdmin} nonLues={pastilles.notifications} menuCompte={<UserMenu profile={profile} />} />
            {/* Notification « candidats Offre Découverte à relancer » (pages d'atterrissage). */}
            <BanniereRelancesDecouverte visible={onglets.suivi} />
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </ActionsCockpit>
      </div>
    </div>
  );
}
