"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAudioById } from "@/components/data/audioLibrary";

const PERSONAL_ROUTINE_KEY = "personalRoutineItems";

export default function RoutineCard() {
  const [routineIds, setRoutineIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(PERSONAL_ROUTINE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setRoutineIds(parsed);
      } catch {}
    }
    setLoaded(true);
  }, []);

  const items = routineIds.map((id) => getAudioById(id)).filter(Boolean);
  const totalSec = items.reduce((acc, item) => acc + (item?.durationSec ?? 0), 0);
  const totalMin = Math.round(totalSec / 60) || 0;
  const preview = items.slice(0, 3);
  const extra = items.length - 3;
  const hasItems = items.length > 0;

  return (
    <div className="space-y-4">

      {/* Title + subtitle */}
      <div>
        <p className="font-bold text-base text-emerald-950 dark:text-emerald-50">
          Your routine
        </p>
        <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-0.5">
          {loaded
            ? hasItems
              ? `${items.length} exercise${items.length !== 1 ? "s" : ""} · ~${totalMin} min`
              : "No routine set up yet"
            : "Loading..."}
        </p>
      </div>

      {/* Tags */}
      {loaded && hasItems && (
        <div className="flex flex-wrap gap-2">
          {preview.map((item, idx) => (
            <span
              key={`${item!.id}-${idx}`}
              className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-700 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-200"
            >
              {item!.name}
            </span>
          ))}
          {extra > 0 && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-700 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              +{extra} more
            </span>
          )}
        </div>
      )}

      {loaded && !hasItems && (
        <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50 dark:bg-emerald-900/30 p-4">
          <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
            No exercises added yet.
          </p>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
            Tap Edit to build your warmup routine.
          </p>
        </div>
      )}

      {/* Buttons — primary action first */}
      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        <Link
          href="/session"
          className="flex h-11 items-center justify-center rounded-full bg-emerald-700 px-6 text-sm font-bold text-white hover:bg-emerald-800 active:scale-[0.98] transition-colors"
        >
          Start warmup
        </Link>
        <Link
          href="/warmups/routine"
          className="flex h-11 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 px-6 text-sm font-bold text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-800 active:scale-[0.98] transition-colors"
        >
          Edit routine
        </Link>
      </div>

      {/* Stats — below buttons, smaller, secondary */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {[
          { label: "Streak", value: "—" },
          { label: "This week", value: "—" },
          { label: "Avg rating", value: "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-emerald-50 dark:bg-emerald-900/50 border border-emerald-100 dark:border-emerald-800 px-3 py-2.5"
          >
            <p className="text-[9px] font-black tracking-widest uppercase text-emerald-500 dark:text-emerald-400">
              {stat.label}
            </p>
            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mt-0.5">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}