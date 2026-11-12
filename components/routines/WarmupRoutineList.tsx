"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAudioById } from "@/components/data/audioLibrary";
import {
  listRoutines, pickSelected, setSelectedRoutineId, WarmupRoutine,
} from "@/lib/routines";

function minutes(r: WarmupRoutine) {
  const sec = r.audioIds.reduce((acc, id) => acc + (getAudioById(id)?.durationSec ?? 0), 0);
  return Math.max(1, Math.round(sec / 60));
}

export default function WarmupRoutineList() {
  const [routines, setRoutines] = useState<WarmupRoutine[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    listRoutines()
      .then((all) => { setRoutines(all); setSelectedId(pickSelected(all)?.id ?? null); })
      .catch((e) => { console.error(e); setRoutines([]); });
  }, []);

  const select = (id: string) => { setSelectedId(id); setSelectedRoutineId(id); };

  if (routines === null) {
    return (
      <div className="space-y-3">
        {[0, 1].map((i) => <div key={i} className="h-28 rounded-3xl bg-white animate-pulse" />)}
      </div>
    );
  }

  if (routines.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-[rgba(44,95,63,0.08)] shadow-sm p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#EAF0EB] flex items-center justify-center text-xl mx-auto mb-3">🎤</div>
        <p className="text-[15px] font-semibold text-[#1C2B22] mb-1">No routines created yet</p>
        <p className="text-[12px] text-[#8FA896] mb-5">Build your own warmup from the exercise library and give it a name.</p>
        <Link href="/warmups/routine"
          className="inline-flex h-11 items-center px-6 rounded-full bg-[#2C5F3F] text-white text-[13px] font-semibold active:scale-[0.98] transition-transform">
          + Create routine
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {routines.map((r) => {
        const isSel = r.id === selectedId;
        const names = r.audioIds.map((id) => getAudioById(id)?.name).filter(Boolean) as string[];
        return (
          <div key={r.id} onClick={() => select(r.id)}
            className={`bg-white rounded-3xl border shadow-sm p-5 cursor-pointer transition-all ${
              isSel ? "border-[rgba(44,95,63,0.3)] ring-2 ring-[rgba(44,95,63,0.08)]" : "border-[rgba(44,95,63,0.08)]"
            }`}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <h2 className="text-[18px] text-[#1C2B22] leading-snug truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {r.name}
                </h2>
                <p className="text-[11px] text-[#8FA896]">
                  {r.audioIds.length} exercise{r.audioIds.length !== 1 ? "s" : ""} · ~{minutes(r)} min
                </p>
              </div>
              {isSel && (
                <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border bg-[#EAF0EB] text-[#2C5F3F] border-[rgba(44,95,63,0.15)] shrink-0">
                  Today
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {names.slice(0, 4).map((n, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F5F2EC] text-[#5A7A65] border border-[rgba(44,95,63,0.1)]">{n}</span>
              ))}
              {names.length > 4 && <span className="text-[11px] text-[#B5C4B9] self-center">+{names.length - 4}</span>}
            </div>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Link href={`/session?routine=${r.id}`} onClick={() => select(r.id)}
                className="flex-1 h-10 rounded-full bg-[#2C5F3F] text-white text-[13px] font-semibold flex items-center justify-center active:scale-[0.98] transition-transform">
                Start →
              </Link>
              <Link href={`/warmups/routine?id=${r.id}`}
                className="h-10 px-5 rounded-full border text-[13px] font-medium flex items-center justify-center bg-[#F5F2EC] text-[#5A7A65] border-[rgba(44,95,63,0.1)]">
                Edit
              </Link>
            </div>
          </div>
        );
      })}

      <Link href="/warmups/routine"
        className="w-full h-12 rounded-3xl border border-dashed border-[rgba(44,95,63,0.25)] flex items-center justify-center text-[13px] font-medium text-[#5A7A65] active:scale-[0.99] transition-transform hover:bg-white">
        + New routine
      </Link>
    </div>
  );
}
