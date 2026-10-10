import { requireUser } from '@/lib/auth/require-role';
import { NouvelleQuestion } from '@/components/echanges/nouvelle-question';

export const metadata = { title: 'Poser une question' };

export default async function NouveauPage({ searchParams }: { searchParams: Promise<{ type?: string; id?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  return <div className="h-full overflow-y-auto"><NouvelleQuestion type={sp.type ?? ''} id={sp.id ?? ''} /></div>;
}
