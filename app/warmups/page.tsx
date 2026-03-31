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

const ROUTINES: Routine[] = [
  {
    id: "personal",
    kind: "personal",
    name: "Your routine",
    description: "Your personalized warmup routine.",
    itemsPreview: ["Lip trills", "Breath control", "Sirens"],
  },
  {
    id: "high-range",
    kind: "preset",
    name: "High Range Routine",
    description: "Access top range with support and control.",
    itemsPreview: ["Sirens (up)", "High notes support", "Light resonance"],
  },
  {
    id: "resistance",
    kind: "preset",
    name: "Resistance Routine",
    description: "Build stamina and consistency across sets.",
    itemsPreview: ["Sustains", "Intervals", "Short rests"],
  },
  {
    id: "relax-reset",
    kind: "preset",
    name: "Relax & Reset",
    description: "Gentle recovery routine for tired days.",
    itemsPreview: ["Breath low", "Jaw/neck relax", "Soft hum"],
  },
];

export default function WarmupsHomePage() {
  const [selectedId, setSelectedId] = useState("personal");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("selectedRoutineId");
    if (saved) setSelectedId(saved);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("selectedRoutineId", selectedId);
  }, [selectedId, loaded]);

  const selected = useMemo(
    () => ROUTINES.find((r) => r.id === selectedId) ?? ROUTINES[0],
    [selectedId]
  );

  const presets = ROUTINES.filter((r) => r.kind === "preset");
  const personal = ROUTINES.find((r) => r.id === "personal")!;

  return (
    <main className="min-h-screen bg-[#F5F2EC]">
      <div className="mx-auto max-w-md px-4 pt-2 pb-28">

        {/* Header */}
        <div className="mb-6">
          <h1
            className="text-[28px] text-[#1C2B22] leading-tight mb-1"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 400 }}
          >
            Warmups
          </h1>
          <p className="text-[13px] text-[#8FA896]">
            Choose a routine. Your selected one starts first.
          </p>
        </div>

        {/* Selected routine hero */}
        <div className="bg-white rounded-3xl border border-[rgba(44,95,63,0.08)] shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#2C5F3F] bg-[#EAF0EB] px-2.5 py-1 rounded-full border border-[rgba(44,95,63,0.15)]">
              Selected
            </span>
          </div>
          <h2
            className="text-[20px] text-[#1C2B22] mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {selected.name}
          </h2>
          <p className="text-[13px] text-[#8FA896] mb-4">{selected.description}</p>

          <div className="flex flex-wrap gap-2 mb-5">
            {selected.itemsPreview.map((item) => (
              <span
                key={item}
                className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#F5F2EC] text-[#5A7A65] border border-[rgba(44,95,63,0.1)]"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <Link
              href={`/session?routine=${selected.id}`}
              className="flex-1 h-11 rounded-full bg-[#2C5F3F] text-white text-[13px] font-semibold flex items-center justify-center active:scale-[0.98] transition-transform"
            >
              Start warmup →
            </Link>
            {selected.id === "personal" && (
              <Link
                href="/warmups/routine"
                className="h-11 px-5 rounded-full border border-[rgba(44,95,63,0.2)] text-[13px] font-medium text-[#5A7A65] flex items-center justify-center hover:bg-[#F5F2EC] active:scale-[0.98] transition-all"
              >
                Edit
              </Link>
            )}
          </div>
        </div>

        {/* Your personal routine */}
        <div className="mb-3">
          <p className="text-[10px] font-black tracking-widest uppercase text-[#8FA896] mb-3 px-1">
            Your routine
          </p>
          <RoutineCard
            routine={personal}
            isSelected={selectedId === "personal"}
            onSelect={() => setSelectedId("personal")}
            editHref="/warmups/routine"
          />
        </div>

        {/* Preset routines */}
        <div>
          <p className="text-[10px] font-black tracking-widest uppercase text-[#8FA896] mb-3 mt-6 px-1">
            Preset routines
          </p>
          <div className="space-y-3">
            {presets.map((r) => (
              <RoutineCard
                key={r.id}
                routine={r}
                isSelected={selectedId === r.id}
                onSelect={() => setSelectedId(r.id)}
              />
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}

function RoutineCard({
  routine,
  isSelected,
  onSelect,
  editHref,
}: {
  routine: Routine;
  isSelected: boolean;
  onSelect: () => void;
  editHref?: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border p-4 transition-all ${
        isSelected
          ? "border-[rgba(44,95,63,0.3)] ring-2 ring-[rgba(44,95,63,0.08)]"
          : "border-[rgba(44,95,63,0.08)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[14px] font-semibold text-[#1C2B22]">{routine.name}</p>
            {isSelected && (
              <span className="text-[10px] font-bold text-[#2C5F3F] bg-[#EAF0EB] px-2 py-0.5 rounded-full border border-[rgba(44,95,63,0.15)]">
                ✓ Selected
              </span>
            )}
          </div>
          <p className="text-[12px] text-[#8FA896]">{routine.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {routine.itemsPreview.map((item) => (
          <span
            key={item}
            className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#F5F2EC] text-[#5A7A65] border border-[rgba(44,95,63,0.08)]"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onSelect}
          className={`flex-1 h-9 rounded-full text-[12px] font-semibold transition-all active:scale-95 ${
            isSelected
              ? "bg-[#2C5F3F] text-white"
              : "border border-[rgba(44,95,63,0.2)] text-[#5A7A65] hover:bg-[#F5F2EC]"
          }`}
        >
          {isSelected ? "Selected" : "Select"}
        </button>
        {editHref && (
          <Link
            href={editHref}
            className="h-9 px-4 rounded-full border border-[rgba(44,95,63,0.2)] text-[12px] font-medium text-[#5A7A65] flex items-center justify-center hover:bg-[#F5F2EC] transition-all"
          >
            Edit
          </Link>
        )}
      </div>
    </div>
  );
}