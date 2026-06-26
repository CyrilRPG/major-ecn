'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';

const HEARTBEAT_MS = 30_000;

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}min`;
  if (m > 0) return `${m}min ${String(s).padStart(2, '0')}s`;
  return `${s}s`;
}

export function PlatformTimer() {
  const [weeklySeconds, setWeeklySeconds] = useState<number | null>(null);
  const [localElapsed, setLocalElapsed] = useState(0);
  const lastSyncRef = useRef(0);

  const sendHeartbeat = useCallback(async () => {
    try {
      const res = await fetch('/api/student/heartbeat', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setWeeklySeconds(data.weeklyTotalSeconds);
        setLocalElapsed(0);
        lastSyncRef.current = Date.now();
      }
    } catch { /* offline — keep counting locally */ }
  }, []);

  useEffect(() => {
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, HEARTBEAT_MS);
    return () => clearInterval(interval);
  }, [sendHeartbeat]);

  useEffect(() => {
    const tick = setInterval(() => setLocalElapsed((e) => e + 1), 1000);
    return () => clearInterval(tick);
  }, []);

  // Pause when tab not visible.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [sendHeartbeat]);

  if (weeklySeconds === null) return null;
  const display = weeklySeconds + localElapsed;

  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-(--color-surface-soft) px-2.5 py-1.5 text-xs font-semibold tabular-nums text-(--color-ink-soft)">
      <Clock className="h-3.5 w-3.5 text-(--color-primary)" />
      <span>{formatDuration(display)}</span>
      <span className="text-(--color-ink-muted)">cette semaine</span>
    </div>
  );
}
