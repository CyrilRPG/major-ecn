'use client';

import * as React from 'react';
import Link from 'next/link';
import { Hourglass, MessagesSquare } from 'lucide-react';
import type { AttenteReponse, DernierMessage } from '@/lib/cockpit/server/donnees';
import { depuis } from '@/lib/cockpit/regles';
import { cn } from '@/lib/utils';
import { Avatar, Carte, EnteteCarte, Vide } from '../ui';

const TYPE_LABEL: Record<string, string> = { enseignant: 'Enseignant', eleve: 'Élève', client: 'Client', administration: 'Administration' };

/** « En attente de réponse » (§2 « À suivre ») : relances envoyées restées sans réponse. */
export function BlocAttente({ attente }: { attente: AttenteReponse[] }) {
  const [filtre, setFiltre] = React.useState<'tous' | 'enseignants' | 'clients'>('tous');
  const liste = attente.filter((a) => filtre === 'tous' || (filtre === 'enseignants' ? a.type === 'enseignant' : a.type !== 'enseignant'));
  const n = { tous: attente.length, enseignants: attente.filter((a) => a.type === 'enseignant').length, clients: attente.filter((a) => a.type !== 'enseignant').length };
  return (
    <Carte className="flex flex-col">
      <EnteteCarte icone={Hourglass} titre="En attente de réponse" compteur={attente.length} lien="/admin/cockpit/messagerie?boite=envoyes" />
      <div className="flex gap-1 px-4 pb-2 sm:px-5" role="tablist">
        {([['tous', 'Tous'], ['enseignants', 'Enseignants'], ['clients', 'Clients']] as const).map(([v, l]) => (
          <button key={v} type="button" role="tab" aria-selected={filtre === v} onClick={() => setFiltre(v)}
            className={cn('inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium',
              filtre === v ? 'bg-(--color-primary) text-white' : 'bg-(--color-surface-soft) text-(--color-ink-soft) hover:bg-(--color-surface-soft)')}>
            {l}<span className={cn('rounded-full px-1.5 text-[11px]', filtre === v ? 'bg-white/25' : 'bg-white text-(--color-ink-soft)')}>{n[v]}</span>
          </button>
        ))}
      </div>
      <ul className="max-h-[260px] flex-1 divide-y divide-(--color-border) overflow-y-auto px-4 pb-3 sm:px-5">
        {liste.length === 0 && <Vide>Aucune relance en attente.</Vide>}
        {liste.map((a) => (
          <li key={a.conversationId} className="flex items-center gap-3 py-2">
            <Avatar nom={a.interlocuteur} taille={32} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-semibold text-(--color-ink)">{a.interlocuteur}</p>
              <p className="truncate text-[12px] text-(--color-ink-soft)">{a.sujet}</p>
            </div>
            <span className="hidden shrink-0 text-[12px] text-(--color-ink-soft) sm:block">{depuis(a.depuis)}</span>
            <Link href={`/admin/cockpit/messagerie/${a.conversationId}?relancer=1`}
              className="shrink-0 rounded-md border border-(--color-primary-soft) bg-(--color-primary-soft) px-2.5 py-1 text-[12px] font-medium text-(--color-primary) hover:bg-(--color-primary-soft)">
              Relancer
            </Link>
          </li>
        ))}
      </ul>
    </Carte>
  );
}

/** « Derniers messages » (§2 « Réponses reçues ») : pastille = réponses non encore traitées. */
export function BlocMessages({ messages, className }: { messages: DernierMessage[]; className?: string }) {
  return (
    <Carte className={cn('flex flex-col', className)}>
      <EnteteCarte icone={MessagesSquare} titre="Derniers messages" lien="/admin/cockpit/messagerie" lienLabel="Voir toute la messagerie" />
      <ul className="max-h-[300px] flex-1 divide-y divide-(--color-border) overflow-y-auto px-4 pb-3 sm:px-5">
        {messages.length === 0 && <Vide>Aucun message reçu pour l’instant.</Vide>}
        {messages.map((m) => (
          <li key={m.conversationId}>
            <Link href={`/admin/cockpit/messagerie/${m.conversationId}`} className="flex items-start gap-3 py-2.5 hover:opacity-85">
              <Avatar nom={m.auteur} taille={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold text-(--color-ink)">{m.auteur} <span className="font-normal text-(--color-ink-soft)">({TYPE_LABEL[m.type]})</span></p>
                <p className="truncate text-[12.5px] text-(--color-ink-soft)">{m.sujet}</p>
                <p className="truncate text-[12px] text-(--color-ink-muted)">{m.apercu}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[11.5px] text-(--color-ink-soft)">{heureOuJour(m.date)}</span>
                {m.nonTraites > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#D92D3A] px-1 text-[11px] font-bold text-white">{m.nonTraites}</span>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Carte>
  );
}

function heureOuJour(iso: string): string {
  const d = new Date(iso);
  const auj = new Date();
  if (d.toDateString() === auj.toDateString()) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const hier = new Date(auj.getTime() - 86_400_000);
  if (d.toDateString() === hier.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
