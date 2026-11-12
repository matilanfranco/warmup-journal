"use client";

import { useEffect, useMemo, useState } from "react";
import DayCard, { DayEntry } from "@/components/calendar/DayCard";
import { ExportCard } from "@/components/ExportForAI";
import RoutineInsights from "@/components/calendar/RoutineInsights";
import {
  getSessionsInRange, getShowsInRange, getCoolDownsInRange, getRestDaysInRange, getStreak,
  SessionRecord, DayShows, CoolDownRecord, RestDayData,
} from "@/lib/firebaseService";
import { getAppDate, shiftDate, toDateStr } from "@/lib/dateUtils";

const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const DOTS = [
  { key: "session", color: "#2C5F3F", label: "Warmup" },
  { key: "shows", color: "#C9973F", label: "Show" },
  { key: "cooldown", color: "#6B5B9E", label: "Cool down" },
  { key: "restDay", color: "#2A7EBF", label: "Day off" },
] as const;

type Loaded = {
  sessions: SessionRecord[];
  shows: DayShows[];
  cooldowns: CoolDownRecord[];
  restDays: RestDayData[];
};

function monthBounds(year: number, month: number) {
  return { first: toDateStr(new Date(year, month, 1)), last: toDateStr(new Date(year, month + 1, 0)) };
}

