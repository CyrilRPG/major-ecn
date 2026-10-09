'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import {
  AlertTriangle, CalendarPlus, Check, CircleHelp, Loader2, MessageSquareText, RotateCcw, Send, Sparkles, User,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { analyserImportAgenda, validerImportAgenda, type EtatImportIa } from '@/app/admin/agenda/import-ia-actions';
import type { Echange } from '@/lib/agenda/import-ia';
import { estBloquee, type SeanceVerifiee } from '@/lib/agenda/import-ia-regles';

type College = { id: string; nom: string; parentId?: string | null };
const MG_COLLEGE_ID = 'col-medecine-generale';
const FORMULE_LABEL: Record<string, string> = { essentiel: 'Essentiel', intensif: 'Intensif', approfondi: 'Approfondi' };
const VOIE_LABEL: Record<string, string> = { interne: 'Interne', externe: 'Externe' };

const EXEMPLE = `Radiologie Dr Jean Michel
- Mercredi 4 novembre : Imagerie tête et cou
- Mercredi 18 novembre : Imagerie de la femme

Orthopédie Dr Jean Michel
- Jeudi 19 novembre : Rééducation

Horaires : 20h - 22h pour chaque séance`;

const eur = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
const dateLongue = (cle: string) => {
  const [a, m, j] = cle.split('-').map(Number);
  if (!a || !m || !j) return cle;
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(a, m - 1, j));
};

/**
 * Import IA de l'agenda : texte libre → questions de l'IA → aperçu → création.
 * Le coût cumulé de l'import s'affiche en permanence (montant facturé).
 */
