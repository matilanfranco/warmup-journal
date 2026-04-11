"use client";

import { useEffect, useState } from "react";
import { saveRestDay, getRestDay, getRecentShows, getRecentRestDays, getRecentSessions, saveAiAnalysis } from "@/lib/firebaseService";
import { useAuth } from "@/lib/AuthContext";
import { getAppDate } from "@/lib/dateUtils";

type RestDayData = {
  voiceDescription: string;
  vocalFatigue: number | null;
  steamLastNight: boolean | null;
  steamToday: boolean | null;
  water: boolean | null;
  sleep: boolean | null;
  electrolytes: boolean | null;
  vocalRest: boolean | null;
};

type RunSummary = {
  showCount: number;
  avgShowRating: number | null;
  avgVocalFatigue: number | null;
  topFeelings: string[];
  sessionCount: number;
  avgWarmupRating: number | null;
  daysSinceLastRestDay: number;
};

const empty = (): RestDayData => ({
  voiceDescription: "",
  vocalFatigue: null,
  steamLastNight: null, steamToday: null,
  water: null, sleep: null, electrolytes: null, vocalRest: null,
});

function YesNo({ value, onChange, disabled }: { value: boolean | null; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex gap-1.5 shrink-0">
      {[{ label: "Yes", val: true }, { label: "No", val: false }].map(({ label, val }) => (
        <button key={label} type="button" disabled={disabled} onClick={() => onChange(val)}
          className={`h-8 px-3.5 rounded-full text-[11px] font-semibold border transition-all active:scale-95 ${
            value === val
              ? "bg-[#2A7EBF] text-white border-[#2A7EBF]"
              : "bg-white/70 text-[#5A8AAF] border-[rgba(42,126,191,0.2)] hover:bg-[#E0F0FB]"
          } disabled:opacity-50`}>
          {label}
        </button>
      ))}
    </div>
  );
}

function CheckRow({ emoji, label, value, onChange }: { emoji: string; label: string; value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-base shrink-0">{emoji}</span>
        <p className="text-[12px] font-semibold text-[#1A3A52] leading-snug">{label}</p>
      </div>
      <YesNo value={value} onChange={onChange} />
    </div>
  );
}

async function loadRunSummary(): Promise<RunSummary> {
  const [shows, restDays, sessions] = await Promise.all([
    getRecentShows(30),
    getRecentRestDays(10),
    getRecentSessions(30),
  ]);

  const today = getAppDate();

  // Days since last rest day (excluding today)
  const prevRestDays = restDays.filter((r) => r.date !== today);
  const daysSinceLastRestDay = prevRestDays.length > 0 ? (() => {
    const last = new Date(prevRestDays[0].date + "T12:00:00");
    const now = new Date();
    return Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  })() : 0;

  // Get shows since last rest day
  const cutoffDate = prevRestDays.length > 0 ? prevRestDays[0].date : "2000-01-01";
  const recentShows = shows.filter((d) => d.date > cutoffDate);
  const allShows = recentShows.flatMap((d) => d.shows);
  const showCount = allShows.length;

  // Avg show rating
  const showRatings = allShows.flatMap((s) => Object.values(s.ratings ?? {}) as number[]);
  const avgShowRating = showRatings.length
    ? Math.round((showRatings.reduce((a, b) => a + b, 0) / showRatings.length) * 10) / 10
    : null;

  // Top feelings from shows
  const feelingMap: Record<string, number> = {};
  allShows.forEach((s) => {
    const f: string[] = (s as any).feelings ?? ((s as any).feeling ? [(s as any).feeling] : []);
    f.forEach((x) => { feelingMap[x] = (feelingMap[x] ?? 0) + 1; });
  });
  const topFeelings = Object.entries(feelingMap)
    .sort((a, b) => b[1] - a[1]).slice(0, 4).map(([f]) => f);

  // Avg vocal fatigue from previous rest days
  const fatigues = prevRestDays.slice(0, 5).map((r) => r.vocalFatigue).filter((v): v is number => v !== null);
  const avgVocalFatigue = fatigues.length
    ? Math.round((fatigues.reduce((a, b) => a + b, 0) / fatigues.length) * 10) / 10
    : null;

  // Sessions since last rest day
  const recentSessions = sessions.filter((s) => s.date > cutoffDate);
  const allStepRatings = recentSessions.flatMap((s) =>
    s.steps.filter((st) => st.status === "rated" && st.rating).map((st) => st.rating!)
  );
  const avgWarmupRating = allStepRatings.length
    ? Math.round((allStepRatings.reduce((a, b) => a + b, 0) / allStepRatings.length) * 10) / 10
    : null;

  return { showCount, avgShowRating, avgVocalFatigue, topFeelings, sessionCount: recentSessions.length, avgWarmupRating, daysSinceLastRestDay };
}

