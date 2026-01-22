"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getAudioById } from "@/components/data/audioLibrary";

type SessionRunnerProps = {
  routineId: string;
};

type RoutineStep = {
  id: string;
  title: string;
  description: string;
  imageAltText: string;
  imageUrl: string; // por ahora placeholder
  audioUrl: string; // por ahora placeholder
};

type StepProgress =
  | { status: "pending"; note?: string }
  | { status: "skipped"; note?: string }
  | { status: "rated"; rating: number; note?: string };

// esto es para dejar guardada ese string para localStorage y no escribirlo mal en un futuro (recomendacion de chat)
const PERSONAL_ROUTINE_LOCALSTORAGE_KEY = "personalRoutineItems";

// Presets: por ahora simple
const PRESET_ITEMS_BY_ID: Record<string, string[]> = {
  "high-range": ["sirens-medium", "high-notes-support"],
  resistance: ["breath-control", "sirens-medium"],
  "relax-reset": ["breath-control", "relax-jaw-neck"],
};

// Convierte strings -> steps con data mock
function buildStepsFromIds(audioIds: string[]): RoutineStep[] {
  return audioIds
    .map((audioId, index) => {
      const item = getAudioById(audioId);
      if (!item) return null;

      return {
        id: `${index}-${item.id}`,
        title: item.name,
        description: `Do this exercise with relaxed posture and steady breath.`,
        imageAltText: `Warmup exercise: ${item.name}`,
        imageUrl: item.imageUrl ?? "/images/placeholder.png",
        audioUrl: item.audioUrl,
      };
    })
    .filter((step): step is RoutineStep => step !== null);
}

export default function SessionRunner(props: SessionRunnerProps) {
    //esto es para guardar el props en una variable para facil uso
  const routineId = props.routineId;

  const [steps, setSteps] = useState<RoutineStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [finalComment, setFinalComment] = useState("");
  const [direction, setDirection] = useState<1 | -1>(1);

  // Progreso por step (pending/skipped/rated)
  const [progressByIndex, setProgressByIndex] = useState<StepProgress[]>([]);

  // Cargar steps según rutina
  useEffect(() => {
    let audioIds: string[] = [];

    if (routineId === "personal") {
      const savedItemsAsString = localStorage.getItem(PERSONAL_ROUTINE_LOCALSTORAGE_KEY);

      if (savedItemsAsString) {
        audioIds = JSON.parse(savedItemsAsString);
      } else {
        audioIds = [];
      }
    } else {
      const presetItems = PRESET_ITEMS_BY_ID[routineId];
      audioIds = presetItems ? presetItems : [];
    }

    const newSteps = buildStepsFromIds(audioIds);

    setSteps(newSteps);
    setCurrentStepIndex(0);
    setIsSummaryOpen(false);
    setFinalComment("");

    // Reiniciar progreso para que sea del mismo tamaño que steps
    const newProgress: StepProgress[] = newSteps.map(() => {
      return { status: "pending" };
    });
    setProgressByIndex(newProgress);
  }, [routineId]);

    const currentStep = steps[currentStepIndex];

    const currentProgress = progressByIndex[currentStepIndex];
    const isCurrentDone =
    currentProgress?.status === "rated" || currentProgress?.status === "skipped";

    const totalSteps = steps.length;

    // progreso por step actual (1..total)
    const currentStepNumber = currentStepIndex + 1;

    // porcentaje (0..100)
    const progressPercent = (currentStepNumber / totalSteps) * 100;

    const setRatingForCurrentStep = (rating: number) => {
    setProgressByIndex((previousProgress) => {
        return previousProgress.map((progress, index) => {
        if (index !== currentStepIndex) return progress;

        // mantenemos note (y lo que haya) + actualizamos status y rating
        return { ...progress, status: "rated", rating };
        });
    });
    };

const skipCurrentStep = () => {
  setProgressByIndex((previousProgress) => {
    return previousProgress.map((progress, index) => {
      if (index !== currentStepIndex) return progress;

      // mantenemos note + cambiamos status
      return { ...progress, status: "skipped" };
    });
  });
};

const goToNextStep = () => {
  const nextIndex = currentStepIndex + 1;
  if (nextIndex >= steps.length) return;

  setDirection(1);
  setCurrentStepIndex(nextIndex);
  setIsNoteOpen(false);
};
  // Si no hay steps, mostramos mensaje
  if (steps.length === 0) {
  return (
    <section className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-neutral-900">Session</h2>
          <p className="mt-1 text-sm text-neutral-600">
            No steps found for this routine yet.
          </p>
        </div>

        <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900">
          ⚠️ Empty routine
        </span>
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-900/10 bg-emerald-50 p-4">
        <p className="text-sm font-bold text-emerald-900">
          Tip: go to “Edit routine” and add 3–6 items.
        </p>
        <p className="mt-1 text-sm text-neutral-600">
          Then come back and start your warm-up.
        </p>
      </div>
    </section>
  );
}

const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex < 0) return;

    setDirection(-1);
    setCurrentStepIndex(prevIndex);
    setIsNoteOpen(false);
};

  const setNoteForCurrentStep = (noteText: string) => {
  setProgressByIndex((previousProgress) => {
    return previousProgress.map((progress, index) => {
      if (index !== currentStepIndex) {
        return progress;
      }

      return { ...progress, note: noteText };
    });
  });
};

    const getStatusLabel = (progress: StepProgress | undefined) => {
    if (!progress) return "⬜ Pending";

    if (progress.status === "rated") return `✅ Rated (${progress.rating})`;
    if (progress.status === "skipped") return "⏭️ Skipped";

    return "⬜ Pending";
    };

