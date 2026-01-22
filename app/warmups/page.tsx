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
  <main className="min-h-screen bg-[#DFF7E3] text-emerald-900">
    <div className="mx-auto max-w-4xl px-4 py-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl text-emerald-900 font-black tracking-tight">
            Warmups
          </h1>
          <p className="mt-2 text-sm text-neutral-700">
            Choose a routine. Your selected routine is shown first.
          </p>
        </div>
      </div>

      {/* Selected routine */}
      <section className="mt-6 rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900">
              <span className="mr-2 inline-flex h-7 items-center rounded-full bg-emerald-100 px-3 text-xs font-black text-emerald-900">
                SELECTED
              </span>
              {selectedRoutine.name}
            </h2>

            <p className="mt-2 text-sm text-neutral-600">
              {selectedRoutine.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {selectedRoutine.itemsPreview.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-900/80"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-row flex-wrap gap-2 sm:flex-col sm:items-end">
            <Link
              href={`/session?routine=${selectedRoutine.id}`}
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.99]"
            >
              Start warmup
            </Link>

            {isSelectedPersonal && (
              <Link
                href="/warmups/routine"
                className="inline-flex items-center justify-center rounded-full border border-emerald-900/15 bg-emerald-50 px-4 py-2 text-sm font-extrabold text-emerald-900 hover:bg-emerald-100"
              >
                Edit routine
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Presets */}
      <section className="mt-10">
        <h2 className="text-lg font-extrabold text-emerald-900">
          Preset routines
        </h2>
        <p className="mt-1 text-sm text-neutral-700">
          Developer-made warmups you can try.
        </p>

        <div className="mt-4 space-y-3">
          {presetRoutines.map((r) => {
            const isSelected = r.id === selectedRoutineId;

            return (
              <div
                key={r.id}
                className={[
                  "rounded-3xl border p-6 shadow-sm",
                  isSelected
                    ? "border-emerald-600/40 bg-emerald-50 ring-2 ring-emerald-200"
                    : "border-emerald-900/10 bg-white",
                ].join(" ")}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-neutral-900">
                      {r.name}
                      {isSelected && (
                        <span className="ml-2 rounded-full bg-emerald-200 px-2 py-0.5 text-xs font-black text-emerald-950">
                          ✓ Selected
                        </span>
                      )}
                    </h3>

                    <p className="mt-2 text-sm text-neutral-600">
                      {r.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {r.itemsPreview.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-900/80"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedRoutineId(r.id)}
                    className={[
                      "inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-extrabold",
                      isSelected
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "border border-emerald-900/15 bg-white text-emerald-900 hover:bg-emerald-50",
                    ].join(" ")}
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
        <h2 className="text-lg font-extrabold text-neutral-900">Your routine</h2>
        <p className="mt-1 text-sm text-neutral-700">
          Your editable personalized routine.
        </p>

        <div
          className={[
            "mt-4 rounded-3xl border p-6 shadow-sm",
            isSelectedPersonal
              ? "border-emerald-600/40 bg-emerald-50 ring-2 ring-emerald-200"
              : "border-emerald-900/10 bg-white",
          ].join(" ")}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-neutral-900">
                {personalRoutine.name}
                {isSelectedPersonal && (
                  <span className="ml-2 rounded-full bg-emerald-200 px-2 py-0.5 text-xs font-black text-emerald-950">
                    ✓ Selected
                  </span>
                )}
              </h3>

              <p className="mt-2 text-sm text-neutral-600">
                {personalRoutine.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {personalRoutine.itemsPreview.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-900/80"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-row flex-wrap gap-2 sm:flex-col sm:items-end">
              <button
                onClick={() => setSelectedRoutineId("personal")}
                className={[
                  "inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-extrabold",
                  isSelectedPersonal
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "border border-emerald-900/15 bg-white text-emerald-900 hover:bg-emerald-50",
                ].join(" ")}
              >
                {isSelectedPersonal ? "Selected" : "Select"}
              </button>

              <Link
                href="/warmups/routine"
                className="inline-flex h-10 items-center justify-center rounded-full border border-emerald-900/15 bg-emerald-50 px-4 text-sm font-extrabold text-emerald-900 hover:bg-emerald-100"
              >
                Edit routine
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
);
}