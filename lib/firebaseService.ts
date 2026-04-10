import { db, auth } from "@/lib/firebase";
import {
  doc, setDoc, getDoc, collection, getDocs, orderBy, query, limit,
} from "firebase/firestore";
import { getAppDate, getLocalTimestamp } from "@/lib/dateUtils";

function clean<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_, v) => (v === undefined ? null : v)));
}

function userBase() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Not authenticated");
  return `users/${uid}`;
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

export async function saveShows(shows: ShowRecord[]) {
  const date = getAppDate();
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

// ─── STATS ──────────────────────────────────────────────────

export async function getStreak(): Promise<number> {
  // Streak counts both warmup sessions AND rest days
  const [sessions, restDays] = await Promise.all([getRecentSessions(30), getRecentRestDays(30)]);
  const dateSet = new Set([
    ...sessions.map((s) => s.date),
    ...restDays.map((r) => r.date),
  ]);
  if (dateSet.size === 0) return 0;
  const dates = Array.from(dateSet).sort().reverse();
  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);
  for (const dateStr of dates) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const diff = Math.floor((current.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 1) { streak++; current = date; } else break;
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

export async function getSessionsThisWeek(): Promise<number> {
  const sessions = await getRecentSessions(7);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);
  return sessions.filter((s) => {
    const [y, m, d] = s.date.split("-").map(Number);
    return new Date(y, m - 1, d) >= weekAgo;
  }).length;
}

// ─── DAILY CHECK-IN ─────────────────────────────────────────

export type CheckIn = {
  date: string;
  water: boolean | null;
  steam: boolean | null;
  sleep: boolean | null;
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
    const yesterday = new Date();
    if (yesterday.getHours() < 6) yesterday.setDate(yesterday.getDate() - 2);
    else yesterday.setDate(yesterday.getDate() - 1);
    const y = yesterday.getFullYear();
    const m = String(yesterday.getMonth() + 1).padStart(2, "0");
    const d = String(yesterday.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;
    const ref = doc(db, `${userBase()}/motivation`, dateStr);
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

export async function saveAiAnalysis(date: string, analysis: string) {
  const ref = doc(db, `${userBase()}/restdays`, date);
  await setDoc(ref, clean({ aiAnalysis: analysis, aiAnalysisDate: getLocalTimestamp() }), { merge: true });
}

export async function getRecentRestDays(count = 14): Promise<RestDayData[]> {
  const ref = collection(db, `${userBase()}/restdays`);
  const q = query(ref, orderBy("date", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as RestDayData);
}

// ─── AI ANALYSIS ─────────────────────────────────────────────

export type AiAnalysis = {
  date: string;
  text: string;
  savedAt: string;
};



export async function getLatestAiAnalysis(): Promise<AiAnalysis | null> {
  try {
    const ref = collection(db, `${userBase()}/aianalysis`);
    const q = query(ref, orderBy("date", "desc"), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as AiAnalysis;
  } catch { return null; }
}