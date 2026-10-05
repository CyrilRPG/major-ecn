import Link from 'next/link';
import { Gauge } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { getCheckupConfig, getEngagementConfig, getOrchestratorConfig } from '@/lib/moteur/server/db';
import { DEFAULT_ORCHESTRATOR_CONFIG, STATUS_LABEL, type MasteryStatus } from '@/lib/moteur/types';
import { DEFAULT_ENGAGEMENT_CONFIG, LEVEL_LABEL, type EngagementLevel } from '@/lib/engagement/types';
import { DEFAULT_CHECKUP_CONFIG, FORMAT_LABEL, STATUS_LABEL as CHECKUP_STATUS_LABEL, type CheckupFormat, type CheckupStatus } from '@/lib/checkup/types';
import { MODULE_TITLE, settingsLeaves } from '@/lib/moteur/settings-labels';
import { accessibleSpecialties } from '@/lib/checkup/server/pool';
import { bankOverview, candidateAdminView, checkupSessions, findCandidate, openEpisodesAll } from '@/lib/moteur/server/admin';
import { fmtDateTime } from '@/lib/suivi/format';
import { cn } from '@/lib/utils';
import { SettingsEditor } from './settings-editor';
import { BankDatalists, CandidateTools, NeutralizeButton, QuestionMetaForm, SerieMetaForm } from './admin-tools';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Moteur pédagogique' };

const TABS = [
  { key: 'reglages', label: 'Réglages' },
  { key: 'checkup', label: 'EVC Check-up' },
  { key: 'banque', label: 'Banque du Check-up' },
  { key: 'candidat', label: 'Vue candidat' },
  { key: 'alertes', label: 'Alertes ouvertes' },
] as const;
type Tab = (typeof TABS)[number]['key'];

const FAMILY_LABEL: Record<string, string> = { structured_item: 'Banque structurée', des_bank: 'QCM DES', transversal_bank: 'Banque transversale', evc_annale: 'Annales EVC' };
const TRIGGER_LABEL: Record<string, string> = {
  inactivite: 'Inactivité', baisse_rythme: 'Baisse du rythme', revisions_transversales: 'Révisions transversales', activite_insuffisante: 'Activité insuffisante',
  j1_incomplet: 'Programme d’hier incomplet', retard_cumule: 'Retard cumulé', planning_ignore: 'Planificateur ignoré', planning_trop_charge: 'Planning trop chargé',
};

/**
 * /admin/moteur-pedagogique — réglages des modules (Orchestrateur, Engagement,
 * Check-up), sessions de Check-up et neutralisation, classement de la banque,
 * vue pédagogique d'un candidat (base du futur suivi individuel) et alertes
 * ouvertes. Administrateurs seulement.
 */
