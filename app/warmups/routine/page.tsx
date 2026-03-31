"use client";

import { useEffect, useState } from "react";
import { AUDIO_LIBRARY } from "@/components/data/audioLibrary";

const KEY = "personalRoutineItems";

export default function WarmupsRoutinePage() {
  const [routineIds, setRoutineIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setRoutineIds(parsed);
      } catch {}
    }
  }, []);

  const add = (id: string) => setRoutineIds((p) => [...p, id]);

  const remove = (idx: number) =>
    setRoutineIds((p) => p.filter((_, i) => i !== idx));

  const save = () => localStorage.setItem(KEY, JSON.stringify(routineIds));

  const totalSec = routineIds.reduce((acc, id) => {
    const item = AUDIO_LIBRARY.find((a) => a.id === id);
    return acc + (item?.durationSec ?? 0);
  }, 0);
  const totalMin = Math.round(totalSec / 60);

  return (
    <main className="min-h-screen bg-[#F5F2EC]">
      <div className="mx-auto max-w-md px-4 pt-2 pb-28">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h1
              className="text-[28px] text-[#1C2B22] leading-tight mb-1"
              style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 400 }}
            >
              Routine builder
            </h1>
            <p className="text-[13px] text-[#8FA896]">
              Pick exercises and build your warmup.
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#8FA896]">Selected</p>
            <p className="text-[20px] font-bold text-[#2C5F3F]">{routineIds.length}</p>
          </div>
        </div>

        {/* Your Routine */}
        <div className="mb-6">
          <p className="text-[10px] font-black tracking-widest uppercase text-[#8FA896] mb-3 px-1">
            Your routine {totalMin > 0 && `· ~${totalMin} min`}
          </p>
          <div className="bg-white rounded-3xl border border-[rgba(44,95,63,0.08)] shadow-sm overflow-hidden">
            {routineIds.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF0EB] flex items-center justify-center text-xl mx-auto mb-3">
                  🎤
                </div>
                <p className="text-[13px] font-semibold text-[#1C2B22] mb-1">
                  No exercises yet
                </p>
                <p className="text-[12px] text-[#8FA896]">
                  Add from the library below.
                </p>
              </div>
            ) : (
              <div>
                {routineIds.map((id, idx) => {
                  const item = AUDIO_LIBRARY.find((a) => a.id === id);
                  return (
                    <div
                      key={`${id}-${idx}`}
                      className={`flex items-center justify-between px-5 py-3.5 ${
                        idx < routineIds.length - 1
                          ? "border-b border-[rgba(44,95,63,0.06)]"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-[#EAF0EB] text-[10px] font-bold text-[#2C5F3F] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[#1C2B22] truncate">
                            {item ? item.name : id}
                          </p>
                          {item && (
                            <p className="text-[10px] text-[#8FA896]">
                              {item.durationSec}s · {item.level}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => remove(idx)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#B5C4B9] hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0 ml-3"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  );
                })}

                {/* Save + clear */}
                <div className="flex gap-2 p-4 border-t border-[rgba(44,95,63,0.06)]">
                  <button
                    onClick={save}
                    className="flex-1 h-10 rounded-full bg-[#2C5F3F] text-white text-[12px] font-semibold active:scale-95 transition-transform"
                  >
                    Save routine
                  </button>
                  <button
                    onClick={() => setRoutineIds([])}
                    className="h-10 px-4 rounded-full border border-[rgba(44,95,63,0.2)] text-[12px] font-medium text-[#8FA896] hover:bg-[#F5F2EC] transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Library */}
        <div>
          <p className="text-[10px] font-black tracking-widest uppercase text-[#8FA896] mb-3 px-1">
            Audio library · {AUDIO_LIBRARY.length} exercises
          </p>
          <div className="bg-white rounded-3xl border border-[rgba(44,95,63,0.08)] shadow-sm overflow-hidden">
            {AUDIO_LIBRARY.map((item, idx) => (
              <div
                key={item.id}
                className={`flex items-center justify-between px-5 py-3.5 ${
                  idx < AUDIO_LIBRARY.length - 1
                    ? "border-b border-[rgba(44,95,63,0.06)]"
                    : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#1C2B22] truncate">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[#8FA896]">{item.durationSec}s</span>
                    <span className="w-1 h-1 rounded-full bg-[#D5E0D8]" />
                    <span className="text-[10px] text-[#8FA896] capitalize">{item.type}</span>
                    <span className="w-1 h-1 rounded-full bg-[#D5E0D8]" />
                    <span className={`text-[10px] font-medium capitalize ${
                      item.level === "easy" ? "text-[#3D7A55]" :
                      item.level === "medium" ? "text-amber-600" : "text-rose-500"
                    }`}>{item.level}</span>
                  </div>
                </div>
                <button
                  onClick={() => add(item.id)}
                  className="w-8 h-8 rounded-full bg-[#EAF0EB] border border-[rgba(44,95,63,0.15)] flex items-center justify-center text-[#2C5F3F] hover:bg-[#2C5F3F] hover:text-white transition-all active:scale-95 shrink-0 ml-3"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}