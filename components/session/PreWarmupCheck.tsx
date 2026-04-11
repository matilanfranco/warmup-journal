"use client";

import { useState } from "react";
import { saveCheckIn, CheckIn } from "@/lib/firebaseService";

type Props = {
  onStart: () => void;
  onLater: () => void;
};

type Feeling = "energized" | "balanced" | "tired" | "struggling";

const FEELINGS: { value: Feeling; label: string; emoji: string }[] = [
  { value: "energized", label: "Energized", emoji: "⚡" },
  { value: "balanced", label: "Balanced", emoji: "🌿" },
  { value: "tired", label: "Tired", emoji: "😴" },
  { value: "struggling", label: "Struggling", emoji: "🌧️" },
];

export default function PreWarmupCheck({ onStart, onLater }: Props) {
  const [water, setWater] = useState<boolean | null>(null);
  const [steam, setSteam] = useState<boolean | null>(null);
  const [sleep, setSleep] = useState<boolean | null>(null);
  const [caffeine, setCaffeine] = useState<boolean | null>(null);
  const [gym, setGym] = useState<"none" | "light" | "heavy" | null>(null);
  const [alcohol, setAlcohol] = useState<boolean | null>(null);
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [saving, setSaving] = useState(false);

  const handleStart = async () => {
    setSaving(true);
    try {
      await saveCheckIn({ water, steam, sleep, caffeine, gym, alcohol, feeling });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
      onStart();
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[rgba(44,95,63,0.08)] shadow-sm p-5">

      {/* Header */}
      <div className="mb-5">
        <p className="text-[10px] font-black tracking-[3px] uppercase text-[#8FA896] mb-1">Before you begin</p>
        <h2 className="text-[20px] text-[#1C2B22]"
          style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
          Quick check-in
        </h2>
        <p className="text-[12px] text-[#8FA896] mt-1">
          A few questions to understand how your voice is starting today.
        </p>
      </div>

      <div className="space-y-4">

        {/* Water */}
        <CheckRow
          label="80–100 oz / 2.5–3L of water today?"
          emoji="💧"
          value={water}
          onChange={setWater}
          options={[{ label: "Yes", value: true }, { label: "Not yet", value: false }]}
        />

        {/* Morning steam */}
        <CheckRow
          label="Morning steam?"
          emoji="🌫️"
          value={steam}
          onChange={setSteam}
          options={[{ label: "Yes", value: true }, { label: "No", value: false }]}
        />

        {/* Sleep */}
        <CheckRow
          label="7–8+ hours of sleep?"
          emoji="🌙"
          value={sleep}
          onChange={setSleep}
          options={[{ label: "Yes", value: true }, { label: "No", value: false }]}
        />

        {/* Caffeine */}
        <CheckRow
          label="Caffeine today?"
          emoji="☕"
          value={caffeine}
          onChange={setCaffeine}
          options={[{ label: "Yes", value: true }, { label: "No", value: false }]}
        />

        {/* Gym */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base leading-none">🏋️</span>
            <p className="text-[12px] font-semibold text-[#1C2B22]">Gym today?</p>
          </div>
          <div className="flex gap-2">
            {(["none", "light", "heavy"] as const).map((v) => (
              <button key={v} type="button" onClick={() => setGym(v)}
                className={`flex-1 h-9 rounded-xl text-[12px] font-medium border transition-all active:scale-95 capitalize ${
                  gym === v
                    ? "bg-[#2C5F3F] text-white border-[#2C5F3F]"
                    : "bg-[#F5F2EC] text-[#5A7A65] border-[rgba(44,95,63,0.15)] hover:bg-[#EAF0EB]"
                }`}>
                {v === "none" ? "None" : v === "light" ? "Light" : "Heavy"}
              </button>
            ))}
          </div>
        </div>

        {/* Alcohol */}
        <CheckRow
          label="Alcohol in the last 24h?"
          emoji="🍷"
          value={alcohol}
          onChange={setAlcohol}
          options={[{ label: "Yes", value: true }, { label: "No", value: false }]}
        />

        {/* Feeling */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base leading-none">✨</span>
            <p className="text-[12px] font-semibold text-[#1C2B22]">How do you feel today?</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {FEELINGS.map((f) => (
              <button key={f.value} type="button" onClick={() => setFeeling(f.value)}
                className={`h-10 rounded-xl text-[12px] font-medium border transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                  feeling === f.value
                    ? "bg-[#2C5F3F] text-white border-[#2C5F3F]"
                    : "bg-[#F5F2EC] text-[#5A7A65] border-[rgba(44,95,63,0.15)] hover:bg-[#EAF0EB]"
                }`}>
                <span className="text-sm leading-none">{f.emoji}</span>
                {f.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-6">
        <button onClick={onLater}
          className="h-11 px-5 rounded-full border border-[rgba(44,95,63,0.2)] text-[13px] font-medium text-[#8FA896] hover:bg-[#F5F2EC] transition-colors shrink-0">
          Do it later
        </button>
        <button onClick={handleStart} disabled={saving}
          className="flex-1 h-11 rounded-full bg-[#2C5F3F] text-white text-[13px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-60">
          {saving ? "Saving..." : "Start warmup →"}
        </button>
      </div>
    </div>
  );
}

function CheckRow<T>({
  label, emoji, value, onChange, options,
}: {
  label: string;
  emoji: string;
  value: T | null;
  onChange: (v: T) => void;
  options: { label: string; value: T }[];
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-base leading-none shrink-0">{emoji}</span>
        <p className="text-[12px] font-semibold text-[#1C2B22] leading-snug">{label}</p>
      </div>
      <div className="flex gap-1.5 shrink-0">
        {options.map((opt) => (
          <button key={String(opt.value)} type="button" onClick={() => onChange(opt.value)}
            className={`h-8 px-3.5 rounded-full text-[11px] font-semibold border transition-all active:scale-95 whitespace-nowrap ${
              value === opt.value
                ? "bg-[#2C5F3F] text-white border-[#2C5F3F]"
                : "bg-[#F5F2EC] text-[#5A7A65] border-[rgba(44,95,63,0.15)] hover:bg-[#EAF0EB]"
            }`}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}