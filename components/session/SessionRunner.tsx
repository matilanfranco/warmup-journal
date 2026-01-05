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
      <section className="mt-6 rounded-2xl border p-5">
        <h2 className="text-lg font-semibold">Session</h2>
        <p className="mt-2 text-sm opacity-70">
          No steps found for this routine yet.
        </p>
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
        className="mt-6 rounded-2xl border p-5"
      >
        <h2 className="text-xl font-semibold">Session summary</h2>
        {/* Progress bar (Summary only) */}
        <div className="mt-3">
        <div className="flex items-center justify-between text-xs opacity-70">
            <span>Warmup completed</span>
            <span>100%</span>
        </div>

        <div className="mt-2 h-2 w-full rounded-full border overflow-hidden">
          <div className="h-full w-full bg-emerald-500/60" />
        </div>
        </div>
        <p className="mt-2 text-sm opacity-70">
          Review your ratings and notes. Add a final comment if you want.
        </p>

        <div className="mt-5 space-y-3">
          {steps.map((step, index) => {
            const progress = progressByIndex[index];
            const label = getStatusLabel(progress);
            const noteText = progress?.note?.trim();

            return (
              <div key={step.id} className="rounded-xl border p-4">
                <div className="text-sm font-semibold">
                  {index + 1}. {step.title}
                </div>
                <div className="mt-1 text-xs opacity-70">{label}</div>

                {noteText ? (
                  <div className="mt-2 text-sm">
                    <span className="opacity-70">Note:</span>{" "}
                    <span className="opacity-90">{noteText}</span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold">Final comment (optional)</p>
          <textarea
            className="mt-2 w-full rounded border p-3 text-sm"
            placeholder="Anything to remember about today’s warmup?"
            value={finalComment}
            onChange={(e) => setFinalComment(e.target.value)}
            rows={3}
          />
        </div>

        <div className="mt-6 flex gap-3">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsSummaryOpen(false)}
            className="rounded border px-4 py-2 cursor-pointer"
          >
            Back to session
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() =>
              console.log("Finish (mock):", { routineId, progressByIndex, finalComment })
            }
            className="rounded border px-4 py-2 cursor-pointer"
          >
            Finish
          </motion.button>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}

return (
  <section className="mt-6 rounded-2xl border p-5">
    {/* STEP CONTENT animado */}
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep.id}
        initial={{ opacity: 0, x: direction * 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction * -20 }}
        transition={{ duration: 0.18 }}
      >
        <div className="mb-4">
            <div className="flex items-center justify-between text-xs opacity-70">
                <span>
                {currentStepNumber} / {totalSteps}
                </span>
                <span>{Math.round(progressPercent)}%</span>
            </div>

            <div className="mt-2 h-2 w-full rounded-full border overflow-hidden">
                <motion.div
                className="h-full bg-white/30"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ type: "spring", stiffness: 140, damping: 20 }}
                />
            </div>
        </div>
        {/* Header del step */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm opacity-70">
              Step {currentStepIndex + 1} of {steps.length}
            </p>
            <h2 className="mt-1 text-xl font-semibold">{currentStep.title}</h2>
            <p className="mt-2 text-sm opacity-80">{currentStep.description}</p>
          </div>
        </div>

        {/* Visual placeholder */}
        <div className="mt-5 rounded-xl border p-4">
          <p className="text-sm opacity-70">(Visual placeholder)</p>
          <p className="mt-1 text-xs opacity-60">Image: {currentStep.imageUrl}</p>
        </div>

        {/* Audio player (real) */}
        <div className="mt-5 rounded-xl border p-4">
          <p className="text-sm opacity-70">Audio</p>

          <audio controls src={currentStep.audioUrl} className="mt-2 w-full" />

          <p className="mt-2 text-xs opacity-60">Source: {currentStep.audioUrl}</p>
        </div>

        {/* Rating + skip */}
        <div className="mt-6">
          <p className="text-sm font-semibold">How did it feel?</p>

          <div className="mt-2 flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => {
              const isSelected =
                currentProgress?.status === "rated" &&
                currentProgress.rating === rating;

              return (
                <motion.button
                  key={rating}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setRatingForCurrentStep(rating)}
                  className={`rounded border px-3 py-2 cursor-pointer transition hover:bg-white/10 ${
                    isSelected ? "bg-white/20" : ""
                  }`}
                >
                  {rating}
                </motion.button>
              );
            })}

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={skipCurrentStep}
              className="rounded border px-3 py-2 cursor-pointer transition hover:bg-white/10"
            >
              Skip
            </motion.button>
          </div>

          <p className="mt-2 text-xs opacity-60">
            You must rate or skip to continue.
          </p>
        </div>

        {/* Note optional */}
        <div className="mt-4">
          <button
            onClick={() => setIsNoteOpen((prev) => !prev)}
            className="underline cursor-pointer text-sm"
          >
            {isNoteOpen ? "Hide note" : "Add note (optional)"}
          </button>

          {isNoteOpen ? (
            <textarea
              className="mt-2 w-full rounded border p-3 text-sm"
              placeholder="Optional note (1–2 lines)..."
              value={currentProgress?.note ?? ""}
              onChange={(e) => setNoteForCurrentStep(e.target.value)}
              rows={2}
            />
          ) : null}
        </div>

        {/* Next + summary */}
        <div className="mt-6 flex items-center justify-between">
            <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={goToPreviousStep}
                disabled={currentStepIndex === 0}
                className="rounded border px-4 py-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
                Back
            </motion.button>

            <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={goToNextStep}
                disabled={!isCurrentDone}
                className="rounded border px-4 py-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
                Next
            </motion.button>

            {currentStepIndex === steps.length - 1 && isCurrentDone ? (
                <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                    setIsNoteOpen(false);
                    setIsSummaryOpen(true);
                }}
                className="rounded border px-4 py-2 cursor-pointer"
                >
                View summary
                </motion.button>
            ) : null}
        </div>
      </motion.div>
    </AnimatePresence>

    {/* TRACK fijo (no animado) */}
    <div className="mt-8 border-t pt-4">
      <p className="text-sm font-semibold">Routine track</p>

      <div className="mt-3 space-y-2">
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
              className={`flex items-center justify-between rounded border p-3 ${
                isCurrent ? "opacity-100" : "opacity-80"
              }`}
            >
              <div>
                <div className="text-sm font-medium">
                  {index + 1}. {step.title}
                </div>
                <div className="text-xs opacity-70">{statusLabel}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);
}