export function ImportIaDialog({
  colleges, onClose, onSaved,
}: {
  colleges: College[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [texte, setTexte] = useState('');
  const [echanges, setEchanges] = useState<Echange[]>([]);
  const [etat, setEtat] = useState<EtatImportIa | null>(null);
  const [importId, setImportId] = useState<string | null>(null);
  const [cout, setCout] = useState(0);
  const [reponses, setReponses] = useState<Record<string, string>>({});
  const [consigne, setConsigne] = useState('');
  const [notifier, setNotifier] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [action, setAction] = useState<'analyse' | 'validation' | null>(null);
  const enVol = useRef(false);

  const nomDe = useMemo(
    () => new Map(colleges.map((c) => [c.id, c.parentId === MG_COLLEGE_ID ? `MG · ${c.nom}` : c.nom])),
    [colleges],
  );

  const lancer = (nouveaux: Echange[]) => {
    if (enVol.current) return;
    enVol.current = true;
    setErr(null);
    setAction('analyse');
    startTransition(async () => {
      try {
        const res = await analyserImportAgenda({
          importId, texte, echanges: nouveaux, proposition: etat?.brutes.length ? etat.brutes : null,
        });
        if (!res.ok) {
          setErr(res.error);
          if (res.importId) setImportId(res.importId);
          if (typeof res.coutEur === 'number') setCout(res.coutEur);
          return;
        }
        setEchanges(nouveaux);
        setEtat(res.etat);
        setImportId(res.etat.importId);
        setCout(res.etat.coutEur);
        setReponses(Object.fromEntries(res.etat.questions.map((q) => [q.id, ''])));
        setConsigne('');
      } catch {
        setErr('Analyse impossible (connexion ?). Réessayez.');
      } finally {
        enVol.current = false;
        setAction(null);
      }
    });
  };

  const envoyerReponses = () => {
    if (!etat) return;
    lancer([...echanges, {
      genre: 'reponses',
      questions: etat.questions.map((q) => ({ question: q.question, reponse: (reponses[q.id] ?? '').trim() })),
    }]);
  };
  const demanderModification = () => {
    const c = consigne.trim();
    if (!c) return;
    lancer([...echanges, { genre: 'modification', consigne: c }]);
  };

  const valider = () => {
    if (!etat || enVol.current) return;
    enVol.current = true;
    setErr(null);
    setAction('validation');
    startTransition(async () => {
      try {
        const res = await validerImportAgenda({ importId, seances: etat.seances, notifier });
        if (!res.ok) { setErr(res.error); return; }
        const n = res.crees;
        onSaved(res.avertissement ?? [
          `${n} séance${n > 1 ? 's' : ''} créée${n > 1 ? 's' : ''} par l’import IA.`,
          notifier ? (res.notifies ? `Notification envoyée aux élèves concernés (jusqu’à ${res.notifies} par séance).` : 'Aucun élève concerné à notifier.') : null,
        ].filter(Boolean).join(' '));
        onClose();
      } catch {
        setErr('Création impossible (connexion ?). Réessayez.');
      } finally {
        enVol.current = false;
        setAction(null);
      }
    });
  };

  const recommencer = () => {
    if (etat && !confirm('Recommencer un nouvel import ? Les échanges en cours seront perdus.')) return;
    setEtat(null); setEchanges([]); setImportId(null); setCout(0); setReponses({}); setConsigne(''); setErr(null);
  };

  const fermer = () => {
    if (pending) return;
    if (etat && !confirm('Fermer sans créer les séances ?')) return;
    onClose();
  };

  const bloquees = etat?.seances.filter(estBloquee).length ?? 0;
  const toutesRepondues = !!etat && etat.questions.every((q) => (reponses[q.id] ?? '').trim());

  return (
    <Dialog open onOpenChange={(o) => !o && fermer()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-start justify-between gap-2 pr-6">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-(--color-primary)" />
              Import IA des séances
            </DialogTitle>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-(--color-border) bg-(--color-surface-soft) px-2.5 py-1 text-xs font-semibold tabular-nums text-(--color-ink)"
              title="Montant cumulé de cet import, ajouté à la facturation IA"
            >
              Coût de l’import : {eur(cout)}
            </span>
          </div>
          <DialogDescription>
            Collez ou écrivez le programme tel que vous l’avez reçu. L’IA crée les séances aux bonnes dates,
            pour les bonnes spécialités, et vous pose une question dès qu’un point n’est pas certain.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* ── 1. Texte ── */}
          {!etat ? (
            <div className="space-y-2">
              <textarea
                value={texte}
                onChange={(e) => setTexte(e.target.value)}
                rows={11}
                maxLength={20_000}
                placeholder={EXEMPLE}
                aria-label="Programme des séances"
                className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2.5 font-mono text-[13px] leading-relaxed focus-ring"
              />
              <p className="text-[11px] text-(--color-ink-muted)">
                Spécialités, intervenants, dates, horaires, formules (essentiel / intensif / approfondi), voies (interne / externe)…
                Ce que vous ne précisez pas, l’IA vous le demandera.
              </p>
            </div>
          ) : (
            <details className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3 py-2 text-xs">
              <summary className="cursor-pointer font-semibold text-(--color-ink-soft)">
                Texte importé{echanges.length ? ` · ${echanges.length} échange${echanges.length > 1 ? 's' : ''}` : ''}
              </summary>
              <pre className="mt-2 whitespace-pre-wrap font-mono text-[12px] text-(--color-ink)">{texte}</pre>
              {echanges.length > 0 && (
                <ol className="mt-2 space-y-1 border-t border-(--color-border) pt-2 text-(--color-ink-soft)">
                  {echanges.map((e, i) => (
                    <li key={i} className="flex gap-1.5">
                      <User className="mt-0.5 h-3 w-3 shrink-0" />
                      {e.genre === 'modification'
                        ? <span>Modification : {e.consigne}</span>
                        : <span>{e.questions.map((q) => `${q.question} → ${q.reponse || '—'}`).join(' · ')}</span>}
                    </li>
                  ))}
                </ol>
              )}
            </details>
          )}

          {/* ── Réponse de l'IA ── */}
          {etat?.resume && (
            <p className="flex items-start gap-2 rounded-xl bg-(--color-primary-soft)/60 px-3 py-2 text-sm text-(--color-ink)">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-(--color-primary)" />
              {etat.resume}
            </p>
          )}

          {/* ── 2. Questions ── */}
          {etat?.statut === 'questions' && etat.questions.length > 0 && (
            <section className="space-y-3 rounded-xl border border-[#B45309]/30 bg-[#FFF7ED] p-3.5">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[#9A3412]">
                <CircleHelp className="h-4 w-4" />
                {etat.questions.length > 1 ? `${etat.questions.length} précisions nécessaires` : 'Une précision nécessaire'}
              </h3>
              {etat.questions.map((q) => {
                const valeur = reponses[q.id] ?? '';
                const choisis = valeur.split(',').map((s) => s.trim()).filter(Boolean);
                const basculer = (c: string) => {
                  if (!q.multiple) { setReponses((r) => ({ ...r, [q.id]: c })); return; }
                  const suivant = choisis.includes(c) ? choisis.filter((x) => x !== c) : [...choisis, c];
                  setReponses((r) => ({ ...r, [q.id]: suivant.join(', ') }));
                };
                return (
                  <div key={q.id} className="space-y-1.5">
                    <p className="text-sm text-(--color-ink)">{q.question}</p>
                    {q.choix.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {q.choix.map((c) => {
                          const actif = q.multiple ? choisis.includes(c) : valeur === c;
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => basculer(c)}
                              aria-pressed={actif}
                              className={cn(
                                'rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors',
                                actif ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary-deep)' : 'border-(--color-border) bg-(--color-surface) text-(--color-ink-soft) hover:text-(--color-ink)',
                              )}
                            >
                              {actif && <Check className="mr-1 inline h-3 w-3" />}{c}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <input
                      value={valeur}
                      onChange={(e) => setReponses((r) => ({ ...r, [q.id]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter' && toutesRepondues && !pending) envoyerReponses(); }}
                      placeholder={q.choix.length ? 'Ou répondez librement…' : 'Votre réponse'}
                      aria-label={q.question}
                      className="h-9 w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 text-sm focus-ring"
                    />
                  </div>
                );
              })}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={envoyerReponses}
                  disabled={pending || !toutesRepondues}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-(--color-ink) px-3.5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
                >
                  {action === 'analyse' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Envoyer les réponses
                </button>
              </div>
            </section>
          )}

          {/* ── 3. Aperçu ── */}
          {etat && etat.seances.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-(--color-ink-soft)">
                {etat.statut === 'proposition'
                  ? `Aperçu — ${etat.seances.length} séance${etat.seances.length > 1 ? 's' : ''} à créer`
                  : 'Brouillon — à compléter avec vos réponses'}
              </h3>
              <ul className={cn('space-y-2', etat.statut === 'questions' && 'opacity-70')}>
                {etat.seances.map((s) => <CarteSeance key={s.ref} s={s} nomDe={nomDe} brouillon={etat.statut === 'questions'} />)}
              </ul>
            </section>
          )}

          {/* ── 4. Modifier / valider ── */}
          {etat?.statut === 'proposition' && (
            <section className="space-y-3 rounded-xl border border-(--color-border) p-3.5">
              <label className="block">
                <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-(--color-ink-soft)">
                  <MessageSquareText className="h-3.5 w-3.5" /> Quelque chose à changer ? Dites-le à l’IA
                </span>
                <textarea
                  value={consigne}
                  onChange={(e) => setConsigne(e.target.value)}
                  rows={2}
                  maxLength={4000}
                  placeholder="Ex. : la séance du 2 décembre commence à 19h ; ajoute la formule intensif pour l’orthopédie…"
                  className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus-ring"
                />
              </label>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={demanderModification}
                  disabled={pending || !consigne.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-2 text-sm font-semibold text-(--color-ink) hover:bg-(--color-surface-soft) disabled:opacity-40"
                >
                  {action === 'analyse' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Modifier
                </button>
                <label className="flex cursor-pointer items-center gap-2 text-xs text-(--color-ink-soft)">
                  <input type="checkbox" checked={notifier} onChange={(e) => setNotifier(e.target.checked)} className="h-4 w-4" />
                  Notifier les élèves concernés (une notification par séance)
                </label>
              </div>
            </section>
          )}

          {err && <p className="rounded-lg bg-(--color-primary-soft) px-3 py-2 text-xs text-(--color-primary-deep)">{err}</p>}
          {bloquees > 0 && etat?.statut === 'proposition' && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[#B91C1C]">
              <AlertTriangle className="h-3.5 w-3.5" />
              {bloquees} séance{bloquees > 1 ? 's' : ''} à corriger avant de valider : demandez la correction à l’IA ci-dessus.
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-(--color-border) pt-3">
            <div>
              {etat && (
                <button type="button" onClick={recommencer} disabled={pending}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-(--color-ink-soft) hover:text-(--color-ink) disabled:opacity-40">
                  <RotateCcw className="h-3.5 w-3.5" /> Nouvel import
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={fermer} disabled={pending}
                className="rounded-lg border border-(--color-border) px-3 py-2 text-sm text-(--color-ink-soft) hover:bg-(--color-surface-soft) disabled:opacity-40">
                Annuler
              </button>
              {!etat ? (
                <button
                  type="button"
                  onClick={() => lancer([])}
                  disabled={pending || texte.trim().length < 10}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-4 py-2 text-sm font-semibold text-white shadow-(--shadow-soft) hover:opacity-90 disabled:opacity-50"
                >
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {pending ? 'Analyse en cours…' : 'Analyser'}
                </button>
              ) : etat.statut === 'proposition' && (
                <button
                  type="button"
                  onClick={valider}
                  disabled={pending || bloquees > 0}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-4 py-2 text-sm font-semibold text-white shadow-(--shadow-soft) hover:opacity-90 disabled:opacity-50"
                >
                  {action === 'validation' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
                  {action === 'validation' ? 'Création…' : `Valider et créer ${etat.seances.length} séance${etat.seances.length > 1 ? 's' : ''}`}
                </button>
              )}
            </div>
          </div>
          {action === 'analyse' && (
            <p className="text-center text-[11px] text-(--color-ink-muted)">L’IA lit le programme… quelques secondes.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CarteSeance({ s, nomDe, brouillon }: { s: SeanceVerifiee; nomDe: Map<string, string>; brouillon: boolean }) {
  // Brouillon : les champs encore en question ne sont pas des erreurs.
  const bloquee = !brouillon && estBloquee(s);
  const horaire = s.debut ? `${s.debut.replace(':', 'h')}${s.fin ? ` – ${s.fin.replace(':', 'h')}` : ''}` : 'Sans horaire';
  return (
    <li className={cn(
      'rounded-xl border bg-(--color-surface) px-3 py-2.5',
      bloquee ? 'border-[#B91C1C]/40' : 'border-(--color-border)',
    )}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <p className="text-sm font-semibold text-(--color-ink)">{s.titre || <span className="italic text-(--color-ink-muted)">Sans titre</span>}</p>
        <p className="text-xs font-medium tabular-nums text-(--color-ink-soft)">
          <span className="first-letter:uppercase">{s.date ? dateLongue(s.date) : '—'}</span> · {horaire}
        </p>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
        {s.scope_type === 'all'
          ? <span className="rounded-full bg-[#1C2E49] px-2 py-0.5 font-semibold text-white">Toutes spécialités</span>
          : s.scope_colleges.map((id) => (
            <span key={id} className="rounded-full bg-(--color-primary-soft) px-2 py-0.5 font-semibold text-(--color-primary-deep)">{nomDe.get(id) ?? id}</span>
          ))}
        {s.intervenant && <span className="text-(--color-ink-soft)">· {s.intervenant}</span>}
        <span className="text-(--color-ink-muted)">
          · {s.required_offers.length ? s.required_offers.map((f) => FORMULE_LABEL[f] ?? f).join(', ') : 'formules ?'}
          {' · '}{s.voies.length ? `voie${s.voies.length > 1 ? 's' : ''} ${s.voies.map((v) => VOIE_LABEL[v] ?? v).join(' + ').toLowerCase()}` : 'voie ?'}
        </span>
      </div>
      {s.notes && <p className="mt-1 text-xs text-(--color-ink-soft)">{s.notes}</p>}
      {!brouillon && s.alertes.length > 0 && (
        <ul className="mt-1.5 space-y-0.5">
          {s.alertes.map((a, i) => (
            <li key={i} className={cn('flex items-start gap-1 text-[11px] font-medium', a.niveau === 'bloquant' ? 'text-[#B91C1C]' : 'text-[#B45309]')}>
              <AlertTriangle className="mt-px h-3 w-3 shrink-0" /> {a.message}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
