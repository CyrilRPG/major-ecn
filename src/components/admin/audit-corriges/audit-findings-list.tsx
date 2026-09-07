'use client';

/**
 * Relecture des constats d'un audit : pour chaque proposition signalée, la
 * question, la proposition, sa clé actuelle, sa justification et le motif du
 * modèle. Trois issues : inverser la clé (la justification avait raison),
 * ignorer (la clé avait raison), ou marquer corrigé après passage dans
 * l'éditeur (justification réécrite).
 */
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeftRight, Check, CheckCheck, ExternalLink, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { sanitizeBlockHtml } from '@/lib/flashcards/rich-text';
import { appliquerPropositionAction, appliquerToutesPropositionsAction, ignorerConstatAction, inverserCleAction, marquerCorrigeAction } from '@/app/admin/audit-corriges/actions';

export type FindingView = {
  id: string; itemId: string; questionId: string; coursId: string | null; coursTitre: string; collegeNom: string;
  lettre: string; isCorrectActuel: boolean; polarite: string; gravite: 'incoherent' | 'douteux' | 'justification'; motif: string | null;
  proposition: string | null;
  enonceQuestion: string; enonceItem: string; justification: string; statut: string;
};
export type FiltreConstat = 'ouvert' | 'traite' | 'all';

const STATUT: Record<string, string> = { ouvert: 'À traiter', cle_inversee: 'Clé inversée', ignore: 'Ignoré', corrige_manuellement: 'Corrigé à la main', proposition_appliquee: 'Rédaction appliquée' };

