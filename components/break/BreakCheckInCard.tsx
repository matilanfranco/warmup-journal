"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { saveBreakCheckIn, getBreakCheckIn, BreakActivity } from "@/lib/firebaseService";
import { getAppDate } from "@/lib/dateUtils";

const ACTIVITIES: { value: BreakActivity; label: string; emoji: string }[] = [
  { value: "vocalized", label: "Vocalized", emoji: "🎤" },
  { value: "learned-songs", label: "Learned songs", emoji: "🎵" },
  { value: "practiced-technique", label: "Practiced technique", emoji: "🎯" },
  { value: "rest", label: "Voice rest", emoji: "🤫" },
  { value: "nothing", label: "Nothing today", emoji: "☁️" },
];

export default function BreakCheckInCard() {
  const [activities, setActivities] = useState<BreakActivity[]>([]);
  const [vocalRating, setVocalRating] = useState<number | null>(null);
  const [water, setWater] = useState<boolean | null>(null);
  const [sleep, setSleep] = useState<boolean | null>(null);
  const [electrolytes, setElectrolytes] = useState<boolean | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const existing = await getBreakCheckIn(getAppDate());
        if (existing) {
          setActivities(existing.activities ?? []);
          setVocalRating(existing.vocalRating);
          setWater(existing.water);
          setSleep(existing.sleep);
          setElectrolytes(existing.electrolytes);
          setNote(existing.note ?? "");
          setSaved(true);
        }
      } catch {}
    }
    load();
  }, []);

  const toggleActivity = (a: BreakActivity) => {
    if (a === "nothing") { setActivities(["nothing"]); return; }
    setActivities((prev) =>
      prev.includes(a)
        ? prev.filter((x) => x !== a)
        : [...prev.filter((x) => x !== "nothing"), a]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveBreakCheckIn({ activities, vocalRating, water, sleep, electrolytes, note });
      setSaved(true);
      setExpanded(false);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const hasActivity = activities.length > 0;

  return (
    <div className="mx-4 rounded-3xl overflow-hidden shadow-sm border border-white/40">

      {/* Hero */}
      <div className="relative px-5 pt-6 pb-5"
        style={{ backgroundImage: "url('/break-bg.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0" style={{ background: "rgba(255,235,210,0.35)" }} />
        <div className="relative z-10">
          <p className="text-[10px] font-black tracking-[3px] uppercase text-[#8B5E3C] mb-2">
            🌴 Break mode
          </p>
          <h2 className="text-[26px] leading-tight text-[#3D1F0A] mb-1"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontStyle: "italic" }}>
            How was today?
          </h2>
          <p className="text-[13px] text-[#8B6A50] mb-5">
            No pressure — just check in when you feel like it.
          </p>

          {saved ? (
            <button onClick={() => setExpanded((v) => !v)}
              className="flex items-center justify-center gap-2 w-full h-11 rounded-full text-[13px] font-semibold"
              style={{ background: "rgba(139,94,60,0.15)", color: "#3D1F0A", border: "1px solid rgba(139,94,60,0.3)" }}>
              {expanded ? "Close" : "✓ Logged · Edit"}
            </button>
          ) : (
            <button onClick={() => setExpanded((v) => !v)}
              className="flex items-center justify-center gap-2 w-full h-11 rounded-full text-[13px] font-semibold text-white active:scale-[0.98] transition-transform"
              style={{ background: "rgba(139,94,60,0.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)" }}>
              {expanded ? "Close" : "Log your day →"}
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      {expanded && (
        <div className="bg-[#FFF8F0] px-5 py-5 space-y-5 border-t border-[rgba(139,94,60,0.1)]">

          {/* Activities */}
          <div>
            <p className="text-[11px] font-black tracking-widest uppercase text-[#8B6A50] mb-3">
              What did you do today?
            </p>
            <div className="flex flex-wrap gap-2">
              {ACTIVITIES.map((a) => (
                <button key={a.value} type="button" onClick={() => toggleActivity(a.value)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-medium border transition-all active:scale-95 ${
                    activities.includes(a.value)
                      ? "bg-[#8B5E3C] text-white border-[#8B5E3C]"
                      : "bg-white text-[#8B6A50] border-[rgba(139,94,60,0.2)] hover:bg-[#FFF0E0]"
                  }`}>
                  <span>{a.emoji}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vocal rating — only if did something */}
          {hasActivity && !activities.includes("nothing") && (
            <div>
              <p className="text-[11px] font-black tracking-widest uppercase text-[#8B6A50] mb-3">
                How did your voice feel? <span className="font-normal normal-case text-[#C4A882]">(1–5)</span>
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} type="button" onClick={() => setVocalRating(r)}
                    className={`flex-1 h-10 rounded-xl text-[14px] font-semibold border transition-all active:scale-95 ${
                      vocalRating === r
                        ? "bg-[#8B5E3C] text-white border-[#8B5E3C]"
                        : "bg-white text-[#8B6A50] border-[rgba(139,94,60,0.2)] hover:bg-[#FFF0E0]"
                    }`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recovery mini */}
          <div>
            <p className="text-[11px] font-black tracking-widest uppercase text-[#8B6A50] mb-3">Recovery</p>
            <div className="space-y-2.5">
              {[
                { label: "80–100 oz / 2.5–3L water", emoji: "💧", val: water, set: setWater },
                { label: "7–8h sleep", emoji: "🌙", val: sleep, set: setSleep },
                { label: "Electrolytes", emoji: "⚡", val: electrolytes, set: setElectrolytes },
              ].map(({ label, emoji, val, set }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{emoji}</span>
                    <p className="text-[12px] font-semibold text-[#3D1F0A]">{label}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {[{ l: "Yes", v: true }, { l: "No", v: false }].map(({ l, v }) => (
                      <button key={l} type="button" onClick={() => set(v as boolean)}
                        className={`h-8 px-3.5 rounded-full text-[11px] font-semibold border transition-all active:scale-95 ${
                          val === v
                            ? "bg-[#8B5E3C] text-white border-[#8B5E3C]"
                            : "bg-white text-[#8B6A50] border-[rgba(139,94,60,0.2)] hover:bg-[#FFF0E0]"
                        }`}>{l}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <p className="text-[11px] font-black tracking-widest uppercase text-[#8B6A50] mb-2">
              Note <span className="font-normal normal-case text-[#C4A882]">(optional)</span>
            </p>
            <textarea rows={2}
              placeholder="Anything about your voice, your day, how you're feeling..."
              value={note} onChange={(e) => setNote(e.target.value)}
              className="w-full bg-white border border-[rgba(139,94,60,0.15)] rounded-2xl px-4 py-3 text-[13px] text-[#3D1F0A] placeholder:text-[#C4A882] focus:outline-none focus:ring-2 focus:ring-[rgba(139,94,60,0.2)] resize-none" />
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full h-11 rounded-full text-white text-[13px] font-semibold active:scale-[0.98] disabled:opacity-60 transition-transform"
            style={{ background: "rgba(139,94,60,0.85)" }}>
            {saving ? "Saving..." : "Save ✓"}
          </button>
        </div>
      )}

      {/* Quick sessions access */}
      {!expanded && (
        <div className="bg-[#FFF8F0] px-5 py-3 border-t border-[rgba(139,94,60,0.08)]">
          <p className="text-[10px] font-black tracking-widest uppercase text-[#C4A882] mb-2">
            Feel like practicing?
          </p>
          <div className="flex gap-2">
            <Link href="/session"
              className="flex-1 h-9 rounded-full bg-white border border-[rgba(44,95,63,0.2)] text-[12px] font-medium text-[#2C5F3F] flex items-center justify-center gap-1.5 hover:bg-[#EAF0EB] transition-colors">
              🎤 Warmup
            </Link>
            <Link href="/cooldown"
              className="flex-1 h-9 rounded-full bg-white border border-[rgba(107,91,158,0.2)] text-[12px] font-medium text-[#6B5B9E] flex items-center justify-center gap-1.5 hover:bg-[#EDE8F8] transition-colors">
              🌙 Cool down
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}