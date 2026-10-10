import { redirect } from 'next/navigation';
import { acteurBackOffice, peut, ressources } from '@/lib/echanges/serveur/admin';
import { contexteCriteres } from '@/lib/echanges/serveur/acces';
import { VueBibliotheque } from '@/components/admin/echanges/bibliotheque/vue-bibliotheque';

export const dynamic = 'force-dynamic';

/** Spécialités (collèges) de la plateforme ; liste vide si elles sont momentanément illisibles. */
async function specialitesPlateforme(): Promise<{ id: string; nom: string }[]> {
  try {
    return (await contexteCriteres()).specialites;
  } catch {
    return [];
  }
}

/**
 * Bibliothèque pédagogique permanente (CDC §34-35, §108, §119-122) : réponses
 * validées par les enseignants, indépendantes des promotions. Question
 * anonymisée par défaut (§120), réponse corrigeable (§121) avec sa date de
 * validation (§122).
 */
export default async function BibliothequePage({ searchParams }: { searchParams: Promise<{ q?: string; specialite?: string; publie?: string }> }) {
  const a = await acteurBackOffice();
  if (!a) redirect('/admin');
  if (!peut(a, 'bibliotheque')) redirect('/admin/echanges');

  const sp = await searchParams;
  const filtres = {
    q: sp.q?.trim().slice(0, 200) || '',
    specialite: sp.specialite?.trim().slice(0, 100) || '',
    publie: sp.publie === '1' || sp.publie === '0' ? sp.publie : '',
  };
  const [liste, specialites] = await Promise.all([
    ressources({ q: filtres.q || null, specialiteId: filtres.specialite || null, publie: filtres.publie ? filtres.publie === '1' : null }),
    specialitesPlateforme(),
  ]);

  // Spécialités déjà utilisées par des ressources mais absentes de la plateforme (renommées, retirées).
  const connues = new Set(specialites.map((s) => s.id));
  const extra = new Map<string, string>();
  for (const r of liste) if (r.specialiteId && !connues.has(r.specialiteId)) extra.set(r.specialiteId, r.specialiteNom ?? r.specialiteId);

  return (
    <VueBibliotheque
      ressources={liste}
      specialites={[...specialites, ...[...extra].map(([id, nom]) => ({ id, nom }))]}
      filtres={filtres}
    />
  );
}
