'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Download, Pin, PinOff, ScrollText, StickyNote, Trash2 } from 'lucide-react';
import { enregistrerReglages, epinglerNote, supprimerNote } from '@/app/admin/cockpit/actions-divers';
import { useActionsCockpit } from '../actions-globales';
import { Bouton, Carte, EnteteCarte, champ, Libelle, Toast, useMessage, Vide } from '../ui';

type Reglages = { email_rappels: boolean; email_affectations: boolean; push: boolean; signature: string | null };

const ACTIONS: Record<string, string> = {
  envoi: 'Message envoyé', reponse: 'Réponse reçue', reponse_saisie: 'Réponse consignée', creation: 'Création', partage: 'Partage',
  revocation: 'Révocation d’un partage', affectation: 'Affectation', modification: 'Modification', echec_email: 'Échec d’e-mail',
  ia_rediger: 'Brouillon IA', ia_corriger: 'Correction IA', ia_reformuler: 'Reformulation IA', ia_raccourcir: 'Raccourci IA',
  ia_developper: 'Développement IA', ia_objet: 'Objet proposé par l’IA', ia_assistant: 'Assistant IA',
};
const OBJETS: Record<string, string> = {
  conversation: 'Conversation', tache: 'Tâche', demande: 'Demande client', reclamation: 'Réclamation', amelioration: 'Amélioration',
  ia: 'IA', reglages: 'Réglages', envoi: 'Envoi',
};

export function ParametresCockpit({
  reglages, journal, notes,
}: {
  reglages: Reglages;
  journal: { objet_type: string; action: string; details: Record<string, unknown>; created_at: string }[];
  notes: { id: string; contenu: string; epinglee: boolean; updated_at: string }[];
}) {
  const router = useRouter();
  const { ouvrir } = useActionsCockpit();
  const [v, setV] = React.useState<Reglages>(reglages);
  const [message, setMessage] = useMessage();
  const [enCours, start] = React.useTransition();

  return (
    <div className="space-y-4">
      <Carte>
        <EnteteCarte icone={Bell} titre="Notifications" />
        <div className="space-y-3 px-4 pb-4 sm:px-5">
          <p className="rounded-lg bg-(--color-primary-soft) px-3 py-2 text-[13px] text-(--color-primary)">
            Règle du module : chaque réponse d’un enseignant à l’une de vos conversations vous est <strong>toujours</strong> envoyée en copie complète par e-mail,
            avec l’objet « [MAJOR ECN - MESSAGERIE INTERNE] Réponse de … » (facile à filtrer dans Gmail). Cette copie ne peut pas être désactivée.
          </p>
          {([
            ['email_rappels', 'Recevoir aussi par e-mail les rappels que je programme'],
            ['email_affectations', 'Recevoir par e-mail les tâches et dossiers qui me sont confiés'],
            ['push', 'Notifications push sur mobile (quand l’application et les autorisations le permettent)'],
          ] as const).map(([k, l]) => (
            <label key={k} className="flex items-center gap-3 text-[14px] text-(--color-ink)">
              <input type="checkbox" checked={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.checked })} className="h-4 w-4 accent-(--color-primary)" />
              {l}
            </label>
          ))}
          <div>
            <Libelle aide="(utilisée par l’assistant IA)">Signature de mes messages</Libelle>
            <textarea rows={3} className={champ} value={v.signature ?? ''} onChange={(e) => setV({ ...v, signature: e.target.value })} placeholder={'Bien cordialement,\nL’équipe Major ECN'} />
          </div>
          <div className="flex justify-end">
            <Bouton enCours={enCours} onClick={() => start(async () => { const r = await enregistrerReglages(v); setMessage(r.ok ? 'Paramètres enregistrés.' : r.erreur); router.refresh(); })}>
              Enregistrer
            </Bouton>
          </div>
        </div>
      </Carte>

      <Carte>
        <EnteteCarte icone={StickyNote} titre="Mes notes personnelles" compteur={notes.length} actions={<Bouton taille="sm" variante="doux" onClick={() => ouvrir('note')}>+ Note</Bouton>} />
        <ul className="grid gap-3 px-4 pb-4 sm:grid-cols-2 sm:px-5">
          {notes.length === 0 && <li className="sm:col-span-2"><Vide>Aucune note. Elles sont strictement privées.</Vide></li>}
          {notes.map((n) => (
            <li key={n.id} className="relative rounded-xl border border-[#F1E2B8] bg-[#FFF9E8] p-3">
              <p className="whitespace-pre-wrap pr-14 text-[13.5px] text-(--color-ink)">{n.contenu}</p>
              <p className="mt-2 text-[11px] text-(--color-ink-muted)">{new Date(n.updated_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              <div className="absolute right-2 top-2 flex gap-1">
                <button type="button" aria-label={n.epinglee ? 'Désépingler' : 'Épingler'} onClick={() => start(async () => { await epinglerNote(n.id, !n.epinglee); router.refresh(); })} className="rounded p-1 text-(--color-ink-muted) hover:bg-white hover:text-(--color-primary)">
                  {n.epinglee ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                </button>
                <button type="button" aria-label="Supprimer la note" onClick={() => { if (confirm('Supprimer définitivement cette note ?')) start(async () => { await supprimerNote(n.id); router.refresh(); }); }} className="rounded p-1 text-(--color-ink-muted) hover:bg-white hover:text-[#B42318]">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Carte>

      <Carte>
        <EnteteCarte icone={Download} titre="Exports et sauvegarde" />
        <div className="flex flex-wrap gap-2 px-4 pb-4 sm:px-5">
          <a href="/api/cockpit/export?type=taches" className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-(--color-border) bg-white px-3 text-sm font-medium text-(--color-primary) hover:bg-(--color-primary-soft)"><Download className="h-4 w-4" /> Mes tâches (CSV)</a>
          <a href="/api/cockpit/export?type=conversations" className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-(--color-border) bg-white px-3 text-sm font-medium text-(--color-primary) hover:bg-(--color-primary-soft)"><Download className="h-4 w-4" /> Mes conversations (CSV)</a>
          <p className="w-full text-[12.5px] text-(--color-ink-soft)">Les exports ne contiennent que vos propres données.</p>
        </div>
      </Carte>

      <Carte>
        <EnteteCarte icone={ScrollText} titre="Journal de mes actions sensibles" />
        <ul className="max-h-[360px] divide-y divide-(--color-border) overflow-y-auto px-4 pb-4 text-[13px] sm:px-5">
          {journal.length === 0 && <Vide>Aucune action journalisée.</Vide>}
          {journal.map((j, i) => (
            <li key={i} className="flex gap-3 py-1.5">
              <span className="w-[120px] shrink-0 text-(--color-ink-muted)">{new Date(j.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              <span className="text-(--color-ink)">{ACTIONS[j.action] ?? j.action}</span>
              <span className="text-(--color-ink-soft)">· {OBJETS[j.objet_type] ?? j.objet_type}</span>
            </li>
          ))}
        </ul>
      </Carte>
      <Toast message={message} />
    </div>
  );
}
