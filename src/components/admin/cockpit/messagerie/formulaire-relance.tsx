'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, GraduationCap, Search, UserRound, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ouvrirConversation } from '@/app/admin/cockpit/actions-messagerie';
import { rechercherPersonnes, type Personne } from '@/app/admin/cockpit/actions-divers';
import { Avatar, Bouton, champ, Libelle } from '@/components/admin/cockpit/ui';
import { TYPE_INTERLOCUTEUR_LABEL, type InitialRelance, type TypeInterlocuteur } from './types';

/**
 * « Relancer quelqu'un » / « Nouveau message » : choix du destinataire
 * (enseignant ou élève de la base, ou client par simple adresse e-mail),
 * sujet et mission. Ouvre — ou retrouve — le fil, puis y conduit. Autonome :
 * utilisable dans n'importe quelle boîte de dialogue.
 */

const TYPES: { id: TypeInterlocuteur; icone: React.ComponentType<{ className?: string }>; aide: string }[] = [
  { id: 'enseignant', icone: GraduationCap, aide: 'Message interne + e-mail' },
  { id: 'eleve', icone: UserRound, aide: 'Par e-mail' },
  { id: 'client', icone: Briefcase, aide: 'Par e-mail' },
];

type Choisi = { id: string; nom: string; email: string | null };

