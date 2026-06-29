'use client';

import { useCallback, useEffect } from 'react';

const HEARTBEAT_MS = 30_000;

export function PlatformTimer() {
  const sendHeartbeat = useCallback(async () => {
    try {
      await fetch('/api/student/heartbeat', { method: 'POST' });
    } catch { /* offline */ }
  }, []);

  useEffect(() => {
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, HEARTBEAT_MS);
    return () => clearInterval(interval);
  }, [sendHeartbeat]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') sendHeartbeat();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [sendHeartbeat]);

  return null;
}
