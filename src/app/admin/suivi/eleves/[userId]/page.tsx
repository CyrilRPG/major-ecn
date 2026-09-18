import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertTriangle, ArrowLeft, CalendarCheck, History, PhoneCall } from 'lucide-react';
import { requireSuiviPage } from '@/lib/suivi/roles';
import { chargerTableauEleves, STATUT_SUIVI_LABEL } from '@/lib/suivi/eleves';
import { listReports } from '@/lib/suivi/db';
import { ALERTE_LABEL } from '@/lib/suivi/alertes-auto';
import { createAdminClient } from '@/lib/supabase/admin';
import { CompteRenduForm, MOYENS_CONTACT } from '@/components/admin/suivi/compte-rendu-form';
import { SuiviControls } from '@/components/admin/suivi/suivi-controls';
import { STATUT_TONE } from '@/components/admin/suivi/eleves-table';

export const dynamic = 'force-dynamic';

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
const fmtJour = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const OFFER_LABEL: Record<string, string> = { decouverte: 'Découverte', essentiel: 'Essentielle', intensif: 'Intensive', approfondi: 'Approfondie' };

type Note = {
  id: string; author_id: string; author_name: string | null; contact_type: string; motif: string; observations: string | null;
  difficultes: string | null; actions_recommandees: string | null; relance_date: string | null; created_at: string;
};

/**
 * Fiche élève du suivi (cahier §3) : identité et activité, alertes
 * automatiques, statut / prochain contact / affectation, formulaire « après un
 * appel », et l'historique complet — non destructible — des comptes rendus,
 * chacun horodaté avec l'identité de son auteur.
 */