if (isSummaryOpen) {
  return (
    <AnimatePresence mode="wait">
      <motion.section
        key="summary"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black tracking-tight text-neutral-900">
              Session summary
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Review your ratings and notes. Add a final comment if you want.
            </p>
          </div>

          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900">
            ✅ Completed
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-neutral-600">
            <span className="font-bold">Warm-up completed</span>
            <span className="font-black text-emerald-900">100%</span>
          </div>

          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
            <div className="h-full w-full bg-emerald-600" />
          </div>
        </div>

        {/* Steps */}
        <div className="mt-6 space-y-3">
          {steps.map((step, index) => {
            const progress = progressByIndex[index];
            const label = getStatusLabel(progress);
            const noteText = progress?.note?.trim();

            return (
              <div
                key={step.id}
                className="rounded-2xl border border-emerald-900/10 bg-emerald-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-neutral-900">
                      <span className="mr-2 inline-flex h-7 items-center rounded-full bg-white px-2 text-xs font-black text-emerald-900 border border-emerald-900/10">
                        {index + 1}
                      </span>
                      {step.title}
                    </div>
                    <div className="mt-1 text-xs font-bold text-neutral-600">
                      {label}
                    </div>
                  </div>
                </div>

                {noteText ? (
                  <div className="mt-3 text-sm text-neutral-800">
                    <span className="font-bold text-neutral-600">Note:</span>{" "}
                    {noteText}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Final comment */}
        <div className="mt-6">
          <p className="text-sm font-extrabold text-neutral-900">
            Final comment <span className="text-neutral-500">(optional)</span>
          </p>

          <textarea
            className="mt-3 w-full rounded-2xl border border-emerald-900/15 bg-emerald-50 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Anything to remember about today’s warmup?"
            value={finalComment}
            onChange={(e) => setFinalComment(e.target.value)}
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsSummaryOpen(false)}
            className="inline-flex h-11 w-full items-center justify-center rounded-full border border-emerald-900/15 bg-white px-5 text-sm font-extrabold text-emerald-900 hover:bg-emerald-50"
          >
            Back to session
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() =>
              console.log("Finish (mock):", { routineId, progressByIndex, finalComment })
            }
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-emerald-600 px-5 text-sm font-extrabold text-white shadow-sm hover:bg-emerald-700"
          >
            Finish
          </motion.button>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}

return (
  <section className="rounded-3xl border border-emerald-900/10 bg-white p-4 shadow-sm sm:p-6">
    {/* STEP CONTENT animado */}
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep.id}
        initial={{ opacity: 0, x: direction * 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction * -20 }}
        transition={{ duration: 0.18 }}
      >
        {/* Progress */}
        <div className="mb-4 sm:mb-5">
          <div className="flex items-center justify-between text-xs text-neutral-600">
            <span className="font-bold">
              Step {currentStepNumber} / {totalSteps}
            </span>
            <span className="font-black text-emerald-900">
              {Math.round(progressPercent)}%
            </span>
          </div>

          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
            <motion.div
              className="h-full bg-emerald-600"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: "spring", stiffness: 140, damping: 20 }}
            />
          </div>
        </div>

        {/* Step header */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900">
              🎯 Current
            </span>

            <span className="inline-flex items-center rounded-full border border-emerald-900/10 bg-white px-3 py-1 text-xs font-black text-neutral-700">
              {getStatusLabel(currentProgress)}
            </span>
          </div>

          <h2 className="mt-3 text-xl font-black tracking-tight text-emerald-900 sm:text-2xl">
            {currentStep.title}
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            {currentStep.description}
          </p>
        </div>

        {/* Audio (SIN contenedor, full width) */}
        <div className="mt-4 -mx-2 sm:mx-0">
          <audio
            controls
            src={currentStep.audioUrl}
            className="w-full"
          />
          <p className="mt-2 px-2 text-[11px] text-neutral-500 sm:px-0">
            Source: <span className="font-mono">{currentStep.audioUrl}</span>
          </p>
        </div>

        {/* Rating + skip */}
        <div className="mt-6">
          <p className="text-sm font-extrabold text-neutral-900">
            How did it feel?
          </p>
          <p className="mt-1 text-xs text-neutral-600">
            Rate or skip to continue.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => {
              const isSelected =
                currentProgress?.status === "rated" &&
                currentProgress.rating === rating;

              return (
                <motion.button
                  key={rating}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setRatingForCurrentStep(rating)}
                  className={[
                    "h-10 w-10 rounded-full border text-sm font-extrabold transition",
                    "active:scale-[0.97]",
                    isSelected
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                      : "border-emerald-900/15 bg-white text-emerald-900 hover:bg-emerald-50",
                  ].join(" ")}
                >
                  {rating}
                </motion.button>
              );
            })}

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={skipCurrentStep}
              className="inline-flex h-10 items-center justify-center rounded-full border border-emerald-900/15 bg-rose-50 px-4 text-sm font-extrabold text-rose-700 hover:bg-rose-100"
            >
              Skip
            </motion.button>
          </div>
        </div>

        {/* Note optional */}
        <div className="mt-5">
          <button
            onClick={() => setIsNoteOpen((prev) => !prev)}
            className="inline-flex items-center rounded-full border border-emerald-900/10 bg-white px-4 py-2 text-sm font-extrabold text-emerald-900 hover:bg-emerald-50"
          >
            {isNoteOpen ? "Hide note" : "Add note (optional)"}
          </button>

          {isNoteOpen ? (
            <textarea
              className="mt-3 w-full rounded-2xl border border-emerald-900/15 bg-emerald-50 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Optional note (1–2 lines)..."
              value={currentProgress?.note ?? ""}
              onChange={(e) => setNoteForCurrentStep(e.target.value)}
              rows={2}
            />
          ) : null}
        </div>

        {/* Nav */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={goToPreviousStep}
            disabled={currentStepIndex === 0}
            className="inline-flex h-11 items-center justify-center rounded-full border border-emerald-900/15 bg-white px-5 text-sm font-extrabold text-emerald-900 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </motion.button>

          {currentStepIndex === steps.length - 1 && isCurrentDone ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setIsNoteOpen(false);
                setIsSummaryOpen(true);
              }}
              className="inline-flex h-11 items-center justify-center rounded-full border border-emerald-900/15 bg-white px-5 text-sm font-extrabold text-emerald-900 hover:bg-emerald-50"
            >
              View summary
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={goToNextStep}
              disabled={!isCurrentDone}
              className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-600 px-5 text-sm font-extrabold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </motion.button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>

    {/* TRACK fijo (más compacto en mobile) */}
    <div className="mt-7 border-t border-emerald-900/10 pt-4 sm:mt-8 sm:pt-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-neutral-900">Routine track</p>
          <p className="mt-1 text-xs text-neutral-600">
            What’s done and what’s next.
          </p>
        </div>

        <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900">
          {currentStepNumber}/{totalSteps}
        </span>
      </div>

      <div className="mt-3 space-y-2 sm:mt-4">
        {steps.map((step, index) => {
          const progress = progressByIndex[index];
          const statusLabel =
            progress?.status === "rated"
              ? `✅ Rated (${progress.rating})`
              : progress?.status === "skipped"
              ? "⏭️ Skipped"
              : "⬜ Pending";

          const isCurrent = index === currentStepIndex;

          return (
            <div
              key={step.id}
              className={[
                "flex items-center justify-between rounded-2xl border px-3 py-2 sm:px-4 sm:py-3",
                isCurrent
                  ? "border-emerald-600/40 bg-emerald-50 ring-2 ring-emerald-200"
                  : "border-emerald-900/10 bg-white",
              ].join(" ")}
            >
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-neutral-900 truncate">
                  <span className="mr-2 inline-flex h-7 items-center rounded-full bg-emerald-100 px-2 text-xs font-black text-emerald-900">
                    {index + 1}
                  </span>
                  {step.title}
                </div>
                <div className="mt-0.5 text-xs pt-1 font-bold text-neutral-600">
                  {statusLabel}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);
}