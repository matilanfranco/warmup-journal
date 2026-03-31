"use client";

import { useEffect, useRef, useState } from "react";

export default function CoolDownAudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play(); setPlaying(true); }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => { setCurrent(a.currentTime); setProgress(duration ? (a.currentTime / duration) * 100 : 0); };
    const onLoad = () => setDuration(a.duration);
    const onEnd = () => { setPlaying(false); setProgress(0); setCurrent(0); };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onLoad);
    a.addEventListener("ended", onEnd);
    return () => { a.removeEventListener("timeupdate", onTime); a.removeEventListener("loadedmetadata", onLoad); a.removeEventListener("ended", onEnd); };
  }, [duration]);

  useEffect(() => {
    setPlaying(false); setProgress(0); setCurrent(0); setDuration(0);
    audioRef.current?.pause();
  }, [src]);

  return (
    <div className="bg-[#F5F8FF] rounded-2xl p-4 border border-[rgba(61,90,138,0.1)]">
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="h-1 bg-[#DDE6F5] rounded-full mb-3 cursor-pointer overflow-hidden" onClick={seek}>
        <div className="h-full bg-[#3D5A8A] rounded-full transition-all duration-100"
          style={{ width: `${Math.round(progress)}%` }} />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={toggle}
          className="w-9 h-9 rounded-full bg-[#3D5A8A] flex items-center justify-center shrink-0 active:scale-95 transition-transform">
          {playing ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="2" y="1.5" width="3" height="9" rx="1" fill="white"/>
              <rect x="7" y="1.5" width="3" height="9" rx="1" fill="white"/>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 1.5L10 6L3 10.5V1.5Z" fill="white"/>
            </svg>
          )}
        </button>
        <div className="flex-1 flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#7A90B0]">{fmt(current)}</span>
          <span className="text-[11px] text-[#B5C4B9]">{duration ? fmt(duration) : "--:--"}</span>
        </div>
      </div>
    </div>
  );
}