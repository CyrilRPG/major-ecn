import { notFound } from 'next/navigation';
import { ActivityView } from '@/components/student/plan/v4/activity/activity-view';
import { getActivity, listItemsByIds } from '@/lib/plan/db';
import { toCards } from '@/lib/plan/pages';
import { pageEnv } from '../../_env';

export const metadata = { title: 'Activité — Mon planning' };

/** Une activité du planning (seulement celles du candidat connecté). */
export default async function ActivitePage({ params }: { params: Promise<{ id: string }> }) {
  const env = await pageEnv();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const a = await getActivity(env.userId, id);
  if (!a) notFound();
  const ids = a.item_ids.length > 0 ? a.item_ids : a.item_id ? [a.item_id] : [];
  const names = new Map((await listItemsByIds(ids)).map((i) => [i.id, i.nom_item]));
  const card = toCards([a], env.ctx, names)[0];
  const view = a.item_id ? env.ctx?.views.get(a.item_id) : undefined;
  const coaching = a.resource_ids.coachingId ? env.ctx?.coachings.find((c) => c.id === a.resource_ids.coachingId) : undefined;
  return <ActivityView a={card} today={env.today} unknownItem={!!view?.unknown} parcoursHref={coaching?.numero ? `/parcours/${coaching.numero}` : null} />;
}
