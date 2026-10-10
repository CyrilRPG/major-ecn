'use client';

import * as React from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { fetchAuthentifie, fetchAvecJetonFrais } from '@/lib/auth/fresh-token';
import { questionVisible } from '@/lib/qualite/reponses';
import type { Question, Reponses, ValeurReponse } from '@/lib/qualite/types';

/**
 * Formulaire d'un questionnaire (espace élève, fenêtre bloquante, lien
 * sécurisé). Brouillon enregistré automatiquement (statut « commencé ») ;
 * les questions conditionnelles n'apparaissent que si elles s'appliquent.
 * Le candidat peut exprimer librement son insatisfaction : aucune réponse
 * n'est « attendue ».
 */

export type QuestionnaireFormProps = {
  envoiId: string;
  titre: string;
  intro: string | null;
  questions: Question[];
  brouillon?: Record<string, unknown> | null;
  /** `connecte` : routes /api/enquetes ; `lien` : route publique du jeton. */
  mode: { type: 'connecte' } | { type: 'lien'; jeton: string };
  contexte?: string | null;
  onTermine?: () => void;
  compact?: boolean;
};

function NoteCinq({ value, onChange, name }: { value: number | null; onChange: (n: number) => void; name: string }) {
  return (
    <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n} type="button" role="radio" aria-checked={value === n} onClick={() => onChange(n)}
          className={cn(
            'h-10 w-10 rounded-full border text-sm font-semibold transition-colors focus-ring',
            value === n ? 'border-(--color-primary) bg-(--color-primary) text-(--color-primary-fg)' : 'border-(--color-border) bg-(--color-surface) text-(--color-ink) hover:border-(--color-primary)',
          )}
        >{n}</button>
      ))}
      <span className="ml-1 self-center text-xs text-(--color-ink-muted)">1 = très insatisfait · 5 = très satisfait</span>
    </div>
  );
}

function Recommandation({ value, onChange }: { value: number | null; onChange: (n: number) => void }) {
  return (
    <div role="radiogroup" aria-label="Recommandation" className="flex flex-wrap gap-1.5">
      {Array.from({ length: 11 }, (_, n) => (
        <button
          key={n} type="button" role="radio" aria-checked={value === n} onClick={() => onChange(n)}
          className={cn(
            'h-9 w-9 rounded-lg border text-sm font-medium focus-ring',
            value === n ? 'border-(--color-primary) bg-(--color-primary) text-(--color-primary-fg)' : 'border-(--color-border) bg-(--color-surface) text-(--color-ink) hover:border-(--color-primary)',
          )}
        >{n}</button>
      ))}
    </div>
  );
}

