"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Routine = {
  id: string;
  name: string;
  description: string;
  itemsPreview: string[];
  kind: "personal" | "preset";
};

const WARMUP_ROUTINES: Routine[] = [
  { id: "personal", kind: "personal", name: "Your routine", description: "Your personalized warmup routine.", itemsPreview: ["Lip trills", "Breath control", "Sirens"] },
  { id: "high-range", kind: "preset", name: "High Range Routine", description: "Access top range with support and control.", itemsPreview: ["Sirens (up)", "High notes support", "Light resonance"] },
  { id: "resistance", kind: "preset", name: "Resistance Routine", description: "Build stamina and consistency across sets.", itemsPreview: ["Sustains", "Intervals", "Short rests"] },
  { id: "relax-reset", kind: "preset", name: "Relax & Reset", description: "Gentle recovery for tired days.", itemsPreview: ["Breath low", "Jaw/neck relax", "Soft hum"] },
];

const COOLDOWN_ROUTINES: Routine[] = [
  { id: "cd-personal", kind: "personal", name: "Your cool down", description: "Your personalized cool down routine.", itemsPreview: ["Soft hum", "Breath release", "Jaw relax"] },
  { id: "cd-breath-release", kind: "preset", name: "Breath & Release", description: "Deep breathing to decompress the voice.", itemsPreview: ["Belly breath", "Slow exhale", "Vocal rest"] },
  { id: "cd-night-wind", kind: "preset", name: "Night Wind Down", description: "Gentle close for late shows.", itemsPreview: ["Lip buzz", "Soft hum", "Neck roll"] },
  { id: "cd-post-show", kind: "preset", name: "Post-Show Recovery", description: "Reset after heavy vocal use.", itemsPreview: ["Cold down", "Vox fry reset", "Breath flow"] },
];

