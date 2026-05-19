'use client';

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type DataPoint = { label: string; value: number };

export function ActivityArea({ data }: { data: DataPoint[] }) {
  return (
    <div className="h-64 -mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="grad-activity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C1121F" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#C1121F" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" vertical={false} />
          <XAxis dataKey="label" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            formatter={(v) => [String(v), 'Sessions']}
            contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
          />
          <Area type="monotone" dataKey="value" stroke="#C1121F" strokeWidth={2} fill="url(#grad-activity)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopCoursesBar({ data }: { data: DataPoint[] }) {
  return (
    <div className="h-64 -mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" vertical={false} />
          <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} interval={0} />
          <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            formatter={(v) => [String(v), 'Tentatives']}
            contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
          />
          <Bar dataKey="value" fill="#C1121F" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SuccessRateBar({ data }: { data: DataPoint[] }) {
  return (
    <div className="h-72 -mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="label" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} width={120} />
          <Tooltip
            formatter={(v) => [`${Math.round(Number(v) || 0)}%`, 'Réussite']}
            contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
          />
          <Bar dataKey="value" fill="#E2231A" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
