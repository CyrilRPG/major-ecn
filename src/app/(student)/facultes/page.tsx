import { GraduationCap } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { IndexHeader, IndexList, RowIcon, type IndexRow } from '@/components/shell/index-view';
import { canAccessFaculte, parseScope } from '@/lib/auth/permissions';

export const metadata = { title: 'Catalogue' };

export default async function FacultesPage() {
  const { profile } = await requireUser();
  const scope = parseScope(profile.permission_scope);
  const supabase = await createClient();
  const { data: facultes } = await supabase.from('facultes').select('id, nom, ville').order('nom');

  const rows: IndexRow[] = (facultes ?? []).map((f) => ({
    id: f.id,
    href: `/facultes/${f.id}`,
    title: f.nom,
    subtitle: f.ville,
    leading: <RowIcon Icon={GraduationCap} />,
    locked: !canAccessFaculte(scope, f.id),
  }));

  return (
    <>
      <IndexHeader
        context="Major ECN"
        title="Catalogue des facultés"
        meta={`${rows.length} faculté${rows.length > 1 ? 's' : ''}`}
      />
      <IndexList rows={rows} />
    </>
  );
}
