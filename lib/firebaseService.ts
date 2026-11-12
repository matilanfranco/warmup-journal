import { db, auth } from "@/lib/firebase";
import {
  doc, setDoc, getDoc, deleteDoc, collection, getDocs, orderBy, query, limit, where,
} from "firebase/firestore";
import { getAppDate, getLocalTimestamp, shiftDate } from "@/lib/dateUtils";

function clean<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_, v) => (v === undefined ? null : v)));
}

function userBase() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Not authenticated");
  return `users/${uid}`;
}

// Fetch every doc of a per-day collection whose date is in [from, to] (inclusive).
// Omit `from` / `to` for an open range.
async function getInRange<T>(name: string, from?: string, to?: string): Promise<T[]> {
  const ref = collection(db, `${userBase()}/${name}`);
  const clauses = [];
  if (from) clauses.push(where("date", ">=", from));
  if (to) clauses.push(where("date", "<=", to));
  const q = query(ref, ...clauses, orderBy("date", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as T);
}

// ─── SESSION ────────────────────────────────────────────────

export type StepRecord = {
  title: string;
  status: "rated" | "skipped" | "pending";
  rating: number | null;
  note: string | null;
};

export type SessionRecord = {
  date: string;
  routineId: string;
  routineName?: string; // missing on sessions saved before named routines

  steps: StepRecord[];
  finalComment: string;
  completedAt: string;
};

export async function saveSession(data: Omit<SessionRecord, "date" | "completedAt">) {
  const date = getAppDate();
  const ref = doc(db, `${userBase()}/sessions`, date);
  await setDoc(ref, clean({ ...data, date, completedAt: getLocalTimestamp() }));
}

export async function getSession(date: string): Promise<SessionRecord | null> {
  const ref = doc(db, `${userBase()}/sessions`, date);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as SessionRecord) : null;
}

export async function getRecentSessions(count = 14): Promise<SessionRecord[]> {
  const ref = collection(db, `${userBase()}/sessions`);
  const q = query(ref, orderBy("date", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as SessionRecord);
}

export const getSessionsInRange = (from?: string, to?: string) =>
  getInRange<SessionRecord>("sessions", from, to);

// ─── SHOWS ──────────────────────────────────────────────────

export type ShowRecord = {
  name: string;
  time: string;
  ratings: Record<string, number>;
  feeling: string | null;
  feelings: string[];
  note: string;
};

export type DayShows = {
  date: string;
  shows: ShowRecord[];
  savedAt: string;
};

export async function saveShows(shows: ShowRecord[], date?: string) {
  date = date ?? getAppDate();
  const ref = doc(db, `${userBase()}/shows`, date);
  await setDoc(ref, clean({ date, shows, savedAt: getLocalTimestamp() }));
}

export async function getShows(date: string): Promise<DayShows | null> {
  const ref = doc(db, `${userBase()}/shows`, date);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as DayShows) : null;
}

