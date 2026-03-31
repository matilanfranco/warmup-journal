"use client";

import { useEffect, useRef, useState } from "react";

const EXERCISES = [
  { title: "Soft hum — gentle release", duration: 200 },
  { title: "Jaw & neck relax", duration: 165 },
  { title: "Breath flow — final rest", duration: 240 },
];

const BREATH = [
  { text: "Breathe in...", dur: 3200, scale: "scale-100" },
  { text: "Hold...", dur: 1400, scale: "scale-75" },
  { text: "Breathe out...", dur: 5000, scale: "scale-50" },
  { text: "Rest...", dur: 1400, scale: "scale-75" },
] as const;

const TAGS = ["Breath release", "Soft hum", "Jaw relax", "~10 min"];

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CoolDownCard() {
  const [active, setActive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [exIdx, setExIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [breathIdx, setBreathIdx] = useState(0);

  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breathRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ex = EXERCISES[exIdx];
  const elapsed = Math.round((progress / 100) * ex.duration);
  const remaining = ex.duration - elapsed;

  const runBreath = (idx: number) => {
    setBreathIdx(idx);
    breathRef.current = setTimeout(() => runBreath((idx + 1) % BREATH.length), BREATH[idx].dur);
  };

  const open = () => { setActive(true); runBreath(0); };

  const close = () => {
    setActive(false); setPlaying(false); setProgress(0); setExIdx(0); setBreathIdx(0);
    if (playRef.current) clearInterval(playRef.current);
    if (breathRef.current) clearTimeout(breathRef.current);
  };

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      if (playRef.current) clearInterval(playRef.current);
    } else {
      setPlaying(true);
      const step = 100 / (ex.duration * 10);
      playRef.current = setInterval(() => {
        setProgress((p) => {
          const next = p + step;
          if (next >= 100) {
            clearInterval(playRef.current!);
            setPlaying(false);
            if (exIdx < EXERCISES.length - 1) {
              setTimeout(() => { setExIdx((i) => i + 1); setProgress(0); }, 600);
            }
            return 100;
          }
          return next;
        });
      }, 100);
    }
  };

  const skipNext = () => {
    if (exIdx < EXERCISES.length - 1) {
      setExIdx((i) => i + 1); setProgress(0); setPlaying(false);
      if (playRef.current) clearInterval(playRef.current);
    }
  };

  const skipPrev = () => {
    if (exIdx > 0) {
      setExIdx((i) => i - 1); setProgress(0); setPlaying(false);
      if (playRef.current) clearInterval(playRef.current);
    }
  };

  useEffect(() => () => {
    if (playRef.current) clearInterval(playRef.current);
    if (breathRef.current) clearTimeout(breathRef.current);
  }, []);

  const breath = BREATH[breathIdx];

  return (
    <div className="mx-4 bg-white rounded-3xl border border-[rgba(44,95,63,0.08)] shadow-sm overflow-hidden">

      {/* Top — always visible */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2
              className="text-[16px] text-[#1C2B22] mb-0.5"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Cool down
            </h2>
            <p className="text-[12px] text-[#8FA896]">
              Guided rest for your voice. Breath, hum, release.
            </p>
          </div>
          {!active ? (
            <button
              onClick={open}
              className="shrink-0 h-9 px-5 rounded-full bg-[#2C5F3F] text-white text-[12px] font-semibold active:scale-95 transition-transform"
            >
              Begin
            </button>
          ) : (
            <button
              onClick={close}
              className="shrink-0 h-9 px-5 rounded-full border border-[rgba(44,95,63,0.2)] text-[12px] font-medium text-[#5A7A65] hover:bg-[#F5F2EC] active:scale-95 transition-all"
            >
              End
            </button>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {TAGS.map((t) => (
            <span
              key={t}
              className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#F5F2EC] text-[#5A7A65] border border-[rgba(44,95,63,0.1)]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Dark section — when active */}
      {active && (
        <div className="bg-[#1A2E22] px-5 py-6">

          {/* Exercise tabs */}
          <div className="flex gap-2 mb-5">
            {EXERCISES.map((e, i) => (
              <button
                key={i}
                onClick={() => { setExIdx(i); setProgress(0); setPlaying(false); if (playRef.current) clearInterval(playRef.current); }}
                className={`flex-1 py-1.5 rounded-full text-[10px] font-semibold border transition-all ${
                  i === exIdx
                    ? "bg-[#2C5F3F] text-white border-[#2C5F3F]"
                    : i < exIdx
                    ? "bg-[#2C5F3F]/30 text-[#5DCAA5] border-[#2C5F3F]/30"
                    : "bg-transparent text-[#5A7A65] border-[rgba(93,202,165,0.2)]"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Track info */}
          <p className="text-[14px] font-semibold text-[#C8E6D4] mb-0.5">
            {ex.title}
          </p>
          <p className="text-[11px] text-[#5A7A65] mb-4">
            Exercise {exIdx + 1} of {EXERCISES.length} · {formatTime(remaining)} left
          </p>

          {/* Progress bar */}
          <div className="h-1 bg-[rgba(93,202,165,0.15)] rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-[#5DCAA5] rounded-full transition-all duration-100"
              style={{ width: `${Math.round(progress)}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-5 mb-6">
            <button
              onClick={skipPrev}
              disabled={exIdx === 0}
              className="w-10 h-10 rounded-full border border-[rgba(93,202,165,0.2)] flex items-center justify-center text-[#5DCAA5] disabled:opacity-30 active:scale-95 transition-transform"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M11 2L5 7L11 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 2V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-[#2C5F3F] flex items-center justify-center text-white active:scale-95 transition-transform shadow-lg"
            >
              {playing ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="2" width="4" height="12" rx="1.5" fill="white"/>
                  <rect x="9" y="2" width="4" height="12" rx="1.5" fill="white"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 2.5L13 8L4 13.5V2.5Z" fill="white"/>
                </svg>
              )}
            </button>

            <button
              onClick={skipNext}
              disabled={exIdx === EXERCISES.length - 1}
              className="w-10 h-10 rounded-full border border-[rgba(93,202,165,0.2)] flex items-center justify-center text-[#5DCAA5] disabled:opacity-30 active:scale-95 transition-transform"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 2L9 7L3 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11 2V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Breath guide */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full border border-[rgba(93,202,165,0.25)] flex items-center justify-center">
              <div
                className={`rounded-full bg-[#2C5F3F] transition-all duration-700 ${breath.scale}`}
                style={{ width: 32, height: 32 }}
              />
            </div>
            <p className="text-[13px] text-[#5DCAA5]" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
              {breath.text}
            </p>
          </div>

        </div>
      )}
    </div>
  );
}