'use client';

import { useEffect, useRef, useState } from 'react';
import { Maximize2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { formatDuration } from '@/lib/utils';
import { VIDEO_PAUSE_EVENT, VIDEO_PROGRESS_EVENT, type VideoProgressDetail } from '@/lib/emargement';

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export function VideoPlayer({ src, coursId }: { src: string; coursId: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [rate, setRate] = useState(1);
  const [markedDone, setMarkedDone] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onTime = async () => {
      setTime(v.currentTime);
      if (v.duration > 0) {
        // Alimente la barrière d'émargement (seuil à 20 %).
        window.dispatchEvent(
          new CustomEvent<VideoProgressDetail>(VIDEO_PROGRESS_EVENT, {
            detail: { coursId, ratio: v.currentTime / v.duration, seconds: v.currentTime },
          }),
        );
      }
      if (!markedDone && v.duration > 0 && v.currentTime / v.duration > 0.8) {
        setMarkedDone(true);
        const supabase = createClient();
        await supabase
          .from('course_progress')
          .upsert({ cours_id: coursId, video_watched: true, last_seen_at: new Date().toISOString(), user_id: (await supabase.auth.getUser()).data.user!.id });
      }
    };
    const onMeta = () => setDur(v.duration);
    // La barrière d'émargement demande la mise en pause tant que la signature
    // n'est pas enregistrée.
    const onGatePause = () => { v.pause(); setPlaying(false); };
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onMeta);
    window.addEventListener(VIDEO_PAUSE_EVENT, onGatePause);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onMeta);
      window.removeEventListener(VIDEO_PAUSE_EVENT, onGatePause);
    };
  }, [coursId, markedDone]);

  const toggle = () => {
    const v = ref.current; if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };
  const toggleMute = () => { const v = ref.current; if (!v) return; v.muted = !v.muted; setMuted(v.muted); };
  const cycleRate = () => {
    const v = ref.current; if (!v) return;
    const next = SPEEDS[(SPEEDS.indexOf(rate) + 1) % SPEEDS.length];
    v.playbackRate = next; setRate(next);
  };
  const fullscreen = () => { ref.current?.requestFullscreen?.(); };
  const seek = (pct: number) => {
    const v = ref.current; if (!v) return;
    v.currentTime = (pct / 100) * v.duration;
  };

  const pct = dur ? (time / dur) * 100 : 0;
  return (
    <div className="rounded-2xl bg-slate-950 overflow-hidden shadow-(--shadow-lifted)">
      <video ref={ref} src={src} className="w-full aspect-video object-contain" onClick={toggle} />
      <div className="bg-slate-950 px-5 py-4 flex flex-col gap-3">
        <input
          type="range"
          min={0}
          max={100}
          value={pct}
          step={0.1}
          onChange={(e) => seek(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/15 accent-(--color-primary)"
          aria-label="Position de lecture"
        />
        <div className="flex items-center justify-between text-white text-sm">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} className="text-white hover:bg-white/10 hover:text-white">
              {playing ? <Pause /> : <Play />}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/10 hover:text-white">
              {muted ? <VolumeX /> : <Volume2 />}
            </Button>
            <span className="font-mono text-xs text-white/70">{formatDuration(time)} / {formatDuration(dur)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={cycleRate} className="text-white hover:bg-white/10 hover:text-white font-mono">{rate}×</Button>
            <Button variant="ghost" size="icon" onClick={fullscreen} className="text-white hover:bg-white/10 hover:text-white"><Maximize2 /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
