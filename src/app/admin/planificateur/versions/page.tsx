import Link from 'next/link';
import { listColleges, listMatrixVersions, listVersionItems } from '@/lib/plan/db';
import { MATRIX_VERSION_STATUS_LABEL, type MatrixVersion } from '@/lib/plan/types';
import { MATRIX_CHANGE_LABEL, type MatrixChange } from '@/lib/plan/versions';
import { fmtDateTime, fmtDayKeyMedium } from '@/lib/suivi/format';
import { Badge } from '@/components/ui/badge';
import { SectionCard } from '@/components/admin/suivi/ui';
import { VersionActions } from '@/components/admin/plan/version-actions';

// Activer une version recalcule le planning futur des élèves de la spécialité.
export const maxDuration = 60;

const STATUS_VARIANT: Record<MatrixVersion['status'], 'success' | 'warning' | 'muted' | 'outline'> = {
  active: 'success', programmee: 'warning', archivee: 'muted', annulee: 'outline',
};
const CHANGE_ORDER: MatrixChange[] = ['ajoute', 'active', 'modifie', 'a_venir', 'retire', 'inchange'];

/**
 * Versions de la matrice (MIPIC_2026_V1, V2…) : date d'activation, bilan des
 * changements, instantané de chaque version. Une version appliquée n'est
 * jamais réécrite : on publie la suivante (onglet Matrice pédagogique).
 */
export default async function PlanVersionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const open = typeof sp.version === 'string' ? sp.version : null;
  const [versions, colleges] = await Promise.all([listMatrixVersions(), listColleges()]);
  const nameOf = new Map(colleges.map((c) => [c.id, c.nom]));
  const opened = open ? versions.find((v) => v.id === open) ?? null : null;
  const snapshot = opened ? await listVersionItems(opened.id) : [];
  const bySpecialty = new Map<string, MatrixVersion[]>();
  for (const v of versions) bySpecialty.set(v.specialite_id, [...(bySpecialty.get(v.specialite_id) ?? []), v]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">Versions de la matrice</h1>
        <p className="mt-1 max-w-3xl text-sm text-(--color-ink-soft)">
          Une nouvelle matrice modifie le futur, jamais le passé : à son activation, seuls les items ACTIVE dont le cours a un contenu entrent au planning,
          un item absent est retiré (jamais supprimé), et seul le planning futur des élèves est recalculé — activités réalisées, résultats, temps passé,
          niveau observé et réactivations sont conservés. Publier une version : onglet <Link href="/admin/planificateur/items" className="text-(--color-primary) underline-offset-4 hover:underline">Matrice pédagogique</Link>, import du classeur.
        </p>
      </header>
      {versions.length === 0 && <p className="text-sm text-(--color-ink-soft)">Aucune version publiée.</p>}
      <div className="space-y-6">
        {Array.from(bySpecialty.entries()).map(([spe, list]) => (
          <SectionCard key={spe} title={nameOf.get(spe) ?? spe} description={`${list.length} version(s)`}>
            <ul className="divide-y divide-(--color-border) text-sm">
              {list.map((v) => {
                const s = v.summary as Partial<Record<MatrixChange | 'items_active' | 'items_coming_soon' | 'issues', number>>;
                return (
                  <li key={v.id} className="flex flex-wrap items-center gap-3 py-2.5">
                    <Link href={`/admin/planificateur/versions?version=${v.id}`} className="font-medium text-(--color-ink) underline-offset-4 hover:underline">{v.code}</Link>
                    <Badge variant={STATUS_VARIANT[v.status]}>{MATRIX_VERSION_STATUS_LABEL[v.status]}</Badge>
                    <span className="text-(--color-ink-soft)">activation {fmtDayKeyMedium(v.active_from)}{v.activated_at && v.status !== 'programmee' ? ` · appliquée le ${fmtDateTime(v.activated_at)}` : ''}</span>
                    <span className="text-xs text-(--color-ink-muted)">
                      {s.items_active ?? '—'} actifs · {s.items_coming_soon ?? 0} bientôt disponibles
                      {CHANGE_ORDER.filter((c) => c !== 'inchange' && (s[c] ?? 0) > 0).map((c) => ` · ${s[c]} ${MATRIX_CHANGE_LABEL[c].toLowerCase()}`).join('')}
                    </span>
                    {v.source_file && <span className="text-xs text-(--color-ink-muted)">{v.source_file}</span>}
                    {v.status === 'programmee' && <span className="ml-auto"><VersionActions id={v.id} code={v.code} /></span>}
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        ))}
        {opened && (
          <SectionCard title={`Instantané ${opened.code}`} description={opened.status === 'programmee' ? 'Version pas encore appliquée : l’instantané sera écrit à son activation.' : `${snapshot.length} item(s) — état de la matrice fixé par cette version.`}>
            {Object.keys(opened.rules ?? {}).length > 0 && (
              <details className="mb-3 text-xs text-(--color-ink-soft)">
                <summary className="cursor-pointer">Règles transmises avec la matrice</summary>
                <ul className="mt-1 list-disc pl-5">{Object.entries(opened.rules).map(([k, v]) => <li key={k}><strong>{k}</strong> : {v}</li>)}</ul>
              </details>
            )}
            <ul className="max-h-[32rem] space-y-0.5 overflow-auto text-xs">
              {CHANGE_ORDER.flatMap((c) => snapshot.filter((x) => x.change === c)).map((x) => {
                const d = x.data as { score_interne?: number | null; score_externe?: number | null; temps_reference?: number | null; diff?: Record<string, unknown> };
                return (
                  <li key={x.id} className="flex flex-wrap gap-2 py-0.5">
                    <span className="w-40 shrink-0 text-(--color-ink-muted)">{MATRIX_CHANGE_LABEL[x.change as MatrixChange] ?? x.change}</span>
                    <span className="min-w-0 flex-1 text-(--color-ink)">{x.item_id ? <Link href={`/admin/planificateur/items/${x.item_id}`} className="underline-offset-4 hover:underline">{x.nom_item}</Link> : x.nom_item}</span>
                    <span className="text-(--color-ink-muted)">
                      {d.score_interne != null ? `interne ${Math.round(Number(d.score_interne))}` : ''}{d.score_externe != null ? ` · externe ${Math.round(Number(d.score_externe))}` : ''}{d.temps_reference ? ` · ${d.temps_reference} min` : ''}
                      {d.diff ? ` · modifié : ${Object.keys(d.diff).join(', ')}` : ''}
                    </span>
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        )}
      </div>
    </main>
  );
}
