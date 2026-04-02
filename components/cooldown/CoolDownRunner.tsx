"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AUDIO_LIBRARY } from "@/components/data/audioLibrary";
import CoolDownAudioPlayer from "@/components/cooldown/CoolDownAudioPlayer";
import { saveCoolDown, StepRecord, saveMotivationMessage } from "@/lib/firebaseService";
import { getAppDate } from "@/lib/dateUtils";

const PERSONAL_KEY = "cooldownRoutineItems";
const PROGRESS_KEY = "cooldownProgress";

const PRESET_ITEMS: Record<string, string[]> = {
  "cd-breath-release": ["gorilla", "lip-buzz-cold-down", "lip-buzzes"],
  "cd-night-wind": ["lip-buzzes", "nuh", "wuh-vocal-fry"],
  "cd-post-show": ["larynx-vox-fry-reset", "lip-buzz-cold-down", "wuh-vocal-fry"],
};

type RoutineStep = { id: string; title: string; description: string; audioUrl: string; };
type StepProgress =
  | { status: "pending"; note?: string }
  | { status: "skipped"; note?: string }
  | { status: "rated"; rating: number; note?: string };

type PersistedState = {
  date: string;
  routineId: string;
  currentIdx: number;
  progress: StepProgress[];
  finalComment: string;
  completed: boolean;
};

function buildSteps(audioIds: string[]): RoutineStep[] {
  return audioIds.map((id, i) => {
    const item = AUDIO_LIBRARY.find((a) => a.id === id);
    if (!item) return null;
    return { id: `cd-${i}-${item.id}`, title: item.name, description: "Breathe gently. Let your voice rest and release.", audioUrl: item.audioUrl };
  }).filter((s): s is RoutineStep => s !== null);
}

function RatingButton({ value, selected, onClick }: { value: number; selected: boolean; onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={onClick}
      className={`w-10 h-10 rounded-xl text-[14px] font-semibold border transition-all ${
        selected ? "bg-[#6B5B9E] text-white border-[#6B5B9E]" : "bg-white text-[#9B8EC4] border-[rgba(107,91,158,0.2)] hover:bg-[#EDE8F8]"
      }`}>
      {value}
    </motion.button>
  );
}

