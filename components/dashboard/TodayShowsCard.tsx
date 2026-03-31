"use client";

import { useState } from "react";

type RatingKey = "voice" | "energy" | "confidence" | "range";
type Feeling = "Energized" | "Tired" | "Confident" | "Nervous" | "In the flow" | "Off day";

type ShowEntry = {
  name: string;
  ratings: Record<RatingKey, number>;
  feeling: Feeling | null;
  note: string;
  done: boolean;
};

const RATING_LABELS: { key: RatingKey; label: string }[] = [
  { key: "voice", label: "Voice quality" },
  { key: "energy", label: "Energy on stage" },
  { key: "confidence", label: "Confidence" },
  { key: "range", label: "Range & control" },
];

const FEELINGS: Feeling[] = [
  "Energized",
  "Tired",
  "Confident",
  "Nervous",
  "In the flow",
  "Off day",
];

const emptyShow = (): ShowEntry => ({
  name: "",
  ratings: { voice: 0, energy: 0, confidence: 0, range: 0 },
  feeling: null,
  note: "",
  done: false,
});

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-5">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all ${
            i === current
              ? "w-6 bg-emerald-700"
              : i < current
              ? "w-2 bg-emerald-400"
              : "w-2 bg-emerald-200"
          }`}
        />
      ))}
      <span className="text-xs text-emerald-700/60 ml-1">
        Step {current + 1} of 4
      </span>
    </div>
  );
}

function StarRow({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={`w-8 h-8 rounded-lg border text-sm transition active:scale-95 ${
            value >= i
              ? "bg-emerald-100 border-emerald-400 text-emerald-700"
              : "bg-emerald-50 border-emerald-200 text-emerald-300 hover:border-emerald-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function EntryView({ show }: { show: ShowEntry }) {
  const avg =
    Object.values(show.ratings).reduce((a, b) => a + b, 0) /
    Object.values(show.ratings).length;
  const stars = Array.from({ length: 5 }, (_, i) =>
    i < Math.round(avg) ? "★" : "☆"
  ).join("");

  return (
    <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
      <p className="font-extrabold text-emerald-950 mb-2">
        {show.name}{" "}
        <span className="text-xs font-bold text-emerald-600">{stars}</span>
      </p>
      <div className="flex flex-wrap gap-3 mb-3">
        {RATING_LABELS.map(({ key, label }) => (
          <span key={key} className="text-xs text-emerald-700">
            {label.split(" ")[0]} {show.ratings[key]}/5
          </span>
        ))}
      </div>
      {show.feeling && (
        <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-emerald-200 text-emerald-800 mb-2">
          {show.feeling}
        </span>
      )}
      {show.note && (
        <p className="text-xs text-emerald-700 italic mt-1">"{show.note}"</p>
      )}
    </div>
  );
}

