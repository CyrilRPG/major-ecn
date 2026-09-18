import { ShieldCheck, Users } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { hierarchieColleges, listerEquipe } from '@/lib/equipe/server';
import { ROLES_MODELES, ZONES_RESERVEES_ADMIN } from '@/lib/auth/collaborateurs';
import { CollaborateurDialog } from '@/components/admin/equipe/collaborateur-dialog';
import { EquipeList, type LigneEquipe } from '@/components/admin/equipe/equipe-list';

export const metadata = { title: 'Équipe & Permissions' };
export const dynamic = 'force-dynamic';

/**
 * Équipe & Permissions (cahier des charges 18/09/2026) : tout le personnel,
 * administrateurs compris, avec pour chacun ses permissions cumulables, son
 * périmètre, son statut, sa date de fin d'accès et l'état de sa double
 * authentification. Création, modification, aperçu des droits, connexion
 * « en tant que », activation / désactivation.
 */
export default async function EquipePage() {
  await requireAdmin();
  const [membres, hierarchie] = await Promise.all([listerEquipe(), hierarchieColleges()]);
  // Spécialités = collèges de premier niveau ; les sous-collèges (Médecine
  // générale → Ophtalmologie…) se cochent avec leur parent ou un par un.
  const colleges = hierarchie.arbre;

  const rows: LigneEquipe[] = membres.map((m) => ({
    id: m.id, role: m.role, first_name: m.first_name, last_name: m.last_name, email: m.email, phone: m.phone,
    is_active: m.is_active, access_end: m.access_end, last_sign_in: m.last_sign_in, mfa_facteurs: m.mfa_facteurs, scope: m.scope,
  }));
  const nbAdmins = rows.filter((r) => r.role === 'admin').length;
  const nbCollabs = rows.length - nbAdmins;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-(--color-border) pb-5">
        <div>
          <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
          <h1 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight text-(--color-ink)">
            <Users className="h-5 w-5 text-[#E4002B]" /> Équipe &amp; Permissions
          </h1>
          <p className="mt-0.5 text-sm text-(--color-ink-soft)">
            {nbCollabs} collaborateur{nbCollabs > 1 ? 's' : ''} · {nbAdmins} administrateur{nbAdmins > 1 ? 's' : ''}. Chaque personne possède des
            permissions cumulables (suivi élèves, contenus, blog) sur un périmètre précis.
          </p>
        </div>
        <CollaborateurDialog mode="creer" colleges={colleges} />
      </header>

      <EquipeList rows={rows} colleges={colleges} />

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
          <h2 className="text-sm font-bold text-(--color-ink)">Rôles modèles</h2>
          <p className="mt-1 text-xs text-(--color-ink-muted)">Un point de départ que l’on personnalise ensuite, droit par droit.</p>
          <ul className="mt-3 space-y-2 text-sm">
            {(Object.entries(ROLES_MODELES) as [string, { label: string; description: string }][]).map(([k, r]) => (
              <li key={k}><span className="font-semibold text-(--color-ink)">{r.label}</span> — <span className="text-(--color-ink-soft)">{r.description}</span></li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-(--color-ink)"><ShieldCheck className="h-4 w-4 text-[#16793C]" /> Toujours réservé aux administrateurs</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-(--color-ink-soft)">
            {ZONES_RESERVEES_ADMIN.map((z) => <li key={z}>{z}</li>)}
          </ul>
          <p className="mt-3 text-xs text-(--color-ink-muted)">Chaque action d’un collaborateur est horodatée à son nom dans le journal d’activité.</p>
        </div>
      </section>
    </main>
  );
}
