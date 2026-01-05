"use client";

import { useState } from "react";

export default function QuickCheckCard() {
  const [voiceScore, setVoiceScore] = useState<number | null>(null);
  const [fatigue, setFatigue] = useState<"low" | "medium" | "high" | null>(null);
  const [note, setNote] = useState("");

  const saveCheck = () => {
    const data = {
      voiceScore,
      fatigue,
      note,
    };

    console.log("Post-show check:", data);
  };

  return (
    <section className="rounded-2xl border p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Post-show quick check</h2>

      {/* Voice score */}
      <div className="mt-4">
        <p className="text-sm font-medium">How did your voice respond today?</p>
        <div className="mt-2 flex gap-2 ">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              onClick={() => setVoiceScore(score)}
              className={`cursor-pointer rounded-xl border px-3 py-1 transition
               ${voiceScore === score
                  ? "bg-black text-white"
                  : "border-white/30 text-white hover:bg-white/10"
                }`}
            >
              {score}
            </button>
          ))}
        </div>
      </div>

      {/* Fatigue */}
      <div className="mt-4">
        <p className="text-sm font-medium">Vocal fatigue</p>
        <div className="mt-2 flex gap-2">
          {[
            { label: "Low", value: "low" },
            { label: "Medium", value: "medium" },
            { label: "High", value: "high" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFatigue(option.value as any)}
              className={`cursor-pointer rounded-xl border px-3 py-1 ${
                fatigue === option.value ? "bg-black text-white" 
                : "border-white/30 text-white hover:bg-white/10"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="mt-4">
        <p className="text-sm font-medium">Notes (optional)</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="e.g. tired on high notes, dry air, poor sleep…"
          className="mt-2 w-full rounded-xl border px-3 py-2"
        />
      </div>

      <button
        onClick={saveCheck}
        className="cursor-pointer mt-5 w-full rounded-xl bg-black px-4 py-2 text-white hover:bg-white/10"
      >
        Guardar check
      </button>
    </section>
  );
}