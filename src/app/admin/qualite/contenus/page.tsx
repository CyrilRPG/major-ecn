import Link from 'next/link';
import { BarreFiltres, BoutonAction, Carte, EnTete, Pastille, Vide } from '@/components/admin/qualite/ui';
import { filtresVersQuery, lireFiltres } from '@/lib/qualite/filtres';
import { defsFiltres } from '@/lib/qualite/filtres-ui';
import { dateFr } from '@/lib/qualite/format';
import { chargerCommentaires, optionsFiltres } from '@/lib/qualite/serveur/admin';
import { qdb } from '@/lib/qualite/serveur/base';
import {
  CONTENU_TYPE_LABEL, CONTENUS_TYPES, DECISION_VERIFICATION_LABEL, DECISIONS_VERIFICATION, NATURE_VERIFICATION_LABEL, STATUT_VERIFICATION_LABEL,
  STATUTS_VERIFICATION, type ContenuType, type DecisionVerification, type NatureVerification, type StatutVerification,
} from '@/lib/qualite/types';
import { ajouterDocumentAction, creerVerificationAction, majVerificationAction } from '../actions';
import { FormulaireDocument } from '@/components/admin/qualite/document';
import { ListeDocuments } from '@/components/admin/qualite/documents-liste';

export const dynamic = 'force-dynamic';

type Verif = {
  id: string; numero: number; nature: NatureVerification; contenu_type: ContenuType; contenu_id: string | null; contenu_label: string; demande: string;
  source_citee: string | null; responsable_nom: string | null; statut: StatutVerification; decision: DecisionVerification | null; decision_detail: string | null;
  verifiee_at: string | null; mise_a_jour_at: string | null; version_corrigee: string | null; signalements: number; created_at: string;
};