export default function CoolDownRunner({ routineId = "cd-personal" }: { routineId?: string }) {
  const [steps, setSteps] = useState<RoutineStep[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [progress, setProgress] = useState<StepProgress[]>([]);
  const [noteOpen, setNoteOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [finalComment, setFinalComment] = useState("");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [motivationMsg, setMotivationMsg] = useState("");
  const [loaded, setLoaded] = useState(false);

  const persist = useCallback((
    idx: number, prog: StepProgress[], comment: string, completed: boolean, rId: string
  ) => {
    const state: PersistedState = {
      date: getAppDate(), routineId: rId, currentIdx: idx,
      progress: prog, finalComment: comment, completed,
    };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
  }, []);

  useEffect(() => {
    let ids: string[] = [];
    if (routineId === "cd-personal") {
      const s = localStorage.getItem(PERSONAL_KEY);
      if (s) { try { ids = JSON.parse(s); } catch {} }
      if (ids.length === 0) ids = AUDIO_LIBRARY.slice(0, 3).map((a) => a.id);
    } else {
      ids = PRESET_ITEMS[routineId] ?? AUDIO_LIBRARY.slice(0, 3).map((a) => a.id);
    }
    const newSteps = buildSteps(ids);
    setSteps(newSteps);

    // Try to restore today's progress
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) {
        const saved: PersistedState = JSON.parse(raw);
        if (saved.date === getAppDate() && saved.routineId === routineId) {
          setCurrentIdx(saved.currentIdx);
          const merged: StepProgress[] = newSteps.map((_, i) => saved.progress[i] ?? { status: "pending" });
          setProgress(merged);
          setFinalComment(saved.finalComment ?? "");
          if (saved.completed) { setSummaryOpen(true); setSaved(true); }
          setLoaded(true);
          return;
        }
      }
    } catch {}

    setCurrentIdx(0);
    setProgress(newSteps.map(() => ({ status: "pending" })));
    setFinalComment(""); setSummaryOpen(false); setSaved(false);
    setLoaded(true);
  }, [routineId]);

  const step = steps[currentIdx];
  const currentProgress = progress[currentIdx];
  const isDone = currentProgress?.status === "rated" || currentProgress?.status === "skipped";
  const total = steps.length;
  const pct = total > 0 ? Math.round(((currentIdx + 1) / total) * 100) : 0;

  const setRating = (rating: number) => {
    const updated = progress.map((s, i) => i === currentIdx ? { ...s, status: "rated" as const, rating } : s);
    setProgress(updated);
    persist(currentIdx, updated, finalComment, false, routineId);
  };

  const skip = () => {
    const updated = progress.map((s, i) => i === currentIdx ? { ...s, status: "skipped" as const } : s);
    setProgress(updated);
    persist(currentIdx, updated, finalComment, false, routineId);
  };

  const setNote = (note: string) => {
    const updated = progress.map((s, i) => i === currentIdx ? { ...s, note } : s);
    setProgress(updated);
    persist(currentIdx, updated, finalComment, false, routineId);
  };

  const updateFinalComment = (comment: string) => {
    setFinalComment(comment);
    persist(currentIdx, progress, comment, summaryOpen, routineId);
  };

  const goNext = () => {
    if (currentIdx + 1 >= steps.length) return;
    const newIdx = currentIdx + 1;
    setDirection(1); setCurrentIdx(newIdx); setNoteOpen(false);
    persist(newIdx, progress, finalComment, false, routineId);
  };

  const goPrev = () => {
    if (currentIdx <= 0) return;
    const newIdx = currentIdx - 1;
    setDirection(-1); setCurrentIdx(newIdx); setNoteOpen(false);
    persist(newIdx, progress, finalComment, false, routineId);
  };

  const openSummary = () => {
    setNoteOpen(false); setSummaryOpen(true);
    persist(currentIdx, progress, finalComment, false, routineId);
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const stepRecords: StepRecord[] = steps.map((s, i) => {
        const p = progress[i];
        return { title: s.title, status: p?.status ?? "pending", rating: p?.status === "rated" ? (p as any).rating : null, note: p?.note ?? null };
      });
      await saveCoolDown({ steps: stepRecords, finalComment });
      if (motivationMsg.trim()) await saveMotivationMessage(motivationMsg.trim());
      setSaved(true);
      persist(currentIdx, progress, finalComment, true, routineId);
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const statusLabel = (p: StepProgress | undefined) => {
    if (!p || p.status === "pending") return "Pending";
    if (p.status === "skipped") return "Skipped";
    return `${(p as any).rating}/5`;
  };

  if (!loaded || steps.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 border border-[rgba(107,91,158,0.12)] shadow-sm text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#EDE8F8] flex items-center justify-center text-xl mx-auto mb-3">🌙</div>
        <p className="text-[14px] font-semibold text-[#2D2650] mb-1">No exercises yet</p>
        <p className="text-[12px] text-[#9B8EC4] mb-4">Build your cool down routine first.</p>
        <a href="/cooldown/routine" className="inline-flex h-9 items-center px-5 rounded-full bg-[#6B5B9E] text-white text-[12px] font-semibold">Build routine →</a>
      </div>
    );
  }

  // ── Summary ───────────────────────────────────────────────
  if (summaryOpen) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 border border-[rgba(107,91,158,0.12)] shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[20px] text-[#1E1535]" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
            Cool down complete
          </h2>
          <span className="text-[11px] px-3 py-1 rounded-full bg-[#EDE8F8] text-[#6B5B9E] font-semibold border border-[rgba(107,91,158,0.15)]">✓ Done</span>
        </div>

        <div className="h-1.5 w-full bg-[#EDE8F8] rounded-full mb-5 overflow-hidden">
          <div className="h-full w-full bg-[#6B5B9E] rounded-full" />
        </div>

        <div className="space-y-2 mb-5">
          {steps.map((s, i) => {
            const p = progress[i];
            return (
              <div key={s.id} className="flex items-center justify-between rounded-xl bg-[#F8F5FF] px-4 py-3 border border-[rgba(107,91,158,0.07)]">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#2D2650] truncate">
                    <span className="inline-flex w-5 h-5 rounded-full bg-[#EDE8F8] text-[10px] font-bold text-[#6B5B9E] items-center justify-center mr-2">{i + 1}</span>
                    {s.title}
                  </p>
                  {p?.note && <p className="text-[11px] text-[#9B8EC4] italic mt-0.5 pl-7">"{p.note}"</p>}
                </div>
                <span className={`text-[11px] font-semibold ml-3 shrink-0 ${p?.status === "rated" ? "text-[#6B5B9E]" : p?.status === "skipped" ? "text-[#C4B8E8]" : "text-[#D5D0E8]"}`}>
                  {statusLabel(p)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mb-4">
          <p className="text-[12px] font-semibold text-[#2D2650] mb-2">Final note <span className="text-[#9B8EC4] font-normal">(optional)</span></p>
          <textarea className="w-full bg-[#F8F5FF] border border-[rgba(107,91,158,0.12)] rounded-2xl px-4 py-3 text-[13px] text-[#2D2650] placeholder:text-[#C4B8E8] focus:outline-none focus:ring-2 focus:ring-[rgba(107,91,158,0.2)] resize-none"
            rows={3} placeholder="How did your voice feel after resting?"
            value={finalComment} onChange={(e) => updateFinalComment(e.target.value)} disabled={saved} />
        </div>

        <div className="mb-4 rounded-2xl bg-[#F8F5FF] border border-[rgba(107,91,158,0.12)] p-4">
          <p className="text-[12px] font-semibold text-[#2D2650] mb-0.5">
            A message for tomorrow's Molly ✨
          </p>
          <p className="text-[11px] text-[#9B8EC4] mb-2">
            She'll see this before her next warmup. <span className="italic">Optional.</span>
          </p>
          <textarea
            className="w-full bg-white border border-[rgba(107,91,158,0.12)] rounded-xl px-3.5 py-2.5 text-[13px] text-[#2D2650] placeholder:text-[#C4B8E8] focus:outline-none focus:ring-2 focus:ring-[rgba(107,91,158,0.2)] resize-none"
            rows={3}
            placeholder="e.g. You showed up tonight even when it was hard. Remember that feeling."
            value={motivationMsg}
            onChange={(e) => setMotivationMsg(e.target.value)}
            disabled={saved}
          />
        </div>

        <div className="flex gap-2">
          <button onClick={() => setSummaryOpen(false)}
            className="h-11 px-5 rounded-full border border-[rgba(107,91,158,0.2)] text-[13px] font-semibold text-[#9B8EC4] hover:bg-[#F8F5FF] transition-colors shrink-0">
            ← Back
          </button>
          {saved ? (
            <div className="flex-1 flex items-center justify-center gap-2 h-11 rounded-full bg-[#EDE8F8] border border-[rgba(107,91,158,0.15)]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 3" stroke="#6B5B9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="text-[13px] font-semibold text-[#6B5B9E]">Saved to journal</span>
            </div>
          ) : (
            <button onClick={handleFinish} disabled={saving}
              className="flex-1 h-11 rounded-full bg-[#6B5B9E] text-white text-[13px] font-semibold active:scale-[0.98] disabled:opacity-60">
              {saving ? "Saving..." : "Finish & save →"}
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // ── Main runner ───────────────────────────────────────────
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-[rgba(107,91,158,0.12)] shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-medium text-[#9B8EC4]">Step {currentIdx + 1} / {total}</span>
          <span className="text-[12px] font-bold text-[#6B5B9E]">{pct}%</span>
        </div>
        <div className="h-1.5 w-full bg-[#EDE8F8] rounded-full overflow-hidden">
          <motion.div className="h-full bg-[#6B5B9E] rounded-full"
            animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step.id}
          initial={{ opacity: 0, x: direction * 16 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -16 }} transition={{ duration: 0.18 }}
          className="px-5 pb-5">

          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex w-6 h-6 rounded-full bg-[#EDE8F8] text-[10px] font-bold text-[#6B5B9E] items-center justify-center shrink-0">{currentIdx + 1}</span>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${isDone ? "bg-[#EDE8F8] text-[#6B5B9E]" : "bg-[#F8F5FF] text-[#9B8EC4] border border-[rgba(107,91,158,0.12)]"}`}>
              {currentProgress?.status === "rated" ? `★ ${(currentProgress as any).rating}/5` : currentProgress?.status === "skipped" ? "Skipped" : "Current"}
            </span>
          </div>

          <h2 className="text-[20px] text-[#1E1535] mb-1 leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>{step.title}</h2>
          <p className="text-[12px] text-[#9B8EC4] mb-4 leading-relaxed">{step.description}</p>

          <div className="mb-5"><CoolDownAudioPlayer src={step.audioUrl} /></div>

          <div className="mb-4">
            <p className="text-[13px] font-semibold text-[#2D2650] mb-1">How did it feel?</p>
            <p className="text-[11px] text-[#9B8EC4] mb-3">Rate or skip to continue.</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((r) => (
                <RatingButton key={r} value={r}
                  selected={currentProgress?.status === "rated" && (currentProgress as any).rating === r}
                  onClick={() => setRating(r)} />
              ))}
              <motion.button whileTap={{ scale: 0.95 }} onClick={skip}
                className={`h-10 px-4 rounded-xl text-[12px] font-semibold border transition-all ${
                  currentProgress?.status === "skipped" ? "bg-[#FEF3E2] text-amber-700 border-amber-200" : "bg-white text-[#9B8EC4] border-[rgba(107,91,158,0.15)] hover:bg-[#FEF3E2] hover:text-amber-700"
                }`}>Skip</motion.button>
            </div>
          </div>

          <div className="mb-5">
            <button onClick={() => setNoteOpen((v) => !v)}
              className="text-[12px] text-[#9B8EC4] hover:text-[#6B5B9E] transition-colors underline underline-offset-2">
              {noteOpen ? "Hide note" : "Add note (optional)"}
            </button>
            {noteOpen && (
              <textarea className="mt-2 w-full bg-[#F8F5FF] border border-[rgba(107,91,158,0.12)] rounded-2xl px-4 py-3 text-[13px] text-[#2D2650] placeholder:text-[#C4B8E8] focus:outline-none focus:ring-2 focus:ring-[rgba(107,91,158,0.2)] resize-none"
                rows={2} placeholder="Optional note..."
                value={currentProgress?.note ?? ""} onChange={(e) => setNote(e.target.value)} />
            )}
          </div>

          <div className="flex items-center justify-between">
            <motion.button whileTap={{ scale: 0.97 }} onClick={goPrev} disabled={currentIdx === 0}
              className="h-10 px-5 rounded-full border border-[rgba(107,91,158,0.2)] text-[13px] font-semibold text-[#9B8EC4] disabled:opacity-30 hover:bg-[#F8F5FF] transition-colors">
              Back
            </motion.button>
            {currentIdx === total - 1 && isDone ? (
              <motion.button whileTap={{ scale: 0.97 }} onClick={openSummary}
                className="h-10 px-6 rounded-full bg-[#6B5B9E] text-white text-[13px] font-semibold active:scale-95">
                View summary →
              </motion.button>
            ) : (
              <motion.button whileTap={{ scale: 0.97 }} onClick={goNext} disabled={!isDone}
                className="h-10 px-6 rounded-full bg-[#6B5B9E] text-white text-[13px] font-semibold disabled:opacity-30 active:scale-95">
                Next →
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="border-t border-[rgba(107,91,158,0.08)] px-5 py-4">
        <p className="text-[10px] font-black tracking-widest uppercase text-[#9B8EC4] mb-3">Session track</p>
        <div className="space-y-1.5">
          {steps.map((s, i) => {
            const p = progress[i]; const isCurrent = i === currentIdx;
            return (
              <div key={s.id} className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 border transition-all ${isCurrent ? "bg-[#EDE8F8] border-[rgba(107,91,158,0.2)]" : "bg-[#F8F5FF] border-[rgba(107,91,158,0.06)]"}`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`inline-flex w-5 h-5 rounded-full text-[9px] font-bold items-center justify-center shrink-0 ${isCurrent ? "bg-[#6B5B9E] text-white" : "bg-white text-[#9B8EC4] border border-[rgba(107,91,158,0.15)]"}`}>{i + 1}</span>
                  <span className={`text-[12px] font-medium truncate ${isCurrent ? "text-[#2D2650]" : "text-[#9B8EC4]"}`}>{s.title}</span>
                </div>
                <span className={`text-[10px] font-semibold shrink-0 ml-2 ${p?.status === "rated" ? "text-[#6B5B9E]" : p?.status === "skipped" ? "text-[#C4B8E8]" : "text-[#D5D0E8]"}`}>
                  {statusLabel(p)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}