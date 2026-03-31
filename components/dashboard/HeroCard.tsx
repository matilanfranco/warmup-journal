"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAudioById } from "@/components/data/audioLibrary";

const PERSONAL_ROUTINE_KEY = "personalRoutineItems";
const STREAK = 6;

const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export default function HeroCard() {
  const [routineIds, setRoutineIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(PERSONAL_ROUTINE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setRoutineIds(parsed);
      } catch {}
    }
    setLoaded(true);
  }, []);

  const items = routineIds.map((id) => getAudioById(id)).filter(Boolean);
  const totalSec = items.reduce((acc, item) => acc + (item?.durationSec ?? 0), 0);
  const totalMin = Math.round(totalSec / 60) || 0;
  const preview = items.slice(0, 3).map((i) => i!.name.split(" ")[0]);

  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;
  const completedDays = Array.from({ length: 7 }, (_, i) => i < todayIdx);

  const date = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="mx-4 rounded-3xl overflow-hidden shadow-sm border border-white/60">
      {/* Background image area */}
      <div
        className="relative px-5 pt-6 pb-5"
        style={{
          backgroundImage: "url('/hero-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        {/* Soft overlay so text is readable */}
        <div className="absolute inset-0 bg-white/55" />

        <div className="relative z-10">
          {/* Title */}
          <h1
            className="text-[28px] leading-tight mb-2 text-[#1C2B22]"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Today's warmup
          </h1>

          {/* Streak */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base">🔥</span>
            <p className="text-[13px] text-[#3D4A3E]">
              You've kept your voice routine for{" "}
              <span className="font-bold text-[#1C2B22]">{STREAK} days</span>
            </p>
          </div>

          {/* Date */}
          <p className="text-[12px] text-[#8FA896] mb-5">{date}</p>

          {/* CTA */}
          <Link
            href="/session"
            className="flex items-center justify-center gap-2 w-full h-12 rounded-full text-[15px] font-semibold text-white tracking-wide active:scale-[0.98] transition-transform"
            style={{ background: "linear-gradient(135deg, #2C5F3F 0%, #3D7A55 100%)" }}
          >
            Start session →
          </Link>

          {/* Secondary row */}
          <div className="flex gap-2 mt-3">
            {loaded && preview.length > 0 && (
              <div className="flex-1 flex items-center h-9 rounded-full bg-white/70 border border-white/80 px-3 gap-1.5">
                {preview.map((name, i) => (
                  <span key={i} className="text-[11px] text-[#3D4A3E] font-medium">
                    {name}{i < preview.length - 1 ? " · " : ""}
                  </span>
                ))}
                {items.length > 3 && (
                  <span className="text-[11px] text-[#8FA896]">· +{items.length - 3}</span>
                )}
              </div>
            )}
            <Link
              href="/warmups/routine"
              className="flex items-center justify-center h-9 rounded-full bg-white/70 border border-white/80 px-4 text-[12px] font-medium text-[#2C5F3F] whitespace-nowrap"
            >
              Customize
            </Link>
          </div>
        </div>
      </div>

      {/* Weekly strip */}
      <div className="bg-white px-5 py-4">
        <div className="flex items-center justify-between">
          {WEEK_DAYS.map((day, i) => {
            const isToday = i === todayIdx;
            const done = completedDays[i];
            return (
              <div key={day} className="flex flex-col items-center gap-1.5">
                <span
                  className={`text-[11px] font-medium ${
                    isToday ? "text-[#2C5F3F] font-bold" : "text-[#B5C4B9]"
                  }`}
                >
                  {day}
                </span>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    isToday
                      ? "bg-[#2C5F3F]"
                      : done
                      ? "bg-[#EAF0EB]"
                      : "bg-transparent"
                  }`}
                >
                  {(done || isToday) && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke={isToday ? "white" : "#3D7A55"}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats row */}
        <div className="flex gap-3 mt-4 pt-4 border-t border-[rgba(44,95,63,0.07)]">
          {[
            { label: "Streak", value: `${STREAK}d` },
            { label: "This week", value: `${todayIdx + 1}` },
            { label: "Avg rating", value: "4.2" },
          ].map((s) => (
            <div key={s.label} className="flex-1 text-center">
              <p className="text-[10px] text-[#8FA896] tracking-widest uppercase font-medium">
                {s.label}
              </p>
              <p className="text-[18px] font-bold text-[#1C2B22] mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}