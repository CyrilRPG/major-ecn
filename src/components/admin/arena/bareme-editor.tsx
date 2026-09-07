'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { deleteBaremeTemplate, overrideRoundBareme, saveBaremeTemplate, updateTournamentBareme } from '@/app/admin/arena/actions';
import {
  describeBareme, MODE_LABEL, QTYPE_LABEL, QTYPES, resolveQrm, resolveQrpRow, resolveQru, sanitizeBareme, scoreQuestion,
  type Bareme, type BaremeMode, type QrmGrid, type QrpGrid, type QruGrid, type QType, type TypeBareme,
} from '@/lib/arena/scoring';
import type { RoundRow } from '@/lib/arena/types';

/**
 * Barèmes (§6) — modèle de simplicité : pour chaque type, un menu déroulant
 * (CNG · Tout ou rien · Grille personnalisée · modèles enregistrés). Les
 * champs de paramétrage n'apparaissent que pour la grille personnalisée.
 * Prévisualisation (§6.8) : une combinaison de réponses fictive → le score
 * que le moteur attribuerait, calculé avec le même module que la correction.
 */

export type BaremeTemplateRow = { id: string; name: string; question_type: QType; config: TypeBareme };

export function BaremeEditor({ tournamentId, initial, templates, rounds, qrpNs }: { tournamentId: string; initial: Bareme; templates: BaremeTemplateRow[]; rounds: RoundRow[]; qrpNs: number[] }) {
  const router = useRouter();
  const [bareme, setBareme] = useState<Bareme>(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [overrideRound, setOverrideRound] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState('');

  const clean = useMemo(() => sanitizeBareme(bareme), [bareme]);

  const setType = (t: QType, patch: Partial<TypeBareme>) => setBareme((b) => ({ ...b, [t]: { ...b[t], ...patch } }));

  const choose = (t: QType, value: string) => {
    if (value.startsWith('tpl:')) {
      const tpl = templates.find((x) => x.id === value.slice(4));
      if (tpl) setType(t, { mode: 'custom', grid: tpl.config.grid ?? null, template_id: tpl.id, template_name: tpl.name });
      return;
    }
    const mode = value as BaremeMode;
    if (mode === 'custom') {
      const g = t === 'QRM' ? resolveQrm(bareme[t]) : t === 'QRU' ? resolveQru(bareme[t]) : ({ by_n: Object.fromEntries((qrpNs.length ? qrpNs : [2, 3]).map((n) => [String(n), resolveQrpRow(bareme[t], n).row])), error_policy: 'zero', penalty: 0, apply_rules: true } satisfies QrpGrid);
      setType(t, { mode, grid: g, template_id: null, template_name: null });
    } else setType(t, { mode, grid: null, template_id: null, template_name: null });
  };

  const save = () => {
    setMsg(null); setError(null);
    start(async () => {
      const r = await updateTournamentBareme(tournamentId, clean);
      if (r.ok) { setMsg('Barème du tournoi enregistré (manches non encore ouvertes).'); router.refresh(); } else setError(r.error);
    });
  };

  const lockedRounds = rounds.filter((r) => r.bareme_locked_at);

  return (
    <div className="space-y-6">
      {QTYPES.map((t) => (
        <TypeSection key={t} type={t} value={bareme[t]} templates={templates.filter((x) => x.question_type === t)} qrpNs={qrpNs} onChoose={(v) => choose(t, v)} onGrid={(g) => setType(t, { grid: g, template_id: null, template_name: null })} clean={clean} onSaveTemplate={(name) => start(async () => { const r = await saveBaremeTemplate({ name, question_type: t, config: bareme[t].grid }); if (r.ok) { setType(t, { template_id: r.id, template_name: name }); setMsg(`Modèle « ${name} » enregistré.`); router.refresh(); } else setError(r.error); })} onDeleteTemplate={(id) => start(async () => { await deleteBaremeTemplate(id); router.refresh(); })} />
      ))}

      {error && <p className="text-sm font-semibold text-(--color-danger)">{error}</p>}
      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={pending}>{pending ? 'Enregistrement…' : 'Enregistrer le barème du tournoi'}</Button>
        {msg && <span className="text-sm font-semibold text-emerald-700">{msg}</span>}
      </div>

      {lockedRounds.length > 0 && (
        <section className="rounded-(--radius-card) border border-amber-200 bg-amber-50 p-5">
          <h3 className="text-sm font-bold text-amber-900">Modification exceptionnelle d’une manche déjà ouverte (§6.10)</h3>
          <p className="mt-1 text-xs text-amber-800">Le barème d’une manche est verrouillé à son ouverture. Appliquer le barème ci-dessus à une manche verrouillée est tracé (auteur, date, ancienne et nouvelle valeur) et recalcule tous les scores et le droit au rang.</p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ov-round">Manche</Label>
              <select id="ov-round" value={overrideRound} onChange={(e) => setOverrideRound(e.target.value)} className="h-10 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-3 text-sm">
                <option value="">—</option>
                {lockedRounds.map((r) => <option key={r.id} value={r.id}>Manche {r.number}</option>)}
              </select>
            </div>
            <div className="min-w-[240px] flex-1 space-y-1.5"><Label htmlFor="ov-reason">Motif (obligatoire)</Label><Input id="ov-reason" value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} /></div>
            <Button variant="danger" disabled={pending || !overrideRound || !overrideReason.trim()} onClick={() => start(async () => { const r = await overrideRoundBareme(overrideRound, clean, overrideReason); if (r.ok) { setMsg(`Barème appliqué, ${r.recomputed} tentative(s) recalculée(s).`); setOverrideReason(''); router.refresh(); } else setError(r.error); })}>Appliquer et recalculer</Button>
          </div>
        </section>
      )}
    </div>
  );
}

