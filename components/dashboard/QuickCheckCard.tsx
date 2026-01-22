"use client";

import { useState } from "react";

export default function QuickCheckCard() {
  const [voiceScore, setVoiceScore] = useState<number | null>(null);
  const [fatigue, setFatigue] = useState<"low" | "medium" | "high" | null>(null);
  const [note, setNote] = useState("");

  const saveCheck = () => {
    const data = { voiceScore, fatigue, note };
    console.log("Post-show check:", data);
  };

  const scoreBtnClass = (score: number) =>
    [
      "h-11 w-full rounded-2xl border text-sm font-extrabold transition",
      "active:scale-[0.97]",
      voiceScore === score
        ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
        : "border-emerald-900/15 bg-white text-emerald-900 hover:bg-emerald-50",
    ].join(" ");

  const fatigueBtnClass = (value: "low" | "medium" | "high") =>
    [
      "h-11 w-full rounded-2xl border px-4 text-sm font-extrabold transition",
      "active:scale-[0.97]",
      fatigue === value
        ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
        : "border-emerald-900/15 bg-white text-emerald-900 hover:bg-emerald-50",
    ].join(" ");

  const fatigueChip = (value: "low" | "medium" | "high") => {
    if (value === "low") return "bg-emerald-100 text-emerald-900 border-emerald-900/10";
    if (value === "medium") return "bg-amber-100 text-amber-900 border-amber-900/10";
    return "bg-rose-100 text-rose-900 border-rose-900/10";
  };

  return (
    <section className="rounded-3xl border border-emerald-900/10 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold tracking-tight text-emerald-950/90">
            📝 Post-show quick check
          </h2>
          <p className="mt-1 text-sm text-emerald-900/70">
            Quick feedback to track patterns over time.
          </p>
        </div>

        {fatigue && (
          <span
            className={[
              "shrink-0 inline-flex items-center rounded-full border px-3 py-1 text-xs font-black",
              fatigueChip(fatigue),
            ].join(" ")}
          >
            {fatigue.toUpperCase()}
          </span>
        )}
      </div>

      {/* Voice score */}
      <div className="mt-5">
        <p className="text-sm font-extrabold text-emerald-950/90">
          How did your voice respond today?
        </p>
        <p className="mt-1 text-xs text-emerald-900/60">1 = rough · 5 = amazing</p>

        {/* Mobile: grid 5 cols, Desktop: inline */}
        <div className="mt-3 grid grid-cols-5 gap-2 sm:flex sm:flex-wrap sm:gap-2">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              onClick={() => setVoiceScore(score)}
              className={scoreBtnClass(score)}
            >
              {score}
            </button>
          ))}
        </div>
      </div>

      {/* Fatigue */}
      <div className="mt-6">
        <p className="text-sm font-extrabold text-emerald-950/90">Vocal fatigue</p>
        <p className="mt-1 text-xs text-emerald-900/60">
          How heavy did it feel after the show?
        </p>

        {/* Mobile: 3 equal columns */}
        <div className="mt-3 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-2">
          <button onClick={() => setFatigue("low")} className={fatigueBtnClass("low")}>
            Low
          </button>
          <button
            onClick={() => setFatigue("medium")}
            className={fatigueBtnClass("medium")}
          >
            Medium
          </button>
          <button
            onClick={() => setFatigue("high")}
            className={fatigueBtnClass("high")}
          >
            High
          </button>
        </div>
      </div>

      {/* Note */}
      <div className="mt-6">
        <p className="text-sm font-extrabold text-emerald-950/90">
          Notes <span className="text-emerald-900/50">(optional)</span>
        </p>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="e.g. tired on high notes, dry air, poor sleep…"
          className="mt-3 w-full rounded-2xl border border-emerald-900/15 bg-emerald-50 px-4 py-3 text-sm text-emerald-950/90 placeholder:text-emerald-900/35 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button
          onClick={saveCheck}
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-emerald-600 px-5 text-sm font-extrabold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.99]"
        >
          Save check
        </button>

        <button
          onClick={() => {
            setVoiceScore(null);
            setFatigue(null);
            setNote("");
          }}
          className="inline-flex h-11 w-full items-center justify-center rounded-full border border-emerald-900/15 bg-white px-5 text-sm font-extrabold text-emerald-900 hover:bg-emerald-50 active:scale-[0.99]"
        >
          Clear
        </button>
      </div>
    </section>
  );
}