'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Ban, Check, Loader2, Search, UserMinus, UserPlus, Undo2 } from 'lucide-react';
import type { Participant } from '@/lib/echanges/serveur/admin';
import { participants as gererParticipants, rechercherEleves } from '@/app/admin/echanges/actions';
import { Bouton, Carte, champ, Etiquette, Toast, Vide, useMessage } from '@/components/admin/cockpit/ui';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { dateParis } from './commun';

type Filtre = 'actifs' | 'retires' | 'exclus' | 'tous';
type Action = 'retirer' | 'exclure' | 'retablir';

const PAGE = 100;

function etat(p: Participant): Exclude<Filtre, 'tous'> {
  if (p.exclusionForcee) return 'exclus';
  return p.statut === 'actif' ? 'actifs' : 'retires';
}

function PastilleParticipant({ p }: { p: Participant }) {
  const e = etat(p);
  if (e === 'exclus') return <Etiquette ton="orange">Exclu</Etiquette>;
  if (e === 'retires') return <Etiquette ton="gris">Retiré</Etiquette>;
  return <Etiquette ton="vert">Actif</Etiquette>;
}

const TEXTE_ACTION: Record<Action, { titre: string; bouton: string; aide: string; fait: string }> = {
  retirer: {
    titre: 'Retirer de la promotion', bouton: 'Retirer', fait: 'retiré',
    aide: 'Retrait manuel : utile pour un candidat ajouté nominativement. Un candidat qui correspond aux critères doit être « exclu » pour perdre durablement l’accès.',
  },
  exclure: {
    titre: 'Exclure de la promotion', bouton: 'Exclure', fait: 'exclu',
    aide: 'Exclusion administrative (exception) : le candidat perd l’accès même s’il correspond aux critères. Ses messages déjà publiés restent dans la conversation.',
  },
  retablir: {
    titre: 'Rétablir dans la promotion', bouton: 'Rétablir', fait: 'rétabli',
    aide: 'Le candidat est ajouté manuellement (exception d’inclusion) et retrouve l’accès si son compte est actif.',
  },
};

/**
 * Onglet « Participants » de la fiche : liste filtrable, sélection multiple
 * (retirer / exclure / rétablir) et ajout nominatif de candidats (§176-181).
 */
