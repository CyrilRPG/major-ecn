'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { deleteDraftTournament, setTournamentStatus, updateTournamentSettings } from '@/app/admin/arena/actions';
import { STATUS_LABEL, type TournamentStatus } from '@/lib/arena/time';
import { SEQUENCE_KINDS, SEQUENCE_LABEL, type EmailSequence, type TournamentRow } from '@/lib/arena/types';
import type { IntegrityReport } from '@/lib/arena/admin';
import { CoverField } from './cover-field';

function Field({ label, id, children, hint }: { label: string; id: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-(--color-ink-muted)">{hint}</p>}
    </div>
  );
}

/** Paramètres généraux du tournoi + cycle de vie (§15, §15.1). */
export function SettingsForm({ t, integrity, effectiveStatus }: { t: TournamentRow; integrity: IntegrityReport; effectiveStatus: TournamentStatus }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: t.title, slug: t.slug, specialty: t.specialty, specialty_id: t.specialty_id, edition_label: t.edition_label,
    meta_title: t.meta_title ?? '', meta_description: t.meta_description ?? '', intro_text: t.intro_text, indexable: t.indexable,
    leaderboard_enabled: t.leaderboard_enabled, leaderboard_size: t.leaderboard_size, threshold_pct: t.threshold_pct, min_rounds_final: t.min_rounds_final,
    afficher_effectif_general: t.afficher_effectif_general,
    questions_per_round: t.questions_per_round, round_duration_minutes: t.round_duration_minutes,
    seconds_per_question: t.seconds_per_question, retention_days: t.retention_days,
  });
  const [seq, setSeq] = useState<EmailSequence>(t.email_sequence);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<TournamentStatus | null>(null);
  const [pending, start] = useTransition();

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const num = (v: string) => Number(v.replace(',', '.'));
  const locked = t.status !== 'draft' && t.status !== 'scheduled';

  const save = () => {
    setStatus('idle'); setError(null);
    start(async () => {
      const r = await updateTournamentSettings(t.id, {
        ...form,
        min_rounds_final: 3,
        questions_per_round: 20,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
        email_sequence: seq,
        texts: t.texts,
      });
      if (r.ok) { setStatus('saved'); router.refresh(); } else { setStatus('error'); setError(r.error); }
    });
  };

  const transition = (next: TournamentStatus) => {
    setError(null);
    start(async () => {
      const r = await setTournamentStatus(t.id, next);
      if (!r.ok) setError(r.error);
      setConfirmOpen(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-8">
      {/* Cycle de vie */}
      <section className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-(--color-ink)">Statut : {STATUS_LABEL[effectiveStatus]}</h2>
            <p className="text-xs text-(--color-ink-soft)">Brouillon → Programmé exige le contrôle d’intégrité au vert. Le passage à « Inscriptions ouvertes » est une action manuelle confirmée. Ouverture et clôture des manches sont automatiques (dates).</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {t.status === 'draft' && <Button onClick={() => transition('scheduled')} disabled={pending || !integrity.ok}>Passer en Programmé</Button>}
            {t.status === 'scheduled' && <Button variant="outline" onClick={() => transition('draft')} disabled={pending}>Revenir en Brouillon</Button>}
            {t.status === 'scheduled' && <Button onClick={() => setConfirmOpen('registration_open')} disabled={pending}>Ouvrir les inscriptions</Button>}
            {t.status !== 'archived' && t.status !== 'draft' && <Button variant="outline" onClick={() => setConfirmOpen('archived')} disabled={pending}>Archiver</Button>}
            {t.status === 'archived' && <Button variant="outline" onClick={() => transition('draft')} disabled={pending}>Désarchiver (brouillon)</Button>}
            {t.status === 'draft' && <Button variant="danger" onClick={() => setConfirmOpen('draft')} disabled={pending}>Supprimer le brouillon</Button>}
          </div>
        </div>
        {confirmOpen && (
          <div className="mt-4 rounded-(--radius-button) border border-(--color-border-strong) bg-(--color-surface-soft) p-4 text-sm">
            {confirmOpen === 'registration_open' && <p>Ouvrir les inscriptions rend la landing, le formulaire et l’URL publics. Les dates des manches ne seront plus modifiables sans confirmation explicite. Confirmer ?</p>}
            {confirmOpen === 'archived' && <p>Archiver retire le tournoi de la navigation publique ; les données restent consultables ici. Confirmer ?</p>}
            {confirmOpen === 'draft' && <p>Supprimer définitivement ce brouillon (manches et questions comprises) ?</p>}
            <div className="mt-3 flex gap-2">
              <Button
                variant={confirmOpen === 'draft' ? 'danger' : 'primary'}
                disabled={pending}
                onClick={() => {
                  if (confirmOpen === 'draft') start(async () => { const r = await deleteDraftTournament(t.id); if (r.ok) router.push('/admin/arena'); else setError(r.error); });
                  else transition(confirmOpen);
                }}
              >
                Confirmer
              </Button>
              <Button variant="ghost" onClick={() => setConfirmOpen(null)}>Annuler</Button>
            </div>
          </div>
        )}
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-(--color-ink-muted)">Contrôle d’intégrité</p>
          {integrity.ok ? (
            <p className="mt-1 text-sm font-semibold text-emerald-700">Au vert : dates, nombre de questions et validité de chaque question.</p>
          ) : (
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-(--color-danger)">
              {integrity.problems.map((p) => <li key={p}>{p}</li>)}
              {integrity.perRound.flatMap((r) => r.issues.map((i) => <li key={`${r.number}-${i}`}>M{r.number} — {i}</li>))}
            </ul>
          )}
        </div>
      </section>

      {/* Paramètres */}
      <section className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)">
        <h2 className="text-base font-bold text-(--color-ink)">Identité et landing (§8.1)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Titre" id="s-title"><Input id="s-title" value={form.title} onChange={(e) => set('title', e.target.value)} /></Field>
          <Field label="URL (slug)" id="s-slug" hint={`Landing : /arena/${form.slug}`}><Input id="s-slug" value={form.slug} onChange={(e) => set('slug', e.target.value)} disabled={locked} /></Field>
          <Field label="Spécialité (libellé public)" id="s-spe"><Input id="s-spe" value={form.specialty} onChange={(e) => set('specialty', e.target.value)} /></Field>
          <Field label="Édition" id="s-ed"><Input id="s-ed" value={form.edition_label} onChange={(e) => set('edition_label', e.target.value)} /></Field>
          <Field label="Balise title (SEO)" id="s-mt"><Input id="s-mt" value={form.meta_title} onChange={(e) => set('meta_title', e.target.value)} placeholder={form.title} /></Field>
          <Field label="Meta description (SEO)" id="s-md"><Input id="s-md" value={form.meta_description} onChange={(e) => set('meta_description', e.target.value)} maxLength={320} /></Field>
        </div>
        <div className="mt-4">
          <Field label="Texte d’introduction (landing)" id="s-intro"><Textarea id="s-intro" rows={3} value={form.intro_text} onChange={(e) => set('intro_text', e.target.value)} /></Field>
        </div>
        <div className="mt-5 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface-soft) p-4">
          <p className="mb-3 text-sm font-semibold text-(--color-ink)">Visuel du tournoi <span className="font-normal text-(--color-ink-muted)">— carte « Choisissez votre tournoi »</span></p>
          <CoverField tournamentId={t.id} specialty={form.specialty} specialtyId={form.specialty_id} coverPath={t.cover_image_path ?? null} />
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.indexable} onChange={(e) => set('indexable', e.target.checked)} />
          Page indexable par les moteurs de recherche (à activer seulement à la mise en production ; mode test = décoché)
        </label>
      </section>

      <section className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)">
        <h2 className="text-base font-bold text-(--color-ink)">Règles du tournoi (§2, §7)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Questions par manche" id="s-q" hint="Format Arena : 20 questions. Les manches déjà disputées conservent leur contenu."><Input id="s-q" type="number" value={20} readOnly /></Field>
          <Field label="Durée d’une question (s)" id="s-seconds" hint="Appliquée à toute question qui ne fixe pas la sienne. Le temps d’une manche est la somme des durées de ses questions.">
            <Input id="s-seconds" type="number" min={5} max={3600} value={form.seconds_per_question} onChange={(e) => set('seconds_per_question', num(e.target.value))} disabled={locked} />
          </Field>
          <Field label="Durée d’une manche (min) — historique" id="s-d" hint="N’est plus utilisée pour chronométrer : conservée pour les tournois d’avant le 08/09/2026.">
            <Input id="s-d" type="number" min={1} max={240} value={form.round_duration_minutes} onChange={(e) => set('round_duration_minutes', num(e.target.value))} disabled={locked} />
          </Field>
          <Field label="Manches requises au classement général" id="s-min" hint="Les trois manches doivent être disputées."><Input id="s-min" type="number" value={3} readOnly /></Field>
          <Field label="Seuil d’affichage du rang (%)" id="s-th"><Input id="s-th" type="number" min={0} max={100} step="0.5" value={form.threshold_pct} onChange={(e) => set('threshold_pct', num(e.target.value))} /></Field>
          <Field label="Entrées dans l’aperçu de l’accueil" id="s-lb" hint="La page Meilleurs scores affiche toujours la liste complète."><Input id="s-lb" type="number" min={1} max={50} value={form.leaderboard_size} onChange={(e) => set('leaderboard_size', num(e.target.value))} /></Field>
          <Field label="Conservation des données (jours)" id="s-ret" hint="Anonymisation automatique après la fin du tournoi (§3.1)."><Input id="s-ret" type="number" min={30} max={3650} value={form.retention_days} onChange={(e) => set('retention_days', num(e.target.value))} /></Field>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.leaderboard_enabled} onChange={(e) => set('leaderboard_enabled', e.target.checked)} />
          Publier les « Meilleurs scores » (liste complète et effectif)
        </label>
        <label className="mt-4 flex items-start gap-2 text-sm">
          <input type="checkbox" checked={form.afficher_effectif_general} onChange={(e) => set('afficher_effectif_general', e.target.checked)} />
          <span>Afficher l’effectif général sur les bilans individuels<br /><span className="text-xs text-(--color-ink-muted)">Affiche « 1er sur N » si le rang est visible. Sans effet sur les rangs de manche ni sur la page publique Meilleurs scores.</span></span>
        </label>
      </section>

      <section className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)">
        <h2 className="text-base font-bold text-(--color-ink)">Séquence d’emails automatiques (§11)</h2>
        <p className="mt-1 text-xs text-(--color-ink-soft)">Chaque étape est activable individuellement. Avec des dates resserrées, désactivez le J-7 et gardez le J-1. La confirmation d’adresse et les emails de connexion sont toujours envoyés.</p>
        <div className="mt-4 space-y-2">
          {SEQUENCE_KINDS.map((k) => (
            <label key={k} className="flex items-center gap-3 rounded-(--radius-button) border border-(--color-border) px-3 py-2 text-sm">
              <input type="checkbox" checked={seq[k].enabled} onChange={(e) => setSeq((s) => ({ ...s, [k]: { ...s[k], enabled: e.target.checked } }))} />
              <span className="flex-1">{SEQUENCE_LABEL[k]}</span>
            </label>
          ))}
          <div className="flex items-center gap-3 text-sm">
            <Label htmlFor="s-delay">Délai minimum de publication après clôture (minutes)</Label>
            <Input id="s-delay" type="number" min={0} className="w-28" value={seq.results_delay_minutes ?? 0} onChange={(e) => setSeq((s) => ({ ...s, results_delay_minutes: Math.max(0, Number(e.target.value) || 0) }))} />
            <span className="text-xs text-(--color-ink-muted)">0 = à la clôture ; 1440 = J+1.</span>
          </div>
        </div>
      </section>

      {error && <p className="text-sm font-semibold text-(--color-danger)">{error}</p>}
      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={pending}>{pending ? 'Enregistrement…' : 'Enregistrer les paramètres'}</Button>
        {status === 'saved' && <span className="text-sm font-semibold text-emerald-700">Enregistré.</span>}
      </div>
    </div>
  );
}
