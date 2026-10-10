'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CalendarPlus, ChevronDown, ClipboardList, FilePlus2, Inbox, ListPlus, PhoneCall, Plus, Send, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TacheInput } from '@/app/admin/cockpit/actions-taches';
import type { RdvInput } from '@/app/admin/cockpit/actions-divers';
import { FormulaireNote, FormulaireRdv, FormulaireTache, type Membre } from './formulaires';
import { FormulaireRelance } from './messagerie/formulaire-relance';
import { FormulaireDemande } from './formulaire-demande';
import { FormulaireReclamation } from './formulaire-reclamation';

/**
 * Bouton permanent « + Nouvelle action » (addendum §4) : chaque action ouvre
 * un formulaire court, prérempli quand le contexte est connu. Le contexte
 * est partagé par toute l'administration : n'importe quel bloc (« Relancer »,
 * « Créer une tâche depuis cette fiche »…) ouvre le même formulaire.
 */

type Prerempli = {
  tache: Partial<TacheInput>;
  rdv: Partial<RdvInput>;
  relance: { type?: 'enseignant' | 'eleve' | 'client'; personneId?: string; personneLabel?: string; email?: string; sujet?: string; mission?: string; tacheId?: string };
  appel: Record<string, unknown>;
  demande: Record<string, unknown>;
  reclamation: Record<string, unknown>;
  note: { texte?: string };
};
export type TypeAction = keyof Prerempli;

type Etat = { [K in TypeAction]: { type: K; initial?: Prerempli[K] } }[TypeAction] | null;

const Ctx = React.createContext<{ ouvrir: <K extends TypeAction>(type: K, initial?: Prerempli[K]) => void; membres: Membre[] } | null>(null);

export function useActionsCockpit() {
  const c = React.useContext(Ctx);
  if (!c) throw new Error('useActionsCockpit hors de <ActionsCockpit>');
  return c;
}

const TITRES: Record<TypeAction, { titre: string; aide: string }> = {
  tache: { titre: 'Créer une tâche', aide: 'Un titre suffit ; la fiche détaillée est facultative.' },
  rdv: { titre: 'Ajouter un rendez-vous', aide: 'Date, personne, objet, lien Zoom, documents et notes.' },
  relance: { titre: 'Relancer quelqu’un', aide: 'Un enseignant, un élève ou un client : le message part depuis Major ECN, après votre validation.' },
  appel: { titre: 'Enregistrer un appel', aide: 'Fiche rapide d’une demande reçue par téléphone.' },
  demande: { titre: 'Nouvelle demande client', aide: 'Pédagogique, administrative, commerciale ou comptable.' },
  reclamation: { titre: 'Nouvelle réclamation', aide: 'Un retour de candidat à traiter individuellement, et à rattacher à une amélioration si le problème est récurrent.' },
  note: { titre: 'Note personnelle', aide: 'Strictement privée : aucun autre administrateur ne la voit.' },
};

export function ActionsCockpit({ membres, estAdmin, children }: { membres: Membre[]; estAdmin: boolean; children: React.ReactNode }) {
  const [etat, setEtat] = React.useState<Etat>(null);
  const router = useRouter();
  const ouvrir = React.useCallback(<K extends TypeAction>(type: K, initial?: Prerempli[K]) => {
    setEtat({ type, initial } as Etat);
  }, []);
  const fermer = () => setEtat(null);
  const valeur = React.useMemo(() => ({ ouvrir, membres }), [ouvrir, membres]);

  return (
    <Ctx.Provider value={valeur}>
      {children}
      <Dialog open={!!etat} onOpenChange={(o) => !o && fermer()}>
        <DialogContent className="max-h-[92dvh] max-w-2xl overflow-y-auto">
          {etat && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{TITRES[etat.type].titre}</DialogTitle>
                <DialogDescription>{TITRES[etat.type].aide}</DialogDescription>
              </DialogHeader>
              {etat.type === 'tache' && (
                <FormulaireTache membres={membres} initial={etat.initial} onFini={(id) => { fermer(); router.push(`/admin/cockpit/taches?t=${id}`); }} />
              )}
              {etat.type === 'rdv' && <FormulaireRdv initial={etat.initial} onFini={() => { fermer(); router.refresh(); }} />}
              {etat.type === 'relance' && <FormulaireRelance initial={etat.initial} onFini={() => fermer()} />}
              {etat.type === 'appel' && (
                <FormulaireDemande membres={membres} initial={{ canal: 'telephone', ...(etat.initial ?? {}) }} onFini={(id) => { fermer(); router.push(`/admin/cockpit/demandes?d=${id}`); }} />
              )}
              {etat.type === 'demande' && (
                <FormulaireDemande membres={membres} initial={etat.initial} onFini={(id) => { fermer(); router.push(`/admin/cockpit/demandes?d=${id}`); }} />
              )}
              {etat.type === 'reclamation' && estAdmin && (
                <FormulaireReclamation membres={membres} initial={etat.initial} onFini={(id) => { fermer(); router.push(`/admin/cockpit/reclamations?r=${id}`); }} />
              )}
              {etat.type === 'note' && <FormulaireNote initial={etat.initial?.texte} onFini={fermer} />}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  );
}

/** Le bouton bordeaux de l'en-tête. */
export function BoutonNouvelleAction({ estAdmin }: { estAdmin: boolean }) {
  const { ouvrir } = useActionsCockpit();
  const items: { type: TypeAction; label: string; Icon: typeof Plus }[] = [
    { type: 'tache', label: 'Créer une tâche', Icon: ListPlus },
    { type: 'rdv', label: 'Ajouter un RDV', Icon: CalendarPlus },
    { type: 'relance', label: 'Relancer quelqu’un', Icon: Send },
    { type: 'appel', label: 'Enregistrer un appel', Icon: PhoneCall },
    { type: 'demande', label: 'Demande client', Icon: Inbox },
    ...(estAdmin ? [{ type: 'reclamation' as const, label: 'Réclamation client', Icon: ClipboardList }] : []),
    { type: 'note', label: 'Note personnelle', Icon: StickyNote },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="md" className="px-3 sm:px-4">
          <Plus />
          <span className="hidden sm:inline">Nouvelle action</span>
          <ChevronDown className="opacity-80" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex items-center gap-2"><FilePlus2 className="h-4 w-4" /> Nouvelle action</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((it) => (
          <DropdownMenuItem key={it.type} onClick={() => ouvrir(it.type)}>
            <it.Icon />
            {it.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
