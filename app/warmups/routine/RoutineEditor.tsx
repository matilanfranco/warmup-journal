"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AUDIO_LIBRARY } from "@/components/data/audioLibrary";
import { getRoutine, saveRoutine, deleteRoutine, setSelectedRoutineId } from "@/lib/routines";

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
    else { a.pause(); }
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
        className="w-7 h-7 rounded-full bg-[#2C5F3F] flex items-center justify-center shrink-0 active:scale-95">
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
        style={{ background: `linear-gradient(to right, #2C5F3F ${Math.round(progress)}%, #EAF0EB ${Math.round(progress)}%)` }}
      />
    </div>
  );
}

// Create (no ?id) or edit (?id=...) a warmup routine.
export default function RoutineEditor() {
  const router = useRouter();
  const editId = useSearchParams().get("id");
  const [name, setName] = useState("");
  const [routineIds, setRoutineIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(!editId);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    if (!editId) return;
    getRoutine(editId)
      .then((r) => { if (r) { setName(r.name); setRoutineIds(r.audioIds); } })
      .catch(console.error)
      .finally(() => setLoaded(true));
  }, [editId]);

  const add = (id: string) => setRoutineIds((p) => [...p, id]);
  const remove = (idx: number) => setRoutineIds((p) => p.filter((_, i) => i !== idx));
  const move = (idx: number, dir: -1 | 1) => setRoutineIds((p) => {
    const j = idx + dir;
    if (j < 0 || j >= p.length) return p;
    const next = [...p];
    [next[idx], next[j]] = [next[j], next[idx]];
    return next;
  });

  const canSave = name.trim().length > 0 && routineIds.length > 0;

  const save = async () => {
    if (!canSave) {
      setError(!name.trim() ? "Give your routine a name." : "Add at least one exercise.");
      return;
    }
    setSaving(true); setError(null);
    try {
      const id = await saveRoutine({ id: editId ?? undefined, name, audioIds: routineIds });
      setSelectedRoutineId(id);
      setSavedOk(true);
      setTimeout(() => router.push("/sessions"), 600);
    } catch (e) {
      console.error(e);
      setError("Couldn't save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const remove_ = async () => {
    if (!editId) return;
    setSaving(true);
    try {
      await deleteRoutine(editId);
      router.push("/sessions");
    } catch (e) {
      console.error(e);
      setError("Couldn't delete. Try again.");
      setSaving(false);
    }
  };

  const totalSec = routineIds.reduce((acc, id) => {
    const item = AUDIO_LIBRARY.find((a) => a.id === id);
    return acc + (item?.durationSec ?? 0);
  }, 0);
  const totalMin = Math.round(totalSec / 60);

  const togglePlay = (id: string) =>
    setPlayingId((prev) => (prev === id ? null : id));

  return (
    <main className="min-h-screen bg-[#F5F2EC]">
      <div className="mx-auto max-w-md px-4 pt-2 pb-48">

        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-[28px] leading-tight mb-1"
              style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 400, color: "#1C2B22" }}>
              {editId ? "Edit routine" : "New routine"}
            </h1>
            <p className="text-[13px] text-[#8FA896]">Name it, then pick and order your exercises.</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#8FA896]">Selected</p>
            <p className="text-[20px] font-bold text-[#2C5F3F]">{routineIds.length}</p>
          </div>
        </div>

        {!loaded ? (
          <div className="h-40 rounded-3xl bg-white animate-pulse mb-6" />
        ) : (<>
        {/* Name */}
        <div className="mb-5">
          <p className="text-[10px] font-black tracking-widest uppercase text-[#8FA896] mb-2 px-1">Name</p>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40}
            placeholder="e.g. Show day, Gentle morning..."
            className="w-full bg-white border border-[rgba(44,95,63,0.12)] rounded-2xl px-4 h-12 text-[15px] text-[#1C2B22] placeholder:text-[#B5C4B9] focus:outline-none focus:ring-2 focus:ring-[rgba(44,95,63,0.2)]" />
        </div>

        {/* Exercises */}
        <div className="mb-6">
          <p className="text-[10px] font-black tracking-widest uppercase text-[#8FA896] mb-3 px-1">
            Exercises {totalMin > 0 && `· ~${totalMin} min`}
          </p>
          <div className="bg-white rounded-3xl border border-[rgba(44,95,63,0.08)] shadow-sm overflow-hidden">
            {routineIds.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF0EB] flex items-center justify-center text-xl mx-auto mb-3">🎤</div>
                <p className="text-[13px] font-semibold text-[#1C2B22] mb-1">No exercises yet</p>
                <p className="text-[12px] text-[#8FA896]">Tap + on the exercises below.</p>
              </div>
            ) : (
              <div>
                {routineIds.map((id, idx) => {
                  const item = AUDIO_LIBRARY.find((a) => a.id === id);
                  return (
                    <div key={`${id}-${idx}`}
                      className={`px-5 py-3.5 ${idx < routineIds.length - 1 ? "border-b border-[rgba(44,95,63,0.06)]" : ""}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-[#EAF0EB] text-[10px] font-bold text-[#2C5F3F] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-[#1C2B22] truncate">{item ? item.name : id}</p>
                            {item && <p className="text-[10px] text-[#8FA896]">{item.durationSec}s · {item.level}</p>}
                          </div>
                        </div>
                        <div className="flex items-center shrink-0 ml-3">
                        <button onClick={() => move(idx, -1)} disabled={idx === 0} aria-label="Move up"
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[#B5C4B9] hover:text-[#2C5F3F] disabled:opacity-30">↑</button>
                        <button onClick={() => move(idx, 1)} disabled={idx === routineIds.length - 1} aria-label="Move down"
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[#B5C4B9] hover:text-[#2C5F3F] disabled:opacity-30">↓</button>
                        <button onClick={() => remove(idx)} aria-label="Remove"
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[#B5C4B9] hover:text-rose-500 hover:bg-rose-50 transition-colors">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                        </div>
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

              </div>
            )}

          </div>
        </div>
        </>)}

        {/* Library */}
        <div>
          <p className="text-[10px] font-black tracking-widest uppercase text-[#8FA896] mb-3 px-1">
            Audio library · {AUDIO_LIBRARY.length} exercises
          </p>
          <div className="bg-white rounded-3xl border border-[rgba(44,95,63,0.08)] shadow-sm overflow-hidden">
            {AUDIO_LIBRARY.map((item, idx) => (
              <div key={item.id}
                className={`px-5 py-3.5 ${idx < AUDIO_LIBRARY.length - 1 ? "border-b border-[rgba(44,95,63,0.06)]" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#1C2B22] truncate">{item.name}</p>
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
                  <button onClick={() => add(item.id)}
                    className="w-8 h-8 rounded-full bg-[#EAF0EB] border border-[rgba(44,95,63,0.15)] flex items-center justify-center text-[#2C5F3F] hover:bg-[#2C5F3F] hover:text-white transition-all active:scale-95 shrink-0 ml-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
                {/* Audio preview */}
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

      {/* Save bar */}
      <div className="fixed bottom-20 left-0 right-0 z-40 px-4">
        <div className="mx-auto max-w-md bg-white/95 backdrop-blur-md rounded-3xl border border-[rgba(44,95,63,0.1)] shadow-lg p-3">
          {error && <p className="text-[11px] text-rose-500 text-center mb-2">{error}</p>}
          <div className="flex gap-2">
            {editId && (confirmDelete ? (
              <button onClick={remove_} disabled={saving}
                className="h-11 px-4 rounded-full bg-rose-50 border border-rose-200 text-[12px] font-semibold text-rose-600">
                Delete for real
              </button>
            ) : (
              <button onClick={() => setConfirmDelete(true)}
                className="h-11 px-4 rounded-full border border-[rgba(44,95,63,0.15)] text-[12px] font-medium text-[#8FA896] hover:text-rose-500">
                Delete
              </button>
            ))}
            <button onClick={save} disabled={saving || savedOk}
              className={`flex-1 h-11 rounded-full text-[13px] font-semibold active:scale-[0.98] transition-all disabled:opacity-70 ${
                savedOk ? "bg-[#EAF0EB] text-[#2C5F3F]" : "bg-[#2C5F3F] text-white"
              }`}>
              {savedOk ? "✓ Saved!" : saving ? "Saving..." : `Save routine${routineIds.length ? ` · ${routineIds.length}` : ""}`}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}