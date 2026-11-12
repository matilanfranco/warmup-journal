// Builds a single text file with a ready-made prompt + the user's data as CSV tables.
// The user drops this file into any AI chat (ChatGPT, Claude, Gemini…) to get insights.

import {
  getSessionsInRange, getShowsInRange, getCoolDownsInRange, getCheckInsInRange,
  getRestDaysInRange, getBreakCheckInsInRange, getRecentRestDays,
  SessionRecord, DayShows, CoolDownRecord, CheckIn, RestDayData, BreakCheckIn,
} from "@/lib/firebaseService";
import { getAppDate, shiftDate } from "@/lib/dateUtils";
import { listRoutines } from "@/lib/routines";

export type ExportRange = "7d" | "14d" | "all" | "since-rest-day";

type Data = {
  routineNames: Record<string, string>;
  sessions: SessionRecord[];
  shows: DayShows[];
  cooldowns: CoolDownRecord[];
  checkins: CheckIn[];
  restDays: RestDayData[];
  breakCheckIns: BreakCheckIn[];
};

// ── CSV helpers ───────────────────────────────────────────────

function cell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = Array.isArray(v) ? v.join("; ") : typeof v === "boolean" ? (v ? "yes" : "no") : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function csv(headers: string[], rows: unknown[][]): string {
  return [headers.join(","), ...rows.map((r) => r.map(cell).join(","))].join("\n");
}

function section(title: string, headers: string[], rows: unknown[][]): string {
  if (rows.length === 0) return `## ${title}\n(no entries)\n`;
  return `## ${title}\n\`\`\`csv\n${csv(headers, rows)}\n\`\`\`\n`;
}

// ── Tables ────────────────────────────────────────────────────

function tables(d: Data): string {
  const warmups = d.sessions.flatMap((s) =>
    s.steps.map((st, i) => [s.date, d.routineNames[s.routineId] ?? s.routineName ?? s.routineId, i + 1, st.title, st.status, st.rating, st.note, i === 0 ? s.finalComment : ""])
  );
  const shows = d.shows.flatMap((day) =>
    day.shows.map((sh) => {
      const feelings = sh.feelings?.length ? sh.feelings : sh.feeling ? [sh.feeling] : [];
      const r = sh.ratings ?? {};
      return [day.date, sh.name, sh.time, r.voice, r.energy, r.confidence, r.range, feelings, sh.note];
    })
  );
  const cooldowns = d.cooldowns.flatMap((c) =>
    c.steps.map((st, i) => [c.date, i + 1, st.title, st.status, st.rating, st.note, i === 0 ? c.finalComment : ""])
  );
  const checkins = d.checkins.map((c) => [
    c.date, c.feeling, c.sleepHours, c.sleep, c.water, c.steam, c.caffeine, c.alcohol, c.gym,
  ]);
  const restDays = d.restDays.map((r) => [
    r.date, r.vocalFatigue, r.vocalRest, r.steamLastNight, r.steamToday, r.water, r.sleep, r.electrolytes, r.voiceDescription,
  ]);
  const breaks = d.breakCheckIns.map((b) => [b.date, b.activities, b.vocalRating, b.water, b.sleep, b.electrolytes, b.note]);

  return [
    section("Warmups (one row per exercise, rating 1-5)",
      ["date", "routine", "step", "exercise", "status", "rating", "note", "session_note"], warmups),
    section("Shows (ratings 1-5)",
      ["date", "show", "time", "voice", "energy", "confidence", "range_control", "feelings", "note"], shows),
    section("Cool downs (one row per exercise, rating 1-5)",
      ["date", "step", "exercise", "status", "rating", "note", "session_note"], cooldowns),
    section("Pre-warmup check-ins",
      ["date", "feeling", "sleep_hours", "slept_well", "water", "steam", "caffeine", "alcohol", "gym"], checkins),
    section("Days off (vocal fatigue 1-10, 10 = exhausted)",
      ["date", "vocal_fatigue", "vocal_rest", "steam_last_night", "steam_today", "water_2.5-3L", "sleep_7-8h", "electrolytes", "how_voice_felt"], restDays),
    ...(breaks.length
      ? [section("Older break-mode check-ins (vocal rating 1-5)",
          ["date", "activities", "vocal_rating", "water", "sleep", "electrolytes", "note"], breaks)]
      : []),
  ].join("\n");
}

