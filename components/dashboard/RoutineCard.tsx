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

  const items = routineIds
    .map((id) => getAudioById(id))
    .filter(Boolean);

  const totalSec = items.reduce((acc, item) => acc + (item?.durationSec ?? 0), 0);
  const totalMin = Math.round(totalSec / 60) || 0;
  const preview = items.slice(0, 4);
  const extra = items.length - 4;
  const hasItems = items.length > 0;

  const stats = [
    { label: "Streak", value: "—" },
    { label: "This week", value: "—" },
    { label: "Avg rating", value: "—" },
  ];

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-extrabold text-emerald-950/90 truncate">
            Your routine
          </p>
          <p className="text-sm text-emerald-900/60 mt-0.5">
            {loaded
              ? hasItems
                ? `${items.length} exercise${items.length !== 1 ? "s" : ""} · ~${totalMin} min`
                : "No routine set up yet"
              : "Loading..."}
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <Link
            href="/session"
            className="inline-flex h-9 items-center justify-center rounded-full bg-emerald-700 px-4 text-sm font-extrabold text-white hover:bg-emerald-800 active:scale-[0.98] transition-colors"
          >
            Start warmup
          </Link>
          <Link
            href="/warmups/routine"
            className="inline-flex h-9 items-center justify-center rounded-full bg-emerald-100 border border-emerald-700/20 px-4 text-sm font-extrabold text-emerald-800 hover:bg-emerald-200 active:scale-[0.98] transition-colors"
          >
            Edit
          </Link>
        </div>
      </div>

      {loaded && hasItems && (
        <div className="mt-3 flex flex-wrap gap-2">
          {preview.map((item) => (
            <span
              key={item!.id}
              className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-700/15 px-3 py-1 text-xs font-bold text-emerald-800"
            >
              {item!.name}
            </span>
          ))}
          {extra > 0 && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-700/15 px-3 py-1 text-xs font-bold text-emerald-800">
              +{extra} more
            </span>
          )}
        </div>
      )}

      {loaded && !hasItems && (
        <div className="mt-4 rounded-2xl border border-emerald-900/10 bg-emerald-50 p-4">
          <p className="text-sm font-bold text-emerald-900">
            No exercises added yet.
          </p>
          <p className="mt-1 text-sm text-emerald-900/70">
            Go to Edit to build your warmup routine.
          </p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-emerald-50 px-3 py-2.5">
            <p className="text-[10px] font-black tracking-widest uppercase text-emerald-700">
              {stat.label}
            </p>
            <p className="text-xl font-extrabold text-emerald-950 mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}