'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ExternalLink, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  addQuestionAction, deleteQuestionAction, updateParcoursAction, updateQuestionAction,
  type QcmItem,
} from '@/app/admin/parcours/actions';

export type EditorParcours = {
  id: string; numero: number; titre: string; sous_titre: string | null;
  intro_html: string; vignette_html: string | null; available_at: string; active: boolean;
};
export type EditorQuestion = {
  id: string; section: 'qcm' | 'cas_clinique'; format: 'qcm' | 'qroc';
  ordre: number; enonce_html: string;
  items: QcmItem[] | null; reponse_attendue: string | null;
  explication_html: string | null; image_path: string | null;
};

/** Convertit un ISO en valeur d'input datetime-local (heure locale du navigateur). */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <label className="block">
    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-[11px] text-(--color-ink-muted)">{hint}</span>}
  </label>
);

const inputCls = 'w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus:border-[#B8860B] focus:outline-none focus:ring-1 focus:ring-[#B8860B]';

export function ParcoursEditor({ parcours, initialQuestions }: { parcours: EditorParcours; initialQuestions: EditorQuestion[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const [titre, setTitre] = useState(parcours.titre);
  const [sousTitre, setSousTitre] = useState(parcours.sous_titre ?? '');
  const [introHtml, setIntroHtml] = useState(parcours.intro_html ?? '');
  const [vignetteHtml, setVignetteHtml] = useState(parcours.vignette_html ?? '');
  const [availableAt, setAvailableAt] = useState(toLocalInput(parcours.available_at));
  const [active, setActive] = useState(parcours.active);
  const [questions, setQuestions] = useState<EditorQuestion[]>(initialQuestions);

  function saveParcours() {
    setMsg(null);
    start(async () => {
      const res = await updateParcoursAction({
        id: parcours.id, titre, sousTitre: sousTitre || null, introHtml,
        vignetteHtml: vignetteHtml || null,
        availableAt: new Date(availableAt).toISOString(), active,
      });
      if ('error' in res) setMsg({ kind: 'err', text: res.error });
      else { setMsg({ kind: 'ok', text: 'Parcours enregistré.' }); router.refresh(); }
    });
  }

  function addQuestion(section: 'qcm' | 'cas_clinique', format: 'qcm' | 'qroc') {
    start(async () => {
      const res = await addQuestionAction({ parcoursId: parcours.id, section, format });
      if ('error' in res) { setMsg({ kind: 'err', text: res.error }); return; }
      setQuestions((qs) => [...qs, {
        id: res.id, section, format, ordre: qs.filter((q) => q.section === section).length,
        enonce_html: '', items: format === 'qcm' ? ['A', 'B', 'C', 'D', 'E'].map((l) => ({ lettre: l, texte: '', correct: false })) : [],
        reponse_attendue: format === 'qroc' ? '' : null, explication_html: '', image_path: null,
      }]);
    });
  }

  const cas = questions.filter((q) => q.section === 'cas_clinique');
  const qcm = questions.filter((q) => q.section === 'qcm');

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: '#B8860B' }}>Parcours n°{parcours.numero}</p>
        <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-(--color-ink)">Éditer le parcours</h1>
      </header>

      {/* Bloc parcours */}
      <section className="space-y-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Titre"><input className={inputCls} value={titre} onChange={(e) => setTitre(e.target.value)} /></Field>
          <Field label="Sous-titre"><input className={inputCls} value={sousTitre} onChange={(e) => setSousTitre(e.target.value)} placeholder="Ex. Questions à réponse courte" /></Field>
        </div>
        <Field label="Rappel du coach (HTML)" hint="Le texte « Bonjour… » mis en page. Balises autorisées : <p>, <ul><li>, <strong>, <em>, <h3>, <img src=…>. Collez des images en data-URI si besoin.">
          <textarea className={`${inputCls} min-h-[200px] font-mono text-[12.5px]`} value={introHtml} onChange={(e) => setIntroHtml(e.target.value)} />
        </Field>
        <Field label="Cas clinique — contexte (HTML)" hint="La vignette du cas clinique, affichée avant ses QROC. Laissez vide s’il n’y a pas de cas clinique.">
          <textarea className={`${inputCls} min-h-[120px] font-mono text-[12.5px]`} value={vignetteHtml} onChange={(e) => setVignetteHtml(e.target.value)} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Date et heure d’ouverture" hint="Heure locale. Modifiable à tout moment.">
            <input type="datetime-local" className={inputCls} value={availableAt} onChange={(e) => setAvailableAt(e.target.value)} />
          </Field>
          <label className="flex items-end gap-2 pb-2 text-sm text-(--color-ink)">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-[#B8860B]" />
            Visible dans le chemin (décocher = masquer)
          </label>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={saveParcours} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Save />} Enregistrer le parcours
          </Button>
          <a href={`/parcours/${parcours.numero}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-(--color-ink-soft) hover:text-(--color-ink)">
            Aperçu élève <ExternalLink className="h-3.5 w-3.5" />
          </a>
          {msg && <span className={`text-sm font-medium ${msg.kind === 'ok' ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</span>}
        </div>
      </section>

      {/* Cas clinique (QROC) */}
      <QuestionsBlock
        titre="Cas clinique — questions à réponse courte (QROC)"
        aide="Auto-évaluées par l’élève : indiquez la réponse attendue et une explication."
        parcoursId={parcours.id}
        questions={cas}
        setQuestions={setQuestions}
        onAdd={() => addQuestion('cas_clinique', 'qroc')}
        pending={pending}
        start={start}
      />

      {/* QCM */}
      <QuestionsBlock
        titre="QCM (auto-corrigés)"
        aide="Cochez la ou les bonnes propositions. La note compte le tout-ou-rien par question."
        parcoursId={parcours.id}
        questions={qcm}
        setQuestions={setQuestions}
        onAdd={() => addQuestion('qcm', 'qcm')}
        pending={pending}
        start={start}
      />
    </div>
  );
}

