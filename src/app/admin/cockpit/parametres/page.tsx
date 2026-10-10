import { contexteCockpit } from '@/lib/cockpit/server/base';
import { EntetePage, PageCockpit } from '@/components/admin/cockpit/ui';
import { ParametresCockpit } from '@/components/admin/cockpit/parametres/parametres-cockpit';

export const metadata = { title: 'Paramètres du cockpit' };
export const dynamic = 'force-dynamic';

/**
 * Paramètres du cockpit : notifications (e-mail des rappels et affectations,
 * push), signature des messages, exports, notes personnelles et journal
 * d'audit de ses propres actions sensibles (§10, §11).
 */
export default async function ParametresPage() {
  const { moi, db } = await contexteCockpit();
  const [{ data: reglages }, { data: journal }, { data: notes }] = await Promise.all([
    db.from('cockpit_reglages').select('email_rappels, email_affectations, push, signature').eq('user_id', moi.id).maybeSingle(),
    db.from('cockpit_journal').select('objet_type, action, details, created_at').eq('acteur_id', moi.id).eq('audit', true).order('created_at', { ascending: false }).limit(100),
    db.from('cockpit_notes').select('id, contenu, epinglee, updated_at').eq('owner_id', moi.id).order('epinglee', { ascending: false }).order('updated_at', { ascending: false }).limit(200),
  ]);
  return (
    <PageCockpit>
      <div className="mx-auto max-w-4xl">
        <EntetePage titre="Paramètres" sousTitre="Vos réglages personnels : ils ne s’appliquent qu’à votre cockpit." />
        <ParametresCockpit
          reglages={reglages ?? { email_rappels: true, email_affectations: true, push: true, signature: null }}
          journal={(journal ?? []) as { objet_type: string; action: string; details: Record<string, unknown>; created_at: string }[]}
          notes={(notes ?? []) as { id: string; contenu: string; epinglee: boolean; updated_at: string }[]}
        />
      </div>
    </PageCockpit>
  );
}
