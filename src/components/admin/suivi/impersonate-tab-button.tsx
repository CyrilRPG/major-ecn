'use client';

import { useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { fetchAvecJetonFrais } from '@/lib/auth/fresh-token';

async function demanderTicket(studentId: string): Promise<string> {
  const res = await fetchAvecJetonFrais('/api/admin/impersonate/onglet', { user_id: studentId });
  const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !j.url) throw new Error(j.error ?? 'Impossible d’ouvrir la session de l’élève.');
  return j.url;
}

/**
 * « Se connecter en tant que » dans un NOUVEL ONGLET : la session admin de
 * cet onglet reste ouverte (cf. lib/auth/impersonation-onglet.ts).
 *
 * L'onglet est ouvert DANS le clic (sinon le bloqueur de fenêtres le refuse),
 * vide, puis dirigé vers le ticket une fois celui-ci émis. Si le navigateur
 * bloque quand même la fenêtre, un lien (valable 60 s) prend le relais : un
 * clic sur un lien `target="_blank"` n'est jamais bloqué.
 */
export function ImpersonateTabButton({ studentId }: { studentId: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lien, setLien] = useState<string | null>(null);

  const ouvrir = async () => {
    setError(null);
    setLien(null);
    const onglet = window.open('about:blank', '_blank');
    if (onglet) {
      // L'onglet élève ne doit pas pouvoir piloter celui-ci.
      onglet.opener = null;
    }
    setPending(true);
    try {
      const url = await demanderTicket(studentId);
      if (onglet) onglet.location.replace(url);
      else {
        setLien(url);
        // Le ticket expire au bout de 60 s : le lien disparaît avec lui.
        window.setTimeout(() => setLien((l) => (l === url ? null : l)), 55_000);
      }
    } catch (e) {
      onglet?.close();
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  };

  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        onClick={ouvrir}
        disabled={pending}
        aria-describedby={`impersonate-aide-${studentId}`}
        className="inline-flex h-9 items-center gap-1.5 rounded-(--radius-button) border border-(--color-border) px-3 text-sm text-(--color-ink-soft) hover:text-(--color-ink) disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
        Se connecter en tant que
      </button>
      <span id={`impersonate-aide-${studentId}`} className="sr-only">
        Ouvre l’espace de l’élève dans un nouvel onglet ; votre session admin reste ouverte ici.
      </span>
      {lien && (
        <a
          href={lien}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setLien(null)}
          className="mt-1 inline-flex max-w-64 items-center gap-1 text-xs font-semibold text-(--color-primary) hover:underline"
        >
          Fenêtre bloquée : ouvrir la session élève <ExternalLink className="h-3 w-3" />
        </a>
      )}
      {error && <span role="alert" className="mt-1 max-w-64 text-xs text-(--color-danger)">{error}</span>}
    </span>
  );
}