function QuestionsBlock({
  titre, aide, parcoursId, questions, setQuestions, onAdd, pending, start,
}: {
  titre: string; aide: string; parcoursId: string;
  questions: EditorQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<EditorQuestion[]>>;
  onAdd: () => void;
  pending: boolean;
  start: React.TransitionStartFunction;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
      <div>
        <h2 className="text-sm font-bold text-(--color-ink)">{titre}</h2>
        <p className="text-[12px] text-(--color-ink-soft)">{aide}</p>
      </div>
      {questions.length === 0 && (
        <p className="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-3 py-4 text-sm text-(--color-ink-muted)">
          Aucune question pour l’instant.
        </p>
      )}
      <div className="space-y-3">
        {questions.map((q, i) => (
          <QuestionCard key={q.id} index={i} question={q} parcoursId={parcoursId} setQuestions={setQuestions} pending={pending} start={start} />
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={onAdd} disabled={pending}>
        <Plus /> Ajouter une question
      </Button>
    </section>
  );
}

function QuestionCard({
  index, question, parcoursId, setQuestions, pending, start,
}: {
  index: number; question: EditorQuestion; parcoursId: string;
  setQuestions: React.Dispatch<React.SetStateAction<EditorQuestion[]>>;
  pending: boolean;
  start: React.TransitionStartFunction;
}) {
  const [enonce, setEnonce] = useState(question.enonce_html);
  const [items, setItems] = useState<QcmItem[]>(question.items ?? []);
  const [reponse, setReponse] = useState(question.reponse_attendue ?? '');
  const [explication, setExplication] = useState(question.explication_html ?? '');
  const [image, setImage] = useState(question.image_path ?? '');
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function setItem(idx: number, patch: Partial<QcmItem>) {
    setItems((prev) => prev.map((it, j) => (j === idx ? { ...it, ...patch } : it)));
  }

  function save() {
    setErr(null); setSaved(false);
    start(async () => {
      const res = await updateQuestionAction({
        id: question.id, parcoursId, enonceHtml: enonce, items,
        reponseAttendue: question.format === 'qroc' ? reponse : null,
        explicationHtml: explication || null, imagePath: image || null, ordre: question.ordre,
      });
      if ('error' in res) setErr(res.error);
      else { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    });
  }

  function remove() {
    if (!confirm('Supprimer cette question ?')) return;
    start(async () => {
      const res = await deleteQuestionAction({ id: question.id, parcoursId });
      if ('error' in res) setErr(res.error);
      else setQuestions((qs) => qs.filter((x) => x.id !== question.id));
    });
  }

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3.5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wide text-(--color-ink-muted)">
          {question.format === 'qcm' ? 'QCM' : 'QROC'} n°{index + 1}
        </span>
        <button type="button" onClick={remove} disabled={pending} aria-label="Supprimer" className="rounded-lg p-1 text-(--color-ink-muted) hover:bg-red-50 hover:text-red-600">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <Field label="Énoncé (HTML)">
        <textarea className={`${inputCls} min-h-[70px] font-mono text-[12px]`} value={enonce} onChange={(e) => setEnonce(e.target.value)} />
      </Field>

      {question.format === 'qcm' ? (
        <div className="mt-2 space-y-1.5">
          {items.map((it, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-center text-xs font-bold text-(--color-ink-muted)">{it.lettre}</span>
              <input className={`${inputCls} flex-1`} value={it.texte} onChange={(e) => setItem(idx, { texte: e.target.value })} placeholder={`Proposition ${it.lettre}`} />
              <label className="flex shrink-0 items-center gap-1 text-[12px] text-(--color-ink)">
                <input type="checkbox" checked={it.correct} onChange={(e) => setItem(idx, { correct: e.target.checked })} className="h-4 w-4 accent-emerald-600" />
                Correct
              </label>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-2">
          <Field label="Réponse attendue" hint="Séparez les variantes acceptées par « | ». Affichée à l’élève pour son auto-évaluation.">
            <input className={inputCls} value={reponse} onChange={(e) => setReponse(e.target.value)} />
          </Field>
        </div>
      )}

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <Field label="Explication / correction (HTML)">
          <textarea className={`${inputCls} min-h-[60px] font-mono text-[12px]`} value={explication} onChange={(e) => setExplication(e.target.value)} />
        </Field>
        <Field label="Image (URL ou data-URI)" hint="Optionnel : illustration affichée sous l’énoncé.">
          <input className={inputCls} value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://… ou data:image/…" />
        </Field>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={save} disabled={pending}>
          {saved ? <><Check /> Enregistré</> : <><Save /> Enregistrer</>}
        </Button>
        {err && <span className="text-xs font-medium text-red-600">{err}</span>}
      </div>
    </div>
  );
}