export function FormulaireRelance({
  initial,
  onFini,
}: {
  initial?: InitialRelance;
  onFini?: (conversationId: string) => void;
}) {
  const router = useRouter();
  const uid = React.useId();
  const [type, setType] = React.useState<TypeInterlocuteur>(initial?.type ?? 'enseignant');
  const [choisi, setChoisi] = React.useState<Choisi | null>(
    initial?.personneId ? { id: initial.personneId, nom: initial.personneLabel || 'Destinataire', email: initial.email ?? null } : null,
  );
  const [nomClient, setNomClient] = React.useState(initial?.type === 'client' ? initial.personneLabel ?? '' : '');
  const [email, setEmail] = React.useState(initial?.type === 'client' ? initial.email ?? '' : '');
  const [sujet, setSujet] = React.useState(initial?.sujet ?? '');
  const [mission, setMission] = React.useState(initial?.mission ?? '');
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [enCours, setEnCours] = React.useState(false);

  // Recherche de personnes (enseignant / élève).
  const [terme, setTerme] = React.useState('');
  const [resultats, setResultats] = React.useState<Personne[]>([]);
  const [cherche, setCherche] = React.useState(false);
  const [ouvert, setOuvert] = React.useState(false);
  const requete = React.useRef(0);

  React.useEffect(() => {
    if (type === 'client' || choisi || !ouvert) return;
    const n = ++requete.current;
    const t = setTimeout(async () => {
      setCherche(true);
      try {
        const r = await rechercherPersonnes(terme, type);
        if (n === requete.current) setResultats(r);
      } catch {
        if (n === requete.current) setResultats([]);
      } finally {
        if (n === requete.current) setCherche(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [terme, type, choisi, ouvert]);

  function changerType(t: TypeInterlocuteur) {
    if (t === type) return;
    setType(t);
    setChoisi(null);
    setResultats([]);
    setTerme('');
    setErreur(null);
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    if (enCours) return;
    setErreur(null);
    if (type !== 'client' && !choisi) {
      setErreur(type === 'enseignant' ? 'Choisissez l’enseignant destinataire.' : 'Choisissez l’élève destinataire.');
      return;
    }
    if (type === 'client' && !email.trim()) {
      setErreur('Indiquez l’adresse e-mail du client.');
      return;
    }
    if (!sujet.trim()) {
      setErreur('Indiquez le sujet.');
      return;
    }
    setEnCours(true);
    try {
      const r = await ouvrirConversation({
        interlocuteur_type: type,
        interlocuteur_id: type === 'client' ? null : choisi?.id ?? null,
        interlocuteur_label: type === 'client' ? nomClient.trim() || null : choisi?.nom ?? null,
        interlocuteur_email: type === 'client' ? email.trim() : type === 'eleve' ? choisi?.email ?? null : null,
        sujet: sujet.trim(),
        mission: mission.trim() || null,
        tache_id: initial?.tacheId ?? null,
      });
      if (!r.ok || !r.data) {
        setErreur(r.ok ? 'La conversation n’a pas pu être ouverte.' : r.erreur);
        setEnCours(false);
        return;
      }
      onFini?.(r.data.id);
      router.push(`/admin/cockpit/messagerie/${r.data.id}`);
    } catch {
      setErreur('Connexion interrompue. Réessayez.');
      setEnCours(false);
    }
  }

  return (
    <form onSubmit={soumettre} className="grid gap-4" noValidate>
      <fieldset>
        <legend className="mb-1.5 block text-[12.5px] font-medium text-(--color-ink-soft)">Destinataire</legend>
        <div role="radiogroup" className="grid grid-cols-3 gap-2">
          {TYPES.map(({ id, icone: Icone, aide }) => {
            const actif = type === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={actif}
                onClick={() => changerType(id)}
                className={cn(
                  'flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2 text-left transition-colors focus-ring',
                  actif ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary)' : 'border-(--color-border) bg-white text-(--color-ink) hover:bg-(--color-surface-soft)',
                )}
              >
                <span className="flex items-center gap-1.5 text-[13.5px] font-semibold">
                  <Icone className="h-4 w-4" />
                  {TYPE_INTERLOCUTEUR_LABEL[id]}
                </span>
                <span className={cn('text-[11.5px]', actif ? 'text-(--color-primary)/80' : 'text-(--color-ink-muted)')}>{aide}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {type === 'client' ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Libelle htmlFor={`${uid}-nom`} aide="(facultatif)">Nom du client</Libelle>
            <input id={`${uid}-nom`} className={champ} value={nomClient} onChange={(e) => setNomClient(e.target.value)} maxLength={200} placeholder="Ex. Dr Martin" />
          </div>
          <div>
            <Libelle htmlFor={`${uid}-email`}>Adresse e-mail</Libelle>
            <input id={`${uid}-email`} type="email" className={champ} value={email} onChange={(e) => setEmail(e.target.value)} maxLength={320} placeholder="client@exemple.fr" autoComplete="off" />
          </div>
        </div>
      ) : choisi ? (
        <div>
          <Libelle>{type === 'enseignant' ? 'Enseignant' : 'Élève'}</Libelle>
          <div className="flex items-center gap-3 rounded-xl border border-(--color-border) bg-white px-3 py-2">
            <Avatar nom={choisi.nom} taille={32} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-(--color-ink)">{choisi.nom}</p>
              {choisi.email && <p className="truncate text-[12px] text-(--color-ink-muted)">{choisi.email}</p>}
            </div>
            <Bouton type="button" variante="fantome" taille="xs" onClick={() => { setChoisi(null); setOuvert(true); }}>
              <X /> Changer
            </Bouton>
          </div>
        </div>
      ) : (
        <div className="relative">
          <Libelle htmlFor={`${uid}-cherche`}>{type === 'enseignant' ? 'Rechercher un enseignant' : 'Rechercher un élève'}</Libelle>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
            <input
              id={`${uid}-cherche`}
              className={cn(champ, 'pl-9')}
              value={terme}
              onChange={(e) => { setTerme(e.target.value); setOuvert(true); }}
              onFocus={() => setOuvert(true)}
              placeholder="Nom, prénom ou e-mail"
              autoComplete="off"
              role="combobox"
              aria-expanded={ouvert}
              aria-controls={`${uid}-resultats`}
            />
          </div>
          {ouvert && (
            <ul
              id={`${uid}-resultats`}
              role="listbox"
              className="mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-(--color-border) bg-white p-1 shadow-[0_8px_24px_-12px_rgba(60,20,30,0.25)]"
            >
              {cherche && resultats.length === 0 && <li className="px-3 py-2 text-sm text-(--color-ink-muted)">Recherche…</li>}
              {!cherche && resultats.length === 0 && <li className="px-3 py-2 text-sm text-(--color-ink-muted)">Aucun résultat.</li>}
              {resultats.map((p) => (
                <li key={p.id} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onClick={() => { setChoisi({ id: p.id, nom: p.nom, email: p.email }); setOuvert(false); setErreur(null); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left hover:bg-(--color-primary-soft) focus-ring"
                  >
                    <Avatar nom={p.nom} taille={28} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-(--color-ink)">{p.nom}</span>
                      {p.email && <span className="block truncate text-[11.5px] text-(--color-ink-muted)">{p.email}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div>
        <Libelle htmlFor={`${uid}-sujet`}>Sujet</Libelle>
        <input id={`${uid}-sujet`} className={champ} value={sujet} onChange={(e) => setSujet(e.target.value)} maxLength={300} placeholder="Ex. Correction du chapitre 12" />
      </div>
      <div>
        <Libelle htmlFor={`${uid}-mission`} aide="(facultatif)">Mission / contexte</Libelle>
        <textarea
          id={`${uid}-mission`}
          className={cn(champ, 'min-h-[76px] resize-y')}
          value={mission}
          onChange={(e) => setMission(e.target.value)}
          maxLength={1000}
          placeholder="Ce que vous attendez, l’échéance, le contenu concerné…"
        />
      </div>

      {initial?.tacheId && (
        <p className="rounded-lg bg-(--color-surface-soft) px-3 py-2 text-[12.5px] text-(--color-ink-soft)">
          Le fil sera rattaché à la tâche : son statut suivra l’envoi et la réponse.
        </p>
      )}

      {erreur && <p role="alert" className="rounded-lg bg-[#FCE4E4] px-3 py-2 text-sm text-[#B42318]">{erreur}</p>}

      <div className="flex justify-end">
        <Bouton type="submit" enCours={enCours}>Ouvrir la conversation</Bouton>
      </div>
    </form>
  );
}
