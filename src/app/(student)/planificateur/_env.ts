import 'server-only';
import { randomUUID } from 'node:crypto';
import { monitorEventLoopDelay, type IntervalHistogram } from 'node:perf_hooks';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { requireUser } from '@/lib/auth/require-role';
import { ensureFresh } from '@/lib/plan/engine';
import { migrateLegacyProfile } from '@/lib/plan/operations';
import { plannerEnv, type PlannerEnv } from '@/lib/plan/pages';

/*
 * Relevé de temps de « Mon planning » (diagnostic des pics de 2,5 à 4 s mesurés
 * en prod le 06/10/2026, ni dans la base ni dans le code du planificateur) :
 * une ligne « [plan-perf] » par page servie, sans aucune donnée personnelle.
 * Elle dit si le temps se perd dans nos étapes ou avant elles (instance qui
 * démarre, page chargée pour la première fois par ce processus, boucle
 * d'événements bloquée par une autre requête de la même instance).
 */
type PlanPerf = { instance: string; routesVues: Set<string>; simultanees: number; boucle: IntervalHistogram | null };
// Sur globalThis : un seul relevé par processus, même si chaque route charge sa propre copie de ce module.
const relevePartage = globalThis as typeof globalThis & { __planPerf?: PlanPerf };
const perf: PlanPerf = (relevePartage.__planPerf ??= {
  instance: randomUUID().slice(0, 6),
  routesVues: new Set<string>(),
  simultanees: 0,
  boucle: (() => {
    try {
      const h = monitorEventLoopDelay({ resolution: 20 });
      h.enable();
      return h;
    } catch {
      return null;
    }
  })(),
});

/** Route servie, sans identifiant (en-tête posé par le routeur Vercel). */
function routeDe(h: Headers): string {
  const brut = (h.get('x-matched-path') || h.get('x-invoke-path') || '').split('?')[0];
  return brut ? brut.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id') : '?';
}

/**
 * Contexte d'une page « Mon planning » : profil migré vers la V4.1 si besoin,
 * planning remis à jour (journée changée, recalcul demandé par le moteur
 * central), sinon premier lancement.
 */
export async function pageEnv(): Promise<PlannerEnv> {
  const t0 = Date.now();
  const h = await headers();
  const route = routeDe(h);
  const rsc = h.get('rsc') === '1';
  const age = Math.round(process.uptime());
  const premiere = !perf.routesVues.has(route);
  perf.routesVues.add(route);
  const etapes: string[] = [];
  let t = Date.now();
  const etape = (nom: string) => { const n = Date.now(); etapes.push(`${nom}=${n - t}`); t = n; };

  const { user } = await requireUser();
  etape('auth');
  await migrateLegacyProfile(user.id).catch((e) => console.error('[plan] migration V4.1 :', e instanceof Error ? e.message : e));
  etape('migr');
  const recalcul = await ensureFresh(user.id);
  etape('frais');
  const env = await plannerEnv(user.id);
  etape('ctx');
  if (!env) redirect('/planificateur/onboarding');

  perf.simultanees++;
  const simult = perf.simultanees;
  try {
    // Après la réponse : `total` couvre aussi les données et le rendu propres à la page.
    after(() => {
      perf.simultanees--;
      const lag = perf.boucle ? Math.round(perf.boucle.max / 1e6) : -1;
      perf.boucle?.reset();
      const ou = [process.env.VERCEL_REGION, process.env.VERCEL_DEPLOYMENT_ID].filter(Boolean).join(' ');
      console.log(`[plan-perf] ${route} ${rsc ? 'rsc' : 'html'} total=${Date.now() - t0} ${etapes.join(' ')}${recalcul ? ' recalcul=oui' : ''} instance=${perf.instance} age=${age}s 1re=${premiere ? 'oui' : 'non'} boucle=${lag} simult=${simult}${ou ? ` ${ou}` : ''}`);
    });
  } catch {
    perf.simultanees--;
  }
  return env;
}
