'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart3, Download, Filter, GraduationCap, ListChecks, Stethoscope, Users } from 'lucide-react';
import { Bouton, Carte, champ, EnteteCarte, Etiquette, Libelle, Vide } from '@/components/admin/cockpit/ui';
import { formaterDuree, type StatsReactivite } from '@/lib/echanges/regles';
import type { Agregats, LigneQuestion } from '@/lib/echanges/serveur/stats';
import { cn } from '@/lib/utils';
import { Barre, nombre, pourcent, teinteTaux, Tuile } from './commun';

/**
 * Écran « Statistiques » des Échanges : filtres dans l'adresse (rechargement
 * serveur à chaque changement), indicateurs globaux, réactivité par
 * enseignant / promotion / spécialité avec barres CSS, dernières questions et
 * export CSV / Excel aux mêmes filtres que l'écran.
 */

export type FiltresAffiches = {
  groupe: string; specialite: string; enseignant: string; depuis: string; jusqua: string;
  etat: 'tous' | 'repondu' | 'non_repondu' | 'retard';
};

export type LigneAffichee = {
  id: string; groupeId: string; promotion: string; enseignantId: string; enseignant: string; enseignantPublic: string;
  tagAt: string; reponduAt: string | null; delaiSecondes: number | null; statut: LigneQuestion['statut'];
  enRetard: boolean; relanceEnvoyee: boolean; traiteManuellement: boolean; extrait: string;
};

type Option = { id: string; nom: string };

const ETATS: { v: FiltresAffiches['etat']; l: string }[] = [
  { v: 'tous', l: 'Toutes les questions' },
  { v: 'repondu', l: 'Répondues' },
  { v: 'non_repondu', l: 'Sans réponse' },
  { v: 'retard', l: 'En retard' },
];

const CHEMIN = '/admin/echanges/statistiques';

function adresse(f: FiltresAffiches): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) if (v && !(k === 'etat' && v === 'tous')) q.set(k, v);
  const s = q.toString();
  return s ? `${CHEMIN}?${s}` : CHEMIN;
}

