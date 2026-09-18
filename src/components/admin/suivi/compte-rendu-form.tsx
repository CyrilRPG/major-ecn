'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, PhoneCall } from 'lucide-react';
import { ajouterCompteRenduAction } from '@/app/admin/suivi/eleves/actions';
import { Button } from '@/components/ui/button';
import { STATUTS_SUIVI, STATUT_SUIVI_LABEL, type StatutSuivi } from '@/lib/suivi/eleves-pure';

export const MOYENS_CONTACT: Record<string, string> = {
  telephone: 'Téléphone', visio: 'Visio', email: 'Email', whatsapp: 'WhatsApp', sms: 'SMS', rendez_vous: 'Rendez-vous',
};

/**
 * « Après un appel » (cahier §3) : date du contact, moyen, motif, compte
 * rendu, difficulté rencontrée, action décidée, date de prochaine relance.
 * Le compte rendu est définitif une fois enregistré (historique non
 * destructible) : le formulaire le dit avant l'envoi.
 */
export function CompteRenduForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState({
    date: aujourdhui, contact_type: 'telephone', motif: '', compte_rendu: '', difficulte: '', action_decidee: '', prochaine_relance: '', statut: '' as StatutSuivi | '',
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF((s) => ({ ...s, [k]: e.target.value }));
  const INPUT = 'h-9 w-full rounded-lg border border-(--color-border) bg-white px-3 text-sm text-(--color-ink)';
  const AREA = 'w-full rounded-lg border border-(--color-border) bg-white px-3 py-2 text-sm text-(--color-ink)';

  const envoyer = () => {
    setError(null); setOk(false);
    start(async () => {
      const r = await ajouterCompteRenduAction({ ...f, statut: f.statut || undefined, userId });
      if (!r.ok) { setError(r.error); return; }
      setOk(true);
      setF((s) => ({ ...s, motif: '', compte_rendu: '', difficulte: '', action_decidee: '', prochaine_relance: '', statut: '' }));
      router.refresh();
    });
  };

  return (
    <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); envoyer(); }}>
      <label className="block"><span className={LABEL}>Date du contact</span><input type="date" value={f.date} max={aujourdhui} onChange={set('date')} className={INPUT} /></label>
      <label className="block"><span className={LABEL}>Moyen de contact</span>
        <select value={f.contact_type} onChange={set('contact_type')} className={INPUT}>{Object.entries(MOYENS_CONTACT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      </label>
      <label className="block sm:col-span-2"><span className={LABEL}>Motif</span><input value={f.motif} onChange={set('motif')} required placeholder="Relance inactivité, point d’étape, difficulté signalée…" className={INPUT} /></label>
      <label className="block sm:col-span-2"><span className={LABEL}>Compte rendu</span><textarea value={f.compte_rendu} onChange={set('compte_rendu')} required rows={4} className={AREA} /></label>
      <label className="block"><span className={LABEL}>Difficulté rencontrée</span><textarea value={f.difficulte} onChange={set('difficulte')} rows={2} className={AREA} /></label>
      <label className="block"><span className={LABEL}>Action décidée</span><textarea value={f.action_decidee} onChange={set('action_decidee')} rows={2} className={AREA} /></label>
      <label className="block"><span className={LABEL}>Date de prochaine relance</span><input type="date" value={f.prochaine_relance} min={aujourdhui} onChange={set('prochaine_relance')} className={INPUT} /></label>
      <label className="block"><span className={LABEL}>Statut après ce contact</span>
        <select value={f.statut} onChange={set('statut')} className={INPUT}>
          <option value="">Automatique (Contacté, ou À rappeler si relance)</option>
          {STATUTS_SUIVI.map((s) => <option key={s} value={s}>{STATUT_SUIVI_LABEL[s]}</option>)}
        </select>
      </label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <Button type="submit" disabled={pending || !f.motif.trim() || !f.compte_rendu.trim()}>
          {pending ? <Loader2 className="animate-spin" /> : <PhoneCall />} Enregistrer le compte rendu
        </Button>
        <span className="text-xs text-(--color-ink-muted)">Définitif une fois enregistré : horodaté à votre nom, ni modifiable ni effaçable.</span>
      </div>
      {error && <p className="text-sm font-medium text-[#A91D2C] sm:col-span-2">{error}</p>}
      {ok && <p className="text-sm font-medium text-[#16793C] sm:col-span-2">Compte rendu enregistré.</p>}
    </form>
  );
}

const LABEL = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)';