function TypeSection({ type, value, templates, qrpNs, onChoose, onGrid, clean, onSaveTemplate, onDeleteTemplate }: {
  type: QType; value: TypeBareme; templates: BaremeTemplateRow[]; qrpNs: number[];
  onChoose: (v: string) => void; onGrid: (g: QrmGrid | QruGrid | QrpGrid) => void; clean: Bareme;
  onSaveTemplate: (name: string) => void; onDeleteTemplate: (id: string) => void;
}) {
  const [tplName, setTplName] = useState('');
  const selectValue = value.template_id ? `tpl:${value.template_id}` : value.mode;
  const desc = describeBareme(type, clean, qrpNs);
  return (
    <section className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-bold text-(--color-ink)">{QTYPE_LABEL[type]}</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-(--color-ink-soft)">Barème :</span>
          <select value={selectValue} onChange={(e) => onChoose(e.target.value)} className="h-10 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-3 text-sm">
            <option value="cng">{MODE_LABEL.cng}</option>
            <option value="all_or_nothing">{MODE_LABEL.all_or_nothing}</option>
            <option value="custom">{MODE_LABEL.custom}</option>
            {templates.length > 0 && <optgroup label="Modèles enregistrés">{templates.map((t) => <option key={t.id} value={`tpl:${t.id}`}>{t.name}</option>)}</optgroup>}
          </select>
        </div>
      </div>

      {value.mode === 'custom' && (
        <div className="mt-4 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface-soft) p-4">
          {type === 'QRM' && <QrmGridEditor grid={resolveQrm(value)} onChange={onGrid} />}
          {type === 'QRU' && <QruGridEditor grid={resolveQru(value)} onChange={onGrid} />}
          {type === 'QRP' && <QrpGridEditor value={value} ns={qrpNs.length ? qrpNs : [2, 3]} onChange={onGrid} />}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Input placeholder="Nom du modèle (ex. Barème Major ECN sévère)" value={tplName} onChange={(e) => setTplName(e.target.value)} className="max-w-xs" />
            <Button variant="outline" size="sm" disabled={tplName.trim().length < 2} onClick={() => { onSaveTemplate(tplName.trim()); setTplName(''); }}>Enregistrer comme modèle</Button>
            {value.template_id && <Button variant="ghost" size="sm" onClick={() => onDeleteTemplate(value.template_id as string)}>Supprimer le modèle « {value.template_name} »</Button>}
          </div>
          <p className="mt-2 text-xs text-(--color-ink-muted)">Modifier un modèle n’affecte jamais les tournois déjà ouverts : le barème appliqué est copié dans la manche à son ouverture.</p>
        </div>
      )}

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-(--color-ink-muted)">Affiché aux participants</p>
          <p className="mt-1 text-sm font-semibold">{desc.title}</p>
          <ul className="mt-2 space-y-1 text-sm">
            {desc.lines.map((l) => <li key={l.situation} className="flex justify-between gap-3 border-t border-(--color-border) py-1"><span className="text-(--color-ink-soft)">{l.situation}</span><span className="font-semibold">{l.points}</span></li>)}
          </ul>
          {desc.notes.map((n) => <p key={n} className="mt-1 text-xs text-(--color-ink-muted)">{n}</p>)}
        </div>
        <Preview type={type} bareme={clean} />
      </div>
    </section>
  );
}

