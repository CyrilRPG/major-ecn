import { NextResponse } from 'next/server';
import { requireStaffRequest } from '@/lib/auth/api-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { STATUT_TACHE_LABEL, PRIORITE_LABEL, libelleCategorie, type StatutTache, type Priorite } from '@/lib/cockpit/regles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Export CSV du cockpit (§11 : export des tâches et conversations). Strictement
 * personnel (C18) : ses propres tâches et ses propres conversations, jamais
 * celles d'un autre administrateur.
 */

const cellule = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v);
  // Neutralise les formules à l'ouverture dans un tableur.
  const sur = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${sur.replace(/"/g, '""')}"`;
};
const csv = (lignes: unknown[][]) => '﻿' + lignes.map((l) => l.map(cellule).join(';')).join('\r\n');

export async function GET(req: Request) {
  const guard = await requireStaffRequest(req);
  if (!guard.ok) return guard.error;
  const uid = guard.auth.user.id;
  const type = new URL(req.url).searchParams.get('type') === 'conversations' ? 'conversations' : 'taches';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = createAdminClient() as any;

  let contenu: string;
  if (type === 'taches') {
    const { data } = await d.from('cockpit_taches')
      .select('titre, statut, priorite, categorie, echeance, heure, recurrence, lien_label, description, notes, created_at, terminee_at, archivee_at')
      .eq('owner_id', uid).order('created_at').limit(10000);
    contenu = csv([
      ['Titre', 'Statut', 'Priorité', 'Catégorie', 'Échéance', 'Heure', 'Récurrence', 'Lien', 'Description', 'Notes', 'Créée le', 'Terminée le', 'Archivée le'],
      ...((data ?? []) as Record<string, string | null>[]).map((t) => [
        t.titre, STATUT_TACHE_LABEL[t.statut as StatutTache] ?? t.statut, PRIORITE_LABEL[t.priorite as Priorite] ?? t.priorite,
        libelleCategorie(t.categorie ?? ''), t.echeance, t.heure?.slice(0, 5), t.recurrence, t.lien_label, t.description, t.notes,
        t.created_at, t.terminee_at, t.archivee_at,
      ]),
    ]);
  } else {
    const { data: convs } = await d.from('cockpit_conversations').select('id, sujet, interlocuteur_label, interlocuteur_type').eq('owner_id', uid).limit(5000);
    const lignes: unknown[][] = [['Conversation', 'Interlocuteur', 'Type', 'Sens', 'Date', 'Message']];
    const liste = (convs ?? []) as { id: string; sujet: string; interlocuteur_label: string; interlocuteur_type: string }[];
    for (let i = 0; i < liste.length; i += 100) {
      const lot = liste.slice(i, i + 100);
      const { data: ms } = await d.from('cockpit_messages').select('conversation_id, sens, corps, created_at')
        .in('conversation_id', lot.map((c) => c.id)).eq('brouillon', false).order('created_at').limit(20000);
      const parId = new Map(lot.map((c) => [c.id, c]));
      for (const m of (ms ?? []) as { conversation_id: string; sens: string; corps: string; created_at: string }[]) {
        const c = parId.get(m.conversation_id)!;
        lignes.push([c.sujet, c.interlocuteur_label, c.interlocuteur_type, m.sens === 'sortant' ? 'Envoyé' : 'Reçu', m.created_at, m.corps]);
      }
    }
    contenu = csv(lignes);
  }
  return new NextResponse(contenu, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="cockpit-${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
      'cache-control': 'no-store',
    },
  });
}
