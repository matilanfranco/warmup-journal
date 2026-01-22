"use client";

import { useEffect, useState } from "react";
import { AUDIO_LIBRARY } from "@/components/data/audioLibrary";

const PERSONAL_ROUTINE_LOCALSTORAGE_KEY = "personalRoutineItems";

export default function WarmupsRoutinePage() {
  // Ahora guardamos IDs
  const [routineAudioIds, setRoutineAudioIds] = useState<string[]>([]);

  const addToRoutine = (audioId: string) => {
    setRoutineAudioIds((prev) => [...prev, audioId]);
  };

  const removeFromRoutine = (indexToRemove: number) => {
    setRoutineAudioIds((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const saveRoutine = () => {
    localStorage.setItem(
      PERSONAL_ROUTINE_LOCALSTORAGE_KEY,
      JSON.stringify(routineAudioIds)
    );
    console.log("Saved IDs:", routineAudioIds);
  };

  // LEER al iniciar
  useEffect(() => {
    const savedAsString = localStorage.getItem(PERSONAL_ROUTINE_LOCALSTORAGE_KEY);

    if (savedAsString) {
      const parsed = JSON.parse(savedAsString);
      if (Array.isArray(parsed)) {
        setRoutineAudioIds(parsed);
      } else {
        setRoutineAudioIds([]);
      }
    }
  }, []);

  return (
  <main className="min-h-screen bg-[#DFF7E3] text-neutral-900">
    {/* Safe-area + padding mobile */}
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-6">
      <div
        className="px-[max(0px,env(safe-area-inset-left))] pr-[max(0px,env(safe-area-inset-right))]"
      >
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-emerald-950/90">
              Routine Builder
            </h1>
            <p className="mt-2 text-sm text-emerald-900/80">
              Pick from the library and build today’s routine.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-emerald-900/10 bg-white px-3 py-1 text-xs font-black text-emerald-900">
              🎤 Voice warm-up
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900">
              {routineAudioIds.length} selected
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {/* Library */}
          <section className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-emerald-950/90">
                  Audio Library
                </h2>
                <p className="mt-1 text-sm text-emerald-900/70">
                  Tap “Add” to include an exercise.
                </p>
              </div>

              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-900/80">
                {AUDIO_LIBRARY.length} items
              </span>
            </div>

            <ul className="mt-4 space-y-3">
              {AUDIO_LIBRARY.map((audioItem) => (
                <li
                  key={audioItem.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-900/10 bg-emerald-50 px-4 py-3 shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-extrabold text-emerald-950/90">
                      {audioItem.name}
                    </p>
                    <p className="mt-0.5 text-xs text-emerald-900/70">
                      Add to your routine
                    </p>
                  </div>

                  <button
                    onClick={() => addToRoutine(audioItem.id)}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-600 px-4 text-sm font-extrabold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98]"
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Routine */}
          <section className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-emerald-950/90">
                  Your Routine
                </h2>
                <p className="mt-1 text-sm text-emerald-900/70">
                  Your saved order will be used for sessions.
                </p>
              </div>

              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900">
                {routineAudioIds.length} items
              </span>
            </div>

            {routineAudioIds.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-emerald-900/10 bg-emerald-50 p-4">
                <p className="text-sm font-bold text-emerald-900">
                  No items in your routine yet.
                </p>
                <p className="mt-1 text-sm text-emerald-900/70">
                  Add exercises from the library to build your warm-up.
                </p>
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {routineAudioIds.map((audioId, index) => {
                  const audioItem = AUDIO_LIBRARY.find((a) => a.id === audioId);

                  return (
                    <li
                      key={`${audioId}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-extrabold text-emerald-950/90">
                          <span className="mr-2 inline-flex h-7 items-center rounded-full bg-emerald-100 px-2 text-xs font-black text-emerald-900">
                            {index + 1}
                          </span>
                          {audioItem ? audioItem.name : audioId}
                        </p>
                        <p className="mt-0.5 text-xs text-emerald-900/70">
                          In your routine
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromRoutine(index)}
                        className="inline-flex h-10 items-center justify-center rounded-full border border-emerald-900/15 bg-rose-50 px-4 text-sm font-extrabold text-rose-700 hover:bg-rose-100 active:scale-[0.98]"
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={saveRoutine}
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-emerald-600 px-5 text-sm font-extrabold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.99]"
              >
                Save routine
              </button>

              <button
                onClick={() => setRoutineAudioIds([])}
                className="inline-flex h-11 w-full items-center justify-center rounded-full border border-emerald-900/15 bg-white px-5 text-sm font-extrabold text-emerald-900 hover:bg-emerald-50 active:scale-[0.99]"
              >
                Clear all
              </button>
            </div>

            <p className="mt-3 text-xs text-emerald-900/60">
              Tip: keep it short (3–6 items) for consistency.
            </p>
          </section>
        </div>
      </div>
    </div>
  </main>
);
}