function NumberCell({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return <Input type="number" step="0.05" min={0} max={1} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-24" />;
}

function QrmGridEditor({ grid, onChange }: { grid: QrmGrid; onChange: (g: QrmGrid) => void }) {
  return (
    <div>
      <p className="text-sm font-semibold">Points (sur 1) par nombre de discordances — au-delà du dernier palier : 0</p>
      <div className="mt-2 flex flex-wrap items-end gap-3">
        {grid.points.map((p, d) => (
          <div key={d} className="space-y-1"><Label>{d} discord.</Label><NumberCell value={p} onChange={(v) => onChange({ ...grid, points: grid.points.map((x, i) => (i === d ? v : x)) })} /></div>
        ))}
        <Button variant="ghost" size="sm" onClick={() => onChange({ ...grid, points: [...grid.points, 0] })}>+ palier</Button>
        {grid.points.length > 1 && <Button variant="ghost" size="sm" onClick={() => onChange({ ...grid, points: grid.points.slice(0, -1) })}>− palier</Button>}
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={grid.apply_rules} onChange={(e) => onChange({ ...grid, apply_rules: e.target.checked })} /> Appliquer les règles indispensable / inacceptable (question à 0)</label>
    </div>
  );
}

function QruGridEditor({ grid, onChange }: { grid: QruGrid; onChange: (g: QruGrid) => void }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1"><Label>Bonne réponse</Label><NumberCell value={grid.correct} onChange={(v) => onChange({ ...grid, correct: v })} /></div>
      <div className="space-y-1"><Label>Tout autre cas</Label><NumberCell value={grid.wrong} onChange={(v) => onChange({ ...grid, wrong: v })} /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={grid.apply_rules} onChange={(e) => onChange({ ...grid, apply_rules: e.target.checked })} /> Règles indispensable / inacceptable</label>
    </div>
  );
}

