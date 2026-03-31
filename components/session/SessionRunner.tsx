"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AudioPlayer from "@/components/session/AudioPlayer";
import { getAudioById } from "@/components/data/audioLibrary";

type SessionRunnerProps = { routineId: string };

type RoutineStep = {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
};

type StepProgress =
  | { status: "pending"; note?: string }
  | { status: "skipped"; note?: string }
  | { status: "rated"; rating: number; note?: string };

const PERSONAL_ROUTINE_KEY = "personalRoutineItems";

const PRESET_ITEMS: Record<string, string[]> = {
  "high-range": ["sirens-medium", "high-notes-support"],
  resistance: ["breath-control", "sirens-medium"],
  "relax-reset": ["breath-control", "relax-jaw-neck"],
};

function buildSteps(audioIds: string[]): RoutineStep[] {
  return audioIds
    .map((id, i) => {
      const item = getAudioById(id);
      if (!item) return null;
      return {
        id: `${i}-${item.id}`,
        title: item.name,
        description: "Do this exercise with relaxed posture and steady breath.",
        audioUrl: item.audioUrl,
      };
    })
    .filter((s): s is RoutineStep => s !== null);
}

function RatingButton({
  value,
  selected,
  onClick,
}: {
  value: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`w-10 h-10 rounded-xl text-[14px] font-semibold border transition-all ${
        selected
          ? "bg-[#2C5F3F] text-white border-[#2C5F3F]"
          : "bg-white text-[#5A7A65] border-[rgba(44,95,63,0.2)] hover:bg-[#EAF0EB]"
      }`}
    >
      {value}
    </motion.button>
  );
}

