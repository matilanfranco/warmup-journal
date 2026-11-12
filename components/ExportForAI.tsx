"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { buildExportFile, shareOrDownload, ExportRange } from "@/lib/export";

const RANGES: { id: ExportRange; label: string }[] = [
  { id: "7d", label: "Last week" },
  { id: "14d", label: "2 weeks" },
  { id: "all", label: "Everything" },
];

function useExport() {
  const { profile, user } = useAuth();
  const name = profile?.firstName ?? user?.email?.split("@")[0] ?? "the singer";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (range: ExportRange) => {
    setBusy(true);
    setError(null);
    try {
      await shareOrDownload(await buildExportFile(range, name));
    } catch (e) {
      console.error("Export error:", e);
      setError("Couldn't build the file. Try again.");
    } finally {
      setBusy(false);
    }
  };
  return { run, busy, error };
}

// Card with a range picker — used on the Calendar tab.
export function ExportCard() {
  const [range, setRange] = useState<ExportRange>("7d");
  const { run, busy, error } = useExport();

  return (
    <div className="bg-white rounded-3xl border border-[rgba(44,95,63,0.08)] shadow-sm p-5">
      <p className="text-[10px] font-black tracking-widest uppercase text-[#8FA896] mb-1">✨ Insights with your AI</p>
      <p className="text-[12px] text-[#8FA896] mb-4 leading-relaxed">
        Get a file with your data and a built-in prompt. Drop it into ChatGPT, Claude or any AI chat.
      </p>
      <div className="flex gap-1 p-1 rounded-2xl bg-[#F5F2EC] mb-3">
        {RANGES.map((r) => (
          <button key={r.id} onClick={() => setRange(r.id)}
            className={`flex-1 h-8 rounded-xl text-[12px] font-semibold transition-all ${
              range === r.id ? "bg-white text-[#2C5F3F] shadow-sm" : "text-[#8FA896]"
            }`}>
            {r.label}
          </button>
        ))}
      </div>
      <button onClick={() => run(range)} disabled={busy}
        className="w-full h-11 rounded-full bg-[#2C5F3F] text-white text-[13px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-60">
        {busy ? "Preparing file..." : "Get file ↓"}
      </button>
      {error && <p className="text-[11px] text-rose-500 text-center mt-2">{error}</p>}
    </div>
  );
}

// Single button for the day-off card: exports the run since the previous day off.
export function DayOffExportButton() {
  const { run, busy, error } = useExport();
  return (
    <div>
      <button onClick={() => run("since-rest-day")} disabled={busy}
        className="w-full h-11 rounded-full text-[13px] font-semibold transition-all active:scale-[0.98] disabled:opacity-70"
        style={{ background: "rgba(42,126,191,0.12)", color: "#1A3A52", border: "1px solid rgba(42,126,191,0.25)" }}>
        {busy ? "Preparing file..." : "✨ Get run file for your AI"}
      </button>
      <p className="text-[10px] text-[#A0C0D8] text-center mt-1.5">
        Drop it into ChatGPT or Claude for your debrief
      </p>
      {error && <p className="text-[11px] text-rose-500 text-center mt-1">{error}</p>}
    </div>
  );
}
