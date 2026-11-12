"use client";

import { useCallback, useEffect, useState } from "react";
import ShowDayEditor from "@/components/shows/ShowDayEditor";
import { getRecentShows, DayShows } from "@/lib/firebaseService";
import { getAppDate, shiftDate, formatDisplayDate } from "@/lib/dateUtils";

function showAvg(day: DayShows): number | null {
  const vals = day.shows.flatMap((s) => Object.values(s.ratings ?? {}) as number[]).filter((v) => v > 0);
  return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null;
}

export default function ShowsPage() {
  const today = getAppDate();
  const yesterday = shiftDate(today, -1);
  const [date, setDate] = useState(today);
  const [recent, setRecent] = useState<DayShows[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecent = useCallback(async () => {
    try { setRecent(await getRecentShows(30)); }
    catch (e) { console.error("Error loading shows:", e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadRecent(); }, [loadRecent]);

  const title =
    date === today ? "Today's shows" :
    date === yesterday ? "Yesterday's shows" :
    `Shows · ${formatDisplayDate(date)}`;

  const isOther = date !== today && date !== yesterday;

  return (
    <main className="min-h-screen bg-[#F5F2EC]">
      <div className="mx-auto max-w-md px-4 pt-2 pb-28">
        <div className="mb-5">
          <h1 className="text-[28px] text-[#1C2B22] leading-tight mb-1"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 400 }}>
            Shows
          </h1>
          <p className="text-[13px] text-[#8FA896]">Log them whenever you want. No shows today? All good.</p>
        </div>

        {/* Day picker */}
        <div className="flex gap-1 p-1 rounded-2xl bg-[#E8EFE9] mb-4">
          {[
            { label: "Today", active: date === today, onClick: () => setDate(today) },
            { label: "Yesterday", active: date === yesterday, onClick: () => setDate(yesterday) },
          ].map((b) => (
            <button key={b.label} onClick={b.onClick}
              className={`flex-1 h-9 rounded-xl text-[13px] font-bold transition-all active:scale-[0.98] ${
                b.active ? "bg-white text-[#2C5F3F] shadow-sm" : "text-[#5A7A65]"
              }`}>
              {b.label}
            </button>
          ))}
          <label className={`relative flex-1 h-9 rounded-xl text-[13px] font-bold flex items-center justify-center cursor-pointer ${
            isOther ? "bg-white text-[#2C5F3F] shadow-sm" : "text-[#5A7A65]"
          }`}>
            {isOther ? formatDisplayDate(date) : "Other day"}
            <input type="date" max={today} value={date}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer" />
          </label>
        </div>

        <ShowDayEditor date={date} title={title} onChange={loadRecent} />

        {/* Recent */}
        <div className="mt-6">
          <p className="text-[10px] font-black tracking-widest uppercase text-[#8FA896] mb-3">Recent shows</p>
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => <div key={i} className="h-14 rounded-2xl bg-white animate-pulse" />)}
            </div>
          ) : recent.length === 0 ? (
            <p className="text-[12px] text-[#B5C4B9] text-center py-6">No shows logged yet.</p>
          ) : (
            <div className="space-y-2">
              {recent.map((day) => {
                const avg = showAvg(day);
                return (
                  <button key={day.date} onClick={() => { setDate(day.date); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className={`w-full text-left bg-white rounded-2xl px-4 py-3 border shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform ${
                      day.date === date ? "border-[rgba(44,95,63,0.3)]" : "border-[rgba(44,95,63,0.08)]"
                    }`}>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold tracking-widest uppercase text-[#8FA896]">{formatDisplayDate(day.date)}</p>
                      <p className="text-[13px] font-semibold text-[#1C2B22] truncate">
                        {day.shows.map((s) => s.name || "Show").join(" · ")}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-[13px] font-bold text-[#2C5F3F]">{avg !== null ? `${avg}/5` : "—"}</p>
                      <p className="text-[10px] text-[#B5C4B9]">{day.shows.length} show{day.shows.length !== 1 ? "s" : ""}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
