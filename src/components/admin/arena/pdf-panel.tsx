'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, FileCheck2, FileText, Sparkles, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchAuthentifie } from '@/lib/auth/fresh-token';
import { createClient } from '@/lib/supabase/client';
import { attachCorrectionsPdf, prepareCorrectionsUpload, removeCorrectionsPdf } from '@/app/admin/arena/pdf-actions';
import { BILLING_EUR } from '@/lib/ai/cost';
import type { RoundRow } from '@/lib/arena/types';
import { ADMIN_ARENA, ArenaCard, SectionLabel, StatusPill } from './admin-ui';

/**
 * Étape « Corrigés » : pour chaque manche, un corrigé PDF déposé par Major
 * ECN ou rédigé par IA (1 €) à partir des corrigés de la base (aucune
 * correction inventée), rendu en pages pour la visionneuse des participants
 * (filigrane nominatif brûlé, ni fichier ni lien). Aperçu des pages ici,
 * avec le filigrane du personnel.
 */
export function PdfPanel({ rounds, questionCounts = {} }: { rounds: RoundRow[]; questionCounts?: Record<string, number> }) {
  const router = useRouter();
  const [busy, setBusy] = useState<{ id: string; label: string } | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmAi, setConfirmAi] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const call = async (r: RoundRow, mode: 'ai' | 'layout' | 'pages', label: string) => {
    setBusy({ id: r.id, label }); setError(null); setMsg(null); setConfirmAi(null);
    try {
      const res = await fetchAuthentifie(`/api/admin/arena/rounds/${r.id}/pdf`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ mode }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) setError(j.error ?? 'Génération impossible.');
      else setMsg(mode === 'ai' ? `Corrigé de la manche ${r.number} rédigé par IA : ${j.pages} page(s), ${BILLING_EUR.arena_corrections.toFixed(2)} € facturé.` : mode === 'layout' ? `Corrigé de la manche ${r.number} mis en page : ${j.pages} page(s).` : `Corrigé de la manche ${r.number} rendu en ${j.pages} page(s).`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setBusy(null);
    }
  };

  const upload = async (r: RoundRow, file: File) => {
    if (file.type !== 'application/pdf') { setError('Fichier PDF attendu.'); return; }
    if (file.size > 20 * 1024 * 1024) { setError('20 Mo maximum.'); return; }
    setBusy({ id: r.id, label: 'Envoi du PDF…' }); setError(null); setMsg(null);
    try {
      const prep = await prepareCorrectionsUpload(r.id);
      if (!prep.ok) { setError(prep.error); return; }
      const { error: upErr } = await createClient().storage.from('arena').uploadToSignedUrl(prep.path, prep.token, file, { contentType: 'application/pdf' });
      if (upErr) { setError(upErr.message); return; }
      const att = await attachCorrectionsPdf(r.id, prep.path);
      if (!att.ok) { setError(att.error); return; }
      setBusy({ id: r.id, label: 'Rendu des pages…' });
      const res = await fetchAuthentifie(`/api/admin/arena/rounds/${r.id}/pdf`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ mode: 'pages' }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) setError(j.error ?? 'Le PDF est attaché mais ses pages n’ont pas pu être rendues. Relancez le rendu.');
      else setMsg(`Corrigé fourni rattaché à la manche ${r.number} : ${j.pages} page(s) prêtes pour les participants.`);
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const open = async (r: RoundRow) => {
    const res = await fetchAuthentifie(`/api/admin/arena/rounds/${r.id}/pdf`);
    if (!res.ok) { setError('Ouverture impossible.'); return; }
    const blob = await res.blob();
    window.open(URL.createObjectURL(blob), '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface-soft) px-5 py-4 text-sm text-(--color-ink-soft)">
        <p><b className="text-(--color-ink)">Un corrigé par manche.</b> Déposez le PDF de Major ECN, ou demandez la rédaction par IA au gabarit EVC Arena (page de garde, propositions exactes / inexactes, réponse attendue, explication, points clés, piège) — uniquement à partir des corrigés déjà présents dans la base : <b className="text-(--color-ink)">aucune correction n’est inventée</b>, une question sans justification est signalée comme telle. Facturation IA : {BILLING_EUR.arena_corrections.toFixed(2)} € par document.</p>
        <p className="mt-2">Les participants consultent le corrigé page par page dans la visionneuse de leur espace, après clôture et publication des résultats : filigrane nominatif brûlé dans l’image, ni téléchargement, ni lien, ni pièce jointe. Le PDF lui-même reste réservé au personnel.</p>
      </div>

      {error && <p className="rounded-(--radius-button) border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-(--color-danger)">{error}</p>}
      {msg && <p className="rounded-(--radius-button) border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{msg}</p>}

      {rounds.map((r) => {
        const count = questionCounts[r.id] ?? null;
        const has = Boolean(r.corrections_pdf_path);
        const source = r.corrections_pdf_source === 'uploaded' ? 'Corrigé fourni par Major ECN' : r.corrections_pdf_source === 'ai' ? 'Corrigé rédigé par IA' : r.corrections_pdf_source === 'generated' ? 'Mise en page depuis la base' : null;
        const busyHere = busy?.id === r.id;
        const ready = has && r.corrections_pages > 0;
        return (
          <ArenaCard
            key={r.id}
            number={`M${r.number}`}
            title={<>Manche {r.number}{r.theme ? <span className="text-(--color-ink-soft)"> · {r.theme}</span> : null}</>}
            description={
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <StatusPill tone={ready ? 'ok' : has ? 'amber' : 'muted'}>{ready ? 'Corrigé prêt' : has ? 'Pages à rendre' : 'Aucun corrigé'}</StatusPill>
                {source && <span>{source}{r.corrections_pdf_generated_at ? ` · ${new Date(r.corrections_pdf_generated_at).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}` : ''}</span>}
                {ready && <span>· {r.corrections_pages} page{r.corrections_pages > 1 ? 's' : ''}</span>}
                {count !== null && <span>· {count} question{count > 1 ? 's' : ''} active{count > 1 ? 's' : ''}</span>}
              </span>
            }
            aside={busyHere ? <span className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: ADMIN_ARENA.goldDeep }}><span className="h-2 w-2 animate-pulse rounded-full" style={{ background: ADMIN_ARENA.gold }} />{busy?.label}</span> : undefined}
          >
            <SectionLabel hint={count === 0 ? 'ajoutez d’abord les questions' : undefined}>Obtenir le corrigé</SectionLabel>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-(--color-ink)"><Upload className="h-4 w-4" style={{ color: ADMIN_ARENA.goldDeep }} /> Déposer le corrigé PDF de Major ECN</p>
                <p className="mt-1 text-xs text-(--color-ink-soft)">PDF jusqu’à 20 Mo, envoyé directement dans le stockage privé puis rendu en pages pour la visionneuse.</p>
                <label className={`mt-3 inline-flex cursor-pointer items-center rounded-(--radius-button) border border-(--color-border) px-3 py-1.5 text-sm font-semibold hover:bg-(--color-surface-soft) ${busyHere ? 'pointer-events-none opacity-50' : ''}`}>
                  <Upload className="mr-1.5 h-4 w-4" /> {has ? 'Remplacer par un PDF fourni' : 'Téléverser un PDF'}
                  <input type="file" accept="application/pdf" className="sr-only" disabled={busyHere} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(r, f); e.target.value = ''; }} />
                </label>
              </div>
              <div className="rounded-(--radius-button) border p-4" style={{ borderColor: 'rgba(212,169,74,0.55)', background: 'linear-gradient(180deg, #FBF7EC, #FFFFFF)' }}>
                <p className="flex items-center gap-2 text-sm font-bold text-(--color-ink)"><Sparkles className="h-4 w-4" style={{ color: ADMIN_ARENA.goldDeep }} /> Rédiger le corrigé par IA — {BILLING_EUR.arena_corrections.toFixed(2)} €</p>
                <p className="mt-1 text-xs text-(--color-ink-soft)">Gabarit EVC Arena (page de garde, logos, DA). Textes tirés exclusivement des corrigés de la base pour cette manche : justifications, explications, pièges, références.</p>
                {confirmAi === r.id ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-(--color-ink)">Confirmer la rédaction ({BILLING_EUR.arena_corrections.toFixed(2)} € de facturation IA) ?</span>
                    <Button size="sm" disabled={busyHere} onClick={() => call(r, 'ai', 'Rédaction du corrigé par IA…')}>Confirmer</Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmAi(null)}>Annuler</Button>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" disabled={busyHere || count === 0} onClick={() => setConfirmAi(r.id)}><Sparkles className="mr-1.5 h-4 w-4" /> {has ? 'Régénérer par IA' : 'Générer par IA'}</Button>
                    <Button size="sm" variant="ghost" disabled={busyHere || count === 0} title="Même gabarit, sans rédaction : les textes de la base tels quels, gratuit." onClick={() => call(r, 'layout', 'Mise en page du corrigé…')}><FileText className="mr-1.5 h-4 w-4" /> Mise en page sans IA</Button>
                  </div>
                )}
              </div>
            </div>

            {has && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-(--color-border) pt-4">
                <Button size="sm" variant="outline" disabled={!ready} onClick={() => setPreview(preview === r.id ? null : r.id)}>
                  {preview === r.id ? <EyeOff className="mr-1.5 h-4 w-4" /> : <Eye className="mr-1.5 h-4 w-4" />} {preview === r.id ? 'Masquer l’aperçu' : 'Aperçu comme un participant'}
                </Button>
                {!ready && <Button size="sm" variant="outline" disabled={busyHere} onClick={() => call(r, 'pages', 'Rendu des pages…')}><FileCheck2 className="mr-1.5 h-4 w-4" /> Rendre les pages</Button>}
                <Button size="sm" variant="ghost" onClick={() => open(r)} title="Ouvrir le PDF (usage interne)"><FileText className="mr-1.5 h-4 w-4" /> PDF (interne)</Button>
                <Button size="sm" variant="ghost" disabled={pending || busyHere} onClick={() => { if (confirm(`Retirer le corrigé de la manche ${r.number} ?`)) start(async () => { const x = await removeCorrectionsPdf(r.id); if (!x.ok) setError(x.error); router.refresh(); }); }}><Trash2 className="mr-1.5 h-4 w-4" /> Retirer</Button>
              </div>
            )}

            {preview === r.id && ready && (
              <div className="mt-4 max-h-[70vh] space-y-3 overflow-auto rounded-(--radius-button) border border-(--color-border) bg-(--color-surface-sunken) p-3">
                <p className="text-xs text-(--color-ink-muted)">Aperçu avec le filigrane du personnel. Le participant voit les mêmes pages avec son nom et l’identifiant de son compte.</p>
                {Array.from({ length: r.corrections_pages }, (_, i) => i + 1).map((k) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={`${r.id}-${k}-${r.corrections_pdf_generated_at ?? ''}`} src={`/api/arena/corrections/${r.id}/${k}?v=${encodeURIComponent(r.corrections_pdf_generated_at ?? '')}`} alt={`Page ${k}`} loading="lazy" className="w-full rounded-md border border-(--color-border) bg-white" />
                ))}
              </div>
            )}
          </ArenaCard>
        );
      })}
    </div>
  );
}
