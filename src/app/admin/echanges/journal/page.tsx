import { redirect } from 'next/navigation';
import { acteurBackOffice, journalAudit, journalTechnique, peut } from '@/lib/echanges/serveur/admin';
import { db, FACULTE } from '@/lib/echanges/serveur/base';
import { ACTIONS_AUDIT, cronsAffiches, dateParis, PERIODES, SOURCES_JOURNAL } from '@/components/admin/echanges/pilotage/commun';
import { JournalEchanges, type FiltresJournal } from '@/components/admin/echanges/pilotage/journal';

export const metadata = { title: 'Échanges — journal' };
export const dynamic = 'force-dynamic';

type Recherche = { onglet?: string; action?: string; groupe?: string; periode?: string; niveau?: string; source?: string };

const NIVEAUX = ['info', 'alerte', 'erreur'] as const;

/**
 * Journal des Échanges (Super Admin, §47, §101, §142) : journal d'audit
 * (immuable, chaque action sensible avec son auteur) et journal technique
 * (e-mails, relances, publication, tâches planifiées…), plus l'état des
 * tâches planifiées. Seul l'onglet affiché est chargé.
 */
export default async function JournalPage({ searchParams }: { searchParams: Promise<Recherche> }) {
  const a = await acteurBackOffice();
  if (!a) redirect('/admin');
  if (!peut(a, 'audit')) redirect('/admin/echanges');
  const sp = await searchParams;
  const maintenant = new Date().getTime();

  const onglet = sp.onglet === 'technique' ? 'technique' : 'audit';
  const action = sp.action && (ACTIONS_AUDIT as string[]).includes(sp.action) ? sp.action : '';
  const periode = PERIODES.some((p) => p.v === sp.periode) ? sp.periode! : '30';
  const niveau = (NIVEAUX as readonly string[]).includes(sp.niveau ?? '') ? (sp.niveau as (typeof NIVEAUX)[number]) : '';
  const source = sp.source && (SOURCES_JOURNAL as string[]).includes(sp.source) ? sp.source : '';

  const { data: gs } = await db().from('echanges_groupes').select('id, nom, promotion, statut').eq('faculte_id', FACULTE).order('nom');
  const groupes = ((gs ?? []) as { id: string; nom: string; promotion: string | null; statut: string }[])
    .map((g) => ({ id: g.id, nom: `${g.promotion ? `${g.nom} · ${g.promotion}` : g.nom}${g.statut === 'archivee' ? ' (archivée)' : ''}` }));
  const groupe = sp.groupe && groupes.some((g) => g.id === sp.groupe) ? sp.groupe : '';

  const filtres: FiltresJournal = { onglet, action, groupe, periode, niveau, source };

  if (onglet === 'audit') {
    const jours = periode === 'tout' ? null : Number(periode);
    const depuis = jours ? new Date(maintenant - jours * 86_400_000).toISOString() : null;
    const lignes = await journalAudit(a, { action: action || null, groupeId: groupe || null, depuis, limite: 1000 });
    return (
      <JournalEchanges
        filtres={filtres}
        groupes={groupes}
        audit={lignes.map((l) => ({ ...l, quand: dateParis(l.createdAt) }))}
        technique={null}
        crons={null}
      />
    );
  }

  const [lignes, { data: etats }] = await Promise.all([
    journalTechnique(a, { niveau: niveau || null, source: source || null }),
    db().from('echanges_cron_etat').select('nom, dernier_passage_at, duree_ms, resultat'),
  ]);
  const cronsBruts = ((etats ?? []) as { nom: string; dernier_passage_at: string | null; duree_ms: number | null; resultat: Record<string, unknown> | null }[]);
  const crons = cronsAffiches(cronsBruts.map((c) => ({ nom: c.nom, dernier: c.dernier_passage_at, dureeMs: c.duree_ms })), maintenant)
    .map((c) => ({ ...c, resultat: cronsBruts.find((x) => x.nom === c.nom)?.resultat ?? null }));
  return (
    <JournalEchanges
      filtres={filtres}
      groupes={groupes}
      audit={null}
      technique={lignes.map((l) => ({ ...l, quand: dateParis(l.createdAt) }))}
      crons={crons}
    />
  );
}
