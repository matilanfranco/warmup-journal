"use client";

import { useEffect, useRef, useState } from "react";

const BREATH_CYCLE = [
  { text: "Breathe in...", duration: 3200, size: "w-7 h-7" },
  { text: "Hold...", duration: 1400, size: "w-5 h-5" },
  { text: "Breathe out...", duration: 5000, size: "w-3 h-3" },
  { text: "Rest...", duration: 1400, size: "w-5 h-5" },
] as const;

const EXERCISES = [
  { title: "Soft hum — gentle release", info: "Exercise 1 of 3 · 3:20", duration: 200 },
  { title: "Jaw & neck relax", info: "Exercise 2 of 3 · 2:45", duration: 165 },
  { title: "Breath flow — final rest", info: "Exercise 3 of 3 · 4:00", duration: 240 },
];

const TAGS = ["Breath release", "Soft hum", "Jaw relax", "~10 min"];

export default function CoolDownCard() {
  const [active, setActive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [breathIdx, setBreathIdx] = useState(0);

  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breathRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const exercise = EXERCISES[exerciseIdx];
  const breath = BREATH_CYCLE[breathIdx];

  const runBreath = (idx: number) => {
    setBreathIdx(idx);
    breathRef.current = setTimeout(() => {
      runBreath((idx + 1) % BREATH_CYCLE.length);
    }, BREATH_CYCLE[idx].duration);
  };

  const open = () => {
    setActive(true);
    runBreath(0);
  };

  const close = () => {
    setActive(false);
    setPlaying(false);
    setProgress(0);
    setExerciseIdx(0);
    setBreathIdx(0);
    if (playRef.current) clearInterval(playRef.current);
    if (breathRef.current) clearTimeout(breathRef.current);
  };

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      if (playRef.current) clearInterval(playRef.current);
    } else {
      setPlaying(true);
      const step = 100 / (exercise.duration * 10);
      playRef.current = setInterval(() => {
        setProgress((p) => {
          const next = p + step;
          if (next >= 100) {
            clearInterval(playRef.current!);
            setPlaying(false);
            if (exerciseIdx < EXERCISES.length - 1) {
              setTimeout(() => {
                setExerciseIdx((i) => i + 1);
                setProgress(0);
              }, 600);
            }
            return 100;
          }
          return next;
        });
      }, 100);
    }
  };

  useEffect(() => {
    return () => {
      if (playRef.current) clearInterval(playRef.current);
      if (breathRef.current) clearTimeout(breathRef.current);
    };
  }, []);

  return (
    <div className="rounded-3xl border border-emerald-900/10 overflow-hidden shadow-sm">

      {/* Top — always visible */}
      <div className="bg-white p-5 sm:p-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-extrabold text-emerald-950/90">Cool down</p>
          <p className="text-sm text-emerald-900/70 mt-1">
            Guided rest for your voice. Breath, hum, release.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-emerald-900/10 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-900/80"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {!active ? (
          <button
            type="button"
            onClick={open}
            className="shrink-0 inline-flex h-10 items-center rounded-full bg-emerald-700 px-5 text-sm font-extrabold text-white hover:bg-emerald-800 active:scale-[0.98] transition-colors"
          >
            Begin
          </button>
        ) : (
          <button
            type="button"
            onClick={close}
            className="shrink-0 inline-flex h-10 items-center rounded-full border border-emerald-900/15 bg-emerald-50 px-5 text-sm font-extrabold text-emerald-800 hover:bg-emerald-100 active:scale-[0.98] transition-colors"
          >
            End
          </button>
        )}
      </div>

      {/* Dark section — only when active */}
      {active && (
        <div className="bg-[#0d1f13] px-5 py-6 sm:px-6">
          <p className="text-[10px] tracking-[2.5px] uppercase text-teal-400 font-black mb-2">
            Cool down
          </p>
          <p className="text-xl font-extrabold text-teal-200 italic mb-1">
            Rest your voice.
          </p>
          <p className="text-sm text-teal-400/80 mb-6 leading-relaxed">
            Follow the breath. Let go of the performance.
          </p>

          {/* Player */}
          <div className="rounded-2xl bg-[#152a18] border border-teal-900/40 p-4 mb-5">
            <p className="text-sm font-extrabold text-teal-200 mb-0.5">
              {exercise.title}
            </p>
            <p className="text-xs text-teal-400 mb-3">{exercise.info}</p>

            <div className="h-1 bg-teal-900/40 rounded-full mb-4 overflow-hidden">
              <div
                className="h-full bg-teal-400 rounded-full"
                style={{ width: `${Math.round(progress)}%`, transition: "width 0.1s linear" }}
              />
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setProgress(0);
                  setPlaying(false);
                  if (playRef.current) clearInterval(playRef.current);
                }}
                className="w-9 h-9 rounded-full border border-teal-700/50 flex items-center justify-center text-teal-400 text-xs hover:border-teal-400 transition-colors"
              >
                &#9198;
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-teal-700 flex items-center justify-center text-teal-100 text-base hover:bg-teal-600 active:scale-95 transition-colors"
              >
                {playing ? "⏸" : "▶"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (exerciseIdx < EXERCISES.length - 1) {
                    setExerciseIdx((i) => i + 1);
                    setProgress(0);
                    setPlaying(false);
                    if (playRef.current) clearInterval(playRef.current);
                  }
                }}
                className="w-9 h-9 rounded-full border border-teal-700/50 flex items-center justify-center text-teal-400 text-xs hover:border-teal-400 transition-colors"
              >
                &#9197;
              </button>
            </div>
          </div>

          {/* Breath guide */}
          <div className="flex flex-col items-center py-2 mb-2">
            <div className="w-14 h-14 rounded-full border border-teal-700/50 flex items-center justify-center mb-3">
              <div
                className={`rounded-full bg-teal-700 transition-all duration-700 ${breath.size}`}
              />
            </div>
            <p className="text-sm text-teal-400 italic">{breath.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}