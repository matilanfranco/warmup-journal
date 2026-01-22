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
    setShows((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <section className="rounded-3xl border border-emerald-900/10 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold tracking-tight text-emerald-950/90 flex items-center gap-2">
          🎤 Today’s shows
        </h2>
      </div>

      {/* Input */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={showName}
          onChange={(e) => setShowName(e.target.value)}
          placeholder="e.g. R&B Classics / Rock Legends / Dance Party"
          className="h-11 w-full rounded-full border border-emerald-900/15 bg-emerald-50 px-4 text-sm text-emerald-950/90 placeholder:text-emerald-900/35 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />

        <button
          onClick={addShow}
          className="h-11 w-full shrink-0 rounded-full bg-emerald-600 px-5 text-sm font-extrabold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98] sm:w-auto"
        >
          Add
        </button>
      </div>

      {/* Empty */}
      {shows.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-emerald-900/10 bg-emerald-50 p-4">
          <p className="text-sm font-bold text-emerald-900">
            No shows yet.
          </p>
          <p className="mt-1 text-sm text-emerald-900/70">
            Add your sets so you can track the day.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {shows.map((element, i) => (
            <li
              key={`${element}-${i}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-900/10 bg-emerald-50 px-4 py-3 shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-emerald-950/90">
                  {element}
                </p>
                <p className="mt-0.5 text-xs text-emerald-900/60">
                  Tap ✕ to remove
                </p>
              </div>

              <button
                onClick={() => removeShow(i)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-900/10 bg-white/70 text-sm font-black text-emerald-900/60 hover:text-rose-700 hover:bg-rose-50 active:scale-[0.98]"
                aria-label="Remove show"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}