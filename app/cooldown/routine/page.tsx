"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AUDIO_LIBRARY } from "@/components/data/audioLibrary";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

const KEY = "cooldownRoutineItems";

function MiniPlayer({ src, isPlaying, onToggle }: {
  src: string;
  isPlaying: boolean;
  onToggle: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) a.play().catch(() => {});
    else a.pause();
  }, [isPlaying]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0);
    const onEnd = () => { setProgress(0); onToggle(); };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
    };
  }, [onToggle]);

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = (Number(e.target.value) / 100) * a.duration;
  };

  return (
    <div className="flex items-center gap-2 mt-2 px-1">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button onClick={onToggle}
        className="w-7 h-7 rounded-full bg-[#6B5B9E] flex items-center justify-center shrink-0 active:scale-95">
        {isPlaying ? (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <rect x="1.5" y="1" width="2.5" height="8" rx="1" fill="white"/>
            <rect x="6" y="1" width="2.5" height="8" rx="1" fill="white"/>
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 1L9 5L2 9V1Z" fill="white"/>
          </svg>
        )}
      </button>
      <input type="range" min={0} max={100} step={0.5}
        value={Math.round(progress)}
        onChange={onSeek}
        className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, #6B5B9E ${Math.round(progress)}%, #EDE8F8 ${Math.round(progress)}%)` }}
      />
    </div>
  );
}

