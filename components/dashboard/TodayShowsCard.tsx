"use client";

import { useState } from "react";

type RatingKey = "voice" | "energy" | "confidence" | "range";
type Feeling = "Calm" | "Energetic" | "Confident" | "Nervous" | "In the flow" | "Strained";

type ShowEntry = {
  name: string;
  time: string;
  ratings: Record<RatingKey, number>;
  feeling: Feeling | null;
  note: string;
  done: boolean;
};

const RATING_LABELS: { key: RatingKey; label: string }[] = [
  { key: "voice", label: "Voice quality" },
  { key: "energy", label: "Energy" },
  { key: "confidence", label: "Confidence" },
  { key: "range", label: "Range & control" },
];

const FEELINGS: Feeling[] = ["Calm", "Energetic", "Confident", "Nervous", "In the flow", "Strained"];

const emptyShow = (): ShowEntry => ({
  name: "",
  time: "",
  ratings: { voice: 0, energy: 0, confidence: 0, range: 0 },
  feeling: null,
  note: "",
  done: false,
});

function StarRow({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={`w-8 h-8 rounded-lg text-sm transition active:scale-95 border ${
            value >= i
              ? "bg-[#EAF0EB] border-[#3D7A55] text-[#2C5F3F]"
              : "bg-[#F5F2EC] border-[rgba(44,95,63,0.15)] text-[#B5C4B9]"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function EntryView({ show }: { show: ShowEntry }) {
  const avg = Math.round(Object.values(show.ratings).reduce((a, b) => a + b, 0) / 4);
  const stars = Array.from({ length: 5 }, (_, i) => (i < avg ? "★" : "☆")).join("");

  return (
    <div className="bg-[#F9F8F5] rounded-2xl p-4 border border-[rgba(44,95,63,0.08)]">
      <div className="flex items-start justify-between mb-3">
        <div>
          {show.time && (
            <p className="text-[11px] text-[#8FA896] font-medium mb-0.5">{show.time}</p>
          )}
          <p className="text-[14px] font-semibold text-[#1C2B22]">{show.name}</p>
        </div>
        <span className="text-[13px] text-[#3D7A55] mt-0.5">{stars}</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {RATING_LABELS.map(({ key, label }) => (
          <span
            key={key}
            className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-[rgba(44,95,63,0.1)] text-[#5A7A65]"
          >
            {label.split(" ")[0]} {show.ratings[key]}/5
          </span>
        ))}
      </div>
      {show.feeling && (
        <span className="inline-flex px-3 py-1 rounded-full text-[11px] font-medium bg-[#EAF0EB] text-[#2C5F3F] mr-2">
          {show.feeling}
        </span>
      )}
      {show.note && (
        <p className="text-[12px] text-[#8FA896] italic mt-2">"{show.note}"</p>
      )}
    </div>
  );
}

function AddShowCard({
  index,
  onSave,
}: {
  index: number;
  onSave: (show: ShowEntry) => void;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [show, setShow] = useState<ShowEntry>(emptyShow());
  const [showValidation, setShowValidation] = useState(false);

  const allRated = show.ratings.voice > 0 && show.ratings.energy > 0 &&
    show.ratings.confidence > 0 && show.ratings.range > 0;

  const setRating = (key: RatingKey, val: number) =>
    setShow((s) => ({ ...s, ratings: { ...s.ratings, [key]: val } }));

  const goNext = (from: number) => {
    if (from === 1 && !allRated) { setShowValidation(true); return; }
    setShowValidation(false);
    setStep(from + 1);
  };

  const save = () => {
    onSave({ ...show, done: true });
    setOpen(false);
    setStep(0);
    setShow(emptyShow());
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full h-11 rounded-2xl border border-dashed border-[rgba(44,95,63,0.25)] bg-transparent flex items-center justify-center gap-2 text-[13px] text-[#8FA896] font-medium active:scale-[0.98] transition-transform hover:bg-[#F5F2EC]"
      >
        <span className="text-base leading-none">+</span> Add show {index + 1}
      </button>
    );
  }

  return (
    <div className="bg-[#F9F8F5] rounded-2xl p-4 border border-[rgba(44,95,63,0.1)]">
      {/* Step dots */}
      <div className="flex items-center gap-1.5 mb-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === step ? "w-5 bg-[#2C5F3F]" : i < step ? "w-1.5 bg-[#3D7A55]" : "w-1.5 bg-[#D5E0D8]"
            }`}
          />
        ))}
        <span className="text-[10px] text-[#8FA896] ml-1">Step {step + 1} of 4</span>
      </div>

      {step === 0 && (
        <div>
          <p className="text-[13px] font-semibold text-[#1C2B22] mb-1">What show was it?</p>
          <p className="text-[11px] text-[#8FA896] mb-3">Name and time.</p>
          <input
            className="w-full bg-white border border-[rgba(44,95,63,0.15)] rounded-xl px-3.5 py-2.5 text-[13px] text-[#1C2B22] placeholder:text-[#B5C4B9] focus:outline-none focus:ring-2 focus:ring-[rgba(44,95,63,0.2)] mb-2"
            placeholder="e.g. Jazz Club Saturday..."
            value={show.name}
            onChange={(e) => setShow((s) => ({ ...s, name: e.target.value }))}
          />
          <input
            className="w-full bg-white border border-[rgba(44,95,63,0.15)] rounded-xl px-3.5 py-2.5 text-[13px] text-[#1C2B22] placeholder:text-[#B5C4B9] focus:outline-none focus:ring-2 focus:ring-[rgba(44,95,63,0.2)]"
            placeholder="Time (e.g. 9:00 PM)"
            value={show.time}
            onChange={(e) => setShow((s) => ({ ...s, time: e.target.value }))}
          />
          <div className="flex justify-between items-center mt-4">
            <button type="button" onClick={() => setOpen(false)} className="text-[12px] text-[#8FA896]">Cancel</button>
            <button type="button" onClick={() => goNext(0)}
              className="h-9 px-5 rounded-full bg-[#2C5F3F] text-white text-[12px] font-semibold active:scale-95">
              Next →
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <p className="text-[13px] font-semibold text-[#1C2B22] mb-1">Rate your performance</p>
          <p className="text-[11px] text-[#8FA896] mb-3">All 4 required to continue.</p>
          {showValidation && (
            <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
              Please rate all 4 categories first.
            </div>
          )}
          <div className="space-y-3">
            {RATING_LABELS.map(({ key, label }) => (
              <div key={key}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-[#3D4A3E]">{label}</span>
                  <span className="text-[11px] text-[#8FA896]">{show.ratings[key] || 0}/5</span>
                </div>
                <StarRow value={show.ratings[key]} onChange={(v) => setRating(key, v)} />
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4">
            <button type="button" onClick={() => setStep(0)} className="text-[12px] text-[#8FA896]">← Back</button>
            <button type="button" onClick={() => goNext(1)}
              className="h-9 px-5 rounded-full bg-[#2C5F3F] text-white text-[12px] font-semibold active:scale-95">
              Next →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="text-[13px] font-semibold text-[#1C2B22] mb-1">How did your voice feel?</p>
          <p className="text-[11px] text-[#8FA896] mb-3">Pick what resonates.</p>
          <div className="flex flex-wrap gap-2">
            {FEELINGS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setShow((s) => ({ ...s, feeling: f }))}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition active:scale-95 ${
                  show.feeling === f
                    ? "bg-[#2C5F3F] text-white border-[#2C5F3F]"
                    : "bg-white text-[#5A7A65] border-[rgba(44,95,63,0.2)] hover:bg-[#EAF0EB]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4">
            <button type="button" onClick={() => setStep(1)} className="text-[12px] text-[#8FA896]">← Back</button>
            <button type="button" onClick={() => goNext(2)}
              className="h-9 px-5 rounded-full bg-[#2C5F3F] text-white text-[12px] font-semibold active:scale-95">
              Next →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <p className="text-[13px] font-semibold text-[#1C2B22] mb-1">How was your day overall?</p>
          <p className="text-[11px] text-[#8FA896] mb-3">Optional — but valuable over time.</p>
          <textarea
            className="w-full bg-white border border-[rgba(44,95,63,0.15)] rounded-xl px-3.5 py-2.5 text-[13px] text-[#1C2B22] placeholder:text-[#B5C4B9] focus:outline-none focus:ring-2 focus:ring-[rgba(44,95,63,0.2)] resize-none"
            rows={3}
            placeholder="e.g. Voice felt warm, high notes came easier..."
            value={show.note}
            onChange={(e) => setShow((s) => ({ ...s, note: e.target.value }))}
          />
          <div className="flex justify-between items-center mt-4">
            <button type="button" onClick={() => setStep(2)} className="text-[12px] text-[#8FA896]">← Back</button>
            <button type="button" onClick={save}
              className="h-9 px-5 rounded-full bg-[#2C5F3F] text-white text-[12px] font-semibold active:scale-95">
              Save show ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TodayShowsCard() {
  const [shows, setShows] = useState<(ShowEntry | null)[]>([null, null, null]);

  const saveShow = (idx: number, show: ShowEntry) => {
    setShows((prev) => prev.map((s, i) => (i === idx ? show : s)));
  };

  const anyDone = shows.some((s) => s?.done);

  return (
    <div className="mx-4 bg-white rounded-3xl p-5 border border-[rgba(44,95,63,0.08)] shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-[16px] font-semibold text-[#1C2B22]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Tonight's performances
          </h2>
          <p className="text-[12px] text-[#8FA896] mt-0.5">
            Log up to 3 shows you have tonight.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {shows.map((show, i) =>
          show?.done ? (
            <EntryView key={i} show={show} />
          ) : (
            <AddShowCard key={i} index={i} onSave={(s) => saveShow(i, s)} />
          )
        )}
      </div>

      {anyDone && (
        <p className="text-center text-[11px] text-[#8FA896] mt-4 pt-3 border-t border-[rgba(44,95,63,0.07)]">
          ✓ Auto-saves at end of day
        </p>
      )}
    </div>
  );
}