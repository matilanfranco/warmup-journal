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
  const sessions = await getRecentSessions(30);
  if (sessions.length === 0) return 0;
  const dates = sessions.map((s) => s.date).sort().reverse();
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