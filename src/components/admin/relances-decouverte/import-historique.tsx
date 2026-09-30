'use client';

import * as React from 'react';
import { FileUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RapportImport } from '@/lib/decouverte/serveur';
import { API, appelJson, Message, Panneau } from './commun';

/**
 * Import de l'historique des relances déjà faites (cahier §5) : aperçu ligne
 * par ligne, puis import et rapport. Le cycle reprend à partir de cet
 * historique réel (jamais de retour artificiel à R1) ; un niveau déjà
 * enregistré est ignoré.
 */
export function ImportHistorique({ onImporte }: { onImporte: () => void }) {
  const [csv, setCsv] = React.useState('');
  const [rapport, setRapport] = React.useState<RapportImport | null>(null);
  const [applique, setApplique] = React.useState(false);
  const [occupe, setOccupe] = React.useState(false);
  const [erreur, setErreur] = React.useState<string | null>(null);

  async function lancer(appliquer: boolean) {
    setOccupe(true); setErreur(null);
    try {
      const r = await appelJson<RapportImport>(`${API}/import`, { body: { csv, appliquer } });
      setRapport(r); setApplique(appliquer);
      if (appliquer) onImporte();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Import impossible');
    } finally {
      setOccupe(false);
    }
  }

  async function lireFichier(f: File | undefined) {
    if (!f) return;
    if (f.size > 1_500_000) { setErreur('Fichier trop volumineux (1,5 Mo au plus).'); return; }
    setCsv(await f.text()); setRapport(null);
  }

  const ton: Record<string, string> = { ok: 'text-emerald-700', importee: 'text-emerald-700', ignoree: 'text-amber-700', erreur: 'text-red-700' };
  return (
    <Panneau titre="Importer l’historique des relances" description="Format : email;type;date;heure;commentaire — types R1, R2, R3, « ancien accès » ou « autre » ; date JJ/MM/AAAA ou AAAA-MM-JJ ; heure HH:MM (heure de Paris, 12:00 par défaut).">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-(--radius-button) border border-(--color-border) px-3 py-2 text-sm hover:bg-(--color-surface-soft)">
            <FileUp className="h-4 w-4" /> Choisir un fichier CSV
            <input type="file" accept=".csv,text/csv,text/plain" className="sr-only" onChange={(e) => void lireFichier(e.target.files?.[0])} />
          </label>
          <span className="text-xs text-(--color-ink-muted)">ou collez le contenu ci-dessous</span>
        </div>
        <textarea className="h-40 w-full rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) p-3 font-mono text-xs" value={csv} onChange={(e) => { setCsv(e.target.value); setRapport(null); }}
          placeholder={'email;type;date;heure;commentaire\nsara@exemple.fr;R1;12/09/2026;14:30;envoyée depuis Gmail'} />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={!csv.trim() || occupe} onClick={() => void lancer(false)}>{occupe ? <Loader2 className="animate-spin" /> : null} Aperçu</Button>
          <Button disabled={!rapport || applique || rapport.valides === 0 || occupe} onClick={() => void lancer(true)}>Importer {rapport && !applique ? `${rapport.valides} relance(s)` : ''}</Button>
        </div>
        <Message erreur={erreur} info={applique && rapport ? `${rapport.appliquees} relance(s) importée(s) sur ${rapport.total} ligne(s). Les prochaines actions sont recalculées.` : null} />
        {rapport && (
          <div className="max-h-96 overflow-auto rounded-lg border border-(--color-border)">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-(--color-surface-soft) text-[10px] uppercase text-(--color-ink-muted)"><tr><th className="px-2 py-1.5 text-left">Ligne</th><th className="px-2 py-1.5 text-left">E-mail</th><th className="px-2 py-1.5 text-left">Candidat</th><th className="px-2 py-1.5 text-left">Type</th><th className="px-2 py-1.5 text-left">Date</th><th className="px-2 py-1.5 text-left">Résultat</th></tr></thead>
              <tbody>{rapport.lignes.map((l) => (
                <tr key={l.numero} className="border-t border-(--color-border)"><td className="px-2 py-1">{l.numero}</td><td className="px-2 py-1">{l.email}</td><td className="px-2 py-1">{l.candidat ?? '—'}</td><td className="px-2 py-1">{l.type ?? '—'}</td><td className="px-2 py-1">{l.date ?? '—'}</td><td className={`px-2 py-1 font-medium ${ton[l.statut]}`}>{l.message}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </Panneau>
  );
}
