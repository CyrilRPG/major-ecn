import 'server-only';
import { qdb } from '@/lib/qualite/serveur/base';
import { dateFr } from '@/lib/qualite/format';

/** Documents justificatifs d'un objet (liens signés, valables une heure). */
export async function ListeDocuments({ objetType, objetId }: { objetType: string; objetId: string }) {
  const db = qdb();
  const { data } = await db.from('qualite_documents').select('id, nom, chemin, url, created_at').eq('objet_type', objetType).eq('objet_id', objetId).order('created_at');
  const docs = (data ?? []) as { id: string; nom: string; chemin: string | null; url: string | null; created_at: string }[];
  if (!docs.length) return <p className="text-xs text-(--color-ink-muted)">Aucun document justificatif.</p>;
  const liens = await Promise.all(docs.map(async (d) => {
    if (d.url) return d.url;
    const { data: s } = await db.storage.from('qualite').createSignedUrl(d.chemin as string, 3600);
    return (s as { signedUrl?: string } | null)?.signedUrl ?? null;
  }));
  return (
    <ul className="flex flex-col gap-1 text-sm">
      {docs.map((d, i) => (
        <li key={d.id}>{liens[i] ? <a href={liens[i] as string} target="_blank" rel="noopener noreferrer" className="text-(--color-primary) hover:underline">{d.nom}</a> : d.nom} <span className="text-xs text-(--color-ink-muted)">{dateFr(d.created_at)}</span></li>
      ))}
    </ul>
  );
}