export function ParticipantsPromotion({ groupeId, liste, lectureSeule }: { groupeId: string; liste: Participant[]; lectureSeule?: boolean }) {
  const router = useRouter();
  const [q, setQ] = React.useState('');
  const [filtre, setFiltre] = React.useState<Filtre>('actifs');
  const [limite, setLimite] = React.useState(PAGE);
  const [choix, setChoix] = React.useState<Set<string>>(() => new Set());
  const [action, setAction] = React.useState<Action | null>(null);
  const [ajout, setAjout] = React.useState(false);
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [enCours, start] = React.useTransition();
  const [message, setMessage] = useMessage();

  const s = q.trim().toLowerCase();
  const filtres = liste.filter((p) => (filtre === 'tous' || etat(p) === filtre) && (!s || p.nom.toLowerCase().includes(s) || p.email?.toLowerCase().includes(s)));
  const visibles = filtres.slice(0, limite);
  const compte = (f: Exclude<Filtre, 'tous'>) => liste.filter((p) => etat(p) === f).length;
  const selection = liste.filter((p) => choix.has(p.userId));
  const tousCoches = visibles.length > 0 && visibles.every((p) => choix.has(p.userId));
  const membres = React.useMemo(() => new Map(liste.map((p) => [p.userId, p])), [liste]);

  const basculer = (id: string) => setChoix((c) => {
    const n = new Set(c);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });
  const basculerTous = () => setChoix((c) => {
    const n = new Set(c);
    if (tousCoches) visibles.forEach((p) => n.delete(p.userId)); else visibles.forEach((p) => n.add(p.userId));
    return n;
  });

  function executer(a: Action, ids: string[]) {
    setErreur(null);
    start(async () => {
      const r = await gererParticipants(groupeId, a, ids);
      if (!r.ok) { setErreur(r.erreur); setAction(null); return; }
      const n = r.data?.n ?? ids.length;
      setMessage(`${n} candidat${n > 1 ? 's' : ''} ${TEXTE_ACTION[a].fait}${n > 1 ? 's' : ''}.`);
      setAction(null);
      setChoix(new Set());
      router.refresh();
    });
  }

  const changerFiltre = (f: Filtre) => { setFiltre(f); setLimite(PAGE); setChoix(new Set()); };

  return (
    <Carte>
      <div className="flex flex-wrap items-center gap-3 border-b border-(--color-border) p-3 sm:p-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
          <input className={`${champ} pl-8`} value={q} onChange={(e) => { setQ(e.target.value); setLimite(PAGE); }} placeholder="Rechercher un candidat (nom, e-mail)…" aria-label="Rechercher un candidat" />
        </div>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filtrer les participants">
          {([['actifs', `Actifs (${compte('actifs')})`], ['retires', `Retirés (${compte('retires')})`], ['exclus', `Exclus (${compte('exclus')})`], ['tous', `Tous (${liste.length})`]] as const).map(([f, l]) => (
            <button
              key={f}
              type="button"
              aria-pressed={filtre === f}
              onClick={() => changerFiltre(f)}
              className={`rounded-full px-3 py-1 text-[12.5px] font-medium transition-colors focus-ring ${filtre === f ? 'bg-(--color-primary) text-white' : 'bg-(--color-surface-soft) text-(--color-ink-soft) hover:text-(--color-ink)'}`}
            >
              {l}
            </button>
          ))}
        </div>
        {!lectureSeule && <Bouton taille="sm" onClick={() => setAjout(true)}><UserPlus /> Ajouter des candidats</Bouton>}
      </div>

      {!lectureSeule && choix.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-(--color-border) bg-(--color-primary-soft) px-3 py-2 sm:px-4">
          <span className="text-[13px] font-medium text-(--color-primary)">{choix.size} sélectionné{choix.size > 1 ? 's' : ''}</span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Bouton taille="xs" variante="contour" onClick={() => setAction('retirer')}><UserMinus /> Retirer</Bouton>
            <Bouton taille="xs" variante="contour" onClick={() => setAction('exclure')}><Ban /> Exclure</Bouton>
            <Bouton taille="xs" variante="contour" onClick={() => setAction('retablir')}><Undo2 /> Rétablir</Bouton>
            <Bouton taille="xs" variante="fantome" onClick={() => setChoix(new Set())}>Désélectionner</Bouton>
          </div>
        </div>
      )}

      {erreur && <p role="alert" className="mx-3 mt-3 rounded-lg bg-[#FCE4E4] px-3 py-2 text-[13px] text-[#B42318] sm:mx-4">{erreur}</p>}

      {filtres.length === 0 ? (
        <Vide>{liste.length === 0 ? 'Aucun participant pour le moment.' : 'Aucun candidat ne correspond à ces filtres.'}</Vide>
      ) : (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-(--color-border) text-[12px] text-(--color-ink-muted)">
                <tr>
                  {!lectureSeule && (
                    <th className="w-10 px-4 py-2">
                      <input type="checkbox" className="accent-(--color-primary)" checked={tousCoches} onChange={basculerTous} aria-label="Tout sélectionner" />
                    </th>
                  )}
                  <th className="px-3 py-2 font-medium">Candidat</th>
                  <th className="px-3 py-2 font-medium">Formules</th>
                  <th className="px-3 py-2 font-medium">Voie</th>
                  <th className="px-3 py-2 font-medium">Source</th>
                  <th className="px-3 py-2 font-medium">Statut</th>
                  <th className="px-3 py-2 font-medium">Règles acceptées</th>
                  <th className="px-3 py-2 font-medium">Compte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-border)">
                {visibles.map((p) => (
                  <tr key={p.userId} className={choix.has(p.userId) ? 'bg-(--color-primary-soft)/50' : ''}>
                    {!lectureSeule && (
                      <td className="px-4 py-2">
                        <input type="checkbox" className="accent-(--color-primary)" checked={choix.has(p.userId)} onChange={() => basculer(p.userId)} aria-label={`Sélectionner ${p.nom}`} />
                      </td>
                    )}
                    <td className="px-3 py-2">
                      <p className="font-medium text-(--color-ink)">{p.nom}</p>
                      <p className="text-[12px] text-(--color-ink-muted)">{p.email ?? '—'}</p>
                    </td>
                    <td className="px-3 py-2 text-(--color-ink-soft)">{p.formules.join(', ') || '—'}</td>
                    <td className="px-3 py-2 capitalize text-(--color-ink-soft)">{p.voie ?? '—'}</td>
                    <td className="px-3 py-2">{p.source === 'auto' ? <Etiquette ton="bleu">Critères</Etiquette> : <Etiquette ton="violet">Manuel</Etiquette>}</td>
                    <td className="px-3 py-2">
                      <PastilleParticipant p={p} />
                      {p.motifRetrait && etat(p) !== 'actifs' && <p className="mt-0.5 max-w-[220px] truncate text-[11.5px] text-(--color-ink-muted)" title={p.motifRetrait}>{p.motifRetrait}{p.retireAt ? ` · ${dateParis(p.retireAt)}` : ''}</p>}
                    </td>
                    <td className="px-3 py-2 text-(--color-ink-soft)">{p.reglesAccepteesAt ? dateParis(p.reglesAccepteesAt) : <span className="text-(--color-ink-muted)">Non</span>}</td>
                    <td className="px-3 py-2">{p.compteActif ? <span className="text-[12.5px] text-[#1F7A3E]">Actif</span> : <span className="text-[12.5px] font-medium text-[#B42318]">Inactif</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-(--color-border) lg:hidden">
            {!lectureSeule && (
              <li className="flex items-center gap-2 px-3 py-2 text-[12.5px] text-(--color-ink-soft) sm:px-4">
                <input id="tous-participants" type="checkbox" className="accent-(--color-primary)" checked={tousCoches} onChange={basculerTous} />
                <label htmlFor="tous-participants">Tout sélectionner ({visibles.length})</label>
              </li>
            )}
            {visibles.map((p) => (
              <li key={p.userId} className={`flex gap-3 px-3 py-3 sm:px-4 ${choix.has(p.userId) ? 'bg-(--color-primary-soft)/50' : ''}`}>
                {!lectureSeule && (
                  <input type="checkbox" className="mt-1 accent-(--color-primary)" checked={choix.has(p.userId)} onChange={() => basculer(p.userId)} aria-label={`Sélectionner ${p.nom}`} />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-(--color-ink)">{p.nom}</p>
                      <p className="truncate text-[12px] text-(--color-ink-muted)">{p.email ?? '—'}</p>
                    </div>
                    <PastilleParticipant p={p} />
                  </div>
                  <p className="mt-1 text-[12px] text-(--color-ink-soft)">
                    {[p.formules.join(', ') || null, p.voie ? `voie ${p.voie}` : null, p.source === 'auto' ? 'critères' : 'manuel',
                      p.reglesAccepteesAt ? `règles acceptées le ${dateParis(p.reglesAccepteesAt)}` : 'règles non acceptées',
                      p.compteActif ? null : 'compte inactif'].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {filtres.length > visibles.length && (
            <div className="border-t border-(--color-border) p-3 text-center">
              <Bouton variante="contour" taille="sm" onClick={() => setLimite((l) => l + PAGE)}>
                Afficher {Math.min(PAGE, filtres.length - visibles.length)} de plus ({filtres.length - visibles.length} restants)
              </Bouton>
            </div>
          )}
        </>
      )}

      <Dialog open={!!action} onOpenChange={(o) => { if (!o && !enCours) setAction(null); }}>
        <DialogContent>
          {action && (
            <>
              <DialogHeader>
                <DialogTitle>{TEXTE_ACTION[action].titre}</DialogTitle>
                <DialogDescription>{TEXTE_ACTION[action].aide}</DialogDescription>
              </DialogHeader>
              <ul className="max-h-48 space-y-0.5 overflow-y-auto rounded-lg border border-(--color-border) p-2 text-[13px]">
                {selection.slice(0, 50).map((p) => <li key={p.userId} className="truncate">{p.nom} <span className="text-(--color-ink-muted)">{p.email}</span></li>)}
                {selection.length > 50 && <li className="text-(--color-ink-muted)">… et {selection.length - 50} autres.</li>}
              </ul>
              <DialogFooter>
                <Bouton variante="fantome" onClick={() => setAction(null)} disabled={enCours}>Annuler</Bouton>
                <Bouton variante={action === 'exclure' ? 'danger' : 'plein'} enCours={enCours} onClick={() => executer(action, selection.map((p) => p.userId))}>
                  {TEXTE_ACTION[action].bouton} ({selection.length})
                </Bouton>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {ajout && (
        <DialogueAjout
          membres={membres}
          enCours={enCours}
          onFermer={() => setAjout(false)}
          onAjouter={(ids) => {
            setErreur(null);
            start(async () => {
              const r = await gererParticipants(groupeId, 'ajouter', ids);
              if (!r.ok) { setErreur(r.erreur); return; }
              const n = r.data?.n ?? ids.length;
              setMessage(`${n} candidat${n > 1 ? 's' : ''} ajouté${n > 1 ? 's' : ''}.`);
              setAjout(false);
              router.refresh();
            });
          }}
        />
      )}
      <Toast message={message} />
    </Carte>
  );
}

type Resultat = { id: string; nom: string; email: string | null };

/** Recherche de candidats de la plateforme et ajout nominatif (exception d'inclusion). */
function DialogueAjout({
  membres, enCours, onFermer, onAjouter,
}: {
  membres: Map<string, Participant>;
  enCours: boolean;
  onFermer: () => void;
  onAjouter: (ids: string[]) => void;
}) {
  const [q, setQ] = React.useState('');
  const [resultats, setResultats] = React.useState<Resultat[]>([]);
  const [cherche, setCherche] = React.useState(false);
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [choisis, setChoisis] = React.useState<Map<string, Resultat>>(() => new Map());
  const minuteur = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const requete = React.useRef(0);

  function saisir(v: string) {
    setQ(v);
    if (minuteur.current) clearTimeout(minuteur.current);
    if (v.trim().length < 2) { setResultats([]); setCherche(false); return; }
    setCherche(true);
    minuteur.current = setTimeout(async () => {
      const n = ++requete.current;
      try {
        const r = await rechercherEleves(v);
        if (n !== requete.current) return;
        setResultats(r);
        setErreur(null);
      } catch (e) {
        if (n === requete.current) setErreur(e instanceof Error ? e.message : 'Recherche impossible.');
      } finally {
        if (n === requete.current) setCherche(false);
      }
    }, 300);
  }

  React.useEffect(() => () => { if (minuteur.current) clearTimeout(minuteur.current); }, []);

  const basculer = (r: Resultat) => setChoisis((c) => {
    const n = new Map(c);
    if (n.has(r.id)) n.delete(r.id); else n.set(r.id, r);
    return n;
  });

  return (
    <Dialog open onOpenChange={(o) => { if (!o && !enCours) onFermer(); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Ajouter des candidats</DialogTitle>
          <DialogDescription>Ajout nominatif : le candidat accède à la promotion même s’il ne correspond pas aux critères (compte actif requis).</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
          <input autoFocus className={`${champ} pl-8`} value={q} onChange={(e) => saisir(e.target.value)} placeholder="Nom, prénom ou e-mail (2 caractères au moins)" aria-label="Rechercher un candidat" />
          {cherche && <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-(--color-ink-muted)" />}
        </div>
        {erreur && <p role="alert" className="text-[13px] text-[#B42318]">{erreur}</p>}
        <ul className="max-h-64 divide-y divide-(--color-border) overflow-y-auto rounded-lg border border-(--color-border)">
          {resultats.length === 0 && (
            <li className="px-3 py-4 text-center text-[13px] text-(--color-ink-muted)">{q.trim().length < 2 ? 'Saisissez un nom ou un e-mail.' : cherche ? 'Recherche…' : 'Aucun candidat trouvé.'}</li>
          )}
          {resultats.map((r) => {
            const m = membres.get(r.id);
            const dejaActif = !!m && m.statut === 'actif' && !m.exclusionForcee;
            return (
              <li key={r.id}>
                <label className={`flex items-center gap-3 px-3 py-2 text-[13px] ${dejaActif ? 'opacity-60' : 'cursor-pointer hover:bg-(--color-surface-soft)'}`}>
                  <input type="checkbox" className="accent-(--color-primary)" disabled={dejaActif} checked={choisis.has(r.id)} onChange={() => basculer(r)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-(--color-ink)">{r.nom}</span>
                    <span className="block truncate text-[12px] text-(--color-ink-muted)">{r.email ?? '—'}</span>
                  </span>
                  {dejaActif && <Etiquette ton="vert">Déjà membre</Etiquette>}
                  {m && !dejaActif && <Etiquette ton={m.exclusionForcee ? 'orange' : 'gris'}>{m.exclusionForcee ? 'Exclu' : 'Retiré'}</Etiquette>}
                </label>
              </li>
            );
          })}
        </ul>
        {choisis.size > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {[...choisis.values()].map((r) => (
              <button key={r.id} type="button" onClick={() => basculer(r)} className="inline-flex items-center gap-1 rounded-full bg-(--color-primary-soft) px-2.5 py-0.5 text-[12px] font-medium text-(--color-primary)" title="Retirer de la sélection">
                <Check className="h-3 w-3" /> {r.nom}
              </button>
            ))}
          </div>
        )}
        <DialogFooter>
          <Bouton variante="fantome" onClick={onFermer} disabled={enCours}>Annuler</Bouton>
          <Bouton disabled={choisis.size === 0} enCours={enCours} onClick={() => onAjouter([...choisis.keys()])}>
            <UserPlus /> Ajouter {choisis.size > 0 ? `(${choisis.size})` : ''}
          </Bouton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
