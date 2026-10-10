'use client';

import * as React from 'react';
import { ArrowRight, Copy, FileSearch, FileText, ListTodo, PenLine, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { demanderAssistant } from '@/app/admin/cockpit/actions-messagerie';
import type { AmeliorationResume, ReclamationResume } from '@/lib/cockpit/server/donnees';
import { cn } from '@/lib/utils';
import { useActionsCockpit } from '../actions-globales';
import { Bouton, Carte, champ } from '../ui';

type Dossier = { type: 'reclamation' | 'amelioration'; id: string } | null;

const RACCOURCIS = [
  { cle: 'relance', label: 'Rédiger une relance', Icone: PenLine, consigne: 'Rédige une relance cordiale mais ferme pour un enseignant afin de connaître le délai de finalisation de son travail.', dossier: null },
  { cle: 'synthese', label: 'Synthétiser une réclamation', Icone: FileText, consigne: 'Synthétise cette réclamation en 5 lignes : problème, impact pour le candidat, réponse à apporter.', dossier: 'reclamation' },
  { cle: 'analyse', label: 'Analyser une réclamation', Icone: FileSearch, consigne: 'Analyse cette réclamation : s’agit-il d’un problème individuel, pédagogique collectif, technique ou de service ? Quelle action proposes-tu ?', dossier: 'reclamation' },
  { cle: 'plan', label: 'Planifier une amélioration', Icone: ListTodo, consigne: 'Propose un plan d’action pour cette amélioration : étapes, responsable type, vérification du résultat et recontact des candidats.', dossier: 'amelioration' },
] as const;

/**
 * « Assistant IA Major ECN » : rédiger, reformuler, organiser, analyser. Le
 * texte proposé n'est jamais envoyé automatiquement (§5 de l'addendum, C05).
 */
export function BlocAssistant({ reclamations, ameliorations, className }: { reclamations: ReclamationResume[]; ameliorations: AmeliorationResume[]; className?: string }) {
  const { ouvrir } = useActionsCockpit();
  const [consigne, setConsigne] = React.useState('');
  const [typeDossier, setTypeDossier] = React.useState<'reclamation' | 'amelioration' | null>(null);
  const [dossierId, setDossierId] = React.useState('');
  const [resultat, setResultat] = React.useState<string | null>(null);
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [enCours, start] = React.useTransition();
  const [copie, setCopie] = React.useState(false);

  const lancer = () => {
    setErreur(null);
    const dossier: Dossier = typeDossier && dossierId ? { type: typeDossier, id: dossierId } : null;
    start(async () => {
      const r = await demanderAssistant(consigne, dossier);
      if (!r.ok) return setErreur(r.erreur);
      setResultat(r.data!.texte);
    });
  };

  return (
    <Carte className={cn('flex flex-col', className)}>
      <header className="flex items-start gap-3 px-4 pt-4 sm:px-5">
        <Sparkles className="mt-0.5 h-7 w-7 shrink-0 text-(--color-primary)" />
        <div>
          <h2 className="text-[19px] font-semibold text-(--color-primary)">Assistant IA Major ECN</h2>
          <p className="text-[13px] text-(--color-ink-soft)">Rédigez, reformulez, organisez, analysez… Votre assistant vous fait gagner du temps.</p>
        </div>
      </header>
      <form className="mx-4 mt-3 flex gap-2 sm:mx-5" onSubmit={(e) => { e.preventDefault(); if (consigne.trim()) lancer(); }}>
        <input className={champ} value={consigne} onChange={(e) => setConsigne(e.target.value)} placeholder="Ex. : rédiger une relance pour un enseignant…" aria-label="Demande à l’assistant IA" />
        <Bouton type="submit" enCours={enCours} aria-label="Envoyer à l’assistant" className="w-11 shrink-0 px-0"><ArrowRight /></Bouton>
      </form>
      {typeDossier && (
        <div className="mx-4 mt-2 sm:mx-5">
          <select className={champ} value={dossierId} onChange={(e) => setDossierId(e.target.value)} aria-label="Dossier à analyser">
            <option value="">{typeDossier === 'reclamation' ? 'Choisir une réclamation…' : 'Choisir une amélioration…'}</option>
            {(typeDossier === 'reclamation' ? reclamations.map((r) => ({ id: r.id, l: `${r.candidat_label} — ${r.sujet}` })) : ameliorations.map((a) => ({ id: a.id, l: `n° ${String(a.numero).padStart(3, '0')} — ${a.titre}` })))
              .map((o) => <option key={o.id} value={o.id}>{o.l}</option>)}
          </select>
        </div>
      )}
      {erreur && <p className="mx-4 mt-2 text-[12.5px] text-[#B42318] sm:mx-5">{erreur}</p>}
      <div className="grid grid-cols-1 gap-2 px-4 pb-4 pt-3 sm:grid-cols-2 sm:px-5">
        {RACCOURCIS.map((r) => (
          <button key={r.cle} type="button"
            onClick={() => { setConsigne(r.consigne); setTypeDossier(r.dossier); setDossierId(''); }}
            className="flex items-center gap-2 rounded-lg border border-(--color-border) bg-white px-3 py-2 text-left text-[12.5px] font-medium text-(--color-primary) hover:bg-(--color-primary-soft)">
            <r.Icone className="h-4 w-4 shrink-0" /> {r.label}
          </button>
        ))}
      </div>
      <Dialog open={resultat !== null} onOpenChange={(o) => !o && setResultat(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-(--color-primary)" /> Proposition de l’assistant</DialogTitle>
            <DialogDescription>Relisez et corrigez : rien n’est envoyé sans votre validation.</DialogDescription>
          </DialogHeader>
          <textarea className={cn(champ, 'min-h-[260px] font-[inherit]')} value={resultat ?? ''} onChange={(e) => setResultat(e.target.value)} />
          <div className="flex flex-wrap justify-end gap-2">
            <Bouton variante="contour" onClick={async () => { await navigator.clipboard.writeText(resultat ?? ''); setCopie(true); setTimeout(() => setCopie(false), 1500); }}>
              <Copy /> {copie ? 'Copié' : 'Copier'}
            </Bouton>
            <Bouton onClick={() => { setResultat(null); ouvrir('relance'); }}>
              Écrire un message
            </Bouton>
          </div>
        </DialogContent>
      </Dialog>
    </Carte>
  );
}