// ── Prompts ───────────────────────────────────────────────────

function generalPrompt(name: string, from: string, to: string): string {
  return `# Voice journal — ${name} — ${from} to ${to}

You are a vocal coach and performance analyst. Below is ${name}'s voice journal from the app "The Daily Singer": daily warmups, shows, cool downs, pre-warmup check-ins and days off. Each table is CSV. Days with no row simply mean nothing was logged — not that something went wrong.

Please:
1. Summarize the period in a few lines: how consistent the warmups were, how the shows went, how the voice felt.
2. Look for real patterns between habits (sleep, water, alcohol, gym, steam, rest) and warmup/show ratings. Only state a correlation if the data supports it; if there isn't enough data, say what to track to find out.
3. Compare the warmup routines (by name): how often each was used and how it rated, plus which exercises rate highest and lowest and any trend over time.
4. Give 2-3 concrete, realistic things to focus on next.

Be direct and specific, address ${name} by name, and keep it under 400 words. After that, answer any follow-up questions using this data.
`;
}

function restDayPrompt(name: string, from: string, to: string): string {
  return `# Day-off debrief — ${name} — run from ${from} to ${to}

You are a vocal performance coach and sports psychologist writing a day-off debrief for ${name}, a professional singer. Be direct, honest and useful — not a cheerleader. Below is the data for the run since the previous day off (the last row of "Days off" is today). Each table is CSV.

Write exactly 3 paragraphs:
1. Run overview — what the numbers actually show (shows, ratings, warmups, today's vocal fatigue). Earn every positive statement with data.
2. Pattern analysis — cross-reference check-ins and recovery habits with show and warmup ratings. Name real correlations only; if the data is too thin, say so and note what to watch for.
3. Next run focus — one or two concrete, specific things to track or change.

Address ${name} by name at least once. No generic encouragement. Under 300 words. Then answer any follow-up questions using this data.
`;
}

// ── Public API ────────────────────────────────────────────────

async function resolveRange(range: ExportRange): Promise<{ from?: string; to: string }> {
  const to = getAppDate();
  if (range === "7d") return { from: shiftDate(to, -6), to };
  if (range === "14d") return { from: shiftDate(to, -13), to };
  if (range === "since-rest-day") {
    const prev = (await getRecentRestDays(5)).find((r) => r.date < to);
    return { from: prev ? shiftDate(prev.date, 1) : shiftDate(to, -13), to };
  }
  return { to };
}

export async function buildExportFile(range: ExportRange, name: string): Promise<File> {
  const { from, to } = await resolveRange(range);
  const [routines, sessions, shows, cooldowns, checkins, restDays, breakCheckIns] = await Promise.all([
    listRoutines().catch(() => []),
    getSessionsInRange(from, to),
    getShowsInRange(from, to),
    getCoolDownsInRange(from, to),
    getCheckInsInRange(from, to),
    getRestDaysInRange(from, to),
    getBreakCheckInsInRange(from, to),
  ]);
  const routineNames = Object.fromEntries(routines.map((r) => [r.id, r.name]));
  const data: Data = { routineNames, sessions, shows, cooldowns, checkins, restDays, breakCheckIns };

  const firstDate = from ?? [sessions, shows, cooldowns, checkins, restDays, breakCheckIns]
    .flatMap((list) => list.map((x) => x.date)).sort()[0] ?? to;

  const header = range === "since-rest-day"
    ? restDayPrompt(name, firstDate, to)
    : generalPrompt(name, firstDate, to);

  const content = `${header}\n${tables(data)}`;
  const label = range === "since-rest-day" ? "day-off" : range === "all" ? "full-history" : `last-${range}`;
  return new File([content], `daily-singer_${label}_${to}.txt`, { type: "text/plain" });
}

// On phones, opens the share sheet (so it can go straight into the ChatGPT/Claude app).
// Elsewhere, downloads the file.
export async function shareOrDownload(file: File): Promise<void> {
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: file.name });
      return;
    } catch (e) {
      if ((e as Error).name === "AbortError") return; // user closed the sheet
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
