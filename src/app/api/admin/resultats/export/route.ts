import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { requireSuiviRequest } from '@/lib/suivi/roles';
import { createAdminClient } from '@/lib/supabase/admin';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { parseScope } from '@/lib/auth/permissions';
import { versCsv } from '@/lib/decouverte/csv';
import { chargerEvaluations, chargerJournal, elevesVisibles, nomsMatieres } from '@/lib/evaluations/historique';
import {
  CHAMP_LABEL, MENTION_TRACABILITE, RAISON_ARCHIVE, STATUT_LABEL, TYPE_COURT, filtresDepuisQuery, formatHeure, formatJour,
  libellePeriode, tableEvaluations, valeurLisible, type Evaluation,
} from '@/lib/evaluations/historique-core';
import { pdfEvaluations, type GroupePdf } from '@/lib/evaluations/export-pdf';
import type { Profile } from '@/lib/auth/get-profile';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

type ProfilExport = { id: string; first_name: string | null; last_name: string | null; email: string | null; promotion: string | null; permission_scope: unknown };

const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 60) || 'export';

/**
 * Exports de l'historique des évaluations (cahier des charges 06/10/2026, R5
 * et R6) : `user` = un candidat, sinon toute la sélection (promotion,
 * spécialité, candidat recherché…) ; `du` / `au` = période ; `format` = pdf,
 * xlsx ou csv. Les filtres sont ceux de l'écran (`filtresDepuisQuery` +
 * `chargerEvaluations`) : l'export reflète exactement la sélection affichée.
 * Équipe du suivi : bornée à son périmètre d'élèves.
 */