export default function SessionRunner({ routineId }: SessionRunnerProps) {
  const [steps, setSteps] = useState<RoutineStep[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [progress, setProgress] = useState<StepProgress[]>([]);
  const [noteOpen, setNoteOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [finalComment, setFinalComment] = useState("");
  const [direction, setDirection] = useState<1 | -1>(1);

  useEffect(() => {
    let ids: string[] = [];
    if (routineId === "personal") {
      const saved = localStorage.getItem(PERSONAL_ROUTINE_KEY);
      if (saved) { try { ids = JSON.parse(saved); } catch {} }
    } else {
      ids = PRESET_ITEMS[routineId] ?? [];
    }
    const newSteps = buildSteps(ids);
    setSteps(newSteps);
    setCurrentIdx(0);
    setSummaryOpen(false);
    setFinalComment("");
    setProgress(newSteps.map(() => ({ status: "pending" })));
  }, [routineId]);

  const step = steps[currentIdx];
  const currentProgress = progress[currentIdx];
  const isDone = currentProgress?.status === "rated" || currentProgress?.status === "skipped";
  const total = steps.length;
  const pct = total > 0 ? Math.round(((currentIdx + 1) / total) * 100) : 0;

  const setRating = (rating: number) => {
    setProgress((p) => p.map((s, i) => i === currentIdx ? { ...s, status: "rated", rating } : s));
  };

  const skip = () => {
    setProgress((p) => p.map((s, i) => i === currentIdx ? { ...s, status: "skipped" } : s));
  };

  const setNote = (note: string) => {
    setProgress((p) => p.map((s, i) => i === currentIdx ? { ...s, note } : s));
  };

  const goNext = () => {
    if (currentIdx + 1 >= steps.length) return;
    setDirection(1);
    setCurrentIdx((i) => i + 1);
    setNoteOpen(false);
  };

  const goPrev = () => {
    if (currentIdx <= 0) return;
    setDirection(-1);
    setCurrentIdx((i) => i - 1);
    setNoteOpen(false);
  };

  const statusLabel = (p: StepProgress | undefined) => {
    if (!p || p.status === "pending") return "Pending";
    if (p.status === "skipped") return "Skipped";
    return `${p.rating}/5`;
  };

  // Empty state
  if (steps.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-[rgba(44,95,63,0.08)] shadow-sm text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#EAF0EB] flex items-center justify-center text-xl mx-auto mb-3">
          🎤
        </div>
        <p className="text-[14px] font-semibold text-[#1C2B22] mb-1">No exercises yet</p>
        <p className="text-[12px] text-[#8FA896] mb-4">Add exercises in your routine to start a session.</p>
        <a
          href="/warmups/routine"
          className="inline-flex h-9 items-center px-5 rounded-full bg-[#2C5F3F] text-white text-[12px] font-semibold"
        >
          Edit routine →
        </a>
      </div>
    );
  }

  // Summary
  if (summaryOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-5 border border-[rgba(44,95,63,0.08)] shadow-sm"
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-[20px] text-[#1C2B22]"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
          >
            Session complete
          </h2>
          <span className="text-[11px] px-3 py-1 rounded-full bg-[#EAF0EB] text-[#2C5F3F] font-semibold border border-[rgba(44,95,63,0.15)]">
            ✓ Done
          </span>
        </div>

        {/* Full progress bar */}
        <div className="h-1.5 w-full bg-[#EAF0EB] rounded-full mb-5 overflow-hidden">
          <div className="h-full w-full bg-[#2C5F3F] rounded-full" />
        </div>

        <div className="space-y-2 mb-5">
          {steps.map((s, i) => {
            const p = progress[i];
            return (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-2xl bg-[#F9F8F5] px-4 py-3 border border-[rgba(44,95,63,0.06)]"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#1C2B22] truncate">
                    <span className="inline-flex w-5 h-5 rounded-full bg-[#EAF0EB] text-[10px] font-bold text-[#2C5F3F] items-center justify-center mr-2">
                      {i + 1}
                    </span>
                    {s.title}
                  </p>
                  {p?.note && (
                    <p className="text-[11px] text-[#8FA896] italic mt-0.5 pl-7">"{p.note}"</p>
                  )}
                </div>
                <span className={`text-[11px] font-semibold ml-3 shrink-0 ${
                  p?.status === "rated" ? "text-[#2C5F3F]" :
                  p?.status === "skipped" ? "text-[#B5C4B9]" : "text-[#D5E0D8]"
                }`}>
                  {statusLabel(p)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mb-4">
          <p className="text-[12px] font-semibold text-[#1C2B22] mb-2">Final note <span className="text-[#8FA896] font-normal">(optional)</span></p>
          <textarea
            className="w-full bg-[#F9F8F5] border border-[rgba(44,95,63,0.12)] rounded-2xl px-4 py-3 text-[13px] text-[#1C2B22] placeholder:text-[#B5C4B9] focus:outline-none focus:ring-2 focus:ring-[rgba(44,95,63,0.2)] resize-none"
            rows={3}
            placeholder="Anything to remember about today's warmup?"
            value={finalComment}
            onChange={(e) => setFinalComment(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSummaryOpen(false)}
            className="flex-1 h-11 rounded-full border border-[rgba(44,95,63,0.2)] text-[13px] font-semibold text-[#5A7A65] hover:bg-[#F5F2EC] transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => console.log("Saved:", { routineId, progress, finalComment })}
            className="flex-1 h-11 rounded-full bg-[#2C5F3F] text-white text-[13px] font-semibold active:scale-[0.98] transition-transform"
          >
            Finish session
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[rgba(44,95,63,0.08)] shadow-sm overflow-hidden">

      {/* Progress bar */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-medium text-[#8FA896]">
            Step {currentIdx + 1} / {total}
          </span>
          <span className="text-[12px] font-bold text-[#2C5F3F]">{pct}%</span>
        </div>
        <div className="h-1.5 w-full bg-[#EAF0EB] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#2C5F3F] rounded-full"
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: direction * 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -16 }}
          transition={{ duration: 0.18 }}
          className="px-5 pb-5"
        >
          {/* Step header */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex w-6 h-6 rounded-full bg-[#EAF0EB] text-[10px] font-bold text-[#2C5F3F] items-center justify-center shrink-0">
              {currentIdx + 1}
            </span>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
              isDone
                ? "bg-[#EAF0EB] text-[#2C5F3F]"
                : "bg-[#F5F2EC] text-[#8FA896] border border-[rgba(44,95,63,0.12)]"
            }`}>
              {currentProgress?.status === "rated"
                ? `★ ${(currentProgress as any).rating}/5`
                : currentProgress?.status === "skipped"
                ? "Skipped"
                : "Current"}
            </span>
          </div>

          <h2
            className="text-[20px] text-[#1C2B22] mb-1 leading-snug"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {step.title}
          </h2>
          <p className="text-[12px] text-[#8FA896] mb-4 leading-relaxed">
            {step.description}
          </p>

          {/* Audio player */}
          <div className="mb-5">
            <AudioPlayer src={step.audioUrl} />
          </div>

          {/* Rating */}
          <div className="mb-4">
            <p className="text-[13px] font-semibold text-[#1C2B22] mb-1">How did it feel?</p>
            <p className="text-[11px] text-[#8FA896] mb-3">Rate or skip to continue.</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((r) => (
                <RatingButton
                  key={r}
                  value={r}
                  selected={currentProgress?.status === "rated" && (currentProgress as any).rating === r}
                  onClick={() => setRating(r)}
                />
              ))}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={skip}
                className={`h-10 px-4 rounded-xl text-[12px] font-semibold border transition-all ${
                  currentProgress?.status === "skipped"
                    ? "bg-[#FEF3E2] text-amber-700 border-amber-200"
                    : "bg-white text-[#8FA896] border-[rgba(44,95,63,0.15)] hover:bg-[#FEF3E2] hover:text-amber-700"
                }`}
              >
                Skip
              </motion.button>
            </div>
          </div>

          {/* Note */}
          <div className="mb-5">
            <button
              onClick={() => setNoteOpen((v) => !v)}
              className="text-[12px] text-[#8FA896] hover:text-[#2C5F3F] transition-colors underline underline-offset-2"
            >
              {noteOpen ? "Hide note" : "Add note (optional)"}
            </button>
            {noteOpen && (
              <textarea
                className="mt-2 w-full bg-[#F9F8F5] border border-[rgba(44,95,63,0.12)] rounded-2xl px-4 py-3 text-[13px] text-[#1C2B22] placeholder:text-[#B5C4B9] focus:outline-none focus:ring-2 focus:ring-[rgba(44,95,63,0.2)] resize-none"
                rows={2}
                placeholder="Optional note..."
                value={currentProgress?.note ?? ""}
                onChange={(e) => setNote(e.target.value)}
              />
            )}
          </div>

          {/* Nav */}
          <div className="flex items-center justify-between">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={goPrev}
              disabled={currentIdx === 0}
              className="h-10 px-5 rounded-full border border-[rgba(44,95,63,0.2)] text-[13px] font-semibold text-[#5A7A65] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F5F2EC] transition-colors"
            >
              Back
            </motion.button>

            {currentIdx === total - 1 && isDone ? (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { setNoteOpen(false); setSummaryOpen(true); }}
                className="h-10 px-6 rounded-full bg-[#2C5F3F] text-white text-[13px] font-semibold active:scale-95"
              >
                View summary →
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={goNext}
                disabled={!isDone}
                className="h-10 px-6 rounded-full bg-[#2C5F3F] text-white text-[13px] font-semibold disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              >
                Next →
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Track */}
      <div className="border-t border-[rgba(44,95,63,0.07)] px-5 py-4">
        <p className="text-[10px] font-black tracking-widest uppercase text-[#8FA896] mb-3">
          Routine track
        </p>
        <div className="space-y-1.5">
          {steps.map((s, i) => {
            const p = progress[i];
            const isCurrent = i === currentIdx;
            return (
              <div
                key={s.id}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 border transition-all ${
                  isCurrent
                    ? "bg-[#EAF0EB] border-[rgba(44,95,63,0.2)]"
                    : "bg-[#F9F8F5] border-[rgba(44,95,63,0.06)]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`inline-flex w-5 h-5 rounded-full text-[9px] font-bold items-center justify-center shrink-0 ${
                    isCurrent ? "bg-[#2C5F3F] text-white" : "bg-white text-[#8FA896] border border-[rgba(44,95,63,0.15)]"
                  }`}>
                    {i + 1}
                  </span>
                  <span className={`text-[12px] font-medium truncate ${
                    isCurrent ? "text-[#1C2B22]" : "text-[#5A7A65]"
                  }`}>
                    {s.title}
                  </span>
                </div>
                <span className={`text-[10px] font-semibold shrink-0 ml-2 ${
                  p?.status === "rated" ? "text-[#2C5F3F]" :
                  p?.status === "skipped" ? "text-[#B5C4B9]" : "text-[#D5E0D8]"
                }`}>
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