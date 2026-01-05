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

export default function WarmupsHomePage() {
  const routines: Routine[] = [
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

 const [selectedRoutineId, setSelectedRoutineId] = useState<string>("personal");
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState<boolean>(false);

  // 1) LEER: corre una sola vez al iniciar
useEffect(() => {
  const savedRoutineId = localStorage.getItem("selectedRoutineId");

  if (savedRoutineId) {
    setSelectedRoutineId(savedRoutineId);
  } else {
    setSelectedRoutineId("personal");
  }

  setHasLoadedFromStorage(true);
}, []);

// 2) GUARDAR: solo después de haber leído
useEffect(() => {
  if (!hasLoadedFromStorage) {
    return;
  }

  localStorage.setItem("selectedRoutineId", selectedRoutineId);
}, [selectedRoutineId, hasLoadedFromStorage]);

  const selectedRoutine = useMemo(
    () => routines.find((r) => r.id === selectedRoutineId) ?? routines[0],
    [selectedRoutineId]
  );

  const personalRoutine = useMemo(
    () => routines.find((r) => r.id === "personal")!,
    []
  );

  const presetRoutines = useMemo(
    () => routines.filter((r) => r.kind === "preset"),
    []
  );

  const isSelectedPersonal = selectedRoutineId === "personal";

  return (
    <main>
      <h1 className="text-3xl font-semibold">Warmups</h1>
      <p className="mt-2 text-sm opacity-70">
        Choose a routine. Your selected routine is shown first.
      </p>

      {/* Selected routine */}
      <section className="mt-6 rounded-2xl border p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">⭐ {selectedRoutine.name}</h2>
            <p className="mt-1 text-sm opacity-70">{selectedRoutine.description}</p>

            <p className="mt-3 text-sm">
              Preview:{" "}
              <span className="opacity-80">
                {selectedRoutine.itemsPreview.join(" • ")}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link href={`/session?routine=${selectedRoutine.id}`} className="underline">
              Start this warmup
            </Link>

            {isSelectedPersonal && (
              <Link href="/warmups/routine" className="underline">
                Edit routine
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Presets */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Preset routines</h2>
        <p className="mt-1 text-sm opacity-70">Developer-made warmups you can try.</p>

        <div className="mt-4 space-y-3">
          {presetRoutines.map((r) => {
            const isSelected = r.id === selectedRoutineId;

            return (
              <div key={r.id} className="rounded-2xl border p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {r.name} {isSelected ? "✓" : ""}
                    </h3>
                    <p className="mt-1 text-sm opacity-70">{r.description}</p>
                    <p className="mt-3 text-sm opacity-80">
                      Preview: {r.itemsPreview.join(" • ")}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedRoutineId(r.id)}
                    className="underline"
                  >
                    {isSelected ? "Selected" : "Select"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Your routine always visible */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Your routine</h2>
        <p className="mt-1 text-sm opacity-70">
          Your editable personalized routine.
        </p>

        <div className="mt-4 rounded-2xl border p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">{personalRoutine.name}</h3>
              <p className="mt-1 text-sm opacity-70">{personalRoutine.description}</p>
              <p className="mt-3 text-sm opacity-80">
                Preview: {personalRoutine.itemsPreview.join(" • ")}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedRoutineId("personal")}
                className="underline"
              >
                {isSelectedPersonal ? "Selected" : "Select"}
              </button>

              <Link href="/warmups/routine" className="underline">
                Edit routine
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}