export function AuditFindingsList({ runId, findings, filtre, compteurs }: {
  runId: string; findings: FindingView[]; filtre: FiltreConstat; compteurs: Record<FiltreConstat, number>;
}) {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [progression, setProgression] = useState<string | null>(null);
  const ouvertsRedaction = findings.filter((f) => f.gravite === 'justification' && f.statut === 'ouvert').length;

  const appliquerTout = () => {
    if (!confirm(`Appliquer les ${compteurs.ouvert} rédaction(s) encore ouvertes de cet audit ? Chaque justification vide ou recopiée sera remplacée par le texte proposé.`)) return;
    setErreur(null);
    start(async () => {
      try {
        let total = 0;
        for (let tour = 0; tour < 50; tour++) {
          const r = await appliquerToutesPropositionsAction(runId);
          if (!r.ok) { setErreur(r.error); break; }
          total += r.appliquees;
          setProgression(`${total} appliquée(s), ${r.restants} restante(s)…`);
          if (r.restants === 0 || r.appliquees === 0) break;
        }
        router.refresh();
      } finally {
        setProgression(null);
      }
    });
  };

  const agir = (id: string, fn: () => Promise<{ ok: true } | { ok: false; error: string }>) => {
    setErreur(null); setEnCours(id);
    start(async () => {
      try { const r = await fn(); if (!r.ok) setErreur(r.error); else router.refresh(); }
      catch (e) { setErreur(e instanceof Error ? e.message : 'Une erreur inattendue est survenue.'); }
      finally { setEnCours(null); }
    });
  };

  // Regroupement par item pour lire dans l'ordre des cours.
  const groupes = new Map<string, FindingView[]>();
  for (const f of findings) { const k = `${f.collegeNom} › ${f.coursTitre}`; groupes.set(k, [...(groupes.get(k) ?? []), f]); }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {([['ouvert', 'À traiter'], ['traite', 'Traités'], ['all', 'Tous']] as Array<[FiltreConstat, string]>).map(([k, label]) => (
          <Link key={k} href={`/admin/audit-corriges/${runId}?filtre=${k}`} className={cn('rounded-full px-3 py-1.5 text-xs font-semibold transition-colors', filtre === k ? 'bg-(--color-primary) text-white' : 'bg-(--color-surface-soft) text-(--color-ink-soft) hover:bg-(--color-sand-100)')}>
            {label} <span className="opacity-70">({compteurs[k]})</span>
          </Link>
        ))}
      </div>
      {erreur && <div role="alert" className="mb-4 flex gap-2 rounded-xl bg-[#FFF1F2] p-3 text-sm text-[#B4233C]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{erreur}</div>}
      {ouvertsRedaction > 0 && (
        <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-[#C9E6D5] bg-[#F3FBF6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#124A2A]">{compteurs.ouvert} rédaction{compteurs.ouvert > 1 ? 's' : ''} en attente sur cet audit. Vous pouvez les relire une à une ci-dessous, ou tout appliquer.</p>
          <Button size="sm" onClick={appliquerTout} disabled={pending}>{pending && progression ? <Loader2 className="animate-spin" /> : <CheckCheck />} {progression ?? 'Appliquer toutes les rédactions'}</Button>
        </div>
      )}

      {findings.length === 0 ? (
        <p className="rounded-2xl border border-(--color-border) bg-(--color-surface) px-5 py-10 text-center text-sm text-(--color-ink-muted)">Aucun constat dans cette catégorie.</p>
      ) : (
        <div className="space-y-6">
          {[...groupes.entries()].map(([titre, liste]) => (
            <section key={titre}>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-(--color-ink)">{titre} <span className="font-medium normal-case tracking-normal text-(--color-ink-muted)">· {liste.length}</span></h2>
              <ul className="space-y-3">
                {liste.map((f) => {
                  const occupe = pending && enCours === f.id;
                  return (
                    <li key={f.id} className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft)">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={cn('rounded-full px-2 py-0.5 font-semibold', f.gravite === 'incoherent' ? 'bg-red-100 text-red-800' : f.gravite === 'douteux' ? 'bg-amber-100 text-amber-800' : 'bg-[#EDE9FE] text-[#6D28D9]')}>{f.gravite === 'incoherent' ? 'Incohérent' : f.gravite === 'douteux' ? 'Douteux' : 'Rédaction proposée'}</span>
                        <span className="rounded-full bg-(--color-surface-soft) px-2 py-0.5 font-medium text-(--color-ink-soft)">Clé actuelle : {f.isCorrectActuel ? 'VRAI' : 'FAUX'}</span>
                        <span className="rounded-full bg-(--color-surface-soft) px-2 py-0.5 font-medium text-(--color-ink-soft)">Justification : {f.polarite === 'indeterminee' ? 'indéterminée' : f.polarite}</span>
                        {f.statut !== 'ouvert' && <span className="rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-800">{STATUT[f.statut] ?? f.statut}</span>}
                        {f.coursId && <Link href={`/admin/contenu/${f.coursId}`} className="ml-auto inline-flex items-center gap-1 font-semibold text-(--color-primary-deep) hover:underline">Ouvrir dans Contenu <ExternalLink className="h-3.5 w-3.5" /></Link>}
                      </div>
                      <div className="mt-3 text-xs leading-5 text-(--color-ink-muted)" dangerouslySetInnerHTML={{ __html: sanitizeBlockHtml(f.enonceQuestion) }} />
                      <p className="mt-2 flex items-start gap-2 text-sm font-medium text-(--color-ink)">
                        <span className={cn('inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold', f.isCorrectActuel ? 'bg-[#2E8B57] text-white' : 'bg-(--color-surface-soft)')}>{f.lettre}</span>
                        <span dangerouslySetInnerHTML={{ __html: sanitizeBlockHtml(f.enonceItem) }} />
                      </p>
                      <div className="mt-2 rounded-xl bg-(--color-surface-soft) p-3 text-sm leading-6 text-(--color-ink)" dangerouslySetInnerHTML={{ __html: sanitizeBlockHtml(f.justification || '<em>(justification vide)</em>') }} />
                      {f.motif && <p className="mt-2 text-xs text-(--color-ink-soft)"><strong>Motif du modèle :</strong> {f.motif}</p>}
                      {f.proposition && (
                        <div className="mt-2 rounded-xl border border-[#C9E6D5] bg-[#F3FBF6] p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#16793C]">Justification proposée</p>
                          <p className="mt-1 text-sm leading-6 text-(--color-ink)">{f.proposition}</p>
                        </div>
                      )}
                      {f.statut === 'ouvert' && f.gravite === 'justification' && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button size="sm" onClick={() => agir(f.id, () => appliquerPropositionAction(f.id))} disabled={pending}>{occupe ? <Loader2 className="animate-spin" /> : <Check />} Appliquer cette rédaction</Button>
                          <Button size="sm" variant="outline" onClick={() => agir(f.id, () => ignorerConstatAction(f.id))} disabled={pending}><EyeOff /> Ne pas appliquer</Button>
                          <Button size="sm" variant="ghost" onClick={() => agir(f.id, () => marquerCorrigeAction(f.id))} disabled={pending}><Check /> Corrigé dans l’éditeur</Button>
                        </div>
                      )}
                      {f.statut === 'ouvert' && f.gravite !== 'justification' && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button size="sm" onClick={() => agir(f.id, () => inverserCleAction(f.id))} disabled={pending}>
                            {occupe ? <Loader2 className="animate-spin" /> : <ArrowLeftRight />} Inverser la clé → {f.isCorrectActuel ? 'FAUX' : 'VRAI'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => agir(f.id, () => ignorerConstatAction(f.id))} disabled={pending}><EyeOff /> La clé a raison</Button>
                          <Button size="sm" variant="ghost" onClick={() => agir(f.id, () => marquerCorrigeAction(f.id))} disabled={pending}><Check /> Corrigé dans l’éditeur</Button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
