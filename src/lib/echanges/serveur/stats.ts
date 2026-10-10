import 'server-only';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { statsReactivite, type StatsReactivite } from '../regles';
import { db, FACULTE, parametres, parTranches } from './base';
import { identitesDe } from './identites';

/**
 * Suivi de la réactivité des enseignants (CDC §29-30, §129, §132-133) —
 * réservé à Major ECN. Le délai est TOUJOURS « première réponse valide − tag »
 * (`statsReactivite`), identique au tableau de bord, aux statistiques et aux
 * exports.
 */

export type FiltresStats = {
  enseignantId?: string | null;
  specialiteId?: string | null;
  groupeId?: string | null;
  depuis?: string | null;
  jusqua?: string | null;
  etat?: 'tous' | 'repondu' | 'non_repondu' | 'retard' | null;
};

export type LigneQuestion = {
  tagId: string;
  messageId: string;
  groupeId: string;
  groupe: string;
  promotion: string | null;
  specialite: string | null;
  enseignantId: string;
  enseignant: string;
  enseignantPublic: string;
  tagAt: string;
  reponduAt: string | null;
  delaiSecondes: number | null;
  avantSeuil: boolean | null;
  statut: 'en_attente' | 'traitee' | 'annulee' | 'a_reaffecter';
  enRetard: boolean;
  relanceEnvoyee: boolean;
  traiteManuellement: boolean;
  extrait: string;
};

type Tag = {
  id: string; message_id: string; groupe_id: string; enseignant_id: string; tag_at: string; repondu_at: string | null;
  statut: LigneQuestion['statut']; en_retard_at: string | null; relance_envoyee_at: string | null; traite_manuellement: boolean; delai_secondes: number | null;
};

export async function lignesQuestions(f: FiltresStats): Promise<{ lignes: LigneQuestion[]; seuilHeures: number }> {
  const prm = await parametres();
  const seuil = prm.relance_heures * 3600;
  const { data: gs } = await db().from('echanges_groupes').select('id, nom, promotion, specialite_id, specialite_nom').eq('faculte_id', FACULTE);
  let groupes = (gs ?? []) as { id: string; nom: string; promotion: string | null; specialite_id: string | null; specialite_nom: string | null }[];
  if (f.groupeId) groupes = groupes.filter((g) => g.id === f.groupeId);
  if (f.specialiteId) groupes = groupes.filter((g) => g.specialite_id === f.specialiteId);
  if (groupes.length === 0) return { lignes: [], seuilHeures: prm.relance_heures };
  const tags = await fetchAllRows<Tag>((from, to) => {
    let q = db().from('echanges_tags')
      .select('id, message_id, groupe_id, enseignant_id, tag_at, repondu_at, statut, en_retard_at, relance_envoyee_at, traite_manuellement, delai_secondes')
      .in('groupe_id', groupes.map((g) => g.id)).neq('statut', 'annulee').order('tag_at', { ascending: false }).order('id');
    if (f.enseignantId) q = q.eq('enseignant_id', f.enseignantId);
    if (f.depuis) q = q.gte('tag_at', f.depuis);
    if (f.jusqua) q = q.lte('tag_at', f.jusqua);
    return q.range(from, to);
  });
  const ensIds = [...new Set(tags.map((t) => t.enseignant_id))];
  const msgIds = [...new Set(tags.map((t) => t.message_id))];
  const [profs, ids, msgs] = await Promise.all([
    parTranches(ensIds, 150, async (lot) => ((await db().from('profiles').select('id, first_name, last_name').in('id', lot)).data ?? []) as { id: string; first_name: string | null; last_name: string | null }[]),
    identitesDe(ensIds),
    parTranches(msgIds, 150, async (lot) => ((await db().from('echanges_messages').select('id, contenu').in('id', lot)).data ?? []) as { id: string; contenu: string | null }[]),
  ]);
  const p = new Map(profs.map((x) => [x.id, x]));
  const m = new Map(msgs.map((x) => [x.id, x.contenu]));
  const g = new Map(groupes.map((x) => [x.id, x]));
  let lignes: LigneQuestion[] = tags.map((t) => {
    const gr = g.get(t.groupe_id);
    const pr = p.get(t.enseignant_id);
    const delai = t.repondu_at ? Math.round((new Date(t.repondu_at).getTime() - new Date(t.tag_at).getTime()) / 1000) : null;
    const ouvert = t.statut !== 'traitee';
    return {
      tagId: t.id, messageId: t.message_id, groupeId: t.groupe_id, groupe: gr?.nom ?? '', promotion: gr?.promotion ?? null, specialite: gr?.specialite_nom ?? null,
      enseignantId: t.enseignant_id,
      enseignant: `${pr?.first_name ?? ''} ${pr?.last_name ?? ''}`.trim() || ids.get(t.enseignant_id)?.prenom_public || 'Enseignant',
      enseignantPublic: ids.get(t.enseignant_id)?.prenom_public ?? '—',
      tagAt: t.tag_at, reponduAt: t.repondu_at, delaiSecondes: delai,
      avantSeuil: delai === null ? null : delai <= seuil,
      statut: t.statut,
      enRetard: ouvert ? Date.now() - new Date(t.tag_at).getTime() > seuil * 1000 : (delai ?? 0) > seuil,
      relanceEnvoyee: !!t.relance_envoyee_at, traiteManuellement: t.traite_manuellement,
      extrait: (m.get(t.message_id) ?? '').replace(/\s+/g, ' ').slice(0, 160),
    };
  });
  if (f.etat === 'repondu') lignes = lignes.filter((l) => l.statut === 'traitee');
  if (f.etat === 'non_repondu') lignes = lignes.filter((l) => l.statut !== 'traitee');
  if (f.etat === 'retard') lignes = lignes.filter((l) => l.enRetard);
  return { lignes, seuilHeures: prm.relance_heures };
}

