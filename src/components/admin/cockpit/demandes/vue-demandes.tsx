'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Calculator, Inbox, Lock, PhoneCall, Plus, Search, TriangleAlert, Users,
} from 'lucide-react';
import {
  NATURES_DEMANDE, NATURE_DEMANDE_LABEL, POIDS_PRIORITE, PRIORITES, PRIORITE_LABEL, SOUS_TYPES_COMPTABLES,
  SOUS_TYPE_LABEL, STATUTS_DEMANDE, STATUT_DEMANDE_LABEL, libelleEcheance, type NatureDemande, type Priorite,
} from '@/lib/cockpit/regles';
import type { DemandeInput } from '@/app/admin/cockpit/actions-dossiers';
import {
  Avatar, Bouton, Carte, EntetePage, Etiquette, PastillePriorite, PastilleStatut, Vide, champ,
} from '@/components/admin/cockpit/ui';
import { FormulaireDemande } from '@/components/admin/cockpit/formulaire-demande';
import { cn } from '@/lib/utils';
import { FicheDemande } from './fiche-demande';
import { dateHeure, estEnRetard, Fenetre, IconeCanal, majUrl, numero3, Puce, selectFiltre, Tuile } from './outils';

export type DemandeLigne = {
  id: string;
  numero: number;
  created_by: string;
  client_id: string | null;
  client_label: string;
  client_contact: string | null;
  canal: string;
  recue_at: string;
  nature: string;
  sous_type: string | null;
  motif: string;
  resume: string | null;
  priorite: string;
  assignee_id: string | null;
  echeance: string | null;
  statut: string;
  tache_id: string | null;
  cloturee_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Membre = { id: string; nom: string };

const TON_NATURE: Record<string, 'bleu' | 'violet' | 'orange' | 'bordeaux'> = {
  pedagogique: 'bleu', administrative: 'violet', commerciale: 'orange', comptable: 'bordeaux',
};

const estUrgenteDemande = (l: DemandeLigne, aujourdHui: string) =>
  l.statut !== 'terminee' && (l.priorite === 'urgente' || l.priorite === 'haute' || estEnRetard(l, aujourdHui));

const RANG_STATUT: Record<string, number> = { a_traiter: 0, en_cours: 1, en_attente: 2, terminee: 3 };

function comparer(aujourdHui: string) {
  return (a: DemandeLigne, b: DemandeLigne) => {
    const ta = a.statut === 'terminee' ? 1 : 0;
    const tb = b.statut === 'terminee' ? 1 : 0;
    if (ta !== tb) return ta - tb;
    if (ta === 1) return (b.cloturee_at ?? b.updated_at).localeCompare(a.cloturee_at ?? a.updated_at);
    const ra = estEnRetard(a, aujourdHui) ? 0 : 1;
    const rb = estEnRetard(b, aujourdHui) ? 0 : 1;
    if (ra !== rb) return ra - rb;
    const pa = POIDS_PRIORITE[a.priorite as Priorite] ?? 2;
    const pb = POIDS_PRIORITE[b.priorite as Priorite] ?? 2;
    if (pa !== pb) return pa - pb;
    const ea = a.echeance ?? '9999-12-31';
    const eb = b.echeance ?? '9999-12-31';
    if (ea !== eb) return ea < eb ? -1 : 1;
    if (RANG_STATUT[a.statut] !== RANG_STATUT[b.statut]) return (RANG_STATUT[a.statut] ?? 0) - (RANG_STATUT[b.statut] ?? 0);
    return b.recue_at.localeCompare(a.recue_at);
  };
}

export function VueDemandes({
  lignes, noms, membres, moiId, aujourdHui, terminesTronques,
}: {
  lignes: DemandeLigne[];
  noms: Record<string, string>;
  membres: Membre[];
  moiId: string;
  aujourdHui: string;
  terminesTronques: boolean;
}) {
  const sp = useSearchParams();
  const natureUrl = sp.get('nature');
  const nature: NatureDemande | '' = (NATURES_DEMANDE as readonly string[]).includes(natureUrl ?? '') ? (natureUrl as NatureDemande) : '';
  const ouverteId = sp.get('d');
  const comptable = nature === 'comptable';

  const [statut, setStatut] = React.useState<string>('ouvertes');
  const [priorite, setPriorite] = React.useState<string>('');
  const [sousType, setSousType] = React.useState<string>('');
  const [aMoi, setAMoi] = React.useState(false);
  const [urgentes, setUrgentes] = React.useState(false);
  const [recherche, setRecherche] = React.useState('');
  const [nouveau, setNouveau] = React.useState<null | 'appel' | 'demande'>(null);

  const ouvertes = lignes.filter((l) => l.statut !== 'terminee');
  const kpi = {
    aTraiter: ouvertes.filter((l) => l.statut === 'a_traiter' && (!nature || l.nature === nature)).length,
    urgentes: ouvertes.filter((l) => estUrgenteDemande(l, aujourdHui) && (!nature || l.nature === nature)).length,
    comptables: ouvertes.filter((l) => l.nature === 'comptable').length,
    aMoi: ouvertes.filter((l) => l.assignee_id === moiId && (!nature || l.nature === nature)).length,
  };

  const terme = recherche.trim().toLowerCase();
  const filtrees = lignes
    .filter((l) => !nature || l.nature === nature)
    .filter((l) => (statut === 'toutes' ? true : statut === 'ouvertes' ? l.statut !== 'terminee' : l.statut === statut))
    .filter((l) => !priorite || l.priorite === priorite)
    .filter((l) => !comptable || !sousType || l.sous_type === sousType)
    .filter((l) => !aMoi || l.assignee_id === moiId)
    .filter((l) => !urgentes || estUrgenteDemande(l, aujourdHui))
    .filter((l) => !terme || [l.client_label, l.motif, l.resume, l.client_contact, `n° ${l.numero}`, numero3(l.numero)]
      .some((s) => s && s.toLowerCase().includes(terme)))
    .sort(comparer(aujourdHui));

  const ouverte = ouverteId ? lignes.find((l) => l.id === ouverteId) ?? null : null;

  function choisirNature(n: NatureDemande | '') {
    setSousType('');
    majUrl({ nature: n || null });
  }

  const initialNouveau: Partial<DemandeInput> = nouveau === 'appel'
    ? { canal: 'telephone', ...(nature ? { nature } : {}) }
    : { canal: 'email', ...(nature ? { nature } : {}) };

  return (
    <>
      <EntetePage
        titre={comptable ? 'Suivi comptable' : 'Demandes clients'}
        sousTitre={comptable
          ? 'Factures, échéanciers, paiements, justificatifs et remboursements : chaque demande suivie jusqu’à sa clôture.'
          : 'Appels, e-mails et courriers des clients : qui a appelé, pourquoi, qui s’en charge et pour quand.'}
        actions={(
          <>
            <Bouton variante="contour" onClick={() => setNouveau('demande')}><Plus /> Nouvelle demande</Bouton>
            <Bouton onClick={() => setNouveau('appel')}><PhoneCall /> Enregistrer un appel</Bouton>
          </>
        )}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tuile
          icone={Inbox}
          libelle="À traiter"
          valeur={kpi.aTraiter}
          ton="orange"
          actif={statut === 'a_traiter'}
          onClick={() => setStatut((s) => (s === 'a_traiter' ? 'ouvertes' : 'a_traiter'))}
        />
        <Tuile
          icone={TriangleAlert}
          libelle="Urgentes ou en retard"
          valeur={kpi.urgentes}
          ton="rouge"
          actif={urgentes}
          onClick={() => setUrgentes((u) => !u)}
        />
        <Tuile
          icone={Calculator}
          libelle="Comptables ouvertes"
          valeur={kpi.comptables}
          ton="bordeaux"
          actif={comptable}
          onClick={() => choisirNature(comptable ? '' : 'comptable')}
        />
        <Tuile icone={Users} libelle="Qui me sont confiées" valeur={kpi.aMoi} ton="bleu" actif={aMoi} onClick={() => setAMoi((v) => !v)} />
      </div>

      <Carte>
        <div className="flex gap-1.5 overflow-x-auto border-b border-(--color-border) px-4 pb-3 pt-4 sm:px-5">
          <Puce actif={!nature} onClick={() => choisirNature('')}>Toutes</Puce>
          {NATURES_DEMANDE.map((n) => (
            <Puce key={n} actif={nature === n} onClick={() => choisirNature(n)}>
              {n === 'comptable' && <Lock className="h-3.5 w-3.5" />}
              {n === 'comptable' ? 'Suivi comptable' : NATURE_DEMANDE_LABEL[n]}
            </Puce>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-5">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
            <input
              type="search"
              className={cn(champ, 'h-8 py-1 pl-9 text-[13px]')}
              placeholder="Client, motif, n°…"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              aria-label="Rechercher une demande"
            />
          </div>
          <select className={selectFiltre} value={statut} onChange={(e) => setStatut(e.target.value)} aria-label="Statut">
            <option value="ouvertes">En cours de traitement</option>
            <option value="toutes">Tous les statuts</option>
            {STATUTS_DEMANDE.map((s) => <option key={s} value={s}>{STATUT_DEMANDE_LABEL[s]}</option>)}
          </select>
          <select className={selectFiltre} value={priorite} onChange={(e) => setPriorite(e.target.value)} aria-label="Priorité">
            <option value="">Toutes priorités</option>
            {PRIORITES.map((p) => <option key={p} value={p}>{PRIORITE_LABEL[p]}</option>)}
          </select>
          {comptable && (
            <select className={selectFiltre} value={sousType} onChange={(e) => setSousType(e.target.value)} aria-label="Type comptable">
              <option value="">Tous les types</option>
              {SOUS_TYPES_COMPTABLES.map((s) => <option key={s} value={s}>{SOUS_TYPE_LABEL[s]}</option>)}
            </select>
          )}
          <label className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-lg px-2 text-[13px] text-(--color-ink-soft) hover:bg-(--color-surface-soft)">
            <input type="checkbox" className="h-4 w-4 accent-(--color-primary)" checked={aMoi} onChange={(e) => setAMoi(e.target.checked)} />
            Assignées à moi
          </label>
        </div>

        {comptable && (
          <p className="mx-4 mb-3 flex items-center gap-1.5 text-[12px] text-(--color-primary) sm:mx-5">
            <Lock className="h-3.5 w-3.5" />
            Informations financières : visibles uniquement par les administrateurs, l’auteur et la personne chargée du traitement.
          </p>
        )}

        {filtrees.length === 0 ? (
          <Vide>{lignes.length === 0 ? 'Aucune demande enregistrée pour le moment.' : 'Aucune demande ne correspond à ces filtres.'}</Vide>
        ) : (
          <>
            {/* Bureau : tableau */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-[13.5px]">
                <thead>
                  <tr className="border-y border-(--color-border) bg-(--color-surface-soft) text-[11.5px] uppercase tracking-wide text-(--color-ink-muted)">
                    <th className="px-5 py-2 font-medium">Client</th>
                    <th className="px-3 py-2 font-medium">Motif</th>
                    <th className="px-3 py-2 font-medium">Priorité</th>
                    <th className="px-3 py-2 font-medium">Chargé(e)</th>
                    <th className="px-3 py-2 font-medium">Échéance</th>
                    <th className="px-3 py-2 pr-5 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrees.map((l) => (
                    <tr
                      key={l.id}
                      onClick={() => majUrl({ d: l.id })}
                      className="cursor-pointer border-b border-(--color-border) last:border-0 hover:bg-(--color-surface-soft)"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar nom={l.client_label} taille={32} />
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); majUrl({ d: l.id }); }}
                              className="block max-w-[220px] truncate text-left font-medium text-(--color-ink) hover:text-(--color-primary) focus-ring"
                            >
                              {l.client_label}
                            </button>
                            <span className="flex items-center gap-1 text-[11.5px] text-(--color-ink-muted)">
                              <IconeCanal canal={l.canal} className="h-3 w-3" /> n° {numero3(l.numero)} · {dateHeure(l.recue_at)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[340px] px-3 py-3">
                        <p className="truncate text-(--color-ink)">{l.motif}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          <Etiquette ton={TON_NATURE[l.nature] ?? 'gris'} className="text-[11px]">
                            {l.nature === 'comptable' && <Lock className="mr-1 h-3 w-3" />}
                            {NATURE_DEMANDE_LABEL[l.nature as NatureDemande] ?? l.nature}
                          </Etiquette>
                          {l.sous_type && <span className="text-[11.5px] text-(--color-ink-soft)">{SOUS_TYPE_LABEL[l.sous_type]}</span>}
                          {l.tache_id && <Etiquette ton="vert" className="text-[11px]">Tâche créée</Etiquette>}
                        </div>
                      </td>
                      <td className="px-3 py-3"><PastillePriorite priorite={l.priorite} /></td>
                      <td className="px-3 py-3 text-(--color-ink-soft)">
                        {l.assignee_id ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Avatar nom={noms[l.assignee_id] ?? '?'} taille={22} />
                            <span className="max-w-[120px] truncate">{l.assignee_id === moiId ? 'Moi' : noms[l.assignee_id] ?? '—'}</span>
                          </span>
                        ) : <span className="text-(--color-ink-muted)">Non affectée</span>}
                      </td>
                      <td className={cn('whitespace-nowrap px-3 py-3', estEnRetard(l, aujourdHui) ? 'font-medium text-[#B42318]' : 'text-(--color-ink-soft)')}>
                        {l.echeance ? libelleEcheance(l.echeance, aujourdHui) : '—'}
                        {estEnRetard(l, aujourdHui) && <span className="block text-[11px]">En retard</span>}
                      </td>
                      <td className="px-3 py-3 pr-5"><PastilleStatut statut={l.statut} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile : cartes */}
            <ul className="grid gap-2 px-3 pb-3 md:hidden">
              {filtrees.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => majUrl({ d: l.id })}
                    className="w-full rounded-xl border border-(--color-border) bg-white p-3 text-left focus-ring"
                  >
                    <div className="flex items-start gap-2.5">
                      <Avatar nom={l.client_label} taille={32} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium text-(--color-ink)">{l.client_label}</span>
                          <PastilleStatut statut={l.statut} className="ml-auto shrink-0" />
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-[13px] text-(--color-ink-soft)">{l.motif}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <PastillePriorite priorite={l.priorite} />
                          <Etiquette ton={TON_NATURE[l.nature] ?? 'gris'} className="text-[11px]">
                            {l.nature === 'comptable' && <Lock className="mr-1 h-3 w-3" />}
                            {l.sous_type ? SOUS_TYPE_LABEL[l.sous_type] : NATURE_DEMANDE_LABEL[l.nature as NatureDemande]}
                          </Etiquette>
                          {l.echeance && (
                            <span className={cn('text-[11.5px]', estEnRetard(l, aujourdHui) ? 'font-medium text-[#B42318]' : 'text-(--color-ink-soft)')}>
                              {estEnRetard(l, aujourdHui) ? 'En retard · ' : ''}{libelleEcheance(l.echeance, aujourdHui)}
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 flex items-center gap-1 text-[11.5px] text-(--color-ink-muted)">
                          <IconeCanal canal={l.canal} className="h-3 w-3" /> n° {numero3(l.numero)} · {dateHeure(l.recue_at)}
                          {l.assignee_id && <> · {l.assignee_id === moiId ? 'Moi' : noms[l.assignee_id] ?? '—'}</>}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
        {terminesTronques && (statut === 'toutes' || statut === 'terminee') && (
          <p className="border-t border-(--color-border) px-5 py-2.5 text-[12px] text-(--color-ink-muted)">Seules les demandes terminées les plus récentes sont affichées.</p>
        )}
      </Carte>

      <Fenetre
        ouvert={nouveau !== null}
        onOuvert={(o) => { if (!o) setNouveau(null); }}
        titre={nouveau === 'appel' ? 'Enregistrer un appel' : 'Nouvelle demande client'}
        sousTitre="La fiche est visible des administrateurs, de son auteur et de la personne chargée du traitement."
      >
        {nouveau && (
          <FormulaireDemande
            key={nouveau}
            initial={initialNouveau}
            membres={membres}
            onAnnuler={() => setNouveau(null)}
            onFini={(id) => {
              setNouveau(null);
              if (id) majUrl({ d: id });
            }}
          />
        )}
      </Fenetre>

      <FicheDemande
        key={ouverteId ?? ''}
        ligne={ouverte}
        introuvable={!!ouverteId && !ouverte}
        noms={noms}
        membres={membres}
        moiId={moiId}
        aujourdHui={aujourdHui}
        onFermer={() => majUrl({ d: null })}
      />
    </>
  );
}
