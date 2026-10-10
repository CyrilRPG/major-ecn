import { requireUser } from '@/lib/auth/require-role';
import { parametres } from '@/lib/echanges/serveur/base';
import { QuestionsEnseignant } from '@/components/echanges/questions-enseignant';

export const metadata = { title: 'Questions qui me sont adressées' };

export default async function QuestionsPage() {
  await requireUser();
  const prm = await parametres();
  return <div className="h-full overflow-y-auto"><QuestionsEnseignant marquerTraite={prm.marquer_traite_actif} /></div>;
}