export default function CoolDownRoutinePage() {
  const router = useRouter();
  const [routineIds, setRoutineIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

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
  const remove = (idx: number) => setRoutineIds((p) => p.filter((_, i) => i !== idx));

  const save = async () => {
    setSaving(true);
    setSavedOk(false);
    try {
      localStorage.setItem(KEY, JSON.stringify(routineIds));
      const uid = auth.currentUser?.uid;
      if (uid) {
        await setDoc(doc(db, `users/${uid}/routines`, "cooldown"), {
          audioIds: routineIds,
          updatedAt: new Date().toLocaleString(),
        });
      }
      setSavedOk(true);
      setTimeout(() => router.push("/"), 800);
    } catch (e) {
      console.error(e);
      setSavedOk(true);
      setTimeout(() => router.push("/"), 800);
    } finally {
      setSaving(false);
    }
  };

  const totalSec = routineIds.reduce((acc, id) => {
    const item = AUDIO_LIBRARY.find((a) => a.id === id);
    return acc + (item?.durationSec ?? 0);
  }, 0);
  const totalMin = Math.round(totalSec / 60);
  const togglePlay = (id: string) => setPlayingId((prev) => (prev === id ? null : id));

  return (
    <main className="min-h-screen bg-[#F0EDF8]">
      <div className="mx-auto max-w-md px-4 pt-2 pb-28">

        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-[28px] leading-tight mb-1"
              style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 400, color: "#2D2650" }}>
              Cool down builder
            </h1>
            <p className="text-[13px] text-[#9B8EC4]">Pick exercises for your cool down.</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#9B8EC4]">Selected</p>
            <p className="text-[20px] font-bold text-[#6B5B9E]">{routineIds.length}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-[10px] font-black tracking-widest uppercase text-[#9B8EC4] mb-3 px-1">
            Your cool down {totalMin > 0 && `· ~${totalMin} min`}
          </p>
          <div className="bg-white rounded-3xl border border-[rgba(107,91,158,0.1)] shadow-sm overflow-hidden">
            {routineIds.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#EDE8F8] flex items-center justify-center text-xl mx-auto mb-3">🌙</div>
                <p className="text-[13px] font-semibold text-[#2D2650] mb-1">No exercises yet</p>
                <p className="text-[12px] text-[#9B8EC4]">Add from the library below.</p>
              </div>
            ) : (
              <div>
                {routineIds.map((id, idx) => {
                  const item = AUDIO_LIBRARY.find((a) => a.id === id);
                  return (
                    <div key={`${id}-${idx}`}
                      className={`px-5 py-3.5 ${idx < routineIds.length - 1 ? "border-b border-[rgba(107,91,158,0.07)]" : ""}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-[#EDE8F8] text-[10px] font-bold text-[#6B5B9E] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-[#2D2650] truncate">{item ? item.name : id}</p>
                            {item && <p className="text-[10px] text-[#9B8EC4]">{item.durationSec}s · {item.level}</p>}
                          </div>
                        </div>
                        <button onClick={() => remove(idx)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[#C4B8E8] hover:text-rose-400 hover:bg-rose-50 transition-colors shrink-0 ml-3">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                      {item && (
                        <MiniPlayer
                          src={item.audioUrl}
                          isPlaying={playingId === `routine-${idx}`}
                          onToggle={() => togglePlay(`routine-${idx}`)}
                        />
                      )}
                    </div>
                  );
                })}
                <div className="flex gap-2 p-4 border-t border-[rgba(107,91,158,0.07)]">
                  <button onClick={save} disabled={saving || savedOk}
                    className={`flex-1 h-10 rounded-full text-[12px] font-semibold active:scale-95 transition-all ${
                      savedOk
                        ? "bg-[#EDE8F8] text-[#6B5B9E] border border-[rgba(107,91,158,0.2)]"
                        : "bg-[#6B5B9E] text-white"
                    } disabled:opacity-70`}>
                    {savedOk ? "✓ Saved!" : saving ? "Saving..." : "Save routine"}
                  </button>
                  <button onClick={() => setRoutineIds([])}
                    className="h-10 px-4 rounded-full border border-[rgba(107,91,158,0.2)] text-[12px] font-medium text-[#9B8EC4] hover:bg-[#EDE8F8] transition-colors">
                    Clear
                  </button>
                </div>
              </div>
            )}
            {routineIds.length === 0 && (
              <div className="px-4 pb-4">
                <button onClick={save} disabled={saving || savedOk}
                  className="w-full h-10 rounded-full bg-[#6B5B9E] text-white text-[12px] font-semibold active:scale-95 disabled:opacity-70">
                  {savedOk ? "✓ Saved!" : saving ? "Saving..." : "Save empty routine"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black tracking-widest uppercase text-[#9B8EC4] mb-3 px-1">
            Audio library · {AUDIO_LIBRARY.length} exercises
          </p>
          <div className="bg-white rounded-3xl border border-[rgba(107,91,158,0.1)] shadow-sm overflow-hidden">
            {AUDIO_LIBRARY.map((item, idx) => (
              <div key={item.id}
                className={`px-5 py-3.5 ${idx < AUDIO_LIBRARY.length - 1 ? "border-b border-[rgba(107,91,158,0.06)]" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#2D2650] truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[#9B8EC4]">{item.durationSec}s</span>
                      <span className="w-1 h-1 rounded-full bg-[#C4B8E8]" />
                      <span className="text-[10px] text-[#9B8EC4] capitalize">{item.type}</span>
                      <span className="w-1 h-1 rounded-full bg-[#C4B8E8]" />
                      <span className={`text-[10px] font-medium capitalize ${
                        item.level === "easy" ? "text-[#6B5B9E]" :
                        item.level === "medium" ? "text-amber-500" : "text-rose-400"
                      }`}>{item.level}</span>
                    </div>
                  </div>
                  <button onClick={() => add(item.id)}
                    className="w-8 h-8 rounded-full bg-[#EDE8F8] border border-[rgba(107,91,158,0.2)] flex items-center justify-center text-[#6B5B9E] hover:bg-[#6B5B9E] hover:text-white transition-all active:scale-95 shrink-0 ml-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
                <MiniPlayer
                  src={item.audioUrl}
                  isPlaying={playingId === `lib-${item.id}`}
                  onToggle={() => togglePlay(`lib-${item.id}`)}
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}