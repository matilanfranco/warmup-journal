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
    <main>
      <h1 className="text-3xl font-semibold">Routine Builder</h1>
      <p className="mt-2 text-sm opacity-70">
        Pick from the library and build today’s routine.
      </p>

      {/* Library */}
      <section className="mt-6">
        <h2 className="text-lg font-semibold">Audio Library</h2>

        <ul className="mt-3 space-y-2">
          {AUDIO_LIBRARY.map((audioItem) => (
            <li
              key={audioItem.id}
              className="flex items-center justify-between rounded-xl border p-3"
            >
              <span>{audioItem.name}</span>
              <button
                onClick={() => addToRoutine(audioItem.id)}
                className="text-sm underline"
              >
                Add
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Routine */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Routine</h2>

        {routineAudioIds.length === 0 ? (
          <p className="mt-3 text-sm opacity-70">No items in your routine yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {routineAudioIds.map((audioId, index) => {
              const audioItem = AUDIO_LIBRARY.find((a) => a.id === audioId);

              return (
                <li
                  key={`${audioId}-${index}`}
                  className="flex items-center justify-between rounded-xl border p-3"
                >
                  <span>
                    {index + 1}. {audioItem ? audioItem.name : audioId}
                  </span>

                  <button
                    onClick={() => removeFromRoutine(index)}
                    className="text-sm underline"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-5">
          <button onClick={saveRoutine} className="rounded-xl border px-4 py-2">
            Save routine
          </button>
        </div>
      </section>
    </main>
  );
}