// User-created warmup routines, stored in users/{uid}/warmupRoutines/{id}.

import { db, auth } from "@/lib/firebase";
import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc, orderBy, query,
} from "firebase/firestore";
import { getLocalTimestamp } from "@/lib/dateUtils";

export type WarmupRoutine = {
  id: string;
  name: string;
  audioIds: string[];
  createdAt: string;
  updatedAt: string;
};

const SELECTED_KEY = "selectedRoutineId";
const LEGACY_LOCAL_KEY = "personalRoutineItems";
// The old single routine used id "personal"; keeping it means past warmups stay linked.
const LEGACY_ID = "personal";

function base() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Not authenticated");
  return `users/${uid}`;
}

const col = () => collection(db, `${base()}/warmupRoutines`);

// One-time move of the old "Your routine" into the new collection.
async function migrateLegacy(): Promise<WarmupRoutine | null> {
  let audioIds: string[] = [];
  try {
    const snap = await getDoc(doc(db, `${base()}/routines`, LEGACY_ID));
    if (snap.exists() && Array.isArray(snap.data().audioIds)) audioIds = snap.data().audioIds;
  } catch {}
  if (audioIds.length === 0) {
    try {
      const local = JSON.parse(localStorage.getItem(LEGACY_LOCAL_KEY) ?? "[]");
      if (Array.isArray(local)) audioIds = local;
    } catch {}
  }
  if (audioIds.length === 0) return null;

  const now = getLocalTimestamp();
  const routine: WarmupRoutine = { id: LEGACY_ID, name: "My routine", audioIds, createdAt: now, updatedAt: now };
  await setDoc(doc(col(), LEGACY_ID), routine);
  return routine;
}

export async function listRoutines(): Promise<WarmupRoutine[]> {
  const snap = await getDocs(query(col(), orderBy("createdAt", "asc")));
  if (!snap.empty) return snap.docs.map((d) => d.data() as WarmupRoutine);
  // Only migrate when the user has never had a routine in the new collection
  if (localStorage.getItem("routinesMigrated")) return [];
  const migrated = await migrateLegacy();
  localStorage.setItem("routinesMigrated", "1");
  return migrated ? [migrated] : [];
}

export async function getRoutine(id: string): Promise<WarmupRoutine | null> {
  const snap = await getDoc(doc(col(), id));
  return snap.exists() ? (snap.data() as WarmupRoutine) : null;
}

export async function saveRoutine(data: { id?: string; name: string; audioIds: string[] }): Promise<string> {
  const now = getLocalTimestamp();
  const ref = data.id ? doc(col(), data.id) : doc(col());
  const existing = data.id ? await getRoutine(data.id) : null;
  await setDoc(ref, {
    id: ref.id,
    name: data.name.trim() || "Untitled routine",
    audioIds: data.audioIds,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  });
  return ref.id;
}

export async function deleteRoutine(id: string) {
  await deleteDoc(doc(col(), id));
  if (getSelectedRoutineId() === id) localStorage.removeItem(SELECTED_KEY);
  if (id === LEGACY_ID) {
    // Remove the old copies too, so another device doesn't migrate it back.
    await deleteDoc(doc(db, `${base()}/routines`, LEGACY_ID)).catch(() => {});
    localStorage.removeItem(LEGACY_LOCAL_KEY);
  }
}

export function getSelectedRoutineId(): string | null {
  try { return localStorage.getItem(SELECTED_KEY); } catch { return null; }
}

export function setSelectedRoutineId(id: string) {
  try { localStorage.setItem(SELECTED_KEY, id); } catch {}
}

// The routine to show on Today: the selected one, or the first one.
export function pickSelected(routines: WarmupRoutine[]): WarmupRoutine | null {
  const id = getSelectedRoutineId();
  return routines.find((r) => r.id === id) ?? routines[0] ?? null;
}
