"use client";

import { useEffect, useState } from "react";
import { getRecentSessions, getRecentShows, getRecentCoolDowns, SessionRecord, DayShows, CoolDownRecord } from "@/lib/firebaseService";

type DayEntry = {
  date: string;
  session?: SessionRecord;
  shows?: DayShows;
  cooldown?: CoolDownRecord;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sessions, shows, cooldowns] = await Promise.all([
          getRecentSessions(20),
          getRecentShows(20),
          getRecentCoolDowns(20),
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
        setEntries(Object.values(map).sort((a, b) => b.date.localeCompare(a.date)));
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
            {entries.map((entry) => <DayCard key={entry.date} entry={entry} />)}
          </div>
        )}
      </div>
    </main>
  );
}

function DayCard({ entry }: { entry: DayEntry }) {
  const [open, setOpen] = useState(false);
  const { session, shows } = entry;
  const avg = session ? avgRating(session) : null;
  const completedSteps = session?.steps.filter((s) => s.status === "rated").length ?? 0;
  const totalSteps = session?.steps.length ?? 0;

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
}