export function StatistiquesEchanges({
  filtres, options, restreint, seuilHeures, agregats, ouvertesEnRetard, lignes, totalLignes, exportQs,
}: {
  filtres: FiltresAffiches;
  options: { groupes: (Option & { archive: boolean })[]; specialites: Option[]; enseignants: Option[] };
  restreint: boolean;
  seuilHeures: number;
  agregats: Agregats;
  ouvertesEnRetard: number;
  lignes: LigneAffichee[];
  totalLignes: number;
  exportQs: string | null;
}) {
  const router = useRouter();
  const [enCours, start] = React.useTransition();
  const g = agregats.global;
  const cle = adresse(filtres);

  const appliquer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const lire = (k: string) => String(d.get(k) ?? '');
    const f: FiltresAffiches = {
      groupe: lire('groupe'), specialite: lire('specialite'), enseignant: lire('enseignant'),
      depuis: lire('depuis'), jusqua: lire('jusqua'), etat: (lire('etat') || 'tous') as FiltresAffiches['etat'],
    };
    start(() => router.push(adresse(f)));
  };
  const avec = (patch: Partial<FiltresAffiches>) => adresse({ ...filtres, ...patch });
  const filtresActifs = !!(filtres.specialite || filtres.enseignant || filtres.depuis || filtres.jusqua || filtres.etat !== 'tous' || (!restreint && filtres.groupe));

  return (
    <div className="space-y-4">
      <Carte>
        <EnteteCarte icone={Filter} titre="Filtres" badge={<span className="text-[12.5px] text-(--color-ink-muted)">Délai = première réponse valide − tag · seuil {seuilHeures} h</span>} />
        <form key={cle} onSubmit={appliquer} className="grid gap-3 px-4 pb-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Libelle htmlFor="st-groupe">Promotion</Libelle>
            <select id="st-groupe" name="groupe" defaultValue={filtres.groupe} className={champ}>
              {!restreint && <option value="">Toutes les promotions</option>}
              {options.groupes.map((o) => <option key={o.id} value={o.id}>{o.nom}{o.archive ? ' (archivée)' : ''}</option>)}
            </select>
          </div>
          <div>
            <Libelle htmlFor="st-spe">Spécialité</Libelle>
            <select id="st-spe" name="specialite" defaultValue={filtres.specialite} className={champ}>
              <option value="">Toutes</option>
              {options.specialites.map((o) => <option key={o.id} value={o.id}>{o.nom}</option>)}
            </select>
          </div>
          <div className="lg:col-span-2">
            <Libelle htmlFor="st-ens">Enseignant</Libelle>
            <select id="st-ens" name="enseignant" defaultValue={filtres.enseignant} className={champ}>
              <option value="">Tous les enseignants</option>
              {options.enseignants.map((o) => <option key={o.id} value={o.id}>{o.nom}</option>)}
            </select>
          </div>
          <div>
            <Libelle htmlFor="st-etat">État</Libelle>
            <select id="st-etat" name="etat" defaultValue={filtres.etat} className={champ}>
              {ETATS.map((x) => <option key={x.v} value={x.v}>{x.l}</option>)}
            </select>
          </div>
          <div>
            <Libelle htmlFor="st-depuis" aide="(question posée)">Du</Libelle>
            <input id="st-depuis" name="depuis" type="date" defaultValue={filtres.depuis} className={champ} />
          </div>
          <div>
            <Libelle htmlFor="st-jusqua">Au</Libelle>
            <input id="st-jusqua" name="jusqua" type="date" defaultValue={filtres.jusqua} className={champ} />
          </div>
          <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-4">
            <Bouton type="submit" taille="md" enCours={enCours}>Appliquer</Bouton>
            {filtresActifs && (
              <Link href={restreint && filtres.groupe ? adresse({ groupe: filtres.groupe, specialite: '', enseignant: '', depuis: '', jusqua: '', etat: 'tous' }) : CHEMIN} className="inline-flex h-10 items-center rounded-(--radius-button) px-3 text-sm font-medium text-(--color-ink-soft) hover:bg-(--color-surface-soft) hover:text-(--color-ink)">
                Réinitialiser
              </Link>
            )}
            {exportQs && (
              <div className="ml-auto flex flex-wrap gap-2">
                <a href={`/api/admin/echanges/export?format=csv&${exportQs}`} className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-(--color-border) bg-white px-3 text-sm font-medium text-(--color-primary) hover:bg-(--color-primary-soft)">
                  <Download className="h-4 w-4" /> Export CSV
                </a>
                <a href={`/api/admin/echanges/export?format=xlsx&${exportQs}`} className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-(--color-border) bg-white px-3 text-sm font-medium text-(--color-primary) hover:bg-(--color-primary-soft)">
                  <Download className="h-4 w-4" /> Export Excel
                </a>
              </div>
            )}
          </div>
          {restreint && <p className="text-[12.5px] text-(--color-ink-muted) sm:col-span-2 lg:col-span-6">Votre accès est limité à certaines promotions : choisissez l’une d’elles.</p>}
        </form>
      </Carte>

      <Carte>
        <EnteteCarte icone={BarChart3} titre="Vue d’ensemble" />
        <div className="grid grid-cols-2 gap-2.5 px-4 pb-4 sm:grid-cols-4 sm:px-5 xl:grid-cols-8">
          <Tuile libelle="Questions" valeur={nombre(g.tags)} aide="tags d’enseignants" />
          <Tuile libelle="Répondues" valeur={nombre(g.traitees)} aide={`taux ${pourcent(g.tauxReponse)}`} ton="ok" />
          <Tuile libelle="Sans réponse" valeur={nombre(g.nonTraitees)} href={g.nonTraitees ? avec({ etat: 'non_repondu' }) : null} ton={g.nonTraitees ? 'attention' : 'neutre'} />
          <Tuile
            libelle={`Au-delà de ${seuilHeures} h`} valeur={nombre(g.plusDeSeuil)} aide={`dont ${nombre(ouvertesEnRetard)} encore ouverte${ouvertesEnRetard > 1 ? 's' : ''}`}
            href={g.plusDeSeuil ? avec({ etat: 'retard' }) : null} ton={ouvertesEnRetard ? 'alerte' : g.plusDeSeuil ? 'attention' : 'ok'}
          />
          <Tuile libelle="Délai médian" valeur={formaterDuree(g.delaiMedianSecondes)} />
          <Tuile libelle="Délai moyen" valeur={formaterDuree(g.delaiMoyenSecondes)} />
          <Tuile
            libelle={`Répondues sous ${seuilHeures} h`} valeur={pourcent(g.tauxAvantSeuil)} aide="sur l’ensemble des questions"
            ton={g.tauxAvantSeuil === null ? 'neutre' : teinteTaux(g.tauxAvantSeuil) === 'vert' ? 'ok' : teinteTaux(g.tauxAvantSeuil) === 'orange' ? 'attention' : 'alerte'}
          />
          <Tuile libelle="Enseignants sollicités" valeur={nombre(agregats.parEnseignant.length)} />
        </div>
      </Carte>

      <TableauAgregats
        icone={GraduationCap} titre="Par enseignant" lignes={agregats.parEnseignant} seuilHeures={seuilHeures}
        lien={(cleLigne) => avec({ enseignant: cleLigne })} actif={filtres.enseignant}
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <TableauAgregats
          icone={Users} titre="Par promotion" lignes={agregats.parGroupe} seuilHeures={seuilHeures}
          lien={(cleLigne) => avec({ groupe: cleLigne })} actif={filtres.groupe}
        />
        <TableauAgregats icone={Stethoscope} titre="Par spécialité" lignes={agregats.parSpecialite} seuilHeures={seuilHeures} />
      </div>

      <Carte>
        <EnteteCarte
          icone={ListChecks} titre="Questions" compteur={totalLignes}
          badge={totalLignes > lignes.length ? <span className="text-[12.5px] text-(--color-ink-muted)">{lignes.length} plus récentes affichées — l’export contient tout</span> : undefined}
        />
        {lignes.length === 0 ? (
          <Vide>Aucune question ne correspond à ces filtres.</Vide>
        ) : (
          <div className="overflow-x-auto px-4 pb-4 sm:px-5">
            <table className="w-full min-w-[900px] text-[13px]">
              <thead>
                <tr className="border-b border-(--color-border) text-left text-[12px] text-(--color-ink-muted)">
                  <th className="py-2 pr-3 font-medium">Promotion</th>
                  <th className="px-2 py-2 font-medium">Enseignant</th>
                  <th className="px-2 py-2 font-medium">Question</th>
                  <th className="px-2 py-2 font-medium">Réponse</th>
                  <th className="px-2 py-2 text-right font-medium">Délai</th>
                  <th className="px-2 py-2 font-medium">Statut</th>
                  <th className="py-2 pl-2 font-medium">Extrait</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-border) align-top">
                {lignes.map((l) => (
                  <tr key={l.id}>
                    <td className="max-w-[180px] py-2 pr-3 text-(--color-ink)">{l.promotion}</td>
                    <td className="px-2 py-2">
                      <span className="block text-(--color-ink)">{l.enseignant}</span>
                      <span className="block text-[12px] text-(--color-ink-muted)">affiché « {l.enseignantPublic} »</span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-(--color-ink-soft)">{l.tagAt}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-(--color-ink-soft)">{l.reponduAt ?? '—'}</td>
                    <td className={cn('whitespace-nowrap px-2 py-2 text-right tabular-nums', l.enRetard ? 'font-medium text-[#B42318]' : 'text-(--color-ink)')}>
                      {formaterDuree(l.delaiSecondes)}
                    </td>
                    <td className="px-2 py-2"><StatutQuestion l={l} /></td>
                    <td className="max-w-[340px] py-2 pl-2 text-(--color-ink-soft)">
                      <span className="line-clamp-2">{l.extrait || <em className="text-(--color-ink-muted)">(sans texte)</em>}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Carte>
    </div>
  );
}

function StatutQuestion({ l }: { l: LigneAffichee }) {
  return (
    <span className="flex flex-wrap gap-1">
      {l.statut === 'traitee' && <Etiquette ton="vert">{l.traiteManuellement ? 'Traitée (marquée)' : 'Répondue'}</Etiquette>}
      {l.statut === 'en_attente' && <Etiquette ton={l.enRetard ? 'bordeaux' : 'orange'}>{l.enRetard ? 'En retard' : 'En attente'}</Etiquette>}
      {l.statut === 'a_reaffecter' && <Etiquette ton="violet">À réaffecter</Etiquette>}
      {l.statut === 'annulee' && <Etiquette ton="gris">Annulée</Etiquette>}
      {l.relanceEnvoyee && l.statut !== 'traitee' && <Etiquette ton="gris">Relancé</Etiquette>}
    </span>
  );
}

type LigneAgregat = StatsReactivite & { cle: string; libelle: string };

function TableauAgregats({
  icone, titre, lignes, seuilHeures, lien, actif,
}: {
  icone: React.ComponentType<{ className?: string }>;
  titre: string;
  lignes: LigneAgregat[];
  seuilHeures: number;
  lien?: (cle: string) => string;
  actif?: string;
}) {
  const max = Math.max(1, ...lignes.map((l) => l.tags));
  return (
    <Carte>
      <EnteteCarte icone={icone} titre={titre} compteur={lignes.length} />
      {lignes.length === 0 ? (
        <Vide>Aucune donnée sur cette sélection.</Vide>
      ) : (
        <div className="max-h-[440px] overflow-auto px-4 pb-4 sm:px-5">
          <table className="w-full min-w-[640px] text-[13px]">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-(--color-border) text-left text-[12px] text-(--color-ink-muted)">
                <th className="py-2 pr-3 font-medium">Libellé</th>
                <th className="w-[150px] px-2 py-2 font-medium">Questions</th>
                <th className="px-2 py-2 text-right font-medium">Répondues</th>
                <th className="px-2 py-2 text-right font-medium">Sans réponse</th>
                <th className="px-2 py-2 text-right font-medium">Médian</th>
                <th className="px-2 py-2 text-right font-medium">Moyen</th>
                <th className="w-[130px] px-2 py-2 font-medium">Sous {seuilHeures} h</th>
                <th className="py-2 pl-2 text-right font-medium">&gt; {seuilHeures} h</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {lignes.map((l) => (
                <tr key={l.cle} className={cn(actif === l.cle && 'bg-(--color-primary-soft)/50')}>
                  <td className="max-w-[260px] py-2 pr-3 text-(--color-ink)">
                    {lien ? <Link href={lien(l.cle)} className="hover:text-(--color-primary) hover:underline">{l.libelle}</Link> : l.libelle}
                  </td>
                  <td className="px-2 py-2">
                    <span className="flex items-center gap-2">
                      <span className="w-8 shrink-0 text-right tabular-nums">{nombre(l.tags)}</span>
                      <Barre part={l.tags / max} titre={`${l.tags} questions`} />
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">{nombre(l.traitees)}</td>
                  <td className={cn('px-2 py-2 text-right tabular-nums', l.nonTraitees > 0 && 'text-[#C2570C]')}>{nombre(l.nonTraitees)}</td>
                  <td className="whitespace-nowrap px-2 py-2 text-right tabular-nums">{formaterDuree(l.delaiMedianSecondes)}</td>
                  <td className="whitespace-nowrap px-2 py-2 text-right tabular-nums">{formaterDuree(l.delaiMoyenSecondes)}</td>
                  <td className="px-2 py-2">
                    <span className="flex items-center gap-2">
                      <span className="w-10 shrink-0 text-right tabular-nums">{pourcent(l.tauxAvantSeuil)}</span>
                      <Barre part={l.tauxAvantSeuil} teinte={teinteTaux(l.tauxAvantSeuil)} />
                    </span>
                  </td>
                  <td className={cn('py-2 pl-2 text-right tabular-nums', l.plusDeSeuil > 0 ? 'font-medium text-[#B42318]' : 'text-(--color-ink-muted)')}>{nombre(l.plusDeSeuil)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Carte>
  );
}
