'use client';

/**
 * Consultation de la signature manuscrite d'inscription d'un élève.
 *
 * La signature est la pièce qui accompagne les consentements cochés au
 * paiement : on affiche donc, à côté du tracé, le contexte figé au moment où
 * il a été apposé (formule, spécialité, voie, date, session Stripe) et la
 * clause de renonciation exactement telle qu'elle était présentée.
 *
 * L'image vit dans un bucket privé : elle est servie par une URL signée
 * valable une heure, jamais par un lien public.
 */
import { useCallback, useState } from 'react';
import { Download, Loader2, PenLine } from 'lucide-react';
import { fetchAuthentifie } from '@/lib/auth/fresh-token';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Manifest = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  formule: string;
  specialty?: string | null;
  voie?: string | null;
  installments?: number;
  signedAt: string;
  sessionId?: string | null;
  clause?: string;
};

type Signature = {
  id: string;
  path: string;
  signedAt: string | null;
  url: string | null;
  manifest: Manifest | null;
};

function fmt(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

export function SignatureInscriptionDialog({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Signature[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAuthentifie(`/api/admin/signature-inscription/${studentId}`);
      const json = (await res.json()) as { signatures?: Signature[]; error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Chargement impossible');
      setRows(json.signatures ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chargement impossible');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1 px-2 text-xs font-bold"
        title="Voir la signature manuscrite d'inscription"
        onClick={() => { setOpen(true); if (!rows && !loading) void load(); }}
      >
        <PenLine className="h-3.5 w-3.5" />
        <span className="hidden lg:inline">Signature</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Signature d&rsquo;inscription — {studentName}</DialogTitle>
            <DialogDescription>
              Tracé manuscrit apposé au moment de la souscription, avec les conditions acceptées.
            </DialogDescription>
          </DialogHeader>

          {loading && (
            <p className="flex items-center gap-2 py-6 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
            </p>
          )}

          {error && <p className="py-4 text-sm font-semibold text-red-600">{error}</p>}

          {!loading && !error && rows?.length === 0 && (
            <p className="py-6 text-sm text-slate-500">
              Aucune signature enregistrée pour cet élève. Les signatures sont recueillies
              depuis le 4 septembre 2026 : les inscriptions antérieures n&rsquo;en ont pas.
            </p>
          )}

          {rows?.map((s) => (
            <div key={s.id} className="rounded-xl border border-slate-200 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-slate-900">Signé le {fmt(s.signedAt)}</p>
                {s.url && (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <Download className="h-3.5 w-3.5" /> Ouvrir l&rsquo;image
                  </a>
                )}
              </div>

              {s.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.url}
                  alt={`Signature de ${studentName}`}
                  className="w-full rounded-lg border border-slate-200 bg-white"
                />
              ) : (
                <p className="text-sm text-slate-500">Image indisponible.</p>
              )}

              {s.manifest && (
                <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-[12.5px] sm:grid-cols-2">
                  <Line label="Nom déclaré" value={`${s.manifest.firstName} ${s.manifest.lastName}`.trim()} />
                  <Line label="Email" value={s.manifest.email} />
                  <Line label="Formule" value={s.manifest.formule} />
                  <Line label="Spécialité" value={s.manifest.specialty ?? '—'} />
                  <Line label="Voie" value={s.manifest.voie ?? '—'} />
                  <Line
                    label="Paiement"
                    value={s.manifest.installments && s.manifest.installments > 1
                      ? `${s.manifest.installments} mensualités`
                      : 'Comptant'}
                  />
                  <Line label="Session Stripe" value={s.manifest.sessionId ?? '—'} />
                </dl>
              )}

              {s.manifest?.clause && (
                <p className="mt-3 rounded-lg bg-slate-50 p-3 text-[12px] leading-relaxed text-slate-600">
                  <span className="font-bold text-slate-800">Clause acceptée : </span>
                  {s.manifest.clause}
                </p>
              )}
            </div>
          ))}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1.5">
      <dt className="shrink-0 font-semibold text-slate-500">{label} :</dt>
      <dd className="min-w-0 break-all text-slate-800">{value}</dd>
    </div>
  );
}
