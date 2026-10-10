import Link from 'next/link';
import { ArrowRight, FolderOpen, Layers, Lock, MessageSquareWarning, PhoneCall, PhoneOutgoing } from 'lucide-react';
import { contexteCockpit, FACULTE } from '@/lib/cockpit/server/base';
import {
  CATEGORIE_RECLAMATION_LABEL, NATURE_DEMANDE_LABEL, RECLAMATION_OUVERTE, SOUS_TYPE_LABEL, TYPE_PROBLEME_LABEL,
  type NatureDemande,
} from '@/lib/cockpit/regles';
import { Carte, PastillePriorite, PastilleStatut } from '@/components/admin/cockpit/ui';

/**
 * Bloc « Dossiers du cockpit » de la fiche candidat : ses réclamations (et les
 * améliorations auxquelles elles sont rattachées) et ses demandes clients.
 * Mêmes règles de visibilité que le cockpit : un administrateur voit tout, un
 * collaborateur seulement les dossiers qu'il a saisis ou qui lui sont confiés.
 */

type Reclamation = {
  id: string; sujet: string; categorie: string; type_probleme: string; statut: string; priorite: string;
  amelioration_id: string | null; a_recontacter: boolean; created_at: string;
};
type Demande = {
  id: string; numero: number; motif: string; nature: string; sous_type: string | null; statut: string; priorite: string;
  canal: string; recue_at: string;
};
type Amelioration = { id: string; numero: number; titre: string; statut: string };

const dateCourte = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Paris' });
const n3 = (n: number) => String(n).padStart(3, '0');

