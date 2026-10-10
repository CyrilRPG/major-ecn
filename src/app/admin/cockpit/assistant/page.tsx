import { contexteCockpit, FACULTE } from '@/lib/cockpit/server/base';
import { EntetePage, PageCockpit } from '@/components/admin/cockpit/ui';
import { BlocAssistant } from '@/components/admin/cockpit/accueil/bloc-assistant';
import type { AmeliorationResume, ReclamationResume } from '@/lib/cockpit/server/donnees';

export const metadata = { title: 'Outils IA' };
export const dynamic = 'force-dynamic';

/** Outils IA du cockpit : l'assistant, avec les dossiers auxquels l'utilisateur a accès. */
export default async function AssistantPage() {
  const { moi, db } = await contexteCockpit();
  const [recl, amel] = moi.estAdmin
    ? await Promise.all([
      db.from('cockpit_reclamations')
        .select('id, candidat_id, candidat_label, specialite, sujet, categorie, statut, priorite, created_at, amelioration_id, a_recontacter')
        .eq('faculte_id', FACULTE).order('created_at', { ascending: false }).limit(100),
      db.from('cockpit_ameliorations').select('id, numero, titre, module, priorite, statut, echeance')
        .eq('faculte_id', FACULTE).order('created_at', { ascending: false }).limit(100),
    ])
    : [{ data: [] }, { data: [] }];
  return (
    <PageCockpit>
      <div className="mx-auto max-w-3xl">
        <EntetePage
          titre="Outils IA"
          sousTitre="Rédiger, reformuler, synthétiser, analyser. L’assistant propose, vous décidez : aucun message n’est envoyé sans votre validation, et seules les informations autorisées du dossier lui sont transmises (jamais d’adresse e-mail ni de téléphone)."
        />
        <BlocAssistant
          reclamations={(recl.data ?? []) as ReclamationResume[]}
          ameliorations={((amel.data ?? []) as Omit<AmeliorationResume, 'candidats'>[]).map((a) => ({ ...a, candidats: 0 }))}
        />
        <p className="mt-4 text-[12.5px] text-(--color-ink-soft)">
          Pour écrire à un enseignant, ouvrez sa conversation dans la messagerie : l’assistant y dispose du contexte du fil (prénom, mission,
          échéance, derniers échanges) et propose les tons professionnel, chaleureux, direct ou ferme et courtois.
        </p>
      </div>
    </PageCockpit>
  );
}