export type Agregats = { global: StatsReactivite; parEnseignant: (StatsReactivite & { cle: string; libelle: string })[]; parGroupe: (StatsReactivite & { cle: string; libelle: string })[]; parSpecialite: (StatsReactivite & { cle: string; libelle: string })[] };

export function agreger(lignes: LigneQuestion[], seuilHeures: number): Agregats {
  const conv = (l: LigneQuestion) => ({ statut: l.statut, tag_at: l.tagAt, repondu_at: l.reponduAt });
  const grouper = (cle: (l: LigneQuestion) => string, lib: (l: LigneQuestion) => string) => {
    const m = new Map<string, LigneQuestion[]>();
    for (const l of lignes) m.set(cle(l), [...(m.get(cle(l)) ?? []), l]);
    return [...m.entries()].map(([k, ls]) => ({ cle: k, libelle: lib(ls[0]), ...statsReactivite(ls.map(conv), seuilHeures) }))
      .sort((a, b) => b.tags - a.tags);
  };
  return {
    global: statsReactivite(lignes.map(conv), seuilHeures),
    parEnseignant: grouper((l) => l.enseignantId, (l) => `${l.enseignant} (${l.enseignantPublic})`),
    parGroupe: grouper((l) => l.groupeId, (l) => l.groupe),
    parSpecialite: grouper((l) => l.specialite ?? '—', (l) => l.specialite ?? 'Sans spécialité'),
  };
}

/** Lignes d'export (§133) : colonnes stables, délai au même calcul que partout. */
export function lignesExport(lignes: LigneQuestion[]): Record<string, string | number>[] {
  const d = (iso: string | null) => (iso ? new Date(iso).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }) : '');
  return lignes.map((l) => ({
    Promotion: l.promotion ?? l.groupe,
    Groupe: l.groupe,
    'Spécialité': l.specialite ?? '',
    Enseignant: l.enseignant,
    'Identité publique': l.enseignantPublic,
    'Date question': d(l.tagAt),
    'Date réponse': d(l.reponduAt),
    'Délai (heures)': l.delaiSecondes === null ? '' : Math.round((l.delaiSecondes / 3600) * 100) / 100,
    'Réponse < seuil': l.avantSeuil === null ? '' : l.avantSeuil ? 'oui' : 'non',
    Statut: l.statut === 'traitee' ? (l.traiteManuellement ? 'Traitée (marquée)' : 'Traitée') : l.statut === 'a_reaffecter' ? 'À réaffecter' : 'En attente',
    'Relance envoyée': l.relanceEnvoyee ? 'oui' : 'non',
    Question: l.extrait,
  }));
}