export default function SessionsPage() {
  const [tab, setTab] = useState<"warmup" | "cooldown">("warmup");
  const [warmupId, setWarmupId] = useState("personal");
  const [cooldownId, setCooldownId] = useState("cd-personal");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const wId = localStorage.getItem("selectedRoutineId");
    const cId = localStorage.getItem("selectedCooldownId");
    if (wId) setWarmupId(wId);
    if (cId) setCooldownId(cId);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("selectedRoutineId", warmupId);
  }, [warmupId, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("selectedCooldownId", cooldownId);
  }, [cooldownId, loaded]);

  const isCooldown = tab === "cooldown";
  const routines = isCooldown ? COOLDOWN_ROUTINES : WARMUP_ROUTINES;
  const selectedId = isCooldown ? cooldownId : warmupId;
  const setSelectedId = isCooldown ? setCooldownId : setWarmupId;
  const selected = useMemo(() => routines.find((r) => r.id === selectedId) ?? routines[0], [selectedId, routines]);
  const presets = routines.filter((r) => r.kind === "preset");
  const personal = routines.find((r) => r.kind === "personal")!;

  const sessionHref = isCooldown ? `/cooldown?routine=${selected.id}` : `/session?routine=${selected.id}`;
  const editHref = isCooldown ? "/cooldown/routine" : "/warmups/routine";

  // ── Palette ───────────────────────────────────────────────
  const accent = isCooldown ? "#6B5B9E" : "#2C5F3F";
  const accentLight = isCooldown ? "#EDE8F8" : "#EAF0EB";
  const accentText = isCooldown ? "#4A3D7A" : "#1A5030";
  const bg = isCooldown ? "bg-[#F0EDF8]" : "bg-[#F5F2EC]";
  const cardBorder = isCooldown ? "border-[rgba(107,91,158,0.1)]" : "border-[rgba(44,95,63,0.08)]";
  const tagBg = isCooldown ? "bg-[#EDE8F8]" : "bg-[#F5F2EC]";
  const tagText = isCooldown ? "text-[#4A3D7A]" : "text-[#5A7A65]";
  const tagBorder = isCooldown ? "border-[rgba(107,91,158,0.15)]" : "border-[rgba(44,95,63,0.1)]";
  const selectedRing = isCooldown ? "border-[rgba(107,91,158,0.3)] ring-2 ring-[rgba(107,91,158,0.08)]" : "border-[rgba(44,95,63,0.3)] ring-2 ring-[rgba(44,95,63,0.08)]";
  const badgeBg = isCooldown ? "bg-[#EDE8F8] text-[#4A3D7A] border-[rgba(107,91,158,0.2)]" : "bg-[#EAF0EB] text-[#2C5F3F] border-[rgba(44,95,63,0.15)]";
  const checkBg = isCooldown ? "bg-[#EDE8F8] text-[#4A3D7A] border-[rgba(107,91,158,0.15)]" : "bg-[#EAF0EB] text-[#2C5F3F] border-[rgba(44,95,63,0.15)]";

  return (
    <main className={`min-h-screen ${bg} transition-colors duration-300`}>
      <div className="mx-auto max-w-md px-4 pt-2 pb-28">

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-[28px] leading-tight mb-1"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 400,
              color: isCooldown ? "#2D2650" : "#1C2B22" }}>
            Sessions
          </h1>
          <p className="text-[13px]" style={{ color: isCooldown ? "#9B8EC4" : "#8FA896" }}>
            Choose your session type and routine.
          </p>
        </div>

        {/* Toggle */}
        <div className={`flex gap-1 p-1 rounded-2xl mb-6 ${isCooldown ? "bg-[#E4DEF4]" : "bg-[#E8EFE9]"}`}>
          <button onClick={() => setTab("warmup")}
            className={`flex-1 h-9 rounded-xl text-[13px] font-bold transition-all active:scale-[0.98] ${
              !isCooldown ? "bg-white text-[#2C5F3F] shadow-sm" : "text-[#9B8EC4] hover:text-[#6B5B9E]"
            }`}>
            🔥 Warmup
          </button>
          <button onClick={() => setTab("cooldown")}
            className={`flex-1 h-9 rounded-xl text-[13px] font-bold transition-all active:scale-[0.98] ${
              isCooldown ? "bg-white text-[#6B5B9E] shadow-sm" : "text-[#5A7A65] hover:text-[#2C5F3F]"
            }`}>
            🌙 Cool down
          </button>
        </div>

        {/* Selected hero */}
        <div className={`bg-white rounded-3xl ${cardBorder} border shadow-sm p-5 mb-6`}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border ${badgeBg}`}>
              Selected
            </span>
          </div>
          <h2 className="text-[20px] mb-1"
            style={{ fontFamily: "'Playfair Display', serif", color: isCooldown ? "#2D2650" : "#1C2B22" }}>
            {selected.name}
          </h2>
          <p className="text-[13px] mb-4" style={{ color: isCooldown ? "#9B8EC4" : "#8FA896" }}>
            {selected.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-5">
            {selected.itemsPreview.map((item) => (
              <span key={item} className={`px-3 py-1 rounded-full text-[11px] font-medium ${tagBg} ${tagText} border ${tagBorder}`}>
                {item}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Link href={sessionHref}
              className="flex-1 h-11 rounded-full text-white text-[13px] font-semibold flex items-center justify-center active:scale-[0.98] transition-transform"
              style={{ background: accent }}>
              Start session →
            </Link>
            {selected.kind === "personal" && (
              <Link href={editHref}
                className={`h-11 px-5 rounded-full border text-[13px] font-medium flex items-center justify-center hover:opacity-80 active:scale-[0.98] transition-all ${tagBg} ${tagText} ${tagBorder}`}>
                Edit
              </Link>
            )}
          </div>
        </div>

        {/* Personal routine */}
        <div className="mb-3">
          <p className="text-[10px] font-black tracking-widest uppercase mb-3 px-1"
            style={{ color: isCooldown ? "#9B8EC4" : "#8FA896" }}>
            Your routine
          </p>
          <RoutineCard routine={personal} isSelected={selectedId === personal.id}
            onSelect={() => setSelectedId(personal.id)}
            editHref={editHref} accent={accent} accentLight={accentLight}
            selectedRing={selectedRing} checkBg={checkBg} tagBg={tagBg} tagText={tagText} tagBorder={tagBorder}
            isCooldown={isCooldown} />
        </div>

        {/* Presets */}
        <div>
          <p className="text-[10px] font-black tracking-widest uppercase mb-3 mt-6 px-1"
            style={{ color: isCooldown ? "#9B8EC4" : "#8FA896" }}>
            Preset routines
          </p>
          <div className="space-y-3">
            {presets.map((r) => (
              <RoutineCard key={r.id} routine={r} isSelected={selectedId === r.id}
                onSelect={() => setSelectedId(r.id)}
                accent={accent} accentLight={accentLight}
                selectedRing={selectedRing} checkBg={checkBg} tagBg={tagBg} tagText={tagText} tagBorder={tagBorder}
                isCooldown={isCooldown} />
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}

function RoutineCard({ routine, isSelected, onSelect, editHref, accent, accentLight, selectedRing, checkBg, tagBg, tagText, tagBorder, isCooldown }: {
  routine: Routine; isSelected: boolean; onSelect: () => void; editHref?: string;
  accent: string; accentLight: string; selectedRing: string; checkBg: string;
  tagBg: string; tagText: string; tagBorder: string; isCooldown: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl border p-4 transition-all ${isSelected ? selectedRing : "border-[rgba(44,95,63,0.08)]"}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[14px] font-semibold" style={{ color: isCooldown ? "#2D2650" : "#1C2B22" }}>
              {routine.name}
            </p>
            {isSelected && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${checkBg}`}>
                ✓ Selected
              </span>
            )}
          </div>
          <p className="text-[12px]" style={{ color: isCooldown ? "#9B8EC4" : "#8FA896" }}>
            {routine.description}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {routine.itemsPreview.map((item) => (
          <span key={item} className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${tagBg} ${tagText} border ${tagBorder}`}>
            {item}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={onSelect}
          className={`flex-1 h-9 rounded-full text-[12px] font-semibold transition-all active:scale-95 ${
            isSelected ? "text-white" : `border text-[12px] ${tagBg} ${tagText} ${tagBorder} hover:opacity-80`
          }`}
          style={isSelected ? { background: accent } : {}}>
          {isSelected ? "Selected" : "Select"}
        </button>
        {editHref && (
          <Link href={editHref}
            className={`h-9 px-4 rounded-full border text-[12px] font-medium flex items-center justify-center hover:opacity-80 transition-all ${tagBg} ${tagText} ${tagBorder}`}>
            Edit
          </Link>
        )}
      </div>
    </div>
  );
}