/** Statistiques par contenu (§19) et gestion des mises à jour scientifiques (§20). */
export default async function ContenusPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const f = lireFiltres(sp);
  const [commentaires, opts, { data: v }] = await Promise.all([
    chargerCommentaires({ ...f, sentiment: null }), optionsFiltres(),
    qdb().from('qualite_verifications').select('*').order('created_at', { ascending: false }).limit(300),
  ]);
  const verifs = (v ?? []) as Verif[];
  const groupes = new Map<string, { type: string; label: string; ids: string[]; users: Set<string>; neg: number; dernier: string }>();
  for (const c of commentaires) {
    if (!c.contenu_type && !c.contenu_label) continue;
    const label = c.contenu_label ?? CONTENU_TYPE_LABEL[c.contenu_type as ContenuType] ?? 'Contenu';
    const cle = `${c.contenu_type ?? 'autre'}|${c.contenu_id ?? label.toLowerCase()}`;
    const g = groupes.get(cle) ?? { type: c.contenu_type ?? 'autre', label, ids: [], users: new Set<string>(), neg: 0, dernier: c.created_at };
    g.ids.push(c.id); if (c.user_id) g.users.add(c.user_id);
    if (c.sentiment === 'negatif' || c.sentiment === 'mixte') g.neg++;
    if (c.created_at > g.dernier) g.dernier = c.created_at;
    groupes.set(cle, g);
  }
  const lignes = Array.from(groupes.values()).sort((a, b) => b.users.size - a.users.size || b.neg - a.neg);
  const parType = CONTENUS_TYPES.map((t) => ({ t, n: commentaires.filter((c) => c.contenu_type === t).length })).filter((x) => x.n);
  const focus = typeof sp.verif === 'string' ? sp.verif : null;
  return (
    <>
      <EnTete titre="Qualité par contenu pédagogique" description="Les signalements associés à une fiche, un QCM, une QROC, un dossier, une correction, une annale, une vidéo ou un module. Une remarque de candidat n'est jamais, seule, la preuve d'une erreur : la décision appartient à un professionnel compétent."
        action={<BoutonAction label="Nouvelle vérification" variant="primary" action={creerVerificationAction} champs={[
          { nom: 'nature', label: 'Nature', type: 'select', requis: true, options: [{ v: 'erreur', l: 'Erreur signalée' }, { v: 'actualisation', l: 'Actualisation scientifique' }, { v: 'imprecision', l: 'Imprécision' }, { v: 'autre', l: 'Autre' }] },
          { nom: 'contenu_type', label: 'Type de contenu', type: 'select', requis: true, options: CONTENUS_TYPES.map((t) => ({ v: t, l: CONTENU_TYPE_LABEL[t] })) },
          { nom: 'contenu_label', label: 'Contenu concerné', requis: true }, { nom: 'contenu_id', label: 'Identifiant (facultatif)' },
          { nom: 'demande', label: "Nature de l'actualisation ou de l'erreur", type: 'long', requis: true },
          { nom: 'source_citee', label: 'Recommandation ou source citée' }, { nom: 'responsable_nom', label: 'Enseignant ou relecteur responsable' },
        ]} />} />
      <BarreFiltres filtres={defsFiltres(opts, ['du', 'au', 'college', 'famille', 'theme'])} />
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Carte titre="Signalements par type">
          {parType.length === 0 ? <Vide>Aucun contenu identifié dans les remarques.</Vide> : <ul className="flex flex-col gap-1 text-sm">{parType.map((x) => <li key={x.t} className="flex justify-between"><span>{CONTENU_TYPE_LABEL[x.t]}</span><span>{x.n}</span></li>)}</ul>}
        </Carte>
        <Carte titre="Contenus les plus signalés" className="lg:col-span-2">
          {lignes.length === 0 ? <Vide>Aucun.</Vide> : (
            <ul className="divide-y divide-(--color-border) text-sm">
              {lignes.slice(0, 30).map((g) => (
                <li key={`${g.type}${g.label}`} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span><span className="font-medium">{g.label}</span> <span className="text-xs text-(--color-ink-muted)">{CONTENU_TYPE_LABEL[g.type as ContenuType] ?? g.type} · {g.users.size} candidat(s) · {g.neg} négatif(s) · dernier le {dateFr(g.dernier)}</span></span>
                  <BoutonAction label="Créer une vérification" variant="ghost" action={creerVerificationAction} champs={[
                    { nom: 'nature', label: 'Nature', type: 'select', requis: true, options: [{ v: 'erreur', l: 'Erreur signalée' }, { v: 'actualisation', l: 'Actualisation scientifique' }, { v: 'imprecision', l: 'Imprécision' }, { v: 'autre', l: 'Autre' }] },
                    { nom: 'contenu_type', label: 'Type', type: 'select', requis: true, defaut: g.type, options: CONTENUS_TYPES.map((t) => ({ v: t, l: CONTENU_TYPE_LABEL[t] })) },
                    { nom: 'contenu_label', label: 'Contenu', requis: true, defaut: g.label },
                    { nom: 'demande', label: 'Demande', type: 'long', requis: true, defaut: `${g.users.size} candidat(s) signalent un problème sur ce contenu.` },
                    { nom: 'responsable_nom', label: 'Responsable pédagogique' },
                    { nom: 'commentaires', label: 'Signalements liés', defaut: g.ids.join(',') },
                  ]} />
                </li>
              ))}
            </ul>
          )}
        </Carte>
      </div>
      <Carte titre="Vérifications et mises à jour scientifiques" description="Contenu, demande, source citée, relecteur, date de vérification, décision, date de mise à jour et version corrigée.">
        {verifs.length === 0 ? <Vide>Aucune vérification.</Vide> : (
          <ul className="divide-y divide-(--color-border) text-sm">
            {verifs.map((x) => (
              <li key={x.id} className={`py-3 ${focus === x.id ? 'rounded bg-(--color-primary-soft) px-2' : ''}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">n° {x.numero} — {x.contenu_label} <span className="text-xs text-(--color-ink-muted)">({CONTENU_TYPE_LABEL[x.contenu_type]} · {NATURE_VERIFICATION_LABEL[x.nature]} · {x.signalements} signalement(s))</span></p>
                    <p className="text-xs text-(--color-ink-soft)">{x.demande}</p>
                    <p className="text-xs text-(--color-ink-muted)">Source : {x.source_citee ?? '—'} · Relecteur : {x.responsable_nom ?? '—'} · Créée le {dateFr(x.created_at)}{x.verifiee_at ? ` · vérifiée le ${dateFr(x.verifiee_at)}` : ''}{x.mise_a_jour_at ? ` · mise à jour le ${dateFr(x.mise_a_jour_at)} (version ${x.version_corrigee})` : ''}</p>
                    {x.decision && <p className="text-xs">Décision : <strong>{DECISION_VERIFICATION_LABEL[x.decision]}</strong>{x.decision_detail ? ` — ${x.decision_detail}` : ''}</p>}
                    <div className="mt-1"><ListeDocuments objetType="verification" objetId={x.id} /></div>
                    <Link href={`/admin/qualite/remarques?contenu=${encodeURIComponent(x.contenu_id ?? x.contenu_type)}`} className="text-xs text-(--color-primary) hover:underline">Signalements</Link>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Pastille ton={x.statut === 'mis_a_jour' || x.statut === 'classe' ? 'ok' : 'vigilance'}>{STATUT_VERIFICATION_LABEL[x.statut]}</Pastille>
                    <BoutonAction label="Mettre à jour" variant="ghost" action={majVerificationAction.bind(null, x.id)} champs={[
                      { nom: 'statut', label: 'Statut', type: 'select', defaut: x.statut, options: STATUTS_VERIFICATION.map((s) => ({ v: s, l: STATUT_VERIFICATION_LABEL[s] })) },
                      { nom: 'decision', label: 'Décision du professionnel', type: 'select', defaut: x.decision ?? '', options: DECISIONS_VERIFICATION.map((d) => ({ v: d, l: DECISION_VERIFICATION_LABEL[d] })) },
                      { nom: 'decision_detail', label: 'Justification de la décision', type: 'long', defaut: x.decision_detail ?? '' },
                      { nom: 'source_citee', label: 'Source', defaut: x.source_citee ?? '' },
                      { nom: 'responsable_nom', label: 'Relecteur', defaut: x.responsable_nom ?? '' },
                      { nom: 'version_corrigee', label: 'Version du contenu corrigé', defaut: x.version_corrigee ?? '' },
                    ]} />
                    <FormulaireDocument action={ajouterDocumentAction.bind(null, 'verification', x.id)} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Carte>
      <p className="mt-3 text-xs text-(--color-ink-muted)"><Link href={`/admin/qualite/remarques${filtresVersQuery({ ...f, theme: 'contenu_non_actualise' })}`} className="hover:underline">Voir les remarques « contenu non actualisé »</Link></p>
    </>
  );
}
