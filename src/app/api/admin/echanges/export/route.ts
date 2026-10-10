import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getRequestUser } from '@/lib/auth/bearer';
import { chargerActeur, compteOuvert } from '@/lib/echanges/serveur/acces';
import { auditer } from '@/lib/echanges/serveur/base';
import { lignesExport, lignesQuestions, type FiltresStats } from '@/lib/echanges/serveur/stats';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Export de la réactivité des enseignants (§133) en CSV ou Excel : mêmes
 * filtres et même calcul du délai que l'écran Statistiques. Réservé aux
 * niveaux dotés de « statistiques » ET « exporter » ; chaque export est tracé.
 */
export async function GET(req: Request) {
  const auth = await getRequestUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const a = await chargerActeur(auth.user.id);
  if (!a || !compteOuvert(a) || !a.capacites.has('statistiques') || !a.capacites.has('exporter')) {
    return NextResponse.json({ error: 'Export réservé à l’administration des échanges.' }, { status: 403 });
  }
  const u = new URL(req.url);
  const etat = u.searchParams.get('etat');
  const f: FiltresStats = {
    enseignantId: u.searchParams.get('enseignant') || null,
    specialiteId: u.searchParams.get('specialite') || null,
    groupeId: u.searchParams.get('groupe') || null,
    depuis: u.searchParams.get('depuis') || null,
    jusqua: u.searchParams.get('jusqua') || null,
    etat: etat === 'repondu' || etat === 'non_repondu' || etat === 'retard' ? etat : 'tous',
  };
  if (a.staffGroupes && (!f.groupeId || !a.staffGroupes.includes(f.groupeId))) {
    return NextResponse.json({ error: 'Choisissez une promotion de votre périmètre.' }, { status: 403 });
  }
  const { lignes } = await lignesQuestions(f);
  const donnees = lignesExport(lignes);
  await auditer({ action: 'export_donnees', acteurId: a.id, acteurRole: a.role, groupeId: f.groupeId ?? null, details: { type: 'reactivite', lignes: donnees.length, filtres: f } });
  const nom = `echanges-reactivite-${new Date().toISOString().slice(0, 10)}`;
  if (u.searchParams.get('format') === 'xlsx') {
    const feuille = XLSX.utils.json_to_sheet(donnees);
    const classeur = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(classeur, feuille, 'Réactivité');
    const tampon = XLSX.write(classeur, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
    return new NextResponse(new Uint8Array(tampon), {
      headers: {
        'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'content-disposition': `attachment; filename="${nom}.xlsx"`,
        'cache-control': 'no-store',
      },
    });
  }
  const colonnes = donnees.length ? Object.keys(donnees[0]) : ['Promotion', 'Groupe', 'Spécialité', 'Enseignant', 'Date question', 'Date réponse', 'Délai (heures)', 'Statut'];
  const cellule = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
  };
  const csv = '﻿' + [colonnes.map(cellule).join(';'), ...donnees.map((l) => colonnes.map((c) => cellule(l[c])).join(';'))].join('\r\n');
  return new NextResponse(csv, {
    headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="${nom}.csv"`, 'cache-control': 'no-store' },
  });
}
