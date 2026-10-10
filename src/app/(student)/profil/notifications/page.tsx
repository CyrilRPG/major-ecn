import { requireUser } from '@/lib/auth/require-role';
import { PreferencesNotifications } from '@/components/notifications/preferences-notifications';

export const metadata = { title: 'Mes notifications' };

/** Mon compte → Préférences → Notifications (centre de notifications de la plateforme). */
export default async function NotificationsPage() {
  await requireUser();
  return <PreferencesNotifications />;
}
