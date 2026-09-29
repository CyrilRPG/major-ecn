'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CircleSlash, CreditCard, Loader2, Power, PowerOff, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { fetchAvecJetonFrais } from '@/lib/auth/fresh-token';
import { MOTIF_LABELS, parseMotif, type MotifDesactivation } from '@/lib/admin/compte-actif-pure';

export function ToggleActiveButton({
  userId,
  displayName,
  isActive,
  withMotif = false,
  motif = null,
  note = null,
  deactivatedAt = null,
}: {
  userId: string;
  displayName: string;
  isActive: boolean;
  /** Choix du motif (paiement / autre) — liste des élèves. */
  withMotif?: boolean;
  motif?: string | null;
  note?: string | null;
  deactivatedAt?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [choix, setChoix] = useState<MotifDesactivation | null>(parseMotif(motif));
  const [precision, setPrecision] = useState(note ?? '');

  const next = !isActive;
  const motifInchange = choix === parseMotif(motif) && precision.trim() === (note ?? '').trim();

  const reinit = () => { setError(null); setChoix(parseMotif(motif)); setPrecision(note ?? ''); };

  const envoyer = (payload: Record<string, unknown>) => {
    setError(null);
    start(async () => {
      const res = await fetchAvecJetonFrais('/api/admin/toggle-active', { userId, ...payload });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? 'Échec de la mise à jour.');
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  const onConfirm = () => {
    if (next) return envoyer({ isActive: true });
    if (withMotif && !choix) { setError('Choisissez le motif de la désactivation.'); return; }
    envoyer({ isActive: false, motif: choix, note: precision });
  };

  const depuis = deactivatedAt
    ? new Date(deactivatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) reinit(); }}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title={isActive ? 'Désactiver le compte' : 'Compte désactivé — motif / réactivation'}
          aria-label={isActive ? 'Désactiver le compte' : 'Compte désactivé — motif / réactivation'}
        >
          {isActive
            ? <Power className="h-4 w-4 text-(--color-success)" />
            : <PowerOff className="h-4 w-4 text-(--color-danger)" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {next ? 'Compte désactivé' : 'Désactiver le compte'}
          </DialogTitle>
          <DialogDescription>
            {next ? (
              <span>
                <span className="font-semibold text-(--color-ink)">{displayName}</span>{' '}n&rsquo;a plus accès à rien
                {depuis ? <> depuis le {depuis}</> : null}. La réactivation rend l&rsquo;accès tel qu&rsquo;il était,
                avec le mot de passe d&rsquo;origine.
              </span>
            ) : (
              <span>
                <span className="font-semibold text-(--color-ink)">{displayName}</span>{' '}perd immédiatement tout
                accès (site, application, contenus téléchargés) et ne peut plus se connecter. Aucune donnée
                n&rsquo;est supprimée : vous pourrez réactiver le compte plus tard.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {withMotif && (
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-sm font-medium text-(--color-ink)">Motif</p>
              <MotifChoix value={choix} onChange={setChoix} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`note-${userId}`}>Précision (facultatif)</Label>
              <Textarea
                id={`note-${userId}`}
                rows={2}
                maxLength={500}
                value={precision}
                onChange={(e) => setPrecision(e.target.value)}
                placeholder={choix === 'paiement' ? 'Ex. : 2e échéance impayée' : 'Ex. : demande de l’élève'}
              />
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-(--color-danger)/30 bg-red-50 px-3 py-2 text-sm text-(--color-danger)">{error}</p>
        )}

        <DialogFooter className="flex-wrap gap-2">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
            Annuler
          </Button>
          {next && withMotif && (
            <Button
              type="button"
              variant="outline"
              onClick={() => envoyer({ motifSeul: true, motif: choix, note: precision })}
              disabled={pending || motifInchange}
            >
              <Save className="h-4 w-4" />
              Enregistrer le motif
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
            disabled={pending}
            className={next ? '' : 'bg-(--color-danger) hover:bg-(--color-danger)/90'}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : next ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
            {next ? 'Réactiver' : 'Désactiver'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Choix du motif de désactivation (fiche élève et désactivation en masse). */
export function MotifChoix({
  value, onChange,
}: { value: MotifDesactivation | null; onChange: (m: MotifDesactivation) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Motif de la désactivation">
      <MotifOption
        actif={value === 'paiement'}
        onClick={() => onChange('paiement')}
        icone={<CreditCard className="h-4 w-4" />}
        label={MOTIF_LABELS.paiement}
      />
      <MotifOption
        actif={value === 'autre'}
        onClick={() => onChange('autre')}
        icone={<CircleSlash className="h-4 w-4" />}
        label={MOTIF_LABELS.autre}
      />
    </div>
  );
}

function MotifOption({
  actif, onClick, icone, label,
}: { actif: boolean; onClick: () => void; icone: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={actif}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
        actif
          ? 'border-(--color-danger) bg-red-50 text-(--color-danger)'
          : 'border-(--color-border) bg-(--color-surface) text-(--color-ink) hover:bg-(--color-sand-100)'
      }`}
    >
      {icone}
      {label}
    </button>
  );
}
