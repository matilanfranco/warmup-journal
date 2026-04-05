"use client";

import { useState, useEffect } from "react";
import { saveShows, getShows } from "@/lib/firebaseService";
import { markShowsLogged } from "@/lib/notifications";

type RatingKey = "voice" | "energy" | "confidence" | "range";


type ShowEntry = {
  name: string;
  time: string;
  ratings: Record<RatingKey, number>;
  feelings: Feeling[];
  note: string;
  done: boolean;
};

const RATING_LABELS: { key: RatingKey; label: string }[] = [
  { key: "voice", label: "Voice quality" },
  { key: "energy", label: "Energy" },
  { key: "confidence", label: "Confidence" },
  { key: "range", label: "Range & control" },
];

type Feeling =
  | "Calm" | "Energetic" | "Confident" | "Nervous" | "In the flow" | "Strained"
  | "Controlled" | "Tense" | "Fatigued" | "Smooth" | "Powerful" | "Cool"
  | "Taking risks" | "Focused" | "Unfocused";

const FEELING_GROUPS: { label: string; items: Feeling[] }[] = [
  {
    label: "Energy",
    items: ["Energetic", "Calm", "Fatigued", "Cool"],
  },
  {
    label: "Voice",
    items: ["Smooth", "Controlled", "Powerful", "Strained", "Tense"],
  },
  {
    label: "Mindset",
    items: ["Confident", "Nervous", "Focused", "Unfocused", "In the flow", "Taking risks"],
  },
];

const ALL_FEELINGS: Feeling[] = FEELING_GROUPS.flatMap((g) => g.items);

const emptyShow = (): ShowEntry => ({
  name: "",
  time: "",
  ratings: { voice: 0, energy: 0, confidence: 0, range: 0 },
  feelings: [],
  note: "",
  done: false,
});

function StarRow({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onClick={() => onChange(i)}
          className={`w-8 h-8 rounded-lg text-sm transition active:scale-95 border ${
            value >= i
              ? "bg-[#EAF0EB] border-[#3D7A55] text-[#2C5F3F]"
              : "bg-[#F5F2EC] border-[rgba(44,95,63,0.15)] text-[#B5C4B9]"
          }`}>★</button>
      ))}
    </div>
  );
}