export function QuestionnaireForm(p: QuestionnaireFormProps) {
  const [rep, setRep] = React.useState<Reponses>(() => {
    const init: Reponses = {};
    for (const q of p.questions) init[q.id] = (p.brouillon?.[q.id] as ValeurReponse | undefined) ?? null;
    return init;
  });
  const [erreurs, setErreurs] = React.useState<Record<string, string>>({});
  const [envoi, setEnvoi] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [termine, setTermine] = React.useState(false);
  const minuteur = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const url = p.mode.type === 'connecte' ? `/api/enquetes/${p.envoiId}` : `/api/questionnaire/${p.mode.jeton}`;

  const maj = (id: string, v: ValeurReponse) => {
    setRep((r) => {
      const next = { ...r, [id]: v };
      if (p.mode.type === 'connecte') {
        if (minuteur.current) clearTimeout(minuteur.current);
        minuteur.current = setTimeout(() => {
          fetchAvecJetonFrais(url, { action: 'brouillon', reponses: next }).catch(() => undefined);
        }, 1500);
      }
      return next;
    });
    setErreurs((e) => { const reste = { ...e }; delete reste[id]; return reste; });
  };
  React.useEffect(() => () => { if (minuteur.current) clearTimeout(minuteur.current); }, []);

  async function soumettre(ev: React.FormEvent) {
    ev.preventDefault();
    if (minuteur.current) clearTimeout(minuteur.current);
    setEnvoi(true); setMessage(null);
    try {
      const corps = { action: 'soumettre', reponses: rep };
      const res = p.mode.type === 'connecte'
        ? await fetchAvecJetonFrais(url, corps)
        : await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corps) });
      const j = await res.json().catch(() => ({})) as { ok?: boolean; error?: string; erreurs?: Record<string, string> };
      if (j.ok) { setTermine(true); p.onTermine?.(); return; }
      setErreurs(j.erreurs ?? {});
      setMessage(j.error ?? 'Enregistrement impossible.');
      const premiere = j.erreurs ? Object.keys(j.erreurs)[0] : null;
      if (premiere) document.getElementById(`q-${premiere}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch {
      setMessage('Connexion impossible, réessayez dans un instant.');
    } finally {
      setEnvoi(false);
    }
  }

  if (termine) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
        <p className="text-lg font-semibold text-(--color-ink)">Merci, votre réponse est enregistrée.</p>
        <p className="max-w-md text-sm text-(--color-ink-soft)">Chaque réponse est lue par l&apos;équipe pédagogique et sert à améliorer la formation.</p>
      </div>
    );
  }

  const visibles = p.questions.filter((q) => questionVisible(q, rep));
  return (
    <form onSubmit={soumettre} className="flex flex-col gap-5" noValidate>
      {!p.compact && (
        <header>
          <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">{p.titre}</h1>
          {p.contexte && <p className="mt-1 text-sm font-medium text-(--color-primary)">{p.contexte}</p>}
          {p.intro && <p className="mt-2 text-sm text-(--color-ink-soft)">{p.intro}</p>}
        </header>
      )}
      {visibles.map((q) => {
        const v = rep[q.id];
        const err = erreurs[q.id];
        return (
          <fieldset key={q.id} id={`q-${q.id}`} className={cn('rounded-(--radius-card) border p-4', err ? 'border-(--color-danger)' : 'border-(--color-border)')}>
            <legend className="sr-only">{q.libelle}</legend>
            <p className="mb-2 text-sm font-medium text-(--color-ink)">
              {q.libelle}{q.obligatoire && <span className="text-(--color-danger)" aria-hidden> *</span>}
            </p>
            {q.aide && <p className="mb-2 text-xs text-(--color-ink-muted)">{q.aide}</p>}
            {q.type === 'note5' && <NoteCinq name={q.libelle} value={typeof v === 'number' ? v : null} onChange={(n) => maj(q.id, n)} />}
            {q.type === 'recommandation' && <Recommandation value={typeof v === 'number' ? v : null} onChange={(n) => maj(q.id, n)} />}
            {q.type === 'oui_non' && (
              <div role="radiogroup" className="flex gap-2">
                {[{ l: 'Oui', v: true }, { l: 'Non', v: false }].map((o) => (
                  <button key={o.l} type="button" role="radio" aria-checked={v === o.v} onClick={() => maj(q.id, o.v)}
                    className={cn('h-10 rounded-(--radius-button) border px-5 text-sm font-medium focus-ring',
                      v === o.v ? 'border-(--color-primary) bg-(--color-primary) text-(--color-primary-fg)' : 'border-(--color-border) bg-(--color-surface) text-(--color-ink)')}>
                    {o.l}
                  </button>
                ))}
              </div>
            )}
            {q.type === 'texte' && (
              <textarea
                value={typeof v === 'string' ? v : ''} onChange={(e) => maj(q.id, e.target.value)} rows={3} maxLength={4000}
                className="w-full rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) p-3 text-sm text-(--color-ink) focus-ring"
                placeholder="Votre réponse (facultative sauf mention)"
              />
            )}
            {(q.type === 'choix_unique' || q.type === 'choix_multiple') && (
              <div className="flex flex-col gap-1.5">
                {(q.options ?? []).map((o) => {
                  const multiple = q.type === 'choix_multiple';
                  const coche = multiple ? Array.isArray(v) && v.includes(o) : v === o;
                  return (
                    <label key={o} className="flex cursor-pointer items-center gap-2 text-sm text-(--color-ink)">
                      <input
                        type={multiple ? 'checkbox' : 'radio'} name={q.id} checked={coche}
                        onChange={() => {
                          if (!multiple) return maj(q.id, o);
                          const cur = Array.isArray(v) ? v : [];
                          maj(q.id, coche ? cur.filter((x) => x !== o) : [...cur, o]);
                        }}
                        className="h-4 w-4 accent-(--color-primary)"
                      />
                      {o}
                    </label>
                  );
                })}
              </div>
            )}
            {err && <p className="mt-2 text-xs text-(--color-danger)">{err}</p>}
          </fieldset>
        );
      })}
      {message && <p className="text-sm text-(--color-danger)" role="alert">{message}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={envoi} size="lg">
          {envoi && <Loader2 className="animate-spin" />}Envoyer mes réponses
        </Button>
      </div>
    </form>
  );
}

/** Charge un questionnaire du candidat connecté puis affiche le formulaire. */
export function QuestionnaireDistant({ envoiId, onTermine, compact }: { envoiId: string; onTermine?: () => void; compact?: boolean }) {
  const [data, setData] = React.useState<{ titre: string; intro: string | null; questions: Question[]; brouillon: Record<string, unknown> | null; contexte: { seance?: { titre?: string; enseignant?: string | null } } } | null>(null);
  const [erreur, setErreur] = React.useState<string | null>(null);
  React.useEffect(() => {
    let annule = false;
    fetchAuthentifie(`/api/enquetes/${envoiId}`).then(async (r) => {
      const j = await r.json();
      if (annule) return;
      if (!r.ok) setErreur(j.error ?? 'Questionnaire indisponible'); else setData(j);
    }).catch(() => !annule && setErreur('Connexion impossible'));
    return () => { annule = true; };
  }, [envoiId]);
  if (erreur) return <p className="text-sm text-(--color-danger)">{erreur}</p>;
  if (!data) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-(--color-ink-muted)" /></div>;
  const s = data.contexte?.seance;
  return (
    <QuestionnaireForm
      envoiId={envoiId} titre={data.titre} intro={data.intro} questions={data.questions} brouillon={data.brouillon}
      mode={{ type: 'connecte' }} onTermine={onTermine} compact={compact}
      contexte={s ? [s.titre, s.enseignant].filter(Boolean).join(' · ') : null}
    />
  );
}
