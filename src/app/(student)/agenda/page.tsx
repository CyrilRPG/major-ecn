import { requireUser } from '@/lib/auth/require-role';
import { AgendaWeek } from '@/components/student/agenda-week';

export const metadata = { title: 'Agenda' };

export default async function AgendaPage() {
  await requireUser();
  return (
    <div className="flex flex-col gap-4 px-4 py-5 lg:h-full lg:overflow-hidden lg:px-8">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-(--color-ink)">Mon agenda</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          Les cours prévus cette semaine. Cliquez sur un cours pour voir le détail et le lien Zoom.
        </p>
      </header>
      <AgendaWeek />
    </div>
  );
}