function QrpGridEditor({ value, ns, onChange }: { value: TypeBareme; ns: number[]; onChange: (g: QrpGrid) => void }) {
  const g = (value.grid ?? {}) as Partial<QrpGrid>;
  const by_n: Record<string, number[]> = { ...(g.by_n ?? {}) };
  for (const n of ns) if (!by_n[String(n)] || by_n[String(n)].length !== n + 1) by_n[String(n)] = resolveQrpRow(value, n).row;
  const grid: QrpGrid = { by_n, error_policy: g.error_policy === 'penalty' ? 'penalty' : 'zero', penalty: g.penalty ?? 0, apply_rules: g.apply_rules !== false };
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold">Grille indexée par n (valeurs de n présentes dans le tournoi : {ns.join(', ')})</p>
      {ns.map((n) => (
        <div key={n} className="flex flex-wrap items-end gap-3">
          <span className="w-16 text-sm font-semibold">n = {n}</span>
          {grid.by_n[String(n)].map((p, x) => (
            <div key={x} className="space-y-1"><Label>{x} juste{x > 1 ? 's' : ''}</Label><NumberCell value={p} onChange={(v) => onChange({ ...grid, by_n: { ...grid.by_n, [String(n)]: grid.by_n[String(n)].map((y, i) => (i === x ? v : y)) } })} /></div>
          ))}
        </div>
      ))}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label>Proposition erronée cochée</Label>
          <select value={grid.error_policy} onChange={(e) => onChange({ ...grid, error_policy: e.target.value as 'zero' | 'penalty' })} className="h-10 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-3 text-sm">
            <option value="zero">0 automatique</option>
            <option value="penalty">Retrait par erreur</option>
          </select>
        </div>
        {grid.error_policy === 'penalty' && <div className="space-y-1"><Label>Retrait par erreur</Label><NumberCell value={grid.penalty} onChange={(v) => onChange({ ...grid, penalty: v })} /></div>}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={grid.apply_rules} onChange={(e) => onChange({ ...grid, apply_rules: e.target.checked })} /> Règles indispensable / inacceptable</label>
      </div>
    </div>
  );
}

const PREVIEW_LETTERS = ['A', 'B', 'C', 'D', 'E'];

function LetterRow({ label, arr, set }: { label: string; arr: string[]; set: (v: string[]) => void }) {
  const toggle = (l: string) => set(arr.includes(l) ? arr.filter((x) => x !== l) : [...arr, l]);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-28 text-(--color-ink-soft)">{label}</span>
      {PREVIEW_LETTERS.map((l) => (
        <button key={l} type="button" onClick={() => toggle(l)} className={`h-7 w-7 rounded-md text-xs font-bold ${arr.includes(l) ? 'bg-(--color-primary) text-white' : 'border border-(--color-border) text-(--color-ink-soft)'}`}>{l}</button>
      ))}
    </div>
  );
}

/** Prévisualisation (§6.8) : cinq propositions A–E, réponses attendues et coches fictives paramétrables. */
function Preview({ type, bareme }: { type: QType; bareme: Bareme }) {
  const letters = PREVIEW_LETTERS;
  const [expected, setExpected] = useState<string[]>(type === 'QRU' ? ['A'] : type === 'QRP' ? ['A', 'B'] : ['A', 'C', 'D']);
  const [checked, setChecked] = useState<string[]>(type === 'QRU' ? ['A'] : type === 'QRP' ? ['A', 'B'] : ['A', 'C']);
  const [indis, setIndis] = useState<string[]>([]);
  const [inac, setInac] = useState<string[]>([]);
  const q = { type, expected_count: type === 'QRP' ? expected.length : null, items: letters.map((l) => ({ lettre: l, is_correct: expected.includes(l), indispensable: indis.includes(l), inacceptable: inac.includes(l) })) };
  const r = scoreQuestion(q, checked, bareme);
  return (
    <div className="rounded-(--radius-button) border border-(--color-border) p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-(--color-ink-muted)">Prévisualisation (§6.8)</p>
      <div className="mt-2 space-y-2">
        <LetterRow label="Attendues" arr={expected} set={setExpected} />
        <LetterRow label="Indispensables" arr={indis} set={setIndis} />
        <LetterRow label="Inacceptables" arr={inac} set={setInac} />
        <LetterRow label="Candidat coche" arr={checked} set={setChecked} />
      </div>
      <p className="mt-3 text-sm">
        Score : <strong>{r.score.toLocaleString('fr-FR')} / {r.max.toLocaleString('fr-FR')}</strong>
        <span className="ml-2 text-xs text-(--color-ink-muted)">{r.discordances} discordance(s){r.rule_triggered ? ` · règle ${r.rule_triggered}` : ''}{r.is_perfect ? ' · réponse parfaite' : ''}</span>
      </p>
    </div>
  );
}
