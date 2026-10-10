'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ACTION_INACTIVITE_LABEL, type ActionInactivite, type Parametres } from '@/lib/qualite/parametres';
import { BLOCKING_SCOPE_LABEL, BLOCKING_SCOPES, FAMILLE_LABEL, FAMILLES, type BlockingScope, type Famille } from '@/lib/qualite/types';
import { champ } from './ui';

type Enregistrer = (json: string, motif: string) => Promise<{ ok: boolean; error?: string; message?: string }>;
type Simuler = () => Promise<{ ok: boolean; error?: string; message?: string; lignes?: { action: string; n: number }[] }>;

function Num({ v, on, min, max, pas = 1, largeur = 'w-20' }: { v: number | null; on: (n: number | null) => void; min?: number; max?: number; pas?: number; largeur?: string }) {
  return <input type="number" className={`${champ} ${largeur}`} value={v ?? ''} min={min} max={max} step={pas} onChange={(e) => on(e.target.value === '' ? null : Number(e.target.value))} />;
}
function Case({ v, on, label }: { v: boolean; on: (b: boolean) => void; label: string }) {
  return <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={v} onChange={(e) => on(e.target.checked)} className="h-4 w-4 accent-(--color-primary)" />{label}</label>;
}
function Bloc({ titre, children, aide }: { titre: string; children: React.ReactNode; aide?: string }) {
  return (
    <fieldset className="rounded-(--radius-card) border border-(--color-border) p-4">
      <legend className="px-1 text-sm font-semibold text-(--color-ink)">{titre}</legend>
      {aide && <p className="mb-3 text-xs text-(--color-ink-muted)">{aide}</p>}
      <div className="flex flex-col gap-3">{children}</div>
    </fieldset>
  );
}

