'use client';

import * as React from 'react';
import Link from 'next/link';
import { ListPlus, Search, Send } from 'lucide-react';
import { useActionsCockpit } from '../actions-globales';
import { Avatar, Bouton, Carte, champ, Vide } from '../ui';

export type FicheEnseignant = {
  id: string; nom: string; email: string | null; actif: boolean; fonction: string | null;
  tachesOuvertes: number; conversations: { id: string; sujet: string }[];
};

export function ListeEnseignants({ fiches }: { fiches: FicheEnseignant[] }) {
  const { ouvrir } = useActionsCockpit();
  const [q, setQ] = React.useState('');
  const [inactifs, setInactifs] = React.useState(false);
  const s = q.trim().toLowerCase();
  const liste = fiches.filter((f) => (inactifs || f.actif) && (!s || f.nom.toLowerCase().includes(s) || f.email?.toLowerCase().includes(s) || f.fonction?.toLowerCase().includes(s)));
  return (
    <Carte>
      <div className="flex flex-wrap items-center gap-3 border-b border-(--color-border) p-3 sm:p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
          <input className={`${champ} pl-8`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un enseignant…" />
        </div>
        <label className="flex items-center gap-2 text-[13px] text-(--color-ink-soft)">
          <input type="checkbox" checked={inactifs} onChange={(e) => setInactifs(e.target.checked)} className="accent-(--color-primary)" /> Afficher les comptes inactifs
        </label>
      </div>
      <ul className="divide-y divide-(--color-border)">
        {liste.length === 0 && <Vide>Aucun enseignant.</Vide>}
        {liste.map((f) => (
          <li key={f.id} className="flex flex-wrap items-center gap-3 px-3 py-3 sm:px-4">
            <Avatar nom={f.nom} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-(--color-ink)">
                {f.nom}
                {!f.actif && <span className="ml-2 text-[12px] font-normal text-(--color-ink-muted)">(inactif)</span>}
              </p>
              <p className="truncate text-[12.5px] text-(--color-ink-soft)">{[f.fonction, f.email].filter(Boolean).join(' · ')}</p>
              {f.conversations.length > 0 && (
                <p className="mt-0.5 truncate text-[12px]">
                  {f.conversations.slice(0, 2).map((c, i) => (
                    <React.Fragment key={c.id}>
                      {i > 0 && ' · '}
                      <Link href={`/admin/cockpit/messagerie/${c.id}`} className="text-(--color-primary) hover:underline">{c.sujet}</Link>
                    </React.Fragment>
                  ))}
                  {f.conversations.length > 2 && <span className="text-(--color-ink-muted)"> · +{f.conversations.length - 2}</span>}
                </p>
              )}
            </div>
            {f.tachesOuvertes > 0 && (
              <Link href="/admin/cockpit/taches" className="rounded-full bg-(--color-primary-soft) px-2.5 py-0.5 text-[12px] font-medium text-(--color-primary)">
                {f.tachesOuvertes} tâche{f.tachesOuvertes > 1 ? 's' : ''} ouverte{f.tachesOuvertes > 1 ? 's' : ''}
              </Link>
            )}
            <div className="flex gap-2">
              <Bouton
                taille="sm"
                variante="contour"
                onClick={() => ouvrir('tache', { lien_type: 'enseignant', lien_id: f.id, lien_label: f.nom, categorie: 'enseignants', titre: `Relancer ${f.nom} — ` })}
              >
                <ListPlus /> Créer une tâche
              </Bouton>
              <Bouton taille="sm" onClick={() => ouvrir('relance', { type: 'enseignant', personneId: f.id, personneLabel: f.nom })}>
                <Send /> Écrire
              </Bouton>
            </div>
          </li>
        ))}
      </ul>
    </Carte>
  );
}