export default function RestDayCard() {
  const { profile } = useAuth();
  const firstName = profile?.firstName ?? "there";
  const [data, setData] = useState<RestDayData>(empty());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<RunSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const existing = await getRestDay(getAppDate());
        if (existing) {
          setData(existing);
          setSaved(true);
          fetchSummary();
          // Restore saved AI analysis
          if (existing.aiAnalysis) {
            setAiAnalysis(existing.aiAnalysis);
            setAiUsed(true);
          }
        }
      } catch {}
      finally { setLoaded(true); }
    }
    load();
  }, []);

  const fetchSummary = async () => {
    setSummaryLoading(true);
    try {
      const s = await loadRunSummary();
      setSummary(s);
    } catch {} finally { setSummaryLoading(false); }
  };

  const set = <K extends keyof RestDayData>(key: K, val: RestDayData[K]) =>
    setData((d) => ({ ...d, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveRestDay(data);
      setSaved(true);
      await fetchSummary();
    } catch (e) { console.error(e); }
    finally { setSaving(false); setOpen(false); }
  };

  const fatigue = data.vocalFatigue ?? 5;
  const fatigueColor = fatigue <= 3 ? "#2C5F3F" : fatigue <= 6 ? "#D97706" : "#DC2626";
  const fatigueLabel = fatigue <= 3 ? "Low 🌿" : fatigue <= 6 ? "Moderate ⚠️" : "High 🔴";

  // ── AI Analysis ───────────────────────────────────────────
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);

  const AI_KEY = "restDayAiUsed";

  // Check if AI was already used today or if 3-day cooldown is active
  const canUseAi = (() => {
    if (typeof window === "undefined") return false;
    const raw = localStorage.getItem(AI_KEY);
    if (!raw) return true;
    try {
      const { date: lastDate } = JSON.parse(raw);
      const last = new Date(lastDate + "T12:00:00");
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= 3;
    } catch { return true; }
  })();

  const alreadyUsedToday = (() => {
    if (typeof window === "undefined") return false;
    const raw = localStorage.getItem(AI_KEY);
    if (!raw) return false;
    try {
      const { date: lastDate } = JSON.parse(raw);
      return lastDate === getAppDate();
    } catch { return false; }
  })();

  const handleAiAnalysis = async () => {
    if (!summary || aiLoading) return;
    setAiLoading(true);
    setAiAnalysis(null);

    try {
      const prompt = `You are a vocal performance coach and sports psychologist writing a rest day debrief for ${firstName}, a professional singer. Be direct, honest, and useful — not a cheerleader. Your job is to help ${firstName} understand what the data actually says and give concrete tools to improve.

Performance data from this run:
- Days since last rest day: ${summary.daysSinceLastRestDay}
- Shows performed: ${summary.showCount}
- Average show rating: ${summary.avgShowRating !== null ? `${summary.avgShowRating}/5` : "not recorded"}
- Warmup sessions completed: ${summary.sessionCount}
- Average warmup rating: ${summary.avgWarmupRating !== null ? `${summary.avgWarmupRating}/5` : "not recorded"}
- Vocal fatigue today: ${data.vocalFatigue !== null ? `${data.vocalFatigue}/10` : "not recorded"}
- Average vocal fatigue trend: ${summary.avgVocalFatigue !== null ? `${summary.avgVocalFatigue}/10` : "not enough data yet"}
- Dominant stage feelings: ${summary.topFeelings.length > 0 ? summary.topFeelings.join(", ") : "not recorded"}
- Recovery today — water: ${data.water ? "yes" : "no"}, sleep: ${data.sleep ? "yes" : "no"}, steam: ${data.steamToday ? "yes" : "no"}, electrolytes: ${data.electrolytes ? "yes" : "no"}, vocal rest: ${data.vocalRest ? "yes" : "no"}
- Personal note: "${data.voiceDescription || "nothing written"}"

Write 3 paragraphs. First: what the data actually shows — be specific and honest. If numbers are strong, acknowledge it plainly. If something is low or concerning, name it clearly without softening it into meaninglessness. Second: identify 1-2 concrete patterns or risks visible in the data. Give one specific, actionable habit or technique to address the most important one. Third: a grounded, realistic closing — what to watch for in the next run, based on what you see here.

Address ${firstName} by name at least once. No bullet points. No generic encouragement. Earn any positive statement with data. Keep it under 250 words.`;

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const result = await response.json();
      const text = result.text ?? "Could not generate analysis.";
      setAiAnalysis(text);
      setAiUsed(true);
      localStorage.setItem(AI_KEY, JSON.stringify({ date: getAppDate() }));
      // Persist to Firebase
      await saveAiAnalysis(getAppDate(), text);
    } catch (e) {
      console.error(e);
      setAiAnalysis("Something went wrong. Try again later.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="mx-4 rounded-3xl overflow-hidden shadow-sm border border-white/40">

      {/* BG Header */}
      <div className="relative px-5 pt-6 pb-5"
        style={{ backgroundImage: "url('/ocean-bg.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0" style={{ background: "rgba(220,240,255,0.45)" }} />
        <div className="relative z-10">
          <p className="text-[10px] font-black tracking-[3px] uppercase text-[#2A5F8A] mb-2">☀️ Rest day</p>
          <h2 className="text-[22px] leading-tight text-[#1A3A52] mb-1"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontStyle: "italic" }}>
            Today is your day off.
          </h2>
          <p className="text-[13px] text-[#2A5F8A] mb-4">Rest days count — keep your streak alive 🌊</p>

          {saved ? (
            <div className="flex items-center justify-center gap-2 w-full h-11 rounded-full text-[13px] font-semibold"
              style={{ background: "rgba(42,126,191,0.15)", color: "#1A3A52", border: "1px solid rgba(42,126,191,0.3)" }}>
              ✓ Rest day logged
            </div>
          ) : (
            <button onClick={() => setOpen((v) => !v)}
              className="flex items-center justify-center gap-2 w-full h-11 rounded-full text-[13px] font-semibold text-white active:scale-[0.98] transition-transform"
              style={{ background: "rgba(42,126,191,0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)" }}>
              {open ? "Close form" : "Complete check-in →"}
            </button>
          )}
        </div>
      </div>

      {/* Run summary — loaded from Firebase */}
      {saved && (
        <div className="bg-[#EEF7FF] px-5 py-4 border-t border-[rgba(42,126,191,0.1)]">
          {summaryLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-[#DAEDF8] rounded-full w-32" />
              <div className="h-3 bg-[#DAEDF8] rounded-full w-48" />
            </div>
          ) : summary ? (
            <div className="space-y-4">
              <p className="text-[10px] font-black tracking-widest uppercase text-[#5A8AAF]">
                Since your last rest day · {summary.daysSinceLastRestDay > 0 ? `${summary.daysSinceLastRestDay} days ago` : "first one!"}
              </p>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Shows", value: summary.showCount > 0 ? `${summary.showCount}` : "—", sub: "performances" },
                  { label: "Avg show", value: summary.avgShowRating ? `${summary.avgShowRating}/5` : "—", sub: "rating" },
                  { label: "Warmups", value: summary.sessionCount > 0 ? `${summary.sessionCount}` : "—", sub: "sessions" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl px-3 py-2.5 border border-[rgba(42,126,191,0.08)] text-center">
                    <p className="text-[9px] font-black tracking-widest uppercase text-[#A0C0D8]">{s.label}</p>
                    <p className="text-[18px] font-bold text-[#1A3A52]">{s.value}</p>
                    <p className="text-[9px] text-[#A0C0D8]">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Vocal fatigue trend */}
              {summary.avgVocalFatigue !== null && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] font-semibold text-[#5A8AAF]">Avg vocal fatigue (last rest days)</p>
                    <span className="text-[11px] font-bold" style={{
                      color: summary.avgVocalFatigue <= 3 ? "#2C5F3F" : summary.avgVocalFatigue <= 6 ? "#D97706" : "#DC2626"
                    }}>
                      {summary.avgVocalFatigue}/10
                    </span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden border border-[rgba(42,126,191,0.1)]">
                    <div className="h-full rounded-full" style={{
                      width: `${(summary.avgVocalFatigue / 10) * 100}%`,
                      background: summary.avgVocalFatigue <= 3 ? "#2C5F3F" : summary.avgVocalFatigue <= 6 ? "#D97706" : "#DC2626"
                    }} />
                  </div>
                </div>
              )}

              {/* Top feelings */}
              {summary.topFeelings.length > 0 && (
                <div>
                  <p className="text-[10px] font-black tracking-widest uppercase text-[#5A8AAF] mb-2">How you felt on stage</p>
                  <div className="flex flex-wrap gap-1.5">
                    {summary.topFeelings.map((f) => (
                      <span key={f} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white text-[#2A7EBF] border border-[rgba(42,126,191,0.2)]">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Today's note */}
              {data.voiceDescription && (
                <div className="pt-3 border-t border-[rgba(42,126,191,0.1)]">
                  <p className="text-[10px] font-black tracking-widest uppercase text-[#5A8AAF] mb-1">Your note</p>
                  <p className="text-[13px] text-[#1A3A52] italic"
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                    "{data.voiceDescription}"
                  </p>
                </div>
              )}

              {/* AI Analysis */}
              <div className="pt-3 border-t border-[rgba(42,126,191,0.1)]">
                <AiAnalysisBlock
                  analysis={aiAnalysis}
                  loading={aiLoading}
                  canUse={canUseAi}
                  alreadyUsedToday={alreadyUsedToday}
                  onGenerate={handleAiAnalysis}
                />
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Form */}
      {!saved && open && (
        <div className="bg-[#EEF7FF] px-5 py-5 space-y-5 border-t border-[rgba(42,126,191,0.1)]">
          <div>
            <p className="text-[11px] font-black tracking-widest uppercase text-[#5A8AAF] mb-2">How has your voice felt in the last days?</p>
            <textarea rows={3}
              placeholder="e.g. Felt strong through the run, slight tension on high notes by night 3..."
              value={data.voiceDescription}
              onChange={(e) => set("voiceDescription", e.target.value)}
              className="w-full bg-white border border-[rgba(42,126,191,0.15)] rounded-2xl px-4 py-3 text-[13px] text-[#1A3A52] placeholder:text-[#A0C0D8] focus:outline-none focus:ring-2 focus:ring-[rgba(42,126,191,0.25)] resize-none" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-black tracking-widest uppercase text-[#5A8AAF]">Vocal fatigue</p>
              <span className="text-[12px] font-bold" style={{ color: fatigueColor }}>
                {data.vocalFatigue !== null ? `${data.vocalFatigue}/10 · ${fatigueLabel}` : "—"}
              </span>
            </div>
            <input type="range" min={1} max={10} step={1}
              value={data.vocalFatigue ?? 5}
              onChange={(e) => set("vocalFatigue", Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, ${fatigueColor} ${((data.vocalFatigue ?? 5) - 1) / 9 * 100}%, #DAEDF8 ${((data.vocalFatigue ?? 5) - 1) / 9 * 100}%)` }} />
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-[#A0C0D8]">1 · Rested</span>
              <span className="text-[9px] text-[#A0C0D8]">10 · Exhausted</span>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-black tracking-widest uppercase text-[#5A8AAF] mb-3">Recovery checklist</p>
            <div className="space-y-3">
              <CheckRow emoji="🌫️" label="Steam last night?" value={data.steamLastNight} onChange={(v) => set("steamLastNight", v)} />
              <CheckRow emoji="🌫️" label="Steam today?" value={data.steamToday} onChange={(v) => set("steamToday", v)} />
              <CheckRow emoji="💧" label="80–100 oz / 2.5–3L of water?" value={data.water} onChange={(v) => set("water", v)} />
              <CheckRow emoji="🌙" label="7–8 hrs of sleep?" value={data.sleep} onChange={(v) => set("sleep", v)} />
              <CheckRow emoji="⚡" label="Electrolytes?" value={data.electrolytes} onChange={(v) => set("electrolytes", v)} />
              <CheckRow emoji="🤫" label="Vocal rest today?" value={data.vocalRest} onChange={(v) => set("vocalRest", v)} />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full h-11 rounded-full text-white text-[13px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-60"
            style={{ background: "rgba(42,126,191,0.85)" }}>
            {saving ? "Saving..." : "Save rest day ✓"}
          </button>
        </div>
      )}
    </div>
  );
}

function AiAnalysisBlock({ analysis, loading, canUse, alreadyUsedToday, onGenerate }: {
  analysis: string | null;
  loading: boolean;
  canUse: boolean;
  alreadyUsedToday: boolean;
  onGenerate: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (analysis) {
    return (
      <div>
        <button onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between h-10 px-1">
          <p className="text-[10px] font-black tracking-widest uppercase text-[#5A8AAF]">
            ✨ AI run analysis
          </p>
          <div className="flex items-center gap-2">
            {canUse && !alreadyUsedToday && (
              <button onClick={(e) => { e.stopPropagation(); onGenerate(); }}
                className="text-[10px] font-semibold text-[#2A7EBF] hover:underline">
                Regenerate
              </button>
            )}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
              className={`text-[#A0C0D8] transition-transform ${open ? "rotate-180" : ""}`}>
              <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </button>
        {open && (
          <div className="bg-white rounded-2xl p-4 border border-[rgba(42,126,191,0.1)] mt-2">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-[#2A7EBF] border-t-transparent animate-spin shrink-0" />
                <span className="text-[12px] text-[#5A8AAF]">Regenerating analysis...</span>
              </div>
            ) : (
              <p className="text-[13px] text-[#1A3A52] leading-relaxed whitespace-pre-line"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                {analysis}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!canUse) {
    return (
      <p className="text-[11px] text-[#A0C0D8] text-center py-1">
        AI analysis available every 3 rest days 🌊
      </p>
    );
  }

  return (
    <button onClick={onGenerate} disabled={loading}
      className="w-full h-11 rounded-full text-[13px] font-semibold transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
      style={{ background: "rgba(42,126,191,0.12)", color: "#1A3A52", border: "1px solid rgba(42,126,191,0.25)" }}>
      {loading ? (
        <>
          <div className="w-4 h-4 rounded-full border-2 border-[#2A7EBF] border-t-transparent animate-spin" />
          Analyzing your run...
        </>
      ) : (
        <>✨ Get AI run analysis</>
      )}
    </button>
  );
}