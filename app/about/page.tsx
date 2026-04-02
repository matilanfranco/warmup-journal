"use client";

import { useEffect, useState } from "react";
import { getRecentSessions, getRecentShows, getRecentCoolDowns, SessionRecord, DayShows } from "@/lib/firebaseService";
import { getAppDate } from "@/lib/dateUtils";

type Stats = {
  streak: number;
  totalSessions: number;
  totalShows: number;
  totalCooldowns: number;
  avgWarmupRating: number | null;
  avgShowRating: number | null;
  bestExercise: { title: string; avg: number } | null;
  hardestExercise: { title: string; avg: number } | null;
  topFeelings: { feeling: string; count: number }[];
  sessionsThisWeek: number;
  weeklyRatings: { day: string; rating: number | null }[];
};

function calcStats(sessions: SessionRecord[], shows: DayShows[], cooldowns: any[]): Stats {
  // Streak
  let streak = 0;
  const today = getAppDate();
  const sessionDates = new Set(sessions.map((s) => s.date));
  let check = new Date();
  if (check.getHours() < 6) check.setDate(check.getDate() - 1);
  for (let i = 0; i < 30; i++) {
    const y = check.getFullYear();
    const m = String(check.getMonth() + 1).padStart(2, "0");
    const d = String(check.getDate()).padStart(2, "0");
    if (sessionDates.has(`${y}-${m}-${d}`)) { streak++; check.setDate(check.getDate() - 1); }
    else break;
  }

  // Avg warmup rating
  const allRatings: number[] = [];
  const exerciseMap: Record<string, number[]> = {};
  for (const s of sessions) {
    for (const step of s.steps) {
      if (step.status === "rated" && step.rating) {
        allRatings.push(step.rating);
        if (!exerciseMap[step.title]) exerciseMap[step.title] = [];
        exerciseMap[step.title].push(step.rating);
      }
    }
  }
  const avgWarmupRating = allRatings.length
    ? Math.round((allRatings.reduce((a, b) => a + b, 0) / allRatings.length) * 10) / 10
    : null;

  // Best and hardest exercise
  const exerciseAvgs = Object.entries(exerciseMap)
    .filter(([, r]) => r.length >= 2)
    .map(([title, r]) => ({ title, avg: Math.round((r.reduce((a, b) => a + b, 0) / r.length) * 10) / 10 }))
    .sort((a, b) => b.avg - a.avg);
  const bestExercise = exerciseAvgs[0] ?? null;
  const hardestExercise = exerciseAvgs[exerciseAvgs.length - 1] ?? null;

  // Avg show rating
  const showRatings: number[] = [];
  const feelingCount: Record<string, number> = {};
  for (const day of shows) {
    for (const show of day.shows) {
      const r = Object.values(show.ratings ?? {});
      if (r.length) showRatings.push(r.reduce((a, b) => a + (b as number), 0) / r.length);
      const feelings: string[] = (show as any).feelings ?? ((show as any).feeling ? [(show as any).feeling] : []);
      feelings.forEach((f) => { feelingCount[f] = (feelingCount[f] ?? 0) + 1; });
    }
  }
  const avgShowRating = showRatings.length
    ? Math.round((showRatings.reduce((a, b) => a + b, 0) / showRatings.length) * 10) / 10
    : null;

  const topFeelings = Object.entries(feelingCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([feeling, count]) => ({ feeling, count }));

  // This week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);
  const sessionsThisWeek = sessions.filter((s) => {
    const [y, m, d] = s.date.split("-").map(Number);
    return new Date(y, m - 1, d) >= weekAgo;
  }).length;

  // Weekly ratings for sparkline (last 7 days)
  const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const weeklyRatings = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const session = sessions.find((s) => s.date === dateStr);
    if (!session) return { day: DAYS[d.getDay()], rating: null };
    const r = session.steps.filter((s) => s.status === "rated" && s.rating).map((s) => s.rating!);
    return { day: DAYS[d.getDay()], rating: r.length ? Math.round((r.reduce((a, b) => a + b, 0) / r.length) * 10) / 10 : null };
  });

  return {
    streak, totalSessions: sessions.length, totalShows: shows.reduce((a, d) => a + d.shows.length, 0),
    totalCooldowns: cooldowns.length, avgWarmupRating, avgShowRating,
    bestExercise, hardestExercise, topFeelings, sessionsThisWeek, weeklyRatings,
  };
}

