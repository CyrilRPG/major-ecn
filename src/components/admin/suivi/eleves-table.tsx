'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowUpDown, Loader2, Search } from 'lucide-react';
import { affecterEleveAction, majSuiviEleveAction } from '@/app/admin/suivi/eleves/actions';
import { ALERTE_LABEL } from '@/lib/suivi/alertes-auto';
import { STATUTS_SUIVI, STATUT_SUIVI_LABEL, type Collaborateur, type LigneEleve, type StatutSuivi } from '@/lib/suivi/eleves-pure';

/** En-tête de colonne triable. */
function Th({ t, tri, onTrier, children }: { t: Tri; tri: Tri; onTrier: (t: Tri) => void; children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left font-semibold">
      <button type="button" onClick={() => onTrier(t)} className={`inline-flex items-center gap-1 ${tri === t ? 'text-(--color-ink)' : ''}`}>
        {children} <ArrowUpDown className="h-3 w-3 opacity-60" />
      </button>
    </th>
  );
}

const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—');
const OFFER_LABEL: Record<string, string> = { decouverte: 'Découverte', essentiel: 'Essentielle', intensif: 'Intensive', approfondi: 'Approfondie' };
const ACTIVITE_TONE: Record<LigneEleve['activite'], string> = {
  fort: 'bg-[#E7F6EC] text-[#16793C]', moyen: 'bg-[#E5F1FF] text-[#1E4D8B]', faible: 'bg-[#FEF3E2] text-[#B26A00]', nul: 'bg-[#FDE7E9] text-[#C0001F]',
};
export const STATUT_TONE: Record<StatutSuivi, string> = {
  a_contacter: 'bg-(--color-sand-100) text-(--color-ink-soft)',
  contacte: 'bg-[#E5F1FF] text-[#1E4D8B]',
  a_rappeler: 'bg-[#FEF3E2] text-[#B26A00]',
  resolu: 'bg-[#E7F6EC] text-[#16793C]',
  a_surveiller: 'bg-[#F3EAFF] text-[#5B21B6]',
  urgent: 'bg-[#FDE7E9] text-[#C0001F]',
};

type Tri = 'nom' | 'connexion' | 'progression' | 'alertes' | 'dernier' | 'prochain';

/**
 * Tableau de travail (cahier §3) : filtres, tri, changement de statut et
 * affectation en ligne — tout élève affiché est déjà dans le périmètre de la
 * personne (le serveur l'a filtré).
 */
