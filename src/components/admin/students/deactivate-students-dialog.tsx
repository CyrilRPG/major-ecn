'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { fetchAvecJetonFrais } from '@/lib/auth/fresh-token';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Emails valides et dédoublonnés d'un texte séparé par des virgules (les
 *  points-virgules, espaces et retours à la ligne sont aussi tolérés). */
function parseEmails(text: string): string[] {
  return Array.from(
    new Set(text.split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter((e) => EMAIL_RE.test(e))),
  );
}

export function DeactivateStudentsDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [emailsText, setEmailsText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const detected = parseEmails(emailsText).length;

  const reset = () => { setEmailsText(''); setError(null); setResult(null); };

  const submit = () => {
    setError(null); setResult(null);
    const valid = parseEmails(emailsText);
    if (valid.length === 0) { setError('Ajoutez au moins un email valide (séparés par des virgules).'); return; }
    start(async () => {
      const res = await fetchAvecJetonFrais('/api/admin/deactivate-students-bulk', { emails: valid });
      const j = (await res.json().catch(() => ({}))) as {
        error?: string;
        summary?: { total: number; deactivated: number; notFound: number; skippedSelf: number; skippedNonStudent: number; failed: number };
      };
      if (!res.ok) { setError(j.error ?? 'Erreur lors de la désactivation.'); return; }
      const s = j.summary;
      setResult(
        s ? `${s.deactivated} compte${s.deactivated > 1 ? 's' : ''} désactivé${s.deactivated > 1 ? 's' : ''}`
          + (s.notFound ? ` · ${s.notFound} introuvable${s.notFound > 1 ? 's' : ''}` : '')
          + (s.skippedNonStudent ? ` · ${s.skippedNonStudent} non-élève ignoré${s.skippedNonStudent > 1 ? 's' : ''}` : '')
          + (s.skippedSelf ? ' · votre compte ignoré' : '')
          + (s.failed ? ` · ${s.failed} échec${s.failed > 1 ? 's' : ''}` : '')
          : 'Désactivation traitée.',
      );
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="md" className="border-(--color-danger)/40 text-(--color-danger) hover:bg-red-50">
          <PowerOff className="h-4 w-4" />
          Désactiver des élèves
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PowerOff className="h-5 w-5 text-(--color-danger)" />
            Désactiver des élèves en masse
          </DialogTitle>
          <DialogDescription>
            Collez les emails des élèves à désactiver. Les comptes ne sont pas supprimés&nbsp;: ils
            perdent tout accès à la plateforme et sont déconnectés. Vous pourrez les réactiver plus tard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="deactivate-emails">Emails des élèves à désactiver</Label>
          <Textarea
            id="deactivate-emails"
            value={emailsText}
            onChange={(e) => setEmailsText(e.target.value)}
            rows={7}
            placeholder="eleve1@exemple.fr, eleve2@exemple.fr, eleve3@exemple.fr, …"
            className="min-h-[150px] bg-(--color-surface-soft) font-mono text-sm"
          />
          <p className="text-xs text-(--color-ink-muted)">
            Séparez les emails par une virgule. Seuls les comptes élèves sont concernés.
            {detected > 0 && (
              <span className="font-semibold text-(--color-ink-soft)"> {detected} email{detected > 1 ? 's' : ''} détecté{detected > 1 ? 's' : ''}.</span>
            )}
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-(--color-danger)/30 bg-red-50 px-3 py-2 text-sm text-(--color-danger)">{error}</p>
        )}
        {result && (
          <p className="rounded-lg border border-(--color-border) bg-(--color-surface-soft) px-3 py-2 text-sm font-semibold text-(--color-ink)">{result}</p>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => { setOpen(false); reset(); }} disabled={pending}>Fermer</Button>
          <Button
            type="button"
            onClick={submit}
            disabled={pending || detected === 0}
            className="bg-(--color-danger) text-white hover:bg-(--color-danger)/90"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PowerOff className="h-4 w-4" />}
            Désactiver {detected > 0 ? `(${detected})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