export default function TodayShowsCard() {
  const [shows, setShows] = useState<ShowEntry[]>([
    emptyShow(),
    emptyShow(),
    emptyShow(),
  ]);
  const [activeTab, setActiveTab] = useState(0);
  const [steps, setSteps] = useState([0, 0, 0]);
  const [showValidation, setShowValidation] = useState(false);

  const updateShow = (idx: number, updates: Partial<ShowEntry>) => {
    setShows((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, ...updates } : s))
    );
  };

  const setRating = (showIdx: number, key: RatingKey, val: number) => {
    setShows((prev) =>
      prev.map((s, i) =>
        i === showIdx ? { ...s, ratings: { ...s.ratings, [key]: val } } : s
      )
    );
  };

  const setStep = (idx: number, step: number) => {
    setSteps((prev) => prev.map((s, i) => (i === idx ? step : s)));
    setShowValidation(false);
  };

  const allRated = (idx: number) => {
    const r = shows[idx].ratings;
    return r.voice > 0 && r.energy > 0 && r.confidence > 0 && r.range > 0;
  };

  const goNext = (idx: number, currentStep: number) => {
    if (currentStep === 1 && !allRated(idx)) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    setStep(idx, currentStep + 1);
  };

  const saveShow = (idx: number) => {
    updateShow(idx, { done: true });
  };

  const anyDone = shows.some((s) => s.done);
  const currentStep = steps[activeTab];
  const currentShow = shows[activeTab];

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="font-extrabold text-emerald-950/90">Tonight's shows</p>
          <p className="text-sm text-emerald-900/60 mt-0.5">
            Up to 3 shows · auto-saved at end of day
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {shows.map((show, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveTab(i)}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold border transition active:scale-[0.98] ${
              i === activeTab
                ? "bg-emerald-700 text-white border-emerald-700"
                : show.done
                ? "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            {show.done ? `✓ Show ${i + 1}` : `Show ${i + 1}`}
          </button>
        ))}
      </div>

      {/* Panel */}
      {currentShow.done ? (
        <EntryView show={currentShow} />
      ) : (
        <div>
          <StepDots current={currentStep} />

          {/* Step 0 — Name */}
          {currentStep === 0 && (
            <div>
              <p className="text-sm font-extrabold text-emerald-950/90 mb-1">
                What show was it?
              </p>
              <p className="text-xs text-emerald-900/60 mb-3">
                Name this performance — venue, theme, whatever works.
              </p>
              <input
                className="w-full rounded-2xl border border-emerald-900/15 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-950 placeholder:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500"
                placeholder="e.g. Jazz Club Saturday..."
                value={currentShow.name}
                onChange={(e) =>
                  updateShow(activeTab, { name: e.target.value })
                }
              />
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => goNext(activeTab, 0)}
                  className="inline-flex h-9 items-center rounded-full bg-emerald-700 px-5 text-sm font-extrabold text-white hover:bg-emerald-800 active:scale-[0.98] transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 1 — Ratings */}
          {currentStep === 1 && (
            <div>
              <p className="text-sm font-extrabold text-emerald-950/90 mb-1">
                Rate your performance
              </p>
              <p className="text-xs text-emerald-900/60 mb-3">
                All 4 required to continue.
              </p>
              {showValidation && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800 mb-3">
                  Please rate all 4 categories first.
                </div>
              )}
              <div className="space-y-4">
                {RATING_LABELS.map(({ key, label }) => (
                  <div key={key}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-extrabold text-emerald-900">
                        {label}
                      </span>
                      <span className="text-xs text-emerald-600">
                        {currentShow.ratings[key] || 0}/5
                      </span>
                    </div>
                    <StarRow
                      value={currentShow.ratings[key]}
                      onChange={(v) => setRating(activeTab, key, v)}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4">
                <button
                  type="button"
                  onClick={() => setStep(activeTab, 0)}
                  className="text-xs text-emerald-700 hover:underline"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => goNext(activeTab, 1)}
                  className="inline-flex h-9 items-center rounded-full bg-emerald-700 px-5 text-sm font-extrabold text-white hover:bg-emerald-800 active:scale-[0.98] transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Feeling */}
          {currentStep === 2 && (
            <div>
              <p className="text-sm font-extrabold text-emerald-950/90 mb-1">
                How did it feel?
              </p>
              <p className="text-xs text-emerald-900/60 mb-3">
                Pick what resonates most.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {FEELINGS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => updateShow(activeTab, { feeling: f })}
                    className={`rounded-xl border py-2.5 text-xs font-bold transition active:scale-[0.97] ${
                      currentShow.feeling === f
                        ? "bg-emerald-700 border-emerald-700 text-white"
                        : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4">
                <button
                  type="button"
                  onClick={() => setStep(activeTab, 1)}
                  className="text-xs text-emerald-700 hover:underline"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => goNext(activeTab, 2)}
                  className="inline-flex h-9 items-center rounded-full bg-emerald-700 px-5 text-sm font-extrabold text-white hover:bg-emerald-800 active:scale-[0.98] transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Note */}
          {currentStep === 3 && (
            <div>
              <p className="text-sm font-extrabold text-emerald-950/90 mb-1">
                How was your day overall?
              </p>
              <p className="text-xs text-emerald-900/60 mb-3">
                A few words about your voice. Optional but valuable.
              </p>
              <textarea
                className="w-full rounded-2xl border border-emerald-900/15 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-950 placeholder:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 resize-none"
                rows={3}
                placeholder="e.g. Voice felt warm, high notes came easier..."
                value={currentShow.note}
                onChange={(e) =>
                  updateShow(activeTab, { note: e.target.value })
                }
              />
              <div className="flex justify-between items-center mt-4">
                <button
                  type="button"
                  onClick={() => setStep(activeTab, 2)}
                  className="text-xs text-emerald-700 hover:underline"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => saveShow(activeTab)}
                  className="inline-flex h-9 items-center rounded-full bg-emerald-700 px-5 text-sm font-extrabold text-white hover:bg-emerald-800 active:scale-[0.98] transition-colors"
                >
                  Save show ✓
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {anyDone && (
        <p className="mt-4 text-center text-xs text-emerald-700 bg-emerald-50 rounded-xl py-2 border border-emerald-200">
          ✓ Entries logged — will auto-save at end of day
        </p>
      )}
    </div>
  );
}