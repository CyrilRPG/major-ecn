'use client';

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

type DataPoint = { label: string; value: number };
type Slice = { label: string; value: number; color: string };

const AXIS = '#9AA1AE';
const GRID = 'rgba(148,163,184,0.18)';
const RED = '#E11D48';
const TOOLTIP = {
  borderRadius: 12,
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
} as const;

export function ActivityArea({ data, height = 256 }: { data: DataPoint[]; height?: number }) {
  return (
    <div className="-mx-1" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="grad-activity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={RED} stopOpacity={0.22} />
              <stop offset="100%" stopColor={RED} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis dataKey="label" stroke={AXIS} fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke={AXIS} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip formatter={(v) => [String(v), 'Sessions']} contentStyle={TOOLTIP} />
          <Area type="monotone" dataKey="value" stroke={RED} strokeWidth={2.5} fill="url(#grad-activity)" dot={{ r: 3, fill: RED }} />
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
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis dataKey="label" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} interval={0} />
          <YAxis stroke={AXIS} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip formatter={(v) => [String(v), 'Tentatives']} contentStyle={TOOLTIP} />
          <Bar dataKey="value" fill={RED} radius={[8, 8, 0, 0]} />
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
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
          <XAxis type="number" domain={[0, 100]} stroke={AXIS} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="label" stroke={AXIS} fontSize={12} tickLine={false} axisLine={false} width={120} />
          <Tooltip formatter={(v) => [`${Math.round(Number(v) || 0)}%`, 'Réussite']} contentStyle={TOOLTIP} />
          <Bar dataKey="value" fill={RED} radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ActivityDonut({ data, size = 176 }: { data: Slice[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex items-center gap-4">
      <div className="shrink-0" style={{ height: size, width: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="92%"
              paddingAngle={1.5}
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.label} fill={d.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => [String(v), 'Activités']} contentStyle={TOOLTIP} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex-1 space-y-2">
        {data.map((d) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <li key={d.label} className="flex items-center gap-2.5 text-sm">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
              <span className="flex-1 text-(--color-ink-soft)">{d.label}</span>
              <span className="font-semibold tabular-nums text-(--color-ink)">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
