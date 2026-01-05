"use client";

import { useState } from "react";

export default function TodayShowsCard() {
  const [showName, setShowName] = useState("");
  const [shows, setShows] = useState<string[]>([]);

  const addShow = () => {
    const name = showName.trim();
    if (!name) return;

    setShows((prev) => [...prev, name]);
    setShowName("");
  };

  const removeShow = (index: number) => {
    setShows((prev) => prev.filter((element, i) => i !== index));
  };

  return (
    <section className="rounded-2xl border p-5 shadow-sm">
      <h2 className="text-xl font-semibold">🎤 Today's shows</h2>

      <div className="mt-4 flex gap-2">
        <input
          value={showName}
          onChange={(e) => setShowName(e.target.value)}
          placeholder="Ej: R&B Classics / Rock Legends / RSB Dance Party"
          className="w-full rounded-xl border px-3 py-2"
        />
        <button
          onClick={addShow}
          className="rounded-xl bg-black px-4 py-2 text-white"
        >
          Add
        </button>
      </div>

      {shows.length === 0 ? (
        <p className="mt-4 text-sm text-gray-600">
          No shows have been added yet.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {shows.map((element, i) => (
            <li key={`${element}-${i}`} className="flex items-center justify-between rounded-xl border px-3 py-2">
              <span>{element}</span>
              <button
                onClick={() => removeShow(i)}
                className="text-sm text-gray-600 hover:underline"
              >
                x
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}