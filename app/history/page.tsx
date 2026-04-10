"use client";

import { useEffect, useState } from "react";
import { getRecentSessions, getRecentShows, getRecentCoolDowns, getRecentRestDays, SessionRecord, DayShows, CoolDownRecord, RestDayData } from "@/lib/firebaseService";
import { useMemo } from "react";

type DayEntry = {
  date: string;
  session?: SessionRecord;
  shows?: DayShows;
  cooldown?: CoolDownRecord;
  restDay?: RestDayData;
};

const RATING_LABELS = [
  { key: "voice", label: "Voice" },
  { key: "energy", label: "Energy" },
  { key: "confidence", label: "Conf." },
  { key: "range", label: "Range" },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short", month: "short", day: "numeric",
  }).format(d);
}

function avgRating(session: SessionRecord) {
  const ratings = session.steps
    .filter((s) => s.status === "rated" && s.rating)
    .map((s) => s.rating!);
  if (ratings.length === 0) return null;
  return Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
}

function RatingBar({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5 mt-1">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className={`h-1.5 flex-1 rounded-full ${i < value ? "bg-[#2C5F3F]" : "bg-[#EAF0EB]"}`} />
      ))}
    </div>
  );
}

function ShowCard({ show }: { show: any }) {
  const ratings: Record<string, number> = show.ratings ?? {};
  const avg = Math.round(Object.values(ratings).reduce((a: number, b) => a + (b as number), 0) / 4);
  const stars = Array.from({ length: 5 }, (_, i) => i < avg ? "★" : "☆").join("");
  const feelings: string[] = show.feelings ?? (show.feeling ? [show.feeling] : []);

  return (
    <div className="bg-[#F9F8F5] rounded-xl p-3 border border-[rgba(44,95,63,0.06)]">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          {show.time && <p className="text-[10px] text-[#8FA896] mb-0.5">{show.time}</p>}
          <p className="text-[13px] font-semibold text-[#1C2B22]">{show.name}</p>
        </div>
        <span className="text-[12px] text-[#3D7A55] shrink-0 ml-2">{stars}</span>
      </div>

      {/* Ratings — compact grid */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {[
          { key: "voice", short: "Voice" },
          { key: "energy", short: "Energy" },
          { key: "confidence", short: "Conf." },
          { key: "range", short: "Range" },
        ].map(({ key, short }) => (
          <div key={key} className="bg-white rounded-xl px-2 py-1.5 border border-[rgba(44,95,63,0.08)] text-center">
            <p className="text-[9px] text-[#8FA896] font-medium uppercase tracking-wide">{short}</p>
            <p className="text-[14px] font-bold text-[#2C5F3F] mt-0.5">
              {ratings[key] ?? 0}<span className="text-[9px] text-[#B5C4B9] font-normal">/5</span>
            </p>
          </div>
        ))}
      </div>

      {/* Feelings */}
      {feelings.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {feelings.map((f: string) => (
            <span key={f} className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#EAF0EB] text-[#2C5F3F]">
              {f}
            </span>
          ))}
        </div>
      )}

      {/* Note */}
      {show.note && (
        <p className="text-[11px] text-[#8FA896] italic">"{show.note}"</p>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [rawShows, setRawShows] = useState<DayShows[]>([]);
  const [rawSessions, setRawSessions] = useState<SessionRecord[]>([]);
  const [rawRestDays, setRawRestDays] = useState<RestDayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sessions, shows, cooldowns, restDays] = await Promise.all([
          getRecentSessions(20),
          getRecentShows(20),
          getRecentCoolDowns(20),
          getRecentRestDays(20),
        ]);
        const map: Record<string, DayEntry> = {};
        sessions.forEach((s) => { map[s.date] = { date: s.date, session: s }; });
        shows.forEach((s) => {
          if (map[s.date]) map[s.date].shows = s;
          else map[s.date] = { date: s.date, shows: s };
        });
        cooldowns.forEach((c) => {
          if (map[c.date]) map[c.date].cooldown = c;
          else map[c.date] = { date: c.date, cooldown: c };
        });
        restDays.forEach((r) => {
          if (map[r.date]) map[r.date].restDay = r;
          else map[r.date] = { date: r.date, restDay: r };
        });
        const sorted = Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
        setEntries(sorted);
        // Store raw data for rest day summaries
        setRawShows(shows);
        setRawSessions(sessions);
        setRawRestDays(restDays);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-[#F5F2EC]">
      <div className="mx-auto max-w-md px-4 pt-2 pb-28">
        <div className="mb-6">
          <h1 className="text-[28px] text-[#1C2B22] leading-tight mb-1"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 400 }}>
            Journal
          </h1>
          <p className="text-[13px] text-[#8FA896]">Your voice history, day by day.</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[rgba(44,95,63,0.08)] p-4 animate-pulse">
                <div className="h-3 bg-[#EAF0EB] rounded-full w-24 mb-3" />
                <div className="h-4 bg-[#EAF0EB] rounded-full w-40 mb-2" />
                <div className="h-3 bg-[#EAF0EB] rounded-full w-32" />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[rgba(44,95,63,0.08)] shadow-sm p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF0EB] flex items-center justify-center text-xl mx-auto mb-3">📖</div>
            <p className="text-[14px] font-semibold text-[#1C2B22] mb-1">No entries yet</p>
            <p className="text-[12px] text-[#8FA896]">Complete a warmup session to start your journal.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <DayCard key={entry.date} entry={entry}
                allShows={rawShows} allSessions={rawSessions} allRestDays={rawRestDays} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function DayCard({ entry, allShows, allSessions, allRestDays }: {
  entry: DayEntry;
  allShows: DayShows[];
  allSessions: SessionRecord[];
  allRestDays: RestDayData[];
}) {
  const [open, setOpen] = useState(false);
  const { session, shows } = entry;
  const avg = session ? avgRating(session) : null;
  const completedSteps = session?.steps.filter((s) => s.status === "rated").length ?? 0;
  const totalSteps = session?.steps.length ?? 0;

  // Compute run summary for rest day
  const allShowsFlat = allShows.flatMap((d) => d.shows.map((s) => ({ ...s, date: d.date })));
  const allSessionsFlat = allSessions;
  const prevRestDaysFor = (date: string) => allRestDays.filter((r) => r.date < date);

  return (
    <div className="bg-white rounded-2xl border border-[rgba(44,95,63,0.08)] shadow-sm overflow-hidden">
      <button onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-4 flex items-center justify-between text-left active:bg-[#F9F8F5] transition-colors">
        <div>
          <p className="text-[11px] font-bold tracking-widest uppercase text-[#8FA896] mb-1">
            {formatDate(entry.date)}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {session && (
              <span className="text-[11px] font-medium text-[#2C5F3F] bg-[#EAF0EB] px-2 py-0.5 rounded-full border border-[rgba(44,95,63,0.15)] whitespace-nowrap">
                🎤 Warmup {avg !== null ? `· ${avg}/5` : ""}
              </span>
            )}
            {shows && shows.shows.length > 0 && (
              <span className="text-[11px] font-medium text-[#5A7A65] bg-[#F5F2EC] px-2 py-0.5 rounded-full border border-[rgba(44,95,63,0.1)] whitespace-nowrap">
                🎭 {shows.shows.length} show{shows.shows.length !== 1 ? "s" : ""}
              </span>
            )}
            {entry.cooldown && (
              <span className="text-[11px] font-medium text-[#3D5A8A] bg-[#DDE6F5] px-2 py-0.5 rounded-full border border-[rgba(61,90,138,0.15)] whitespace-nowrap">
                🌙 Cool down
              </span>
            )}
            {entry.restDay && (
              <span className="text-[11px] font-medium text-[#2A7EBF] bg-[#EEF7FF] px-2 py-0.5 rounded-full border border-[rgba(42,126,191,0.2)] whitespace-nowrap">
                ☀️ Rest day
              </span>
            )}
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
          className={`text-[#B5C4B9] transition-transform shrink-0 ${open ? "rotate-180" : ""}`}>
          <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-4 border-t border-[rgba(44,95,63,0.06)] pt-4 space-y-4">

          {/* Warmup section */}
          {session && (
            <div>
              <p className="text-[11px] font-black tracking-widest uppercase text-[#8FA896] mb-2">Warmup</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-1.5 bg-[#EAF0EB] rounded-full overflow-hidden">
                  <div className="h-full bg-[#2C5F3F] rounded-full"
                    style={{ width: totalSteps > 0 ? `${(completedSteps / totalSteps) * 100}%` : "0%" }} />
                </div>
                <span className="text-[11px] font-semibold text-[#2C5F3F] shrink-0">
                  {completedSteps}/{totalSteps}
                </span>
              </div>
              <div className="space-y-2">
                {session.steps.map((step, i) => (
                  <div key={i} className="rounded-xl bg-[#F9F8F5] px-3.5 py-2.5 border border-[rgba(44,95,63,0.06)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#5A7A65] truncate">{step.title}</span>
                      <span className={`text-[11px] font-semibold ml-2 shrink-0 ${
                        step.status === "rated" ? "text-[#2C5F3F]" :
                        step.status === "skipped" ? "text-[#B5C4B9]" : "text-[#D5E0D8]"
                      }`}>
                        {step.status === "rated" ? `${step.rating}/5` : step.status === "skipped" ? "Skipped" : "—"}
                      </span>
                    </div>
                    {step.note && (
                      <p className="text-[11px] text-[#8FA896] italic mt-1">"{step.note}"</p>
                    )}
                  </div>
                ))}
              </div>
              {session.finalComment && (
                <p className="text-[12px] text-[#8FA896] italic mt-3 pt-3 border-t border-[rgba(44,95,63,0.06)]">
                  "{session.finalComment}"
                </p>
              )}
            </div>
          )}

          {/* Shows section — with expanded ratings */}
          {shows && shows.shows.length > 0 && (
            <div>
              <p className="text-[11px] font-black tracking-widest uppercase text-[#8FA896] mb-2">Performances</p>
              <div className="space-y-2">
                {shows.shows.map((show, i) => (
                  <ShowCard key={i} show={show} />
                ))}
              </div>
            </div>
          )}

          {/* Rest day section */}
          {entry.restDay && (
            <RestDayHistorySection date={entry.date} restDay={entry.restDay} allShows={allShowsFlat} allSessions={allSessionsFlat} prevRestDays={prevRestDaysFor(entry.date)} />
          )}

          {/* Cool down section */}
          {entry.cooldown && (
            <div>
              <p className="text-[11px] font-black tracking-widest uppercase text-[#7A90B0] mb-2">Cool down</p>
              <div className="space-y-1.5">
                {entry.cooldown.steps.map((step, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-[#F5F8FF] px-4 py-2.5 border border-[rgba(61,90,138,0.07)]">
                    <span className="text-[12px] text-[#3D5A8A] truncate">{step.title}</span>
                    <span className={`text-[11px] font-semibold ml-2 shrink-0 ${
                      step.status === "rated" ? "text-[#3D5A8A]" :
                      step.status === "skipped" ? "text-[#B5C4B9]" : "text-[#D5E0D8]"
                    }`}>
                      {step.status === "rated" ? `${step.rating}/5` : step.status === "skipped" ? "Skipped" : "—"}
                    </span>
                  </div>
                ))}
              </div>
              {entry.cooldown.finalComment && (
                <p className="text-[12px] text-[#7A90B0] italic mt-3 pt-3 border-t border-[rgba(61,90,138,0.06)]">
                  "{entry.cooldown.finalComment}"
                </p>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );


function RestDayHistorySection({ date, restDay, allShows, allSessions, prevRestDays }: {
  date: string;
  restDay: RestDayData;
  allShows: any[];
  allSessions: SessionRecord[];
  prevRestDays: RestDayData[];
}) {
  // Find last rest day before this one
  const lastRestDay = prevRestDays.length > 0 ? prevRestDays[0] : null;
  const cutoffDate = lastRestDay ? lastRestDay.date : "2000-01-01";

  // Shows since last rest day
  const recentShows = allShows.filter((s) => s.date > cutoffDate && s.date <= date);
  const showCount = recentShows.length;
  const showRatings = recentShows.flatMap((s) => Object.values(s.ratings ?? {}) as number[]);
  const avgShowRating = showRatings.length
    ? Math.round((showRatings.reduce((a, b) => a + b, 0) / showRatings.length) * 10) / 10
    : null;

  // Sessions since last rest day
  const recentSessions = allSessions.filter((s) => s.date > cutoffDate && s.date <= date);
  const stepRatings = recentSessions.flatMap((s) =>
    s.steps.filter((st) => st.status === "rated" && st.rating).map((st) => st.rating!)
  );
  const avgWarmupRating = stepRatings.length
    ? Math.round((stepRatings.reduce((a, b) => a + b, 0) / stepRatings.length) * 10) / 10
    : null;

  // Top feelings
  const feelingMap: Record<string, number> = {};
  recentShows.forEach((s) => {
    const f: string[] = (s as any).feelings ?? ((s as any).feeling ? [(s as any).feeling] : []);
    f.forEach((x) => { feelingMap[x] = (feelingMap[x] ?? 0) + 1; });
  });
  const topFeelings = Object.entries(feelingMap).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([f]) => f);

  // Avg fatigue from previous rest days
  const fatigues = prevRestDays.slice(0, 4).map((r) => r.vocalFatigue).filter((v): v is number => v !== null);
  const avgFatigue = fatigues.length
    ? Math.round((fatigues.reduce((a, b) => a + b, 0) / fatigues.length) * 10) / 10
    : null;

  // Days since last rest day
  const daysSince = lastRestDay ? (() => {
    const last = new Date(lastRestDay.date + "T12:00:00");
    const cur = new Date(date + "T12:00:00");
    return Math.floor((cur.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  })() : null;

  const fatigueVal = restDay.vocalFatigue ?? 0;
  const fatigueColor = fatigueVal <= 3 ? "#2C5F3F" : fatigueVal <= 6 ? "#D97706" : "#DC2626";

  return (
    <div>
      <p className="text-[11px] font-black tracking-widest uppercase text-[#5A8AAF] mb-2">Rest day</p>
      <div className="bg-[#EEF7FF] rounded-2xl p-4 border border-[rgba(42,126,191,0.08)] space-y-4">

        {/* Run header */}
        {daysSince !== null && (
          <p className="text-[10px] font-black tracking-widest uppercase text-[#A0C0D8]">
            Run summary · {daysSince} day{daysSince !== 1 ? "s" : ""} since last rest
          </p>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Shows", value: showCount > 0 ? `${showCount}` : "—", sub: "performances" },
            { label: "Avg show", value: avgShowRating ? `${avgShowRating}/5` : "—", sub: "rating" },
            { label: "Warmups", value: recentSessions.length > 0 ? `${recentSessions.length}` : "—", sub: "sessions" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl px-2 py-2 border border-[rgba(42,126,191,0.08)] text-center">
              <p className="text-[9px] font-black tracking-widest uppercase text-[#A0C0D8]">{s.label}</p>
              <p className="text-[16px] font-bold text-[#1A3A52]">{s.value}</p>
              <p className="text-[9px] text-[#A0C0D8]">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Vocal fatigue today */}
        {restDay.vocalFatigue !== null && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] font-semibold text-[#5A8AAF]">Vocal fatigue today</p>
              <span className="text-[11px] font-bold" style={{ color: fatigueColor }}>
                {restDay.vocalFatigue}/10
                {avgFatigue !== null && (
                  <span className="text-[#A0C0D8] font-normal"> · avg {avgFatigue}</span>
                )}
              </span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden border border-[rgba(42,126,191,0.1)]">
              <div className="h-full rounded-full" style={{ width: `${(fatigueVal / 10) * 100}%`, background: fatigueColor }} />
            </div>
          </div>
        )}

        {/* Recovery checklist */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {[
            { label: "Steam last night", val: restDay.steamLastNight, emoji: "🌫️" },
            { label: "Steam today", val: restDay.steamToday, emoji: "🌫️" },
            { label: "2L water", val: restDay.water, emoji: "💧" },
            { label: "7-8h sleep", val: restDay.sleep, emoji: "🌙" },
            { label: "Electrolytes", val: restDay.electrolytes, emoji: "⚡" },
            { label: "Vocal rest", val: restDay.vocalRest, emoji: "🤫" },
          ].filter(({ val }) => val !== null).map(({ label, val, emoji }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="text-xs">{emoji}</span>
              <span className="text-[11px] text-[#5A8AAF]">{label}</span>
              <span className={`text-[10px] font-bold ml-auto ${val ? "text-[#2A7EBF]" : "text-rose-400"}`}>{val ? "✓" : "✗"}</span>
            </div>
          ))}
        </div>

        {/* Top feelings */}
        {topFeelings.length > 0 && (
          <div>
            <p className="text-[10px] font-black tracking-widest uppercase text-[#A0C0D8] mb-1.5">How she felt on stage</p>
            <div className="flex flex-wrap gap-1.5">
              {topFeelings.map((f) => (
                <span key={f} className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white text-[#2A7EBF] border border-[rgba(42,126,191,0.2)]">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Note */}
        {restDay.voiceDescription && (
          <p className="text-[12px] text-[#2A5F8A] italic pt-3 border-t border-[rgba(42,126,191,0.08)]"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            "{restDay.voiceDescription}"
          </p>
        )}

        {/* AI Analysis */}
        {restDay.aiAnalysis && (
          <div className="pt-3 border-t border-[rgba(42,126,191,0.08)]">
            <p className="text-[10px] font-black tracking-widest uppercase text-[#A0C0D8] mb-2">✨ AI run analysis</p>
            <p className="text-[12px] text-[#1A3A52] leading-relaxed whitespace-pre-line"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              {restDay.aiAnalysis}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

}