// ── Time picker: input libre + AM/PM toggle ──────────────────
function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const parts = value.split(" ");
  const hourPart = parts[0] || "";
  const periodPart = parts[1] || "PM";

  const update = (h: string, p: string) => onChange(h ? `${h} ${p}` : "");

  return (
    <div>
      <p className="text-[11px] text-[#8FA896] mb-2">Show time</p>
      <div className="flex gap-2 items-center">
        <input
          className="flex-1 bg-white border border-[rgba(44,95,63,0.15)] rounded-xl px-3.5 py-2.5 text-[13px] text-[#1C2B22] placeholder:text-[#B5C4B9] focus:outline-none focus:ring-2 focus:ring-[rgba(44,95,63,0.2)]"
          placeholder="e.g. 8:30"
          value={hourPart}
          onChange={(e) => update(e.target.value, periodPart)}
        />
        <div className="flex gap-1.5 shrink-0">
          {["AM", "PM"].map((p) => (
            <button key={p} type="button" onClick={() => update(hourPart, p)}
              className={`w-12 h-10 rounded-xl text-[12px] font-bold border transition active:scale-95 ${
                periodPart === p
                  ? "bg-[#2C5F3F] text-white border-[#2C5F3F]"
                  : "bg-white text-[#8FA896] border-[rgba(44,95,63,0.15)] hover:bg-[#EAF0EB]"
              }`}>{p}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function EntryView({ show, onEdit }: { show: ShowEntry; onEdit: () => void }) {
  const avg = Math.round(Object.values(show.ratings).reduce((a, b) => a + b, 0) / 4);
  const stars = Array.from({ length: 5 }, (_, i) => (i < avg ? "★" : "☆")).join("");

  return (
    <div className="bg-[#F9F8F5] rounded-2xl p-4 border border-[rgba(44,95,63,0.08)]">
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          {show.time && <p className="text-[11px] text-[#8FA896] font-medium mb-0.5">{show.time}</p>}
          <p className="text-[14px] font-semibold text-[#1C2B22]">{show.name}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className="text-[13px] text-[#3D7A55]">{stars}</span>
          <button onClick={onEdit}
            className="w-7 h-7 rounded-full bg-white border border-[rgba(44,95,63,0.15)] flex items-center justify-center text-[#8FA896] hover:text-[#2C5F3F] transition-colors active:scale-95">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M7.5 1.5L9.5 3.5L3.5 9.5H1.5V7.5L7.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {[
          { key: "voice" as RatingKey, short: "Voice" },
          { key: "energy" as RatingKey, short: "Energy" },
          { key: "confidence" as RatingKey, short: "Conf." },
          { key: "range" as RatingKey, short: "Range" },
        ].map(({ key, short }) => (
          <div key={key} className="bg-white rounded-xl px-2 py-1.5 border border-[rgba(44,95,63,0.08)] text-center">
            <p className="text-[9px] text-[#8FA896] font-medium uppercase tracking-wide">{short}</p>
            <p className="text-[14px] font-bold text-[#2C5F3F] mt-0.5">
              {show.ratings[key]}<span className="text-[9px] text-[#B5C4B9] font-normal">/5</span>
            </p>
          </div>
        ))}
      </div>
      {show.feelings && show.feelings.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {show.feelings.map((f) => (
            <span key={f} className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#EAF0EB] text-[#2C5F3F]">{f}</span>
          ))}
        </div>
      )}
      {show.note && <p className="text-[12px] text-[#8FA896] italic mt-2">"{show.note}"</p>}
    </div>
  );
}

function ShowForm({ index, initial, onSave, onCancel }: {
  index: number;
  initial: ShowEntry;
  onSave: (show: ShowEntry) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(0);
  const [show, setShow] = useState<ShowEntry>({ ...initial, feelings: initial.feelings ?? [] });
  const [showValidation, setShowValidation] = useState(false);


  const allRated = show.ratings.voice > 0 && show.ratings.energy > 0 &&
    show.ratings.confidence > 0 && show.ratings.range > 0;

  const setRating = (key: RatingKey, val: number) =>
    setShow((s) => ({ ...s, ratings: { ...s.ratings, [key]: val } }));

  // ── Multi-select toggle ──────────────────────────────────
  const toggleFeeling = (f: Feeling) =>
    setShow((s) => ({
      ...s,
      feelings: s.feelings.includes(f)
        ? s.feelings.filter((x) => x !== f)
        : [...s.feelings, f],
    }));

  const goNext = (from: number) => {
    if (from === 1 && !allRated) { setShowValidation(true); return; }
    setShowValidation(false);
    setStep(from + 1);
  };

  return (
    <div className="bg-[#F9F8F5] rounded-2xl p-4 border border-[rgba(44,95,63,0.1)]">
      <div className="flex items-center gap-1.5 mb-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all ${
            i === step ? "w-5 bg-[#2C5F3F]" : i < step ? "w-1.5 bg-[#3D7A55]" : "w-1.5 bg-[#D5E0D8]"
          }`} />
        ))}
        <span className="text-[10px] text-[#8FA896] ml-1">Step {step + 1} of 4</span>
      </div>

      {step === 0 && (
        <div>
          <p className="text-[13px] font-semibold text-[#1C2B22] mb-1">What show was it?</p>
          <p className="text-[11px] text-[#8FA896] mb-3">Name it and pick the time.</p>
          <input
            className="w-full bg-white border border-[rgba(44,95,63,0.15)] rounded-xl px-3.5 py-2.5 text-[13px] text-[#1C2B22] placeholder:text-[#B5C4B9] focus:outline-none focus:ring-2 focus:ring-[rgba(44,95,63,0.2)] mb-4"
            placeholder="e.g. Jazz Club Saturday..."
            value={show.name}
            onChange={(e) => setShow((s) => ({ ...s, name: e.target.value }))}
          />
          <TimePicker value={show.time} onChange={(t) => setShow((s) => ({ ...s, time: t }))} />
          <div className="flex justify-between items-center mt-4">
            <button type="button" onClick={onCancel} className="text-[12px] text-[#8FA896]">Cancel</button>
            <button type="button" onClick={() => goNext(0)}
              className="h-9 px-5 rounded-full bg-[#2C5F3F] text-white text-[12px] font-semibold active:scale-95">Next →</button>
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
              className="h-9 px-5 rounded-full bg-[#2C5F3F] text-white text-[12px] font-semibold active:scale-95">Next →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="text-[13px] font-semibold text-[#1C2B22] mb-1">How did your voice feel?</p>
          <p className="text-[11px] text-[#8FA896] mb-3">Select all that apply.</p>
          <div className="space-y-3">
            {FEELING_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-[9px] font-black tracking-widest uppercase text-[#8FA896] mb-1.5">{group.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((f) => (
                    <button key={f} type="button" onClick={() => toggleFeeling(f)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition active:scale-95 ${
                        show.feelings.includes(f)
                          ? "bg-[#2C5F3F] text-white border-[#2C5F3F]"
                          : "bg-white text-[#5A7A65] border-[rgba(44,95,63,0.2)] hover:bg-[#EAF0EB]"
                      }`}>
                      {show.feelings.includes(f) ? "✓ " : ""}{f}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {show.feelings.length > 0 && (
            <p className="text-[11px] text-[#2C5F3F] mt-2">{show.feelings.length} selected</p>
          )}
          <div className="flex justify-between items-center mt-4">
            <button type="button" onClick={() => setStep(1)} className="text-[12px] text-[#8FA896]">← Back</button>
            <button type="button" onClick={() => goNext(2)}
              className="h-9 px-5 rounded-full bg-[#2C5F3F] text-white text-[12px] font-semibold active:scale-95">Next →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <p className="text-[13px] font-semibold text-[#1C2B22] mb-1">How was your day overall?</p>
          <p className="text-[11px] text-[#8FA896] mb-3">Optional — but valuable over time.</p>
          <textarea
            className="w-full bg-white border border-[rgba(44,95,63,0.15)] rounded-xl px-3.5 py-2.5 text-[13px] text-[#1C2B22] placeholder:text-[#B5C4B9] focus:outline-none focus:ring-2 focus:ring-[rgba(44,95,63,0.2)] resize-none"
            rows={3} placeholder="e.g. Voice felt warm, high notes came easier..."
            value={show.note}
            onChange={(e) => setShow((s) => ({ ...s, note: e.target.value }))}
          />
          <div className="flex justify-between items-center mt-4">
            <button type="button" onClick={() => setStep(2)} className="text-[12px] text-[#8FA896]">← Back</button>
            <button type="button" onClick={() => onSave({ ...show, done: true })}
              className="h-9 px-5 rounded-full bg-[#2C5F3F] text-white text-[12px] font-semibold active:scale-95">Save show ✓</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TodayShowsCard() {
  const [shows, setShows] = useState<(ShowEntry | null)[]>([null, null, null]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) return; // 👈 ESTA LINEA

    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("shows", JSON.stringify(shows));
    localStorage.setItem("shows_date", today);
  }, [shows, loaded]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const savedDate = localStorage.getItem("shows_date");

    if (savedDate && savedDate !== today) {
      localStorage.removeItem("shows");
      localStorage.setItem("shows_date", today);
      setShows([null, null, null]);
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const today = new Date().toISOString().split("T")[0];
        const local = localStorage.getItem("shows");
        const localDate = localStorage.getItem("shows_date");

        if (local && localDate === today) {
          setShows(JSON.parse(local));
          setLoaded(true);
          return;
        }
        const data = await getShows(today);
        if (data && data.shows.length > 0) {
          const loaded = data.shows.map((s) => ({
            ...s,
            feelings: (s as any).feelings ?? ((s as any).feeling ? [(s as any).feeling] : []),
            done: true,
          } as ShowEntry));
          const padded: (ShowEntry | null)[] = [null, null, null];
          loaded.forEach((s, i) => { if (i < 3) padded[i] = s; });
          setShows(padded);
          setSavedAt(data.savedAt);
        }
      } catch (e) {
        console.error("Error loading shows:", e);
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, []);

  const persistShows = async (updated: (ShowEntry | null)[]) => {
    const done = updated.filter((s): s is ShowEntry => s?.done === true);
    if (done.length === 0) return;
    setSaving(true);
    try {
      await saveShows(done.map((s) => ({
        name: s.name, time: s.time, ratings: s.ratings,
        feeling: s.feelings[0] ?? null, feelings: s.feelings, note: s.note,
      })));
      setSavedAt(new Date().toISOString());
      markShowsLogged();
    } catch (e) {
      console.error("Error saving shows:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (idx: number, show: ShowEntry) => {
    const updated = shows.map((s, i) => (i === idx ? show : s));
    setShows(updated);
    setEditingIdx(null);
    await persistShows(updated);
  };

  const anyDone = shows.some((s) => s?.done);
  const formatSavedAt = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <div className="mx-4 bg-white rounded-3xl p-5 border border-[rgba(44,95,63,0.08)] shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-[16px] font-semibold text-[#1C2B22]"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Tonight's performances
          </h2>
          <p className="text-[12px] text-[#8FA896] mt-0.5">Log up to 3 shows · tap ✏️ to edit</p>
        </div>
        {saving && <span className="text-[11px] text-[#8FA896] animate-pulse">Saving...</span>}
      </div>

      {!loaded ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-11 rounded-2xl bg-[#F5F2EC] animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {shows.map((show, i) => {
            if (editingIdx === i) {
              return <ShowForm key={i} index={i} initial={show ?? emptyShow()}
                onSave={(s) => handleSave(i, s)} onCancel={() => setEditingIdx(null)} />;
            }
            if (show?.done) {
              return <EntryView key={i} show={show} onEdit={() => setEditingIdx(i)} />;
            }
            return (
              <button key={i} type="button" onClick={() => setEditingIdx(i)}
                className="w-full h-11 rounded-2xl border border-dashed border-[rgba(44,95,63,0.25)] bg-transparent flex items-center justify-center gap-2 text-[13px] text-[#8FA896] font-medium active:scale-[0.98] transition-transform hover:bg-[#F5F2EC]">
                <span className="text-base leading-none">+</span> Add show {i + 1}
              </button>
            );
          })}
        </div>
      )}

      {anyDone && !saving && (
        <p className="text-center text-[11px] text-[#8FA896] mt-4 pt-3 border-t border-[rgba(44,95,63,0.07)]">
          {savedAt ? `✓ Saved at ${formatSavedAt(savedAt)}` : "✓ Saved to journal"}
        </p>
      )}
    </div>
  );
}