export default function CalendarPage() {
  const today = getAppDate();
  const [ty, tm] = today.split("-").map(Number);
  const [view, setView] = useState({ year: ty, month: tm - 1 });
  const [selected, setSelected] = useState(today);
  const [data, setData] = useState<Loaded | null>(null);
  const [streak, setStreak] = useState<number | null>(null);

  const { first, last } = monthBounds(view.year, view.month);
  const isCurrentMonth = view.year === ty && view.month === tm - 1;

  useEffect(() => {
    getStreak().then(setStreak).catch(() => setStreak(0));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    // Load 60 extra days before the month so day-off run summaries have context.
    const from = shiftDate(first, -60);
    Promise.all([
      getSessionsInRange(from, last),
      getShowsInRange(from, last),
      getCoolDownsInRange(from, last),
      getRestDaysInRange(from, last),
    ])
      .then(([sessions, shows, cooldowns, restDays]) => {
        if (!cancelled) setData({ sessions, shows, cooldowns, restDays });
      })
      .catch((e) => console.error("Calendar load error:", e));
    return () => { cancelled = true; };
  }, [first, last]);

  const byDate = useMemo(() => {
    const map: Record<string, DayEntry> = {};
    const get = (date: string) => (map[date] ??= { date });
    data?.sessions.forEach((s) => { get(s.date).session = s; });
    data?.shows.forEach((s) => { if (s.shows.length) get(s.date).shows = s; });
    data?.cooldowns.forEach((c) => { get(c.date).cooldown = c; });
    data?.restDays.forEach((r) => { get(r.date).restDay = r; });
    return map;
  }, [data]);

  // Grid cells, Monday first
  const cells = useMemo(() => {
    const firstDow = (new Date(view.year, view.month, 1).getDay() + 6) % 7;
    const days = new Date(view.year, view.month + 1, 0).getDate();
    const out: (string | null)[] = Array(firstDow).fill(null);
    for (let d = 1; d <= days; d++) out.push(toDateStr(new Date(view.year, view.month, d)));
    while (out.length % 7) out.push(null);
    return out;
  }, [view]);

  const monthStats = useMemo(() => {
    const inMonth = <T extends { date: string }>(list: T[] = []) => list.filter((x) => x.date >= first && x.date <= last);
    const shows = inMonth(data?.shows).flatMap((d) => d.shows);
    const ratings = shows.flatMap((s) => Object.values(s.ratings ?? {}) as number[]).filter((v) => v > 0);
    return {
      warmups: inMonth(data?.sessions).length,
      shows: shows.length,
      avgShow: ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null,
    };
  }, [data, first, last]);

  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" })
    .format(new Date(view.year, view.month, 1));

  const moveMonth = (delta: number) =>
    setView(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const selectedEntry = byDate[selected];

  return (
    <main className="min-h-screen bg-[#F5F2EC]">
      <div className="mx-auto max-w-md px-4 pt-2 pb-28 space-y-4">
        <div>
          <h1 className="text-[28px] text-[#1C2B22] leading-tight mb-1"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 400 }}>
            Calendar
          </h1>
          <p className="text-[13px] text-[#8FA896]">Your voice history, at a glance.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Streak", value: streak === null ? "..." : streak > 0 ? `${streak}d` : "—" },
            { label: "Warmups", value: data ? `${monthStats.warmups}` : "..." },
            { label: "Shows", value: data ? `${monthStats.shows}` : "..." },
            { label: "Avg show", value: data ? (monthStats.avgShow !== null ? `${monthStats.avgShow}` : "—") : "..." },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-[rgba(44,95,63,0.08)] shadow-sm px-2 py-3 text-center">
              <p className="text-[18px] font-bold text-[#1C2B22] leading-none">{s.value}</p>
              <p className="text-[9px] font-black tracking-widest uppercase text-[#8FA896] mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Month grid */}
        <div className="bg-white rounded-3xl border border-[rgba(44,95,63,0.08)] shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => moveMonth(-1)} aria-label="Previous month"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#5A7A65] hover:bg-[#F5F2EC] active:scale-95">‹</button>
            <p className="text-[15px] text-[#1C2B22]" style={{ fontFamily: "'Playfair Display', serif" }}>{monthLabel}</p>
            <button onClick={() => moveMonth(1)} disabled={isCurrentMonth} aria-label="Next month"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#5A7A65] hover:bg-[#F5F2EC] active:scale-95 disabled:opacity-25">›</button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEK_DAYS.map((d) => (
              <p key={d} className="text-[10px] font-bold text-[#B5C4B9] text-center">{d}</p>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, i) => {
              if (!date) return <div key={i} />;
              const entry = byDate[date];
              const isFuture = date > today;
              const isSel = date === selected;
              const isToday = date === today;
              return (
                <button key={date} disabled={isFuture} onClick={() => setSelected(date)}
                  className={`h-11 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors ${
                    isSel ? "bg-[#EAF0EB] ring-1 ring-[rgba(44,95,63,0.3)]" : "hover:bg-[#F9F8F5]"
                  } disabled:opacity-30`}>
                  <span className={`text-[12px] leading-none ${isToday ? "font-bold text-[#2C5F3F]" : "text-[#3D4A3E]"}`}>
                    {Number(date.slice(8))}
                  </span>
                  <span className="flex gap-0.5 h-1.5">
                    {entry && DOTS.filter((d) => entry[d.key]).map((d) => (
                      <span key={d.key} className="w-1.5 h-1.5 rounded-full" style={{ background: d.color }} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3 pt-3 border-t border-[rgba(44,95,63,0.07)]">
            {DOTS.map((d) => (
              <span key={d.key} className="flex items-center gap-1 text-[10px] text-[#8FA896]">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: d.color }} />{d.label}
              </span>
            ))}
          </div>
        </div>

        {/* Selected day */}
        {!data ? (
          <div className="h-16 rounded-2xl bg-white animate-pulse" />
        ) : selectedEntry ? (
          <DayCard key={selected} entry={selectedEntry} defaultOpen
            allShows={data.shows} allSessions={data.sessions} allRestDays={data.restDays} />
        ) : (
          <div className="bg-white rounded-2xl border border-[rgba(44,95,63,0.08)] shadow-sm px-5 py-4 text-center">
            <p className="text-[12px] text-[#B5C4B9]">
              {selected >= first && selected <= last ? "Nothing logged this day." : "Pick a day to see it."}
            </p>
          </div>
        )}

        <RoutineInsights />

        <ExportCard />
      </div>
    </main>
  );
}