/** Éditeur des paramètres du module (§29) : toute modification est historisée avec son motif. */
export function EditeurParametres({ initial, enregistrer, simuler }: { initial: Parametres; enregistrer: Enregistrer; simuler: Simuler }) {
  const router = useRouter();
  const [p, setP] = React.useState<Parametres>(initial);
  const [motif, setMotif] = React.useState('');
  const [occupe, setOccupe] = React.useState(false);
  const [msg, setMsg] = React.useState<{ ok: boolean; t: string } | null>(null);
  const [sim, setSim] = React.useState<string | null>(null);
  const majF = (f: Famille, patch: Partial<Parametres['familles'][Famille]>) => setP((x) => ({ ...x, familles: { ...x.familles, [f]: { ...x.familles[f], ...patch } } }));

  async function sauver() {
    if (p.actif && !initial.actif && !window.confirm("Activer le module : les questionnaires seront créés et envoyés automatiquement, les relances d'inactivité partiront par e-mail et les questionnaires obligatoires bloqueront les activités prévues. Confirmer ?")) return;
    setOccupe(true); setMsg(null);
    const r: { ok: boolean; error?: string; message?: string } = await enregistrer(JSON.stringify(p), motif).catch((e) => ({ ok: false, error: String(e) }));
    setOccupe(false);
    setMsg({ ok: r.ok, t: r.ok ? (r.message ?? 'Enregistré.') : (r.error ?? 'Échec') });
    if (r.ok) { setMotif(''); router.refresh(); }
  }

  return (
    <div className="flex flex-col gap-4">
      <Bloc titre="Activation du module" aide="Module livré éteint. À l'activation, la date de démarrage est enregistrée : aucune séance antérieure ne déclenche de questionnaire.">
        <Case v={p.actif} on={(b) => setP({ ...p, actif: b })} label={p.actif ? 'Module actif' : 'Module éteint'} />
        {p.demarrage && <p className="text-xs text-(--color-ink-muted)">Actif depuis le {new Date(p.demarrage).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</p>}
      </Bloc>

      <Bloc titre="Familles de questionnaires" aide="Activables indépendamment. Un questionnaire facultatif ne bloque jamais rien. Priorité : le plus élevé passe en premier (le bilan final doit rester le plus prioritaire).">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="text-left text-xs text-(--color-ink-muted)"><tr><th className="pb-2">Famille</th><th>Active</th><th>Obligatoire</th><th>Périmètre du blocage</th><th>Priorité</th><th>Expiration (j)</th><th>Relance (j)</th></tr></thead>
            <tbody>
              {FAMILLES.map((f) => {
                const x = p.familles[f];
                return (
                  <tr key={f} className="border-t border-(--color-border)">
                    <td className="py-2 pr-2"><span className="font-medium">{f}</span><span className="block text-xs text-(--color-ink-muted)">{FAMILLE_LABEL[f]}</span></td>
                    <td><input type="checkbox" checked={x.actif} onChange={(e) => majF(f, { actif: e.target.checked })} className="h-4 w-4 accent-(--color-primary)" /></td>
                    <td><input type="checkbox" checked={x.obligatoire} onChange={(e) => majF(f, { obligatoire: e.target.checked, blocking_scope: e.target.checked ? x.blocking_scope : 'aucun' })} className="h-4 w-4 accent-(--color-primary)" /></td>
                    <td>
                      <select className={`${champ} w-56`} value={x.blocking_scope} disabled={!x.obligatoire} onChange={(e) => majF(f, { blocking_scope: e.target.value as BlockingScope })}>
                        {BLOCKING_SCOPES.map((s) => <option key={s} value={s} title={BLOCKING_SCOPE_LABEL[s]}>{s === 'aucun' ? 'Aucun' : s === 'activites' ? 'Nouvelles activités' : 'Toute la pédagogie'}</option>)}
                      </select>
                    </td>
                    <td><Num v={x.priorite} on={(n) => majF(f, { priorite: n ?? 0 })} min={0} max={1000} /></td>
                    <td><Num v={x.expiration_jours} on={(n) => majF(f, { expiration_jours: n })} min={1} max={365} /></td>
                    <td><Num v={x.relance_jours} on={(n) => majF(f, { relance_jours: n })} min={1} max={90} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <ul className="text-xs text-(--color-ink-muted)">{BLOCKING_SCOPES.map((s) => <li key={s}><strong>{s}</strong> : {BLOCKING_SCOPE_LABEL[s]}</li>)}<li>L’assistance, le profil, les informations d’examen, les formulaires, les émargements et la messagerie restent toujours accessibles.</li></ul>
      </Bloc>

      <div className="grid gap-4 lg:grid-cols-2">
        <Bloc titre="Échéances des enquêtes" aide="Échéances validées : à chaud après chaque séance, 33 % et 66 %, J-3 avant la première épreuve, J+3 après la dernière, six mois après la fin.">
          <label className="flex items-center justify-between gap-2 text-sm">Seuil de visionnage d’un replay (%)<Num v={Math.round(p.hot.seuil_replay * 100)} on={(n) => setP({ ...p, hot: { ...p.hot, seuil_replay: (n ?? 80) / 100 } })} min={30} max={100} /></label>
          <label className="flex items-center justify-between gap-2 text-sm">Délai après la fin d’un direct (min)<Num v={p.hot.delai_apres_seance_min} on={(n) => setP({ ...p, hot: { ...p.hot, delai_apres_seance_min: n ?? 0 } })} min={0} /></label>
          <Case v={p.hot.neutraliser_avant_examen} on={(b) => setP({ ...p, hot: { ...p.hot, neutraliser_avant_examen: b } })} label="Neutraliser les questionnaires à chaud pendant la dernière ligne droite" />
          <label className="flex items-center justify-between gap-2 text-sm">Durée de la protection avant la 1re épreuve (jours)<Num v={p.hot.jours_protection} on={(n) => setP({ ...p, hot: { ...p.hot, jours_protection: n ?? 0 } })} min={0} max={30} /></label>
          <label className="flex items-center justify-between gap-2 text-sm">Seuils des bilans intermédiaires (%)<input className={`${champ} w-28`} value={p.progress.seuils.join(', ')} onChange={(e) => setP({ ...p, progress: { ...p.progress, seuils: e.target.value.split(',').map((x) => Number(x.trim())).filter((x) => Number.isFinite(x) && x > 0 && x < 100) } })} /></label>
          <label className="flex items-center justify-between gap-2 text-sm">Calcul de la progression
            <select className={`${champ} w-64`} value={p.progress.mode} onChange={(e) => setP({ ...p, progress: { ...p.progress, mode: e.target.value as Parametres['progress']['mode'] } })}>
              <option value="max">La plus avancée (pédagogique ou calendaire)</option><option value="pedagogique">Pédagogique (formule commune)</option><option value="calendaire">Calendaire (temps écoulé)</option>
            </select></label>
          <label className="flex items-center justify-between gap-2 text-sm">Bilan final : jours avant la 1re épreuve<Num v={p.final.jours_avant} on={(n) => setP({ ...p, final: { jours_avant: n ?? 3 } })} min={1} max={30} /></label>
          <label className="flex items-center justify-between gap-2 text-sm">Post-EVC : jours après la dernière épreuve<Num v={p.post_exam.jours_apres} on={(n) => setP({ ...p, post_exam: { jours_apres: n ?? 3 } })} min={1} max={60} /></label>
          <label className="flex items-center justify-between gap-2 text-sm">Suivi différé : mois après la fin de formation<Num v={p.follow_up.mois_apres} on={(n) => setP({ ...p, follow_up: { ...p.follow_up, mois_apres: n ?? 6 } })} min={1} max={36} /></label>
          <label className="flex items-center justify-between gap-2 text-sm">Validité des liens sécurisés (jours)<Num v={p.follow_up.validite_lien_jours} on={(n) => setP({ ...p, follow_up: { ...p.follow_up, validite_lien_jours: n ?? 60 } })} min={7} max={365} /></label>
        </Bloc>

        <Bloc titre="Suivi des candidats inactifs" aide="Inactivité pédagogique réelle (cours, QCM, flashcards, révisions). Jamais pendant une pause, après la fin de formation, ni pour l'Offre Découverte (relances commerciales séparées). Une seule action par période d'inactivité : la plus élevée atteinte.">
          <Case v={p.inactivite.actif} on={(b) => setP({ ...p, inactivite: { ...p.inactivite, actif: b } })} label="Relances d’inactivité actives" />
          {p.inactivite.paliers.map((pal, i) => (
            <label key={i} className="flex items-center justify-between gap-2 text-sm">
              <span>{ACTION_INACTIVITE_LABEL[pal.action as ActionInactivite]}</span>
              <span className="flex items-center gap-1"><Num v={pal.jours} on={(n) => setP({ ...p, inactivite: { ...p.inactivite, paliers: p.inactivite.paliers.map((x, j) => (j === i ? { ...x, jours: n ?? x.jours } : x)) } })} min={1} max={365} /> jours</span>
            </label>
          ))}
          <label className="flex items-center justify-between gap-2 text-sm">E-mails au plus par passage<Num v={p.inactivite.max_emails_par_passage} on={(n) => setP({ ...p, inactivite: { ...p.inactivite, max_emails_par_passage: n ?? 80 } })} min={0} max={1000} /></label>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" variant="outline" onClick={async () => {
              setSim('Calcul…');
              const r = await simuler().catch(() => null);
              setSim(r?.ok ? `${r.message} Avec les paramètres ENREGISTRÉS, le prochain passage contacterait : ${(r.lignes ?? []).map((l) => `${ACTION_INACTIVITE_LABEL[l.action as ActionInactivite]} : ${l.n}`).join(' · ') || 'personne'}.` : (r?.error ?? 'Simulation impossible'));
            }}>Simuler (sans rien envoyer)</Button>
            {sim && <span className="text-xs text-(--color-ink-soft)">{sim}</span>}
          </div>
        </Bloc>

        <Bloc titre="Alertes" aide="Critique : e-mail immédiat à la direction. Vigilance et récurrence : récapitulatif quotidien.">
          <Case v={p.alertes.email_critique} on={(b) => setP({ ...p, alertes: { ...p.alertes, email_critique: b } })} label="E-mail immédiat pour les alertes critiques" />
          <Case v={p.alertes.recap_vigilance} on={(b) => setP({ ...p, alertes: { ...p.alertes, recap_vigilance: b } })} label="Récapitulatif quotidien (vigilance, récurrence)" />
          <label className="flex flex-col gap-1 text-sm">Destinataires (direction), séparés par des virgules
            <input className={champ} value={p.alertes.destinataires.join(', ')} onChange={(e) => setP({ ...p, alertes: { ...p.alertes, destinataires: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) } })} placeholder="direction@major-ecn.fr" /></label>
          <label className="flex items-center justify-between gap-2 text-sm">Récurrence : candidats distincts<Num v={p.alertes.recurrence_seuil} on={(n) => setP({ ...p, alertes: { ...p.alertes, recurrence_seuil: n ?? 3 } })} min={2} /></label>
          <label className="flex items-center justify-between gap-2 text-sm">… sur (jours)<Num v={p.alertes.recurrence_jours} on={(n) => setP({ ...p, alertes: { ...p.alertes, recurrence_jours: n ?? 30 } })} min={1} /></label>
          <label className="flex items-center justify-between gap-2 text-sm">Taux de réponse minimal (%)<Num v={p.alertes.taux_reponse_min} on={(n) => setP({ ...p, alertes: { ...p.alertes, taux_reponse_min: n ?? 60 } })} min={0} max={100} /></label>
          <label className="flex items-center justify-between gap-2 text-sm">… à partir de N questionnaires attendus<Num v={p.alertes.taux_reponse_effectif_min} on={(n) => setP({ ...p, alertes: { ...p.alertes, taux_reponse_effectif_min: n ?? 10 } })} min={1} /></label>
        </Bloc>

        <Bloc titre="Analyse et exceptions">
          <Case v={p.ia.actif} on={(b) => setP({ ...p, ia: { actif: b } })} label="Analyse des commentaires par IA (sinon : règles seules)" />
          <label className="flex items-center justify-between gap-2 text-sm">Report que le candidat peut demander (heures)<Num v={p.candidat.report_technique_heures} on={(n) => setP({ ...p, candidat: { ...p.candidat, report_technique_heures: n ?? 24 } })} min={1} max={168} /></label>
          <label className="flex items-center justify-between gap-2 text-sm">Reports autorisés par questionnaire<Num v={p.candidat.report_max} on={(n) => setP({ ...p, candidat: { ...p.candidat, report_max: n ?? 1 } })} min={0} max={10} /></label>
        </Bloc>
      </div>

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-3 shadow-(--shadow-lifted)">
        <input className={`${champ} min-w-64 flex-1`} placeholder="Motif de la modification (historisé)" value={motif} onChange={(e) => setMotif(e.target.value)} />
        <Button type="button" onClick={sauver} disabled={occupe}>{occupe && <Loader2 className="animate-spin" />}Enregistrer les paramètres</Button>
        {msg && <span className={`text-sm ${msg.ok ? 'text-green-700' : 'text-(--color-danger)'}`}>{msg.t}</span>}
      </div>
    </div>
  );
}

/** Édition d'un questionnaire : titre, introduction, questions (JSON) — chaque enregistrement crée une version. */
export function EditeurQuestionnaire({ q, enregistrer, retablir }: {
  q: { id: string; code: string; titre: string; intro: string | null; questions: unknown; version: number; actif: boolean };
  enregistrer: (d: { titre: string; intro: string; questions: string; actif: boolean }) => Promise<{ ok: boolean; error?: string; message?: string }>;
  retablir: () => Promise<{ ok: boolean; error?: string; message?: string }>;
}) {
  const router = useRouter();
  const [titre, setTitre] = React.useState(q.titre);
  const [intro, setIntro] = React.useState(q.intro ?? '');
  const [json, setJson] = React.useState(JSON.stringify(q.questions, null, 2));
  const [actif, setActif] = React.useState(q.actif);
  const [msg, setMsg] = React.useState<{ ok: boolean; t: string } | null>(null);
  const [occupe, setOccupe] = React.useState(false);
  const go = async (f: () => Promise<{ ok: boolean; error?: string; message?: string }>) => {
    setOccupe(true); const r: { ok: boolean; error?: string; message?: string } = await f().catch((e) => ({ ok: false, error: String(e) })); setOccupe(false);
    setMsg({ ok: r.ok, t: r.ok ? (r.message ?? 'Enregistré') : (r.error ?? 'Échec') }); if (r.ok) router.refresh();
  };
  return (
    <div className="flex flex-col gap-2">
      <input className={champ} value={titre} onChange={(e) => setTitre(e.target.value)} />
      <textarea className="rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) p-2 text-sm" rows={2} value={intro} onChange={(e) => setIntro(e.target.value)} placeholder="Introduction" />
      <textarea className="rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) p-2 font-mono text-xs" rows={14} value={json} onChange={(e) => setJson(e.target.value)} spellCheck={false} />
      <p className="text-xs text-(--color-ink-muted)">Chaque question : id, libelle, type (note5, oui_non, texte, choix_multiple, choix_unique, recommandation), obligatoire, options, critere (statistiques), role (difficulte, difficultes, contact, resolu, resultat, preparation), siQuestion / siValeur (condition).</p>
      <div className="flex flex-wrap items-center gap-2">
        <Case v={actif} on={setActif} label="Actif" />
        <Button size="sm" type="button" disabled={occupe} onClick={() => go(() => enregistrer({ titre, intro, questions: json, actif }))}>Enregistrer une nouvelle version</Button>
        <Button size="sm" type="button" variant="ghost" disabled={occupe} onClick={() => window.confirm('Rétablir le modèle du cahier des charges ?') && go(retablir)}>Rétablir le modèle d’origine</Button>
        {msg && <span className={`text-xs ${msg.ok ? 'text-green-700' : 'text-(--color-danger)'}`}>{msg.t}</span>}
      </div>
    </div>
  );
}
