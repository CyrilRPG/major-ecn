'use client';

import { PhoneCall, AlertTriangle, Mail } from 'lucide-react';

export type ContactCandidate = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  motif: string;
  priority: number;
  created_at: string;
};

/**
 * « Candidats à contacter » (cahier des charges section 13) : les élèves avec
 * une alerte Priorité 1 non résolue. La résolution se fait depuis la page
 * Alertes pédagogiques.
 */
export function CrmContacter({ candidates }: { candidates: ContactCandidate[] }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
      <div className="rounded-2xl border border-[#F3B5BC] bg-[#FCEAEC]/50 px-5 py-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-[#A91D2C]">
          <PhoneCall className="h-4.5 w-4.5" /> Candidats à contacter
        </h2>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          Élèves avec une alerte <strong>Priorité 1</strong> non résolue — une prise de contact
          pédagogique est recommandée. Marquez l&apos;alerte comme résolue depuis la page
          « Alertes pédagogiques » une fois le contact effectué.
        </p>
      </div>

      {candidates.length === 0 ? (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <PhoneCall className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">Aucun candidat à contacter</p>
          <p className="mt-1 text-xs text-gray-400">Aucune alerte Priorité 1 en attente.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {candidates.map((c) => (
            <li
              key={`${c.id}-${c.created_at}`}
              className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              style={{ borderLeftWidth: 4, borderLeftColor: '#A91D2C' }}
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900">
                  {c.first_name} {c.last_name}
                </p>
                <p className="truncate text-xs text-gray-500">{c.email ?? '—'}{c.phone ? ` · ${c.phone}` : ''}</p>
                <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-[#FEE2E2] px-2.5 py-1 text-xs font-bold text-[#DC2626]">
                  <AlertTriangle className="h-3 w-3" /> {c.motif}
                </p>
                <p className="mt-1 text-[11px] text-gray-400">
                  Alerte du {new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {' · '}Action recommandée : prise de contact pédagogique.
                </p>
              </div>
              {c.email && (
                <a
                  href={`mailto:${c.email}`}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(90deg, #E4002B, #F97316)' }}
                >
                  <Mail className="h-3.5 w-3.5" /> Contacter
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
