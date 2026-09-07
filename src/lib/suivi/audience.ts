import 'server-only';
import { listAppointments, listReports, listStudents, listMembers, suiviDb, type StudentLite } from './db';
import { buildAudience, type AudienceInput } from './students';

/**
 * Audience d'une campagne côté serveur (§2) : candidats « déjà suivis » =
 * au moins un compte rendu ou un rendez-vous réalisé, toutes campagnes
 * confondues.
 */
export async function computeFollowedIds(): Promise<Set<string>> {
  const [reports, done] = await Promise.all([listReports(), listAppointments({ statuses: ['done'] })]);
  const ids = new Set<string>();
  for (const r of reports) ids.add(r.user_id);
  for (const a of done) ids.add(a.user_id);
  return ids;
}

export async function computeAudience(input: AudienceInput): Promise<StudentLite[]> {
  const [students, followed] = await Promise.all([listStudents(), computeFollowedIds()]);
  return buildAudience(input, students, followed);
}

/**
 * Aligne les membres d'une campagne sur son ciblage : les nouveaux candidats
 * sont ajoutés (statut « ciblé ») ; les membres déjà invités ou suivis sont
 * conservés même s'ils sortent des critères (leur historique en dépend).
 */
export async function syncCampaignMembers(campaign: AudienceInput & { id: string }): Promise<{ added: number; removed: number; total: number }> {
  const [audience, existing] = await Promise.all([computeAudience(campaign), listMembers(campaign.id)]);
  const wanted = new Set(audience.map((s) => s.id));
  const have = new Set(existing.map((m) => m.user_id));
  const toAdd = audience.filter((s) => !have.has(s.id)).map((s) => ({ campaign_id: campaign.id, user_id: s.id, status: 'targeted' }));
  const toRemove = existing.filter((m) => !wanted.has(m.user_id) && m.status === 'targeted' && !m.invited_at);
  const db = suiviDb();
  for (let i = 0; i < toAdd.length; i += 500) {
    const { error } = await db.from('suivi_campaign_members').insert(toAdd.slice(i, i + 500));
    if (error) throw new Error(error.message);
  }
  // Suppression par lots : un `in()` de plusieurs centaines d'UUID dépasse la
  // longueur d'URL acceptée par PostgREST (ciblage large puis restreint).
  for (let i = 0; i < toRemove.length; i += 100) {
    const { error } = await db.from('suivi_campaign_members').delete().in('id', toRemove.slice(i, i + 100).map((m) => m.id));
    if (error) throw new Error(error.message);
  }
  return { added: toAdd.length, removed: toRemove.length, total: existing.length + toAdd.length - toRemove.length };
}
