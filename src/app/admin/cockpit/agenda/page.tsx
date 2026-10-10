import { instantParis } from '@/lib/agenda/planning';
import { ongletsDe } from '@/lib/auth/onglets-equipe';
import { requireStaff } from '@/lib/auth/require-role';
import { contexteCockpit } from '@/lib/cockpit/server/base';
import { agendaEntre, COLONNES_RDV, type RdvLigne } from '@/lib/cockpit/server/donnees';
import { tachesVisibles } from '@/lib/cockpit/server/taches';
import { ajouterJoursIso, lundiDe, premierDuMois } from '@/lib/cockpit/regles';
import { PageCockpit } from '@/components/admin/cockpit/ui';
import { AgendaCockpit } from '@/components/admin/cockpit/agenda/agenda-cockpit';

export const metadata = { title: 'Mon agenda' };
export const dynamic = 'force-dynamic';

/**
 * « Mon agenda » (§3, addendum A et B) : vues Aujourd'hui / Semaine / Mois,
 * rendez-vous, échéances, cours de la plateforme, entretiens de suivi ;
 * glisser-déposer des tâches d'un jour à l'autre ; objectifs hebdomadaires et
 * mensuels. Personnel : seuls les rendez-vous de l'utilisateur.
 */
export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ jour?: string; rdv?: string; vue?: string }> }) {
  const sp = await searchParams;
  const { moi, db } = await contexteCockpit();
  const { profile } = await requireStaff();
  const aujourdHui = instantParis().date;
  const jour = sp.jour && /^\d{4}-\d{2}-\d{2}$/.test(sp.jour) ? sp.jour : aujourdHui;
  const debut = lundiDe(premierDuMois(jour));
  const fin = ajouterJoursIso(debut, 41);
  const voitCours = moi.estAdmin || (await ongletsDe(profile)).agenda;

  const taches = await tachesVisibles(db, moi.id);
  const [elements, rdv, objectifs] = await Promise.all([
    agendaEntre(db, moi, debut, fin, taches, voitCours),
    db.from('cockpit_rdv').select(COLONNES_RDV).eq('owner_id', moi.id)
      .gte('debut', new Date(`${ajouterJoursIso(debut, -1)}T00:00:00Z`).toISOString())
      .lte('debut', new Date(`${ajouterJoursIso(fin, 1)}T23:59:59Z`).toISOString()).limit(1000),
    db.from('cockpit_objectifs').select('periode, debut, texte, atteint').eq('owner_id', moi.id)
      .in('periode', ['semaine', 'mois']).in('debut', [lundiDe(jour), premierDuMois(jour)]),
  ]);
  let rdvOuvert: RdvLigne | null = null;
  if (sp.rdv) {
    const { data } = await db.from('cockpit_rdv').select(COLONNES_RDV).eq('id', sp.rdv).eq('owner_id', moi.id).maybeSingle();
    rdvOuvert = (data as RdvLigne | null) ?? null;
  }
  const rdvs = (rdv.data ?? []) as RdvLigne[];
  if (rdvOuvert && !rdvs.some((r) => r.id === rdvOuvert!.id)) rdvs.push(rdvOuvert);

  return (
    <PageCockpit>
      <AgendaCockpit
        elements={elements}
        rdvs={rdvs}
        aujourdHui={aujourdHui}
        jourInitial={jour}
        vueInitiale={sp.vue === 'jour' || sp.vue === 'mois' ? sp.vue : 'semaine'}
        rdvOuvert={rdvOuvert?.id ?? null}
        objectifs={(objectifs.data ?? []) as { periode: 'semaine' | 'mois'; debut: string; texte: string; atteint: boolean }[]}
      />
    </PageCockpit>
  );
}
