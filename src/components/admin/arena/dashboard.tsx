import Link from 'next/link';

/**
 * Tableau de bord d'un tournoi (maquette « 15. Administration ») : tuiles
 * KPI (inscriptions, participants par manche, taux), courbe des inscriptions
 * et des participations, top 5 du cumul provisoire. Rendu serveur, SVG pur.
 * Aucun effectif n'est exposé au public : ce bloc est réservé à l'admin.
 */
export type DashboardData = {
  status: string;
  openRound: number | null;
  registered: number;
  confirmed: number;
  rounds: { number: number; theme: string; done: number; started: number; state: 'unscheduled' | 'upcoming' | 'open' | 'closed' }[];
  retention: { label: string; value: string }[];
  /** Inscriptions cumulées par jour (ISO date → total). */
  registrationsByDay: { day: string; total: number }[];
  top: { rank: number; pseudo: string; total: number }[];
  eligible: number;
  marketing: number;
  reportsOpen: number;
  leaderboardHref: string;
};

const NAVY = '#0B0F14';
const RED = '#E4002B';

export function ArenaDashboard({ d }: { d: DashboardData }) {
  const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)} %` : '—');
  const tiles = [
    { label: 'Inscriptions totales', value: d.registered, sub: `${d.confirmed} confirmées (${pct(d.confirmed, d.registered)})` },
    ...d.rounds.map((r) => ({ label: `Participants M${r.number}`, value: r.done, sub: r.state === 'closed' || r.state === 'open' ? `Taux de participation ${pct(r.done, d.confirmed)}` : r.state === 'upcoming' ? 'À venir' : 'À programmer' })),
  ];

  /* Courbe : inscriptions cumulées par jour */
  const pts = d.registrationsByDay;
  const W = 520, H = 150, P = 18;
  const max = Math.max(1, ...pts.map((p) => p.total));
  const x = (i: number) => (pts.length <= 1 ? W / 2 : P + (i * (W - 2 * P)) / (pts.length - 1));
  const y = (v: number) => H - P - (v / max) * (H - 2 * P);
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.total).toFixed(1)}`).join(' ');
  const area = pts.length ? `${line} L${x(pts.length - 1).toFixed(1)},${(H - P).toFixed(1)} L${x(0).toFixed(1)},${(H - P).toFixed(1)} Z` : '';

  return (
    <section className="mb-6 overflow-hidden rounded-2xl" style={{ background: NAVY, color: '#F2F3F5', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10)' }}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: '#7E8794' }}>
          <span style={{ color: '#F2F3F5' }}>EVC</span> <span style={{ color: RED }}>ARENA</span> · Tableau de bord
        </p>
        <span className="rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ background: 'rgba(228,0,43,0.16)', color: '#FF3B57', boxShadow: 'inset 0 0 0 1px rgba(228,0,43,0.45)' }}>
          {d.status}{d.openRound ? ` · M${d.openRound}` : ''}
        </span>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl p-4" style={{ background: '#141A22', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: '#7E8794' }}>{t.label}</p>
            <p className="mt-1 text-[2.4rem] font-extrabold leading-none tabular-nums">{t.value}</p>
            <p className="mt-1.5 text-[11.5px]" style={{ color: '#B8BEC8' }}>{t.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 px-5 pb-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="rounded-xl p-4" style={{ background: '#141A22', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: '#7E8794' }}>Évolution des inscriptions (cumul)</p>
            <div className="flex flex-wrap gap-3 text-[11px]" style={{ color: '#B8BEC8' }}>
              {d.retention.map((r) => <span key={r.label}>{r.label} <b style={{ color: '#F2F3F5' }}>{r.value}</b></span>)}
            </div>
          </div>
          {pts.length === 0 ? (
            <p className="mt-6 text-center text-sm" style={{ color: '#7E8794' }}>Aucune inscription pour le moment.</p>
          ) : (
            <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-auto w-full" role="img" aria-label="Inscriptions cumulées par jour">
              <defs>
                <linearGradient id="arena-dash-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={RED} stopOpacity="0.45" />
                  <stop offset="1" stopColor={RED} stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75, 1].map((f) => <line key={f} x1={P} x2={W - P} y1={y(max * f)} y2={y(max * f)} stroke="rgba(255,255,255,0.07)" strokeDasharray="3 4" />)}
              <path d={area} fill="url(#arena-dash-area)" />
              <path d={line} fill="none" stroke={RED} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {pts.map((p, i) => <circle key={p.day} cx={x(i)} cy={y(p.total)} r="3" fill="#F2F3F5" />)}
              <text x={P} y={H - 2} fontSize="10" fill="#7E8794">{pts[0].day}</text>
              <text x={W - P} y={H - 2} fontSize="10" fill="#7E8794" textAnchor="end">{pts[pts.length - 1].day}</text>
              <text x={W - P} y={y(max) - 4} fontSize="10" fill="#B8BEC8" textAnchor="end">{max}</text>
            </svg>
          )}
          <div className="mt-3 grid grid-cols-3 gap-2 text-[11.5px]" style={{ color: '#B8BEC8' }}>
            <span>Éligibles au classement <b style={{ color: '#F2F3F5' }}>{d.eligible}</b></span>
            <span>Consentement marketing <b style={{ color: '#F2F3F5' }}>{d.marketing}</b></span>
            <span>Signalements ouverts <b style={{ color: d.reportsOpen ? '#FF3B57' : '#F2F3F5' }}>{d.reportsOpen}</b></span>
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ background: '#141A22', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: '#7E8794' }}>Top 5 cumul · provisoire</p>
          {d.top.length === 0 ? (
            <p className="mt-4 text-sm" style={{ color: '#7E8794' }}>Aucun participant classé (seuil non atteint ou aucune manche publiée).</p>
          ) : (
            <ol className="mt-2">
              {d.top.map((t) => (
                <li key={t.rank} className="flex items-center justify-between gap-3 py-2 text-sm" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="flex items-center gap-3"><span className="w-5 text-[15px] font-extrabold tabular-nums" style={{ color: t.rank <= 3 ? '#FF3B57' : '#7E8794' }}>{t.rank}</span>{t.pseudo}</span>
                  <span className="font-bold tabular-nums">{t.total.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} pts</span>
                </li>
              ))}
            </ol>
          )}
          <Link href={d.leaderboardHref} target="_blank" className="mt-4 inline-block rounded-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white" style={{ background: RED }}>
            Voir le classement complet ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