export default async function FicheEleveSuiviPage({ params }: { params: Promise<{ userId: string }> }) {
  const actor = await requireSuiviPage('view');
  const { userId } = await params;
  const tableau = await chargerTableauEleves(actor);
  const l = tableau.lignes.find((x) => x.id === userId);
  if (!l) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = createAdminClient() as any;
  const [{ data: notesRaw }, rapports, { data: auteurs }] = await Promise.all([
    a.from('pedagogical_notes').select('id, author_id, author_name, contact_type, motif, observations, difficultes, actions_recommandees, relance_date, created_at').eq('user_id', userId).order('created_at', { ascending: false }),
    listReports({ userId }),
    a.from('profiles').select('id, first_name, last_name, email').in('role', ['admin', 'professor']),
  ]);
  const nomAuteur = new Map(((auteurs ?? []) as { id: string; first_name: string | null; last_name: string | null; email: string | null }[])
    .map((p) => [p.id, [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email || 'Équipe']));
  const notes = (notesRaw ?? []) as Note[];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 lg:px-8">
      <Link href="/admin/suivi/eleves" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-(--color-ink-soft) hover:text-(--color-ink)">
        <ArrowLeft className="h-3.5 w-3.5" /> Tableau de travail
      </Link>

      <header className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-(--color-border) pb-5">
        <div>
          <p className="text-xs font-medium text-(--color-ink-muted)">{l.specialite} · {l.voie ? `voie ${l.voie}` : 'voie —'} · {OFFER_LABEL[l.offer] ?? l.offer}</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">{l.nom}</h1>
          <p className="mt-0.5 text-sm text-(--color-ink-soft)">{l.email}{l.phone ? ` · ${l.phone}` : ''} · inscrit le {fmtJour(l.inscritLe)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUT_TONE[l.statut]}`}>{STATUT_SUIVI_LABEL[l.statut]}</span>
          <Link href={`/admin/suivi/candidats/${userId}`} className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-xs font-semibold text-(--color-ink) hover:bg-(--color-sand-100)">
            <CalendarCheck className="h-3.5 w-3.5" /> Rendez-vous &amp; suivi pédagogique
          </Link>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
          <h2 className="text-sm font-bold text-(--color-ink)">Activité</h2>
          <dl className="mt-2 space-y-1 text-sm text-(--color-ink-soft)">
            <div className="flex justify-between"><dt>Niveau</dt><dd className="font-semibold capitalize text-(--color-ink)">{l.activite}</dd></div>
            <div className="flex justify-between"><dt>Dernière connexion</dt><dd>{fmtJour(l.derniereConnexion)}</dd></div>
            <div className="flex justify-between"><dt>Dernière activité</dt><dd>{fmtJour(l.derniereActivite)}</dd></div>
            <div className="flex justify-between"><dt>Progression</dt><dd>{l.progression === null ? '—' : `${l.progression} %`}</dd></div>
            <div className="flex justify-between"><dt>QCM / dossiers</dt><dd>{l.qcmFaits}</dd></div>
            <div className="flex justify-between"><dt>Vidéos vues · fiches lues</dt><dd>{l.videosVues} · {l.fichesLues}</dd></div>
          </dl>
        </section>
        <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-(--color-ink)"><AlertTriangle className="h-4 w-4 text-[#B26A00]" /> Alertes automatiques</h2>
          {l.alertes.length === 0 ? <p className="mt-2 text-sm text-(--color-ink-muted)">Aucune alerte.</p> : (
            <ul className="mt-2 space-y-1.5">
              {l.alertes.map((al) => (
                <li key={al.type} className="text-sm">
                  <span className={`mr-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${al.gravite === 3 ? 'bg-[#FDE7E9] text-[#C0001F]' : al.gravite === 2 ? 'bg-[#FEF3E2] text-[#B26A00]' : 'bg-(--color-sand-100) text-(--color-ink-soft)'}`}>{ALERTE_LABEL[al.type]}</span>
                  <span className="text-(--color-ink-soft)">{al.detail}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
          <h2 className="text-sm font-bold text-(--color-ink)">Suivi</h2>
          <dl className="mt-2 space-y-1 text-sm text-(--color-ink-soft)">
            <div className="flex justify-between"><dt>Dernier contact</dt><dd>{fmtJour(l.dernierContact)}</dd></div>
            <div className="flex justify-between"><dt>Prochain contact</dt><dd>{fmtJour(l.prochainContact)}</dd></div>
            <div className="flex justify-between"><dt>Affecté à</dt><dd>{l.affecteA?.nom ?? '—'}</dd></div>
            <div className="flex justify-between"><dt>Comptes rendus</dt><dd>{l.nbComptesRendus}</dd></div>
          </dl>
        </section>
      </div>

      <section className="mt-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
        <h2 className="text-sm font-bold text-(--color-ink)">Classification et affectation</h2>
        <div className="mt-3">
          <SuiviControls
            userId={userId} statut={l.statut} prochainContact={l.prochainContact} affecteA={l.affecteA?.id ?? null}
            collaborateurs={tableau.collaborateurs} peutAffecter={tableau.peutAffecter} peutRediger={tableau.peutRediger}
          />
        </div>
      </section>

      {tableau.peutRediger && (
        <section className="mt-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-(--color-ink)"><PhoneCall className="h-4 w-4 text-[#16793C]" /> Après un appel — nouveau compte rendu</h2>
          <div className="mt-3"><CompteRenduForm userId={userId} /></div>
        </section>
      )}

      <section className="mt-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-(--color-ink)"><History className="h-4 w-4 text-(--color-ink-soft)" /> Historique des comptes rendus</h2>
        <p className="mt-1 text-xs text-(--color-ink-muted)">Historique non destructible : chaque intervention est horodatée avec l’identité de son auteur.</p>
        {notes.length === 0 && rapports.length === 0 ? <p className="mt-3 text-sm text-(--color-ink-muted)">Aucun compte rendu pour l’instant.</p> : (
          <ol className="mt-3 space-y-3">
            {notes.map((n) => (
              <li key={n.id} className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3">
                <p className="flex flex-wrap items-center gap-x-2 text-xs text-(--color-ink-muted)">
                  <span className="font-semibold text-(--color-ink)">{fmt(n.created_at)}</span>
                  <span>· {MOYENS_CONTACT[n.contact_type] ?? n.contact_type}</span>
                  <span>· par {n.author_name ?? nomAuteur.get(n.author_id) ?? 'Équipe'}</span>
                </p>
                <p className="mt-1 text-sm font-semibold text-(--color-ink)">{n.motif}</p>
                {n.observations && <p className="mt-1 whitespace-pre-wrap text-sm text-(--color-ink-soft)">{n.observations}</p>}
                {n.difficultes && <p className="mt-1 text-sm"><span className="font-semibold text-(--color-ink)">Difficulté : </span><span className="text-(--color-ink-soft)">{n.difficultes}</span></p>}
                {n.actions_recommandees && <p className="mt-1 text-sm"><span className="font-semibold text-(--color-ink)">Action décidée : </span><span className="text-(--color-ink-soft)">{n.actions_recommandees}</span></p>}
                {n.relance_date && <p className="mt-1 text-xs text-[#B26A00]">Prochaine relance le {fmtJour(n.relance_date)}</p>}
              </li>
            ))}
            {rapports.map((r) => (
              <li key={r.id} className="rounded-xl border border-(--color-border) p-3">
                <p className="flex flex-wrap items-center gap-x-2 text-xs text-(--color-ink-muted)">
                  <span className="font-semibold text-(--color-ink)">{fmt(r.occurred_at)}</span>
                  <span>· compte rendu de suivi ({r.contact_type})</span>
                  <span>· par {r.author_id ? nomAuteur.get(r.author_id) ?? 'Équipe' : 'Équipe'}</span>
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-(--color-ink-soft)">{r.summary}</p>
                {r.next_step && <p className="mt-1 text-sm"><span className="font-semibold text-(--color-ink)">Prochaine étape : </span><span className="text-(--color-ink-soft)">{r.next_step}</span></p>}
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