export default async function MoteurPedagogiquePage({ searchParams }: { searchParams: Promise<{ onglet?: string; specialite?: string; q?: string; id?: string; famille?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const tab: Tab = (TABS.some((t) => t.key === sp.onglet) ? sp.onglet : 'reglages') as Tab;

  let body: React.ReactNode = null;
  if (tab === 'reglages') {
    const [o, e, c] = await Promise.all([getOrchestratorConfig(), getEngagementConfig(), getCheckupConfig()]);
    body = (
      <div className="space-y-5">
        <p className="text-sm text-(--color-ink-soft)">
          Tous les paramètres des cahiers des charges sont modifiables ici, sans redéveloppement. Les réglages du planificateur (charge quotidienne maximale, nombre d’items par jour, seuils de priorisation avant l’épreuve) sont dans{' '}
          <Link href="/admin/planificateur" className="font-semibold text-(--color-primary) hover:underline">Planificateur EVC</Link>.
        </p>
        <SettingsEditor module="orchestrateur" title={MODULE_TITLE.orchestrateur} leaves={settingsLeaves(DEFAULT_ORCHESTRATOR_CONFIG, o)} />
        <SettingsEditor module="engagement" title={MODULE_TITLE.engagement} leaves={settingsLeaves(DEFAULT_ENGAGEMENT_CONFIG, e)} />
        <SettingsEditor module="checkup" title={MODULE_TITLE.checkup} leaves={settingsLeaves(DEFAULT_CHECKUP_CONFIG, c)} />
      </div>
    );
  } else if (tab === 'checkup') {
    const { rows, byStatus } = await checkupSessions(80);
    body = (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 text-xs">
          {Object.entries(byStatus).map(([s, n]) => <span key={s} className="rounded-full border border-(--color-border) px-3 py-1">{CHECKUP_STATUS_LABEL[s as CheckupStatus] ?? s} : <strong>{n}</strong> (30 j)</span>)}
          {Object.keys(byStatus).length === 0 && <span className="text-(--color-ink-muted)">Aucun Check-up sur les 30 derniers jours.</span>}
        </div>
        <div className="overflow-x-auto rounded-2xl border border-(--color-border)">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-(--color-surface-soft) text-left text-xs text-(--color-ink-muted)">
              <tr><th className="px-3 py-2">Candidat</th><th className="px-3 py-2">Début</th><th className="px-3 py-2">Format</th><th className="px-3 py-2">Statut</th><th className="px-3 py-2">Score</th><th className="px-3 py-2" /></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-(--color-border)">
                  <td className="px-3 py-2"><Link href={`/admin/moteur-pedagogique?onglet=candidat&id=${r.user_id}`} className="font-medium text-(--color-ink) hover:underline">{r.name}</Link><span className="block text-xs text-(--color-ink-muted)">{r.email}</span></td>
                  <td className="px-3 py-2 text-xs">{fmtDateTime(r.started_at)}</td>
                  <td className="px-3 py-2 text-xs">{FORMAT_LABEL[r.format as CheckupFormat] ?? r.format} · {r.scope_kind === 'cible' ? 'ciblé' : 'global'}</td>
                  <td className="px-3 py-2 text-xs">{CHECKUP_STATUS_LABEL[r.status as CheckupStatus] ?? r.status}{r.neutralized_reason ? <span className="block text-(--color-ink-muted)">{r.neutralized_reason}</span> : null}</td>
                  <td className="px-3 py-2 text-xs tabular-nums">{r.score_percent !== null ? `${Math.round(Number(r.score_percent))} %` : '—'}</td>
                  <td className="px-3 py-2 text-right">{r.status !== 'cancelled_technical' && r.status !== 'abandoned' && <NeutralizeButton sessionId={r.id} />}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center text-sm text-(--color-ink-muted)">Aucun Check-up pour le moment.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  } else if (tab === 'banque') {
    const specs = await accessibleSpecialties({ type: 'all' });
    const spec = specs.find((s) => s.id === sp.specialite)?.id ?? specs[0]?.id ?? null;
    const bank = spec ? await bankOverview(spec) : null;
    const fam = sp.famille && FAMILY_LABEL[sp.famille] ? sp.famille : null;
    const list = bank ? bank.series.filter((s) => !fam || s.family === fam) : [];
    const itemChoices = (bank?.items ?? []).map((i) => ({ id: i.id, label: i.titre }));
    const categoryChoices = (bank?.categories ?? []).map((c) => ({ id: c.id, label: c.nom }));
    body = (
      <div className="space-y-4">
        <p className="text-sm text-(--color-ink-soft)">Classement automatique des séries par source (banque structurée, QCM DES, banque transversale, annales EVC), corrigeable série par série. Une série exclue n’est jamais servie au Check-up. Prise en compte immédiate sur ce serveur, sous 10 minutes partout.</p>
        <nav className="flex flex-wrap gap-1.5" aria-label="Spécialités">
          {specs.map((s) => (
            <Link key={s.id} href={`/admin/moteur-pedagogique?onglet=banque&specialite=${encodeURIComponent(s.id)}`} className={cn('rounded-full border px-3 py-1 text-xs', s.id === spec ? 'border-(--color-primary) bg-(--color-primary) text-white' : 'border-(--color-border) hover:bg-(--color-surface-soft)')}>{s.nom}</Link>
          ))}
        </nav>
        {bank && (
          <>
            <BankDatalists items={itemChoices} categories={categoryChoices} />
            <QuestionMetaForm specialiteId={spec!} items={itemChoices} categories={categoryChoices} />
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {Object.entries(bank.families).map(([f, v]) => (
                <Link key={f} href={`/admin/moteur-pedagogique?onglet=banque&specialite=${encodeURIComponent(spec!)}&famille=${f}`} className={cn('rounded-xl border p-3', fam === f ? 'border-(--color-primary)' : 'border-(--color-border)')}>
                  <p className="text-xs font-semibold text-(--color-ink-muted)">{FAMILY_LABEL[f]}</p>
                  <p className="text-lg font-bold text-(--color-ink)">{v.questions} <span className="text-xs font-medium text-(--color-ink-muted)">questions · {v.series} séries</span></p>
                </Link>
              ))}
            </div>
            <div className="overflow-x-auto rounded-2xl border border-(--color-border)">
              <table className="w-full min-w-[1280px] text-sm">
                <thead className="bg-(--color-surface-soft) text-left text-xs text-(--color-ink-muted)"><tr><th className="px-3 py-2">Série</th><th className="px-3 py-2">Item</th><th className="px-3 py-2">Source</th><th className="px-3 py-2">Questions</th><th className="px-3 py-2 text-right">Classement</th></tr></thead>
                <tbody>
                  {list.slice(0, 300).map((s) => (
                    <tr key={s.id} className="border-t border-(--color-border)">
                      <td className="px-3 py-2">{s.label}</td>
                      <td className="px-3 py-2 text-xs text-(--color-ink-soft)">{s.coursTitre}</td>
                      <td className="px-3 py-2 text-xs">{FAMILY_LABEL[s.family]}{s.overridden ? ' (manuel)' : ''}{s.excluded ? ' · exclue' : ''}</td>
                      <td className="px-3 py-2 text-xs tabular-nums">{s.questions}</td>
                      <td className="px-3 py-2"><SerieMetaForm serieId={s.id} specialiteId={spec!} family={s.family} overridden={s.overridden} extractable={s.extractable} excluded={s.excluded}
                        itemId={s.itemId} categoryId={s.categoryId} items={itemChoices} categories={categoryChoices} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {list.length > 300 && <p className="text-xs text-(--color-ink-muted)">300 premières séries affichées sur {list.length} : filtrez par source.</p>}
          </>
        )}
      </div>
    );
  } else if (tab === 'candidat') {
    const found = sp.q ? await findCandidate(sp.q) : [];
    const view = sp.id && /^[0-9a-f-]{36}$/i.test(sp.id) ? await candidateAdminView(sp.id) : null;
    body = (
      <div className="space-y-4">
        <form className="flex flex-wrap gap-2" action="/admin/moteur-pedagogique">
          <input type="hidden" name="onglet" value="candidat" />
          <input name="q" defaultValue={sp.q ?? ''} placeholder="E-mail, nom ou identifiant" aria-label="Rechercher un candidat" className="h-10 min-w-64 flex-1 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-3 text-sm focus-ring" />
          <button className="h-10 rounded-(--radius-button) bg-(--color-primary) px-4 text-sm font-semibold text-white">Rechercher</button>
        </form>
        {found.length > 0 && (
          <ul className="flex flex-wrap gap-2 text-sm">{found.map((f) => <li key={f.id}><Link href={`/admin/moteur-pedagogique?onglet=candidat&id=${f.id}`} className="rounded-full border border-(--color-border) px-3 py-1 hover:bg-(--color-surface-soft)">{f.name || '—'} · {f.email}</Link></li>)}</ul>
        )}
        {view && <CandidateView v={view} />}
      </div>
    );
  } else {
    const eps = await openEpisodesAll();
    body = (
      <div className="overflow-x-auto rounded-2xl border border-(--color-border)">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-(--color-surface-soft) text-left text-xs text-(--color-ink-muted)"><tr><th className="px-3 py-2">Candidat</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Niveau</th><th className="px-3 py-2">Motif</th><th className="px-3 py-2">Depuis</th><th className="px-3 py-2">Vue / acquittée</th></tr></thead>
          <tbody>
            {eps.map((e) => (
              <tr key={e.id} className="border-t border-(--color-border)">
                <td className="px-3 py-2"><Link href={`/admin/moteur-pedagogique?onglet=candidat&id=${e.user_id}`} className="font-medium hover:underline">{e.name}</Link><span className="block text-xs text-(--color-ink-muted)">{e.email}</span></td>
                <td className="px-3 py-2 text-xs">{e.kind === 'planner' ? 'Planificateur' : 'Engagement'}{e.status === 'recovering' ? ' · reprise détectée' : ''}</td>
                <td className="px-3 py-2 text-xs">{e.kind === 'planner' ? '—' : e.alert_level === 0 ? 'Vigilance' : `Niveau ${e.alert_level}`}</td>
                <td className="px-3 py-2 text-xs">{TRIGGER_LABEL[e.alert_trigger] ?? e.alert_trigger}<span className="block text-(--color-ink-muted)">{e.motif}</span></td>
                <td className="px-3 py-2 text-xs">{fmtDateTime(e.alert_started_at)}</td>
                <td className="px-3 py-2 text-xs">{e.alert_displayed_at ? 'vue' : 'non vue'}{e.popup_displayed_at ? ' · pop-up' : ''}{e.alert_acknowledged_at ? ' · acquittée' : ''}</td>
              </tr>
            ))}
            {eps.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center text-sm text-(--color-ink-muted)">Aucune alerte ouverte.</td></tr>}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 px-3 py-5 sm:px-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-(--color-ink)"><Gauge className="h-6 w-6 text-(--color-primary)" aria-hidden /> Moteur pédagogique</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">Orchestrateur central, alertes d’engagement et EVC Check-up : un seul état par item et par candidat, partagé par tous les modules.</p>
      </header>
      <nav className="flex flex-wrap gap-1 border-b border-(--color-border)" aria-label="Onglets">
        {TABS.map((t) => (
          <Link key={t.key} href={`/admin/moteur-pedagogique?onglet=${t.key}`} aria-current={t.key === tab ? 'page' : undefined}
            className={cn('-mb-px border-b-2 px-3 py-2 text-sm font-medium', t.key === tab ? 'border-(--color-primary) text-(--color-ink)' : 'border-transparent text-(--color-ink-soft) hover:text-(--color-ink)')}>{t.label}</Link>
        ))}
      </nav>
      {body}
    </main>
  );
}

function CandidateView({ v }: { v: NonNullable<Awaited<ReturnType<typeof candidateAdminView>>> }) {
  const eng = v.engagement as Record<string, unknown> | null;
  const counts = v.states.reduce<Record<string, number>>((m, s) => ({ ...m, [s.mastery_status]: (m[s.mastery_status] ?? 0) + 1 }), {});
  return (
    <div className="space-y-4">
      <section className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
        <div>
          <p className="text-lg font-bold text-(--color-ink)">{v.profile.name}</p>
          <p className="text-sm text-(--color-ink-soft)">{v.profile.email} · {v.profile.is_active === false ? 'désactivé' : 'actif'}{v.profile.access_end ? ` · accès jusqu’au ${fmtDateTime(v.profile.access_end)}` : ''}</p>
          <p className="mt-1 text-xs text-(--color-ink-muted)">Dernière actualisation : {v.collector?.last_refresh_at ? fmtDateTime(String(v.collector.last_refresh_at)) : 'jamais'}</p>
        </div>
        <CandidateTools userId={v.profile.id} />
      </section>
      <section className="grid grid-cols-2 gap-2 md:grid-cols-5">
        {(['a_revoir', 'a_consolider', 'en_bonne_voie', 'maitrise_consolidee', 'non_evalue'] as MasteryStatus[]).map((s) => (
          <div key={s} className="rounded-xl border border-(--color-border) p-3"><p className="text-xs text-(--color-ink-muted)">{STATUS_LABEL[s]}</p><p className="text-xl font-bold">{counts[s] ?? 0}</p></div>
        ))}
      </section>
      {eng && (
        <section className="rounded-2xl border border-(--color-border) p-4 text-sm">
          <h2 className="font-bold">Engagement</h2>
          <p className="mt-1">Niveau : <strong>{LEVEL_LABEL[(eng.engagement_level as EngagementLevel) ?? 'vert'] ?? String(eng.engagement_level)}</strong> · score interne {eng.engagement_score === null || eng.engagement_score === undefined ? '—' : Number(eng.engagement_score).toLocaleString('fr-FR', { maximumFractionDigits: 1 })}/100 · escalade {String(eng.escalation_level ?? 0)} · jours sans activité significative : {String(eng.inactivity_days ?? '—')}</p>
          <p className="text-xs text-(--color-ink-soft)">Jours actifs : {String(eng.active_days_7d ?? 0)}/7 · {String(eng.active_days_14d ?? 0)}/14 · {String(eng.active_days_30d ?? 0)}/30 — révisions transversales {String(eng.transversal_reviews_completed ?? 0)}/{String(eng.transversal_reviews_assigned ?? 0)} — reprise : {String(eng.recovery_status ?? 'none')}</p>
          {typeof eng.explanation === 'string' && <p className="mt-1 text-xs text-(--color-ink-muted)">{eng.explanation}</p>}
          {!!eng.planner && typeof eng.planner === 'object' && Object.keys(eng.planner as object).length > 0 ? <pre className="mt-2 overflow-x-auto rounded-lg bg-(--color-surface-soft) p-2 text-[11px]">{JSON.stringify(eng.planner, null, 1)}</pre> : null}
        </section>
      )}
      <section className="rounded-2xl border border-(--color-border) p-4 text-sm">
        <h2 className="font-bold">Épisodes d’alerte (historique complet)</h2>
        <ul className="mt-2 space-y-1 text-xs">
          {v.episodes.map((e) => <li key={String(e.id)}>{fmtDateTime(String(e.alert_started_at))} · {e.kind === 'planner' ? 'Planificateur' : 'Engagement'} · {TRIGGER_LABEL[String(e.alert_trigger)] ?? String(e.alert_trigger)} · niveau max {String(e.max_level)} · {String(e.status)}{e.resolution ? ` (${String(e.resolution)})` : ''} — {String(e.motif)}</li>)}
          {v.episodes.length === 0 && <li className="text-(--color-ink-muted)">Aucun épisode.</li>}
        </ul>
      </section>
      <section className="overflow-x-auto rounded-2xl border border-(--color-border)">
        <table className="w-full min-w-[860px] text-xs">
          <thead className="bg-(--color-surface-soft) text-left text-(--color-ink-muted)"><tr><th className="px-3 py-2">Item</th><th className="px-3 py-2">Statut</th><th className="px-3 py-2">Raison</th><th className="px-3 py-2">Priorité</th><th className="px-3 py-2">Dernier résultat</th><th className="px-3 py-2">Contrôle</th></tr></thead>
          <tbody>
            {v.states.slice(0, 200).map((s) => (
              <tr key={s.item_id} className="border-t border-(--color-border)">
                <td className="px-3 py-1.5">{s.titre}</td><td className="px-3 py-1.5">{STATUS_LABEL[s.mastery_status]}</td><td className="px-3 py-1.5">{s.status_reason ?? '—'}</td>
                <td className="px-3 py-1.5 tabular-nums">{s.priority_score ?? '—'}</td><td className="px-3 py-1.5">{s.last_result ?? '—'} {s.last_result_source ? `(${s.last_result_source}, ${s.last_result_strength ?? '—'})` : ''}</td>
                <td className="px-3 py-1.5">{s.control_pending ? 'attendu' : '—'}</td>
              </tr>
            ))}
            {v.states.length === 0 && <tr><td colSpan={6} className="px-3 py-4 text-center text-(--color-ink-muted)">Aucun état d’item.</td></tr>}
          </tbody>
        </table>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-(--color-border) p-4 text-xs">
          <h2 className="text-sm font-bold">Besoins actifs</h2>
          <ul className="mt-2 space-y-1">{v.needs.map((n) => <li key={n.id}>{n.titre} · {n.objective} / {n.need_type} · priorité {String(n.priority_score)} (rang {n.arbitration_rank}){n.due_at ? ` · dû le ${n.due_at.slice(0, 10)}` : ''}</li>)}{v.needs.length === 0 && <li className="text-(--color-ink-muted)">Aucun.</li>}</ul>
        </div>
        <div className="rounded-2xl border border-(--color-border) p-4 text-xs">
          <h2 className="text-sm font-bold">Réactivations programmées</h2>
          <ul className="mt-2 space-y-1">{v.reviews.map((r) => <li key={r.id}>{r.due_on} · {r.titre} · J+{r.interval_days} (étape {r.step}){r.adjusted ? ` · ${r.adjusted}` : ''}</li>)}{v.reviews.length === 0 && <li className="text-(--color-ink-muted)">Aucune.</li>}</ul>
        </div>
      </section>
      <section className="rounded-2xl border border-(--color-border) p-4 text-xs">
        <h2 className="text-sm font-bold">Événements récents (traçabilité des décisions)</h2>
        <ul className="mt-2 space-y-1">{v.events.map((e, i) => <li key={i}>{fmtDateTime(e.created_at)} · {e.event_type}{e.titre ? ` · ${e.titre}` : ''}{e.old_status || e.new_status ? ` · ${e.old_status ?? '—'} → ${e.new_status ?? '—'}` : ''}{e.trigger ? ` · ${e.trigger}` : ''}</li>)}</ul>
      </section>
      <section className="rounded-2xl border border-(--color-border) p-4 text-xs">
        <h2 className="text-sm font-bold">Check-up</h2>
        <ul className="mt-2 space-y-1">{v.checkups.map((c) => <li key={c.id}>{fmtDateTime(c.started_at)} · {CHECKUP_STATUS_LABEL[c.status as CheckupStatus] ?? c.status} · {c.scope_kind} · {c.score_percent === null ? '—' : Math.round(Number(c.score_percent))} %</li>)}{v.checkups.length === 0 && <li className="text-(--color-ink-muted)">Aucun.</li>}</ul>
      </section>
    </div>
  );
}