export function ElevesTable({
  lignes, collaborateurs, peutAffecter, peutRediger, moi,
}: {
  lignes: LigneEleve[]; collaborateurs: Collaborateur[]; peutAffecter: boolean; peutRediger: boolean; moi: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [specialite, setSpecialite] = useState('');
  const [offer, setOffer] = useState('');
  const [voie, setVoie] = useState('');
  const [statut, setStatut] = useState('');
  const [alerte, setAlerte] = useState('');
  const [affecte, setAffecte] = useState('');
  const [tri, setTri] = useState<Tri>('alertes');
  const [desc, setDesc] = useState(true);

  const specialites = useMemo(() => Array.from(new Set(lignes.map((l) => l.specialite))).sort((a, b) => a.localeCompare(b, 'fr')), [lignes]);

  const visibles = useMemo(() => {
    const n = q.trim().toLowerCase();
    const f = lignes.filter((l) =>
      (!n || l.nom.toLowerCase().includes(n) || (l.email ?? '').toLowerCase().includes(n))
      && (!specialite || l.specialite === specialite)
      && (!offer || l.offer === offer)
      && (!voie || l.voie === voie)
      && (!statut || l.statut === statut)
      && (!alerte || (alerte === 'oui' ? l.alertes.length > 0 : alerte === 'non' ? l.alertes.length === 0 : l.alertes.some((a) => a.type === alerte)))
      && (!affecte || (affecte === 'moi' ? l.affecteA?.id === moi : affecte === 'personne' ? !l.affecteA : l.affecteA?.id === affecte)));
    const cle = (l: LigneEleve): number | string => {
      switch (tri) {
        case 'nom': return l.nom.toLowerCase();
        case 'connexion': return l.derniereConnexion ?? '';
        case 'progression': return l.progression ?? -1;
        case 'alertes': return l.alertes.reduce((n, a) => n + a.gravite, 0);
        case 'dernier': return l.dernierContact ?? '';
        case 'prochain': return l.prochainContact ?? '9999';
      }
    };
    return f.sort((a, b) => {
      const x = cle(a); const y = cle(b);
      const r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'fr');
      return desc ? -r : r;
    });
  }, [lignes, q, specialite, offer, voie, statut, alerte, affecte, tri, desc, moi]);

  const trierPar = (t: Tri) => { if (tri === t) setDesc((d) => !d); else { setTri(t); setDesc(t !== 'nom' && t !== 'prochain'); } };
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setErreur(null);
    start(async () => { const r = await fn(); if (!r.ok) setErreur(r.error ?? 'Erreur'); router.refresh(); });
  };

  const SELECT = 'h-9 rounded-lg border border-(--color-border) bg-(--color-surface) px-2 text-sm text-(--color-ink)';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) p-3 md:grid-cols-4 lg:grid-cols-7">
        <label className="relative col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom ou email" className={`${SELECT} w-full pl-8`} />
        </label>
        <select value={specialite} onChange={(e) => setSpecialite(e.target.value)} className={SELECT}><option value="">Spécialité</option>{specialites.map((s) => <option key={s} value={s}>{s}</option>)}</select>
        <select value={offer} onChange={(e) => setOffer(e.target.value)} className={SELECT}><option value="">Formule</option>{Object.entries(OFFER_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select value={voie} onChange={(e) => setVoie(e.target.value)} className={SELECT}><option value="">Voie</option><option value="interne">Interne</option><option value="externe">Externe</option></select>
        <select value={statut} onChange={(e) => setStatut(e.target.value)} className={SELECT}><option value="">Statut de suivi</option>{STATUTS_SUIVI.map((s) => <option key={s} value={s}>{STATUT_SUIVI_LABEL[s]}</option>)}</select>
        <select value={alerte} onChange={(e) => setAlerte(e.target.value)} className={SELECT}>
          <option value="">Alertes</option><option value="oui">Au moins une</option><option value="non">Aucune</option>
          {Object.entries(ALERTE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={affecte} onChange={(e) => setAffecte(e.target.value)} className={SELECT}>
          <option value="">Affecté à</option><option value="moi">Moi</option><option value="personne">Personne</option>
          {collaborateurs.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
      </div>

      <p className="text-xs text-(--color-ink-muted)">{visibles.length} élève{visibles.length > 1 ? 's' : ''} affiché{visibles.length > 1 ? 's' : ''}{pending && <Loader2 className="ml-2 inline h-3 w-3 animate-spin" />}</p>
      {erreur && <p className="text-sm font-medium text-[#A91D2C]">{erreur}</p>}

      <div className="overflow-x-auto rounded-2xl border border-(--color-border) bg-(--color-surface)">
        <table className="w-full text-[13px]">
          <thead className="bg-(--color-surface-soft) text-[11px] uppercase tracking-wide text-(--color-ink-muted)">
            <tr>
              <Th t="nom" tri={tri} onTrier={trierPar}>Élève</Th>
              <th className="px-3 py-2 text-left font-semibold">Spécialité · voie · formule</th>
              <th className="px-3 py-2 text-left font-semibold">Activité</th>
              <Th t="connexion" tri={tri} onTrier={trierPar}>Dernière connexion</Th>
              <Th t="progression" tri={tri} onTrier={trierPar}>Progression</Th>
              <Th t="alertes" tri={tri} onTrier={trierPar}>Alertes</Th>
              <Th t="dernier" tri={tri} onTrier={trierPar}>Dernier contact</Th>
              <Th t="prochain" tri={tri} onTrier={trierPar}>Prochain contact</Th>
              <th className="px-3 py-2 text-left font-semibold">Statut</th>
              <th className="px-3 py-2 text-left font-semibold">Affecté à</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((l) => (
              <tr key={l.id} className="border-t border-(--color-border) align-top hover:bg-(--color-sand-100)/40">
                <td className="px-3 py-2">
                  <Link href={`/admin/suivi/eleves/${l.id}`} className="font-semibold text-(--color-ink) hover:underline">{l.nom}</Link>
                  <p className="text-[11px] text-(--color-ink-muted)">{l.email}</p>
                </td>
                <td className="px-3 py-2 text-xs text-(--color-ink-soft)">
                  {l.specialite}<br />{l.voie ? `voie ${l.voie}` : 'voie —'} · {OFFER_LABEL[l.offer] ?? l.offer}
                </td>
                <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${ACTIVITE_TONE[l.activite]}`}>{l.activite}</span></td>
                <td className="px-3 py-2 text-xs">{fmtDate(l.derniereConnexion)}</td>
                <td className="px-3 py-2 text-xs tabular-nums">{l.progression === null ? '—' : `${l.progression} %`}</td>
                <td className="px-3 py-2">
                  {l.alertes.length === 0 ? <span className="text-xs text-(--color-ink-muted)">—</span> : (
                    <span className="inline-flex flex-wrap gap-1">
                      {l.alertes.slice(0, 3).map((a) => (
                        <span key={a.type} title={a.detail} className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${a.gravite === 3 ? 'bg-[#FDE7E9] text-[#C0001F]' : a.gravite === 2 ? 'bg-[#FEF3E2] text-[#B26A00]' : 'bg-(--color-sand-100) text-(--color-ink-soft)'}`}>
                          <AlertTriangle className="h-3 w-3" /> {ALERTE_LABEL[a.type]}
                        </span>
                      ))}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-xs">{fmtDate(l.dernierContact)}{l.nbComptesRendus > 0 && <span className="text-(--color-ink-muted)"> · {l.nbComptesRendus} CR</span>}</td>
                <td className="px-3 py-2 text-xs">{fmtDate(l.prochainContact)}</td>
                <td className="px-3 py-2">
                  {peutRediger ? (
                    <select
                      value={l.statut}
                      disabled={pending}
                      onChange={(e) => run(() => majSuiviEleveAction({ userId: l.id, statut: e.target.value as StatutSuivi }))}
                      className={`h-8 rounded-lg border-0 px-2 text-[11px] font-bold ${STATUT_TONE[l.statut]}`}
                    >
                      {STATUTS_SUIVI.map((s) => <option key={s} value={s}>{STATUT_SUIVI_LABEL[s]}</option>)}
                    </select>
                  ) : <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUT_TONE[l.statut]}`}>{STATUT_SUIVI_LABEL[l.statut]}</span>}
                </td>
                <td className="px-3 py-2">
                  {peutAffecter ? (
                    <select
                      value={l.affecteA?.id ?? ''}
                      disabled={pending}
                      onChange={(e) => run(() => affecterEleveAction({ userId: l.id, collaborateurId: e.target.value || null }))}
                      className="h-8 max-w-40 rounded-lg border border-(--color-border) bg-(--color-surface) px-2 text-xs"
                    >
                      <option value="">— Personne —</option>
                      {collaborateurs.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                    </select>
                  ) : <span className="text-xs">{l.affecteA?.nom ?? '—'}</span>}
                </td>
              </tr>
            ))}
            {visibles.length === 0 && <tr><td colSpan={10} className="px-3 py-8 text-center text-sm text-(--color-ink-muted)">Aucun élève ne correspond.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