export async function GET(req: Request) {
  const g = await requireSuiviRequest(req, 'view');
  if (!g.ok) return g.error;
  const url = new URL(req.url);
  const sp = url.searchParams;
  const format = sp.get('format') === 'xlsx' ? 'xlsx' : sp.get('format') === 'pdf' ? 'pdf' : 'csv';
  const user = sp.get('user');
  if (user && !/^[0-9a-f-]{36}$/i.test(user)) return NextResponse.json({ error: 'Candidat invalide' }, { status: 400 });
  const f = filtresDepuisQuery(sp);
  const promotion = sp.get('promotion') || null;
  const recherche = sp.get('q') || null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createAdminClient() as any;
    let visibles: Set<string> | null = null;
    if (g.role !== 'admin') {
      const { data: profile } = await db.from('profiles').select('*').eq('id', g.userId).single();
      visibles = await elevesVisibles({ user: { id: g.userId }, profile: profile as Profile, role: g.role });
    }

    const [brutes, noms] = await Promise.all([
      chargerEvaluations({ ...f, userId: user ?? undefined, promotion: user ? null : promotion, recherche: user ? null : recherche }),
      nomsMatieres(),
    ]);
    const liste = visibles ? brutes.filter((e) => visibles.has(e.userId)) : brutes;
    if (user && visibles && !visibles.has(user)) return NextResponse.json({ error: 'Candidat hors de votre périmètre' }, { status: 403 });

    // Identité des candidats (y compris un candidat sans évaluation sur la période).
    const ids = user ? [user] : [...new Set(liste.map((e) => e.userId))];
    const profils = new Map<string, ProfilExport>();
    for (let i = 0; i < ids.length; i += 200) {
      const { data } = await db.from('profiles').select('id, first_name, last_name, email, promotion, permission_scope').in('id', ids.slice(i, i + 200)).eq('faculte_id', EDN_FACULTE_ID);
      for (const p of (data ?? []) as ProfilExport[]) profils.set(p.id, p);
    }
    if (user && !profils.has(user)) return NextResponse.json({ error: 'Candidat introuvable' }, { status: 404 });

    const periode = libellePeriode(f);
    const filtres = [
      `Période : ${periode}`,
      f.types && f.types.length > 0 ? `nature : ${f.types.map((t) => TYPE_COURT[t]).join(', ')}` : f.entrainement ? 'toutes natures, entraînement compris' : 'toutes les évaluations (hors entraînement)',
      f.specialite && `spécialité : ${noms.get(f.specialite) ?? f.specialite}`,
      f.statut && `statut : ${STATUT_LABEL[f.statut]}`,
      !user && promotion && `promotion : ${promotion}`,
      !user && recherche && `candidat : « ${recherche} »`,
      `${liste.length} évaluation(s)`,
    ].filter(Boolean).join(' · ');

    const identite = (p: ProfilExport) => {
      const s = parseScope(p.permission_scope);
      return {
        nom: [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email || 'Candidat',
        email: p.email, promotion: p.promotion, voie: s.voie ?? null,
        specialites: s.type === 'all' ? 'Toute l’offre' : s.colleges.filter((c) => c !== 'col-decouverte').map((c) => noms.get(c) ?? c).join(', '),
      };
    };
    const premier = user ? profils.get(user)! : null;
    const nomFichier = `evaluations-${slug(premier ? identite(premier).nom : promotion ? `promotion-${promotion}` : 'selection')}-${f.du ?? 'debut'}_${f.au ?? 'aujourdhui'}`;

    if (format === 'pdf') {
      const parCandidat = new Map<string, Evaluation[]>();
      for (const e of liste) parCandidat.set(e.userId, [...(parCandidat.get(e.userId) ?? []), e]);
      const groupes: GroupePdf[] = ids
        .filter((id) => profils.has(id))
        .map((id) => ({ candidat: identite(profils.get(id)!), evaluations: parCandidat.get(id) ?? [] }))
        .sort((a, b) => a.candidat.nom.localeCompare(b.candidat.nom, 'fr'));
      const pdf = await pdfEvaluations(groupes, {
        titre: premier ? `Évaluations & progression — ${identite(premier).nom}` : `Évaluations & progression — ${promotion ? `promotion ${promotion}` : 'sélection'} (${groupes.length} candidat${groupes.length > 1 ? 's' : ''})`,
        periode, filtres, courbe: !!premier, genereLe: new Date(),
      });
      return new NextResponse(new Uint8Array(pdf), {
        headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${nomFichier}.pdf"`, 'Cache-Control': 'no-store' },
      });
    }

    const table = tableEvaluations(liste, { identite: !user });
    if (format === 'xlsx') {
      const wb = XLSX.utils.book_new();
      const tete = premier ? [[`Candidat : ${identite(premier).nom}`], [`E-mail : ${premier.email ?? '—'} · promotion : ${premier.promotion ?? '—'} · voie : ${identite(premier).voie ?? '—'}`], [`Spécialité(s) : ${identite(premier).specialites || '—'}`], []] : [];
      const ws = XLSX.utils.aoa_to_sheet([...tete, table.entetes, ...table.lignes]);
      ws['!cols'] = table.entetes.map((h) => ({ wch: h === 'Intitulé' || h === 'Observation' ? 44 : Math.min(30, Math.max(10, h.length + 2)) }));
      XLSX.utils.book_append_sheet(wb, ws, 'Évaluations');
      if (premier) {
        const j = await chargerJournal(premier.id);
        const lignes = [
          ...j.corrections.map((c) => [formatJour(c.le), formatHeure(c.le), 'Correction', `${CHAMP_LABEL[c.champ] ?? c.champ} : ${valeurLisible(c.ancienne)} -> ${valeurLisible(c.nouvelle)}`, c.auteur ?? 'Traitement automatique', c.motif ?? '']),
          ...j.archives.map((a) => [formatJour(a.le), formatHeure(a.le), 'Archivage', `${RAISON_ARCHIVE[a.raison] ?? a.raison} — ${String(a.contexte.titre ?? '')}`.trim(), a.auteur ?? '', a.motif ?? '']),
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Date', 'Heure', 'Opération', 'Détail', 'Auteur', 'Motif'], ...lignes]), 'Journal');
      }
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Filtres'], [filtres], [], ['Généré le', `${formatJour(new Date().toISOString())} ${formatHeure(new Date().toISOString())}`], [], [MENTION_TRACABILITE]]), 'Filtres');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
      return new NextResponse(new Uint8Array(buf), {
        headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="${nomFichier}.xlsx"`, 'Cache-Control': 'no-store' },
      });
    }

    const csv = versCsv(table.entetes, table.lignes);
    return new NextResponse(csv, {
      headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${nomFichier}.csv"`, 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erreur' }, { status: 500 });
  }
}