export async function DossiersCandidat({ userId }: { userId: string }) {
  const { moi, db: d } = await contexteCockpit();
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return null;
  const restreindre = (q: ReturnType<typeof d.from>) => (moi.estAdmin ? q : q.or(`created_by.eq.${moi.id},assignee_id.eq.${moi.id}`));

  const [recl, dem] = await Promise.all([
    restreindre(d.from('cockpit_reclamations')
      .select('id, sujet, categorie, type_probleme, statut, priorite, amelioration_id, a_recontacter, created_at')
      .eq('faculte_id', FACULTE).eq('candidat_id', userId))
      .order('created_at', { ascending: false }).limit(100),
    restreindre(d.from('cockpit_demandes')
      .select('id, numero, motif, nature, sous_type, statut, priorite, canal, recue_at')
      .eq('faculte_id', FACULTE).eq('client_id', userId))
      .order('recue_at', { ascending: false }).limit(100),
  ]);
  const reclamations = (recl.data ?? []) as Reclamation[];
  const demandes = (dem.data ?? []) as Demande[];

  const idsAmel = [...new Set(reclamations.map((r) => r.amelioration_id).filter((x): x is string => !!x))];
  const ameliorations = new Map<string, Amelioration>();
  if (idsAmel.length > 0) {
    const { data } = await d.from('cockpit_ameliorations').select('id, numero, titre, statut').eq('faculte_id', FACULTE).in('id', idsAmel);
    for (const a of (data ?? []) as Amelioration[]) ameliorations.set(a.id, a);
  }

  const ouvertes = reclamations.filter((r) => RECLAMATION_OUVERTE(r.statut)).length;
  const demandesOuvertes = demandes.filter((x) => x.statut !== 'terminee').length;

  return (
    <Carte>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 pb-2 pt-4 sm:px-5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-(--color-primary-soft) text-(--color-primary)">
          <FolderOpen className="h-4 w-4" />
        </span>
        <h2 className="text-[17px] font-semibold tracking-tight text-(--color-ink)">Dossiers du cockpit</h2>
        <span className="text-[12.5px] text-(--color-ink-soft)">
          {ouvertes} réclamation{ouvertes > 1 ? 's' : ''} ouverte{ouvertes > 1 ? 's' : ''} · {demandesOuvertes} demande{demandesOuvertes > 1 ? 's' : ''} en cours
        </span>
      </header>

      <div className="grid gap-4 px-4 pb-4 sm:px-5 lg:grid-cols-2">
        <section className="min-w-0">
          <div className="mb-2 flex items-center gap-1.5">
            <MessageSquareWarning className="h-4 w-4 text-[#C2570C]" />
            <h3 className="text-[13.5px] font-semibold text-(--color-ink)">Réclamations</h3>
            <Link href="/admin/cockpit/reclamations" className="ml-auto inline-flex items-center gap-1 text-[12.5px] font-medium text-(--color-primary) hover:underline">
              Ouvrir <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {reclamations.length === 0 ? (
            <p className="rounded-xl border border-dashed border-(--color-border) px-3 py-4 text-center text-[13px] text-(--color-ink-muted)">Aucune réclamation.</p>
          ) : (
            <ul className="divide-y divide-(--color-border) rounded-xl border border-(--color-border) bg-white">
              {reclamations.map((r) => {
                const a = r.amelioration_id ? ameliorations.get(r.amelioration_id) : undefined;
                return (
                  <li key={r.id} className="px-3 py-2.5">
                    <div className="flex items-start gap-2">
                      <Link href={`/admin/cockpit/reclamations?r=${r.id}`} className="min-w-0 flex-1 text-[13.5px] font-medium text-(--color-ink) hover:text-(--color-primary)">
                        {r.sujet}
                      </Link>
                      <PastilleStatut statut={r.statut} className="shrink-0" />
                    </div>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] text-(--color-ink-soft)">
                      <span>{dateCourte(r.created_at)}</span>
                      <span>·</span>
                      <span>{CATEGORIE_RECLAMATION_LABEL[r.categorie] ?? r.categorie}</span>
                      <span>·</span>
                      <span>{TYPE_PROBLEME_LABEL[r.type_probleme] ?? r.type_probleme}</span>
                      {(r.priorite === 'urgente' || r.priorite === 'haute') && <PastillePriorite priorite={r.priorite} />}
                      {r.a_recontacter && (
                        <span className="inline-flex items-center gap-1 font-medium text-[#1F7A3E]"><PhoneOutgoing className="h-3 w-3" /> À recontacter</span>
                      )}
                    </p>
                    {a && (
                      <Link
                        href={`/admin/cockpit/reclamations?vue=ameliorations&a=${a.id}`}
                        className="mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-md bg-[#F1EDF7] px-2 py-0.5 text-[12px] text-[#6B4FA0] hover:underline"
                      >
                        <Layers className="h-3 w-3 shrink-0" />
                        <span className="truncate">Amélioration n° {n3(a.numero)} — {a.titre}</span>
                        <PastilleStatut statut={a.statut} className="shrink-0 px-1.5 py-0 text-[10.5px]" />
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="min-w-0">
          <div className="mb-2 flex items-center gap-1.5">
            <PhoneCall className="h-4 w-4 text-[#2F5DA8]" />
            <h3 className="text-[13.5px] font-semibold text-(--color-ink)">Demandes clients</h3>
            <Link href="/admin/cockpit/demandes" className="ml-auto inline-flex items-center gap-1 text-[12.5px] font-medium text-(--color-primary) hover:underline">
              Ouvrir <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {demandes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-(--color-border) px-3 py-4 text-center text-[13px] text-(--color-ink-muted)">Aucune demande.</p>
          ) : (
            <ul className="divide-y divide-(--color-border) rounded-xl border border-(--color-border) bg-white">
              {demandes.map((x) => (
                <li key={x.id} className="px-3 py-2.5">
                  <div className="flex items-start gap-2">
                    <Link href={`/admin/cockpit/demandes?d=${x.id}`} className="min-w-0 flex-1 text-[13.5px] font-medium text-(--color-ink) hover:text-(--color-primary)">
                      {x.motif}
                    </Link>
                    <PastilleStatut statut={x.statut} className="shrink-0" />
                  </div>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] text-(--color-ink-soft)">
                    <span>n° {n3(x.numero)}</span>
                    <span>·</span>
                    <span>{dateCourte(x.recue_at)}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      {x.nature === 'comptable' && <Lock className="h-3 w-3 text-(--color-primary)" />}
                      {x.sous_type ? SOUS_TYPE_LABEL[x.sous_type] : NATURE_DEMANDE_LABEL[x.nature as NatureDemande] ?? x.nature}
                    </span>
                    {(x.priorite === 'urgente' || x.priorite === 'haute') && <PastillePriorite priorite={x.priorite} />}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Carte>
  );
}