export async function getRecentShows(count = 14): Promise<DayShows[]> {
  const ref = collection(db, `${userBase()}/shows`);
  const q = query(ref, orderBy("date", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as DayShows);
}

export async function deleteShows(date: string) {
  await deleteDoc(doc(db, `${userBase()}/shows`, date));
}

export const getShowsInRange = (from?: string, to?: string) =>
  getInRange<DayShows>("shows", from, to);

// ─── COOL DOWN ──────────────────────────────────────────────

export type CoolDownRecord = {
  date: string;
  steps: StepRecord[];
  finalComment: string;
  completedAt: string;
};

export async function saveCoolDown(data: Omit<CoolDownRecord, "date" | "completedAt">) {
  const date = getAppDate();
  const ref = doc(db, `${userBase()}/cooldowns`, date);
  await setDoc(ref, clean({ ...data, date, completedAt: getLocalTimestamp() }));
}

export async function getRecentCoolDowns(count = 14): Promise<CoolDownRecord[]> {
  const ref = collection(db, `${userBase()}/cooldowns`);
  const q = query(ref, orderBy("date", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as CoolDownRecord);
}

export const getCoolDownsInRange = (from?: string, to?: string) =>
  getInRange<CoolDownRecord>("cooldowns", from, to);

// ─── STATS ──────────────────────────────────────────────────

// Consecutive days with a completed warmup. Today not being done yet
// doesn't break the streak — it counts back from yesterday in that case.
export async function getStreak(): Promise<number> {
  const sessions = await getRecentSessions(400);
  return calcWarmupStreak(sessions.map((s) => s.date));
}

export function calcWarmupStreak(dates: string[]): number {
  const set = new Set(dates);
  let cursor = getAppDate();
  if (!set.has(cursor)) cursor = shiftDate(cursor, -1);
  let streak = 0;
  while (set.has(cursor)) {
    streak++;
    cursor = shiftDate(cursor, -1);
  }
  return streak;
}

export async function getAvgRating(): Promise<number | null> {
  const sessions = await getRecentSessions(10);
  const ratings: number[] = [];
  for (const s of sessions)
    for (const step of s.steps)
      if (step.status === "rated" && step.rating) ratings.push(step.rating);
  if (ratings.length === 0) return null;
  return Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
}

// Warmups in the last 7 days (today included).
export async function getSessionsThisWeek(): Promise<number> {
  const sessions = await getSessionsInRange(shiftDate(getAppDate(), -6));
  return sessions.length;
}

// ─── DAILY CHECK-IN ─────────────────────────────────────────

export type CheckIn = {
  date: string;
  water: boolean | null;
  steam: boolean | null;
  sleep: boolean | null;
  sleepHours: number | null;
  caffeine: boolean | null;
  gym: "none" | "light" | "heavy" | null;
  alcohol: boolean | null;
  feeling: "energized" | "balanced" | "tired" | "struggling" | null;
  completedAt: string;
};

export async function saveCheckIn(data: Omit<CheckIn, "date" | "completedAt">) {
  const date = getAppDate();
  const ref = doc(db, `${userBase()}/checkins`, date);
  await setDoc(ref, clean({ ...data, date, completedAt: getLocalTimestamp() }));
}

export async function getRecentCheckIns(count = 20): Promise<CheckIn[]> {
  const ref = collection(db, `${userBase()}/checkins`);
  const q = query(ref, orderBy("date", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as CheckIn);
}

export const getCheckInsInRange = (from?: string, to?: string) =>
  getInRange<CheckIn>("checkins", from, to);

export async function getCheckIn(date: string): Promise<CheckIn | null> {
  const ref = doc(db, `${userBase()}/checkins`, date);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as CheckIn) : null;
}

// ─── MOTIVATION MESSAGE ──────────────────────────────────────

export type MotivationMessage = {
  date: string;
  message: string;
  savedAt: string;
};

export async function saveMotivationMessage(message: string) {
  const date = getAppDate();
  const ref = doc(db, `${userBase()}/motivation`, date);
  await setDoc(ref, clean({ date, message, savedAt: getLocalTimestamp() }));
}

export async function getYesterdayMessage(): Promise<MotivationMessage | null> {
  try {
    const ref = doc(db, `${userBase()}/motivation`, shiftDate(getAppDate(), -1));
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as MotivationMessage) : null;
  } catch { return null; }
}

// ─── REST DAY ────────────────────────────────────────────────

export type RestDayData = {
  date: string;
  voiceDescription: string;
  vocalFatigue: number | null;
  steamLastNight: boolean | null;
  steamToday: boolean | null;
  water: boolean | null;
  sleep: boolean | null;
  electrolytes: boolean | null;
  vocalRest: boolean | null;
  // Written by the old built-in AI feature; kept so past entries still show it.
  aiAnalysis?: string | null;
  aiAnalysisDate?: string | null;
  savedAt: string;
};

export async function saveRestDay(data: Omit<RestDayData, "date" | "savedAt">) {
  const date = getAppDate();
  const ref = doc(db, `${userBase()}/restdays`, date);
  await setDoc(ref, clean({ ...data, date, savedAt: getLocalTimestamp() }));
}

export async function getRestDay(date: string): Promise<RestDayData | null> {
  const ref = doc(db, `${userBase()}/restdays`, date);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as RestDayData) : null;
}

export async function getRecentRestDays(count = 14): Promise<RestDayData[]> {
  const ref = collection(db, `${userBase()}/restdays`);
  const q = query(ref, orderBy("date", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as RestDayData);
}

export const getRestDaysInRange = (from?: string, to?: string) =>
  getInRange<RestDayData>("restdays", from, to);

// ─── LEGACY: BREAK CHECK-INS ─────────────────────────────────
// Break mode was removed. Old entries are only read, for the data export.

export type BreakCheckIn = {
  date: string;
  activities: string[];
  vocalRating: number | null;
  water: boolean | null;
  sleep: boolean | null;
  electrolytes: boolean | null;
  note: string;
  savedAt: string;
};

export const getBreakCheckInsInRange = (from?: string, to?: string) =>
  getInRange<BreakCheckIn>("breakcheckins", from, to);

// ─── PUSH REMINDERS ──────────────────────────────────────────
// Read by the server cron (app/api/cron/reminders) to send the daily warmup reminder.

export type PushSettings = {
  enabled: boolean;
  tokens: string[];
  timeZone: string;
  reminderHour: number; // 0-23, local time
  lastSentDate?: string | null;
  updatedAt: string;
};

export async function getPushSettings(): Promise<PushSettings | null> {
  const snap = await getDoc(doc(db, `${userBase()}/settings`, "push"));
  return snap.exists() ? (snap.data() as PushSettings) : null;
}

export async function savePushSettings(data: Partial<PushSettings>) {
  const ref = doc(db, `${userBase()}/settings`, "push");
  await setDoc(ref, clean({ ...data, updatedAt: getLocalTimestamp() }), { merge: true });
}
