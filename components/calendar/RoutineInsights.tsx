"use client";

import { useEffect, useState } from "react";
import { getSessionsInRange, SessionRecord } from "@/lib/firebaseService";
import { listRoutines, WarmupRoutine } from "@/lib/routines";
import { getAppDate, shiftDate, formatDisplayDate } from "@/lib/dateUtils";

type RoutineStat = {
  routine: WarmupRoutine;
  times: number;
  streak: number;
  avg: number | null;
  lastDate: string | null;
  best: { title: string; avg: number } | null;
};

const round1 = (n: number) => Math.round(n * 10) / 10;
const mean = (xs: number[]) => (xs.length ? round1(xs.reduce((a, b) => a + b, 0) / xs.length) : null);

function computeStats(routines: WarmupRoutine[], sessions: SessionRecord[]): RoutineStat[] {
  const today = getAppDate();
  const byDate = new Map(sessions.map((s) => [s.date, s]));

  return routines.map((routine) => {
    const mine = sessions.filter((s) => s.routineId === routine.id);
    const ratings = mine.flatMap((s) => s.steps.filter((st) => st.status === "rated" && st.rating).map((st) => st.rating!));

    // Consecutive days (ending today, or yesterday if today isn't done) on this routine
    let cursor = byDate.get(today)?.routineId === routine.id ? today : shiftDate(today, -1);
    let streak = 0;
    while (byDate.get(cursor)?.routineId === routine.id) { streak++; cursor = shiftDate(cursor, -1); }

    const perExercise: Record<string, number[]> = {};
    mine.forEach((s) => s.steps.forEach((st) => {
      if (st.status === "rated" && st.rating) (perExercise[st.title] ??= []).push(st.rating);
    }));
    const best = Object.entries(perExercise)
      .filter(([, r]) => r.length >= 2)
      .map(([title, r]) => ({ title, avg: mean(r)! }))
      .sort((a, b) => b.avg - a.avg)[0] ?? null;

    return {
      routine,
      times: mine.length,
      streak,
      avg: mean(ratings),
      lastDate: mine.length ? mine.map((s) => s.date).sort().at(-1)! : null,
      best,
    };
  }).sort((a, b) => b.times - a.times);
}

export default function RoutineInsights() {
  const [stats, setStats] = useState<RoutineStat[] | null>(null);

  useEffect(() => {
    Promise.all([listRoutines(), getSessionsInRange()])
      .then(([routines, sessions]) => setStats(computeStats(routines, sessions)))
      .catch((e) => { console.error(e); setStats([]); });
  }, []);

  if (stats === null) return <div className="h-28 rounded-3xl bg-white animate-pulse" />;
  if (stats.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-[rgba(44,95,63,0.08)] shadow-sm p-5">
      <p className="text-[10px] font-black tracking-widest uppercase text-[#8FA896] mb-4">Your routines</p>
      <div className="space-y-4">
        {stats.map((s, i) => (
          <div key={s.routine.id} className={i > 0 ? "pt-4 border-t border-[rgba(44,95,63,0.07)]" : ""}>
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <p className="text-[15px] text-[#1C2B22] truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
                {s.routine.name}
              </p>
              <p className="text-[14px] font-bold text-[#2C5F3F] shrink-0">
                {s.avg !== null ? <>★ {s.avg}<span className="text-[10px] text-[#B5C4B9] font-normal">/5</span></> : <span className="text-[#B5C4B9] font-normal text-[12px]">no ratings yet</span>}
              </p>
            </div>
            {s.times === 0 ? (
              <p className="text-[12px] text-[#8FA896]">Not done yet</p>
            ) : (
              <p className="text-[12px] text-[#5A7A65] leading-relaxed">
                Done <b className="text-[#1C2B22]">{s.times} time{s.times !== 1 ? "s" : ""}</b>
                {s.streak > 1 && <> · 🔥 <b className="text-[#1C2B22]">{s.streak} days in a row</b></>}
                {s.lastDate && s.streak <= 1 && <> · last on {formatDisplayDate(s.lastDate)}</>}
              </p>
            )}
            {s.best && (
              <p className="text-[11px] text-[#8FA896] mt-0.5">
                Best exercise: {s.best.title} · ★ {s.best.avg}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
