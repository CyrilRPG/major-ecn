'use client';

/**
 * Consultation des feuilles d'émargement d'un élève depuis la liste élèves.
 *
 * Affiche, par cours : la date de déclenchement (« vu le »), la date de
 * signature et la signature manuscrite elle-même. Les émargements dus mais non
 * signés sont mis en évidence — c'est ce qui manque à un dossier de formation.
 */
import { useCallback, useState } from 'react';
import { Download, FileSignature, Loader2, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Row = {
  cours_id: string;
  cours_titre: string | null;
  matiere_id: string | null;
  required_at: string;
  signed_at: string | null;
  signature_png: string | null;
  watched_ratio: number | null;
};

type Payload = { total: number; signed: number; pending: number; rows: Row[] };

function fmt(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

export function EmargementsDialog({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/emargements/${studentId}`);
      const json = (await res.json()) as Payload & { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Chargement impossible');
      setData(json);
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
        title="Voir les feuilles d'émargement de cet élève"
        onClick={() => { setOpen(true); if (!data && !loading) void load(); }}
      >
        <FileSignature className="h-3.5 w-3.5" />
        <span className="hidden lg:inline">Émargements</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Feuilles d’émargement — {studentName}</DialogTitle>
            <DialogDescription>
              {data
                ? `${data.total} cours commencé${data.total > 1 ? 's' : ''} · ${data.signed} signé${data.signed > 1 ? 's' : ''}${data.pending > 0 ? ` · ${data.pending} en attente` : ''}`
                : 'Chargement…'}
            </DialogDescription>
          </DialogHeader>

          {loading && (
            <p className="flex items-center gap-2 py-6 text-sm text-(--color-ink-soft)">
              <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
            </p>
          )}
          {error && <p className="py-4 text-sm font-semibold text-(--color-danger)">{error}</p>}

          {data && data.rows.length === 0 && (
            <p className="py-6 text-sm text-(--color-ink-soft)">
              Aucun émargement : cet élève n’a encore commencé aucun cours vidéo.
            </p>
          )}

          {data && data.rows.length > 0 && (
            <>
              <div className="space-y-2.5">
                {data.rows.map((r) => (
                  <div
                    key={r.cours_id}
                    className="rounded-xl border p-3"
                    style={{ borderColor: r.signed_at ? 'var(--color-border)' : '#F5C86B' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-bold text-(--color-ink)">
                          {r.cours_titre ?? r.cours_id}
                        </p>
                        <p className="mt-0.5 text-[12px] text-(--color-ink-soft)">
                          Vu le {fmt(r.required_at)}
                          {r.watched_ratio != null && ` · ${Math.round(r.watched_ratio * 100)} % de la vidéo`}
                        </p>
                        <p className="text-[12px] text-(--color-ink-soft)">
                          {r.signed_at
                            ? <>Signé le <strong>{fmt(r.signed_at)}</strong></>
                            : (
                              <span className="inline-flex items-center gap-1 font-bold" style={{ color: '#B26A00' }}>
                                <TriangleAlert className="h-3.5 w-3.5" /> Non signé
                              </span>
                            )}
                        </p>
                      </div>
                      {r.signature_png && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.signature_png}
                          alt={`Signature — ${r.cours_titre ?? r.cours_id}`}
                          className="h-16 w-32 shrink-0 rounded-lg border bg-white object-contain"
                          style={{ borderColor: 'var(--color-border)' }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <a
                href={`/api/admin/emargements/${studentId}?format=csv`}
                className="mt-2 inline-flex items-center gap-1.5 self-start rounded-lg border border-(--color-border) px-3 py-2 text-xs font-bold text-(--color-ink-soft) hover:text-(--color-ink)"
              >
                <Download className="h-3.5 w-3.5" /> Exporter en CSV
              </a>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
