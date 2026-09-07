import { requireSuiviPage } from '@/lib/suivi/roles';
import { getSettings, listAlerts, listCampaigns, listStaffProfiles } from '@/lib/suivi/db';
import { INTERNAL_NOTIFY_EMAILS } from '@/lib/email/send';
import { roleCan } from '@/lib/suivi/types';
import { AlertsPanel } from '@/components/admin/suivi/alerts-panel';

export const dynamic = 'force-dynamic';

/** Alertes administrateur (§4) : persistantes, email au responsable à l'échéance. */
export default async function AlertesPage() {
  const { role } = await requireSuiviPage('view');
  const [alerts, campaigns, staff, settings] = await Promise.all([listAlerts(), listCampaigns(), listStaffProfiles(), getSettings()]);
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">Alertes</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">Rappels à date, semaine ou délai avant échéance : préparer une campagne, ouvrir des créneaux, relancer une cohorte. Plusieurs alertes futures peuvent coexister.</p>
      </header>
      <AlertsPanel
        alerts={alerts}
        campaigns={campaigns.map((c) => ({ id: c.id, name: c.name }))}
        staff={staff.map((s) => ({ id: s.id, name: s.name }))}
        defaultEmail={settings.alert_email ?? INTERNAL_NOTIFY_EMAILS[0]}
        canManage={roleCan(role, 'manage')}
      />
    </main>
  );
}