export default function InsightsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sessions, shows, cooldowns] = await Promise.all([
          getRecentSessions(30),
          getRecentShows(30),
          getRecentCoolDowns(30),
        ]);
        setStats(calcStats(sessions, shows, cooldowns));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-[#F5F2EC]">
      <div className="mx-auto max-w-md px-4 pt-2 pb-28">
        <div className="mb-6">
          <h1 className="text-[28px] text-[#1C2B22] leading-tight mb-1"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontStyle: "italic" }}>
            Insights
          </h1>
          <p className="text-[13px] text-[#8FA896]">Your voice, in numbers.</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-[rgba(44,95,63,0.08)] p-5 animate-pulse">
                <div className="h-3 bg-[#EAF0EB] rounded-full w-24 mb-4" />
                <div className="h-8 bg-[#EAF0EB] rounded-full w-16" />
              </div>
            ))}
          </div>
        ) : !stats || stats.totalSessions === 0 ? (
          <div className="bg-white rounded-3xl border border-[rgba(44,95,63,0.08)] shadow-sm p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF0EB] flex items-center justify-center text-xl mx-auto mb-3">📊</div>
            <p className="text-[14px] font-semibold text-[#1C2B22] mb-1">No data yet</p>
            <p className="text-[12px] text-[#8FA896]">Complete a few warmup sessions to see your insights.</p>
          </div>
        ) : (
          <div className="space-y-4">

            {/* Big 4 stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Current streak", value: stats.streak > 0 ? `${stats.streak}d` : "—", sub: "days in a row", emoji: "🔥" },
                { label: "This week", value: stats.sessionsThisWeek > 0 ? `${stats.sessionsThisWeek}` : "—", sub: "warmup sessions", emoji: "📅" },
                { label: "Avg warmup", value: stats.avgWarmupRating !== null ? `${stats.avgWarmupRating}/5` : "—", sub: "exercise rating", emoji: "🎤" },
                { label: "Total sessions", value: stats.totalSessions > 0 ? `${stats.totalSessions}` : "—", sub: "warmups logged", emoji: "✅" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-[rgba(44,95,63,0.08)] shadow-sm p-4">
                  <p className="text-base mb-1">{s.emoji}</p>
                  <p className="text-[24px] font-bold text-[#1C2B22] leading-none mb-1">{s.value}</p>
                  <p className="text-[10px] font-black tracking-widest uppercase text-[#8FA896]">{s.label}</p>
                  <p className="text-[11px] text-[#B5C4B9] mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Weekly sparkline */}
            <div className="bg-white rounded-3xl border border-[rgba(44,95,63,0.08)] shadow-sm p-5">
              <p className="text-[10px] font-black tracking-widest uppercase text-[#8FA896] mb-4">This week — warmup ratings</p>
              <div className="flex items-end gap-2 h-16 mb-2">
                {stats.weeklyRatings.map(({ day, rating }, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full flex items-end justify-center" style={{ height: 48 }}>
                      {rating !== null ? (
                        <div className="w-full rounded-t-lg bg-[#2C5F3F] transition-all"
                          style={{ height: `${(rating / 5) * 48}px`, opacity: 0.7 + (rating / 5) * 0.3 }} />
                      ) : (
                        <div className="w-full rounded-t-lg bg-[#EAF0EB]" style={{ height: 6 }} />
                      )}
                    </div>
                    <span className="text-[9px] font-bold text-[#B5C4B9]">{day}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-[#B5C4B9]">0</span>
                <span className="text-[10px] text-[#B5C4B9]">5</span>
              </div>
            </div>

            {/* Best / hardest exercise */}
            {(stats.bestExercise || stats.hardestExercise) && (
              <div className="grid grid-cols-2 gap-3">
                {stats.bestExercise && (
                  <div className="bg-white rounded-2xl border border-[rgba(44,95,63,0.08)] shadow-sm p-4">
                    <p className="text-[10px] font-black tracking-widest uppercase text-[#8FA896] mb-2">Your best</p>
                    <p className="text-[13px] font-semibold text-[#1C2B22] mb-1 leading-snug">{stats.bestExercise.title}</p>
                    <p className="text-[20px] font-bold text-[#2C5F3F]">{stats.bestExercise.avg}<span className="text-[11px] text-[#B5C4B9] font-normal">/5</span></p>
                  </div>
                )}
                {stats.hardestExercise && stats.hardestExercise.title !== stats.bestExercise?.title && (
                  <div className="bg-white rounded-2xl border border-[rgba(44,95,63,0.08)] shadow-sm p-4">
                    <p className="text-[10px] font-black tracking-widest uppercase text-[#8FA896] mb-2">Needs work</p>
                    <p className="text-[13px] font-semibold text-[#1C2B22] mb-1 leading-snug">{stats.hardestExercise.title}</p>
                    <p className="text-[20px] font-bold text-amber-500">{stats.hardestExercise.avg}<span className="text-[11px] text-[#B5C4B9] font-normal">/5</span></p>
                  </div>
                )}
              </div>
            )}

            {/* Shows + cooldowns */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-[rgba(44,95,63,0.08)] shadow-sm p-4">
                <p className="text-[10px] font-black tracking-widest uppercase text-[#8FA896] mb-2">Shows logged</p>
                <p className="text-[24px] font-bold text-[#1C2B22]">{stats.totalShows > 0 ? stats.totalShows : "—"}</p>
                {stats.avgShowRating && <p className="text-[11px] text-[#8FA896] mt-1">avg {stats.avgShowRating}/5</p>}
              </div>
              <div className="bg-white rounded-2xl border border-[rgba(44,95,63,0.08)] shadow-sm p-4">
                <p className="text-[10px] font-black tracking-widest uppercase text-[#8FA896] mb-2">Cool downs</p>
                <p className="text-[24px] font-bold text-[#6B5B9E]">{stats.totalCooldowns > 0 ? stats.totalCooldowns : "—"}</p>
                <p className="text-[11px] text-[#8FA896] mt-1">sessions</p>
              </div>
            </div>

            {/* Top feelings */}
            {stats.topFeelings.length > 0 && (
              <div className="bg-white rounded-3xl border border-[rgba(44,95,63,0.08)] shadow-sm p-5">
                <p className="text-[10px] font-black tracking-widest uppercase text-[#8FA896] mb-4">
                  How you've been feeling on stage
                </p>
                <div className="space-y-2.5">
                  {stats.topFeelings.map(({ feeling, count }, i) => {
                    const max = stats.topFeelings[0].count;
                    return (
                      <div key={feeling} className="flex items-center gap-3">
                        <span className="text-[12px] font-medium text-[#5A7A65] w-24 shrink-0">{feeling}</span>
                        <div className="flex-1 h-2 bg-[#EAF0EB] rounded-full overflow-hidden">
                          <div className="h-full bg-[#2C5F3F] rounded-full transition-all"
                            style={{ width: `${(count / max) * 100}%`, opacity: 0.6 + i * 0.08 }} />
                        </div>
                        <span className="text-[11px] font-bold text-[#8FA896] w-6 text-right shrink-0">{count}x</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </main>
  );
}