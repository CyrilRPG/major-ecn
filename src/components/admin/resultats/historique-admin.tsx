'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FileSpreadsheet, FileText, Loader2, PencilLine, Sheet } from 'lucide-react';
import { HistoriqueEvaluations } from '@/components/evaluations/historique-evaluations';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { corrigerEvaluationAction } from '@/app/admin/resultats/actions';
import { formatJour, formatNote, type Evaluation } from '@/lib/evaluations/historique-core';

/** Liens d'export (mêmes filtres que l'écran) : PDF, Excel, CSV. */
export function BoutonsExport({ query }: { query: string }) {
  const base = `/api/admin/resultats/export?${query}${query ? '&' : ''}format=`;
  const cls = 'inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 text-[13px] font-semibold text-(--color-ink) transition-colors hover:border-(--color-accent) hover:text-(--color-accent)';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <a href={`${base}pdf`} className={cls}><FileText className="h-4 w-4" aria-hidden /> PDF</a>
      <a href={`${base}xlsx`} className={cls}><FileSpreadsheet className="h-4 w-4" aria-hidden /> Excel</a>
      <a href={`${base}csv`} className={cls}><Sheet className="h-4 w-4" aria-hidden /> CSV</a>
    </div>
  );
}

/** Une note se corrige si elle est définitive et que la tentative est en place (pas une archive). */
function corrigeable(e: Evaluation): boolean {
  return !e.archive && e.statut === 'termine' && e.score !== null && (e.source !== 'checkup' || e.etat === 'completed' || e.etat === 'expired') && (e.source !== 'epreuve' || e.etat === 'graded');
}

function DialogueCorrection({ e, onClose }: { e: Evaluation; onClose: () => void }) {
  const router = useRouter();
  const [score, setScore] = useState(String(e.score ?? ''));
  const [max, setMax] = useState(String(e.scoreMax ?? ''));
  const [motif, setMotif] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const maxFixe = e.source === 'parcours_major';

  const valider = () => {
    setErreur(null);
    const s = Number(score.replace(',', '.'));
    const m = max.trim() === '' ? null : Number(max.replace(',', '.'));
    if (!Number.isFinite(s) || s < 0) { setErreur('Note invalide.'); return; }
    if (m !== null && (!Number.isFinite(m) || m <= 0)) { setErreur('Maximum invalide.'); return; }
    start(async () => {
      const r = await corrigerEvaluationAction({ source: e.source, id: e.sourceId, userId: e.userId, score: s, scoreMax: maxFixe ? null : m, motif });
      if (!r.ok) { setErreur(r.error); return; }
      onClose();
      router.refresh();
    });
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Corriger la note</DialogTitle>
          <DialogDescription>
            {e.intitule} · {formatJour(e.date)} · note actuelle : {formatNote(e) ?? '—'}. L’ancienne valeur, la nouvelle, la date, votre nom et le motif seront conservés dans le journal de traçabilité.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="corr-score">Nouvelle note</Label>
              <Input id="corr-score" inputMode="decimal" value={score} onChange={(ev) => setScore(ev.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="corr-max">Sur</Label>
              <Input id="corr-max" inputMode="decimal" value={maxFixe ? '10' : max} disabled={maxFixe} onChange={(ev) => setMax(ev.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="corr-motif">Motif (obligatoire)</Label>
            <Textarea id="corr-motif" rows={3} value={motif} onChange={(ev) => setMotif(ev.target.value)} placeholder="Ex. : erreur de barème sur la question 12, corrigé erroné signalé par l’enseignant…" />
          </div>
          {erreur && <p className="text-sm text-(--color-danger)" role="alert">{erreur}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>Annuler</Button>
          <Button onClick={valider} disabled={pending || motif.trim().length < 5}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Enregistrer la correction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Historique d'un candidat vu par l'équipe : correction des notes réservée aux administrateurs. */
export function HistoriqueAdmin({ evaluations, matieres, peutCorriger, query }: { evaluations: Evaluation[]; matieres: Record<string, string>; peutCorriger: boolean; query: string }) {
  const [enCours, setEnCours] = useState<Evaluation | null>(null);
  return (
    <>
      <HistoriqueEvaluations
        evaluations={evaluations}
        mode="admin"
        matieres={matieres}
        entete={({ types, entrainement }) => (
          <BoutonsExport query={[query, types.length > 0 ? `type=${types.join(',')}` : entrainement ? 'entrainement=1' : ''].filter(Boolean).join('&')} />
        )}
        actions={peutCorriger ? (e) => (corrigeable(e) ? (
          <Button variant="outline" size="sm" onClick={() => setEnCours(e)}><PencilLine className="h-4 w-4" aria-hidden /> Corriger la note</Button>
        ) : null) : undefined}
      />
      {enCours && <DialogueCorrection e={enCours} onClose={() => setEnCours(null)} />}
    </>
  );
}
